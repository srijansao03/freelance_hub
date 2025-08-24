from django.shortcuts import render
from django.contrib.auth import login, logout
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import User, FreelancerProfile, RecruiterProfile
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer,
    FreelancerProfileSerializer, RecruiterProfileSerializer
)

class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'User created successfully',
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user)
            return Response({
                'message': 'Login successful',
                'user': UserSerializer(user).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        logout(request)
        return Response({'message': 'Logout successful'})

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        user_data = UserSerializer(user).data
        
        profile_data = None
        if user.user_type == 'freelancer':
            try:
                profile = user.freelancer_profile
                profile_data = FreelancerProfileSerializer(profile).data
            except FreelancerProfile.DoesNotExist:
                pass
        elif user.user_type == 'recruiter':
            try:
                profile = user.recruiter_profile
                profile_data = RecruiterProfileSerializer(profile).data
            except RecruiterProfile.DoesNotExist:
                pass
        
        return Response({
            'user': user_data,
            'profile': profile_data
        })

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class FreelancerProfileViewSet(viewsets.ModelViewSet):
    queryset = FreelancerProfile.objects.all()
    serializer_class = FreelancerProfileSerializer
    
    def get_permissions(self):
        """
        Allow read access to everyone, write access only to authenticated users
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        if self.action == 'list':
            return FreelancerProfile.objects.all()
        if self.request.user.is_authenticated:
            return FreelancerProfile.objects.filter(user=self.request.user)
        return FreelancerProfile.objects.none()

class RecruiterProfileViewSet(viewsets.ModelViewSet):
    queryset = RecruiterProfile.objects.all()
    serializer_class = RecruiterProfileSerializer
    
    def get_permissions(self):
        """
        Allow read access to everyone, write access only to authenticated users
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        if self.action == 'list':
            return RecruiterProfile.objects.all()
        if self.request.user.is_authenticated:
            return RecruiterProfile.objects.filter(user=self.request.user)
        return RecruiterProfile.objects.none()
