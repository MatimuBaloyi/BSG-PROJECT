// Initialize data in localStorage if not exists
if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([]));
}

if (!localStorage.getItem('jobs')) {
    localStorage.setItem('jobs', JSON.stringify([]));
}

if (!localStorage.getItem('applications')) {
    localStorage.setItem('applications', JSON.stringify([]));
}

// Admin credentials (in a real app, this would be server-side)
const ADMIN_CREDENTIALS = {
    email: "admin@Timu.com",
    password: "admin123"
};

// Check if user is logged in
function checkLogin() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user && !window.location.href.includes('index.html') && !window.location.href.includes('login.html') && !window.location.href.includes('register.html')) {
        window.location.href = 'login.html';
    }
}

// Login function
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('loginForm')) {
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const userType = document.getElementById('userType').value;
            
            if (userType === 'admin') {
                if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
                    localStorage.setItem('currentUser', JSON.stringify({ email, userType }));
                    window.location.href = 'admin.html';
                } else {
                    document.getElementById('loginMessage').textContent = 'Invalid admin credentials';
                }
            } else {
                const users = JSON.parse(localStorage.getItem('users'));
                const user = users.find(u => u.email === email && u.password === password);
                
                if (user) {
                    localStorage.setItem('currentUser', JSON.stringify({ ...user, userType }));
                    window.location.href = 'jobs.html';
                } else {
                    document.getElementById('loginMessage').textContent = 'Invalid email or password';
                }
            }
        });
    }
    
    // Registration function
    if (document.getElementById('registerForm')) {
        document.getElementById('registerForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('regName').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const password = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('regConfirmPassword').value;
            const resumeInput = document.getElementById('regResume');
            const registerMessage = document.getElementById('registerMessage');

            if (password !== confirmPassword) {
                registerMessage.textContent = "Passwords do not match.";
                registerMessage.style.color = "red";
                return;
            }

            let users = JSON.parse(localStorage.getItem('users')) || [];
            if (users.some(u => u.email === email)) {
                registerMessage.textContent = "Email already registered.";
                registerMessage.style.color = "red";
                return;
            }

            // Optionally handle resume file (not stored in localStorage)
            users.push({
                name,
                email,
                password,
                userType: "user"
            });
            localStorage.setItem('users', JSON.stringify(users));
            registerMessage.textContent = "Registration successful! You can now log in.";
            registerMessage.style.color = "green";
            this.reset();
        });
    }
    
    // Logout functionality
    const logoutLinks = document.querySelectorAll('#logoutLink, #userLogoutLink, #applyLogoutLink, #appLogoutLink');
    logoutLinks.forEach(link => {
        if (link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.removeItem('currentUser');
                window.location.href = 'index.html';
            });
        }
    });
    
    // Dashboard link
    if (document.getElementById('userDashboardLink')) {
        document.getElementById('userDashboardLink').addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'jobs.html';
        });
    }
    
    // Check login on protected pages
    checkLogin();
});