"""
Super Admin Views for System Monitoring and User Management

Super Admin has full system access:
- Manage all users (create, update, deactivate)
- View system-wide stats
- Handle complaints and reviews
- Full order visibility
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListAPIView, RetrieveUpdateDestroyAPIView
from django.contrib.auth import get_user_model
from users.permissions import IsAdmin, IsSuperAdmin
from users.serializers import UserSerializer
from services.mongo_service import mongo_service

User = get_user_model()


class AllUsersListView(ListAPIView):
    """List all users in the system."""
    permission_classes = [IsSuperAdmin]
    serializer_class = UserSerializer

    def get_queryset(self):
        role = self.request.query_params.get('role')
        queryset = User.objects.all().order_by('-created_at')
        if role:
            queryset = queryset.filter(role=role)
        return queryset


class UserManagementView(RetrieveUpdateDestroyAPIView):
    """View, update, or deactivate a user."""
    permission_classes = [IsAdmin]
    serializer_class = UserSerializer
    queryset = User.objects.all()
    lookup_field = 'id'


class CreateStaffUserView(APIView):
    """Create a new staff user (Rider, Ambassador, Admin)."""
    permission_classes = [IsSuperAdmin]

    def post(self, request):
        data = request.data
        role = data.get('role')
        
        if role not in ['RIDER', 'AMBASSADOR', 'ADMIN']:
            return Response(
                {'error': 'Invalid role. Must be RIDER, AMBASSADOR, or ADMIN'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.create_user(
                username=data['username'],
                email=data['email'],
                password=data['password'],
                role=role,
                phone_number=data.get('phone_number'),
                first_name=data.get('first_name', ''),
                last_name=data.get('last_name', ''),
            )
            return Response({
                'message': f'{role} created successfully',
                'user_id': user.id,
                'username': user.username
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class SystemStatsView(APIView):
    """Complete system statistics for Super Admin dashboard."""
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        collection = mongo_service.get_collection('orders')
        
        # User stats by role
        user_stats = {}
        for role in ['CUSTOMER', 'RIDER', 'AMBASSADOR', 'ADMIN', 'SUPER_ADMIN']:
            user_stats[role.lower()] = User.objects.filter(role=role).count()

        # Order stats
        order_stats = {
            'total': collection.count_documents({}),
            'pending': collection.count_documents({'status': 'PENDING'}),
            'accepted': collection.count_documents({'status': 'ACCEPTED'}),
            'picked_up': collection.count_documents({'status': 'PICKED_UP'}),
            'cleaning': collection.count_documents({'status': 'CLEANING'}),
            'ready': collection.count_documents({'status': 'READY'}),
            'delivered': collection.count_documents({'status': 'DELIVERED'}),
            'cancelled': collection.count_documents({'status': 'CANCELLED'}),
        }

        # Revenue (simple sum of total_price for delivered orders)
        pipeline = [
            {'$match': {'status': 'DELIVERED'}},
            {'$group': {'_id': None, 'total_revenue': {'$sum': '$total_price'}}}
        ]
        revenue_result = list(collection.aggregate(pipeline))
        total_revenue = revenue_result[0]['total_revenue'] if revenue_result else 0

        return Response({
            'users': user_stats,
            'orders': order_stats,
            'revenue': total_revenue
        })


class ComplaintsView(APIView):
    """View and manage customer complaints."""
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        collection = mongo_service.get_collection('complaints')
        complaints = list(collection.find().sort('created_at', -1).limit(50))
        
        for complaint in complaints:
            complaint['_id'] = str(complaint['_id'])
        
        return Response(complaints)

    def post(self, request):
        """Create a complaint resolution note."""
        collection = mongo_service.get_collection('complaints')
        complaint_id = request.data.get('complaint_id')
        resolution = request.data.get('resolution')
        
        from datetime import datetime
        collection.update_one(
            {'_id': complaint_id},
            {
                '$set': {
                    'status': 'RESOLVED',
                    'resolution': resolution,
                    'resolved_by': str(request.user.id),
                    'resolved_at': datetime.utcnow()
                }
            }
        )
        
        return Response({'message': 'Complaint resolved'})
