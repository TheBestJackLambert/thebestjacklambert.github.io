<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your Portfolio</title>
  
  <!-- FontAwesome CDN for Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
  
  <!-- AOS Library for Animations -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css">
  
  <!-- Custom CSS -->
  <link rel="stylesheet" href="styles.css">
  
  <!-- Three.js Library -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  
  <!-- Three.js Post-processing -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/examples/js/postprocessing/EffectComposer.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/examples/js/postprocessing/RenderPass.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/examples/js/postprocessing/UnrealBloomPass.js"></script>
  
  <!-- GSAP Library -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.7.1/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.7.1/ScrollTrigger.min.js"></script>
  
  <!-- Typed.js Library -->
  <script src="https://cdn.jsdelivr.net/npm/typed.js@2.0.12"></script>
  
  <!-- Vanilla Tilt for Card Effects -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.7.0/vanilla-tilt.min.js"></script>
  
  <!-- Particles.js Library -->
  <script src="https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js"></script>
  
</head>
<body>
  
  <!-- Custom Cursor -->
  <div class="cursor"></div>
  
  <!-- Navigation Bar -->
  <nav>
    <div class="logo">
      <img src="images/logo.png" alt="Logo">
    </div>
    <ul class="nav-links">
      <li><a href="#hero">Home</a></li>
      <li><a href="#about">About</a></li>
      <li><a href="#experience">Experience</a></li>
      <li><a href="#achievements">Achievements</a></li>
      <li><a href="#projects">Projects</a></li>
      <li><a href="#resources">Resources</a></li>
      <li><a href="#contact">Contact</a></li>
    </ul>
    <div class="burger">
      <div></div>
      <div></div>
      <div></div>
    </div>
  </nav>
  
  <!-- Hero Section -->
  <section id="hero">
    <canvas id="hero-canvas"></canvas>
    <div class="hero-content">
      <h1>Welcome to My Portfolio</h1>
      <h2 id="typed"></h2>
    </div>
  </section>
  
  <!-- About Section -->
  <section id="about">
    <div class="container">
      <h2 data-aos="fade-up">About Me</h2>
      <div class="about-content">
        <div class="about-image" data-aos="fade-right">
          <img src="images/about.jpg" alt="About Image">
        </div>
        <div class="about-text" data-aos="fade-left">
          <p>
            Hello! I'm Jack, a passionate developer specializing in creating interactive and dynamic web experiences. With a strong foundation in physics and mathematics, I bring a unique perspective to problem-solving and design.
          </p>
        </div>
      </div>
    </div>
  </section>
  
  <!-- Experience Section -->
  <section id="experience">
    <div class="container">
      <h2 data-aos="fade-up">Experience</h2>
      <div class="timeline">
        <div class="timeline-item left" data-aos="fade-right">
          <div class="timeline-content">
            <h3>Software Engineer</h3>
            <span>Company A | 2020 - Present</span>
            <p>Developed and maintained web applications using modern JavaScript frameworks.</p>
          </div>
        </div>
        <div class="timeline-item right" data-aos="fade-left">
          <div class="timeline-content">
            <h3>Junior Developer</h3>
            <span>Company B | 2018 - 2020</span>
            <p>Assisted in building responsive websites and implemented user-friendly interfaces.</p>
          </div>
        </div>
        <!-- Add more timeline items as needed -->
      </div>
    </div>
  </section>
  
  <!-- Achievements Section -->
  <section id="achievements">
    <div class="container">
      <h2 data-aos="fade-up">Achievements</h2>
      <div class="accordion">
        <div class="accordion-item">
          <div class="accordion-header">Academic Honors</div>
          <div class="accordion-content">
            <ul>
              <li>Graduated with Honors from XYZ University.</li>
              <li>Received the Best Research Paper Award in Physics.</li>
            </ul>
          </div>
        </div>
        <div class="accordion-item">
          <div class="accordion-header">Certifications</div>
          <div class="accordion-content">
            <ul>
              <li>Certified JavaScript Developer.</li>
              <li>Completed Advanced Three.js Workshop.</li>
            </ul>
          </div>
        </div>
        <!-- Add more accordion items as needed -->
      </div>
    </div>
  </section>
  
  <!-- Projects Section -->
  <section id="projects">
    <div class="container">
      <h2 data-aos="fade-up">Projects</h2>
      <div class="projects-grid">
        <!-- Project Card Example -->
        <div class="project-card" data-aos="fade-up" data-aos-delay="100">
          <div class="flip-card-inner">
            <div class="flip-card-front">
              <h1>Theremin Project</h1>
              <img src="images/theremin.jpg" alt="Theremin Project">
            </div>
            <div class="flip-card-back">
              <h3>Theremin from Scratch</h3>
              <p>I built a theremin from scratch using analog circuits to create a hands-free musical instrument.</p>
              <a href="project1.html" class="btn">View Project</a>
            </div>
          </div>
        </div>
        <!-- Repeat for other project cards -->
      </div>
    </div>
  </section>
  
  <!-- Resources Section -->
  <section id="resources">
    <div class="container">
      <h2 data-aos="fade-up">Resources</h2>
      <p>Check out some of my favorite resources below.</p>
      <div class="resources-grid">
        <!-- Resource Card Example -->
        <div class="resource-card" data-aos="fade-up" data-aos-delay="100">
          <div class="flip-card-inner">
            <div class="flip-card-front">
              <h3>Three.js Documentation</h3>
            </div>
            <div class="flip-card-back">
              <p>Comprehensive guide and API reference for Three.js.</p>
              <a href="https://threejs.org/docs/" target="_blank" class="btn">View Resource</a>
            </div>
          </div>
        </div>
        <!-- Repeat for other resource cards -->
      </div>
    </div>
  </section>
  
  <!-- Tutoring Section -->
  <section id="tutoring">
    <div id="particles-js"></div>
    <div class="container">
      <h2 data-aos="fade-up">Tutoring Services</h2>
      <p>Need help with physics or mathematics? I'm here to assist you!</p>
      <button id="tutoring-btn" class="fancy-btn" data-aos="fade-up">Contact Me</button>
    </div>
  </section>
  
  <!-- Contact Section -->
  <section id="contact">
    <div class="container">
      <h2 data-aos="fade-up">Contact</h2>
      <p>Feel free to reach out for collaborations, questions, or just a friendly chat!</p>
      <div class="contact-links">
        <a href="mailto:jack@example.com"><i class="fas fa-envelope"></i> Email</a>
        <a href="https://github.com/jack" target="_blank"><i class="fab fa-github"></i> GitHub</a>
        <a href="https://linkedin.com/in/jack" target="_blank"><i class="fab fa-linkedin"></i> LinkedIn</a>
      </div>
    </div>
  </section>
  
  <!-- Back to Top Button -->
  <a href="#hero" class="back-to-top"><i class="fas fa-arrow-up"></i></a>
  
  <!-- Email Modal -->
  <div id="email-modal" class="modal">
    <div class="modal-content">
      <span class="close-btn">&times;</span>
      <h2>Contact Me</h2>
      <form>
        <div class="form-group">
          <input type="text" id="name" required placeholder=" ">
          <label for="name">Name</label>
        </div>
        <div class="form-group">
          <input type="email" id="email" required placeholder=" ">
          <label for="email">Email</label>
        </div>
        <div class="form-group">
          <textarea id="message" rows="5" required placeholder=" "></textarea>
          <label for="message">Message</label>
        </div>
        <button type="submit" class="btn">Send</button>
      </form>
    </div>
  </div>
  
  <!-- Footer -->
  <footer>
    <p>&copy; <span id="current-year"></span> Jack. All rights reserved.</p>
  </footer>
  
  <!-- Custom JavaScript -->
  <script src="script.js"></script>
</body>
</html>
