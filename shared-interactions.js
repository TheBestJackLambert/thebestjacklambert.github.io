/* ==========================================================================
   SHARED INTERACTIONS - Global Logic for Digital Mona Lisa
   Includes: Custom Cursor, HUD Nav, Magnetic Hover, Easter Eggs, Lightbox
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Initialize AOS if available
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: true,
            offset: 50
        });
    }

    // 2. RESTORED CUSTOM CURSOR (Optimized)
    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    let cursor = document.querySelector('.cursor');
    let follower = document.querySelector('.cursor-follower');

    if (!cursor && !isTouch) {
        cursor = document.createElement('div');
        cursor.className = 'cursor';
        document.body.appendChild(cursor);
    }
    if (!follower && !isTouch) {
        follower = document.createElement('div');
        follower.className = 'cursor-follower';
        document.body.appendChild(follower);
    }

    if (!isTouch && cursor && follower) {
        document.body.style.cursor = 'none';
        document.querySelectorAll('a, button, input, textarea').forEach(el => el.style.cursor = 'none');

        let mouseX = 0, mouseY = 0;
        let followerX = 0, followerY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function animateCursor() {
            // Instant tracking for the dot (synchronized with frame)
            if (cursor) {
                cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
            }

            // Smooth trailing for the follower
            followerX += (mouseX - followerX) * 0.7;
            followerY += (mouseY - followerY) * 0.7;
            if (follower) {
                follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%)`;
            }
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        const interactiveElements = document.querySelectorAll('a, button, .btn-tech, .hud-link, .card, .gallery-item, .bento-card, .file-block');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => follower.classList.add('active'));
            el.addEventListener('mouseleave', () => follower.classList.remove('active'));
        });
    }

    // 3. Easter Egg for Recruiters
    // 3. Easter Egg for Recruiters (PSYCHOLOGICAL UPDATE)
    console.log(
        "%c STOP LOOKING AT MY SOURCE CODE AND HIRE ME ALREADY! ",
        "background: #111; color: #00ff00; font-size: 16px; padding: 10px; border: 1px solid #00ff00; border-radius: 5px;"
    );
    console.log("%c(But seriously, check out the repo: https://github.com/thebestjacklambert)", "color: #888;");

    // 4. Smooth Scroll (Lenis)
    let lenis;
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            smooth: true,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        if (typeof ScrollTrigger !== 'undefined') {
            lenis.on('scroll', ScrollTrigger.update);
        }

        lenis.on('scroll', () => {
            if (typeof AOS !== 'undefined') AOS.refresh();
            updateHudScroll();
        });
    }

    // 5. Scroll Percentage HUD
    function updateHudScroll() {
        const scrollEl = document.getElementById('hud-scroll');
        if (scrollEl) {
            const docHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
            const winHeight = window.innerHeight;
            const scrollY = window.scrollY || window.pageYOffset;
            const totalScrollable = docHeight - winHeight;
            let progress = 0;
            if (totalScrollable > 0) {
                progress = Math.round((scrollY / totalScrollable) * 100);
            }
            scrollEl.textContent = `${Math.min(100, Math.max(0, progress))}%`;
        }
    }
    window.addEventListener('scroll', updateHudScroll);
    updateHudScroll();

    // 6. HUD Coordinates
    const hudCoords = document.getElementById('hud-coords');
    if (hudCoords) {
        document.addEventListener('mousemove', (e) => {
            const coords = hudCoords.querySelectorAll('.coord');
            if (coords.length >= 2) {
                coords[0].textContent = e.clientX;
                coords[1].textContent = e.clientY;
            }
        });
    }

    // 7. Active Nav Section (Main Page)
    const isProjectPage = window.location.pathname.includes('/Project');
    const hudLinks = document.querySelectorAll('.hud-link');
    const sections = document.querySelectorAll('section[id]');

    if (!isProjectPage && hudLinks.length > 0 && sections.length > 0) {
        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (window.scrollY >= sectionTop - 300) {
                    current = section.getAttribute('id');
                }
            });
            if (current) {
                hudLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href').includes(`#${current}`)) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // 8. View Mode Toggle
    const viewToggle = document.getElementById('view-toggle');
    if (viewToggle) {
        viewToggle.addEventListener('click', () => {
            viewToggle.classList.toggle('render');
            document.body.classList.toggle('blueprint-mode');
        });
    }

    // 9. Magnetic Hover
    if (!isTouch) {
        document.querySelectorAll('.btn-tech').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate3d(${x * 0.15}px, ${y * 0.15}px, 0)`;
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
    }

    // 10. Card Glow
    document.querySelectorAll('.card, .bento-card, .video-card, .file-block').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--mouse-x', x + '%');
            card.style.setProperty('--mouse-y', y + '%');
        });
    });

    // 11. Lightbox Functionality (Global)
    if (!document.querySelector('.lightbox-overlay')) {
        const lightboxOverlay = document.createElement('div');
        lightboxOverlay.className = 'lightbox-overlay';
        lightboxOverlay.innerHTML = `<button class="lightbox-close">&times;</button><img class="lightbox-content" src="" alt="Full View">`;
        document.body.appendChild(lightboxOverlay);

        const lightboxImg = lightboxOverlay.querySelector('.lightbox-content');
        const lightboxClose = lightboxOverlay.querySelector('.lightbox-close');

        // Open
        document.querySelectorAll('.gallery-item img').forEach(img => {
            img.style.cursor = 'zoom-in';
            img.addEventListener('click', () => {
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt;
                lightboxOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

        // Close
        const closeLightbox = () => {
            lightboxOverlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        lightboxClose.addEventListener('click', closeLightbox);
        lightboxOverlay.addEventListener('click', (e) => {
            if (e.target === lightboxOverlay) closeLightbox();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeLightbox();
        });
    }

    // 12. Scroll Progress Bar Init
    if (!document.getElementById('scroll-progress')) {
        const bar = document.createElement('div');
        bar.id = 'scroll-progress';
        document.body.appendChild(bar);
        window.addEventListener('scroll', () => {
            const h = document.documentElement.scrollHeight - window.innerHeight;
            const p = (window.scrollY / h) * 100;
            bar.style.width = `${p}%`;
        });
    }
});
