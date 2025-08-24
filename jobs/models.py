from django.db import models
from django.utils import timezone
from accounts.models import User

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    
    class Meta:
        verbose_name_plural = "Categories"
    
    def __str__(self):
        return self.name

class Job(models.Model):
    JOB_TYPES = (
        ('fixed', 'Fixed Price'),
        ('hourly', 'Hourly'),
    )
    
    EXPERIENCE_LEVELS = (
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('expert', 'Expert'),
    )
    
    STATUS_CHOICES = (
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='jobs')
    recruiter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posted_jobs')
    job_type = models.CharField(max_length=10, choices=JOB_TYPES)
    budget_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    budget_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    hourly_rate_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    hourly_rate_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    experience_level = models.CharField(max_length=20, choices=EXPERIENCE_LEVELS)
    skills_required = models.TextField(help_text="Comma-separated skills")
    deadline = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title

class JobAttachment(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='job_attachments/')
    uploaded_at = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return f"Attachment for {self.job.title}"
