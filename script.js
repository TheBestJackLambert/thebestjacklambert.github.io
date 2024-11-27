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
  strings: ['Physics Enthusiast', 'Math Problem Destroyer', 'Awesome Guy'],
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

// Three.js Background for Hero Section
// Hero Section - Three.js Starry Background with Cursor Interaction
const sceneHero = new THREE.Scene();
const cameraHero = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const rendererHero = new THREE.WebGLRenderer({
  canvas: document.getElementById("hero-canvas"),
  alpha: true,
});
rendererHero.setSize(window.innerWidth, window.innerHeight);
rendererHero.setPixelRatio(window.devicePixelRatio);

const starGeometryHero = new THREE.BufferGeometry();
const starMaterialHero = new THREE.PointsMaterial({ color: 0xffffff });

const starVerticesHero = [];
for (let i = 0; i < 6000; i++) {
  const x = (Math.random() - 0.5) * 2000;
  const y = (Math.random() - 0.5) * 2000;
  const z = (Math.random() - 0.5) * 2000;
  starVerticesHero.push(x, y, z);
}
starGeometryHero.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(starVerticesHero, 3)
);

const starsHero = new THREE.Points(starGeometryHero, starMaterialHero);
sceneHero.add(starsHero);

cameraHero.position.z = 1;

// Variables to track mouse position
let mouseX = 0;
let mouseY = 0;

// Event listener to capture mouse movement
document.addEventListener('mousemove', (event) => {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});

function animateHero() {
  requestAnimationFrame(animateHero);

  // Smooth rotation animation
  starsHero.rotation.x += 0.0005;
  starsHero.rotation.y += 0.0005;

  // React to mouse movement
  starsHero.rotation.x += (mouseY * 0.1 - starsHero.rotation.x) * 0.05;
  starsHero.rotation.y += (mouseX * 0.1 - starsHero.rotation.y) * 0.05;

  rendererHero.render(sceneHero, cameraHero);
}
animateHero();


// Resize Handler for Hero Section
window.addEventListener("resize", () => {
  cameraHero.aspect = window.innerWidth / window.innerHeight;
  cameraHero.updateProjectionMatrix();
  rendererHero.setSize(window.innerWidth, window.innerHeight);
});

// Three.js Background for Achievements Section
const sceneAchievements = new THREE.Scene();
const cameraAchievements = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / document.getElementById("achievements").offsetHeight,
  0.1,
  1000
);

const rendererAchievements = new THREE.WebGLRenderer({
  canvas: document.getElementById("achievements-canvas"),
  alpha: true,
});
rendererAchievements.setSize(
  window.innerWidth,
  document.getElementById("achievements").offsetHeight
);
rendererAchievements.setPixelRatio(window.devicePixelRatio);

const starGeometryAchievements = new THREE.BufferGeometry();
const starMaterialAchievements = new THREE.PointsMaterial({ color: 0xffffff });

const starVerticesAchievements = [];
for (let i = 0; i < 6000; i++) {
  const x = (Math.random() - 0.5) * 2000;
  const y = (Math.random() - 0.5) * 2000;
  const z = (Math.random() - 0.5) * 2000;
  starVerticesAchievements.push(x, y, z);
}
starGeometryAchievements.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(starVerticesAchievements, 3)
);

const starsAchievements = new THREE.Points(
  starGeometryAchievements,
  starMaterialAchievements
);
sceneAchievements.add(starsAchievements);

cameraAchievements.position.z = 1;

function animateAchievements() {
  requestAnimationFrame(animateAchievements);
  starsAchievements.rotation.x += 0.0005;
  starsAchievements.rotation.y += 0.0005;

  rendererAchievements.render(sceneAchievements, cameraAchievements);
}
animateAchievements();

// Resize Handler for Achievements Section
window.addEventListener('resize', () => {
  const achievementsHeight = document.getElementById('achievements').offsetHeight;
  cameraAchievements.aspect = window.innerWidth / achievementsHeight;
  cameraAchievements.updateProjectionMatrix();
  rendererAchievements.setSize(window.innerWidth, achievementsHeight);
});

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
  scrollTrigger: {
    trigger: '#about',
    start: 'top center'
  },
  x: -200,
  opacity: 0,
  duration: 1
});

gsap.from('#about .about-text', {
  scrollTrigger: {
    trigger: '#about',
    start: 'top center'
  },
  x: 200,
  opacity: 0,
  duration: 1
});

gsap.from('.timeline-item', {
  scrollTrigger: {
    trigger: '#experience',
    start: 'top center'
  },
  y: 100,
  opacity: 0,
  duration: 1,
  stagger: 0.2
});

// Accordion Functionality
const accordionHeaders = document.querySelectorAll('.accordion-header');

accordionHeaders.forEach(header => {
  header.addEventListener('click', () => {
    const accordionItem = header.parentElement;
    const accordionContent = header.nextElementSibling;
    const openItem = document.querySelector('.accordion-item.active');

    if (openItem && openItem !== accordionItem) {
      openItem.classList.remove('active');
      openItem.querySelector('.accordion-content').style.maxHeight = 0;
    }

    accordionItem.classList.toggle('active');
    if (accordionItem.classList.contains('active')) {
      accordionContent.style.maxHeight = accordionContent.scrollHeight + 'px';
    } else {
      accordionContent.style.maxHeight = 0;
    }
  });
});

// Animate Progress Bars on Scroll
const progressFills = document.querySelectorAll('.progress-fill');

progressFills.forEach(fill => {
  const percentage = fill.getAttribute('data-percentage');
  fill.style.width = '0%';

  gsap.to(fill, {
    width: percentage,
    scrollTrigger: {
      trigger: fill,
      start: 'top 80%',
      toggleActions: 'play none none none',
    },
    duration: 1.5,
    ease: 'power1.out',
  });
});

// GSAP Animations for Resources Section
gsap.from('#resources .resource-card', {
  scrollTrigger: {
    trigger: '#resources',
    start: 'top center'
  },
  y: 100,
  opacity: 0,
  duration: 1,
  stagger: 0.2
});

// Fix for Navigation Menu Cut-off
window.addEventListener('load', () => {
  const navLinks = document.querySelector('.nav-links');
  navLinks.style.maxWidth = '100%';
});

// Set Current Year in Footer
document.getElementById('current-year').textContent = new Date().getFullYear();
