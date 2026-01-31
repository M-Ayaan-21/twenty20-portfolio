// ============================================
// PORTFOLIO.JS - Protected Page Logic
// ============================================

// -------- Authentication Check --------
window.addEventListener('load', async () => {
    const token = localStorage.getItem('token');
    const storedUserName = localStorage.getItem('userName');
    const userNameEl = document.getElementById('userName');

    // Redirect if no token
    if (!token) {
        console.warn('No token found. Redirecting to login...');
        window.location.href = '/index.html';
        return;
    }

    try {
        // Verify token with backend
        const response = await fetch('/api/verify', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Token verification failed');
        }

        const data = await response.json();
        console.log('✅ Authentication verified:', data);

        // Display user name
        if (userNameEl && storedUserName) {
            userNameEl.textContent = storedUserName;
            
            // Add fade-in animation
            setTimeout(() => {
                userNameEl.style.opacity = '1';
            }, 100);
        } else {
            console.warn('User name not found in localStorage');
            userNameEl.textContent = 'Developer';
        }

    } catch (error) {
        console.error('❌ Authentication error:', error);
        
        // Clear invalid tokens
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        
        // Show error and redirect
        alert('Session expired. Please login again.');
        window.location.href = '/index.html';
    }
});

// -------- Logout Functionality --------
const logoutBtn = document.getElementById('logoutBtn');

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        // Confirm logout
        const confirmLogout = confirm('Are you sure you want to logout?');
        
        if (confirmLogout) {
            // Clear all user data
            localStorage.removeItem('token');
            localStorage.removeItem('userName');
            localStorage.removeItem('userEmail');
            
            // Show logout message
            console.log('✅ User logged out successfully');
            
            // Redirect to login
            window.location.href = '/index.html';
        }
    });
}

// -------- Smooth Scroll for Anchor Links --------
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        
        // Skip if href is just "#"
        if (targetId === '#') return;
        
        const targetEl = document.querySelector(targetId);

        if (targetEl) {
            e.preventDefault();
            
            // Smooth scroll with offset for sticky navbar
            const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 0;
            const targetPosition = targetEl.offsetTop - navbarHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// -------- Add Scroll Animations --------
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards
document.querySelectorAll('.skill-card, .project-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// -------- Dynamic Year in Footer --------
const footer = document.querySelector('.footer p');
if (footer) {
    const currentYear = new Date().getFullYear();
    footer.innerHTML = `&copy; ${currentYear} Mohammed Ayaan - Twenty20 Portfolio Assessment. All Rights Reserved.`;
}

// -------- Console Easter Egg --------
console.log('%c🎯 Twenty20 Portfolio', 'font-size: 24px; font-weight: bold; color: #ff0000;');
console.log('%c✨ Built with HTML, CSS, JavaScript, Node.js, MongoDB', 'font-size: 14px; color: #b0b0b0;');
console.log('%c💼 Check out the code: https://github.com/M-Ayaan-21/twenty20-portfolio', 'font-size: 12px; color: #707070;');

// -------- Performance Monitoring --------
if (performance && performance.timing) {
    window.addEventListener('load', () => {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`⚡ Page loaded in ${loadTime}ms`);
    });
}
