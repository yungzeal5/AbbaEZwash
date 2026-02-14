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
        
        # Get referral code
        referral_code = user.ambassador_profile.referral_code if hasattr(user, 'ambassador_profile') else "N/A"
        
        # Get referral count
        referred_count = User.objects.filter(referred_by=user, role='CUSTOMER').count()

        # Get orders from referred customers via MongoDB
        referred_customer_ids = list(User.objects.filter(referred_by=user).values_list('id', flat=True))
        referred_customer_ids = [str(uid) for uid in referred_customer_ids]

        orders_collection = mongo_service.get_collection('orders')
        order_stats = list(orders_collection.aggregate([
            {'$match': {'user_id': {'$in': referred_customer_ids}, 'status': 'DELIVERED'}},
            {'$group': {
                '_id': None, 
                'count': {'$sum': 1},
                'total_revenue': {'$sum': '$total_price'}
            }}
        ]))
        
        stats = order_stats[0] if order_stats else {'count': 0, 'total_revenue': 0}

        # Get actual earnings from commissions collection
        commissions_collection = mongo_service.get_collection('commissions')
        earnings_result = list(commissions_collection.aggregate([
            {'$match': {'ambassador_id': str(user.id)}},
            {'$group': {'_id': None, 'total_earned': {'$sum': '$commission_amount'}}}
        ]))
        
        total_earned = earnings_result[0]['total_earned'] if earnings_result else 0

        return Response({
            'ambassador_id': user.id,
            'custom_id': user.custom_id,
            'username': user.username,
            'referral_code': referral_code,
            'referred_customers': referred_count,
            'total_orders_from_referrals': stats['count'],
            'total_revenue_from_referrals': stats['total_revenue'],
            'commission_rate': 0.05,
            'total_earnings': float(total_earned)
        })


class ReferralHistoryView(APIView):
    """View customers referred by this ambassador."""
    permission_classes = [IsAmbassador]

    def get(self, request):
        user = request.user
        referrals = User.objects.filter(referred_by=user, role='CUSTOMER').order_by('-created_at')
        
        # Get order stats for each referral from MongoDB
        collection = mongo_service.get_collection('orders')
        
        referral_data = []
        for ref in referrals:
            # Get total spent by this customer
            pipeline = [
                {'$match': {'user_id': str(ref.id), 'status': 'DELIVERED'}},
                {'$group': {'_id': None, 'total': {'$sum': '$total_price'}}}
            ]
            res = list(collection.aggregate(pipeline))
            total_spent = res[0]['total'] if res else 0
            
            referral_data.append({
                'id': ref.id,
                'username': ref.username,
                'name': f"{ref.first_name} {ref.last_name}".strip() or ref.username,
                'date_joined': ref.created_at.isoformat(),
                'total_spent': total_spent,
                'commission_earned': float(total_spent) * 0.05
            })

        return Response({
            'referrals': referral_data
        })


class CommissionHistoryView(APIView):
    """View commission earnings history."""
    permission_classes = [IsAmbassador]

    def get(self, request):
        # Commissions are stored in MongoDB when an order is DELIVERED
        collection = mongo_service.get_collection('commissions')
        commissions = list(collection.find({
            'ambassador_id': str(request.user.id)
        }).sort('created_at', -1))

        for c in commissions:
            c['_id'] = str(c['_id'])
            if isinstance(c.get('created_at'), datetime):
                c['created_at'] = c['created_at'].isoformat()

        return Response(commissions)
