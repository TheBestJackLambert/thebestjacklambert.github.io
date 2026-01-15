/* ==========================================================================
   BLUEPRINT THEME - INTERACTION LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // 1. Initialize AOS (Animate On Scroll)
  AOS.init({
    duration: 800,
    easing: 'ease-out-cubic',
    once: true,
    offset: 50
  });

  // 2. Typed.js Initialization
  if (document.getElementById('typed')) {
    new Typed('#typed', {
      strings: [
        'HARDWARE ENGINEER',
        'ROBOTICS SPECIALIST',
        'CIRCUIT DESIGNER',
        'PROBLEM SOLVER'
      ],
      typeSpeed: 40,
      backSpeed: 30,
      backDelay: 2000,
      startDelay: 1000,
      loop: true,
      showCursor: true,
      cursorChar: '█'
    });
  }

  // 3. Custom Cursor Logic
  const cursor = document.querySelector('.cursor-follower');
  const links = document.querySelectorAll('a, button, .bento-card, .mission-entry');

  if (cursor) {
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });

    links.forEach(link => {
      link.addEventListener('mouseenter', () => {
        cursor.classList.add('active');
        cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
        cursor.style.borderColor = 'var(--text-main)';
        cursor.style.backgroundColor = 'rgba(255, 215, 0, 0.1)';
      });

      link.addEventListener('mouseleave', () => {
        cursor.classList.remove('active');
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        cursor.style.borderColor = 'var(--accent-color)';
        cursor.style.backgroundColor = 'transparent';
      });
    });
  }

  // 4. Mobile Navigation
  const burger = document.querySelector('.burger');
  const navLinks = document.querySelector('.nav-links');
  const navItems = document.querySelectorAll('.nav-links li');

  if (burger) {
    burger.addEventListener('click', () => {
      navLinks.classList.toggle('nav-active');

      // Animate Links
      navItems.forEach((link, index) => {
        if (link.style.animation) {
          link.style.animation = '';
        } else {
          link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
        }
      });

      // Burger Animation
      burger.classList.toggle('toggle');
    });
  }

  // Close mobile nav on click
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (navLinks.classList.contains('nav-active')) {
        navLinks.classList.remove('nav-active');
        burger.classList.remove('toggle');
        navItems.forEach(link => {
          link.style.animation = '';
        });
      }
    });
  });

  // 5. VanillaTilt for Cards
  if (typeof VanillaTilt !== 'undefined') {
    VanillaTilt.init(document.querySelectorAll(".bento-card, .specs-image-wrapper"), {
      max: 5,
      speed: 400,
      glare: true,
      "max-glare": 0.1,
      scale: 1.02
    });
  }

  // 6. Glitch Effect Trigger on Hover
  const glitchText = document.querySelector('.hero-title');
  if (glitchText) {
    glitchText.addEventListener('mouseover', () => {
      glitchText.classList.add('glitch-active');
    });
    glitchText.addEventListener('mouseout', () => {
      glitchText.classList.remove('glitch-active');
    });
  }

  // 7. Dynamic Year in Footer
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // 8. Contact Modal Logic
  const modal = document.getElementById('email-modal'); // If you kept the modal
  const contactBtn = document.getElementById('tutoring-btn'); // If button exists
  if (modal && contactBtn) {
    const closeBtn = modal.querySelector('.close-btn');
    contactBtn.addEventListener('click', () => modal.style.display = 'block');
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => {
      if (e.target == modal) modal.style.display = 'none';
    });
  }

});

/* ==========================================================================
   PREMIUM ENHANCEMENTS
   ========================================================================== */

// 9. Card Glow Effect - tracks mouse position
document.querySelectorAll('.bento-card, .card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mouse-x', x + '%');
    card.style.setProperty('--mouse-y', y + '%');
  });
});

// 10. Image Loading Observer - smooth fade-in when images load
const images = document.querySelectorAll('img');
images.forEach(img => {
  if (img.complete) {
    img.classList.add('loaded');
  } else {
    img.addEventListener('load', () => {
      img.classList.add('loaded');
    });
  }
});

// 11. Scroll Progress Bar
const scrollProgress = document.getElementById('scroll-progress');
if (scrollProgress) {
  window.addEventListener('scroll', () => {
    const totalHeight = document.body.scrollHeight - window.innerHeight;
    const progress = (window.scrollY / totalHeight) * 100;
    scrollProgress.style.width = `${progress}%`;
  });
}

// 12. Back to Top Button
const backToTop = document.querySelector('.back-to-top');
if (backToTop) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTop.classList.add('show');
    } else {
      backToTop.classList.remove('show');
    }
  });

  backToTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// 13. Parallax Effect on Hero
const hero = document.querySelector('#hero');
if (hero) {
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const heroContent = hero.querySelector('.hero-content');
    if (heroContent && scrolled < window.innerHeight) {
      heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
      heroContent.style.opacity = 1 - (scrolled / window.innerHeight) * 0.5;
    }
  });
}

// 14. Intersection Observer for section reveals
const revealSections = document.querySelectorAll('section');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
    }
  });
}, { threshold: 0.1 });

revealSections.forEach(section => revealObserver.observe(section));
