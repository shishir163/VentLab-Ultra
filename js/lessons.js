/* VentLab Ultra — guided lessons (English & Bengali).
 * Step types: next (button), check (auto-detect when the user has done it), choice (answer a question).
 * setup(api) runs when the step opens; check(v, st) gets the ventilator and the step's start snapshot.
 */
'use strict';
const ABN = id => ABNORMALITIES.find(a => a.id === id);
const PBW6 = v => 6 * (v.p.ibw || 70);
const LESSONS = [
  { id: 'l1', en: 'Your first breath: Volume Control', bn: 'প্রথম শ্বাস: Volume Control', level: 'Basic',
    steps: [
      { t: 'next', setup: api => api.load({ s: { mode: 'VC-AC', rr: 14, vt: 500, peep: 5, fio2: 40, pause: 0, flowPattern: 'square' }, p: {}, f: {} }, 'Lesson 1'),
        en: 'A passive patient is on **VC-AC**. Look at the Waveforms card: in VC the flow is fixed (square), so the pressure rises as volume goes in.',
        bn: 'একজন নিষ্ক্রিয় (passive) রোগী **VC-AC**-তে আছে। Waveforms কার্ড দেখো: VC-তে flow নির্দিষ্ট (চৌকো), তাই volume ঢোকার সঙ্গে সঙ্গে pressure বাড়ে।' },
      { t: 'check', check: v => Math.abs(v.s.vt - PBW6(v)) <= 40,
        en: 'Set the tidal volume to **6 ml/kg PBW**. Use the **Setup wizard** (Quick Keys card) or the Vt slider. The Numerics card shows Vt ml/kg.',
        bn: 'Tidal volume **৬ ml/kg PBW** করো। **Setup wizard** (Quick Keys কার্ড) অথবা Vt slider ব্যবহার করো। Numerics কার্ডে Vt ml/kg দেখায়।',
        hint: { en: 'PBW for a 170 cm man is 66 kg → Vt ≈ 400 ml.', bn: '১৭০ সেমি উচ্চতার পুরুষের PBW ৬৬ kg → Vt প্রায় ৪০০ ml।' } },
      { t: 'check', check: (v, st) => v.holdCountI > st.hi,
        en: 'Press **Insp hold** on the Waveforms card. The pressure falls to a plateau – that is **Pplat**.',
        bn: 'Waveforms কার্ডে **Insp hold** চাপো। Pressure নেমে একটা সমতলে থামবে – সেটাই **Pplat**।' },
      { t: 'choice', en: 'Ppeak is higher than Pplat. What does the difference mainly show?', bn: 'Ppeak, Pplat-এর চেয়ে বেশি। এই পার্থক্য মূলত কী বোঝায়?',
        options: [{ en: 'Airway resistance', bn: 'Airway resistance', ok: true }, { en: 'Lung compliance', bn: 'Lung compliance' }, { en: 'Auto-PEEP', bn: 'Auto-PEEP' }] },
      { t: 'next', en: '**Driving pressure = Pplat − PEEP.** Keep Pplat ≤ 30 and driving pressure ≤ 15 cmH2O. Lesson complete!',
        bn: '**Driving pressure = Pplat − PEEP।** Pplat ৩০-এর মধ্যে আর driving pressure ১৫ cmH2O-এর মধ্যে রাখো। Lesson শেষ!' }
    ] },
  { id: 'l2', en: 'Pressure Control: volume is not fixed', bn: 'Pressure Control: volume নির্দিষ্ট নয়', level: 'Basic',
    steps: [
      { t: 'next', setup: api => api.load({ s: { mode: 'PC-AC', rr: 14, pinsp: 12, ti: 1.0, peep: 5 }, p: {}, f: {} }, 'Lesson 2'),
        en: 'Now the patient is on **PC-AC**: the pressure is fixed. Note **Vte** in the Numerics card.',
        bn: 'এখন রোগী **PC-AC**-তে: pressure নির্দিষ্ট। Numerics কার্ডে **Vte** খেয়াল করো।' },
      { t: 'check', check: v => v.p.C <= 25,
        en: 'Make the lung stiff: in the **Patient & Lung** card set Compliance to **25 or less**.',
        bn: 'ফুসফুস শক্ত করো: **Patient & Lung** কার্ডে Compliance **২৫ বা কম** করো।' },
      { t: 'choice', en: 'What happened to Vte?', bn: 'Vte-এর কী হলো?',
        options: [{ en: 'It fell', bn: 'কমে গেছে', ok: true }, { en: 'It rose', bn: 'বেড়ে গেছে' }, { en: 'No change', bn: 'বদলায়নি' }] },
      { t: 'check', check: v => v.s.mode === 'PC-AC' && Math.abs(v.meas.vte - PBW6(v)) < 60,
        en: 'Raise **Pinsp** until Vte is back near 6 ml/kg PBW.',
        bn: 'Vte আবার ৬ ml/kg PBW-এর কাছে না আসা পর্যন্ত **Pinsp** বাড়াও।' },
      { t: 'next', en: 'In pressure modes Vt follows the lung – always set a **low Vte alarm**.', bn: 'Pressure mode-এ Vt ফুসফুসের অবস্থা অনুযায়ী চলে – তাই সবসময় **low Vte alarm** সেট রাখো।' }
    ] },
  { id: 'l3', en: 'Find and fix auto-PEEP', bn: 'Auto-PEEP খুঁজে বের করে ঠিক করা', level: 'Intermediate',
    steps: [
      { t: 'next', setup: api => api.scenario('auto_peep'),
        en: 'COPD patient, RR 24. Look at the **flow** waveform: expiratory flow does not return to zero before the next breath.',
        bn: 'COPD রোগী, RR ২৪। **Flow** waveform দেখো: পরের শ্বাসের আগে expiratory flow শূন্যে ফেরে না।' },
      { t: 'check', check: (v, st) => v.holdCountE > st.he,
        en: 'Press **Exp hold** and read **PEEP total** in Numerics.', bn: '**Exp hold** চাপো আর Numerics-এ **PEEP total** দেখো।' },
      { t: 'choice', en: 'Auto-PEEP equals…', bn: 'Auto-PEEP হলো…',
        options: [{ en: 'Total PEEP − set PEEP', bn: 'Total PEEP − সেট PEEP', ok: true }, { en: 'Total PEEP + set PEEP', bn: 'Total PEEP + সেট PEEP' }, { en: 'Set PEEP only', bn: 'শুধু সেট PEEP' }] },
      { t: 'check', check: v => v.s.rr <= 14,
        en: 'Give more expiratory time: reduce **RR to 14 or less**.', bn: 'শ্বাস ছাড়ার সময় বাড়াও: **RR ১৪ বা কম** করো।' },
      { t: 'check', check: v => v.meas.endExpFlow > -3 && v.breaths.length > 3,
        en: 'Wait a few breaths until **End-exp flow** is near zero.', bn: 'কয়েকটা শ্বাস অপেক্ষা করো, যতক্ষণ না **End-exp flow** প্রায় শূন্য হয়।' },
      { t: 'next', en: 'Fixed! Other tools: shorter Ti / higher flow, lower Vt, bronchodilators.', bn: 'ঠিক হয়েছে! অন্য উপায়: Ti ছোট / flow বেশি, Vt কম, bronchodilator।' }
    ] },
  { id: 'l4', en: 'ARDS hypoxaemia: FiO2 or PEEP?', bn: 'ARDS-এ hypoxaemia: FiO2 নাকি PEEP?', level: 'Intermediate',
    steps: [
      { t: 'next', setup: api => api.scenario('refractory_hypox'),
        en: 'ARDS with a big **shunt**. SpO2 is low on FiO2 60% (see the Blood Gas card).', bn: 'বড় **shunt**-সহ ARDS। FiO2 ৬০%-এ SpO2 কম (Blood Gas কার্ড দেখো)।' },
      { t: 'check', check: v => v.s.fio2 >= 95,
        en: 'Set **FiO2 100%**, then press **Steady state** in the Blood Gas card.', bn: '**FiO2 ১০০%** করো, তারপর Blood Gas কার্ডে **Steady state** চাপো।' },
      { t: 'choice', en: 'Did SpO2 improve much?', bn: 'SpO2 কি অনেক বেড়েছে?',
        options: [{ en: 'Only a little – shunt does not respond well to oxygen', bn: 'সামান্য – shunt-এ oxygen ভালো কাজ করে না', ok: true }, { en: 'Yes, fully corrected', bn: 'হ্যাঁ, পুরো ঠিক হয়ে গেছে' }] },
      { t: 'check', check: v => v.s.peep >= 14,
        en: 'Recruit the lung: raise **PEEP to 14** (optional: run a Recruitment manoeuvre in the Manoeuvres card). Press Steady state.',
        bn: 'ফুসফুস recruit করো: **PEEP ১৪** করো (চাইলে Manoeuvres কার্ডে Recruitment manoeuvre চালাও)। Steady state চাপো।' },
      { t: 'check', check: v => v.s.fio2 <= 60 && v.meas.spo2 >= 90,
        en: 'Now lower **FiO2 to 60% or less** while keeping SpO2 ≥ 90%. Also watch BP in the Haemodynamics card.',
        bn: 'এবার SpO2 ৯০% বা বেশি রেখে **FiO2 ৬০% বা কম** করো। Haemodynamics কার্ডে রক্তচাপও খেয়াল রাখো।' },
      { t: 'next', en: 'Shunt is treated with **pressure (recruitment)**, not just oxygen.', bn: 'Shunt-এর চিকিৎসা হলো **pressure (recruitment)**, শুধু oxygen নয়।' }
    ] },
  { id: 'l5', en: 'Asynchrony: double triggering', bn: 'Asynchrony: double triggering', level: 'Intermediate',
    steps: [
      { t: 'next', setup: api => { api.scenario('double_trigger'); S.display.pmus = true; },
        en: 'Two breaths for one effort. The dashed **Pmus** line shows the patient still inhaling when the machine breath ends.',
        bn: 'একটি চেষ্টায় দুটি শ্বাস। ড্যাশ-দেওয়া **Pmus** রেখা দেখায়, মেশিনের শ্বাস শেষ হলেও রোগী তখনো শ্বাস টানছে।' },
      { t: 'check', check: v => v.s.ti >= 1.3 || ['PSV', 'VS', 'PC-AC'].includes(v.s.mode),
        en: 'Match the patient: increase **Ti to ≥ 1.3 s** (or switch to PSV / PC-AC).', bn: 'রোগীর সঙ্গে মেলাও: **Ti ১.৩ সেকেন্ড বা বেশি** করো (অথবা PSV / PC-AC-তে যাও)।' },
      { t: 'check', check: v => v.breaths.length > 5 && v.breaths.slice(-4).every(b => b.dur > 1.8),
        en: 'Wait until every effort gets **one** breath.', bn: 'অপেক্ষা করো, যতক্ষণ না প্রতিটি চেষ্টায় **একটি** শ্বাস হয়।' },
      { t: 'next', en: 'Solved. Also treat the cause of high drive (pain, acidosis, anxiety).', bn: 'সমাধান হয়েছে। বেশি তাড়নার কারণেরও (ব্যথা, acidosis, উদ্বেগ) চিকিৎসা করো।' }
    ] },
  { id: 'l6', en: 'High pressure alarm: Ppeak vs Pplat', bn: 'High pressure alarm: Ppeak বনাম Pplat', level: 'Intermediate',
    steps: [
      { t: 'next', setup: api => api.scenario('bronchospasm'),
        en: 'The high-pressure alarm is near. First question: resistance or compliance?', bn: 'High pressure alarm কাছাকাছি। প্রথম প্রশ্ন: resistance নাকি compliance?' },
      { t: 'check', check: (v, st) => v.holdCountI > st.hi, en: 'Press **Insp hold**.', bn: '**Insp hold** চাপো।' },
      { t: 'choice', en: 'Ppeak high, Pplat normal. The problem is…', bn: 'Ppeak বেশি, Pplat স্বাভাবিক। সমস্যাটা…',
        options: [{ en: 'Resistance (bronchospasm, secretions, tube)', bn: 'Resistance (bronchospasm, secretion, tube)', ok: true }, { en: 'Compliance (pneumothorax, endobronchial)', bn: 'Compliance (pneumothorax, endobronchial)' }] },
      { t: 'next', en: 'If both Ppeak and Pplat were high, think compliance: pneumothorax, endobronchial tube, oedema, auto-PEEP.', bn: 'Ppeak আর Pplat দুটোই বেশি হলে compliance ভাবো: pneumothorax, endobronchial tube, oedema, auto-PEEP।' }
    ] },
  { id: 'l7', en: 'Heart–lung: PEEP and blood pressure', bn: 'Heart–lung: PEEP আর রক্তচাপ', level: 'Advanced',
    steps: [
      { t: 'next', setup: api => api.load({ s: { mode: 'VC-AC', rr: 16, vt: 500, peep: 5 }, p: { hypovol: 60 }, f: {} }, 'Lesson 7'),
        en: 'This patient is **hypovolaemic** (60%). Look at the **Haemodynamics** card: the arterial waveform rises and falls with each breath (PPV).',
        bn: 'এই রোগীর **hypovolaemia** (৬০%)। **Haemodynamics** কার্ড দেখো: প্রতিটি শ্বাসে arterial waveform ওঠানামা করছে (PPV)।' },
      { t: 'check', check: v => v.s.peep >= 15, en: 'Raise **PEEP to 15**.', bn: '**PEEP ১৫** করো।' },
      { t: 'choice', en: 'What happened to MAP and HR?', bn: 'MAP আর HR-এর কী হলো?',
        options: [{ en: 'MAP fell, HR rose', bn: 'MAP কমেছে, HR বেড়েছে', ok: true }, { en: 'MAP rose', bn: 'MAP বেড়েছে' }, { en: 'No change', bn: 'বদলায়নি' }] },
      { t: 'check', check: v => v.p.hypovol <= 10, en: 'Give fluid: set **Hypovolaemia to 10% or less** in the Patient card.', bn: 'Fluid দাও: Patient কার্ডে **Hypovolaemia ১০% বা কম** করো।' },
      { t: 'next', en: 'With normal volume status the same PEEP is tolerated. High PPV predicted fluid responsiveness.', bn: 'রক্তের পরিমাণ স্বাভাবিক হলে একই PEEP সহ্য হয়। বেশি PPV আগেই বলে দিয়েছিল যে fluid-এ উপকার হবে।' }
    ] },
  { id: 'l8', en: 'Weaning: P0.1, NIF and an SBT', bn: 'Weaning: P0.1, NIF আর SBT', level: 'Advanced',
    steps: [
      { t: 'next', setup: api => { api.preset('weaning'); vent.s.mode = 'PSV'; vent.s.ps = 10; vent.s.peep = 5; ventChanged(true); },
        en: 'A recovering patient on **PSV 10 / PEEP 5**. Is he ready to come off?', bn: 'সেরে উঠছে এমন রোগী **PSV ১০ / PEEP ৫**-এ। ventilator ছাড়ার জন্য কি প্রস্তুত?' },
      { t: 'check', check: (v, st) => (S.lastP01 || 0) > st.t0, en: 'In the **Manoeuvres** card measure **P0.1**.', bn: '**Manoeuvres** কার্ডে **P0.1** মাপো।' },
      { t: 'check', check: (v, st) => (S.lastNif || 0) > st.t0, en: 'Now measure **NIF**.', bn: 'এবার **NIF** মাপো।' },
      { t: 'check', check: (v, st) => S.lastSbt && S.lastSbt.t > st.t0, en: 'Start an **SBT** (PS 5 / PEEP 5) and wait for the result.', bn: 'একটা **SBT** (PS ৫ / PEEP ৫) শুরু করো আর ফলাফলের জন্য অপেক্ষা করো।' },
      { t: 'choice', en: 'RSBI below 105 means…', bn: 'RSBI ১০৫-এর নিচে মানে…',
        options: [{ en: 'Likely to succeed', bn: 'সফল হওয়ার সম্ভাবনা বেশি', ok: true }, { en: 'Likely to fail', bn: 'ব্যর্থ হওয়ার সম্ভাবনা বেশি' }] },
      { t: 'next', en: 'Also check cough, secretions, consciousness and the cuff-leak test before extubation.', bn: 'Extubation-এর আগে কাশি, secretion, চেতনা আর cuff-leak test-ও দেখো।' }
    ] }
];
if (typeof module !== 'undefined') module.exports = { LESSONS };
