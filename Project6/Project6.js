// Channel + spotlight
const CHANNEL_URL = "https://www.youtube.com/@TheBestJackLambert";

const POPULAR_VIDEO_ID = "Bp5GJNn_ttE"; // "PUNISH the Caro-Kann in 6 moves"
const RECENT_VIDEO_ID = "Yfrf65VV9iY"; // "PUNISH the Philidor Defense in 5 MOVES"

// Cheat-card “Watch breakdown” mapping
const WATCH_MAP = {
  traxler: { videoId: "i9v_zZA4VmI", ts: 0 }, // “CONQUER The Fried Liver Attack” (Traxler)
  scotch: { videoId: "StP6jlUpdiA", ts: 0 }, // “DESTORY as white with Garry Kasparov's favorite opening” (Scotch)
};


// Optional PGN config (kept here but fully guarded)
// PGNs live in the same folder as Project6.js / Project6.html
const PGN_FILES = {
  traxler: new URL('./traxler.pgn', import.meta.url).href,
  scotch: new URL('./scotch.pgn', import.meta.url).href,
};

// =================================================================

// [previous code remains same until DOMContentLoaded...]

document.addEventListener('DOMContentLoaded', () => {

  // ... [Previous typed/particles/cursor code preserved] ...

  /* Typed header (vanilla, robust if element missing) */
  const typed = document.getElementById('typed');
  if (typed) {
    const phrases = [
      'Video Editting',
      'Script Writting',
      'Photoshop',
    ];
    let i = 0, c = 0, del = false;
    (function loop() {
      const s = phrases[i];
      if (!del) {
        c++; typed.textContent = s.slice(0, c);
        if (c === s.length) { del = true; return setTimeout(loop, 1200); }
        setTimeout(loop, 90);
      } else {
        c--; typed.textContent = s.slice(0, c);
        if (c === 0) { del = false; i = (i + 1) % phrases.length; }
        setTimeout(loop, 45);
      }
    })();
  }

  /* Particles (vanilla) */
  const canvas = document.getElementById('particles');
  if (canvas) {
    const ctx = canvas.getContext('2d'), DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W, H, pts;
    const resize = () => {
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = Math.floor(W * DPR); canvas.height = Math.floor(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    const make = n => Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H, vx: (Math.random() * 2 - 1) * 0.8, vy: (Math.random() * 2 - 1) * 0.8, r: Math.random() * 2 + 1
    }));
    const mouse = { x: -999, y: -999 };
    canvas.addEventListener('mousemove', e => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    canvas.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });
    const step = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of pts) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < 10000) { p.vx += dx * 0.0005; p.vy += dy * 0.0005; }
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = '#ff4d00'; ctx.fill();
      }
      for (let a = 0; a < pts.length; a++) {
        for (let b = a + 1; b < pts.length; b++) {
          const A = pts[a], B = pts[b], dx = A.x - B.x, dy = A.y - B.y, d2 = dx * dx + dy * dy;
          if (d2 < 150 * 150) {
            const alpha = 1 - d2 / (150 * 150);
            ctx.strokeStyle = `rgba(255,215,0,${alpha * 0.4})`; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
          }
        }
      }
      requestAnimationFrame(step);
    };
    const initParticles = () => { resize(); pts = make(80); step(); };
    window.addEventListener('resize', resize); initParticles();
  }

  /* Cursor + progress + reveal */
  /* Cursor + progress + reveal + back-to-top handled by shared-interactions.js */
  const y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();

  /* Videos */
  const popular = document.getElementById('popular-iframe');
  const recent = document.getElementById('recent-iframe');
  if (popular) popular.src = `https://www.youtube.com/embed/${POPULAR_VIDEO_ID}`;
  if (recent) recent.src = `https://www.youtube.com/embed/${RECENT_VIDEO_ID}`;

  /* Stats (precise scraped data) */
  const setText = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  setText('stat-subs', '799');
  setText('stat-videos', '6');
  setText('stat-elo', '939');
  setText('stat-views', '54,874');

  // Wire "View PGN" links
  document.querySelectorAll('[data-pgnview]').forEach(a => {
    const key = a.dataset.pgnview;
    a.href = PGN_FILES[key];               // opens the real file so you can eyeball it
  });

  // Tiny toast (visual feedback)
  let toastEl = document.getElementById('toast');
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.id = 'toast';
    toastEl.style.cssText =
      'position:fixed;bottom:18px;left:18px;padding:10px 12px;border-radius:10px;' +
      'background:#111;border:1px solid #262626;color:#fff;opacity:0;' +
      'transition:opacity .25s;z-index:9999;font:500 13px/1.3 system-ui';
    document.body.appendChild(toastEl);
  }
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.style.opacity = '1';
    setTimeout(() => toastEl.style.opacity = '0', 1200);
  }

  // Copy PGN (fetch file → copy; fallback to CHEATS[] if needed)
  document.querySelectorAll('[data-pgnkey]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const key = btn.dataset.pgnkey;
      let txt = '';
      const url = PGN_FILES[key];

      try {
        if (url) {
          const res = await fetch(url, { cache: 'no-cache' });
          if (!res.ok) throw new Error('HTTP ' + res.status);
          txt = await res.text();
        }
      } catch (err) {
        console.warn('PGN fetch failed for', key, url, err);
        if (typeof CHEATS !== 'undefined') txt = CHEATS[key] || '';
      }

      const old = btn.textContent;
      try {
        await navigator.clipboard.writeText(txt || '');
        // if txt is empty, tell you explicitly
        const bytes = (new Blob([txt || ''])).size;
        btn.textContent = 'Copied ✔︎';
        toast(bytes ? `Copied PGN (${bytes} bytes)` : 'Copied (but PGN is empty)');
        setTimeout(() => btn.textContent = old, 900);
      } catch (err) {
        console.error('Clipboard failed', err);
        btn.textContent = 'Copy failed';
        toast('Copy failed');
        setTimeout(() => btn.textContent = old, 900);
      }
    });
  });


  // Map “Watch breakdown” to YOUR actual videos
  const CHEAT_VIDEOS = {
    traxler: `https://www.youtube.com/watch?v=${POPULAR_VIDEO_ID}`,
    scotch: `https://www.youtube.com/watch?v=${RECENT_VIDEO_ID}`
  };

  // --- Channel moments pulled from YOUR uploads (edit timestamps/notes anytime) ---
  const VIDEO_MOMENTS = [
    {
      title: "Why Bc5!? works vs Ng5 (Traxler idea)",
      videoId: POPULAR_VIDEO_ID,
      ts: 42, // seconds — change to the real timestamp from your video
      fen: "r1bqkb1r/pppp1ppp/2n2n2/2B1p1B1/4P1N1/8/PPPP1PPP/RN1QK2R b KQkq - 4 5",
      notes: "Set the trap, but keep development first — don’t overforce."
    },
    {
      title: "Scotch structure squeeze",
      videoId: RECENT_VIDEO_ID,
      ts: 128,
      fen: "rnbq1rk1/ppp2ppp/3bpn2/3p4/3P4/2P1PN2/PP1NBPPP/R1BQ1RK1 w - - 0 8",
      notes: "Break the bind with dxc5!/b4 ideas — easy plan in rapid."
    },
    {
      title: "Endgame clip: activity > material",
      videoId: RECENT_VIDEO_ID,
      ts: 305,
      fen: "8/1p3k2/p1p3p1/3p1p1p/3P1P1P/2P3P1/P1K5/8 w - - 0 36",
      notes: "Shoulder the king; fix the pawn structure before pushing."
    }
  ];

  // =================================================================
  // CHESS INTEGRATION
  // =================================================================

  function initChessBoards() {
    if (typeof Chessboard === 'undefined' || typeof Chess === 'undefined') {
      console.warn('Chess libraries not loaded');
      return;
    }

    // 1. Traxler Board
    const traxlerFEN = 'r1bqk2r/pppp1ppp/2n2n2/2b1p1N1/2B1P3/8/PPPP1PPP/RNBQK2R w KQkq - 6 5'; // After 4...Bc5
    const boardTraxler = Chessboard('board-traxler', {
      position: traxlerFEN,
      draggable: true,
      pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
    });

    // 2. Scotch Board
    const scotchFEN = 'r1bqk1nr/pppp1ppp/2n5/2b5/3NP3/8/PPP2PPP/RNBQKB1R w KQkq - 1 5'; // After 4...Bc5
    const boardScotch = Chessboard('board-scotch', {
      position: scotchFEN,
      draggable: true,
      pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
    });

    // Resize boards on window resize
    window.addEventListener('resize', () => {
      boardTraxler.resize();
      boardScotch.resize();
    });
  }

  // Initialize Chess
  initChessBoards();

});



// Wire "Watch breakdown" links
document.querySelectorAll('[data-watch]').forEach(a => {
  const key = a.dataset.watch;
  const w = WATCH_MAP[key];
  if (!w) return;
  const t = (w.ts && Number.isFinite(w.ts) && w.ts > 0) ? `&t=${w.ts}s` : '';
  a.href = `https://www.youtube.com/watch?v=${w.videoId}${t}`;
  a.target = '_blank';
  a.rel = 'noopener';
});

// Wire "View channel" links
document.querySelectorAll('[data-channel]').forEach(a => {
  a.href = CHANNEL_URL;
  a.target = '_blank';
  a.rel = 'noopener';
});