from rest_framework import generics, permissions, status, views
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import JSONParser, FormParser, MultiPartParser
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, RegisterSerializer

from datetime import datetime
from services.mongo_service import mongo_service

User = get_user_model()

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['role'] = user.role
        token['username'] = user.username
        return token

class MyTokenObtainPairView(TokenObtainPairView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = MyTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class UserProfileView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)
    parser_classes = (JSONParser, FormParser, MultiPartParser)

    def get_object(self):
        return self.request.user

class ComplaintCreateView(APIView):
    """Allow customers to submit a complaint."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        data = request.data
        user = request.user
        
        subject = data.get('subject')
        description = data.get('description') or data.get('message')
        order_id = data.get('order_id')
        
        if not subject or not description:
            return Response(
                {'error': 'Subject and description are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        complaint_doc = {
            'user_id': str(user.id),
            'username': user.username,
            'subject': subject,
            'description': description,
            'order_id': order_id,
            'status': 'PENDING',
            'created_at': datetime.utcnow()
        }
        
        collection = mongo_service.get_collection('complaints')
        collection.insert_one(complaint_doc)
        
        return Response({'message': 'Complaint submitted successfully!'}, status=status.HTTP_201_CREATED)
