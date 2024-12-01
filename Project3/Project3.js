// Project3.js

document.addEventListener('DOMContentLoaded', () => {
  // Initialize AOS (Animate On Scroll)
  AOS.init({
    duration: 1000,
    once: true,
  });

  // Initialize Typed.js for typing animation
  const typed = new Typed('#typed-text', {
    strings: ['On Board FFT', 'GPS Detecting', 'Wi-Fi Detecting'],
    typeSpeed: 100,
    backSpeed: 50,
    loop: true,
    showCursor: false, // Disable default Typed.js cursor
  });

  // Initialize Particles.js for background particles
  particlesJS('particles-js', {
    particles: {
      number: { value: 80, density: { enable: true, value_area: 800 } },
      color: { value: '#ffd700' }, // Gold color
      shape: { type: 'circle' },
      opacity: { value: 0.5 },
      size: { value: 3, random: true },
      line_linked: { enable: true, distance: 150, color: '#ffd700', opacity: 0.4, width: 1 },
      move: { enable: true, speed: 6, direction: 'none', random: false, straight: false, out_mode: 'out', bounce: false },
    },
    interactivity: {
      detect_on: 'canvas',
      events: { 
        onhover: { enable: true, mode: 'repulse' }, 
        onclick: { enable: true, mode: 'push' } 
      },
      modes: {
        repulse: { distance: 100 },
        push: { particles_nb: 4 },
      },
    },
    retina_detect: true,
  });

  console.log('Particles.js initialized successfully.');

  // Custom Cursor Movement
  const cursor = document.querySelector('.cursor');

  if (cursor) {
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    });

    // Add animations to the cursor on hover over interactive elements
    document.querySelectorAll('a, button, model-viewer').forEach(el => { // Added 'model-viewer' for interactivity
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('cursor--active');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('cursor--active');
      });
    });
  } else {
    console.error('Cursor element not found.');
  }

  // Back to Top Button Functionality
  const backToTop = document.querySelector('.back-to-top');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTop.classList.add('show');
    } else {
      backToTop.classList.remove('show');
    }
  });

  // Scroll Progress Bar Functionality
  window.addEventListener('scroll', () => {
    const scrollProgress = document.getElementById('scroll-progress');
    const totalHeight = document.body.scrollHeight - window.innerHeight;
    const progress = (window.scrollY / totalHeight) * 100;
    scrollProgress.style.width = `${progress}%`;
  });

  // Set Current Year in Footer
  const currentYearElement = document.getElementById('current-year');
  if (currentYearElement) {
    const currentYear = new Date().getFullYear();
    currentYearElement.textContent = currentYear;
  } else {
    console.error('Current year element not found.');
  }
});
