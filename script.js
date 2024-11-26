// Custom Cursor
const cursor = document.querySelector('.cursor');

document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
  createParticle(e.clientX, e.clientY);
});

// Cursor Expand on Hover
const hoverElements = document.querySelectorAll('a, .btn, .project-card');

hoverElements.forEach(elem => {
  elem.addEventListener('mouseover', () => {
    cursor.classList.add('cursor-hover');
  });
  elem.addEventListener('mouseleave', () => {
    cursor.classList.remove('cursor-hover');
  });
});

// Typed.js Initialization
var typed = new Typed('#typed', {
  strings: ['Physics Enthusiast', 'Aspiring Engineer', 'Problem Solver'],
  typeSpeed: 50,
  backSpeed: 50,
  loop: true
});

// AOS Initialization
AOS.init({
  duration: 1000,
  once: true
});

// Mobile Navigation Toggle
const burger = document.querySelector('.burger');
const navLinks = document.querySelector('.nav-links');

burger.addEventListener('click', () => {
  navLinks.classList.toggle('nav-active');
  burger.classList.toggle('toggle');
});

// Smooth Scrolling
document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    if (navLinks.classList.contains('nav-active')) {
      navLinks.classList.remove('nav-active');
      burger.classList.remove('toggle');
    }
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});

// Back to Top Button
const backToTop = document.querySelector('.back-to-top');

window.addEventListener('scroll', () => {
  if (window.pageYOffset > 300) {
    backToTop.style.display = 'flex';
  } else {
    backToTop.style.display = 'none';
  }
});

// Vanilla Tilt Initialization for Project Cards
VanillaTilt.init(document.querySelectorAll(".project-card"), {
  max: 15,
  speed: 400,
  glare: true,
  "max-glare": 0.2,
});

// Three.js Animated Background
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('hero-canvas'),
  alpha: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff });

const starVertices = [];
for (let i = 0; i < 6000; i++) {
  const x = (Math.random() - 0.5) * 2000;
  const y = (Math.random() - 0.5) * 2000;
  const z = (Math.random() - 0.5) * 2000;
  starVertices.push(x, y, z);
}
starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));

const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

camera.position.z = 1;

function animate() {
  requestAnimationFrame(animate);
  stars.rotation.x += 0.0005;
  stars.rotation.y += 0.0005;
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', onWindowResize, false);

function onWindowResize(){
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Particles.js Initialization for Tutoring Section
particlesJS('particles-js',
  {
    "particles": {
      "number": {
        "value": 60,
        "density": {
          "enable": true,
          "value_area": 800
        }
      },
      "color": {
        "value": "#ffffff"
      },
      "shape": {
        "type": "circle"
      },
      "opacity": {
        "value": 0.5
      },
      "size": {
        "value": 3
      },
      "line_linked": {
        "enable": false
      },
      "move": {
        "enable": true,
        "speed": 2
      }
    },
    "interactivity": {
      "detect_on": "canvas",
      "events": {
        "onhover": {
          "enable": false
        },
        "onclick": {
          "enable": false
        }
      }
    },
    "retina_detect": true
  }
);

// Email Modal Functionality
const modal = document.getElementById('email-modal');
const tutoringBtn = document.getElementById('tutoring-btn');
const closeBtn = document.querySelector('.close-btn');

tutoringBtn.addEventListener('click', () => {
  modal.style.display = 'block';
});

closeBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target == modal) {
    modal.style.display = 'none';
  }
});

// Form Submission
const contactForm = document.getElementById('contact-form');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  // Handle form submission
  alert('Thank you for your message! I will get back to you soon.');
  modal.style.display = 'none';
  contactForm.reset();
});

// Floating Particles Following Cursor
function createParticle(x, y) {
  const particle = document.createElement('div');
  particle.classList.add('particle');
  document.body.appendChild(particle);

  particle.style.left = x + 'px';
  particle.style.top = y + 'px';

  const size = Math.random() * 5 + 5;
  particle.style.width = size + 'px';
  particle.style.height = size + 'px';

  particle.style.transition = 'transform 0.5s ease-out, opacity 0.5s';
  particle.style.transform = `translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px)`;
  particle.style.opacity = 0;

  setTimeout(() => {
    particle.remove();
  }, 500);
}

// Dynamic Background Color Change with GSAP
window.addEventListener('scroll', () => {
  const scrollPosition = window.pageYOffset;
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const scrollPercentage = scrollPosition / maxScroll;

  const startColor = { r: 13, g: 13, b: 13 }; // #0d0d0d
  const endColor = { r: 22, g: 33, b: 62 }; // #16213e

  const r = Math.round(startColor.r + (endColor.r - startColor.r) * scrollPercentage);
  const g = Math.round(startColor.g + (endColor.g - startColor.g) * scrollPercentage);
  const b = Math.round(startColor.b + (endColor.b - startColor.b) * scrollPercentage);

  document.body.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
});

// GSAP Scroll-triggered Animations
gsap.registerPlugin(ScrollTrigger);

gsap.from('#about .about-image', {
  scrollTrigger: '#about',
  x: -200,
  opacity: 0,
  duration: 1
});

gsap.from('#about .about-text', {
  scrollTrigger: '#about',
  x: 200,
  opacity: 0,
  duration: 1
});

// Set Current Year in Footer
document.getElementById('current-year').textContent = new Date().getFullYear();
