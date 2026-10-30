// Navbar Scroll Effect (Adds 'scrolled' class on scroll)
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// Interactive Mobile Navigation Drawer
const hamburgerMenu = document.getElementById('hamburger-menu');
const mobileDrawer = document.getElementById('mobile-drawer');
const drawerClose = document.getElementById('drawer-close');
const drawerOverlay = document.getElementById('drawer-overlay');
const mobileLinks = document.querySelectorAll('.mobile-nav-links a');

// Open Drawer
const openDrawer = () => {
    mobileDrawer.classList.add('active');
    hamburgerMenu.setAttribute('aria-expanded', 'true');
    drawerOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Lock background scroll
};

// Close Drawer
const closeDrawer = () => {
    mobileDrawer.classList.remove('active');
    hamburgerMenu.setAttribute('aria-expanded', 'false');
    drawerOverlay.classList.remove('active');
    document.body.style.overflow = ''; // Unlock background scroll
};

hamburgerMenu.addEventListener('click', openDrawer);
drawerClose.addEventListener('click', closeDrawer);
drawerOverlay.addEventListener('click', closeDrawer);

// Close drawer when any link inside is clicked
mobileLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
});

// Reveal Animations on Scroll
const reveals = document.querySelectorAll('.reveal');

const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    const revealPoint = 100;

    reveals.forEach(reveal => {
        const revealTop = reveal.getBoundingClientRect().top;
        if (revealTop < windowHeight - revealPoint) {
            reveal.classList.add('active');
        }
    });
};

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll); // Initial check on page load

// Scroll Spy: Automatically highlight active navigation link on scroll
const sections = document.querySelectorAll('section[id]');
const navLinkElements = document.querySelectorAll('.nav-links a');
const mobileNavLinkElements = document.querySelectorAll('.mobile-nav-links a');

const scrollSpy = () => {
    const current = [...sections].reverse().find(section => section.offsetTop <= window.scrollY + 150);
    [...navLinkElements, ...mobileNavLinkElements].forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${current?.id}`);
    });
};

window.addEventListener('scroll', scrollSpy);

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

// GitHub Pages has no mail backend: open a real draft instead of claiming delivery.
const contactForm = document.getElementById('portfolio-contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = document.getElementById('form-name').value.trim();
        const email = document.getElementById('form-email').value.trim();
        const subject = document.getElementById('form-subject').value.trim();
        const message = document.getElementById('form-message').value.trim();
        const body = `${message}\n\nالاسم: ${name}\nبريد التواصل: ${email}`;
        window.location.href = `mailto:aabadhr880@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        document.getElementById('contact-status').textContent = 'أكمل إرسال الرسالة من تطبيق البريد. إذا لم يفتح، راسلني مباشرة على aabadhr880@gmail.com';
    });
}
