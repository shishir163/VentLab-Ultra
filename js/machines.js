/* VentLab Ultra — real-machine profiles (Puritan Bennett 840/980, Dräger Evita, Hamilton C-series, GE CARESCAPE R860)
 * and detailed bilingual explanations of every machine setting and mode.
 * Names follow the manufacturers' published terminology; the app keeps its own design.
 */
'use strict';

/* ---------- machine profiles ---------- */
const PB_MODES = { 'VC-AC': 'A/C · VC', 'PC-AC': 'A/C · PC', PRVC: 'A/C · VC+', 'SIMV-VC': 'SIMV · VC + PS', 'SIMV-PC': 'SIMV · PC + PS', PSV: 'SPONT · PS', VS: 'SPONT · VS', TC: 'SPONT · TC', PAV: 'SPONT · PAV+', CPAP: 'SPONT · PS 0 (CPAP)', APRV: 'BiLevel', NIV: 'NIV · SPONT PS', HFNC: 'HFNC (separate device)' };
const PB_SET = { rr: 'f', vt: 'VT', pinsp: 'PI', ti: 'TI', pause: 'TPL', flowPattern: 'Flow pattern', peep: 'PEEP', fio2: 'O2%', ps: 'PSUPP', rise: 'Rise time %', cycle: 'ESENS', trigger: 'Trigger type', trigFlow: 'VSENS', trigP: 'PSENS', phigh: 'PH', plow: 'PL', thigh: 'TH', tlow: 'TL', apneaTime: 'TA (apnea interval)', atc: '% Supp (TC)', ett: 'Tube I.D.', leakComp: 'Leak Sync', maxTi: '↑TI SPONT', ipap: 'PSUPP + PEEP (IPAP)', backupRR: 'Apnea f', sighEvery: 'Sigh', pavSupp: '% Supp (PAV+)', humid: 'Humidification type', pavEsens: 'ESENS (PAV+)' };
const PB_NUM = { ppeak: 'PPEAK', pplat: 'PPL', peep: 'PEEP', peepTot: 'PEEPTOT', pmean: 'PMEAN', vti: 'VTI', vte: 'VTE', rr: 'fTOT', mve: 'VE TOT', ie: 'I:E', cstat: 'CSTAT', raw: 'RSTAT', rsbi: 'f/VT', ti: 'TI', vtkg: 'VT/IBW', leak: '% Leak', dp: 'ΔP' };
const MACHINES = {
  generic: { name: 'Generic (VentLab)', short: 'Generic', modes: {}, set: {}, num: {}, has: null },
  pb840: { name: 'Puritan Bennett 840', short: 'PB 840', modes: PB_MODES, set: PB_SET, num: PB_NUM, o2: '100% O2/CAL (2 min)', manual: 'Manual insp', holds: ['Insp pause', 'Exp pause'],
    has: ['VC-AC', 'PC-AC', 'PRVC', 'SIMV-VC', 'SIMV-PC', 'PSV', 'VS', 'TC', 'PAV', 'CPAP', 'APRV', 'NIV'], riseAsPct: true, vmax: true },
  pb980: { name: 'Puritan Bennett 980', short: 'PB 980', modes: PB_MODES, set: PB_SET, num: PB_NUM, o2: 'Elevate O2 (2 min)', manual: 'Manual insp', holds: ['Insp pause', 'Exp pause'],
    has: ['VC-AC', 'PC-AC', 'PRVC', 'SIMV-VC', 'SIMV-PC', 'PSV', 'VS', 'TC', 'PAV', 'CPAP', 'APRV', 'NIV'], riseAsPct: true, vmax: true },
  drager: { name: 'Dräger Evita (V300/V500/V800)', short: 'Dräger', o2: 'O2 ↑ (suction)', manual: 'Man. insp.', holds: ['Insp. hold', 'Exp. hold'],
    modes: { 'VC-AC': 'VC-AC', 'PC-AC': 'PC-AC', PRVC: 'VC-AC + AutoFlow', 'SIMV-VC': 'VC-SIMV', 'SIMV-PC': 'PC-SIMV', PSV: 'SPN-CPAP/PS', VS: 'SPN-CPAP/VS', TC: 'SPN-CPAP + ATC', PAV: 'SPN-PPS', CPAP: 'SPN-CPAP', APRV: 'PC-APRV / PC-BIPAP', NIV: 'NIV (mask) SPN-CPAP/PS', HFNC: 'O2-therapy' },
    set: { rr: 'RR (f)', vt: 'VT', pinsp: 'Pinsp (absolute)', ti: 'Ti', pause: 'Plateau (from Ti & flow)', flowPattern: 'Flow / AutoFlow', peep: 'PEEP', fio2: 'FiO2', ps: 'ΔPsupp', rise: 'Slope', cycle: 'Exp. term.', trigger: 'Flow trigger', trigFlow: 'Trigger', trigP: 'Pressure trigger', phigh: 'Phigh', plow: 'Plow', thigh: 'Thigh', tlow: 'Tlow', apneaTime: 'Tapn (apnoea time)', atc: 'ATC compensation', ett: 'Tube Ø', leakComp: 'Leakage compensation', maxTi: 'Ti max (NIV)', ipap: 'Pinsp (NIV)', backupRR: 'Apnoea RR', sighEvery: 'Sigh', pavSupp: 'Flow/Vol Assist (PPS)', pavEsens: 'Exp. term. (PPS)', humid: 'Humidifier / HME' },
    num: { ppeak: 'Ppeak', pplat: 'Pplat', peep: 'PEEP', peepTot: 'PEEPtot / PEEPi', pmean: 'Pmean', vti: 'VTi', vte: 'VTe', rr: 'RRtot', mve: 'MV', cstat: 'Cdyn/C', raw: 'R', rsbi: 'RSB', vtkg: 'VT/IBW', leak: 'Leak' },
    has: ['VC-AC', 'PC-AC', 'PRVC', 'SIMV-VC', 'SIMV-PC', 'PSV', 'VS', 'TC', 'PAV', 'CPAP', 'APRV', 'NIV', 'HFNC'], pinspAbs: true },
  hamilton: { name: 'Hamilton (C1/C3/C6/G5)', short: 'Hamilton', o2: 'O2 enrichment', manual: 'Manual breath', holds: ['Insp hold', 'Exp hold'],
    modes: { 'VC-AC': '(S)CMV', 'PC-AC': 'PCV+', PRVC: 'APVcmv / (S)CMV+', 'SIMV-VC': 'SIMV', 'SIMV-PC': 'PSIMV+', PSV: 'SPONT', VS: 'VS', TC: 'SPONT + TRC', CPAP: 'SPONT (Psupport 0)', APRV: 'APRV / DuoPAP', NIV: 'NIV / NIV-ST', HFNC: 'HiFlowO2' },
    set: { rr: 'Rate', vt: 'Vt', pinsp: 'Pcontrol', ti: 'TI', pause: 'Pause', flowPattern: 'Flow pattern', peep: 'PEEP/CPAP', fio2: 'Oxygen', ps: 'Psupport', rise: 'P-ramp', cycle: 'ETS', trigger: 'Trigger type', trigFlow: 'Flowtrigger', trigP: 'Ptrigger', phigh: 'P high', plow: 'P low', thigh: 'T high', tlow: 'T low', apneaTime: 'Apnea backup', atc: 'TRC', ett: 'Tube ID', leakComp: 'Leak compensation', maxTi: 'TI max', ipap: 'Psupport + PEEP', backupRR: 'Rate (NIV-ST)', sighEvery: 'Sigh', humid: 'Humidifier / HME' },
    num: { ppeak: 'Ppeak', pplat: 'Pplateau', peep: 'PEEP/CPAP', peepTot: 'TotalPEEP', pmean: 'Pmean', vti: 'VTI', vte: 'VTE', rr: 'fTotal', mve: 'ExpMinVol', cstat: 'Cstat', raw: 'Rinsp', rsbi: 'RSB', vtkg: 'Vt/IBW', leak: 'Leak %' },
    has: ['VC-AC', 'PC-AC', 'PRVC', 'SIMV-VC', 'SIMV-PC', 'PSV', 'VS', 'TC', 'CPAP', 'APRV', 'NIV', 'HFNC'], riseMs: 2000 },
  ge: { name: 'GE CARESCAPE R860', short: 'GE R860', o2: 'Increase O2', manual: 'Manual breath', holds: ['Insp Hold', 'Exp Hold'],
    modes: { 'VC-AC': 'A/C VC', 'PC-AC': 'A/C PC', PRVC: 'A/C PRVC', 'SIMV-VC': 'SIMV VC', 'SIMV-PC': 'SIMV PC', PSV: 'CPAP/PS', VS: 'VS', TC: 'CPAP/PS + Tube comp.', CPAP: 'CPAP/PS (PS 0)', APRV: 'APRV / BiLevel', NIV: 'NIV' },
    set: { rr: 'Rate', vt: 'Tidal Volume', pinsp: 'Pinsp', ti: 'Tinsp', pause: 'Tpause', flowPattern: 'Flow', peep: 'PEEP', fio2: 'FiO2', ps: 'PS', rise: 'Rise Time', cycle: 'Exp Trigger', trigger: 'Insp Trigger', trigFlow: 'Insp Trigger (flow)', trigP: 'Insp Trigger (pressure)', phigh: 'Phigh', plow: 'Plow', thigh: 'Thigh', tlow: 'Tlow', apneaTime: 'Apnea time', atc: 'Tube compensation', ett: 'Tube size', leakComp: 'Leak compensation', maxTi: 'Tsupp', ipap: 'Pinsp (NIV)', backupRR: 'Minimum rate', humid: 'Humidifier / HME' },
    num: { ppeak: 'Ppeak', pplat: 'Pplat', peep: 'PEEPe', peepTot: 'PEEPtot / PEEPi', pmean: 'Pmean', vti: 'VTinsp', vte: 'VTexp', rr: 'RR', mve: 'MVexp', cstat: 'Cstat', raw: 'Raw', rsbi: 'RSBI', vtkg: 'VT/kg', leak: 'Leak %' },
    has: ['VC-AC', 'PC-AC', 'PRVC', 'SIMV-VC', 'SIMV-PC', 'PSV', 'VS', 'TC', 'CPAP', 'APRV', 'NIV'], riseMs: 500 }
};

/* ---------- detailed setting docs: names on each machine + what / use / up / down / usual ---------- */
const SETTING_DOCS = [
  { id: 'ms_rr', gen: 'Respiratory rate (set)', key: 'rr', names: { pb: 'f', dr: 'RR (f)', ha: 'Rate', ge: 'Rate' }, gloss: ['RR (f)'],
    en: { what: 'The number of mandatory (machine) breaths per minute. The patient may trigger extra breaths; the measured total rate can be higher.',
      use: 'Main way, with Vt, to set minute ventilation and so PaCO2.',
      up: 'More minute ventilation → PaCO2 falls, pH rises. Shorter expiratory time → risk of auto-PEEP, especially in COPD/asthma.',
      down: 'Less minute ventilation → PaCO2 rises. More time to exhale – used in obstructive disease.',
      usual: 'Adults 12–20/min; ARDS 20–30 (to keep PaCO2 with small Vt); asthma/COPD 8–14.' },
    bn: { what: 'প্রতি মিনিটে মেশিন যতগুলো mandatory শ্বাস দেয়। রোগী নিজে বাড়তি শ্বাস trigger করতে পারে, তাই মাপা মোট rate বেশি হতে পারে।',
      use: 'Vt-এর সঙ্গে মিলে minute ventilation আর সেই সূত্রে PaCO2 নিয়ন্ত্রণের প্রধান উপায়।',
      up: 'Minute ventilation বাড়ে → PaCO2 কমে, pH বাড়ে। শ্বাস ছাড়ার সময় কমে → auto-PEEP-এর ঝুঁকি, বিশেষ করে COPD/asthma-য়।',
      down: 'Minute ventilation কমে → PaCO2 বাড়ে। শ্বাস ছাড়ার সময় বাড়ে – obstructive রোগে এটাই করা হয়।',
      usual: 'প্রাপ্তবয়স্ক ১২–২০/মিনিট; ARDS ২০–৩০ (ছোট Vt-এ PaCO2 ঠিক রাখতে); asthma/COPD ৮–১৪।' } },
  { id: 'ms_vt', gen: 'Tidal volume setting', key: 'vt', names: { pb: 'VT (VT SUPP in VS)', dr: 'VT', ha: 'Vt', ge: 'Tidal Volume' }, gloss: ['VT SUPP', 'Tidal Volume'],
    en: { what: 'The volume delivered in each mandatory breath (VC, VC+/PRVC) or the target volume (VS).',
      use: 'Sets lung stretch and, with rate, CO2 removal. Always set by predicted body weight (PB 840/980 show VT/IBW).',
      up: 'More CO2 removal but higher Pplat and driving pressure → volutrauma.',
      down: 'Lung-protective, but PaCO2 rises; very small Vt can cause atelectasis and air hunger.',
      usual: '6 ml/kg PBW in ARDS (4–8); 6–8 ml/kg PBW in other patients.' },
    bn: { what: 'প্রতিটি mandatory শ্বাসে (VC, VC+/PRVC) যে volume দেওয়া হয়, অথবা VS-এ লক্ষ্য volume।',
      use: 'ফুসফুস কতটা প্রসারিত হবে আর rate-এর সঙ্গে CO2 কতটা বের হবে, তা ঠিক করে। সবসময় predicted body weight দিয়ে সেট করো (PB 840/980 VT/IBW দেখায়)।',
      up: 'CO2 বেশি বের হয়, কিন্তু Pplat আর driving pressure বাড়ে → volutrauma।',
      down: 'ফুসফুস সুরক্ষিত থাকে, কিন্তু PaCO2 বাড়ে; খুব ছোট Vt-এ atelectasis আর রোগীর বাতাসের ক্ষুধা হতে পারে।',
      usual: 'ARDS-এ ৬ ml/kg PBW (৪–৮); অন্যদের ৬–৮ ml/kg PBW।' } },
  { id: 'ms_vmax', gen: 'Peak inspiratory flow', key: 'vmax', names: { pb: 'VMAX', dr: 'Flow (insp. flow)', ha: '— (from Vt, TI, pattern)', ge: 'Flow' }, gloss: ['VMAX', 'Peak flow setting'],
    en: { what: 'In volume control, how fast the set volume is delivered (L/min). On PB machines VMAX, VT, flow pattern and TPL together decide TI.',
      use: 'Match the patient\'s flow demand and control inspiratory time.',
      up: 'Shorter TI, longer Te (good for obstruction), less flow starvation; higher Ppeak.',
      down: 'Longer TI, lower Ppeak; risk of flow starvation and auto-PEEP if Te becomes short.',
      usual: '40–60 L/min in most adults; 60–80 L/min in asthma/COPD or high demand.' },
    bn: { what: 'Volume control-এ সেট করা volume কত দ্রুত দেওয়া হবে (লিটার/মিনিট)। PB মেশিনে VMAX, VT, flow pattern আর TPL মিলে TI ঠিক হয়।',
      use: 'রোগীর flow-এর চাহিদা মেটানো আর inspiration-এর সময় নিয়ন্ত্রণ করা।',
      up: 'TI কমে, Te বাড়ে (obstruction-এ ভালো), flow starvation কমে; Ppeak বাড়ে।',
      down: 'TI বাড়ে, Ppeak কমে; Te ছোট হয়ে গেলে flow starvation আর auto-PEEP-এর ঝুঁকি।',
      usual: 'বেশিরভাগ প্রাপ্তবয়স্কে ৪০–৬০ লিটার/মিনিট; asthma/COPD বা বেশি চাহিদায় ৬০–৮০।' } },
  { id: 'ms_flowpat', gen: 'Flow pattern', key: 'flowPattern', names: { pb: 'Flow pattern (Square / Descending ramp)', dr: 'Constant flow; AutoFlow = decelerating', ha: 'Flow pattern (Square, 50%/100% decel, Sine)', ge: 'Constant flow (VC)' }, gloss: ['Descending ramp', 'Square flow pattern'],
    en: { what: 'Shape of inspiratory flow in volume control: square (constant) or descending ramp (decelerating).',
      use: 'Square flow is needed for Raw and stress index; a ramp gives lower peak pressure and better comfort.',
      up: 'Changing square → ramp: lower Ppeak, longer effective inspiration at the same VMAX (PB lengthens TI).',
      down: 'Ramp → square: higher Ppeak, cleaner mechanics measurement.',
      usual: 'Descending ramp for most patients; square while measuring mechanics.' },
    bn: { what: 'Volume control-এ inspiratory flow-এর আকৃতি: square (একই flow) অথবা descending ramp (কমতে থাকা flow)।',
      use: 'Raw আর stress index মাপতে square flow লাগে; ramp-এ peak pressure কম থাকে, রোগী আরাম পায়।',
      up: 'Square থেকে ramp-এ গেলে: Ppeak কমে, একই VMAX-এ inspiration লম্বা হয় (PB নিজে TI বাড়ায়)।',
      down: 'Ramp থেকে square-এ গেলে: Ppeak বাড়ে, mechanics মাপা পরিষ্কার হয়।',
      usual: 'বেশিরভাগ রোগীতে descending ramp; mechanics মাপার সময় square।' } },
  { id: 'ms_tpl', gen: 'Plateau time', key: 'pause', names: { pb: 'TPL', dr: 'Plateau = Ti − VT/Flow', ha: 'Pause', ge: 'Tpause' }, gloss: ['TPL', 'Tpause', 'Plateau time setting'],
    en: { what: 'A zero-flow period at the end of a volume breath; gas redistributes and Pplat can be read every breath.',
      use: 'Continuous Pplat monitoring; slightly better gas distribution.',
      up: 'Longer inspiration, higher mean airway pressure (oxygenation) but less Te → auto-PEEP risk.',
      down: 'More expiratory time; Pplat only from a manual insp pause.',
      usual: '0–0.5 s (PB TPL range 0–2 s).' },
    bn: { what: 'Volume শ্বাসের শেষে flow শূন্য রাখার সময়; gas সব জায়গায় ছড়ায় আর প্রতি শ্বাসে Pplat দেখা যায়।',
      use: 'সবসময় Pplat দেখা; gas আরেকটু ভালোভাবে ছড়ানো।',
      up: 'Inspiration লম্বা হয়, mean airway pressure বাড়ে (oxygenation), কিন্তু Te কমে → auto-PEEP-এর ঝুঁকি।',
      down: 'শ্বাস ছাড়ার সময় বাড়ে; Pplat পেতে তখন আলাদা করে insp pause দিতে হয়।',
      usual: '০–০.৫ সেকেন্ড (PB TPL-এর সীমা ০–২ সেকেন্ড)।' } },
  { id: 'ms_ti', gen: 'Inspiratory time setting', key: 'ti', names: { pb: 'TI (or I:E / TE held constant)', dr: 'Ti', ha: 'TI (or I:E)', ge: 'Tinsp' }, gloss: ['TI', 'Tinsp', 'Ti setting'],
    en: { what: 'How long each mandatory inspiration lasts (seconds). In PC, PB and others let you hold TI, I:E or TE constant when the rate changes.',
      use: 'Controls I:E ratio, mean airway pressure and, in PC, how much volume enters.',
      up: 'Higher Pmean → better oxygenation; more Vt in PC if flow had not reached zero; less Te → auto-PEEP, hypotension; much longer than the patient\'s own Ti causes discomfort and fighting.',
      down: 'More Te (good in COPD/asthma); in PC less Vt if inspiration is cut short; may cause double triggering if shorter than the patient\'s neural Ti.',
      usual: 'Adults 0.8–1.2 s (I:E about 1:2); obstruction 0.7–1.0 s.' },
    bn: { what: 'প্রতিটি mandatory inspiration কতক্ষণ চলে (সেকেন্ড)। PC-তে PB আর অন্যরা rate বদলালে TI, I:E অথবা TE-র কোনটা স্থির থাকবে, তা বেছে নিতে দেয়।',
      use: 'I:E ratio, mean airway pressure, আর PC-তে কতটা volume ঢুকবে – তা নিয়ন্ত্রণ করে।',
      up: 'Pmean বাড়ে → oxygenation ভালো হয়; PC-তে flow শূন্যে না পৌঁছালে Vt বাড়ে; Te কমে → auto-PEEP, রক্তচাপ পড়া; রোগীর নিজের Ti-এর চেয়ে অনেক লম্বা হলে অস্বস্তি আর মেশিনের সঙ্গে লড়াই।',
      down: 'Te বাড়ে (COPD/asthma-য় ভালো); PC-তে inspiration কেটে গেলে Vt কমে; রোগীর নিজের Ti-এর চেয়ে ছোট হলে double triggering হতে পারে।',
      usual: 'প্রাপ্তবয়স্ক ০.৮–১.২ সেকেন্ড (I:E প্রায় ১:২); obstruction-এ ০.৭–১.০ সেকেন্ড।' } },
  { id: 'ms_pi', gen: 'Inspiratory pressure setting', key: 'pinsp', names: { pb: 'PI (above PEEP)', dr: 'Pinsp (absolute, includes PEEP)', ha: 'Pcontrol (above PEEP)', ge: 'Pinsp (above PEEP)' }, gloss: ['PI', 'Pcontrol', 'Pinsp'],
    en: { what: 'The pressure applied during pressure-controlled breaths. Careful: Dräger Pinsp is the absolute level (PEEP included); PB PI, Hamilton Pcontrol and GE Pinsp are above PEEP.',
      use: 'Sets the driving pressure and therefore Vt in PC modes.',
      up: 'Bigger Vt and lower PaCO2, but higher Pplat/driving pressure → lung injury.',
      down: 'Smaller Vt, PaCO2 rises; may be too little for a stiff lung.',
      usual: 'Start 10–15 cmH2O above PEEP; aim Vt 6–8 ml/kg PBW and Pplat ≤ 30.' },
    bn: { what: 'Pressure-controlled শ্বাসে যে pressure দেওয়া হয়। সাবধান: Dräger-এর Pinsp হলো মোট মাত্রা (PEEP সহ); PB-র PI, Hamilton-এর Pcontrol আর GE-র Pinsp হলো PEEP-এর ওপরে।',
      use: 'PC mode-এ driving pressure আর সেই সূত্রে Vt ঠিক করে।',
      up: 'Vt বাড়ে, PaCO2 কমে, কিন্তু Pplat/driving pressure বাড়ে → ফুসফুসের ক্ষতি।',
      down: 'Vt কমে, PaCO2 বাড়ে; শক্ত ফুসফুসে যথেষ্ট না-ও হতে পারে।',
      usual: 'PEEP-এর ওপরে ১০–১৫ cmH2O দিয়ে শুরু; লক্ষ্য Vt ৬–৮ ml/kg PBW আর Pplat ৩০-এর মধ্যে।' } },
  { id: 'ms_psupp', gen: 'Pressure support setting', key: 'ps', names: { pb: 'PSUPP', dr: 'ΔPsupp', ha: 'Psupport', ge: 'PS' }, gloss: ['PSUPP', 'ΔPsupp', 'Psupport', 'Psupp'],
    en: { what: 'Pressure added above PEEP to every spontaneous breath (PS, SIMV spontaneous breaths, BiLevel spontaneous breaths).',
      use: 'Unloads the breathing muscles and overcomes tube resistance during weaning.',
      up: 'Bigger Vt, lower RR and work of breathing; too much → over-assistance, ineffective triggering, delayed cycling, apnoea in sleep.',
      down: 'Patient does more work; RR rises, Vt falls (RSBI rises) – used to wean.',
      usual: '5–15 cmH2O; aim Vt 6–8 ml/kg and RR < 25–30. SBT at 5–8 cmH2O.' },
    bn: { what: 'প্রতিটি spontaneous শ্বাসে PEEP-এর ওপরে যে বাড়তি pressure দেওয়া হয় (PS, SIMV-র নিজস্ব শ্বাস, BiLevel-এর নিজস্ব শ্বাস)।',
      use: 'শ্বাসপেশির বোঝা কমায় আর weaning-এর সময় tube-এর resistance কাটায়।',
      up: 'Vt বাড়ে, RR আর পরিশ্রম কমে; বেশি হলে → অতিরিক্ত সাহায্য, ineffective triggering, delayed cycling, ঘুমে apnoea।',
      down: 'রোগী বেশি পরিশ্রম করে; RR বাড়ে, Vt কমে (RSBI বাড়ে) – weaning-এ এভাবেই কমানো হয়।',
      usual: '৫–১৫ cmH2O; লক্ষ্য Vt ৬–৮ ml/kg আর RR ২৫–৩০-এর নিচে। SBT ৫–৮ cmH2O-এ।' } },
  { id: 'ms_peep', gen: 'PEEP setting', key: 'peep', names: { pb: 'PEEP (PL in BiLevel)', dr: 'PEEP (Plow in APRV)', ha: 'PEEP/CPAP', ge: 'PEEP' }, gloss: ['PEEP/CPAP', 'EPAP'],
    en: { what: 'Pressure held at the end of expiration.',
      use: 'Keeps alveoli open, improves oxygenation, prevents atelectrauma; offsets auto-PEEP in spontaneous COPD patients.',
      up: 'Better oxygenation in recruitable lungs; but overdistension, dead space, lower BP and venous return.',
      down: 'Better BP; risk of derecruitment and hypoxaemia.',
      usual: '5 cmH2O minimum; ARDS 8–16 by PEEP/FiO2 table or best compliance; COPD 4–8 (≈ 80% of PEEPi if triggering is hard).' },
    bn: { what: 'শ্বাস ছাড়ার শেষে ধরে রাখা pressure।',
      use: 'Alveoli খোলা রাখে, oxygenation বাড়ায়, atelectrauma ঠেকায়; নিজে শ্বাস নেওয়া COPD রোগীর auto-PEEP-এর ভার কমায়।',
      up: 'Recruit করা যায় এমন ফুসফুসে oxygenation ভালো হয়; কিন্তু overdistension, dead space বাড়া, রক্তচাপ আর venous return কমা।',
      down: 'রক্তচাপ ভালো হয়; alveoli চুপসে যাওয়া আর hypoxaemia-র ঝুঁকি।',
      usual: 'কমপক্ষে ৫ cmH2O; ARDS-এ PEEP/FiO2 table বা best compliance অনুযায়ী ৮–১৬; COPD-তে ৪–৮ (trigger করতে কষ্ট হলে PEEPi-এর প্রায় ৮০%)।' } },
  { id: 'ms_o2', gen: 'Oxygen setting', key: 'fio2', names: { pb: 'O2%', dr: 'FiO2', ha: 'Oxygen', ge: 'FiO2' }, gloss: ['O2%', 'Oxygen %'],
    en: { what: 'Percentage of oxygen in the delivered gas (21–100%).',
      use: 'Quickest way to raise PaO2/SpO2.',
      up: 'Higher SpO2 (little effect with big shunt); oxygen toxicity and absorption atelectasis with long use.',
      down: 'Less toxicity; SpO2 falls.',
      usual: 'Lowest FiO2 for SpO2 92–96% (88–92% in chronic hypercapnia); try to keep ≤ 60%.' },
    bn: { what: 'দেওয়া gas-এ oxygen-এর শতাংশ (২১–১০০%)।',
      use: 'PaO2/SpO2 বাড়ানোর সবচেয়ে দ্রুত উপায়।',
      up: 'SpO2 বাড়ে (বড় shunt-এ খুব কম); দীর্ঘ সময় দিলে oxygen toxicity আর absorption atelectasis।',
      down: 'Toxicity কমে; SpO2 কমে যায়।',
      usual: 'SpO2 ৯২–৯৬% রাখতে যত কম FiO2 লাগে (দীর্ঘমেয়াদি hypercapnia-য় ৮৮–৯২%); ৬০%-এর নিচে রাখার চেষ্টা।' } },
  { id: 'ms_rise', gen: 'Rise time setting', key: 'rise', names: { pb: 'Rise time % (1–100%, higher = faster)', dr: 'Slope (s)', ha: 'P-ramp (ms)', ge: 'Rise Time / PS Rise Time (ms)' }, gloss: ['Rise time %', 'Slope', 'P-ramp', 'PS Rise Time', 'Rise Time'],
    en: { what: 'How fast pressure rises to the target in pressure-controlled and pressure-support breaths. Note the units: PB uses % (higher % = faster rise), others use time (shorter = faster).',
      use: 'Match the patient\'s initial flow demand.',
      up: 'Faster rise (PB higher %, shorter ms/s): high early flow, relieves flow starvation; too fast → pressure overshoot spike, premature cycling.',
      down: 'Slower rise: smoother, but demanding patients feel starved of flow and work harder.',
      usual: 'PB 50–80%; Hamilton 50–100 ms; Dräger 0.1–0.2 s; GE 50–150 ms. Watch the start of the pressure curve.' },
    bn: { what: 'Pressure-controlled আর pressure-support শ্বাসে লক্ষ্য pressure-এ কত দ্রুত পৌঁছায়। এককের দিকে খেয়াল রাখো: PB-তে % (যত বেশি %, তত দ্রুত), অন্যদের সময় (যত কম, তত দ্রুত)।',
      use: 'শুরুর দিকে রোগীর flow-এর চাহিদার সঙ্গে মেলানো।',
      up: 'দ্রুত rise (PB-তে বেশি %, কম ms/s): শুরুতে বেশি flow, flow starvation কমে; খুব দ্রুত হলে → pressure overshoot spike, premature cycling।',
      down: 'ধীর rise: মসৃণ, কিন্তু বেশি চাহিদার রোগী flow কম পায় আর বেশি পরিশ্রম করে।',
      usual: 'PB ৫০–৮০%; Hamilton ৫০–১০০ ms; Dräger ০.১–০.২ সেকেন্ড; GE ৫০–১৫০ ms। Pressure রেখার শুরুটা দেখে ঠিক করো।' } },
  { id: 'ms_esens', gen: 'Expiratory sensitivity', key: 'cycle', names: { pb: 'ESENS (%)', dr: 'Exp. term. (%)', ha: 'ETS (%)', ge: 'Exp Trigger (%)' }, gloss: ['ESENS', 'Exp. term.', 'ETS', 'Exp Trigger', 'Expiratory sensitivity'],
    en: { what: 'In spontaneous (PS/VS) breaths, inspiration ends when flow falls to this % of its peak.',
      use: 'Matches the end of the machine breath to the end of the patient\'s effort.',
      up: 'Earlier cycling, shorter TI: good in COPD (prevents delayed cycling and auto-PEEP); too high → premature cycling, double triggering, small Vt.',
      down: 'Later cycling, longer TI and bigger Vt; too low → delayed cycling, patient fights to exhale (pressure spike).',
      usual: '25% default; COPD 40–50%; ARDS / restrictive 10–20%; NIV with leak 30–50%.' },
    bn: { what: 'Spontaneous (PS/VS) শ্বাসে flow কমতে কমতে তার সর্বোচ্চ মানের এই শতাংশে পৌঁছালে inspiration শেষ হয়।',
      use: 'মেশিনের শ্বাস যেন রোগীর চেষ্টা শেষ হওয়ার সঙ্গে সঙ্গে শেষ হয়।',
      up: 'আগে cycle হয়, TI ছোট হয়: COPD-তে ভালো (delayed cycling আর auto-PEEP ঠেকায়); খুব বেশি হলে → premature cycling, double triggering, ছোট Vt।',
      down: 'পরে cycle হয়, TI আর Vt বাড়ে; খুব কম হলে → delayed cycling, রোগী শ্বাস ছাড়তে লড়াই করে (pressure spike)।',
      usual: 'সাধারণত ২৫%; COPD ৪০–৫০%; ARDS / restrictive ১০–২০%; leak-সহ NIV ৩০–৫০%।' } },
  { id: 'ms_trigtype', gen: 'Trigger type', key: 'trigger', names: { pb: 'V-TRIG (flow) / P-TRIG (pressure)', dr: 'Flow trigger', ha: 'Flowtrigger / Ptrigger', ge: 'Insp Trigger (flow / pressure)' }, gloss: ['V-TRIG', 'P-TRIG', 'Trigger type', 'Insp Trigger'],
    en: { what: 'How the machine senses the patient\'s effort: a rise in flow (flow trigger, V-TRIG) or a drop in pressure below PEEP (pressure trigger, P-TRIG).',
      use: 'Lets the patient start breaths – synchrony, comfort, less sedation.',
      up: 'Flow trigger: usually more sensitive and less work for the patient; leaks can cause auto-triggering unless leak compensation is on.',
      down: 'Pressure trigger: less affected by leaks/oscillations, but needs more effort (a small negative dip before each breath).',
      usual: 'Flow trigger (V-TRIG) for most adults; pressure trigger if auto-triggering cannot be stopped otherwise.' },
    bn: { what: 'মেশিন কীভাবে রোগীর চেষ্টা ধরে: flow বেড়ে গেলে (flow trigger, V-TRIG) অথবা pressure PEEP-এর নিচে নামলে (pressure trigger, P-TRIG)।',
      use: 'রোগী নিজে শ্বাস শুরু করতে পারে – synchrony, আরাম, কম sedation।',
      up: 'Flow trigger: সাধারণত বেশি সংবেদনশীল, রোগীর পরিশ্রম কম; leak compensation বন্ধ থাকলে leak থেকে auto-triggering হতে পারে।',
      down: 'Pressure trigger: leak বা ঢেউয়ে কম প্রভাবিত, কিন্তু বেশি চেষ্টা লাগে (প্রতি শ্বাসের আগে ছোট negative খাঁজ)।',
      usual: 'বেশিরভাগ প্রাপ্তবয়স্কে flow trigger (V-TRIG); অন্যভাবে auto-triggering না থামলে pressure trigger।' } },
  { id: 'ms_vsens', gen: 'Flow trigger sensitivity', key: 'trigFlow', names: { pb: 'VSENS (L/min)', dr: 'Trigger (L/min)', ha: 'Flowtrigger (L/min)', ge: 'Insp Trigger (flow)' }, gloss: ['VSENS', 'Flowtrigger'],
    en: { what: 'The patient inspiratory flow (L/min) needed to start a breath with flow triggering.',
      use: 'Sets how easy it is for the patient to trigger.',
      up: 'Higher number = less sensitive: fewer auto-triggers, but missed triggers and more work.',
      down: 'Lower number = more sensitive: easy triggering, but auto-triggering from leaks, water, heartbeat.',
      usual: '1–3 L/min in adults (PB VSENS range 0.2–20 L/min).' },
    bn: { what: 'Flow trigger-এ শ্বাস শুরু করতে রোগীর যতটুকু inspiratory flow (লিটার/মিনিট) লাগে।',
      use: 'রোগীর পক্ষে trigger করা কত সহজ হবে, তা ঠিক করে।',
      up: 'সংখ্যা বাড়ালে কম সংবেদনশীল: auto-trigger কমে, কিন্তু missed trigger আর বেশি পরিশ্রম।',
      down: 'সংখ্যা কমালে বেশি সংবেদনশীল: সহজে trigger হয়, কিন্তু leak, পানি, হৃৎস্পন্দন থেকে auto-triggering।',
      usual: 'প্রাপ্তবয়স্কে ১–৩ লিটার/মিনিট (PB VSENS-এর সীমা ০.২–২০)।' } },
  { id: 'ms_psens', gen: 'Pressure trigger sensitivity', key: 'trigP', names: { pb: 'PSENS (cmH2O below PEEP)', dr: 'Pressure trigger', ha: 'Ptrigger (cmH2O)', ge: 'Insp Trigger (pressure)' }, gloss: ['PSENS', 'Ptrigger'],
    en: { what: 'How far airway pressure must fall below PEEP to start a breath with pressure triggering.',
      use: 'Alternative to flow triggering.',
      up: 'Larger value = less sensitive: more effort, missed triggers.',
      down: 'Smaller value = more sensitive: risk of auto-triggering.',
      usual: '1–2 cmH2O below PEEP (PB 0.1–20).' },
    bn: { what: 'Pressure trigger-এ শ্বাস শুরু করতে airway pressure-কে PEEP-এর নিচে কতটা নামতে হবে।',
      use: 'Flow trigger-এর বিকল্প।',
      up: 'মান বাড়ালে কম সংবেদনশীল: বেশি চেষ্টা, missed trigger।',
      down: 'মান কমালে বেশি সংবেদনশীল: auto-triggering-এর ঝুঁকি।',
      usual: 'PEEP-এর ১–২ cmH2O নিচে (PB ০.১–২০)।' } },
  { id: 'ms_bilevel', gen: 'BiLevel pressures and times', key: 'phigh', names: { pb: 'PH / PL, TH / TL', dr: 'Phigh / Plow, Thigh / Tlow (APRV); Pinsp/PEEP (BIPAP)', ha: 'P high / P low, T high / T low', ge: 'Phigh / Plow, Thigh / Tlow' }, gloss: ['PL', 'TH', 'TL', 'Phigh', 'Plow', 'Thigh', 'Tlow', 'P high', 'P low', 'T high', 'T low'],
    en: { what: 'The two pressure levels of BiLevel/APRV and how long each lasts.',
      use: 'PH/TH set mean airway pressure (oxygenation); the difference PH−PL and the releases set ventilation.',
      up: 'Higher PH or longer TH → more recruitment and oxygenation, less CO2 clearance, risk of overdistension and hypotension. Longer TL → bigger release volume but derecruitment.',
      down: 'Lower PH → less stress, lower Pmean. Shorter TL → keeps intrinsic PEEP, smaller releases (watch CO2).',
      usual: 'APRV: PH ≈ Pplat (20–30), PL 0–5, TH 4–6 s, TL 0.4–0.8 s (cut flow at 50–75% of peak). BiLevel: like PC with free spontaneous breathing.' },
    bn: { what: 'BiLevel/APRV-এর দুটি pressure স্তর আর প্রতিটি কতক্ষণ থাকে।',
      use: 'PH/TH ঠিক করে mean airway pressure (oxygenation); PH−PL-এর পার্থক্য আর release ঠিক করে ventilation।',
      up: 'PH বেশি বা TH লম্বা → বেশি recruitment আর oxygenation, CO2 কম বের হয়, overdistension আর রক্তচাপ পড়ার ঝুঁকি। TL লম্বা → release volume বড়, কিন্তু alveoli চুপসে যায়।',
      down: 'PH কম → চাপ কম, Pmean কম। TL ছোট → ভেতরে কিছু PEEP থাকে, release ছোট (CO2 খেয়াল রাখো)।',
      usual: 'APRV: PH ≈ Pplat (২০–৩০), PL ০–৫, TH ৪–৬ সেকেন্ড, TL ০.৪–০.৮ সেকেন্ড (flow সর্বোচ্চের ৫০–৭৫%-এ কেটে দাও)। BiLevel: PC-এর মতো, সঙ্গে স্বাধীন spontaneous শ্বাস।' } },
  { id: 'ms_pavsupp', gen: 'PAV+ % support', key: 'pavSupp', names: { pb: '% Supp (PAV+)', dr: 'Flow Assist / Vol Assist (SPN-PPS)', ha: '— (not available)', ge: '— (not available)' }, gloss: ['% Supp', 'Flow Assist', 'Vol Assist'],
    en: { what: 'In PAV+, the share of the total work of breathing that the ventilator takes over (5–95%). The machine measures R and C every few breaths.',
      use: 'Support follows effort breath by breath: stronger effort → more pressure. Comfortable, fewer asynchronies.',
      up: 'Less patient work; too high → runaway (over-assistance) and big volumes.',
      down: 'More patient work; target the WOB bar in the normal zone.',
      usual: 'Start 50–70%; aim patient WOB 0.3–0.7 J/L. Not for patients without drive or with big leaks.' },
    bn: { what: 'PAV+-এ শ্বাসের মোট পরিশ্রমের যে অংশ ventilator নিজে বহন করে (৫–৯৫%)। মেশিন কয়েক শ্বাস পরপর R আর C মাপে।',
      use: 'প্রতি শ্বাসে সাহায্য চেষ্টার সঙ্গে চলে: বেশি চেষ্টা → বেশি pressure। আরামদায়ক, asynchrony কম।',
      up: 'রোগীর পরিশ্রম কমে; খুব বেশি হলে → runaway (অতিরিক্ত সাহায্য) আর বড় volume।',
      down: 'রোগীর পরিশ্রম বাড়ে; WOB bar স্বাভাবিক অংশে রাখার লক্ষ্য।',
      usual: '৫০–৭০% দিয়ে শুরু; লক্ষ্য রোগীর WOB ০.৩–০.৭ J/L। যাদের শ্বাসের তাড়না নেই বা বড় leak আছে, তাদের জন্য নয়।' } },
  { id: 'ms_tc', gen: 'Tube compensation', key: 'atc', names: { pb: 'TC: % Supp + Tube type & I.D.', dr: 'ATC (% + tube type, Ø)', ha: 'TRC', ge: 'Tube compensation' }, gloss: ['TC', 'TRC', 'Tube I.D.', 'Tube ID'],
    en: { what: 'The ventilator calculates the pressure lost across the endotracheal/tracheostomy tube and adds exactly that during spontaneous breaths.',
      use: 'Removes the extra work caused by the tube – useful in SBTs and weaning.',
      up: '% support up → less tube work; 100% = as if extubated.',
      down: 'Patient must overcome the tube resistance himself.',
      usual: '100% for adults; enter the correct tube type and internal diameter.' },
    bn: { what: 'Endotracheal/tracheostomy tube-এর ভেতর দিয়ে যতটা pressure হারায়, ventilator তা হিসাব করে spontaneous শ্বাসে ঠিক ততটুকু যোগ করে।',
      use: 'Tube-এর কারণে বাড়তি পরিশ্রম সরিয়ে দেয় – SBT আর weaning-এ কাজে লাগে।',
      up: '% সাহায্য বাড়ালে → tube-এর পরিশ্রম কমে; ১০০% = যেন tube নেই।',
      down: 'Tube-এর resistance রোগীকে নিজেই পার হতে হয়।',
      usual: 'প্রাপ্তবয়স্কে ১০০%; tube-এর ধরন আর ভেতরের ব্যাস ঠিকমতো দিতে হবে।' } },
  { id: 'ms_leak', gen: 'Leak compensation setting', key: 'leakComp', names: { pb: 'Leak Sync', dr: 'Leakage compensation', ha: 'Leak compensation (NIV)', ge: 'Leak compensation' }, gloss: ['Leak Sync', 'Leakage compensation'],
    en: { what: 'The ventilator measures continuous leak and corrects triggering, cycling and volume readings for it. On PB 980 Leak Sync works in A/C, SIMV, SPONT and BiLevel but not with TC or PAV+.',
      use: 'NIV, uncuffed tubes, cuff leaks, bronchopleural fistula.',
      up: 'On: prevents auto-triggering and wrong cycling from leak.',
      down: 'Off: leak may cause auto-triggering and falsely high inspired volumes.',
      usual: 'On in NIV and whenever there is a known leak.' },
    bn: { what: 'Ventilator একটানা leak মেপে trigger, cycling আর volume-এর মাপ সেই অনুযায়ী ঠিক করে। PB 980-এ Leak Sync চলে A/C, SIMV, SPONT আর BiLevel-এ, কিন্তু TC বা PAV+-এ চলে না।',
      use: 'NIV, cuff ছাড়া tube, cuff leak, bronchopleural fistula।',
      up: 'চালু: leak থেকে auto-triggering আর ভুল cycling ঠেকায়।',
      down: 'বন্ধ: leak থেকে auto-triggering হতে পারে, inspired volume ভুল করে বেশি দেখায়।',
      usual: 'NIV-তে আর যেকোনো জানা leak-এ চালু রাখো।' } },
  { id: 'ms_humid', gen: 'Humidification type', key: 'humid', names: { pb: 'Humidification type (HME / non-heated / heated exp. tube)', dr: 'Humidifier / HME', ha: 'Humidifier / HME', ge: 'Humidifier / HME' }, gloss: ['Humidification type', 'HME', 'heat-moisture exchanger', 'Heated humidifier'],
    en: { what: 'How inspired gas is warmed and humidified: passive HME at the Y-piece or an active heated humidifier. PB machines ask for it to correct volume measurements.',
      use: 'Prevents dry, thick secretions and tube blockage.',
      up: 'HME adds about 50 ml dead space and some resistance → higher PaCO2, harder triggering; not for thick/bloody secretions or big leaks.',
      down: 'Heated humidifier: no extra dead space, better for long ventilation, ARDS with small Vt, thick secretions.',
      usual: 'HME for short-term ventilation; heated humidifier for > 4–5 days, small Vt or secretion problems.' },
    bn: { what: 'শ্বাসের gas কীভাবে গরম আর আর্দ্র করা হয়: Y-piece-এ passive HME অথবা সক্রিয় heated humidifier। Volume ঠিকমতো মাপতে PB মেশিন এটা জানতে চায়।',
      use: 'Secretion শুকিয়ে ঘন হওয়া আর tube বন্ধ হওয়া ঠেকায়।',
      up: 'HME প্রায় ৫০ ml dead space আর কিছুটা resistance যোগ করে → PaCO2 বাড়ে, trigger করা কঠিন হয়; ঘন/রক্তমিশ্রিত secretion বা বড় leak-এ নয়।',
      down: 'Heated humidifier: বাড়তি dead space নেই, দীর্ঘ ventilation, ছোট Vt-এর ARDS আর ঘন secretion-এ ভালো।',
      usual: 'অল্প সময়ের ventilation-এ HME; ৪–৫ দিনের বেশি, ছোট Vt বা secretion-এর সমস্যায় heated humidifier।' } },
  { id: 'ms_apnea', gen: 'Apnea settings', key: 'apneaTime', names: { pb: 'TA (apnea interval) + apnea VT/PI, f, O2%', dr: 'Tapn + apnoea ventilation', ha: 'Apnea backup', ge: 'Apnea time / Minimum rate' }, gloss: ['TA', 'Apnea interval', 'Apnea backup', 'Tapn'],
    en: { what: 'If no breath occurs for the apnea interval, the ventilator starts backup mandatory breaths with separate apnea settings.',
      use: 'Safety net in spontaneous modes (PS, VS, CPAP, PAV+, BiLevel).',
      up: 'Longer interval: fewer nuisance alarms but longer apnoea before rescue.',
      down: 'Shorter interval: faster rescue; more frequent switching in patients with periodic breathing.',
      usual: 'TA 15–20 s; apnea settings similar to a normal A/C setting for that patient.' },
    bn: { what: 'নির্দিষ্ট সময় (apnea interval) কোনো শ্বাস না হলে ventilator আলাদা apnea setting দিয়ে backup mandatory শ্বাস শুরু করে।',
      use: 'Spontaneous mode-এ (PS, VS, CPAP, PAV+, BiLevel) নিরাপত্তার জাল।',
      up: 'সময় বাড়ালে: অপ্রয়োজনীয় alarm কমে, কিন্তু উদ্ধারের আগে apnoea লম্বা হয়।',
      down: 'সময় কমালে: দ্রুত উদ্ধার; পর্যায়ক্রমিক শ্বাসের রোগীতে বারবার backup-এ চলে যায়।',
      usual: 'TA ১৫–২০ সেকেন্ড; apnea setting ওই রোগীর স্বাভাবিক A/C setting-এর মতো।' } },
  { id: 'ms_maxti', gen: 'Maximum spontaneous inspiratory time', key: 'maxTi', names: { pb: '↑TI SPONT (NIV)', dr: 'Ti max', ha: 'TI max', ge: 'Tsupp' }, gloss: ['↑TI SPONT', 'TI max', 'Ti max', 'Tsupp'],
    en: { what: 'Upper limit for how long a spontaneous (PS) breath may last if flow never falls to the cycle threshold.',
      use: 'Mainly NIV with leaks and COPD, where a breath could otherwise go on too long.',
      up: 'Allows longer breaths; risk of delayed cycling with leaks.',
      down: 'Shorter breaths, better synchrony with leaks; too short cuts the breath.',
      usual: '1.0–1.5 s in adults on NIV; up to 2 s invasive.' },
    bn: { what: 'Flow কখনো cycle সীমায় না নামলে একটি spontaneous (PS) শ্বাস সর্বোচ্চ কতক্ষণ চলতে পারবে।',
      use: 'মূলত leak-সহ NIV আর COPD-তে, যেখানে নইলে শ্বাস অনেক লম্বা হয়ে যেত।',
      up: 'লম্বা শ্বাস চলতে দেয়; leak থাকলে delayed cycling-এর ঝুঁকি।',
      down: 'শ্বাস ছোট হয়, leak-এ synchrony ভালো; খুব কম হলে শ্বাস কেটে যায়।',
      usual: 'NIV-তে প্রাপ্তবয়স্কে ১.০–১.৫ সেকেন্ড; invasive-এ ২ সেকেন্ড পর্যন্ত।' } },
  { id: 'ms_sigh', gen: 'Sigh setting', key: 'sighEvery', names: { pb: '— (not on 840/980)', dr: 'Sigh (intermittent PEEP)', ha: 'Sigh', ge: '—' }, gloss: ['Sigh breath setting'],
    en: { what: 'A periodic bigger breath (or higher pressure) delivered automatically.',
      use: 'To re-open atelectasis in patients on small Vt; less used now.',
      up: 'More frequent sighs: more recruitment but higher peak stress.',
      down: 'Fewer sighs: less stress.',
      usual: 'Off in most ICUs; if used, every 50–100 breaths.' },
    bn: { what: 'নির্দিষ্ট সময় পরপর মেশিন নিজে থেকে একটা বড় শ্বাস (বা বেশি pressure) দেয়।',
      use: 'ছোট Vt-এর রোগীতে চুপসে যাওয়া অংশ খুলতে; এখন কম ব্যবহার হয়।',
      up: 'বেশি sigh: বেশি recruitment, কিন্তু সর্বোচ্চ চাপ বাড়ে।',
      down: 'কম sigh: চাপ কম।',
      usual: 'বেশিরভাগ ICU-তে বন্ধ; ব্যবহার করলে প্রতি ৫০–১০০ শ্বাসে একবার।' } },
  { id: 'ms_o2boost', gen: '100% O2 for 2 minutes', key: 'o2', names: { pb: '100% O2/CAL (840) · Elevate O2 (980)', dr: 'O2 ↑ (suction)', ha: 'O2 enrichment', ge: 'Increase O2' }, gloss: ['100% O2/CAL', 'Elevate O2', 'O2 enrichment', 'Increase O2'],
    en: { what: 'A key that raises FiO2 (to 100% or a set boost) for about 2 minutes, then returns automatically.',
      use: 'Pre-oxygenation before suction, bronchoscopy, transport, position change; brief desaturation.',
      up: '—', down: '—',
      usual: 'Use before open suction or procedures; do not leave the patient on high FiO2 longer than needed.' },
    bn: { what: 'একটা বোতাম, যা প্রায় ২ মিনিটের জন্য FiO2 বাড়িয়ে দেয় (১০০% বা সেট করা মাত্রায়), তারপর নিজে থেকেই আগের মানে ফেরে।',
      use: 'Suction, bronchoscopy, স্থানান্তর, অবস্থান বদলের আগে pre-oxygenation; অল্প সময়ের desaturation।',
      up: '—', down: '—',
      usual: 'Open suction বা procedure-এর আগে ব্যবহার করো; প্রয়োজনের বেশি সময় বেশি FiO2-এ রেখো না।' } },
  { id: 'ms_holds', gen: 'Inspiratory and expiratory pause keys', key: 'holds', names: { pb: 'Insp pause / Exp pause / Manual insp', dr: 'Insp. hold / Exp. hold / Man. insp.', ha: 'Insp hold / Exp hold / Manual breath', ge: 'Insp Hold / Exp Hold / Manual Breath' }, gloss: ['Insp pause', 'Exp pause', 'Manual insp', 'Insp. hold', 'Exp. hold'],
    en: { what: 'Insp pause closes the valves at end-inspiration (→ PPL, CSTAT, RSTAT). Exp pause closes them at end-expiration (→ PEEPTOT, PEEPI). Manual insp gives one extra breath.',
      use: 'Respiratory mechanics, auto-PEEP detection, troubleshooting high pressure.',
      up: '—', down: '—',
      usual: 'Passive patient, hold 0.5–2 s, read the value at the stable plateau.' },
    bn: { what: 'Insp pause inspiration-এর শেষে valve বন্ধ রাখে (→ PPL, CSTAT, RSTAT)। Exp pause expiration-এর শেষে বন্ধ রাখে (→ PEEPTOT, PEEPI)। Manual insp একটা বাড়তি শ্বাস দেয়।',
      use: 'ফুসফুসের mechanics মাপা, auto-PEEP ধরা, high pressure-এর কারণ খোঁজা।',
      up: '—', down: '—',
      usual: 'রোগী নিষ্ক্রিয় থাকতে হবে, ০.৫–২ সেকেন্ড hold, pressure স্থির হলে মান পড়ো।' } },
  { id: 'ms_pmax', gen: 'High pressure limit', key: 'pmax', names: { pb: '↑PPEAK alarm (breath truncated)', dr: 'Pmax (pressure limitation) + Paw high alarm', ha: 'Pressure alarm (high)', ge: 'Pmax' }, gloss: ['↑PPEAK', 'Pmax'],
    en: { what: 'Upper airway-pressure limit. When reached, the breath is ended (PB, Hamilton, GE) or pressure is limited (Dräger Pmax).',
      use: 'Protects against barotrauma during coughing, obstruction, biting.',
      up: 'Fewer interrupted breaths but less protection.',
      down: 'More protection; too close to Ppeak → frequent alarms and small Vt.',
      usual: '10 cmH2O above the usual Ppeak, generally ≤ 40 cmH2O.' },
    bn: { what: 'Airway pressure-এর সর্বোচ্চ সীমা। এতে পৌঁছালে শ্বাস শেষ করে দেওয়া হয় (PB, Hamilton, GE) অথবা pressure সীমিত রাখা হয় (Dräger Pmax)।',
      use: 'কাশি, বাধা, কামড়ানোর সময় barotrauma থেকে রক্ষা।',
      up: 'শ্বাস কম কাটে, কিন্তু সুরক্ষা কমে।',
      down: 'সুরক্ষা বাড়ে; Ppeak-এর খুব কাছে হলে বারবার alarm আর ছোট Vt।',
      usual: 'স্বাভাবিক Ppeak-এর ১০ cmH2O ওপরে, সাধারণত ৪০ cmH2O-এর মধ্যে।' } }
];

/* ---------- mode docs ---------- */
const MODE_DOCS = [
  { id: 'mm_ac', gen: 'Assist/Control (A/C)', names: { pb: 'A/C (VC, PC or VC+)', dr: 'VC-AC, PC-AC (VC-CMV/PC-CMV = no triggering)', ha: '(S)CMV, PCV+, APVcmv', ge: 'A/C VC, A/C PC, A/C PRVC' }, gloss: ['A/C', 'Assist control', 'Assist/Control', 'VC-CMV', 'PC-CMV', '(S)CMV', 'PCV+', 'A/C VC', 'A/C PC'], link: 'vc',
    en: { what: 'Every breath – machine- or patient-triggered – is a full mandatory breath (VC, PC or VC+). The set rate is the minimum.',
      when: 'Start of ventilation, sedated/paralysed patients, ARDS, shock, high work of breathing.',
      good: 'Guaranteed support; rests the muscles; precise Vt (VC) or pressure (PC).',
      caution: 'Patients with high drive get every effort as a full breath → hyperventilation, breath stacking, auto-PEEP.',
      start: 'VC: VT 6–8 ml/kg PBW, f 14–18, PEEP 5, O2 to SpO2 92–96%, VSENS 2–3 L/min.' },
    bn: { what: 'প্রতিটি শ্বাস – মেশিন বা রোগী যে-ই শুরু করুক – পুরো একটা mandatory শ্বাস (VC, PC বা VC+)। সেট করা rate হলো সর্বনিম্ন।',
      when: 'Ventilation-এর শুরুতে, sedated/paralysed রোগী, ARDS, shock, শ্বাসের বেশি পরিশ্রম।',
      good: 'নিশ্চিত সাহায্য; পেশি বিশ্রাম পায়; সঠিক Vt (VC) বা pressure (PC)।',
      caution: 'বেশি তাড়নার রোগী প্রতিটি চেষ্টায় পুরো শ্বাস পায় → hyperventilation, breath stacking, auto-PEEP।',
      start: 'VC: VT ৬–৮ ml/kg PBW, f ১৪–১৮, PEEP ৫, SpO2 ৯২–৯৬% রাখতে O2, VSENS ২–৩ লিটার/মিনিট।' } },
  { id: 'mm_simv', gen: 'SIMV mode', names: { pb: 'SIMV (VC, PC or VC+) + PS', dr: 'VC-SIMV, PC-SIMV', ha: 'SIMV, PSIMV+, APVsimv', ge: 'SIMV VC, SIMV PC, SIMV PRVC' }, gloss: ['PSIMV+', 'APVsimv', 'VC-SIMV', 'PC-SIMV', 'SIMV VC', 'SIMV PC', 'SIMV PRVC'], link: 'simv',
    en: { what: 'A set number of synchronised mandatory breaths; between them the patient breathes spontaneously with pressure support.',
      when: 'Patients who breathe partly by themselves; some units use it for weaning.',
      good: 'Guaranteed minimum ventilation with some spontaneous breathing.',
      caution: 'Not a better weaning method than PSV/SBT; low PS on spontaneous breaths increases work; mixed breath types confuse interpretation.',
      start: 'f 8–12 mandatory, VT 6–8 ml/kg, PSUPP 8–10, PEEP 5.' },
    bn: { what: 'নির্দিষ্ট সংখ্যক synchronised mandatory শ্বাস; মাঝে রোগী pressure support নিয়ে নিজে শ্বাস নেয়।',
      when: 'যে রোগী আংশিক নিজে শ্বাস নিতে পারে; কিছু ICU weaning-এ ব্যবহার করে।',
      good: 'নিশ্চিত ন্যূনতম ventilation, সঙ্গে কিছু নিজস্ব শ্বাস।',
      caution: 'PSV/SBT-এর চেয়ে ভালো weaning পদ্ধতি নয়; নিজস্ব শ্বাসে PS কম হলে পরিশ্রম বাড়ে; মিশ্র শ্বাসে graph বোঝা কঠিন।',
      start: 'Mandatory f ৮–১২, VT ৬–৮ ml/kg, PSUPP ৮–১০, PEEP ৫।' } },
  { id: 'mm_spont', gen: 'SPONT / pressure support mode', names: { pb: 'SPONT · PS', dr: 'SPN-CPAP/PS', ha: 'SPONT', ge: 'CPAP/PS' }, gloss: ['SPONT', 'SPN-CPAP/PS', 'CPAP/PS', 'SPONT-PS'], link: 'psv',
    en: { what: 'All breaths are patient-triggered and supported by PSUPP; each ends by ESENS. No set rate.',
      when: 'Awake patients with intact drive; weaning; SBT (PS 5–8).',
      good: 'Comfortable, patient controls rate, Ti and Vt; less sedation.',
      caution: 'No guaranteed ventilation – set apnea backup and low VE alarms. Watch premature/delayed cycling.',
      start: 'PSUPP 8–12, PEEP 5, ESENS 25% (COPD 40%), rise time moderate.' },
    bn: { what: 'সব শ্বাস রোগী শুরু করে, PSUPP সাহায্য করে; প্রতিটি শেষ হয় ESENS দিয়ে। কোনো নির্দিষ্ট rate নেই।',
      when: 'সজাগ রোগী যার শ্বাসের তাড়না আছে; weaning; SBT (PS ৫–৮)।',
      good: 'আরামদায়ক, rate, Ti আর Vt রোগী নিজে ঠিক করে; sedation কম লাগে।',
      caution: 'Ventilation নিশ্চিত নয় – apnea backup আর low VE alarm সেট রাখো। Premature/delayed cycling খেয়াল রাখো।',
      start: 'PSUPP ৮–১২, PEEP ৫, ESENS ২৫% (COPD ৪০%), rise time মাঝারি।' } },
  { id: 'mm_bilevel', gen: 'BiLevel / APRV mode', names: { pb: 'BiLevel (PH/PL, TH/TL, PS on spontaneous breaths)', dr: 'PC-BIPAP, PC-APRV', ha: 'DuoPAP, APRV', ge: 'BiLevel, BiLevel VG, APRV' }, gloss: ['BiLevel', 'PC-BIPAP', 'BIPAP', 'PC-APRV', 'DuoPAP', 'BiLevel VG', 'Bi-level'], link: 'aprv',
    en: { what: 'Pressure-controlled ventilation between two levels (PH and PL) where the patient can breathe spontaneously at any time, at both levels. APRV is the extreme form: long TH, very short TL.',
      when: 'Patients who are breathing but need pressure control (comfort, less sedation); ARDS/refractory hypoxaemia (APRV) to raise mean airway pressure.',
      good: 'Free spontaneous breathing improves V/Q and haemodynamics; high Pmean for oxygenation; less sedation and asynchrony.',
      caution: 'Vt varies – large spontaneous breaths at PH can overstretch the lung; CO2 may rise with short releases; avoid in severe obstruction.',
      start: 'BiLevel: PH = PEEP + 12–15, PL 5, TH 1–1.5 s, f 12–16, PS 5–10. APRV: PH ≈ Pplat 20–28, PL 0, TH 4–6 s, TL 0.4–0.8 s.' },
    bn: { what: 'দুটি স্তরের (PH আর PL) মধ্যে pressure-controlled ventilation, যেখানে রোগী যেকোনো সময়, দুই স্তরেই নিজে শ্বাস নিতে পারে। APRV হলো এর চরম রূপ: লম্বা TH, খুব ছোট TL।',
      when: 'যে রোগী নিজে শ্বাস নিচ্ছে কিন্তু pressure control দরকার (আরাম, কম sedation); ARDS/refractory hypoxaemia-য় (APRV) mean airway pressure বাড়াতে।',
      good: 'স্বাধীন spontaneous শ্বাস V/Q আর রক্তসঞ্চালন ভালো করে; oxygenation-এর জন্য বেশি Pmean; sedation আর asynchrony কম।',
      caution: 'Vt ওঠানামা করে – PH-এ বড় নিজস্ব শ্বাস ফুসফুসকে বেশি টানতে পারে; ছোট release-এ CO2 বাড়তে পারে; গুরুতর obstruction-এ এড়িয়ে চলো।',
      start: 'BiLevel: PH = PEEP + ১২–১৫, PL ৫, TH ১–১.৫ সেকেন্ড, f ১২–১৬, PS ৫–১০। APRV: PH ≈ Pplat ২০–২৮, PL ০, TH ৪–৬ সেকেন্ড, TL ০.৪–০.৮ সেকেন্ড।' } },
  { id: 'mm_cpap', gen: 'CPAP mode', names: { pb: 'SPONT with PSUPP 0 (or CPAP in NIV/neonates)', dr: 'SPN-CPAP', ha: 'SPONT (Psupport 0)', ge: 'CPAP/PS with PS 0' }, gloss: ['SPN-CPAP'], link: 'cpap',
    en: { what: 'Constant pressure through the cycle with no added support – the patient does all the breathing.',
      when: 'SBT, final weaning step, NIV for pulmonary oedema or OSA.',
      good: 'Simple; recruits alveoli and reduces preload/afterload in heart failure.',
      caution: 'No support for tube resistance unless TC/ATC is on; no guaranteed ventilation.',
      start: 'PEEP/CPAP 5–8 cmH2O.' },
    bn: { what: 'পুরো শ্বাসচক্রে একই pressure, কোনো বাড়তি সাহায্য নেই – শ্বাসের সব কাজ রোগী নিজে করে।',
      when: 'SBT, weaning-এর শেষ ধাপ, pulmonary oedema বা OSA-তে NIV।',
      good: 'সহজ; alveoli খোলে, heart failure-এ preload/afterload কমায়।',
      caution: 'TC/ATC চালু না থাকলে tube-এর resistance-এর জন্য কোনো সাহায্য নেই; ventilation নিশ্চিত নয়।',
      start: 'PEEP/CPAP ৫–৮ cmH2O।' } },
  { id: 'mm_vcplus', gen: 'VC+ / PRVC mode', names: { pb: 'VC+ (A/C or SIMV)', dr: 'VC-AC with AutoFlow', ha: 'APVcmv / (S)CMV+', ge: 'A/C PRVC, SIMV PRVC' }, gloss: ['VC+', 'AutoFlow', 'APVcmv', '(S)CMV+', 'A/C PRVC', 'Volume Control Plus'], link: 'prvc',
    en: { what: 'Pressure-controlled breaths whose pressure is adjusted breath by breath to reach the target VT.',
      when: 'When you want a volume target with decelerating flow and variable flow for patient demand.',
      good: 'Combines volume guarantee with lower peak pressure and better comfort.',
      caution: 'If the patient pulls hard, VT rises and the machine lowers pressure – support falls just when demand is high. Leaks confuse the target.',
      start: 'VT 6–8 ml/kg PBW, TI 0.8–1.0 s, f 14–18, rise time moderate, set a high-pressure limit.' },
    bn: { what: 'Pressure-controlled শ্বাস, যার pressure প্রতি শ্বাসে নিজে থেকে বদলে লক্ষ্য VT-তে পৌঁছায়।',
      when: 'যখন volume-এর লক্ষ্যও চাই, আবার decelerating flow আর রোগীর চাহিদামতো flow-ও চাই।',
      good: 'Volume নিশ্চিত, সঙ্গে কম peak pressure আর বেশি আরাম।',
      caution: 'রোগী জোরে টানলে VT বাড়ে আর মেশিন pressure কমিয়ে দেয় – ঠিক যখন চাহিদা বেশি তখন সাহায্য কমে যায়। Leak থাকলে লক্ষ্য গুলিয়ে যায়।',
      start: 'VT ৬–৮ ml/kg PBW, TI ০.৮–১.০ সেকেন্ড, f ১৪–১৮, rise time মাঝারি, high-pressure সীমা সেট রাখো।' } },
  { id: 'mm_vs', gen: 'Volume Support mode', names: { pb: 'SPONT · VS (VT SUPP)', dr: 'SPN-CPAP/VS', ha: 'VS', ge: 'VS' }, gloss: ['SPN-CPAP/VS'], link: 'vsniv',
    en: { what: 'Pressure support whose level is adjusted breath by breath to reach a target spontaneous VT.',
      when: 'Weaning patients with variable effort or changing mechanics.',
      good: 'Support automatically falls as the patient gets stronger.',
      caution: 'If the patient breathes fast and shallow due to distress, the target hides it; check RR and effort. Needs apnea backup.',
      start: 'VT SUPP 6–8 ml/kg PBW, PEEP 5, ESENS 25%.' },
    bn: { what: 'Pressure support, যার মাত্রা প্রতি শ্বাসে বদলে লক্ষ্য spontaneous VT-তে পৌঁছায়।',
      when: 'Weaning-এর রোগী, যার চেষ্টা বা ফুসফুসের অবস্থা বদলাচ্ছে।',
      good: 'রোগী শক্তিশালী হলে সাহায্য আপনা থেকেই কমে।',
      caution: 'কষ্টের কারণে দ্রুত আর ছোট শ্বাস নিলে লক্ষ্য volume সেটা ঢেকে দেয়; RR আর চেষ্টা দেখো। Apnea backup লাগে।',
      start: 'VT SUPP ৬–৮ ml/kg PBW, PEEP ৫, ESENS ২৫%।' } },
  { id: 'mm_tc', gen: 'TC / ATC mode', names: { pb: 'SPONT · TC', dr: 'ATC (with SPN-CPAP or any mode)', ha: 'TRC', ge: 'Tube compensation' }, gloss: ['SPONT TC', 'TC mode'], link: 'advset',
    en: { what: 'Spontaneous breathing where the only support is compensation of the tube resistance (% support of tube work).',
      when: 'SBT that mimics breathing after extubation; patients with small tubes.',
      good: 'Removes imposed work of the tube; a more realistic test of readiness.',
      caution: 'Correct tube type and size are essential; not with large leaks (PB: no Leak Sync with TC).',
      start: '% Supp 100, PEEP 5.' },
    bn: { what: 'Spontaneous শ্বাস, যেখানে একমাত্র সাহায্য হলো tube-এর resistance পুষিয়ে দেওয়া (tube-এর পরিশ্রমের % সাহায্য)।',
      when: 'এমন SBT, যা extubation-এর পরের শ্বাসের মতো; ছোট tube-এর রোগী।',
      good: 'Tube-এর চাপিয়ে দেওয়া পরিশ্রম সরায়; প্রস্তুতির আরও বাস্তব পরীক্ষা।',
      caution: 'Tube-এর ধরন আর মাপ ঠিক দেওয়া জরুরি; বড় leak-এ নয় (PB: TC-তে Leak Sync চলে না)।',
      start: '% Supp ১০০, PEEP ৫।' } },
  { id: 'mm_pav', gen: 'PAV+ mode', names: { pb: 'SPONT · PAV+', dr: 'SPN-PPS (Proportional Pressure Support)', ha: '—', ge: '—' }, gloss: ['SPN-PPS', 'PPS', 'Proportional Pressure Support'], link: 'pav',
    en: { what: 'Proportional assist: the ventilator measures R and C and delivers pressure in proportion to the patient\'s own effort, at the set % support.',
      when: 'Awake patients with intact drive who are dyssynchronous on PS; weaning.',
      good: 'Excellent synchrony; support follows each breath; WOB display guides the setting.',
      caution: 'Needs reliable drive and no big leak; runaway with high % if R/C estimates are wrong; not with severe auto-PEEP or very weak muscles.',
      start: '% Supp 50–70, PEEP 5, correct tube type/size.' },
    bn: { what: 'Proportional assist: ventilator R আর C মেপে রোগীর নিজের চেষ্টার অনুপাতে, সেট করা % হারে pressure দেয়।',
      when: 'সজাগ রোগী, শ্বাসের তাড়না ঠিক আছে কিন্তু PS-এ synchrony হচ্ছে না; weaning।',
      good: 'চমৎকার synchrony; প্রতি শ্বাসে সাহায্য চেষ্টার সঙ্গে চলে; WOB-এর ছবি দেখে setting ঠিক করা যায়।',
      caution: 'নির্ভরযোগ্য তাড়না লাগে আর বড় leak থাকা চলবে না; R/C-এর হিসাব ভুল হলে বেশি %-এ runaway; গুরুতর auto-PEEP বা খুব দুর্বল পেশিতে নয়।',
      start: '% Supp ৫০–৭০, PEEP ৫, tube-এর ধরন/মাপ ঠিক।' } },
  { id: 'mm_niv', gen: 'NIV vent type', names: { pb: 'Vent type NIV (A/C, SIMV, SPONT)', dr: 'NIV (mask) in all modes', ha: 'NIV, NIV-ST', ge: 'NIV' }, gloss: ['NIV-ST', 'Vent type NIV'], link: 'vsniv',
    en: { what: 'Ventilation through a mask/helmet; the machine compensates large leaks.',
      when: 'COPD exacerbation with acidosis, cardiogenic pulmonary oedema, post-extubation in high-risk patients, immunocompromised.',
      good: 'Avoids intubation and its complications.',
      caution: 'Not for coma, vomiting, unprotected airway, shock, facial trauma; re-assess within 1–2 h – do not delay intubation.',
      start: 'PSUPP (IPAP − EPAP) 8–10, PEEP/EPAP 5, backup rate 10–12; raise IPAP by 2 to target.' },
    bn: { what: 'Mask/helmet দিয়ে ventilation; মেশিন বড় leak পুষিয়ে নেয়।',
      when: 'Acidosis-সহ COPD exacerbation, cardiogenic pulmonary oedema, ঝুঁকিপূর্ণ রোগীতে extubation-এর পরে, রোগপ্রতিরোধ দুর্বল রোগী।',
      good: 'Intubation আর তার জটিলতা এড়ানো যায়।',
      caution: 'Coma, বমি, অরক্ষিত airway, shock, মুখের আঘাতে নয়; ১–২ ঘণ্টার মধ্যে আবার মূল্যায়ন – intubation দেরি করো না।',
      start: 'PSUPP (IPAP − EPAP) ৮–১০, PEEP/EPAP ৫, backup rate ১০–১২; লক্ষ্যে পৌঁছাতে IPAP ২ করে বাড়াও।' } },
  { id: 'mm_asv', gen: 'ASV / INTELLiVENT', names: { pb: '—', dr: '— (SmartCare/PS is Dräger\'s automated weaning)', ha: 'ASV, INTELLiVENT-ASV', ge: '—' }, gloss: ['INTELLiVENT-ASV', 'SmartCare/PS', 'SmartCare'], link: 'asv',
    en: { what: 'Hamilton closed-loop mode: you set %MinVol, PEEP and oxygen; the machine chooses rate, Vt and pressure from the measured mechanics. INTELLiVENT also adjusts PEEP/FiO2 and %MinVol from SpO2 and EtCO2.',
      when: 'From intubation to weaning in many patient types.',
      good: 'Automatic lung-protective targets and gradual weaning.',
      caution: 'Understand the targets; check that delivered Vt/Pplat are acceptable; sensors must be reliable.',
      start: '%MinVol 100% (raise for fever/acidosis), PEEP and FiO2 as usual.' },
    bn: { what: 'Hamilton-এর closed-loop mode: তুমি %MinVol, PEEP আর oxygen সেট করো; মেশিন মাপা mechanics থেকে rate, Vt আর pressure বেছে নেয়। INTELLiVENT SpO2 আর EtCO2 দেখে PEEP/FiO2 আর %MinVol-ও বদলায়।',
      when: 'Intubation থেকে weaning পর্যন্ত, অনেক ধরনের রোগীতে।',
      good: 'ফুসফুস সুরক্ষার লক্ষ্য আপনা থেকেই বজায় থাকে, ধীরে ধীরে weaning হয়।',
      caution: 'লক্ষ্যগুলো বুঝে নাও; দেওয়া Vt/Pplat গ্রহণযোগ্য কি না দেখো; sensor নির্ভরযোগ্য হতে হবে।',
      start: '%MinVol ১০০% (জ্বর/acidosis-এ বাড়াও), PEEP আর FiO2 স্বাভাবিক নিয়মে।' } }
];

/* ---------- build learning topics and glossary tags from the docs ---------- */
(function buildMachineContent() {
  const lbl = { en: { names: 'On the machines', what: 'What it is', use: 'Why / when it is used', up: 'If you increase it', down: 'If you decrease it', usual: 'Usual setting', when: 'When it is used', good: 'Advantages', caution: 'Cautions', start: 'Typical starting settings' },
    bn: { names: 'মেশিনে নাম', what: 'এটা কী', use: 'কেন / কখন ব্যবহার হয়', up: 'বাড়ালে কী হয়', down: 'কমালে কী হয়', usual: 'সাধারণত কত রাখা হয়', when: 'কখন ব্যবহার হয়', good: 'সুবিধা', caution: 'সতর্কতা', start: 'সাধারণ শুরুর setting' } };
  const nm = (v, id) => (!v || /^—/.test(v)) ? v : `[[${v}|topic:${id}]]`;
  const namesBlock = (n, L, id) => `**${lbl[L].names}:**\n- Puritan Bennett 840/980: ${nm(n.pb, id)}\n- Dräger: ${nm(n.dr, id)}\n- Hamilton: ${nm(n.ha, id)}\n- GE R860: ${nm(n.ge, id)}`;
  const sec = (k, txt, L) => (txt && txt !== '—') ? `**${lbl[L][k]}**\n${txt}` : '';
  // BiLevel gets its own glossary entry (it is a PB mode name, not just a synonym of APRV)
  GLOSSARY.forEach(g => { if (g.a) g.a = g.a.filter(w => !/^bi-?level$/i.test(w)); });
  const existing = new Set(); GLOSSARY.forEach(g => [g.t].concat(g.a || []).forEach(w => existing.add(String(w).toLowerCase())));
  const addGloss = (doc, cat) => {
    const words = (doc.gloss || []).concat([doc.gen]);
    // words that already exist in the glossary now open this detailed machine topic
    words.forEach(w => { const g = GLOSSARY.find(x => x.t === w || (x.a || []).includes(w)); if (g && !String(g.topic).match(/^m[sm]_/)) g.topic = doc.id; });
    const fresh = [...new Set(words)].filter(w => !existing.has(w.toLowerCase()));
    if (!fresh.length) return;
    const [t, ...a] = fresh;
    GLOSSARY.push({ t, a, topic: doc.id, en: doc.en.what, bn: doc.bn.what });
    fresh.forEach(w => existing.add(w.toLowerCase()));
  };
  const SET_LINK = { rr: 'co2', vt: 'vt', vmax: 'flowpattern', flowPattern: 'flowpattern', pause: 'pause', ti: 'ie', pinsp: 'pc', ps: 'psv', peep: 'peep', fio2: 'fio2', rise: 'rise', cycle: 'cycle',
    trigger: 'trigger', trigFlow: 'trigger', trigP: 'trigger', phigh: 'aprv', pavSupp: 'pav', atc: 'advset', leakComp: 'leak', humid: 'deadspace', apneaTime: 'alarms', maxTi: 'advset', sighEvery: 'advset', o2: 'procedures', holds: 'holds', pmax: 'highpressure' };
  SETTING_DOCS.forEach(d => { if (!d.link) d.link = SET_LINK[d.key]; });
  const seeAlso = (d, L) => { const t = d.link && TOPICS.find(x => x.id === d.link); if (!t) return ''; const ti = (L === 'bn' && TOPICS_BN[t.id] && TOPICS_BN[t.id].title) || t.title; return `\n\n${L === 'bn' ? 'মূল ধারণা' : 'Core concept'}: [[${ti}|topic:${t.id}]]`; };
  SETTING_DOCS.forEach(d => {
    TOPICS.push({ id: d.id, cat: 'Machine settings', title: d.gen, tags: [d.gen.toLowerCase()].concat((d.gloss || []).map(x => x.toLowerCase())),
      body: [namesBlock(d.names, 'en', d.id), sec('what', d.en.what, 'en'), sec('use', d.en.use, 'en'), sec('up', d.en.up, 'en'), sec('down', d.en.down, 'en'), sec('usual', d.en.usual, 'en')].filter(Boolean).join('\n\n') + seeAlso(d, 'en') });
    TOPICS_BN[d.id] = { title: d.gen, body: [namesBlock(d.names, 'bn', d.id), sec('what', d.bn.what, 'bn'), sec('use', d.bn.use, 'bn'), sec('up', d.bn.up, 'bn'), sec('down', d.bn.down, 'bn'), sec('usual', d.bn.usual, 'bn')].filter(Boolean).join('\n\n') + seeAlso(d, 'bn') };
    addGloss(d);
  });
  MODE_DOCS.forEach(d => {

    TOPICS.push({ id: d.id, cat: 'Machine modes', title: d.gen, tags: [d.gen.toLowerCase()].concat((d.gloss || []).map(x => x.toLowerCase())),
      body: [namesBlock(d.names, 'en', d.id), sec('what', d.en.what, 'en'), sec('when', d.en.when, 'en'), sec('good', d.en.good, 'en'), sec('caution', d.en.caution, 'en'), sec('start', d.en.start, 'en')].filter(Boolean).join('\n\n') + seeAlso(d, 'en') });
    TOPICS_BN[d.id] = { title: d.gen, body: [namesBlock(d.names, 'bn', d.id), sec('what', d.bn.what, 'bn'), sec('when', d.bn.when, 'bn'), sec('good', d.bn.good, 'bn'), sec('caution', d.bn.caution, 'bn'), sec('start', d.bn.start, 'bn')].filter(Boolean).join('\n\n') + seeAlso(d, 'bn') };
    addGloss(d);
  });
  // point the general glossary words for settings/modes to the new detailed docs
  const redirect = { 'Rise time': 'ms_rise', 'Cycle': 'ms_esens', 'Trigger': 'ms_trigtype', 'Flow trigger': 'ms_vsens', 'Pressure trigger': 'ms_psens', 'Inspiratory pause': 'ms_tpl',
    'Peak flow': 'ms_vmax', 'Square flow': 'ms_flowpat', 'Decelerating flow': 'ms_flowpat', 'Ti': 'ms_ti', 'RR': 'ms_rr', 'Leak compensation': 'ms_leak', 'Sigh': 'ms_sigh',
    'ATC': 'ms_tc', 'Inspiratory hold': 'ms_holds', 'Expiratory hold': 'ms_holds', 'Manual breath': 'ms_holds', 'IPAP': 'mm_niv', 'NIV': 'mm_niv', 'SIMV': 'mm_simv', 'CPAP': 'mm_cpap',
    'APRV': 'mm_bilevel', 'Volume support': 'mm_vs', 'PRVC': 'mm_vcplus', 'PAV+': 'mm_pav', 'ASV': 'mm_asv', 'Pressure support': 'mm_spont', 'FiO2': 'ms_o2' };
  GLOSSARY.forEach(g => { if (redirect[g.t]) g.topic = redirect[g.t]; });
  CAT_BN['Machine settings'] = 'মেশিনের setting';
  CAT_BN['Machine modes'] = 'মেশিনের mode';
})();

/* ---------- overview, units and extubation topics ---------- */
const EXTRA_TOPICS = [
  { id: 'machines', cat: 'Machine settings', title: 'Ventilator brands: same physiology, different names', tags: ['machine', 'brand', 'puritan bennett', 'pb 840', 'pb 980', 'dräger', 'hamilton', 'ge'],
    en: `Every ventilator delivers the same three things – a trigger, a target (volume or pressure) and a cycle – but each company names the knobs differently. Pick your machine in **Mode & Settings**; the controls, modes and numbers take that machine's names, and each name is a tag that opens its full explanation.

**Traps when you move between machines**
- Rise time: Puritan Bennett uses **Rise time %** (higher % = faster). Hamilton P-ramp, GE Rise Time (ms) and Dräger Slope (s) use time (shorter = faster).
- Inspiratory pressure: Dräger **Pinsp** is absolute (includes PEEP). PB **PI**, Hamilton **Pcontrol** and GE **Pinsp** are above PEEP. Pinsp 25 on a Dräger with PEEP 10 = PI 15 on a PB.
- Volume control on PB is set with **VMAX** (peak flow) and flow pattern; TI is the result. Others set TI directly.
- Pressure support is **PSUPP** (PB), **ΔPsupp** (Dräger), **Psupport** (Hamilton), **PS** (GE) – all above PEEP.
- Cycle-off is **ESENS** (PB), **Exp. term.** (Dräger), **ETS** (Hamilton), **Exp Trigger** (GE) – all % of peak flow. In PAV+ ESENS is in L/min.
- BiLevel (PB), PC-BIPAP / PC-APRV (Dräger), DuoPAP / APRV (Hamilton) and BiLevel / APRV (GE) are all two-level pressure modes with free spontaneous breathing.

**Machines included:** Puritan Bennett 840 and 980 (Covidien / Medtronic), Dräger Evita family, Hamilton C-series and GE CARESCAPE R860. Simulator only – always follow the operator's manual of your own machine.`,
    bn: `সব ventilator একই তিনটি কাজ করে – trigger, লক্ষ্য (volume বা pressure) আর cycle – কিন্তু প্রতিটি কোম্পানি বোতামগুলোর নাম আলাদা দেয়। **Mode & Settings**-এ তোমার মেশিন বেছে নাও; control, mode আর সংখ্যাগুলো সেই মেশিনের নামে দেখাবে, আর প্রতিটি নামই একটা tag, চাপলে পুরো ব্যাখ্যা খোলে।

**এক মেশিন থেকে আরেক মেশিনে গেলে যেসব ভুল হয়**
- Rise time: Puritan Bennett-এ **Rise time %** (যত বেশি %, তত দ্রুত)। Hamilton P-ramp, GE Rise Time (ms) আর Dräger Slope (s) সময়ে মাপে (যত কম, তত দ্রুত)।
- Inspiratory pressure: Dräger-এর **Pinsp** মোট মাত্রা (PEEP সহ)। PB-র **PI**, Hamilton-এর **Pcontrol** আর GE-র **Pinsp** PEEP-এর ওপরে। Dräger-এ PEEP 10 থাকলে Pinsp 25 = PB-তে PI 15।
- PB-তে volume control সেট হয় **VMAX** (peak flow) আর flow pattern দিয়ে; TI তার ফল। অন্যরা সরাসরি TI সেট করে।
- Pressure support হলো **PSUPP** (PB), **ΔPsupp** (Dräger), **Psupport** (Hamilton), **PS** (GE) – সবই PEEP-এর ওপরে।
- Cycle-off হলো **ESENS** (PB), **Exp. term.** (Dräger), **ETS** (Hamilton), **Exp Trigger** (GE) – সবই peak flow-এর শতাংশ। PAV+-এ ESENS লিটার/মিনিটে।
- BiLevel (PB), PC-BIPAP / PC-APRV (Dräger), DuoPAP / APRV (Hamilton) আর BiLevel / APRV (GE) – সবই দুই স্তরের pressure mode, যেখানে রোগী স্বাধীনভাবে শ্বাস নিতে পারে।

**যেসব মেশিন আছে:** Puritan Bennett 840 আর 980 (Covidien / Medtronic), Dräger Evita পরিবার, Hamilton C-series আর GE CARESCAPE R860। এটা শুধু simulator – নিজের মেশিনের operator's manual সবসময় মেনে চলো।` },
  { id: 'units', cat: 'Machine settings', title: 'Units: cmH2O, hPa, mmHg, kPa', tags: ['units', 'hpa', 'kpa', 'cmh2o', 'mmhg'],
    en: `Change units in **Themes & fonts → Units**.

**Pressure:** 1 cmH2O = 0.98 hPa (mbar). The numbers are almost the same – Dräger and many European machines show hPa or mbar. PEEP 10 cmH2O ≈ 9.8 hPa.

**Blood gases:** 1 kPa = 7.5 mmHg; 1 mmHg = 0.133 kPa. Normal PaCO2 35–45 mmHg = 4.7–6.0 kPa; normal PaO2 80–100 mmHg = 10.7–13.3 kPa.

**P/F ratio:** in mmHg the ARDS cut-offs are 300 / 200 / 100; in kPa they are 40 / 26.7 / 13.3.`,
    bn: `**Themes & fonts → Units**-এ একক বদলাও।

**Pressure:** ১ cmH2O = ০.৯৮ hPa (mbar)। সংখ্যা প্রায় একই – Dräger আর অনেক ইউরোপীয় মেশিন hPa বা mbar দেখায়। PEEP ১০ cmH2O ≈ ৯.৮ hPa।

**Blood gas:** ১ kPa = ৭.৫ mmHg; ১ mmHg = ০.১৩৩ kPa। স্বাভাবিক PaCO2 ৩৫–৪৫ mmHg = ৪.৭–৬.০ kPa; স্বাভাবিক PaO2 ৮০–১০০ mmHg = ১০.৭–১৩.৩ kPa।

**P/F ratio:** mmHg-তে ARDS-এর সীমা ৩০০ / ২০০ / ১০০; kPa-তে ৪০ / ২৬.৭ / ১৩.৩।` },
  { id: 'extubation', cat: 'Extubation', title: 'Extubation: readiness, steps and aftercare', tags: ['extubation', 'extubate', 'readiness', 'face mask'],
    en: `Extubation is removing the endotracheal tube once the patient can breathe, protect the airway and clear secretions without it. Passing an SBT shows the patient can **breathe**; extubation also needs an **airway** that stays open and a **cough** that clears secretions.

**Readiness checklist**
- Cause of respiratory failure improving; passed an SBT (30–120 min, PS 5–8 / PEEP 5, CPAP or T-piece).
- Awake and cooperative (RASS −1 to +1), follows commands, no neuromuscular blocker.
- Oxygenation: SpO2 ≥ 92% on FiO2 ≤ 40% and PEEP ≤ 8.
- RSBI < 105, NIF more negative than −20 cmH2O, P0.1 not high.
- Strong cough (white-card test), manageable secretions (suction needed < every 2 h).
- Haemodynamically stable (no or low-dose vasopressor).
- Cuff-leak test in high-risk patients (long intubation, difficult/traumatic intubation, large tube, female).

**Steps**
1. Explain, sit up 30–45°, pre-oxygenate (O2 boost key).
2. Suction the tube and the mouth / above the cuff.
3. Deflate the cuff, remove the tube at peak inspiration (or with a positive-pressure breath), ask for a cough.
4. Apply oxygen: face mask, HFNC or NIV.
5. Watch closely for the first hours: RR, SpO2, work of breathing, stridor, voice, cough, ABG.

**Choosing the support after extubation**
- Low risk → face mask or nasal prongs.
- High risk (age > 65, heart failure, COPD, BMI > 30, weak cough, failed first SBT) → HFNC, or NIV for hypercapnic patients.
- Do not use NIV to "rescue" established post-extubation respiratory failure – it delays reintubation.`,
    bn: `রোগী যখন tube ছাড়াই শ্বাস নিতে, airway রক্ষা করতে আর secretion বের করতে পারে, তখন endotracheal tube খুলে ফেলাকে extubation বলে। SBT পাস করা দেখায় রোগী **শ্বাস নিতে** পারে; extubation-এর জন্য খোলা থাকা **airway** আর secretion বের করার মতো **কাশি**-ও লাগে।

**প্রস্তুতির তালিকা**
- Respiratory failure-এর কারণ উন্নতির দিকে; SBT পাস করেছে (৩০–১২০ মিনিট, PS ৫–৮ / PEEP ৫, CPAP বা T-piece)।
- সজাগ ও সহযোগী (RASS −১ থেকে +১), কথা মানে, neuromuscular blocker নেই।
- Oxygenation: FiO2 ৪০%-এর মধ্যে আর PEEP ৮-এর মধ্যে SpO2 ৯২% বা বেশি।
- RSBI ১০৫-এর কম, NIF −২০ cmH2O-এর চেয়ে বেশি negative, P0.1 বেশি নয়।
- জোরালো কাশি (white-card test), সামলানো যায় এমন secretion (২ ঘণ্টায় একবারের কম suction লাগে)।
- রক্তসঞ্চালন স্থিতিশীল (vasopressor নেই বা কম মাত্রায়)।
- ঝুঁকিপূর্ণ রোগীতে cuff-leak test (দীর্ঘ intubation, কঠিন/আঘাতজনিত intubation, বড় tube, নারী)।

**ধাপ**
১. বুঝিয়ে বলো, ৩০–৪৫° বসাও, pre-oxygenate করো (O2 boost বোতাম)।
২. Tube আর মুখ / cuff-এর ওপরের অংশ suction করো।
৩. Cuff খালি করো, শ্বাস নেওয়ার চূড়ায় (বা একটা positive-pressure শ্বাস দিয়ে) tube বের করো, কাশতে বলো।
৪. Oxygen দাও: face mask, HFNC বা NIV।
৫. প্রথম কয়েক ঘণ্টা কাছ থেকে দেখো: RR, SpO2, শ্বাসের পরিশ্রম, stridor, কণ্ঠস্বর, কাশি, ABG।

**Extubation-এর পরে কোন সাহায্য**
- কম ঝুঁকি → face mask বা nasal prong।
- বেশি ঝুঁকি (বয়স ৬৫-এর বেশি, heart failure, COPD, BMI ৩০-এর বেশি, দুর্বল কাশি, প্রথম SBT ফেল) → HFNC, hypercapnic রোগীতে NIV।
- Extubation-এর পরে পুরোদমে শুরু হয়ে যাওয়া respiratory failure "বাঁচাতে" NIV দিয়ো না – এতে reintubation দেরি হয়।` },
  { id: 'cuffleak', cat: 'Extubation', title: 'Cuff-leak test', tags: ['cuff leak test', 'cuff-leak test', 'laryngeal oedema'],
    en: `**What it is:** a bedside test for laryngeal oedema before extubation. With the cuff deflated, gas should escape around the tube; if the larynx is swollen, little gas escapes.

**How:** passive patient on volume control. Note VTI and VTE, deflate the cuff, watch 6 breaths and average the 3 lowest VTE. Cuff-leak volume = VTI − VTE.

**Interpretation:** leak < 110 ml (or < 12–24% of VTI) = **positive test** → higher risk of post-extubation stridor.

**If positive:** the test does not forbid extubation, but give methylprednisolone 20 mg 4-hourly or dexamethasone for 4–12 h before extubation (in high-risk patients), have a smaller tube, airway trolley and a senior ready. A good leak does not guarantee no stridor.`,
    bn: `**এটা কী:** extubation-এর আগে laryngeal oedema খোঁজার bedside পরীক্ষা। Cuff খালি করলে tube-এর চারপাশ দিয়ে gas বেরোনোর কথা; larynx ফুলে থাকলে খুব কম gas বেরোয়।

**কীভাবে:** নিষ্ক্রিয় রোগী, volume control। VTI আর VTE দেখো, cuff খালি করো, ৬টি শ্বাস দেখে সবচেয়ে কম ৩টি VTE-র গড় নাও। Cuff-leak volume = VTI − VTE।

**ব্যাখ্যা:** leak ১১০ ml-এর কম (বা VTI-এর ১২–২৪%-এর কম) = **positive test** → extubation-এর পরে stridor-এর ঝুঁকি বেশি।

**Positive হলে:** এতে extubation নিষিদ্ধ হয় না, তবে ঝুঁকিপূর্ণ রোগীতে extubation-এর ৪–১২ ঘণ্টা আগে methylprednisolone ২০ mg ৪ ঘণ্টা পরপর বা dexamethasone দাও; ছোট tube, airway trolley আর অভিজ্ঞ কাউকে প্রস্তুত রাখো। ভালো leak থাকলেও stridor হবে না – এমন নিশ্চয়তা নেই।` },
  { id: 'extubfail', cat: 'Extubation', title: 'Post-extubation stridor and extubation failure', tags: ['extubation failure', 'post-extubation stridor', 'stridor', 'reintubation'],
    en: `**Extubation failure** = need for reintubation within 48–72 h (about 10–15% of ICU extubations). Delayed reintubation increases mortality, so recognise it early.

**Causes**
- Upper airway: laryngeal oedema → **stridor** (usually within the first hour).
- Respiratory pump: fatigue, weak muscles → rapid shallow breathing, rising PaCO2.
- Secretions: weak cough → plugging, desaturation.
- Heart: loss of PEEP unmasks heart failure → pulmonary oedema.
- Reduced consciousness, aspiration.

**Warning signs:** RR > 35, SpO2 < 90%, accessory muscles / paradox, HR > 140, rising PaCO2 with pH < 7.30, agitation or drowsiness, stridor.

**Management**
- Stridor: sit up, nebulised adrenaline (1 mg/ml, 5 ml), dexamethasone; heliox if available. Worsening stridor → reintubate early with a smaller tube.
- Secretions: physiotherapy, cough assist, suction; bronchoscopy if plugged.
- Heart failure: NIV/CPAP, diuretic.
- Hypercapnic COPD: NIV.
- Do not delay **reintubation** when the patient is clearly failing.`,
    bn: `**Extubation failure** = ৪৮–৭২ ঘণ্টার মধ্যে আবার intubation লাগা (ICU extubation-এর প্রায় ১০–১৫%)। Reintubation দেরি হলে মৃত্যুঝুঁকি বাড়ে, তাই আগেভাগে চিনতে হবে।

**কারণ**
- ওপরের airway: laryngeal oedema → **stridor** (সাধারণত প্রথম এক ঘণ্টার মধ্যে)।
- শ্বাসযন্ত্রের পেশি: ক্লান্তি, দুর্বল পেশি → দ্রুত আর অগভীর শ্বাস, PaCO2 বাড়া।
- Secretion: দুর্বল কাশি → plug, desaturation।
- হৃৎপিণ্ড: PEEP সরে গেলে লুকানো heart failure বেরিয়ে আসে → pulmonary oedema।
- চেতনা কমে যাওয়া, aspiration।

**সতর্কসংকেত:** RR ৩৫-এর বেশি, SpO2 ৯০%-এর কম, accessory muscle / paradox, HR ১৪০-এর বেশি, pH ৭.৩০-এর নিচে নেমে PaCO2 বাড়া, অস্থিরতা বা ঝিমুনি, stridor।

**চিকিৎসা**
- Stridor: বসিয়ে দাও, nebulised adrenaline (১ mg/ml, ৫ ml), dexamethasone; থাকলে heliox। Stridor বাড়তে থাকলে → ছোট tube দিয়ে তাড়াতাড়ি reintubate।
- Secretion: physiotherapy, cough assist, suction; plug হলে bronchoscopy।
- Heart failure: NIV/CPAP, diuretic।
- Hypercapnic COPD: NIV।
- রোগী স্পষ্টভাবে ফেল করতে থাকলে **reintubation** দেরি করো না।` }
];
EXTRA_TOPICS.forEach(t => { TOPICS.push({ id: t.id, cat: t.cat, title: t.title, tags: t.tags, body: t.en }); TOPICS_BN[t.id] = { title: t.title, body: t.bn }; });
CAT_BN['Extubation'] = 'Extubation';
{ const ap = GLOSSARY.find(g => g.t === 'Auto-PEEP'); if (ap && !ap.a.includes('auto-PEEP')) ap.a.push('auto-PEEP'); }
[
  { t: 'Extubation', a: ['extubate', 'extubated'], topic: 'extubation', en: 'Removing the endotracheal tube when the patient can breathe, protect the airway and cough without it.', bn: 'রোগী tube ছাড়া শ্বাস নিতে, airway রক্ষা করতে আর কাশতে পারলে endotracheal tube খুলে ফেলা।' },
  { t: 'Cuff-leak test', a: ['cuff leak test', 'cuff-leak volume'], topic: 'cuffleak', en: 'Deflate the cuff and measure VTI − VTE; < 110 ml suggests laryngeal oedema and risk of stridor.', bn: 'Cuff খালি করে VTI − VTE মাপা; ১১০ ml-এর কম হলে laryngeal oedema আর stridor-এর ঝুঁকি।' },
  { t: 'Post-extubation stridor', a: ['stridor', 'laryngeal oedema', 'laryngeal edema'], topic: 'extubfail', en: 'High-pitched inspiratory noise from a swollen larynx after extubation; treat with adrenaline nebuliser and steroids, reintubate if worsening.', bn: 'Extubation-এর পরে ফোলা larynx থেকে শ্বাস নেওয়ার সময় তীক্ষ্ণ শব্দ; adrenaline nebuliser আর steroid দিয়ে চিকিৎসা, বাড়তে থাকলে reintubate।' },
  { t: 'Extubation failure', a: ['reintubation', 're-intubation', 'failed extubation'], topic: 'extubfail', en: 'Need for reintubation within 48–72 h after extubation.', bn: 'Extubation-এর ৪৮–৭২ ঘণ্টার মধ্যে আবার intubation লাগা।' },
  { t: 'Cough test', a: ['white card test', 'cough strength', 'peak cough flow'], topic: 'extubation', en: 'Ask the patient to cough; secretions reaching a card 1–2 cm from the tube = adequate cough.', bn: 'রোগীকে কাশতে বলা; tube থেকে ১–২ cm দূরের কার্ডে secretion পৌঁছালে কাশি যথেষ্ট।' },
  { t: 'hPa', a: ['hectopascal', 'mbar'], topic: 'units', en: 'Pressure unit; 1 hPa ≈ 1.02 cmH2O.', bn: 'Pressure-এর একক; ১ hPa ≈ ১.০২ cmH2O।' },
  { t: 'kPa', a: ['kilopascal'], topic: 'units', en: 'Unit for blood gases; 1 kPa = 7.5 mmHg.', bn: 'Blood gas-এর একক; ১ kPa = ৭.৫ mmHg।' },
  { t: 'Face mask', a: ['simple face mask', 'oxygen mask'], topic: 'extubation', en: 'Low-flow oxygen mask: 5–10 L/min gives roughly 35–55% oxygen, less when the patient breathes fast.', bn: 'Low-flow oxygen mask: ৫–১০ লিটার/মিনিটে প্রায় ৩৫–৫৫% oxygen, রোগী দ্রুত শ্বাস নিলে কম।' }
].forEach(g => { if (!GLOSSARY.some(x => x.t.toLowerCase() === g.t.toLowerCase())) GLOSSARY.push(g); });

if (typeof module !== 'undefined') module.exports = { MACHINES, SETTING_DOCS, MODE_DOCS };
