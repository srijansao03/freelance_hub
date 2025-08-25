# FreelanceHub - Freelancing Platform

A comprehensive freelancing platform built with Django (backend) and HTML/CSS/JavaScript (frontend) where job recruiters and freelancers can interact for job recruitment.

## Features

### For Freelancers
- Create and manage professional profiles
- Browse and search available jobs
- Apply to jobs with cover letters and proposed rates
- Manage applications and communicate with clients
- Portfolio and skills showcase
- Rating and review system

### For Recruiters/Clients
- Post and manage job listings
- Browse freelancer profiles
- Review and manage job applications
- Communicate with applicants
- Project management tools
- Rate and review freelancers

### General Features
- User authentication and authorization
- Advanced job search and filtering
- Real-time messaging system
- Secure payment discussions
- Responsive design for all devices
- Admin panel for platform management

## Technology Stack

### Backend
- **Django 5.2.4** - Web framework
- **Django REST Framework** - API development
- **SQLite** - Database (development)
- **Django CORS Headers** - Cross-origin resource sharing

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling with modern design
- **JavaScript (ES6+)** - Interactive functionality
- **Font Awesome** - Icons
- **Google Fonts** - Typography

## Installation and Setup

### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd freelance-platform
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv .venv
   
   # On macOS/Linux:
   source .venv/bin/activate
   
   # On Windows:
   .venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Create superuser (admin)**
   ```bash
   python manage.py createsuperuser
   ```

6. **Populate sample data (optional)**
   ```bash
   python manage.py populate_sample_data
   ```

7. **Run the development server**
   ```bash
   python manage.py runserver
   ```

8. **Access the application**
   - Main application: http://127.0.0.1:8000/
   - Admin panel: http://127.0.0.1:8000/admin/
   - API endpoints: http://127.0.0.1:8000/api/

## Sample Accounts

After running the `populate_sample_data` command, you can use these test accounts:

### Admin
- Username: `admin`
- Password: `admin123`

### Freelancer
- Username: `john_dev`
- Password: `password123`

### Recruiter
- Username: `tech_startup`
- Password: `password123`

## API Endpoints

### Authentication
- `POST /api/accounts/register/` - User registration
- `POST /api/accounts/login/` - User login
- `POST /api/accounts/logout/` - User logout
- `GET /api/accounts/profile/` - Get user profile

### Jobs
- `GET /api/jobs/jobs/` - List all jobs
- `POST /api/jobs/jobs/` - Create new job (recruiters only)
- `GET /api/jobs/jobs/{id}/` - Get job details
- `GET /api/jobs/search/` - Search jobs
- `GET /api/jobs/categories/` - List job categories

### Applications
- `GET /api/applications/applications/` - List applications
- `POST /api/applications/applications/` - Submit job application
- `POST /api/applications/applications/{id}/update_status/` - Update application status

### Users
- `GET /api/accounts/freelancer-profiles/` - List freelancer profiles
- `GET /api/accounts/recruiter-profiles/` - List recruiter profiles

## Project Structure

```
freelance-platform/
├── accounts/                 # User management app
│   ├── models.py            # User, FreelancerProfile, RecruiterProfile
│   ├── views.py             # Authentication and profile views
│   ├── serializers.py       # API serializers
│   └── urls.py              # URL patterns
├── jobs/                    # Job management app
│   ├── models.py            # Job, Category, JobAttachment
│   ├── views.py             # Job CRUD and search views
│   ├── serializers.py       # Job serializers
│   └── urls.py              # URL patterns
├── applications/            # Application management app
│   ├── models.py            # Application, Message, Review
│   ├── views.py             # Application and messaging views
│   ├── serializers.py       # Application serializers
│   └── urls.py              # URL patterns
├── templates/               # HTML templates
│   └── index.html           # Main frontend template
├── static/                  # Static files
│   ├── css/                 # Stylesheets
│   ├── js/                  # JavaScript files
│   └── images/              # Images
├── freelance_platform/      # Main project settings
├── manage.py                # Django management script
└── requirements.txt         # Python dependencies
```

## Key Features Implementation

### User System
- Custom User model with freelancer/recruiter types
- Separate profile models for each user type
- Django's built-in authentication system

### Job Management
- Categorized job listings
- Fixed price and hourly job types
- Advanced search and filtering
- Job application system

### Messaging System
- Application-based messaging
- Real-time communication between freelancers and recruiters
- Message read status tracking

### Review System
- Mutual rating system
- Comment-based reviews
- Rating aggregation for user profiles

## Frontend Architecture

### Design Principles
- **Responsive Design**: Mobile-first approach with breakpoints
- **Modern UI**: Clean, professional interface with gradients and shadows
- **Accessibility**: Semantic HTML and keyboard navigation
- **Performance**: Optimized images and lazy loading

### JavaScript Architecture
- **Modular Code**: Separated concerns with utility functions
- **API Integration**: Fetch-based HTTP requests
- **Error Handling**: User-friendly error messages
- **State Management**: Local state management for user sessions

## Security Features

- CSRF protection
- User authentication and authorization
- Input validation and sanitization
- Secure file upload handling
- SQL injection prevention through Django ORM

## Future Enhancements

### Planned Features
- [ ] Real-time chat with WebSockets
- [ ] Payment integration (Stripe/PayPal)
- [ ] File upload for portfolios and attachments
- [ ] Advanced search with Elasticsearch
- [ ] Email notifications
- [ ] Mobile app (React Native/Flutter)
- [ ] Video calling integration
- [ ] Advanced project management tools
- [ ] Freelancer skill assessments
- [ ] Multi-language support

### Technical Improvements
- [ ] Caching with Redis
- [ ] PostgreSQL for production
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Test coverage improvement
- [ ] Performance optimization
- [ ] SEO optimization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

## Development Team

- Backend Development: Django REST Framework
- Frontend Development: HTML5, CSS3, JavaScript
- Database Design: SQLite/PostgreSQL
- UI/UX Design: Modern responsive design

---

**Happy Freelancing! 🚀**
# Force redeploy
# Force redeploy
