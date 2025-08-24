from rest_framework import serializers
from .models import Application, Message, Review
from accounts.serializers import UserSerializer
from jobs.serializers import JobSerializer

class ApplicationSerializer(serializers.ModelSerializer):
    freelancer = UserSerializer(read_only=True)
    job = JobSerializer(read_only=True)
    job_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Application
        fields = ['id', 'job', 'job_id', 'freelancer', 'cover_letter', 'proposed_rate',
                 'estimated_duration', 'status', 'applied_at', 'updated_at']
        read_only_fields = ['id', 'freelancer', 'applied_at', 'updated_at']

    def create(self, validated_data):
        validated_data['freelancer'] = self.context['request'].user
        return super().create(validated_data)

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'application', 'sender', 'content', 'timestamp', 'is_read']
        read_only_fields = ['id', 'sender', 'timestamp']

    def create(self, validated_data):
        validated_data['sender'] = self.context['request'].user
        return super().create(validated_data)

class ReviewSerializer(serializers.ModelSerializer):
    reviewer = UserSerializer(read_only=True)
    reviewee = UserSerializer(read_only=True)
    job = JobSerializer(read_only=True)
    job_id = serializers.IntegerField(write_only=True)
    reviewee_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Review
        fields = ['id', 'job', 'job_id', 'reviewer', 'reviewee', 'reviewee_id',
                 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'reviewer', 'created_at']

    def create(self, validated_data):
        validated_data['reviewer'] = self.context['request'].user
        return super().create(validated_data)
