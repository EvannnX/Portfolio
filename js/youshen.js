// Yóushén — compare slider and the live 3D deity viewer.
(function () {
  'use strict';

  // ---------- Compare slider ----------
  document.querySelectorAll('.compare').forEach((box) => {
    const input = box.querySelector('input[type="range"]');
    if (!input) return;
    const set = () => box.style.setProperty('--pos', input.value + '%');
    input.addEventListener('input', set);
    set();
  });

  // ---------- 3D viewer ----------
  // Models are served (with CORS) by the live Yóushén site.
  const MODEL_BASE = 'https://evannnx.github.io/youshen/assets/temple-models/';
  const DEFAULT_ORBIT = '0deg 80deg auto';
  const MODEL_VIEWER_SRC = 'https://cdn.jsdelivr.net/npm/@google/model-viewer@3.5.0/dist/model-viewer.min.js';

  const viewer = document.getElementById('viewer');
  if (!viewer) return;
  const picks = Array.from(document.querySelectorAll('[data-model]'));
  const nameEl = viewer.querySelector('.name b');
  const roleEl = viewer.querySelector('.name span');
  const loadingEl = viewer.querySelector('.loading');
  let mv = null;
  let scriptPromise = null;

  const loadScript = () => {
    if (scriptPromise) return scriptPromise;
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.type = 'module';
      s.src = MODEL_VIEWER_SRC;
      s.onload = resolve;
      s.onerror = () => reject(new Error('model-viewer failed to load'));
      document.head.appendChild(s);
    });
    return scriptPromise;
  };

  const show = (btn) => {
    picks.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    nameEl.textContent = btn.dataset.en;
    roleEl.textContent = btn.dataset.role;
    viewer.classList.remove('ready');
    loadingEl.textContent = 'Loading model…';
    mv.setAttribute('alt', btn.dataset.en + ' — 3D model');
    // Exporters leave some figures facing sideways; start each one face-on.
    mv.setAttribute('camera-orbit', btn.dataset.orbit || DEFAULT_ORBIT);
    mv.src = MODEL_BASE + encodeURIComponent(btn.dataset.model) + '.glb';
  };

  const init = () => {
    loadScript().then(() => {
      mv = document.createElement('model-viewer');
      ['camera-controls', 'auto-rotate', 'disable-zoom'].forEach((a) => mv.setAttribute(a, ''));
      mv.setAttribute('auto-rotate-delay', '0');
      mv.setAttribute('rotation-per-second', '18deg');
      mv.setAttribute('shadow-intensity', '0.8');
      mv.setAttribute('exposure', '1.05');
      mv.setAttribute('interaction-prompt', 'none');
      // We already defer creation until the section is near; load immediately once created.
      mv.setAttribute('loading', 'eager');
      mv.setAttribute('reveal', 'auto');
      mv.addEventListener('load', () => {
        if (typeof mv.resetTurntableRotation === 'function') mv.resetTurntableRotation(0);
        viewer.classList.add('ready');
      });
      mv.addEventListener('error', () => { loadingEl.textContent = 'Model could not load — open it on the live site.'; });
      viewer.prepend(mv);
      show(picks.find((b) => b.getAttribute('aria-pressed') === 'true') || picks[0]);
    }).catch(() => { loadingEl.textContent = '3D viewer unavailable — open it on the live site.'; });
  };

  picks.forEach((b) => b.addEventListener('click', () => { if (mv) show(b); }));

  // Load the viewer (and its ~2–6 MB model) only when it is about to be seen.
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); init(); } }, { rootMargin: '400px 0px' });
    io.observe(viewer);
  } else {
    init();
  }
})();
