"""
Ambassador Views for Referral and Commission Tracking

Ambassadors can:
- View their referral code
- Track referred customers
- View commission earnings
"""
from datetime import datetime
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from users.permissions import IsAmbassador
from services.mongo_service import mongo_service

User = get_user_model()


class AmbassadorProfileView(APIView):
    """Get ambassador profile with referral stats."""
    permission_classes = [IsAmbassador]

    def get(self, request):
        user = request.user
        
        # Get referral count (customers who used this ambassador's code)
        referred_count = User.objects.filter(
            referred_by=str(user.id),
            role='CUSTOMER'
        ).count() if hasattr(User, 'referred_by') else 0

        # Get orders from referred customers
        collection = mongo_service.get_collection('orders')
        pipeline = [
            {'$match': {'referred_by_ambassador': str(user.id), 'status': 'DELIVERED'}},
            {'$group': {'_id': None, 'total': {'$sum': '$total_price'}, 'count': {'$sum': 1}}}
        ]
        result = list(collection.aggregate(pipeline))
        
        order_stats = result[0] if result else {'total': 0, 'count': 0}

        return Response({
            'ambassador_id': user.id,
            'username': user.username,
            'referral_code': f"ABBA-{user.username.upper()[:4]}{user.id}",
            'referred_customers': referred_count,
            'total_orders_from_referrals': order_stats.get('count', 0),
            'total_revenue_from_referrals': order_stats.get('total', 0),
            'commission_rate': 0.05,  # 5% commission
            'estimated_commission': order_stats.get('total', 0) * 0.05
        })


class ReferralHistoryView(APIView):
    """View customers referred by this ambassador."""
    permission_classes = [IsAmbassador]

    def get(self, request):
        # This would require a referred_by field on User model
        # For now, return mock structure
        return Response({
            'referrals': [],
            'message': 'No referral tracking field yet. Add referred_by to User model.'
        })


class CommissionHistoryView(APIView):
    """View commission earnings history."""
    permission_classes = [IsAmbassador]

    def get(self, request):
        collection = mongo_service.get_collection('commissions')
        commissions = list(collection.find({
            'ambassador_id': str(request.user.id)
        }).sort('created_at', -1))

        for c in commissions:
            c['_id'] = str(c['_id'])

        return Response(commissions)
