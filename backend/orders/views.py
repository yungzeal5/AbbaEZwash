import uuid
from datetime import datetime
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from services.mongo_service import mongo_service
from services.notification_service import notification_service

class OrderListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user_id = str(request.user.id)
        collection = mongo_service.get_collection('orders')
        
        # Always return only the current user's orders at this endpoint
        # Admins have a separate endpoint at /api/orders/admin/all/
        orders = list(collection.find({'user_id': user_id}).sort('created_at', -1))

        # Convert ObjectId and datetime for JSON response
        for order in orders:
            order['_id'] = str(order['_id'])
            if isinstance(order.get('created_at'), datetime):
                order['created_at'] = order['created_at'].isoformat()
        
        return Response(orders)

    def post(self, request):
        data = request.data
        user = request.user
        
        # Prepare order document
        order_doc = {
            'order_id': f"ORD-{uuid.uuid4().hex[:6].upper()}",
            'user_id': str(user.id),
            'customer_name': f"{user.first_name} {user.last_name}".strip() or user.username,
            'items': data.get('items', []),
            'total_price': data.get('total_price', 0),
            'status': 'PENDING',
            'pickup_location': data.get('location', user.location),
            'phone_number': data.get('phone_number', user.phone_number),
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        collection = mongo_service.get_collection('orders')
        result = collection.insert_one(order_doc)
        order_doc['_id'] = str(result.inserted_id)
        order_doc['created_at'] = order_doc['created_at'].isoformat()
        order_doc['updated_at'] = order_doc['updated_at'].isoformat()

        # Send Notifications
        notification_service.notify(
            user, 
            f"Your Abba order {order_doc['order_id']} has been placed successfully!",
            channels=['email', 'sms']
        )
        
        return Response(order_doc, status=status.HTTP_201_CREATED)

class OrderDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, order_id):
        collection = mongo_service.get_collection('orders')
        order = collection.find_one({'order_id': order_id})
        
        if not order:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check permissions
        if request.user.role not in ['ADMIN', 'SUPER_ADMIN'] and order['user_id'] != str(request.user.id):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            
        order['_id'] = str(order['_id'])
        if isinstance(order.get('created_at'), datetime):
            order['created_at'] = order['created_at'].isoformat()
        if isinstance(order.get('updated_at'), datetime):
            order['updated_at'] = order['updated_at'].isoformat()
            
        return Response(order)
            

class ReviewCreateView(APIView):
    """Allow customers to leave a review for an order."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        data = request.data
        user = request.user
        order_id = data.get('order_id')
        rating = data.get('rating')
        comment = data.get('comment', '')

        if not order_id or not rating:
            return Response(
                {'error': 'order_id and rating (1-5) are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            rating = int(rating)
            if not (1 <= rating <= 5):
                raise ValueError()
        except ValueError:
            return Response({'error': 'Rating must be an integer between 1 and 5'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if order exists and belongs to user
        collection = mongo_service.get_collection('orders')
        order = collection.find_one({'order_id': order_id, 'user_id': str(user.id)})
        
        if not order:
            return Response({'error': 'Order not found or not owned by you'}, status=status.HTTP_404_NOT_FOUND)

        if order['status'] != 'DELIVERED':
             return Response({'error': 'Can only review delivered orders'}, status=status.HTTP_400_BAD_REQUEST)

        # Create review
        reviews_collection = mongo_service.get_collection('reviews')
        
        # Check if already reviewed
        if reviews_collection.find_one({'order_id': order_id}):
            return Response({'error': 'Order already reviewed'}, status=status.HTTP_400_BAD_REQUEST)

        review_doc = {
            'user_id': str(user.id),
            'username': user.username,
            'order_id': order_id,
            'rating': rating,
            'comment': comment,
            'created_at': datetime.utcnow()
        }
        
        reviews_collection.insert_one(review_doc)
        
        # Update order to mark it as reviewed
        collection.update_one({'order_id': order_id}, {'$set': {'is_reviewed': True}})

        return Response({'message': 'Review submitted successfully!'}, status=status.HTTP_201_CREATED)

class PublicReviewListView(APIView):
    """Fetch all reviews for the homepage (Public)."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        reviews_collection = mongo_service.get_collection('reviews')
        # Get latest 10 reviews with 4+ stars
        reviews = list(reviews_collection.find({'rating': {'$gte': 4}}).sort('created_at', -1).limit(10))

        for review in reviews:
            review['_id'] = str(review['_id'])
            if isinstance(review.get('created_at'), datetime):
                review['created_at'] = review['created_at'].isoformat()
        
        return Response(reviews)
