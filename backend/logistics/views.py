"""
Logistics Views for Rider Operations

Handles pickup/delivery workflow:
- Riders view their assigned orders
- Update order status (PICKED_UP, DELIVERED)
- Location tracking
"""
from datetime import datetime
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from users.permissions import IsRider, IsRiderOrAdmin
from services.mongo_service import mongo_service
from services.notification_service import notification_service
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated, IsAdminUser

User = get_user_model()


class RiderOrdersView(APIView):
    """Get orders assigned to the current rider."""
    permission_classes = [IsRider]

    def get(self, request):
        rider_id = str(request.user.id)
        collection = mongo_service.get_collection('orders')
        
        # Get orders assigned to this rider
        orders = list(collection.find({
            'assigned_rider_id': rider_id,
            'status': {'$in': ['ACCEPTED', 'PICKED_UP', 'READY']}
        }).sort('created_at', -1))

        for order in orders:
            order['_id'] = str(order['_id'])
            if isinstance(order.get('created_at'), datetime):
                order['created_at'] = order['created_at'].isoformat()
            if isinstance(order.get('updated_at'), datetime):
                order['updated_at'] = order['updated_at'].isoformat()

        return Response(orders)


class RiderOrderDetailView(APIView):
    """Get details of a specific order assigned to rider."""
    permission_classes = [IsRiderOrAdmin]

    def get(self, request, order_id):
        collection = mongo_service.get_collection('orders')
        order = collection.find_one({'order_id': order_id})

        if not order:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        # Riders can only see their assigned orders
        if request.user.role == 'RIDER' and order.get('assigned_rider_id') != str(request.user.id):
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

        order['_id'] = str(order['_id'])
        if isinstance(order.get('created_at'), datetime):
            order['created_at'] = order['created_at'].isoformat()

        return Response(order)


class PickupOrderView(APIView):
    """Rider marks order as picked up."""
    permission_classes = [IsRider]

    def post(self, request, order_id):
        collection = mongo_service.get_collection('orders')
        order = collection.find_one({'order_id': order_id})

        if not order:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        if order.get('assigned_rider_id') != str(request.user.id):
            return Response({'error': 'Not your assigned order'}, status=status.HTTP_403_FORBIDDEN)

        if order['status'] != 'ACCEPTED':
            return Response({'error': f"Cannot pickup order with status: {order['status']}"}, 
                          status=status.HTTP_400_BAD_REQUEST)

        # Update order status
        pickup_time = datetime.utcnow()
        collection.update_one(
            {'order_id': order_id},
            {
                '$set': {
                    'status': 'PICKED_UP',
                    'picked_up_at': pickup_time,
                    'updated_at': pickup_time,
                },
                '$push': {
                    'status_history': {
                        'status': 'PICKED_UP',
                        'timestamp': pickup_time,
                        'by': str(request.user.id),
                        'note': request.data.get('note', '')
                    }
                }
            }
        )

        # Notify customer
        # notification_service.notify(customer, "Your laundry has been picked up!", channels=['sms'])

        return Response({
            'message': 'Order picked up successfully',
            'order_id': order_id,
            'status': 'PICKED_UP',
            'picked_up_at': pickup_time.isoformat()
        })


class DeliverOrderView(APIView):
    """Rider marks order as delivered."""
    permission_classes = [IsRider]

    def post(self, request, order_id):
        collection = mongo_service.get_collection('orders')
        order = collection.find_one({'order_id': order_id})

        if not order:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        if order.get('assigned_rider_id') != str(request.user.id):
            return Response({'error': 'Not your assigned order'}, status=status.HTTP_403_FORBIDDEN)

        if order['status'] != 'READY':
            return Response({'error': f"Cannot deliver order with status: {order['status']}"}, 
                          status=status.HTTP_400_BAD_REQUEST)

        # Update order status
        delivery_time = datetime.utcnow()
        collection.update_one(
            {'order_id': order_id},
            {
                '$set': {
                    'status': 'DELIVERED',
                    'delivered_at': delivery_time,
                    'updated_at': delivery_time,
                },
                '$push': {
                    'status_history': {
                        'status': 'DELIVERED',
                        'timestamp': delivery_time,
                        'by': str(request.user.id),
                        'note': request.data.get('note', '')
                    }
                }
            }
        )

        # Notify customer
        # notification_service.notify(customer, "Your laundry has been delivered!", channels=['sms', 'email'])

        return Response({
            'message': 'Order delivered successfully',
            'order_id': order_id,
            'status': 'DELIVERED',
            'delivered_at': delivery_time.isoformat()
        })


class RiderStatusToggleView(APIView):
    """Toggle rider's online/offline status."""
    permission_classes = [IsRider]

    def post(self, request):
        profile = request.user.rider_profile
        is_online = request.data.get('is_online', not profile.is_online)
        profile.is_online = is_online
        profile.save(update_fields=['is_online'])
        
        # Keep User model in sync for now to avoid breaking other views
        request.user.is_online = is_online
        request.user.save(update_fields=['is_online'])
        
        return Response({
            'message': f"Rider is now {'online' if is_online else 'offline'}",
            'is_online': is_online
        })


class AdminRiderListView(APIView):
    """List all riders and their status for admin."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        riders = User.objects.filter(role='RIDER').prefetch_related('rider_profile')
        
        collection = mongo_service.get_collection('orders')
        riders_list = []
        for rider in riders:
            # Safely get profile status
            is_online = rider.rider_profile.is_online if hasattr(rider, 'rider_profile') else rider.is_online
            
            rider_data = {
                'id': rider.id,
                'username': rider.username,
                'email': rider.email,
                'is_online': is_online,
                'custom_id': rider.custom_id,
            }
            
            rider_data['active_tasks'] = collection.count_documents({
                'assigned_rider_id': str(rider.id),
                'status': {'$in': ['ACCEPTED', 'PICKED_UP', 'READY']}
            })
            riders_list.append(rider_data)
            
        return Response(riders_list)


class AdminAssignTaskView(APIView):
    """Assign an order to a rider."""
    permission_classes = [IsAdminUser]

    def post(self, request, order_id):
        rider_id = request.data.get('rider_id')
        if not rider_id:
            return Response({'error': 'Rider ID required'}, status=status.HTTP_400_BAD_REQUEST)
            
        rider = User.objects.filter(id=rider_id, role='RIDER').first()
        if not rider:
            return Response({'error': 'Valid rider required'}, status=status.HTTP_404_NOT_FOUND)
            
        collection = mongo_service.get_collection('orders')
        order = collection.find_one({'order_id': order_id})
        
        if not order:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
            
        update_time = datetime.utcnow()
        collection.update_one(
            {'order_id': order_id},
            {
                '$set': {
                    'assigned_rider_id': str(rider_id),
                    'assigned_rider_name': rider.username,
                    'status': 'ASSIGNED', # Initial state for rider
                    'updated_at': update_time
                },
                '$push': {
                    'status_history': {
                        'status': 'ASSIGNED',
                        'timestamp': update_time,
                        'by': str(request.user.id),
                        'note': f"Assigned to {rider.username}"
                    }
                }
            }
        )
        
        return Response({'message': f'Order assigned to {rider.username}'})

class RiderAcceptTaskView(APIView):
    """Rider accepts an assigned task."""
    permission_classes = [IsRider]

    def post(self, request, order_id):
        collection = mongo_service.get_collection('orders')
        order = collection.find_one({'order_id': order_id, 'assigned_rider_id': str(request.user.id)})
        
        if not order:
            return Response({'error': 'Order not found or not assigned to you'}, status=status.HTTP_404_NOT_FOUND)
            
        if order['status'] != 'ASSIGNED':
            return Response({'error': 'Task already accepted or in progress'}, status=status.HTTP_400_BAD_REQUEST)
            
        update_time = datetime.utcnow()
        collection.update_one(
            {'order_id': order_id},
            {
                '$set': {
                    'status': 'ACCEPTED',
                    'updated_at': update_time
                },
                '$push': {
                    'status_history': {
                        'status': 'ACCEPTED',
                        'timestamp': update_time,
                        'by': str(request.user.id)
                    }
                }
            }
        )
        
        return Response({'message': 'Task accepted', 'status': 'ACCEPTED'})


from users.serializers import RegisterSerializer

class AdminRiderRegistrationView(APIView):
    """Admin registers a new rider."""
    permission_classes = [IsAdminUser]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            # Force role to RIDER regardless of input
            user = serializer.save(role='RIDER')
            
            return Response({
                'message': 'Rider registered successfully',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'custom_id': user.custom_id,
                    'role': user.role
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RiderLocationUpdateView(APIView):
    """Update rider's current location."""
    permission_classes = [IsRider]

    def post(self, request):
        location = request.data.get('location')
        if not location:
            return Response({'error': 'Location required'}, status=status.HTTP_400_BAD_REQUEST)
            
        profile = request.user.rider_profile
        profile.current_location = location
        profile.save(update_fields=['current_location'])
        
        # Sync to User for now
        request.user.location = location
        request.user.save(update_fields=['location'])

        return Response({
            'message': 'Location updated',
            'location': location
        })
