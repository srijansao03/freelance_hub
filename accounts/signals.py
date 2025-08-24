from django.db.models.signals import post_save
from django.dispatch import receiver
from allauth.socialaccount.signals import pre_social_login
from django.contrib.auth import get_user_model
from .models import User, FreelancerProfile, RecruiterProfile

User = get_user_model()

@receiver(pre_social_login)
def populate_profile(sender, request, sociallogin, **kwargs):
    """
    Populate user profile when signing up with Google OAuth
    """
    user = sociallogin.user
    if user.id:
        return
    
    if sociallogin.account.provider == 'google':
        # Get data from Google
        data = sociallogin.account.extra_data
        user.email = data.get('email', '')
        user.first_name = data.get('given_name', '')
        user.last_name = data.get('family_name', '')
        
        # Check if a user with this email already exists
        try:
            existing_user = User.objects.get(email=user.email)
            sociallogin.user = existing_user
        except User.DoesNotExist:
            pass

@receiver(post_save, sender=User)
def create_user_profile_on_google_signup(sender, instance, created, **kwargs):
    """
    Create a freelancer profile for users who sign up via Google OAuth
    We default to freelancer profile, but users can switch later
    """
    if created and not hasattr(instance, 'freelancerprofile') and not hasattr(instance, 'recruiterprofile'):
        # Check if this user was created via social login
        if hasattr(instance, 'socialaccount_set') and instance.socialaccount_set.exists():
            FreelancerProfile.objects.create(
                user=instance,
                skills="",
                hourly_rate=0,
                experience_years=0
            )
