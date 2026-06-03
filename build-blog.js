#!/usr/bin/env node
/*
  Evida Studio — blog build helper
  ---------------------------------
  Τι κάνει, με μία εντολή:
    1. Διαβάζει το posts.json και το ελέγχει (validation) — πιάνει typos/λάθη πεδία πριν ανέβουν.
    2. Παράγει ΑΥΤΟΜΑΤΑ το sitemap.xml με τα core pages + ΟΛΑ τα posts, newest first.
    3. Σου λέει πόσα άρθρα είναι ήδη published και πόσα scheduled για το μέλλον.

  Πώς το τρέχεις (από τον φάκελο του site, μία φορά πριν κάθε deploy):
    node build-blog.js

  Δεν χρειάζεται καμία εξάρτηση (no npm install). Σκέτο Node.
*/

const fs = require('fs');
const path = require('path');

// ── Ρυθμίσεις ────────────────────────────────────────────────
const SITE = 'https://evidastudio.com';
const POSTS_FILE = path.join(__dirname, 'posts.json');
const SITEMAP_FILE = path.join(__dirname, 'sitemap.xml');

// Στατικές σελίδες που μπαίνουν πάντα στο sitemap (εκτός από τα άρθρα).
// Πρόσθεσε/αφαίρεσε εδώ αν αλλάξει η δομή του site.
const CORE_PAGES = [
  { loc: '/',                                   priority: '1.0'  },
  { loc: '/portfolio.html',                     priority: '0.9'  },
  { loc: '/insights.html',                      priority: '0.9'  },
  { loc: '/case-study-therapist-platform.html', priority: '0.85' },
  { loc: '/case-study-architect.html',          priority: '0.85' },
  { loc: '/case-study-dermatologist.html',      priority: '0.85' },
  { loc: '/case-study-dental.html',             priority: '0.85' },
  { loc: '/case-study-therapist-v2.html',       priority: '0.85' },
  { loc: '/case-study-therapist-preview.html',  priority: '0.85' },
  { loc: '/privacy.html',                       priority: '0.5'  },
];

const REQUIRED_FIELDS = ['id', 'title', 'excerpt', 'tag', 'publishAt', 'dateLabel', 'image', 'imageAlt', 'url'];

// ── Helpers ──────────────────────────────────────────────────
const red   = (s) => `\x1b[31m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const yellow= (s) => `\x1b[33m${s}\x1b[0m`;
const bold  = (s) => `\x1b[1m${s}\x1b[0m`;

function fail(msg) {
  console.error(red('\n✖ ' + msg + '\n'));
  process.exit(1);
}

// ── 1. Διάβασμα + validation του posts.json ──────────────────
let raw;
try {
  raw = fs.readFileSync(POSTS_FILE, 'utf8');
} catch (e) {
  fail('Δεν βρέθηκε το posts.json δίπλα στο script. Βάλε το script στον ίδιο φάκελο με το site.');
}

let posts;
try {
  posts = JSON.parse(raw);
} catch (e) {
  fail('Το posts.json έχει syntax error (πιθανό κόμμα ή εισαγωγικό). Μήνυμα: ' + e.message);
}

if (!Array.isArray(posts)) fail('Το posts.json πρέπει να είναι array [ ... ].');

const errors = [];
const seenIds = new Set();
const seenUrls = new Set();

posts.forEach((p, i) => {
  const where = `post #${i + 1}` + (p && p.id ? ` (${p.id})` : '');
  if (typeof p !== 'object' || p === null) { errors.push(`${where}: δεν είναι object.`); return; }

  for (const f of REQUIRED_FIELDS) {
    if (!(f in p) || p[f] === '' || p[f] === null) errors.push(`${where}: λείπει/κενό πεδίο "${f}".`);
  }
  if (p.id) {
    if (seenIds.has(p.id)) errors.push(`${where}: διπλό id "${p.id}".`);
    seenIds.add(p.id);
  }
  if (p.url) {
    if (seenUrls.has(p.url)) errors.push(`${where}: διπλό url "${p.url}".`);
    seenUrls.add(p.url);
  }
  if (p.publishAt && isNaN(new Date(p.publishAt).getTime())) {
    errors.push(`${where}: μη έγκυρο publishAt "${p.publishAt}".`);
  }
  if (p.url && !/^[\w\-./]+\.html$/.test(p.url)) {
    errors.push(`${where}: ύποπτο url "${p.url}" (περίμενα κάτι.html).`);
  }
});

if (errors.length) {
  console.error(red('\n✖ Βρέθηκαν προβλήματα στο posts.json:'));
  errors.forEach((e) => console.error(red('  - ' + e)));
  console.error('');
  process.exit(1);
}

// ── 2. Ταξινόμηση + διαχωρισμός published / scheduled ────────
const now = new Date();
const sorted = [...posts].sort((a, b) => new Date(b.publishAt) - new Date(a.publishAt));
const published = sorted.filter((p) => new Date(p.publishAt) <= now);
const scheduled = sorted.filter((p) => new Date(p.publishAt) > now);

// ── 3. Παραγωγή sitemap.xml ──────────────────────────────────
const fmtDate = (d) => new Date(d).toISOString().slice(0, 10); // YYYY-MM-DD
const today = fmtDate(now);

let xml = '';
xml += '<?xml version="1.0" encoding="UTF-8"?>\n';
xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n';

xml += '  <!-- Core Pages (auto-generated, μην το πειράζεις χειρόγραφα) -->\n';
for (const pg of CORE_PAGES) {
  xml += '  <url>\n';
  xml += `    <loc>${SITE}${pg.loc}</loc>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += `    <priority>${pg.priority}</priority>\n`;
  xml += '  </url>\n\n';
}

xml += '  <!-- Articles — published only, newest first (auto) -->\n';
for (const p of published) {
  xml += '  <url>\n';
  xml += `    <loc>${SITE}/${p.url}</loc>\n`;
  xml += `    <lastmod>${fmtDate(p.publishAt)}</lastmod>\n`;
  xml += '    <priority>0.8</priority>\n';
  xml += '  </url>\n\n';
}

xml += '</urlset>\n';

fs.writeFileSync(SITEMAP_FILE, xml, 'utf8');

// ── Report ───────────────────────────────────────────────────
console.log(green('\n✔ posts.json valid — κανένα λάθος.'));
console.log(green(`✔ sitemap.xml ξαναγράφτηκε (${published.length} published άρθρα + ${CORE_PAGES.length} core pages).`));

console.log(bold('\nPublished τώρα (' + published.length + '):'));
published.forEach((p) => console.log('  • ' + fmtDate(p.publishAt) + '  ' + p.title));

console.log(bold(yellow('\nScheduled για το μέλλον (' + scheduled.length + '):')));
if (scheduled.length === 0) {
  console.log('  (κανένα)');
} else {
  // παλιότερη ημερομηνία πρώτη, για να βλέπεις σειρά κυκλοφορίας
  [...scheduled].reverse().forEach((p) => console.log('  • ' + fmtDate(p.publishAt) + '  ' + p.title));
}
console.log('');
