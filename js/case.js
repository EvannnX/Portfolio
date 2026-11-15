// Shared behaviour for case study pages.
// - footer year, Pulse-style reveal, header transparency over the hero
// - count-up numbers:   <b data-count="72" data-suffix="%">
// - tabs / steppers:    <div data-tabs [data-auto="4500"]> with [data-key] buttons and [data-pane] panes
(function () {
  'use strict';

  const hasIO = 'IntersectionObserver' in window;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ---------- Count-up ----------
  const COUNT_MS = 1400;
  const runCount = (el) => {
    const target = Number(el.dataset.count);
    if (!Number.isFinite(target)) return;
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = prefix + target + suffix; return; }
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / COUNT_MS);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  // ---------- Reveal ----------
  const onReveal = (el) => {
    el.classList.add('in');
    el.querySelectorAll('[data-count]').forEach(runCount);
    el.dispatchEvent(new CustomEvent('revealed'));
  };
  // An element is revealed as soon as its top edge passes this line, measured from the
  // top of the viewport. Using the top edge (not a visible fraction) keeps very tall
  // blocks, such as photo grids, from staying hidden.
  const REVEAL_LINE = 0.92;
  let pending = Array.from(document.querySelectorAll('.reveal'));

  const sweep = () => {
    const line = window.innerHeight * REVEAL_LINE;
    pending = pending.filter((el) => {
      if (el.getBoundingClientRect().top > line) return true;
      onReveal(el);
      return false;
    });
    if (!pending.length) {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    }
  };
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; sweep(); });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  window.addEventListener('load', sweep);
  sweep();
  if (hasIO) {
    // The observer catches changes that happen without a scroll event (images
    // loading above, content resizing); the scroll listener is the safety net.
    const io = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) sweep(); }, { threshold: 0 });
    pending.forEach((el) => io.observe(el));
  }

  // ---------- Header transparency (Pulse) ----------
  const header = document.querySelector('.site-header');
  const hero = document.querySelector('.hero-video');
  if (header && hero && hasIO) {
    new IntersectionObserver(([e]) => header.classList.toggle('transparent', e.isIntersecting), { threshold: 0.35 }).observe(hero);
  }

  // ---------- Tabs / steppers ----------
  const initTabs = (root) => {
    const buttons = Array.from(root.querySelectorAll('[data-key]'));
    const panes = Array.from(root.querySelectorAll('[data-pane]'));
    if (!buttons.length) return;
    const autoMs = Number(root.dataset.auto) || 0;
    const progress = root.querySelector('.progress');
    let index = 0;
    let timer = null;
    let userTook = false;

    if (progress) {
      progress.innerHTML = buttons.map(() => '<span><i></i></span>').join('');
      progress.style.setProperty('--dur', autoMs + 'ms');
    }

    const show = (i) => {
      index = (i + buttons.length) % buttons.length;
      const key = buttons[index].dataset.key;
      buttons.forEach((b, j) => b.setAttribute('aria-selected', String(j === index)));
      panes.forEach((p) => { p.hidden = p.dataset.pane !== key; });
      if (progress) {
        Array.from(progress.children).forEach((s, j) => {
          s.className = j < index ? 'done' : (j === index && autoMs && !userTook ? 'on' : (j === index ? 'done' : ''));
          if (j === index) { const bar = s.firstElementChild; bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
        });
      }
      root.dispatchEvent(new CustomEvent('tabchange', { detail: { key, index } }));
    };

    const stop = () => { userTook = true; clearInterval(timer); timer = null; };
    const start = () => {
      if (!autoMs || userTook || reduceMotion || timer) return;
      timer = setInterval(() => show(index + 1), autoMs);
    };

    buttons.forEach((b, i) => {
      b.setAttribute('role', 'tab');
      b.addEventListener('click', () => { stop(); show(i); });
      b.addEventListener('keydown', (ev) => {
        if (ev.key !== 'ArrowRight' && ev.key !== 'ArrowDown' && ev.key !== 'ArrowLeft' && ev.key !== 'ArrowUp') return;
        ev.preventDefault(); stop();
        show(index + (ev.key === 'ArrowRight' || ev.key === 'ArrowDown' ? 1 : -1));
        buttons[index].focus();
      });
    });

    show(0);
    // Only auto-advance while visible.
    if (autoMs && hasIO) {
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting) { show(index); start(); } else { clearInterval(timer); timer = null; }
      }, { threshold: 0.35 }).observe(root);
    }
  };
  document.querySelectorAll('[data-tabs]').forEach(initTabs);

  // Expose a tiny helper for page scripts.
  window.CaseKit = { runCount };
})();
