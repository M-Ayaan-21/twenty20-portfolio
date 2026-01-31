// ---------------- AUTH CHECK ----------------
window.addEventListener('load', async () => {
    const token = localStorage.getItem('token');
    const storedUserName = localStorage.getItem('userName');
    const userNameEl = document.getElementById('userName');

    if (!token) {
        window.location.href = '/index.html';
        return;
    }

    try {
        const response = await fetch('/api/verify', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Token verification failed');
        }

        // Safely set username
        if (userNameEl && storedUserName) {
            userNameEl.textContent = storedUserName;
        }

    } catch (err) {
        console.error('Authentication error:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        window.location.href = '/index.html';
    }
});

// ---------------- LOGOUT ----------------
const logoutBtn = document.getElementById('logoutBtn');

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        window.location.href = '/index.html';
    });
}

// ---------------- SMOOTH SCROLL ----------------
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        const targetEl = document.querySelector(targetId);

        if (targetEl) {
            e.preventDefault();
            targetEl.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
