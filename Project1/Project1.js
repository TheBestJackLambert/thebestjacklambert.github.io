// Custom Cursor Functionality
const cursor = document.querySelector('.cursor');
const hoverElements = document.querySelectorAll('a, .btn, .nav-link, .burger');

// Move the cursor based on mouse movement
document.addEventListener('mousemove', (e) => {
  cursor.style.left = `${e.clientX}px`;
  cursor.style.top = `${e.clientY}px`;
});

// Add hover effects to interactive elements
hoverElements.forEach(elem => {
  elem.addEventListener('mouseenter', () => {
    cursor.classList.add('cursor-hover');
  });
  elem.addEventListener('mouseleave', () => {
    cursor.classList.remove('cursor-hover');
  });
});

// Initialize AOS (Animate On Scroll)
AOS.init({
  duration: 1000,
  once: true
});

// Burger Menu Toggle
const burger = document.querySelector('.burger');
const navLinks = document.querySelector('.nav-links');

burger.addEventListener('click', () => {
  navLinks.classList.toggle('nav-active');
  burger.classList.toggle('toggle');
});

// Smooth Scrolling for Navigation Links
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

// Back to Top Button Visibility
const backToTop = document.querySelector('.back-to-top');

window.addEventListener('scroll', () => {
  if (window.pageYOffset > 300) {
    backToTop.style.display = 'flex';
  } else {
    backToTop.style.display = 'none';
  }
});

// Three.js Animated Background for Project Page
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('project-canvas')) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1,
      10000
    );
    camera.position.z = 1000;

    const renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById('project-canvas'),
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const particleCount = 1500;
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
    scene.add(particles);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    document.addEventListener('mousemove', (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    });

    function animate() {
      requestAnimationFrame(animate);
      particles.rotation.y += 0.0005;

      const positions = particlesGeometry.attributes.position.array;
      const velocities = particlesGeometry.attributes.velocity.array;

      raycaster.setFromCamera(mouse, camera);
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

      renderer.render(scene, camera);
    }
    animate();
  }
});

// Update Current Year in Footer
document.getElementById('current-year').textContent = new Date().getFullYear();

// GSAP Animations for Project Page
gsap.from('#project-details h2', {
  scrollTrigger: {
    trigger: '#project-details h2',
    start: 'top 80%'
  },
  y: -50,
  opacity: 0,
  duration: 1
});

gsap.from('.project-image', {
  scrollTrigger: {
    trigger: '.project-image',
    start: 'top 80%'
  },
  scale: 0.8,
  opacity: 0,
  duration: 1,
  ease: 'back.out(1.7)'
});

gsap.from('.project-description h3', {
  scrollTrigger: {
    trigger: '.project-description h3',
    start: 'top 80%'
  },
  x: -50,
  opacity: 0,
  duration: 1
});

gsap.from('.project-description p, .project-description ul', {
  scrollTrigger: {
    trigger: '.project-description p',
    start: 'top 80%'
  },
  x: 50,
  opacity: 0,
  duration: 1,
  stagger: 0.2
});

gsap.from('.presentation-container', {
  scrollTrigger: {
    trigger: '.presentation-container',
    start: 'top 80%'
  },
  y: 50,
  opacity: 0,
  duration: 1
});

gsap.from('.gallery-image', {
  scrollTrigger: {
    trigger: '.gallery-image',
    start: 'top 80%'
  },
  scale: 0.8,
  opacity: 0,
  duration: 1,
  stagger: 0.2,
  ease: 'back.out(1.7)'
});

gsap.from('.back-btn', {
  scrollTrigger: {
    trigger: '.back-btn',
    start: 'top 80%'
  },
  y: 50,
  opacity: 0,
  duration: 1
});
