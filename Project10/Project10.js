// =============================================================
//  Project 10 — DSP Engine
//  PORTED DIRECTLY FROM Jack Lambert's Python DSP library
//  Source: github.com/thebestjacklambert — DSP/trig.py & signals.py
// =============================================================
(function () {
    'use strict';

    // =============================================================
    //  trig.py → JavaScript (Taylor series, no Math.sin/cos)
    // =============================================================
    const pi = 3.14159265359159;

    // factorial
    function fac(x) {
        let y = 1;
        for (let i = 1; i <= x; i++) y *= i;
        return y;
    }

    // mod along pi
    function wrap(a) {
        a = (a + pi) % (2 * pi) - pi;
        return a;
    }

    // cosine — Taylor series, 25 terms
    function cos(x) {
        x = wrap(x);
        let y = 0;
        for (let i = 0; i < 25; i++) {
            y += (1 / fac(2 * i)) * Math.pow(x, 2 * i) * Math.pow(-1, i);
        }
        return y;
    }

    // sine — Taylor series, 25 terms
    function sin(x) {
        x = wrap(x);
        let y = 0;
        for (let i = 0; i < 25; i++) {
            y += (1 / fac(1 + 2 * i)) * Math.pow(x, 2 * i + 1) * Math.pow(-1, i);
        }
        return y;
    }

    // tan
    function tan(x) {
        return sin(x) / cos(x);
    }

    // inverse tangent — Taylor series, 20 terms
    function arctan(x, y) {
        if (x === 0) {
            if (y > 0) return pi / 2;
            if (y < 0) return -pi / 2;
            return 0.0;
        }
        let u = y / x;
        let sgn = u >= 0 ? 1.0 : -1.0;
        let t = Math.abs(u);
        let inv = false;

        if (t > 1.0) { inv = true; t = 1.0 / t; }
        let a = 0.0;

        for (let i = 0; i < 20; i++) {
            a += Math.pow(-1, i) * Math.pow(t, 2 * i + 1) / (2 * i + 1);
        }

        a = inv ? sgn * (pi / 2 - a) : sgn * a;

        if (x < 0 && y >= 0) a += pi;
        else if (x < 0 && y < 0) a -= pi;
        return a;
    }

    // signal generators — exact port of trig.py sine/cosine
    function sine(x, freq, N, phase, amp) {
        return sin(x * 2 * pi * freq / N + phase) * amp;
    }

    function cosine(x, freq, N, phase, amp) {
        return cos(x * 2 * pi * freq / N + phase) * amp;
    }

    function square(x, freq, N, phase, amp) {
        let a = 0;
        for (let i = 1; i < 250; i++) {
            a += sin(2 * pi * (2 * i - 1) * freq * x / N) / (2 * i - 1);
        }
        return a * 4 * amp / pi;
    }

    function saw(x, freq, N, phase, amp) {
        let a = 0;
        for (let i = 1; i < 250; i++) {
            if (i % 2 === 0) {
                a -= sin(2 * pi * x * i * freq / N) / i;
            } else {
                a += sin(2 * pi * x * i * freq / N) / i;
            }
        }
        return a * 2 * amp / pi;
    }

    // =============================================================
    //  signals.py DFT → JavaScript (exact port)
    // =============================================================
    function DFT(x) {
        const N = x.length;
        const smp = 1;  // sampling rate = 1 for simplicity

        const freqa = [];  // "reals" (sin component)
        const freqb = [];  // "imaginaries" (cos component)
        const stren = [];
        const phase = [];

        // cycles the frequencies
        for (let i = 0; i < N; i++) {
            let a = 0;
            let b = 0;

            // cycles the points
            for (let j = 0; j < N; j++) {
                a += x[j] * sin(2 * pi * j * i * 1 / N);
                b += x[j] * cos(2 * pi * j * i * 1 / N);
            }

            freqa.push(a);
            freqb.push(b);
        }

        // uses our thingies
        for (let i = 0; i < N; i++) {
            stren.push(Math.pow(freqa[i] * freqa[i] + freqb[i] * freqb[i], 0.5));
            phase.push(arctan(freqa[i], freqb[i]));
        }

        return { stren, phase };
    }

    function noiseGenerator(signal, loudness) {
        const seed = 51925;
        const a = 987325234;
        const c = 40871212;
        const m = 1767174;
        const noiseArr = [seed];
        const noisy = [];

        for (let i = 1; i < signal.length; i++) {
            const b = ((noiseArr[noiseArr.length - 1] * a + c) % m);
            noiseArr.push(b);
        }
        for (let i = 0; i < noiseArr.length; i++) {
            noiseArr[i] -= m / 2;
        }

        let meanSignal = 0;
        for (let i = 0; i < signal.length; i++) {
            meanSignal += signal[i];
        }
        meanSignal /= signal.length;

        let nice = 0;
        for (let i = 0; i < signal.length; i++) {
            nice += Math.abs(signal[i] - meanSignal);
        }
        nice /= signal.length;

        let meanNoise = 0;
        for (let i = 0; i < noiseArr.length; i++) {
            meanNoise += Math.abs(noiseArr[i]);
        }
        meanNoise /= noiseArr.length;

        if (meanNoise === 0) meanNoise = 1;

        const factor = loudness * nice / meanNoise;
        for (let i = 0; i < noiseArr.length; i++) {
            noiseArr[i] *= factor;
        }

        for (let i = 0; i < signal.length; i++) {
            noisy.push(signal[i] + noiseArr[i]);
        }
        return noisy;
    }

    function fftorganize(x) {
        const N = x.length;
        if (N === 1) {
            return [[0], [x[0]]];
        }

        const even = [];
        const odd = [];
        let counter = 0;
        for (let i = 0; i < x.length; i++) {
            if (counter === 0) {
                even.push(x[i]);
                counter = 1;
            } else {
                odd.push(x[i]);
                counter = 0;
            }
        }

        const neven = fftorganize(even);
        const nodd = fftorganize(odd);

        const a = new Array(N).fill(0);
        const b = new Array(N).fill(0);

        for (let i = 0; i < Math.floor(N / 2); i++) {
            const phased = 2 * pi * i / N;
            const temp1 = nodd[0][i] * cos(phased) + nodd[1][i] * sin(phased);
            const temp2 = nodd[1][i] * cos(phased) - nodd[0][i] * sin(phased);

            a[i] = neven[0][i] + temp1;
            b[i] = neven[1][i] + temp2;
            a[i + Math.floor(N / 2)] = neven[0][i] - temp1;
            b[i + Math.floor(N / 2)] = neven[1][i] - temp2;
        }
        return [a, b];
    }

    function fft(x) {
        const strength = [];
        const phase = [];
        let N = x.length;
        let bLen = 2;
        while (N > bLen) {
            bLen *= 2;
        }
        const paddedX = [...x];
        for (let i = N; i < bLen; i++) {
            paddedX.push(0);
        }

        const a = fftorganize(paddedX);
        const paddedN = paddedX.length;

        for (let i = 0; i < paddedN; i++) {
            strength.push(Math.pow(a[0][i] * a[0][i] + a[1][i] * a[1][i], 0.5));
            phase.push(arctan(a[0][i], a[1][i]));
        }
        return { stren: strength, phase: phase };
    }

    // =============================================================
    //  1. OSCILLOSCOPE HERO ANIMATION
    //  Uses the custom sin() function for the waveforms
    // =============================================================
    const scopeCanvas = document.getElementById('scope-canvas');
    if (scopeCanvas) {
        const sctx = scopeCanvas.getContext('2d');
        let scopeFrame = 0;

        function drawScope() {
            const dpr = window.devicePixelRatio || 1;
            scopeCanvas.width = scopeCanvas.clientWidth * dpr;
            scopeCanvas.height = scopeCanvas.clientHeight * dpr;
            sctx.scale(dpr, dpr);
            const w = scopeCanvas.clientWidth;
            const h = scopeCanvas.clientHeight;

            sctx.clearRect(0, 0, w, h);

            // Grid
            sctx.strokeStyle = 'rgba(255, 77, 0, 0.04)';
            sctx.lineWidth = 1;
            const gs = 40;
            for (let x = 0; x < w; x += gs) {
                sctx.beginPath(); sctx.moveTo(x, 0); sctx.lineTo(x, h); sctx.stroke();
            }
            for (let y = 0; y < h; y += gs) {
                sctx.beginPath(); sctx.moveTo(0, y); sctx.lineTo(w, y); sctx.stroke();
            }

            // Waveforms rendered using our custom sin()
            const waves = [
                { freq: 0.008, amp: 0.25, speed: 0.015, color: 'rgba(255, 77, 0, 0.4)', lw: 2 },
                { freq: 0.02, amp: 0.12, speed: 0.025, color: 'rgba(255, 140, 0, 0.25)', lw: 1.5 },
                { freq: 0.035, amp: 0.08, speed: 0.04, color: 'rgba(255, 77, 0, 0.15)', lw: 1 },
            ];

            waves.forEach(wave => {
                sctx.strokeStyle = wave.color;
                sctx.lineWidth = wave.lw;
                sctx.beginPath();
                for (let x = 0; x < w; x += 2) {
                    // Using custom sin() from trig.py port
                    const y = h / 2 +
                        sin(x * wave.freq + scopeFrame * wave.speed) * h * wave.amp +
                        sin(x * wave.freq * 2.3 + scopeFrame * wave.speed * 1.7) * h * wave.amp * 0.3;
                    if (x === 0) sctx.moveTo(x, y); else sctx.lineTo(x, y);
                }
                sctx.stroke();
            });

            // Glow on center axis
            const glow = sctx.createLinearGradient(0, h / 2 - 60, 0, h / 2 + 60);
            glow.addColorStop(0, 'rgba(255, 77, 0, 0)');
            glow.addColorStop(0.5, 'rgba(255, 77, 0, 0.02)');
            glow.addColorStop(1, 'rgba(255, 77, 0, 0)');
            sctx.fillStyle = glow;
            sctx.fillRect(0, h / 2 - 60, w, 120);

            scopeFrame++;
            requestAnimationFrame(drawScope);
        }
        drawScope();
    }

    // =============================================================
    //  2. INTERACTIVE DFT CALCULATOR
    //  Powered entirely by the ported DFT() and sine()/cosine()
    // =============================================================
    const timeCanvas = document.getElementById('time-canvas');
    const freqCanvas = document.getElementById('freq-canvas');

    if (timeCanvas && freqCanvas) {
        const tctx = timeCanvas.getContext('2d');
        const fctx = freqCanvas.getContext('2d');
        const N = 128;
        let noiseLevel = 0;

        function getWaveEntries() {
            return document.querySelectorAll('.wave-entry');
        }

        // Build composite signal using the custom sine()/cosine() generators
        function buildSignal() {
            const composite = new Array(N).fill(0);
            getWaveEntries().forEach(entry => {
                const type = entry.querySelector('.wave-type').value;
                const freq = parseInt(entry.querySelector('.wave-freq').value);
                const amp = parseInt(entry.querySelector('.wave-amp').value) / 100;

                for (let i = 0; i < N; i++) {
                    switch (type) {
                        case 'sine':
                            // Direct call to ported sine(x, freq, N, phase, amp)
                            composite[i] += sine(i, freq, N, 0, amp);
                            break;
                        case 'cosine':
                            // Direct call to ported cosine(x, freq, N, phase, amp)
                            composite[i] += cosine(i, freq, N, 0, amp);
                            break;
                        case 'square':
                            // Square wave built from custom square()
                            composite[i] += square(i, freq, N, 0, amp);
                            break;
                        case 'sawtooth':
                            // Sawtooth wave built from custom saw()
                            composite[i] += saw(i, freq, N, 0, amp);
                            break;
                        case 'triangle':
                            composite[i] += amp * (2 * Math.abs(2 * ((freq * i / N) % 1) - 1) - 1);
                            break;
                    }
                }
            });
            // Noise
            if (noiseLevel > 0) {
                const noisySignal = noiseGenerator(composite, noiseLevel);
                for (let i = 0; i < N; i++) {
                    composite[i] = noisySignal[i];
                }
            }
            return composite;
        }

        // Draw time domain
        function drawTimeDomain(signal) {
            const dpr = window.devicePixelRatio || 1;
            timeCanvas.width = timeCanvas.clientWidth * dpr;
            timeCanvas.height = timeCanvas.clientHeight * dpr;
            tctx.scale(dpr, dpr);
            const w = timeCanvas.clientWidth;
            const h = timeCanvas.clientHeight;

            tctx.clearRect(0, 0, w, h);

            // Grid
            tctx.strokeStyle = 'rgba(255, 77, 0, 0.06)';
            tctx.lineWidth = 1;
            for (let x = 0; x < w; x += 30) {
                tctx.beginPath(); tctx.moveTo(x, 0); tctx.lineTo(x, h); tctx.stroke();
            }
            tctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            tctx.beginPath(); tctx.moveTo(0, h / 2); tctx.lineTo(w, h / 2); tctx.stroke();

            const maxAmp = Math.max(...signal.map(Math.abs), 0.01);
            tctx.strokeStyle = '#ff4d00';
            tctx.lineWidth = 2;
            tctx.shadowColor = 'rgba(255, 77, 0, 0.4)';
            tctx.shadowBlur = 6;
            tctx.beginPath();
            for (let i = 0; i < N; i++) {
                const x = (i / N) * w;
                const y = h / 2 - (signal[i] / maxAmp) * (h * 0.4);
                if (i === 0) tctx.moveTo(x, y); else tctx.lineTo(x, y);
            }
            tctx.stroke();
            tctx.shadowBlur = 0;

            // Sample dots
            tctx.fillStyle = 'rgba(255, 140, 0, 0.5)';
            const step = Math.max(1, Math.floor(N / 64));
            for (let i = 0; i < N; i += step) {
                const x = (i / N) * w;
                const y = h / 2 - (signal[i] / maxAmp) * (h * 0.4);
                tctx.beginPath();
                tctx.arc(x, y, 2, 0, 2 * pi);
                tctx.fill();
            }

            tctx.font = '10px "Space Mono", monospace';
            tctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            tctx.fillText('n →', w - 30, h / 2 + 15);
            tctx.fillText('x[n]', 5, 15);
        }

        // Draw frequency domain using stren[] from DFT()
        function drawFreqDomain(stren) {
            const dpr = window.devicePixelRatio || 1;
            freqCanvas.width = freqCanvas.clientWidth * dpr;
            freqCanvas.height = freqCanvas.clientHeight * dpr;
            fctx.scale(dpr, dpr);
            const w = freqCanvas.clientWidth;
            const h = freqCanvas.clientHeight;

            fctx.clearRect(0, 0, w, h);

            fctx.strokeStyle = 'rgba(255, 77, 0, 0.06)';
            fctx.lineWidth = 1;
            for (let x = 0; x < w; x += 30) {
                fctx.beginPath(); fctx.moveTo(x, 0); fctx.lineTo(x, h); fctx.stroke();
            }
            fctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            fctx.beginPath(); fctx.moveTo(0, h - 30); fctx.lineTo(w, h - 30); fctx.stroke();

            // Only first half (Nyquist) — same as signals.py: stren[:N//2]
            const halfN = Math.floor(N / 2);
            const maxMag = Math.max(...stren.slice(0, halfN), 0.01);
            const barWidth = (w - 10) / halfN;

            for (let k = 0; k < halfN; k++) {
                const barH = (stren[k] / maxMag) * (h - 50);
                const x = 5 + k * barWidth;
                const y = h - 30 - barH;

                const grad = fctx.createLinearGradient(x, y, x, h - 30);
                grad.addColorStop(0, '#ff4d00');
                grad.addColorStop(1, 'rgba(255, 77, 0, 0.2)');
                fctx.fillStyle = grad;
                fctx.fillRect(x, y, barWidth - 1, barH);

                if (stren[k] / maxMag > 0.3) {
                    fctx.shadowColor = 'rgba(255, 77, 0, 0.6)';
                    fctx.shadowBlur = 10;
                    fctx.fillRect(x, y, barWidth - 1, 3);
                    fctx.shadowBlur = 0;

                    if (stren[k] / maxMag > 0.5) {
                        fctx.font = '9px "Space Mono", monospace';
                        fctx.fillStyle = '#ff8c00';
                        fctx.fillText(`${k}Hz`, x - 2, y - 6);
                    }
                }
            }

            fctx.font = '10px "Space Mono", monospace';
            fctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            fctx.fillText('k (Hz) →', w - 60, h - 12);
            fctx.fillText('|X[k]|', 5, 15);
        }

        // Full update — calls the ported fft() instead of dft()
        function updateDFT() {
            const signal = buildSignal();
            const { stren } = fft(signal);
            drawTimeDomain(signal);
            drawFreqDomain(stren);
        }

        // Event delegation for wave controls
        document.getElementById('wave-rows').addEventListener('input', (e) => {
            if (e.target.classList.contains('wave-freq')) {
                e.target.closest('.wave-entry').querySelector('.wave-freq-val').textContent = e.target.value;
            }
            if (e.target.classList.contains('wave-amp')) {
                e.target.closest('.wave-entry').querySelector('.wave-amp-val').textContent = (parseInt(e.target.value) / 100).toFixed(2);
            }
            updateDFT();
        });
        document.getElementById('wave-rows').addEventListener('change', updateDFT);

        // Add harmonic
        let waveIndex = 1;
        document.getElementById('add-wave').addEventListener('click', () => {
            const row = document.getElementById('wave-rows');
            const entry = document.createElement('div');
            entry.className = 'wave-entry';
            entry.dataset.index = waveIndex++;
            const nextFreq = 5 * (waveIndex);
            entry.innerHTML = `
        <select class="wave-type">
          <option value="sine">Sine</option>
          <option value="cosine">Cosine</option>
          <option value="square">Square</option>
          <option value="sawtooth">Sawtooth</option>
          <option value="triangle">Triangle</option>
        </select>
        <div class="wave-param">
          <label>Freq (Hz)</label>
          <input type="range" class="wave-freq styled-slider" min="1" max="32" value="${Math.min(nextFreq, 32)}">
          <span class="wave-freq-val">${Math.min(nextFreq, 32)}</span>
        </div>
        <div class="wave-param">
          <label>Amp</label>
          <input type="range" class="wave-amp styled-slider" min="0" max="100" value="50">
          <span class="wave-amp-val">0.50</span>
        </div>
        <button class="wave-remove" title="Remove">✕</button>
      `;
            row.appendChild(entry);

            entry.querySelector('.wave-remove').addEventListener('click', () => {
                entry.remove();
                updateDFT();
            });

            updateDFT();
        });

        // Add noise
        document.getElementById('add-noise').addEventListener('click', () => {
            noiseLevel = noiseLevel > 0 ? 0 : 0.15;
            document.getElementById('add-noise').style.borderColor =
                noiseLevel > 0 ? '#ff4d00' : 'rgba(255,77,0,0.3)';
            updateDFT();
        });

        // Reset
        document.getElementById('reset-waves').addEventListener('click', () => {
            const row = document.getElementById('wave-rows');
            row.innerHTML = `
        <div class="wave-entry" data-index="0">
          <select class="wave-type">
            <option value="sine">Sine</option>
            <option value="cosine">Cosine</option>
            <option value="square">Square</option>
            <option value="sawtooth">Sawtooth</option>
            <option value="triangle">Triangle</option>
          </select>
          <div class="wave-param">
            <label>Freq (Hz)</label>
            <input type="range" class="wave-freq styled-slider" min="1" max="32" value="5">
            <span class="wave-freq-val">5</span>
          </div>
          <div class="wave-param">
            <label>Amp</label>
            <input type="range" class="wave-amp styled-slider" min="0" max="100" value="80">
            <span class="wave-amp-val">0.80</span>
          </div>
        </div>
      `;
            noiseLevel = 0;
            waveIndex = 1;
            updateDFT();
        });

        // Copy code buttons
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const targetId = btn.dataset.target;
                const code = document.getElementById(targetId);
                if (code) {
                    try {
                        await navigator.clipboard.writeText(code.textContent);
                        btn.innerHTML = '<i class="fas fa-check"></i> COPIED!';
                        setTimeout(() => { btn.innerHTML = '<i class="fas fa-copy"></i> COPY'; }, 1500);
                    } catch (err) { console.warn('Copy failed', err); }
                }
            });
        });
        // Initial render
        setTimeout(updateDFT, 300);
        window.addEventListener('resize', updateDFT);
    }

    // =============================================================
    //  3. SOURCE CODE EXPAND/COLLAPSE
    // =============================================================
    document.querySelectorAll('.code-viewer').forEach(viewer => {
        const pre = viewer.querySelector('.source-code');
        if (pre) {
            const wrapper = document.createElement('div');
            wrapper.className = 'code-content-wrapper';

            const fade = document.createElement('div');
            fade.className = 'code-fade';

            const btn = document.createElement('button');
            btn.className = 'expand-code-btn';
            btn.innerHTML = '<i class="fas fa-chevron-down"></i> SHOW MORE';

            fade.appendChild(btn);

            pre.parentNode.insertBefore(wrapper, pre);
            wrapper.appendChild(pre);
            viewer.appendChild(fade);

            function toggleExpand() {
                const viewers = document.querySelectorAll('.code-viewer');
                const isCurrentlyExpanded = viewer.classList.contains('expanded');
                const willBeExpanded = !isCurrentlyExpanded;

                viewers.forEach(v => {
                    const vBtn = v.querySelector('.expand-code-btn');
                    if (willBeExpanded) {
                        v.classList.add('expanded');
                        if (vBtn) vBtn.innerHTML = '<i class="fas fa-chevron-up"></i> SHOW LESS';
                    } else {
                        v.classList.remove('expanded');
                        if (vBtn) vBtn.innerHTML = '<i class="fas fa-chevron-down"></i> SHOW MORE';
                    }
                });

                if (!willBeExpanded) {
                    const rect = viewer.getBoundingClientRect();
                    if (rect.top < 60) {
                        window.scrollBy({ top: rect.top - 80, behavior: 'smooth' });
                    }
                }
            }

            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleExpand();
            });

            fade.addEventListener('click', (e) => {
                if (!viewer.classList.contains('expanded') && !e.target.closest('.expand-code-btn')) {
                    toggleExpand();
                }
            });

            const header = viewer.querySelector('.code-header');
            if (header) {
                header.style.cursor = 'pointer';
                header.title = 'Click to expand/collapse';
                header.addEventListener('click', (e) => {
                    // Don't trigger if they clicked the copy button
                    if (e.target.closest('.copy-btn')) return;
                    toggleExpand();
                });
            }
        }
    });

})();
