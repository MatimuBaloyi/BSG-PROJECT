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
            loadJobs();
        });
        
        document.getElementById('postJobLink').addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('jobsSection').style.display = 'none';
            document.getElementById('postJobSection').style.display = 'block';
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
            <p><strong>Phone:</strong> ${app.applicantPhone}</p>
            <details>
                <summary>View Details</summary>
                <p><strong>Resume Summary:</strong> ${app.applicantResume}</p>
                <p><strong>Cover Letter:</strong> ${app.applicantCoverLetter}</p>
            </details>
            <button class="delete-application" data-app-id="${app.id}">Delete Application</button>
        `;
        applicationsList.appendChild(appElement);
    });
    
    // Add event listeners for delete application buttons
    document.querySelectorAll('.delete-application').forEach(button => {
        button.addEventListener('click', function() {
            const appId = this.getAttribute('data-app-id');
            const applications = JSON.parse(localStorage.getItem('applications'));
            const updatedApplications = applications.filter(app => app.id !== appId);
            localStorage.setItem('applications', JSON.stringify(updatedApplications));
            loadApplications();
        });
    });
}