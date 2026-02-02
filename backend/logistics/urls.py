from django.urls import path
from .views import (
    RiderOrdersView,
    RiderOrderDetailView,
    PickupOrderView,
    DeliverOrderView,
    RiderLocationUpdateView,
    RiderStatusToggleView,
    AdminRiderListView,
    AdminAssignTaskView,
    RiderAcceptTaskView,
    AdminRiderRegistrationView,
)

urlpatterns = [
    # Rider APIs
    path('rider/status-toggle/', RiderStatusToggleView.as_view(), name='rider-status-toggle'),
    path('rider/orders/', RiderOrdersView.as_view(), name='rider-orders'),
    path('rider/orders/<str:order_id>/', RiderOrderDetailView.as_view(), name='rider-order-detail'),
    path('rider/accept/<str:order_id>/', RiderAcceptTaskView.as_view(), name='rider-accept'),
    path('rider/pickup/<str:order_id>/', PickupOrderView.as_view(), name='rider-pickup'),
    path('rider/deliver/<str:order_id>/', DeliverOrderView.as_view(), name='rider-deliver'),
    path('rider/location/', RiderLocationUpdateView.as_view(), name='rider-location'),

    # Admin Logistics APIs
    path('admin/riders/', AdminRiderListView.as_view(), name='admin-riders-list'),
    path('admin/riders/register/', AdminRiderRegistrationView.as_view(), name='admin-rider-register'),
    path('admin/assign/<str:order_id>/', AdminAssignTaskView.as_view(), name='admin-assign-task'),
]
