from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Application, Message, Review
from .serializers import ApplicationSerializer, MessageSerializer, ReviewSerializer

class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Freelancers see their own applications
        if user.user_type == 'freelancer':
            return Application.objects.filter(freelancer=user)
        
        # Recruiters see applications for their jobs
        elif user.user_type == 'recruiter':
            return Application.objects.filter(job__recruiter=user)
        
        return Application.objects.none()
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        application = self.get_object()
        
        # Only recruiters can update application status
        if request.user.user_type != 'recruiter' or application.job.recruiter != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        new_status = request.data.get('status')
        if new_status in ['pending', 'accepted', 'rejected']:
            application.status = new_status
            application.save()
            
            # If accepted, update job status to in_progress
            if new_status == 'accepted':
                application.job.status = 'in_progress'
                application.job.save()
            
            return Response({'message': f'Application {new_status}'})
        
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def withdraw(self, request, pk=None):
        application = self.get_object()
        
        # Only the freelancer who applied can withdraw
        if application.freelancer != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        application.status = 'withdrawn'
        application.save()
        return Response({'message': 'Application withdrawn'})

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        application_id = self.request.query_params.get('application', None)
        
        if application_id:
            # Check if user has access to this application
            try:
                application = Application.objects.get(id=application_id)
                if user == application.freelancer or user == application.job.recruiter:
                    return Message.objects.filter(application=application)
            except Application.DoesNotExist:
                pass
        
        return Message.objects.none()
    
    @action(detail=False, methods=['post'])
    def mark_read(self, request):
        application_id = request.data.get('application')
        if application_id:
            Message.objects.filter(
                application_id=application_id,
                is_read=False
            ).exclude(sender=request.user).update(is_read=True)
            return Response({'message': 'Messages marked as read'})
        return Response({'error': 'Application ID required'}, status=status.HTTP_400_BAD_REQUEST)

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Filter based on query parameters
        reviewee_id = self.request.query_params.get('reviewee')
        if reviewee_id:
            return Review.objects.filter(reviewee_id=reviewee_id)
        
        # Return reviews given by user
        return Review.objects.filter(reviewer=user)
    
    def perform_create(self, serializer):
        # Ensure the reviewer has permission to review
        job_id = self.request.data.get('job_id')
        reviewee_id = self.request.data.get('reviewee_id')
        
        try:
            from jobs.models import Job
            job = Job.objects.get(id=job_id)
            
            # Check if job is completed and user is involved
            if job.status != 'completed':
                raise ValueError("Job must be completed to leave a review")
            
            if self.request.user != job.recruiter and not job.applications.filter(
                freelancer=self.request.user, status='accepted'
            ).exists():
                raise ValueError("You must be involved in this job to leave a review")
            
        except Job.DoesNotExist:
            raise ValueError("Job not found")
        
        serializer.save(reviewer=self.request.user)
