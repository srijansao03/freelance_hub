from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from accounts.models import User, FreelancerProfile, RecruiterProfile
from jobs.models import Category, Job
from applications.models import Application

class Command(BaseCommand):
    help = 'Populate database with sample data'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')
        
        # Create categories
        categories_data = [
            {'name': 'Web Development', 'description': 'Frontend and backend web development'},
            {'name': 'Mobile App Development', 'description': 'iOS and Android app development'},
            {'name': 'Data Science', 'description': 'Data analysis, machine learning, AI'},
            {'name': 'Graphic Design', 'description': 'Logo design, branding, visual design'},
            {'name': 'Content Writing', 'description': 'Blog posts, articles, copywriting'},
            {'name': 'Digital Marketing', 'description': 'SEO, social media, online advertising'},
            {'name': 'Video Editing', 'description': 'Video production and post-production'},
            {'name': 'Cybersecurity', 'description': 'Security consulting and implementation'},
        ]
        
        for cat_data in categories_data:
            Category.objects.get_or_create(name=cat_data['name'], defaults=cat_data)
        
        # Create sample users
        # Freelancers
        freelancer_data = [
            {
                'username': 'john_dev', 'email': 'john@example.com', 'first_name': 'John', 
                'last_name': 'Smith', 'user_type': 'freelancer',
                'profile': {'skills': 'Python, Django, React, JavaScript', 'hourly_rate': 75, 'experience_years': 5}
            },
            {
                'username': 'sarah_designer', 'email': 'sarah@example.com', 'first_name': 'Sarah', 
                'last_name': 'Johnson', 'user_type': 'freelancer',
                'profile': {'skills': 'UI/UX Design, Figma, Adobe Creative Suite', 'hourly_rate': 60, 'experience_years': 3}
            },
            {
                'username': 'mike_writer', 'email': 'mike@example.com', 'first_name': 'Mike', 
                'last_name': 'Davis', 'user_type': 'freelancer',
                'profile': {'skills': 'Content Writing, SEO, Copywriting', 'hourly_rate': 45, 'experience_years': 4}
            },
            {
                'username': 'lisa_data', 'email': 'lisa@example.com', 'first_name': 'Lisa', 
                'last_name': 'Wang', 'user_type': 'freelancer',
                'profile': {'skills': 'Python, Machine Learning, Data Analysis, SQL', 'hourly_rate': 85, 'experience_years': 6}
            },
        ]
        
        # Recruiters
        recruiter_data = [
            {
                'username': 'tech_startup', 'email': 'hiring@techstartup.com', 'first_name': 'Alex', 
                'last_name': 'Chen', 'user_type': 'recruiter',
                'profile': {'company_name': 'TechStartup Inc.', 'industry': 'Technology', 'verified': True}
            },
            {
                'username': 'design_agency', 'email': 'jobs@designagency.com', 'first_name': 'Emma', 
                'last_name': 'Brown', 'user_type': 'recruiter',
                'profile': {'company_name': 'Creative Design Agency', 'industry': 'Design', 'verified': True}
            },
        ]
        
        for user_data in freelancer_data:
            profile_data = user_data.pop('profile')
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults={**user_data, 'password': 'password123'}
            )
            if created:
                user.set_password('password123')
                user.save()
                FreelancerProfile.objects.create(user=user, **profile_data)
        
        for user_data in recruiter_data:
            profile_data = user_data.pop('profile')
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults={**user_data, 'password': 'password123'}
            )
            if created:
                user.set_password('password123')
                user.save()
                RecruiterProfile.objects.create(user=user, **profile_data)
        
        # Create sample jobs
        jobs_data = [
            {
                'title': 'Build a React E-commerce Website',
                'description': 'We need a full-featured e-commerce website built with React and Node.js. Should include product catalog, shopping cart, payment integration, and admin panel.',
                'category': 'Web Development',
                'recruiter': 'tech_startup',
                'job_type': 'fixed',
                'budget_min': 3000,
                'budget_max': 5000,
                'experience_level': 'intermediate',
                'skills_required': 'React, Node.js, MongoDB, Payment Integration',
                'deadline': timezone.now() + timedelta(days=45)
            },
            {
                'title': 'Mobile App UI/UX Design',
                'description': 'Design a modern, user-friendly interface for a fitness tracking mobile app. Need wireframes, mockups, and interactive prototypes.',
                'category': 'Graphic Design',
                'recruiter': 'design_agency',
                'job_type': 'fixed',
                'budget_min': 1500,
                'budget_max': 2500,
                'experience_level': 'intermediate',
                'skills_required': 'UI/UX Design, Figma, Mobile Design, Prototyping',
                'deadline': timezone.now() + timedelta(days=30)
            },
            {
                'title': 'Data Analysis for Marketing Campaign',
                'description': 'Analyze customer data to identify trends and insights for our marketing campaigns. Create visualizations and reports.',
                'category': 'Data Science',
                'recruiter': 'tech_startup',
                'job_type': 'hourly',
                'hourly_rate_min': 60,
                'hourly_rate_max': 80,
                'experience_level': 'expert',
                'skills_required': 'Python, Pandas, Matplotlib, SQL, Statistics',
                'deadline': timezone.now() + timedelta(days=20)
            },
            {
                'title': 'Content Writing for Tech Blog',
                'description': 'Write engaging blog posts about emerging technologies, programming tutorials, and industry trends. 10 articles needed.',
                'category': 'Content Writing',
                'recruiter': 'tech_startup',
                'job_type': 'fixed',
                'budget_min': 800,
                'budget_max': 1200,
                'experience_level': 'intermediate',
                'skills_required': 'Content Writing, SEO, Technical Writing, Research',
                'deadline': timezone.now() + timedelta(days=25)
            },
            {
                'title': 'WordPress Website Development',
                'description': 'Create a professional WordPress website for a small business. Custom theme, responsive design, and SEO optimization required.',
                'category': 'Web Development',
                'recruiter': 'design_agency',
                'job_type': 'fixed',
                'budget_min': 1000,
                'budget_max': 2000,
                'experience_level': 'beginner',
                'skills_required': 'WordPress, PHP, CSS, HTML, SEO',
                'deadline': timezone.now() + timedelta(days=35)
            },
        ]
        
        for job_data in jobs_data:
            category_name = job_data.pop('category')
            recruiter_username = job_data.pop('recruiter')
            
            category = Category.objects.get(name=category_name)
            recruiter = User.objects.get(username=recruiter_username)
            
            Job.objects.get_or_create(
                title=job_data['title'],
                defaults={**job_data, 'category': category, 'recruiter': recruiter}
            )
        
        self.stdout.write(self.style.SUCCESS('Sample data created successfully!'))
        self.stdout.write('You can now:')
        self.stdout.write('- Login as admin with username: admin, password: admin123')
        self.stdout.write('- Login as freelancer with username: john_dev, password: password123')
        self.stdout.write('- Login as recruiter with username: tech_startup, password: password123')
