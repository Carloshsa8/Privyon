// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        nav.style.padding = '1.5rem 0';
        nav.style.background = 'rgba(253, 252, 248, 0.95)';
        nav.style.boxShadow = '0 10px 30px rgba(0,0,0,0.02)';
    } else {
        nav.style.padding = '2.5rem 0';
        nav.style.background = 'transparent';
        nav.style.boxShadow = 'none';
    }
});

// Mobile Menu Toggle
function toggleMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.classList.toggle('open');
    if (menu.classList.contains('open')) {
        menu.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    } else {
        menu.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// Reveal on Scroll
const revealElements = document.querySelectorAll('.concept-text, .img-box, .mode-card, .gas-content, .contact-card');

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

// Initial state for reveal
revealElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(50px)';
    el.style.transition = 'all 1s cubic-bezier(0.16, 1, 0.3, 1)';
});

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);
