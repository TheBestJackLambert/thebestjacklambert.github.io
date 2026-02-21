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

    // 8. Little Dudes Easter Egg — Canvas stick figures with personality
    const viewToggle = document.getElementById('view-toggle');
    let activeDudes = [];
    let dudesActive = false;
    let platforms = [];

    const DUDE_COLORS = ['#ff4d00', '#ff8c00', '#00f0ff', '#51cf66', '#bd93f9', '#ff6b6b', '#ffd700'];
    const CW = 36, CH = 48, DPR = 2;

    const ARCHETYPES = [
        { name: 'worker', walk: .35, jump: .10, dance: .05, sit: .18, sleep: .08, wave: .12, hat: true, spd: 1.0, jmp: 5.5 },
        { name: 'dancer', walk: .12, jump: .08, dance: .45, sit: .05, sleep: .05, wave: .15, hat: false, spd: 1.1, jmp: 5.0 },
        { name: 'explorer', walk: .20, jump: .38, dance: .05, sit: .05, sleep: .05, wave: .10, hat: false, spd: 1.4, jmp: 7.5 },
        { name: 'sleeper', walk: .10, jump: .05, dance: .05, sit: .30, sleep: .35, wave: .05, hat: false, spd: 0.7, jmp: 4.5 },
        { name: 'social', walk: .18, jump: .05, dance: .15, sit: .12, sleep: .05, wave: .35, hat: false, spd: 0.9, jmp: 5.0 },
    ];

    function scanPlatforms() {
        platforms = [];
        const sels = '.bento-card, .card, .tech-panel, .key-features, .stat-item, .code-viewer, .equation-block, .calc-panel, .iteration-display, .canvas-panel, .project-outcome';
        document.querySelectorAll(sels).forEach(function (el) {
            var r = el.getBoundingClientRect();
            if (r.top > -20 && r.bottom < window.innerHeight + 20 && r.width > 50 && r.height > 25) {
                platforms.push({ l: r.left + 3, r: r.right - 3, t: r.top });
            }
        });
        platforms.push({ l: 0, r: window.innerWidth, t: window.innerHeight - 55 });
        platforms.sort(function (a, b) { return a.t - b.t; });
    }

    function lerpPose(pose, tgt, s) {
        pose.leftLeg += (tgt.leftLeg - pose.leftLeg) * s;
        pose.rightLeg += (tgt.rightLeg - pose.rightLeg) * s;
        pose.leftArm += (tgt.leftArm - pose.leftArm) * s;
        pose.rightArm += (tgt.rightArm - pose.rightArm) * s;
        pose.bodyTilt += (tgt.bodyTilt - pose.bodyTilt) * s;
        pose.lookDir += (tgt.lookDir - pose.lookDir) * s;
    }

    function drawDude(ctx, w, h, pose, color) {
        ctx.clearRect(0, 0, w, h);
        var cx = w / 2, D = DPR;
        var headR = 5 * D, headY = 10 * D, neckY = headY + headR;
        var bodyLen = 13 * D, armOff = 4 * D, armLen = 9 * D, legLen = 11 * D;

        ctx.fillStyle = 'rgba(255,77,0,0.1)';
        ctx.beginPath();
        ctx.ellipse(cx, h - 3 * D, 7 * D, 2 * D, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = 4 * D;
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 1.8 * D;
        ctx.lineCap = 'round';

        ctx.save();
        ctx.translate(cx, neckY);
        ctx.rotate(pose.bodyTilt);

        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, bodyLen); ctx.stroke();

        var drawLeg = function (angle) {
            var lx = Math.sin(angle) * legLen, ly = Math.cos(angle) * legLen;
            ctx.beginPath(); ctx.moveTo(0, bodyLen); ctx.lineTo(lx, bodyLen + ly); ctx.stroke();
            var fd = angle > 0.05 ? 1 : (angle < -0.05 ? -1 : 0.5);
            ctx.beginPath(); ctx.moveTo(lx, bodyLen + ly); ctx.lineTo(lx + fd * 3 * D, bodyLen + ly); ctx.stroke();
        };
        drawLeg(pose.leftLeg);
        drawLeg(pose.rightLeg);

        var drawArm = function (angle, side) {
            var ax = side * Math.cos(angle) * armLen, ay = Math.sin(angle) * armLen;
            ctx.beginPath(); ctx.moveTo(0, armOff); ctx.lineTo(ax, armOff + ay); ctx.stroke();
        };
        drawArm(pose.leftArm, -1);
        drawArm(pose.rightArm, 1);

        ctx.restore();

        ctx.beginPath(); ctx.arc(cx, headY, headR, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = '#0d0d0d';
        ctx.beginPath(); ctx.arc(cx - 2 * D + pose.lookDir, headY - 0.5 * D, 1 * D, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 2 * D + pose.lookDir, headY - 0.5 * D, 1 * D, 0, Math.PI * 2); ctx.fill();

        if (pose.hasHat) {
            ctx.fillStyle = color;
            var brim = headR + 2 * D;
            ctx.beginPath();
            ctx.moveTo(cx - brim, headY - headR + 2 * D);
            ctx.lineTo(cx + brim, headY - headR + 2 * D);
            ctx.lineTo(cx + headR * 0.6, headY - headR - 4 * D);
            ctx.lineTo(cx - headR * 0.6, headY - headR - 4 * D);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    }

    // Persistence: restore dudes on page load
    if (viewToggle && localStorage.getItem('jl-dudes') === 'on') {
        viewToggle.classList.add('render');
        dudesActive = true;
        setTimeout(function () { spawnDudes(true); }, 600);
    }

    if (viewToggle) {
        viewToggle.addEventListener('click', function () {
            viewToggle.classList.toggle('render');
            if (!dudesActive) {
                spawnDudes(false);
                dudesActive = true;
                localStorage.setItem('jl-dudes', 'on');
            } else {
                popAllDudes();
                dudesActive = false;
                localStorage.setItem('jl-dudes', 'off');
            }
        });
    }

    function spawnDudes(fromPageLoad) {
        scanPlatforms();
        var count = 5 + Math.floor(Math.random() * 3);
        for (var i = 0; i < count; i++) {
            (function (idx) {
                setTimeout(function () {
                    var sx, sy;
                    if (fromPageLoad) {
                        sx = 100 + Math.random() * (window.innerWidth - 200);
                        sy = -20 - Math.random() * 60;
                    } else {
                        var rect = viewToggle.getBoundingClientRect();
                        sx = rect.left + rect.width / 2;
                        sy = rect.top;
                    }
                    activeDudes.push(createDude(sx, sy, idx));
                }, idx * 180);
            })(i);
        }
    }

    function createDude(startX, startY, index) {
        var canvas = document.createElement('canvas');
        canvas.width = CW * DPR; canvas.height = CH * DPR;
        canvas.style.cssText = 'position:fixed;z-index:99998;pointer-events:none;width:' + CW + 'px;height:' + CH + 'px;';
        document.body.appendChild(canvas);
        var ctx = canvas.getContext('2d');
        var color = DUDE_COLORS[index % DUDE_COLORS.length];
        var arch = ARCHETYPES[index % ARCHETYPES.length];
        var pose = { leftLeg: 0, rightLeg: 0, leftArm: 0.3, rightArm: 0.3, bodyTilt: 0, lookDir: 0, hasHat: arch.hat };
        var tgt = { leftLeg: 0, rightLeg: 0, leftArm: 0.3, rightArm: 0.3, bodyTilt: 0, lookDir: 0 };

        var dude = {
            canvas: canvas, ctx: ctx, color: color, pose: pose, tgt: tgt, arch: arch,
            x: startX, y: startY,
            vx: (Math.random() - 0.5) * 7, vy: -3 - Math.random() * 4,
            grounded: false, action: 'fall', actionTimer: 0,
            dir: Math.random() > 0.5 ? 1 : -1,
            alive: true, frame: 0, scale: 0,
            platform: null, scanC: Math.floor(Math.random() * 30)
        };

        function pickAction() {
            var r = Math.random(), cum = 0;
            var acts = [['walk', arch.walk], ['jump', arch.jump], ['dance', arch.dance],
            ['sit', arch.sit], ['sleep', arch.sleep], ['wave', arch.wave]];
            for (var i = 0; i < acts.length; i++) {
                cum += acts[i][1];
                if (r < cum) return acts[i][0];
            }
            return 'walk';
        }

        function tick() {
            if (!dude.alive) return;
            dude.scanC++;
            if (dude.scanC % 40 === 0) scanPlatforms();
            if (dude.scale < 1) dude.scale = Math.min(1, dude.scale + 0.06);

            if (!dude.grounded) {
                dude.vy += 0.35;
                dude.x += dude.vx;
                dude.y += dude.vy;
                tgt.leftLeg = -0.3; tgt.rightLeg = 0.3;
                tgt.leftArm = -1.0; tgt.rightArm = -1.0;
                tgt.bodyTilt = dude.vx * 0.02;

                for (var pi = 0; pi < platforms.length; pi++) {
                    var p = platforms[pi];
                    if (dude.vy > 0 && dude.y >= p.t && dude.y - dude.vy < p.t + 8 &&
                        dude.x >= p.l && dude.x <= p.r) {
                        dude.y = p.t; dude.vy = 0; dude.vx = 0;
                        dude.grounded = true; dude.platform = p;
                        dude.action = 'idle'; dude.actionTimer = 15 + Math.random() * 30;
                        break;
                    }
                }
            } else {
                if (dude.platform && (dude.x < dude.platform.l - 2 || dude.x > dude.platform.r + 2)) {
                    dude.grounded = false; dude.platform = null; dude.vy = 0.5;
                }

                dude.actionTimer--;
                if (dude.actionTimer <= 0) {
                    var act = pickAction();
                    dude.action = act;
                    if (act === 'walk') { dude.dir = Math.random() > 0.5 ? 1 : -1; dude.actionTimer = 80 + Math.random() * 180; }
                    else if (act === 'jump') { dude.vy = -arch.jmp; dude.vx = (Math.random() - 0.5) * 5; dude.grounded = false; dude.platform = null; }
                    else if (act === 'dance') { dude.actionTimer = 90 + Math.random() * 100; }
                    else if (act === 'wave') { dude.actionTimer = 50 + Math.random() * 50; }
                    else if (act === 'sit') { dude.actionTimer = 120 + Math.random() * 140; }
                    else if (act === 'sleep') { dude.actionTimer = 160 + Math.random() * 160; }
                }

                var f = dude.frame;
                var gY = dude.platform ? dude.platform.t : (window.innerHeight - 55);

                if (dude.action === 'idle') {
                    tgt.leftLeg = 0; tgt.rightLeg = 0;
                    tgt.leftArm = 0.3 + Math.sin(f * 0.04) * 0.05;
                    tgt.rightArm = 0.3 + Math.sin(f * 0.04 + 1) * 0.05;
                    tgt.bodyTilt = Math.sin(f * 0.02) * 0.01;
                    tgt.lookDir = Math.sin(f * 0.015) * 1.5 * DPR;
                    dude.y = gY;
                } else if (dude.action === 'walk') {
                    dude.x += dude.dir * arch.spd;
                    var edge = dude.platform;
                    if (edge && edge.r < window.innerWidth) {
                        if (dude.x < edge.l + 5) { dude.x = edge.l + 5; dude.dir = 1; }
                        if (dude.x > edge.r - 5) { dude.x = edge.r - 5; dude.dir = -1; }
                    } else {
                        if (dude.x < 30) { dude.x = 30; dude.dir = 1; }
                        if (dude.x > window.innerWidth - 30) { dude.x = window.innerWidth - 30; dude.dir = -1; }
                    }
                    var ws = f * 0.15 * arch.spd;
                    tgt.leftLeg = Math.sin(ws) * 0.5; tgt.rightLeg = -Math.sin(ws) * 0.5;
                    tgt.leftArm = 0.3 - Math.sin(ws) * 0.4; tgt.rightArm = 0.3 + Math.sin(ws) * 0.4;
                    tgt.bodyTilt = Math.sin(ws) * 0.03;
                    dude.y = gY + Math.sin(ws * 2) * 1;
                    tgt.lookDir = dude.dir * 1.5 * DPR;
                } else if (dude.action === 'dance') {
                    var ds = f * 0.13;
                    tgt.leftLeg = Math.sin(ds) * 0.35; tgt.rightLeg = -Math.sin(ds) * 0.35;
                    tgt.leftArm = -1.2 + Math.sin(ds * 1.5) * 0.5; tgt.rightArm = -1.2 - Math.sin(ds * 1.5) * 0.5;
                    tgt.bodyTilt = Math.sin(ds * 0.7) * 0.12;
                    dude.y = gY + Math.sin(ds * 2) * 3;
                    dude.x += Math.sin(ds * 0.5) * 0.6;
                    tgt.lookDir = Math.sin(ds) * 2 * DPR;
                } else if (dude.action === 'wave') {
                    tgt.leftLeg = 0; tgt.rightLeg = 0; tgt.leftArm = 0.3;
                    tgt.rightArm = -1.5 + Math.sin(f * 0.18) * 0.4;
                    tgt.bodyTilt = 0.02; tgt.lookDir = 2 * DPR;
                    dude.y = gY;
                } else if (dude.action === 'sit') {
                    tgt.leftLeg = Math.PI * 0.4; tgt.rightLeg = Math.PI * 0.35;
                    tgt.leftArm = 0.2; tgt.rightArm = 0.2;
                    tgt.bodyTilt = 0.06; dude.y = gY + 5;
                    tgt.lookDir = Math.sin(f * 0.025) * 2 * DPR;
                } else if (dude.action === 'sleep') {
                    tgt.leftLeg = Math.PI * 0.35; tgt.rightLeg = Math.PI * 0.3;
                    tgt.leftArm = 0.5; tgt.rightArm = 0.5;
                    tgt.bodyTilt = 0.15; dude.y = gY + 6; tgt.lookDir = 0;
                    if (f % 50 === 0) spawnZzz(dude);
                }
            }

            lerpPose(pose, tgt, 0.12);
            dude.frame++;
            var flip = dude.dir === -1 ? 'scaleX(-1)' : '';
            canvas.style.left = (dude.x - CW / 2) + 'px';
            canvas.style.top = (dude.y - CH + 8) + 'px';
            canvas.style.transform = flip + ' scale(' + dude.scale + ')';
            drawDude(ctx, CW * DPR, CH * DPR, pose, color);
            requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        return dude;
    }

    function spawnZzz(dude) {
        var z = document.createElement('div');
        z.textContent = 'z';
        z.style.cssText = 'position:fixed;left:' + (dude.x + 10) + 'px;top:' + (dude.y - 20) + 'px;color:' + dude.color + ';font-family:Space Mono,monospace;font-size:10px;pointer-events:none;z-index:99997;opacity:0.7;';
        document.body.appendChild(z);
        var s = performance.now(), dy = 0;
        (function az(now) {
            var t = now - s;
            if (t > 1200 || !dude.alive) { z.remove(); return; }
            dy -= 0.5;
            z.style.transform = 'translateY(' + dy + 'px) rotate(' + Math.sin(t * 0.005) * 15 + 'deg)';
            z.style.opacity = Math.max(0, 0.7 - t / 1500);
            requestAnimationFrame(az);
        })(performance.now());
    }

    function popDude(dude) {
        dude.alive = false;
        var x = dude.x, y = dude.y;
        dude.canvas.remove();
        var cols = ['#ff4d00', '#ff8c00', '#00f0ff', '#ffd700', '#51cf66', '#bd93f9'];
        var shp = ['\u25A0', '\u25B2', '\u25CF', '\u25C6', '\u2605'];
        for (var i = 0; i < 18; i++) {
            var p = document.createElement('div');
            p.textContent = shp[Math.floor(Math.random() * shp.length)];
            p.style.cssText = 'position:fixed;left:' + x + 'px;top:' + (y - 10) + 'px;z-index:99999;color:' + cols[Math.floor(Math.random() * cols.length)] + ';font-size:' + (5 + Math.random() * 8) + 'px;pointer-events:none;';
            document.body.appendChild(p);
            var vx0 = (Math.random() - .5) * 12, vy0 = -4 - Math.random() * 7;
            (function (el, vxI, vyI) {
                var px = 0, py = 0, ro = 0, sp = (Math.random() - .5) * 600, st = performance.now();
                var cvx = vxI, cvy = vyI;
                (function a(now) {
                    var t = now - st;
                    if (t > 1500) { el.remove(); return; }
                    cvy += 0.22; cvx *= 0.98; px += cvx; py += cvy; ro += sp * 0.016;
                    el.style.transform = 'translate(' + px + 'px,' + py + 'px) rotate(' + ro + 'deg)';
                    el.style.opacity = 1 - t / 1500;
                    requestAnimationFrame(a);
                })(performance.now());
            })(p, vx0, vy0);
        }
    }

    function popAllDudes() {
        for (var i = 0; i < activeDudes.length; i++) {
            (function (d, delay) {
                setTimeout(function () { popDude(d); }, delay);
            })(activeDudes[i], i * 120);
        }
        activeDudes = [];
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
    lightboxOverlay.innerHTML = `
            <button class="lightbox-close">&times;</button>
            <button class="lightbox-btn lightbox-prev">&#10094;</button>
            <img class="lightbox-content" src="" alt="Full View">
            <button class="lightbox-btn lightbox-next">&#10095;</button>
        `;
    document.body.appendChild(lightboxOverlay);

    const lightboxImg = lightboxOverlay.querySelector('.lightbox-content');
    const lightboxClose = lightboxOverlay.querySelector('.lightbox-close');
    const lightboxPrev = lightboxOverlay.querySelector('.lightbox-prev');
    const lightboxNext = lightboxOverlay.querySelector('.lightbox-next');

    let galleryImages = [];
    let currentIndex = 0;

    const updateLightbox = () => {
        if (galleryImages.length > 0) {
            lightboxImg.src = galleryImages[currentIndex].src;
            lightboxImg.alt = galleryImages[currentIndex].alt;
        }
    };

    const showNext = (e) => {
        if (e) e.stopPropagation();
        if (galleryImages.length > 0) {
            currentIndex = (currentIndex + 1) % galleryImages.length;
            updateLightbox();
        }
    };

    const showPrev = (e) => {
        if (e) e.stopPropagation();
        if (galleryImages.length > 0) {
            currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
            updateLightbox();
        }
    };

    // Open
    document.querySelectorAll('.gallery-item img, .bento-image').forEach(img => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', () => {
            // Collect images globally or just from siblings, here we do globally within reasonable selectors
            galleryImages = Array.from(document.querySelectorAll('.gallery-item img, .bento-image'));
            currentIndex = galleryImages.indexOf(img);
            if (currentIndex === -1) currentIndex = 0;

            updateLightbox();
            lightboxOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    lightboxPrev.addEventListener('click', showPrev);
    lightboxNext.addEventListener('click', showNext);

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
        if (!lightboxOverlay.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') showNext();
        if (e.key === 'ArrowLeft') showPrev();
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
