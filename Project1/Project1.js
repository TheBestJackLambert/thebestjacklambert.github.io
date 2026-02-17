// Project1.js

document.addEventListener('DOMContentLoaded', () => {
  // Initialize AOS
  AOS.init({
    duration: 1000,
    once: true,
  });

  // Initialize Typed.js with cursor disabled
  const typed = new Typed('#typed-text', {
    strings: ['Project 1', 'Theremin', 'Made at GTRI'],
    typeSpeed: 100,
    backSpeed: 50,
    loop: true,
    showCursor: false, // Disable default Typed.js cursor
  });

  // Inline Particles.js Configuration
  particlesJS('particles-js', {
    particles: {
      number: { value: 80, density: { enable: true, value_area: 800 } },
      color: { value: '#ff4d00' },
      shape: { type: 'circle' },
      opacity: { value: 0.5 },
      size: { value: 3, random: true },
      line_linked: { enable: true, distance: 150, color: '#ff4d00', opacity: 0.4, width: 1 },
      move: { enable: true, speed: 6, direction: 'none', random: false, straight: false, out_mode: 'out', bounce: false },
    },
    interactivity: {
      detect_on: 'canvas',
      events: {
        onhover: { enable: true, mode: 'repulse' },
        onclick: { enable: true, mode: 'push' }
      },
    },
    retina_detect: true,
  });

  console.log('Particles.js initialized successfully.');

  // Custom Cursor Logic handled by shared-interactions.js

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
  }
});
