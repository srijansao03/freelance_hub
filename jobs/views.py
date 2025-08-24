from django.shortcuts import render
from django.db.models import Q
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Category, Job, JobAttachment
from .serializers import CategorySerializer, JobSerializer, JobListSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    
    def get_permissions(self):
        """
        Allow read access to everyone, write access only to authenticated users
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return JobListSerializer
        return JobSerializer
    
    def get_queryset(self):
        queryset = Job.objects.all()
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category_id=category)
        
        # Filter by job type
        job_type = self.request.query_params.get('job_type', None)
        if job_type:
            queryset = queryset.filter(job_type=job_type)
        
        # Filter by experience level
        experience_level = self.request.query_params.get('experience_level', None)
        if experience_level:
            queryset = queryset.filter(experience_level=experience_level)
        
        # Filter by recruiter (for recruiter's own jobs)
        if self.request.query_params.get('my_jobs', None) == 'true':
            queryset = queryset.filter(recruiter=self.request.user)
        
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def toggle_status(self, request, pk=None):
        job = self.get_object()
        if job.recruiter != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        new_status = request.data.get('status')
        if new_status in ['open', 'in_progress', 'completed', 'cancelled']:
            job.status = new_status
            job.save()
            return Response({'message': f'Job status updated to {new_status}'})
        
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

class JobSearchView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        query = request.query_params.get('q', '')
        jobs = Job.objects.filter(status='open')
        
        if query:
            jobs = jobs.filter(
                Q(title__icontains=query) |
                Q(description__icontains=query) |
                Q(skills_required__icontains=query)
            )
        
        # Apply filters
        category = request.query_params.get('category')
        if category:
            jobs = jobs.filter(category_id=category)
        
        job_type = request.query_params.get('job_type')
        if job_type:
            jobs = jobs.filter(job_type=job_type)
        
        experience_level = request.query_params.get('experience_level')
        if experience_level:
            jobs = jobs.filter(experience_level=experience_level)
        
        # Budget filters
        min_budget = request.query_params.get('min_budget')
        max_budget = request.query_params.get('max_budget')
        
        if min_budget:
            jobs = jobs.filter(budget_min__gte=min_budget)
        if max_budget:
            jobs = jobs.filter(budget_max__lte=max_budget)
        
        serializer = JobListSerializer(jobs, many=True)
        return Response(serializer.data)
