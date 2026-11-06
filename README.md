# VentLab Ultra – Ventilator Simulator (PWA)

Teaching simulator for mechanical ventilation. Not a clinical device.

## Features
- 13 modes + HFNC/face mask: VC-AC, PC-AC, PRVC (VC+), SIMV-VC, SIMV-PC, PSV, CPAP, Volume Support, TC, PAV+, NIV (S/T), APRV/BiLevel
- Machine profiles: Puritan Bennett 840 & 980, Dräger Evita, Hamilton C-series, GE CARESCAPE R860 – each machine's own names for modes, settings, numerics and keys (PB Rise time %, VMAX, Dräger absolute Pinsp, Hamilton P-ramp…); every name is a tag that opens a detailed bilingual explanation (what it is, when used, if increased, if decreased, usual setting)
- Units: cmH2O ↔ hPa, mmHg ↔ kPa
- Extubation phase: readiness checklist, cuff-leak test, cough test, extubate to face mask / HFNC / NIV, post-extubation course (stridor, fatigue, secretions, heart failure), adrenaline neb / dexamethasone, re-intubation
- Setup wizard (PBW), Vt ml/kg, sigh, max Ti, leak compensation, ATC
- Quick keys: manual breath, O2 100% 2 min, alarm silence & sound, standby
- Haemodynamics (BP, HR, CVP, PPV, arterial waveform), oesophageal pressure / transpulmonary pressure
- Manoeuvres: recruitment, decremental PEEP trial, low-flow P-V curve, P0.1, NIF, simulated SBT
- 8 guided lessons (English & Bangla)
- Living patient: chemoreflex drive, RASS sedation, NMB; drugs (sedative, opioid, NMB, bronchodilator, diuretic, fluid, noradrenaline, antipyretic)
- Procedures: open/closed suction, bronchoscopy, chest drain, cuff, ETT position, prone
- HFNC with delivered FiO2 and ROX index
- Live pressure / flow / volume waveforms, P-V and F-V loops, Pmus (patient effort) overlay
- Insp/Exp hold → Pplat, total PEEP, auto-PEEP, Cstat, Raw, driving pressure, mechanical power
- 37 abnormality & asynchrony scenarios, "Spot the Abnormality" quiz
- Gas exchange: SpO2, PaO2, PaCO2, pH, EtCO2, capnogram, ABG log with automatic interpretation
- Learning library (119 editable topics, English & Bangla) with 186-term glossary; terms auto-link as clickable #tags
- Notes with tags, calculators, saved setups, alarms, trends, ventilator-inside animation
- Draggable / resizable cards, sorting, category filter, 13 themes (incl. Crimson Noir), 11 fonts
- Works offline after first load (service worker)

## Deploy on GitHub Pages
1. Create a repository and upload all files keeping the folders (`css/`, `js/`, `icons/`).
2. Settings → Pages → Deploy from branch → `main` / root.
3. Open the Pages URL in Safari → Share → Add to Home Screen.

Data (notes, edits, layout) is stored in the browser. Use ⋯ → Export backup to move it between devices.
