const header = document.querySelector('.site-header');
const sentinel = document.querySelector('#projects-sentinel');

if (header && sentinel && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(([e])=>{
    if(e.isIntersecting){ header.classList.add('is-solid'); }
    else{ header.classList.remove('is-solid'); }
  },{ rootMargin:`-${header.offsetHeight}px 0px 0px 0px`, threshold:0 });
  io.observe(sentinel);
} 