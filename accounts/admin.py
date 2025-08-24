from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, FreelancerProfile, RecruiterProfile

class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ['username', 'email', 'user_type', 'is_staff', 'date_joined']
    list_filter = ['user_type', 'is_staff', 'is_active']
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('user_type', 'phone', 'profile_picture', 'bio', 'location', 'website')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Additional Info', {'fields': ('user_type', 'phone', 'bio', 'location')}),
    )

@admin.register(FreelancerProfile)
class FreelancerProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'hourly_rate', 'experience_years', 'rating', 'completed_projects']
    list_filter = ['experience_years', 'rating']

@admin.register(RecruiterProfile)
class RecruiterProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'company_name', 'industry', 'verified']
    list_filter = ['verified', 'industry']

admin.site.register(User, CustomUserAdmin)
