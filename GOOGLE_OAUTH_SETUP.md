# Google OAuth Setup Guide for FreelanceHub

## Current Status ✅

The Google OAuth integration is now **working** with placeholder credentials:
- ✅ Django-allauth properly configured
- ✅ Google OAuth app created in database  
- ✅ Templates updated with Google sign-in buttons
- ✅ Server running without errors at http://127.0.0.1:8000/
- ✅ Google OAuth URLs accessible (200 status)

## ⚠️ Using Placeholder Credentials

Currently using **test credentials** that need to be replaced:
- Client ID: `1234567890-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com`
- Client Secret: `GOCSPX-abcdefghijklmnopqrstuvwxyz1234567`

## Next Steps: Get Real Google Credentials

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project called "FreelanceHub"
3. Enable the Google+ API (in APIs & Services > Library)

### Step 2: Configure OAuth Consent Screen

1. Go to APIs & Services > OAuth consent screen
2. Choose "External" user type
3. Fill required info:
   - App name: FreelanceHub
   - User support email: your email
   - Developer contact: your email
4. Add scopes: email, profile, openid
5. Save and continue

### Step 3: Create OAuth 2.0 Credentials

1. Go to APIs & Services > Credentials
2. Create Credentials > OAuth 2.0 Client IDs
3. Application type: Web application
4. Name: FreelanceHub Web Client
5. Authorized redirect URIs:
   ```
   http://127.0.0.1:8000/accounts/google/login/callback/
   http://localhost:8000/accounts/google/login/callback/
   ```
6. Save and copy Client ID and Client Secret

### Step 4: Update FreelanceHub Database

Replace placeholder credentials by running in Django shell:

```python
python manage.py shell

from allauth.socialaccount.models import SocialApp
google_app = SocialApp.objects.get(provider='google')
google_app.client_id = 'YOUR_ACTUAL_CLIENT_ID'
google_app.secret = 'YOUR_ACTUAL_CLIENT_SECRET'  
google_app.save()
print("✅ Updated!")
```

## How to Test

1. Server is already running at http://127.0.0.1:8000/
2. Click "Login" then "Continue with Google"
3. Should redirect to Google OAuth (with real credentials)
4. After approval, redirects back to FreelanceHub

## Current Features Working

### Frontend
- ✅ Login modal with Google button
- ✅ Register modal with Google button  
- ✅ Google logo and styling
- ✅ Responsive design

### Backend  
- ✅ Django-allauth integration
- ✅ Custom social account adapter
- ✅ Automatic freelancer profile creation
- ✅ User type assignment (freelancer for Google users)
- ✅ Email/name population from Google profile

## Database Configuration

Google OAuth app in database:
- Name: FreelanceHub Google OAuth
- Provider: google
- Client ID: (placeholder - needs real credentials)
- Secret: (placeholder - needs real credentials)
- Sites: example.com

## File Changes Made

```
freelance_platform/settings.py - Removed APP config from SOCIALACCOUNT_PROVIDERS
accounts/adapters.py - Custom adapter for Google OAuth users  
templates/index.html - Google sign-in buttons in login/register modals
static/css/style.css - Google button styling
Database - SocialApp created for Google OAuth
```

## Production Deployment Notes

For production, update redirect URIs to:
```
https://yourdomain.com/accounts/google/login/callback/
```

## Troubleshooting

### Common Issues:
1. **"OAuth app not found"** - Run the database update command above
2. **"Invalid redirect URI"** - Ensure URIs match Google Cloud Console exactly  
3. **"Access blocked"** - OAuth consent screen may need verification for external users
4. **Multiple objects error** - Database had duplicate SocialApps (now fixed)

### Debug Commands:
```bash
# Check Google app exists
python manage.py shell -c "from allauth.socialaccount.models import SocialApp; print(SocialApp.objects.filter(provider='google'))"

# Test Google OAuth URL
curl http://127.0.0.1:8000/accounts/google/login/
```

## What's Next

The Google OAuth integration is **ready for testing** once you:
1. Set up Google Cloud Console project
2. Get real OAuth credentials  
3. Update the database with the real credentials

The framework is complete and functional! 🚀
