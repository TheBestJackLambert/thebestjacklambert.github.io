document.addEventListener('DOMContentLoaded', () => {
  // ===== AOS =====
  AOS.init({ duration: 1000, once: true });

  // ===== Typed.js =====
  const typed = new Typed('#typed-text', {
    strings: ['Matrix Multiplication', 'Trig Taylor Series', 'Python'],
    typeSpeed: 80,
    backSpeed: 40,
    loop: true,
    showCursor: false,
  });

  // ===== Particles.js =====
  particlesJS('particles-js', {
    particles: {
      number: { value: 70, density: { enable: true, value_area: 800 } },
      color: { value: '#ffd700' },
      shape: { type: 'circle' },
      opacity: { value: 0.45 },
      size: { value: 3, random: true },
      line_linked: { enable: true, distance: 140, color: '#ffd700', opacity: 0.35, width: 1 },
      move: { enable: true, speed: 5, out_mode: 'out' },
    },
    interactivity: {
      detect_on: 'canvas',
      events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' } },
      modes: { repulse: { distance: 100 }, push: { particles_nb: 4 } },
    },
    retina_detect: true,
  });

  // ===== Custom Cursor =====
  const cursor = document.querySelector('.cursor');
  if (cursor) {
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    });
    document.querySelectorAll('a, button, input, select, canvas').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('cursor--active'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('cursor--active'));
    });
  }

  // ===== Scroll Progress =====
  window.addEventListener('scroll', () => {
    const bar = document.getElementById('scroll-progress');
    const total = document.body.scrollHeight - window.innerHeight;
    bar.style.width = `${(window.scrollY / total) * 100}%`;
  });

  // ===== Current Year =====
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // ===== Arm Visualizer =====
  const canvas = document.getElementById('arm-canvas');
  const ctx = canvas.getContext('2d');

  const linkCountInput = document.getElementById('link-count');
  const addJointBtn = document.getElementById('add-joint');
  const removeJointBtn = document.getElementById('remove-joint');
  const rowsContainer = document.getElementById('link-rows');

  const showGrid = document.getElementById('show-grid');
  const showReach = document.getElementById('show-reach');
  const tracePath = document.getElementById('trace-path');
  const randomizeBtn = document.getElementById('randomize');
  const resetBtn = document.getElementById('reset');

  const eeX = document.getElementById('ee-x');
  const eeY = document.getElementById('ee-y');
  const eeTh = document.getElementById('ee-theta');
  const Tpre = document.getElementById('T-homog');

  let path = [];

  const deg2rad = (d) => (d * Math.PI) / 180;

  // Build dynamic (Li, thetai) rows
  function defaultLength(i) {
    // nice tapering defaults
    const base = 120;
    return Math.max(25, Math.round(base * Math.pow(0.85, i - 1)));
  }
  function defaultTheta(i) {
    const vals = [30, 45, -20, 15, -10, 5, 0, 0, 0, 0, 0, 0];
    return (vals[i - 1] !== undefined) ? vals[i - 1] : 0;
  }

  function buildRows(n) {
    rowsContainer.innerHTML = '';
    for (let i = 1; i <= n; i++) {
      const controlL = document.createElement('div');
      controlL.className = 'control';
      controlL.innerHTML = `
        <label for="L_${i}">L${i}</label>
        <input type="number" id="L_${i}" value="${defaultLength(i)}" min="1" step="1">
      `;
      const controlT = document.createElement('div');
      controlT.className = 'control';
      controlT.innerHTML = `
        <label for="th_${i}">θ${i} (deg)</label>
        <input type="number" id="th_${i}" value="${defaultTheta(i)}" step="1">
      `;
      rowsContainer.appendChild(controlL);
      rowsContainer.appendChild(controlT);
    }
    // bind listeners for new inputs
    rowsContainer.querySelectorAll('input').forEach(inp => inp.addEventListener('input', render));
  }

  function getValues() {
    const n = parseInt(linkCountInput.value, 10);
    const L = [];
    const T = [];
    for (let i = 1; i <= n; i++) {
      const l = parseFloat(document.getElementById(`L_${i}`).value);
      const th = parseFloat(document.getElementById(`th_${i}`).value);
      L.push(isFinite(l) ? l : 0);
      T.push(deg2rad(isFinite(th) ? th : 0));
    }
    return { n, L, T };
  }

  function fkPlanar({ n, L, T }) {
    let x = 0, y = 0, theta = 0;
    const joints = [{ x: 0, y: 0, theta: 0 }]; // base
    for (let i = 0; i < n; i++) {
      theta += T[i];
      x += L[i] * Math.cos(theta);
      y += L[i] * Math.sin(theta);
      joints.push({ x, y, theta });
    }
    return { x, y, theta, joints };
  }

  function drawGrid(cx, cy, scale) {
    if (!showGrid.checked) return;
    const stepWorld = 20; // world units per grid step
    const step = stepWorld * scale;

    ctx.save();
    ctx.strokeStyle = '#1f1f1f';
    ctx.lineWidth = 1;

    for (let x = cx; x < canvas.width; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
    for (let x = cx; x > 0; x -= step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
    for (let y = cy; y < canvas.height; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
    for (let y = cy; y > 0; y -= step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }

    // axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(canvas.width, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, canvas.height); ctx.stroke();

    ctx.restore();
  }

  function drawReachCircle(cx, cy, R, scale) {
    if (!showReach.checked) return;
    ctx.save();
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, R * scale, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawArm(joints, cx, cy, scale) {
    ctx.save();
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';

    // links
    ctx.strokeStyle = '#ffd700';
    ctx.fillStyle = '#ffd700';
    for (let i = 0; i < joints.length - 1; i++) {
      const a = joints[i];
      const b = joints[i + 1];
      ctx.beginPath();
      ctx.moveTo(cx + a.x * scale, cy - a.y * scale);
      ctx.lineTo(cx + b.x * scale, cy - b.y * scale);
      ctx.stroke();

      // joint circles
      ctx.beginPath();
      ctx.arc(cx + a.x * scale, cy - a.y * scale, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    // end effector joint
    const ee = joints[joints.length - 1];
    ctx.beginPath();
    ctx.arc(cx + ee.x * scale, cy - ee.y * scale, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function updateUI({ x, y, theta }) {
    eeX.textContent = x.toFixed(2);
    eeY.textContent = y.toFixed(2);
    eeTh.textContent = (theta * 180 / Math.PI).toFixed(2);

    const c = Math.cos(theta), s = Math.sin(theta);
    const T = [
      [c, -s, x],
      [s,  c, y],
      [0,  0, 1],
    ];
    const fmt = (v) => (Math.abs(v) < 1e-9 ? 0 : +v.toFixed(4));
    Tpre.textContent = `[${fmt(T[0][0])}\t${fmt(T[0][1])}\t${fmt(T[0][2])}]\n` +
                       `[${fmt(T[1][0])}\t${fmt(T[1][1])}\t${fmt(T[1][2])}]\n` +
                       `[${fmt(T[2][0])}\t${fmt(T[2][1])}\t${fmt(T[2][2])}]`;
  }

  function render() {
    const { n, L, T } = getValues();
    const { x, y, theta, joints } = fkPlanar({ n, L, T });

    // canvas setup
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2 + 80;

    const maxLen = L.reduce((a, b) => a + b, 0);
    const scale = Math.min((canvas.width * 0.42) / maxLen, (canvas.height * 0.42) / maxLen);

    drawGrid(cx, cy, scale);
    drawReachCircle(cx, cy, maxLen, scale);

    if (tracePath.checked) {
      path.push({ x, y });
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < path.length; i++) {
        const p = path[i];
        const px = cx + p.x * scale;
        const py = cy - p.y * scale;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.restore();
    } else {
      path = [];
    }

    drawArm(joints, cx, cy, scale);
    updateUI({ x, y, theta });
  }

  // Events
  function setN(n) {
    const min = parseInt(linkCountInput.min, 10);
    const max = parseInt(linkCountInput.max, 10);
    const clamped = Math.max(min, Math.min(max, n));
    linkCountInput.value = clamped;
    buildRows(clamped);
    render();
  }

  linkCountInput.addEventListener('input', () => setN(parseInt(linkCountInput.value, 10) || 1));
  addJointBtn.addEventListener('click', () => setN(parseInt(linkCountInput.value, 10) + 1));
  removeJointBtn.addEventListener('click', () => setN(parseInt(linkCountInput.value, 10) - 1));

  [showGrid, showReach, tracePath].forEach(el => el.addEventListener('input', render));

  randomizeBtn.addEventListener('click', () => {
    const n = parseInt(linkCountInput.value, 10);
    for (let i = 1; i <= n; i++) {
      document.getElementById(`L_${i}`).value = Math.round(40 + Math.random() * 120);
      document.getElementById(`th_${i}`).value = Math.round(-170 + Math.random() * 340);
    }
    render();
  });

  resetBtn.addEventListener('click', () => {
    setN(3);
    // defaults applied by buildRows; clear trace
    path = [];
    // toggles
    showGrid.checked = true; showReach.checked = true; tracePath.checked = false;
    render();
  });

  // Initial
  setN(parseInt(linkCountInput.value, 10));
});
