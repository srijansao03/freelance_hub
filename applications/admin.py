from django.contrib import admin
from .models import Application, Message, Review

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ['freelancer', 'job', 'status', 'proposed_rate', 'applied_at']
    list_filter = ['status', 'applied_at']
    search_fields = ['freelancer__username', 'job__title']

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['sender', 'application', 'timestamp', 'is_read']
    list_filter = ['is_read', 'timestamp']

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['reviewer', 'reviewee', 'job', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
