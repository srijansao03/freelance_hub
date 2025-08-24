from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from .models import FreelancerProfile


class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    def save_user(self, request, sociallogin, form=None):
        """
        Save user and create a default profile
        """
        user = super().save_user(request, sociallogin, form)
        
        # Set default user type as freelancer for Google OAuth users
        if sociallogin.account.provider == 'google':
            user.user_type = 'freelancer'
            user.save()
            
            # Create freelancer profile if it doesn't exist
            if not hasattr(user, 'freelancerprofile'):
                FreelancerProfile.objects.create(
                    user=user,
                    skills="",
                    hourly_rate=0,
                    experience_years=0
                )
        
        return user
    
    def populate_user(self, request, sociallogin, data):
        """
        Populate user fields from social provider data
        """
        user = super().populate_user(request, sociallogin, data)
        
        if sociallogin.account.provider == 'google':
            user.email = data.get('email', '')
            user.first_name = data.get('given_name', '')
            user.last_name = data.get('family_name', '')
            
        return user
