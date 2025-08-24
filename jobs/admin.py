from django.contrib import admin
from .models import Category, Job, JobAttachment

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'description']
    search_fields = ['name']

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ['title', 'recruiter', 'category', 'job_type', 'status', 'created_at']
    list_filter = ['job_type', 'status', 'experience_level', 'category']
    search_fields = ['title', 'description']
    date_hierarchy = 'created_at'

@admin.register(JobAttachment)
class JobAttachmentAdmin(admin.ModelAdmin):
    list_display = ['job', 'file', 'uploaded_at']
    list_filter = ['uploaded_at']
