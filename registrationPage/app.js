/**
 * EMINENCE 2K26 — app.js
 *
 * Reads events.json and dynamically builds:
 *   - Hero section (name, tagline, date, venue)
 *   - Poster
 *   - One section per category with an auto-generated event grid
 *   - Footer (contacts)
 *
 * To add/remove events: edit events.json only. No HTML changes needed.
 * To add a new category: add an object to the "categories" array in events.json.
 */

/* ── ENTRY POINT ── */
document.addEventListener('DOMContentLoaded', () => {
  fetch('eventjson')
    .then(res => {
      if (!res.ok) throw new Error('Could not load events.json');
      return res.json();
    })
    .then(data => buildPage(data))
    .catch(err => {
      console.error(err);
      document.getElementById('app').innerHTML =
        <p class="loading-msg">⚠️ Failed to load events.json — ${err.message}</p>;
    });
});

/* ── BUILD PAGE ── */
function buildPage(data) {
  const { fest, categories } = data;
  const app = document.getElementById('app');
  app.innerHTML = '';

  // 1. Hero
  app.appendChild(buildHero(fest));

  // 2. Poster
  app.appendChild(buildPoster(fest.poster));

  // 3. Event sections (one per category)
  categories.forEach((cat, idx) => {
    app.appendChild(buildSection(cat, idx));
  });

  // 4. Footer
  app.appendChild(buildFooter(fest));

  // 5. Wire up all interactive behaviour after DOM is ready
  initStarfield();
  initParticles();
  initCursor();
  initNavDots(categories.length);
  initCardReveal();
}

/* ── HERO ── */
function buildHero(fest) {
  const header = el('header', { id: 'sec0' });
  header.innerHTML = 
    <div class="hero-glow"></div>
    <div class="dept-label">${esc(fest.department)}</div>
    <h1 class="hero-title">${esc(fest.name).replace(' ', '<br>')}</h1>
    <p class="hero-sub">${esc(fest.tagline)}</p>
    <div class="hero-date">📅&nbsp; ${esc(fest.date)} &nbsp;·&nbsp; ${esc(fest.venue)}</div>
    <div class="scroll-hint" aria-hidden="true">
      <div class="scroll-line"></div>
      <span>SCROLL</span>
    </div>
  ;
  return header;
}

/* ── POSTER ── */
function buildPoster(src) {
  const wrap = el('div', { class: 'poster-wrap' });
  wrap.innerHTML = 
    <div class="poster-frame">
      <img src="${esc(src)}" alt="Event Poster"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
      <div class="poster-placeholder" style="display:none">
        <div style="font-size:clamp(2rem,8vw,3rem)">🚀</div>
        <h3>EVENT POSTER</h3>
        <p>poster.jpg not found</p>
      </div>
    </div>
  ;
  return wrap;
}

/* ── SECTION ── */
function buildSection(cat, idx) {
  // sec index starts at 1 (sec0 = hero)
  const section = el('section', { id: sec${idx + 1} });

  // Section header with decorative lines
  const lineLeft  = <div class="section-line${cat.theme === 'nontech' ? '" style="background:linear-gradient(to right,var(--neon2),transparent)' : ''}"></div>;
  const lineRight = <div class="section-line r${cat.theme === 'nontech' ? '" style="background:linear-gradient(to left,var(--neon3),transparent)' : ''}"></div>;

  section.innerHTML = 
    <div class="section-header">
      ${lineLeft}
      <h2 class="section-title ${esc(cat.theme)}">${esc(cat.emoji)} ${esc(cat.label)}</h2>
      ${lineRight}
    </div>
  ;

  // Event grid
  const grid = el('div', {
    class: event-grid${cat.theme === 'nontech' ? ' nontech-grid' : ''},
    id: grid-${cat.id}
  });

  cat.events.forEach((event, i) => {
    const card = el('a', {
      class: 'event-card',
      href: event.link,
      target: '_blank',
      rel: 'noopener',
      style: animation-delay:${i * 0.065}s
    });
    card.innerHTML = 
      <div class="event-icon">${event.emoji}</div>
      <div class="event-name">${esc(event.name)}</div>
      <div class="event-tag">Register →</div>
    ;
    grid.appendChild(card);
  });

  section.appendChild(grid);
  return section;
}

/* ── FOOTER ── */
function buildFooter(fest) {
  const footer = el('footer', { id: sec${999} }); // nav will handle this separately
  footer.id = 'sec-footer';
  const contactsHTML = fest.contacts
    .map(c => <div class="contact-chip"><strong>${esc(c.name)}</strong>&nbsp; ${esc(c.phone)}</div>)
    .join('');

  footer.innerHTML = 
    <div class="footer-inner">
      <div class="footer-logo">${esc(fest.name)}</div>
      <div class="footer-info">
        <div>📅 <span>${esc(fest.date)}</span></div>
        <div>📍 <span>${esc(fest.venue)}</span></div>
      </div>
      <div class="footer-contacts">${contactsHTML}</div>
      <div class="footer-copy">${esc(fest.department).toUpperCase()} &nbsp;·&nbsp; 2026</div>
    </div>
  ;
  return footer;
}

/* 
   INTERACTIVITY


/* ── STARFIELD ── */
function initStarfield() {
  const canvas = document.getElementById('stars');
  const ctx    = canvas.getContext('2d');
  let stars    = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.1 + 0.2,
      a: Math.random(),
      s: Math.random() * 0.004 + 0.001
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.a += s.s;
      if (s.a > 1) s.a = 0;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = rgba(200,230,255,${s.a});
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener('resize', resize);
}

/* ── PARTICLES ── */
function initParticles() {
  const wrap = document.getElementById('particlesWrap');
  for (let i = 0; i < 22; i++) {
    const p  = document.createElement('div');
    p.className = 'particle';
    const sz = Math.random() * 2 + 1;
    p.style.cssText = 
      left: ${Math.random() * 100}%;
      width: ${sz}px; height: ${sz}px;
      --drift: ${(Math.random() - 0.5) * 150}px;
      animation-duration: ${Math.random() * 14 + 8}s;
      animation-delay: ${Math.random() * 10}s;
      background: ${Math.random() > 0.5 ? 'var(--neon)' : 'var(--neon2)'};
    ;
    wrap.appendChild(p);
  }
}

/* ── CURSOR ── */
function initCursor() {
  if (!window.matchMedia('(pointer:fine)').matches) return;
  const cur  = document.getElementById('cursor');
  const ring = document.getElementById('cursorRing');

  document.addEventListener('mousemove', e => {
    cur.style.left  = ring.style.left  = e.clientX + 'px';
    cur.style.top   = ring.style.top   = e.clientY + 'px';
  });

  document.querySelectorAll('a, .nav-dot').forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.style.width = ring.style.height = '50px';
      ring.style.borderColor = 'var(--neon2)';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.width = ring.style.height = '34px';
      ring.style.borderColor = 'rgba(0,245,255,0.6)';
    });
  });
}

/* ── NAV DOTS ── */
function initNavDots(categoryCount) {
  const nav  = document.getElementById('navDots');
  // Total sections = hero (sec0) + categories + footer
  const sectionIds = ['sec0', ...Array.from({ length: categoryCount }, (_, i) => sec${i + 1}), 'sec-footer'];

  // Create dots dynamically
  nav.innerHTML = '';
  sectionIds.forEach((id, i) => {
    const dot = document.createElement('div');
    dot.className = 'nav-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    });
    nav.appendChild(dot);
  });

  const dots = nav.querySelectorAll('.nav-dot');
  const obs  = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const i = sectionIds.indexOf(e.target.id);
        dots.forEach((d, j) => d.classList.toggle('active', j === i));
      }
    });
  }, { threshold: 0.35 });

  sectionIds.forEach(id => {
    const sec = document.getElementById(id);
    if (sec) obs.observe(sec);
  });
}
/* ── CARD SCROLL REVEAL ── */
function initCardReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.event-card').forEach((card, i) => {
          card.style.animationDelay = ${i * 0.065}s;
          card.style.animationName  = 'none';
          requestAnimationFrame(() => { card.style.animationName = 'cardReveal'; });
        });
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05 });

  document.querySelectorAll('.event-grid').forEach(g => obs.observe(g));
}

/* ── HELPERS ── */
function el(tag, attrs = {}) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  return node;
}

// Basic XSS guard for JSON values inserted into HTML
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

