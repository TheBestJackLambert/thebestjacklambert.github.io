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
// Three.js Background for Hero Section with Enhanced Constellations
// Three.js Background for Hero Section with Recognizable Constellations

// Initialize Scene, Camera, and Renderer
const sceneHero = new THREE.Scene();
const cameraHero = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  1,
  10000
);
cameraHero.position.z = 2000;

const rendererHero = new THREE.WebGLRenderer({
  canvas: document.getElementById('hero-canvas'),
  alpha: true,
  antialias: true,
});
rendererHero.setSize(window.innerWidth, window.innerHeight);
rendererHero.setPixelRatio(window.devicePixelRatio);
rendererHero.setClearColor(0x000000, 0); // Transparent background

// Background Star Shader Material
const backgroundStarVertexShader = `
  attribute float size;
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / length(mvPosition.xyz));
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const backgroundStarFragmentShader = `
  void main() {
    gl_FragColor = vec4(1.0);
  }
`;

const backgroundStarMaterial = new THREE.ShaderMaterial({
  vertexShader: backgroundStarVertexShader,
  fragmentShader: backgroundStarFragmentShader,
  transparent: true,
});

// Create Random Background Stars
const backgroundStarGeometry = new THREE.BufferGeometry();
const backgroundStarVertices = [];
const backgroundStarSizes = [];

for (let i = 0; i < 5000; i++) {
  const x = (Math.random() - 0.5) * 8000;
  const y = (Math.random() - 0.5) * 8000;
  const z = (Math.random() - 0.5) * 8000;
  backgroundStarVertices.push(x, y, z);

  // Random star sizes between 1 and 3
  backgroundStarSizes.push(Math.random() * 2 + 1);
}

backgroundStarGeometry.setAttribute(
  'position',
  new THREE.Float32BufferAttribute(backgroundStarVertices, 3)
);
backgroundStarGeometry.setAttribute(
  'size',
  new THREE.Float32BufferAttribute(backgroundStarSizes, 1)
);

const backgroundStars = new THREE.Points(backgroundStarGeometry, backgroundStarMaterial);
sceneHero.add(backgroundStars);

// Constellation Star Shader Material
const constellationStarVertexShader = `
  uniform float highlight;
  attribute float size;
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    float adjustedSize = size * (1.0 + highlight * 2.0);
    gl_PointSize = adjustedSize * (300.0 / length(mvPosition.xyz));
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const constellationStarFragmentShader = `
  uniform float highlight;
  void main() {
    vec3 color = mix(vec3(1.0), vec3(1.0, 0.84, 0.0), highlight); // Gold when highlighted
    gl_FragColor = vec4(color, 1.0);
  }
`;

const baseConstellationStarMaterial = new THREE.ShaderMaterial({
  uniforms: {
    highlight: { value: 0 },
  },
  vertexShader: constellationStarVertexShader,
  fragmentShader: constellationStarFragmentShader,
  transparent: true,
});

// Function to Clone Shader Material
function cloneShaderMaterial(material) {
  const newMaterial = material.clone();
  newMaterial.uniforms = THREE.UniformsUtils.clone(material.uniforms);
  return newMaterial;
}

// Define Real Constellations
const constellationsData = [
  {
    name: 'Orion',
    stars: [
      { name: 'Betelgeuse', position: new THREE.Vector3(-50, 80, -200) },
      { name: 'Bellatrix', position: new THREE.Vector3(50, 80, -200) },
      { name: 'Alnitak', position: new THREE.Vector3(-70, 0, -200) },
      { name: 'Alnilam', position: new THREE.Vector3(0, 0, -200) },
      { name: 'Mintaka', position: new THREE.Vector3(70, 0, -200) },
      { name: 'Saiph', position: new THREE.Vector3(-50, -80, -200) },
      { name: 'Rigel', position: new THREE.Vector3(50, -80, -200) },
    ],
    connections: [
      ['Betelgeuse', 'Bellatrix'],
      ['Betelgeuse', 'Alnitak'],
      ['Alnitak', 'Alnilam'],
      ['Alnilam', 'Mintaka'],
      ['Bellatrix', 'Mintaka'],
      ['Alnitak', 'Saiph'],
      ['Mintaka', 'Rigel'],
      ['Saiph', 'Rigel'],
    ],
  },
  // Define other constellations similarly (Ursa Major, Cassiopeia, Leo)
];

// Add Constellations
const constellationMeshes = [];

constellationsData.forEach((constellation) => {
  // Create Constellation Stars
  const starGeometry = new THREE.BufferGeometry();
  const starPositions = [];
  const starSizes = [];
  
  constellation.stars.forEach((star) => {
    starPositions.push(star.position.x, star.position.y, star.position.z);
    starSizes.push(2); // Standard size
  });
  
  starGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(starPositions, 3)
  );
  starGeometry.setAttribute(
    'size',
    new THREE.Float32BufferAttribute(starSizes, 1)
  );
  
  const starMaterialClone = cloneShaderMaterial(baseConstellationStarMaterial);
  
  const starPoints = new THREE.Points(starGeometry, starMaterialClone);
  sceneHero.add(starPoints);
  
  // Create Constellation Lines
  const lineGeometry = new THREE.BufferGeometry();
  const linePositions = [];
  
  constellation.connections.forEach((connection) => {
    const startStar = constellation.stars.find((star) => star.name === connection[0]);
    const endStar = constellation.stars.find((star) => star.name === connection[1]);
  
    linePositions.push(
      startStar.position.x,
      startStar.position.y,
      startStar.position.z,
      endStar.position.x,
      endStar.position.y,
      endStar.position.z
    );
  });
  
  lineGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(linePositions, 3)
  );
  
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0, // Start invisible
  });
  
  const linesMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
  sceneHero.add(linesMesh);
  
  // Store for later reference
  constellationMeshes.push({
    name: constellation.name,
    stars: starPoints,
    lines: linesMesh,
    starPositions: starPositions,
    starMaterial: starMaterialClone,
    lineMaterial: lineMaterial,
  });
});

// Mouse and Raycaster for Interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

document.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
});

// Animation Loop
function animateHero() {
  requestAnimationFrame(animateHero);

  // Rotate the stars and constellations
  backgroundStars.rotation.y += 0.0002;

  constellationMeshes.forEach((mesh) => {
    mesh.stars.rotation.y += 0.0002;
    mesh.lines.rotation.y += 0.0002;
  });

  // Update raycaster
  raycaster.setFromCamera(mouse, cameraHero);

  // Increase the detection radius
  raycaster.params.Points.threshold = 50;

  // Check each constellation
  constellationMeshes.forEach((mesh) => {
    // Adjust the positions for rotation
    const rotatedStarPositions = [];
    for (let i = 0; i < mesh.starPositions.length; i += 3) {
      const position = new THREE.Vector3(
        mesh.starPositions[i],
        mesh.starPositions[i + 1],
        mesh.starPositions[i + 2]
      );
      position.applyAxisAngle(new THREE.Vector3(0, 1, 0), mesh.stars.rotation.y);

      rotatedStarPositions.push(position.x, position.y, position.z);
    }

    // Create a temporary geometry with rotated positions
    const tempGeometry = new THREE.BufferGeometry();
    tempGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(rotatedStarPositions, 3)
    );

    // Check for intersections
    const intersects = raycaster.intersectObject(new THREE.Points(tempGeometry, mesh.stars.material));

    if (intersects.length > 0) {
      // Cursor is near this constellation
      mesh.lineMaterial.opacity = THREE.MathUtils.clamp(mesh.lineMaterial.opacity + 0.1, 0, 1);
      mesh.lineMaterial.color.lerp(new THREE.Color(0xffd700), 0.1); // Change to gold

      // Increase star brightness and size
      mesh.starMaterial.uniforms.highlight.value = THREE.MathUtils.clamp(
        mesh.starMaterial.uniforms.highlight.value + 0.1,
        0,
        1
      );
    } else {
      // Cursor is not near
      mesh.lineMaterial.opacity = THREE.MathUtils.clamp(mesh.lineMaterial.opacity - 0.05, 0, 1);
      mesh.lineMaterial.color.lerp(new THREE.Color(0xffffff), 0.1); // Change back to white

      // Decrease star brightness and size
      mesh.starMaterial.uniforms.highlight.value = THREE.MathUtils.clamp(
        mesh.starMaterial.uniforms.highlight.value - 0.05,
        0,
        1
      );
    }
  });

  rendererHero.render(sceneHero, cameraHero);
}
animateHero();

// Resize Handler for Responsiveness
window.addEventListener('resize', () => {
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
