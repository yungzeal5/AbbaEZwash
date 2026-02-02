"""
Role-Based Permission Classes for Abba Backend

These permissions control API access based on user roles:
- CUSTOMER: Basic access (own orders, profile)
- RIDER: Pickup/delivery tasks
- AMBASSADOR: Referral tracking
- ADMIN: Order management, rider assignment
- SUPER_ADMIN: Full system access
"""
from rest_framework.permissions import BasePermission


class IsCustomer(BasePermission):
    """Allow access only to authenticated customers."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'CUSTOMER'


class IsRider(BasePermission):
    """Allow access only to authenticated riders."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'RIDER'


class IsAmbassador(BasePermission):
    """Allow access only to authenticated ambassadors."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'AMBASSADOR'


class IsAdmin(BasePermission):
    """Allow access to Admins and Super Admins."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['ADMIN', 'SUPER_ADMIN']


class IsSuperAdmin(BasePermission):
    """Allow access only to Super Admins."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'SUPER_ADMIN'


class IsAdminOrReadOnly(BasePermission):
    """
    Allow read access to all authenticated users.
    Write access only for Admins and Super Admins.
    """
    def has_permission(self, request, view):
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.role in ['ADMIN', 'SUPER_ADMIN']


class IsRiderOrAdmin(BasePermission):
    """Allow access to Riders, Admins, and Super Admins."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['RIDER', 'ADMIN', 'SUPER_ADMIN']


class IsOwnerOrAdmin(BasePermission):
    """
    Object-level permission: User can access their own data.
    Admins and Super Admins can access all.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.role in ['ADMIN', 'SUPER_ADMIN']:
            return True
        # Check if the object has a user_id or user field
        if hasattr(obj, 'user_id'):
            return str(obj.user_id) == str(request.user.id)
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return False
