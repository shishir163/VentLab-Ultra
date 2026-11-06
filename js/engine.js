/* VentLab Ultra — ventilator physics engine
 * Single-compartment lung model (equation of motion):
 *   Paw = R·Flow + Pel(V) − Pmus
 * V is absolute lung volume above relaxed FRC (ZEEP), so PEEP, auto-PEEP,
 * lower/upper inflection points all emerge from the same equation.
 * Teaching simulator — not a clinical device.
 */
'use strict';

const VMODES = {
  'VC-AC':   { name: 'VC-AC',   full: 'Volume Control – Assist/Control (CMV)', type: 'vc' },
  'PC-AC':   { name: 'PC-AC',   full: 'Pressure Control – Assist/Control', type: 'pc' },
  'PRVC':    { name: 'PRVC',    full: 'Pressure-Regulated Volume Control (VC+, Autoflow)', type: 'prvc' },
  'SIMV-VC': { name: 'SIMV-VC', full: 'SIMV (Volume) + Pressure Support', type: 'vc', simv: true },
  'SIMV-PC': { name: 'SIMV-PC', full: 'SIMV (Pressure) + Pressure Support', type: 'pc', simv: true },
  'PSV':     { name: 'PSV',     full: 'Pressure Support Ventilation (spontaneous)', type: 'ps' },
  'CPAP':    { name: 'CPAP',    full: 'Continuous Positive Airway Pressure', type: 'ps', cpap: true },
  'VS':      { name: 'VS',      full: 'Volume Support (PS that targets a tidal volume)', type: 'ps', vs: true },
  'NIV':     { name: 'NIV',     full: 'Non-invasive ventilation – mask, IPAP/EPAP (S/T)', type: 'ps', niv: true },
  'HFNC':    { name: 'HFNC',    full: 'High-flow nasal cannula (not a ventilator mode – oxygen therapy)', type: 'ps', cpap: true, hfnc: true },
  'APRV':    { name: 'APRV',    full: 'Airway Pressure Release Ventilation / BiLevel', type: 'aprv' },
  'PAV':     { name: 'PAV+',    full: 'Proportional Assist Ventilation (PB PAV+ / Dräger SPN-PPS)', type: 'ps', pav: true },
  'TC':      { name: 'TC',      full: 'Tube Compensation only (spontaneous)', type: 'ps', tc: true },
  'MASK':    { name: 'Face mask', full: 'Extubated – oxygen by face mask (not a ventilator mode)', type: 'ps', cpap: true, hfnc: true, mask: true }
};

const VENT_DEFAULTS = {
  mode: 'VC-AC', rr: 16, vt: 450, pinsp: 12, ti: 1.0, flowPattern: 'square', pause: 0,
  rise: 0.15, peep: 5, fio2: 40, trigType: 'flow', trigFlow: 2, trigP: 2,
  ps: 10, cycle: 25, phigh: 25, plow: 0, thigh: 4.0, tlow: 0.6, apneaTime: 20,
  ipap: 14, backupRR: 12, sighEvery: 0, maxTi: 2.0, leakComp: true, atc: 0, ett: 7.5, hfFlow: 50,
  pavSupp: 70, pavEsens: 3, humid: 'heated', maskFlow: 8
};
const PATIENT_DEFAULTS = { C: 50, Ri: 8, Re: 10, effort: 0, prr: 0, nti: 1.0, ibw: 70,
  shunt: 5, deadAlv: 5, recruit: 30, vco2: 200, hco3: 24, hb: 12, vdAnat: 150,
  hypovol: 0, cwFrac: 20, pes0: 4, rass: 0, autoDrive: 1, prone: 0, vaso: 0, laryngeal: 0, stridor: 0, cough: 1 };
const ALARM_DEFAULTS = { pHigh: 40, pLow: 8, vteLow: 250, mvLow: 4, mvHigh: 16, rrHigh: 35, leakHigh: 25, apnea: 20, spo2Low: 90, etco2High: 50, etco2Low: 25, mapLow: 65, hrHigh: 130 };

/* Which settings each mode shows */
const ETT_R = { 6.5: 9, 7: 7, 7.5: 5.5, 8: 4, 8.5: 3 };
const MODE_SETTINGS = {
  'VC-AC':   ['rr', 'vt', 'ti', 'flowPattern', 'pause', 'peep', 'fio2', 'trigger'],
  'PC-AC':   ['rr', 'pinsp', 'ti', 'rise', 'peep', 'fio2', 'trigger'],
  'PRVC':    ['rr', 'vt', 'ti', 'rise', 'peep', 'fio2', 'trigger'],
  'SIMV-VC': ['rr', 'vt', 'ti', 'flowPattern', 'pause', 'ps', 'cycle', 'rise', 'peep', 'fio2', 'trigger'],
  'SIMV-PC': ['rr', 'pinsp', 'ti', 'rise', 'ps', 'cycle', 'peep', 'fio2', 'trigger'],
  'PSV':     ['ps', 'peep', 'rise', 'cycle', 'fio2', 'trigger', 'apneaTime'],
  'CPAP':    ['peep', 'fio2', 'trigger', 'apneaTime'],
  'VS':      ['vt', 'peep', 'rise', 'cycle', 'fio2', 'trigger', 'apneaTime'],
  'NIV':     ['ipap', 'peep', 'backupRR', 'rise', 'cycle', 'fio2', 'trigger'],
  'HFNC':    ['hfFlow', 'fio2'],
  'APRV':    ['phigh', 'plow', 'thigh', 'tlow', 'rise', 'fio2'],
  'PAV':     ['pavSupp', 'pavEsens', 'peep', 'fio2', 'trigger', 'apneaTime'],
  'TC':      ['atc', 'peep', 'cycle', 'fio2', 'trigger', 'apneaTime'],
  'MASK':    ['maskFlow']
};

class Ventilator {
  constructor() {
    this.s = Object.assign({}, VENT_DEFAULTS);
    this.p = Object.assign({}, PATIENT_DEFAULTS);
    this.f = {};
    this.lim = Object.assign({}, ALARM_DEFAULTS);
    this.SR = 100;              // display samples per second
    this.N = 60 * this.SR;      // 60 s ring buffer
    this.buf = {
      P: new Float32Array(this.N), F: new Float32Array(this.N), V: new Float32Array(this.N),
      M: new Float32Array(this.N), C: new Float32Array(this.N), E: new Float32Array(this.N), A: new Float32Array(this.N), ph: new Uint8Array(this.N)
    };
    this.loadState({}, {}, {});
  }

  /* ---------- lung mechanics ---------- */
  Ceff() {
    let C = this.p.C;
    if (this.f.ptx) C *= 0.5;
    if (this.f.mainstem) C *= 0.5;
    if (this.f.plug) C *= 0.7;
    C *= (1 - this.collapse());
    return Math.max(5, C) / 1000; // L/cmH2O
  }
  peepEff() { return this.modeDef().type === 'aprv' ? Math.max(this.s.plow, (this.pmean || 10) * 0.85) : (this.rm ? this.rm.p : this.s.peep); }
  /* fraction of the lung collapsed at the current PEEP (recruitable lungs only) */
  collapse() {
    const r = (this.p.recruit || 0) / 100, pe = this.peepEff();
    return Math.min(0.7, r * 0.55 / (1 + Math.exp((pe - 9) / 2.2)) * (1 - 0.6 * (this.rmState || 0)) + (this.derec || 0) * (0.3 + r));
  }
  noTube() { const m = this.modeDef(); return m.hfnc || m.niv ? 4 : 0; }
  /* extra resistance: HME on an intubated patient; post-extubation stridor (extrathoracic, worse on inspiration) */
  extraR(insp) { const nt = this.noTube(); return (nt ? (this.p.stridor || 0) * (insp ? 1 : 0.4) : 0) + (!nt && this.s.humid === 'hme' ? 1 : 0); }
  Ri() { const f = this.f; return Math.max(2, this.p.Ri - this.noTube()) + this.extraR(true) + (f.kink ? 22 : 0) + (f.secretions ? 6 : 0) + (f.plug ? 12 : 0) + (f.mainstem ? 3 : 0); }
  Re() { const f = this.f; return Math.max(2, this.p.Re - this.noTube()) + this.extraR(false) + (f.kink ? 22 : 0) + (f.secretions ? 6 : 0) + (f.plug ? 12 : 0) + (f.mainstem ? 3 : 0); }
  el(V) {
    const C = this.Ceff();
    let p = V / C;
    if (this.f.lip) p += 55 * Math.min(Math.max(V, 0), 0.16);
    if (this.f.uip) { const x = Math.max(0, V - 0.6); p += 150 * x * x; }
    if (this.f.ptx) p += 4;
    const vu = this.p.C / 1000 * 25;               // physiological stiffening near total capacity
    if (V > vu) { const x = V - vu; p += 90 * x * x; }
    return p;
  }
  baselineV(P) {
    let lo = -1, hi = 4;
    for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (this.el(m) > P) hi = m; else lo = m; }
    return (lo + hi) / 2;
  }

  /* ---------- state ---------- */
  init() {
    this.t = 0; this.phase = 'exp'; this.tPhase = 0; this.tBreath = 0;
    this.kind = null; this.breathType = null;
    this.lastMandStart = -1e3; this.lastBreathStart = 0;
    const base = this.s.mode === 'APRV' ? this.s.plow : this.s.peep;
    this.V = this.baselineV(base);
    this.Vd = 0; this.Paw = base; this.Q = 0; this.Qd = 0; this.Qleak = 0;
    this.tx = this.tx || []; this.derec = this.derec || 0; this.proneLevel = this.proneLevel || 0; this.suction = null;
    this.drv = { effort: 0, prr: 0, rass: this.p.rass, nmb: 0 }; this.driveTargets(true);
    this.nt = Math.random() * 2; this.nPeriod = this.drv.prr > 0 ? 60 / this.drv.prr : 4; this.pmus = 0; this.revStart = -1;
    this.trigAcc = 0; this.prvcP = 10; this.qpk = 0; this.apnea = false; this.apneaSince = 0;
    this.holdReq = { i: false, e: false }; this.holdT = 0;
    this.cur = this.newRec('M'); this.breaths = []; this.loop = []; this.lastLoop = null;
    this.pmean = base; this.idx = 0; this.sampAcc = 0; this.markers = [];
    this.aprvHigh = true; this.aprvFrom = this.s.plow; this.aprvPeakExp = 0;
    this.meas = {
      ppeak: 0, pplat: null, pplatAge: 0, peep: base, peepTot: null, peepTotAge: 0, pmean: base,
      vti: 0, vte: 0, rr: 0, mve: 0, ti: 0, ie: '', cdyn: 0, cstat: null, raw: null, dp: null,
      leak: 0, rsbi: 0, mp: null, tau: 0, peepiTrue: 0, endExpFlow: 0, qpk: 0, pinspAuto: null,
      termPct: null, spontRR: 0
    };
    this.alarms = []; this.lastAlarmEval = 0; this.vcPressureCycled = false;
    this.rmState = this.rmState || 0; this.rm = null; this.standby = false; this.vsP = 10; this.breathCount = 0;
    this.holdCountI = 0; this.holdCountE = 0; this.pes = this.p.pes0;
    this.hemo = { map: 85, hr: 80, tMap: 85, tHr: 80, sbp: 115, dbp: 70, cvp: 8, ppv: 5, co: 5 };
    this.vexp = 0; this.co2 = 0; this.co2Peak = 0; this.expT = 0;
    this.gas = { paco2: 40, pao2: 95, tPaco2: 40, tPao2: 95, shunt: this.p.shunt / 100, dead: this.p.deadAlv / 100, va: 4.5, etco2: 35, pAO2: 100 };
    this.gasTargets(true);
    this.updateGasMeas();
    this.hemoTargets(); this.hemo.map = this.hemo.tMap; this.hemo.hr = this.hemo.tHr; this.updateHemoMeas();
  }
  isOpen() { return !!(this.f.disconnect || this.standby || (this.suction && this.suction.open)); }
  newRec(type) {
    return { t0: this.t || 0, type, vti: 0, vte: 0, ppeak: -99, pplat: null, peepTot: null, qpk: 0, ti: 0, tEndInsp: null,
             endExpFlow: 0, peepiTrue: 0, plTrue: null, peakExp: 0, co2Peak: 0, wob: 0 };
  }
  loadState(s, p, f) {
    this.rmState = 0; this.tx = []; this.derec = 0; this.proneLevel = (p && p.prone) ? 1 : 0;
    this.s = Object.assign({}, VENT_DEFAULTS, s || {});
    p = Object.assign({}, p || {});
    // passive patients are modelled as deeply sedated people with a normal awake drive
    if (p.effort === undefined) { p.effort = 6; if (p.prr === undefined) p.prr = 14; if (p.nti === undefined) p.nti = 0.9; if (p.rass === undefined) p.rass = -5; }
    else if (p.rass === undefined) p.rass = 0;
    this.p = Object.assign({}, PATIENT_DEFAULTS, p);
    this.f = Object.assign({}, f || {});
    this.init();
  }

  /* ---------- patient neural drive ---------- */
  updatePmus(dt) {
    const p = this.p, d = this.drv; let pm = 0;
    if (d.effort > 0 && d.prr > 0) {
      this.nt += dt;
      if (this.nt >= this.nPeriod) { this.nt -= this.nPeriod; this.nPeriod = (60 / d.prr) * (0.93 + Math.random() * 0.14); }
      const ti = Math.min(p.nti, this.nPeriod * 0.8);
      if (this.nt < ti) pm = d.effort * Math.sin(Math.PI * this.nt / ti);
      else if (this.f.activeExp) {
        const te = this.nt - ti; if (te < 0.7) pm = -9 * Math.sin(Math.PI * te / 0.7);
      }
    }
    if (this.f.reverse && this.revStart > 0 && this.t >= this.revStart) {
      const x = this.t - this.revStart; const d = 0.9;
      if (x < d) pm += 8 * Math.sin(Math.PI * x / d); else this.revStart = -1;
    }
    if (this.f.hiccup) {
      const x = (this.t % 3.3); if (x < 0.25) pm += 14 * Math.sin(Math.PI * x / 0.25);
    }
    this.pmus = pm;
  }

  /* additive signal artefacts (flow L/s, pressure cmH2O) */
  noise() {
    const t = this.t, f = this.f; let nq = 0, np = 0;
    if (f.secretions) {
      const saw = ((t * 9) % 1) * 2 - 1; const a = 0.6 + 0.4 * Math.sin(t * 1.7);
      nq += 0.07 * saw * a; np += 0.9 * saw * a;
    }
    if (f.water) {
      const w = Math.sin(2 * Math.PI * 4.6 * t) * 0.6 + Math.sin(2 * Math.PI * 2.9 * t + 1) * 0.4;
      const k = this.phase === 'exp' ? 1 : 0.4; nq += 0.06 * w * k; np += 0.7 * w * k;
    }
    if (f.cardiac) { const c = Math.sin(2 * Math.PI * 1.6 * t); nq += 0.065 * c; np += 0.35 * c; }
    return [nq, np];
  }

  /* ---------- breath control ---------- */
  modeDef() { return VMODES[this.s.mode] || VMODES['VC-AC']; }

  finalizeBreath() {
    const c = this.cur; if (!c || c.t0 === undefined) return;
    if (c.ppeak < -50) return;
    c.dur = this.t - c.t0;
    c.endExpFlow = this.Qd * 60;
    this.breaths.push(c); if (this.breaths.length > 60) this.breaths.shift();
    this.computeMeasurements(c);
  }

  startBreath(bt, kind) {
    const s = this.s, m = this.modeDef();
    this.cur.endExpFlow = this.Qd * 60;
    this.finalizeBreath();
    if (this.loop.length > 4) this.lastLoop = this.loop;
    this.loop = [];
    this.phase = 'insp'; this.kind = kind; this.breathType = bt; this.tPhase = 0; this.tBreath = 0;
    this.Vd = 0; this.qpk = 0; this.trigAcc = 0; this.vcPressureCycled = false;
    this.cur = this.newRec(bt); this.cur.t0 = this.t; this.cur.v0 = this.V; this.cur.vmax = this.V;
    this.cur.peepiTrue = this.el(this.V) - s.peep;
    this.lastBreathStart = this.t;
    if (bt === 'M' || bt === 'A') this.lastMandStart = this.t;
    this.markers.push({ i: this.idx, type: bt }); if (this.markers.length > 200) this.markers.shift();
    if (this.f.reverse && bt === 'M') this.revStart = this.t + 0.45;
    this.bTi = this.apnea ? 1.0 : s.ti;
    this.breathCount++;
    const sigh = bt !== 'S' && s.sighEvery > 0 && this.breathCount % s.sighEvery === 0;
    if (sigh) this.markers.push({ i: this.idx, type: 'σ' });
    if (kind === 'vc') {
      const Tf = Math.max(0.2, s.ti - s.pause), vt = s.vt / 1000 * (sigh ? 1.5 : 1); this.vcTf = Tf;
      if (s.flowPattern === 'decel') { this.vcQ0 = 2 * vt / (1.25 * Tf); this.vcQ1 = 0.25 * this.vcQ0; }
      else { this.vcQ0 = vt / Tf; this.vcQ1 = this.vcQ0; }
    }
    if (kind === 'pc') this.dP = (this.apnea ? 15 : (m.type === 'prvc' ? this.prvcP : m.niv ? s.ipap - s.peep : s.pinsp)) + (sigh ? 8 : 0);
    if (kind === 'ps') this.dP = (m.cpap || m.tc || m.pav) ? 0 : m.vs ? this.vsP : m.niv ? Math.max(0, s.ipap - s.peep) : s.ps;
    if (m.pav) this.pavP = this.Paw;
    if (bt === 'M' && m.niv) this.bTi = 1.0;
    this.pFrom = this.Paw;
  }

  pTarget(base, dP, t) {
    const r = Math.max(0.02, this.s.rise);
    let p = base + dP * (1 - Math.exp(-t / (r / 3)));
    if (this.s.rise < 0.06 && dP > 0) p += dP * 0.28 * Math.exp(-t / 0.035) * (1 - Math.exp(-t / 0.008));
    return p;
  }

  triggerSignal(el, pm, np, nq) {
    const s = this.s;
    if (s.trigType === 'pressure') {
      const net = pm - (el - s.peep);
      return (net * 0.9 - np) > s.trigP;
    }
    return ((this.Q + nq + (s.leakComp ? 0 : this.Qleak)) * 60) > s.trigFlow;
  }

  step(dt) {
    const s = this.s, f = this.f, m = this.modeDef();
    this.t += dt; this.tPhase += dt; this.tBreath += dt;
    if (m.mask) s.peep = 0; else if (m.hfnc) s.peep = Math.round(s.hfFlow * 0.07 * 10) / 10;
    this.stepPatient(dt);
    this.updatePmus(dt);
    const pm = this.pmus, Ri = this.Ri(), Re = this.Re();
    const el = this.el(this.V);
    const [nq, np] = this.noise();
    let Paw, Q, Qd;
    const open = this.isOpen();
    const leakK = (f.leak ? 0.028 : 0) + (m.niv ? 0.02 : 0) + (f.cuffDown ? 0.004 + 0.05 * Math.pow(Math.max(0, 1 - (this.p.laryngeal || 0)), 1.4) : 0);
    const bpfK = f.bpf ? 0.03 : 0;

    if (this.rm) {                       // recruitment manoeuvre: sustained CPAP
      const r = this.rm; r.t += dt;
      const Pt = r.from + (r.p - r.from) * (1 - Math.exp(-r.t / 0.8));
      const q0 = Pt - el + pm; Q = q0 > 0 ? q0 / Ri : q0 / Re; Paw = Pt; this.phase = 'rm';
      if (r.t >= r.dur) { this.rm = null; this.rmState = 1; this.phase = 'exp'; this.tPhase = 0; this.lastMandStart = this.t - 60; this.lastBreathStart = this.t; this.pFrom = Paw; }
    } else if (m.type === 'aprv') {
      const hi = this.aprvHigh;
      const lvl = hi ? s.phigh : s.plow, from = this.aprvFrom;
      if (hi && this.tPhase >= s.thigh) { this.aprvSwitch(false); }
      else if (!hi && this.tPhase >= s.tlow) { this.aprvSwitch(true); }
      const Pt = from + (lvl - from) * (1 - Math.exp(-this.tPhase / Math.max(0.015, s.rise / 3)));
      const q0 = Pt - el + pm;
      Q = q0 > 0 ? q0 / Ri : q0 / Re;
      Paw = Pt;
      this.phase = this.aprvHigh ? 'insp' : 'exp';
      if (!this.aprvHigh) { if (Q < this.aprvPeakExp) this.aprvPeakExp = Q; }
    } else {
      switch (this.phase) {
        case 'insp': {
          if (open) {
            Q = (0 - el + pm) / Re; Paw = 0.8;
            Qd = this.standby ? 0 : (this.kind === 'vc' ? this.vcFlow(this.tPhase) : 1.6); if (this.standby) Paw = 0;
            const tiLim = this.kind === 'ps' ? s.maxTi : this.bTi;
            if (this.tPhase >= tiLim) this.endInsp();
            break;
          }
          if (this.kind === 'vc') {
            const qset = this.vcFlow(this.tPhase);
            Q = qset - this.Qleak;
            Paw = Ri * Q + el - pm;
            if (this.tPhase >= this.vcTf) { if (s.pause > 0) { this.phase = 'pause'; this.tPhase = 0; } else this.endInsp(); }
            if (Paw > this.lim.pHigh) { this.vcPressureCycled = true; this.raise('High pressure – breath cycled', 'high'); this.endInsp(); }
            Qd = qset;
          } else if (this.kind === 'ps' && m.pav) {
            // PAV+: pressure proportional to the patient's own effort (flow and volume assist)
            const a = Math.min(0.95, Math.max(0.05, s.pavSupp / 100));
            const tgt = s.peep + a * (Ri * Math.max(0, this.Q) + Math.max(0, el - s.peep));
            this.pavP += (Math.min(this.lim.pHigh - 2, tgt) - this.pavP) * Math.min(1, dt / 0.04);
            Paw = this.pavP;
            const q0 = Paw - el + pm; Q = q0 > 0 ? q0 / Ri : q0 / Re; Qd = Q + this.Qleak;
            if (Q > this.qpk) this.qpk = Q;
            if ((this.tPhase > 0.15 && Q * 60 < s.pavEsens) || this.tPhase > s.maxTi) this.endInsp();
          } else {
            const Pt = this.pTarget(this.pFrom, (s.peep + this.dP) - this.pFrom, this.tPhase);
            // active expiratory push during inspiration gives an end-inspiratory pressure spike
            let spike = 0; if (pm < 0 && this.kind === 'ps') spike = -pm * 0.55;
            const atcPct = m.tc ? (s.atc || 100) : s.atc;
            const atc = (this.kind === 'ps' && atcPct > 0 && !this.noTube()) ? (atcPct / 100) * (ETT_R[s.ett] || 5.5) : 0;
            const q0 = Pt - el + pm;
            Q = q0 > 0 ? q0 / Math.max(1, Ri - atc) : q0 / Re;
            Paw = Pt + spike + (Q > 0 ? atc * Q : 0);
            Qd = Q + this.Qleak;
            if (Q > this.qpk) this.qpk = Q;
            if (this.kind === 'ps') {
              const cyc = this.tPhase > 0.12 && Q < this.qpk * (s.cycle / 100);
              if (cyc || this.tPhase > s.maxTi || spike > 2.5) this.endInsp();
            } else if (this.tPhase >= this.bTi) this.endInsp();
          }
          break;
        }
        case 'pause': {
          Q = 0; Paw = el - pm; Qd = 0;
          if (this.tPhase >= s.pause) {
            if (s.pause >= 0.2) { this.cur.pplat = Paw; }
            this.endInsp();
          }
          break;
        }
        case 'ihold': {
          this.cur.hold = true; Q = 0; Paw = el - pm; Qd = 0;
          if (this.tPhase >= 0.7) { this.cur.pplat = Paw; this.meas.pplat = Paw; this.meas.pplatAge = 0; this.holdReq.i = false; this.holdCountI++; this.phase = 'exp'; this.tPhase = 0; this.cur.tEndInsp = this.t; }
          break;
        }
        case 'ehold': {
          this.cur.hold = true; Q = 0; Qd = 0;
          const target = el - pm;
          Paw = this.Paw + (target - this.Paw) * Math.min(1, dt / 0.06);
          if (this.tPhase >= 0.8) {
            this.cur.peepTot = Paw; this.meas.peepTot = Paw; this.meas.peepTotAge = 0; this.holdReq.e = false; this.holdCountE++;
            this.startBreath('M', this.mandKind());
          }
          break;
        }
        default: { // exp
          if (open) {
            Q = (0 - el + pm) / Re; Paw = this.standby ? 0 : (this.suction && this.suction.open ? -2 : 0.3); Qd = 0;
          } else {
            const net = Math.max(0, pm - (el - s.peep));
            const dip = (s.trigType === 'pressure' ? 0.9 : 0.3) * Math.min(net, s.trigType === 'pressure' ? s.trigP + 0.5 : 99);
            Paw = s.peep - dip;
            const q0 = Paw - el + pm;
            Q = q0 > 0 ? q0 / Ri : q0 / Re;
            Qd = Q + this.Qleak;
          }
          this.decideNext(el, pm, np, nq);
        }
      }
    }
    if (Qd === undefined) Qd = Q + this.Qleak;
    // leaks
    this.Qleak = leakK * Math.sqrt(Math.max(Paw, 0));
    const Qb = bpfK * Math.sqrt(Math.max(el, 0));
    if (open) this.Qleak = 0;
    this.V += (Q - Qb) * dt;
    if (this.V < -0.6) this.V = -0.6;
    // displayed signals with artefacts
    Qd += nq; Paw += np;
    this.Q = Q; this.Qd = Qd; this.Paw = Paw;
    this.Vd += Qd * dt;
    // breath accounting
    const c = this.cur;
    if (c.vmax != null && this.V > c.vmax) c.vmax = this.V;
    if (this.phase === 'insp' || this.phase === 'pause' || this.phase === 'ihold') {
      if (Qd > 0) c.vti += Qd * dt;
      if (Q > 0 && pm > 0) c.wob += pm * Q * dt;
      if (Paw > c.ppeak) c.ppeak = Paw;
      if (Qd > c.qpk) c.qpk = Qd;
    } else {
      if (Qd < 0) c.vte += -Qd * dt;
      if (Qd < c.peakExp) c.peakExp = Qd;
      if (c.ppeak < -50) c.ppeak = Paw;
    }
    this.pmean += (Paw - this.pmean) * Math.min(1, dt / 8);
    if (this.rmState > 0 && !this.rm) this.rmState -= this.rmState * dt / (this.peepEff() >= 12 ? 1500 : 60);
    this.pes = this.p.pes0 + (this.p.cwFrac / 100 + 0.1 * (this.proneLevel || 0)) * this.el(this.V) - pm;
    this.stepHemo(dt);
    // gas dynamics + capnogram
    const g = this.gas;
    g.paco2 += (g.tPaco2 - g.paco2) * Math.min(1, dt / 20);
    g.pao2 += (g.tPao2 - g.pao2) * Math.min(1, dt / 7);
    this.co2 = this.capno(dt, pm);
    if (this.phase === 'exp' && this.co2 > c.co2Peak) c.co2Peak = this.co2;
    // record display samples
    this.sampAcc += dt;
    if (this.sampAcc >= 1 / this.SR) {
      this.sampAcc -= 1 / this.SR;
      const k = this.idx % this.N, b = this.buf;
      b.P[k] = Paw; b.F[k] = Qd * 60; b.V[k] = this.Vd * 1000; b.M[k] = this.pmus; b.C[k] = this.co2; b.E[k] = this.pes; b.A[k] = this.artSample();
      b.ph[k] = (this.phase === 'exp') ? 0 : (this.breathType === 'S' ? 2 : 1);
      this.idx++;
      if (this.idx % 2 === 0) { this.loop.push([Paw, this.Vd * 1000, Qd * 60]); if (this.loop.length > 1500) this.loop.shift(); }
    }
    // continuous alarms
    if (this.t - this.lastAlarmEval > 0.5) { this.lastAlarmEval = this.t; this.updateGasMeas(); this.updateHemoMeas(); this.evalAlarms(); }
  }

  vcFlow(t) {
    if (t >= this.vcTf) return 0;
    return this.vcQ0 + (this.vcQ1 - this.vcQ0) * (t / this.vcTf);
  }
  mandKind() { const ty = this.modeDef().type; return (ty === 'vc') ? 'vc' : 'pc'; }

  endInsp() {
    const c = this.cur;
    c.tEndInsp = this.t; c.ti = this.tBreath; c.plTrue = this.el(this.V);
    const mandatory = this.breathType !== 'S';
    if (this.holdReq.i && mandatory && !this.isOpen()) { this.phase = 'ihold'; this.tPhase = 0; return; }
    this.phase = 'exp'; this.tPhase = 0;
  }

  decideNext(el, pm, np, nq) {
    const s = this.s, m = this.modeDef();
    const period = 60 / Math.max(1, s.rr);
    const sinceMand = this.t - this.lastMandStart;
    const sinceBreath = this.t - this.lastBreathStart;
    const spontOnly = m.type === 'ps';
    // patient trigger
    if (this.tPhase > 0.2 && !this.isOpen()) {
      if (this.triggerSignal(el, pm, np, nq)) this.trigAcc += 0.002; else this.trigAcc = 0;
      if (this.trigAcc >= 0.04) {
        this.apnea = false;
        if (spontOnly) return this.startBreath('S', 'ps');
        if (m.simv) {
          if (sinceMand >= 0.6 * period) return this.startBreath('A', this.mandKind());
          return this.startBreath('S', 'ps');
        }
        return this.startBreath('A', this.mandKind());
      }
    }
    // machine breath
    if (!spontOnly) {
      if (sinceMand >= period) {
        if (this.holdReq.e) { this.phase = 'ehold'; this.tPhase = 0; this.cur.endExpFlow = this.Qd * 60; return; }
        return this.startBreath('M', this.mandKind());
      }
    } else if (m.niv) {
      if (s.backupRR > 0 && sinceBreath >= 60 / s.backupRR && !this.standby) return this.startBreath('M', 'pc');
    } else {
      if (sinceBreath >= s.apneaTime && !this.apnea && !this.standby) { this.apnea = true; this.raise(m.hfnc ? 'APNEA – patient not breathing' : 'APNEA – backup ventilation', 'high'); }
      if (this.apnea && sinceBreath >= 5 && !this.standby && !m.hfnc) {
        if (this.holdReq.e) { this.phase = 'ehold'; this.tPhase = 0; return; }
        return this.startBreath('M', 'pc');
      }
      if (this.holdReq.e && this.tPhase > 3) { this.phase = 'ehold'; this.tPhase = 0; }
    }
  }

  aprvSwitch(toHigh) {
    const s = this.s;
    if (toHigh) {
      this.cur.endExpFlow = this.Qd * 60;
      if (this.aprvPeakExp < 0) this.meas.termPct = Math.round(100 * Math.abs(this.Q) / Math.abs(this.aprvPeakExp));
      this.finalizeBreath();
      if (this.loop.length > 4) this.lastLoop = this.loop; this.loop = [];
      this.cur = this.newRec('M'); this.cur.t0 = this.t; this.cur.v0 = this.V; this.cur.vmax = this.V; this.cur.peepiTrue = this.el(this.V) - s.plow;
      this.Vd = 0; this.markers.push({ i: this.idx, type: 'M' });
      this.aprvFrom = this.Paw; this.aprvHigh = true; this.tPhase = 0; this.lastBreathStart = this.t; this.lastMandStart = this.t;
      this.breathType = 'M';
    } else {
      this.cur.tEndInsp = this.t; this.cur.ti = this.t - this.cur.t0; this.cur.plTrue = this.el(this.V);
      this.aprvFrom = this.Paw; this.aprvHigh = false; this.tPhase = 0; this.aprvPeakExp = 0;
      this.markers.push({ i: this.idx, type: 'R' });
    }
  }


  /* ---------- gas exchange ---------- */
  static sat(P) { P = Math.max(0.1, P); return 1 / (23400 / (P * P * P + 150 * P) + 1); }
  static o2content(P, hb) { return 1.34 * hb * Ventilator.sat(P) + 0.003 * P; }
  shuntEff() {
    const p = this.p, f = this.f;
    const pm = this.pmean;
    let sh = (p.shunt / 100) * (1 - (p.recruit / 100) * Math.max(-0.5, Math.min(1, (pm - 8) / 12)) * 0.7);
    if (f.lip && this.s.peep < 12 && this.modeDef().type !== 'aprv') sh += 0.05;
    sh *= (1 - 0.5 * (this.rmState || 0) * (p.recruit / 100));
    sh *= (1 - 0.35 * (this.proneLevel || 0) * Math.min(1, p.recruit / 100 + 0.3));
    sh += (this.derec || 0) * 0.25;
    if (f.ptx) sh += 0.12; if (f.mainstem) sh += 0.2; if (f.plug) sh += 0.08;
    return Math.max(0.02, Math.min(0.7, sh));
  }
  deadEff() {
    const p = this.p, f = this.f; let d = p.deadAlv / 100;
    const pl = this.meas ? this.meas.plTrue : null;
    if (pl != null && pl > 30) d += Math.min(0.15, (pl - 30) * 0.01);
    if (f.ptx) d += 0.05; if (f.lowCO) d += 0.15;
    return Math.max(0, Math.min(0.85, d));
  }
  gasTargets(init) {
    const p = this.p, s = this.s, f = this.f, g = this.gas;
    const win = 30, t0 = this.t - win;
    const span = Math.max(5, Math.min(win, this.t));
    const dead = this.deadEff(); g.dead = dead;
    let va = 0;
    if (init) {
      const rr = this.modeDef().type === 'aprv' ? 60 / (s.thigh + s.tlow) : (this.modeDef().type === 'ps' ? (this.drv.prr || 12) : s.rr);
      const vt = this.modeDef().type === 'vc' || this.modeDef().type === 'prvc' ? s.vt / 1000 : Math.min(1, (s.pinsp || 12) * this.Ceff());
      va = rr * Math.max(0, vt - p.vdAnat / 1000) * (1 - dead);
    } else {
      const vd = this.vdEff(); this.breaths.forEach(b => { if (b.t0 >= t0) { const vt = (b.vmax != null && b.v0 != null) ? Math.min(b.vmax - b.v0, (this.modeDef().hfnc ? 9 : b.vti + 0.05)) : b.vte; va += Math.max(0, (this.isOpen() ? 0 : vt) - vd) * (1 - dead); } });
      va = va * 60 / span;
      if ((this.modeDef().type === 'aprv' || this.isOpen()) && this.spont()) va += this.drv.prr * Math.max(0, this.drv.effort * this.Ceff() * 0.6 - p.vdAnat / 1000) * (1 - dead);
    }
    if (f.eso) va = 0;
    g.va = va;
    g.tPaco2 = Math.max(15, Math.min(160, 0.863 * p.vco2 / Math.max(va, 0.3)));
    const openC = this.isOpen();
    if (openC && !this.spont()) g.tPaco2 = Math.min(160, g.paco2 + 8);
    const fio2 = openC ? 0.21 : this.fio2Delivered();
    const paco2 = init ? g.tPaco2 : g.paco2;
    let PAO2 = Math.max(5, fio2 * 713 - paco2 / 0.8);
    if (f.eso || (openC && !this.spont())) PAO2 = Math.max(5, PAO2 - 40);
    g.pAO2 = PAO2;
    const sh = this.shuntEff(); g.shunt = sh;
    const co = this.hemo ? this.hemo.co : 5;   // L/min, from the haemodynamic model
    const avd = 250 / (co * 10);             // ml O2/dl a-v difference
    const Cc = Ventilator.o2content(Math.max(5, PAO2 - 4), p.hb);
    const Ca = Cc - avd * sh / (1 - sh);
    let lo = 5, hi = 700;
    for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (Ventilator.o2content(m, p.hb) > Ca) hi = m; else lo = m; }
    g.tPao2 = Math.max(15, (lo + hi) / 2);
    if (init) { g.paco2 = g.tPaco2; g.pao2 = g.tPao2; }
  }
  updateGasMeas() {
    const g = this.gas, M = this.meas, p = this.p, s = this.s;
    M.paco2 = g.paco2; M.pao2 = g.pao2; M.hco3 = p.hco3;
    M.ph = 6.1 + Math.log10(p.hco3 / (0.03 * g.paco2));
    M.spo2 = 100 * Ventilator.sat(g.pao2);
    const fio2 = this.isOpen() ? 0.21 : this.fio2Delivered();
    M.pf = g.pao2 / fio2; M.aa = Math.max(0, g.pAO2 - g.pao2);
    M.shunt = g.shunt * 100; M.va = g.va;
    const vt = Math.max(0.05, (M.vte || s.vt) / 1000);
    M.vdvt = Math.min(0.95, (p.vdAnat / 1000 + g.dead * Math.max(0, vt - p.vdAnat / 1000)) / vt);
    if (M.etco2 == null) M.etco2 = g.paco2 * (1 - g.dead);
    M.gap = M.paco2 - M.etco2;
    M.fio2Del = this.fio2Delivered() * 100;
    M.rox = this.modeDef().hfnc && M.rr > 0 ? (M.spo2 / M.fio2Del) / M.rr * 100 : null;
  }
  snapGas() { this.gasTargets(false); const g = this.gas; for (let i = 0; i < 3; i++) { g.paco2 = g.tPaco2; this.gasTargets(false); } g.pao2 = g.tPao2; this.updateGasMeas(); }
  capno(dt, pm) {
    const p = this.p, f = this.f, g = this.gas;
    if (this.isOpen()) return 0;
    if (f.eso) { return Math.max(0, this.co2 - dt * 6); }
    const ph = this.phase;
    if (ph === 'exp' || (this.modeDef().type === 'aprv' && !this.aprvHigh)) {
      if (this.expT === 0) this.vexp = 0;
      this.expT += dt;
      if (this.Q < 0) this.vexp += -this.Q * dt;
      const vd = p.vdAnat / 1000, Re = this.Re();
      const w = vd * (0.7 + Math.max(0, Re - 10) / 25);
      const x = (this.vexp - 0.35 * vd) / w;
      const frac = x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
      const slope = Math.min(0.4, 0.05 + Math.max(0, Re - 10) * 0.012);
      const expected = Math.max(0.15, (this.cur && this.cur.vti) || 0.4);
      const prog = Math.min(1, this.vexp / expected);
      let cEnd = g.paco2 * (1 - g.dead);
      if (f.lowCO) cEnd *= 0.55;
      let c = cEnd * frac * (1 - slope * (1 - prog));
      if (pm > 1.5 && this.vexp > vd) c -= pm * 1.4;          // curare cleft (patient effort)
      if (f.cardiac && prog > 0.8) c += 0.8 * Math.sin(2 * Math.PI * 1.6 * this.t);
      return Math.max(0, c);
    }
    this.expT = 0;
    if (ph === 'ehold') return this.co2;
    return Math.max(0, this.co2 - dt * 400);
  }

  /* ---------- holds ---------- */
  requestHold(kind) { if (this.modeDef().type === 'aprv') return false; this.holdReq[kind] = true; return true; }

  /* ---------- measurements ---------- */
  computeMeasurements(c) {
    const M = this.meas, s = this.s, m = this.modeDef();
    const recent = this.breaths.slice(-8);
    M.ppeak = c.ppeak; M.vti = c.vti * 1000; M.vte = c.vte * 1000; M.ti = c.ti; M.qpk = c.qpk * 60;
    M.peep = m.type === 'aprv' ? s.plow : s.peep;
    if (c.pplat != null) { M.pplat = c.pplat; M.pplatAge = 0; } else M.pplatAge++;
    if (M.peepTot != null) M.peepTotAge++;
    if (recent.length >= 2) {
      const span = recent[recent.length - 1].t0 + recent[recent.length - 1].dur - recent[0].t0;
      M.rr = Math.round(60 * recent.length / Math.max(span, 0.1));
      const avgVte = recent.slice(-4).reduce((a, b) => a + b.vte, 0) / Math.min(4, recent.length);
      M.mve = M.rr * avgVte;
    }
    const te = Math.max(0.01, c.dur - c.ti);
    M.ie = c.ti > 0 ? '1:' + (te / c.ti).toFixed(1) : '';
    if (c.ti > te) M.ie = (c.ti / te).toFixed(1) + ':1';
    M.cdyn = (c.ppeak - M.peep) > 0.5 ? (c.vte * 1000) / (c.ppeak - M.peep) : 0;
    const peepTot = M.peepTot != null ? M.peepTot : M.peep;
    if (M.pplat != null) {
      M.dp = M.pplat - peepTot;
      M.cstat = M.dp > 0.5 ? M.vti / M.dp : null;
      M.raw = (m.type === 'vc' && s.flowPattern === 'square' && c.qpk > 0.05) ? (c.ppeak - M.pplat) / c.qpk : null;
      M.mp = 0.098 * M.rr * (M.vti / 1000) * (c.ppeak - 0.5 * M.dp);
    } else { M.dp = null; M.cstat = null; M.raw = null; M.mp = null; }
    { const r4 = recent.filter(b => !b.hold).slice(-4); const si = r4.reduce((a, b) => a + b.vti, 0), se = r4.reduce((a, b) => a + b.vte, 0);
      M.leak = si > 0.02 ? Math.max(0, Math.round(100 * (si - se) / si)) : 0; }
    this.leakRun = (M.leak > this.lim.leakHigh) ? (this.leakRun || 0) + 1 : 0;
    M.rsbi = M.vte > 20 ? Math.round(M.rr / (M.vte / 1000)) : 0;
    M.tau = this.Re() * this.Ceff();
    M.peepiTrue = Math.max(0, c.peepiTrue);
    M.endExpFlow = c.endExpFlow;
    M.pinspAuto = m.type === 'prvc' ? this.prvcP : m.vs ? this.vsP : null;
    // patient work of breathing (J/L) – shown as WOBPT in PAV+
    { const r4 = recent.filter(b => b.vti > 0.03).slice(-4); M.wob = r4.length ? r4.reduce((a, b) => a + b.wob * 0.0981 / b.vti, 0) / r4.length : 0; }
    if (m.pav) { M.cpav = this.Ceff() * 1000 * (0.97 + Math.random() * 0.06); M.rpav = this.Ri() * (0.95 + Math.random() * 0.1); M.ppav = c.ppeak; }
    else { M.cpav = null; M.rpav = null; }
    M.vtkg = (M.vte || M.vti) / Math.max(20, this.p.ibw);
    { const cw = this.p.cwFrac / 100, pes0 = this.p.pes0;
      const eeAlv = M.peepTot != null ? M.peepTot : (M.peep + Math.max(0, c.peepiTrue));
      M.pesExp = pes0 + cw * eeAlv;
      M.plExp = eeAlv - M.pesExp;
      M.plInsp = c.plTrue != null ? c.plTrue - (pes0 + cw * c.plTrue) : null;
      M.dpl = M.plInsp != null ? M.plInsp - M.plExp : null; }
    M.spontRR = this.spont() ? this.drv.prr : 0; M.effEffort = this.drv.effort; M.rassEff = this.drv.rass; M.nmb = this.drv.nmb;
    M.pmean = this.pmean;
    M.plTrue = c.plTrue;
    M.etco2 = c.co2Peak;
    this.gasTargets(false);
    // Volume Support adaptation (spontaneous breaths)
    if (m.vs && c.type === 'S') {
      const vt = Math.max(c.vti * 1000, 1), cd = vt / Math.max(2, this.vsP + 4);
      this.vsP = Math.max(2, Math.min(30, this.vsP + Math.max(-3, Math.min(3, (s.vt - vt) / Math.max(cd, 5)))));
    }
    // PRVC adaptation
    if (m.type === 'prvc' && c.type !== 'S' && !this.apnea) {
      const vt = Math.max(c.vti * 1000, 1), cd = vt / Math.max(1, this.prvcP);
      const delta = Math.max(-3, Math.min(3, (s.vt - vt) / Math.max(cd, 5)));
      this.prvcP = Math.max(5, Math.min(this.lim.pHigh - 5, this.prvcP + delta));
    }
    // trends
    this.trend = this.trend || [];
    this.trend.push({ t: this.t, ppeak: M.ppeak, vte: M.vte, rr: M.rr, mve: M.mve, pmean: M.pmean, peepi: M.peepiTrue, spo2: M.spo2, paco2: M.paco2, etco2: M.etco2 });
    if (this.trend.length > 240) this.trend.shift();
  }

  /* ---------- alarms ---------- */
  raise(msg, pri) {
    const a = this.alarms.find(x => x.msg === msg);
    if (a) { a.t = this.t; return; }
    this.alarms.push({ msg, pri: pri || 'med', t: this.t });
  }
  evalAlarms() {
    const M = this.meas, L = this.lim, f = this.f, m = this.modeDef();
    const now = this.t;
    if (m.hfnc) { /* oxygen therapy: only patient monitoring alarms */ }
    else if (this.breaths.length >= 2) {
      if (M.ppeak > L.pHigh) this.raise('High airway pressure', 'high');
      if (M.ppeak < L.pLow && m.type !== 'ps') this.raise('Low airway pressure', 'high');
      if (M.vte < L.vteLow) this.raise('Low exhaled Vt', 'med');
      if (M.mve < L.mvLow) this.raise('Low minute volume', 'high');
      if (M.mve > L.mvHigh) this.raise('High minute volume', 'med');
      if (M.rr > L.rrHigh) this.raise('High respiratory rate', 'med');
      if (this.leakRun >= 3) this.raise('High leak', 'med');
      if (M.endExpFlow < -6 && m.type !== 'aprv') this.raise('Expiratory flow not returning to zero (auto-PEEP?)', 'low');
    }
    if (M.spo2 < L.spo2Low) this.raise('Low SpO2', M.spo2 < 85 ? 'high' : 'med');
    if (this.breaths.length >= 3) {
      if (M.etco2 > L.etco2High) this.raise('High EtCO2', 'med');
      if (M.etco2 < L.etco2Low) this.raise('Low EtCO2', M.etco2 < 5 ? 'high' : 'med');
    }
    if (f.disconnect) this.raise('DISCONNECTION', 'high');
    if (this.standby) this.raise('STANDBY – patient not ventilated', 'high');
    if (this.drv.nmb > 0.5 && this.drv.rass > -3) this.raise('Paralysed but not sedated!', 'high');
    if (m.hfnc && M.rr > 30) this.raise(m.mask ? 'Tachypnoea on face mask' : 'Tachypnoea on HFNC', 'med');
    if (M.map < L.mapLow) this.raise('Low blood pressure (MAP)', M.map < 55 ? 'high' : 'med');
    if (M.hr > L.hrHigh) this.raise('Tachycardia', 'med');
    if (this.apnea) this.raise('APNEA – backup ventilation', 'high');
    // expire stale alarms (not re-raised in last 6 s)
    this.alarms = this.alarms.filter(a => now - a.t < 6);
  }



  /* ---------- patient: drive, drugs, procedures ---------- */
  spont() { return this.drv && this.drv.effort > 0.5 && this.drv.prr > 2; }
  vdEff() {
    const m = this.modeDef(); let v = this.p.vdAnat;
    if (m.hfnc && !m.mask) v -= Math.min(50, this.s.hfFlow);       // high flow washes out the upper airway
    if (this.s.humid === 'hme' && !this.noTube()) v += 50;          // HME at the Y-piece adds ~50 ml
    return v / 1000;
  }
  fio2Delivered() {
    const s = this.s, m = this.modeDef(); if (!m.hfnc) return s.fio2 / 100;
    const demand = Math.max(20, ((this.meas && this.meas.qpk) || 30) * 1.1); // patient peak inspiratory flow, L/min
    if (m.mask) return Math.min(0.6, 0.21 + 0.79 * 0.75 * Math.min(1, s.maskFlow * 1.6 / demand)); // simple face mask with air entrainment
    if (s.hfFlow >= demand) return s.fio2 / 100;
    return (s.hfFlow * s.fio2 / 100 + (demand - s.hfFlow) * 0.21) / demand;
  }
  txLevel(kind) {   // 0..1 effect curve of active drugs of this kind
    let lv = 0;
    for (const x of this.tx) {
      if (x.kind !== kind) continue;
      const t = this.t - x.t0; if (t < 0 || t > x.dur) continue;
      const on = Math.min(1, t / x.onset), off = Math.min(1, (x.dur - t) / x.offset);
      lv = Math.max(lv, Math.min(on, off));
    }
    return lv;
  }
  driveTargets(snap) {
    const p = this.p, M = this.meas || {}, d = this.drv;
    const nmb = this.txLevel('nmb');
    let rass = p.rass - 2 * this.txLevel('sedative');
    const opi = this.txLevel('opioid');
    if (rass > 0) rass = Math.max(0, rass - opi);
    rass = Math.max(-5, Math.min(3, rass));
    const sedF = [0, 0.15, 0.4, 0.65, 0.85, 1, 1.25, 1.5, 1.7][Math.round(rass) + 5];
    let chemo = 1, hyp = 1;
    if (p.autoDrive) {
      const ph = M.ph || 7.4, spo2 = M.spo2 || 97;
      chemo = Math.max(rass >= -1 ? 0.65 : 0.2, Math.min(2.4, 1 + (7.40 - ph) * 3.5));
      if (spo2 < 92) hyp = 1 + (92 - spo2) * 0.035;
    }
    let eff = p.effort * sedF * chemo * hyp * (1 - nmb);
    let rr = p.prr * (rass > 0 ? 1 + rass * 0.15 : 1) * (p.autoDrive ? Math.max(0.5, Math.min(2.2, 1 + (chemo * hyp - 1) * 0.6)) : 1) * (1 - 0.4 * opi);
    if (sedF === 0 || eff < 0.5 || nmb > 0.9) { eff = 0; }
    if (eff === 0) rr = 0;
    d.tEffort = Math.min(25, eff); d.tPrr = Math.min(45, rr); d.rass = rass; d.nmb = nmb;
    if (snap) { d.effort = d.tEffort; d.prr = d.tPrr; }
  }
  stepPatient(dt) {
    if (this.idx % 50 === 0) this.driveTargets(false);
    const d = this.drv;
    d.effort += (d.tEffort - d.effort) * Math.min(1, dt / 15);
    d.prr += (d.tPrr - d.prr) * Math.min(1, dt / 15);
    if (d.tEffort === 0 && d.effort < 0.6) { d.effort = 0; d.prr = 0; }
    // gradual parameter changes from treatments
    for (const x of this.tx) {
      if (!x.ramp) continue;
      const t = this.t - x.t0; const fr = Math.max(0, Math.min(1, t / x.dur));
      for (const k in x.ramp) { const [a, b] = x.ramp[k]; this.p[k] = a + (b - a) * fr; }
      if (fr >= 1) x.done = true;
    }
    this.tx = this.tx.filter(x => !x.done && this.t - x.t0 <= x.dur + 1);
    // prone position onset / offset
    const pt = this.p.prone ? 1 : 0; this.proneLevel += (pt - this.proneLevel) * Math.min(1, dt / 90);
    // derecruitment after suction recovers slowly (faster with higher PEEP)
    if (this.derec > 0) this.derec -= this.derec * dt / (this.peepEff() >= 10 ? 60 : 240);
    if (this.suction) { this.suction.t += dt; if (this.suction.t >= this.suction.dur) { this.suction = null; this.lastMandStart = this.t - 60; this.lastBreathStart = this.t; } }
  }
  giveDrug(kind) {
    const p = this.p, t = this.t;
    const D = {
      sedative: { dur: 300, onset: 30, offset: 90, msg: 'Sedative bolus (e.g. propofol / midazolam)' },
      opioid: { dur: 360, onset: 40, offset: 120, msg: 'Opioid bolus (e.g. fentanyl)' },
      nmb: { dur: 600, onset: 60, offset: 150, msg: 'Neuromuscular blocker (e.g. rocuronium / cisatracurium)' }
    };
    if (D[kind]) { this.tx.push(Object.assign({ kind, t0: t }, D[kind])); return D[kind].msg; }
    if (kind === 'bronchodilator') {
      this.tx.push({ kind, t0: t, dur: 150, ramp: { Ri: [p.Ri, Math.max(6, 8 + (p.Ri - 8) * 0.5)], Re: [p.Re, Math.max(8, 10 + (p.Re - 10) * 0.45)] } });
      return 'Bronchodilator nebulised (salbutamol + ipratropium)';
    }
    if (kind === 'diuretic') {
      this.tx.push({ kind, t0: t, dur: 240, ramp: { shunt: [p.shunt, Math.max(5, p.shunt - (p.shunt - 5) * 0.3)], C: [p.C, p.C * 1.1], hypovol: [p.hypovol, Math.min(90, p.hypovol + 10)] } });
      return 'Diuretic (furosemide)';
    }
    if (kind === 'fluid') {
      const ov = p.hypovol <= 0;
      this.tx.push({ kind, t0: t, dur: 60, ramp: Object.assign({ hypovol: [p.hypovol, Math.max(0, p.hypovol - 25)] }, ov ? { shunt: [p.shunt, Math.min(60, p.shunt + 3)] } : {}) });
      return ov ? 'Fluid 500 ml – no deficit: watch for oedema' : 'Fluid bolus 500 ml';
    }
    if (kind === 'vaso') { p.vaso = p.vaso ? 0 : 1; return p.vaso ? 'Noradrenaline infusion started' : 'Noradrenaline stopped'; }
    if (kind === 'adrenalineNeb') {
      if (!(p.stridor > 0.5)) return 'Nebulised adrenaline – no stridor present';
      this.tx.push({ kind, t0: t, dur: 120, ramp: { stridor: [p.stridor, p.stridor * 0.35] } });
      return 'Nebulised adrenaline 1 mg/ml × 5 ml – stridor easing';
    }
    if (kind === 'dexamethasone') {
      this.tx.push({ kind, t0: t, dur: 600, ramp: { laryngeal: [p.laryngeal || 0, (p.laryngeal || 0) * 0.45], stridor: [p.stridor || 0, (p.stridor || 0) * 0.6] } });
      return 'Dexamethasone 8 mg IV – laryngeal oedema settles over hours (compressed)';
    }
    if (kind === 'antipyretic') { this.tx.push({ kind, t0: t, dur: 180, ramp: { vco2: [p.vco2, Math.min(p.vco2, 200)] } }); return 'Antipyretic / cooling'; }
    return '';
  }
  procedure(kind) {
    const f = this.f, p = this.p;
    switch (kind) {
      case 'suctionOpen': this.suction = { t: 0, dur: 12, open: true }; delete f.secretions; if (f.plug && Math.random() < 0.5) delete f.plug; this.derec = Math.min(0.5, (this.derec || 0) + 0.3); return 'Open suction – circuit disconnected 12 s';
      case 'suctionClosed': this.suction = { t: 0, dur: 10, open: false }; delete f.secretions; if (f.plug && Math.random() < 0.3) delete f.plug; this.derec = Math.min(0.5, (this.derec || 0) + 0.08); return 'Closed (in-line) suction';
      case 'drain': if (!f.ptx) return 'No pneumothorax – chest drain not indicated'; delete f.ptx; return 'Chest drain inserted – lung re-expanding';
      case 'cuff': if (!f.leak) return 'Cuff pressure already normal'; delete f.leak; return 'Cuff re-inflated (25 cmH2O)';
      case 'ett': if (!f.mainstem) return 'Tube position already correct'; delete f.mainstem; return 'ETT withdrawn 2 cm – both lungs ventilated';
      case 'unkink': if (!f.kink) return 'Tube not kinked'; delete f.kink; return 'Tube straightened / bite block placed';
      case 'water': if (!f.water) return 'Circuit is dry'; delete f.water; return 'Circuit drained';
      case 'bronch': delete f.plug; delete f.secretions; this.derec = Math.min(0.5, (this.derec || 0) + 0.1); return 'Bronchoscopy – plug and secretions removed';
      case 'reintubate': if (!f.eso) return 'Tube is in the trachea'; delete f.eso; return 'Re-intubated – EtCO2 trace returns';
      case 'prone': p.prone = p.prone ? 0 : 1; return p.prone ? 'Prone position (effect builds over minutes)' : 'Supine position';
    }
    return '';
  }

  /* ---------- haemodynamics (heart–lung interaction) ---------- */
  hemoTargets() {
    const p = this.p, f = this.f, M = this.meas || {}, h = this.hemo;
    const hv = (p.hypovol || 0) / 100;
    const ith = Math.max(0, (this.pmean || 5) - 8);
    const peepi = Math.max(0, M.peepiTrue || 0);
    let map = 86 - hv * 12 - ith * (0.8 + 2.4 * hv) - peepi * (1 + 2 * hv);
    if (f.ptx) map -= 32;
    if (f.lowCO) map -= 22;
    if ((M.spo2 || 97) < 85) map -= 8;
    if (p.vaso) map += 18;
    if (this.drv && this.drv.rass > 0) map += this.drv.rass * 6;
    if (this.drv && this.drv.rass <= -4) map -= 6;
    h.tMap = Math.max(25, Math.min(125, map));
    let hr = 78 + Math.max(0, 85 - h.tMap) * 0.9 + hv * 15;
    if ((M.spo2 || 97) < 90) hr += (90 - M.spo2) * 1.4;
    if ((M.paco2 || 40) > 55) hr += (M.paco2 - 55) * 0.4;
    if (this.drv.effort > 10) hr += (this.drv.effort - 10) * 1.5;
    if (this.drv && this.drv.rass > 0) hr += this.drv.rass * 12;
    h.tHr = Math.max(40, Math.min(170, hr));
  }
  stepHemo(dt) {
    const h = this.hemo; if (!h) return;
    if (this.idx % 25 === 0) this.hemoTargets();
    h.map += (h.tMap - h.map) * Math.min(1, dt / 4);
    h.hr += (h.tHr - h.hr) * Math.min(1, dt / 5);
    const hv = (this.p.hypovol || 0) / 100;
    const pp = 48 * (1 - 0.45 * hv) * Math.max(0.5, Math.min(1.1, h.map / 85));
    h.sbp = h.map + pp * 2 / 3; h.dbp = h.map - pp / 3;
    h.cvp = Math.max(1, 8 + 0.45 * ((this.pmean || 5) - 8) - 7 * hv + (this.f.ptx ? 6 : 0));
    const spont = this.spont();
    const vt = Math.max(0.1, (this.meas && this.meas.vte ? this.meas.vte : 450) / 1000);
    h.ppv = Math.max(2, (3 + 20 * hv) * Math.min(1.6, vt / 0.45) * (spont ? 0.5 : 1));
    h.co = Math.max(1.2, 5 * Math.max(0.3, Math.min(1.2, h.map / 85)) * (this.f.lowCO ? 0.55 : 1));
    this.phaseC = ((this.phaseC || 0) + dt * h.hr / 60) % 1;
  }
  artSample() {
    const h = this.hemo, c = this.phaseC || 0;
    const pk = Math.max(5, this.meas.ppeak - this.meas.peep);
    const norm = Math.max(0, Math.min(1, (this.Paw - this.s.peep) / pk));
    const s = h.sbp * (1 + (h.ppv / 200) * (2 * norm - 1)), d = h.dbp;
    if (c < 0.1) return d + (s - d) * Math.sin(c / 0.1 * Math.PI / 2);
    if (c < 0.3) return s - (s - d) * 0.35 * ((c - 0.1) / 0.2);
    if (c < 0.36) return s - (s - d) * 0.35 + (s - d) * 0.07 * Math.sin((c - 0.3) / 0.06 * Math.PI);
    return d + (s - (s - d) * 0.35 - d) * Math.exp(-(c - 0.36) * 4.5);
  }
  updateHemoMeas() {
    const h = this.hemo, M = this.meas;
    M.map = h.map; M.hr = h.hr; M.sbp = h.sbp; M.dbp = h.dbp; M.cvp = h.cvp; M.ppv = h.ppv; M.co = h.co;
  }

  /* ---------- operator actions & manoeuvres ---------- */
  manualBreath() {
    if (this.rm || this.standby || this.modeDef().type === 'aprv' || this.phase !== 'exp') return false;
    this.startBreath('M', this.modeDef().type === 'ps' ? 'pc' : this.mandKind());
    if (this.modeDef().type === 'ps') { this.dP = this.modeDef().niv ? this.s.ipap - this.s.peep : Math.max(10, this.s.ps); this.bTi = 1.0; }
    return true;
  }
  /* cuff-leak test: VC breaths with the cuff deflated; leak = mean(VTI − VTE) of the last 6 breaths */
  cuffLeakTest() {
    if (this.noTube()) return null;
    const c = this.clone(); c.s.mode = 'VC-AC'; c.s.rr = Math.max(12, c.s.rr); c.s.leakComp = false; c.f.cuffDown = 1; delete c.f.leak;
    c.p.autoDrive = 0; c.p.effort = 0; c.p.prr = 0; c.init();
    c.runFor(30);
    const b = c.breaths.slice(-6); if (!b.length) return null;
    const vti = b.reduce((a, x) => a + x.vti, 0) / b.length * 1000, vte = b.reduce((a, x) => a + x.vte, 0) / b.length * 1000;
    const leak = Math.max(0, vti - vte);
    return { vti, vte, leak, pct: vti > 0 ? leak / vti * 100 : 0 };
  }
  startRM(pres, dur) { if (this.modeDef().type === 'aprv') return false; this.rm = { p: pres || 40, dur: dur || 30, t: 0, from: this.Paw }; return true; }
  p01() { const p = this.p; if (!this.spont()) return 0; const ti = Math.max(0.3, p.nti); return this.drv.effort * Math.sin(Math.PI * Math.min(0.1, ti / 2) / ti) * (0.95 + Math.random() * 0.1); }
  nif() { const p = this.p; if (!this.spont() && !(this.drv.nmb < 0.5 && this.drv.rass > -4)) return 0; return -(Math.max(this.drv.effort, p.effort * 0.8) * 3.2 + 6) * (0.95 + Math.random() * 0.1); }
  /* quasi-static (low-flow) inflation curve from ZEEP: returns [[P, Vabove ZEEP ml]] */
  lowFlowPV() {
    const out = []; const saveRm = this.rm, saveSt = this.rmState; let V = this.baselineV(0); const V0 = V;
    for (let P = 0; P <= 40; P += 0.5) {
      // collapse depends on airway pressure during the inflation
      this.rm = { p: P }; const C = this.Ceff();
      let lo = V0 - 0.5, hi = 4;
      for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; const e = this.elWithC(m, C); if (e > P) hi = m; else lo = m; }
      V = Math.max(V, (lo + hi) / 2); out.push([P, (V - V0) * 1000]);
    }
    this.rm = saveRm; this.rmState = saveSt; return out;
  }
  elWithC(V, C) {
    let p = V / C;
    if (this.f.lip) p += 55 * Math.min(Math.max(V, 0), 0.16);
    if (this.f.uip) { const x = Math.max(0, V - 0.6); p += 150 * x * x; }
    if (this.f.ptx) p += 4;
    const vu = this.p.C / 1000 * 25; if (V > vu) { const x = V - vu; p += 90 * x * x; }
    return p;
  }
  clone() { const v = new Ventilator(); v.loadState(JSON.parse(JSON.stringify(this.s)), JSON.parse(JSON.stringify(this.p)), JSON.parse(JSON.stringify(this.f))); v.lim = Object.assign({}, this.lim); return v; }

  /* ---------- run offline (quiz / previews) ---------- */
  runFor(sec) { const n = Math.round(sec / 0.002); for (let i = 0; i < n; i++) this.step(0.002); }
}

if (typeof module !== 'undefined') module.exports = { Ventilator, VMODES, VENT_DEFAULTS, PATIENT_DEFAULTS, ALARM_DEFAULTS, MODE_SETTINGS, ETT_R };
