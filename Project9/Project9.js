// Project 9 — Foam Model Aircraft Interactive Elements
(function () {
    'use strict';

    // ============================================================
    //  1. FUSELAGE PROFILE RENDERER
    // ============================================================
    const fuselageCanvas = document.getElementById('fuselage-canvas');
    if (fuselageCanvas) {
        const ctx = fuselageCanvas.getContext('2d');
        const slider = document.getElementById('param-t');
        const coordsEl = document.getElementById('canvas-coords');
        const tValEl = document.getElementById('param-t-val');
        const toggleCross = document.getElementById('toggle-cross');
        const animateBtn = document.getElementById('animate-btn');

        let showCross = true;
        let animating = false;
        let animId = null;

        // Parametric functions
        function fuselageX(t) { return 5 * Math.pow(Math.cos(t / 2), 2) * Math.sin(t); }
        function fuselageY(t) { return 12 * Math.cos(t); }

        function drawFuselage(tCurrent) {
            const W = fuselageCanvas.width;
            const H = fuselageCanvas.height;
            const dpr = window.devicePixelRatio || 1;

            // Handle HiDPI
            fuselageCanvas.width = fuselageCanvas.clientWidth * dpr;
            fuselageCanvas.height = fuselageCanvas.clientHeight * dpr;
            const cW = fuselageCanvas.width;
            const cH = fuselageCanvas.height;
            ctx.scale(dpr, dpr);
            const w = fuselageCanvas.clientWidth;
            const h = fuselageCanvas.clientHeight;

            ctx.clearRect(0, 0, w, h);

            // Grid
            ctx.strokeStyle = 'rgba(255, 77, 0, 0.06)';
            ctx.lineWidth = 1;
            const gridSize = 30;
            for (let x = 0; x < w; x += gridSize) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
            }
            for (let y = 0; y < h; y += gridSize) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
            }

            // Transform: center, scale
            const cx = w * 0.5;
            const cy = h * 0.5;
            const scale = Math.min(w, h) / 32;

            // Axes
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();

            // Axis labels
            ctx.font = '11px "Space Mono", monospace';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillText('x', w - 16, cy - 8);
            ctx.fillText('y', cx + 8, 16);

            // Draw full curve (outline)
            ctx.strokeStyle = 'rgba(255, 77, 0, 0.2)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let i = 0; i <= 200; i++) {
                const t = (i / 200) * 2 * Math.PI;
                const px = cx + fuselageX(t) * scale;
                const py = cy - fuselageY(t) * scale;
                if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.stroke();

            // Fill the shape with gradient
            const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 14 * scale);
            grad.addColorStop(0, 'rgba(255, 77, 0, 0.08)');
            grad.addColorStop(1, 'rgba(255, 77, 0, 0.01)');
            ctx.fillStyle = grad;
            ctx.fill();

            // Draw traced portion up to tCurrent
            ctx.strokeStyle = '#ff4d00';
            ctx.lineWidth = 2.5;
            ctx.shadowColor = 'rgba(255, 77, 0, 0.5)';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            const steps = Math.floor((tCurrent / (2 * Math.PI)) * 200);
            for (let i = 0; i <= steps; i++) {
                const t = (i / 200) * 2 * Math.PI;
                const px = cx + fuselageX(t) * scale;
                const py = cy - fuselageY(t) * scale;
                if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Current point marker
            const curX = fuselageX(tCurrent);
            const curY = fuselageY(tCurrent);
            const px = cx + curX * scale;
            const py = cy - curY * scale;

            ctx.fillStyle = '#ff4d00';
            ctx.beginPath();
            ctx.arc(px, py, 6, 0, 2 * Math.PI);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 77, 0, 0.5)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(px, py, 12, 0, 2 * Math.PI);
            ctx.stroke();

            // Cross-section circle (radius = x value at current t, representing the body-of-revolution)
            if (showCross && Math.abs(curX) > 0.1) {
                const r = Math.abs(curX) * scale;
                // Draw on the right side
                const crossCx = w - 80;
                const crossCy = h * 0.5;

                // Cross section background
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(crossCx - r - 15, crossCy - r - 25, r * 2 + 30, r * 2 + 40);
                ctx.strokeStyle = 'rgba(255, 77, 0, 0.3)';
                ctx.setLineDash([4, 4]);
                ctx.strokeRect(crossCx - r - 15, crossCy - r - 25, r * 2 + 30, r * 2 + 40);
                ctx.setLineDash([]);

                // Label
                ctx.font = '10px "Space Mono", monospace';
                ctx.fillStyle = 'rgba(255, 77, 0, 0.6)';
                ctx.fillText('CROSS SECTION', crossCx - 40, crossCy - r - 12);

                // Circle
                ctx.strokeStyle = '#ff8c00';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(crossCx, crossCy, r, 0, 2 * Math.PI);
                ctx.stroke();

                // Fill
                ctx.fillStyle = 'rgba(255, 140, 0, 0.1)';
                ctx.fill();

                // Radius line
                ctx.strokeStyle = 'rgba(255, 140, 0, 0.5)';
                ctx.lineWidth = 1;
                ctx.setLineDash([3, 3]);
                ctx.beginPath();
                ctx.moveTo(crossCx, crossCy);
                ctx.lineTo(crossCx + r, crossCy);
                ctx.stroke();
                ctx.setLineDash([]);

                // Radius label
                ctx.fillStyle = '#ff8c00';
                ctx.font = '10px "Space Mono", monospace';
                ctx.fillText(`r=${Math.abs(curX).toFixed(1)}″`, crossCx + r / 2 - 15, crossCy - 5);
            }

            // Dimension annotations
            ctx.font = '10px "Space Mono", monospace';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fillText('24″ length', cx - 25, cy + 14 * scale + 20);
            ctx.fillText('10″ max ⌀', cx + 6 * scale + 5, cy - 4);

            // Update HUD
            if (coordsEl) {
                coordsEl.textContent = `t = ${tCurrent.toFixed(2)} | x = ${curX.toFixed(2)} | y = ${curY.toFixed(2)}`;
            }
            if (tValEl) {
                tValEl.textContent = tCurrent.toFixed(2);
            }
        }

        // Slider control
        slider.addEventListener('input', () => {
            const t = (parseInt(slider.value) / 100) * Math.PI;
            drawFuselage(t);
        });

        // Toggle cross section
        toggleCross.addEventListener('click', () => {
            showCross = !showCross;
            toggleCross.textContent = showCross ? 'ON' : 'OFF';
            toggleCross.classList.toggle('active', showCross);
            const t = (parseInt(slider.value) / 100) * Math.PI;
            drawFuselage(t);
        });

        // Animate
        animateBtn.addEventListener('click', () => {
            if (animating) {
                animating = false;
                animateBtn.textContent = 'PLAY';
                if (animId) cancelAnimationFrame(animId);
                return;
            }
            animating = true;
            animateBtn.textContent = 'STOP';
            slider.value = 0;

            const animate = () => {
                if (!animating) return;
                let val = parseInt(slider.value) + 1;
                if (val > 628) { val = 0; animating = false; animateBtn.textContent = 'PLAY'; }
                slider.value = val;
                const t = (val / 100) * Math.PI;
                drawFuselage(t);
                if (animating) animId = requestAnimationFrame(animate);
            };
            animId = requestAnimationFrame(animate);
        });

        // Initial draw — animate on load
        setTimeout(() => {
            animateBtn.click();
        }, 800);

        // Redraw on resize
        window.addEventListener('resize', () => {
            const t = (parseInt(slider.value) / 100) * Math.PI;
            drawFuselage(t);
        });
    }

    // ============================================================
    //  2. DESIGN ITERATION VIEWER
    // ============================================================
    const iterCanvas = document.getElementById('iteration-canvas');
    if (iterCanvas) {
        const ictx = iterCanvas.getContext('2d');
        const specsEl = document.getElementById('iter-specs');
        const tabs = document.querySelectorAll('.iter-tab');

        const iterations = [
            {
                name: 'V1 — Simple Glider',
                desc: 'Initial concept: a basic rectangular fuselage with flat plate wings. Simple to build but aerodynamically inefficient.',
                specs: [
                    { label: 'Fuselage', value: 'Rectangular box', change: null },
                    { label: 'Wing Type', value: 'Flat plate', change: null },
                    { label: 'Sweep', value: '0°', change: null },
                    { label: 'Dihedral', value: '0°', change: null },
                    { label: 'Est. Weight', value: '~12 oz', change: null },
                    { label: 'Wing Loading', value: '~18 oz/ft²', change: null },
                    { label: 'Verdict', value: 'Too heavy, poor lift', change: null },
                ],
                draw: (ctx, w, h) => {
                    const cx = w / 2, cy = h / 2;
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.lineWidth = 1;
                    // Simple rectangular fuselage
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
                    ctx.strokeStyle = '#ff4d00';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.rect(cx - 120, cy - 20, 240, 40);
                    ctx.fill(); ctx.stroke();
                    // Flat wings
                    ctx.beginPath();
                    ctx.rect(cx - 40, cy - 80, 80, 60);
                    ctx.fill(); ctx.stroke();
                    ctx.beginPath();
                    ctx.rect(cx - 40, cy + 20, 80, 60);
                    ctx.fill(); ctx.stroke();
                    // Tail
                    ctx.beginPath();
                    ctx.rect(cx + 100, cy - 40, 30, 80);
                    ctx.fill(); ctx.stroke();
                    // Annotations
                    ctx.font = '10px "Space Mono", monospace';
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                    ctx.fillText('RECTANGULAR', cx - 35, cy + 5);
                    ctx.fillText('FLAT PLATE', cx - 70, cy - 45);
                    ctx.fillText('TOP VIEW', 10, 20);
                }
            },
            {
                name: 'V2 — Swept Wing',
                desc: 'Added sweep angle for stability and switched to KFm-2 airfoil. Tapered the fuselage for lower drag. Better, but still heavy.',
                specs: [
                    { label: 'Fuselage', value: 'Tapered cylinder', change: 'improved' },
                    { label: 'Wing Type', value: 'KFm-2', change: 'new' },
                    { label: 'Sweep', value: '6°', change: 'new' },
                    { label: 'Dihedral', value: '4°', change: 'new' },
                    { label: 'Est. Weight', value: '~10 oz', change: 'improved' },
                    { label: 'Wing Loading', value: '~14 oz/ft²', change: 'improved' },
                    { label: 'Verdict', value: 'Good but improvable', change: null },
                ],
                draw: (ctx, w, h) => {
                    const cx = w / 2, cy = h / 2;
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
                    ctx.strokeStyle = '#ff8c00';
                    ctx.lineWidth = 2;
                    // Tapered fuselage
                    ctx.beginPath();
                    ctx.moveTo(cx - 130, cy - 10);
                    ctx.lineTo(cx + 100, cy - 18);
                    ctx.lineTo(cx + 130, cy);
                    ctx.lineTo(cx + 100, cy + 18);
                    ctx.lineTo(cx - 130, cy + 10);
                    ctx.closePath();
                    ctx.fill(); ctx.stroke();
                    // Swept wings
                    ctx.beginPath();
                    ctx.moveTo(cx - 20, cy - 10);
                    ctx.lineTo(cx - 50, cy - 85);
                    ctx.lineTo(cx + 20, cy - 75);
                    ctx.lineTo(cx + 10, cy - 10);
                    ctx.closePath();
                    ctx.fill(); ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(cx - 20, cy + 10);
                    ctx.lineTo(cx - 50, cy + 85);
                    ctx.lineTo(cx + 20, cy + 75);
                    ctx.lineTo(cx + 10, cy + 10);
                    ctx.closePath();
                    ctx.fill(); ctx.stroke();
                    // Tail
                    ctx.beginPath();
                    ctx.moveTo(cx + 110, cy - 30);
                    ctx.lineTo(cx + 130, cy - 35);
                    ctx.lineTo(cx + 130, cy + 35);
                    ctx.lineTo(cx + 110, cy + 30);
                    ctx.closePath();
                    ctx.fill(); ctx.stroke();
                    // Annotations
                    ctx.font = '10px "Space Mono", monospace';
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                    ctx.fillText('6° SWEEP', cx - 80, cy - 55);
                    ctx.fillText('KFm-2', cx - 60, cy - 40);
                    ctx.fillText('TAPERED', cx - 30, cy + 5);
                    ctx.fillText('TOP VIEW', 10, 20);
                }
            },
            {
                name: 'V3 — Final Design',
                desc: 'Parametric teardrop fuselage defined by equations, optimized winglets, full aero analysis. The actual aircraft design.',
                specs: [
                    { label: 'Fuselage', value: 'Parametric teardrop', change: 'improved' },
                    { label: 'Wing Type', value: 'KFm-2 + Winglets', change: 'improved' },
                    { label: 'Sweep', value: '6°', change: null },
                    { label: 'Dihedral', value: '6°', change: 'improved' },
                    { label: 'Total Weight', value: '8.64 oz', change: 'improved' },
                    { label: 'Wing Loading', value: '~12 oz/ft²', change: 'improved' },
                    { label: 'Verdict', value: '✓ Flight feasible!', change: 'improved' },
                ],
                draw: (ctx, w, h) => {
                    const cx = w / 2, cy = h / 2;
                    ctx.fillStyle = 'rgba(255, 77, 0, 0.06)';
                    ctx.strokeStyle = '#ff4d00';
                    ctx.lineWidth = 2.5;
                    // Teardrop fuselage (top view — use the parametric shape projected)
                    ctx.beginPath();
                    for (let i = 0; i <= 100; i++) {
                        const t = (i / 100) * 2 * Math.PI;
                        const fy = 12 * Math.cos(t);
                        const fx = 5 * Math.pow(Math.cos(t / 2), 2) * Math.sin(t);
                        const px = cx + fy * 8;  // y becomes horizontal in top view
                        const py = cy + fx * 5;  // x becomes the width
                        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
                    }
                    ctx.closePath();
                    ctx.fill(); ctx.stroke();
                    // Wings with sweep and winglets
                    ctx.strokeStyle = '#ff8c00';
                    ctx.lineWidth = 2;
                    ctx.fillStyle = 'rgba(255, 140, 0, 0.05)';
                    // Top wing
                    ctx.beginPath();
                    ctx.moveTo(cx - 15, cy - 22);
                    ctx.lineTo(cx - 45, cy - 90);
                    ctx.lineTo(cx - 40, cy - 95); // winglet
                    ctx.lineTo(cx + 25, cy - 80);
                    ctx.lineTo(cx + 15, cy - 22);
                    ctx.closePath();
                    ctx.fill(); ctx.stroke();
                    // Bottom wing
                    ctx.beginPath();
                    ctx.moveTo(cx - 15, cy + 22);
                    ctx.lineTo(cx - 45, cy + 90);
                    ctx.lineTo(cx - 40, cy + 95); // winglet
                    ctx.lineTo(cx + 25, cy + 80);
                    ctx.lineTo(cx + 15, cy + 22);
                    ctx.closePath();
                    ctx.fill(); ctx.stroke();
                    // Tail
                    ctx.strokeStyle = '#ff4d00';
                    ctx.lineWidth = 1.5;
                    // Horizontal stabilizer
                    ctx.beginPath();
                    ctx.moveTo(cx + 85, cy - 25);
                    ctx.lineTo(cx + 95, cy - 30);
                    ctx.lineTo(cx + 95, cy + 30);
                    ctx.lineTo(cx + 85, cy + 25);
                    ctx.closePath();
                    ctx.stroke();
                    // Annotations
                    ctx.font = '10px "Space Mono", monospace';
                    ctx.fillStyle = '#ff4d00';
                    ctx.fillText('PARAMETRIC', cx - 25, cy + 5);
                    ctx.fillStyle = 'rgba(255, 140, 0, 0.7)';
                    ctx.fillText('WINGLET', cx - 62, cy - 90);
                    ctx.fillText('6° SWEEP', cx - 70, cy - 55);
                    ctx.fillText('KFm-2', cx - 60, cy - 42);
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                    ctx.fillText('TOP VIEW', 10, 20);
                    // Dimension lines
                    ctx.setLineDash([3, 3]);
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(cx - 100, cy + 110);
                    ctx.lineTo(cx + 100, cy + 110);
                    ctx.stroke();
                    ctx.setLineDash([]);
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                    ctx.fillText('24″', cx - 8, cy + 125);
                }
            }
        ];

        let currentIter = 0;

        function drawIteration(index) {
            const dpr = window.devicePixelRatio || 1;
            iterCanvas.width = iterCanvas.clientWidth * dpr;
            iterCanvas.height = iterCanvas.clientHeight * dpr;
            ictx.scale(dpr, dpr);
            const w = iterCanvas.clientWidth;
            const h = iterCanvas.clientHeight;
            ictx.clearRect(0, 0, w, h);

            // Grid
            ictx.strokeStyle = 'rgba(255, 77, 0, 0.04)';
            ictx.lineWidth = 1;
            for (let x = 0; x < w; x += 25) {
                ictx.beginPath(); ictx.moveTo(x, 0); ictx.lineTo(x, h); ictx.stroke();
            }
            for (let y = 0; y < h; y += 25) {
                ictx.beginPath(); ictx.moveTo(0, y); ictx.lineTo(w, y); ictx.stroke();
            }

            iterations[index].draw(ictx, w, h);

            // Update specs
            const iter = iterations[index];
            let html = '';
            iter.specs.forEach(s => {
                const changeHtml = s.change
                    ? `<span class="iter-change ${s.change}">${s.change === 'improved' ? '↑' : '★'}</span>`
                    : '';
                html += `<div class="iter-spec-row">
          <span class="iter-spec-label">${s.label}</span>
          <span class="iter-spec-value">${s.value}${changeHtml}</span>
        </div>`;
            });
            html += `<div class="iter-desc">${iter.desc}</div>`;
            specsEl.innerHTML = html;
        }

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentIter = parseInt(tab.dataset.iter) - 1;
                drawIteration(currentIter);
            });
        });

        // Initial
        setTimeout(() => drawIteration(0), 200);
        window.addEventListener('resize', () => drawIteration(currentIter));
    }

    // ============================================================
    //  3. AERODYNAMIC CALCULATOR
    // ============================================================
    const calcInputs = ['calc-wing-area', 'calc-weight', 'calc-density', 'calc-wingspan', 'calc-fuse-vol'];
    const calcEls = {};
    calcInputs.forEach(id => { calcEls[id] = document.getElementById(id); });

    function updateCalc() {
        const wingArea = parseFloat(calcEls['calc-wing-area']?.value) || 108;
        const weight = parseFloat(calcEls['calc-weight']?.value) || 8.64;
        const density = parseFloat(calcEls['calc-density']?.value) || 1.55;
        const wingspan = parseFloat(calcEls['calc-wingspan']?.value) || 18;
        const fuseVol = parseFloat(calcEls['calc-fuse-vol']?.value) || 377;

        // Wing loading: oz/ft²
        const wingAreaFt2 = wingArea / 144;
        const wingLoading = weight / wingAreaFt2;

        // Aspect ratio
        const aspectRatio = (wingspan * wingspan) / wingArea;

        // Fuselage weight from density and volume
        const fuseVolFt3 = fuseVol / 1728;
        const fuseWeightLbs = fuseVolFt3 * density;
        const fuseWeightOz = fuseWeightLbs * 16;

        // Stall speed estimate (simplified): V_stall ≈ sqrt(2W / (ρ * S * Cl_max))
        // Using simplified empirical: V ≈ 4 * sqrt(wing_loading_oz_per_ft2)
        const stallSpeed = 4 * Math.sqrt(wingLoading);

        // Update DOM
        const set = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        set('res-wing-loading', wingLoading.toFixed(2) + ' oz/ft²');
        set('res-aspect-ratio', aspectRatio.toFixed(2));
        set('res-fuse-weight', fuseWeightOz.toFixed(2) + ' oz');
        set('res-stall-speed', stallSpeed.toFixed(1) + ' ft/s');

        // Verdict
        const verdict = document.getElementById('calc-verdict');
        if (verdict) {
            const feasible = wingLoading < 20 && stallSpeed < 40;
            verdict.className = 'calc-verdict ' + (feasible ? 'good' : 'bad');
            verdict.querySelector('.verdict-icon').textContent = feasible ? '✓' : '✗';
            verdict.querySelector('.verdict-text').textContent = feasible ? 'FLIGHT FEASIBLE' : 'FLIGHT UNLIKELY';
        }
    }

    calcInputs.forEach(id => {
        const el = calcEls[id];
        if (el) el.addEventListener('input', updateCalc);
    });

    // Initial calc
    updateCalc();

})();
