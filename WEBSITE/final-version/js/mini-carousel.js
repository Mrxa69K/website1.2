/**
 * Small autoplay image carousel, used to break up text-heavy sections
 * (e.g. the About page) with photos instead of paragraphs.
 * Supports multiple independent instances per page via .mini-carousel.
 */
(function () {
  function initCarousel(root) {
    const slides = root.querySelectorAll('.mini-carousel-slide');
    const dots = root.querySelectorAll('.mini-carousel-dot');
    if (!slides.length) return;

    let index = 0;
    let timer = null;
    const delay = 4000;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function show(i) {
      slides.forEach(function (s) { s.classList.remove('active'); });
      dots.forEach(function (d) { d.classList.remove('active'); });
      slides[i].classList.add('active');
      if (dots[i]) dots[i].classList.add('active');
      index = i;
    }

    function next() {
      show((index + 1) % slides.length);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function start() {
      stop();
      if (reducedMotion || slides.length < 2) return;
      timer = setInterval(next, delay);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);

    show(0);
    start();
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.mini-carousel').forEach(initCarousel);
  });
})();
