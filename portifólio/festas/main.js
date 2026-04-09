// Navbar scroll effect
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        nav.style.padding = '1rem 0';
        nav.style.background = 'rgba(255, 255, 255, 0.98)';
        nav.style.borderBottomColor = 'var(--border)';
    } else {
        nav.style.padding = '1.5rem 0';
        nav.style.background = 'rgba(255, 255, 255, 0.9)';
        nav.style.borderBottomColor = 'transparent';
    }
});

// Mobile Menu Toggle
function toggleMenu() {
    const menu = document.getElementById('mobileMenu');
    const display = window.getComputedStyle(menu).display;
    
    if (display === 'none') {
        menu.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    } else {
        menu.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// Reveal animations on scroll
const revealElements = document.querySelectorAll('.feature-item, .split-content, .pricing-card');

const revealOnScroll = () => {
    const triggerBottom = window.innerHeight * 0.9;
    
    revealElements.forEach(el => {
        const top = el.getBoundingClientRect().top;
        if (top < triggerBottom) {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }
    });
};

// Initial styles for animations
revealElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
});

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);
