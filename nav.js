(function () {
  'use strict';

  var SUBPAGE_NAV =
    '<div class="nav-backdrop"></div>' +
    '<header class="site-header">' +
      '<div class="site-header-inner">' +
        '<div class="site-logo">' +
          '<a href="index.html">Evida <span>Studio</span></a>' +
        '</div>' +
        '<button class="nav-toggle" type="button" aria-label="Toggle navigation" aria-expanded="false">' +
          '<span class="nav-toggle-line"></span>' +
          '<span class="nav-toggle-line"></span>' +
          '<span class="nav-toggle-line"></span>' +
        '</button>' +
        '<nav class="nav-links">' +
          '<a href="portfolio.html">Work</a>' +
          '<a href="index.html#about">About</a>' +
          '<a href="insights.html">Insights</a>' +
          '<a href="index.html#contact" class="btn-nav">Get in Touch</a>' +
        '</nav>' +
      '</div>' +
    '</header>';

  function init() {

    /* 1 — Inject header ONLY on subpages, never on index.html */
    var path = window.location.pathname;
    var isHome = path === '/'
              || path.endsWith('/index.html')
              || path === '';

    var mount = document.getElementById('site-header-mount');
    if (mount && !isHome) {
      mount.outerHTML = SUBPAGE_NAV;
    }

    /* 2 — Active link highlight */
    var page = path.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(function (a) {
      var href = a.getAttribute('href');
      if (
        (page === 'portfolio.html' && href === 'portfolio.html') ||
        (page === 'insights.html'  && href === 'insights.html')
      ) {
        a.setAttribute('aria-current', 'page');
      }
    });

    /* 3 — Hamburger */
    var toggle   = document.querySelector('.nav-toggle');
    var navLinks = document.querySelector('.nav-links');
    var backdrop = document.querySelector('.nav-backdrop');

    if (!toggle || !navLinks) return;

    function open() {
      navLinks.classList.add('is-open');
      toggle.classList.add('is-active');
      toggle.setAttribute('aria-expanded', 'true');
      if (backdrop) backdrop.classList.add('is-active');
      document.body.style.overflow = 'hidden';
    }

    function close() {
      navLinks.classList.remove('is-open');
      toggle.classList.remove('is-active');
      toggle.setAttribute('aria-expanded', 'false');
      if (backdrop) backdrop.classList.remove('is-active');
      document.body.style.overflow = '';
    }

    toggle.addEventListener('click', function () {
      navLinks.classList.contains('is-open') ? close() : open();
    });

    if (backdrop) {
      backdrop.addEventListener('click', close);
    }

    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', close);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= 768) close();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
