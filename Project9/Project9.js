// Lightweight page behaviors — no dependencies.
(function () {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  document.addEventListener('DOMContentLoaded', () => {
    /* ---------- Custom cursor ---------- */
    const cursor = $('.cursor');
    if (cursor) {
      const moveCursor = (event) => {
        cursor.style.left = `${event.clientX}px`;
        cursor.style.top = `${event.clientY}px`;
      };
      document.addEventListener('pointermove', moveCursor, { passive: true });

      const interactive = $$('a, button, .code-tab, .gallery-nav');
      interactive.forEach((el) => {
        el.addEventListener('mouseenter', () => cursor.classList.add('cursor--active'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('cursor--active'));
      });

      window.addEventListener('touchstart', () => { cursor.style.display = 'none'; }, { once: true });
    }

    /* ---------- Scroll progress ---------- */
    const progress = $('#scroll-progress');
    if (progress) {
      const update = () => {
        const doc = document.documentElement;
        const height = doc.scrollHeight - doc.clientHeight;
        const ratio = height > 0 ? (window.scrollY / height) : 0;
        progress.style.width = `${Math.max(0, Math.min(1, ratio)) * 100}%`;
      };
      update();
      document.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
    }

    /* ---------- Reveal on scroll ---------- */
    const toReveal = $$('[data-fade], footer');
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('aos-animate');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
      toReveal.forEach((el) => io.observe(el));
    } else {
      toReveal.forEach((el) => el.classList.add('aos-animate'));
    }

    /* ---------- Back to top ---------- */
    const backToTop = $('.back-to-top');
    if (backToTop) {
      const toggle = () => {
        if (window.scrollY > 280) backToTop.classList.add('show');
        else backToTop.classList.remove('show');
      };
      toggle();
      document.addEventListener('scroll', toggle, { passive: true });
      backToTop.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    /* ---------- Gallery ---------- */
    $$('.gallery[data-gallery]').forEach((gallery) => {
      const track = $('[data-track]', gallery);
      const items = $$('.gallery-item', track);
      const prev = $('[data-prev]', gallery);
      const next = $('[data-next]', gallery);
      const dotsWrap = $('[data-dots]', gallery);
      const viewport = $('.gallery-viewport', gallery);
      if (!track || items.length === 0) return;

      let index = 0;

      const update = () => {
        track.style.transform = `translateX(${-index * 100}%)`;
        items.forEach((item, i) => item.classList.toggle('current', i === index));
        if (dotsWrap) {
          $$('button', dotsWrap).forEach((dot, i) => {
            dot.setAttribute('aria-current', String(i === index));
          });
        }
      };

      const setIndex = (value) => {
        index = (value + items.length) % items.length;
        update();
      };

      if (dotsWrap) {
        dotsWrap.innerHTML = '';
        items.forEach((_, i) => {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
          dot.addEventListener('click', () => setIndex(i));
          dotsWrap.appendChild(dot);
        });
      }

      prev?.addEventListener('click', () => setIndex(index - 1));
      next?.addEventListener('click', () => setIndex(index + 1));

      if (viewport) {
        viewport.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowLeft') { e.preventDefault(); setIndex(index - 1); }
          if (e.key === 'ArrowRight') { e.preventDefault(); setIndex(index + 1); }
        });

        let startX = null;
        viewport.addEventListener('pointerdown', (e) => { startX = e.clientX; });
        viewport.addEventListener('pointerup', (e) => {
          if (startX == null) return;
          const dx = e.clientX - startX;
          if (Math.abs(dx) > 28) setIndex(index + (dx < 0 ? 1 : -1));
          startX = null;
        });
        viewport.addEventListener('pointerleave', () => { startX = null; });
      }

      update();
    });

    /* ---------- Typed headline ---------- */
    const typedEl = $('#typed-text');
    if (typedEl) {
      const strings = (() => {
        try {
          const raw = typedEl.getAttribute('data-typed');
          if (raw) return JSON.parse(raw);
        } catch (err) {
          console.warn('Typed data parse failed', err);
        }
        return [typedEl.textContent.trim() || 'robot precision'];
      })();

      let index = 0;
      let pos = 0;
      let direction = 1;

      const type = () => {
        const current = strings[index] || '';
        typedEl.textContent = current.slice(0, pos);

        if (direction > 0 && pos === current.length) {
          direction = -1;
          setTimeout(type, 1300);
          return;
        }

        if (direction < 0 && pos === 0) {
          direction = 1;
          index = (index + 1) % strings.length;
        }

        pos += direction;
        const delay = direction > 0 ? 60 : 28;
        setTimeout(type, delay);
      };

      typedEl.textContent = '';
      setTimeout(type, 380);
    }

    /* ---------- Code tabs & copy ---------- */
    const tabs = $$('.code-tab');
    const panes = $$('.code-pane');
    const copyBtn = $('#copyCode');

    const activate = (id) => {
      tabs.forEach((tab) => {
        const isActive = tab.getAttribute('data-code') === id;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', String(isActive));
      });
      panes.forEach((pane) => {
        pane.classList.toggle('active', pane.id === id);
      });
    };

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => activate(tab.getAttribute('data-code')));
      tab.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        const current = tabs.indexOf(tab);
        const nextIndex = clamp(
          current + (e.key === 'ArrowRight' ? 1 : -1),
          0,
          tabs.length - 1
        );
        const nextTab = tabs[nextIndex];
        nextTab.focus();
        activate(nextTab.getAttribute('data-code'));
      });
    });

    const initialTab = tabs.find((tab) => tab.classList.contains('active')) || tabs[0];
    if (initialTab) activate(initialTab.getAttribute('data-code'));

    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        const activePane = $('.code-pane.active .code');
        const text = activePane ? activePane.textContent : '';
        if (!text) return;
        try {
          await navigator.clipboard.writeText(text);
          const original = copyBtn.textContent;
          copyBtn.textContent = 'Copied!';
          setTimeout(() => { copyBtn.textContent = original; }, 1400);
        } catch (err) {
          console.warn('Copy failed', err);
        }
      });
    }

    /* ---------- Footer year ---------- */
    const year = $('#current-year');
    if (year) year.textContent = new Date().getFullYear();
  });
})();
