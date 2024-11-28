const cursor = document.querySelector('.cursor');
const hoverElements = document.querySelectorAll('a, .btn, .project-card, .resource-card');

hoverElements.forEach(elem => {
  elem.addEventListener('mouseover', () => {
    cursor.classList.add('cursor-hover');
  });
  elem.addEventListener('mouseleave', () => {
    cursor.classList.remove('cursor-hover');
  });
});

var typed = new Typed('#typed', {
  strings: ['Physics Enthusiast', 'Math Problem Destroyer', 'Awesome Guy'],
  typeSpeed: 50,
  backSpeed: 50,
  loop: true
});

AOS.init({
  duration: 1000,
  once: true
});

const burger = document.querySelector('.burger');
const navLinks = document.querySelector('.nav-links');

burger.addEventListener('click', () => {
  navLinks.classList.toggle('nav-active');
  burger.classList.toggle('toggle');
});

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

const backToTop = document.querySelector('.back-to-top');

window.addEventListener('scroll', () => {
  if (window.pageYOffset > 300) {
    backToTop.style.display = 'flex';
  } else {
    backToTop.style.display = 'none';
  }
});

VanillaTilt.init(document.querySelectorAll(".project-card, .resource-card"), {
  max: 15,
  speed: 400,
  glare: true,
  "max-glare": 0.2,
});

document.addEventListener('DOMContentLoaded', () => {
  const sceneHero = new THREE.Scene();
  const cameraHero = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  cameraHero.position.z = 1000;
  const rendererHero = new THREE.WebGLRenderer({
    canvas: document.getElementById('hero-canvas'),
    alpha: true,
    antialias: true,
  });
  rendererHero.setSize(window.innerWidth, window.innerHeight);
  rendererHero.setPixelRatio(window.devicePixelRatio);
  rendererHero.setClearColor(0x000000, 0);

  window.addEventListener('resize', () => {
    cameraHero.aspect = window.innerWidth / window.innerHeight;
    cameraHero.updateProjectionMatrix();
    rendererHero.setSize(window.innerWidth, window.innerHeight);
  });

  const particleCount = 2000;
  const particlesGeometry = new THREE.BufferGeometry();
  const positions = [];
  const velocities = [];

  for (let i = 0; i < particleCount; i++) {
    positions.push(
      (Math.random() - 0.5) * 4000,
      (Math.random() - 0.5) * 4000,
      (Math.random() - 0.5) * 4000
    );
    velocities.push(
      (Math.random() - 0.5) * 0.5,
      (Math.random() - 0.5) * 0.5,
      (Math.random() - 0.5) * 0.5
    );
  }

  particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  particlesGeometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));

  const particlesMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 2,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });

  const particles = new THREE.Points(particlesGeometry, particlesMaterial);
  sceneHero.add(particles);

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  document.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
  });

  function animateHero() {
    requestAnimationFrame(animateHero);
    particles.rotation.y += 0.0005;

    const positions = particlesGeometry.attributes.position.array;
    const velocities = particlesGeometry.attributes.velocity.array;

    raycaster.setFromCamera(mouse, cameraHero);
    const intersects = raycaster.intersectObject(particles);

    if (intersects.length > 0) {
      const intersect = intersects[0];
      const index = intersect.index * 3;
      const x = positions[index];
      const y = positions[index + 1];
      const z = positions[index + 2];
      const dx = (intersect.point.x - x) * 0.05;
      const dy = (intersect.point.y - y) * 0.05;
      const dz = (intersect.point.z - z) * 0.05;
      velocities[index] += dx;
      velocities[index + 1] += dy;
      velocities[index + 2] += dz;
    }

    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += velocities[i];
      positions[i + 1] += velocities[i + 1];
      positions[i + 2] += velocities[i + 2];

      if (positions[i] > 2000 || positions[i] < -2000) velocities[i] *= -1;
      if (positions[i + 1] > 2000 || positions[i + 1] < -2000) velocities[i + 1] *= -1;
      if (positions[i + 2] > 2000 || positions[i + 2] < -2000) velocities[i + 2] *= -1;
    }

    particlesGeometry.attributes.position.needsUpdate = true;

    rendererHero.render(sceneHero, cameraHero);
  }
  animateHero();
});

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

function createParticle(x, y) {
  const particle = document.createElement('div');
  particle.classList.add('particle');
  document.body.appendChild(particle);
  particle.style.left = x + 'px';
  particle.style.top = y + 'px';
  const size = Math.random() * 5 + 5;
  particle.style.width = size + 'px';
  particle.style.height = size + 'px';
  particle.style.transform = `translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px)`;
  particle.style.opacity = 0;
  setTimeout(() => {
    particle.remove();
  }, 500);
}

document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
  createParticle(e.clientX, e.clientY);
});

window.addEventListener('scroll', () => {
  const scrollPosition = window.pageYOffset;
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const scrollPercentage = scrollPosition / maxScroll;

  const startColor = { r: 13, g: 13, b: 13 };
  const endColor = { r: 22, g: 33, b: 62 };

  const r = Math.round(startColor.r + (endColor.r - startColor.r) * scrollPercentage);
  const g = Math.round(startColor.g + (endColor.g - startColor.g) * scrollPercentage);
  const b = Math.round(startColor.b + (endColor.b - startColor.b) * scrollPercentage);

  document.body.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
});

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

gsap.from('#quote .quote-content', {
  scrollTrigger: {
    trigger: '#quote',
    start: 'top center'
  },
  y: 50,
  opacity: 0,
  duration: 1
});

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

document.getElementById('current-year').textContent = new Date().getFullYear();
gsap.to('#quote.quote-section', {
  scrollTrigger: {
    trigger: '#quote.quote-section',
    start: 'top 80%',
    toggleClass: { targets: '#quote.quote-section', className: 'active' },
    toggleActions: 'play none none reverse',
  },
  // These properties can be left empty if handled by CSS transitions
});
