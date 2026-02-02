from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        CUSTOMER = 'CUSTOMER', 'Customer'
        RIDER = 'RIDER', 'Rider'
        AMBASSADOR = 'AMBASSADOR', 'Ambassador'
        ADMIN = 'ADMIN', 'Admin'
        SUPER_ADMIN = 'SUPER_ADMIN', 'Super Admin'

    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)
    phone_number = models.CharField(max_length=15, unique=True, null=True, blank=True)
    location = models.JSONField(default=dict, null=True, blank=True)
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.CUSTOMER
    )
    is_email_verified = models.BooleanField(default=False)
    is_online = models.BooleanField(default=False)
    custom_id = models.CharField(max_length=20, unique=True, null=True, blank=True)
    streak_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    REQUIRED_FIELDS = ['email']

    def save(self, *args, **kwargs):
        if not self.custom_id:
            self.custom_id = self.generate_custom_id()
        super().save(*args, **kwargs)

    def generate_custom_id(self):
        prefix_map = {
            self.Role.CUSTOMER: 'CS',
            self.Role.RIDER: 'RD',
            self.Role.ADMIN: 'AD',
            self.Role.AMBASSADOR: 'DB',
            self.Role.SUPER_ADMIN: 'SD'
        }
        prefix = prefix_map.get(self.role, 'US') # Fallback if unknown
        import uuid
        # Generating a unique 8 digit number. 
        # Using uuid to ensure uniqueness and taking first 8 digits of int representation
        # Ideally, we would use a sequence or check for collision, 
        # but for this scale, uuid segment is sufficient.
        unique_suffix = str(uuid.uuid4().int)[:8]
        return f"{prefix}{unique_suffix}"

    def __str__(self):
        return f"{self.username} ({self.role})"


class CustomerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='customer_profile')
    loyalty_points = models.IntegerField(default=0)
    preferences = models.JSONField(default=dict, blank=True)
    
    def __str__(self):
        return f"Customer: {self.user.username}"


class RiderProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='rider_profile')
    is_online = models.BooleanField(default=False)
    vehicle_type = models.CharField(max_length=50, null=True, blank=True)
    license_number = models.CharField(max_length=50, null=True, blank=True)
    current_location = models.JSONField(default=dict, null=True, blank=True)
    
    def __str__(self):
        return f"Rider: {self.user.username}"


class AmbassadorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='ambassador_profile')
    referral_code = models.CharField(max_length=20, unique=True, null=True, blank=True)
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    
    def __str__(self):
        return f"Ambassador: {self.user.username}"


class AdminProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='admin_profile')
    department = models.CharField(max_length=100, null=True, blank=True)
    access_level = models.IntegerField(default=1)
    
    def __str__(self):
        return f"Admin: {self.user.username}"

# Signals to create profiles automatically
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        if instance.role == User.Role.CUSTOMER:
            CustomerProfile.objects.create(user=instance)
        elif instance.role == User.Role.RIDER:
            RiderProfile.objects.create(user=instance)
        elif instance.role == User.Role.AMBASSADOR:
            AmbassadorProfile.objects.create(user=instance)
        elif instance.role in [User.Role.ADMIN, User.Role.SUPER_ADMIN]:
            AdminProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if instance.role == User.Role.CUSTOMER and hasattr(instance, 'customer_profile'):
        instance.customer_profile.save()
    elif instance.role == User.Role.RIDER and hasattr(instance, 'rider_profile'):
        instance.rider_profile.save()
    elif instance.role == User.Role.AMBASSADOR and hasattr(instance, 'ambassador_profile'):
        instance.ambassador_profile.save()
    elif instance.role in [User.Role.ADMIN, User.Role.SUPER_ADMIN] and hasattr(instance, 'admin_profile'):
        instance.admin_profile.save()
