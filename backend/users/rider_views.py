"""
Rider Views for Pickup and Delivery Tracking

Riders can:
- View their history of pickups and deliveries
- View their current task
"""
from datetime import datetime
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from users.permissions import IsRider
from services.mongo_service import mongo_service

class RiderHistoryView(APIView):
    """View pickups and deliveries completed by this rider."""
    permission_classes = [IsRider]

    def get(self, request):
        user = request.user
        collection = mongo_service.get_collection('orders')
        
        # Find orders where this rider was assigned and the status indicates completion or current progress
        # For history, we might focus on PICKED_UP and DELIVERED
        query = {
            'assigned_rider_id': str(user.id),
            'status': {'$in': ['PICKED_UP', 'DELIVERED', 'READY', 'CLEANING', 'ACCEPTED']}
        }
        
        orders = list(collection.find(query).sort('updated_at', -1))
        
        for order in orders:
            order['_id'] = str(order['_id'])
            if isinstance(order.get('created_at'), datetime):
                order['created_at'] = order['created_at'].isoformat()
            if isinstance(order.get('updated_at'), datetime):
                order['updated_at'] = order['updated_at'].isoformat()
            
            # Ensure pickup_location is a string for frontend display
            if isinstance(order.get('pickup_location'), dict):
                order['pickup_location'] = order['pickup_location'].get('address', '')
                
        return Response(orders)

class RiderStatsView(APIView):
    """Get rider statistics (total pickups, total deliveries)."""
    permission_classes = [IsRider]

    def get(self, request):
        user = request.user
        collection = mongo_service.get_collection('orders')
        
        assigned_query = {'assigned_rider_id': str(user.id)}
        
        total_assigned = collection.count_documents(assigned_query)
        total_delivered = collection.count_documents({**assigned_query, 'status': 'DELIVERED'})
        total_picked_up = collection.count_documents({**assigned_query, 'status': {'$in': ['PICKED_UP', 'CLEANING', 'READY', 'DELIVERED']}})
        
        return Response({
            'total_assigned': total_assigned,
            'total_delivered': total_delivered,
            'total_picked_up': total_picked_up
        })
