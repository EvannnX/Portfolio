// ECHOES — guidance map: hovering / focusing a method explains where it sits.
(function () {
  'use strict';
  const map = document.getElementById('gmap');
  const note = document.getElementById('gmapNote');
  if (!map || !note) return;

  const dots = Array.from(map.querySelectorAll('.dot'));
  const echoes = map.querySelector('.dot.echoes');

  const select = (dot) => {
    dots.forEach((d) => d.classList.toggle('on', d === dot));
    note.replaceChildren();
    const name = document.createElement('strong');
    name.textContent = dot.textContent;
    note.append(name, ': ' + (dot.dataset.note || ''));
  };

  dots.forEach((dot) => {
    dot.addEventListener('mouseenter', () => select(dot));
    dot.addEventListener('focus', () => select(dot));
    dot.addEventListener('click', () => select(dot));
  });
  map.addEventListener('mouseleave', () => { if (echoes) select(echoes); });
})();
