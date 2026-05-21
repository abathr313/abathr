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
    drawerOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Lock background scroll
};

// Close Drawer
const closeDrawer = () => {
    mobileDrawer.classList.remove('active');
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
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 140; // Offset for sticky navbar
        const sectionId = current.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            // Update desktop navigation links
            navLinkElements.forEach(a => {
                a.classList.remove('active');
                if (a.getAttribute('href') === `#${sectionId}`) {
                    a.classList.add('active');
                }
            });
            // Update mobile navigation links
            mobileNavLinkElements.forEach(a => {
                a.classList.remove('active');
                if (a.getAttribute('href') === `#${sectionId}`) {
                    a.classList.add('active');
                }
            });
        }
    });
};

window.addEventListener('scroll', scrollSpy);

// Premium Glitch Text Effect for Hero Title
const glitchText = document.querySelector('.glitch-text');
if (glitchText) {
    setInterval(() => {
        glitchText.style.textShadow = Math.random() > 0.9 
            ? '2px 0 rgba(212, 175, 55, 0.4), -2px 0 rgba(255, 255, 255, 0.2)' 
            : 'none';
    }, 150);
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

// Premium Contact Form Submission & Success Toast Notification
const contactForm = document.getElementById('portfolio-contact-form');
const toastBox = document.getElementById('toast-box');

if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Get Input Values (Simulating sending)
        const name = document.getElementById('form-name').value;
        const email = document.getElementById('form-email').value;
        const subject = document.getElementById('form-subject').value;
        const message = document.getElementById('form-message').value;

        // Custom Toast Notification HTML
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-check"></i>
            </div>
            <div class="toast-content">
                <h4>شكراً لك يا ${name}!</h4>
                <p>لقد تم إرسال رسالتك بنجاح. سأتواصل معك قريباً جداً.</p>
            </div>
        `;

        // Append to container
        toastBox.appendChild(toast);

        // Show with delay for CSS transition
        setTimeout(() => {
            toast.classList.add('show');
        }, 50);

        // Reset form
        contactForm.reset();

        // Auto remove toast after 5.5 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            // Remove from DOM after transition completes
            setTimeout(() => {
                toast.remove();
            }, 500);
        }, 5500);
    });
}
