// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// Reveal Animations on Scroll
const reveals = document.querySelectorAll('.reveal');

const revealOnScroll = () => {
    reveals.forEach(reveal => {
        const windowHeight = window.innerHeight;
        const revealTop = reveal.getBoundingClientRect().top;
        const revealPoint = 150;

        if (revealTop < windowHeight - revealPoint) {
            reveal.classList.add('active');
        }
    });
};

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll); // Initial check

// Mobile Nav Toggle (Simple logic for future expansion)
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
    // This could be improved with a full mobile menu overlay
    alert('يمكنك التنقل إلى الأقسام عبر الروابط المباشرة في الصفحة');
});

// Dynamic Glitch Text Effect (Optional Polish)
const glitchText = document.querySelector('.glitch-text');
if (glitchText) {
    setInterval(() => {
        glitchText.style.textShadow = Math.random() > 0.9 
            ? '2px 0 #ff007f, -2px 0 #00d2ff' 
            : 'none';
    }, 100);
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});
