from rest_framework import serializers
from .models import Category, Job, JobAttachment
from accounts.serializers import UserSerializer

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class JobAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobAttachment
        fields = '__all__'

class JobSerializer(serializers.ModelSerializer):
    recruiter = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)
    attachments = JobAttachmentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Job
        fields = ['id', 'title', 'description', 'category', 'category_id', 'recruiter', 
                 'job_type', 'budget_min', 'budget_max', 'hourly_rate_min', 'hourly_rate_max',
                 'experience_level', 'skills_required', 'deadline', 'status', 'created_at', 
                 'updated_at', 'attachments']
        read_only_fields = ['id', 'recruiter', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['recruiter'] = self.context['request'].user
        return super().create(validated_data)

class JobListSerializer(serializers.ModelSerializer):
    recruiter = serializers.StringRelatedField()
    category = serializers.StringRelatedField()
    
    class Meta:
        model = Job
        fields = ['id', 'title', 'description', 'category', 'recruiter', 'job_type', 
                 'budget_min', 'budget_max', 'hourly_rate_min', 'hourly_rate_max',
                 'experience_level', 'created_at', 'status']
