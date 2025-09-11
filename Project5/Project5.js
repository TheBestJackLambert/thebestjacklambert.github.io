// ----------- Utilities
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

// ----------- Safe log
const logEl = $('#mv-log');
const log = (msg) => { if (logEl) logEl.insertAdjacentHTML('beforeend', `<li>${msg}</li>`); };

// ----------- Footer year
$('#year') && ($('#year').textContent = new Date().getFullYear());

// ----------- Custom Cursor (robust)
(function initCursor(){
  const cursor = $('.cursor');
  if (!cursor) return;

  let rafId = null;
  function move(e){
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(()=>{
      cursor.style.left = e.clientX + 'px';
      cursor.style.top  = e.clientY + 'px';
      cursor.classList.add('show');
    });
  }
  window.addEventListener('mousemove', move, {passive:true});
  document.body.classList.add('has-custom-cursor');

  const hoverables = ['a','button','.tab','.carousel-nav'];
  hoverables.forEach(sel => {
    $$(sel).forEach(el => {
      el.addEventListener('mouseenter', ()=> cursor.classList.add('hover'));
      el.addEventListener('mouseleave', ()=> cursor.classList.remove('hover'));
    });
  });
})();

// ----------- 3D Viewer (tabs)
(function initModelViewer(){
  const mv = $('#mv');
  if (!mv) return;

  // Set this to your models folder:
  const MODEL_BASE = 'assets/water-game/';

  const FALLBACK = 'https://modelviewer.dev/shared-assets/models/Astronaut.glb';

  // Loads model by trying .gltf then .glb; if both fail → fallback.
  function loadModel(baseName){
    let attempts = [`${MODEL_BASE}${baseName}.gltf`, `${MODEL_BASE}${baseName}.glb`];
    let i = 0;

    function tryNext(){
      if (i >= attempts.length){ mv.src = FALLBACK; log(`❌ ${baseName} → fallback`); return; }
      const src = attempts[i++];
      mv.removeAttribute('src'); // force reload
      mv.src = src;

      const onError = () => {
        mv.removeEventListener('error', onError);
        log(`⚠️ failed: ${src}`);
        tryNext();
      };
      const onLoad = () => {
        mv.removeEventListener('load', onLoad);
        mv.removeEventListener('error', onError);
        log(`✅ loaded: ${src}`);
      };
      mv.addEventListener('error', onError, {once:true});
      mv.addEventListener('load',  onLoad,  {once:true});
    }
    tryNext();
  }

  // Tabs behavior
  const tabs = $$('.tab');
  function activate(tab){
    tabs.forEach(t=>{
      const on = (t === tab);
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    const base = tab.getAttribute('data-model');
    loadModel(base);
  }
  tabs.forEach(t => t.addEventListener('click', ()=> activate(t)));
  tabs.forEach(t => t.addEventListener('keydown', (e)=>{
    const i = tabs.indexOf(t);
    if (e.key === 'ArrowRight'){ e.preventDefault(); tabs[(i+1)%tabs.length].focus(); }
    if (e.key === 'ArrowLeft'){  e.preventDefault(); tabs[(i-1+tabs.length)%tabs.length].focus(); }
    if (e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); t.click(); }
  }));

  // Initial
  activate($('.tab.active') || tabs[0]);
})();

// ----------- Minimal Carousel (left column)
(function initCarousel(){
  const carousels = $$('[data-carousel]');
  carousels.forEach(setup);

  function setup(root){
    const track = $('[data-track]', root);
    const items = $$('.carousel-item', root);
    const prev  = $('[data-prev]', root);
    const next  = $('[data-next]', root);
    const dotsHost = $('[data-dots]', root);
    if (!track || !items.length) return;

    let index = Math.max(0, items.findIndex(el => el.classList.contains('current')));
    if (index < 0) index = 0;

    const dots = items.map((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', `Go to slide ${i+1}`);
      if (i === index) b.classList.add('active');
      dotsHost && dotsHost.appendChild(b);
      b.addEventListener('click', ()=> go(i));
      return b;
    });

    function update(){
      track.style.transform = `translateX(${-index*100}%)`;
      items.forEach((el,i)=> el.classList.toggle('current', i===index));
      dots.forEach((d,i)=> d.classList.toggle('active', i===index));
    }
    function go(i){ index = (i + items.length) % items.length; update(); }
    function goNext(){ go(index+1); }
    function goPrev(){ go(index-1); }

    prev && prev.addEventListener('click', goPrev);
    next && next.addEventListener('click', goNext);

    // Keyboard when focused within carousel
    root.addEventListener('keydown', (e)=>{
      if (e.key === 'ArrowRight'){ e.preventDefault(); goNext(); }
      if (e.key === 'ArrowLeft'){  e.preventDefault(); goPrev(); }
    });

    // Touch/drag swipe
    const viewport = root.querySelector('.carousel-viewport');
    let startX = 0, dx = 0, dragging = false;
    viewport && viewport.addEventListener('pointerdown', (e)=>{ dragging = true; startX = e.clientX; viewport.setPointerCapture(e.pointerId); });
    viewport && viewport.addEventListener('pointermove', (e)=>{ if (!dragging) return; dx = e.clientX - startX; track.style.transform = `translateX(${-index*100 + (dx/viewport.clientWidth)*100}%)`; });
    viewport && viewport.addEventListener('pointerup', (e)=>{ dragging = false; viewport.releasePointerCapture(e.pointerId); if (Math.abs(dx) > viewport.clientWidth*0.15) (dx<0 ? goNext() : goPrev()); else update(); dx = 0; });

    // Autoplay (pause on hover)
    let timer = setInterval(goNext, 5000);
    root.addEventListener('mouseenter', ()=> clearInterval(timer));
    root.addEventListener('mouseleave', ()=> { clearInterval(timer); timer = setInterval(goNext, 5000); });

    update();
  }
})();
