k// ============================================
// MAIN.JS - Authentication Page Logic
// ============================================

// -------- Tab Switching --------
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

if (loginTab && registerTab) {
    loginTab.addEventListener('click', () => {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        clearMessages();
    });

    registerTab.addEventListener('click', () => {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.style.display = 'block';
        loginForm.style.display = 'none';
        clearMessages();
    });
}

// -------- Helper Functions --------
function showMessage(elementId, message, type) {
    const messageEl = document.getElementById(elementId);
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';
}

function clearMessages() {
    document.querySelectorAll('.message').forEach(msg => {
        msg.style.display = 'none';
        msg.className = 'message';
    });
}

function setLoading(button, isLoading) {
    const span = button.querySelector('span');
    const loader = button.querySelector('.loader');
    
    if (isLoading) {
        button.disabled = true;
        span.style.opacity = '0.6';
        loader.style.display = 'inline-block';
    } else {
        button.disabled = false;
        span.style.opacity = '1';
        loader.style.display = 'none';
    }
}

// -------- Login Form --------
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = loginForm.querySelector('.btn-primary');
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        // Clear previous messages
        clearMessages();
        
        // Validation
        if (!email || !password) {
            showMessage('loginMessage', 'Please fill in all fields', 'error');
            return;
        }
        
        // Set loading state
        setLoading(submitBtn, true);
        
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // ✅ FIX: Correct path to user name
                localStorage.setItem('token', data.token);
                localStorage.setItem('userName', data.user.name);
                localStorage.setItem('userEmail', data.user.email);
                
                showMessage('loginMessage', 'Login successful! Redirecting...', 'success');
                
                // Redirect after short delay
                setTimeout(() => {
                    window.location.href = '/portfolio.html';
                }, 1000);
            } else {
                showMessage('loginMessage', data.message || 'Login failed', 'error');
                setLoading(submitBtn, false);
            }
        } catch (error) {
            console.error('Login error:', error);
            showMessage('loginMessage', 'Network error. Please check your connection.', 'error');
            setLoading(submitBtn, false);
        }
    });
}

// -------- Register Form --------
if (registerForm) {
    const passwordInput = document.getElementById('registerPassword');
    const confirmInput = document.getElementById('confirmPassword');
    
    // Real-time password match validation
    confirmInput?.addEventListener('input', () => {
        if (confirmInput.value && passwordInput.value !== confirmInput.value) {
            confirmInput.setCustomValidity('Passwords do not match');
        } else {
            confirmInput.setCustomValidity('');
        }
    });
    
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = registerForm.querySelector('.btn-primary');
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Clear previous messages
        clearMessages();
        
        // Validation
        if (!name || !email || !password || !confirmPassword) {
            showMessage('registerMessage', 'Please fill in all fields', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showMessage('registerMessage', 'Passwords do not match', 'error');
            return;
        }
        
        if (password.length < 6) {
            showMessage('registerMessage', 'Password must be at least 6 characters', 'error');
            return;
        }
        
        // Set loading state
        setLoading(submitBtn, true);
        
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showMessage('registerMessage', 'Registration successful! Please login.', 'success');
                
                // Switch to login tab after 2 seconds
                setTimeout(() => {
                    loginTab.click();
                    registerForm.reset();
                    
                    // Pre-fill login email
                    document.getElementById('loginEmail').value = email;
                    document.getElementById('loginPassword').focus();
                }, 2000);
            } else {
                showMessage('registerMessage', data.message || 'Registration failed', 'error');
                setLoading(submitBtn, false);
            }
        } catch (error) {
            console.error('Registration error:', error);
            showMessage('registerMessage', 'Network error. Please check your connection.', 'error');
            setLoading(submitBtn, false);
        }
    });
}

// -------- Auto-clear messages on input --------
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => {
        const form = input.closest('form');
        if (form) {
            const messageId = form.id === 'loginForm' ? 'loginMessage' : 'registerMessage';
            const messageEl = document.getElementById(messageId);
            if (messageEl && messageEl.classList.contains('error')) {
                messageEl.style.display = 'none';
            }
        }
    });
});

// -------- Prevent logged-in users from accessing login page --------
window.addEventListener('load', () => {
    const token = localStorage.getItem('token');
    if (token && window.location.pathname.includes('index.html')) {
        // Verify token is still valid before redirecting
        fetch('/api/verify', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => {
            if (res.ok) {
                window.location.href = '/portfolio.html';
            }
        })
        .catch(() => {
            // Invalid token, clear it
            localStorage.clear();
        });
    }
});
