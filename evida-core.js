document.addEventListener('DOMContentLoaded', function () {

  var frames = document.querySelectorAll('.reveal-frame');
  if (frames.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.05 });
    frames.forEach(function (frame) { io.observe(frame); });
  }

  var scrollBtn = document.getElementById('scrollTopBtn');
  if (scrollBtn) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 400) scrollBtn.classList.add('is-visible');
      else scrollBtn.classList.remove('is-visible');
    }, { passive: true });
    scrollBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var banner = document.getElementById('cookieBanner');
  var gaId = 'G-L802JYJHBS';

  function loadAnalytics() {
    if (window.gaLoaded) return;
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + gaId;
    document.head.appendChild(script);
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', gaId);
    window.gaLoaded = true;
  }

  if (localStorage.getItem('evida_cookie_consent') === 'accepted') {
    loadAnalytics();
  } else if (!localStorage.getItem('evida_cookie_consent')) {
    setTimeout(function () { if (banner) banner.classList.add('is-visible'); }, 1500);
  }

  var acceptBtn = document.getElementById('cookieAccept');
  if (acceptBtn) acceptBtn.addEventListener('click', function () {
    localStorage.setItem('evida_cookie_consent', 'accepted');
    if (banner) banner.classList.remove('is-visible');
    loadAnalytics();
  });

  var rejectBtn = document.getElementById('cookieReject');
  if (rejectBtn) rejectBtn.addEventListener('click', function () {
    localStorage.setItem('evida_cookie_consent', 'rejected');
    if (banner) banner.classList.remove('is-visible');
  });

});