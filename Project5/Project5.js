// ===== Utilities =====
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
$('#year') && ($('#year').textContent = new Date().getFullYear());

// ===== Custom Cursor =====
// Cursor logic now handled by shared-interactions.js

// ===== Typed headline =====
(function typedHeadline() {
  const el = $('#typed'); if (!el) return;
  const words = ['Design', 'Controls', 'Iteration'];
  let wi = 0, ci = 0, del = false;
  function tick() {
    const w = words[wi];
    if (!del) {
      ci++; el.textContent = w.slice(0, ci);
      if (ci === w.length) { del = true; setTimeout(tick, 900); return; }
    } else {
      ci--; el.textContent = w.slice(0, ci);
      if (ci === 0) { del = false; wi = (wi + 1) % words.length; }
    }
    setTimeout(tick, del ? 38 : 65);
  }
  tick();
})();

// ===== 3D Viewer (tabs + ORIGINAL file paths) =====
(function initModelViewer() {
  const mv = $('#mv'); if (!mv) return;
  const logEl = $('#mv-log');
  const log = (msg) => { if (logEl) logEl.insertAdjacentHTML('beforeend', '<li>' + msg + '</li>'); };

  // EXACT original file paths (no folder prefix). Update if your files live elsewhere.
  const FILE_PATHS = {
    Assembly: 'Assembly.gltf',
    Motor: 'Motor.gltf',
    Plates: 'Plates.gltf',
    Propeller: 'Propeller.gltf'
  };

  // Optional: if you later set window.MODEL_BASE, it will prefix these
  const BASE = (window.MODEL_BASE || '');

  const FALLBACK = 'https://modelviewer.dev/shared-assets/models/Astronaut.glb';

  function loadExact(baseKey) {
    const original = FILE_PATHS[baseKey];
    if (!original) { mv.src = FALLBACK; log('❓ unknown key: ' + baseKey + ' → fallback'); return; }

    const tryOrder = [original];
    if (original.endsWith('.gltf')) tryOrder.push(original.replace(/\.gltf$/i, '.glb'));
    else if (original.endsWith('.glb')) tryOrder.push(original.replace(/\.glb$/i, '.gltf'));

    let i = 0;
    function next() {
      if (i >= tryOrder.length) { mv.src = FALLBACK; log('❌ ' + original + ' → fallback'); return; }
      const src = BASE + tryOrder[i++];
      mv.removeAttribute('src'); // force reload
      mv.src = src;
      const onError = () => { mv.removeEventListener('error', onError); log('⚠️ failed: ' + src); next(); };
      const onLoad = () => { mv.removeEventListener('load', onLoad); mv.removeEventListener('error', onError); log('✅ loaded: ' + src); };
      mv.addEventListener('error', onError, { once: true });
      mv.addEventListener('load', onLoad, { once: true });
    }
    next();
  }

  const tabs = $$('.tab');
  function activate(tab) {
    tabs.forEach(t => {
      const on = (t === tab);
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    loadExact(tab.getAttribute('data-model'));
  }

  tabs.forEach(t => t.addEventListener('click', () => activate(t)));
  tabs.forEach(t => t.addEventListener('keydown', (e) => {
    const i = tabs.indexOf(t);
    if (e.key === 'ArrowRight') { e.preventDefault(); tabs[(i + 1) % tabs.length].focus(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); tabs[(i - 1 + tabs.length) % tabs.length].focus(); }
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); t.click(); }
  }));

  // Initial
  activate($('.tab.active') || tabs[0]);
})();

// ===== Photo Gallery (carousel) — pixel-based movement =====
(function waterGallery() {
  const roots = document.querySelectorAll('[data-gallery]');
  roots.forEach(setup);

  function setup(root) {
    const track = root.querySelector('[data-track]');
    const items = Array.from(root.querySelectorAll('.wg-item'));
    const prevBtn = root.querySelector('[data-prev]');
    const nextBtn = root.querySelector('[data-next]');
    const dotsHost = root.querySelector('[data-dots]');
    const viewport = root.querySelector('.wg-viewport');
    if (!track || !items.length || !viewport) return;

    let index = Math.max(0, items.findIndex(el => el.classList.contains('current')));
    if (index < 0) index = 0;

    // Build dots
    const dots = items.map((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      if (i === index) b.classList.add('active');
      dotsHost && dotsHost.appendChild(b);
      b.addEventListener('click', () => go(i));
      return b;
    });

    // Pixel-based positioning
    let slideW = viewport.clientWidth;

    function setSlideW() {
      slideW = viewport.clientWidth;
      update(0); // snap to current slide on resize
    }
    window.addEventListener('resize', setSlideW);

    function update(offsetPx = 0) {
      track.style.transform = 'translateX(' + ((-index * slideW) + offsetPx) + 'px)';
      items.forEach((el, i) => el.classList.toggle('current', i === index));
      dots.forEach((d, i) => d.classList.toggle('active', i === index));
    }

    function clamp(i) { return Math.max(0, Math.min(i, items.length - 1)); }
    function go(i) { index = clamp(i); update(0); }
    function goNext() { go(index + 1); }
    function goPrev() { go(index - 1); }

    prevBtn && prevBtn.addEventListener('click', goPrev);
    nextBtn && nextBtn.addEventListener('click', goNext);

    // Keyboard when focused inside carousel
    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
    });

    // Pointer drag/swipe (pixels, not %)
    let startX = 0, dragging = false, lastDx = 0, pid = null;

    function onDown(e) {
      dragging = true;
      startX = e.clientX;
      lastDx = 0;
      pid = e.pointerId;
      viewport.setPointerCapture(pid);
    }
    function onMove(e) {
      if (!dragging) return;
      lastDx = e.clientX - startX;
      update(lastDx);
    }
    function onUp(e) {
      if (!dragging) return;
      dragging = false;
      if (pid != null) viewport.releasePointerCapture(pid);
      const threshold = slideW * 0.15;
      if (Math.abs(lastDx) > threshold) {
        if (lastDx < 0) goNext(); else goPrev();
      } else {
        update(0); // snap back
      }
      lastDx = 0; pid = null;
    }

    viewport.addEventListener('pointerdown', onDown);
    viewport.addEventListener('pointermove', onMove);
    viewport.addEventListener('pointerup', onUp);
    viewport.addEventListener('pointercancel', onUp);
    viewport.addEventListener('pointerleave', () => dragging && onUp(new PointerEvent('pointerup')));

    // Autoplay (pause on hover)
    let timer = setInterval(goNext, 5000);
    root.addEventListener('mouseenter', () => clearInterval(timer));
    root.addEventListener('mouseleave', () => { clearInterval(timer); timer = setInterval(goNext, 5000); });

    setSlideW();
  }
})();
