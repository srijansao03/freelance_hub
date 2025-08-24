// Dashboard functionality
let currentSection = 'overview';

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname === '/dashboard/') {
        initializeDashboard();
    }
});

async function initializeDashboard() {
    // Check if user is logged in
    await checkAuthStatus();
    
    if (!currentUser) {
        window.location.href = '/';
        return;
    }
    
    // Update UI elements
    updateUserGreeting();
    setupDashboardMenu();
    loadDashboardContent('overview');
    setupDashboardForms();
    loadCategoriesForJobForm();
}

function updateUserGreeting() {
    const greeting = document.getElementById('user-greeting');
    if (greeting && currentUser) {
        greeting.textContent = `Welcome, ${currentUser.first_name || currentUser.username}!`;
    }
}

function setupDashboardMenu() {
    const sidebar = document.getElementById('sidebar-menu');
    const actions = document.getElementById('dashboard-actions');
    
    if (currentUser.user_type === 'freelancer') {
        sidebar.innerHTML = `
            <a href="#" class="sidebar-item active" onclick="loadDashboardContent('overview')">
                <i class="fas fa-chart-pie"></i> Overview
            </a>
            <a href="#" class="sidebar-item" onclick="loadDashboardContent('applications')">
                <i class="fas fa-file-alt"></i> My Applications
            </a>
            <a href="#" class="sidebar-item" onclick="loadDashboardContent('jobs')">
                <i class="fas fa-search"></i> Browse Jobs
            </a>
            <a href="#" class="sidebar-item" onclick="loadDashboardContent('profile')">
                <i class="fas fa-user"></i> Profile
            </a>
            <a href="#" class="sidebar-item" onclick="loadDashboardContent('messages')">
                <i class="fas fa-comments"></i> Messages
            </a>
        `;
        
        actions.innerHTML = `
            <button class="btn-primary" onclick="loadDashboardContent('jobs')">
                <i class="fas fa-search"></i> Find Jobs
            </button>
            <button class="btn-secondary" onclick="showModal('profile-edit-modal')">
                <i class="fas fa-edit"></i> Edit Profile
            </button>
        `;
    } else if (currentUser.user_type === 'recruiter') {
        sidebar.innerHTML = `
            <a href="#" class="sidebar-item active" onclick="loadDashboardContent('overview')">
                <i class="fas fa-chart-pie"></i> Overview
            </a>
            <a href="#" class="sidebar-item" onclick="loadDashboardContent('jobs')">
                <i class="fas fa-briefcase"></i> My Jobs
            </a>
            <a href="#" class="sidebar-item" onclick="loadDashboardContent('applications')">
                <i class="fas fa-file-alt"></i> Applications
            </a>
            <a href="#" class="sidebar-item" onclick="loadDashboardContent('freelancers')">
                <i class="fas fa-users"></i> Browse Freelancers
            </a>
            <a href="#" class="sidebar-item" onclick="loadDashboardContent('profile')">
                <i class="fas fa-user"></i> Profile
            </a>
            <a href="#" class="sidebar-item" onclick="loadDashboardContent('messages')">
                <i class="fas fa-comments"></i> Messages
            </a>
        `;
        
        actions.innerHTML = `
            <button class="btn-primary" onclick="showModal('job-post-modal')">
                <i class="fas fa-plus"></i> Post Job
            </button>
            <button class="btn-secondary" onclick="showModal('profile-edit-modal')">
                <i class="fas fa-edit"></i> Edit Profile
            </button>
        `;
    }
}

async function loadDashboardContent(section) {
    currentSection = section;
    
    // Update active menu item
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
    });
    event?.target.classList.add('active');
    
    // Update title
    const title = document.getElementById('dashboard-title');
    title.textContent = section.charAt(0).toUpperCase() + section.slice(1);
    
    const content = document.getElementById('dashboard-content');
    content.innerHTML = '<div class="loading-table">Loading...</div>';
    
    try {
        switch (section) {
            case 'overview':
                await loadOverview();
                break;
            case 'jobs':
                await loadJobs();
                break;
            case 'applications':
                await loadApplications();
                break;
            case 'freelancers':
                await loadFreelancersBrowse();
                break;
            case 'profile':
                await loadProfile();
                break;
            case 'messages':
                await loadMessages();
                break;
            default:
                content.innerHTML = '<div class="empty-state">Content not available</div>';
        }
    } catch (error) {
        console.error('Error loading dashboard content:', error);
        content.innerHTML = '<div class="empty-state">Error loading content</div>';
    }
}

async function loadOverview() {
    const content = document.getElementById('dashboard-content');
    
    if (currentUser.user_type === 'freelancer') {
        // Load freelancer overview
        const [applicationsRes, profileRes] = await Promise.all([
            fetch(`${API_BASE}/applications/applications/`, { credentials: 'include' }),
            fetch(`${API_BASE}/accounts/profile/`, { credentials: 'include' })
        ]);
        
        const applications = applicationsRes.ok ? await applicationsRes.json() : [];
        const profile = profileRes.ok ? await profileRes.json() : {};
        
        const pendingApps = applications.filter(app => app.status === 'pending').length;
        const acceptedApps = applications.filter(app => app.status === 'accepted').length;
        const totalApps = applications.length;
        
        content.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon primary">
                        <i class="fas fa-file-alt"></i>
                    </div>
                    <div class="stat-number">${totalApps}</div>
                    <div class="stat-label">Total Applications</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon warning">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-number">${pendingApps}</div>
                    <div class="stat-label">Pending</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon success">
                        <i class="fas fa-check"></i>
                    </div>
                    <div class="stat-number">${acceptedApps}</div>
                    <div class="stat-label">Accepted</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon info">
                        <i class="fas fa-dollar-sign"></i>
                    </div>
                    <div class="stat-number">$${profile.profile?.hourly_rate || 0}</div>
                    <div class="stat-label">Hourly Rate</div>
                </div>
            </div>
            <div class="dashboard-content">
                <h3 style="padding: 20px;">Recent Applications</h3>
                ${applications.length > 0 ? generateApplicationsTable(applications.slice(0, 5)) : '<div class="empty-state"><i class="fas fa-file-alt"></i><h3>No Applications Yet</h3><p>Start applying to jobs to see your applications here.</p><button class="btn-primary" onclick="loadDashboardContent(\'jobs\')">Browse Jobs</button></div>'}
            </div>
        `;
    } else {
        // Load recruiter overview
        const [jobsRes, applicationsRes] = await Promise.all([
            fetch(`${API_BASE}/jobs/jobs/?my_jobs=true`, { credentials: 'include' }),
            fetch(`${API_BASE}/applications/applications/`, { credentials: 'include' })
        ]);
        
        const jobs = jobsRes.ok ? await jobsRes.json() : [];
        const applications = applicationsRes.ok ? await applicationsRes.json() : [];
        
        const activeJobs = jobs.filter(job => job.status === 'open').length;
        const totalJobs = jobs.length;
        const totalApplications = applications.length;
        const pendingApps = applications.filter(app => app.status === 'pending').length;
        
        content.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon primary">
                        <i class="fas fa-briefcase"></i>
                    </div>
                    <div class="stat-number">${totalJobs}</div>
                    <div class="stat-label">Total Jobs Posted</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon success">
                        <i class="fas fa-check"></i>
                    </div>
                    <div class="stat-number">${activeJobs}</div>
                    <div class="stat-label">Active Jobs</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon info">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="stat-number">${totalApplications}</div>
                    <div class="stat-label">Total Applications</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon warning">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-number">${pendingApps}</div>
                    <div class="stat-label">Pending Review</div>
                </div>
            </div>
            <div class="dashboard-content">
                <h3 style="padding: 20px;">Recent Applications</h3>
                ${applications.length > 0 ? generateApplicationsTable(applications.slice(0, 5)) : '<div class="empty-state"><i class="fas fa-file-alt"></i><h3>No Applications Yet</h3><p>Post jobs to start receiving applications.</p><button class="btn-primary" onclick="showModal(\'job-post-modal\')">Post a Job</button></div>'}
            </div>
        `;
    }
}

async function loadJobs() {
    const content = document.getElementById('dashboard-content');
    
    if (currentUser.user_type === 'freelancer') {
        // Load all available jobs for freelancers
        const response = await fetch(`${API_BASE}/jobs/jobs/`);
        const jobs = response.ok ? await response.json() : [];
        
        content.innerHTML = `
            <div style="padding: 20px;">
                <div class="search-container" style="margin-bottom: 20px;">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" id="dashboard-job-search" placeholder="Search jobs...">
                    </div>
                </div>
                ${jobs.length > 0 ? generateJobsGrid(jobs) : '<div class="empty-state"><i class="fas fa-briefcase"></i><h3>No Jobs Available</h3><p>Check back later for new opportunities.</p></div>'}
            </div>
        `;
        
        // Add search functionality
        document.getElementById('dashboard-job-search').addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const filteredJobs = jobs.filter(job => 
                job.title.toLowerCase().includes(searchTerm) ||
                job.description.toLowerCase().includes(searchTerm) ||
                job.skills_required.toLowerCase().includes(searchTerm)
            );
            
            const grid = document.querySelector('.jobs-grid');
            if (grid) {
                grid.innerHTML = filteredJobs.map(job => createJobCard(job)).join('');
            }
        });
    } else {
        // Load recruiter's posted jobs
        const response = await fetch(`${API_BASE}/jobs/jobs/?my_jobs=true`, { credentials: 'include' });
        const jobs = response.ok ? await response.json() : [];
        
        content.innerHTML = `
            <div style="padding: 20px;">
                ${jobs.length > 0 ? generateJobsTable(jobs) : '<div class="empty-state"><i class="fas fa-briefcase"></i><h3>No Jobs Posted</h3><p>Start posting jobs to find talented freelancers.</p><button class="btn-primary" onclick="showModal(\'job-post-modal\')">Post Your First Job</button></div>'}
            </div>
        `;
    }
}

async function loadApplications() {
    const response = await fetch(`${API_BASE}/applications/applications/`, { credentials: 'include' });
    const applications = response.ok ? await response.json() : [];
    
    const content = document.getElementById('dashboard-content');
    content.innerHTML = `
        <div style="padding: 20px;">
            ${applications.length > 0 ? generateApplicationsTable(applications) : '<div class="empty-state"><i class="fas fa-file-alt"></i><h3>No Applications</h3><p>Applications will appear here when available.</p></div>'}
        </div>
    `;
}

async function loadFreelancersBrowse() {
    const response = await fetch(`${API_BASE}/accounts/freelancer-profiles/`);
    const freelancers = response.ok ? await response.json() : [];
    
    const content = document.getElementById('dashboard-content');
    content.innerHTML = `
        <div style="padding: 20px;">
            ${freelancers.length > 0 ? generateFreelancersGrid(freelancers) : '<div class="empty-state"><i class="fas fa-users"></i><h3>No Freelancers Found</h3><p>Check back later for available freelancers.</p></div>'}
        </div>
    `;
}

async function loadProfile() {
    const response = await fetch(`${API_BASE}/accounts/profile/`, { credentials: 'include' });
    const profileData = response.ok ? await response.json() : {};
    
    const content = document.getElementById('dashboard-content');
    content.innerHTML = generateProfileView(profileData);
}

async function loadMessages() {
    const content = document.getElementById('dashboard-content');
    content.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-comments"></i>
            <h3>Messages</h3>
            <p>Messaging functionality will be available soon.</p>
        </div>
    `;
}

// Helper functions for generating HTML
function generateJobsTable(jobs) {
    return `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Budget</th>
                    <th>Status</th>
                    <th>Applications</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${jobs.map(job => `
                    <tr>
                        <td><strong>${job.title}</strong></td>
                        <td>${job.job_type}</td>
                        <td>${job.job_type === 'fixed' ? `$${job.budget_min} - $${job.budget_max}` : `$${job.hourly_rate_min} - $${job.hourly_rate_max}/hr`}</td>
                        <td><span class="status-badge ${job.status.replace('_', '-')}">${job.status}</span></td>
                        <td>0</td>
                        <td>
                            <button class="action-btn primary" onclick="viewJob(${job.id})">View</button>
                            <button class="action-btn secondary" onclick="editJob(${job.id})">Edit</button>
                            <button class="action-btn danger" onclick="deleteJob(${job.id})">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function generateJobsGrid(jobs) {
    return `
        <div class="jobs-grid">
            ${jobs.map(job => createJobCard(job)).join('')}
        </div>
    `;
}

function generateApplicationsTable(applications) {
    return `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Job</th>
                    <th>${currentUser.user_type === 'freelancer' ? 'Company' : 'Freelancer'}</th>
                    <th>Applied</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${applications.map(app => `
                    <tr>
                        <td><strong>${app.job?.title || 'Job'}</strong></td>
                        <td>${currentUser.user_type === 'freelancer' ? (app.job?.recruiter || 'Company') : (app.freelancer?.first_name || app.freelancer?.username || 'Freelancer')}</td>
                        <td>${formatDate(app.applied_at)}</td>
                        <td><span class="status-badge ${app.status}">${app.status}</span></td>
                        <td>
                            <button class="action-btn primary" onclick="viewApplication(${app.id})">View</button>
                            ${currentUser.user_type === 'recruiter' && app.status === 'pending' ? `
                                <button class="action-btn success" onclick="updateApplicationStatus(${app.id}, 'accepted')">Accept</button>
                                <button class="action-btn danger" onclick="updateApplicationStatus(${app.id}, 'rejected')">Reject</button>
                            ` : ''}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function generateFreelancersGrid(freelancers) {
    return `
        <div class="freelancers-grid">
            ${freelancers.map(freelancer => createFreelancerCard(freelancer)).join('')}
        </div>
    `;
}

function generateProfileView(profileData) {
    const user = profileData.user || {};
    const profile = profileData.profile || {};
    
    return `
        <div class="profile-section">
            <div class="profile-header">
                <div class="profile-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="profile-info">
                    <h2>${user.first_name || ''} ${user.last_name || ''}</h2>
                    <p>@${user.username}</p>
                    <p>${user.email}</p>
                    <p>${user.user_type === 'freelancer' ? 'Freelancer' : 'Recruiter'}</p>
                </div>
            </div>
            
            <div class="profile-details">
                <div class="detail-group">
                    <h3>Personal Information</h3>
                    <div class="detail-item">
                        <span class="detail-label">Phone:</span>
                        <span class="detail-value">${user.phone || 'Not provided'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Location:</span>
                        <span class="detail-value">${user.location || 'Not provided'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Website:</span>
                        <span class="detail-value">${user.website || 'Not provided'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Bio:</span>
                        <span class="detail-value">${user.bio || 'Not provided'}</span>
                    </div>
                </div>
                
                ${user.user_type === 'freelancer' ? `
                    <div class="detail-group">
                        <h3>Professional Information</h3>
                        <div class="detail-item">
                            <span class="detail-label">Skills:</span>
                            <span class="detail-value">${profile.skills || 'Not provided'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Hourly Rate:</span>
                            <span class="detail-value">$${profile.hourly_rate || 'Not set'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Experience:</span>
                            <span class="detail-value">${profile.experience_years || 0} years</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Portfolio:</span>
                            <span class="detail-value">${profile.portfolio_url || 'Not provided'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Rating:</span>
                            <span class="detail-value">${profile.rating || 0}/5</span>
                        </div>
                    </div>
                ` : `
                    <div class="detail-group">
                        <h3>Company Information</h3>
                        <div class="detail-item">
                            <span class="detail-label">Company:</span>
                            <span class="detail-value">${profile.company_name || 'Not provided'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Industry:</span>
                            <span class="detail-value">${profile.industry || 'Not provided'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Company Size:</span>
                            <span class="detail-value">${profile.company_size || 'Not provided'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Verified:</span>
                            <span class="detail-value">${profile.verified ? 'Yes' : 'No'}</span>
                        </div>
                    </div>
                `}
            </div>
        </div>
    `;
}

// Form setup and handling
function setupDashboardForms() {
    // Job post form
    const jobForm = document.getElementById('job-post-form');
    if (jobForm) {
        jobForm.addEventListener('submit', handleJobPost);
        
        // Job type change handler
        const jobTypeSelect = document.getElementById('job-type');
        if (jobTypeSelect) {
            jobTypeSelect.addEventListener('change', function() {
                const budgetFields = document.getElementById('budget-fields');
                const hourlyFields = document.getElementById('hourly-fields');
                
                if (this.value === 'fixed') {
                    budgetFields.style.display = 'flex';
                    hourlyFields.style.display = 'none';
                } else if (this.value === 'hourly') {
                    budgetFields.style.display = 'none';
                    hourlyFields.style.display = 'flex';
                } else {
                    budgetFields.style.display = 'flex';
                    hourlyFields.style.display = 'none';
                }
            });
        }
    }
    
    // Profile edit form
    const profileForm = document.getElementById('profile-edit-form');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
        loadProfileDataIntoForm();
    }
}

async function loadCategoriesForJobForm() {
    try {
        const response = await fetch(`${API_BASE}/jobs/categories/`);
        if (response.ok) {
            const categories = await response.json();
            const categorySelect = document.getElementById('job-category');
            if (categorySelect) {
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    categorySelect.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

async function handleJobPost(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const jobData = {
        title: formData.get('title'),
        description: formData.get('description'),
        category_id: parseInt(formData.get('category_id')),
        job_type: formData.get('job_type'),
        experience_level: formData.get('experience_level'),
        skills_required: formData.get('skills_required'),
        deadline: formData.get('deadline') || null
    };
    
    if (jobData.job_type === 'fixed') {
        jobData.budget_min = parseFloat(formData.get('budget_min'));
        jobData.budget_max = parseFloat(formData.get('budget_max'));
    } else {
        jobData.hourly_rate_min = parseFloat(formData.get('hourly_rate_min'));
        jobData.hourly_rate_max = parseFloat(formData.get('hourly_rate_max'));
    }
    
    try {
        const response = await fetch(`${API_BASE}/jobs/jobs/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            credentials: 'include',
            body: JSON.stringify(jobData)
        });
        
        if (response.ok) {
            closeModal('job-post-modal');
            showSuccessMessage('Job posted successfully!');
            loadDashboardContent('jobs');
            event.target.reset();
        } else {
            const error = await response.json();
            showFormError('job-post-form', Object.values(error).flat().join(' '));
        }
    } catch (error) {
        console.error('Error posting job:', error);
        showFormError('job-post-form', 'Failed to post job. Please try again.');
    }
}

async function loadProfileDataIntoForm() {
    try {
        const response = await fetch(`${API_BASE}/accounts/profile/`, { credentials: 'include' });
        if (response.ok) {
            const data = await response.json();
            const user = data.user || {};
            const profile = data.profile || {};
            
            // Fill user fields
            document.getElementById('edit-first-name').value = user.first_name || '';
            document.getElementById('edit-last-name').value = user.last_name || '';
            document.getElementById('edit-email').value = user.email || '';
            document.getElementById('edit-phone').value = user.phone || '';
            document.getElementById('edit-bio').value = user.bio || '';
            document.getElementById('edit-location').value = user.location || '';
            document.getElementById('edit-website').value = user.website || '';
            
            // Show/hide specific fields based on user type
            if (user.user_type === 'freelancer') {
                document.getElementById('freelancer-fields').style.display = 'block';
                document.getElementById('recruiter-fields').style.display = 'none';
                
                document.getElementById('edit-skills').value = profile.skills || '';
                document.getElementById('edit-hourly-rate').value = profile.hourly_rate || '';
                document.getElementById('edit-experience').value = profile.experience_years || '';
                document.getElementById('edit-portfolio').value = profile.portfolio_url || '';
            } else {
                document.getElementById('freelancer-fields').style.display = 'none';
                document.getElementById('recruiter-fields').style.display = 'block';
                
                document.getElementById('edit-company').value = profile.company_name || '';
                document.getElementById('edit-company-size').value = profile.company_size || '';
                document.getElementById('edit-industry').value = profile.industry || '';
                document.getElementById('edit-company-desc').value = profile.company_description || '';
            }
        }
    } catch (error) {
        console.error('Error loading profile data:', error);
    }
}

async function handleProfileUpdate(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const userData = {
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        bio: formData.get('bio'),
        location: formData.get('location'),
        website: formData.get('website')
    };
    
    try {
        // Update user data
        const userResponse = await fetch(`${API_BASE}/accounts/users/me/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            credentials: 'include',
            body: JSON.stringify(userData)
        });
        
        if (userResponse.ok) {
            // Update profile data based on user type
            let profileData = {};
            let profileEndpoint = '';
            
            if (currentUser.user_type === 'freelancer') {
                profileData = {
                    skills: formData.get('skills'),
                    hourly_rate: formData.get('hourly_rate'),
                    experience_years: formData.get('experience_years'),
                    portfolio_url: formData.get('portfolio_url')
                };
                profileEndpoint = `${API_BASE}/accounts/freelancer-profiles/`;
            } else {
                profileData = {
                    company_name: formData.get('company_name'),
                    company_size: formData.get('company_size'),
                    industry: formData.get('industry'),
                    company_description: formData.get('company_description')
                };
                profileEndpoint = `${API_BASE}/accounts/recruiter-profiles/`;
            }
            
            closeModal('profile-edit-modal');
            showSuccessMessage('Profile updated successfully!');
            loadDashboardContent('profile');
        } else {
            const error = await userResponse.json();
            showFormError('profile-edit-form', Object.values(error).flat().join(' '));
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showFormError('profile-edit-form', 'Failed to update profile. Please try again.');
    }
}

// Action handlers
async function updateApplicationStatus(applicationId, status) {
    try {
        const response = await fetch(`${API_BASE}/applications/applications/${applicationId}/update_status/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            credentials: 'include',
            body: JSON.stringify({ status })
        });
        
        if (response.ok) {
            showSuccessMessage(`Application ${status}!`);
            loadDashboardContent('applications');
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to update application');
        }
    } catch (error) {
        console.error('Error updating application:', error);
        alert('Failed to update application');
    }
}

function viewJob(jobId) {
    // Implement job view functionality
    alert(`View job ${jobId} - Feature coming soon!`);
}

function editJob(jobId) {
    // Implement job edit functionality
    alert(`Edit job ${jobId} - Feature coming soon!`);
}

function deleteJob(jobId) {
    if (confirm('Are you sure you want to delete this job?')) {
        // Implement job delete functionality
        alert(`Delete job ${jobId} - Feature coming soon!`);
    }
}

function viewApplication(applicationId) {
    // Implement application view functionality
    alert(`View application ${applicationId} - Feature coming soon!`);
}
