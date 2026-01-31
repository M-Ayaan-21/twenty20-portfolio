// Get elements safely
const loginToggle = document.getElementById('loginToggle');
const registerToggle = document.getElementById('registerToggle');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginMessage = document.getElementById('loginMessage');
const registerMessage = document.getElementById('registerMessage');

// Guard: stop if page elements are missing
if (!loginToggle || !registerToggle || !loginForm || !registerForm) {
    console.warn('Auth elements not found on this page');
    return;
}

// Toggle between Login and Register forms
loginToggle.addEventListener('click', () => {
    loginToggle.classList.add('active');
    registerToggle.classList.remove('active');
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    clearMessages();
});

registerToggle.addEventListener('click', () => {
    registerToggle.classList.add('active');
    loginToggle.classList.remove('active');
    registerForm.style.display = 'block';
    loginForm.style.display = 'none';
    clearMessages();
});

// Clear messages
function clearMessages() {
    if (loginMessage) loginMessage.className = 'message';
    if (registerMessage) registerMessage.className = 'message';
}

// Show message
function showMessage(element, message, type) {
    if (!element) return;
    element.textContent = message;
    element.className = `message ${type}`;
}

// Loading state
function setLoading(button, isLoading) {
    if (!button) return;
    const span = button.querySelector('span');
    const loader = button.querySelector('.loader');

    button.disabled = isLoading;
    if (span) span.style.opacity = isLoading ? '0.6' : '1';
    if (loader) loader.style.display = isLoading ? 'inline-block' : 'none';
}

// ---------------- REGISTER ----------------
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('registerName')?.value.trim();
    const email = document.getElementById('registerEmail')?.value.trim();
    const password = document.getElementById('registerPassword')?.value;
    const confirmPassword = document.getElementById('registerConfirmPassword')?.value;

    if (!name || !email || !password || !confirmPassword) {
        showMessage(registerMessage, 'All fields are required', 'error');
        return;
    }

    if (password.length < 6) {
        showMessage(registerMessage, 'Password must be at least 6 characters', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showMessage(registerMessage, 'Passwords do not match', 'error');
        return;
    }

    const submitBtn = registerForm.querySelector('.btn-primary');
    setLoading(submitBtn, true);

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok) {
            showMessage(registerMessage, 'Account created successfully. Please login.', 'success');
            registerForm.reset();
            setTimeout(() => loginToggle.click(), 1500);
        } else {
            showMessage(registerMessage, data.message || 'Registration failed', 'error');
        }
    } catch (err) {
        console.error('Register error:', err);
        showMessage(registerMessage, 'Network error. Try again.', 'error');
    } finally {
        setLoading(submitBtn, false);
    }
});

// ---------------- LOGIN ----------------
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail')?.value.trim();
    const password = document.getElementById('loginPassword')?.value;

    if (!email || !password) {
        showMessage(loginMessage, 'All fields are required', 'error');
        return;
    }

    const submitBtn = loginForm.querySelector('.btn-primary');
    setLoading(submitBtn, true);

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok && data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userName', data.user?.name || 'Developer');
            showMessage(loginMessage, 'Login successful! Redirecting...', 'success');

            setTimeout(() => {
                window.location.href = '/portfolio.html';
            }, 800);
        } else {
            showMessage(loginMessage, data.message || 'Invalid credentials', 'error');
        }
    } catch (err) {
        console.error('Login error:', err);
        showMessage(loginMessage, 'Network error. Try again.', 'error');
    } finally {
        setLoading(submitBtn, false);
    }
});

// ---------------- AUTO LOGIN CHECK ----------------
window.addEventListener('load', async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch('/api/verify', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
            window.location.href = '/portfolio.html';
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('userName');
        }
    } catch (err) {
        console.error('Verify error:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
    }
});
