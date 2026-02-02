from django.urls import path
from .views import OrderListCreateView, OrderDetailView
from .admin_views import (
    AdminOrderListView,
    AcceptOrderView,
    AssignRiderView,
    UpdateOrderStatusView,
    AvailableRidersView,
    AdminStatsView,
)

urlpatterns = [
    # Customer endpoints
    path('', OrderListCreateView.as_view(), name='order_list_create'),
    path('<str:order_id>/', OrderDetailView.as_view(), name='order_detail'),
    
    # Admin endpoints  
    path('admin/all/', AdminOrderListView.as_view(), name='admin_order_list'),
    path('admin/accept/<str:order_id>/', AcceptOrderView.as_view(), name='admin_accept_order'),
    path('admin/assign/<str:order_id>/', AssignRiderView.as_view(), name='admin_assign_rider'),
    path('admin/status/<str:order_id>/', UpdateOrderStatusView.as_view(), name='admin_update_status'),
    path('admin/riders/', AvailableRidersView.as_view(), name='admin_available_riders'),
    path('admin/stats/', AdminStatsView.as_view(), name='admin_stats'),
]
