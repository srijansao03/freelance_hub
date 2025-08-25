// Global variables
let currentUser = null;
let jobs = [];
let freelancers = [];
let categories = [];

// API Base URL
const API_BASE = '/api';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadCategories();
    loadJobs();
    loadFreelancers();
    setupEventListeners();
});

// Initialize application
function initializeApp() {
    // Check if user is logged in
    checkAuthStatus();
    
    // Setup navigation
    setupNavigation();
    
    // Setup form submissions
    setupForms();
}

// Check authentication status
async function checkAuthStatus() {
    try {
        const response = await fetch(`${API_BASE}/accounts/users/me/`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            currentUser = await response.json();
            updateUIForLoggedInUser();
        }
    } catch (error) {
        console.log('User not logged in');
    }
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
    const navAuth = document.querySelector('.nav-auth');
    if (currentUser && navAuth) {
        navAuth.innerHTML = `
            <div class="user-menu">
                <span>Welcome, ${currentUser.first_name || currentUser.username}!</span>
                <button class="btn-secondary" onclick="showDashboard()">Dashboard</button>
                <button class="btn-primary" onclick="logout()">Logout</button>
            </div>
        `;
    }
}

// Navigation setup
function setupNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Setup form submissions
function setupForms() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Register form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Apply form
    const applyForm = document.getElementById('apply-form');
    if (applyForm) {
        applyForm.addEventListener('submit', handleJobApplication);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('job-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(searchJobs, 300));
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
    
    // Escape key to close modals
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeAllModals();
        }
    });
}

// Load categories
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE}/jobs/categories/`);
        if (response.ok) {
            categories = await response.json();
            populateCategoryFilter();
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Populate category filter
function populateCategoryFilter() {
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter && categories.length > 0) {
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categoryFilter.appendChild(option);
        });
    }
}

// Load jobs
async function loadJobs() {
    try {
        showLoading('jobs-container');
        const response = await fetch(`${API_BASE}/jobs/jobs/`);
        if (response.ok) {
            jobs = await response.json();
            displayJobs(jobs);
        } else {
            showError('jobs-container', 'Failed to load jobs');
        }
    } catch (error) {
        console.error('Error loading jobs:', error);
        showError('jobs-container', 'Failed to load jobs');
    }
}

// Display jobs
function displayJobs(jobsToDisplay) {
    const container = document.getElementById('jobs-container');
    if (!container) return;
    
    if (jobsToDisplay.length === 0) {
        container.innerHTML = '<div class="loading">No jobs found</div>';
        return;
    }
    
    container.innerHTML = jobsToDisplay.map(job => createJobCard(job)).join('');
}

// Create job card HTML
function createJobCard(job) {
    const skills = job.skills_required ? job.skills_required.split(',').slice(0, 5) : [];
    const budget = job.job_type === 'fixed' 
        ? `$${job.budget_min} - $${job.budget_max}` 
        : `$${job.hourly_rate_min} - $${job.hourly_rate_max}/hr`;
    
    return `
        <div class="job-card">
            <div class="job-header">
                <h3 class="job-title">${job.title}</h3>
                <div class="job-meta">
                    <span><i class="fas fa-building"></i> ${job.recruiter || 'Company'}</span>
                    <span><i class="fas fa-map-marker-alt"></i> Remote</span>
                    <span><i class="fas fa-clock"></i> ${job.job_type}</span>
                </div>
            </div>
            <p class="job-description">${job.description}</p>
            <div class="job-budget">${budget}</div>
            <div class="job-skills">
                ${skills.map(skill => `<span class="skill-tag">${skill.trim()}</span>`).join('')}
            </div>
            <div class="job-footer">
                <span class="job-date">${formatDate(job.created_at)}</span>
                <button class="btn-primary" onclick="applyToJob(${job.id})">
                    ${currentUser && currentUser.user_type === 'freelancer' ? 'Apply Now' : 'View Details'}
                </button>
            </div>
        </div>
    `;
}

// Load freelancers
async function loadFreelancers() {
    const container = document.getElementById('freelancers-container');
    
    if (!container) {
        console.error('Freelancers container not found');
        return;
    }
    
    // Show loading state
    container.innerHTML = '<div class="loading">Loading top freelancers...</div>';
    
    try {
        const response = await fetch('/api/accounts/freelancer-profiles/');
        
        if (!response.ok) {
            throw new Error(`Failed to fetch freelancers: ${response.status}`);
        }
        
        const freelancers = await response.json();
        console.log(`Loaded ${freelancers.length} freelancers`);
        
        if (freelancers.length === 0) {
            container.innerHTML = '<div class="loading">No freelancers available at the moment.</div>';
            return;
        }
        
        // Display up to 6 freelancers
        const freelancersToShow = freelancers.slice(0, 6);
        const cardsHTML = freelancersToShow.map(freelancer => {
            const name = `${freelancer.user?.first_name || ''} ${freelancer.user?.last_name || ''}`.trim() || 'Freelancer';
            const skills = freelancer.skills ? freelancer.skills.split(',').map(s => s.trim()).slice(0, 3) : [];
            const primarySkill = skills[0] || 'Professional';
            const rate = freelancer.hourly_rate || 'N/A';
            const rating = parseFloat(freelancer.rating) || 0;
            const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
            
            return `
                <div class="freelancer-card">
                    <div class="freelancer-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <h3 class="freelancer-name">${name}</h3>
                    <p class="freelancer-title">${primarySkill}</p>
                    <div class="freelancer-rating">
                        <span class="stars">${stars}</span>
                        <span>(${rating.toFixed(1)})</span>
                    </div>
                    <div class="freelancer-skills">
                        ${skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                    </div>
                    <div class="freelancer-rate">$${rate}/hr</div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = cardsHTML;
        
    } catch (error) {
        console.error('Error loading freelancers:', error);
        container.innerHTML = `<div class="loading">Unable to load freelancers. Please try again later.</div>`;
    }
}

// Search jobs
async function searchJobs() {
    const query = document.getElementById('job-search')?.value || '';
    const category = document.getElementById('category-filter')?.value || '';
    const jobType = document.getElementById('job-type-filter')?.value || '';
    const experience = document.getElementById('experience-filter')?.value || '';
    
    try {
        showLoading('jobs-container');
        
        const params = new URLSearchParams();
        if (query) params.append('q', query);
        if (category) params.append('category', category);
        if (jobType) params.append('job_type', jobType);
        if (experience) params.append('experience_level', experience);
        
        const response = await fetch(`${API_BASE}/jobs/search/?${params.toString()}`);
        if (response.ok) {
            const searchResults = await response.json();
            displayJobs(searchResults);
        } else {
            showError('jobs-container', 'Search failed');
        }
    } catch (error) {
        console.error('Error searching jobs:', error);
        showError('jobs-container', 'Search failed');
    }
}

// Handle login
async function handleLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const loginData = {
        username: formData.get('username'),
        password: formData.get('password')
    };
    
    try {
        const response = await fetch(`${API_BASE}/accounts/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            credentials: 'include',
            body: JSON.stringify(loginData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            currentUser = result.user;
            closeModal('login-modal');
            updateUIForLoggedInUser();
            showSuccessMessage('Login successful!');
        } else {
            showFormError('login-form', result.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showFormError('login-form', 'Login failed. Please try again.');
    }
}

// Handle registration
async function handleRegister(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const registerData = {
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
        password_confirm: formData.get('password_confirm'),
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
        user_type: formData.get('user_type')
    };
    
    try {
        const response = await fetch(`${API_BASE}/accounts/register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            credentials: 'include',
            body: JSON.stringify(registerData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            closeModal('register-modal');
            showSuccessMessage('Registration successful! Please log in.');
            setTimeout(() => showLoginModal(), 1000);
        } else {
            const errorMessage = Object.values(result).flat().join(' ');
            showFormError('register-form', errorMessage);
        }
    } catch (error) {
        console.error('Registration error:', error);
        showFormError('register-form', 'Registration failed. Please try again.');
    }
}

// Handle job application
async function handleJobApplication(event) {
    event.preventDefault();
    
    if (!currentUser || currentUser.user_type !== 'freelancer') {
        showLoginModal();
        return;
    }
    
    const formData = new FormData(event.target);
    const applicationData = {
        job_id: parseInt(formData.get('job_id')),
        cover_letter: formData.get('cover_letter'),
        proposed_rate: formData.get('proposed_rate'),
        estimated_duration: formData.get('estimated_duration')
    };
    
    try {
        const response = await fetch(`${API_BASE}/applications/applications/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            credentials: 'include',
            body: JSON.stringify(applicationData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            closeModal('apply-modal');
            showSuccessMessage('Application submitted successfully!');
        } else {
            const errorMessage = Object.values(result).flat().join(' ');
            showFormError('apply-form', errorMessage);
        }
    } catch (error) {
        console.error('Application error:', error);
        showFormError('apply-form', 'Application failed. Please try again.');
    }
}

// Apply to job
function applyToJob(jobId) {
    if (!currentUser) {
        showLoginModal();
        return;
    }
    
    if (currentUser.user_type !== 'freelancer') {
        alert('Only freelancers can apply to jobs.');
        return;
    }
    
    document.getElementById('apply-job-id').value = jobId;
    showModal('apply-modal');
}

// Logout
async function logout() {
    try {
        await fetch(`${API_BASE}/accounts/logout/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            credentials: 'include'
        });
        
        currentUser = null;
        location.reload();
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Modal functions
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

function showLoginModal() {
    showModal('login-modal');
}

function showRegisterModal(userType = '') {
    if (userType) {
        const radio = document.querySelector(`input[name="user_type"][value="${userType}"]`);
        if (radio) radio.checked = true;
    }
    showModal('register-modal');
}

function switchModal(fromModal, toModal) {
    closeModal(fromModal);
    showModal(toModal);
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = '<div class="loading">Loading...</div>';
    }
}

function showError(containerId, message) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `<div class="loading">${message}</div>`;
    }
}

function showSuccessMessage(message) {
    // Create and show success notification
    const notification = document.createElement('div');
    notification.className = 'success-message';
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '10001';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function showFormError(formId, message) {
    const form = document.getElementById(formId);
    if (form) {
        // Remove existing error messages
        const existingError = form.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Add new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        form.insertBefore(errorDiv, form.firstChild);
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function showDashboard() {
    window.location.href = '/dashboard/';
}
