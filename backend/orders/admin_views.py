"""
Admin Views for Order Management

Handles admin operations:
- View all orders
- Accept/reject orders
- Assign riders to orders
- Update order status (CLEANING, READY)
- Send notifications
"""
from datetime import datetime
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from django.contrib.auth import get_user_model
from users.permissions import IsAdmin, IsSuperAdmin
from services.mongo_service import mongo_service
from services.notification_service import notification_service

User = get_user_model()


class AdminOrderListView(APIView):
    """Get all orders for admin management."""
    permission_classes = [IsAdmin]

    def get(self, request):
        collection = mongo_service.get_collection('orders')
        
        # Filter by status if provided
        status_filter = request.query_params.get('status')
        query = {}
        if status_filter:
            query['status'] = status_filter
        
        orders = list(collection.find(query).sort('created_at', -1))

        # Get all unique user IDs to fetch profile pictures in one batch
        user_ids = list(set(order.get('user_id') for order in orders if order.get('user_id')))
        user_profiles = {str(u.id): u.profile_picture.url if u.profile_picture else None 
                         for u in User.objects.filter(id__in=user_ids)}

        for order in orders:
            order['_id'] = str(order['_id'])
            user_id = str(order.get('user_id'))
            order['customer_profile_picture'] = user_profiles.get(user_id)
            
            if isinstance(order.get('created_at'), datetime):
                order['created_at'] = order['created_at'].isoformat()
            if isinstance(order.get('updated_at'), datetime):
                order['updated_at'] = order['updated_at'].isoformat()

        return Response(orders)


class AcceptOrderView(APIView):
    """Admin accepts an order and optionally assigns a rider."""
    permission_classes = [IsAdmin]

    def post(self, request, order_id):
        collection = mongo_service.get_collection('orders')
        order = collection.find_one({'order_id': order_id})

        if not order:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        if order['status'] != 'PENDING':
            return Response({'error': f"Cannot accept order with status: {order['status']}"}, 
                          status=status.HTTP_400_BAD_REQUEST)

        rider_id = request.data.get('rider_id')
        update_time = datetime.utcnow()
        
        update_data = {
            'status': 'ACCEPTED',
            'accepted_by': str(request.user.id),
            'accepted_at': update_time,
            'updated_at': update_time,
        }
        
        if rider_id:
            # Verify rider exists
            try:
                rider = User.objects.get(id=rider_id, role='RIDER')
                update_data['assigned_rider_id'] = str(rider.id)
                update_data['assigned_rider_name'] = f"{rider.first_name} {rider.last_name}".strip() or rider.username
            except User.DoesNotExist:
                return Response({'error': 'Invalid rider ID'}, status=status.HTTP_400_BAD_REQUEST)

        collection.update_one(
            {'order_id': order_id},
            {
                '$set': update_data,
                '$push': {
                    'status_history': {
                        'status': 'ACCEPTED',
                        'timestamp': update_time,
                        'by': str(request.user.id),
                        'note': request.data.get('note', '')
                    }
                }
            }
        )

        # Notify customer (and rider if assigned)
        customer = User.objects.filter(id=order.get('user_id')).first()
        if customer:
            notification_service.notify_order_status(customer, order_id, 'ACCEPTED')
            if rider_id:
                try:
                    rider = User.objects.get(id=rider_id)
                    notification_service.notify_rider_assigned(customer, rider, order_id)
                except User.DoesNotExist:
                    pass

        return Response({
            'message': 'Order accepted',
            'order_id': order_id,
            'status': 'ACCEPTED',
            'assigned_rider_id': rider_id
        })


class AssignRiderView(APIView):
    """Assign a rider to an order."""
    permission_classes = [IsAdmin]

    def post(self, request, order_id):
        rider_id = request.data.get('rider_id')
        if not rider_id:
            return Response({'error': 'rider_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        collection = mongo_service.get_collection('orders')
        order = collection.find_one({'order_id': order_id})

        if not order:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        # Verify rider exists
        try:
            rider = User.objects.get(id=rider_id, role='RIDER')
        except User.DoesNotExist:
            return Response({'error': 'Invalid rider ID'}, status=status.HTTP_400_BAD_REQUEST)

        update_time = datetime.utcnow()
        collection.update_one(
            {'order_id': order_id},
            {
                '$set': {
                    'assigned_rider_id': str(rider.id),
                    'assigned_rider_name': f"{rider.first_name} {rider.last_name}".strip() or rider.username,
                    'updated_at': update_time,
                }
            }
        )

        # Notify customer and rider
        customer = User.objects.filter(id=order.get('user_id')).first()
        if customer:
            notification_service.notify_rider_assigned(customer, rider, order_id)

        return Response({
            'message': 'Rider assigned',
            'order_id': order_id,
            'rider_id': str(rider.id),
            'rider_name': rider.username
        })


class UpdateOrderStatusView(APIView):
    """Admin updates order status (CLEANING, READY, etc.)."""
    permission_classes = [IsAdmin]

    VALID_STATUSES = ['PENDING', 'ACCEPTED', 'PICKED_UP', 'CLEANING', 'READY', 'DELIVERED', 'CANCELLED']

    def post(self, request, order_id):
        new_status = request.data.get('status')
        if not new_status or new_status not in self.VALID_STATUSES:
            return Response({
                'error': f"Invalid status. Valid options: {self.VALID_STATUSES}"
            }, status=status.HTTP_400_BAD_REQUEST)

        collection = mongo_service.get_collection('orders')
        order = collection.find_one({'order_id': order_id})

        if not order:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        update_time = datetime.utcnow()
        collection.update_one(
            {'order_id': order_id},
            {
                '$set': {
                    'status': new_status,
                    'updated_at': update_time,
                },
                '$push': {
                    'status_history': {
                        'status': new_status,
                        'timestamp': update_time,
                        'by': str(request.user.id),
                        'note': request.data.get('note', '')
                    }
                }
            }
        )

        # Handle Commission if DELIVERED
        if new_status == 'DELIVERED':
            customer_id = order.get('user_id')
            if customer_id:
                try:
                    customer = User.objects.get(id=customer_id)
                    if customer.referred_by and customer.referred_by.role == 'AMBASSADOR':
                        ambassador = customer.referred_by
                        commission_amount = float(order.get('total_price', 0)) * 0.05
                        
                        if commission_amount > 0:
                            commissions_collection = mongo_service.get_collection('commissions')
                            commissions_collection.insert_one({
                                'ambassador_id': str(ambassador.id),
                                'ambassador_name': ambassador.username,
                                'customer_id': str(customer.id),
                                'customer_name': customer.username,
                                'order_id': order_id,
                                'order_amount': order.get('total_price', 0),
                                'commission_amount': commission_amount,
                                'created_at': datetime.utcnow()
                            })
                            print(f"💰 Commission of {commission_amount} credited to ambassador {ambassador.username}")
                except User.DoesNotExist:
                    pass

        # Notify customer of status update
        customer = User.objects.filter(id=order.get('user_id')).first()
        if customer:
            notification_service.notify_order_status(customer, order_id, new_status)

        return Response({
            'message': f'Order status updated to {new_status}',
            'order_id': order_id,
            'status': new_status
        })


class AvailableRidersView(APIView):
    """Get list of available riders for assignment."""
    permission_classes = [IsAdmin]

    def get(self, request):
        riders = User.objects.filter(role='RIDER').values(
            'id', 'username', 'first_name', 'last_name', 
            'phone_number', 'location', 'is_active'
        )
        return Response(list(riders))


class AdminStatsView(APIView):
    """Dashboard stats for admin."""
    permission_classes = [IsAdmin]

    def get(self, request):
        collection = mongo_service.get_collection('orders')
        
        # Calculate total revenue
        pipeline = [
            {
                "$group": {
                    "_id": None,
                    "total_revenue": {"$sum": "$total_price"}
                }
            }
        ]
        revenue_result = list(collection.aggregate(pipeline))
        total_revenue = revenue_result[0]['total_revenue'] if revenue_result else 0
        
        stats = {
            'total_orders': collection.count_documents({}),
            'pending': collection.count_documents({'status': 'PENDING'}),
            'in_progress': collection.count_documents({'status': {'$in': ['ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'CLEANING', 'READY']}}),
            'delivered': collection.count_documents({'status': 'DELIVERED'}),
            'total_revenue': total_revenue,
            'total_riders': User.objects.filter(role='RIDER').count(),
            'total_customers': User.objects.filter(role='CUSTOMER').count(),
            'total_ambassadors': User.objects.filter(role='AMBASSADOR').count(),
            'reviews': mongo_service.get_collection('reviews').count_documents({}),
            'complaints': mongo_service.get_collection('complaints').count_documents({}),
        }
        
        return Response(stats)

class AdminCatalogManageView(APIView):
    """Manage catalog items (Super Admin only)."""
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        """Get full catalog for management."""
        collection = mongo_service.get_collection('catalog')
        items = list(collection.find().sort('category', 1))
        for item in items:
            item['_id'] = str(item['_id'])
        return Response(items)

    def post(self, request):
        """Add new item to catalog."""
        data = request.data
        if not data.get('name') or not data.get('price') or not data.get('category'):
            return Response({'error': 'Name, price and category are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        collection = mongo_service.get_collection('catalog')
        
        # Check if already exists
        if collection.find_one({'name': data['name']}):
             return Response({'error': 'Item with this name already exists'}, status=status.HTTP_400_BAD_REQUEST)

        item = {
            'name': data['name'],
            'price': float(data['price']),
            'category': data['category'],
            'variant': data.get('variant'),
            'is_active': data.get('is_active', True),
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        result = collection.insert_one(item)
        item['_id'] = str(result.inserted_id)
        return Response(item, status=status.HTTP_201_CREATED)

class AdminCatalogUpdateView(APIView):
    """Update or Delete catalog items."""
    permission_classes = [IsSuperAdmin]

    def put(self, request, item_name):
        """Update item by name."""
        data = request.data
        collection = mongo_service.get_collection('catalog')
        
        update_data = {}
        if 'price' in data: update_data['price'] = float(data['price'])
        if 'category' in data: update_data['category'] = data['category']
        if 'variant' in data: update_data['variant'] = data['variant']
        if 'is_active' in data: update_data['is_active'] = data['is_active']
        update_data['updated_at'] = datetime.utcnow()

        result = collection.update_one({'name': item_name}, {'$set': update_data})
        if result.matched_count == 0:
            return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)
            
        return Response({'message': f'Item {item_name} updated successfully'})

    def delete(self, request, item_name):
        """Delete item by name."""
        collection = mongo_service.get_collection('catalog')
        result = collection.delete_one({'name': item_name})
        if result.deleted_count == 0:
            return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)
            
        return Response({'message': f'Item {item_name} deleted successfully'})
