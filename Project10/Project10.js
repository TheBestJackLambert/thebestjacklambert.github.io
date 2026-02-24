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

    // inverse tangent — Taylor series, 25 terms
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

        for (let i = 0; i < 25; i++) {
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
    //  signals.py → JavaScript (exact port)
    // =============================================================
    function DFT(x) {
        const N = x.length;

        const freqa = [];  // reals (cos component)
        const freqb = [];  // imaginaries (-sin component)
        const stren = [];
        const phase = [];

        for (let i = 0; i < N; i++) {
            let a = 0;
            let b = 0;

            for (let j = 0; j < N; j++) {
                a += x[j] * cos(2 * pi * j * i * 1 / N);
                b -= x[j] * sin(2 * pi * j * i * 1 / N);
            }

            freqa.push(a);
            freqb.push(b);
        }

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
            const temp1 = nodd[0][i] * cos(phased) - nodd[1][i] * sin(phased);
            const temp2 = nodd[1][i] * cos(phased) + nodd[0][i] * sin(phased);

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
        const xArr = [...x];
        let N = xArr.length;
        let bLen = 2;
        while (N > bLen) {
            bLen *= 2;
        }
        for (let i = N; i < bLen; i++) {
            xArr.push(0);
        }

        const a = fftorganize(xArr);

        for (let i = 0; i < bLen; i++) {
            strength.push(Math.pow(a[0][i] * a[0][i] + a[1][i] * a[1][i], 0.5));
            phase.push(arctan(a[1][i], a[0][i]));
        }
        return { stren: strength, phase: phase };
    }

    // Inverse Fourier Transform — exact port of signals.py ift()
    function ift(mag, phase) {
        const signal = [];
        const length = mag.length;
        for (let j = 0; j < length; j++) {
            let x = 0;
            for (let i = 0; i < mag.length; i++) {
                x += mag[i] * cos(i * j * 2 * pi / length + phase[i]);
            }
            signal.push(x / length);
        }
        return signal;
    }

    // Spectral Denoiser — exact port of signals.py denoise()
    function denoise(x) {
        const N = x.length;
        const result = fft(x);
        const mag = [...result.stren];
        const phase = [...result.phase];
        let mean = 0;
        for (let i = 0; i < mag.length; i++) {
            mean += mag[i];
        }
        mean /= mag.length;
        const thresh = mean * 7;
        let meanmag = 0;
        let count = 0;
        for (let i = 0; i < mag.length; i++) {
            if (mag[i] < thresh) {
                meanmag += mag[i];
                count += 1;
                mag[i] = 0;
                phase[i] = 0;
            }
        }
        if (count > 0) meanmag /= count;
        for (let i = 0; i < mag.length; i++) {
            if (mag[i] > meanmag) {
                mag[i] -= meanmag;
            }
        }
        const cleanx = ift(mag, phase).slice(0, N);
        return cleanx;
    }

    // =============================================================
    //  Shared: signal builder from wave entries
    // =============================================================
    function buildSignalFromEntries(entries, N) {
        const composite = new Array(N).fill(0);
        entries.forEach(entry => {
            const type = entry.querySelector('.wave-type').value;
            const freq = parseInt(entry.querySelector('.wave-freq').value);
            const amp = parseInt(entry.querySelector('.wave-amp').value) / 100;

            for (let i = 0; i < N; i++) {
                switch (type) {
                    case 'sine':
                        composite[i] += sine(i, freq, N, 0, amp);
                        break;
                    case 'cosine':
                        composite[i] += cosine(i, freq, N, 0, amp);
                        break;
                    case 'square':
                        composite[i] += square(i, freq, N, 0, amp);
                        break;
                    case 'sawtooth':
                        composite[i] += saw(i, freq, N, 0, amp);
                        break;
                    case 'triangle':
                        composite[i] += amp * (2 * Math.abs(2 * ((freq * i / N) % 1) - 1) - 1);
                        break;
                }
            }
        });
        return composite;
    }

    // =============================================================
    //  Shared: draw waveform on canvas
    // =============================================================
    function drawWave(canvas, signal, color, showDots) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        const N = signal.length;

        ctx.clearRect(0, 0, w, h);

        // Grid
        ctx.strokeStyle = 'rgba(255, 77, 0, 0.06)';
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 30) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();

        const maxAmp = Math.max(...signal.map(Math.abs), 0.01);
        ctx.strokeStyle = color;
        ctx.lineWidth = showDots ? 2 : 1.5;
        ctx.shadowColor = color;
        ctx.shadowBlur = showDots ? 6 : 4;
        ctx.beginPath();
        for (let i = 0; i < N; i++) {
            const x = (i / N) * w;
            const y = h / 2 - (signal[i] / maxAmp) * (h * 0.4);
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Sample dots
        if (showDots) {
            ctx.fillStyle = color.replace(')', ', 0.5)').replace('rgb', 'rgba');
            const step = Math.max(1, Math.floor(N / 64));
            for (let i = 0; i < N; i += step) {
                const x = (i / N) * w;
                const y = h / 2 - (signal[i] / maxAmp) * (h * 0.4);
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, 2 * pi);
                ctx.fill();
            }
        }
    }

    // =============================================================
    //  1. OSCILLOSCOPE HERO ANIMATION
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

            sctx.strokeStyle = 'rgba(255, 77, 0, 0.04)';
            sctx.lineWidth = 1;
            const gs = 40;
            for (let x = 0; x < w; x += gs) {
                sctx.beginPath(); sctx.moveTo(x, 0); sctx.lineTo(x, h); sctx.stroke();
            }
            for (let y = 0; y < h; y += gs) {
                sctx.beginPath(); sctx.moveTo(0, y); sctx.lineTo(w, y); sctx.stroke();
            }

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
                    const y = h / 2 +
                        sin(x * wave.freq + scopeFrame * wave.speed) * h * wave.amp +
                        sin(x * wave.freq * 2.3 + scopeFrame * wave.speed * 1.7) * h * wave.amp * 0.3;
                    if (x === 0) sctx.moveTo(x, y); else sctx.lineTo(x, y);
                }
                sctx.stroke();
            });

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
    // =============================================================
    const timeCanvas = document.getElementById('time-canvas');
    const freqCanvas = document.getElementById('freq-canvas');

    if (timeCanvas && freqCanvas) {
        const tctx = timeCanvas.getContext('2d');
        const fctx = freqCanvas.getContext('2d');
        const N = 128;
        let noiseLevel = 0;

        function buildSignal() {
            const entries = document.querySelectorAll('#wave-rows .wave-entry');
            const composite = buildSignalFromEntries(entries, N);
            if (noiseLevel > 0) {
                const noisySignal = noiseGenerator(composite, noiseLevel);
                for (let i = 0; i < N; i++) {
                    composite[i] = noisySignal[i];
                }
            }
            return composite;
        }

        function drawTimeDomain(signal) {
            drawWave(timeCanvas, signal, '#ff4d00', true);
            const ctx = timeCanvas.getContext('2d');
            const w = timeCanvas.clientWidth;
            const h = timeCanvas.clientHeight;
            ctx.font = '10px "Space Mono", monospace';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillText('n \u2192', w - 30, h / 2 + 15);
            ctx.fillText('x[n]', 5, 15);
        }

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
            fctx.fillText('k (Hz) \u2192', w - 60, h - 12);
            fctx.fillText('|X[k]|', 5, 15);
        }

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
        <button class="wave-remove" title="Remove">\u2715</button>
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

        // Initial render
        setTimeout(updateDFT, 300);
        window.addEventListener('resize', updateDFT);
    }

    // =============================================================
    //  3. INTERACTIVE SPECTRAL DENOISER
    //  Original + Noisy update in real-time on any control change.
    //  Denoise button only updates the third (denoised) panel.
    // =============================================================
    const denoiseOriginal = document.getElementById('denoise-original');
    const denoiseNoisy = document.getElementById('denoise-noisy');
    const denoiseClean = document.getElementById('denoise-clean');

    if (denoiseOriginal && denoiseNoisy && denoiseClean) {
        const DN = 200;
        let lastClean = null;
        let lastNoisy = null;
        let lastDenoised = null;

        function getDenoiseCleanSignal() {
            const entries = document.querySelectorAll('#denoise-wave-rows .wave-entry');
            return buildSignalFromEntries(entries, DN);
        }

        function updateDenoisePreview() {
            const clean = getDenoiseCleanSignal();
            const noiseLvl = parseInt(document.getElementById('denoise-noise-level').value) / 100;
            const noisy = noiseGenerator(clean, noiseLvl);

            lastClean = clean;
            lastNoisy = noisy;

            drawWave(denoiseOriginal, clean, '#ff4d00', false);
            drawWave(denoiseNoisy, noisy, '#ff6b6b', false);

            // Clear the denoised panel and show waiting state
            if (!lastDenoised) {
                const dpr = window.devicePixelRatio || 1;
                denoiseClean.width = denoiseClean.clientWidth * dpr;
                denoiseClean.height = denoiseClean.clientHeight * dpr;
                const ctx = denoiseClean.getContext('2d');
                ctx.scale(dpr, dpr);
                const w = denoiseClean.clientWidth;
                const h = denoiseClean.clientHeight;
                ctx.clearRect(0, 0, w, h);

                // Grid
                ctx.strokeStyle = 'rgba(255, 77, 0, 0.06)';
                ctx.lineWidth = 1;
                for (let x = 0; x < w; x += 30) {
                    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
                }
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();

                ctx.font = '11px "Space Mono", monospace';
                ctx.fillStyle = 'rgba(0, 240, 255, 0.3)';
                ctx.textAlign = 'center';
                ctx.fillText('CLICK DENOISE TO RUN', w / 2, h / 2 + 4);
                ctx.textAlign = 'start';
            }

            document.getElementById('denoise-error').textContent = '';
        }

        function runDenoiser() {
            if (!lastNoisy) updateDenoisePreview();

            let denoised = denoise(lastNoisy);

            lastDenoised = denoised;

            drawWave(denoiseClean, denoised, '#00f0ff', false);

            // Compute Pearson correlation coefficient (R²)
            // This shows how well the shape is preserved, not absolute error
            let sumClean = 0, sumDen = 0;
            for (let i = 0; i < DN; i++) {
                sumClean += lastClean[i];
                sumDen += denoised[i];
            }
            const meanClean = sumClean / DN;
            const meanDen = sumDen / DN;

            let num = 0, denomA = 0, denomB = 0;
            for (let i = 0; i < DN; i++) {
                const a = lastClean[i] - meanClean;
                const b = denoised[i] - meanDen;
                num += a * b;
                denomA += a * a;
                denomB += b * b;
            }
            const r = (denomA > 0 && denomB > 0) ? num / Math.pow(denomA * denomB, 0.5) : 0;
            const r2 = r * r;

            document.getElementById('denoise-error').textContent =
                'CORRELATION: R\u00B2 = ' + r2.toFixed(4);
        }

        // Denoise wave builder controls
        const denoiseRows = document.getElementById('denoise-wave-rows');
        denoiseRows.addEventListener('input', (e) => {
            if (e.target.classList.contains('wave-freq')) {
                e.target.closest('.wave-entry').querySelector('.wave-freq-val').textContent = e.target.value;
            }
            if (e.target.classList.contains('wave-amp')) {
                e.target.closest('.wave-entry').querySelector('.wave-amp-val').textContent = (parseInt(e.target.value) / 100).toFixed(2);
            }
            lastDenoised = null;
            updateDenoisePreview();
        });
        denoiseRows.addEventListener('change', () => {
            lastDenoised = null;
            updateDenoisePreview();
        });

        // Noise level slider
        document.getElementById('denoise-noise-level').addEventListener('input', (e) => {
            document.getElementById('denoise-noise-val').textContent = (parseInt(e.target.value) / 100).toFixed(2);
            lastDenoised = null;
            updateDenoisePreview();
        });

        // Add harmonic
        let denoiseWaveIdx = 2;
        document.getElementById('denoise-add-wave').addEventListener('click', () => {
            const entry = document.createElement('div');
            entry.className = 'wave-entry denoise-wave';
            entry.dataset.index = denoiseWaveIdx++;
            const nextFreq = Math.min(3 + denoiseWaveIdx * 4, 30);
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
          <input type="range" class="wave-freq styled-slider" min="1" max="30" value="${nextFreq}">
          <span class="wave-freq-val">${nextFreq}</span>
        </div>
        <div class="wave-param">
          <label>Amp</label>
          <input type="range" class="wave-amp styled-slider" min="0" max="100" value="50">
          <span class="wave-amp-val">0.50</span>
        </div>
        <button class="wave-remove" title="Remove">\u2715</button>
      `;
            denoiseRows.appendChild(entry);

            entry.querySelector('.wave-remove').addEventListener('click', () => {
                entry.remove();
                lastDenoised = null;
                updateDenoisePreview();
            });

            lastDenoised = null;
            updateDenoisePreview();
        });

        // Reset
        document.getElementById('denoise-reset').addEventListener('click', () => {
            denoiseRows.innerHTML = `
        <div class="wave-entry denoise-wave" data-index="0">
          <select class="wave-type">
            <option value="sine">Sine</option>
            <option value="cosine">Cosine</option>
            <option value="square">Square</option>
            <option value="sawtooth">Sawtooth</option>
            <option value="triangle">Triangle</option>
          </select>
          <div class="wave-param">
            <label>Freq (Hz)</label>
            <input type="range" class="wave-freq styled-slider" min="1" max="30" value="3">
            <span class="wave-freq-val">3</span>
          </div>
          <div class="wave-param">
            <label>Amp</label>
            <input type="range" class="wave-amp styled-slider" min="0" max="100" value="80">
            <span class="wave-amp-val">0.80</span>
          </div>
        </div>
        <div class="wave-entry denoise-wave" data-index="1">
          <select class="wave-type">
            <option value="sine">Sine</option>
            <option value="cosine" selected>Cosine</option>
            <option value="square">Square</option>
            <option value="sawtooth">Sawtooth</option>
            <option value="triangle">Triangle</option>
          </select>
          <div class="wave-param">
            <label>Freq (Hz)</label>
            <input type="range" class="wave-freq styled-slider" min="1" max="30" value="7">
            <span class="wave-freq-val">7</span>
          </div>
          <div class="wave-param">
            <label>Amp</label>
            <input type="range" class="wave-amp styled-slider" min="0" max="100" value="60">
            <span class="wave-amp-val">0.60</span>
          </div>
        </div>
      `;
            denoiseWaveIdx = 2;
            lastDenoised = null;
            updateDenoisePreview();
        });

        // Denoise button
        document.getElementById('run-denoise').addEventListener('click', () => runDenoiser());

        // Initial render
        setTimeout(updateDenoisePreview, 400);
        window.addEventListener('resize', () => {
            updateDenoisePreview();
            if (lastDenoised) drawWave(denoiseClean, lastDenoised, '#00f0ff', false);
        });
    }

    // =============================================================
    //  4. CODE MODAL — Function Card Click → Full Source Overlay
    // =============================================================
    const codeData = {
        'trig-constants': {
            title: 'trig.py — Constants & Helpers',
            code: `pi = <span class="number">3.14159265359159</span>

<span class="comment">#defines amount of iterations (recommended 25)</span>
iterations = <span class="number">25</span>

<span class="comment">#factorial</span>
<span class="keyword">def</span> <span class="function">fac</span>(x):
  y = <span class="number">1</span>
  <span class="keyword">for</span> i <span class="keyword">in</span> range(<span class="number">1</span>, x+<span class="number">1</span>):
    y *= i
  <span class="keyword">return</span> y

<span class="comment">#mod along pi</span>
<span class="keyword">def</span> <span class="function">wrap</span>(a):
  a = (a + pi) % (<span class="number">2</span> * pi) - pi
  <span class="keyword">return</span> a`
        },
        'trig-sincos': {
            title: 'trig.py — sin() / cos() / tan()',
            code: `<span class="comment">#cosine function</span>
<span class="keyword">def</span> <span class="function">cos</span>(x):
  <span class="keyword">global</span> iterations
  x = wrap(x)
  y = <span class="number">0</span>
  <span class="keyword">for</span> i <span class="keyword">in</span> range(iterations):
    y += <span class="number">1</span>/(fac(<span class="number">2</span>*i)) * x ** (<span class="number">2</span>*i) * (-<span class="number">1</span>)**i
  <span class="keyword">return</span> y

<span class="comment">#sine function</span>
<span class="keyword">def</span> <span class="function">sin</span>(x):
  <span class="keyword">global</span> iterations
  x = wrap(x)
  y = <span class="number">0</span>
  <span class="keyword">for</span> i <span class="keyword">in</span> range(iterations):
    y += <span class="number">1</span>/(fac(<span class="number">1</span> + <span class="number">2</span>*i)) * x ** (<span class="number">2</span>*i + <span class="number">1</span>) * (-<span class="number">1</span>)**i
  <span class="keyword">return</span> y

<span class="comment">#tan function</span>
<span class="keyword">def</span> <span class="function">tan</span>(x):
  y = sin(x)/cos(x)
  <span class="keyword">return</span> y`
        },
        'trig-arctan': {
            title: 'trig.py — arctan() / arccos()',
            code: `<span class="comment">#arccos function</span>
<span class="keyword">def</span> <span class="function">arccos</span>(x, y):
  b = abs((x**<span class="number">2</span>-y**<span class="number">2</span>))**.<span class="number">5</span>/y
  c = arctan(y, b)
  <span class="keyword">return</span> c

<span class="comment">#inverse tangent</span>
<span class="keyword">def</span> <span class="function">arctan</span>(x, y):
  <span class="keyword">global</span> iterations
  <span class="comment">#if denominator is zero returns corresponding angle</span>
  <span class="keyword">if</span> x == <span class="number">0</span>:
    <span class="keyword">if</span> y &gt; <span class="number">0</span>: <span class="keyword">return</span> (pi/<span class="number">2</span>)
    <span class="keyword">if</span> y &lt; <span class="number">0</span>: <span class="keyword">return</span> (-pi/<span class="number">2</span>)
    <span class="keyword">return</span> <span class="number">0.0</span>
  u = y / x

  <span class="comment">#determines sign of angle</span>
  sgn = <span class="number">1.0</span> <span class="keyword">if</span> u &gt;= <span class="number">0</span> <span class="keyword">else</span> -<span class="number">1.0</span>
  t = abs(u)
  inv = False

  <span class="comment">#if y&gt;x flips it or easier compute and signals for unflip later on</span>
  <span class="keyword">if</span> t &gt; <span class="number">1.0</span>:
    inv = True
    t = <span class="number">1.0</span> / t
  a = <span class="number">0.0</span>

  <span class="comment">#does taylor series</span>
  <span class="keyword">for</span> i <span class="keyword">in</span> range(iterations):
    a += ((-<span class="number">1</span>)**i) * (t**(<span class="number">2</span>*i + <span class="number">1</span>)) / (<span class="number">2</span>*i + <span class="number">1</span>)

  <span class="comment">#adjusts for sign</span>
  a = sgn * ( (pi/<span class="number">2</span>) - a ) <span class="keyword">if</span> inv <span class="keyword">else</span> sgn * a

  <span class="comment">#puts in correct quadrant</span>
  <span class="keyword">if</span> x &lt; <span class="number">0</span> <span class="keyword">and</span> y &gt;= <span class="number">0</span>: a += pi
  <span class="keyword">elif</span> x &lt; <span class="number">0</span> <span class="keyword">and</span> y &lt; <span class="number">0</span>: a -= pi
  <span class="keyword">return</span> a`
        },
        'trig-generators': {
            title: 'trig.py — Signal Generators',
            code: `<span class="keyword">def</span> <span class="function">sine</span>(x, freq, N, phase, amp):
    <span class="keyword">return</span> sin(x * <span class="number">2</span> * pi * freq / N + phase) * amp

<span class="keyword">def</span> <span class="function">cosine</span>(x, freq, N, phase, amp):
    <span class="keyword">return</span> cos(x * <span class="number">2</span> * pi * freq / N + phase) * amp

<span class="keyword">def</span> <span class="function">square</span>(x, freq, N, phase, amp):
  a = <span class="number">0</span>
  <span class="keyword">global</span> iterations
  <span class="keyword">for</span> i <span class="keyword">in</span> range(<span class="number">1</span>, <span class="number">10</span> * iterations):
    a += sin(<span class="number">2</span> * pi * (<span class="number">2</span> * i - <span class="number">1</span>) * freq * x / N) / (<span class="number">2</span> * i - <span class="number">1</span>)
  <span class="keyword">return</span> a * <span class="number">4</span> * amp / pi

<span class="keyword">def</span> <span class="function">saw</span>(x, freq, N, phase, amp):
  <span class="keyword">global</span> iterations
  a = <span class="number">0</span>
  <span class="keyword">for</span> i <span class="keyword">in</span> range(<span class="number">1</span>, <span class="number">10</span> * iterations):
    <span class="keyword">if</span> i % <span class="number">2</span> == <span class="number">0</span>:
      a -= sin(<span class="number">2</span> * pi * x * i * freq / N) / (i)
    <span class="keyword">elif</span> i % <span class="number">2</span> == <span class="number">1</span>:
      a += sin(<span class="number">2</span> * pi * x * i * freq / N) / (i)
  <span class="keyword">return</span> a * <span class="number">2</span> * amp / pi`
        },
        'signals-noise': {
            title: 'signals.py — noise()',
            code: `<span class="keyword">import</span> trig

<span class="comment">#random noise</span>
<span class="keyword">def</span> <span class="function">noise</span>(signal, loudness):

    <span class="comment">#defines noise parameters</span>
    seed = <span class="number">51925</span>
    a = <span class="number">987325234</span>
    c = <span class="number">40871212</span>
    m = <span class="number">1767174</span>
    noise = [seed]
    noisy = []

    <span class="comment">#creates noise function itself</span>
    <span class="keyword">for</span> i <span class="keyword">in</span> range(<span class="number">1</span>, len(signal)):
        b = ((noise[-<span class="number">1</span>] * a + c) % m )
        noise.append(b)
    <span class="keyword">for</span> i <span class="keyword">in</span> range(len(noise)):
        noise[i] -= m/<span class="number">2</span>

    <span class="comment">#adjusts noise to not overpower signal</span>
    <span class="comment">#finds average signal strength</span>
    mean = <span class="number">0</span>
    <span class="keyword">for</span> i <span class="keyword">in</span> signal:
        mean += i
    mean = mean/len(signal)

    <span class="comment">#finds average distance from mean signal</span>
    nice= <span class="number">0</span>
    <span class="keyword">for</span> i <span class="keyword">in</span> signal:
        nice += abs(i - mean)
    nice = nice/len(signal)

    <span class="comment">#finds average magnitude of noise</span>
    mean = <span class="number">0</span>
    <span class="keyword">for</span> i <span class="keyword">in</span> noise:
        mean += abs(i)
    mean = mean/len(noise)

    <span class="comment">#normalizes noise magnitude based on requested loudness</span>
    factor = loudness * nice / mean
    <span class="keyword">for</span> i <span class="keyword">in</span> range(len(noise)):
        noise[i] *= factor

    <span class="comment">#applies noise to signal and returns</span>
    <span class="keyword">for</span> i <span class="keyword">in</span> range(len(signal)):
        noisy.append(signal[i] + noise[i])
    <span class="keyword">return</span> noisy`
        },
        'signals-dft': {
            title: 'signals.py — dft()',
            code: `<span class="comment">#Discrete Fourier Transform</span>
<span class="keyword">def</span> <span class="function">dft</span>(x):
    N = len(x)

    <span class="comment">#creates frequency strength lists</span>
    freqa = []
    freqb = []
    stren = []
    phase = []

    <span class="comment">#cycles the frequencies</span>
    <span class="keyword">for</span> i <span class="keyword">in</span> range(N):

        <span class="comment">#defines our reals and imaginaries</span>
        a = <span class="number">0</span>
        b = <span class="number">0</span>

        <span class="comment">#cycles the points</span>
        <span class="keyword">for</span> j <span class="keyword">in</span> range(N):
            a += x[j] * trig.cos(<span class="number">2</span> * trig.pi * j * i * <span class="number">1</span>/N)
            b -= x[j] * trig.sin(<span class="number">2</span> * trig.pi * j * i * <span class="number">1</span>/N)

        <span class="comment">#saves our thingies</span>
        freqa.append(a)
        freqb.append(b)

    <span class="comment">#uses our thingies</span>
    <span class="keyword">for</span> i <span class="keyword">in</span> range(N):
        stren.append(((freqa[i])**<span class="number">2</span> + (freqb[i])**<span class="number">2</span>) ** .<span class="number">5</span>)
        phase.append(trig.arctan(freqa[i], freqb[i]))

    <span class="comment">#starts plotting our DFT</span>
    <span class="keyword">return</span> stren, phase`
        },
        'signals-fft': {
            title: 'signals.py — fft() / fftorganize()',
            code: `<span class="comment">#Discrete Fourier Transform BUT FAST</span>

<span class="comment">#Wrapper function for me to call</span>
<span class="keyword">def</span> <span class="function">fft</span>(x):

    <span class="comment">#defining our variables</span>
    x = list(x)
    strength = []
    phase = []
    N = len(x)
    b = <span class="number">2</span>

    <span class="comment">#changes x to a power of 2 to make it work with an fft</span>
    <span class="keyword">while</span> N &gt; b:
        b *= <span class="number">2</span>
    <span class="keyword">for</span> i <span class="keyword">in</span> range(N, b):
        x.append(<span class="number">0</span>)

    <span class="comment">#calling complex function</span>
    a = fftorganize(x)

    <span class="comment">#organizing data into strength and phase</span>
    <span class="keyword">for</span> i <span class="keyword">in</span> range(b):
        strength.append(((a[<span class="number">0</span>][i])**<span class="number">2</span> + (a[<span class="number">1</span>][i])**<span class="number">2</span>) ** .<span class="number">5</span>)
        phase.append(trig.arctan(a[<span class="number">1</span>][i], a[<span class="number">0</span>][i]))
    <span class="keyword">return</span> strength, phase

<span class="comment">#function that makes me sad</span>
<span class="keyword">def</span> <span class="function">fftorganize</span>(x):

    <span class="comment">#defining our variables</span>
    even = []
    odd = []
    counter = <span class="number">0</span>
    neven = []
    nodd = []
    a = []
    b = []
    N = len(x)

    <span class="comment">#if length is 1 gives simple a,b</span>
    <span class="keyword">if</span> N == <span class="number">1</span>:
        <span class="keyword">return</span> [[<span class="number">0</span>], [x[<span class="number">0</span>]]]

    <span class="comment">#breaks large chunk of signal (x) into even and odd components</span>
    <span class="keyword">for</span> i <span class="keyword">in</span> x:
        a.append(<span class="number">0</span>)
        b.append(<span class="number">0</span>)
        neven.append([<span class="number">0</span>])
        nodd.append([<span class="number">0</span>])
        <span class="keyword">if</span> counter == <span class="number">0</span>:
            even.append(i)
            counter = <span class="number">1</span>
        <span class="keyword">else</span>:
            odd.append(i)
            counter = <span class="number">0</span>

    <span class="comment">#recurses until it gets broken into smallest possible buckets</span>
    neven = (fftorganize(even))
    nodd = (fftorganize(odd))

    <span class="comment">#recombines even and odd components</span>
    <span class="keyword">for</span> i <span class="keyword">in</span> range(N // <span class="number">2</span>):
        phased = <span class="number">2</span> * trig.pi * i / N
        temp1 = nodd[<span class="number">0</span>][i] * trig.cos(phased) - nodd[<span class="number">1</span>][i] * trig.sin(phased)
        temp2 = nodd[<span class="number">1</span>][i] * trig.cos(phased) + nodd[<span class="number">0</span>][i] * trig.sin(phased)
        a[i] = neven[<span class="number">0</span>][i] + temp1
        b[i] = neven[<span class="number">1</span>][i] + temp2
        a[i + N // <span class="number">2</span>] = neven[<span class="number">0</span>][i] - temp1
        b[i + N // <span class="number">2</span>] = neven[<span class="number">1</span>][i] - temp2
    <span class="keyword">return</span> [a, b]`
        },
        'signals-ift': {
            title: 'signals.py — ift() / denoise()',
            code: `<span class="comment">#Inverse Fourier Transform</span>
<span class="keyword">def</span> <span class="function">ift</span>(mag, phase):
    signal = []
    length = len(mag)
    <span class="comment">#cycles through each time-domain sample</span>
    <span class="keyword">for</span> j <span class="keyword">in</span> range(length):
        x = <span class="number">0</span>
        <span class="comment">#sums contribution from each frequency bin</span>
        <span class="keyword">for</span> i <span class="keyword">in</span> range(len(mag)):
            x += mag[i] * trig.cos(i * j * <span class="number">2</span> * trig.pi / length + phase[i])
        signal.append(x / length)
    <span class="keyword">return</span> signal

<span class="comment">#Spectral Denoiser</span>
<span class="keyword">def</span> <span class="function">denoise</span>(x):
    N = len(x)
    <span class="comment">#transform to frequency domain</span>
    mag, phase = fft(x)
    <span class="comment">#compute mean magnitude</span>
    mean = <span class="number">0</span>
    <span class="keyword">for</span> i <span class="keyword">in</span> mag:
        mean += i
    mean /= N
    <span class="comment">#threshold is 7x mean — weak bins are noise</span>
    thresh = mean * <span class="number">7</span>
    meanmag = <span class="number">0</span>
    count = <span class="number">0</span>
    <span class="comment">#zero out bins below threshold</span>
    <span class="keyword">for</span> i <span class="keyword">in</span> range(N):
        <span class="keyword">if</span> mag[i] &lt; thresh:
            meanmag += mag[i]
            count += <span class="number">1</span>
            mag[i], phase[i] = <span class="number">0</span>, <span class="number">0</span>
    meanmag /= count
    <span class="comment">#subtract noise floor from surviving bins</span>
    <span class="keyword">for</span> i <span class="keyword">in</span> range(N):
        <span class="keyword">if</span> mag[i] &gt; meanmag:
            mag[i] -= meanmag
    <span class="comment">#reconstruct clean signal via IFT</span>
    cleanx = ift(mag, phase)[:N]
    <span class="keyword">return</span> cleanx`
        }
    };

    const modal = document.getElementById('code-modal');
    const modalTitle = document.getElementById('code-modal-title');
    const modalContent = document.getElementById('code-modal-content');
    const modalClose = document.getElementById('code-modal-close');
    const modalCopy = document.getElementById('code-modal-copy');

    if (modal) {
        // Open modal on card click
        document.querySelectorAll('.fn-card').forEach(card => {
            card.addEventListener('click', () => {
                const fn = card.dataset.fn;
                const data = codeData[fn];
                if (!data) return;
                modalTitle.textContent = data.title;
                modalContent.innerHTML = data.code;
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

        // Close
        modalClose.addEventListener('click', () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Copy
        modalCopy.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(modalContent.textContent);
                modalCopy.innerHTML = '<i class="fas fa-check"></i> COPIED!';
                setTimeout(() => { modalCopy.innerHTML = '<i class="fas fa-copy"></i> COPY'; }, 1500);
            } catch (err) { console.warn('Copy failed', err); }
        });
    }

})();
