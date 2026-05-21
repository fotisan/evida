/* ============================================================
   EVIDA STUDIO — nav.js  v1.0
   ============================================================
   Shared navigation for all pages on evidastudio.com.

   HOW TO USE (every page except index.html):
   1. Add in <head>:   <script src="nav.js" defer></script>
   2. Replace the entire  <div class="nav-backdrop"></div>
      + <header class="site-header">…</header>  block with:
        <div id="site-header-mount"></div>
   3. Remove the nav toggle JS from the inline <script>.

   FOR index.html:
   1. Add in <head>:   <script src="nav.js" defer></script>
   2. Keep the existing nav HTML as-is (it has unique links).
   3. Remove the nav toggle JS from the inline <script>.
   nav.js will skip injection (no mount div) and only bind
   the toggle interactions on the existing nav.

   FUTURE ARTICLES:
   Copy any article as template. nav.js auto-detects article
   pages (any file not in KNOWN_PAGES) and marks "Insights"
   as the active parent link. No extra config needed.
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     CONFIG — change URLs or labels here only.
  ---------------------------------------------------------- */
  var CONFIG = {
    logo: { href: 'index.html', name: 'Evida', tagline: 'Studio' },
    links: [
      { href: 'portfolio.html',      label: 'Case Studies' },
      { href: 'index.html#about',    label: 'The Studio'   },
      { href: 'index.html#services', label: 'Methodology'  },
      { href: 'insights.html',       label: 'Insights'     }
    ],
    socials: [
      {
        href:  'https://www.instagram.com/evidastudio/',
        label: 'Instagram',
        icon:  '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 3h10c2.21 0 4 1.79 4 4v10c0 2.21-1.79 4-4 4H7c-2.21 0-4-1.79-4-4V7c0-2.21 1.79-4 4-4Zm10 2H7c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2ZM12 7a5 5 0 1 1 0 10a5 5 0 0 1 0-10Zm0 2.2a2.8 2.8 0 1 0 0 5.6a2.8 2.8 0 0 0 0-5.6ZM17.2 6.6a1 1 0 1 1-2 0a1 1 0 0 1 2 0Z"/></svg>'
      },
      {
        href:  'https://gr.linkedin.com/in/fotis-antonas-643511181',
        label: 'LinkedIn',
        icon:  '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452H17.21v-5.569c0-1.328-.027-3.037-1.852-3.037c-1.853 0-2.136 1.445-2.136 2.94v5.666H9.985V9h3.112v1.561h.044c.434-.82 1.494-1.686 3.074-1.686c3.288 0 3.892 2.164 3.892 4.977v6.6ZM5.337 7.433a1.81 1.81 0 1 1 0-3.62a1.81 1.81 0 0 1 0 3.62ZM3.722 20.452h3.23V9h-3.23v11.452Z"/></svg>'
      }
    ],
    cta: { href: 'index.html#contact', label: 'Get in Touch' }
  };

  /* ----------------------------------------------------------
     Known top-level pages.
     Any file NOT in this list is treated as an article page
     and gets aria-current on the "Insights" link.
  ---------------------------------------------------------- */
  var KNOWN_PAGES = ['index.html', 'portfolio.html', 'insights.html'];

  /* ----------------------------------------------------------
     Helpers
  ---------------------------------------------------------- */
  function getCurrentFile() {
    var parts = window.location.pathname.split('/');
    var file  = parts[parts.length - 1];
    return file || 'index.html';
  }

  function isArticlePage(file) {
    return KNOWN_PAGES.indexOf(file) === -1;
  }

  /* ----------------------------------------------------------
     Build nav links HTML
  ---------------------------------------------------------- */
  function buildLinksHTML(currentFile) {
    return CONFIG.links.map(function (link) {
      var linkFile = link.href.split('#')[0];
      var hasHash  = link.href.indexOf('#') !== -1;
      var active   = false;

      if (!hasHash && currentFile === linkFile) { active = true; }
      if (isArticlePage(currentFile) && link.href === 'insights.html') { active = true; }

      return '<a href="' + link.href + '"' + (active ? ' aria-current="page"' : '') + '>' + link.label + '</a>';
    }).join('\n        ');
  }

  /* ----------------------------------------------------------
     Build socials HTML
  ---------------------------------------------------------- */
  function buildSocialsHTML() {
    return CONFIG.socials.map(function (s) {
      return '<a class="nav-social" href="' + s.href + '" target="_blank" rel="noopener" aria-label="' + s.label + '">' + s.icon + '</a>';
    }).join('\n          ');
  }

  /* ----------------------------------------------------------
     Build and inject full header HTML into mount div.
     If no mount div exists, skip injection (index.html case).
  ---------------------------------------------------------- */
  function injectNav() {
    var mount = document.getElementById('site-header-mount');
    if (!mount) { return; } // index.html keeps its own nav HTML

    var currentFile = getCurrentFile();
    var linksHTML   = buildLinksHTML(currentFile);
    var socialsHTML = buildSocialsHTML();

    var html = [
      '<div class="nav-backdrop"></div>',
      '<header class="site-header">',
      '  <div class="site-header-inner">',
      '    <div class="site-logo">',
      '      <a href="' + CONFIG.logo.href + '">' + CONFIG.logo.name + ' <span>' + CONFIG.logo.tagline + '</span></a>',
      '    </div>',
      '    <button class="nav-toggle" type="button" aria-label="Toggle navigation">',
      '      <span class="nav-toggle-line"></span>',
      '      <span class="nav-toggle-line"></span>',
      '      <span class="nav-toggle-line"></span>',
      '    </button>',
      '    <nav class="nav-links">',
      '      ' + linksHTML,
      '      <div class="nav-socials">',
      '        ' + socialsHTML,
      '      </div>',
      '      <a href="' + CONFIG.cta.href + '" class="btn-nav">' + CONFIG.cta.label + '</a>',
      '    </nav>',
      '  </div>',
      '</header>'
    ].join('\n');

    mount.outerHTML = html;
  }

  /* ----------------------------------------------------------
     Bind toggle interactions.
     Works on both injected and pre-existing nav.
  ---------------------------------------------------------- */
  function initNav() {
    var toggle   = document.querySelector('.nav-toggle');
    var links    = document.querySelector('.nav-links');
    var backdrop = document.querySelector('.nav-backdrop');

    function closeNav() {
      if (links)    { links.classList.remove('is-open'); }
      if (toggle)   { toggle.classList.remove('is-active'); }
      if (backdrop) { backdrop.classList.remove('is-active'); }
    }

    if (toggle && links && backdrop) {
      toggle.addEventListener('click', function () {
        links.classList.toggle('is-open');
        toggle.classList.toggle('is-active');
        backdrop.classList.toggle('is-active');
      });
      links.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', closeNav);
      });
      backdrop.addEventListener('click', closeNav);
    }
  }

  /* ----------------------------------------------------------
     Boot — safe for both defer (head) and bottom-of-body.
  ---------------------------------------------------------- */
  function boot() {
    injectNav();
    initNav();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
