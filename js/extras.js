/* VentLab Ultra — extra cards: Haemodynamics, Quick Keys, Manoeuvres & SBT, Guided Lessons, Setup wizard */
'use strict';

/* ================= setup wizard ================= */
const DX = {
  normal: { en: 'Normal lungs (e.g. post-op, neuro)', preset: 'normal', vtk: 7, rr: 14, peep: 5, fio2: 40, ti: 1.0, why: 'Normal lungs: Vt 6–8 ml/kg PBW, PEEP 5, RR for normal PaCO2.' },
  ards: { en: 'ARDS', preset: 'ards', vtk: 6, rr: 22, peep: 10, fio2: 60, ti: 0.9, why: 'Lung-protective: Vt 6 ml/kg PBW, higher PEEP, RR 20–30 to control CO2, Pplat ≤ 30, ΔP ≤ 15.' },
  copd: { en: 'COPD exacerbation', preset: 'copd', vtk: 7, rr: 12, peep: 5, fio2: 35, ti: 0.8, why: 'Avoid auto-PEEP: low RR, short Ti / high flow, long Te. Accept higher PaCO2; target SpO2 88–92%.' },
  asthma: { en: 'Severe asthma', preset: 'asthma', vtk: 7, rr: 10, peep: 5, fio2: 40, ti: 0.8, why: 'Very long Te: RR 8–12, high inspiratory flow; permissive hypercapnia; watch Pplat and PEEPi.' },
  obese: { en: 'Obesity', preset: 'obese', vtk: 7, rr: 16, peep: 10, fio2: 40, ti: 1.0, why: 'Vt by PBW (not actual weight); higher PEEP for the heavy chest wall; check transpulmonary pressure.' },
  fibrosis: { en: 'Pulmonary fibrosis', preset: 'fibrosis', vtk: 6, rr: 24, peep: 6, fio2: 50, ti: 0.8, why: 'Very stiff, poorly recruitable lung: small Vt, higher RR; high PEEP rarely helps.' }
};
function pbwOf(h, sex) { return Math.max(20, (sex === 'F' ? 45.5 : 50) + 0.91 * (h - 152.4)); }
function openWizard() {
  openSheet('Setup wizard', b => {
    const pt = S.pt;
    const draw = () => {
      const pbw = pbwOf(pt.height, pt.sex), d = DX[pt.dx] || DX.normal, vt = Math.round(pbw * d.vtk / 10) * 10;
      b.innerHTML = `<div class="hint" style="margin-bottom:10px">Enter the patient's height and sex; VentLab calculates predicted body weight and suggests starting settings.</div>
        <div class="calc"><div class="cg"><div><label>Height (cm)</label><input type="number" data-w="height" value="${pt.height}"></div>
        <div><label>Sex</label><select data-w="sex"><option value="M" ${pt.sex === 'M' ? 'selected' : ''}>Male</option><option value="F" ${pt.sex === 'F' ? 'selected' : ''}>Female</option></select></div></div>
        <label class="lbl">Diagnosis</label><div class="list">${Object.entries(DX).map(([k, x]) => `<button class="li ${pt.dx === k ? 'on' : ''}" data-dx="${k}"><span class="t">${x.en}</span></button>`).join('')}</div></div>
        <div class="calc"><h4>Suggested start ${tagBtn('PBW', 'PBW')}</h4>
        <div class="res">PBW <b>${fmt(pbw, 1)}</b> kg · Vt <b>${vt}</b> ml (${d.vtk} ml/kg) · RR <b>${d.rr}</b> · PEEP <b>${d.peep}</b> · FiO2 <b>${d.fio2}%</b> · Ti <b>${d.ti}</b> s · mode <b>VC-AC</b></div>
        <div class="rich small" style="margin-top:6px">${inline(d.why, true)}</div></div>
        <div class="row" style="margin-top:12px"><button class="btn pri" data-apply>${ic('check')}Apply to ventilator</button><button class="btn" data-pbw>${ic('user')}Only set PBW</button></div>`;
    };
    draw();
    b.addEventListener('change', e => { const i = e.target.closest('[data-w]'); if (i) { pt[i.dataset.w] = i.dataset.w === 'height' ? clamp(+i.value || 170, 120, 220) : i.value; save(); draw(); } });
    b.addEventListener('click', e => {
      const x = e.target.closest('[data-dx]'); if (x) { pt.dx = x.dataset.dx; save(); draw(); return; }
      const pbw = pbwOf(pt.height, pt.sex), d = DX[pt.dx] || DX.normal;
      if (e.target.closest('[data-apply]')) {
        const pre = PRESETS.find(p => p.id === d.preset);
        vent.loadState({ mode: 'VC-AC', vt: Math.round(pbw * d.vtk / 10) * 10, rr: d.rr, peep: d.peep, fio2: d.fio2, ti: d.ti, flowPattern: 'decel' }, Object.assign({}, pre ? pre.p : {}, { ibw: Math.round(pbw * 10) / 10 }), {});
        vent.lim = Object.assign({}, ALARM_DEFAULTS, S.alarmLimits); S.scenario = null; ventChanged(true); closeSheet(); toast('Settings applied for ' + d.en);
      }
      if (e.target.closest('[data-pbw]')) { vent.p.ibw = Math.round(pbw * 10) / 10; ventChanged(true); closeSheet(); toast('PBW ' + fmt(pbw, 1) + ' kg'); }
    });
  });
}

/* ================= sound & silence ================= */
let audioCtx = null, silenceUntil = 0, lastBeep = 0;
window.alarmSilenced = () => Date.now() < silenceUntil;
function beep(f, d) {
  try { if (!audioCtx) return; const o = audioCtx.createOscillator(), g = audioCtx.createGain(); o.frequency.value = f; o.type = 'sine';
    g.gain.setValueAtTime(0.0001, audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(0.15, audioCtx.currentTime + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + d);
    o.connect(g); g.connect(audioCtx.destination); o.start(); o.stop(audioCtx.currentTime + d + 0.05); } catch (e) { }
}

/* ================= O2 boost, SBT runner ================= */
let o2 = null;       // { until, prev }
let sbt = null;      // running SBT state
function startO2() {
  if (o2) { vent.s.fio2 = o2.prev; o2 = null; ventChanged(true); toast('O2 boost stopped'); return; }
  o2 = { until: vent.t + 120, prev: vent.s.fio2 }; vent.s.fio2 = 100; ventChanged(true); toast('FiO2 100% for 2 minutes');
}
const SBT_TYPES = { ps: { en: 'PS 5 / PEEP 5', mode: 'PSV', ps: 5, peep: 5, atc: 0 }, cpap: { en: 'CPAP 5', mode: 'CPAP', ps: 0, peep: 5, atc: 0 }, tpiece: { en: 'T-piece (CPAP 0, no ATC)', mode: 'CPAP', ps: 0, peep: 0, atc: 0 }, atc: { en: 'CPAP 5 + ATC 100%', mode: 'CPAP', ps: 0, peep: 5, atc: 100 } };
function startSBT(type) {
  if (sbt) return;
  if (!vent.spont()) { toast('Patient not breathing – lighten sedation (RASS) first'); return; }
  const T = SBT_TYPES[type] || SBT_TYPES.ps;
  sbt = { type, T, t0: vent.t, dur: 120, prevS: JSON.parse(JSON.stringify(vent.s)), prevP: { prr: vent.p.prr, effort: vent.p.effort }, samples: [], fail: [], base: { hr: vent.meas.hr, rr: vent.meas.rr }, bad: {} };
  Object.assign(vent.s, { mode: T.mode, ps: T.ps, peep: T.peep, atc: T.atc }); vent.apnea = false; ventChanged(true);
  window.TURBO = 4; toast('SBT started (30 min compressed, ×4 speed)');
}
function stopSBT(aborted) {
  if (!sbt) return; window.TURBO = 1;
  const M = vent.meas, x = sbt;
  const res = { t: Date.now(), type: x.T.en, pass: !aborted && !x.fail.length, reasons: x.fail.slice(), rr: M.rr, vt: M.vte, rsbi: M.rsbi, spo2: M.spo2, hr: M.hr, sbp: M.sbp, aborted: !!aborted };
  S.lastSbt = res; save();
  Object.assign(vent.s, x.prevS); Object.assign(vent.p, x.prevP); ventChanged(true);
  sbt = null; emit('sbt', res); toast(aborted ? 'SBT stopped' : res.pass ? 'SBT passed ✓' : 'SBT failed');
}

window.extrasTick = (now) => {
  if (o2 && vent.t >= o2.until) { if (vent.s.fio2 === 100) vent.s.fio2 = o2.prev; o2 = null; ventChanged(true); toast('O2 boost finished'); }
  if (sbt) {
    const el = vent.t - sbt.t0, M = vent.meas;
    if (!sbt.lastS || vent.t - sbt.lastS >= 1) {
      sbt.lastS = vent.t;
      // fatigue: fast shallow breathing worsens over time
      if (M.rsbi > 80 && vent.p.prr > 0) { vent.p.prr = Math.min(45, vent.p.prr + 0.25); vent.p.effort = Math.max(1, vent.p.effort - 0.03); }
      sbt.samples.push({ t: el, rr: M.rr, rsbi: M.rsbi, spo2: M.spo2, hr: M.hr });
      const chk = (k, bad) => { sbt.bad[k] = bad ? (sbt.bad[k] || 0) + 1 : 0; if (sbt.bad[k] >= 8 && !sbt.fail.includes(k)) sbt.fail.push(k); };
      if (el > 15) {
        chk('RR > 35', M.rr > 35); chk('SpO2 < 90%', M.spo2 < 90); chk('HR > 140 or +20%', M.hr > 140 || M.hr > sbt.base.hr * 1.2);
        chk('SBP > 180 or < 90', M.sbp > 180 || M.sbp < 90); chk('RSBI > 105', M.rsbi > 105); chk('Apnoea', vent.apnea);
      }
    }
    if (el >= sbt.dur || sbt.fail.length >= 1 && el > 30) stopSBT(false);
  }
  if (S.sound && !window.alarmSilenced() && now - lastBeep > 2000 && vent.alarms.some(a => a.pri === 'high')) { lastBeep = now; beep(880, 0.18); setTimeout(() => beep(660, 0.18), 220); }
};

/* ================= Haemodynamics card ================= */
CARDS.hemo = (body) => {
  body.classList.add('flush');
  body.innerHTML = `<div class="wf-layout"><div class="hemo-nums">
      <div class="num p big"><div class="nl"><button data-tag="MAP">BP</button><span>mmHg</span></div><div class="nv" data-h="bp">—</div><div class="ns" data-h="map"></div></div>
      <div class="num f big"><div class="nl"><span>HR</span><span>/min</span></div><div class="nv" data-h="hr">—</div></div>
      <div class="num v"><div class="nl"><button data-tag="CVP">CVP</button><span>mmHg</span></div><div class="nv" data-h="cvp">—</div></div>
      <div class="num v"><div class="nl"><button data-tag="PPV">PPV</button><span>%</span></div><div class="nv" data-h="ppv">—</div></div>
      <div class="num v"><div class="nl"><span>CO</span><span>L/min</span></div><div class="nv" data-h="co">—</div></div>
    </div><div class="cv-wrap" style="min-height:90px"><canvas></canvas></div>
    <div class="hint" style="padding:4px 8px">${tagBtn('Heart–lung interaction', 'Heart–lung interaction')} · Hypovolaemia slider in Patient card</div></div>`;
  const st = setupCanvas($('canvas', body)); let last = 0; const sc = {};
  return {
    frame(now) {
      const M = vent.meas;
      if (now - last > 400) {
        last = now;
        const q = k => $(`[data-h="${k}"]`, body);
        q('bp').textContent = `${fmt(M.sbp)}/${fmt(M.dbp)}`; q('map').textContent = 'MAP ' + fmt(M.map); q('hr').textContent = fmt(M.hr);
        q('cvp').textContent = fmt(M.cvp); q('ppv').textContent = fmt(M.ppv); q('co').textContent = fmt(M.co, 1);
        q('bp').parentElement.classList.toggle('bad', M.map < vent.lim.mapLow);
        q('ppv').parentElement.classList.toggle('warn', M.ppv > 13);
      }
      const { ctx, W, H } = st; if (!W) return; ctx.clearRect(0, 0, W, H);
      const n = vent.idx, Wn = 6 * vent.SR, start = Math.max(0, n - Wn);
      let mn = 1e9, mx = -1e9; for (let k = start; k < n; k++) { const v = vent.buf.A[k % vent.N]; if (v < mn) mn = v; if (v > mx) mx = v; }
      if (!isFinite(mn)) return; const lo = Math.floor((mn - 5) / 10) * 10, hi = Math.ceil((mx + 5) / 10) * 10;
      const pad = 34, Y = v => H - 6 - (v - lo) / (hi - lo) * (H - 14), X = k => pad + ((k % Wn) / Wn) * (W - pad - 6);
      ctx.fillStyle = COL.muted; ctx.font = `600 10px ${COL.font}`; ctx.textAlign = 'right'; ctx.fillText(hi, pad - 4, 12); ctx.fillText(lo, pad - 4, H - 6);
      ctx.strokeStyle = COL.p; ctx.lineWidth = 2; ctx.shadowColor = COL.p; ctx.shadowBlur = (S.glow || 0) * 8; ctx.beginPath(); let started = false;
      const cur = n % Wn;
      for (let k = start; k < n; k++) { const rel = ((k % Wn) - cur + Wn) % Wn; if (rel > 0 && rel < 30) { started = false; continue; } if (k % Wn === 0) started = false; const x = X(k), y = Y(vent.buf.A[k % vent.N]); started ? ctx.lineTo(x, y) : ctx.moveTo(x, y); started = true; }
      ctx.stroke(); ctx.shadowBlur = 0;
      ctx.textAlign = 'left'; ctx.fillStyle = COL.p; ctx.font = `800 11px ${COL.font}`; ctx.fillText('ART', pad + 6, 14);
    }
  };
};

/* ================= Quick Keys card ================= */
CARDS.keys = (body) => {
  const render = () => {
    body.innerHTML = `<div class="keys">
      <button class="key" data-k="manual">${ic('plus')}<span>${esc(MC().manual || 'Manual breath')}</span></button>
      <button class="key ${o2 ? 'on' : ''}" data-k="o2" title="${esc(MC().o2 || '')}">${ic('drop')}<span>${S.machine && S.machine !== 'generic' ? esc(MC().o2) : 'O2 100% 2 min'} ${o2 ? '<b class="cd"></b>' : ''}</span></button>
      <button class="key ${window.alarmSilenced() ? 'on' : ''}" data-k="sil">${ic('mute')}<span>${window.alarmSilenced() ? 'Silenced <b class="cd2"></b>' : 'Alarm silence'}</span></button>
      <button class="key ${vent.standby ? 'on danger' : ''}" data-k="stb">${ic('pause')}<span>${vent.standby ? 'Resume ventilation' : 'Standby'}</span></button>
      <button class="key" data-k="wiz">${ic('wand')}<span>Setup wizard</span></button>
      <button class="key ${S.sound ? 'on' : ''}" data-k="snd">${ic(S.sound ? 'volume' : 'mute')}<span>Alarm sound ${S.sound ? 'on' : 'off'}</span></button>
    </div>`;
  };
  body.addEventListener('click', e => {
    const k = e.target.closest('[data-k]'); if (!k) return;
    const a = k.dataset.k;
    if (a === 'manual') toast(vent.manualBreath() ? 'Manual breath' : 'Wait for expiration');
    if (a === 'o2') startO2();
    if (a === 'sil') { silenceUntil = window.alarmSilenced() ? 0 : Date.now() + 120000; toast(window.alarmSilenced() ? 'Alarms silenced for 2 minutes' : 'Alarm sound on'); }
    if (a === 'stb') {
      if (!vent.standby) { dialog({ title: 'Put ventilator on standby?', msg: 'No breaths will be delivered. Only safe if the patient is disconnected.', ok: 'Standby', danger: true }).then(ok => { if (ok) { vent.standby = true; render(); } }); return; }
      vent.standby = false; vent.lastMandStart = vent.t - 60; vent.lastBreathStart = vent.t; vent.apnea = false;
    }
    if (a === 'wiz') openWizard();
    if (a === 'snd') { S.sound = !S.sound; save(); if (S.sound) { try { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); audioCtx.resume(); beep(880, 0.12); } catch (e) { } } }
    render();
  });
  render(); on('machine', render); let last = 0;
  return {
    frame(now) {
      if (now - last < 500) return; last = now;
      const cd = $('.cd', body); if (cd && o2) cd.textContent = Math.max(0, Math.ceil(o2.until - vent.t)) + 's';
      if (!o2 && $('.key.on[data-k=o2]', body)) render();
      const cd2 = $('.cd2', body); if (cd2) cd2.textContent = Math.max(0, Math.ceil((silenceUntil - Date.now()) / 1000)) + 's';
      if (!window.alarmSilenced() && $('.key.on[data-k=sil]', body)) render();
    }
  };
};

/* ================= Manoeuvres & SBT card ================= */
CARDS.manoeuvres = (body) => {
  let trial = null, pv = null;
  const render = () => {
    const res = S.lastSbt;
    body.innerHTML = `
      <div class="calc"><h4><span>Recruitment manoeuvre ${tagBtn('?', 'Recruitment manoeuvre')}</span></h4>
        <div class="row"><button class="btn sm pri" data-rm>${ic('play')}CPAP 40 × 30 s</button><span class="hint">Recruited state: <b data-rs>${fmt((vent.rmState || 0) * 100)}%</b> · watch BP</span></div></div>
      <div class="calc"><h4><span>Decremental PEEP trial ${tagBtn('?', 'Decremental PEEP trial')}</span></h4>
        <div class="row"><button class="btn sm pri" data-trial>${ic('trend')}Run trial (PEEP 20 → 6)</button>${trial ? `<button class="btn sm" data-best>Apply best PEEP + 2 (${trial.best + 2})</button>` : ''}</div>
        ${trial ? `<div class="cv-wrap" style="height:150px;min-height:150px;margin-top:8px"><canvas data-c="trial"></canvas></div><div class="hint">Best compliance at PEEP <b>${trial.best}</b> (Cstat ${fmt(trial.rows.find(r => r.peep === trial.best).c)} ml/cmH2O). Bars = Cstat, line = driving pressure.</div>` : '<div class="hint">Runs instantly on a copy of the current patient after a recruitment manoeuvre, Vt fixed.</div>'}</div>
      <div class="calc"><h4><span>Low-flow P-V curve ${tagBtn('?', 'Low-flow P-V curve')}</span></h4>
        <div class="row"><button class="btn sm pri" data-pv>${ic('loop')}Inflate at 5 L/min</button></div>
        ${pv ? `<div class="cv-wrap" style="height:160px;min-height:160px;margin-top:8px"><canvas data-c="pv"></canvas></div><div class="hint">LIP ≈ <b>${fmt(pv.lip)}</b> cmH2O · UIP ≈ <b>${fmt(pv.uip)}</b> cmH2O</div>` : ''}</div>
      <div class="calc"><h4><span>Drive & strength ${tagBtn('?', 'P0.1')}</span></h4>
        <div class="row"><button class="btn sm" data-p01>P0.1</button><button class="btn sm" data-nif>NIF / MIP</button><span class="hint" data-dr>${S.lastP01v != null ? `P0.1 <b>${fmt(S.lastP01v, 1)}</b>` : ''} ${S.lastNifv != null ? ` · NIF <b>${fmt(S.lastNifv)}</b>` : ''}</span></div>
        <div class="hint" data-dri></div></div>
      <div class="calc"><h4><span>Spontaneous breathing trial ${tagBtn('?', 'SBT')}</span></h4>
        ${sbt ? `<div class="sbt-bar"><i style="width:${Math.min(100, (vent.t - sbt.t0) / sbt.dur * 100)}%"></i></div><div class="hint" data-sb></div><button class="btn sm danger" data-sbtstop>Stop SBT</button>` :
        `<div class="row">${Object.entries(SBT_TYPES).map(([k, x]) => `<button class="btn sm" data-sbt="${k}">${x.en}</button>`).join('')}</div>`}
        ${res ? `<div class="sbt-res ${res.pass ? 'ok' : 'bad'}"><b>${res.aborted ? 'Stopped' : res.pass ? 'PASSED' : 'FAILED'}</b> · ${esc(res.type)} · RR ${fmt(res.rr)} · Vt ${fmt(res.vt)} · RSBI ${fmt(res.rsbi)} · SpO2 ${fmt(res.spo2)} · HR ${fmt(res.hr)}${res.reasons.length ? '<br>Failure: ' + res.reasons.map(esc).join(', ') : ''}</div>` : ''}</div>`;
    if (trial) drawTrial(); if (pv) drawPV();
  };
  const drawTrial = () => {
    const cv = $('[data-c=trial]', body); if (!cv) return;
    setupCanvas(cv, st => {
      const { ctx, W, H } = st; if (!W) return; ctx.clearRect(0, 0, W, H);
      const rows = trial.rows, cmax = Math.max(...rows.map(r => r.c)) * 1.15, dmax = Math.max(...rows.map(r => r.dp)) * 1.2;
      const pad = 26, bw = (W - pad * 2) / rows.length;
      rows.forEach((r, i) => {
        const x = pad + i * bw, h = (r.c / cmax) * (H - 30);
        ctx.fillStyle = r.peep === trial.best ? COL.accent : hexA(COL.v, .35); ctx.fillRect(x + 3, H - 18 - h, bw - 6, h);
        ctx.fillStyle = COL.muted; ctx.font = `600 10px ${COL.font}`; ctx.textAlign = 'center'; ctx.fillText(r.peep, x + bw / 2, H - 5);
        ctx.fillStyle = COL.text; ctx.fillText(fmt(r.c), x + bw / 2, H - 22 - h);
      });
      ctx.strokeStyle = COL.f; ctx.lineWidth = 2; ctx.beginPath();
      rows.forEach((r, i) => { const x = pad + i * bw + bw / 2, y = H - 18 - (r.dp / dmax) * (H - 30); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
    });
  };
  const drawPV = () => {
    const cv = $('[data-c=pv]', body); if (!cv) return;
    setupCanvas(cv, st => {
      const { ctx, W, H } = st; if (!W) return; ctx.clearRect(0, 0, W, H);
      const pts = pv.pts, vmax = Math.max(...pts.map(p => p[1])) * 1.1, pad = 34;
      const X = P => pad + P / 40 * (W - pad - 8), Y = V => H - 16 - V / vmax * (H - 24);
      ctx.strokeStyle = hexA(COL.text, .2); ctx.setLineDash([3, 4]);
      [pv.lip, pv.uip].forEach(P => { ctx.beginPath(); ctx.moveTo(X(P), 4); ctx.lineTo(X(P), H - 16); ctx.stroke(); }); ctx.setLineDash([]);
      ctx.strokeStyle = COL.p; ctx.lineWidth = 2.2; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1]))); ctx.stroke();
      ctx.fillStyle = COL.muted; ctx.font = `600 10px ${COL.font}`; ctx.textAlign = 'center';
      [0, 10, 20, 30, 40].forEach(P => ctx.fillText(P, X(P), H - 3)); ctx.textAlign = 'right'; ctx.fillText(fmt(vmax), pad - 4, 12); ctx.fillText('0', pad - 4, H - 16);
      ctx.textAlign = 'left'; ctx.fillStyle = COL.accent2; ctx.fillText('LIP', X(pv.lip) + 3, 14); ctx.fillText('UIP', X(pv.uip) + 3, 14);
    });
  };
  body.addEventListener('click', e => {
    const t = e.target;
    if (t.closest('[data-rm]')) { if (vent.startRM(40, 30)) toast('Recruitment manoeuvre: CPAP 40 for 30 s'); else toast('Not available in APRV'); }
    if (t.closest('[data-trial]')) {
      const rows = [];
      for (let pe = 20; pe >= 6; pe -= 2) {
        const v = vent.clone(); v.s.mode = 'VC-AC'; v.s.pause = 0.3; v.s.peep = pe; v.lim.pHigh = 80; v.s.trigFlow = 10; v.p.effort = 0; v.init(); v.rmState = Math.max(0, Math.min(1, (pe - 7) / 6)); v.runFor(12);
        const M = v.meas, pl = M.pplat != null ? M.pplat : M.plTrue, peT = pe + Math.max(0, M.peepiTrue);
        rows.push({ peep: pe, c: M.vti / Math.max(0.5, pl - peT), dp: pl - peT, pplat: pl });
      }
      const best = rows.reduce((a, b) => (b.c > a.c ? b : a)).peep; trial = { rows, best }; render();
    }
    if (t.closest('[data-best]') && trial) { vent.s.peep = trial.best + 2; ventChanged(true); toast('PEEP set to ' + (trial.best + 2)); }
    if (t.closest('[data-pv]')) {
      const pts = vent.lowFlowPV(); const sl = []; for (let i = 2; i < pts.length - 2; i++) sl.push([pts[i][0], (pts[i + 2][1] - pts[i - 2][1]) / (pts[i + 2][0] - pts[i - 2][0])]);
      const smax = Math.max(...sl.map(s => s[1]));
      const lip = (sl.find(s => s[1] >= 0.85 * smax) || sl[0])[0];
      const after = sl.filter(s => s[0] > lip); const uipS = after.find(s => s[1] < 0.6 * smax); const uip = uipS ? uipS[0] : 40;
      pv = { pts, lip, uip }; render();
    }
    if (t.closest('[data-p01]')) { const x = vent.p01(); S.lastP01 = Date.now(); S.lastP01v = x; save(); interp(); }
    if (t.closest('[data-nif]')) { const x = vent.nif(); S.lastNif = Date.now(); S.lastNifv = x; save(); interp(); }
    const sb = t.closest('[data-sbt]'); if (sb) { startSBT(sb.dataset.sbt); render(); }
    if (t.closest('[data-sbtstop]')) { stopSBT(true); render(); }
  });
  const interp = () => {
    const p = S.lastP01v, n = S.lastNifv; const out = [];
    if (p != null) out.push(p === 0 ? 'P0.1 = 0: no spontaneous effort.' : p < 1 ? 'P0.1 < 1: low drive (sedation / over-assistance).' : p > 4 ? 'P0.1 > 4: high drive – risk of fatigue, P-SILI.' : 'P0.1 1–4: normal drive.');
    if (n != null) out.push(n === 0 ? 'NIF: no effort.' : n > -20 ? 'NIF weaker than −20: weak muscles, likely weaning failure.' : n > -30 ? 'NIF −20 to −30: borderline.' : 'NIF stronger than −30: adequate strength.');
    $('[data-dr]', body).innerHTML = `${p != null ? `P0.1 <b>${fmt(p, 1)}</b>` : ''} ${n != null ? ` · NIF <b>${fmt(n)}</b>` : ''}`;
    $('[data-dri]', body).textContent = out.join(' ');
  };
  on('sbt', render);
  render(); interp(); let last = 0;
  return {
    frame(now) {
      if (now - last < 500) return; last = now;
      const rs = $('[data-rs]', body); if (rs) rs.textContent = fmt((vent.rmState || 0) * 100) + '%' + (vent.rm ? ' (running ' + Math.ceil(vent.rm.dur - vent.rm.t) + 's)' : '');
      if (sbt) {
        const bar = $('.sbt-bar i', body); if (!bar) return render();
        bar.style.width = Math.min(100, (vent.t - sbt.t0) / sbt.dur * 100) + '%';
        const M = vent.meas; $('[data-sb]', body).innerHTML = `${sbt.T.en} · ${fmt((vent.t - sbt.t0) / sbt.dur * 30)} / 30 min · RR <b>${fmt(M.rr)}</b> · Vt <b>${fmt(M.vte)}</b> · RSBI <b>${fmt(M.rsbi)}</b> · SpO2 <b>${fmt(M.spo2)}</b> · HR <b>${fmt(M.hr)}</b>${sbt.fail.length ? ' · <span style="color:var(--danger)">' + sbt.fail.join(', ') + '</span>' : ''}`;
      }
    }
  };
};

/* ================= Guided Lessons card ================= */
CARDS.lessons = (body) => {
  let cur = null, si = 0, snap = null, answered = null, passT = 0;
  const L = () => LANG();
  const api = {
    load(st, name) { vent.loadState(st.s, Object.assign({ ibw: vent.p.ibw }, st.p), st.f); vent.lim = Object.assign({}, ALARM_DEFAULTS, S.alarmLimits); S.scenario = null; ventChanged(true); },
    scenario(id) { const a = getAbn(id); const ibw = vent.p.ibw; loadScenario(a, a.name, a.id); vent.p.ibw = ibw; },
    preset(id) { const p = PRESETS.find(x => x.id === id); Object.assign(vent.p, PATIENT_DEFAULTS, p.p, { ibw: vent.p.ibw }); ventChanged(true); }
  };
  const enter = () => {
    const st = cur.steps[si]; answered = null; passT = 0;
    if (st.setup) st.setup(api);
    snap = { hi: vent.holdCountI, he: vent.holdCountE, t0: Date.now() };
    render();
  };
  const prog = id => S.lessonProg[id] || 0;
  const render = () => {
    const lang = L();
    if (!cur) {
      body.innerHTML = `<div class="row nowrap" style="margin-bottom:8px"><span class="hint" style="flex:1">${lang === 'bn' ? 'ধাপে ধাপে শেখো – প্রতিটি ধাপ ঠিকমতো করলে অ্যাপ নিজেই ধরে ফেলবে।' : 'Learn step by step – the app detects when you have done each step.'}</span>${langSeg()}</div>
        <div class="list">${LESSONS.map(x => { const p = prog(x.id), n = x.steps.length; return `<button class="li" data-ls="${x.id}"><span class="t">${esc(x[lang] || x.en)}<small>${x.level} · ${p >= n ? (lang === 'bn' ? 'সম্পূর্ণ ✓' : 'completed ✓') : p ? `${p}/${n}` : `${n} ${lang === 'bn' ? 'ধাপ' : 'steps'}`}</small></span><span class="lprog"><i style="width:${Math.min(100, p / n * 100)}%"></i></span></button>`; }).join('')}</div>`;
      return;
    }
    const st = cur.steps[si], n = cur.steps.length, txt = st[lang] || st.en;
    body.innerHTML = `<div class="row nowrap" style="margin-bottom:8px"><button class="btn sm" data-back>${ic('back')}${lang === 'bn' ? 'সব lesson' : 'Lessons'}</button><span style="flex:1"></span>${langSeg()}</div>
      <h3 style="margin-bottom:4px">${esc(cur[lang] || cur.en)}</h3>
      <div class="steps">${cur.steps.map((_, i) => `<i class="${i < si ? 'done' : i === si ? 'now' : ''}"></i>`).join('')}</div>
      <div class="lesson-step ${lang === 'bn' ? 'bn' : ''}"><div class="sec-h" style="margin-top:0">${lang === 'bn' ? 'ধাপ' : 'Step'} ${si + 1}/${n}</div><div class="rich">${renderRich(txt)}</div>
      ${st.t === 'choice' ? `<div class="quiz-opts" style="grid-template-columns:1fr">${st.options.map((o, i) => `<button class="quiz-opt ${answered != null ? (o.ok ? 'right' : (answered === i ? 'wrong' : '')) : ''}" data-opt="${i}">${esc(o[lang] || o.en)}</button>`).join('')}</div>` : ''}
      ${st.t === 'check' ? `<div class="check-st" data-cs>${lang === 'bn' ? '⏳ অপেক্ষা করছি…' : '⏳ Waiting for you…'}</div>` : ''}
      ${st.hint ? `<details class="adv" style="margin-top:8px"><summary>${lang === 'bn' ? 'ইঙ্গিত' : 'Hint'}</summary><div class="small">${inline(st.hint[lang] || st.hint.en)}</div></details>` : ''}</div>
      <div class="row" style="margin-top:10px">${si > 0 ? `<button class="btn sm" data-prev>${ic('back')}${lang === 'bn' ? 'আগের' : 'Previous'}</button>` : ''}
      <button class="btn sm ${st.t === 'next' || (st.t === 'choice' && answered != null) ? 'pri' : ''}" data-next>${si === n - 1 ? (lang === 'bn' ? 'শেষ' : 'Finish') : (lang === 'bn' ? 'পরের ধাপ' : 'Next')}</button>
      <button class="btn sm" data-restart>${ic('refresh')}${lang === 'bn' ? 'আবার শুরু' : 'Restart'}</button></div>`;
  };
  const next = () => {
    S.lessonProg[cur.id] = Math.max(prog(cur.id), si + 1); save();
    if (si < cur.steps.length - 1) { si++; enter(); } else { toast(L() === 'bn' ? 'Lesson শেষ ✓' : 'Lesson complete ✓'); cur = null; render(); }
  };
  body.addEventListener('click', e => {
    const t = e.target;
    const ls = t.closest('[data-ls]'); if (ls) { cur = LESSONS.find(x => x.id === ls.dataset.ls); si = 0; enter(); return; }
    if (t.closest('[data-back]')) { cur = null; render(); return; }
    if (!cur) return;
    if (t.closest('[data-prev]')) { si = Math.max(0, si - 1); enter(); return; }
    if (t.closest('[data-restart]')) { si = 0; enter(); return; }
    if (t.closest('[data-next]')) { next(); return; }
    const op = t.closest('[data-opt]'); if (op && answered == null) { answered = +op.dataset.opt; const ok = cur.steps[si].options[answered].ok; toast(ok ? '✓' : (L() === 'bn' ? 'আবার ভাবো' : 'Not quite')); render(); }
  });
  on('lang', render);
  render(); let last = 0;
  return {
    always: true,
    frame(now) {
      if (!cur || now - last < 400) return; last = now;
      const st = cur.steps[si]; if (st.t !== 'check') return;
      let ok = false; try { ok = st.check(vent, snap); } catch (e) { }
      const cs = $('[data-cs]', body); if (!cs) return;
      if (ok) { cs.textContent = L() === 'bn' ? '✓ ঠিক হয়েছে!' : '✓ Done!'; cs.classList.add('ok'); if (!passT) passT = now; else if (now - passT > 1200) next(); }
      else { passT = 0; }
    }
  };
};


/* ================= Treatments & Procedures card ================= */
const DRUGS = [
  ['sedative', 'Sedative bolus', 'Propofol / midazolam: RASS −2 for ~5 min'],
  ['opioid', 'Opioid bolus', 'Fentanyl: slower RR, pain relief'],
  ['nmb', 'Paralyse (NMB)', 'Rocuronium / cisatracurium: no effort ~10 min'],
  ['bronchodilator', 'Bronchodilator neb', 'Salbutamol + ipratropium: lowers resistance'],
  ['diuretic', 'Diuretic', 'Furosemide: less oedema / shunt'],
  ['fluid', 'Fluid 500 ml', 'Corrects hypovolaemia'],
  ['vaso', 'Noradrenaline', 'Infusion on / off: raises MAP'],
  ['antipyretic', 'Antipyretic / cooling', 'Lowers CO2 production'],
  ['adrenalineNeb', 'Adrenaline neb', 'Post-extubation stridor: shrinks laryngeal oedema'],
  ['dexamethasone', 'Dexamethasone', 'Steroid: prevents / treats laryngeal oedema']
];
const PROCS = [
  ['suctionOpen', 'Open suction'], ['suctionClosed', 'Closed suction'], ['bronch', 'Bronchoscopy'],
  ['drain', 'Chest drain'], ['cuff', 'Re-inflate cuff'], ['ett', 'Pull ETT back 2 cm'],
  ['unkink', 'Unkink / bite block'], ['water', 'Drain circuit water'], ['reintubate', 'Re-intubate'], ['prone', 'Prone / supine']
];
CARDS.treat = (body) => {
  S.txLog = S.txLog || [];
  const log = (msg) => { if (!msg) return; S.txLog.unshift({ t: Date.now(), msg }); S.txLog = S.txLog.slice(0, 12); save(); toast(msg); render(); };
  const render = () => {
    const act = (vent.tx || []).filter(x => x.onset || x.ramp);
    body.innerHTML = `<label class="lbl" style="margin-top:0">Drugs ${tagBtn('?', 'Respiratory drive')}</label>
      <div class="keys tx">${DRUGS.map(([k, l, d]) => `<button class="key ${k === 'vaso' && vent.p.vaso ? 'on' : ''}" data-drug="${k}" title="${esc(d)}"><span>${l}</span><small>${d}</small></button>`).join('')}</div>
      <label class="lbl">Procedures ${tagBtn('?', 'Bedside procedures')}</label>
      <div class="keys tx">${PROCS.map(([k, l]) => `<button class="key ${k === 'prone' && vent.p.prone ? 'on' : ''}" data-proc="${k}"><span>${l}</span></button>`).join('')}</div>
      <label class="lbl">Active effects</label><div class="tx-act" data-act></div>
      ${S.txLog.length ? `<label class="lbl">Log</label><div class="tx-log">${S.txLog.map(x => `<div><span>${new Date(x.t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>${esc(x.msg)}</div>`).join('')}</div>` : ''}`;
    upd();
  };
  const upd = () => {
    const el2 = $('[data-act]', body); if (!el2) return;
    const items = (vent.tx || []).map(x => { const left = Math.max(0, x.t0 + x.dur - vent.t); const lv = x.onset ? vent.txLevel(x.kind) : null; return `<div class="txi"><b>${esc(x.kind)}</b><span>${lv != null ? fmt(lv * 100) + '% effect · ' : 'working · '}${fmt(left)} s left</span></div>`; });
    if (vent.p.vaso) items.push('<div class="txi"><b>noradrenaline</b><span>infusion running</span></div>');
    if (vent.p.prone || vent.proneLevel > 0.05) items.push(`<div class="txi"><b>prone</b><span>${fmt(vent.proneLevel * 100)}% effect</span></div>`);
    if (vent.suction) items.push(`<div class="txi"><b>suction</b><span>${fmt(vent.suction.dur - vent.suction.t)} s</span></div>`);
    if (vent.derec > 0.03) items.push(`<div class="txi"><b>derecruitment</b><span>${fmt(vent.derec * 100)}% – recruit or raise PEEP</span></div>`);
    el2.innerHTML = items.join('') || '<span class="hint">None</span>';
  };
  body.addEventListener('click', e => {
    const d = e.target.closest('[data-drug]'); if (d) { const msg = vent.giveDrug(d.dataset.drug); vent.driveTargets(false); ventChanged(); log(msg); if (d.dataset.drug === 'nmb' && vent.p.rass > -3) setTimeout(() => toast('⚠ Sedate before paralysis!'), 900); }
    const pr = e.target.closest('[data-proc]'); if (pr) { const msg = vent.procedure(pr.dataset.proc); ventChanged(true); log(msg); }
  });
  on('vent', full => { if (full) render(); });
  render(); let last = 0;
  return { frame(now) { if (now - last < 700) return; last = now; upd(); } };
};

/* ================= Extubation phase ================= */
const EXT_PROFILES = {
  low: { en: 'Low risk', laryngeal: 0.1, cough: 1, fatigue: 0, hf: 0 },
  oedema: { en: 'Laryngeal oedema', laryngeal: 0.85, cough: 1, fatigue: 0, hf: 0 },
  cough: { en: 'Weak cough / secretions', laryngeal: 0.15, cough: 0.3, fatigue: 0, hf: 0 },
  fatigue: { en: 'Weak breathing muscles', laryngeal: 0.1, cough: 0.8, fatigue: 1, hf: 0 },
  heart: { en: 'Heart failure (needs PEEP)', laryngeal: 0.1, cough: 1, fatigue: 0, hf: 1 }
};
const EXT_DEST = { MASK: 'Face mask', HFNC: 'HFNC', NIV: 'NIV' };
let ext = null;   // running post-extubation course
function setExtProfile(k) {
  if (k === 'random') { const ks = Object.keys(EXT_PROFILES); k = ks[Math.floor(Math.random() * ks.length)]; S.extHidden = true; } else S.extHidden = false;
  const P = EXT_PROFILES[k]; S.extProfile = k; S.cuffLeak = null; S.coughTest = null;
  Object.assign(vent.p, { laryngeal: P.laryngeal, cough: P.cough, extFatigue: P.fatigue, extHF: P.hf });
  save(); ventChanged();
}
function extChecklist() {
  const M = vent.meas, s = vent.s, p = vent.p, d = vent.drv || {}, sb = S.lastSbt, out = [];
  const add = (k, st, txt, tag) => out.push({ k, st, txt, tag });
  add('SBT passed', !sb ? 'unk' : (sb.pass && !sb.aborted ? 'ok' : 'bad'), !sb ? 'Run an SBT (Manoeuvres card)' : sb.pass ? `${sb.type} · RSBI ${fmt(sb.rsbi)}` : 'Last SBT failed', 'SBT');
  add('Awake, follows commands', d.nmb > 0.1 ? 'bad' : (d.rass >= -1 && d.rass <= 1) ? 'ok' : d.rass >= -2 ? 'warn' : 'bad', `RASS ${fmt(d.rass)}${d.nmb > 0.1 ? ' · paralysed' : ''}`, 'RASS');
  const fio = s.mode === 'HFNC' ? s.fio2 : s.fio2, oxOk = M.spo2 >= 92 && fio <= 40 && (s.peep <= 8 || VMODES[s.mode].type === 'aprv');
  add('Oxygenation', oxOk ? 'ok' : (M.spo2 >= 90 && fio <= 50) ? 'warn' : 'bad', `SpO2 ${fmt(M.spo2)}% on FiO2 ${fmt(fio)}%, PEEP ${fmt(s.peep)}`, 'P/F ratio');
  const rsbi = sb && sb.rsbi ? sb.rsbi : (VMODES[s.mode].type === 'ps' ? M.rsbi : null);
  add('RSBI < 105', rsbi == null ? 'unk' : rsbi < 105 ? 'ok' : 'bad', rsbi == null ? 'measure during SBT' : 'RSBI ' + fmt(rsbi), 'RSBI');
  const nif = S.lastNifv; add('NIF ≤ −20 cmH2O', nif == null ? 'unk' : nif <= -20 ? 'ok' : 'bad', nif == null ? 'Measure NIF (Manoeuvres card)' : 'NIF ' + fmt(nif), 'NIF');
  const ct = S.coughTest; add('Cough & secretions', ct == null ? 'unk' : (ct === 'strong' && !vent.f.secretions) ? 'ok' : ct === 'strong' ? 'warn' : 'bad', ct == null ? 'Do the cough test' : `Cough ${ct}${vent.f.secretions ? ' · secretions present' : ''}`, 'Cough test');
  add('Haemodynamics stable', (M.map >= 65 && M.hr < 120 && !p.vaso) ? 'ok' : (M.map >= 65 ? 'warn' : 'bad'), `MAP ${fmt(M.map)} · HR ${fmt(M.hr)}${p.vaso ? ' · on noradrenaline' : ''}`, 'MAP');
  const cl = S.cuffLeak; add('Cuff-leak test', cl == null ? 'unk' : cl.leak >= 110 ? 'ok' : 'bad', cl == null ? 'Optional – do it in high-risk patients' : `Leak ${fmt(cl.leak)} ml (${fmt(cl.pct)}% of VTI)${cl.leak < 110 ? ' → stridor risk' : ''}`, 'Cuff-leak test');
  return out;
}
function startExtubation(dest) {
  if (ext) return; if (sbt) { toast('Finish the SBT first'); return; }
  if (vent.noTube()) { toast('Patient is not intubated'); return; }
  const p = vent.p;
  ext = { dest, t0: vent.t, dur: 240, prevS: JSON.parse(JSON.stringify(vent.s)), prevF: JSON.parse(JSON.stringify(vent.f)), prevP: { shunt: p.shunt, effort: p.effort, prr: p.prr }, bad: {}, fail: [], everFail: [], log: [] };
  ['leak', 'cuffDown', 'kink', 'mainstem', 'eso', 'water', 'disconnect', 'bpf'].forEach(k => delete vent.f[k]);
  const s = vent.s; s.mode = dest;
  if (dest === 'MASK') s.maskFlow = Math.max(6, s.maskFlow || 8);
  if (dest === 'HFNC') { s.hfFlow = 50; s.fio2 = Math.max(40, s.fio2); }
  if (dest === 'NIV') { s.ipap = 12; s.peep = 6; s.backupRR = 10; }
  if ((p.laryngeal || 0) > 0.35) vent.tx.push({ kind: 'oedema', t0: vent.t, dur: 40, ramp: { stridor: [0, (p.laryngeal - 0.3) * 18] } });
  vent.apnea = false; vent.lastBreathStart = vent.t;
  window.TURBO = 4; ventChanged(true); emit('ext');
  toast(`Extubated to ${EXT_DEST[dest]} – first 2 hours (compressed, ×4)`);
}
function endExtubation(reintubate) {
  if (!ext) return; window.TURBO = 1;
  const x = ext, p = vent.p;
  const failingNow = Object.keys(x.bad).filter(k => x.bad[k] >= 8);
  const res = { t: Date.now(), dest: EXT_DEST[x.dest], outcome: reintubate ? 'reintubated' : failingNow.length ? 'failing' : x.everFail.length ? 'rescued' : 'success', reasons: x.everFail.slice(), profile: S.extProfile || 'low' };
  S.lastExt = res; save();
  if (reintubate) {
    vent.tx = vent.tx.filter(t => !t.ramp || !('stridor' in t.ramp));
    p.stridor = 0; p.shunt = x.prevP.shunt; p.effort = x.prevP.effort; p.prr = x.prevP.prr;
    vent.s = Object.assign(vent.s, x.prevS, { mode: 'VC-AC' }); vent.f = {};
    vent.lastMandStart = vent.t - 60; vent.apnea = false;
    toast('Re-intubated – back on VC-AC');
  }
  ext = null; ventChanged(true); emit('ext');
}
const _prevTick = window.extrasTick;
window.extrasTick = (now) => {
  _prevTick(now);
  if (!ext) return;
  const el = vent.t - ext.t0, M = vent.meas, p = vent.p, f = vent.f;
  if (ext.lastS && vent.t - ext.lastS < 1) return;
  ext.lastS = vent.t;
  // course of each risk profile
  if (p.extFatigue && p.prr > 0) { p.effort = Math.max(1.5, p.effort * 0.994); p.prr = Math.min(42, p.prr + 0.18); }
  if (M.rsbi > 90 && p.prr > 0 && (p.extFatigue || (p.stridor || 0) > 5)) { p.prr = Math.min(40, p.prr + 0.08); p.effort = Math.max(ext.prevP.effort * 0.6, p.effort - 0.015); }
  if ((p.cough || 1) < 0.5 && el > 40 && !f.secretions && !(ext.physio && vent.t - ext.physio < 60)) { f.secretions = 1; vent.tx.push({ kind: 'plugging', t0: vent.t, dur: 60, ramp: { shunt: [p.shunt, Math.min(60, p.shunt + 12)] } }); ventChanged(); }
  if (p.extHF) { const tgt = ext.prevP.shunt + (vent.s.mode === 'MASK' ? 20 : vent.s.mode === 'HFNC' ? 9 : 2); p.shunt += (tgt - p.shunt) * 0.03; }
  // failure criteria (sustained 8 s)
  const chk = (k, bad) => { ext.bad[k] = bad ? (ext.bad[k] || 0) + 1 : 0; if (ext.bad[k] >= 8 && !ext.everFail.includes(k)) ext.everFail.push(k); };
  if (el > 15) {
    chk('Stridor', (p.stridor || 0) > 5); chk('RR > 35', M.rr > 35); chk('SpO2 < 90%', M.spo2 < 90);
    chk('HR > 140', M.hr > 140); chk('pH < 7.30 (rising PaCO2)', M.ph < 7.30); chk('Cannot clear secretions', !!f.secretions && (p.cough || 1) < 0.5);
  }
  if (el >= ext.dur) endExtubation(false);
};
CARDS.extubation = (body) => {
  const ST = { ok: ['✓', 'ok'], warn: ['!', 'warn'], bad: ['✕', 'bad'], unk: ['?', 'unk'] };
  const render = () => {
    const prof = S.extProfile || 'low', res = S.lastExt;
    if (ext) {
      body.innerHTML = `<div class="calc"><h4><span>After extubation · ${EXT_DEST[ext.dest]} ${tagBtn('?', 'topic:extubfail')}</span></h4>
        <div class="sbt-bar"><i data-xb></i></div><div class="hint" data-xs></div><div class="ext-fail" data-xf></div>
        <label class="lbl">Act</label>
        <div class="row"><button class="btn sm" data-xd="adrenalineNeb">Adrenaline neb</button><button class="btn sm" data-xd="dexamethasone">Dexamethasone</button><button class="btn sm" data-xphys>Chest physio / cough assist</button><button class="btn sm" data-o2b>O2 boost</button></div>
        <div class="row" style="margin-top:6px">${Object.keys(EXT_DEST).filter(k => k !== vent.s.mode).map(k => `<button class="btn sm" data-xto="${k}">Switch to ${EXT_DEST[k]}</button>`).join('')}<button class="btn sm danger" data-xre>${ic('refresh')}Re-intubate</button><button class="btn sm" data-xstop>End observation</button></div></div>`;
      upd(); return;
    }
    const list = extChecklist(), n = list.filter(x => x.st === 'ok').length;
    body.innerHTML = `<div class="calc"><h4><span>Patient profile ${tagBtn('?', 'topic:extubation')}</span></h4>
        <div class="row">${Object.entries(EXT_PROFILES).map(([k, x]) => `<button class="chip sm ${!S.extHidden && k === prof ? 'on' : ''}" data-xp="${k}">${x.en}</button>`).join('')}<button class="chip sm ${S.extHidden ? 'on' : ''}" data-xp="random">Random (hidden)</button></div>
        ${S.extHidden ? `<div class="hint">Hidden profile – find the risk with the tests. <button class="btn sm" data-reveal>Reveal</button></div>` : ''}</div>
      <div class="calc"><h4><span>Readiness checklist · ${n}/${list.length} ${tagBtn('?', 'topic:extubation')}</span></h4>
        <div class="ext-list">${list.map(x => `<div class="ext-i ${ST[x.st][1]}"><i>${ST[x.st][0]}</i><div><b>${tagBtn(x.k, x.tag)}</b><span>${esc(x.txt)}</span></div></div>`).join('')}</div>
        <div class="row" style="margin-top:8px"><button class="btn sm" data-xcl>${ic('drop')}Cuff-leak test</button><button class="btn sm" data-xct>Cough test</button><button class="btn sm" data-xnif>NIF</button><button class="btn sm" data-xd="dexamethasone">Dexamethasone (pre-extubation)</button></div></div>
      <div class="calc"><h4><span>Extubate to ${tagBtn('?', 'topic:extubation')}</span></h4>
        <div class="row">${Object.entries(EXT_DEST).map(([k, l]) => `<button class="btn sm pri" data-xto="${k}">${l}</button>`).join('')}</div>
        ${res ? `<div class="sbt-res ${res.outcome === 'success' ? 'ok' : res.outcome === 'rescued' ? '' : 'bad'}"><b>${{ success: 'SUCCESS', rescued: 'RECOVERED WITH TREATMENT', failing: 'FAILING – re-intubate', reintubated: 'RE-INTUBATED' }[res.outcome]}</b> · ${esc(res.dest)} · profile: ${esc((EXT_PROFILES[res.profile] || {}).en || res.profile)}${res.reasons.length ? '<br>Problems: ' + res.reasons.map(esc).join(', ') : ''}</div>` : ''}</div>`;
  };
  const upd = () => {
    if (!ext) return; const M = vent.meas, el = vent.t - ext.t0;
    const b = $('[data-xb]', body); if (!b) return render();
    b.style.width = Math.min(100, el / ext.dur * 100) + '%';
    $('[data-xs]', body).innerHTML = `${fmt(el / ext.dur * 120)} / 120 min · RR <b>${fmt(M.rr)}</b> · Vt <b>${fmt(M.vte)}</b> · SpO2 <b>${fmt(M.spo2)}</b> · FiO2 ≈ <b>${fmt(M.fio2Del || vent.s.fio2)}</b> · PaCO2 <b>${fmtU(M.paco2, 'mmHg')}</b> · pH <b>${fmt(M.ph, 2)}</b> · HR <b>${fmt(M.hr)}</b>${(vent.p.stridor || 0) > 3 ? ' · <span style="color:var(--danger)">stridor</span>' : ''}`;
    const now = Object.keys(ext.bad).filter(k => ext.bad[k] >= 8);
    $('[data-xf]', body).innerHTML = now.length ? `<span style="color:var(--danger)">Failing: ${now.map(esc).join(', ')}</span>` : ext.everFail.length ? `<span class="hint">Earlier: ${ext.everFail.map(esc).join(', ')}</span>` : '<span class="hint">No failure signs</span>';
  };
  body.addEventListener('click', e => {
    const t = e.target;
    const xp = t.closest('[data-xp]'); if (xp) { setExtProfile(xp.dataset.xp); render(); }
    if (t.closest('[data-reveal]')) { S.extHidden = false; save(); render(); }
    if (t.closest('[data-xcl]')) { const r = vent.cuffLeakTest(); if (!r) toast('Needs an intubated patient'); else { S.cuffLeak = r; save(); toast(`Cuff leak ${fmt(r.leak)} ml`); render(); } }
    if (t.closest('[data-xct]')) { if (!vent.spont() || vent.drv.rass < -2) toast('Patient cannot cough on command (sedated / not breathing)'); else { S.coughTest = (vent.p.cough || 1) >= 0.5 ? 'strong' : 'weak'; save(); render(); } }
    if (t.closest('[data-xnif]')) { const x = vent.nif(); S.lastNif = Date.now(); S.lastNifv = x; save(); render(); }
    const xd = t.closest('[data-xd]'); if (xd) { toast(vent.giveDrug(xd.dataset.xd)); ventChanged(); }
    if (t.closest('[data-xphys]')) { if (ext) ext.physio = vent.t; if (vent.f.secretions) { delete vent.f.secretions; vent.tx.push({ kind: 'clearing', t0: vent.t, dur: 60, ramp: { shunt: [vent.p.shunt, Math.max(ext ? ext.prevP.shunt : 5, vent.p.shunt - 12)] } }); toast('Secretions cleared'); } else toast('Chest physio done'); ventChanged(); }
    if (t.closest('[data-o2b]')) { if (vent.s.mode === 'MASK') { vent.s.maskFlow = 15; toast('Mask O2 15 L/min'); } else startO2(); ventChanged(true); }
    const to = t.closest('[data-xto]'); if (to) {
      const d = to.dataset.xto;
      if (ext) { vent.s.mode = d; if (d === 'NIV') { vent.s.ipap = 12; vent.s.peep = 6; vent.s.backupRR = 10; } if (d === 'HFNC') vent.s.hfFlow = 50; ext.log.push(d); ventChanged(true); render(); return; }
      const miss = extChecklist().filter(x => x.st === 'bad' || x.st === 'unk').map(x => x.k);
      if (miss.length) dialog({ title: 'Extubate now?', msg: 'Not done / not met: ' + miss.join(', ') + '.', ok: 'Extubate', danger: true }).then(ok => { if (ok) { startExtubation(d); render(); } });
      else { startExtubation(d); render(); }
    }
    if (t.closest('[data-xre]')) { endExtubation(true); render(); }
    if (t.closest('[data-xstop]')) { endExtubation(false); render(); }
  });
  on('ext', render); on('sbt', render);
  render(); let last = 0;
  return { frame(now) { if (now - last < 600) return; last = now; if (ext) upd(); else if (!ext && $('[data-xb]', body)) render(); else if (now % 3000 < 700) render(); } };
};
