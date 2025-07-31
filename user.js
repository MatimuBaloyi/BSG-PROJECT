document.addEventListener('DOMContentLoaded', function() {
    // Check if on jobs page
    if (window.location.href.includes('jobs.html')) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || currentUser.userType !== 'user') {
            window.location.href = 'login.html';
            return;
        }
        
        loadAvailableJobs();
        
        // Initialize search functionality
        document.getElementById('jobSearch').addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                const searchTerm = this.value;
                const locationFilter = document.getElementById('jobLocationFilter').value;
                const categoryFilter = document.getElementById('jobCategoryFilter').value;
                loadAvailableJobs(searchTerm, locationFilter, categoryFilter);
            }
        });
    }
    
    // Check if on apply page
    if (window.location.href.includes('apply.html')) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || currentUser.userType !== 'user') {
            window.location.href = 'login.html';
            return;
        }
        
        const jobId = localStorage.getItem('currentJob');
        const jobs = JSON.parse(localStorage.getItem('jobs'));
        const job = jobs.find(j => j.id === jobId);
        
        if (job) {
            document.getElementById('jobTitleHeading').textContent = job.title;
            
            // Pre-fill user details
            document.getElementById('applicantName').value = currentUser.name;
            document.getElementById('applicantEmail').value = currentUser.email;
            document.getElementById('applicantPhone').value = currentUser.phone || '';
        } else {
            window.location.href = 'jobs.html';
        }
        
        // Handle application submission
        document.getElementById('applicationForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const resumeFile = document.getElementById('applicantResumeFile').files[0];
            
            if (resumeFile) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    submitApplication(e.target.result);
                };
                reader.readAsDataURL(resumeFile);
            } else {
                submitApplication(null);
            }
            
            function submitApplication(resumeData) {
                const application = {
                    id: Date.now().toString(),
                    jobId: jobId,
                    applicantId: currentUser.id,
                    applicantName: document.getElementById('applicantName').value,
                    applicantEmail: document.getElementById('applicantEmail').value,
                    applicantPhone: document.getElementById('applicantPhone').value,
                    applicantResume: document.getElementById('applicantResume').value,
                    applicantCoverLetter: document.getElementById('applicantCoverLetter').value,
                    resumeFile: resumeData,
                    status: 'submitted',
                    appliedAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                
                const applications = JSON.parse(localStorage.getItem('applications')) || [];
                applications.push(application);
                localStorage.setItem('applications', JSON.stringify(applications));
                
                document.getElementById('applicationMessage').textContent = 'Application submitted successfully!';
                document.getElementById('applicationForm').reset();
                
                setTimeout(() => {
                    window.location.href = 'profile.html';
                }, 1500);
            }
        });
    }
    
    // Check if on profile page
    if (window.location.href.includes('profile.html')) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || currentUser.userType !== 'user') {
            window.location.href = 'login.html';
            return;
        }
        
        // Load profile data
        document.getElementById('profileName').value = currentUser.name;
        document.getElementById('profileEmail').value = currentUser.email;
        document.getElementById('profilePhone').value = currentUser.phone || '';
        
        if (currentUser.resume) {
            document.getElementById('currentResumeLink').innerHTML = 
                '<a href="' + currentUser.resume + '" download="resume.pdf">Download Current Resume</a>';
        }
        
        // Handle profile update
        document.getElementById('profileForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('profileName').value;
            const phone = document.getElementById('profilePhone').value;
            const resumeFile = document.getElementById('profileResume').files[0];
            
            const users = JSON.parse(localStorage.getItem('users'));
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            
            if (userIndex !== -1) {
                if (resumeFile) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        users[userIndex].resume = e.target.result;
                        completeProfileUpdate();
                    };
                    reader.readAsDataURL(resumeFile);
                } else {
                    completeProfileUpdate();
                }
            }
            
            function completeProfileUpdate() {
                users[userIndex].name = name;
                users[userIndex].phone = phone;
                
                localStorage.setItem('users', JSON.stringify(users));
                localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
                
                document.getElementById('profileMessage').textContent = 'Profile updated successfully!';
                if (users[userIndex].resume) {
                    document.getElementById('currentResumeLink').innerHTML = 
                        '<a href="' + users[userIndex].resume + '" download="resume.pdf">Download Current Resume</a>';
                }
            }
        });
        
        // Load saved jobs
        loadSavedJobs();
    }
    
    // Check if on applications status page
    if (window.location.href.includes('applications-status.html')) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || currentUser.userType !== 'user') {
            window.location.href = 'login.html';
            return;
        }
        
        loadApplicationStatus();
    }
});

function loadAvailableJobs(searchTerm = '', locationFilter = '', categoryFilter = '') {
    const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const availableJobs = document.getElementById('availableJobs');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!availableJobs) return;
    
    availableJobs.innerHTML = '';
    
    if (jobs.length === 0) {
        availableJobs.innerHTML = '<p>No jobs available at the moment. Please check back later.</p>';
        return;
    }
    
    // Populate location filter
    const locationFilterEl = document.getElementById('jobLocationFilter');
    if (locationFilterEl) {
        locationFilterEl.innerHTML = '<option value="">All Locations</option>';
        const locations = [...new Set(jobs.map(job => job.location))];
        locations.forEach(location => {
            const option = document.createElement('option');
            option.value = location;
            option.textContent = location;
            locationFilterEl.appendChild(option);
        });
        
        if (locationFilter) {
            locationFilterEl.value = locationFilter;
        }
    }
    
    const currentDate = new Date();
    
    const filteredJobs = jobs.filter(job => {
        const deadline = new Date(job.deadline);
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             job.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLocation = !locationFilter || job.location === locationFilter;
        const matchesCategory = !categoryFilter || (job.category && job.category === categoryFilter);
        
        return deadline > currentDate && matchesSearch && matchesLocation && matchesCategory;
    });
    
    if (filteredJobs.length === 0) {
        availableJobs.innerHTML = '<p>No jobs match your search criteria.</p>';
        return;
    }
    
    filteredJobs.forEach(job => {
        const jobElement = document.createElement('div');
        jobElement.className = 'job';
        jobElement.innerHTML = `
            <h3>${job.title}</h3>
            <p><strong>Location:</strong> ${job.location}</p>
            <p><strong>Category:</strong> ${job.category || 'General'}</p>
            <p><strong>Deadline:</strong> ${new Date(job.deadline).toLocaleDateString()}</p>
            <p>${job.description}</p>
            <details>
                <summary>View Requirements</summary>
                <p>${job.requirements}</p>
            </details>
            <button class="apply-job" data-job-id="${job.id}">Apply Now</button>
            <button class="save-job" data-job-id="${job.id}">
                ${currentUser.savedJobs && currentUser.savedJobs.includes(job.id) ? 'Saved' : 'Save Job'}
            </button>
        `;
        availableJobs.appendChild(jobElement);
    });
    
    // Add event listeners for apply buttons
    document.querySelectorAll('.apply-job').forEach(button => {
        button.addEventListener('click', function() {
            const jobId = this.getAttribute('data-job-id');
            localStorage.setItem('currentJob', jobId);
            window.location.href = 'apply.html';
        });
    });
    
    // Add event listeners for save buttons
    document.querySelectorAll('.save-job').forEach(button => {
        button.addEventListener('click', function() {
            const jobId = this.getAttribute('data-job-id');
            const users = JSON.parse(localStorage.getItem('users'));
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            
            if (userIndex !== -1) {
                if (!users[userIndex].savedJobs) {
                    users[userIndex].savedJobs = [];
                }
                
                const jobIndex = users[userIndex].savedJobs.indexOf(jobId);
                if (jobIndex === -1) {
                    users[userIndex].savedJobs.push(jobId);
                    this.textContent = 'Saved';
                } else {
                    users[userIndex].savedJobs.splice(jobIndex, 1);
                    this.textContent = 'Save Job';
                }
                
                localStorage.setItem('users', JSON.stringify(users));
                localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
            }
        });
    });
}

function loadSavedJobs() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const savedJobsList = document.getElementById('savedJobsList');
    
    if (!savedJobsList) return;
    
    savedJobsList.innerHTML = '';
    
    if (!currentUser.savedJobs || currentUser.savedJobs.length === 0) {
        savedJobsList.innerHTML = '<p>No saved jobs yet.</p>';
        return;
    }
    
    currentUser.savedJobs.forEach(jobId => {
        const job = jobs.find(j => j.id === jobId);
        if (job) {
            const jobElement = document.createElement('div');
            jobElement.className = 'job';
            jobElement.innerHTML = `
                <h3>${job.title}</h3>
                <p><strong>Location:</strong> ${job.location}</p>
                <p><strong>Deadline:</strong> ${new Date(job.deadline).toLocaleDateString()}</p>
                <button class="apply-job" data-job-id="${job.id}">Apply Now</button>
                <button class="unsave-job" data-job-id="${job.id}">Remove</button>
            `;
            savedJobsList.appendChild(jobElement);
        }
    });
    
    // Add event listeners for buttons
    document.querySelectorAll('.apply-job').forEach(button => {
        button.addEventListener('click', function() {
            const jobId = this.getAttribute('data-job-id');
            localStorage.setItem('currentJob', jobId);
            window.location.href = 'apply.html';
        });
    });
    
    document.querySelectorAll('.unsave-job').forEach(button => {
        button.addEventListener('click', function() {
            const jobId = this.getAttribute('data-job-id');
            const users = JSON.parse(localStorage.getItem('users'));
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            
            if (userIndex !== -1) {
                users[userIndex].savedJobs = users[userIndex].savedJobs.filter(id => id !== jobId);
                localStorage.setItem('users', JSON.stringify(users));
                localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
                loadSavedJobs();
            }
        });
    });
}

function loadApplicationStatus() {
    const applications = JSON.parse(localStorage.getItem('applications')) || [];
    const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const statusList = document.getElementById('applicationsStatusList');
    
    if (!statusList) return;
    
    statusList.innerHTML = '';
    
    const userApplications = applications.filter(app => app.applicantId === currentUser.id);
    
    if (userApplications.length === 0) {
        statusList.innerHTML = '<p>You have no applications yet.</p>';
        return;
    }
    
    userApplications.forEach(app => {
        const job = jobs.find(j => j.id === app.jobId);
        if (!job) return;
        
        const statusElement = document.createElement('div');
        statusElement.className = 'application';
        
        let statusClass = '';
        switch(app.status) {
            case 'submitted':
                statusClass = 'status-submitted';
                break;
            case 'under review':
                statusClass = 'status-review';
                break;
            case 'accepted':
                statusClass = 'status-accepted';
                break;
            case 'rejected':
                statusClass = 'status-rejected';
                break;
            default:
                statusClass = 'status-submitted';
        }
        
        statusElement.innerHTML = `
            <h3>${job.title}</h3>
            <p><strong>Applied on:</strong> ${new Date(app.appliedAt).toLocaleDateString()}</p>
            <p><strong>Status:</strong> <span class="status-badge ${statusClass}">${app.status}</span></p>
            ${app.updatedAt ? `<p><strong>Last updated:</strong> ${new Date(app.updatedAt).toLocaleDateString()}</p>` : ''}
            ${app.feedback ? `<p><strong>Feedback:</strong> ${app.feedback}</p>` : ''}
            ${app.interviewDate ? `<p><strong>Interview scheduled:</strong> ${new Date(app.interviewDate).toLocaleString()}</p>` : ''}
            <details>
                <summary>View Application Details</summary>
                <p><strong>Cover Letter:</strong> ${app.applicantCoverLetter}</p>
                ${app.resumeFile ? '<p><a href="' + app.resumeFile + '" download="resume.pdf">Download Resume</a></p>' : ''}
            </details>
        `;
        
        statusList.appendChild(statusElement);
    });
}