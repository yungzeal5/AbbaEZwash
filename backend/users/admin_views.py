"""
Super Admin Views for System Monitoring and User Management

Super Admin has full system access:
- Manage all users (create, update, deactivate)
- View system-wide stats
- Handle complaints and reviews
- Full order visibility
"""
from datetime import datetime
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListAPIView, RetrieveUpdateDestroyAPIView
from django.contrib.auth import get_user_model
from bson import ObjectId
from bson.errors import InvalidId
from users.permissions import IsAdmin, IsSuperAdmin
from users.serializers import UserSerializer
from services.mongo_service import mongo_service

User = get_user_model()


class AllUsersListView(ListAPIView):
    """List all users in the system."""
    permission_classes = [IsAdmin]
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

    def destroy(self, request, *args, **kwargs):
        user_id = kwargs.get('id')
        print(f"[DEBUG] User deletion attempt - ID: {user_id}, Requested by: {request.user.username} ({request.user.role})")
        
        if request.user.role != 'SUPER_ADMIN':
            return Response(
                {'error': 'Only Super Admin can delete users'},
                status=status.HTTP_403_FORBIDDEN
            )
            
        try:
            instance = self.get_object()
            return super().destroy(request, *args, **kwargs)
        except Exception as e:
            print(f"[DEBUG] User deletion failed - ID: {user_id}, Error: {str(e)}")
            raise e


class CreateStaffUserView(APIView):
    """Create a new staff user (Rider, Ambassador, Admin)."""
    permission_classes = [IsAdmin]

    def post(self, request):
        data = request.data
        role = data.get('role')
        
        # Restriction: Only Super Admin can create other ADMINs or SUPER_ADMINs
        if role in ['ADMIN', 'SUPER_ADMIN'] and request.user.role != 'SUPER_ADMIN':
            return Response(
                {'error': 'Only Super Admin can create other administrators'},
                status=status.HTTP_403_FORBIDDEN
            )

        if role not in ['RIDER', 'AMBASSADOR', 'ADMIN', 'CUSTOMER', 'SUPER_ADMIN']:
            return Response(
                {'error': 'Invalid role. Must be RIDER, AMBASSADOR, ADMIN, CUSTOMER, or SUPER_ADMIN'},
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
    permission_classes = [IsAdmin]

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

        # Review & Complaint stats
        review_count = mongo_service.get_collection('reviews').count_documents({})
        complaint_count = mongo_service.get_collection('complaints').count_documents({})

        return Response({
            'users': user_stats,
            'orders': order_stats,
            'revenue': total_revenue,
            'reviews': review_count,
            'complaints': complaint_count
        })


class ComplaintsView(APIView):
    """View and manage customer complaints."""
    permission_classes = [IsAdmin]

    def get(self, request):
        collection = mongo_service.get_collection('complaints')
        complaints = list(collection.find().sort('created_at', -1).limit(50))
        
        for complaint in complaints:
            complaint['_id'] = str(complaint['_id'])
            if isinstance(complaint.get('created_at'), datetime):
                complaint['created_at'] = complaint['created_at'].isoformat()
            if isinstance(complaint.get('resolved_at'), datetime):
                complaint['resolved_at'] = complaint['resolved_at'].isoformat()
        
        return Response(complaints)

    def post(self, request):
        """Create a complaint resolution note."""
        collection = mongo_service.get_collection('complaints')
        complaint_id = request.data.get('complaint_id')
        resolution = request.data.get('resolution')
        if not complaint_id or not resolution:
            return Response(
                {'error': 'complaint_id and resolution are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        query = {'_id': complaint_id}
        if isinstance(complaint_id, str):
            try:
                query = {'_id': ObjectId(complaint_id)}
            except (InvalidId, TypeError):
                # Keep raw string fallback if documents were created with string _id values.
                query = {'_id': complaint_id}

        result = collection.update_one(
            query,
            {
                '$set': {
                    'status': 'RESOLVED',
                    'resolution': resolution,
                    'resolved_by': str(request.user.id),
                    'resolved_at': datetime.utcnow()
                }
            }
        )
        if result.matched_count == 0:
            return Response({'error': 'Complaint not found'}, status=status.HTTP_404_NOT_FOUND)

        return Response({
            'message': 'Complaint resolved successfully',
            'complaint_id': str(complaint_id),
            'status': 'RESOLVED'
        })

class AdminReviewListView(APIView):
    """View all customer reviews (Super Admin & Admin)."""
    permission_classes = [IsAdmin]

    def get(self, request):
        collection = mongo_service.get_collection('reviews')
        reviews = list(collection.find().sort('created_at', -1).limit(50))
        
        for review in reviews:
            review['_id'] = str(review['_id'])
            if isinstance(review.get('created_at'), datetime):
                review['created_at'] = review['created_at'].isoformat()
        
        return Response(reviews)


class AmbassadorAdminListView(APIView):
    """List all ambassadors with stats for Super Admin."""
    permission_classes = [IsAdmin]

    def get(self, request):
        ambassadors = User.objects.filter(role='AMBASSADOR').order_by('-created_at')
        
        # Get stats for each ambassador
        order_collection = mongo_service.get_collection('orders')
        commissions_collection = mongo_service.get_collection('commissions')
        
        ambassador_data = []
        for amb in ambassadors:
            # Referral count
            referral_count = User.objects.filter(referred_by=amb, role='CUSTOMER').count()
            
            # Total earnings from commissions collection
            earnings_result = list(commissions_collection.aggregate([
                {'$match': {'ambassador_id': str(amb.id)}},
                {'$group': {'_id': None, 'total_earned': {'$sum': '$commission_amount'}}}
            ]))
            total_earned = earnings_result[0]['total_earned'] if earnings_result else 0
            
            # Referral code
            ref_code = amb.ambassador_profile.referral_code if hasattr(amb, 'ambassador_profile') else None
            
            ambassador_data.append({
                'id': amb.id,
                'username': amb.username,
                'email': amb.email,
                'phone_number': amb.phone_number,
                'name': f"{amb.first_name} {amb.last_name}".strip() or amb.username,
                'referral_code': ref_code,
                'referral_count': referral_count,
                'total_earnings': float(total_earned),
                'date_joined': amb.created_at.isoformat(),
                'is_active': amb.is_active
            })
            
        return Response(ambassador_data)
