from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import MyTokenObtainPairView, RegisterView, UserProfileView, ComplaintCreateView
from .admin_views import (
    AllUsersListView,
    UserManagementView,
    CreateStaffUserView,
    SystemStatsView,
    ComplaintsView,
    AdminReviewListView,
    AmbassadorAdminListView,
)
from .ambassador_views import (
    AmbassadorProfileView,
    ReferralHistoryView,
    CommissionHistoryView,
)
from .rider_views import (
    RiderHistoryView,
    RiderStatsView,
)

urlpatterns = [
    # Auth endpoints
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('complaint/', ComplaintCreateView.as_view(), name='customer_complaint'),
    
    # Super Admin endpoints
    path('superadmin/users/', AllUsersListView.as_view(), name='superadmin_users_list'),
    path('superadmin/users/<int:id>/', UserManagementView.as_view(), name='superadmin_user_manage'),
    path('superadmin/create-staff/', CreateStaffUserView.as_view(), name='superadmin_create_staff'),
    path('superadmin/stats/', SystemStatsView.as_view(), name='superadmin_stats'),
    path('superadmin/complaints/', ComplaintsView.as_view(), name='superadmin_complaints'),
    path('superadmin/reviews/', AdminReviewListView.as_view(), name='superadmin_reviews'),
    
    # New Ambassador Admin endpoint
    path('superadmin/ambassadors/', AmbassadorAdminListView.as_view(), name='superadmin_ambassadors'),
    
    # Ambassador endpoints
    path('ambassador/profile/', AmbassadorProfileView.as_view(), name='ambassador_profile'),
    path('ambassador/referrals/', ReferralHistoryView.as_view(), name='ambassador_referrals'),
    path('ambassador/commissions/', CommissionHistoryView.as_view(), name='ambassador_commissions'),

    # Rider endpoints
    path('rider/history/', RiderHistoryView.as_view(), name='rider_history'),
    path('rider/stats/', RiderStatsView.as_view(), name='rider_stats'),
]
