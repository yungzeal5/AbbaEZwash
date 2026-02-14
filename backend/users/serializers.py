from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    profile_data = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'phone_number', 'role', 'is_online', 'location', 
                 'is_email_verified', 'custom_id', 'streak_count', 'created_at', 'profile_data')
        read_only_fields = ('id', 'is_email_verified')

    def get_profile_data(self, obj):
        if obj.role == User.Role.CUSTOMER and hasattr(obj, 'customer_profile'):
            return {
                'loyalty_points': obj.customer_profile.loyalty_points,
                'preferences': obj.customer_profile.preferences
            }
        elif obj.role == User.Role.RIDER and hasattr(obj, 'rider_profile'):
            return {
                'is_online': obj.rider_profile.is_online,
                'vehicle_type': obj.rider_profile.vehicle_type,
                'license_number': obj.rider_profile.license_number,
                'current_location': obj.rider_profile.current_location
            }
        elif obj.role == User.Role.AMBASSADOR and hasattr(obj, 'ambassador_profile'):
            return {
                'referral_code': obj.ambassador_profile.referral_code,
                'commission_rate': obj.ambassador_profile.commission_rate
            }
        elif obj.role in [User.Role.ADMIN, User.Role.SUPER_ADMIN] and hasattr(obj, 'admin_profile'):
            return {
                'department': obj.admin_profile.department,
                'access_level': obj.admin_profile.access_level
            }
        return {}

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    referral_code = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'phone_number', 'role', 'location', 'referral_code')

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value

    def validate_phone_number(self, value):
        if value == "":
            return None
        if User.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError("Phone number already exists.")
        return value

    def validate_referral_code(self, value):
        if value:
            from users.models import AmbassadorProfile
            if not AmbassadorProfile.objects.filter(referral_code=value).exists():
                raise serializers.ValidationError("Invalid referral code.")
        return value

    def create(self, validated_data):
        referral_code = validated_data.pop('referral_code', None)
        phone_number = validated_data.get('phone_number')
        if not phone_number:
            phone_number = None
            
        referred_by = None
        if referral_code:
            from users.models import AmbassadorProfile
            try:
                ambassador_profile = AmbassadorProfile.objects.get(referral_code=referral_code)
                referred_by = ambassador_profile.user
            except AmbassadorProfile.DoesNotExist:
                pass

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            phone_number=phone_number,
            role=validated_data.get('role', 'CUSTOMER'),
            location=validated_data.get('location', {}),
            referred_by=referred_by
        )
        return user
