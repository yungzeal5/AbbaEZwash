import random
import uuid
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from users.models import User
from services.mongo_service import mongo_service

class Command(BaseCommand):
    help = 'Seeds the database with initial users and orders'

    def handle(self, *args, **options):
        self.stdout.write('Seeding data...')
        
        # 1. Create Users
        users_data = [
            {
                'username': 'customer',
                'email': 'customer@example.com',
                'password': 'password123',
                'role': 'CUSTOMER',
                'phone_number': '+233550000001',
                'location': {'address': '123 Independence Ave, Accra'}
            },
            {
                'username': 'rider',
                'email': 'rider@example.com',
                'password': 'password123',
                'role': 'RIDER',
                'phone_number': '+233550000002',
                'location': {'address': 'Rider Station, Osu'}
            },
            {
                'username': 'ambassador',
                'email': 'ambassador@example.com',
                'password': 'password123',
                'role': 'AMBASSADOR',
                'phone_number': '+233550000003',
                'location': {'address': 'Ambassador HQ'}
            },
            {
                'username': 'admin_user',
                'email': 'admin@example.com',
                'password': 'password123',
                'role': 'ADMIN',
                'phone_number': '+233550000004',
                'location': {'address': 'Admin Office'}
            },
            {
                'username': 'superadmin',
                'email': 'superadmin@example.com',
                'password': 'password123',
                'role': 'SUPER_ADMIN',
                'phone_number': '+233550000005',
                'location': {'address': 'Headquarters'}
            }
        ]

        created_users = {}
        
        for user_data in users_data:
            username = user_data['username']
            if not User.objects.filter(username=username).exists():
                user = User.objects.create_user(
                    username=username,
                    email=user_data['email'],
                    password=user_data['password'],
                    role=user_data['role'],
                    phone_number=user_data['phone_number'],
                    location=user_data['location']
                )
                if user_data['role'] == 'SUPER_ADMIN':
                    user.is_staff = True
                    user.is_superuser = True
                    user.save()
                elif user_data['role'] == 'ADMIN':
                    user.is_staff = True
                    user.save()
                
                created_users[username] = user
                self.stdout.write(self.style.SUCCESS(f'Created user: {username} ({user_data["role"]})'))
            else:
                created_users[username] = User.objects.get(username=username)
                self.stdout.write(f'User {username} already exists')

        # 2. Create Sample Orders
        # We need the customer user to assign orders to
        customer = created_users.get('customer')
        rider = created_users.get('rider')
        
        if customer:
            orders_collection = mongo_service.get_collection('orders')
            
            # Clear existing orders to avoid duplicates for this seed (optional, but good for reliable testing)
            # orders_collection.delete_many({}) 
            
            statuses = ['PENDING', 'ACCEPTED', 'PICKED_UP', 'CLEANING', 'READY', 'DELIVERED']
            
            for i in range(10):
                status = random.choice(statuses)
                created_at = datetime.utcnow() - timedelta(days=random.randint(0, 30))
                
                order_data = {
                    'order_id': f"ORD-{uuid.uuid4().hex[:6].upper()}",
                    'user_id': str(customer.id),
                    'customer_name': customer.username,
                    'items': [
                        {'name': 'T-Shirt', 'quantity': random.randint(1, 5), 'price': 15.00},
                        {'name': 'Jeans', 'quantity': random.randint(1, 3), 'price': 25.00}
                    ],
                    'total_price': float(random.randint(50, 200)),
                    'status': status,
                    'pickup_location': customer.location,
                    'phone_number': customer.phone_number,
                    'created_at': created_at,
                    'updated_at': created_at,
                    'assigned_rider_id': str(rider.id) if status != 'PENDING' and rider else None,
                    'assigned_rider_name': rider.username if status != 'PENDING' and rider else None,
                }
                
                # Check for uniqueness if re-running
                # Simply inserting here
                orders_collection.insert_one(order_data)
                
            self.stdout.write(self.style.SUCCESS(f'Created 10 sample orders for {customer.username}'))

        self.stdout.write(self.style.SUCCESS('Database seeding completed successfully!'))
