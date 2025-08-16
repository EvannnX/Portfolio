(function(){
  if ('IntersectionObserver' in window) {
    const imgs = document.querySelectorAll('img[loading="lazy"][data-src]');
    const io = new IntersectionObserver((entries, obs)=>{
      entries.forEach(e=>{
        if (!e.isIntersecting) return;
        const el = e.target;
        const src = el.getAttribute('data-src');
        if (src) { el.src = src; el.removeAttribute('data-src'); }
        obs.unobserve(el);
      });
    }, {rootMargin:'200px 0px'});
    imgs.forEach(img=>io.observe(img));
  }

  const video = document.querySelector('.hero-video');
  if (video) {
    video.addEventListener('error', ()=>{
      const poster = video.getAttribute('poster');
      if (poster) {
        const fallback = document.createElement('div');
        fallback.setAttribute('aria-hidden','true');
        fallback.style.cssText = `position:absolute;inset:0;background:url('${poster}') center/cover no-repeat;`;
        video.insertAdjacentElement('afterend', fallback);
        video.remove();
      }
    }, {once:true});
  }
})(); 