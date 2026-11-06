/* VentLab Ultra — application (dashboard, cards, themes, notes, tags, learning) */
'use strict';

/* ================= utilities ================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
function el(html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; }
function fmt(x, d = 0) { if (x == null || !isFinite(x)) return '—'; const r = Number(x).toFixed(d); return /^-0(\.0+)?$/.test(r) ? r.slice(1) : r; }
function decimals(step) { const s = String(step); return s.includes('.') ? s.split('.')[1].length : 0; }
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2200); }


/* in-app dialog (replaces prompt/confirm – works in PWA and embedded views) */
function dialog(o) {
  return new Promise(res => {
    const d = el(`<div class="palette" style="align-items:flex-start"><div class="palette-box" style="padding:18px;max-width:420px">
      <h3 style="margin-bottom:8px">${esc(o.title || '')}</h3>${o.msg ? `<p class="muted" style="margin-bottom:12px">${esc(o.msg)}</p>` : ''}
      ${o.input != null ? `<input class="inp" style="border:1px solid var(--border);margin-bottom:12px" value="${esc(o.input)}">` : ''}
      <div class="row" style="justify-content:flex-end"><button class="btn" data-x>Cancel</button><button class="btn pri" data-ok style="${o.danger ? 'background:var(--danger)' : ''}">${esc(o.ok || 'OK')}</button></div></div></div>`);
    document.body.appendChild(d); const i = $('input', d); if (i) { i.focus(); i.select(); }
    const done = v => { d.remove(); res(v); };
    d.addEventListener('click', e => { if (e.target === d || e.target.closest('[data-x]')) done(null); if (e.target.closest('[data-ok]')) done(i ? i.value : true); });
    d.addEventListener('keydown', e => { if (e.key === 'Enter') done(i ? i.value : true); if (e.key === 'Escape') done(null); });
  });
}

/* ================= icons ================= */
const IC = {
  wave: 'M2 12h4l3-8 4 16 3-8h6', gauge: 'M12 14l4-4M3.5 16a9 9 0 1 1 17 0M12 14h.01', sliders: 'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6',
  loop: 'M18.2 7.8a6 6 0 1 1 0 8.4L12 12 5.8 7.8a6 6 0 1 0 0 8.4L12 12z', lungs: 'M12 3v9M12 12c-2 0-3 1-4 2M12 12c2 0 3 1 4 2M8 6C5 7 3 11 3 15c0 3 1 5 3 5 2 0 3-2 3-4V7M16 6c3 1 5 5 5 9 0 3-1 5-3 5-2 0-3-2-3-4V7',
  alert: 'M12 3l10 18H2zM12 10v5M12 18h.01', bell: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 0 0 4 0', trend: 'M3 17l6-6 4 4 8-8M14 7h7v7',
  book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5zM4 19.5V21h16', tag: 'M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8zM7.5 7.5h.01',
  note: 'M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M8 13h8M8 17h5', calc: 'M5 2h14v20H5zM8 6h8v4H8zM8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01',
  cpu: 'M9 9h6v6H9zM5 5h14v14H5zM9 1v4M15 1v4M9 19v4M15 19v4M1 9h4M1 15h4M19 9h4M19 15h4', quiz: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01',
  save: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8', grip: 'M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01',
  expand: 'M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7', collapse: 'M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7', more: 'M12 5h.01M12 12h.01M12 19h.01',
  x: 'M18 6L6 18M6 6l12 12', plus: 'M12 5v14M5 12h14', edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z', play: 'M6 4l14 8-14 8z', pause: 'M7 4h3v16H7zM14 4h3v16h-3z',
  palette: 'M12 22a10 10 0 1 1 10-10c0 3-2 4-4 4h-2a2 2 0 0 0-1 3.7A2 2 0 0 1 12 22zM7.5 10.5h.01M10.5 6.5h.01M15.5 7.5h.01', search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
  sort: 'M3 6h18M6 12h12M10 18h4', layers: 'M12 2l10 5-10 5L2 7zM2 17l10 5 10-5M2 12l10 5 10-5', download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
  upload: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12', trash: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6', check: 'M20 6L9 17l-5-5',
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', eyeoff: 'M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M9.9 4.2A10 10 0 0 1 12 4c7 0 11 8 11 8a18 18 0 0 1-3 4M6.6 6.6A18 18 0 0 0 1 12s4 8 11 8a10 10 0 0 0 5.4-1.6',
  refresh: 'M23 4v6h-6M1 20v-6h6M3.5 9a9 9 0 0 1 14.9-3.4L23 10M1 14l4.6 4.4A9 9 0 0 0 20.5 15', back: 'M15 18l-6-6 6-6', camera: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  target: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z', flask: 'M9 3h6M10 3v6L4 19a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-6-10V3',
  resize: 'M21 15l-6 6M21 9L9 21', user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-4M12 8h.01',
  bookmark: 'M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z', pill: 'M10.5 20.5l10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7zM8.5 8.5l7 7', heart: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21.2l8.8-8.8a5.5 5.5 0 0 0 0-7.8z', zap: 'M13 2L3 14h9l-1 8 10-12h-9z', volume: 'M11 5L6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14', mute: 'M11 5L6 9H2v6h4l5 4zM23 9l-6 6M17 9l6 6', wand: 'M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8l1.4 1.4M17.8 6.2l1.4-1.4M12.2 6.2l-1.4-1.4M15 9l-12 12', drop: 'M12 2.7l5.7 5.7a8 8 0 1 1-11.4 0z', hold: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM10 8v8M14 8v8'
};
function ic(name, sw) {
  const thick = ['grip', 'more'].includes(name) ? 3 : (sw || 2);
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${thick}" stroke-linecap="round" stroke-linejoin="round"><path d="${IC[name] || ''}"/></svg>`;
}

/* ================= themes & fonts ================= */
const THEMES = {
  crimson: { name: 'Crimson Noir', special: true, v: { bg: '#060102', bg2: '#1a0308', panel: 'rgba(24,5,9,.58)', panel2: 'rgba(14,2,5,.86)', panel3: 'rgba(255,40,70,.05)', border: 'rgba(255,40,70,.2)', text: '#f7eaec', muted: '#b88a91', accent: '#ff1f44', accent2: '#ff5c73', p: '#ff2d55', f: '#ff99a8', v: '#f2f2f2', mus: '#ffffff', glow: 'rgba(255,20,60,.5)', shadow: 'rgba(0,0,0,.8)', blob1: '#ff0033', blob2: '#8a0019', blob3: '#3d000c', gridline: 'rgba(255,50,80,.06)', warn: '#ff8a3d', danger: '#ff1f44' } },
  neon: { name: 'Midnight Neon', v: { bg: '#03040c', bg2: '#0a0d24', panel: 'rgba(12,16,40,.55)', panel2: 'rgba(6,8,22,.86)', panel3: 'rgba(0,229,255,.05)', border: 'rgba(0,229,255,.18)', text: '#eaf6ff', muted: '#8a9bc0', accent: '#00e5ff', accent2: '#ff2bd6', p: '#ffe14d', f: '#00f0ff', v: '#c792ff', mus: '#ffffff', glow: 'rgba(0,229,255,.45)', shadow: 'rgba(0,0,0,.75)', blob1: '#00b7ff', blob2: '#ff2bd6', blob3: '#3a00ff', gridline: 'rgba(0,229,255,.05)', on: '#001014' } },
  aurora: { name: 'Aurora', v: { bg: '#04090d', bg2: '#08202a', panel: 'rgba(10,26,32,.55)', panel2: 'rgba(5,14,18,.86)', panel3: 'rgba(46,242,180,.05)', border: 'rgba(46,242,180,.18)', text: '#e8fff7', muted: '#86aaa0', accent: '#2ef2b4', accent2: '#8b5cff', p: '#ffd166', f: '#2ef2b4', v: '#a78bfa', mus: '#ffffff', glow: 'rgba(46,242,180,.4)', shadow: 'rgba(0,0,0,.75)', blob1: '#14b88a', blob2: '#7c4dff', blob3: '#0b4f6c', gridline: 'rgba(46,242,180,.05)', on: '#00140e' } },
  obsidian: { name: 'Obsidian Gold', v: { bg: '#070608', bg2: '#1a1408', panel: 'rgba(24,20,12,.58)', panel2: 'rgba(12,10,6,.88)', panel3: 'rgba(245,196,81,.05)', border: 'rgba(245,196,81,.2)', text: '#fbf4e4', muted: '#b0a283', accent: '#f5c451', accent2: '#ff9e3d', p: '#f5c451', f: '#ffffff', v: '#ff9e3d', mus: '#ffffff', glow: 'rgba(245,196,81,.4)', shadow: 'rgba(0,0,0,.8)', blob1: '#c99a2e', blob2: '#6b4a00', blob3: '#2b1c00', gridline: 'rgba(245,196,81,.05)', on: '#1a1200' } },
  ocean: { name: 'Deep Ocean', v: { bg: '#020914', bg2: '#06213d', panel: 'rgba(8,26,48,.55)', panel2: 'rgba(4,14,28,.88)', panel3: 'rgba(56,189,248,.05)', border: 'rgba(56,189,248,.2)', text: '#e8f6ff', muted: '#88a6c2', accent: '#38bdf8', accent2: '#22d3ee', p: '#fde047', f: '#38bdf8', v: '#a5f3fc', mus: '#ffffff', glow: 'rgba(56,189,248,.42)', shadow: 'rgba(0,0,0,.75)', blob1: '#0ea5e9', blob2: '#1e3a8a', blob3: '#0891b2', gridline: 'rgba(56,189,248,.05)', on: '#00121c' } },
  emerald: { name: 'Emerald ICU', v: { bg: '#020a06', bg2: '#062417', panel: 'rgba(8,30,20,.55)', panel2: 'rgba(3,16,10,.88)', panel3: 'rgba(34,229,132,.05)', border: 'rgba(34,229,132,.18)', text: '#eafff3', muted: '#86ab98', accent: '#22e584', accent2: '#a3e635', p: '#facc15', f: '#22e584', v: '#67e8f9', mus: '#ffffff', glow: 'rgba(34,229,132,.4)', shadow: 'rgba(0,0,0,.75)', blob1: '#059669', blob2: '#065f46', blob3: '#14532d', gridline: 'rgba(34,229,132,.05)', on: '#001a0c' } },
  uv: { name: 'Ultraviolet', v: { bg: '#08030f', bg2: '#1c0833', panel: 'rgba(30,12,50,.55)', panel2: 'rgba(14,5,26,.88)', panel3: 'rgba(180,107,255,.06)', border: 'rgba(180,107,255,.22)', text: '#f5ecff', muted: '#a690c2', accent: '#b46bff', accent2: '#ff4fd8', p: '#ff4fd8', f: '#b46bff', v: '#7dd3fc', mus: '#ffffff', glow: 'rgba(180,107,255,.45)', shadow: 'rgba(0,0,0,.8)', blob1: '#7c3aed', blob2: '#c026d3', blob3: '#312e81', gridline: 'rgba(180,107,255,.05)' } },
  ember: { name: 'Sunset Ember', v: { bg: '#0b0405', bg2: '#2a0d0a', panel: 'rgba(40,14,12,.55)', panel2: 'rgba(20,6,6,.88)', panel3: 'rgba(255,122,24,.05)', border: 'rgba(255,122,24,.2)', text: '#fff1e8', muted: '#c09a88', accent: '#ff7a18', accent2: '#ff3d77', p: '#ffb020', f: '#ff3d77', v: '#ffd9a0', mus: '#ffffff', glow: 'rgba(255,122,24,.42)', shadow: 'rgba(0,0,0,.8)', blob1: '#ff7a18', blob2: '#ff3d77', blob3: '#5b0d2b', gridline: 'rgba(255,122,24,.05)' } },
  matrix: { name: 'Matrix', v: { bg: '#000500', bg2: '#001a06', panel: 'rgba(0,24,6,.55)', panel2: 'rgba(0,10,2,.9)', panel3: 'rgba(57,255,20,.04)', border: 'rgba(57,255,20,.2)', text: '#d9ffd0', muted: '#6fa864', accent: '#39ff14', accent2: '#00ff9c', p: '#39ff14', f: '#a8ff60', v: '#00ffb3', mus: '#ffffff', glow: 'rgba(57,255,20,.4)', shadow: 'rgba(0,0,0,.8)', blob1: '#00b33c', blob2: '#003311', blob3: '#006622', gridline: 'rgba(57,255,20,.05)', on: '#001400' } },
  graphite: { name: 'Graphite Mono', v: { bg: '#0b0c0e', bg2: '#1b1d22', panel: 'rgba(30,32,38,.6)', panel2: 'rgba(16,17,20,.9)', panel3: 'rgba(255,255,255,.04)', border: 'rgba(255,255,255,.12)', text: '#f3f4f6', muted: '#9ca3af', accent: '#e5e7eb', accent2: '#9ca3af', p: '#f9fafb', f: '#d1d5db', v: '#9ca3af', mus: '#fbbf24', glow: 'rgba(255,255,255,.18)', shadow: 'rgba(0,0,0,.8)', blob1: '#4b5563', blob2: '#1f2937', blob3: '#374151', gridline: 'rgba(255,255,255,.04)', on: '#0b0c0e' } },
  arctic: { name: 'Arctic Glass', light: true, v: { bg: '#eaf1f8', bg2: '#d6e4f3', panel: 'rgba(255,255,255,.58)', panel2: 'rgba(245,249,253,.9)', panel3: 'rgba(37,99,235,.04)', border: 'rgba(37,99,235,.16)', text: '#0f172a', muted: '#5b6b82', accent: '#2563eb', accent2: '#06b6d4', p: '#d97706', f: '#0891b2', v: '#7c3aed', mus: '#0f172a', glow: 'rgba(37,99,235,.28)', shadow: 'rgba(30,50,90,.25)', blob1: '#93c5fd', blob2: '#a5f3fc', blob3: '#c4b5fd', gridline: 'rgba(37,99,235,.06)', warn: '#c2410c', danger: '#dc2626' } },
  pearl: { name: 'Pearl', light: true, v: { bg: '#f7f2ec', bg2: '#f0e4d8', panel: 'rgba(255,255,255,.6)', panel2: 'rgba(252,248,244,.92)', panel3: 'rgba(194,65,12,.04)', border: 'rgba(194,65,12,.16)', text: '#2a2421', muted: '#7b6d64', accent: '#c2410c', accent2: '#db2777', p: '#c2410c', f: '#0d9488', v: '#7c3aed', mus: '#2a2421', glow: 'rgba(194,65,12,.25)', shadow: 'rgba(80,50,30,.22)', blob1: '#fed7aa', blob2: '#fbcfe8', blob3: '#ccfbf1', gridline: 'rgba(194,65,12,.05)', warn: '#b45309', danger: '#dc2626' } },
  clinical: { name: 'Clinical White', light: true, v: { bg: '#f3f6fa', bg2: '#e4ecf5', panel: 'rgba(255,255,255,.7)', panel2: 'rgba(250,252,255,.94)', panel3: 'rgba(14,165,233,.04)', border: 'rgba(15,23,42,.1)', text: '#0f172a', muted: '#64748b', accent: '#0ea5e9', accent2: '#e11d48', p: '#e11d48', f: '#0284c7', v: '#16a34a', mus: '#0f172a', glow: 'rgba(14,165,233,.25)', shadow: 'rgba(15,23,42,.18)', blob1: '#bae6fd', blob2: '#fecdd3', blob3: '#bbf7d0', gridline: 'rgba(15,23,42,.04)', warn: '#c2410c', danger: '#dc2626' } }
};
const FONTS = [
  { n: 'Inter', css: "'Inter', system-ui, sans-serif" }, { n: 'Lato', css: "'Lato', system-ui, sans-serif" }, { n: 'Roboto', css: "'Roboto', system-ui, sans-serif" },
  { n: 'Poppins', css: "'Poppins', system-ui, sans-serif" }, { n: 'Montserrat', css: "'Montserrat', system-ui, sans-serif" }, { n: 'Space Grotesk', css: "'Space Grotesk', system-ui, sans-serif" },
  { n: 'JetBrains Mono', css: "'JetBrains Mono', ui-monospace, monospace" }, { n: 'Orbitron', css: "'Orbitron', 'Inter', sans-serif" },
  { n: 'Times New Roman', css: "'Times New Roman', Times, serif" }, { n: 'Georgia', css: "Georgia, 'Times New Roman', serif" }, { n: 'System', css: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" }
];

/* ================= card definitions (meta) ================= */
const CATS = ['Monitor', 'Controls', 'Patient', 'Abnormality', 'Learning', 'Tools', 'Personal'];
const CARD_META = [
  { id: 'waveforms', title: 'Waveforms', cat: 'Monitor', icon: 'wave', w: 8, h: 7 },
  { id: 'numerics', title: 'Numerics', cat: 'Monitor', icon: 'gauge', w: 4, h: 7 },
  { id: 'gas', title: 'Blood Gas & SpO2', cat: 'Monitor', icon: 'drop', w: 4, h: 7 },
  { id: 'hemo', title: 'Haemodynamics', cat: 'Monitor', icon: 'heart', w: 4, h: 7 },
  { id: 'keys', title: 'Quick Keys', cat: 'Controls', icon: 'zap', w: 4, h: 4 },
  { id: 'settings', title: 'Mode & Settings', cat: 'Controls', icon: 'sliders', w: 5, h: 7 },
  { id: 'loops', title: 'Loops', cat: 'Monitor', icon: 'loop', w: 4, h: 7 },
  { id: 'alarms', title: 'Alarms', cat: 'Monitor', icon: 'bell', w: 3, h: 7 },
  { id: 'patient', title: 'Patient & Lung', cat: 'Patient', icon: 'lungs', w: 5, h: 7 },
  { id: 'treat', title: 'Treatments & Procedures', cat: 'Patient', icon: 'pill', w: 6, h: 8 },
  { id: 'manoeuvres', title: 'Manoeuvres & SBT', cat: 'Tools', icon: 'target', w: 6, h: 8 },
  { id: 'extubation', title: 'Extubation', cat: 'Tools', icon: 'check', w: 6, h: 8 },
  { id: 'lessons', title: 'Guided Lessons', cat: 'Learning', icon: 'bookmark', w: 6, h: 8 },
  { id: 'abnormal', title: 'Abnormality Lab', cat: 'Abnormality', icon: 'flask', w: 7, h: 7 },
  { id: 'inside', title: 'Ventilator Inside', cat: 'Learning', icon: 'cpu', w: 7, h: 6 },
  { id: 'trends', title: 'Trends', cat: 'Monitor', icon: 'trend', w: 5, h: 6 },
  { id: 'quiz', title: 'Spot the Abnormality', cat: 'Learning', icon: 'quiz', w: 7, h: 8 },
  { id: 'learning', title: 'Learning Library', cat: 'Learning', icon: 'book', w: 5, h: 8 },
  { id: 'calc', title: 'Calculators', cat: 'Tools', icon: 'calc', w: 5, h: 7 },
  { id: 'setups', title: 'My Setups', cat: 'Tools', icon: 'save', w: 4, h: 5 },
  { id: 'notes', title: 'Notes', cat: 'Personal', icon: 'note', w: 4, h: 6 },
  { id: 'tags', title: 'Glossary & Tags', cat: 'Learning', icon: 'tag', w: 4, h: 6 }
];
const SIZES = { S: [4, 5], M: [6, 6], L: [8, 7], XL: [12, 8] };

/* ================= store ================= */
const STORE_KEY = 'ventlab.ultra.v1';
function defaultStore() {
  return {
    layout: CARD_META.map(c => ({ id: c.id, w: c.w, h: c.h, hidden: false, title: null })),
    sort: 'custom', filter: 'All', theme: 'crimson', font: 'Inter', scale: 1, blur: true, anim: true, glow: 1,
    notes: [], topicEdits: {}, topicEditsBn: {}, customTopics: [], abnEdits: {}, setups: [], learnLang: 'en', abgs: [], pt: { height: 170, sex: 'M', dx: 'normal' }, lessonProg: {}, sound: false,
    alarmLimits: Object.assign({}, ALARM_DEFAULTS), display: { win: 10, pmus: true, speed: 1, fill: true },
    vent: null, scenario: null, quiz: { right: 0, total: 0 }, refLoop: null
  };
}
let S;
try { S = Object.assign(defaultStore(), JSON.parse(localStorage.getItem(STORE_KEY) || '{}')); } catch (e) { S = defaultStore(); }
if (!S.units || typeof S.units !== 'object') S.units = { p: 'cmH2O', g: 'mmHg' };
if (!MACHINES[S.machine]) S.machine = 'generic';
// merge in any new cards
S.layout = S.layout.filter(l => CARD_META.find(c => c.id === l.id));
S.display = Object.assign(defaultStore().display, S.display || {});
S.topicEditsBn = S.topicEditsBn || {}; S.abgs = S.abgs || []; S.learnLang = S.learnLang || 'en'; S.pt = S.pt || { height: 170, sex: 'M', dx: 'normal' }; S.lessonProg = S.lessonProg || {};
let saveT;
function save() { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) { } }, 250); }

/* ================= ventilator instance ================= */
const vent = new Ventilator();
if (S.vent) {
  const sp = Object.assign({}, S.vent.p);
  if (sp.rass === undefined && !(sp.effort > 0)) { delete sp.effort; delete sp.prr; delete sp.nti; }   // migrate older saves: passive → sedated
  vent.loadState(S.vent.s, sp, S.vent.f);
}
vent.lim = Object.assign({}, ALARM_DEFAULTS, S.alarmLimits);
let running = true;
const bus = {};
function on(ev, fn) { (bus[ev] = bus[ev] || []).push(fn); }
function emit(ev, d) { (bus[ev] || []).forEach(fn => { try { fn(d); } catch (e) { console.error(e); } }); }
function ventChanged(full) { S.vent = { s: vent.s, p: vent.p, f: vent.f }; save(); emit('vent', full); }
function setMode(m) {
  const was = vent.s.mode; vent.s.mode = m;
  if (m === 'APRV' && was !== 'APRV') { vent.aprvHigh = false; vent.aprvSwitch(true); }
  else if (was === 'APRV' && m !== 'APRV') { vent.phase = 'exp'; vent.tPhase = 0; vent.lastMandStart = vent.t - 30; vent.lastBreathStart = vent.t; }
  if (m === 'PRVC') vent.prvcP = 10;
  if ((m === 'HFNC' || VMODES[m].type === 'ps') && !vent.spont()) setTimeout(() => toast('Patient is not breathing (sedated / paralysed) – spontaneous mode will alarm'), 50);
  vent.apnea = false;
  ventChanged(true);
}
function loadScenario(sc, name, id) {
  vent.loadState(sc.s, sc.p, sc.f); vent.lim = Object.assign({}, ALARM_DEFAULTS, S.alarmLimits);
  S.scenario = id || null; ventChanged(true); toast('Loaded: ' + name);
}

/* ================= content helpers ================= */
const LANG = () => (S.learnLang === 'bn' ? 'bn' : 'en');
function locTopic(t, lang) {
  if (!t) return t;
  const o = Object.assign({}, t);
  if (lang === 'bn') {
    const bn = (t.builtin ? TOPICS_BN[t.id] : null) || {};
    const ed = S.topicEditsBn[t.id] || {};
    const bnTitle = ed.title || bn.title || (t.custom ? t.titleBn : null);
    const bnBody = ed.body || bn.body || (t.custom ? t.bodyBn : null);
    o.title = bnTitle || t.title; o.body = bnBody || t.body; o.noBn = !bnBody; o.editedBn = !!S.topicEditsBn[t.id];
    o.catLabel = CAT_BN[t.cat] || t.cat;
  } else o.catLabel = t.cat;
  return o;
}
function allTopics(lang) {
  const base = TOPICS.map(t => Object.assign({}, t, S.topicEdits[t.id] || {}, { builtin: true, edited: !!S.topicEdits[t.id] }));
  const all = base.concat(S.customTopics.map(t => Object.assign({}, t, { custom: true })));
  return lang ? all.map(t => locTopic(t, lang)) : all;
}
function getTopic(id, lang) { return allTopics(lang).find(t => t.id === id); }
function allAbn() { return ABNORMALITIES.map(a => Object.assign({}, a, S.abnEdits[a.id] || {}, { edited: !!S.abnEdits[a.id] })); }
function getAbn(id) { return allAbn().find(a => a.id === id); }
function norm(s) { return String(s || '').toLowerCase().replace(/[–—]/g, '-').trim(); }
/* glossary index */
const GL = (() => {
  const map = new Map(), pats = [];
  GLOSSARY.forEach(g => {
    [g.t].concat(g.a || []).forEach(w => {
      map.set(norm(w), g);
      if (w.length < 2) return;
      const cs = /[A-Z0-9]/.test(w.slice(1)) || w.length <= 4 || /^[A-Z]{2,}/.test(w);
      const rx = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/[-–]/g, '[-–]');
      pats.push({ w, g, re: new RegExp('(^|[^A-Za-z0-9-])(' + rx + ')(?![A-Za-z0-9]|-[A-Za-z])', cs ? '' : 'i') });
    });
  });
  pats.sort((a, b) => b.w.length - a.w.length);
  return { map, pats };
})();
function findGloss(label) { return GL.map.get(norm(label)) || null; }
/* turn glossary words in raw text into [[word|Term]] links (first time each term appears) */
function autoLink(raw, skip) {
  let toks = [];
  String(raw || '').split(/(\[\[[^\]]+\]\])/).forEach(p => { if (p) toks.push({ s: p, link: p.startsWith('[[') }); });
  const used = new Set(skip || []);
  toks.filter(t => t.link).forEach(t => { const inner = t.s.slice(2, -2).split('|'); const g = findGloss(inner[1] || inner[0]); if (g) used.add(g.t); });
  for (const pt of GL.pats) {
    if (used.has(pt.g.t)) continue;
    for (let i = 0; i < toks.length; i++) {
      const t = toks[i]; if (t.link) continue;
      const m = pt.re.exec(t.s); if (!m) continue;
      const st = m.index + m[1].length, word = m[2];
      const parts = [{ s: t.s.slice(0, st), link: false }, { s: '[[' + word + '|' + pt.g.t + ']]', link: true }, { s: t.s.slice(st + word.length), link: false }].filter(x => x.s);
      toks.splice(i, 1, ...parts); used.add(pt.g.t); break;
    }
  }
  return toks.map(t => t.s).join('');
}
function resolveTag(label) {
  const k = norm(label); if (!k) return null;
  const ts = allTopics();
  let t = ts.find(t => norm(t.title) === k) || ts.find(t => (t.tags || []).some(x => norm(x) === k));
  if (!t && TAG_ALIASES[k]) t = ts.find(x => x.id === TAG_ALIASES[k]);
  if (!t) { const g = findGloss(label); if (g && g.topic) t = ts.find(x => x.id === g.topic); }
  if (!t) t = ts.find(t => norm(t.title).startsWith(k));
  return t || null;
}
function tagBtn(label, tag) { return `<button class="tag" data-tag="${esc(tag || label)}">${esc(label)}</button>`; }
function inline(s, auto, skip) {
  let h = esc(auto ? autoLink(s, skip) : s);
  h = h.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, (m, a, b) => `<button class="tag" data-tag="${b}">${a}</button>`);
  h = h.replace(/\[\[([^\]]+)\]\]/g, (m, a) => `<button class="tag" data-tag="${a}">${a}</button>`);
  h = h.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  return h;
}
function renderRich(text, skip) {
  const used = new Set(skip || []);
  // auto-link across the whole text once (first occurrence of each term)
  const linked = autoLink(String(text || '').trim(), [...used]);
  const blocks = linked.split(/\n\s*\n/);
  return blocks.map(b => {
    const lines = b.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length && lines.every(l => l.startsWith('- '))) return '<ul>' + lines.map(l => '<li>' + inline(l.slice(2)) + '</li>').join('') + '</ul>';
    let out = '', list = [];
    lines.forEach(l => {
      if (l.startsWith('- ')) list.push('<li>' + inline(l.slice(2)) + '</li>');
      else { if (list.length) { out += '<ul>' + list.join('') + '</ul>'; list = []; } out += '<p>' + inline(l) + '</p>'; }
    });
    if (list.length) out += '<ul>' + list.join('') + '</ul>';
    return out;
  }).join('');
}
function langSeg() { return `<div class="seg lang-seg" title="Learning language"><button data-lang="en" class="${LANG() === 'en' ? 'on' : ''}">EN</button><button data-lang="bn" class="${LANG() === 'bn' ? 'on' : ''}">বাংলা</button></div>`; }

/* ================= canvas & colors ================= */
let COL = {};
function readColors() {
  const cs = getComputedStyle(document.body);
  ['p', 'f', 'v', 'mus', 'accent', 'accent2', 'muted', 'text', 'border', 'gridline', 'danger', 'warn'].forEach(k => COL[k] = cs.getPropertyValue('--' + k).trim());
  COL.font = cs.fontFamily;
}
function hexA(c, a) {
  if (!c) return `rgba(255,255,255,${a})`;
  if (c.startsWith('#')) { let h = c.slice(1); if (h.length === 3) h = h.split('').map(x => x + x).join(''); const n = parseInt(h, 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; }
  if (c.startsWith('rgba')) return c.replace(/,[^,)]+\)$/, `,${a})`);
  if (c.startsWith('rgb')) return c.replace('rgb', 'rgba').replace(')', `,${a})`);
  return c;
}
function setupCanvas(cv, onFit) {
  const st = { cv, ctx: cv.getContext('2d'), W: 0, H: 0, dpr: 1 };
  const fit = () => {
    const r = cv.getBoundingClientRect(); const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (r.width < 2 || r.height < 2) return;
    st.W = r.width; st.H = r.height; st.dpr = dpr; cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
    st.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); st.dirty = true;
    if (onFit) onFit(st);
  };
  new ResizeObserver(fit).observe(cv); fit();
  return st;
}
function niceUp(x, s) { return Math.ceil(x / s) * s; }
function niceDown(x, s) { return Math.floor(x / s) * s; }
function scaleFor(scales, key, mn, mx) {
  let lo, hi;
  if (key === 'P' || key === 'E') { lo = Math.min(0, niceDown(mn - 2, 5)); hi = Math.max(20, niceUp(mx + 3, 5)); }
  else if (key === 'F') { const m = Math.max(40, niceUp(Math.max(Math.abs(mn), Math.abs(mx)) * 1.1, 20)); lo = -m; hi = m; }
  else if (key === 'C') { lo = 0; hi = Math.max(50, niceUp(mx + 5, 10)); }
  else if (key === 'M') { lo = Math.min(-5, niceDown(mn, 5)); hi = Math.max(10, niceUp(mx, 5)); }
  else { lo = Math.min(0, niceDown(mn, 100)); hi = Math.max(400, niceUp(mx * 1.1, 100)); }
  const pv = scales[key];
  if (!pv || hi > pv[1] || lo < pv[0] || (pv[1] - pv[0]) > 1.9 * (hi - lo)) scales[key] = [lo, hi];
  return scales[key];
}
function tickStep(range) { const raw = range / 4; const p = Math.pow(10, Math.floor(Math.log10(raw))); const n = raw / p; return (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * p; }

/* ================= units (cmH2O ↔ hPa, mmHg ↔ kPa) & machine labels ================= */
const HPA = 0.980665, KPA = 0.133322;
function uP() { return !!(S.units && S.units.p === 'hPa'); }
function uG() { return !!(S.units && S.units.g === 'kPa'); }
function uF(u) { if (uP()) { if (u === 'cmH2O' || u === 'cmH2O/L/s') return HPA; if (u === 'ml/cmH2O') return 1 / HPA; } if (uG() && u === 'mmHg') return KPA; return 1; }
function uL(u) { if (uP()) u = String(u).replace('cmH2O', 'hPa'); if (uG() && u === 'mmHg') u = 'kPa'; return u; }
function uD(d, u) { return (uG() && u === 'mmHg') ? Math.max(1, d + 1) : d; }
function cv(x, u) { return (x == null || isNaN(x)) ? x : x * uF(u); }
function fmtU(x, u, d) { return fmt(cv(x, u), uD(d || 0, u)); }
function MC() { return MACHINES[S.machine] || MACHINES.generic; }
function machMode(k) { return MC().modes[k] || (VMODES[k] ? VMODES[k].name : k); }
const DOC_BY_KEY = {}; SETTING_DOCS.forEach(d => { DOC_BY_KEY[d.key] = d.id; }); DOC_BY_KEY.trigFlow = 'ms_vsens'; DOC_BY_KEY.trigP = 'ms_psens'; DOC_BY_KEY.plow = DOC_BY_KEY.thigh = DOC_BY_KEY.tlow = 'ms_bilevel'; DOC_BY_KEY.ipap = 'mm_niv'; DOC_BY_KEY.backupRR = 'mm_niv'; DOC_BY_KEY.ett = 'ms_tc'; DOC_BY_KEY.pavEsens = 'ms_esens';
const MODE_DOC = { 'VC-AC': 'mm_ac', 'PC-AC': 'mm_ac', PRVC: 'mm_vcplus', 'SIMV-VC': 'mm_simv', 'SIMV-PC': 'mm_simv', PSV: 'mm_spont', CPAP: 'mm_cpap', VS: 'mm_vs', NIV: 'mm_niv', APRV: 'mm_bilevel', PAV: 'mm_pav', TC: 'mm_tc', HFNC: 'hfnc', MASK: 'extubation' };
/* how a vent setting is shown on the selected machine (label, unit transform) */
function ctlView(key) {
  const sp = CTL[key]; if (!sp) return {};
  const mc = MC(), o = {};
  if (mc.set[key]) o.l = mc.set[key];
  if (DOC_BY_KEY[key]) o.tag = 'topic:' + DOC_BY_KEY[key];
  if (key === 'rise') {
    if (mc.riseAsPct) Object.assign(o, { u: '%', min: 1, max: 100, step: 1, to: x => clamp(Math.round(100 * (1 - x / 0.5)), 1, 100), from: y => 0.5 * (1 - y / 100) });
    else if (mc.riseMs) Object.assign(o, { u: 'ms', min: 0, max: 500, step: 10, to: x => x * 1000, from: y => y / 1000 });
  }
  if (key === 'pinsp' && mc.pinspAbs) Object.assign(o, { min: sp.min + vent.s.peep, max: sp.max + vent.s.peep, to: x => x + vent.s.peep, from: y => y - vent.s.peep });
  if (sp.u === 'cmH2O' && uP()) {
    const t0 = o.to || (x => x), f0 = o.from || (y => y);
    Object.assign(o, { u: 'hPa', min: Math.round((o.min != null ? o.min : sp.min) * HPA), max: Math.round((o.max != null ? o.max : sp.max) * HPA), to: x => t0(x) * HPA, from: y => f0(y / HPA) });
  }
  return o;
}
/* PB VMAX (peak flow) as a virtual setting that sets TI in volume control */
function vmaxSpec() {
  const s = vent.s, dec = s.flowPattern === 'decel';
  const q = () => { const tf = Math.max(0.2, s.ti - s.pause); return (dec ? 2 * s.vt / 1000 / (1.25 * tf) : s.vt / 1000 / tf) * 60; };
  return { l: 'VMAX', u: 'L/min', min: 10, max: 150, step: 1, tag: 'topic:ms_vmax',
    get: () => q(), put: (o, y) => { const tf = dec ? 2 * s.vt / 1000 * 60 / (1.25 * y) : s.vt / 1000 * 60 / y; s.ti = clamp(Math.round((tf + s.pause) * 100) / 100, 0.3, 3); } };
}

/* scalar waveforms (P, F, V) */
function drawScalars(st, v, o) {
  const { ctx, W, H } = st; if (!W) return;
  ctx.clearRect(0, 0, W, H);
  const SR = v.SR, Wn = Math.max(50, Math.round(o.win * SR)), n = v.idx, start = Math.max(0, n - Wn);
  const panes = [
    { k: 'P', label: 'Paw', unit: uL('cmH2O'), fac: uF('cmH2O'), col: COL.p, d: 1 },
    { k: 'F', label: 'Flow', unit: 'L/min', col: COL.f, d: 0 },
    { k: 'V', label: 'Volume', unit: 'ml', col: COL.v, d: 0 }
  ];
  if (o.co2) panes.push({ k: 'C', label: 'CO2', unit: uL('mmHg'), fac: uF('mmHg'), col: COL.accent2, d: uG() ? 1 : 0 });
  if (o.pes) panes.push({ k: 'E', label: 'Pes', unit: uL('cmH2O'), fac: uF('cmH2O'), col: COL.warn, d: 1 });
  const padL = 40, padR = 10, gap = 8, top = 2;
  const ph = (H - top - gap * (panes.length - 1)) / panes.length, pw = W - padL - padR;
  const gapN = Math.round(0.35 * SR), curPos = n % Wn;
  const xOf = k => padL + (o.sweep ? (k % Wn) : (k - (n - Wn))) / Wn * pw;
  const glow = (S.glow || 0) * 8;
  ctx.font = `600 10px ${COL.font}`;
  panes.forEach((pn, i) => {
    const y0 = top + i * (ph + gap), raw = v.buf[pn.k], fac = pn.fac || 1, arr = fac === 1 ? raw : { length: raw.length }; if (fac !== 1) for (let k = start; k < n; k++) arr[k % v.N] = raw[k % v.N] * fac;
    let mn = Infinity, mx = -Infinity;
    for (let k = start; k < n; k++) { const val = arr[k % v.N]; if (val < mn) mn = val; if (val > mx) mx = val; }
    if (pn.k === 'P' && o.pmus) for (let k = start; k < n; k++) { const val = v.buf.M[k % v.N] * fac; if (val < mn) mn = val; if (val > mx) mx = val; }
    if (!isFinite(mn)) { mn = 0; mx = 1; }
    const [lo, hi] = scaleFor(o.scales, pn.k, mn, mx);
    const yOf = val => y0 + ph - (val - lo) / (hi - lo) * ph;
    // pane bg + grid
    ctx.fillStyle = hexA(COL.text, 0.025); ctx.fillRect(padL, y0, pw, ph);
    const stp = tickStep(hi - lo);
    ctx.font = `600 10px ${COL.font}`;
    ctx.strokeStyle = hexA(COL.text, 0.06); ctx.lineWidth = 1; ctx.fillStyle = COL.muted; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    for (let t = Math.ceil(lo / stp) * stp; t <= hi + 1e-6; t += stp) {
      const y = Math.round(yOf(t)) + .5; ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + pw, y); ctx.stroke(); ctx.fillText(fmt(t, stp < 1 ? 1 : 0), padL - 5, y);
    }
    const y0line = yOf(clamp(0, lo, hi));
    ctx.strokeStyle = hexA(COL.text, 0.22); ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(padL, y0line); ctx.lineTo(padL + pw, y0line); ctx.stroke(); ctx.setLineDash([]);
    // segments
    const segs = []; let seg = [];
    for (let k = start; k < n; k++) {
      if (o.sweep) {
        const pos = k % Wn; const rel = (pos - curPos + Wn) % Wn;
        if (rel > 0 && rel < gapN) { if (seg.length) { segs.push(seg); seg = []; } continue; }
        if (pos === 0 && seg.length) { segs.push(seg); seg = []; }
      }
      seg.push([xOf(k), yOf(clamp(arr[k % v.N], lo - (hi - lo), hi + (hi - lo)))]);
    }
    if (seg.length) segs.push(seg);
    ctx.save(); ctx.beginPath(); ctx.rect(padL, y0, pw, ph); ctx.clip();
    if (S.display.fill) segs.forEach(sg => {
      if (sg.length < 2) return;
      const g = ctx.createLinearGradient(0, y0, 0, y0 + ph); g.addColorStop(0, hexA(pn.col, .38)); g.addColorStop(1, hexA(pn.col, .02));
      if (pn.k === 'F') { g.addColorStop(0, hexA(pn.col, .3)); g.addColorStop(.5, hexA(pn.col, .03)); g.addColorStop(1, hexA(pn.col, .3)); }
      ctx.beginPath(); ctx.moveTo(sg[0][0], y0line); sg.forEach(p => ctx.lineTo(p[0], p[1])); ctx.lineTo(sg[sg.length - 1][0], y0line); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
    });
    ctx.strokeStyle = pn.col; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.shadowColor = pn.col; ctx.shadowBlur = glow;
    segs.forEach(sg => { if (sg.length < 2) return; ctx.beginPath(); ctx.moveTo(sg[0][0], sg[0][1]); for (let j = 1; j < sg.length; j++) ctx.lineTo(sg[j][0], sg[j][1]); ctx.stroke(); });
    ctx.shadowBlur = 0;
    // Pmus overlay
    if (pn.k === 'P' && o.pmus) {
      ctx.strokeStyle = hexA(COL.mus, .75); ctx.lineWidth = 1.3; ctx.setLineDash([4, 3]); ctx.beginPath(); let started = false;
      for (let k = start; k < n; k++) {
        if (o.sweep) { const rel = ((k % Wn) - curPos + Wn) % Wn; if (rel > 0 && rel < gapN) { started = false; continue; } if (k % Wn === 0) started = false; }
        const x = xOf(k), y = yOf(v.buf.M[k % v.N] * fac);
        if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
      }
      ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.restore();
    // breath markers
    if (pn.k === 'P') {
      ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.font = `800 9px ${COL.font}`;
      v.markers.forEach(m => {
        if (m.i < start || m.i >= n) return;
        if (o.sweep) { const rel = ((m.i % Wn) - curPos + Wn) % Wn; if (rel > 0 && rel < gapN) return; }
        const x = xOf(m.i); const c = m.type === 'M' ? COL.accent : m.type === 'A' ? COL.f : m.type === 'S' ? COL.v : COL.muted;
        ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x - 5, y0 + 1); ctx.lineTo(x + 5, y0 + 1); ctx.lineTo(x, y0 + 8); ctx.closePath(); ctx.fill();
        ctx.fillText(m.type, x, y0 + 9);
      });
    }
    // labels
    const cur = n > 0 ? arr[(n - 1) % v.N] : 0;
    const ly = pn.k === 'P' ? y0 + 20 : y0 + 5;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.font = `800 11px ${COL.font}`;
    ctx.fillStyle = pn.col; ctx.fillText(pn.label, padL + 8, ly);
    const lw = ctx.measureText(pn.label).width; ctx.font = `600 9.5px ${COL.font}`; ctx.fillStyle = COL.muted; ctx.fillText(pn.unit, padL + 13 + lw, ly + 1.5);
    ctx.textAlign = 'right'; ctx.font = `800 13px ${COL.font}`; ctx.fillStyle = pn.col; ctx.fillText(fmt(cur, pn.d), padL + pw - 6, ly);
    if (pn.k === 'P' && o.pmus) { ctx.font = `700 9px ${COL.font}`; ctx.fillStyle = hexA(COL.mus, .8); ctx.fillText('- - Pmus (patient effort)', padL + pw - 6, ly + 17); }
  });
  // sweep cursor
  if (o.sweep && n > 0) { const x = padL + curPos / Wn * pw; ctx.strokeStyle = hexA(COL.accent, .8); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, H); ctx.stroke(); }
  // measurement cursor
  if (o.cursorX != null && o.cursorX > padL && o.cursorX < padL + pw && n > 1) {
    const pos = Math.round((o.cursorX - padL) / pw * Wn);
    let k = o.sweep ? (n - 1) - (((n - 1) % Wn - pos + Wn) % Wn) : (n - Wn) + pos;
    if (k >= start && k < n) {
      const x = xOf(k); ctx.strokeStyle = hexA(COL.text, .7); ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); ctx.setLineDash([]);
      const P = v.buf.P[k % v.N], F = v.buf.F[k % v.N], V = v.buf.V[k % v.N], M = v.buf.M[k % v.N];
      const txt = [`P ${fmt(P, 1)}`, `F ${fmt(F, 0)}`, `V ${fmt(V, 0)}`, `Pmus ${fmt(M, 1)}`];
      const bx = x + 140 > W ? x - 138 : x + 8;
      ctx.fillStyle = hexA('#000', .7); ctx.fillRect(bx, 8, 130, 66); ctx.strokeStyle = COL.accent; ctx.strokeRect(bx + .5, 8.5, 129, 65);
      ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.font = `700 11px ${COL.font}`;
      [COL.p, COL.f, COL.v, COL.mus].forEach((c, j) => { ctx.fillStyle = c; ctx.fillText(txt[j], bx + 8, 14 + j * 14.5); });
    }
  }
}

/* P-V and F-V loops */
function drawLoops(st, v, o) {
  const { ctx, W, H } = st; if (!W) return;
  ctx.clearRect(0, 0, W, H);
  const side = W > H * 1.2;
  const r1 = side ? { x: 0, y: 0, w: W / 2 - 4, h: H } : { x: 0, y: 0, w: W, h: H / 2 - 4 };
  const r2 = side ? { x: W / 2 + 4, y: 0, w: W / 2 - 4, h: H } : { x: 0, y: H / 2 + 4, w: W, h: H / 2 - 4 };
  const last = v.lastLoop || [], cur = v.loop || [], ref = o.ref || null;
  const all = last.concat(cur, ref || []);
  let pmin = 0, pmax = 20, vmax = 300, vmin = 0, fmax = 40;
  all.forEach(p => { if (p[0] < pmin) pmin = p[0]; if (p[0] > pmax) pmax = p[0]; if (p[1] > vmax) vmax = p[1]; if (p[1] < vmin) vmin = p[1]; if (Math.abs(p[2]) > fmax) fmax = Math.abs(p[2]); });
  const sc = o.scales;
  const Pr = (sc.LP = hyst(sc.LP, [niceDown(Math.min(0, pmin - 2), 5), niceUp(pmax + 3, 5)]));
  const Vr = (sc.LV = hyst(sc.LV, [Math.min(0, niceDown(vmin, 100)), niceUp(vmax * 1.08, 100)]));
  const Fr = (sc.LF = hyst(sc.LF, [-niceUp(fmax * 1.1, 20), niceUp(fmax * 1.1, 20)]));
  const glow = (S.glow || 0) * 8;
  const font = COL.font;
  function pane(r, xr, yr, xi, yi, col, xl, yl, title) {
    const pl = 34, pb = 20, pt = 22, pr = 8;
    const X = x => r.x + pl + (x - xr[0]) / (xr[1] - xr[0]) * (r.w - pl - pr);
    const Y = y => r.y + r.h - pb - (y - yr[0]) / (yr[1] - yr[0]) * (r.h - pb - pt);
    ctx.fillStyle = hexA(COL.text, .025); ctx.fillRect(r.x + pl, r.y + pt, r.w - pl - pr, r.h - pb - pt);
    ctx.strokeStyle = hexA(COL.text, .2); ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
    ctx.beginPath(); ctx.moveTo(X(clamp(0, xr[0], xr[1])), r.y + pt); ctx.lineTo(X(clamp(0, xr[0], xr[1])), r.y + r.h - pb); ctx.moveTo(r.x + pl, Y(clamp(0, yr[0], yr[1]))); ctx.lineTo(r.x + r.w - pr, Y(clamp(0, yr[0], yr[1]))); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = COL.muted; ctx.font = `600 9.5px ${font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(xl, r.x + pl + (r.w - pl - pr) / 2, r.y + r.h - 13); ctx.fillText(fmt(xr[0]), X(xr[0]) + 6, r.y + r.h - 13); ctx.fillText(fmt(xr[1]), X(xr[1]) - 10, r.y + r.h - 13);
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText(fmt(yr[1]), r.x + pl - 4, Y(yr[1])); ctx.fillText(fmt(yr[0]), r.x + pl - 4, Y(yr[0]));
    ctx.save(); ctx.translate(r.x + 9, r.y + r.h / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center'; ctx.fillText(yl, 0, 0); ctx.restore();
    ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.font = `800 11px ${font}`; ctx.fillStyle = col; ctx.fillText(title, r.x + pl + 6, r.y + 4);
    ctx.save(); ctx.beginPath(); ctx.rect(r.x + pl, r.y + pt, r.w - pl - pr, r.h - pb - pt); ctx.clip();
    const line = (pts, c, w, dash, a) => { if (pts.length < 2) return; ctx.strokeStyle = hexA(c, a); ctx.lineWidth = w; ctx.setLineDash(dash || []); ctx.beginPath(); ctx.moveTo(X(pts[0][xi]), Y(pts[0][yi])); for (let j = 1; j < pts.length; j++) ctx.lineTo(X(pts[j][xi]), Y(pts[j][yi])); ctx.stroke(); ctx.setLineDash([]); };
    if (ref) line(ref, COL.accent2, 1.6, [5, 4], .85);
    if (last.length > 2) { ctx.beginPath(); ctx.moveTo(X(last[0][xi]), Y(last[0][yi])); last.forEach(p => ctx.lineTo(X(p[xi]), Y(p[yi]))); ctx.closePath(); ctx.fillStyle = hexA(col, .08); ctx.fill(); }
    line(last, col, 1.6, null, .45);
    ctx.shadowColor = col; ctx.shadowBlur = glow; line(cur, col, 2.2, null, 1); ctx.shadowBlur = 0;
    if (cur.length) { const p = cur[cur.length - 1]; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(X(p[xi]), Y(p[yi]), 3, 0, 7); ctx.fill(); }
    ctx.restore();
  }
  pane(r1, Pr, Vr, 0, 1, COL.p, 'Pressure (cmH2O)', 'Volume (ml)', 'P–V loop');
  pane(r2, Vr, Fr, 1, 2, COL.f, 'Volume (ml)', 'Flow (L/min)', 'F–V loop');
}
function hyst(pv, nv) { if (!pv || nv[1] > pv[1] || nv[0] < pv[0] || (pv[1] - pv[0]) > 1.9 * (nv[1] - nv[0])) return nv; return pv; }

/* ================= controls ================= */
const CTL = {
  rr: { l: 'RR (set)', u: 'b/min', min: 4, max: 45, step: 1, tag: 'I:E Ratio' },
  vt: { l: 'Tidal volume', u: 'ml', min: 150, max: 1000, step: 10, tag: 'Tidal volume' },
  pinsp: { l: 'Pinsp (above PEEP)', u: 'cmH2O', min: 3, max: 45, step: 1, tag: 'Pressure control' },
  ti: { l: 'Insp time (Ti)', u: 's', min: 0.3, max: 3, step: 0.05, tag: 'I:E Ratio' },
  pause: { l: 'Insp pause', u: 's', min: 0, max: 1, step: 0.05, tag: 'Inspiratory pause' },
  rise: { l: 'Rise time', u: 's', min: 0, max: 0.5, step: 0.01, tag: 'Rise time' },
  peep: { l: 'PEEP', u: 'cmH2O', min: 0, max: 24, step: 1, tag: 'PEEP' },
  fio2: { l: 'FiO2', u: '%', min: 21, max: 100, step: 1, tag: 'FiO2' },
  ps: { l: 'Pressure support', u: 'cmH2O', min: 0, max: 30, step: 1, tag: 'Pressure support' },
  cycle: { l: 'Cycle-off (ETS)', u: '%', min: 5, max: 80, step: 5, tag: 'Cycle' },
  phigh: { l: 'P high', u: 'cmH2O', min: 8, max: 40, step: 1, tag: 'APRV' },
  plow: { l: 'P low', u: 'cmH2O', min: 0, max: 15, step: 1, tag: 'APRV' },
  thigh: { l: 'T high', u: 's', min: 0.5, max: 8, step: 0.1, tag: 'APRV' },
  tlow: { l: 'T low', u: 's', min: 0.2, max: 3, step: 0.05, tag: 'APRV' },
  apneaTime: { l: 'Apnoea time', u: 's', min: 10, max: 60, step: 5, tag: 'Alarms' },
  trigFlow: { l: 'Flow trigger', u: 'L/min', min: 0.5, max: 10, step: 0.5, tag: 'Trigger' },
  trigP: { l: 'Pressure trigger', u: 'cmH2O', min: 0.5, max: 10, step: 0.5, tag: 'Trigger' },
  C: { l: 'Compliance', u: 'ml/cmH2O', min: 10, max: 120, step: 1, tag: 'Compliance' },
  Ri: { l: 'Insp resistance', u: 'cmH2O/L/s', min: 2, max: 50, step: 1, tag: 'Resistance' },
  Re: { l: 'Exp resistance', u: 'cmH2O/L/s', min: 2, max: 60, step: 1, tag: 'Resistance' },
  effort: { l: 'Awake effort (Pmus)', u: 'cmH2O', min: 0, max: 20, step: 1, tag: 'Respiratory drive' },
  prr: { l: 'Awake RR', u: 'b/min', min: 0, max: 45, step: 1, tag: 'Respiratory drive' },
  hfFlow: { l: 'Flow', u: 'L/min', min: 10, max: 60, step: 5, tag: 'HFNC' },
  nti: { l: 'Neural Ti', u: 's', min: 0.4, max: 2, step: 0.05, tag: 'Double triggering' },
  shunt: { l: 'Shunt (baseline)', u: '%', min: 0, max: 60, step: 1, tag: 'Shunt' },
  deadAlv: { l: 'Alveolar dead space', u: '%', min: 0, max: 60, step: 1, tag: 'Dead space' },
  recruit: { l: 'Recruitability', u: '%', min: 0, max: 100, step: 5, tag: 'Recruitment' },
  vco2: { l: 'CO2 production', u: 'ml/min', min: 100, max: 400, step: 10, tag: 'Hypercapnia' },
  hco3: { l: 'HCO3 (metabolic)', u: 'mmol/L', min: 8, max: 45, step: 1, tag: 'HCO3' },
  hb: { l: 'Haemoglobin', u: 'g/dL', min: 5, max: 18, step: 0.5, tag: 'ODC' },
  hypovol: { l: 'Hypovolaemia', u: '%', min: 0, max: 90, step: 5, tag: 'Hypovolaemia' },
  cwFrac: { l: 'Chest wall share', u: '%', min: 5, max: 70, step: 5, tag: 'Chest wall' },
  pes0: { l: 'Pleural pressure baseline', u: 'cmH2O', min: 0, max: 20, step: 1, tag: 'Oesophageal pressure' },
  ipap: { l: 'IPAP', u: 'cmH2O', min: 6, max: 30, step: 1, tag: 'IPAP' },
  backupRR: { l: 'Backup rate', u: 'b/min', min: 0, max: 30, step: 1, tag: 'NIV' },
  sighEvery: { l: 'Sigh every', u: 'breaths', min: 0, max: 200, step: 10, tag: 'Sigh' },
  maxTi: { l: 'Max Ti (spontaneous)', u: 's', min: 0.8, max: 3, step: 0.1, tag: 'Advanced settings' },
  atc: { l: 'ATC compensation', u: '%', min: 0, max: 100, step: 10, tag: 'ATC' },
  pavSupp: { l: '% Support (PAV)', u: '%', min: 5, max: 95, step: 5, tag: 'PAV+' },
  pavEsens: { l: 'Exp. sensitivity (PAV)', u: 'L/min', min: 0.5, max: 10, step: 0.5, tag: 'ESENS' },
  maskFlow: { l: 'O2 flow (face mask)', u: 'L/min', min: 2, max: 15, step: 1, tag: 'Extubation' }
};
function makeCtl(obj, key, onChange, ov) {
  const sp = Object.assign({}, CTL[key] || {}, ov || (obj === vent.s ? ctlView(key) : {})), d = decimals(sp.step);
  const get = () => sp.get ? sp.get(obj) : sp.to ? sp.to(obj[key]) : obj[key];
  const put = y => { if (sp.put) sp.put(obj, y); else obj[key] = sp.from ? Number(sp.from(y).toFixed(4)) : y; };
  const e = el(`<div class="ctl"><div class="ctl-top"><span class="ctl-name">${tagBtn(sp.l, sp.tag)}</span>
    <span class="ctl-val"><button class="step" data-d="-1">−</button><input type="number" inputmode="decimal" step="${sp.step}"><span class="u">${sp.u}</span><button class="step" data-d="1">+</button></span></div>
    <input type="range" min="${sp.min}" max="${sp.max}" step="${sp.step}"></div>`);
  const num = $('input[type=number]', e), rng = $('input[type=range]', e);
  const show = () => { const x = get(); num.value = Number(x).toFixed(d); rng.value = x; rng.style.setProperty('--pct', ((x - sp.min) / (sp.max - sp.min) * 100) + '%'); };
  const set = x => { x = clamp(Math.round(Number(x) / sp.step) * sp.step, sp.min, sp.max); x = Number(x.toFixed(d)); put(x); show(); onChange && onChange(key, obj[key]); };
  rng.addEventListener('input', () => set(rng.value));
  num.addEventListener('change', () => set(num.value));
  $$('.step', e).forEach(b => b.addEventListener('click', () => set(get() + Number(b.dataset.d) * sp.step)));
  show(); e._show = show;
  return e;
}

/* ================= cards ================= */
const CARDS = {};
const inst = {};

CARDS.waveforms = (body, card) => {
  body.classList.add('flush');
  body.innerHTML = `<div class="wf-layout"><div class="wf-tools">
     <button class="btn sm" data-a="ihold">${ic('hold')}<span data-hl="0">${esc((MC().holds || ['Insp hold'])[0])}</span></button>
     <button class="btn sm" data-a="ehold">${ic('hold')}<span data-hl="1">${esc((MC().holds || ['', 'Exp hold'])[1])}</span></button>
     <button class="btn sm" data-a="pmus">${ic('user')}Pmus</button>
     <button class="btn sm" data-a="co2">${ic('drop')}CO2</button>
     <button class="btn sm" data-a="pes">${ic('lungs')}Pes</button>
     <div class="seg" data-a="win"><button data-w="6">6s</button><button data-w="10">10s</button><button data-w="15">15s</button><button data-w="20">20s</button></div>
     <button class="ib sm" data-a="snap" title="Save PNG">${ic('camera')}</button>
     <span class="hint" style="margin-left:auto">${tagBtn('Reading waveforms', 'waveforms')}</span>
   </div><div class="cv-wrap"><canvas></canvas></div></div>`;
  const st = setupCanvas($('canvas', body)); const o = { scales: {}, sweep: true, cursorX: null };
  on('units', () => { o.scales = {}; });
  on('machine', () => { const h = MC().holds || ['Insp hold', 'Exp hold']; $$('[data-hl]', body).forEach(x => { x.textContent = h[+x.dataset.hl]; }); });
  const sync = () => { $('[data-a=pmus]', body).classList.toggle('pri', S.display.pmus); $('[data-a=co2]', body).classList.toggle('pri', !!S.display.co2); $('[data-a=pes]', body).classList.toggle('pri', !!S.display.pes); $$('[data-a=win] button', body).forEach(b => b.classList.toggle('on', +b.dataset.w === S.display.win)); };
  body.addEventListener('click', e => {
    const b = e.target.closest('[data-a],[data-w]'); if (!b) return;
    if (b.dataset.w) { S.display.win = +b.dataset.w; o.scales = {}; save(); sync(); return; }
    const a = b.dataset.a;
    if (a === 'ihold') { if (vent.requestHold('i')) toast('Inspiratory hold on next mandatory breath'); else toast('Holds not available in APRV'); }
    if (a === 'ehold') { if (vent.requestHold('e')) toast('Expiratory hold before next breath'); else toast('Holds not available in APRV'); }
    if (a === 'pmus') { S.display.pmus = !S.display.pmus; save(); sync(); }
    if (a === 'co2') { S.display.co2 = !S.display.co2; save(); sync(); }
    if (a === 'pes') { S.display.pes = !S.display.pes; save(); sync(); }
    if (a === 'snap') { const l = document.createElement('a'); l.download = 'ventlab-waveforms.png'; l.href = st.cv.toDataURL('image/png'); l.click(); }
  });
  st.cv.addEventListener('pointermove', e => { const r = st.cv.getBoundingClientRect(); o.cursorX = e.clientX - r.left; });
  st.cv.addEventListener('pointerleave', () => o.cursorX = null);
  sync();
  return { frame() { o.win = S.display.win; o.pmus = S.display.pmus; o.co2 = !!S.display.co2; o.pes = !!S.display.pes; drawScalars(st, vent, o); } };
};

CARDS.loops = (body) => {
  body.classList.add('flush');
  body.innerHTML = `<div class="wf-layout"><div class="wf-tools"><button class="btn sm" data-a="ref">${ic('bookmark')}Save reference</button><button class="btn sm" data-a="clr">${ic('x')}Clear</button>
     <span class="hint" style="margin-left:auto">${tagBtn('P-V', 'P-V loop')} ${tagBtn('F-V', 'Flow–volume loop')}</span></div><div class="cv-wrap"><canvas></canvas></div></div>`;
  const st = setupCanvas($('canvas', body)); const o = { scales: {} };
  body.addEventListener('click', e => {
    const b = e.target.closest('[data-a]'); if (!b) return;
    if (b.dataset.a === 'ref') { if (vent.lastLoop) { S.refLoop = vent.lastLoop.filter((_, i) => i % 2 === 0); save(); toast('Reference loop saved'); } }
    if (b.dataset.a === 'clr') { S.refLoop = null; save(); }
  });
  return { frame() { o.ref = S.refLoop; drawLoops(st, vent, o); } };
};

const NUMS = [
  { k: 'spo2', l: 'SpO2', u: '%', c: 'f big', d: 0, tag: 'SpO2', st: (x, L) => x < L.spo2Low ? 'bad' : x < 93 ? 'warn' : '' },
  { k: 'etco2', l: 'EtCO2', u: 'mmHg', c: 'v big', d: 0, tag: 'EtCO2', st: (x, L) => (x > L.etco2High || x < L.etco2Low) ? 'warn' : '' },
  { k: 'ppeak', l: 'Ppeak', u: 'cmH2O', c: 'p big', d: 1, tag: 'Ppeak', st: (x, L) => x > L.pHigh ? 'bad' : x > 35 ? 'warn' : '' },
  { k: 'pplat', l: 'Pplat', u: 'cmH2O', c: 'p', d: 1, tag: 'Pplat', st: x => x > 30 ? 'bad' : x > 27 ? 'warn' : '', sub: M => M.pplat == null ? 'use Insp hold' : (M.pplatAge > 0 ? M.pplatAge + ' breaths ago' : 'this breath') },
  { k: 'peep', l: 'PEEP set', u: 'cmH2O', c: 'p', d: 0, tag: 'PEEP' },
  { k: 'peepTot', l: 'PEEP total', u: 'cmH2O', c: 'p', d: 1, tag: 'Auto-PEEP', sub: M => M.peepTot == null ? 'use Exp hold' : 'autoPEEP ' + fmt(M.peepTot - M.peep, 1) },
  { k: 'pmean', l: 'Pmean', u: 'cmH2O', c: 'p', d: 1, tag: 'Mean airway pressure' },
  { k: 'dp', l: 'Driving P', u: 'cmH2O', c: 'p', d: 1, tag: 'Driving pressure', st: x => x > 15 ? 'bad' : x > 13 ? 'warn' : '' },
  { k: 'vti', l: 'Vti', u: 'ml', c: 'v big', d: 0, tag: 'Tidal volume' },
  { k: 'vtkg', l: 'Vt / PBW', u: 'ml/kg', c: 'v', d: 1, tag: 'PBW', st: x => x > 8.5 ? 'bad' : x > 8 ? 'warn' : '', sub: () => 'PBW ' + fmt(vent.p.ibw, 0) + ' kg' },
  { k: 'vte', l: 'Vte', u: 'ml', c: 'v big', d: 0, tag: 'Tidal volume', st: (x, L) => x < L.vteLow ? 'bad' : '' },
  { k: 'rr', l: 'RR total', u: 'b/min', c: 'f big', d: 0, tag: 'Breath types', st: (x, L) => x > L.rrHigh ? 'bad' : '' },
  { k: 'mve', l: 'MVe', u: 'L/min', c: 'f', d: 1, tag: 'Minute ventilation', st: (x, L) => (x < L.mvLow || x > L.mvHigh) ? 'warn' : '' },
  { k: 'ti', l: 'Ti', u: 's', c: 'f', d: 2, tag: 'I:E Ratio' },
  { k: 'ie', l: 'I:E', u: '', c: 'f', raw: true, tag: 'I:E Ratio' },
  { k: 'qpk', l: 'Peak flow', u: 'L/min', c: 'f', d: 0, tag: 'Flow pattern' },
  { k: 'cdyn', l: 'Cdyn', u: 'ml/cmH2O', c: 'v', d: 0, tag: 'Compliance' },
  { k: 'cstat', l: 'Cstat', u: 'ml/cmH2O', c: 'v', d: 0, tag: 'Compliance', st: x => x < 30 ? 'warn' : '' },
  { k: 'raw', l: 'Raw', u: 'cmH2O/L/s', c: 'v', d: 1, tag: 'Resistance', sub: M => M.raw == null ? 'VC square + hold' : '', st: x => x > 20 ? 'warn' : '' },
  { k: 'leak', l: 'Leak', u: '%', c: 'v', d: 0, tag: 'Leak', st: (x, L) => x > L.leakHigh ? 'bad' : x > 10 ? 'warn' : '' },
  { k: 'endExpFlow', l: 'End-exp flow', u: 'L/min', c: 'f', d: 1, tag: 'Auto-PEEP', st: x => x < -6 ? 'warn' : '' },
  { k: 'tau', l: 'τ (model)', u: 's', c: 'v', d: 2, tag: 'Time constant', mul: 1 },
  { k: 'rsbi', l: 'RSBI', u: 'b/min/L', c: 'v', d: 0, tag: 'RSBI', st: x => x > 105 ? 'warn' : '' },
  { k: 'mp', l: 'Mech. power', u: 'J/min', c: 'v', d: 1, tag: 'Mechanical power', st: x => x > 17 ? 'warn' : '' },
  { k: 'pinspAuto', l: 'Pinsp (auto)', u: 'cmH2O', c: 'p', d: 0, tag: 'PRVC', only: 'PRVC' },
  { k: 'pinspAuto', l: 'PS (auto)', u: 'cmH2O', c: 'p', d: 0, tag: 'Volume support', only: 'VS', key2: 'vsp' },
  { k: 'plExp', l: 'PL end-exp', u: 'cmH2O', c: 'p', d: 1, tag: 'Transpulmonary pressure', st: x => x < -2 ? 'warn' : '' },
  { k: 'plInsp', l: 'PL end-insp', u: 'cmH2O', c: 'p', d: 1, tag: 'Transpulmonary pressure', st: x => x > 25 ? 'bad' : x > 20 ? 'warn' : '' },
  { k: 'wob', l: 'WOB (patient)', u: 'J/L', c: 'f big', d: 2, tag: 'PAV+ % support', only: 'PAV', st: x => x > 1 ? 'bad' : (x > 0.7 || x < 0.3) ? 'warn' : '' },
  { k: 'cpav', l: 'CPAV', u: 'ml/cmH2O', c: 'v', d: 0, tag: 'PAV+ mode', only: 'PAV' },
  { k: 'rpav', l: 'RPAV', u: 'cmH2O/L/s', c: 'v', d: 1, tag: 'PAV+ mode', only: 'PAV' },
  { k: 'rox', l: 'ROX index', u: '', c: 'f big', d: 1, tag: 'ROX index', only: ['HFNC', 'MASK'], st: x => x < 3.85 ? 'bad' : x < 4.88 ? 'warn' : '' },
  { k: 'fio2Del', l: 'FiO2 delivered', u: '%', c: 'v', d: 0, tag: 'HFNC', only: ['HFNC', 'MASK'] },
  { k: 'termPct', l: 'Term. % PEFR', u: '%', c: 'f', d: 0, tag: 'APRV', only: 'APRV' }
];
CARDS.numerics = (body) => {
  body.innerHTML = `<div class="num-grid"></div><div class="truth"></div>`;
  const grid = $('.num-grid', body), truth = $('.truth', body); let last = 0, mode = null;
  const build = () => {
    mode = vent.s.mode; const mc = MC();
    grid.innerHTML = NUMS.filter(n => !n.only || [].concat(n.only).includes(mode)).map(n => `<div class="num ${n.c}" data-k="${n.k}" data-l="${n.l}"><div class="nl"><button data-tag="${esc(n.tag)}" title="${esc(n.l)}">${esc(mc.num[n.k] || n.l)}</button><span>${uL(n.u)}</span></div><div class="nv">—</div><div class="ns"></div></div>`).join('');
  };
  build(); on('machine', build); on('units', build);
  return {
    frame(now) {
      if (now - last < 250) return; last = now;
      if (mode !== vent.s.mode) build();
      const M = vent.meas, L = vent.lim;
      $$('.num', grid).forEach(t => {
        const n = NUMS.find(x => x.k === t.dataset.k && x.l === t.dataset.l); const x = M[n.k];
        $('.nv', t).textContent = n.raw ? (x || '—') : fmtU(x, n.u, n.d);
        t.classList.remove('warn', 'bad'); const s = (x != null && n.st) ? n.st(x, L) : ''; if (s) t.classList.add(s);
        $('.ns', t).textContent = n.sub ? n.sub(M) : '';
      });
      truth.innerHTML = `Simulator truth: PEEPi <b>${fmtU(M.peepiTrue, 'cmH2O', 1)}</b> · end-insp alveolar P <b>${fmtU(M.plTrue, 'cmH2O', 1)}</b> · C <b>${fmtU(vent.Ceff() * 1000, 'ml/cmH2O', 0)}</b> · Ri/Re <b>${fmtU(vent.Ri(), 'cmH2O/L/s', 0)}/${fmtU(vent.Re(), 'cmH2O/L/s', 0)}</b> <span class="hint">${uL('cmH2O')}</span>`;
    }
  };
};


function interpretABG(M, fio2) {
  const out = []; const ph = M.ph, pc = M.paco2, hc = M.hco3;
  let acid = ph < 7.35 ? 'Acidaemia' : ph > 7.45 ? 'Alkalaemia' : 'Normal pH';
  const resp = pc > 45 ? 'respiratory acidosis' : pc < 35 ? 'respiratory alkalosis' : '';
  const met = hc < 22 ? 'metabolic acidosis' : hc > 26 ? 'metabolic alkalosis' : '';
  let prim = '';
  if (ph < 7.35) prim = [pc > 45 ? 'respiratory acidosis' : '', hc < 22 ? 'metabolic acidosis' : ''].filter(Boolean).join(' + ');
  else if (ph > 7.45) prim = [pc < 35 ? 'respiratory alkalosis' : '', hc > 26 ? 'metabolic alkalosis' : ''].filter(Boolean).join(' + ');
  else prim = (resp || met) ? 'compensated / mixed (' + [resp, met].filter(Boolean).join(', ') + ')' : 'no acid–base disorder';
  out.push(`<b>${acid}</b>${prim ? ' – ' + prim : ''}`);
  if (hc < 22) { const e = 1.5 * hc + 8; out.push(`Winter's expected PaCO2 ${fmt(e - 2)}–${fmt(e + 2)}: ${pc > e + 2 ? 'additional respiratory acidosis' : pc < e - 2 ? 'additional respiratory alkalosis' : 'appropriate compensation'}`); }
  const pf = M.pao2 / fio2;
  out.push(`Oxygenation: PaO2 ${fmtU(M.pao2, 'mmHg')} ${uL('mmHg')} on FiO2 ${fmt(fio2 * 100)}% → P/F ${fmt(pf)} mmHg${uG() ? ' (' + fmt(pf * KPA, 1) + ' kPa)' : ''} ${pf > 300 ? '(normal range)' : pf > 200 ? '(mild ARDS range)' : pf > 100 ? '(moderate ARDS range)' : '(severe ARDS range)'}`);
  if (hc < 22 && uG()) out[1] = out[1] + ` (${fmt((1.5 * hc + 8) * KPA, 1)} kPa)`;
  if (M.pao2 < 60) out.push('<span style="color:var(--danger)">Hypoxaemia</span> – think FiO2 / PEEP');
  if (M.rox != null) out.push(`ROX ${fmt(M.rox, 1)} → ${M.rox >= 4.88 ? 'HFNC likely to succeed' : M.rox < 3.85 ? 'high risk of HFNC failure – consider NIV / intubation' : 'borderline – reassess soon'}`);
  if (M.gap > 10) out.push(`PaCO2–EtCO2 gap ${fmtU(M.gap, 'mmHg')} ${uL('mmHg')} → high dead space / low perfusion`);
  return out;
}
CARDS.gas = (body) => {
  body.innerHTML = `<div class="gas-top"><div class="ring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" class="rg-bg"/><circle cx="60" cy="60" r="50" class="rg"/></svg><div class="ring-v"><b>—</b><span>SpO2 %</span></div></div>
    <div class="gas-side"><div class="num v"><div class="nl"><button data-tag="EtCO2">EtCO2</button><span data-u="mmHg">${uL('mmHg')}</span></div><div class="nv" data-k="etco2" data-u="mmHg">—</div></div>
    <div class="num f"><div class="nl"><button data-tag="Alveolar ventilation">VA</button><span>L/min</span></div><div class="nv" data-k="va">—</div></div></div></div>
    <div class="num-grid" style="margin-top:8px">${[['ph', 'pH', '', 2, 'pH'], ['paco2', 'PaCO2', 'mmHg', 0, 'PaCO2'], ['pao2', 'PaO2', 'mmHg', 0, 'PaO2'], ['hco3', 'HCO3', 'mmol/L', 0, 'HCO3'], ['pf', 'P/F', 'mmHg', 0, 'P/F ratio'], ['aa', 'A–a', 'mmHg', 0, 'A–a gradient'], ['vdvt', 'VD/VT', '', 2, 'VD/VT'], ['shunt', 'Shunt', '%', 0, 'Shunt']].map(([k, l, u, d, t]) => `<div class="num"><div class="nl"><button data-tag="${t}">${l}</button><span data-u="${u}">${uL(u)}</span></div><div class="nv" data-k="${k}" data-d="${d}" data-u="${u}">—</div></div>`).join('')}</div>
    <div class="abg-int"></div>
    <div class="row" style="margin-top:8px"><button class="btn sm" data-ss>${ic('refresh')}Steady state</button><button class="btn sm pri" data-abg>${ic('drop')}Take ABG</button>${tagBtn('ABG help', 'ABG')}</div>
    <div class="abg-list"></div>`;
  let last = 0;
  const list = () => {
    const L = $('.abg-list', body);
    L.innerHTML = S.abgs.length ? `<div class="sec-h">ABG log <button class="btn sm" data-clr style="margin-left:6px">clear</button></div><div class="abg-tbl"><div class="abg-r abg-h"><span>Time</span><span>Setting</span><span>pH</span><span>PaCO2 ${uL('mmHg')}</span><span>PaO2 ${uL('mmHg')}</span><span>HCO3</span><span>P/F</span></div>${S.abgs.map(a => `<div class="abg-r"><span>${new Date(a.t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span><span>${esc(a.set)}</span><span>${fmt(a.ph, 2)}</span><span>${fmtU(a.paco2, 'mmHg')}</span><span>${fmtU(a.pao2, 'mmHg')}</span><span>${fmt(a.hco3)}</span><span>${fmtU(a.pf, 'mmHg')}</span></div>`).join('')}</div>` : '';
  };
  body.addEventListener('click', e => {
    if (e.target.closest('[data-ss]')) { vent.snapGas(); toast('Jumped to steady state'); last = 0; }
    if (e.target.closest('[data-abg]')) {
      const M = vent.meas, s = vent.s; const set = s.mode === 'APRV' ? `APRV ${s.phigh}/${s.plow} FiO2 ${s.fio2}` : `${s.mode} RR${s.rr} Vt${s.vt} PEEP${s.peep} FiO2 ${s.fio2}`;
      S.abgs.unshift({ t: Date.now(), set, ph: M.ph, paco2: M.paco2, pao2: M.pao2, hco3: M.hco3, pf: M.pf }); S.abgs = S.abgs.slice(0, 20); save(); list(); toast('ABG recorded');
    }
    if (e.target.closest('[data-clr]')) { S.abgs = []; save(); list(); }
  });
  list(); on('units', list);
  return {
    frame(now) {
      if (now - last < 500) return; last = now;
      const M = vent.meas, L = vent.lim; const sp = M.spo2;
      const rg = $('.rg', body), C = 2 * Math.PI * 50, frac = clamp((sp - 60) / 40, 0, 1);
      rg.style.strokeDasharray = `${C * frac} ${C}`; rg.style.stroke = sp < L.spo2Low ? COL.danger : sp < 93 ? COL.warn : COL.f;
      $('.ring-v b', body).textContent = fmt(sp); $('.ring-v b', body).style.color = rg.style.stroke;
      $$('[data-k]', body).forEach(x => { const k = x.dataset.k, d = +(x.dataset.d || 0); x.textContent = k === 'va' ? fmt(M.va, 1) : x.dataset.u ? fmtU(M[k], x.dataset.u, d) : fmt(M[k], d); });
      $$('span[data-u]', body).forEach(x => { x.textContent = uL(x.dataset.u); });
      const fio2 = vent.isOpen() ? 0.21 : vent.fio2Delivered();
      $('.abg-int', body).innerHTML = interpretABG(M, fio2).map(x => `<div>• ${x}</div>`).join('');
    }
  };
};

CARDS.settings = (body) => {
  const render = () => {
    const m = vent.s.mode, md = VMODES[m], mc = MC(), gen = S.machine === 'generic' || !mc.has;
    const list = Object.keys(VMODES).filter(k => k === m || (k !== 'MASK' && (gen || mc.has.includes(k))));
    const keys = MODE_SETTINGS[m].map(k => (k === 'ti' && mc.vmax && md.type === 'vc') ? 'vmax' : k);
    body.innerHTML = `<div class="mach-row"><span class="hint">${ic('sliders')} Machine</span><select class="inp" data-mach>${Object.entries(MACHINES).map(([k, x]) => `<option value="${k}" ${k === (S.machine || 'generic') ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select>${tagBtn('?', 'topic:machines')}</div>
      <div class="modes">${list.map(k => `<button class="mode-btn ${k === m ? 'on' : ''}" data-m="${k}" title="${esc(VMODES[k].full)}">${esc(gen ? VMODES[k].name : machMode(k))}</button>`).join('')}</div>
      <div class="mode-desc">${gen ? '' : `<b>${esc(mc.short)}: ${esc(machMode(m))}</b> · `}${esc(md.full)} · ${tagBtn('About this mode', modeTag(m))}${MODE_DOC[m] ? ' ' + tagBtn('Machine guide', 'topic:' + MODE_DOC[m]) : ''} <button class="btn sm" data-wiz style="margin-left:4px">${ic('wand')}Setup wizard</button></div><div class="ctl-grid"></div><div class="derived"></div>
      ${m === 'APRV' ? '' : `<details class="adv"><summary>Advanced settings ${tagBtn('?', 'Advanced settings')}</summary><div class="ctl-grid adv-grid"></div></details>`}`;
    const g = $('.ctl-grid', body);
    keys.forEach(k => {
      if (k === 'vmax') { g.appendChild(makeCtl(vent.s, 'ti', () => { ventChanged(); derived(); }, vmaxSpec())); return; }
      if (k === 'flowPattern') {
        const e = el(`<div class="ctl"><div class="ctl-top"><span class="ctl-name">${tagBtn(mc.set.flowPattern || 'Flow pattern', 'topic:ms_flowpat')}</span></div><div class="seg" style="margin-top:8px"><button data-fp="square">Square</button><button data-fp="decel">${mc.riseAsPct ? 'Descending ramp' : 'Decelerating'}</button></div></div>`);
        const sy = () => $$('[data-fp]', e).forEach(b => b.classList.toggle('on', b.dataset.fp === vent.s.flowPattern));
        e.addEventListener('click', ev => { const b = ev.target.closest('[data-fp]'); if (b) { vent.s.flowPattern = b.dataset.fp; sy(); ventChanged(); } }); sy(); g.appendChild(e); return;
      }
      if (k === 'trigger') {
        const e = el(`<div class="ctl"><div class="ctl-top"><span class="ctl-name">${tagBtn(mc.set.trigger || 'Trigger', 'topic:ms_trigtype')}</span><div class="seg"><button data-tt="flow">${mc.riseAsPct ? 'V-TRIG' : 'Flow'}</button><button data-tt="pressure">${mc.riseAsPct ? 'P-TRIG' : 'Pressure'}</button></div></div><div class="tslot"></div></div>`);
        const fill = () => {
          $$('[data-tt]', e).forEach(b => b.classList.toggle('on', b.dataset.tt === vent.s.trigType));
          const slot = $('.tslot', e); slot.innerHTML = ''; const c = makeCtl(vent.s, vent.s.trigType === 'flow' ? 'trigFlow' : 'trigP', () => ventChanged());
          c.style.cssText = 'padding:6px 0 0;background:none;border:0'; const tk = vent.s.trigType === 'flow' ? 'trigFlow' : 'trigP'; $('.ctl-name', c).innerHTML = (mc.set[tk] ? tagBtn(mc.set[tk], 'topic:' + DOC_BY_KEY[tk]) + ' ' : '') + '<span class="hint">sensitivity</span>'; slot.appendChild(c);
        };
        e.addEventListener('click', ev => { const b = ev.target.closest('[data-tt]'); if (b) { vent.s.trigType = b.dataset.tt; fill(); ventChanged(); } }); fill(); g.appendChild(e); return;
      }
      g.appendChild(makeCtl(vent.s, k, () => { ventChanged(); derived(); if (k === 'peep' && mc.pinspAbs) render(); }));
    });
    const ag = $('.adv-grid', body);
    if (ag) {
      const ty = md.type;
      const keys = [];
      if (ty !== 'ps' && !['pb840', 'pb980', 'ge'].includes(S.machine)) keys.push('sighEvery');
      if ((ty === 'ps' || md.name.startsWith('SIMV')) && !md.hfnc) keys.push('maxTi');
      if ((ty === 'ps' || md.name.startsWith('SIMV')) && !md.hfnc && !md.niv && !md.tc && !md.pav) keys.push('atc');
      keys.forEach(k => ag.appendChild(makeCtl(vent.s, k, () => ventChanged())));
      if (keys.includes('atc') || md.tc || md.pav) {
        const e = el(`<div class="ctl"><div class="ctl-top"><span class="ctl-name">${tagBtn('ETT size', 'ATC')}</span><div class="seg">${Object.keys(ETT_R).map(z => `<button data-ett="${z}" class="${+z === +vent.s.ett ? 'on' : ''}">${z}</button>`).join('')}</div></div><div class="hint" style="margin-top:6px">Tube resistance ≈ ${ETT_R[vent.s.ett]} cmH2O/L/s</div></div>`);
        e.addEventListener('click', ev => { const b = ev.target.closest('[data-ett]'); if (b) { vent.s.ett = +b.dataset.ett; ventChanged(true); } }); ag.appendChild(e);
      }
      const lc = el(`<div class="ctl"><div class="ctl-top"><span class="ctl-name">${tagBtn('Leak compensation', 'Leak compensation')}</span><button class="sw ${vent.s.leakComp ? 'on' : ''}" data-lc></button></div><div class="hint" style="margin-top:6px">Off → leaks can auto-trigger</div></div>`);
      lc.addEventListener('click', ev => { if (ev.target.closest('[data-lc]')) { vent.s.leakComp = !vent.s.leakComp; ventChanged(true); } }); ag.appendChild(lc);
      if (!vent.noTube()) {
        const hu = el(`<div class="ctl"><div class="ctl-top"><span class="ctl-name">${tagBtn(mc.set.humid || 'Humidification type', 'topic:ms_humid')}</span><div class="seg"><button data-hu="heated">Heated humidifier</button><button data-hu="hme">HME</button></div></div><div class="hint" style="margin-top:6px">HME adds ≈ 50 ml dead space + a little resistance</div></div>`);
        const sy = () => $$('[data-hu]', hu).forEach(b => b.classList.toggle('on', b.dataset.hu === (vent.s.humid || 'heated'))); sy();
        hu.addEventListener('click', ev => { const b = ev.target.closest('[data-hu]'); if (b) { vent.s.humid = b.dataset.hu; sy(); ventChanged(); } }); ag.appendChild(hu);
      }
    }
    derived();
  };
  const derived = () => {
    const s = vent.s, m = VMODES[s.mode], d = $('.derived', body); if (!d) return;
    if (m.type === 'aprv') { const T = s.thigh + s.tlow; d.innerHTML = `Release rate <b>${fmt(60 / T, 1)}</b>/min · Thigh:Tlow <b>${fmt(s.thigh / s.tlow, 1)}:1</b>`; return; }
    const vk = ` · Vt <b>${fmt(s.vt / vent.p.ibw, 1)}</b> ml/kg PBW (PBW ${fmt(vent.p.ibw)} kg)`;
    if (m.mask) { const M = vent.meas; d.innerHTML = `Extubated – simple face mask, no PEEP · delivered FiO2 ≈ <b>${fmt(M.fio2Del)}</b>% (falls when the patient breathes fast) · ${tagBtn('Extubation', 'topic:extubation')}`; return; }
    if (m.pav) { const M = vent.meas; d.innerHTML = `Pressure follows the patient's effort · WOB<sub>PT</sub> <b>${fmt(M.wob, 2)}</b> J/L (target 0.3–0.7) · CPAV <b>${fmtU(M.cpav, 'ml/cmH2O', 0)}</b> · RPAV <b>${fmtU(M.rpav, 'cmH2O/L/s', 1)}</b>`; return; }
    if (m.tc) { d.innerHTML = `Spontaneous; only the tube resistance is compensated (${vent.s.atc || 100}% of ETT ${vent.s.ett} mm)`; return; }
    if (m.hfnc) { const M = vent.meas; d.innerHTML = `Not a ventilator mode: oxygen therapy via nasal cannula · estimated PEEP <b>${fmt(s.hfFlow * 0.07, 1)}</b> cmH2O · delivered FiO2 <b>${fmt(M.fio2Del)}</b>% · ROX <b>${fmt(M.rox, 1)}</b>`; return; }
    if (m.niv) { d.innerHTML = `Pressure support = IPAP − EPAP = <b>${s.ipap - s.peep}</b> cmH2O · backup ${s.backupRR}/min · mask leak present`; return; }
    if (m.vs) { d.innerHTML = `Spontaneous; support adjusts to reach the target Vt${vk}`; return; }
    if (m.type === 'ps') { d.innerHTML = `Spontaneous mode – no set rate. Patient must breathe (set effort in Patient card).`; return; }
    const T = 60 / s.rr, te = T - s.ti; let x = (MC().vmax && m.type === 'vc' ? `TI <b>${fmt(s.ti, 2)}s</b> · ` : '') + `Cycle <b>${fmt(T, 2)}s</b> · Te <b>${fmt(te, 2)}s</b> · I:E <b>${te > 0 ? '1:' + fmt(te / s.ti, 1) : 'invalid'}</b>`;
    if (m.type === 'vc' || m.type === 'prvc') x += vk;
    if (m.type === 'vc') { const tf = Math.max(0.2, s.ti - s.pause); const q = s.flowPattern === 'decel' ? 2 * s.vt / 1000 / (1.25 * tf) : s.vt / 1000 / tf; x += ` · Peak flow <b>${fmt(q * 60, 0)}</b> L/min`; }
    if (te < 0.3) x += ` · <span style="color:var(--danger)">Ti too long for this RR</span>`;
    d.innerHTML = x;
  };
  body.addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (b) { setMode(b.dataset.m); } if (e.target.closest('[data-wiz]')) openWizard(); });
  body.addEventListener('change', e => { if (e.target.matches('[data-mach]')) { S.machine = e.target.value; save(); emit('machine'); render(); toast(MC().name + ' labels'); } });
  on('vent', full => { if (full) render(); });
  on('units', render);
  render();
  return {};
};
function modeTag(m) { return { 'VC-AC': 'topic:vc', 'PC-AC': 'topic:pc', PRVC: 'topic:prvc', 'SIMV-VC': 'topic:simv', 'SIMV-PC': 'topic:simv', PSV: 'topic:psv', CPAP: 'topic:cpap', APRV: 'topic:aprv', VS: 'topic:vsniv', NIV: 'topic:vsniv', HFNC: 'topic:hfnc', PAV: 'topic:pav', TC: 'topic:advset', MASK: 'topic:extubation' }[m]; }

const FLAG_NAMES = {
  lip: 'Lower inflection (derecruitment)', uip: 'Upper inflection (overdistension)', leak: 'Cuff leak', bpf: 'Bronchopleural fistula', disconnect: 'Disconnection',
  secretions: 'Secretions', water: 'Water in circuit', cardiac: 'Cardiac oscillations', reverse: 'Reverse triggering', activeExp: 'Active expiration',
  ptx: 'Pneumothorax', mainstem: 'Mainstem intubation', plug: 'Mucus plug', kink: 'Kinked tube', hiccup: 'Hiccups', eso: 'Oesophageal intubation', lowCO: 'Low cardiac output'
};
CARDS.patient = (body) => {
  const render = () => {
    const f = vent.f, active = Object.keys(f).filter(k => f[k]);
    const sc = S.scenario ? getAbn(S.scenario) : null;
    body.innerHTML = `<label class="lbl" style="margin-top:0">Lung presets</label><div class="row">${PRESETS.map(p => `<button class="chip sm" data-pre="${p.id}">${esc(p.name)}</button>`).join('')}</div>
      <label class="lbl">Sedation & drive ${tagBtn('?', 'Respiratory drive')}</label>
      <div class="ctl"><div class="ctl-top"><span class="ctl-name">${tagBtn('RASS (sedation level)', 'RASS')}</span><span class="hint" data-drv></span></div>
        <div class="seg rass" style="margin-top:8px;flex-wrap:wrap">${[-5, -4, -3, -2, -1, 0, 1, 2].map(r => `<button data-rass="${r}" class="${vent.p.rass === r ? 'on' : ''}">${r > 0 ? '+' + r : r}</button>`).join('')}</div>
        <div class="toggle" style="border:0;padding-bottom:0"><span class="small">Patient responds to CO2 / O2 (auto drive) ${tagBtn('?', 'Chemoreflex')}</span><button class="sw ${vent.p.autoDrive ? 'on' : ''}" data-auto></button></div></div>
      <label class="lbl">Mechanics & effort</label><div class="ctl-grid mech"></div>
      <label class="lbl">Gas exchange, circulation & chest wall ${tagBtn('?', 'Oxygenation vs ventilation')}</label><div class="ctl-grid gx"></div>
      <label class="lbl">Active problems ${sc ? `· <span style="color:var(--accent)">scenario: ${esc(sc.name)}</span>` : ''}</label>
      <div class="row">${active.length ? active.map(k => `<button class="chip sm on" data-rm="${k}">${esc(FLAG_NAMES[k] || k)} ✕</button>`).join('') : '<span class="hint">None – healthy circuit & airway</span>'}</div>
      <div class="row" style="margin-top:8px"><select class="inp" style="flex:1;min-width:160px" data-add><option value="">+ Add a problem…</option>${Object.keys(FLAG_NAMES).filter(k => !f[k]).map(k => `<option value="${k}">${esc(FLAG_NAMES[k])}</option>`).join('')}</select>
      <button class="btn sm" data-clear>${ic('refresh')}Clear problems</button><button class="btn sm danger" data-reset>${ic('trash')}Reset all</button></div>`;
    const g = $('.ctl-grid.mech', body), gx = $('.ctl-grid.gx', body);
    ['C', 'Ri', 'Re', 'effort', 'prr', 'nti'].forEach(k => g.appendChild(makeCtl(vent.p, k, () => ventChanged())));
    ['shunt', 'deadAlv', 'recruit', 'vco2', 'hco3', 'hb', 'hypovol', 'cwFrac', 'pes0'].forEach(k => gx.appendChild(makeCtl(vent.p, k, () => { vent.gasTargets(false); ventChanged(); })));
  };
  body.addEventListener('click', e => {
    const pre = e.target.closest('[data-pre]'), rm = e.target.closest('[data-rm]');
    if (pre) { const p = PRESETS.find(x => x.id === pre.dataset.pre); Object.assign(vent.p, PATIENT_DEFAULTS, p.p); if (p.s) Object.assign(vent.s, p.s); S.scenario = null; ventChanged(true); toast(p.name); }
    if (rm) { delete vent.f[rm.dataset.rm]; ventChanged(true); }
    if (e.target.closest('[data-clear]')) { vent.f = {}; S.scenario = null; ventChanged(true); }
    const rs = e.target.closest('[data-rass]'); if (rs) { vent.p.rass = +rs.dataset.rass; vent.driveTargets(false); ventChanged(true); }
    if (e.target.closest('[data-auto]')) { vent.p.autoDrive = vent.p.autoDrive ? 0 : 1; ventChanged(true); }
    if (e.target.closest('[data-reset]')) { vent.loadState({}, {}, {}); vent.lim = Object.assign({}, ALARM_DEFAULTS, S.alarmLimits); S.scenario = null; ventChanged(true); toast('Ventilator reset'); }
  });
  body.addEventListener('change', e => { const a = e.target.closest('[data-add]'); if (a && a.value) { vent.f[a.value] = 1; ventChanged(true); } });
  on('vent', full => { if (full) render(); });
  render(); let lastD = 0;
  return {
    frame(now) {
      if (now - lastD < 600) return; lastD = now;
      const d = vent.drv, x = $('[data-drv]', body); if (!x) return;
      x.innerHTML = `now: effort <b>${fmt(d.effort, 1)}</b> · RR <b>${fmt(d.prr)}</b>${d.nmb > 0.1 ? ` · <span style="color:var(--danger)">NMB ${fmt(d.nmb * 100)}%</span>` : ''}${Math.round(d.rass) !== vent.p.rass ? ` · RASS ${fmt(d.rass)}` : ''}`;
    }
  };
};

CARDS.abnormal = (body, card) => {
  let cat = 'All', sel = null, q = '';
  const cats = ['All'].concat([...new Set(ABNORMALITIES.map(a => a.cat))]);
  const render = () => {
    if (sel) return renderDetail();
    const list = allAbn().filter(a => (cat === 'All' || a.cat === cat) && (!q || norm(a.name + ' ' + a.cat + ' ' + (a.tags || []).join(' ')).includes(norm(q))));
    body.innerHTML = `<div class="search-in"><input class="inp" placeholder="Search abnormalities…" value="${esc(q)}"></div>
      <div class="row" style="margin-bottom:8px">${cats.map(c => `<button class="chip sm ${c === cat ? 'on' : ''}" data-cat="${c}">${c}</button>`).join('')}</div>
      <div class="list">${list.map(a => `<button class="li ${S.scenario === a.id ? 'on' : ''}" data-ab="${a.id}">${S.scenario === a.id ? '<span class="dot"></span>' : ''}<span class="t">${esc(a.name)}<small>${esc((a.see || [])[0] || '')}</small></span><span class="k">${a.cat}</span></button>`).join('') || '<div class="empty">No match</div>'}</div>`;
    const inp = $('input', body); inp.addEventListener('input', () => { q = inp.value; const pos = inp.selectionStart; render(); const i2 = $('input', body); i2.focus(); i2.setSelectionRange(pos, pos); });
  };
  const renderDetail = () => {
    const a = getAbn(sel); const hasFlags = Object.keys(a.f || {}).length > 0;
    body.innerHTML = `<div class="row" style="margin-bottom:8px"><button class="btn sm" data-back>${ic('back')}All</button><span class="chip sm">${a.cat}</span>${a.edited ? '<span class="hint">edited</span>' : ''}</div>
      <h3 style="margin-bottom:8px">${esc(a.name)}</h3>
      <div class="row" style="margin-bottom:10px"><button class="btn pri sm" data-load>${ic('play')}Load scenario</button>${hasFlags ? `<button class="btn sm" data-add>${ic('plus')}Add on top</button>` : ''}
        <button class="btn sm" data-edit>${ic('edit')}Edit</button><button class="btn sm" data-note>${ic('note')}Note</button></div>
      <div class="rich"><div class="sec-h">What you see</div><ul>${(a.see || []).map(x => `<li>${inline(x, true)}</li>`).join('')}</ul>
      <div class="sec-h">Why</div><p>${inline(a.why || '', true)}</p>
      <div class="sec-h">How to fix</div><ul>${(a.fix || []).map(x => `<li>${inline(x, true)}</li>`).join('')}</ul>
      <div class="sec-h">Tags</div><div class="row">${(a.tags || []).map(t => tagBtn(t)).join('')}</div></div>
      ${notesFor('abn', a.id)}`;
  };
  body.addEventListener('click', e => {
    const t = e.target;
    if (t.closest('[data-cat]')) { cat = t.closest('[data-cat]').dataset.cat; render(); return; }
    if (t.closest('[data-ab]')) { sel = t.closest('[data-ab]').dataset.ab; render(); body.scrollTop = 0; return; }
    if (t.closest('[data-back]')) { sel = null; render(); return; }
    const a = sel && getAbn(sel); if (!a) return;
    if (t.closest('[data-load]')) { loadScenario(a, a.name, a.id); render(); }
    if (t.closest('[data-add]')) { Object.assign(vent.f, a.f); ventChanged(true); toast('Added: ' + a.name); }
    if (t.closest('[data-edit]')) openSheet('Edit: ' + a.name, b => editAbn(b, a.id, () => render()));
    if (t.closest('[data-note]')) openNoteEditor(null, { type: 'abn', id: a.id, label: a.name }, () => render());
  });
  on('vent', () => { if (!sel) render(); });
  on('notes', () => render());
  render();
  return { open(id) { sel = id; render(); } };
};

CARDS.alarms = (body) => {
  let last = 0;
  body.innerHTML = `<div class="al-list"></div><div class="divider"></div><label class="lbl" style="margin-top:0">Alarm limits ${tagBtn('help', 'Alarms')}</label><div class="lim-grid"></div>`;
  const lims = [['pHigh', 'Ppeak high'], ['pLow', 'Ppeak low'], ['vteLow', 'Vte low (ml)'], ['mvLow', 'MVe low'], ['mvHigh', 'MVe high'], ['rrHigh', 'RR high'], ['leakHigh', 'Leak high %'], ['spo2Low', 'SpO2 low %'], ['etco2High', 'EtCO2 high'], ['etco2Low', 'EtCO2 low'], ['mapLow', 'MAP low'], ['hrHigh', 'HR high']];
  $('.lim-grid', body).innerHTML = lims.map(([k, l]) => `<div><label>${l}</label><input type="number" data-lim="${k}" value="${vent.lim[k]}"></div>`).join('');
  body.addEventListener('change', e => { const i = e.target.closest('[data-lim]'); if (i) { vent.lim[i.dataset.lim] = Number(i.value); S.alarmLimits = Object.assign({}, vent.lim); save(); } });
  return {
    frame(now) {
      if (now - last < 500) return; last = now;
      const L = $('.al-list', body), a = vent.alarms.slice().sort((x, y) => ({ high: 0, med: 1, low: 2 }[x.pri] - { high: 0, med: 1, low: 2 }[y.pri]));
      L.innerHTML = a.length ? a.map(x => `<div class="al ${x.pri}">${ic('alert')}<span>${esc(x.msg)}</span></div>`).join('') : `<div class="al-ok">${ic('check')}No active alarms</div>`;
      $$('.al svg, .al-ok svg', L).forEach(s => { s.style.width = '16px'; s.style.height = '16px'; s.style.flex = 'none'; });
    }
  };
};

CARDS.trends = (body) => {
  const items = [['spo2', 'SpO2', 'f'], ['paco2', 'PaCO2', 'v'], ['etco2', 'EtCO2', 'accent2'], ['map', 'MAP', 'p'], ['hr', 'HR', 'f'], ['ppeak', 'Ppeak', 'p'], ['vte', 'Vte', 'v'], ['rr', 'RR', 'f'], ['mve', 'MVe', 'f'], ['pmean', 'Pmean', 'p'], ['peepi', 'PEEPi (true)', 'v']];
  body.innerHTML = `<div class="trend-grid">${items.map(([k, l]) => `<div class="trend"><div class="tl"><span>${l}</span><b data-v="${k}">—</b></div><canvas data-k="${k}"></canvas></div>`).join('')}</div>`;
  const sts = {}; $$('canvas', body).forEach(c => sts[c.dataset.k] = setupCanvas(c));
  let last = 0;
  return {
    frame(now) {
      if (now - last < 1000) return; last = now;
      const tr = vent.trend || [];
      items.forEach(([k, l, c]) => {
        const st = sts[k], { ctx, W, H } = st; if (!W) return; ctx.clearRect(0, 0, W, H);
        const tu = { paco2: 'mmHg', etco2: 'mmHg', ppeak: 'cmH2O', pmean: 'cmH2O', peepi: 'cmH2O' }[k];
        const vals = tr.map(x => x[k]).filter(x => x != null && isFinite(x)).map(x => tu ? cv(x, tu) : x);
        $(`[data-v="${k}"]`, body).textContent = vals.length ? fmt(vals[vals.length - 1], uD(k === 'mve' || k === 'pmean' || k === 'peepi' ? 1 : 0, tu)) + (tu ? ' ' + uL(tu) : '') : '—';
        if (vals.length < 2) return;
        let mn = Math.min(...vals), mx = Math.max(...vals); if (mx - mn < 1e-3) { mx += 1; mn -= 1; }
        const col = COL[c]; ctx.beginPath();
        vals.forEach((v, i) => { const x = i / (vals.length - 1) * W, y = H - 4 - (v - mn) / (mx - mn) * (H - 8); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
        ctx.strokeStyle = col; ctx.lineWidth = 1.8; ctx.stroke();
        ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, hexA(col, .3)); g.addColorStop(1, hexA(col, 0)); ctx.fillStyle = g; ctx.fill();
      });
    }
  };
};

CARDS.inside = (body) => {
  body.classList.add('flush', 'inside');
  body.innerHTML = `<svg viewBox="0 0 640 300" preserveAspectRatio="xMidYMid meet">
  <defs><radialGradient id="lg" cx="50%" cy="40%"><stop offset="0" stop-color="var(--p)" stop-opacity=".55"/><stop offset="1" stop-color="var(--p)" stop-opacity=".12"/></radialGradient>
  <filter id="gl"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  <rect class="box" x="18" y="30" width="48" height="62" rx="12"/><text x="42" y="66" text-anchor="middle" font-weight="800" font-size="14">O₂</text>
  <rect class="box" x="18" y="112" width="48" height="62" rx="12"/><text x="42" y="148" text-anchor="middle" font-weight="800" font-size="13">Air</text>
  <path class="pipe" d="M66 61H112M66 143H90V112H112"/>
  <rect class="box" x="112" y="70" width="88" height="58" rx="12"/><text x="156" y="94" text-anchor="middle" font-weight="700" font-size="12">Blender</text><text id="xFio" x="156" y="113" text-anchor="middle" class="lbl2">FiO₂ 40%</text>
  <path class="pipe" d="M200 99H252"/><path class="pipe" id="pIns" d="M298 99H430V140"/><path class="pipe" d="M430 160V214H298"/><path class="pipe" d="M252 214H200M168 214H70"/>
  <path class="gas" id="gIns" stroke="var(--accent)" d="M66 61H112M200 99H252M298 99H430V150"/>
  <path class="gas" id="gExp" stroke="var(--f)" d="M430 150V214H298M252 214H200M168 214H60"/>
  <g id="iv"><circle cx="275" cy="99" r="23" class="box"/><rect id="ivg" x="262" y="96" width="26" height="6" rx="3" fill="var(--muted)"/></g>
  <text x="275" y="140" text-anchor="middle" class="lbl2">Insp valve</text>
  <g id="ev"><circle cx="275" cy="214" r="23" class="box"/><rect id="evg" x="262" y="211" width="26" height="6" rx="3" fill="var(--muted)"/></g>
  <text x="275" y="255" text-anchor="middle" class="lbl2">Exp valve (PEEP)</text>
  <rect class="box" x="168" y="200" width="32" height="28" rx="7"/><text x="184" y="243" text-anchor="middle" class="lbl2">Flow sensor</text>
  <text x="58" y="207" text-anchor="end" class="lbl2">Exhaust</text>
  <rect class="box" x="112" y="248" width="88" height="40" rx="10"/><text x="156" y="273" text-anchor="middle" font-weight="700" font-size="11">CPU</text>
  <path d="M156 248V230M200 268H275V237M200 258H252V122" fill="none" stroke="var(--border)" stroke-dasharray="3 4"/>
  <circle cx="430" cy="150" r="9" class="box"/><text x="452" y="137" class="lbl2">Y-piece</text>
  <g id="disc" opacity="0"><path d="M420 140l20 20M440 140l-20 20" stroke="var(--danger)" stroke-width="4" stroke-linecap="round"/></g>
  <g id="leakg" opacity="0"><circle cx="455" cy="168" r="4" fill="var(--f)"/><circle cx="466" cy="176" r="3" fill="var(--f)"/><circle cx="474" cy="186" r="2" fill="var(--f)"/><text x="480" y="196" class="lbl2">leak</text></g>
  <path class="pipe" d="M439 150H500" style="stroke-width:8"/>
  <path d="M500 150V120" stroke="var(--muted)" stroke-width="6" stroke-linecap="round"/>
  <g id="lungs" transform="translate(545 150)"><ellipse id="lL" cx="-30" cy="0" rx="26" ry="44" fill="url(#lg)" stroke="var(--p)" stroke-width="2" filter="url(#gl)"/><ellipse id="lR" cx="30" cy="0" rx="26" ry="44" fill="url(#lg)" stroke="var(--p)" stroke-width="2" filter="url(#gl)"/>
  <path d="M-45 0V-48M0 -60V-20M-30 -20H30" stroke="var(--muted)" stroke-width="3" fill="none" stroke-linecap="round" opacity=".5"/></g>
  <path id="dia" d="M495 215Q545 195 595 215" fill="none" stroke="var(--accent2)" stroke-width="3" stroke-linecap="round"/><text x="600" y="232" text-anchor="end" class="lbl2">diaphragm</text>
  <g transform="translate(370 46)"><circle r="32" class="box"/><path d="M-24 18A30 30 0 1 1 24 18" fill="none" stroke="var(--border)" stroke-width="4"/>
  <line id="needle" x1="0" y1="0" x2="0" y2="-24" stroke="var(--p)" stroke-width="3" stroke-linecap="round"/><circle r="4" fill="var(--p)"/><text id="gv" y="22" text-anchor="middle" font-size="11" font-weight="800">0</text></g>
  <text x="370" y="94" text-anchor="middle" class="lbl2">Paw cmH₂O</text>
  <text id="phTxt" x="545" y="40" text-anchor="middle" font-weight="800" font-size="13">—</text><text id="phSub" x="545" y="58" text-anchor="middle" class="lbl2"></text>
  <text id="vTxt" x="545" y="272" text-anchor="middle" class="lbl2"></text>
  </svg>`;
  const q = id => $('#' + id, body);
  const gI = q('gIns'), gE = q('gExp'), ivg = q('ivg'), evg = q('evg'), lL = q('lL'), lR = q('lR'), nd = q('needle'), gv = q('gv'), ph = q('phTxt'), phs = q('phSub'), dia = q('dia'), vT = q('vTxt');
  let oi = 0, oe = 0, lastT = performance.now();
  return {
    frame(now) {
      const dt = Math.min(.05, (now - lastT) / 1000); lastT = now;
      const insp = vent.phase === 'insp', exp = vent.phase === 'exp', hold = /hold|pause/.test(vent.phase);
      const fl = vent.Qd * 60;
      if (running) { oi -= Math.max(0, fl) * dt * 2.4; oe -= Math.max(0, -fl) * dt * 2.4; }
      gI.style.strokeDashoffset = oi; gE.style.strokeDashoffset = oe;
      gI.style.opacity = fl > 1 ? .95 : .12; gE.style.opacity = fl < -1 ? .95 : .12;
      const io = insp && !vent.f.disconnect ? 1 : insp ? 1 : 0;
      ivg.setAttribute('transform', `rotate(${io ? 90 : 0} 275 99)`); ivg.setAttribute('fill', io ? 'var(--accent)' : 'var(--muted)');
      const eo = exp ? 1 : 0;
      evg.setAttribute('transform', `rotate(${eo ? 90 : 0} 275 214)`); evg.setAttribute('fill', eo ? 'var(--f)' : 'var(--muted)');
      const vol = Math.max(0, vent.V); const k = 0.85 + vol * 0.55;
      lL.setAttribute('rx', 26 * Math.sqrt(k)); lR.setAttribute('rx', 26 * Math.sqrt(k)); lL.setAttribute('ry', 44 * k); lR.setAttribute('ry', 44 * k);
      const pm = vent.pmus; dia.setAttribute('d', `M495 ${215 + pm * 0.6}Q545 ${195 + pm * 2.4} 595 ${215 + pm * 0.6}`);
      const P = vent.Paw; nd.setAttribute('transform', `rotate(${clamp(-130 + P / 50 * 260, -130, 130)})`); gv.textContent = fmt(P, 0);
      q('xFio').textContent = 'FiO₂ ' + vent.s.fio2 + '%';
      q('disc').setAttribute('opacity', vent.f.disconnect ? 1 : 0); q('leakg').setAttribute('opacity', (vent.f.leak || vent.f.bpf) && fl > 2 ? 1 : 0);
      const bt = { M: 'mandatory', A: 'patient-triggered', S: 'spontaneous (PS)' }[vent.breathType] || '';
      if (vent.phase === 'rm') { ph.textContent = 'RECRUITMENT MANOEUVRE'; phs.textContent = 'sustained high pressure'; }
      else if (vent.standby) { ph.textContent = 'STANDBY'; phs.textContent = 'no breaths delivered'; }
      else if (vent.phase === 'ihold') { ph.textContent = 'INSPIRATORY HOLD'; phs.textContent = 'both valves closed → Pplat'; }
      else if (vent.phase === 'ehold') { ph.textContent = 'EXPIRATORY HOLD'; phs.textContent = 'both valves closed → total PEEP'; }
      else if (vent.phase === 'pause') { ph.textContent = 'INSPIRATORY PAUSE'; phs.textContent = 'no flow, valves closed'; }
      else if (insp) { ph.textContent = 'INSPIRATION'; phs.textContent = (vent.s.mode === 'APRV' ? 'P high' : bt) + ' · insp valve open'; }
      else { ph.textContent = 'EXPIRATION'; phs.textContent = vent.s.mode === 'APRV' ? 'release to P low' : 'exp valve open, holding PEEP'; }
      vT.textContent = `Lung volume above FRC ${fmt(vent.V * 1000, 0)} ml · flow ${fmt(fl, 0)} L/min · Pmus ${fmt(pm, 1)}`;
    }
  };
};

CARDS.quiz = (body) => {
  let cur = null, answered = false, showEff = false;
  const qv = new Ventilator();
  const render = () => {
    body.classList.add('flush');
    body.innerHTML = `<div class="wf-layout" style="padding:0 6px"><div class="wf-tools" style="padding:0 0 6px"><span class="score">Score ${S.quiz.right}/${S.quiz.total}</span>
      <button class="btn sm" data-eff>${ic('user')}${showEff ? 'Hide' : 'Show'} effort</button><button class="btn sm pri" data-next>${ic('refresh')}New case</button>
      <button class="btn sm" data-reset style="margin-left:auto">Reset score</button></div>
      <div style="display:flex;gap:8px;flex:1;min-height:0;flex-wrap:wrap"><div class="cv-wrap" style="flex:2;min-width:240px;min-height:200px"><canvas data-c="w"></canvas></div><div class="cv-wrap" style="flex:1;min-width:180px;min-height:160px"><canvas data-c="l"></canvas></div></div>
      <div style="padding:6px 2px 4px"><div class="hint">Mode: <b>${cur ? cur.s.mode || 'VC-AC' : ''}</b>${cur ? ` · SpO2 <b>${fmt(qv.meas.spo2)}</b> · EtCO2 <b>${fmt(qv.meas.etco2)}</b> · pH <b>${fmt(qv.meas.ph, 2)}</b> · PaCO2 <b>${fmt(qv.meas.paco2)}</b> · PaO2 <b>${fmt(qv.meas.pao2)}</b> (FiO2 ${qv.s.fio2}%)` : ''} — what is the main abnormality?</div><div class="quiz-opts">${cur ? cur.opts.map(o => `<button class="quiz-opt" data-o="${o.id}">${esc(o.name)}</button>`).join('') : ''}</div><div class="qfb"></div></div></div>`;
    const sw = setupCanvas($('[data-c=w]', body)), sl = setupCanvas($('[data-c=l]', body));
    const draw = () => { drawScalars(sw, qv, { win: 8, sweep: false, scales: {}, pmus: showEff }); drawLoops(sl, qv, { scales: {} }); };
    requestAnimationFrame(draw); setTimeout(draw, 120);
    new ResizeObserver(draw).observe($('[data-c=w]', body));
  };
  const next = () => {
    const pool = allAbn(); const a = pool[Math.floor(Math.random() * pool.length)];
    const others = pool.filter(x => x.id !== a.id).sort(() => Math.random() - .5).slice(0, 3);
    qv.loadState(a.s, a.p, a.f); qv.runFor(14); qv.snapGas(); qv.runFor(2);
    cur = { a, s: a.s, opts: [a].concat(others).sort(() => Math.random() - .5) }; answered = false; render();
  };
  body.addEventListener('click', e => {
    const t = e.target;
    if (t.closest('[data-next]')) next();
    if (t.closest('[data-reset]')) { S.quiz = { right: 0, total: 0 }; save(); render(); }
    if (t.closest('[data-eff]')) { showEff = !showEff; render(); if (answered) feedback(); }
    const o = t.closest('[data-o]');
    if (o && !answered) {
      answered = true; const ok = o.dataset.o === cur.a.id; S.quiz.total++; if (ok) S.quiz.right++; save();
      $$('[data-o]', body).forEach(b => { if (b.dataset.o === cur.a.id) b.classList.add('right'); else if (b === o) b.classList.add('wrong'); });
      $('.score', body).textContent = `Score ${S.quiz.right}/${S.quiz.total}`; feedback(ok);
    }
    if (t.closest('[data-load]')) { loadScenario(cur.a, cur.a.name, cur.a.id); }
  });
  const feedback = ok => {
    const a = cur.a;
    $('.qfb', body).innerHTML = `<div class="rich" style="margin-top:8px">${ok === undefined ? '' : `<b style="color:${ok ? '#2ee59d' : 'var(--danger)'}">${ok ? 'Correct!' : 'Not quite.'}</b> `}It is <b>${esc(a.name)}</b>.
      <ul>${(a.see || []).map(x => `<li>${inline(x)}</li>`).join('')}</ul><p>${inline(a.why)}</p><button class="btn sm" data-load>${ic('play')}Load in simulator</button></div>`;
  };
  next();
  return {};
};

CARDS.learning = (body) => {
  let cat = 'All', q = '', view = 'topics';
  const render = () => {
    const L = LANG(), ts = allTopics(L); const cats = ['All'].concat([...new Set(ts.map(t => t.cat))]);
    const top = `<div class="row nowrap" style="margin-bottom:8px;gap:6px"><div class="seg"><button data-view="topics" class="${view === 'topics' ? 'on' : ''}">${L === 'bn' ? 'টপিক' : 'Topics'}</button><button data-view="gloss" class="${view === 'gloss' ? 'on' : ''}">${L === 'bn' ? 'শব্দার্থ' : 'Glossary'}</button></div><span style="flex:1"></span>${langSeg()}</div>`;
    if (view === 'gloss') {
      const list = GLOSSARY.filter(g => !q || norm(g.t + ' ' + (g.a || []).join(' ') + ' ' + g.en + ' ' + g.bn).includes(norm(q))).sort((a, b) => a.t.localeCompare(b.t));
      body.innerHTML = top + `<div class="search-in"><input class="inp" placeholder="${L === 'bn' ? `${GLOSSARY.length}টি শব্দ খোঁজো…` : `Search ${GLOSSARY.length} terms…`}" value="${esc(q)}"></div>
        <div class="list">${list.map(g => `<button class="li gl" data-g="${esc(g.t)}"><span class="t">${esc(g.t)}<small class="${L === 'bn' ? 'bn' : ''}">${esc(L === 'bn' ? g.bn : g.en)}</small></span></button>`).join('') || '<div class="empty">No match</div>'}</div>`;
    } else {
      const list = ts.filter(t => (cat === 'All' || t.cat === cat) && (!q || norm(t.title + ' ' + (t.tags || []).join(' ') + ' ' + t.body + ' ' + (getTopic(t.id) || {}).title).includes(norm(q))));
      body.innerHTML = top + `<div class="search-in row nowrap"><input class="inp" placeholder="${L === 'bn' ? `${ts.length}টি টপিক খোঁজো…` : `Search ${ts.length} topics…`}" value="${esc(q)}"><button class="ib" data-new title="New topic">${ic('plus')}</button></div>
        <div class="row" style="margin-bottom:8px">${cats.map(c => `<button class="chip sm ${c === cat ? 'on' : ''}" data-cat="${esc(c)}">${esc(L === 'bn' ? (CAT_BN[c] || (c === 'All' ? 'সব' : c)) : c)}</button>`).join('')}</div>
        <div class="list">${list.map(t => `<button class="li" data-t="${t.id}"><span class="t">${esc(t.title)}<small>${(t.tags || []).slice(0, 4).map(esc).join(' · ')}</small></span><span class="k">${esc(t.catLabel)}${t.edited || t.custom || t.editedBn ? ' ✎' : ''}</span></button>`).join('') || '<div class="empty">No topics</div>'}</div>`;
    }
    const inp = $('input', body); inp.addEventListener('input', () => { q = inp.value; const p = inp.selectionStart; render(); const i2 = $('input', body); i2.focus(); i2.setSelectionRange(p, p); });
  };
  body.addEventListener('click', e => {
    const v = e.target.closest('[data-view]'); if (v) { view = v.dataset.view; render(); return; }
    const c = e.target.closest('[data-cat]'); if (c) { cat = c.dataset.cat; render(); }
    const t = e.target.closest('[data-t]'); if (t) openTopic(t.dataset.t);
    const g = e.target.closest('[data-g]'); if (g) openTag(g.dataset.g);
    if (e.target.closest('[data-new]')) openSheet('New topic', b => editTopic(b, null, null, id => { closeSheet(); openTopic(id); }));
  });
  on('topics', render); on('lang', render);
  render();
  return {};
};

CARDS.tags = (body) => {
  let q = '';
  const render = () => {
    const L = LANG();
    const userTags = [...new Set(S.notes.flatMap(n => n.tags || []))].sort();
    const list = GLOSSARY.filter(g => !q || norm(g.t + ' ' + (g.a || []).join(' ')).includes(norm(q))).sort((a, b) => a.t.localeCompare(b.t));
    body.innerHTML = `<div class="row nowrap" style="margin-bottom:8px"><input class="inp" placeholder="${L === 'bn' ? 'শব্দ খোঁজো…' : 'Find a term…'}" value="${esc(q)}">${langSeg()}</div>
      <div class="hint" style="margin-bottom:8px">${L === 'bn' ? 'যেকোনো tag-এ চাপ দিলে তার অর্থ আর পুরো টপিক খুলবে। ◆ চিহ্নের tag তোমার note থেকে আসা।' : 'Tap any tag to see its meaning and full topic. Your own tags (◆) come from notes.'}</div>
      ${userTags.length ? `<label class="lbl" style="margin-top:0">${L === 'bn' ? 'আমার tag' : 'My tags'}</label><div class="cloud">${userTags.map(t => `<button class="tag utag" data-tagview="${esc(t)}">${esc(t)}</button>`).join('')}</div>` : ''}
      <label class="lbl">${L === 'bn' ? 'শব্দকোষ' : 'Glossary'} · ${list.length}</label><div class="cloud">${list.map(g => tagBtn(g.t)).join('')}</div>`;
    const inp = $('input', body); inp.addEventListener('input', () => { q = inp.value; const p = inp.selectionStart; render(); const i2 = $('input', body); i2.focus(); i2.setSelectionRange(p, p); });
  };
  on('notes', render); on('topics', render); on('lang', render);
  render();
  return {};
};

CARDS.notes = (body) => {
  let q = '', tg = null;
  const render = () => {
    const tags = [...new Set(S.notes.flatMap(n => n.tags || []))];
    const list = S.notes.filter(n => (!tg || (n.tags || []).includes(tg)) && (!q || norm(n.title + ' ' + n.body + ' ' + (n.tags || []).join(' ')).includes(norm(q)))).sort((a, b) => b.t - a.t);
    body.innerHTML = `<div class="search-in row nowrap"><input class="inp" placeholder="Search notes…" value="${esc(q)}"><button class="ib primary" data-new title="New note">${ic('plus')}</button></div>
      ${tags.length ? `<div class="row" style="margin-bottom:8px"><button class="chip sm ${!tg ? 'on' : ''}" data-tg="">All</button>${tags.map(t => `<button class="chip sm ${tg === t ? 'on' : ''}" data-tg="${esc(t)}">${esc(t)}</button>`).join('')}</div>` : ''}
      ${list.map(noteHTML).join('') || '<div class="empty">No notes yet. Every card, topic and abnormality has a notes button too.</div>'}`;
    const inp = $('input', body); inp.addEventListener('input', () => { q = inp.value; const p = inp.selectionStart; render(); const i2 = $('input', body); i2.focus(); i2.setSelectionRange(p, p); });
  };
  body.addEventListener('click', e => {
    if (e.target.closest('[data-new]')) openNoteEditor(null, null);
    const t = e.target.closest('[data-tg]'); if (t) { tg = t.dataset.tg || null; render(); }
  });
  on('notes', render);
  render();
  return {};
};

const CALCS = [
  { id: 'pbw', t: 'Predicted body weight & Vt', tag: 'PBW', f: [['h', 'Height (cm)', 170], ['sex', 'Sex', 'M', ['M', 'F']]],
    c: v => { const pbw = (v.sex === 'F' ? 45.5 : 50) + 0.91 * (v.h - 152.4); return `PBW <b>${fmt(pbw, 1)}</b> kg · Vt 4 ml/kg <b>${fmt(pbw * 4)}</b> · 6 ml/kg <b>${fmt(pbw * 6)}</b> · 8 ml/kg <b>${fmt(pbw * 8)}</b> ml <button class="btn sm" data-apply="${Math.round(pbw * 6 / 10) * 10}">Set Vt = 6 ml/kg</button>`; } },
  { id: 'mech', t: 'Compliance, ΔP, resistance', tag: 'Compliance', live: M => ({ vt: Math.round(M.vti), ppk: +fmt(M.ppeak, 1), ppl: M.pplat != null ? +fmt(M.pplat, 1) : 0, peep: +fmt(M.peepTot != null ? M.peepTot : M.peep, 1), fl: Math.round(M.qpk) }),
    f: [['vt', 'Vt (ml)', 450], ['ppk', 'Ppeak', 18], ['ppl', 'Pplat', 14], ['peep', 'PEEP total', 5], ['fl', 'Insp flow (L/min)', 27]],
    c: v => { const dp = v.ppl - v.peep; return `ΔP <b>${fmt(dp, 1)}</b> · Cstat <b>${fmt(v.vt / dp, 0)}</b> ml/cmH2O · Cdyn <b>${fmt(v.vt / (v.ppk - v.peep), 0)}</b> · Raw <b>${fmt((v.ppk - v.ppl) / (v.fl / 60), 1)}</b> cmH2O/L/s`; } },
  { id: 'mp', t: 'Mechanical power', tag: 'Mechanical power', live: M => ({ rr: M.rr, vt: Math.round(M.vti), ppk: +fmt(M.ppeak, 1), ppl: M.pplat != null ? +fmt(M.pplat, 1) : 0, peep: M.peep }),
    f: [['rr', 'RR', 16], ['vt', 'Vt (ml)', 450], ['ppk', 'Ppeak', 18], ['ppl', 'Pplat', 14], ['peep', 'PEEP', 5]],
    c: v => `MP <b>${fmt(0.098 * v.rr * v.vt / 1000 * (v.ppk - 0.5 * (v.ppl - v.peep)), 1)}</b> J/min` },
  { id: 'rsbi', t: 'RSBI (weaning)', tag: 'RSBI', live: M => ({ rr: M.rr, vt: Math.round(M.vte) }), f: [['rr', 'RR', 20], ['vt', 'Vt (ml)', 400]],
    c: v => { const r = v.rr / (v.vt / 1000); return `RSBI <b>${fmt(r)}</b> → ${r < 105 ? 'likely to succeed (<105)' : 'likely to fail (≥105)'}`; } },
  { id: 'pf', t: 'P/F ratio', tag: 'P/F ratio', f: [['pao2', 'PaO2 (mmHg)', 90], ['fio2', 'FiO2 (%)', 50]],
    c: v => { const r = v.pao2 / (v.fio2 / 100); return `P/F <b>${fmt(r)}</b> → ${r > 300 ? 'no ARDS range' : r > 200 ? 'mild' : r > 100 ? 'moderate' : 'severe'} (with PEEP ≥ 5)`; } },
  { id: 'co2', t: 'Target PaCO2 → new RR', tag: 'PaCO2', live: M => ({ rr: M.rr }), f: [['rr', 'Current RR', 16], ['pa', 'Current PaCO2', 55], ['tg', 'Target PaCO2', 40]],
    c: v => `New RR ≈ <b>${fmt(v.rr * v.pa / v.tg)}</b> /min (same Vt)` },
  { id: 'tau', t: 'Time constant & Te', tag: 'Time constant', live: () => ({ r: +fmt(vent.Re(), 0), c: +fmt(vent.Ceff() * 1000, 0), ti: vent.s.ti }), f: [['r', 'R (cmH2O/L/s)', 10], ['c', 'C (ml/cmH2O)', 50], ['ti', 'Ti (s)', 1]],
    c: v => { const t = v.r * v.c / 1000; return `τ <b>${fmt(t, 2)}</b> s · 3τ <b>${fmt(3 * t, 2)}</b> s · 5τ <b>${fmt(5 * t, 2)}</b> s · max RR for Te ≥ 3τ <b>${fmt(60 / (v.ti + 3 * t))}</b>/min`; } }
];
CARDS.calc = (body) => {
  body.innerHTML = CALCS.map(c => `<div class="calc" data-c="${c.id}"><h4><span>${esc(c.t)} ${tagBtn('?', c.tag)}</span>${c.live ? `<button class="btn sm" data-live>Use live</button>` : ''}</h4>
    <div class="cg">${c.f.map(([k, l, d, opts]) => `<div><label>${l}</label>${opts ? `<select data-k="${k}">${opts.map(o => `<option ${o === d ? 'selected' : ''}>${o}</option>`).join('')}</select>` : `<input type="number" data-k="${k}" value="${d}" step="any">`}</div>`).join('')}</div><div class="res"></div></div>`).join('');
  const calc = box => { const c = CALCS.find(x => x.id === box.dataset.c); const v = {}; $$('[data-k]', box).forEach(i => v[i.dataset.k] = i.tagName === 'SELECT' ? i.value : Number(i.value)); $('.res', box).innerHTML = c.c(v); };
  $$('.calc', body).forEach(calc);
  body.addEventListener('input', e => { const b = e.target.closest('.calc'); if (b) calc(b); });
  body.addEventListener('click', e => {
    const b = e.target.closest('.calc'); if (!b) return;
    if (e.target.closest('[data-live]')) { const c = CALCS.find(x => x.id === b.dataset.c); const v = c.live(vent.meas); Object.keys(v).forEach(k => { const i = $(`[data-k="${k}"]`, b); if (i && v[k] != null && isFinite(v[k])) i.value = v[k]; }); calc(b); }
    const ap = e.target.closest('[data-apply]'); if (ap) { vent.s.vt = Number(ap.dataset.apply); ventChanged(true); toast('Vt set to ' + ap.dataset.apply + ' ml'); }
  });
  return {};
};

CARDS.setups = (body) => {
  const render = () => {
    body.innerHTML = `<div class="row nowrap" style="margin-bottom:8px"><input class="inp" placeholder="Name this setup…"><button class="btn pri" data-save>${ic('save')}Save</button></div>
      <div class="list">${S.setups.map((x, i) => `<div class="li" data-i="${i}"><span class="t">${esc(x.name)}<small>${esc(x.s.mode)} · ${new Date(x.t).toLocaleDateString()}</small></span>
      <button class="ib sm" data-load title="Load">${ic('play')}</button><button class="ib sm" data-ren title="Rename">${ic('edit')}</button><button class="ib sm" data-del title="Delete">${ic('trash')}</button></div>`).join('') || '<div class="empty">Save the current mode, settings, lung and problems to reload them later.</div>'}</div>`;
  };
  body.addEventListener('click', e => {
    if (e.target.closest('[data-save]')) { const n = $('input', body).value.trim() || (vent.s.mode + ' setup ' + (S.setups.length + 1)); S.setups.unshift({ name: n, s: JSON.parse(JSON.stringify(vent.s)), p: JSON.parse(JSON.stringify(vent.p)), f: JSON.parse(JSON.stringify(vent.f)), t: Date.now() }); save(); render(); toast('Saved'); return; }
    const row = e.target.closest('[data-i]'); if (!row) return; const i = +row.dataset.i, x = S.setups[i];
    if (e.target.closest('[data-load]')) loadScenario(x, x.name, null);
    else if (e.target.closest('[data-ren]')) { dialog({ title: 'Rename setup', input: x.name, ok: 'Save' }).then(n => { if (n) { x.name = n; save(); render(); } }); }
    else if (e.target.closest('[data-del]')) { dialog({ title: 'Delete setup?', msg: x.name, ok: 'Delete', danger: true }).then(ok => { if (ok) { S.setups.splice(i, 1); save(); render(); } }); }
  });
  render();
  return {};
};

/* ================= notes ================= */
function noteHTML(n) {
  return `<div class="note" data-note="${n.id}"><h5>${esc(n.title || 'Untitled')}</h5><p>${esc(n.body)}</p>
    <div class="nm">${n.ctx ? `<span class="ctx">${esc(n.ctx.label)}</span>` : ''}${(n.tags || []).map(t => `<button class="tag utag" data-tagview="${esc(t)}">${esc(t)}</button>`).join('')}</div></div>`;
}
function notesFor(type, id) {
  const ns = S.notes.filter(n => n.ctx && n.ctx.type === type && n.ctx.id === id);
  return ns.length ? `<div class="sec-h">My notes</div>${ns.map(noteHTML).join('')}` : '';
}
function noteCount(type, id) { return S.notes.filter(n => n.ctx && n.ctx.type === type && n.ctx.id === id).length; }
function openNoteEditor(noteId, ctx, after) {
  const n = noteId ? S.notes.find(x => x.id === noteId) : { id: uid(), title: '', body: '', tags: [], ctx, t: Date.now() };
  openSheet(noteId ? 'Edit note' : 'New note', b => {
    let tags = (n.tags || []).slice();
    b.innerHTML = `${n.ctx ? `<div class="ctx" style="margin-bottom:6px">Linked to: ${esc(n.ctx.label)}</div>` : ''}<label class="lbl" style="margin-top:0">Title</label><input class="inp" data-f="title" value="${esc(n.title)}">
      <label class="lbl">Note</label><textarea class="inp" data-f="body" style="min-height:200px">${esc(n.body)}</textarea>
      <label class="lbl">Tags (Enter or comma)</label><div class="tag-input"><input placeholder="add tag…"></div>
      <div class="hint" style="margin-top:6px">Tip: use [[Pplat]] in text to link a glossary topic.</div>
      <div class="row" style="margin-top:14px"><button class="btn pri" data-save>${ic('check')}Save</button>${noteId ? `<button class="btn danger" data-del>${ic('trash')}Delete</button>` : ''}</div>`;
    const ti = $('.tag-input', b), tin = $('input', ti);
    const drawTags = () => { $$('.tg', ti).forEach(x => x.remove()); tags.forEach((t, i) => ti.insertBefore(el(`<span class="tg">${esc(t)}<button data-rt="${i}">✕</button></span>`), tin)); };
    const addTag = () => { tin.value.split(',').map(x => x.trim()).filter(Boolean).forEach(t => { if (!tags.includes(t)) tags.push(t); }); tin.value = ''; drawTags(); };
    tin.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } if (e.key === 'Backspace' && !tin.value && tags.length) { tags.pop(); drawTags(); } });
    tin.addEventListener('blur', addTag);
    ti.addEventListener('click', e => { const r = e.target.closest('[data-rt]'); if (r) { tags.splice(+r.dataset.rt, 1); drawTags(); } });
    drawTags();
    b.addEventListener('click', e => {
      if (e.target.closest('[data-save]')) {
        addTag(); n.title = $('[data-f=title]', b).value.trim(); n.body = $('[data-f=body]', b).value; n.tags = tags; n.t = Date.now();
        if (!noteId) S.notes.push(n); save(); emit('notes'); refreshBadges(); closeSheet(); toast('Note saved'); after && after();
      }
      if (e.target.closest('[data-del]')) { dialog({ title: 'Delete this note?', ok: 'Delete', danger: true }).then(ok => { if (ok) { S.notes = S.notes.filter(x => x.id !== n.id); save(); emit('notes'); refreshBadges(); closeSheet(); after && after(); } }); }
    });
  });
}
function openContextNotes(type, id, label) {
  openSheet('Notes · ' + label, b => {
    const ns = S.notes.filter(n => n.ctx && n.ctx.type === type && n.ctx.id === id);
    b.innerHTML = `<button class="btn pri" data-new style="margin-bottom:12px">${ic('plus')}New note for ${esc(label)}</button>${ns.map(noteHTML).join('') || '<div class="empty">No notes yet.</div>'}`;
    b.addEventListener('click', e => { if (e.target.closest('[data-new]')) openNoteEditor(null, { type, id, label }); });
  });
}

/* ================= topics & glossary (sheet) ================= */
function meaningBox(g) {
  if (!g) return '';
  const L = LANG();
  const syn = (g.a || []).filter(x => x.length > 1).slice(0, 5);
  return `<div class="meaning"><div class="m-h"><span class="m-term">${esc(g.t)}</span>${syn.length ? `<span class="m-syn">${syn.map(esc).join(' · ')}</span>` : ''}</div>
    <div class="m-txt ${L === 'bn' ? 'bn' : ''}">${inline(L === 'bn' ? g.bn : g.en, true, [g.t])}</div>
    <div class="m-alt">${inline(L === 'bn' ? g.en : g.bn, false)}</div></div>`;
}
function topicHTML(t, g) {
  const L = LANG();
  const skip = GLOSSARY.filter(x => x.topic === t.id).map(x => x.t);
  const rel = allAbn().filter(a => (a.tags || []).some(x => (t.tags || []).map(norm).includes(norm(x)) || norm(x) === norm(TOPICS.find(z => z.id === t.id) ? TOPICS.find(z => z.id === t.id).title : t.title) || (g && norm(x) === norm(g.t))));
  const related = GLOSSARY.filter(x => x.topic === t.id && (!g || x.t !== g.t)).slice(0, 12);
  return `${g ? `<div class="sec-h">${L === 'bn' ? 'বিস্তারিত' : 'Full topic'}: ${esc(t.title)}</div>` : ''}
    <div class="row" style="margin-bottom:10px"><span class="chip sm on">${esc(t.catLabel || t.cat)}</span>${(t.tags || []).slice(0, 6).map(x => `<button class="tag" data-tagview="${esc(x)}">${esc(x)}</button>`).join('')}</div>
    ${L === 'bn' && t.noBn ? `<div class="hint" style="margin-bottom:8px">এই টপিকের বাংলা এখনো লেখা হয়নি – Edit চেপে লিখতে পারো।</div>` : ''}
    <div class="rich ${L === 'bn' ? 'bn' : ''}">${renderRich(t.body, skip)}</div>
    ${related.length ? `<div class="sec-h">${L === 'bn' ? 'এই টপিকের অন্য শব্দ' : 'Words in this topic'}</div><div class="cloud">${related.map(x => tagBtn(x.t)).join('')}</div>` : ''}
    ${rel.length ? `<div class="sec-h">${L === 'bn' ? 'Simulator-এ চালিয়ে দেখো' : 'Try it in the simulator'}</div><div class="list">${rel.map(a => `<button class="li" data-abn="${a.id}"><span class="t">${esc(a.name)}</span>${ic('play')}</button>`).join('')}</div>` : ''}
    ${notesFor('topic', t.id)}
    <div class="row" style="margin-top:16px"><button class="btn" data-edit>${ic('edit')}${L === 'bn' ? 'Edit (বাংলা)' : 'Edit'}</button><button class="btn" data-note>${ic('note')}${L === 'bn' ? 'Note যোগ করো' : 'Add note'}</button>
    ${(L === 'bn' ? t.editedBn : t.edited) ? `<button class="btn" data-revert>${ic('refresh')}${L === 'bn' ? 'আগের লেখায় ফেরো' : 'Restore original'}</button>` : ''}${t.custom ? `<button class="btn danger" data-del>${ic('trash')}Delete</button>` : ''}</div>`;
}
/* one sheet for glossary words and/or full topics */
function openEntry(gTerm, topicId) {
  const g0 = gTerm ? GLOSSARY.find(x => x.t === gTerm) : null;
  const t0 = topicId ? getTopic(topicId, LANG()) : null;
  openSheet((g0 && g0.t) || (t0 && t0.title) || '', b => {
    const g = g0, t = topicId ? getTopic(topicId, LANG()) : null;
    if (t && !g) $('#sheetTitle').textContent = t.title;
    b.innerHTML = `<div class="row" style="justify-content:space-between;margin-bottom:12px"><span class="hint">${LANG() === 'bn' ? 'শুধু Learning অংশের ভাষা' : 'Learning language'}</span>${langSeg()}</div>
      ${meaningBox(g)}${t ? topicHTML(t, g) : (g ? '' : '<div class="empty">Topic deleted</div>')}`;
    $$('.li svg', b).forEach(s => { s.style.width = '16px'; s.style.height = '16px'; });
    b.addEventListener('click', e => {
      if (!t) return;
      if (e.target.closest('[data-edit]')) pushSheet(LANG() === 'bn' ? 'Edit topic (বাংলা)' : 'Edit topic', bb => editTopic(bb, t.id, null, () => { popSheet(); }));
      if (e.target.closest('[data-note]')) openNoteEditor(null, { type: 'topic', id: t.id, label: t.title });
      if (e.target.closest('[data-revert]')) { if (LANG() === 'bn') delete S.topicEditsBn[t.id]; else delete S.topicEdits[t.id]; save(); emit('topics'); renderSheet(); }
      if (e.target.closest('[data-del]')) { dialog({ title: 'Delete this topic?', ok: 'Delete', danger: true }).then(ok => { if (ok) { S.customTopics = S.customTopics.filter(x => x.id !== t.id); save(); emit('topics'); closeSheet(); } }); }
      const ab = e.target.closest('[data-abn]'); if (ab) { const a = getAbn(ab.dataset.abn); loadScenario(a, a.name, a.id); closeSheet(); }
    });
  }, true);
}
function openTopic(id) { openEntry(null, id); }
function editTopic(b, id, presetTag, after) {
  const L = LANG();
  const base = id ? getTopic(id) : null;
  const t = id ? getTopic(id, L) : { title: presetTag || '', cat: 'My topics', tags: presetTag ? [presetTag] : [], body: '' };
  const bnMode = L === 'bn' && !!id;
  b.innerHTML = `${bnMode ? `<div class="hint" style="margin-bottom:8px">বাংলা সংস্করণ edit করছ। ইংরেজি লেখা আলাদা থাকবে।</div>` : ''}
    <label class="lbl" style="margin-top:0">Title</label><input class="inp" data-f="title" value="${esc(t.title)}">
    ${bnMode ? '' : `<label class="lbl">Category</label><input class="inp" data-f="cat" value="${esc(t.cat)}" list="catlist"><datalist id="catlist">${[...new Set(allTopics().map(x => x.cat))].map(c => `<option value="${esc(c)}">`).join('')}</datalist>
    <label class="lbl">Tags / aliases (comma separated) – these make [[links]] find this topic</label><input class="inp" data-f="tags" value="${esc((t.tags || []).join(', '))}">`}
    <label class="lbl">Content</label><textarea class="inp ${bnMode ? 'bn' : ''}" data-f="body" style="min-height:280px">${esc(String((bnMode && t.noBn) ? '' : t.body || '').trim())}</textarea>
    <div class="hint" style="margin-top:6px">Formatting: blank line = new paragraph · "- " = bullet · **bold** · [[Pplat]] or [[label|tag]] = clickable tag. Glossary words are linked automatically.</div>
    <div class="row" style="margin-top:14px"><button class="btn pri" data-save>${ic('check')}Save</button></div>`;
  b.addEventListener('click', e => {
    if (!e.target.closest('[data-save]')) return;
    const title = $('[data-f=title]', b).value.trim() || 'Untitled', body = $('[data-f=body]', b).value;
    if (bnMode) {
      if (base.custom) { const c = S.customTopics.find(x => x.id === id); c.titleBn = title; c.bodyBn = body; }
      else S.topicEditsBn[id] = { title, body };
    } else {
      const v = { title, cat: $('[data-f=cat]', b).value.trim() || 'My topics', tags: $('[data-f=tags]', b).value.split(',').map(x => x.trim()).filter(Boolean), body };
      if (id && TOPICS.find(x => x.id === id)) S.topicEdits[id] = v;
      else if (id) Object.assign(S.customTopics.find(x => x.id === id), v);
      else { v.id = 'u_' + uid(); if (L === 'bn') { v.titleBn = title; v.bodyBn = body; } S.customTopics.push(v); id = v.id; }
    }
    save(); emit('topics'); toast('Topic saved');
    if (after) after(id); else closeSheet();
  });
}
function editAbn(b, id, after) {
  const a = getAbn(id);
  b.innerHTML = `<label class="lbl" style="margin-top:0">Name</label><input class="inp" data-f="name" value="${esc(a.name)}">
    <label class="lbl">What you see (one per line)</label><textarea class="inp" data-f="see">${esc((a.see || []).join('\n'))}</textarea>
    <label class="lbl">Why</label><textarea class="inp" data-f="why" style="min-height:90px">${esc(a.why)}</textarea>
    <label class="lbl">How to fix (one per line)</label><textarea class="inp" data-f="fix">${esc((a.fix || []).join('\n'))}</textarea>
    <label class="lbl">Tags (comma separated)</label><input class="inp" data-f="tags" value="${esc((a.tags || []).join(', '))}">
    <div class="row" style="margin-top:14px"><button class="btn pri" data-save>${ic('check')}Save</button>${a.edited ? `<button class="btn" data-rev>${ic('refresh')}Restore original</button>` : ''}</div>`;
  b.addEventListener('click', e => {
    if (e.target.closest('[data-save]')) {
      const lines = k => $(`[data-f=${k}]`, b).value.split('\n').map(x => x.trim()).filter(Boolean);
      S.abnEdits[id] = { name: $('[data-f=name]', b).value.trim(), see: lines('see'), why: $('[data-f=why]', b).value.trim(), fix: lines('fix'), tags: $('[data-f=tags]', b).value.split(',').map(x => x.trim()).filter(Boolean) };
      save(); closeSheet(); toast('Saved'); after && after();
    }
    if (e.target.closest('[data-rev]')) { delete S.abnEdits[id]; save(); closeSheet(); after && after(); }
  });
}
function openTagView(tag) {
  openSheet('#' + tag, b => {
    const k = norm(tag);
    const ts = allTopics(LANG()).filter(t => (t.tags || []).some(x => norm(x) === k) || norm(t.title) === k);
    const as = allAbn().filter(a => (a.tags || []).some(x => norm(x) === k));
    const ns = S.notes.filter(n => (n.tags || []).some(x => norm(x) === k));
    b.innerHTML = `${ts.length ? `<div class="sec-h" style="margin-top:0">Topics</div><div class="list">${ts.map(t => `<button class="li" data-t="${t.id}"><span class="t">${esc(t.title)}</span><span class="k">${esc(t.catLabel)}</span></button>`).join('')}</div>` : ''}
      ${as.length ? `<div class="sec-h">Abnormalities</div><div class="list">${as.map(a => `<button class="li" data-abn="${a.id}"><span class="t">${esc(a.name)}</span><span class="k">load</span></button>`).join('')}</div>` : ''}
      ${ns.length ? `<div class="sec-h">My notes</div>${ns.map(noteHTML).join('')}` : ''}
      ${!ts.length && !as.length && !ns.length ? `<div class="empty">Nothing uses this tag yet.</div>` : ''}
      <button class="btn" data-mk style="margin-top:14px">${ic('plus')}Create a topic for “${esc(tag)}”</button>`;
    b.addEventListener('click', e => {
      const t = e.target.closest('[data-t]'); if (t) openTopic(t.dataset.t);
      const ab = e.target.closest('[data-abn]'); if (ab) { const a = getAbn(ab.dataset.abn); loadScenario(a, a.name, a.id); closeSheet(); }
      if (e.target.closest('[data-mk]')) pushSheet('New topic', bb => editTopic(bb, null, tag, id => { closeSheet(); openTopic(id); }));
    });
  }, true);
}
function openTag(tag) {
  if (String(tag).startsWith('topic:')) { const t = getTopic(tag.slice(6)); if (t) return openEntry(null, t.id); }
  const g = findGloss(tag);
  const t = (g && g.topic) ? getTopic(g.topic) : resolveTag(tag);
  if (g || t) openEntry(g ? g.t : null, t ? t.id : null); else openTagView(tag);
}

/* ================= sheet (drawer) ================= */
const sheetStack = [];
function renderSheet() {
  const top = sheetStack[sheetStack.length - 1]; if (!top) return;
  $('#sheetTitle').textContent = top.title; const b = $('#sheetBody');
  const nb = b.cloneNode(false); b.replaceWith(nb); nb.scrollTop = 0; top.render(nb);
  $('#sheetBack').style.visibility = sheetStack.length > 1 ? 'visible' : 'hidden';
}
function openSheet(title, render, push) {
  if (!push || !$('#sheet').classList.contains('open')) sheetStack.length = 0;
  sheetStack.push({ title, render }); renderSheet();
  $('#sheet').classList.add('open'); $('#sheet').setAttribute('aria-hidden', 'false'); $('#backdrop').hidden = false; document.body.classList.add('lock');
}
function pushSheet(title, render) { openSheet(title, render, true); }
function popSheet() { sheetStack.pop(); if (sheetStack.length) renderSheet(); else closeSheet(); }
function closeSheet() {
  sheetStack.length = 0; $('#sheet').classList.remove('open'); $('#sheet').setAttribute('aria-hidden', 'true');
  if (!$('.card.expanded')) { $('#backdrop').hidden = true; document.body.classList.remove('lock'); }
}

/* ================= grid / layout ================= */
const grid = $('#grid');
const cardEls = {};
const visible = new Set();
const io = new IntersectionObserver(es => es.forEach(e => { const id = e.target.dataset.id; if (e.isIntersecting) visible.add(id); else visible.delete(id); }), { rootMargin: '100px' });
function layoutItem(id) { return S.layout.find(l => l.id === id); }
function cardTitle(id) { const l = layoutItem(id); return (l && l.title) || CARD_META.find(c => c.id === id).title; }
function buildCards() {
  CARD_META.forEach(meta => {
    const c = el(`<section class="card" data-id="${meta.id}"><div class="card-head">
      <button class="grip" title="Drag to move">${ic('grip')}</button><div class="c-ico">${ic(meta.icon)}</div>
      <div class="c-title"><span class="ct"></span><small>${meta.cat}</small></div>
      <div class="c-actions"><button class="ib" data-act="notes" title="Notes">${ic('note')}<span class="badge" hidden></span></button>
      <button class="ib" data-act="expand" title="Expand">${ic('expand')}</button><button class="ib" data-act="menu" title="More">${ic('more')}</button></div></div>
      <div class="card-body"></div><div class="resize" title="Drag to resize">${ic('resize')}</div></section>`);
    grid.appendChild(c); cardEls[meta.id] = c;
    try { inst[meta.id] = CARDS[meta.id]($('.card-body', c), c) || {}; } catch (e) { console.error(meta.id, e); $('.card-body', c).innerHTML = '<div class="empty">Error: ' + esc(e.message) + '</div>'; inst[meta.id] = {}; }
    io.observe(c);
    c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
    $('.grip', c).addEventListener('pointerdown', e => startDrag(e, c));
    $('.resize', c).addEventListener('pointerdown', e => startResize(e, c));
    $('.ct', c).addEventListener('dblclick', () => renameCard(meta.id));
    $('.c-actions', c).addEventListener('click', e => {
      const a = e.target.closest('[data-act]'); if (!a) return;
      if (a.dataset.act === 'notes') openContextNotes('card', meta.id, cardTitle(meta.id));
      if (a.dataset.act === 'expand') toggleExpand(meta.id);
      if (a.dataset.act === 'menu') cardMenu(meta.id, a);
    });
  });
  applyLayout(); refreshBadges();
}
function refreshBadges() { CARD_META.forEach(m => { const n = noteCount('card', m.id), b = $('.badge', cardEls[m.id]); b.hidden = !n; b.textContent = n; }); }
function applyLayout() {
  $$('.group-head', grid).forEach(x => x.remove());
  let order = S.layout.slice();
  const ttl = l => cardTitle(l.id);
  if (S.sort === 'az') order.sort((a, b) => ttl(a).localeCompare(ttl(b)));
  if (S.sort === 'za') order.sort((a, b) => ttl(b).localeCompare(ttl(a)));
  if (S.sort === 'cat') order.sort((a, b) => (CATS.indexOf(CARD_META.find(c => c.id === a.id).cat) - CATS.indexOf(CARD_META.find(c => c.id === b.id).cat)) || ttl(a).localeCompare(ttl(b)));
  let o = 0, lastCat = null;
  order.forEach(l => {
    const c = cardEls[l.id], meta = CARD_META.find(m => m.id === l.id);
    const show = !l.hidden && (S.filter === 'All' || meta.cat === S.filter);
    c.hidden = !show;
    if (S.sort === 'cat' && show && meta.cat !== lastCat) { const h = el(`<div class="group-head">${meta.cat}</div>`); h.style.order = o++; grid.appendChild(h); lastCat = meta.cat; }
    c.style.order = o++; c.style.setProperty('--w', l.w); c.style.setProperty('--h', l.h);
    $('.ct', c).textContent = cardTitle(l.id);
  });
}
function visualOrder() { return S.layout.slice().sort((a, b) => (+cardEls[a.id].style.order) - (+cardEls[b.id].style.order)); }
function startDrag(e, c) {
  if (c.classList.contains('expanded')) return;
  e.preventDefault();
  if (S.sort !== 'custom') { S.layout = visualOrder(); S.sort = 'custom'; applyLayout(); toast('Switched to custom order'); }
  const r0 = c.getBoundingClientRect(); const offX = e.clientX - r0.left, offY = e.clientY - r0.top; let tx = 0, ty = 0, lastTarget = null;
  c.classList.add('dragging');
  const place = (x, y) => { const r = c.getBoundingClientRect(); const nl = r.left - tx, nt = r.top - ty; tx = x - offX - nl; ty = y - offY - nt; c.style.transform = `translate(${tx}px,${ty}px)`; };
  let scrollV = 0, raf;
  const tick = () => { if (scrollV) { window.scrollBy(0, scrollV); } raf = requestAnimationFrame(tick); }; raf = requestAnimationFrame(tick);
  const move = ev => {
    place(ev.clientX, ev.clientY);
    scrollV = ev.clientY < 90 ? -14 : ev.clientY > innerHeight - 70 ? 14 : 0;
    const t = document.elementFromPoint(ev.clientX, ev.clientY); const tc = t && t.closest('.card');
    if (tc && tc !== c && tc !== lastTarget) {
      lastTarget = tc;
      const from = S.layout.findIndex(l => l.id === c.dataset.id), to = S.layout.findIndex(l => l.id === tc.dataset.id);
      const [it] = S.layout.splice(from, 1); S.layout.splice(to, 0, it); applyLayout(); place(ev.clientX, ev.clientY);
    } else if (!tc) lastTarget = null;
  };
  const up = () => { cancelAnimationFrame(raf); c.classList.remove('dragging'); c.style.transform = ''; window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); save(); };
  window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
}
function startResize(e, c) {
  e.preventDefault(); e.stopPropagation();
  const l = layoutItem(c.dataset.id), gs = getComputedStyle(grid);
  const gap = parseFloat(gs.columnGap) || 14, rowH = parseFloat(gs.gridAutoRows) || 64;
  const inner = grid.clientWidth - parseFloat(gs.paddingLeft) - parseFloat(gs.paddingRight);
  const mobile = innerWidth <= 760; const colW = (inner - 11 * gap) / 12;
  const sx = e.clientX, sy = e.clientY, sw = l.w, sh = l.h; c.classList.add('resizing');
  const move = ev => {
    if (!mobile) l.w = clamp(Math.round((sw * (colW + gap) + ev.clientX - sx) / (colW + gap)), 3, 12);
    l.h = clamp(Math.round((sh * (rowH + gap) + ev.clientY - sy) / (rowH + gap)), 3, 16);
    c.style.setProperty('--w', l.w); c.style.setProperty('--h', l.h);
  };
  const up = () => { c.classList.remove('resizing'); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); save(); };
  window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
}
function toggleExpand(id) {
  const c = cardEls[id], ex = !c.classList.contains('expanded');
  $$('.card.expanded').forEach(x => { x.classList.remove('expanded'); $('[data-act=expand]', x).innerHTML = ic('expand'); });
  if (ex) { c.classList.add('expanded'); $('[data-act=expand]', c).innerHTML = ic('collapse'); $('#backdrop').hidden = false; document.body.classList.add('lock'); visible.add(id); }
  else if (!$('#sheet').classList.contains('open')) { $('#backdrop').hidden = true; document.body.classList.remove('lock'); }
}
function renameCard(id) { return dialog({ title: 'Rename card', input: cardTitle(id), ok: 'Save' }).then(n => { if (n !== null) { layoutItem(id).title = n.trim() || null; save(); applyLayout(); } }); }
function showMenu(anchor, items) {
  const m = $('#menu'); m.innerHTML = items.map((it, i) => it === '-' ? '<hr>' : `<button data-i="${i}" class="${it.on ? 'on' : ''}">${it.icon ? ic(it.icon) : ''}${esc(it.label)}</button>`).join('');
  m.hidden = false; const r = anchor.getBoundingClientRect(); const mw = m.offsetWidth, mh = m.offsetHeight;
  m.style.left = clamp(r.right - mw, 8, innerWidth - mw - 8) + 'px'; m.style.top = (r.bottom + 6 + mh > innerHeight ? Math.max(8, r.top - mh - 6) : r.bottom + 6) + 'px';
  m.onclick = e => { const b = e.target.closest('[data-i]'); if (!b) return; m.hidden = true; items[+b.dataset.i].fn(); };
}
function cardMenu(id, anchor) {
  const l = layoutItem(id);
  showMenu(anchor, [
    { label: 'Rename', icon: 'edit', fn: () => renameCard(id) },
    '-',
    ...Object.keys(SIZES).map(k => ({ label: 'Size ' + k, on: l.w === SIZES[k][0] && l.h === SIZES[k][1], fn: () => { l.w = SIZES[k][0]; l.h = SIZES[k][1]; save(); applyLayout(); } })),
    { label: 'Default size', icon: 'refresh', fn: () => { const m = CARD_META.find(c => c.id === id); l.w = m.w; l.h = m.h; save(); applyLayout(); } },
    '-',
    { label: 'Hide card', icon: 'eyeoff', fn: () => { l.hidden = true; save(); applyLayout(); toast('Hidden – restore from Cards & layout'); } }
  ]);
}

/* ================= header, filters, sheets for settings ================= */
function buildFilter() {
  const fb = $('#filterBar');
  fb.innerHTML = ['All'].concat(CATS).map(c => `<button class="chip ${S.filter === c ? 'on' : ''}" data-f="${c}">${c}</button>`).join('');
  fb.onclick = e => { const b = e.target.closest('[data-f]'); if (b) { S.filter = b.dataset.f; save(); buildFilter(); applyLayout(); } };
}
function applyAppearance() {
  const th = THEMES[S.theme] || THEMES.crimson; const r = document.body.style;
  Object.entries(th.v).forEach(([k, v]) => { if (k !== 'on') r.setProperty('--' + k, v); });
  r.setProperty('--on-accent', th.v.on || '#fff');
  ['warn', 'danger'].forEach(k => { if (!th.v[k]) r.setProperty('--' + k, k === 'warn' ? '#ff9a3c' : '#ff1f44'); });
  const f = FONTS.find(x => x.n === S.font) || FONTS[0]; r.setProperty('--font', f.css.replace(/,\s*([a-z-]+)$/, ", 'Noto Sans Bengali', $1"));
  r.setProperty('--scale', S.scale); r.setProperty('--glowk', S.glow);
  document.body.classList.toggle('light', !!th.light); document.body.classList.toggle('noblur', !S.blur); document.body.classList.toggle('noanim', !S.anim);
  $('meta[name=theme-color]').setAttribute('content', th.v.bg);
  readColors();
}
function openAppearance() {
  openSheet('Themes & fonts', b => {
    b.innerHTML = `<label class="lbl" style="margin-top:0">Theme</label><div class="theme-grid">${Object.entries(THEMES).map(([k, t]) => `<button class="theme-card ${k === S.theme ? 'on' : ''} ${t.special ? 'special' : ''}" data-th="${k}" style="background:radial-gradient(120px 80px at 80% 0%, ${t.v.blob1}66, transparent),${t.v.bg};color:${t.v.text}">
        <div class="tn">${t.name}</div><div class="tw"><i style="background:${t.v.accent};box-shadow:0 0 10px ${t.v.accent}"></i><i style="background:${t.v.p}"></i><i style="background:${t.v.f}"></i><i style="background:${t.v.v}"></i></div>
        <svg class="tbar" viewBox="0 0 120 26" preserveAspectRatio="none"><path d="M0 22h14l6-16 10 0 6 16h20l6-16 10 0 6 16h20l6-16 10 0 6 16" fill="none" stroke="${t.v.p}" stroke-width="2"/></svg></button>`).join('')}</div>
      <label class="lbl">Font</label><div class="font-list">${FONTS.map(f => `<button class="font-opt ${f.n === S.font ? 'on' : ''}" data-fo="${f.n}" style="font-family:${f.css}"><b>Aa 25 cmH2O</b><span>${f.n}</span></button>`).join('')}</div>
      <label class="lbl">Units ${tagBtn('?', 'topic:units')}</label>
      <div class="toggle"><span>Pressure</span><div class="seg">${['cmH2O', 'hPa'].map(u => `<button data-up="${u}" class="${(S.units.p || 'cmH2O') === u ? 'on' : ''}">${u}</button>`).join('')}</div></div>
      <div class="toggle"><span>Blood gases (PaO2, PaCO2, EtCO2)</span><div class="seg">${['mmHg', 'kPa'].map(u => `<button data-ug="${u}" class="${(S.units.g || 'mmHg') === u ? 'on' : ''}">${u}</button>`).join('')}</div></div>
      <label class="lbl">Text size</label><div class="seg">${[[.9, 'S'], [1, 'M'], [1.1, 'L'], [1.2, 'XL']].map(([v, l]) => `<button data-sc="${v}" class="${S.scale === v ? 'on' : ''}">${l}</button>`).join('')}</div>
      <label class="lbl">Effects</label>
      <div class="toggle"><span>Glass blur</span><button class="sw ${S.blur ? 'on' : ''}" data-tg="blur"></button></div>
      <div class="toggle"><span>Animated background</span><button class="sw ${S.anim ? 'on' : ''}" data-tg="anim"></button></div>
      <div class="toggle"><span>Waveform fill</span><button class="sw ${S.display.fill ? 'on' : ''}" data-tg="fill"></button></div>
      <div class="toggle" style="border:0"><span>Glow intensity</span><input type="range" min="0" max="1.6" step="0.1" value="${S.glow}" data-glow style="max-width:180px"></div>
      <div class="hint">Turn off blur and animation on older phones for smoother waveforms.</div>`;
    const g = $('[data-glow]', b); const pct = () => g.style.setProperty('--pct', (g.value / 1.6 * 100) + '%'); pct();
    g.addEventListener('input', () => { S.glow = +g.value; pct(); applyAppearance(); save(); });
    b.addEventListener('click', e => {
      const t = e.target.closest('[data-th]'), f = e.target.closest('[data-fo]'), sc = e.target.closest('[data-sc]'), tg = e.target.closest('[data-tg]');
      if (t) S.theme = t.dataset.th; if (f) S.font = f.dataset.fo; if (sc) S.scale = +sc.dataset.sc;
      if (tg) { const k = tg.dataset.tg; if (k === 'fill') S.display.fill = !S.display.fill; else S[k] = !S[k]; }
      const up = e.target.closest('[data-up]'), ug = e.target.closest('[data-ug]');
      if (up || ug) { if (up) S.units.p = up.dataset.up; if (ug) S.units.g = ug.dataset.ug; save(); emit('units'); renderSheet(); return; }
      if (t || f || sc || tg) { save(); applyAppearance(); renderSheet(); }
    });
  });
}
function openLayout() {
  openSheet('Cards & layout', b => {
    b.innerHTML = `<label class="lbl" style="margin-top:0">Sort</label><div class="seg">${[['custom', 'Custom'], ['az', 'A → Z'], ['za', 'Z → A'], ['cat', 'Category']].map(([k, l]) => `<button data-so="${k}" class="${S.sort === k ? 'on' : ''}">${l}</button>`).join('')}</div>
      <div class="hint" style="margin-top:6px">Custom: drag cards by the ⋮⋮ handle. Resize from the bottom-right corner, or use a card's ⋯ menu.</div>
      <label class="lbl">Cards</label><div class="list">${S.layout.map(l => { const m = CARD_META.find(c => c.id === l.id); return `<div class="li" data-id="${l.id}" style="cursor:default"><button class="sw ${l.hidden ? '' : 'on'}" data-vis></button>
        <span class="t">${esc(cardTitle(l.id))}<small>${m.cat} · ${l.w}×${l.h}</small></span><div class="seg">${Object.keys(SIZES).map(k => `<button data-sz="${k}" class="${l.w === SIZES[k][0] && l.h === SIZES[k][1] ? 'on' : ''}">${k}</button>`).join('')}</div><button class="ib sm" data-ren>${ic('edit')}</button></div>`; }).join('')}</div>
      <div class="row" style="margin-top:14px"><button class="btn" data-reset>${ic('refresh')}Reset layout</button><button class="btn" data-showall>${ic('eye')}Show all</button></div>`;
    b.addEventListener('click', e => {
      const so = e.target.closest('[data-so]'); if (so) { S.sort = so.dataset.so; save(); applyLayout(); renderSheet(); return; }
      if (e.target.closest('[data-reset]')) { S.layout = defaultStore().layout; S.sort = 'custom'; save(); applyLayout(); renderSheet(); return; }
      if (e.target.closest('[data-showall]')) { S.layout.forEach(l => l.hidden = false); save(); applyLayout(); renderSheet(); return; }
      const row = e.target.closest('[data-id]'); if (!row) return; const l = layoutItem(row.dataset.id);
      if (e.target.closest('[data-vis]')) l.hidden = !l.hidden;
      const sz = e.target.closest('[data-sz]'); if (sz) { l.w = SIZES[sz.dataset.sz][0]; l.h = SIZES[sz.dataset.sz][1]; }
      if (e.target.closest('[data-ren]')) { renameCard(l.id).then(renderSheet); return; }
      save(); applyLayout(); renderSheet();
    });
  });
}
function openMore() {
  showMenu($('#btnMore'), [
    { label: 'Export backup (JSON)', icon: 'download', fn: () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' })); a.download = 'ventlab-backup-' + new Date().toISOString().slice(0, 10) + '.json'; a.click(); } },
    { label: 'Import backup', icon: 'upload', fn: () => { const i = document.createElement('input'); i.type = 'file'; i.accept = '.json,application/json'; i.onchange = async () => { try { const d = JSON.parse(await i.files[0].text()); localStorage.setItem(STORE_KEY, JSON.stringify(d)); location.reload(); } catch (e) { toast('Invalid backup file'); } }; i.click(); } },
    '-',
    { label: 'About VentLab', icon: 'info', fn: () => openTopic('simmodel') },
    { label: 'Reset everything', icon: 'trash', fn: () => dialog({ title: 'Reset everything?', msg: 'Deletes all notes, edits, setups and layout.', ok: 'Reset', danger: true }).then(ok => { if (ok) { localStorage.removeItem(STORE_KEY); location.reload(); } }) }
  ]);
}
function openSortMenu() {
  showMenu($('#btnSort'), [['custom', 'Custom (drag)'], ['az', 'A → Z'], ['za', 'Z → A'], ['cat', 'By category']].map(([k, l]) => ({ label: l, on: S.sort === k, fn: () => { S.sort = k; save(); applyLayout(); } })));
}

/* ================= search palette ================= */
function openPalette() {
  const p = $('#palette'), inp = $('#paletteInput'), res = $('#paletteRes'); p.hidden = false; inp.value = ''; inp.focus(); let items = [], sel = 0;
  const run = () => {
    const q = norm(inp.value); items = [];
    allTopics().forEach(t => { const s = norm(t.title + ' ' + (t.tags || []).join(' ')); if (!q || s.includes(q)) items.push({ k: 'Topic', l: t.title, go: () => openTopic(t.id), w: norm(t.title).startsWith(q) ? 0 : 1 }); });
    allAbn().forEach(a => { if (!q || norm(a.name + ' ' + a.cat).includes(q)) items.push({ k: 'Abnormality', l: a.name, go: () => { const c = cardEls.abnormal; if (layoutItem('abnormal').hidden) { layoutItem('abnormal').hidden = false; applyLayout(); } inst.abnormal.open(a.id); c.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, w: 2 }); });
    S.notes.forEach(n => { if (q && norm(n.title + ' ' + n.body + ' ' + (n.tags || []).join(' ')).includes(q)) items.push({ k: 'Note', l: n.title || 'Untitled', go: () => openNoteEditor(n.id), w: 1 }); });
    CARD_META.forEach(m => { if (!q || norm(cardTitle(m.id)).includes(q)) items.push({ k: 'Card', l: cardTitle(m.id), go: () => { const l = layoutItem(m.id); if (l.hidden) { l.hidden = false; save(); } if (S.filter !== 'All') { S.filter = 'All'; buildFilter(); } applyLayout(); cardEls[m.id].scrollIntoView({ behavior: 'smooth', block: 'center' }); }, w: 3 }); });
    Object.keys(VMODES).forEach(m => { if (q && norm(m + ' ' + VMODES[m].full).includes(q)) items.push({ k: 'Set mode', l: VMODES[m].full, go: () => setMode(m), w: 1 }); });
    items.sort((a, b) => a.w - b.w); items = items.slice(0, 40); sel = 0; draw();
  };
  const draw = () => { res.innerHTML = items.map((it, i) => `<button class="pr ${i === sel ? 'sel' : ''}" data-i="${i}"><span class="k">${it.k}</span><span>${esc(it.l)}</span></button>`).join('') || '<div class="empty">No results</div>'; };
  const go = i => { const it = items[i]; closePalette(); it && it.go(); };
  inp.oninput = run; res.onclick = e => { const b = e.target.closest('[data-i]'); if (b) go(+b.dataset.i); };
  inp.onkeydown = e => { if (e.key === 'ArrowDown') { sel = Math.min(items.length - 1, sel + 1); draw(); e.preventDefault(); } if (e.key === 'ArrowUp') { sel = Math.max(0, sel - 1); draw(); e.preventDefault(); } if (e.key === 'Enter') go(sel); if (e.key === 'Escape') closePalette(); };
  p.onclick = e => { if (e.target === p) closePalette(); };
  run();
}
function closePalette() { $('#palette').hidden = true; }

/* ================= header status ================= */
let lastHdr = 0, lastAlarmKey = '';
function updateHeader(now) {
  if (now - lastHdr < 300) return; lastHdr = now;
  const mp = $('#modePill'); mp.innerHTML = `<i></i>${esc(S.machine && S.machine !== 'generic' ? machMode(vent.s.mode) : VMODES[vent.s.mode] ? VMODES[vent.s.mode].name : vent.s.mode)}${running ? '' : ' · frozen'}`; mp.classList.toggle('frozen', !running);
  const a = vent.alarms.slice().sort((x, y) => ({ high: 0, med: 1, low: 2 }[x.pri] - { high: 0, med: 1, low: 2 }[y.pri]));
  const strip = $('#alarmStrip'); const key = a.map(x => x.msg).join('|');
  if (key !== lastAlarmKey) {
    lastAlarmKey = key; strip.hidden = !a.length;
    if (a.length) { strip.className = 'alarm-strip ' + a[0].pri + (window.alarmSilenced && window.alarmSilenced() ? ' silenced' : ''); strip.innerHTML = `${ic('alert')}<span>${window.alarmSilenced && window.alarmSilenced() ? '🔕 ' : ''}${esc(a[0].msg)}${a.length > 1 ? ` <small style="opacity:.8">+${a.length - 1} more</small>` : ''}</span>`; $('svg', strip).style.cssText = 'width:18px;height:18px;flex:none'; }
  }
}

/* ================= main loop ================= */
let lastT = performance.now();
function loop(now) {
  const dt = Math.min(0.25, (now - lastT) / 1000); lastT = now;
  if (running && !document.hidden) { const n = Math.round(dt * S.display.speed * (window.TURBO || 1) / 0.002); for (let i = 0; i < n; i++) vent.step(0.002); }
  if (window.extrasTick) window.extrasTick(now);
  for (const id in inst) { const it = inst[id]; if (it.frame && (it.always || ((visible.has(id) || cardEls[id].classList.contains('expanded')) && !cardEls[id].hidden))) { try { it.frame(now); } catch (e) { console.error(id, e); } } }
  updateHeader(now);
  requestAnimationFrame(loop);
}
function setRun(r) { running = r; $('#btnRun').innerHTML = ic(running ? 'pause' : 'play'); }

/* ================= init ================= */
function init() {
  applyAppearance();
  $('#btnSearch').innerHTML = ic('search'); $('#btnSort').innerHTML = ic('sort'); $('#btnLayout').innerHTML = ic('layers'); $('#btnTheme').innerHTML = ic('palette'); $('#btnMore').innerHTML = ic('more');
  $('#sheetBack').innerHTML = ic('back'); $('#sheetClose').innerHTML = ic('x');
  setRun(true); $('#btnSpeed').textContent = S.display.speed + '×';
  buildFilter(); buildCards();
  $('#btnRun').onclick = () => setRun(!running);
  $('#btnSpeed').onclick = () => { const sp = [0.25, 0.5, 1]; S.display.speed = sp[(sp.indexOf(S.display.speed) + 1) % sp.length]; $('#btnSpeed').textContent = S.display.speed + '×'; save(); };
  $('#btnSearch').onclick = openPalette; $('#btnTheme').onclick = openAppearance; $('#btnLayout').onclick = openLayout; $('#btnMore').onclick = openMore; $('#btnSort').onclick = openSortMenu;
  $('#modePill').onclick = () => { cardEls.settings.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
  $('#alarmStrip').onclick = () => { const c = cardEls.alarms; if (layoutItem('alarms').hidden) { layoutItem('alarms').hidden = false; applyLayout(); } c.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
  $('#sheetClose').onclick = closeSheet; $('#sheetBack').onclick = popSheet;
  $('#backdrop').onclick = () => { if ($('#sheet').classList.contains('open')) closeSheet(); else { const ex = $('.card.expanded'); if (ex) toggleExpand(ex.dataset.id); } };
  document.addEventListener('click', e => {
    const lg = e.target.closest('[data-lang]'); if (lg) { e.stopPropagation(); S.learnLang = lg.dataset.lang; save(); emit('lang'); if ($('#sheet').classList.contains('open')) renderSheet(); return; }
    const t = e.target.closest('[data-tag]'); if (t && !t.closest('.palette')) { e.preventDefault(); e.stopPropagation(); openTag(t.dataset.tag); return; }
    const tv = e.target.closest('[data-tagview]'); if (tv) { e.stopPropagation(); openTagView(tv.dataset.tagview); return; }
    const n = e.target.closest('[data-note]'); if (n && !e.target.closest('button')) { openNoteEditor(n.dataset.note); return; }
    if (!e.target.closest('#menu') && !e.target.closest('[data-act=menu]') && !e.target.closest('#btnMore') && !e.target.closest('#btnSort')) $('#menu').hidden = true;
  }, true);
  document.addEventListener('keydown', e => {
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
    if (e.key === 'Escape') { if (!$('#palette').hidden) closePalette(); else if ($('#sheet').classList.contains('open')) closeSheet(); else { const ex = $('.card.expanded'); if (ex) toggleExpand(ex.dataset.id); } }
    if (typing) return;
    if (e.key === '/') { e.preventDefault(); openPalette(); }
    if (e.key === ' ') { e.preventDefault(); setRun(!running); }
  });
  document.addEventListener('visibilitychange', () => { lastT = performance.now(); });
  requestAnimationFrame(loop);
}
function mergeLayout() { CARD_META.forEach(c => { if (!S.layout.find(l => l.id === c.id)) { const i = CARD_META.indexOf(c); S.layout.splice(Math.min(i, S.layout.length), 0, { id: c.id, w: c.w, h: c.h, hidden: false, title: null }); } }); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { mergeLayout(); init(); }); else { mergeLayout(); init(); }
