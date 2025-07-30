document.addEventListener('DOMContentLoaded', function() {
    // Check if on jobs page
    if (window.location.href.includes('jobs.html')) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || currentUser.userType !== 'user') {
            window.location.href = 'login.html';
            return;
        }
        
        loadAvailableJobs();
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
        } else {
            window.location.href = 'jobs.html';
        }
        
        // Handle application submission
        document.getElementById('applicationForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const application = {
                id: Date.now().toString(),
                jobId: jobId,
                applicantId: currentUser.id,
                applicantName: document.getElementById('applicantName').value,
                applicantEmail: document.getElementById('applicantEmail').value,
                applicantPhone: document.getElementById('applicantPhone').value,
                applicantResume: document.getElementById('applicantResume').value,
                applicantCoverLetter: document.getElementById('applicantCoverLetter').value,
                appliedAt: new Date().toISOString()
            };
            
            const applications = JSON.parse(localStorage.getItem('applications'));
            applications.push(application);
            localStorage.setItem('applications', JSON.stringify(applications));
            
            document.getElementById('applicationMessage').textContent = 'Application submitted successfully!';
            document.getElementById('applicationForm').reset();
            
            setTimeout(() => {
                window.location.href = 'jobs.html';
            }, 1500);
        });
    }
});

function loadAvailableJobs() {
    const jobs = JSON.parse(localStorage.getItem('jobs'));
    const availableJobs = document.getElementById('availableJobs');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!availableJobs) return;
    
    availableJobs.innerHTML = '';
    
    if (jobs.length === 0) {
        availableJobs.innerHTML = '<p>No jobs available at the moment. Please check back later.</p>';
        return;
    }
    
    const currentDate = new Date();
    
    jobs.forEach(job => {
        const deadline = new Date(job.deadline);
        
        // Only show jobs that haven't passed their deadline
        if (deadline > currentDate) {
            const jobElement = document.createElement('div');
            jobElement.className = 'job';
            jobElement.innerHTML = `
                <h3>${job.title}</h3>
                <p><strong>Location:</strong> ${job.location}</p>
                <p><strong>Deadline:</strong> ${deadline.toLocaleDateString()}</p>
                <p>${job.description}</p>
                <details>
                    <summary>View Requirements</summary>
                    <p>${job.requirements}</p>
                </details>
                <button class="apply-job" data-job-id="${job.id}">Apply Now</button>
            `;
            availableJobs.appendChild(jobElement);
        }
    });
    
    // Add event listeners for apply buttons
    document.querySelectorAll('.apply-job').forEach(button => {
        button.addEventListener('click', function() {
            const jobId = this.getAttribute('data-job-id');
            localStorage.setItem('currentJob', jobId);
            window.location.href = 'apply.html';
        });
    });
}