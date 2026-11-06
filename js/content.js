/* VentLab Ultra — content: abnormality library, presets, learning topics
 * Body syntax: paragraphs separated by blank lines, "- " bullets, **bold**,
 * [[Tag]] or [[Label|tag]] makes a clickable tag that opens the matching topic.
 */
'use strict';

const PRESETS = [
  { id: 'normal', name: 'Normal lung (passive)', p: { C: 50, Ri: 8, Re: 10, effort: 6, prr: 14, nti: 0.9, rass: -5, shunt: 5, deadAlv: 5, recruit: 30, hco3: 24, vco2: 200 } },
  { id: 'ards', name: 'ARDS (stiff lung)', p: { C: 22, Ri: 9, Re: 10, effort: 6, prr: 14, nti: 0.9, rass: -5, shunt: 32, deadAlv: 22, recruit: 60, hco3: 24, vco2: 220 }, s: { peep: 10, vt: 380, rr: 24, fio2: 60 } },
  { id: 'copd', name: 'COPD (long τ)', p: { C: 65, Ri: 15, Re: 28, effort: 6, prr: 14, nti: 0.9, rass: -5, shunt: 8, deadAlv: 25, recruit: 10, hco3: 32, vco2: 200 } },
  { id: 'asthma', name: 'Severe asthma', p: { C: 50, Ri: 25, Re: 38, effort: 6, prr: 14, nti: 0.9, rass: -5, shunt: 10, deadAlv: 25, recruit: 10, hco3: 24, vco2: 220 } },
  { id: 'obese', name: 'Obesity / high IAP', p: { C: 30, Ri: 10, Re: 12, effort: 6, prr: 14, nti: 0.9, rass: -5, shunt: 15, deadAlv: 8, recruit: 50, hco3: 26, vco2: 240 } },
  { id: 'fibrosis', name: 'Pulmonary fibrosis', p: { C: 18, Ri: 8, Re: 9, effort: 6, prr: 14, nti: 0.9, rass: -5, shunt: 15, deadAlv: 20, recruit: 5, hco3: 24, vco2: 200 } },
  { id: 'weaning', name: 'Spontaneous (weaning)', p: { C: 50, Ri: 8, Re: 10, effort: 6, prr: 16, nti: 0.9, rass: 0, shunt: 6, deadAlv: 8, recruit: 20, hco3: 24, vco2: 200 } },
  { id: 'drive', name: 'High drive / air hunger', p: { C: 45, Ri: 9, Re: 11, effort: 14, prr: 28, nti: 0.9, rass: 1, shunt: 10, deadAlv: 10, recruit: 30, hco3: 18, vco2: 260 } }
];

/* Abnormality / scenario library */
const ABNORMALITIES = [
  { id: 'auto_peep', cat: 'Obstruction', name: 'Auto-PEEP (dynamic hyperinflation)',
    s: { mode: 'VC-AC', rr: 24, ti: 1.0, vt: 500 }, p: { C: 60, Ri: 15, Re: 30 }, f: {},
    see: ['Expiratory flow does not return to zero before the next breath', 'Ppeak and Pplat creep up', 'Expiratory hold shows total PEEP > set PEEP'],
    why: 'Expiratory time is shorter than ~3 time constants ([[Time constant|tau]]), so the lung cannot empty before the next breath.',
    fix: ['Lower RR', 'Shorten Ti / raise inspiratory flow', 'Lower Vt', 'Bronchodilators, suction', 'Spontaneous patient: external PEEP ≈ 80% of [[Auto-PEEP]]'],
    tags: ['Auto-PEEP', 'Time constant', 'Flow waveform'] },
  { id: 'bronchospasm', cat: 'Obstruction', name: 'Bronchospasm (high resistance)',
    s: { mode: 'VC-AC', rr: 14, pause: 0.3 }, p: { C: 50, Ri: 28, Re: 42 }, f: {},
    see: ['High Ppeak with near-normal Pplat (large Ppeak−Pplat gap)', 'Low, scooped expiratory flow with a long tail', 'F-V loop: concave (scooped) expiratory limb', 'Capnogram: "shark fin" (slow upstroke, steep plateau)'],
    why: 'Raised airway [[Resistance]] needs more pressure to drive flow; alveolar pressure ([[Pplat]]) is unchanged.',
    fix: ['Bronchodilators / steroids', 'Lower RR, longer Te', 'Check for kinked/bitten tube and secretions', 'Watch for [[Auto-PEEP]]'],
    tags: ['Resistance', 'Pplat', 'Flow–volume loop'] },
  { id: 'kink', cat: 'Circuit', name: 'Kinked / bitten ETT (obstruction)',
    s: { mode: 'VC-AC', pause: 0.3 }, p: {}, f: { kink: 1 },
    see: ['Sudden rise in Ppeak, Pplat unchanged', 'Both inspiratory and expiratory flows damped', 'High-pressure alarm'],
    why: 'A narrowed tube raises resistance on both phases.',
    fix: ['Check tube along its length, bite block', 'Pass a suction catheter', 'If cannot pass – think tube obstruction, re-intubate', 'Use [[DOPES]]'],
    tags: ['Resistance', 'DOPES', 'High pressure alarm'] },
  { id: 'low_compliance', cat: 'Mechanics', name: 'Low compliance (ARDS / stiff lung)',
    s: { mode: 'VC-AC', vt: 450, peep: 10, pause: 0.3 }, p: { C: 22 }, f: {},
    see: ['High Ppeak AND high Pplat, small gap between them', 'High driving pressure', 'P-V loop lies flat, shifted right', 'Expiratory flow returns to zero quickly (short τ)'],
    why: 'Fewer open alveoli – a "baby lung". The same Vt needs more distending pressure.',
    fix: ['Vt 6 ml/kg [[PBW]] (4–8)', 'Keep [[Pplat]] ≤ 30 and [[Driving pressure]] ≤ 15', 'Titrate [[PEEP]]', 'Consider prone position'],
    tags: ['Compliance', 'Driving pressure', 'ARDS'] },
  { id: 'overdistension', cat: 'Mechanics', name: 'Overdistension (upper inflection / beaking)',
    s: { mode: 'VC-AC', vt: 520, peep: 8, ti: 1.0, pause: 0.3 }, p: { C: 45 }, f: { uip: 1 },
    see: ['P-V loop flattens at the top – a "beak"', 'Pressure–time curve concave upward in constant flow ([[Stress index]] > 1)', 'High Pplat for the volume'],
    why: 'End-inspiratory volume is above the upper inflection point; the lung is stretched beyond its compliant range.',
    fix: ['Lower Vt', 'Lower PEEP if over-recruited', 'Target [[Driving pressure]] ≤ 15'],
    tags: ['P-V loop', 'Stress index', 'Overdistension'] },
  { id: 'derecruitment', cat: 'Mechanics', name: 'Derecruitment (lower inflection point)',
    s: { mode: 'VC-AC', vt: 450, peep: 3, ti: 1.0 }, p: { C: 35 }, f: { lip: 1 },
    see: ['P-V loop: flat start then steeper limb (lower inflection)', 'Pressure–time concave downward ([[Stress index]] < 1)', 'Raising PEEP above the LIP improves compliance'],
    why: 'At low PEEP, alveoli collapse each expiration and must be re-opened every breath (atelectrauma).',
    fix: ['Increase [[PEEP]] above the lower inflection', 'Consider recruitment manoeuvre', 'Try PEEP 12–14 here and watch the loop change'],
    tags: ['PEEP', 'Recruitment', 'P-V loop'] },
  { id: 'pneumothorax', cat: 'Emergency', name: 'Tension pneumothorax',
    s: { mode: 'VC-AC', pause: 0.3 }, p: {}, f: { ptx: 1 },
    see: ['Sudden rise in Ppeak AND Pplat (VC)', 'In pressure modes: sudden fall in Vt', 'Hypotension, unilateral air entry (clinical)'],
    why: 'Compliance of the respiratory system falls abruptly and pleural pressure rises.',
    fix: ['Disconnect and bag with 100% O2', 'POCUS / examine', 'Needle decompression → chest drain', 'Use [[DOPES]]'],
    tags: ['DOPES', 'Compliance', 'High pressure alarm'] },
  { id: 'mainstem', cat: 'Emergency', name: 'Endobronchial (right mainstem) intubation',
    s: { mode: 'VC-AC', pause: 0.3 }, p: {}, f: { mainstem: 1 },
    see: ['Ppeak and Pplat rise', 'Lower compliance (one lung ventilated)', 'Desaturation, unilateral breath sounds'],
    why: 'All the tidal volume goes into one lung.',
    fix: ['Check tube depth at teeth', 'Withdraw ETT 1–2 cm, auscultate', 'Confirm with CXR / bronchoscopy'],
    tags: ['DOPES', 'Compliance'] },
  { id: 'mucus_plug', cat: 'Emergency', name: 'Mucus plug / lobar collapse',
    s: { mode: 'VC-AC', pause: 0.3 }, p: {}, f: { plug: 1 },
    see: ['Ppeak rises more than Pplat', 'Compliance also falls (collapsed lobe)'],
    why: 'Plug raises resistance and the lung distal to it collapses.',
    fix: ['Suction, humidification', 'Physiotherapy', 'Bronchoscopy if persistent'],
    tags: ['Resistance', 'Compliance'] },
  { id: 'cuff_leak', cat: 'Circuit', name: 'Cuff leak',
    s: { mode: 'PC-AC' }, p: {}, f: { leak: 1 },
    see: ['Volume–time curve does not return to baseline (drops vertically at next breath)', 'Vte < Vti, leak %', 'F-V and P-V loops do not close'],
    why: 'Gas escapes around the cuff during inspiration and at PEEP, so not all delivered gas returns through the expiratory limb.',
    fix: ['Check cuff pressure (20–30 cmH2O)', 'Check tube position (cuff at cords?)', 'Change tube if cuff damaged'],
    tags: ['Leak', 'Volume waveform', 'Flow–volume loop'] },
  { id: 'bpf', cat: 'Circuit', name: 'Bronchopleural fistula',
    s: { mode: 'VC-AC' }, p: {}, f: { bpf: 1 },
    see: ['Vte persistently lower than Vti', 'Volume curve fails to return to zero', 'Leak flow may cause auto-triggering', 'Bubbling chest drain'],
    why: 'Gas leaks from the airway into the pleura during the whole cycle.',
    fix: ['Lowest Vt, PEEP and Ti that achieve goals', 'Avoid high mean pressure', 'Surgical / bronchoscopic options'],
    tags: ['Leak', 'Volume waveform'] },
  { id: 'disconnection', cat: 'Emergency', name: 'Circuit disconnection',
    s: { mode: 'PC-AC' }, p: {}, f: { disconnect: 1 },
    see: ['Pressure near zero', 'Very high inspiratory flow, no expiratory flow', 'Vte ≈ 0, low pressure & disconnection alarms'],
    why: 'The circuit is open to air; the ventilator cannot build pressure and nothing returns.',
    fix: ['Reconnect / check every joint', 'Bag with 100% O2 if in doubt', 'Use [[DOPES]]'],
    tags: ['Alarms', 'DOPES'] },
  { id: 'secretions', cat: 'Circuit', name: 'Secretions in airway / circuit',
    s: { mode: 'VC-AC' }, p: {}, f: { secretions: 1 },
    see: ['Saw-tooth pattern on flow (and pressure) in both phases', 'Saw-tooth on loops', 'Rising Ppeak'],
    why: 'Gas bubbling through secretions creates rapid oscillations.',
    fix: ['Suction', 'Humidification', 'Physiotherapy'],
    tags: ['Flow waveform', 'Flow–volume loop'] },
  { id: 'water', cat: 'Circuit', name: 'Water (condensate) in tubing',
    s: { mode: 'PC-AC' }, p: {}, f: { water: 1 },
    see: ['Irregular oscillations, mostly on expiratory flow', 'May cause [[Auto-triggering]]'],
    why: 'Condensate moving in the circuit disturbs flow and pressure.',
    fix: ['Drain the circuit / water trap', 'Check heater-humidifier, consider HME'],
    tags: ['Flow waveform', 'Auto-triggering'] },
  { id: 'cardiac_osc', cat: 'Circuit', name: 'Cardiogenic oscillations',
    s: { mode: 'VC-AC', trigFlow: 5 }, p: {}, f: { cardiac: 1 },
    see: ['Small regular ripples at the heart rate, best seen at end-expiration on flow'],
    why: 'Heart beats transmit small pressure/flow changes to the airway.',
    fix: ['Usually harmless – recognise it', 'If it triggers breaths: make trigger less sensitive'],
    tags: ['Auto-triggering', 'Flow waveform'] },
  { id: 'auto_trigger', cat: 'Asynchrony', name: 'Auto-triggering',
    s: { mode: 'VC-AC', rr: 12, trigFlow: 1 }, p: {}, f: { cardiac: 1 },
    see: ['Measured RR higher than set and higher than the patient\'s own', 'Triggered breaths (A) with no patient effort / no pressure dip', 'Respiratory alkalosis'],
    why: 'Signals that are not patient effort (cardiac oscillations, leak, water) cross the trigger threshold.',
    fix: ['Make trigger less sensitive (e.g. flow 3–5 L/min)', 'Fix leaks, drain water'],
    tags: ['Auto-triggering', 'Trigger'] },
  { id: 'ineffective', cat: 'Asynchrony', name: 'Ineffective (missed) triggering',
    s: { mode: 'VC-AC', rr: 20, ti: 1.0 }, p: { autoDrive: 0, C: 60, Ri: 15, Re: 30, effort: 4, prr: 26, nti: 0.8 }, f: {},
    see: ['Flow shows an upward bump during expiration without a breath', 'Small pressure dip without a breath', 'Patient RR > ventilator RR'],
    why: 'Patient effort cannot overcome [[Auto-PEEP]] plus the trigger threshold.',
    fix: ['Reduce auto-PEEP (lower RR/Vt, longer Te)', 'Add external PEEP (~80% of PEEPi)', 'More sensitive trigger', 'Reduce over-assistance / sedation review'],
    tags: ['Ineffective effort', 'Auto-PEEP', 'Trigger'] },
  { id: 'double_trigger', cat: 'Asynchrony', name: 'Double triggering / breath stacking',
    s: { mode: 'VC-AC', ti: 0.6, vt: 400 }, p: { autoDrive: 0, effort: 12, prr: 18, nti: 1.4 }, f: {},
    see: ['Two breaths back-to-back with little or no exhalation', 'Second breath starts from an already-inflated lung', 'Volume stacks – high Pplat'],
    why: 'Neural inspiratory time is longer than the ventilator Ti, so the patient is still pulling when the breath ends.',
    fix: ['Increase Ti / Vt (or switch to PC/PSV)', 'Treat high drive (pain, acidosis, anxiety)', 'Sedation if necessary'],
    tags: ['Double triggering', 'Asynchrony'] },
  { id: 'flow_starvation', cat: 'Asynchrony', name: 'Flow starvation',
    s: { mode: 'VC-AC', ti: 1.3, vt: 450, flowPattern: 'square' }, p: { autoDrive: 0, effort: 12, prr: 20, nti: 1.0 }, f: {},
    see: ['Inspiratory pressure curve scooped / concave', 'Pressure may dip below PEEP early in inspiration', 'Patient looks distressed'],
    why: 'Set flow in VC is less than the patient demands; patient effort pulls the airway pressure down.',
    fix: ['Raise inspiratory flow / shorten Ti', 'Switch to decelerating flow, PC or PSV', 'Treat high drive'],
    tags: ['Flow starvation', 'Volume control'] },
  { id: 'premature_cycle', cat: 'Asynchrony', name: 'Premature cycling',
    s: { mode: 'PSV', ps: 8, cycle: 60 }, p: { autoDrive: 0, effort: 9, prr: 18, nti: 1.5 }, f: {},
    see: ['Breath ends while patient still inhales', 'Expiratory flow briefly returns towards zero or positive', 'Often followed by double trigger'],
    why: 'Expiratory trigger (cycle %) is too high relative to the patient\'s neural Ti.',
    fix: ['Lower cycle-off % (e.g. 15–25%)', 'Increase PS or Ti (in PC)'],
    tags: ['Premature cycling', 'Cycle'] },
  { id: 'delayed_cycle', cat: 'Asynchrony', name: 'Delayed cycling',
    s: { mode: 'PSV', ps: 16, cycle: 5 }, p: { autoDrive: 0, C: 60, Ri: 12, Re: 25, effort: 5, prr: 18, nti: 0.7 }, f: { activeExp: 1 },
    see: ['Pressure spike at the end of inspiration', 'Patient actively exhales against the ventilator', 'Long inspiratory time, less Te → auto-PEEP'],
    why: 'Cycle threshold too low (common in COPD with long τ) – the breath outlasts neural inspiration.',
    fix: ['Raise cycle-off % (40–50% in COPD)', 'Lower PS', 'Shorter max Ti'],
    tags: ['Delayed cycling', 'Cycle'] },
  { id: 'reverse_trigger', cat: 'Asynchrony', name: 'Reverse triggering',
    s: { mode: 'PC-AC', rr: 16 }, p: {}, f: { reverse: 1 },
    see: ['Patient effort starts AFTER a machine breath begins', 'Extra inspiratory flow mid/late breath', 'May produce double cycling and stacking'],
    why: 'Respiratory entrainment – the passive breath triggers a muscle contraction (common in deep sedation, ARDS).',
    fix: ['Recognise it (look at Pmus overlay)', 'Adjust sedation, RR, Ti', 'Consider NMB in severe ARDS'],
    tags: ['Reverse triggering', 'Asynchrony'] },
  { id: 'high_drive', cat: 'Asynchrony', name: 'High respiratory drive / air hunger',
    s: { mode: 'VC-AC', rr: 14, ti: 1.0, vt: 450 }, p: { autoDrive: 0, effort: 15, prr: 30, nti: 0.9 }, f: {},
    see: ['High RR, every breath triggered', 'Scooped pressure (flow starvation)', 'Double triggers, high minute volume'],
    why: 'Strong drive (pain, acidosis, fever, anxiety, hypoxia) exceeds what the settings deliver.',
    fix: ['Find and treat the cause', 'Match flow / Ti to demand', 'Analgesia, then sedation'],
    tags: ['Asynchrony', 'Flow starvation'] },
  { id: 'rise_fast', cat: 'Settings', name: 'Rise time too fast (overshoot)',
    s: { mode: 'PC-AC', rise: 0.0 }, p: {}, f: {},
    see: ['Pressure spike/overshoot at the start of inspiration', 'Very high early peak flow'],
    why: 'Pressurisation is faster than the system can follow.',
    fix: ['Increase [[Rise time]] slightly'],
    tags: ['Rise time', 'Pressure waveform'] },
  { id: 'rise_slow', cat: 'Settings', name: 'Rise time too slow',
    s: { mode: 'PSV', ps: 10, rise: 0.45 }, p: { autoDrive: 0, effort: 10, prr: 22, nti: 0.9 }, f: {},
    see: ['Slow, rounded pressure rise', 'Peak flow late and low; patient "pulls" on the ventilator'],
    why: 'Gas delivery lags behind patient demand.',
    fix: ['Shorten [[Rise time]]'],
    tags: ['Rise time', 'Flow starvation'] },
  { id: 'short_ti_pc', cat: 'Settings', name: 'Ti too short in PC (incomplete inspiration)',
    s: { mode: 'PC-AC', ti: 0.5, pinsp: 15 }, p: { C: 60, Ri: 15, Re: 18 }, f: {},
    see: ['Inspiratory flow has not reached zero when the breath ends', 'Vt increases if Ti is lengthened'],
    why: 'Inspiration is cut before pressure equilibrates with the alveoli.',
    fix: ['Lengthen Ti until end-inspiratory flow ≈ 0 (watch Te)'],
    tags: ['Flow waveform', 'Pressure control'] },
  { id: 'aprv_tlow', cat: 'Settings', name: 'APRV: Tlow too long',
    s: { mode: 'APRV', phigh: 28, plow: 0, thigh: 4.0, tlow: 1.4 }, p: { C: 30 }, f: {},
    see: ['Expiratory flow returns to zero during the release', 'Large release volumes'],
    why: 'Long release lets alveoli collapse; APRV relies on a short release to keep end-expiratory volume.',
    fix: ['Shorten Tlow so flow terminates at ~50–75% of peak expiratory flow'],
    tags: ['APRV'] },
  { id: 'hiccups', cat: 'Asynchrony', name: 'Hiccups',
    s: { mode: 'VC-AC', rr: 14 }, p: {}, f: { hiccup: 1 },
    see: ['Sudden brief negative deflections at regular intervals', 'May trigger extra breaths'],
    why: 'Abrupt diaphragmatic contractions.',
    fix: ['Look for gastric distension, irritation', 'Adjust trigger, treat cause'],
    tags: ['Auto-triggering'] },
  { id: 'refractory_hypox', cat: 'Gas exchange', name: 'Refractory hypoxaemia (ARDS shunt)',
    s: { mode: 'VC-AC', vt: 380, rr: 24, peep: 5, fio2: 60 }, p: { C: 22, shunt: 40, deadAlv: 22, recruit: 65 }, f: {},
    see: ['Low SpO2 and PaO2 despite FiO2 60%', 'P/F ratio < 100', 'Raising FiO2 helps little (large [[Shunt]])'],
    why: 'Collapsed, flooded alveoli are perfused but not ventilated – a true shunt. Extra oxygen never reaches that blood.',
    fix: ['Raise [[PEEP]] (try 12–16) and watch SpO2, Pplat and driving pressure', 'Longer Ti raises [[Mean airway pressure]]', 'Prone position, consider NMB', 'Then lower FiO2'],
    tags: ['Shunt', 'P/F ratio', 'PEEP'] },
  { id: 'dead_space', cat: 'Gas exchange', name: 'High dead space (e.g. pulmonary embolism)',
    s: { mode: 'VC-AC', vt: 450, rr: 16 }, p: { deadAlv: 35 }, f: {},
    see: ['PaCO2 rises while minute ventilation is normal', 'EtCO2 falls – wide PaCO2–EtCO2 gap', 'High [[VD/VT]]'],
    why: 'Ventilated alveoli without blood flow do not remove CO2, so alveolar ventilation falls.',
    fix: ['Find the cause (PE, low cardiac output, overdistension)', 'Raise RR/MV to control PaCO2', 'Avoid excessive PEEP'],
    tags: ['Dead space', 'EtCO2'] },
  { id: 'hypovent', cat: 'Gas exchange', name: 'Hypoventilation (respiratory acidosis)',
    s: { mode: 'VC-AC', vt: 400, rr: 12 }, p: {}, f: {},
    see: ['Low minute volume', 'PaCO2 and EtCO2 rise, pH falls', 'SpO2 may still be normal on oxygen'],
    why: 'Alveolar ventilation is too low for the CO2 production.',
    fix: ['Raise RR or Vt: new RR = RR × PaCO2 / target', 'Check for leak, sedation, weak effort'],
    tags: ['Hypercapnia', 'Minute ventilation'] },
  { id: 'hypervent', cat: 'Gas exchange', name: 'Hyperventilation (respiratory alkalosis)',
    s: { mode: 'VC-AC', vt: 550, rr: 28 }, p: {}, f: {},
    see: ['High minute volume', 'Low PaCO2 and EtCO2, high pH', 'Often with auto-PEEP at high RR'],
    why: 'Alveolar ventilation exceeds CO2 production.',
    fix: ['Lower RR / Vt', 'If patient-driven: treat pain, anxiety, fever, hypoxia; check [[Auto-triggering]]'],
    tags: ['Respiratory alkalosis', 'Minute ventilation'] },
  { id: 'met_acid', cat: 'Gas exchange', name: 'Metabolic acidosis with high drive',
    s: { mode: 'PSV', ps: 8 }, p: { effort: 6, prr: 16, nti: 0.8, hco3: 12, vco2: 240 }, f: {},
    see: ['Low pH with low HCO3', 'Patient breathes fast and hard (compensation)', 'Low PaCO2 by Winter\'s formula'],
    why: 'The respiratory centre drives ventilation to lower PaCO2 and compensate the acid.',
    fix: ['Treat the cause (sepsis, DKA, renal failure)', 'Do not suppress the compensation suddenly', 'Expected PaCO2 = 1.5 × HCO3 + 8 (± 2)'],
    tags: ['Metabolic acidosis', 'ABG'] },
  { id: 'eso_intub', cat: 'Emergency', name: 'Oesophageal intubation',
    s: { mode: 'VC-AC' }, p: { C: 90 }, f: { eso: 1 },
    see: ['EtCO2 falls to zero within a few breaths', 'No alveolar ventilation – PaCO2 rises, SpO2 falls', 'Gastric distension'],
    why: 'Gas goes into the stomach, not the lungs. "No trace = wrong place".',
    fix: ['Remove tube, bag-mask with 100% O2', 'Re-intubate with videolaryngoscope', 'Confirm with waveform capnography'],
    tags: ['Capnography', 'EtCO2'] },
  { id: 'low_co', cat: 'Gas exchange', name: 'Low cardiac output / shock',
    s: { mode: 'VC-AC' }, p: {}, f: { lowCO: 1 },
    see: ['EtCO2 falls suddenly with unchanged ventilation', 'Wide PaCO2–EtCO2 gap', 'Lower PaO2 (low mixed venous O2)'],
    why: 'Less blood reaches the lungs, so less CO2 is delivered for exhalation. During CPR, EtCO2 reflects compression quality.',
    fix: ['Assess circulation: BP, echo, fluids, vasopressors', 'In cardiac arrest: EtCO2 < 10 mmHg means poor CPR; a sudden rise suggests ROSC'],
    tags: ['EtCO2', 'Dead space'] },
  { id: 'curare_cleft', cat: 'Asynchrony', name: 'Curare cleft (capnogram)',
    s: { mode: 'VC-AC', rr: 12 }, p: { autoDrive: 0, effort: 5, prr: 9, nti: 0.6 }, f: {},
    see: ['A notch (cleft) in the plateau of the CO2 waveform', 'Small patient efforts between breaths'],
    why: 'The patient takes a small breath during expiration, drawing fresh gas past the sensor.',
    fix: ['Recognise returning spontaneous effort / wearing-off relaxant', 'Review sedation, synchrony'],
    tags: ['Capnography'] },
  { id: 'apnea_psv', cat: 'Emergency', name: 'Apnoea in PSV / CPAP',
    s: { mode: 'PSV', ps: 10, apneaTime: 15 }, p: { effort: 0, prr: 0 }, f: {},
    see: ['No breaths; flat flow at zero', 'Apnoea alarm then backup ventilation'],
    why: 'Spontaneous modes need patient effort; sedation or neurological cause removed it.',
    fix: ['Switch to a mandatory mode', 'Review sedation / opioids', 'Check apnoea backup settings'],
    tags: ['Pressure support', 'Alarms'] }
];

/* ---------- Learning library ---------- */
const TOPICS = [
  /* BASICS */
  { id: 'eom', cat: 'Basics', title: 'Equation of Motion', tags: ['equation of motion', 'eom'], body: `
Every waveform in this simulator comes from one equation:

**Paw = Flow × R + Volume / C + PEEPtotal − Pmus**

- **Flow × R** – pressure to push gas through the airways ([[Resistance]]).
- **Volume / C** – pressure to stretch the lung and chest wall ([[Compliance]]).
- **PEEPtotal** – set [[PEEP]] plus any [[Auto-PEEP]].
- **Pmus** – the patient's own muscle pressure (inspiratory effort lowers Paw).

When flow is zero (an [[Inspiratory hold|hold]]), the resistive term disappears and Paw equals alveolar pressure – that is [[Pplat]].` },
  { id: 'compliance', cat: 'Basics', title: 'Compliance (Cstat, Cdyn)', tags: ['compliance', 'cstat', 'cdyn', 'static compliance'], body: `
Compliance = change in volume / change in pressure (ml/cmH2O).

- **Static (Cstat)** = Vt / ([[Pplat]] − PEEPtotal). Needs an inspiratory hold.
- **Dynamic (Cdyn)** = Vt / ([[Ppeak]] − PEEP). Includes resistance, so always lower.
- Ventilated adults with normal lungs: roughly 50–80 ml/cmH2O.

Low compliance: ARDS, pulmonary oedema, fibrosis, pneumothorax, endobronchial tube, obesity, abdominal hypertension, chest wall stiffness.

On the [[P-V loop]] low compliance makes the loop lie flatter (rotated toward the pressure axis).` },
  { id: 'resistance', cat: 'Basics', title: 'Airway Resistance (Raw)', tags: ['resistance', 'raw', 'airway resistance'], body: `
Raw = ([[Ppeak]] − [[Pplat]]) / inspiratory flow (L/s), measured in constant-flow volume control.

- Intubated adult: about 5–15 cmH2O/L/s (the ETT adds a lot).
- High Raw: bronchospasm, secretions, kinked or bitten tube, small ETT, mucus plug, HME blockage.

Signs: big Ppeak−Pplat gap, low peak expiratory flow with a long tail, scooped expiratory limb on the [[Flow–volume loop]].` },
  { id: 'tau', cat: 'Basics', title: 'Time Constant (τ)', tags: ['time constant', 'tau', 'τ'], body: `
τ = R × C (with C in L/cmH2O). Example: R 10 × C 0.05 = 0.5 s.

- After 1 τ ~63% of the volume has left the lung, after 3 τ ~95%, after 5 τ ~99%.
- Expiratory time should be at least 3–5 τ to avoid [[Auto-PEEP]].
- COPD/asthma: long τ (high R). ARDS: short τ (low C) – can tolerate higher RR.

The Numerics card shows the model τ for the current lung.` },
  { id: 'phasevar', cat: 'Basics', title: 'Phase Variables (Trigger, Target, Cycle)', tags: ['phase variables', 'chatburn'], body: `
Each breath is described by three variables:

- **Trigger** – what starts inspiration: time (machine), flow or pressure (patient). See [[Trigger]].
- **Target / limit** – what is controlled during inspiration: flow/volume (VC) or pressure (PC, PS).
- **Cycle** – what ends inspiration: time (VC, PC), flow (PS – see [[Cycle]]), or pressure (safety limit).

Breath types in this app are marked on the waveforms: **M** mandatory (machine-triggered), **A** assisted (patient-triggered mandatory), **S** spontaneous (pressure support), **R** release (APRV).` },
  { id: 'howvent', cat: 'Basics', title: 'How a Ventilator Works', tags: ['how a ventilator works', 'ventilator inside', 'valves'], body: `
- **Gas sources** – air and oxygen at high pressure, mixed in the **blender** to the set FiO2.
- **Inspiratory valve** – a fast proportional valve controlled by a microprocessor; it shapes flow (VC) or pressure (PC/PS).
- **Inspiratory limb → Y-piece → ETT → patient**.
- **Expiratory limb → expiratory valve** – closed during inspiration, then opens and controls [[PEEP]].
- **Flow and pressure sensors** feed a closed loop many hundred times per second; they also detect triggers.
- **Alarms** compare measured values with limits.

Open the "Ventilator Inside" card to watch the valves open and close with each breath.` },

  /* PRESSURES */
  { id: 'ppeak', cat: 'Pressures', title: 'Peak Pressure (Ppeak, PIP)', tags: ['ppeak', 'peak pressure', 'pip', 'peak inspiratory pressure'], body: `
The highest airway pressure during inspiration = resistive + elastic + PEEP.

- High Ppeak with normal [[Pplat]] → [[Resistance]] problem.
- High Ppeak and high Pplat → [[Compliance]] problem.
- Ppeak is not a good guide to lung stress on its own; use Pplat and [[Driving pressure]].` },
  { id: 'pplat', cat: 'Pressures', title: 'Plateau Pressure (Pplat)', tags: ['pplat', 'plateau pressure', 'p plateau', 'plateau'], body: `
Pressure during an end-[[Inspiratory hold|inspiratory hold]] (≥ 0.5 s, zero flow) in a **passive** patient. Approximates alveolar pressure.

- Target **≤ 30 cmH2O** (lung-protective).
- Patient effort during the hold makes it unreliable (Pmus lowers it).
- Use it to calculate static [[Compliance]] and [[Driving pressure]].

In this app: press **Insp Hold** on the Waveforms card, or set an inspiratory pause ≥ 0.2 s.` },
  { id: 'dp', cat: 'Pressures', title: 'Driving Pressure (ΔP)', tags: ['driving pressure', 'dp', 'δp', 'delta p'], body: `
ΔP = [[Pplat]] − PEEPtotal = Vt / Crs.

- It scales tidal volume to the size of the aerated ("baby") lung.
- Higher ΔP is associated with higher mortality in ARDS; aim for **≤ 15 cmH2O**.
- If PEEP rises and ΔP falls → recruitment; if ΔP rises → overdistension.` },
  { id: 'peep', cat: 'Pressures', title: 'PEEP', tags: ['peep', 'positive end-expiratory pressure', 'extrinsic peep'], body: `
Positive end-expiratory pressure set on the ventilator.

- Keeps alveoli open, increases FRC, improves oxygenation, reduces atelectrauma.
- Too much: overdistension, raised dead space, reduced venous return / hypotension.
- Titrate using the PEEP/FiO2 table, [[Driving pressure]], compliance, or [[P-V loop]] inflection points.
- Total PEEP = set PEEP + [[Auto-PEEP]].` },
  { id: 'autopeep', cat: 'Pressures', title: 'Auto-PEEP (Intrinsic PEEP)', tags: ['auto-peep', 'autopeep', 'intrinsic peep', 'peepi', 'dynamic hyperinflation', 'air trapping', 'breath stacking'], body: `
Alveolar pressure above set PEEP at end-expiration because the lung did not empty.

**Recognise:** expiratory flow not reaching zero before the next breath ([[Flow waveform]]); rising Pplat; hypotension.

**Measure:** **Exp Hold** (≥ 0.5 s) in a passive patient → total PEEP − set PEEP = PEEPi.

**Causes:** high RR, long Ti, large Vt, high [[Resistance]], long [[Time constant]].

**Effects:** barotrauma, hypotension, [[missed triggers|Ineffective effort]], higher work of breathing.

**Treat:** lower RR and Vt, shorten Ti / raise flow, bronchodilators. In spontaneously breathing patients, external PEEP up to ~80% of PEEPi can help triggering.

In a crisis (hypotension with severe air trapping): disconnect briefly and let the patient exhale.` },
  { id: 'pmean', cat: 'Pressures', title: 'Mean Airway Pressure (Pmean)', tags: ['mean airway pressure', 'pmean', 'mpaw'], body: `
Average pressure over the whole cycle. With FiO2 it is the main ventilator determinant of oxygenation.

Raised by: higher PEEP, longer Ti (inverse ratio), higher inspiratory pressure, square pressure shape (APRV).

Too high: reduced venous return, hypotension.` },
  { id: 'mp', cat: 'Pressures', title: 'Mechanical Power', tags: ['mechanical power', 'mp'], body: `
Energy delivered to the respiratory system per minute (J/min).

Simplified (volume control): **MP = 0.098 × RR × Vt(L) × (Ppeak − ½ × ΔP)**

- Combines RR, Vt, pressures and flow into one number.
- Values above roughly 12–17 J/min have been linked with lung injury risk (research use).` },
  { id: 'stressindex', cat: 'Pressures', title: 'Stress Index', tags: ['stress index', 'si'], body: `
Shape of the pressure–time curve during **constant-flow** VC in a **passive** patient:

- **SI < 1** (concave down, curve flattens) → tidal recruitment, consider more PEEP.
- **SI ≈ 1** (straight line) → good.
- **SI > 1** (concave up, curve bends upward) → overdistension, reduce Vt or PEEP.

Try the [[Overdistension]] and Derecruitment scenarios with square flow to see both shapes.` },

  /* SETTINGS */
  { id: 'trigger', cat: 'Settings', title: 'Trigger (Flow / Pressure)', tags: ['trigger', 'triggering', 'flow trigger', 'pressure trigger', 'trigger sensitivity'], body: `
How the ventilator detects patient effort.

- **Flow trigger** – a breath starts when patient inspiratory flow exceeds e.g. 1–3 L/min. More sensitive, less work.
- **Pressure trigger** – a breath starts when Paw drops below PEEP by e.g. 1–2 cmH2O. You see a small negative dip before each triggered breath.

Too sensitive → [[Auto-triggering]]. Not sensitive enough or [[Auto-PEEP]] → [[Ineffective effort]].` },
  { id: 'cycle', cat: 'Settings', title: 'Cycle-off (Expiratory Trigger, ETS)', tags: ['cycle', 'cycling', 'ets', 'expiratory trigger', 'cycle off'], body: `
In pressure support, inspiration ends when flow falls to a set % of its peak (default 25%).

- **COPD / long τ:** raise to 40–50% → avoids [[Delayed cycling]].
- **Restrictive / short τ:** lower to 10–20% → avoids [[Premature cycling]].` },
  { id: 'rise', cat: 'Settings', title: 'Rise Time (Pressure Ramp)', tags: ['rise time', 'pressure ramp', 'slope', 'ramp'], body: `
How quickly target pressure is reached in PC/PS.

- Fast: high early flow, good for high drive; too fast → overshoot spike.
- Slow: comfortable for some, but can cause flow starvation in demanding patients.

Watch the start of the [[Pressure waveform]] while you change it.` },
  { id: 'flowpattern', cat: 'Settings', title: 'Flow Pattern (Square vs Decelerating)', tags: ['flow pattern', 'square flow', 'decelerating flow', 'ramp flow'], body: `
In volume control:

- **Square (constant)** – peak flow = Vt/Ti. Higher Ppeak, needed for [[Resistance]] and [[Stress index]] measurement.
- **Decelerating** – high early flow falling during inspiration. Lower Ppeak, better distribution, often more comfortable.

Pplat for the same Vt is the same – only the resistive part changes.` },
  { id: 'ie', cat: 'Settings', title: 'I:E Ratio & Inspiratory Time', tags: ['i:e', 'ie ratio', 'inspiratory time', 'ti', 'te'], body: `
Cycle time = 60 / RR. Te = cycle time − Ti.

- Typical 1:2. Obstructive disease 1:3–1:4 (more Te).
- Inverse ratio (Ti > Te) raises [[Mean airway pressure]] but risks [[Auto-PEEP]] and hypotension.` },
  { id: 'pause', cat: 'Settings', title: 'Inspiratory Pause', tags: ['inspiratory pause', 'pause', 'end-inspiratory pause'], body: `
A period of zero flow at the end of VC inspiration. Lets gas redistribute and shows [[Pplat]] on every breath. It shortens Te at a fixed RR and Ti.` },
  { id: 'vt', cat: 'Settings', title: 'Tidal Volume & Predicted Body Weight', tags: ['tidal volume', 'vt', 'pbw', 'ibw', 'predicted body weight'], body: `
Set Vt by **predicted body weight**, not actual weight.

- Male PBW = 50 + 0.91 × (height cm − 152.4)
- Female PBW = 45.5 + 0.91 × (height cm − 152.4)

ARDS: 6 ml/kg PBW (range 4–8). Most other patients: 6–8 ml/kg PBW. Use the Calculators card.` },
  { id: 'fio2', cat: 'Settings', title: 'FiO2 & Oxygenation', tags: ['fio2', 'oxygenation', 'inspired oxygen'], body: `
Oxygenation is mainly set by **FiO2** and [[Mean airway pressure]] (PEEP, Ti). Ventilation (CO2) is set by **minute ventilation** (RR × Vt). See [[Oxygenation vs ventilation]].

- Common targets: SpO2 92–96% (88–92% in chronic hypercapnia).
- High FiO2 for long periods causes absorption atelectasis and oxygen toxicity – wean to ≤ 0.6 as soon as possible.
- FiO2 helps V/Q mismatch a lot but true [[Shunt]] very little.

In this simulator FiO2 changes PaO2 and SpO2 through the alveolar gas equation and the shunt model.` },

  /* MODES */
  { id: 'breathtypes', cat: 'Modes', title: 'Breath Types: Mandatory, Assisted, Spontaneous', tags: ['breath types', 'mandatory', 'assisted', 'spontaneous'], body: `
- **Mandatory (M)** – started and ended by the machine.
- **Assisted (A)** – started by the patient, then delivered like a mandatory breath.
- **Spontaneous (S)** – started and ended by the patient (pressure support).

See [[Phase variables]].` },
  { id: 'vc', cat: 'Modes', title: 'Volume Control (VC-AC / CMV)', tags: ['volume control', 'vc', 'vc-ac', 'cmv', 'vcv'], body: `
Set: RR, Vt, Ti (or flow), flow pattern, PEEP, FiO2, trigger.

- Guaranteed Vt; pressure varies with [[Compliance]] and [[Resistance]].
- Every patient effort gets a full set breath (A/C) – can cause hyperventilation.
- Risk: [[Flow starvation]] when demand exceeds set flow; [[Double triggering]].
- Best for measuring mechanics ([[Pplat]], Raw, [[Stress index]]).` },
  { id: 'pc', cat: 'Modes', title: 'Pressure Control (PC-AC)', tags: ['pressure control', 'pc', 'pc-ac', 'pcv'], body: `
Set: RR, inspiratory pressure (above PEEP), Ti, rise time, PEEP, FiO2.

- Pressure is fixed; Vt varies with compliance, resistance and effort – **monitor Vte**.
- Decelerating flow, variable flow meets patient demand.
- If end-inspiratory flow is not zero, a longer Ti will give more volume.` },
  { id: 'prvc', cat: 'Modes', title: 'PRVC (VC+, Autoflow)', tags: ['prvc', 'vc+', 'autoflow', 'dual mode'], body: `
A pressure-controlled breath whose pressure is adjusted breath-by-breath to reach a target Vt.

- First a test breath, then pressure changes in small steps (≈ ±3 cmH2O).
- Combines decelerating flow with a volume target.
- Pitfall: if the patient pulls hard, Vt rises and the machine **reduces** support – can worsen distress.

The Numerics card shows "Pinsp (auto)".` },
  { id: 'simv', cat: 'Modes', title: 'SIMV', tags: ['simv', 'synchronised intermittent mandatory ventilation'], body: `
A set number of mandatory breaths (VC or PC), synchronised to patient effort. Between them, the patient breathes spontaneously, usually with [[Pressure support]].

- Mandatory breaths are delivered if the patient triggers in the "window"; otherwise the machine gives them on time.
- Not a better weaning mode than PSV or SBTs; mixed breath types can increase work.` },
  { id: 'psv', cat: 'Modes', title: 'Pressure Support (PSV)', tags: ['pressure support', 'psv', 'ps'], body: `
Every breath is patient-triggered, pressure-targeted and **flow-cycled** ([[Cycle]]).

- Set: PS, PEEP, rise time, cycle %, trigger, FiO2.
- No set rate – needs an intact drive. Apnoea backup is essential.
- Used for weaning and comfortable spontaneous breathing.

Watch for [[Premature cycling]] and [[Delayed cycling]].` },
  { id: 'cpap', cat: 'Modes', title: 'CPAP', tags: ['cpap'], body: `
Constant pressure throughout the cycle; all breathing is done by the patient. Equivalent to PSV with PS = 0. Used in SBTs and NIV for OSA, pulmonary oedema. See [[NIV]] for bilevel NIV.` },
  { id: 'aprv', cat: 'Modes', title: 'APRV / BiLevel', tags: ['aprv', 'bilevel', 'bi-level', 'bipap', 'airway pressure release ventilation'], body: `
Two pressure levels (Phigh, Plow) alternating by time (Thigh, Tlow). The patient breathes freely at either level.

- APRV: long Thigh (4–6 s), very short Tlow (0.2–0.8 s), Plow often 0.
- **Tlow** is set so expiratory flow is cut off at ~50–75% of peak expiratory flow – this keeps an intrinsic PEEP and prevents collapse.
- High [[Mean airway pressure]] for oxygenation; spontaneous breathing helps V/Q matching.
- BiLevel uses shorter Thigh and longer Tlow.

The Numerics card shows "Termination % PEFR".` },
  { id: 'nava', cat: 'Modes', title: 'NAVA (concept)', tags: ['nava', 'neurally adjusted ventilatory assist', 'edi'], body: `
Uses the diaphragm electrical activity (Edi) from a special nasogastric catheter. Support = NAVA level × Edi, so timing and size follow the patient's own neural drive.

Reduces asynchrony. Not simulated in detail here – the algorithm needs the Edi signal.` },
  { id: 'asv', cat: 'Modes', title: 'ASV / IntelliVent (concept)', tags: ['asv', 'adaptive support ventilation', 'intellivent'], body: `
Closed-loop mode: the clinician sets a % minute volume; the ventilator chooses RR and Vt (Otis minimal-work principle) and adjusts pressure breath-by-breath.

Proprietary algorithm – only its principle is explained here.` },
  { id: 'pav', cat: 'Modes', title: 'PAV+ (concept)', tags: ['pav', 'pav+', 'proportional assist'], body: `
Support is proportional to patient effort: the ventilator measures R and C and unloads a set % of the work of breathing. Stronger effort → more support. Requires measurable mechanics and an intact drive.` },

  /* GRAPHICS */
  { id: 'waveforms', cat: 'Graphics', title: 'Reading Ventilator Waveforms', tags: ['waveforms', 'scalars', 'graphics'], body: `
Three scalars against time:

- [[Pressure waveform]] – what the ventilator does and how hard it works.
- [[Flow waveform]] – best for triggers, cycling, auto-PEEP, secretions.
- [[Volume waveform]] – leaks, Vt delivery.

Read in order: mode & breath type → inspiration shape → expiration → baseline → loops. Turn on the **Pmus overlay** to see the patient's effort.` },
  { id: 'pwave', cat: 'Graphics', title: 'Pressure–Time Waveform', tags: ['pressure waveform', 'pressure-time', 'pressure time'], body: `
- VC: ramp up to Ppeak; with a pause, drops to [[Pplat]].
- PC/PS: square shape at the target.
- A dip below PEEP before a breath = patient trigger (pressure trigger).
- Scooped inspiration in VC = [[Flow starvation]].
- Spike at end of PS breath = [[Delayed cycling]].
- Concave up/down in constant flow = [[Stress index]].` },
  { id: 'fwave', cat: 'Graphics', title: 'Flow–Time Waveform', tags: ['flow waveform', 'flow-time', 'flow time'], body: `
Inspiratory flow above zero, expiratory below.

- Expiratory flow not reaching zero → [[Auto-PEEP]].
- Bumps during expiration without a breath → [[Ineffective effort]].
- Saw-tooth → secretions / water.
- Inspiratory flow not reaching zero in PC → Ti too short.
- Long expiratory tail with low peak → high [[Resistance]].` },
  { id: 'vwave', cat: 'Graphics', title: 'Volume–Time Waveform', tags: ['volume waveform', 'volume-time', 'volume time'], body: `
Volume rises during inspiration and returns to zero during expiration.

- Not returning to baseline (then dropping straight down at the next breath) → [[Leak]] or air trapping.
- Stacked volumes → [[Double triggering]].` },
  { id: 'pvloop', cat: 'Graphics', title: 'Pressure–Volume (P-V) Loop', tags: ['p-v loop', 'pv loop', 'pressure-volume loop', 'pressure volume loop'], body: `
Pressure on the x-axis, volume on the y-axis.

- Mandatory breaths run **counter-clockwise**; patient-initiated parts (to the left of PEEP) run clockwise.
- Loop slope = [[Compliance]]: flatter loop = stiffer lung.
- Width (hysteresis) = resistance + recruitment.
- **Lower inflection point** – the slope suddenly increases: alveoli opening → [[PEEP]] above it.
- **Beaking** at the top – [[Overdistension]].
- Loop not closing → [[Leak]].

Use "Save reference" to compare before and after a change.` },
  { id: 'fvloop', cat: 'Graphics', title: 'Flow–Volume (F-V) Loop', tags: ['flow-volume loop', 'flow–volume loop', 'f-v loop', 'fv loop', 'flow volume loop'], body: `
Volume on the x-axis, flow on the y-axis (inspiration above, expiration below in this app).

- Scooped (concave) expiratory limb → airflow obstruction / bronchospasm.
- Expiratory limb does not reach zero flow → [[Auto-PEEP]].
- Saw-tooth → secretions.
- Loop does not close → [[Leak]].
- Improvement after bronchodilator: higher peak expiratory flow, less scooping.` },
  { id: 'holds', cat: 'Graphics', title: 'Hold Manoeuvres (Insp / Exp Hold)', tags: ['inspiratory hold', 'expiratory hold', 'hold', 'insp hold', 'exp hold'], body: `
Both need a **passive** patient.

- **Inspiratory hold** (end of inspiration, 0.5–2 s) → [[Pplat]] → static compliance, driving pressure, Raw.
- **Expiratory hold** (end of expiration, 0.5–2 s) → total PEEP → [[Auto-PEEP]].

In this app: buttons on the Waveforms card; values appear in Numerics.` },

  /* ASYNCHRONY */
  { id: 'asynchrony', cat: 'Asynchrony', title: 'Patient–Ventilator Asynchrony (overview)', tags: ['asynchrony', 'dyssynchrony', 'patient-ventilator asynchrony'], body: `
Mismatch between patient's neural breathing and the ventilator.

- **Trigger:** [[Ineffective effort]], [[Auto-triggering]], [[Double triggering]], [[Reverse triggering]].
- **Flow:** [[Flow starvation]], excessive flow.
- **Cycle:** [[Premature cycling]], [[Delayed cycling]].

An asynchrony index > 10% is associated with longer ventilation. Look at the patient, then the [[Flow waveform]] with the Pmus overlay on.` },
  { id: 'ineffective', cat: 'Asynchrony', title: 'Ineffective Effort (missed trigger)', tags: ['ineffective effort', 'missed trigger', 'ineffective triggering', 'wasted effort'], body: `
Patient tries to breathe but no breath is delivered.

**Look for:** a bump in expiratory flow towards zero and a small pressure dip, without a breath.

**Usually due to** [[Auto-PEEP]] (the patient must first overcome PEEPi) or over-assistance / weak muscles.

**Fix:** reduce auto-PEEP, add external PEEP, adjust trigger, reduce excessive support.` },
  { id: 'autotrigger', cat: 'Asynchrony', title: 'Auto-triggering', tags: ['auto-triggering', 'autotriggering', 'auto trigger', 'auto-trigger'], body: `
Breaths triggered by something other than patient effort: [[Leak]], cardiac oscillations, water in circuit, too sensitive [[Trigger]].

**Look for:** RR higher than expected, triggered breaths without any pressure dip or Pmus.

**Fix:** less sensitive trigger, fix leaks, drain water.` },
  { id: 'doubletrigger', cat: 'Asynchrony', title: 'Double Triggering', tags: ['double triggering', 'double trigger', 'double cycling'], body: `
Two breaths for one patient effort, because the patient's neural Ti is longer than the ventilator's.

**Look for:** two inspirations close together with little exhalation – volume stacks.

**Fix:** longer Ti, higher Vt (if safe), PC/PSV instead of VC, treat high drive.` },
  { id: 'reversetrigger', cat: 'Asynchrony', title: 'Reverse Triggering', tags: ['reverse triggering', 'reverse trigger', 'entrainment'], body: `
A machine breath triggers a diaphragm contraction (entrainment). The effort starts **after** inspiration begins.

Common in deep sedation and ARDS. Can cause breath stacking and higher lung stress.

**Fix:** adjust sedation, RR/Ti; consider neuromuscular blockade in severe ARDS.` },
  { id: 'flowstarvation', cat: 'Asynchrony', title: 'Flow Starvation', tags: ['flow starvation', 'flow asynchrony', 'insufficient flow'], body: `
Patient wants more flow than the ventilator gives (typical in VC with fixed flow).

**Look for:** scooped / concave inspiratory pressure, sometimes below PEEP.

**Fix:** increase flow or shorten Ti, decelerating pattern, switch to PC/PSV, treat drive.` },
  { id: 'prematurecycle', cat: 'Asynchrony', title: 'Premature Cycling', tags: ['premature cycling', 'early cycling', 'short cycling'], body: `
The breath ends before the patient stops inhaling.

**Look for:** after cycling, expiratory flow turns back towards zero or positive; often a [[Double triggering|double trigger]].

**Fix:** lower cycle-off %, longer Ti (PC), more PS.` },
  { id: 'delayedcycle', cat: 'Asynchrony', title: 'Delayed Cycling', tags: ['delayed cycling', 'late cycling', 'prolonged cycling'], body: `
The breath continues after the patient has started to exhale.

**Look for:** a pressure spike at the end of inspiration (patient pushes against the ventilator); expiratory muscles active.

**Common in** COPD (long τ – flow decays slowly).

**Fix:** raise cycle-off % (40–50%), lower PS.` },

  /* STRATEGY */
  { id: 'ards', cat: 'Strategy', title: 'Lung-Protective Ventilation (ARDS)', tags: ['ards', 'lung protective', 'lung-protective ventilation', 'ardsnet'], body: `
- Vt **6 ml/kg [[PBW]]** (4–8).
- [[Pplat]] **≤ 30**, [[Driving pressure]] **≤ 15** cmH2O.
- [[PEEP]] by PEEP/FiO2 table or individual titration.
- Prone positioning for ≥ 12–16 h/day if P/F < 150.
- Consider neuromuscular blockade early in severe ARDS; conservative fluids once stable.
- Permissive hypercapnia (pH ≥ 7.20–7.25) is acceptable.` },
  { id: 'obstructive', cat: 'Strategy', title: 'Ventilating Asthma / COPD', tags: ['obstructive', 'asthma', 'copd', 'obstructive lung disease'], body: `
Main danger: [[Auto-PEEP]].

- Low RR (10–14), Vt 6–8 ml/kg PBW.
- High inspiratory flow (60–80 L/min) to shorten Ti; I:E 1:3–1:4 or more.
- Permissive hypercapnia.
- Monitor Pplat and PEEPi (exp hold); in PSV raise cycle-off %.
- Treat bronchospasm aggressively.` },
  { id: 'recruitment', cat: 'Strategy', title: 'Recruitment & PEEP Titration', tags: ['recruitment', 'recruitment manoeuvre', 'peep titration', 'lip', 'lower inflection point'], body: `
Recruitment = re-opening collapsed alveoli by raising pressure for a short time.

PEEP titration methods: PEEP/FiO2 table, best compliance / lowest [[Driving pressure]] (decremental trial), [[Stress index]], P-V loop lower inflection point, oesophageal pressure, EIT.

Sustained high-pressure recruitment manoeuvres are not routinely recommended; watch for hypotension and barotrauma.` },
  { id: 'weaning', cat: 'Strategy', title: 'Weaning, SBT & RSBI', tags: ['weaning', 'sbt', 'rsbi', 'spontaneous breathing trial'], body: `
**Readiness:** cause improving, FiO2 ≤ 0.4–0.5, PEEP ≤ 5–8, stable haemodynamics, awake/cooperative, cough.

**SBT:** 30–120 min on PS 5–8 / PEEP 5, CPAP or T-piece.

**RSBI** = RR / Vt (litres). **< 105** predicts success.

Failure signs: RR > 35, SpO2 < 90%, tachycardia, hypertension, distress, diaphoresis.

Run a simulated SBT in the **Manoeuvres** card; also check [[P0.1]] and [[NIF]].` },
  { id: 'co2', cat: 'Strategy', title: 'Adjusting PaCO2 & Minute Ventilation', tags: ['paco2', 'minute ventilation', 'mv', 'mve', 'hypercapnia'], body: `
Minute ventilation = RR × Vt. PaCO2 is inversely proportional to alveolar ventilation.

**New RR = current RR × current PaCO2 / target PaCO2** (at the same Vt).

Watch Te when raising RR – [[Auto-PEEP]] can make CO2 worse.` },
  { id: 'pf', cat: 'Strategy', title: 'P/F Ratio & ARDS Severity', tags: ['p/f ratio', 'pf ratio', 'berlin', 'pao2/fio2'], body: `
P/F = PaO2 (mmHg) / FiO2 (fraction), with PEEP ≥ 5:

- Mild 200–300
- Moderate 100–200
- Severe ≤ 100` },


  /* GAS EXCHANGE */
  { id: 'gasex', cat: 'Gas exchange', title: 'Oxygenation vs Ventilation', tags: ['oxygenation vs ventilation', 'gas exchange', 'ventilation', 'oxygenation'], body: `
Two separate jobs, controlled by different settings:

- **Oxygenation** (PaO2, SpO2) ← FiO2 and [[Mean airway pressure]] (PEEP, Ti, Pinsp). Limited by [[Shunt]] and V/Q mismatch.
- **Ventilation** (PaCO2, pH) ← alveolar ventilation = RR × (Vt − dead space). Limited by [[Dead space]] and [[Auto-PEEP]].

Rule of thumb: low SpO2 → think FiO2 / PEEP; high PaCO2 → think RR / Vt.` },
  { id: 'alvgas', cat: 'Gas exchange', title: 'Alveolar Gas Equation & A–a Gradient', tags: ['alveolar gas equation', 'pao2 alveolar', 'a-a gradient', 'aa gradient', 'pao2'], body: `
**PAO2 = FiO2 × (Patm − PH2O) − PaCO2 / RQ**

At sea level: PAO2 = FiO2 × 713 − PaCO2 / 0.8.

- Example: FiO2 0.21, PaCO2 40 → PAO2 ≈ 150 − 50 = 100 mmHg.
- **A–a gradient** = PAO2 − PaO2. Normal on room air ≈ (age / 4) + 4 mmHg.
- Raised A–a gradient: shunt, V/Q mismatch, diffusion problem.
- Normal A–a gradient with hypoxaemia: hypoventilation or low FiO2.` },
  { id: 'shunt', cat: 'Gas exchange', title: 'Shunt & Iso-shunt', tags: ['shunt', 'intrapulmonary shunt', 'qs/qt', 'iso-shunt', 'v/q mismatch'], body: `
**Shunt** = blood passing through the lung without meeting ventilated alveoli (collapse, consolidation, oedema).

- Normal physiological shunt ≈ 2–5%.
- With shunt > 30%, raising FiO2 barely increases PaO2 (iso-shunt curves flatten).
- **Treatment is recruitment:** PEEP, longer Ti, prone position – not just oxygen.
- **V/Q mismatch** (low but not zero ventilation) responds well to FiO2.

Try the "Refractory hypoxaemia" scenario: compare FiO2 100% against PEEP 14.` },
  { id: 'deadspace', cat: 'Gas exchange', title: 'Dead Space (VD/VT)', tags: ['dead space', 'vd/vt', 'vdvt', 'physiological dead space', 'alveolar dead space', 'anatomical dead space'], body: `
Ventilated areas that take no part in gas exchange.

- **Anatomical** – airways, ETT, circuit beyond the Y (~150 ml / 2 ml/kg).
- **Alveolar** – ventilated but not perfused alveoli (PE, low cardiac output, overdistension).
- **Physiological** = anatomical + alveolar. Normal VD/VT ≈ 0.3; in ARDS often > 0.5 (bad prognosis).

**Bohr–Enghoff:** VD/VT = (PaCO2 − PECO2) / PaCO2.

A wide PaCO2–EtCO2 gap is a bedside sign of increased alveolar dead space. Small Vt with high RR wastes more ventilation on dead space.` },
  { id: 'odc', cat: 'Gas exchange', title: 'Oxyhaemoglobin Dissociation Curve', tags: ['oxyhaemoglobin dissociation curve', 'odc', 'p50', 'spo2', 'oxygen saturation'], body: `
S-shaped relation between PaO2 and SaO2.

- PaO2 60 mmHg ≈ SpO2 90% (start of the steep part – danger zone).
- PaO2 40 ≈ SpO2 75% (mixed venous). P50 ≈ 27 mmHg.
- Above ~100 mmHg the curve is flat: more PaO2 adds almost no oxygen content.
- **Right shift** (lower affinity): ↑ temperature, ↑ CO2, acidosis, ↑ 2,3-DPG.
- **Left shift:** the opposite, plus carbon monoxide, fetal Hb.

O2 content = 1.34 × Hb × SaO2 + 0.003 × PaO2.` },
  { id: 'capno', cat: 'Gas exchange', title: 'Capnography (EtCO2 waveform)', tags: ['capnography', 'capnogram', 'etco2', 'end-tidal co2', 'shark fin', 'curare cleft'], body: `
CO2 measured at the airway through the breath.

- **Phase I** – dead space gas, CO2 ≈ 0.
- **Phase II** – rapid rise (mixing of dead space and alveolar gas).
- **Phase III** – alveolar plateau; its end value is **EtCO2**.
- **Phase 0** – inspiration, CO2 falls to zero.

Normal EtCO2 35–45 mmHg, usually 2–5 below PaCO2.

- **Shark fin** – slow phase II, steep phase III: bronchospasm / COPD.
- **Curare cleft** – notch in the plateau: patient effort.
- **Sudden zero** – disconnection, oesophageal tube, total obstruction.
- **Gradual fall** – hyperventilation, falling cardiac output, PE.
- **Rising baseline** – rebreathing (exhausted absorber, valve fault).

Turn on the **CO2** pane in the Waveforms card.` },
  { id: 'abg', cat: 'Gas exchange', title: 'ABG Interpretation (step by step)', tags: ['abg', 'arterial blood gas', 'blood gas', 'acid-base', 'ph', 'hco3', 'winter formula'], body: `
1. **pH** – < 7.35 acidaemia, > 7.45 alkalaemia.
2. **Primary process** – PaCO2 > 45 respiratory acidosis, < 35 alkalosis; HCO3 < 22 metabolic acidosis, > 26 alkalosis.
3. **Compensation**
- Metabolic acidosis: expected PaCO2 = 1.5 × HCO3 + 8 (± 2) (Winter's).
- Acute respiratory acidosis: HCO3 rises 1 per 10 PaCO2; chronic: 3.5 per 10.
4. **Anion gap** = Na − (Cl + HCO3), normal ≈ 8–12.
5. **Oxygenation** – PaO2, [[P/F ratio]], A–a gradient.

Normal: pH 7.35–7.45, PaCO2 35–45 mmHg, HCO3 22–26 mmol/L, PaO2 80–100 mmHg on air.

The Blood Gas card gives an automatic interpretation of the simulated gas.` },
  { id: 'hypox', cat: 'Gas exchange', title: 'Hypoxaemia on the Ventilator – Approach', tags: ['hypoxaemia', 'hypoxemia', 'desaturation approach', 'low spo2'], body: `
1. **Look at the patient**; if crashing – 100% O2, hand-ventilate, [[DOPES]].
2. Check probe, waveform, tube position, circuit.
3. **FiO2 ↑** (quick fix).
4. **PEEP ↑ / Pmean ↑** if recruitable (ARDS, atelectasis, obesity).
5. Treat cause: secretions (suction), pneumothorax, effusion, oedema (diuretics), bronchospasm.
6. Refractory: prone, NMB, recruitment, consider ECMO referral.

Remember: hypoxaemia from [[Shunt]] responds to PEEP more than FiO2.` },
  { id: 'hypercap', cat: 'Gas exchange', title: 'Hypercapnia on the Ventilator – Approach', tags: ['hypercapnia', 'high paco2', 'respiratory acidosis', 'co2 retention'], body: `
1. Is minute ventilation low? (apnoea, leak, low RR/Vt, weak effort in PSV)
2. Is dead space high? (wide PaCO2–EtCO2 gap, PE, low output, overdistension, small Vt + long circuit)
3. Is CO2 production high? (fever, sepsis, overfeeding, shivering)
4. Is there [[Auto-PEEP]]? (raising RR may worsen it)

**Fix:** raise RR (watch Te) or Vt (watch Pplat), remove extra dead space, treat the cause. [[Permissive hypercapnia]] (pH ≥ 7.2) is acceptable in ARDS and asthma.` },

  /* ADVANCED */
  { id: 'vsniv', cat: 'Modes', title: 'Volume Support & NIV', tags: ['volume support', 'vs', 'niv', 'non-invasive ventilation', 'ipap', 'epap', 'bilevel niv'], body: `
**Volume Support (VS)** – a spontaneous mode like PSV, but the support level changes breath by breath (≈ ±3 cmH2O) to reach a target Vt. Good for weaning; if the patient breathes bigger, support falls automatically. Needs an intact drive and apnoea backup.

**NIV (bilevel, S/T)** – ventilation through a mask:
- **IPAP** = inspiratory pressure, **EPAP** = expiratory pressure (like PEEP). Pressure support = IPAP − EPAP.
- **Backup rate** gives timed breaths if the patient stops breathing (S/T mode).
- There is always some mask leak; [[Leak compensation]] stops it from causing [[Auto-triggering]].
- Uses: COPD exacerbation with acidosis, cardiogenic pulmonary oedema, post-extubation support in high-risk patients.
- Typical start: IPAP 10–12, EPAP 4–5, raise IPAP by 2 every few minutes to target.` },
  { id: 'advset', cat: 'Settings', title: 'Advanced Settings: Sigh, Max Ti, Leak Compensation, ATC', tags: ['advanced settings', 'sigh', 'atc', 'automatic tube compensation', 'max ti', 'leak compensation'], body: `
- **Sigh** – every N breaths a bigger breath (here 1.5 × Vt in VC, +8 cmH2O in pressure modes). Can re-open atelectasis; watch Pplat.
- **Max Ti (PS)** – safety limit for a spontaneous breath that never reaches the cycle threshold (big leak, COPD). Usually 1.5–2 s.
- **Leak compensation** – baseline leak is subtracted before trigger detection. Off → leaks cause [[Auto-triggering]].
- **ATC** – the ventilator calculates tube resistance from the tube size and adds pressure = R(tube) × flow during spontaneous breaths, so the patient breathes as if extubated. Useful during SBTs; smaller tubes have much higher resistance (6.5 mm ≈ 9, 8.0 mm ≈ 4 cmH2O/L/s).` },
  { id: 'pes', cat: 'Pressures', title: 'Oesophageal Pressure & Transpulmonary Pressure', tags: ['oesophageal pressure', 'esophageal pressure', 'pes', 'transpulmonary pressure', 'pl', 'chest wall'], body: `
A balloon in the lower oesophagus measures **Pes ≈ pleural pressure**.

- **Transpulmonary pressure (PL) = Paw − Pes** – the pressure that actually stretches the lung.
- **End-expiratory PL** = total PEEP − Pes(exp). Negative → alveoli collapse; titrate PEEP to keep it ≈ 0 to +5 cmH2O.
- **End-inspiratory PL** = Pplat − Pes(insp). Keep < 20–25 cmH2O to avoid overstretch.
- In obesity and high abdominal pressure the [[Chest wall]] is stiff: Pplat may be high while lung stress is acceptable, and higher PEEP is often needed.
- During spontaneous breathing, Pes swings show patient effort (more negative = harder work).

Turn on the **Pes** pane in the Waveforms card and change "Chest wall share" and "Pleural pressure baseline" in the Patient card.` },
  { id: 'heartlung', cat: 'Strategy', title: 'Heart–Lung Interaction & PPV', tags: ['heart-lung interaction', 'heart–lung interaction', 'ppv', 'pulse pressure variation', 'hypotension on ventilator', 'venous return'], body: `
Positive pressure raises intrathoracic pressure → less venous return → lower cardiac output and BP.

- Worse with **high PEEP / Pmean**, **auto-PEEP**, **recruitment manoeuvres**, **tension pneumothorax** and [[Hypovolaemia]].
- After intubation hypotension is common: sedation, loss of sympathetic drive and positive pressure together.
- **PPV** – pulse pressure rises and falls with each breath. > 12–13% in a passive patient on Vt ≥ 8 ml/kg with sinus rhythm suggests fluid responsiveness. Unreliable with spontaneous breathing, arrhythmia, small Vt, open chest.
- Right ventricle: high PEEP and hypercapnia raise pulmonary vascular resistance → RV strain in ARDS.

Try it: set Hypovolaemia 60% in the Patient card, then raise PEEP to 15 and watch the Haemodynamics card.` },
  { id: 'drivetests', cat: 'Strategy', title: 'Respiratory Drive & Muscle Tests: P0.1 and NIF', tags: ['p0.1', 'occlusion pressure', 'nif', 'mip', 'respiratory drive', 'muscle strength'], body: `
**P0.1** – the airway is occluded for a moment at the start of a breath; the pressure drop at 100 ms reflects respiratory centre drive (independent of muscle strength or mechanics).
- Normal 1–4 cmH2O. < 1 → low drive / over-sedation / over-assistance. > 4 → high drive, risk of patient self-inflicted lung injury and weaning failure.

**NIF / MIP** – most negative pressure during a 20-second occlusion; measures inspiratory muscle strength.
- Normal adults −60 to −100 cmH2O. Weaker than −20 to −30 cmH2O predicts weaning failure.

Both are in the **Manoeuvres** card; they need a spontaneously breathing patient.` },
  { id: 'peeptrial', cat: 'Strategy', title: 'Recruitment Manoeuvre, PEEP Trial & Low-flow P-V Curve', tags: ['recruitment manoeuvre', 'decremental peep trial', 'peep trial', 'best peep', 'low-flow p-v curve', 'quasi-static p-v curve'], body: `
**Recruitment manoeuvre (RM)** – sustained high pressure (e.g. CPAP 40 cmH2O for 30–40 s) to open collapsed alveoli. Watch for hypotension and barotrauma. The benefit is lost unless PEEP afterwards is high enough.

**Decremental PEEP trial** – after an RM, PEEP is reduced in steps (e.g. 20 → 6 by 2) with a fixed Vt. At each step [[Cstat]] and [[Driving pressure]] are measured. "Best PEEP" = highest compliance (lowest ΔP); set PEEP about 2 cmH2O above it.

**Low-flow P-V curve** – inflation at ≈ 5 L/min removes the resistive pressure, giving a static curve:
- **LIP** – compliance improves (alveoli opening). PEEP is often set just above it.
- **UIP** – curve flattens (overdistension). Keep end-inspiratory pressure below it.

In the simulator, only recruitable lungs (Recruitability > 0 in the Patient card) change with PEEP. Try the ARDS preset.` },

  { id: 'drive', cat: 'Strategy', title: 'Patient Drive, Sedation & Paralysis', tags: ['respiratory drive', 'sedation', 'rass', 'nmb', 'paralysis', 'chemoreflex', 'p-sili'], body: `
In VentLab the patient now **responds** like a real person:

- **Chemoreflex** – low pH / high PaCO2 and low SpO2 raise effort and RR; alkalosis lowers them. Over-ventilating a sedated patient can make him stop triggering (apnoeic threshold).
- **Sedation (RASS)** – deeper sedation lowers drive; at −5 there is no breathing. +1/+2 (agitation, pain) raises drive, HR and BP.
- **Opioids** mainly slow the RR and relieve pain.
- **NMB** removes all effort. Always sedate first – "paralysed but awake" is an emergency.
- **Too much drive** → large Pmus, big transpulmonary swings → [[P-SILI]], [[Double triggering]], [[Flow starvation]]. Fix the cause (acidosis, pain, fever, hypoxia), adjust support, then sedate.

Use the **Sedation & drive** part of the Patient card and the **Treatments** card. The "auto drive" switch turns the chemoreflex on or off.` },
  { id: 'hfnc', cat: 'Modes', title: 'HFNC & ROX Index', tags: ['hfnc', 'high-flow nasal cannula', 'rox index', 'hfno'], body: `
**High-flow nasal cannula** delivers heated, humidified gas at 30–60 L/min.

- **Precise FiO2** – flow higher than the patient's peak inspiratory flow, so no room air is entrained. At low flow and high demand the delivered FiO2 falls.
- **Small PEEP** – about 0.5–1 cmH2O per 10 L/min (mouth closed).
- **Dead-space washout** – flushes CO2 from the nasopharynx, lowering work of breathing.
- No backup breaths – the patient must breathe.

**ROX index** = (SpO2 / FiO2) / RR, checked at 2, 6 and 12 h:
- ≥ 4.88 → likely success
- < 3.85 → high risk of failure – consider NIV or intubation; do not delay intubation.

Select **HFNC** in the Mode & Settings card (the patient must be awake – RASS 0 to −2).` },
  { id: 'procedures', cat: 'Troubleshooting', title: 'Bedside Procedures: Suction, Drain, Prone', tags: ['bedside procedures', 'suction', 'chest drain', 'prone position', 'procedures'], body: `
- **Open suction** – disconnects the circuit: brief desaturation and loss of PEEP → derecruitment. Pre-oxygenate, keep it short, re-recruit afterwards if needed.
- **Closed (in-line) suction** – PEEP kept, less derecruitment; preferred in ARDS.
- **Bronchoscopy** – removes a mucus plug causing lobar collapse.
- **Chest drain** – treats [[Barotrauma|pneumothorax]]; BP and compliance recover.
- **Cuff** – keep 20–30 cmH2O; leak → re-inflate or check tube position.
- **Tube position** – endobronchial tube → withdraw 1–2 cm, confirm air entry / CXR.
- **Prone position** – improves V/Q and shunt in moderate–severe ARDS; effect builds over hours (minutes here). Watch tubes, pressure areas, eyes.

All these are in the **Treatments & Procedures** card; each acts on the simulated patient.` },

  /* TROUBLESHOOTING */
  { id: 'alarms', cat: 'Troubleshooting', title: 'Alarms & Troubleshooting', tags: ['alarms', 'alarm', 'troubleshooting'], body: `
**Always look at the patient first.** If unstable: disconnect and hand-ventilate with 100% O2.

- High pressure → [[High pressure alarm]].
- Low pressure / low Vte → disconnection, [[Leak]], cuff.
- High RR → distress, [[Auto-triggering]], pain.
- Low MV → apnoea, sedation, leak.
- Apnoea → spontaneous mode without drive.

Alarm limits are editable in the Alarms card.` },
  { id: 'dopes', cat: 'Troubleshooting', title: 'DOPES – Sudden Deterioration', tags: ['dopes', 'dope', 'sudden deterioration', 'desaturation'], body: `
- **D**isplacement – tube out / endobronchial.
- **O**bstruction – secretions, kink, biting, plug.
- **P**neumothorax.
- **E**quipment – ventilator, circuit, O2 supply.
- **S**tacking – breath stacking / [[Auto-PEEP]].

Disconnect, bag with 100% O2, check the tube, pass a suction catheter, examine and scan.` },
  { id: 'highpressure', cat: 'Troubleshooting', title: 'High Pressure Alarm: Ppeak vs Pplat', tags: ['high pressure alarm', 'high pressure', 'high peak pressure'], body: `
Do an [[Inspiratory hold]]:

- **Ppeak ↑, Pplat normal** → [[Resistance]]: bronchospasm, secretions, kink, biting, small tube.
- **Ppeak ↑ and Pplat ↑** → [[Compliance]]: pneumothorax, endobronchial tube, ARDS/oedema, atelectasis, abdominal distension, [[Auto-PEEP]].
- Also: coughing, patient fighting the ventilator.` },
  { id: 'leak', cat: 'Troubleshooting', title: 'Leaks (Cuff Leak, BPF)', tags: ['leak', 'leaks', 'cuff leak', 'bpf', 'bronchopleural fistula'], body: `
**Look for:** Vte < Vti, volume curve not returning to zero, loops not closing, low pressure alarm, [[Auto-triggering]].

**Causes:** cuff under-inflated or damaged, tube too high, circuit connections, chest drain with BPF, NIV mask.

**Fix:** check cuff pressure (20–30 cmH2O), tube position, circuit. Pressure modes compensate better than VC.` },
  { id: 'simmodel', cat: 'Troubleshooting', title: 'About this Simulator', tags: ['simulator', 'model', 'about'], body: `
VentLab uses a single-compartment model with the [[Equation of motion]], separate inspiratory and expiratory resistance, optional non-linear compliance (lower and upper inflection points), a patient muscle-pressure generator, leak, and signal artefacts.

Gas exchange uses the alveolar gas equation, a shunt model (shunt falls as mean airway pressure recruits the lung), dead space, CO2 production and the Henderson–Hasselbalch equation. Changes are speeded up (seconds instead of minutes); press **Steady state** in the Blood Gas card to jump to the final values.

It is a **teaching tool**, not a clinical device. Real ventilators have proprietary algorithms, so numbers and shapes are realistic but not identical.

All content here is editable – add your own notes and topics.` }
];

/* Extra glossary-only aliases mapped to topic ids */
const TAG_ALIASES = {
  'pbw': 'vt', 'pressure support': 'psv', 'pressure control': 'pc', 'volume control': 'vc',
  'overdistension': 'stressindex', 'leak': 'leak', 'ards': 'ards', 'time constant': 'tau',
  'flow waveform': 'fwave', 'pressure waveform': 'pwave', 'volume waveform': 'vwave',
  'inspiratory hold': 'holds', 'high pressure alarm': 'highpressure'
};

if (typeof module !== 'undefined') module.exports = { PRESETS, ABNORMALITIES, TOPICS, TAG_ALIASES };
