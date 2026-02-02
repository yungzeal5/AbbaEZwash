from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import MyTokenObtainPairView, RegisterView, UserProfileView
from .admin_views import (
    AllUsersListView,
    UserManagementView,
    CreateStaffUserView,
    SystemStatsView,
    ComplaintsView,
)
from .ambassador_views import (
    AmbassadorProfileView,
    ReferralHistoryView,
    CommissionHistoryView,
)

urlpatterns = [
    # Auth endpoints
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    
    # Super Admin endpoints
    path('superadmin/users/', AllUsersListView.as_view(), name='superadmin_users_list'),
    path('superadmin/users/<int:id>/', UserManagementView.as_view(), name='superadmin_user_manage'),
    path('superadmin/create-staff/', CreateStaffUserView.as_view(), name='superadmin_create_staff'),
    path('superadmin/stats/', SystemStatsView.as_view(), name='superadmin_stats'),
    path('superadmin/complaints/', ComplaintsView.as_view(), name='superadmin_complaints'),
    
    # Ambassador endpoints
    path('ambassador/profile/', AmbassadorProfileView.as_view(), name='ambassador_profile'),
    path('ambassador/referrals/', ReferralHistoryView.as_view(), name='ambassador_referrals'),
    path('ambassador/commissions/', CommissionHistoryView.as_view(), name='ambassador_commissions'),
]
