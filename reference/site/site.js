/* AI Incubator @ UK — shared site JS
 * - Theme/accent/density init from localStorage (runs early to prevent flash)
 * - Live next-meeting countdown
 * - Animated dot grid bg
 * - Tweaks panel (with __edit_mode_available host protocol)
 */

(function () {
  'use strict';

  /* ── Settings (persisted across pages) ───────────────── */
  const SETTINGS_KEY = 'aiincubator.settings.v2';
  const DEFAULTS = { theme: 'dark', accent: 'blue', density: 'default' };
  function readSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
    } catch (e) {}
    return { ...DEFAULTS };
  }
  function writeSettings(s) {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch (e) {}
  }
  function applySettings(s) {
    const root = document.documentElement;
    root.setAttribute('data-theme', s.theme);
    root.setAttribute('data-accent', s.accent);
    root.setAttribute('data-density', s.density);
  }
  // Apply ASAP to prevent flash
  let SETTINGS = readSettings();
  applySettings(SETTINGS);
  window.__aiincubator = { settings: SETTINGS, apply: applySettings, write: writeSettings };

  /* ── Content (read from inline JSON block) ───────────── */
  let CONTENT = null;
  function readContent() {
    const el = document.getElementById('content');
    if (!el) return null;
    try { return JSON.parse(el.textContent); }
    catch (e) { console.error('Content JSON parse error:', e); return null; }
  }

  /* ── Next meeting countdown ──────────────────────────── */
  // Session day/hour from content; defaults to Friday noon.
  function nextSession() {
    const s = (CONTENT && CONTENT.session) || {};
    const dow = Number.isInteger(s.dayOfWeek) ? s.dayOfWeek : 5; // Fri
    const hr  = Number.isInteger(s.hour) ? s.hour : 12;
    const min = Number.isInteger(s.minute) ? s.minute : 0;
    const now = new Date();
    const d = new Date(now);
    const day = d.getDay();
    let daysUntil = (dow - day + 7) % 7;
    d.setHours(hr, min, 0, 0);
    if (daysUntil === 0 && d <= now) daysUntil = 7;
    d.setDate(d.getDate() + daysUntil);
    return d;
  }

  function tickCountdown() {
    const els = document.querySelectorAll('[data-countdown]');
    if (!els.length) return;
    const target = nextSession();
    const diff = Math.max(0, target - new Date());
    const days = Math.floor(diff / 86400000);
    const hrs  = Math.floor((diff / 3600000) % 24);
    const mins = Math.floor((diff / 60000) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    const fmt = (n) => String(n).padStart(2, '0');
    els.forEach(el => {
      const variant = el.dataset.countdown;
      if (variant === 'short') {
        el.innerHTML = `<span class="unit-num">${days}</span><span class="unit-lbl">d</span> <span class="unit-num">${fmt(hrs)}</span><span class="unit-lbl">h</span> <span class="unit-num">${fmt(mins)}</span><span class="unit-lbl">m</span> <span class="unit-num">${fmt(secs)}</span><span class="unit-lbl">s</span>`;
      } else {
        el.textContent = `${days}d ${fmt(hrs)}h ${fmt(mins)}m`;
      }
    });
  }

  function startCountdown() {
    tickCountdown();
    setInterval(tickCountdown, 1000);
  }

  /* ── Animated dot grid ───────────────────────────────── */
  function initDotGrids() {
    const grids = document.querySelectorAll('.dotgrid');
    grids.forEach(grid => {
      const SPACING = 24;
      let w = grid.clientWidth, h = grid.clientHeight;
      if (!w || !h) return;
      const cols = Math.ceil(w / SPACING) + 1;
      const rows = Math.ceil(h / SPACING) + 1;
      const ns = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('xmlns', ns);
      svg.setAttribute('viewBox', `0 0 ${cols * SPACING} ${rows * SPACING}`);
      svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
      const dots = [];
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const c = document.createElementNS(ns, 'circle');
          c.setAttribute('cx', x * SPACING + SPACING / 2);
          c.setAttribute('cy', y * SPACING + SPACING / 2);
          c.setAttribute('r', 1);
          svg.appendChild(c);
          dots.push({ el: c, x: x * SPACING + SPACING/2, y: y * SPACING + SPACING/2 });
        }
      }
      grid.innerHTML = '';
      grid.appendChild(svg);

      // Subtle wave + mouse parallax
      let mouse = { x: w / 2, y: h / 2 };
      let active = false;
      grid.parentElement.addEventListener('mousemove', (e) => {
        const rect = grid.getBoundingClientRect();
        mouse.x = (e.clientX - rect.left) * (cols * SPACING / rect.width);
        mouse.y = (e.clientY - rect.top) * (rows * SPACING / rect.height);
        active = true;
      });
      grid.parentElement.addEventListener('mouseleave', () => { active = false; });

      let t0 = performance.now();
      function frame(t) {
        const elapsed = (t - t0) / 1000;
        const W = cols * SPACING, H = rows * SPACING;
        for (let i = 0; i < dots.length; i++) {
          const d = dots[i];
          // Subtle slow ripple
          const wave = Math.sin((d.x + d.y) * 0.012 + elapsed * 0.6) * 0.5 + 0.5;
          let r = 0.5 + wave * 0.6;
          // Mouse parallax bump
          if (active) {
            const dx = d.x - mouse.x;
            const dy = d.y - mouse.y;
            const dist2 = dx*dx + dy*dy;
            const radius = 120 * 120;
            if (dist2 < radius) {
              const k = 1 - dist2 / radius;
              r += k * 2.0;
            }
          }
          d.el.setAttribute('r', r.toFixed(2));
        }
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
  }

  /* ── Tweaks panel ────────────────────────────────────── */
  function mountTweaksPanel() {
    if (document.querySelector('.tweaks-panel')) return;

    const panel = document.createElement('div');
    panel.className = 'tweaks-panel';
    panel.innerHTML = `
      <h4>Tweaks <span class="close" aria-label="Close">×</span></h4>
      <div class="row">
        <label>Theme</label>
        <div class="seg" data-key="theme">
          <button data-val="light">Light</button>
          <button data-val="dark">Dark</button>
        </div>
      </div>
      <div class="row">
        <label>Accent</label>
        <div class="swatches" data-key="accent">
          <div class="swatch" data-val="blue" style="background:#0033A0" title="UK Blue"></div>
          <div class="swatch" data-val="green" style="background:#00754f" title="Forest"></div>
          <div class="swatch" data-val="mono" style="background:linear-gradient(135deg,#0a0a0a 0 50%, #fafaf7 50% 100%)" title="Mono"></div>
        </div>
      </div>
      <div class="row">
        <label>Density</label>
        <div class="seg" data-key="density">
          <button data-val="compact">Compact</button>
          <button data-val="default">Default</button>
          <button data-val="roomy">Roomy</button>
        </div>
      </div>
    `;
    document.body.appendChild(panel);

    function syncUI() {
      panel.querySelectorAll('.seg').forEach(seg => {
        const key = seg.dataset.key;
        seg.querySelectorAll('button').forEach(b => {
          b.classList.toggle('active', b.dataset.val === SETTINGS[key]);
        });
      });
      panel.querySelectorAll('.swatches').forEach(sw => {
        const key = sw.dataset.key;
        sw.querySelectorAll('.swatch').forEach(s => {
          s.classList.toggle('active', s.dataset.val === SETTINGS[key]);
        });
      });
    }

    panel.addEventListener('click', (e) => {
      const t = e.target;
      const seg = t.closest('.seg');
      const swDot = t.closest('.swatch');
      if (seg && t.tagName === 'BUTTON') {
        SETTINGS[seg.dataset.key] = t.dataset.val;
      } else if (swDot) {
        SETTINGS[swDot.parentElement.dataset.key] = swDot.dataset.val;
      } else if (t.classList.contains('close')) {
        closePanel();
        return;
      } else {
        return;
      }
      applySettings(SETTINGS);
      writeSettings(SETTINGS);
      syncUI();
    });

    function openPanel() { panel.classList.add('open'); syncUI(); }
    function closePanel() {
      panel.classList.remove('open');
      try { window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*'); } catch (e) {}
    }

    // Host protocol — listener first, then announce
    window.addEventListener('message', (e) => {
      const t = e.data && e.data.type;
      if (t === '__activate_edit_mode') openPanel();
      else if (t === '__deactivate_edit_mode') closePanel();
    });
    try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch (e) {}

    window.__aiincubator.openTweaks = openPanel;
  }

  /* ── Renderers (driven by JSON content block) ────────── */

  function fmtDate(iso, opts) {
    if (!iso) return '';
    const d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString('en-US', opts || { month: 'short', day: 'numeric' });
  }

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === 'class') node.className = attrs[k];
      else if (k === 'html') node.innerHTML = attrs[k];
      else if (k === 'text') node.textContent = attrs[k];
      else node.setAttribute(k, attrs[k]);
    }
    if (children) children.forEach(c => c && node.appendChild(c));
    return node;
  }

  function renderSimpleStrings() {
    if (!CONTENT) return;
    document.querySelectorAll('[data-content]').forEach(node => {
      const key = node.dataset.content;
      if (key === 'lastUpdated' && CONTENT.lastUpdated) {
        node.textContent = fmtDate(CONTENT.lastUpdated, { month: 'short', day: 'numeric', year: 'numeric' });
      } else if (key === 'cohort' && CONTENT.cohort) {
        node.textContent = CONTENT.cohort;
      }
    });
  }

  function renderSession() {
    if (!CONTENT || !CONTENT.session) return;
    const s = CONTENT.session;
    const next = nextSession();
    const whenStr = next.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                    + ' · ' + next.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase();

    document.querySelectorAll('[data-session="when"]').forEach(n => n.textContent = whenStr);
    document.querySelectorAll('[data-session="venue"]').forEach(n => n.textContent = s.venue || 'Microsoft Teams');
    document.querySelectorAll('[data-session="cadence-line"]').forEach(n => {
      const time = next.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase();
      n.textContent = `Fridays · ${time} · ${s.venue || 'Microsoft Teams'}`;
    });
    document.querySelectorAll('[data-session="join"]').forEach(n => {
      if (s.teamsUrl) n.setAttribute('href', s.teamsUrl);
    });

    const agendaList = document.querySelector('[data-session="agenda"]');
    if (agendaList && Array.isArray(s.agenda)) {
      agendaList.innerHTML = '';
      s.agenda.forEach(item => agendaList.appendChild(el('li', { text: item })));
    }
  }

  function renderProjects() {
    if (!CONTENT || !Array.isArray(CONTENT.projects)) return;

    const rich = CONTENT.projects.filter(p => p.status !== 'kickoff');
    const kick = CONTENT.projects.filter(p => p.status === 'kickoff');

    const richMount = document.querySelector('[data-projects="rich"]');
    const kickMount = document.querySelector('[data-projects="kickoff"]');

    if (richMount) {
      richMount.innerHTML = '';
      rich.forEach(p => richMount.appendChild(renderRichCard(p)));
    }
    if (kickMount) {
      kickMount.innerHTML = '';
      kick.forEach(p => kickMount.appendChild(renderKickoffCard(p)));
    }
  }

  function statusChip(p) {
    const labels = {
      active:   { cls: 'live',   text: p.stage || 'Active' },
      building: { cls: 'live',   text: p.stage || 'Building' },
      kickoff:  { cls: 'kick',   text: 'Just kicked off' },
      paused:   { cls: 'paused', text: p.stage || 'On hold' }
    };
    const m = labels[p.status] || labels.active;
    return el('span', { class: `chip ${m.cls}`, text: m.text });
  }

  function renderRichCard(p) {
    const card = el('article', { class: 'card hover proj-card', 'data-id': p.id });

    // top row
    card.appendChild(el('div', { class: 'top' }, [
      statusChip(p),
      el('span', { class: 'area mono', text: p.area || '' })
    ]));

    // monospace data block (replaces the old SVG slop)
    const data = el('div', { class: 'proj-data' });
    (p.anchors || []).slice(0, 4).forEach(a => {
      data.appendChild(el('div', { class: 'proj-data-row' }, [
        el('span', { class: 'dash', text: '—' }),
        el('span', { text: a })
      ]));
    });
    card.appendChild(data);

    // title row
    const titleRow = el('div', { class: 'title-row' });
    const titleBlock = el('div', null, [
      el('div', { class: 'title', text: p.name }),
      p.tagline ? el('div', { class: 'tagline', text: p.tagline }) : null,
      el('div', { class: 'lead-by', text: p.leads || '' })
    ].filter(Boolean));
    titleRow.appendChild(titleBlock);
    card.appendChild(titleRow);

    // hover reveal
    const reveal = el('div', { class: 'reveal' });
    const top = el('div', null, [
      el('div', { class: 'chip mono', text: `${p.area || ''} · ${p.stage || ''}` }),
      el('h3', { class: 'h3', text: p.name, style: 'color: var(--bg); margin-top: 14px;' }),
      el('p', { class: 'desc', text: p.summary || '', style: 'margin-top: 10px;' })
    ]);
    const bottom = el('div');
    const meta = el('div', { class: 'meta' });
    (p.anchors || []).slice(0, 3).forEach(a => meta.appendChild(el('span', { text: a })));
    bottom.appendChild(meta);
    if (p.updated) {
      bottom.appendChild(el('div', { class: 'reveal-updated mono', text: 'Updated ' + fmtDate(p.updated) }));
    }
    reveal.appendChild(top);
    reveal.appendChild(bottom);
    card.appendChild(reveal);

    return card;
  }

  function renderKickoffCard(p) {
    const card = el('article', { class: 'card proj-card kickoff', 'data-id': p.id });
    card.appendChild(el('div', { class: 'top' }, [
      statusChip(p),
      el('span', { class: 'area mono', text: p.area || '' })
    ]));

    const body = el('div', { class: 'kick-body' });
    body.appendChild(el('div', { class: 'title', text: p.name }));
    if (p.tagline) body.appendChild(el('div', { class: 'tagline', text: p.tagline }));
    if (p.summary) body.appendChild(el('p', { class: 'kick-summary', text: p.summary }));
    body.appendChild(el('div', { class: 'lead-by', text: 'Leads · ' + (p.leads || '') }));
    card.appendChild(body);

    const cta = el('div', { class: 'kick-cta' });
    cta.appendChild(el('div', { class: 'kick-open', text: p.open || 'Looking for collaborators.' }));
    cta.appendChild(el('a', { class: 'kick-link', href: '#rightnow', html: 'Discuss at the next meeting <span class="arrow">→</span>' }));
    card.appendChild(cta);

    return card;
  }

  function renderLog() {
    if (!CONTENT || !Array.isArray(CONTENT.log)) return;
    const log = CONTENT.log;

    const recent = document.querySelector('[data-log="recent"]');
    if (recent) {
      recent.innerHTML = '';
      log.slice(0, 3).forEach(entry => {
        const li = el('li');
        li.appendChild(el('span', { class: 'log-date mono', text: fmtDate(entry.date) }));
        li.appendChild(el('span', { class: 'log-note', text: entry.note }));
        recent.appendChild(li);
      });
    }

    const all = document.querySelector('[data-log="all"]');
    if (all) {
      all.innerHTML = '';
      log.forEach(entry => {
        const row = el('div', { class: 'log-row' });
        row.appendChild(el('div', { class: 'log-date mono', text: fmtDate(entry.date) }));
        row.appendChild(el('div', { class: 'log-proj mono', text: entry.project || '' }));
        row.appendChild(el('div', { class: 'log-note', text: entry.note || '' }));
        all.appendChild(row);
      });
    }
  }

  function renderLeads() {
    const mount = document.querySelector('[data-leads]');
    if (!mount || !CONTENT || !Array.isArray(CONTENT.leads)) return;
    mount.innerHTML = '';
    CONTENT.leads.forEach(p => {
      const card = el('div', { class: 'person' });
      card.appendChild(el('div', { class: 'avatar', text: p.initials || '' }));
      const body = el('div');
      body.appendChild(el('div', { class: 'name', text: p.name || '' }));
      body.appendChild(el('div', { class: 'role', text: p.role || '' }));
      card.appendChild(body);
      const areas = el('div', { class: 'areas' });
      (p.areas || []).forEach(a => areas.appendChild(el('span', { class: 'chip', text: a })));
      card.appendChild(areas);
      mount.appendChild(card);
    });
  }

  function renderAll() {
    CONTENT = readContent();
    if (!CONTENT) return;
    renderSimpleStrings();
    renderSession();
    renderProjects();
    renderLog();
    renderLeads();
  }

  /* ── Boot ────────────────────────────────────────────── */
  function boot() {
    renderAll();
    initDotGrids();
    startCountdown();
    mountTweaksPanel();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
