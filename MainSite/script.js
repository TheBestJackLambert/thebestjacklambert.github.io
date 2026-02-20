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

  // 3. Custom Cursor Logic - Handled by shared-interactions.js

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

  // 5. 3D Tilt Effect for Cards (custom implementation)
  // Handled in section 9 below via mousemove

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


  // 8. Project Filtering & Search Logic [APPLE-LEVEL POLISH]
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectItems = document.querySelectorAll('.project-item');
  const searchInput = document.getElementById('project-search');

  if (filterBtns.length > 0 && projectItems.length > 0) {
    let currentFilter = 'all';
    let currentSearch = '';
    let pendingTimers = [];

    // Initialize cards
    projectItems.forEach(item => {
      item.style.display = 'flex';
      item.style.opacity = '1';
    });

    // Cancel all pending animation timers and reset cards to clean state
    const cancelAnimation = () => {
      pendingTimers.forEach(id => clearTimeout(id));
      pendingTimers = [];

      projectItems.forEach(item => {
        item.style.transition = '';
        item.style.transform = '';
        item.style.borderColor = '';
        item.style.boxShadow = '';
        item.classList.remove('card-materialize');
      });
    };

    // Set correct display state instantly (no animation)
    const snapToState = () => {
      projectItems.forEach(item => {
        const tags = item.getAttribute('data-tags') || '';
        const title = item.querySelector('.project-title')?.textContent.toLowerCase() || '';
        const desc = item.querySelector('.project-desc')?.textContent.toLowerCase() || '';

        const matchesFilter = currentFilter === 'all' || tags.includes(currentFilter);
        const matchesSearch = currentSearch === '' ||
          title.includes(currentSearch) ||
          desc.includes(currentSearch) ||
          tags.includes(currentSearch);

        if (matchesFilter && matchesSearch) {
          item.style.display = 'flex';
          item.style.opacity = '1';
        } else {
          item.style.display = 'none';
          item.style.opacity = '0';
        }
      });
    };

    // Premium two-phase "Phase Shift" transition (fully interruptible)
    const evaluateVisibility = () => {
      // Cancel any running animation
      cancelAnimation();

      const shouldShow = [];
      const shouldHide = [];

      projectItems.forEach(item => {
        const tags = item.getAttribute('data-tags') || '';
        const title = item.querySelector('.project-title')?.textContent.toLowerCase() || '';
        const desc = item.querySelector('.project-desc')?.textContent.toLowerCase() || '';

        const matchesFilter = currentFilter === 'all' || tags.includes(currentFilter);
        const matchesSearch = currentSearch === '' ||
          title.includes(currentSearch) ||
          desc.includes(currentSearch) ||
          tags.includes(currentSearch);

        const isVisible = item.style.display !== 'none';
        const wantsVisible = matchesFilter && matchesSearch;

        if (wantsVisible && !isVisible) shouldShow.push(item);
        else if (!wantsVisible && isVisible) shouldHide.push(item);
      });

      if (shouldHide.length === 0 && shouldShow.length === 0) return;

      // ── PHASE 1: Exit ──────────────────────────────────
      const exitStagger = 20;

      shouldHide.forEach((item, i) => {
        const t = setTimeout(() => {
          item.style.transition = 'opacity 0.18s ease-in, transform 0.18s ease-in';
          item.style.opacity = '0';
          item.style.transform = 'scale(0.96) translateY(8px)';
        }, i * exitStagger);
        pendingTimers.push(t);
      });

      const exitWait = shouldHide.length > 0
        ? 180 + (shouldHide.length * exitStagger)
        : 30;

      const phaseTwo = setTimeout(() => {
        // Remove exited cards from layout
        shouldHide.forEach(item => {
          item.style.display = 'none';
          item.style.transition = '';
          item.style.transform = '';
          item.style.opacity = '0';
        });

        // Prep entering cards
        shouldShow.forEach(item => {
          item.style.display = 'flex';
          item.style.opacity = '0';
          item.style.transform = 'scale(0.96) translateY(18px)';
          item.style.transition = '';
          item.style.borderColor = 'rgba(255, 255, 255, 0.08)';
          item.style.boxShadow = 'none';
        });

        void document.body.offsetHeight; // Reflow

        // ── PHASE 2: Materialize ─────────────────────────
        const enterStagger = 65;
        shouldShow.forEach((item, i) => {
          const enterT = setTimeout(() => {
            item.style.transition = [
              'opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
              'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
              'border-color 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
              'box-shadow 0.7s ease-out'
            ].join(', ');
            item.style.opacity = '1';
            item.style.transform = 'scale(1) translateY(0)';

            // Orange activation flash
            item.style.borderColor = 'rgba(255, 77, 0, 0.6)';
            item.style.boxShadow = '0 0 25px rgba(255, 77, 0, 0.2)';

            // Scan-line sweep
            item.classList.remove('card-materialize');
            void item.offsetWidth;
            item.classList.add('card-materialize');

            // Fade glow back
            const fadeT = setTimeout(() => {
              item.style.transition = 'border-color 0.8s ease, box-shadow 0.8s ease';
              item.style.borderColor = '';
              item.style.boxShadow = '';
            }, 450);
            pendingTimers.push(fadeT);

            // Cleanup
            const cleanT = setTimeout(() => {
              item.style.transition = '';
              item.style.transform = '';
              item.classList.remove('card-materialize');
            }, 1000);
            pendingTimers.push(cleanT);
          }, i * enterStagger);
          pendingTimers.push(enterT);
        });

        // AOS refresh
        const aosT = setTimeout(() => {
          if (typeof AOS !== 'undefined') AOS.refresh();
        }, shouldShow.length * enterStagger + 800);
        pendingTimers.push(aosT);

      }, exitWait);
      pendingTimers.push(phaseTwo);
    };

    // Handle Filter Button Clicks (spam-clickable)
    let searchDebounce = null;

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        currentFilter = btn.getAttribute('data-filter');

        // Button pulse
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        btn.style.transform = 'scale(1.08)';
        setTimeout(() => { btn.style.transform = ''; }, 150);

        // Cancel current animation, snap to correct state, then animate new changes
        cancelAnimation();
        snapToState();

        // Tiny delay so snap settles, then run the animated transition
        const kickoff = setTimeout(() => evaluateVisibility(), 20);
        pendingTimers.push(kickoff);

        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?tag=' + currentFilter + '#projects';
        window.history.pushState({ path: newUrl }, '', newUrl);
      });
    });

    // Handle Search Input (debounced)
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchDebounce);
        searchDebounce = setTimeout(() => {
          currentSearch = e.target.value.toLowerCase().trim();
          cancelAnimation();
          snapToState();
          setTimeout(() => evaluateVisibility(), 20);
        }, 150);
      });
    }

    // Check URL parameters on load
    const urlParams = new URLSearchParams(window.location.search);
    const tagParam = urlParams.get('tag');

    if (tagParam) {
      currentFilter = tagParam;

      // Find and activate the correct button
      filterBtns.forEach(b => {
        b.classList.remove('active');
        if (b.getAttribute('data-filter') === tagParam) {
          b.classList.add('active');
        }
      });

      // Small delay to ensure DOM is ready before initial filtering
      setTimeout(() => {
        evaluateVisibility();
        const projectsSection = document.getElementById('projects');
        if (projectsSection) {
          projectsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }

});

/* ==========================================================================
   PREMIUM ENHANCEMENTS
   ========================================================================== */

// 9. Card 3D Tilt + Glow Effect
document.querySelectorAll('.bento-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.transition = 'border-color 0.3s, background 0.3s, box-shadow 0.3s';
  });

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateY = -((x - centerX) / centerX) * 10;
    const rotateX = -((centerY - y) / centerY) * 10;

    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

    card.style.setProperty('--mouse-x', (x / rect.width * 100) + '%');
    card.style.setProperty('--mouse-y', (y / rect.height * 100) + '%');
  });

  card.addEventListener('mouseleave', () => {
    card.style.transition = 'border-color 0.3s, background 0.3s, box-shadow 0.3s, transform 0.5s ease-out';
    card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
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

// Note: HUD Logic is now in shared-interactions.js
