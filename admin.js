document.addEventListener('DOMContentLoaded', function() {
    // Check if on admin page
    if (window.location.href.includes('admin.html')) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || currentUser.userType !== 'admin') {
            window.location.href = 'login.html';
            return;
        }
        
        // Toggle between view jobs and post job sections
        document.getElementById('viewJobsLink').addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('jobsSection').style.display = 'block';
            document.getElementById('postJobSection').style.display = 'none';
            document.getElementById('notificationsSection').style.display = 'none';
            loadJobs();
        });
        
        document.getElementById('postJobLink').addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('jobsSection').style.display = 'none';
            document.getElementById('postJobSection').style.display = 'block';
            document.getElementById('notificationsSection').style.display = 'none';
        });
        
        // Post new job
        document.getElementById('postJobForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const job = {
                id: Date.now().toString(),
                title: document.getElementById('jobTitle').value,
                description: document.getElementById('jobDescription').value,
                requirements: document.getElementById('jobRequirements').value,
                location: document.getElementById('jobLocation').value,
                deadline: document.getElementById('jobDeadline').value,
                postedBy: currentUser.email,
                postedAt: new Date().toISOString()
            };
            
            const jobs = JSON.parse(localStorage.getItem('jobs'));
            jobs.push(job);
            localStorage.setItem('jobs', JSON.stringify(jobs));
            
            document.getElementById('postJobMessage').textContent = 'Job posted successfully!';
            document.getElementById('postJobForm').reset();
            loadNotifications(); // Update notifications after posting new job
        });
        
        // Load jobs initially
        loadJobs();
    }
    
    // Check if on applications page
    if (window.location.href.includes('applications.html')) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || currentUser.userType !== 'admin') {
            window.location.href = 'login.html';
            return;
        }
        
        loadApplications();
    }

    // Notification toggle
    if (document.getElementById('notificationsLink')) {
        document.getElementById('notificationsLink').addEventListener('click', function(e) {
            e.preventDefault();
            const notificationsSection = document.getElementById('notificationsSection');
            if (notificationsSection.style.display === 'none') {
                notificationsSection.style.display = 'block';
                document.getElementById('jobsSection').style.display = 'none';
                document.getElementById('postJobSection').style.display = 'none';
                document.getElementById('notificationBadge').textContent = '0';
            } else {
                notificationsSection.style.display = 'none';
            }
        });
    }

    // Load notifications initially
    loadNotifications();
});

function loadJobs() {
    const jobs = JSON.parse(localStorage.getItem('jobs'));
    const jobsList = document.getElementById('jobsList');
    
    if (!jobsList) return;
    
    jobsList.innerHTML = '';
    
    if (jobs.length === 0) {
        jobsList.innerHTML = '<p>No jobs posted yet.</p>';
        return;
    }
    
    jobs.forEach(job => {
        const jobElement = document.createElement('div');
        jobElement.className = 'job';
        jobElement.innerHTML = `
            <h3>${job.title}</h3>
            <p><strong>Location:</strong> ${job.location}</p>
            <p><strong>Deadline:</strong> ${new Date(job.deadline).toLocaleDateString()}</p>
            <p><strong>Posted on:</strong> ${new Date(job.postedAt).toLocaleDateString()}</p>
            <button class="view-applications" data-job-id="${job.id}">View Applications</button>
            <button class="delete-job" data-job-id="${job.id}">Delete Job</button>
        `;
        jobsList.appendChild(jobElement);
    });
    
    // Add event listeners for view applications buttons
    document.querySelectorAll('.view-applications').forEach(button => {
        button.addEventListener('click', function() {
            const jobId = this.getAttribute('data-job-id');
            localStorage.setItem('currentJob', jobId);
            window.location.href = 'applications.html';
        });
    });
    
    // Add event listeners for delete job buttons
    document.querySelectorAll('.delete-job').forEach(button => {
        button.addEventListener('click', function() {
            const jobId = this.getAttribute('data-job-id');
            const jobs = JSON.parse(localStorage.getItem('jobs'));
            const updatedJobs = jobs.filter(job => job.id !== jobId);
            localStorage.setItem('jobs', JSON.stringify(updatedJobs));
            
            // Also remove applications for this job
            const applications = JSON.parse(localStorage.getItem('applications'));
            const updatedApplications = applications.filter(app => app.jobId !== jobId);
            localStorage.setItem('applications', JSON.stringify(updatedApplications));
            
            loadJobs();
            loadNotifications(); // Update notifications after deleting job
        });
    });
}

function loadApplications() {
    const applications = JSON.parse(localStorage.getItem('applications'));
    const applicationsList = document.getElementById('applicationsList');
    const currentJob = localStorage.getItem('currentJob');
    
    if (!applicationsList) return;
    
    applicationsList.innerHTML = '';
    
    let filteredApplications = applications;
    if (currentJob) {
        filteredApplications = applications.filter(app => app.jobId === currentJob);
    }
    
    if (filteredApplications.length === 0) {
        applicationsList.innerHTML = '<p>No applications found.</p>';
        return;
    }
    
    const jobs = JSON.parse(localStorage.getItem('jobs'));
    
    filteredApplications.forEach(app => {
        const job = jobs.find(j => j.id === app.jobId);
        const appElement = document.createElement('div');
        appElement.className = 'application';
        appElement.innerHTML = `
            <h3>Application for: ${job ? job.title : 'Unknown Job'}</h3>
            <p><strong>Applicant:</strong> ${app.applicantName}</p>
            <p><strong>Email:</strong> ${app.applicantEmail}</p>
            <p><strong>Status:</strong>
                <select class="status-select" data-app-id="${app.id}">
                    <option value="submitted" ${app.status === 'submitted' ? 'selected' : ''}>Submitted</option>
                    <option value="under review" ${app.status === 'under review' ? 'selected' : ''}>Under Review</option>
                    <option value="accepted" ${app.status === 'accepted' ? 'selected' : ''}>Accepted</option>
                    <option value="rejected" ${app.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                </select>
            </p>
            <div class="interview-schedule" style="${app.status === 'accepted' ? '' : 'display: none;'}">
                <label>Interview Date:</label>
                <input type="datetime-local" class="interview-date" data-app-id="${app.id}" 
                       value="${app.interviewDate ? app.interviewDate.slice(0, 16) : ''}">
                <button class="schedule-interview" data-app-id="${app.id}">Schedule</button>
            </div>
            <div class="feedback" style="${app.status === 'rejected' ? '' : 'display: none;'}">
                <label>Feedback:</label>
                <textarea class="feedback-text" data-app-id="${app.id}">${app.feedback || ''}</textarea>
                <button class="save-feedback" data-app-id="${app.id}">Save Feedback</button>
            </div>
            <details>
                <summary>View Details</summary>
                <p><strong>Resume Summary:</strong> ${app.applicantResume}</p>
                <p><strong>Cover Letter:</strong> ${app.applicantCoverLetter}</p>
                ${app.resumeFile ? '<p><a href="' + app.resumeFile + '" download="resume.pdf">Download Resume</a></p>' : ''}
            </details>
            <button class="delete-application" data-app-id="${app.id}">Delete Application</button>
        `;
        applicationsList.appendChild(appElement);
    });
    
    // Add event listeners for status changes
    document.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', function() {
            const appId = this.getAttribute('data-app-id');
            const newStatus = this.value;
            const applications = JSON.parse(localStorage.getItem('applications'));
            const appIndex = applications.findIndex(app => app.id === appId);
            
            if (appIndex !== -1) {
                applications[appIndex].status = newStatus;
                applications[appIndex].updatedAt = new Date().toISOString();
                localStorage.setItem('applications', JSON.stringify(applications));
                
                // Show/hide interview schedule based on status
                const appElement = this.closest('.application');
                const interviewDiv = appElement.querySelector('.interview-schedule');
                const feedbackDiv = appElement.querySelector('.feedback');
                
                if (newStatus === 'accepted') {
                    interviewDiv.style.display = 'block';
                    feedbackDiv.style.display = 'none';
                } else if (newStatus === 'rejected') {
                    interviewDiv.style.display = 'none';
                    feedbackDiv.style.display = 'block';
                } else {
                    interviewDiv.style.display = 'none';
                    feedbackDiv.style.display = 'none';
                }
            }
        });
    });
    
    // Add event listeners for interview scheduling
    document.querySelectorAll('.schedule-interview').forEach(button => {
        button.addEventListener('click', function() {
            const appId = this.getAttribute('data-app-id');
            const dateInput = document.querySelector(`.interview-date[data-app-id="${appId}"]`);
            const interviewDate = dateInput.value;
            
            if (!interviewDate) {
                alert('Please select an interview date');
                return;
            }
            
            const applications = JSON.parse(localStorage.getItem('applications'));
            const appIndex = applications.findIndex(app => app.id === appId);
            
            if (appIndex !== -1) {
                applications[appIndex].interviewDate = new Date(interviewDate).toISOString();
                localStorage.setItem('applications', JSON.stringify(applications));
                alert('Interview scheduled successfully!');
            }
        });
    });
    
    // Add event listeners for feedback
    document.querySelectorAll('.save-feedback').forEach(button => {
        button.addEventListener('click', function() {
            const appId = this.getAttribute('data-app-id');
            const feedbackText = document.querySelector(`.feedback-text[data-app-id="${appId}"]`).value;
            
            const applications = JSON.parse(localStorage.getItem('applications'));
            const appIndex = applications.findIndex(app => app.id === appId);
            
            if (appIndex !== -1) {
                applications[appIndex].feedback = feedbackText;
                localStorage.setItem('applications', JSON.stringify(applications));
                alert('Feedback saved successfully!');
            }
        });
    });
    
    // Add event listeners for delete application buttons
    document.querySelectorAll('.delete-application').forEach(button => {
        button.addEventListener('click', function() {
            const appId = this.getAttribute('data-app-id');
            const applications = JSON.parse(localStorage.getItem('applications'));
            const updatedApplications = applications.filter(app => app.id !== appId);
            localStorage.setItem('applications', JSON.stringify(updatedApplications));
            loadApplications();
            loadNotifications(); // Update notifications after deleting application
        });
    });
}

function loadNotifications() {
    const applications = JSON.parse(localStorage.getItem('applications'));
    const jobs = JSON.parse(localStorage.getItem('jobs'));
    const currentDate = new Date();
    
    // New applications (last 7 days)
    const newApplications = applications.filter(app => {
        const appDate = new Date(app.appliedAt);
        return (currentDate - appDate) <= (7 * 24 * 60 * 60 * 1000);
    });
    
    // Expiring jobs (within 3 days)
    const expiringJobs = jobs.filter(job => {
        const deadline = new Date(job.deadline);
        return (deadline - currentDate) > 0 && (deadline - currentDate) <= (3 * 24 * 60 * 60 * 1000);
    });
    
    // Update badge
    const notificationBadge = document.getElementById('notificationBadge');
    if (notificationBadge) {
        notificationBadge.textContent = newApplications.length + expiringJobs.length;
    }
    
    // Load notifications list
    const notificationsList = document.getElementById('notificationsList');
    if (notificationsList) {
        notificationsList.innerHTML = '';
        
        if (newApplications.length === 0 && expiringJobs.length === 0) {
            notificationsList.innerHTML = '<p>No new notifications.</p>';
            return;
        }
        
        if (newApplications.length > 0) {
            const notificationElement = document.createElement('div');
            notificationElement.className = 'notification new-applications';
            notificationElement.innerHTML = `
                <h3>New Applications (${newApplications.length})</h3>
                <p>You have ${newApplications.length} new application(s) to review.</p>
                <a href="applications.html" class="view-link">View Applications</a>
            `;
            notificationsList.appendChild(notificationElement);
        }
        
        if (expiringJobs.length > 0) {
            const notificationElement = document.createElement('div');
            notificationElement.className = 'notification expiring-jobs';
            notificationElement.innerHTML = `
                <h3>Expiring Jobs (${expiringJobs.length})</h3>
                <p>The following jobs are closing soon:</p>
                <ul>
                    ${expiringJobs.map(job => `
                        <li>${job.title} (closes ${new Date(job.deadline).toLocaleDateString()})</li>
                    `).join('')}
                </ul>
            `;
            notificationsList.appendChild(notificationElement);
        }
    }
}