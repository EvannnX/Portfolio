// VoiceGuard — architecture diagram: choose an outcome to light up the path it takes.
(function () {
  'use strict';
  const arch = document.getElementById('arch');
  const buttons = Array.from(document.querySelectorAll('[data-path]'));
  if (!arch || !buttons.length) return;

  const DRAW_IN_MS = 2600;

  const select = (btn) => {
    const isSame = btn.getAttribute('aria-pressed') === 'true';
    buttons.forEach((b) => b.setAttribute('aria-pressed', 'false'));
    if (isSame) { arch.removeAttribute('data-path'); return; } // click again to show everything
    btn.setAttribute('aria-pressed', 'true');
    arch.dataset.path = btn.dataset.path;
  };

  buttons.forEach((b) => b.addEventListener('click', () => select(b)));

  // Once the staggered draw-in has played, let highlighting respond without delays.
  arch.addEventListener('revealed', () => setTimeout(() => arch.classList.add('settled'), DRAW_IN_MS));
})();
