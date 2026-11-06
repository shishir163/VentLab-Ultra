/* VentLab Ultra — Bengali versions of learning topics (medical terms kept in English). */
'use strict';
const TOPICS_BN = {
  /* BASICS */
  eom: { title: 'Equation of Motion (গতির সমীকরণ)', body: `
এই simulator-এর প্রতিটি waveform একটি মাত্র সমীকরণ থেকে আসে:

**Paw = Flow × R + Volume / C + PEEPtotal − Pmus**

- **Flow × R** – শ্বাসনালি দিয়ে gas ঠেলে নিতে যে pressure লাগে ([[Resistance]])।
- **Volume / C** – ফুসফুস আর বুকের দেয়াল প্রসারিত করতে যে pressure লাগে ([[Compliance]])।
- **PEEPtotal** – সেট করা [[PEEP]] আর তার সঙ্গে যেকোনো [[Auto-PEEP]]।
- **Pmus** – রোগীর নিজের শ্বাসপেশির pressure (রোগী শ্বাস টানলে Paw কমে যায়)।

যখন flow শূন্য থাকে ([[Inspiratory hold|hold]]), resistance-এর অংশ বাদ পড়ে যায়, তখন Paw সমান হয় alveoli-র pressure-এর – এটাই [[Pplat]]।` },
  compliance: { title: 'Compliance (Cstat, Cdyn)', body: `
Compliance = volume-এর পরিবর্তন / pressure-এর পরিবর্তন (ml/cmH2O)।

- **Static (Cstat)** = Vt / ([[Pplat]] − PEEPtotal)। Inspiratory hold লাগে।
- **Dynamic (Cdyn)** = Vt / ([[Ppeak]] − PEEP)। এতে resistance-ও থাকে, তাই সবসময় কম আসে।
- স্বাভাবিক ফুসফুসের ventilated প্রাপ্তবয়স্কে মোটামুটি ৫০–৮০ ml/cmH2O।

Compliance কম হয়: ARDS, pulmonary oedema, fibrosis, pneumothorax, endobronchial tube, স্থূলতা, পেটের ভেতরে বেশি pressure, শক্ত বুকের দেয়াল।

[[P-V loop]]-এ compliance কম হলে loop শুয়ে পড়ে (pressure অক্ষের দিকে হেলে যায়)।` },
  resistance: { title: 'Airway Resistance (Raw)', body: `
Raw = ([[Ppeak]] − [[Pplat]]) / inspiratory flow (L/s); constant-flow volume control-এ মাপা হয়।

- Intubated প্রাপ্তবয়স্কে প্রায় ৫–১৫ cmH2O/L/s (ETT নিজেই অনেকটা বাড়ায়)।
- বেশি Raw: bronchospasm, secretion, বাঁকা বা কামড়ানো tube, ছোট ETT, mucus plug, বন্ধ HME।

লক্ষণ: Ppeak আর Pplat-এর বড় ফারাক, কম peak expiratory flow আর লম্বা লেজ, [[F-V loop]]-এ expiration অংশ ভেতরে বসে যাওয়া।` },
  tau: { title: 'Time Constant (τ)', body: `
τ = R × C (C লিটার/cmH2O এককে)। উদাহরণ: R 10 × C 0.05 = 0.5 সেকেন্ড।

- ১ τ-তে প্রায় ৬৩% volume বের হয়, ৩ τ-তে প্রায় ৯৫%, ৫ τ-তে প্রায় ৯৯%।
- [[Auto-PEEP]] এড়াতে expiratory time অন্তত ৩–৫ τ হওয়া দরকার।
- COPD/asthma: τ লম্বা (R বেশি)। ARDS: τ ছোট (C কম) – তাই বেশি RR সহ্য করতে পারে।

Numerics কার্ডে বর্তমান ফুসফুসের model τ দেখায়।` },
  phasevar: { title: 'Phase Variables (Trigger, Target, Cycle)', body: `
প্রতিটি শ্বাসকে তিনটি জিনিস দিয়ে বোঝানো যায়:

- **Trigger** – কী দিয়ে inspiration শুরু হয়: সময় (মেশিন), flow বা pressure (রোগী)। দেখো [[Trigger]]।
- **Target / limit** – inspiration-এর সময় কী নিয়ন্ত্রিত থাকে: flow/volume (VC) অথবা pressure (PC, PS)।
- **Cycle** – কী দিয়ে inspiration শেষ হয়: সময় (VC, PC), flow (PS – দেখো [[Cycle]]), অথবা pressure (নিরাপত্তা সীমা)।

এই অ্যাপে waveform-এর ওপর শ্বাসের ধরন চিহ্নিত থাকে: **M** mandatory (মেশিন শুরু করে), **A** assisted (রোগী শুরু করে, মেশিন পুরো শ্বাস দেয়), **S** spontaneous (pressure support), **R** release (APRV)।` },
  howvent: { title: 'How a Ventilator Works (ventilator কীভাবে কাজ করে)', body: `
- **Gas-এর উৎস** – উচ্চ pressure-এর air আর oxygen, **blender**-এ মিশে সেট করা FiO2 তৈরি হয়।
- **Inspiratory valve** – microprocessor-নিয়ন্ত্রিত দ্রুত valve; এটা flow (VC) অথবা pressure (PC/PS) গড়ে দেয়।
- **Inspiratory limb → Y-piece → ETT → রোগী**।
- **Expiratory limb → expiratory valve** – inspiration-এর সময় বন্ধ থাকে, তারপর খোলে আর [[PEEP]] ধরে রাখে।
- **Flow আর pressure sensor** প্রতি সেকেন্ডে শতবার মেপে মেশিনকে তথ্য দেয়; trigger-ও এরাই ধরে।
- **Alarm** মাপা মানগুলোকে সেট করা সীমার সঙ্গে তুলনা করে।

"Ventilator Inside" কার্ড খুলে প্রতি শ্বাসে valve-গুলোর খোলা-বন্ধ হওয়া দেখো।` },

  /* PRESSURES */
  ppeak: { title: 'Peak Pressure (Ppeak, PIP)', body: `
Inspiration-এর সময় সর্বোচ্চ airway pressure = resistance-এর অংশ + elastic অংশ + PEEP।

- Ppeak বেশি কিন্তু [[Pplat]] স্বাভাবিক → [[Resistance]]-এর সমস্যা।
- Ppeak আর Pplat দুটোই বেশি → [[Compliance]]-এর সমস্যা।
- শুধু Ppeak দেখে ফুসফুসের ওপর চাপ বোঝা যায় না; Pplat আর [[Driving pressure]] দেখতে হবে।` },
  pplat: { title: 'Plateau Pressure (Pplat)', body: `
Inspiration-এর শেষে [[Inspiratory hold|hold]] (০.৫ সেকেন্ড বা বেশি, flow শূন্য) দিলে যে pressure পাওয়া যায়; রোগী **নিষ্ক্রিয় (passive)** থাকলে। এটা প্রায় alveoli-র pressure।

- লক্ষ্য **৩০ cmH2O-এর মধ্যে** (ফুসফুস রক্ষার জন্য)।
- Hold-এর সময় রোগী নিজে শ্বাস টানলে মান ভুল আসে (Pmus এটাকে কমিয়ে দেয়)।
- এটা দিয়ে static [[Compliance]] আর [[Driving pressure]] হিসাব করা হয়।

এই অ্যাপে: Waveforms কার্ডে **Insp hold** চাপো, অথবা inspiratory pause ০.২ সেকেন্ড বা বেশি দাও।` },
  dp: { title: 'Driving Pressure (ΔP)', body: `
ΔP = [[Pplat]] − PEEPtotal = Vt / Crs।

- এটা tidal volume-কে বাতাসপূর্ণ ("baby") ফুসফুসের আকারের সঙ্গে মিলিয়ে দেখায়।
- ARDS-এ ΔP যত বেশি, মৃত্যুঝুঁকি তত বেশি; লক্ষ্য **১৫ cmH2O-এর মধ্যে**।
- PEEP বাড়ালে ΔP কমলে → recruitment হয়েছে; ΔP বাড়লে → overdistension।` },
  peep: { title: 'PEEP', body: `
শ্বাস ছাড়ার শেষে ventilator যে positive pressure ধরে রাখে।

- Alveoli খোলা রাখে, FRC বাড়ায়, oxygenation ভালো করে, atelectrauma কমায়।
- বেশি হলে: overdistension, dead space বাড়া, হৃৎপিণ্ডে রক্ত ফেরা কমে রক্তচাপ পড়ে যাওয়া।
- PEEP/FiO2 table, [[Driving pressure]], compliance বা [[P-V loop]]-এর inflection point দেখে ঠিক করা হয়।
- Total PEEP = সেট করা PEEP + [[Auto-PEEP]]।` },
  autopeep: { title: 'Auto-PEEP (Intrinsic PEEP)', body: `
ফুসফুস পুরো খালি না হওয়ায় শ্বাস ছাড়ার শেষে alveoli-তে সেট করা PEEP-এর চেয়ে বেশি pressure থেকে যায়।

**চেনার উপায়:** পরের শ্বাসের আগে expiratory flow শূন্যে না ফেরা ([[Flow waveform]]); Pplat ক্রমশ বাড়া; রক্তচাপ কমা।

**মাপা:** নিষ্ক্রিয় রোগীতে **Exp Hold** (০.৫ সেকেন্ড বা বেশি) → total PEEP − সেট PEEP = PEEPi।

**কারণ:** বেশি RR, লম্বা Ti, বড় Vt, বেশি [[Resistance]], লম্বা [[Time constant]]।

**প্রভাব:** barotrauma, রক্তচাপ কমা, [[missed triggers|Ineffective effort]], শ্বাসের পরিশ্রম বাড়া।

**চিকিৎসা:** RR আর Vt কমানো, Ti ছোট করা বা flow বাড়ানো, bronchodilator। রোগী নিজে শ্বাস নিলে PEEPi-এর প্রায় ৮০% পর্যন্ত বাইরের PEEP দিলে trigger করা সহজ হয়।

জরুরি অবস্থায় (খুব বেশি air trapping আর রক্তচাপ পড়ে গেলে): অল্প সময়ের জন্য circuit খুলে রোগীকে শ্বাস বের করে দিতে দাও।` },
  pmean: { title: 'Mean Airway Pressure (Pmean)', body: `
পুরো শ্বাসচক্রের গড় pressure। FiO2-এর সঙ্গে মিলে এটাই oxygenation-এর প্রধান ventilator-নিয়ন্ত্রক।

বাড়ে: PEEP বাড়ালে, Ti লম্বা করলে (inverse ratio), inspiratory pressure বাড়ালে, square pressure আকারে (APRV)।

খুব বেশি হলে: হৃৎপিণ্ডে রক্ত ফেরা কমে, রক্তচাপ পড়ে যায়।` },
  mp: { title: 'Mechanical Power', body: `
প্রতি মিনিটে শ্বাসতন্ত্রে দেওয়া শক্তি (J/min)।

সরল সূত্র (volume control): **MP = 0.098 × RR × Vt(L) × (Ppeak − ½ × ΔP)**

- RR, Vt, pressure আর flow – সবকিছু এক সংখ্যায় আনে।
- প্রায় ১২–১৭ J/min-এর বেশি হলে ফুসফুসের ক্ষতির ঝুঁকির সঙ্গে সম্পর্ক পাওয়া গেছে (গবেষণার পর্যায়ে)।` },
  stressindex: { title: 'Stress Index', body: `
**Constant-flow** VC-তে **নিষ্ক্রিয়** রোগীর pressure–time রেখার আকৃতি:

- **SI < 1** (নিচের দিকে বাঁকা, রেখা চ্যাপ্টা হয়ে আসে) → tidal recruitment, PEEP বাড়ানোর কথা ভাবো।
- **SI ≈ 1** (সরল রেখা) → ভালো।
- **SI > 1** (ওপরের দিকে বাঁকা) → overdistension, Vt বা PEEP কমাও।

[[Overdistension]] আর Derecruitment scenario square flow-এ চালিয়ে দুই আকৃতি দেখো।` },

  /* SETTINGS */
  trigger: { title: 'Trigger (Flow / Pressure)', body: `
Ventilator কীভাবে রোগীর চেষ্টা ধরে।

- **Flow trigger** – রোগীর inspiratory flow যেমন ১–৩ লিটার/মিনিট ছাড়ালে শ্বাস শুরু হয়। বেশি সংবেদনশীল, পরিশ্রম কম।
- **Pressure trigger** – Paw, PEEP-এর চেয়ে যেমন ১–২ cmH2O নামলে শ্বাস শুরু হয়। প্রতিটি triggered শ্বাসের আগে ছোট একটা নিচু খাঁজ দেখা যায়।

খুব সংবেদনশীল হলে → [[Auto-triggering]]। কম সংবেদনশীল হলে বা [[Auto-PEEP]] থাকলে → [[Ineffective effort]]।` },
  cycle: { title: 'Cycle-off (Expiratory Trigger, ETS)', body: `
Pressure support-এ flow যখন তার সর্বোচ্চ মানের একটা নির্দিষ্ট শতাংশে (সাধারণত ২৫%) নেমে আসে, তখন inspiration শেষ হয়।

- **COPD / লম্বা τ:** ৪০–৫০% করো → [[Delayed cycling]] এড়ানো যায়।
- **Restrictive / ছোট τ:** ১০–২০% করো → [[Premature cycling]] এড়ানো যায়।` },
  rise: { title: 'Rise Time (Pressure Ramp)', body: `
PC/PS-এ লক্ষ্য pressure-এ কত দ্রুত পৌঁছায়।

- দ্রুত: শুরুতে বেশি flow, যাদের শ্বাসের তাড়না বেশি তাদের জন্য ভালো; খুব দ্রুত হলে → overshoot spike।
- ধীর: কারও কারও জন্য আরামদায়ক, কিন্তু বেশি চাহিদার রোগীতে flow starvation হতে পারে।

বদলানোর সময় [[Pressure waveform]]-এর শুরুর অংশ খেয়াল করো।` },
  flowpattern: { title: 'Flow Pattern (Square vs Decelerating)', body: `
Volume control-এ:

- **Square (constant)** – peak flow = Vt/Ti। Ppeak বেশি; [[Resistance]] আর [[Stress index]] মাপতে এটাই লাগে।
- **Decelerating** – শুরুতে বেশি flow, তারপর কমে যায়। Ppeak কম, gas ভালোভাবে ছড়ায়, প্রায়ই বেশি আরামদায়ক।

একই Vt-এ Pplat একই থাকে – শুধু resistance-এর অংশ বদলায়।` },
  ie: { title: 'I:E Ratio & Inspiratory Time', body: `
একটি চক্রের সময় = 60 / RR। Te = চক্রের সময় − Ti।

- সাধারণত ১:২। শ্বাসনালি সরু রোগে (obstructive) ১:৩–১:৪ (Te বেশি)।
- Inverse ratio (Ti > Te) [[Mean airway pressure]] বাড়ায়, কিন্তু [[Auto-PEEP]] আর রক্তচাপ পড়ার ঝুঁকি আছে।` },
  pause: { title: 'Inspiratory Pause', body: `
VC-তে inspiration-এর শেষে flow শূন্য রাখার সময়। এতে gas সব জায়গায় ছড়িয়ে পড়ার সুযোগ পায় আর প্রতিটি শ্বাসে [[Pplat]] দেখা যায়। RR আর Ti একই রাখলে এটা Te কমিয়ে দেয়।` },
  vt: { title: 'Tidal Volume & Predicted Body Weight', body: `
Vt ঠিক করো **predicted body weight** দিয়ে, আসল ওজন দিয়ে নয়।

- পুরুষ PBW = 50 + 0.91 × (উচ্চতা cm − 152.4)
- নারী PBW = 45.5 + 0.91 × (উচ্চতা cm − 152.4)

ARDS: ৬ ml/kg PBW (৪–৮)। অন্য বেশিরভাগ রোগী: ৬–৮ ml/kg PBW। Calculators কার্ড ব্যবহার করো।` },
  fio2: { title: 'FiO2 & Oxygenation', body: `
Oxygenation মূলত নির্ভর করে **FiO2** আর [[Mean airway pressure]]-এর (PEEP, Ti) ওপর। Ventilation (CO2) নির্ভর করে **minute ventilation**-এর (RR × Vt) ওপর। দেখো [[Oxygenation vs ventilation]]।

- সাধারণ লক্ষ্য: SpO2 ৯২–৯৬% (দীর্ঘমেয়াদি hypercapnia রোগীতে ৮৮–৯২%)।
- দীর্ঘ সময় বেশি FiO2 দিলে absorption atelectasis আর oxygen toxicity হয় – যত দ্রুত সম্ভব ০.৬-এর নিচে নামাও।
- V/Q mismatch-এ FiO2 অনেক কাজে দেয়, কিন্তু আসল [[Shunt]]-এ খুব কম।

এই simulator-এ FiO2 বদলালে alveolar gas equation আর shunt model দিয়ে PaO2 আর SpO2 বদলায়।` },

  /* MODES */
  breathtypes: { title: 'Breath Types: Mandatory, Assisted, Spontaneous', body: `
- **Mandatory (M)** – মেশিন শুরু করে, মেশিনই শেষ করে।
- **Assisted (A)** – রোগী শুরু করে, তারপর mandatory শ্বাসের মতো পুরোটা দেওয়া হয়।
- **Spontaneous (S)** – রোগী শুরু করে, রোগীই শেষ করে (pressure support)।

দেখো [[Phase variables]]।` },
  vc: { title: 'Volume Control (VC-AC / CMV)', body: `
সেট করতে হয়: RR, Vt, Ti (বা flow), flow pattern, PEEP, FiO2, trigger।

- Vt নিশ্চিত; pressure বদলায় [[Compliance]] আর [[Resistance]] অনুযায়ী।
- রোগীর প্রতিটি চেষ্টায় পুরো সেট করা শ্বাস দেওয়া হয় (A/C) – এতে hyperventilation হতে পারে।
- ঝুঁকি: চাহিদা বেশি হলে [[Flow starvation]]; [[Double triggering]]।
- ফুসফুসের mechanics মাপার জন্য সবচেয়ে ভালো ([[Pplat]], Raw, [[Stress index]])।` },
  pc: { title: 'Pressure Control (PC-AC)', body: `
সেট করতে হয়: RR, inspiratory pressure (PEEP-এর ওপরে), Ti, rise time, PEEP, FiO2।

- Pressure নির্দিষ্ট; Vt বদলায় compliance, resistance আর রোগীর চেষ্টা অনুযায়ী – **Vte নজরে রাখো**।
- Decelerating flow; flow রোগীর চাহিদা মতো বদলায়।
- Inspiration-এর শেষে flow শূন্য না হলে Ti বাড়ালে volume বাড়বে।` },
  prvc: { title: 'PRVC (VC+, Autoflow)', body: `
Pressure control শ্বাস, কিন্তু লক্ষ্য Vt পেতে প্রতি শ্বাসে pressure নিজে থেকে ঠিক হয়।

- প্রথমে একটা পরীক্ষামূলক শ্বাস, তারপর ছোট ছোট ধাপে (প্রায় ±৩ cmH2O) pressure বদলায়।
- Decelerating flow আর volume লক্ষ্য – দুটোই একসঙ্গে।
- সমস্যা: রোগী জোরে টানলে Vt বেড়ে যায়, তখন মেশিন সাহায্য **কমিয়ে** দেয় – কষ্ট আরও বাড়তে পারে।

Numerics কার্ডে "Pinsp (auto)" দেখায়।` },
  simv: { title: 'SIMV', body: `
নির্দিষ্ট সংখ্যক mandatory শ্বাস (VC বা PC), রোগীর চেষ্টার সঙ্গে মিলিয়ে (synchronised)। মাঝের সময়ে রোগী নিজে শ্বাস নেয়, সাধারণত [[Pressure support]] সহ।

- রোগী নির্দিষ্ট "window"-এর মধ্যে trigger করলে mandatory শ্বাস তখনই দেওয়া হয়; না করলে মেশিন সময়মতো দেয়।
- PSV বা SBT-এর চেয়ে ভালো weaning mode নয়; মিশ্র ধরনের শ্বাসে পরিশ্রম বাড়তে পারে।` },
  psv: { title: 'Pressure Support (PSV)', body: `
প্রতিটি শ্বাস রোগী শুরু করে, মেশিন pressure দিয়ে সাহায্য করে, আর flow কমলে শ্বাস শেষ হয় ([[Cycle]])।

- সেট করতে হয়: PS, PEEP, rise time, cycle %, trigger, FiO2।
- নির্দিষ্ট RR নেই – রোগীর শ্বাসের তাড়না (drive) থাকতে হবে। Apnoea backup অবশ্যই দরকার।
- Weaning আর আরামদায়ক নিজস্ব শ্বাসের জন্য ব্যবহার হয়।

[[Premature cycling]] আর [[Delayed cycling]]-এর দিকে খেয়াল রাখো।` },
  cpap: { title: 'CPAP', body: `
পুরো শ্বাসচক্রে একই pressure; শ্বাসের সব কাজ রোগী নিজে করে। এটা PS = 0 দেওয়া PSV-এর মতোই। SBT-তে আর NIV হিসেবে OSA, pulmonary oedema-তে ব্যবহার হয়। Bilevel NIV-এর জন্য দেখো [[NIV]]।` },
  aprv: { title: 'APRV / BiLevel', body: `
দুটি pressure স্তর (Phigh, Plow), সময় ধরে (Thigh, Tlow) পালাক্রমে চলে। দুই স্তরেই রোগী নিজে স্বাধীনভাবে শ্বাস নিতে পারে।

- APRV: লম্বা Thigh (৪–৬ সেকেন্ড), খুব ছোট Tlow (০.২–০.৮ সেকেন্ড), Plow প্রায়ই ০।
- **Tlow** এমনভাবে ঠিক করা হয় যেন expiratory flow তার সর্বোচ্চ মানের প্রায় ৫০–৭৫%-এ থাকতেই থেমে যায় – এতে ভেতরে কিছু PEEP থেকে যায় আর alveoli চুপসে যায় না।
- Oxygenation-এর জন্য বেশি [[Mean airway pressure]]; রোগীর নিজের শ্বাস V/Q মিল ভালো করে।
- BiLevel-এ Thigh ছোট আর Tlow বড় হয়।

Numerics কার্ডে "Termination % PEFR" দেখায়।` },
  nava: { title: 'NAVA (ধারণা)', body: `
বিশেষ nasogastric catheter দিয়ে ডায়াফ্রামের বৈদ্যুতিক সংকেত (Edi) মাপা হয়। সাহায্য = NAVA level × Edi, তাই শ্বাসের সময় আর আকার রোগীর নিজের স্নায়ুর সংকেত অনুসরণ করে।

Asynchrony কমায়। এখানে বিস্তারিত simulate করা হয়নি – এই algorithm-এর জন্য Edi সংকেত দরকার।` },
  asv: { title: 'ASV / IntelliVent (ধারণা)', body: `
Closed-loop mode: চিকিৎসক minute volume-এর একটা শতাংশ সেট করেন; ventilator নিজেই RR আর Vt বেছে নেয় (Otis-এর ন্যূনতম পরিশ্রম নীতি) আর প্রতি শ্বাসে pressure ঠিক করে।

কোম্পানির নিজস্ব algorithm – এখানে শুধু নীতিটা ব্যাখ্যা করা হয়েছে।` },
  pav: { title: 'PAV+ (ধারণা)', body: `
রোগীর চেষ্টার অনুপাতে সাহায্য: ventilator R আর C মেপে শ্বাসের পরিশ্রমের একটা নির্দিষ্ট অংশ নিজে বহন করে। রোগী বেশি চেষ্টা করলে বেশি সাহায্য পায়। মাপা যায় এমন mechanics আর অটুট শ্বাসের তাড়না দরকার।` },

  /* GRAPHICS */
  waveforms: { title: 'Reading Ventilator Waveforms (waveform পড়া)', body: `
সময়ের সঙ্গে তিনটি রেখা:

- [[Pressure waveform]] – ventilator কী করছে আর কতটা পরিশ্রম লাগছে।
- [[Flow waveform]] – trigger, cycling, auto-PEEP, secretion বোঝার জন্য সবচেয়ে ভালো।
- [[Volume waveform]] – leak, Vt ঠিকমতো যাচ্ছে কি না।

এই ক্রমে পড়ো: mode ও শ্বাসের ধরন → inspiration-এর আকৃতি → expiration → baseline → loop। রোগীর চেষ্টা দেখতে **Pmus** রেখা চালু করো।` },
  pwave: { title: 'Pressure–Time Waveform', body: `
- VC: ঢাল বেয়ে Ppeak-এ ওঠে; pause থাকলে [[Pplat]]-এ নেমে আসে।
- PC/PS: লক্ষ্য pressure-এ চৌকো আকৃতি।
- শ্বাসের আগে PEEP-এর নিচে খাঁজ = রোগীর trigger (pressure trigger)।
- VC-তে inspiration অংশ ভেতরে বসে গেলে = [[Flow starvation]]।
- PS শ্বাসের শেষে হঠাৎ উঁচু spike = [[Delayed cycling]]।
- Constant flow-এ ওপরে বা নিচে বাঁকা = [[Stress index]]।` },
  fwave: { title: 'Flow–Time Waveform', body: `
Inspiratory flow শূন্যের ওপরে, expiratory flow নিচে।

- Expiratory flow শূন্যে না ফেরা → [[Auto-PEEP]]।
- শ্বাস ছাড়া expiration-এর মধ্যে উঁচু ঢিবি → [[Ineffective effort]]।
- করাতের দাঁতের মতো (saw-tooth) → secretion / পানি।
- PC-তে inspiratory flow শূন্যে না পৌঁছানো → Ti খুব ছোট।
- কম peak আর লম্বা expiratory লেজ → বেশি [[Resistance]]।` },
  vwave: { title: 'Volume–Time Waveform', body: `
Inspiration-এ volume বাড়ে, expiration-এ শূন্যে ফিরে আসে।

- Baseline-এ না ফিরে পরের শ্বাসে সোজা নিচে নেমে যাওয়া → [[Leak]] অথবা air trapping।
- একটার ওপর আরেকটা volume জমা হওয়া → [[Double triggering]]।` },
  pvloop: { title: 'Pressure–Volume (P-V) Loop', body: `
x-অক্ষে pressure, y-অক্ষে volume।

- Mandatory শ্বাসের loop ঘড়ির কাঁটার **উল্টো দিকে** ঘোরে; রোগীর নিজের চেষ্টার অংশ (PEEP-এর বাঁয়ে) ঘড়ির কাঁটার দিকে।
- Loop-এর ঢাল = [[Compliance]]: যত শোয়া loop, ফুসফুস তত শক্ত।
- প্রস্থ (hysteresis) = resistance + recruitment।
- **Lower inflection point** – যেখানে ঢাল হঠাৎ বেড়ে যায়: alveoli খুলছে → [[PEEP]] এর ওপরে রাখো।
- ওপরে **ঠোঁটের মতো beak** – [[Overdistension]]।
- Loop বন্ধ না হওয়া → [[Leak]]।

পরিবর্তনের আগে-পরে তুলনা করতে "Save reference" ব্যবহার করো।` },
  fvloop: { title: 'Flow–Volume (F-V) Loop', body: `
x-অক্ষে volume, y-অক্ষে flow (এই অ্যাপে inspiration ওপরে, expiration নিচে)।

- Expiration অংশ ভেতরে বসে যাওয়া (scooped) → শ্বাসনালি সরু / bronchospasm।
- Expiration অংশ শূন্য flow-তে না পৌঁছানো → [[Auto-PEEP]]।
- করাতের দাঁত → secretion।
- Loop বন্ধ না হওয়া → [[Leak]]।
- Bronchodilator-এর পরে উন্নতি: peak expiratory flow বাড়ে, বসে যাওয়া কমে।` },
  holds: { title: 'Hold Manoeuvres (Insp / Exp Hold)', body: `
দুটোর জন্যই রোগীকে **নিষ্ক্রিয় (passive)** থাকতে হবে।

- **Inspiratory hold** (inspiration-এর শেষে, ০.৫–২ সেকেন্ড) → [[Pplat]] → static compliance, driving pressure, Raw।
- **Expiratory hold** (expiration-এর শেষে, ০.৫–২ সেকেন্ড) → total PEEP → [[Auto-PEEP]]।

এই অ্যাপে: বোতাম Waveforms কার্ডে; ফলাফল Numerics কার্ডে।` },

  /* ASYNCHRONY */
  asynchrony: { title: 'Patient–Ventilator Asynchrony (সংক্ষেপে)', body: `
রোগীর নিজের শ্বাসের সঙ্গে ventilator-এর অমিল।

- **Trigger-এর অমিল:** [[Ineffective effort]], [[Auto-triggering]], [[Double triggering]], [[Reverse triggering]]।
- **Flow-এর অমিল:** [[Flow starvation]], অতিরিক্ত flow।
- **Cycle-এর অমিল:** [[Premature cycling]], [[Delayed cycling]]।

Asynchrony index ১০%-এর বেশি হলে ventilation-এর সময় লম্বা হয়। আগে রোগীকে দেখো, তারপর Pmus রেখা চালু রেখে [[Flow waveform]] দেখো।` },
  ineffective: { title: 'Ineffective Effort (missed trigger)', body: `
রোগী শ্বাস নেওয়ার চেষ্টা করে, কিন্তু মেশিন কোনো শ্বাস দেয় না।

**খোঁজো:** expiration-এর মধ্যে flow শূন্যের দিকে উঠে আসা একটা ঢিবি আর ছোট pressure খাঁজ, কিন্তু শ্বাস নেই।

**সাধারণ কারণ:** [[Auto-PEEP]] (রোগীকে আগে PEEPi পার হতে হয়), অথবা অতিরিক্ত সাহায্য / দুর্বল পেশি।

**সমাধান:** auto-PEEP কমাও, বাইরের PEEP দাও, trigger ঠিক করো, অতিরিক্ত support কমাও।` },
  autotrigger: { title: 'Auto-triggering', body: `
রোগীর চেষ্টা ছাড়াই অন্য কিছুতে শ্বাস শুরু হয়ে যাওয়া: [[Leak]], হৃৎস্পন্দনের ঢেউ, circuit-এ পানি, খুব সংবেদনশীল [[Trigger]]।

**খোঁজো:** প্রত্যাশার চেয়ে বেশি RR, কোনো pressure খাঁজ বা Pmus ছাড়াই triggered শ্বাস।

**সমাধান:** trigger কম সংবেদনশীল করো, leak ঠিক করো, পানি ফেলে দাও।` },
  doubletrigger: { title: 'Double Triggering', body: `
রোগীর একটি চেষ্টায় দুটি শ্বাস, কারণ রোগীর স্নায়বিক Ti মেশিনের Ti-এর চেয়ে লম্বা।

**খোঁজো:** খুব কাছাকাছি দুটি inspiration, মাঝে প্রায় শ্বাস ছাড়া নেই – volume জমতে থাকে।

**সমাধান:** Ti লম্বা করো, নিরাপদ হলে Vt বাড়াও, VC-র বদলে PC/PSV, বেশি শ্বাসের তাড়নার কারণ চিকিৎসা করো।` },
  reversetrigger: { title: 'Reverse Triggering', body: `
মেশিনের শ্বাসই পরে ডায়াফ্রামের সংকোচন ঘটায় (entrainment)। চেষ্টা শুরু হয় inspiration শুরু হওয়ার **পরে**।

গভীর sedation আর ARDS-এ বেশি দেখা যায়। Breath stacking আর ফুসফুসে বেশি চাপ তৈরি করতে পারে।

**সমাধান:** sedation, RR/Ti ঠিক করো; severe ARDS-এ neuromuscular blockade বিবেচনা করো।` },
  flowstarvation: { title: 'Flow Starvation', body: `
রোগী ventilator-এর দেওয়া flow-এর চেয়ে বেশি চায় (সাধারণত নির্দিষ্ট flow-এর VC-তে)।

**খোঁজো:** inspiratory pressure রেখা ভেতরের দিকে বসে যাওয়া, কখনো PEEP-এর নিচে নেমে যাওয়া।

**সমাধান:** flow বাড়াও বা Ti ছোট করো, decelerating pattern, PC/PSV-তে যাও, তাড়নার কারণ চিকিৎসা করো।` },
  prematurecycle: { title: 'Premature Cycling', body: `
রোগী তখনো শ্বাস নিচ্ছে, অথচ মেশিনের শ্বাস শেষ হয়ে যায়।

**খোঁজো:** cycling-এর পরে expiratory flow আবার শূন্য বা ওপরের দিকে ফিরে আসে; প্রায়ই [[Double triggering|double trigger]] হয়।

**সমাধান:** cycle-off % কমাও, Ti লম্বা করো (PC), PS বাড়াও।` },
  delayedcycle: { title: 'Delayed Cycling', body: `
রোগী শ্বাস ছাড়া শুরু করার পরেও মেশিনের শ্বাস চলতে থাকে।

**খোঁজো:** inspiration-এর শেষে হঠাৎ pressure spike (রোগী মেশিনের বিরুদ্ধে ঠেলে); expiratory পেশি সক্রিয়।

**বেশি দেখা যায়** COPD-তে (τ লম্বা – flow ধীরে কমে)।

**সমাধান:** cycle-off % বাড়াও (৪০–৫০%), PS কমাও।` },

  /* STRATEGY */
  ards: { title: 'Lung-Protective Ventilation (ARDS)', body: `
- Vt **৬ ml/kg [[PBW]]** (৪–৮)।
- [[Pplat]] **৩০-এর মধ্যে**, [[Driving pressure]] **১৫ cmH2O-এর মধ্যে**।
- [[PEEP]] PEEP/FiO2 table বা রোগী অনুযায়ী titration করে।
- P/F ১৫০-এর নিচে হলে দিনে ১২–১৬ ঘণ্টা বা বেশি prone position।
- Severe ARDS-এ শুরুতেই neuromuscular blockade বিবেচনা; অবস্থা স্থির হলে fluid কম রাখা।
- Permissive hypercapnia (pH ৭.২০–৭.২৫ বা বেশি) মেনে নেওয়া যায়।` },
  obstructive: { title: 'Ventilating Asthma / COPD', body: `
প্রধান বিপদ: [[Auto-PEEP]]।

- কম RR (১০–১৪), Vt ৬–৮ ml/kg PBW।
- বেশি inspiratory flow (৬০–৮০ লিটার/মিনিট) দিয়ে Ti ছোট রাখো; I:E ১:৩–১:৪ বা আরও বেশি।
- Permissive hypercapnia।
- Pplat আর PEEPi (exp hold) নজরে রাখো; PSV-তে cycle-off % বাড়াও।
- Bronchospasm-এর জোরালো চিকিৎসা করো।` },
  recruitment: { title: 'Recruitment & PEEP Titration', body: `
Recruitment = অল্প সময়ের জন্য pressure বাড়িয়ে চুপসে যাওয়া alveoli আবার খোলা।

PEEP titration-এর উপায়: PEEP/FiO2 table, সবচেয়ে ভালো compliance / সবচেয়ে কম [[Driving pressure]] (decremental trial), [[Stress index]], P-V loop-এর lower inflection point, oesophageal pressure, EIT।

উচ্চ pressure-এর দীর্ঘ recruitment manoeuvre এখন নিয়মিত পরামর্শ দেওয়া হয় না; রক্তচাপ কমা আর barotrauma-র দিকে নজর রাখো।` },
  weaning: { title: 'Weaning, SBT & RSBI', body: `
**প্রস্তুত কি না:** মূল কারণ সেরে উঠছে, FiO2 ০.৪–০.৫ বা কম, PEEP ৫–৮ বা কম, রক্তসঞ্চালন স্থির, সজাগ ও সহযোগিতা করছে, কাশি দিতে পারে।

**SBT:** ৩০–১২০ মিনিট PS ৫–৮ / PEEP ৫, CPAP বা T-piece-এ।

**RSBI** = RR / Vt (লিটারে)। **১০৫-এর নিচে** হলে সফল হওয়ার সম্ভাবনা বেশি।

ব্যর্থতার লক্ষণ: RR ৩৫-এর বেশি, SpO2 ৯০%-এর নিচে, নাড়ি দ্রুত, রক্তচাপ বেশি, কষ্ট, ঘাম।

**Manoeuvres** কার্ডে simulate করা SBT চালাও; [[P0.1]] আর [[NIF]]-ও দেখো।` },
  co2: { title: 'Adjusting PaCO2 & Minute Ventilation', body: `
Minute ventilation = RR × Vt। PaCO2 alveolar ventilation-এর বিপরীত অনুপাতে চলে।

**নতুন RR = বর্তমান RR × বর্তমান PaCO2 / লক্ষ্য PaCO2** (Vt একই রেখে)।

RR বাড়ানোর সময় Te খেয়াল করো – [[Auto-PEEP]] হলে CO2 উল্টো বাড়তে পারে।` },
  pf: { title: 'P/F Ratio & ARDS Severity', body: `
P/F = PaO2 (mmHg) / FiO2 (ভগ্নাংশ), PEEP ৫ বা বেশি অবস্থায়:

- Mild ২০০–৩০০
- Moderate ১০০–২০০
- Severe ১০০ বা কম` },

  /* GAS EXCHANGE */
  gasex: { title: 'Oxygenation vs Ventilation', body: `
দুটি আলাদা কাজ, আলাদা setting দিয়ে নিয়ন্ত্রিত:

- **Oxygenation** (PaO2, SpO2) ← FiO2 আর [[Mean airway pressure]] (PEEP, Ti, Pinsp)। সীমাবদ্ধ করে [[Shunt]] আর V/Q mismatch।
- **Ventilation** (PaCO2, pH) ← alveolar ventilation = RR × (Vt − dead space)। সীমাবদ্ধ করে [[Dead space]] আর [[Auto-PEEP]]।

সহজ নিয়ম: SpO2 কম → FiO2 / PEEP ভাবো; PaCO2 বেশি → RR / Vt ভাবো।` },
  alvgas: { title: 'Alveolar Gas Equation & A–a Gradient', body: `
**PAO2 = FiO2 × (Patm − PH2O) − PaCO2 / RQ**

সমুদ্রপৃষ্ঠে: PAO2 = FiO2 × 713 − PaCO2 / 0.8।

- উদাহরণ: FiO2 0.21, PaCO2 40 → PAO2 ≈ 150 − 50 = 100 mmHg।
- **A–a gradient** = PAO2 − PaO2। সাধারণ বাতাসে স্বাভাবিক ≈ (বয়স / ৪) + ৪ mmHg।
- A–a gradient বেশি: shunt, V/Q mismatch, diffusion-এর সমস্যা।
- Hypoxaemia আছে কিন্তু A–a gradient স্বাভাবিক: hypoventilation বা কম FiO2।` },
  shunt: { title: 'Shunt & Iso-shunt', body: `
**Shunt** = যে রক্ত ফুসফুস দিয়ে যায় কিন্তু বাতাসপূর্ণ alveoli-র সংস্পর্শে আসে না (চুপসে যাওয়া, consolidation, oedema)।

- স্বাভাবিক physiological shunt প্রায় ২–৫%।
- Shunt ৩০%-এর বেশি হলে FiO2 বাড়িয়েও PaO2 প্রায় বাড়ে না (iso-shunt রেখা চ্যাপ্টা হয়ে যায়)।
- **চিকিৎসা হলো recruitment:** PEEP, লম্বা Ti, prone position – শুধু oxygen নয়।
- **V/Q mismatch** (বাতাস কম কিন্তু শূন্য নয়) FiO2-এ ভালো সাড়া দেয়।

"Refractory hypoxaemia" scenario চালিয়ে FiO2 ১০০% আর PEEP ১৪ তুলনা করে দেখো।` },
  deadspace: { title: 'Dead Space (VD/VT)', body: `
যে অংশে বাতাস যায় কিন্তু gas বিনিময় হয় না।

- **Anatomical** – শ্বাসনালি, ETT, Y-এর পরের circuit (প্রায় ১৫০ ml / ২ ml/kg)।
- **Alveolar** – বাতাস আছে কিন্তু রক্তপ্রবাহ নেই এমন alveoli (PE, কম cardiac output, overdistension)।
- **Physiological** = anatomical + alveolar। স্বাভাবিক VD/VT প্রায় ০.৩; ARDS-এ প্রায়ই ০.৫-এর বেশি (খারাপ পূর্বাভাস)।

**Bohr–Enghoff:** VD/VT = (PaCO2 − PECO2) / PaCO2।

PaCO2 আর EtCO2-এর বড় ফারাক হলো alveolar dead space বাড়ার সহজ লক্ষণ। ছোট Vt আর বেশি RR-এ ventilation-এর বেশি অংশ dead space-এ নষ্ট হয়।` },
  odc: { title: 'Oxyhaemoglobin Dissociation Curve', body: `
PaO2 আর SaO2-এর S-আকৃতির সম্পর্ক।

- PaO2 ৬০ mmHg ≈ SpO2 ৯০% (খাড়া অংশের শুরু – বিপদসীমা)।
- PaO2 ৪০ ≈ SpO2 ৭৫% (mixed venous)। P50 প্রায় ২৭ mmHg।
- প্রায় ১০০ mmHg-এর ওপরে রেখা চ্যাপ্টা: PaO2 আরও বাড়ালেও oxygen-এর পরিমাণ প্রায় বাড়ে না।
- **ডানে সরে যায়** (oxygen ছাড়ে বেশি): তাপমাত্রা বাড়া, CO2 বাড়া, acidosis, 2,3-DPG বাড়া।
- **বাঁয়ে সরে:** উল্টো অবস্থায়, আর carbon monoxide, fetal Hb-তে।

O2 content = 1.34 × Hb × SaO2 + 0.003 × PaO2।` },
  capno: { title: 'Capnography (EtCO2 waveform)', body: `
শ্বাসের সময় airway-তে CO2 মাপা।

- **Phase I** – dead space-এর gas, CO2 প্রায় ০।
- **Phase II** – দ্রুত বেড়ে ওঠা (dead space আর alveoli-র gas মিশে যাওয়া)।
- **Phase III** – alveolar plateau; এর শেষের মানটাই **EtCO2**।
- **Phase 0** – inspiration, CO2 শূন্যে নেমে যায়।

স্বাভাবিক EtCO2 ৩৫–৪৫ mmHg, সাধারণত PaCO2-এর চেয়ে ২–৫ কম।

- **Shark fin** – phase II ধীর, phase III খাড়া: bronchospasm / COPD।
- **Curare cleft** – plateau-তে খাঁজ: রোগীর নিজের চেষ্টা।
- **হঠাৎ শূন্য** – circuit খুলে যাওয়া, oesophagus-এ tube, পুরো বন্ধ হয়ে যাওয়া।
- **ধীরে কমে যাওয়া** – hyperventilation, cardiac output কমা, PE।
- **Baseline ওপরে ওঠা** – rebreathing (absorber শেষ, valve-এর ত্রুটি)।

Waveforms কার্ডে **CO2** অংশটা চালু করো।` },
  abg: { title: 'ABG Interpretation (ধাপে ধাপে)', body: `
১. **pH** – ৭.৩৫-এর নিচে acidaemia, ৭.৪৫-এর ওপরে alkalaemia।
২. **মূল প্রক্রিয়া** – PaCO2 ৪৫-এর বেশি respiratory acidosis, ৩৫-এর কম alkalosis; HCO3 ২২-এর কম metabolic acidosis, ২৬-এর বেশি alkalosis।
৩. **Compensation**
- Metabolic acidosis: প্রত্যাশিত PaCO2 = 1.5 × HCO3 + 8 (± ২) (Winter's সূত্র)।
- Acute respiratory acidosis: PaCO2 প্রতি ১০ বাড়লে HCO3 ১ বাড়ে; chronic-এ ৩.৫ বাড়ে।
৪. **Anion gap** = Na − (Cl + HCO3), স্বাভাবিক প্রায় ৮–১২।
৫. **Oxygenation** – PaO2, [[P/F ratio]], A–a gradient।

স্বাভাবিক মান: pH ৭.৩৫–৭.৪৫, PaCO2 ৩৫–৪৫ mmHg, HCO3 ২২–২৬ mmol/L, সাধারণ বাতাসে PaO2 ৮০–১০০ mmHg।

Blood Gas কার্ডে simulate করা gas-এর স্বয়ংক্রিয় ব্যাখ্যা দেখায়।` },
  hypox: { title: 'Hypoxaemia on the Ventilator – করণীয়', body: `
১. **আগে রোগীকে দেখো**; অবস্থা খুব খারাপ হলে – ১০০% O2, হাতে bag দিয়ে ventilation, [[DOPES]]।
২. Probe, waveform, tube-এর অবস্থান, circuit পরীক্ষা করো।
৩. **FiO2 বাড়াও** (তাৎক্ষণিক সমাধান)।
৪. Recruit করা গেলে **PEEP / Pmean বাড়াও** (ARDS, atelectasis, স্থূলতা)।
৫. কারণের চিকিৎসা: secretion (suction), pneumothorax, effusion, oedema (diuretic), bronchospasm।
৬. তবুও না সারলে: prone, NMB, recruitment, ECMO-র জন্য পাঠানোর কথা ভাবো।

মনে রাখো: [[Shunt]]-জনিত hypoxaemia FiO2-এর চেয়ে PEEP-এ বেশি সাড়া দেয়।` },
  hypercap: { title: 'Hypercapnia on the Ventilator – করণীয়', body: `
১. Minute ventilation কি কম? (apnoea, leak, কম RR/Vt, PSV-তে দুর্বল চেষ্টা)
২. Dead space কি বেশি? (PaCO2 আর EtCO2-এর বড় ফারাক, PE, কম cardiac output, overdistension, ছোট Vt আর লম্বা circuit)
৩. CO2 তৈরি কি বেশি? (জ্বর, sepsis, অতিরিক্ত খাবার, কাঁপুনি)
৪. [[Auto-PEEP]] আছে কি? (তখন RR বাড়ালে উল্টো খারাপ হতে পারে)

**সমাধান:** RR বাড়াও (Te খেয়াল রেখে) অথবা Vt বাড়াও (Pplat খেয়াল রেখে), বাড়তি dead space সরাও, কারণের চিকিৎসা করো। ARDS আর asthma-য় [[Permissive hypercapnia]] (pH ৭.২ বা বেশি) মেনে নেওয়া যায়।` },

  /* ADVANCED */
  vsniv: { title: 'Volume Support & NIV', body: `
**Volume Support (VS)** – PSV-এর মতো spontaneous mode, কিন্তু লক্ষ্য Vt পেতে প্রতি শ্বাসে সাহায্যের মাত্রা (প্রায় ±৩ cmH2O) নিজে বদলায়। Weaning-এ কাজে লাগে; রোগী নিজে বড় শ্বাস নিলে সাহায্য আপনা থেকেই কমে যায়। রোগীর শ্বাসের তাড়না আর apnoea backup দরকার।

**NIV (bilevel, S/T)** – tube ছাড়া mask দিয়ে ventilation:
- **IPAP** = inspiration-এর pressure, **EPAP** = expiration-এর pressure (PEEP-এর মতো)। Pressure support = IPAP − EPAP।
- রোগী শ্বাস বন্ধ করলে **backup rate** নির্দিষ্ট সময় পরপর শ্বাস দেয় (S/T mode)।
- Mask-এ সবসময় কিছু leak থাকে; [[Leak compensation]] না থাকলে এটা [[Auto-triggering]] ঘটায়।
- ব্যবহার: acidosis-সহ COPD exacerbation, cardiogenic pulmonary oedema, ঝুঁকিপূর্ণ রোগীতে extubation-এর পরে সহায়তা।
- সাধারণ শুরু: IPAP ১০–১২, EPAP ৪–৫; লক্ষ্যে পৌঁছাতে কয়েক মিনিট পরপর IPAP ২ করে বাড়ানো।` },
  advset: { title: 'Advanced Settings: Sigh, Max Ti, Leak Compensation, ATC', body: `
- **Sigh** – প্রতি N শ্বাস পরপর একটা বড় শ্বাস (এখানে VC-তে ১.৫ × Vt, pressure mode-এ +৮ cmH2O)। চুপসে যাওয়া alveoli খুলতে পারে; Pplat খেয়াল রাখো।
- **Max Ti (PS)** – যে spontaneous শ্বাস কখনো cycle সীমায় পৌঁছায় না (বড় leak, COPD), তার নিরাপত্তা সীমা। সাধারণত ১.৫–২ সেকেন্ড।
- **Leak compensation** – trigger ধরার আগে স্থায়ী leak বাদ দেওয়া হয়। বন্ধ থাকলে leak থেকে [[Auto-triggering]] হয়।
- **ATC** – tube-এর মাপ থেকে ventilator tube-এর resistance হিসাব করে, আর নিজে শ্বাস নেওয়ার সময় pressure = R(tube) × flow যোগ করে; রোগী এমনভাবে শ্বাস নেয় যেন tube নেই। SBT-তে কাজে লাগে; ছোট tube-এর resistance অনেক বেশি (৬.৫ mm ≈ ৯, ৮.০ mm ≈ ৪ cmH2O/L/s)।` },
  pes: { title: 'Oesophageal Pressure & Transpulmonary Pressure', body: `
নিচের oesophagus-এ রাখা balloon **Pes মাপে ≈ pleural pressure**।

- **Transpulmonary pressure (PL) = Paw − Pes** – এই pressure-ই আসলে ফুসফুসকে টানে।
- **End-expiratory PL** = total PEEP − Pes(exp)। Negative হলে alveoli চুপসে যায়; PEEP এমনভাবে ঠিক করো যেন এটা প্রায় ০ থেকে +৫ cmH2O থাকে।
- **End-inspiratory PL** = Pplat − Pes(insp)। অতিরিক্ত টান এড়াতে ২০–২৫ cmH2O-এর নিচে রাখো।
- স্থূলতা আর পেটের ভেতরে বেশি pressure থাকলে [[Chest wall]] শক্ত হয়: Pplat বেশি দেখালেও ফুসফুসের ওপর চাপ গ্রহণযোগ্য হতে পারে, আর প্রায়ই বেশি PEEP লাগে।
- রোগী নিজে শ্বাস নিলে Pes-এর ওঠানামা থেকে তার চেষ্টা বোঝা যায় (যত বেশি negative, তত বেশি পরিশ্রম)।

Waveforms কার্ডে **Pes** অংশ চালু করো, আর Patient কার্ডে "Chest wall share" ও "Pleural pressure baseline" বদলে দেখো।` },
  heartlung: { title: 'Heart–Lung Interaction & PPV', body: `
Positive pressure বুকের ভেতরের pressure বাড়ায় → হৃৎপিণ্ডে রক্ত ফেরা কমে → cardiac output আর রক্তচাপ কমে।

- আরও খারাপ হয় **বেশি PEEP / Pmean**, **auto-PEEP**, **recruitment manoeuvre**, **tension pneumothorax** আর [[Hypovolaemia]]-তে।
- Intubation-এর পরে রক্তচাপ পড়া খুব সাধারণ: sedation, sympathetic তাড়না কমে যাওয়া আর positive pressure – সব একসঙ্গে।
- **PPV** – প্রতি শ্বাসে pulse pressure ওঠানামা করে। Passive রোগী, Vt ৮ ml/kg বা বেশি আর sinus rhythm থাকলে ১২–১৩%-এর বেশি হলে fluid দিলে উপকার হওয়ার সম্ভাবনা। রোগী নিজে শ্বাস নিলে, arrhythmia, ছোট Vt বা খোলা বুকে এটা নির্ভরযোগ্য নয়।
- ডান ventricle: বেশি PEEP আর hypercapnia pulmonary vascular resistance বাড়ায় → ARDS-এ RV-এর ওপর চাপ।

চেষ্টা করো: Patient কার্ডে Hypovolaemia ৬০% দাও, তারপর PEEP ১৫ করে Haemodynamics কার্ড দেখো।` },
  drivetests: { title: 'Respiratory Drive & Muscle Tests: P0.1 and NIF', body: `
**P0.1** – শ্বাসের শুরুতে মুহূর্তের জন্য airway বন্ধ রাখা হয়; ১০০ মিলিসেকেন্ডে pressure কতটা নামে তা থেকে শ্বাসকেন্দ্রের তাড়না বোঝা যায় (পেশির শক্তি বা ফুসফুসের অবস্থার ওপর নির্ভর করে না)।
- স্বাভাবিক ১–৪ cmH2O। ১-এর কম → তাড়না কম / অতিরিক্ত sedation / অতিরিক্ত সাহায্য। ৪-এর বেশি → তাড়না বেশি, রোগীর নিজের চেষ্টায় ফুসফুসের ক্ষতি আর weaning ব্যর্থ হওয়ার ঝুঁকি।

**NIF / MIP** – ২০ সেকেন্ড airway বন্ধ রেখে সর্বোচ্চ negative pressure; শ্বাসপেশির শক্তি মাপে।
- সুস্থ প্রাপ্তবয়স্কে −৬০ থেকে −১০০ cmH2O। −২০ থেকে −৩০ cmH2O-এর চেয়ে দুর্বল হলে weaning ব্যর্থ হওয়ার সম্ভাবনা।

দুটোই **Manoeuvres** কার্ডে আছে; রোগীর নিজের শ্বাস থাকা দরকার।` },
  peeptrial: { title: 'Recruitment Manoeuvre, PEEP Trial & Low-flow P-V Curve', body: `
**Recruitment manoeuvre (RM)** – চুপসে যাওয়া alveoli খুলতে একটানা বেশি pressure (যেমন CPAP ৪০ cmH2O, ৩০–৪০ সেকেন্ড)। রক্তচাপ পড়া আর barotrauma-র দিকে খেয়াল রাখো। পরে PEEP যথেষ্ট না হলে উপকার হারিয়ে যায়।

**Decremental PEEP trial** – RM-এর পরে একই Vt রেখে PEEP ধাপে ধাপে কমানো হয় (যেমন ২০ থেকে ৬, ২ করে)। প্রতি ধাপে [[Cstat]] আর [[Driving pressure]] মাপা হয়। "Best PEEP" = সবচেয়ে বেশি compliance (সবচেয়ে কম ΔP); PEEP তার প্রায় ২ cmH2O ওপরে রাখো।

**Low-flow P-V curve** – প্রায় ৫ লিটার/মিনিট ধীর গতিতে ফুসফুস ভরালে resistance-এর pressure বাদ পড়ে, তখন static রেখা পাওয়া যায়:
- **LIP** – এখান থেকে compliance বাড়ে (alveoli খুলছে)। PEEP প্রায়ই এর একটু ওপরে রাখা হয়।
- **UIP** – রেখা চ্যাপ্টা হয়ে যায় (overdistension)। End-inspiratory pressure এর নিচে রাখো।

Simulator-এ শুধু recruit করা যায় এমন ফুসফুস (Patient কার্ডে Recruitability ০-এর বেশি) PEEP-এর সঙ্গে বদলায়। ARDS preset দিয়ে চেষ্টা করো।` },

  drive: { title: 'Patient Drive, Sedation & Paralysis', body: `
VentLab-এ রোগী এখন আসল মানুষের মতো **সাড়া দেয়**:

- **Chemoreflex** – pH কমলে / PaCO2 বাড়লে আর SpO2 কমলে effort আর RR বাড়ে; alkalosis হলে কমে। Sedated রোগীকে মেশিনে অতিরিক্ত ventilate করলে সে trigger করা বন্ধ করে দিতে পারে (apnoeic threshold)।
- **Sedation (RASS)** – sedation যত গভীর, তাড়না তত কম; −৫-এ কোনো শ্বাস নেই। +১/+২ (অস্থিরতা, ব্যথা) তাড়না, HR আর BP বাড়ায়।
- **Opioid** মূলত RR কমায় আর ব্যথা কমায়।
- **NMB** সব চেষ্টা বন্ধ করে দেয়। আগে অবশ্যই sedation – "অবশ কিন্তু সজাগ" একটা জরুরি অবস্থা।
- **অতিরিক্ত তাড়না** → বড় Pmus, transpulmonary pressure-এর বড় ওঠানামা → [[P-SILI]], [[Double triggering]], [[Flow starvation]]। আগে কারণ ঠিক করো (acidosis, ব্যথা, জ্বর, hypoxia), support ঠিক করো, তারপর sedation।

Patient কার্ডের **Sedation & drive** অংশ আর **Treatments** কার্ড ব্যবহার করো। "auto drive" বোতাম দিয়ে chemoreflex চালু বা বন্ধ করা যায়।` },
  hfnc: { title: 'HFNC & ROX Index', body: `
**High-flow nasal cannula** ৩০–৬০ লিটার/মিনিট গরম ও আর্দ্র gas দেয়।

- **সঠিক FiO2** – flow রোগীর সর্বোচ্চ inspiratory flow-এর চেয়ে বেশি, তাই বাইরের বাতাস ঢোকে না। Flow কম আর চাহিদা বেশি হলে দেওয়া FiO2 কমে যায়।
- **সামান্য PEEP** – প্রতি ১০ লিটার/মিনিটে প্রায় ০.৫–১ cmH2O (মুখ বন্ধ থাকলে)।
- **Dead space ধুয়ে দেওয়া** – nasopharynx থেকে CO2 সরিয়ে দেয়, শ্বাসের পরিশ্রম কমায়।
- কোনো backup শ্বাস নেই – রোগীকে নিজে শ্বাস নিতে হবে।

**ROX index** = (SpO2 / FiO2) / RR, ২, ৬ আর ১২ ঘণ্টায় দেখা হয়:
- ৪.৮৮ বা বেশি → সফল হওয়ার সম্ভাবনা
- ৩.৮৫-এর কম → ব্যর্থতার ঝুঁকি বেশি – NIV বা intubation ভাবো; intubation দেরি করো না।

Mode & Settings কার্ডে **HFNC** বেছে নাও (রোগীকে সজাগ থাকতে হবে – RASS ০ থেকে −২)।` },
  procedures: { title: 'Bedside Procedures: Suction, Drain, Prone', body: `
- **Open suction** – circuit খুলতে হয়: অল্প সময় desaturation আর PEEP হারানো → alveoli চুপসে যাওয়া। আগে oxygen বাড়াও, সময় কম রাখো, দরকার হলে পরে আবার recruit করো।
- **Closed (in-line) suction** – PEEP বজায় থাকে, alveoli কম চুপসায়; ARDS-এ এটাই ভালো।
- **Bronchoscopy** – lobar collapse ঘটানো mucus plug সরায়।
- **Chest drain** – [[Barotrauma|pneumothorax]]-এর চিকিৎসা; BP আর compliance ফিরে আসে।
- **Cuff** – ২০–৩০ cmH2O রাখো; leak হলে আবার ফোলাও বা tube-এর অবস্থান দেখো।
- **Tube-এর অবস্থান** – endobronchial tube → ১–২ সেমি পিছিয়ে আনো, দুই পাশে বাতাস যাচ্ছে কি না / CXR দিয়ে নিশ্চিত করো।
- **Prone position** – moderate–severe ARDS-এ V/Q আর shunt ভালো করে; প্রভাব কয়েক ঘণ্টায় আসে (এখানে কয়েক মিনিটে)। Tube, চাপ লাগার জায়গা, চোখের দিকে খেয়াল রাখো।

সবগুলো **Treatments & Procedures** কার্ডে আছে; প্রতিটি simulate করা রোগীর ওপর কাজ করে।` },

  /* TROUBLESHOOTING */
  alarms: { title: 'Alarms & Troubleshooting', body: `
**সবসময় আগে রোগীকে দেখো।** অবস্থা অস্থির হলে: ventilator খুলে ১০০% O2 দিয়ে হাতে bag করো।

- High pressure → [[High pressure alarm]]।
- Low pressure / low Vte → circuit খুলে যাওয়া, [[Leak]], cuff।
- High RR → কষ্ট, [[Auto-triggering]], ব্যথা।
- Low MV → apnoea, sedation, leak।
- Apnoea → রোগীর শ্বাসের তাড়না নেই অথচ spontaneous mode চলছে।

Alarm-এর সীমা Alarms কার্ডে বদলানো যায়।` },
  dopes: { title: 'DOPES – হঠাৎ অবনতি', body: `
- **D**isplacement – tube বেরিয়ে যাওয়া / endobronchial হয়ে যাওয়া।
- **O**bstruction – secretion, বাঁকা tube, কামড়ানো, plug।
- **P**neumothorax।
- **E**quipment – ventilator, circuit, O2 সরবরাহ।
- **S**tacking – breath stacking / [[Auto-PEEP]]।

Ventilator খুলে ১০০% O2 দিয়ে bag করো, tube দেখো, suction catheter ঢুকিয়ে দেখো, পরীক্ষা ও scan করো।` },
  highpressure: { title: 'High Pressure Alarm: Ppeak vs Pplat', body: `
একটা [[Inspiratory hold]] দাও:

- **Ppeak বেশি, Pplat স্বাভাবিক** → [[Resistance]]: bronchospasm, secretion, বাঁকা tube, কামড়ানো, ছোট tube।
- **Ppeak আর Pplat দুটোই বেশি** → [[Compliance]]: pneumothorax, endobronchial tube, ARDS/oedema, atelectasis, পেট ফুলে যাওয়া, [[Auto-PEEP]]।
- আরও: কাশি, রোগী ventilator-এর সঙ্গে লড়াই করছে।` },
  leak: { title: 'Leaks (Cuff Leak, BPF)', body: `
**খোঁজো:** Vte < Vti, volume রেখা শূন্যে না ফেরা, loop বন্ধ না হওয়া, low pressure alarm, [[Auto-triggering]]।

**কারণ:** cuff-এ বাতাস কম বা ছেঁড়া, tube বেশি ওপরে উঠে আসা, circuit-এর সংযোগ, chest drain-সহ BPF, NIV mask।

**সমাধান:** cuff pressure দেখো (২০–৩০ cmH2O), tube-এর অবস্থান, circuit। Leak সামলাতে VC-র চেয়ে pressure mode ভালো।` },
  simmodel: { title: 'About this Simulator (এই simulator সম্পর্কে)', body: `
VentLab একটি single-compartment model ব্যবহার করে: [[Equation of motion]], inspiration আর expiration-এর আলাদা resistance, ইচ্ছে করলে non-linear compliance (lower ও upper inflection point), রোগীর পেশির pressure, leak আর সংকেতের বিকৃতি।

Gas exchange-এ ব্যবহার হয় alveolar gas equation, shunt model (mean airway pressure বাড়িয়ে ফুসফুস recruit হলে shunt কমে), dead space, CO2 তৈরি আর Henderson–Hasselbalch সমীকরণ। পরিবর্তন দ্রুত দেখানো হয় (মিনিটের বদলে সেকেন্ডে); চূড়ান্ত মানে সরাসরি যেতে Blood Gas কার্ডে **Steady state** চাপো।

এটা **শেখার জন্য**, চিকিৎসার যন্ত্র নয়। আসল ventilator-এর নিজস্ব algorithm থাকে, তাই সংখ্যা আর আকৃতি বাস্তবসম্মত হলেও হুবহু এক নয়।

এখানকার সব লেখা বদলানো যায় – নিজের note আর টপিক যোগ করো।` }
};
const CAT_BN = { Basics: 'মূল ধারণা', Pressures: 'Pressure', Settings: 'Setting', Modes: 'Mode', Graphics: 'Graph', Asynchrony: 'Asynchrony', Strategy: 'কৌশল', 'Gas exchange': 'Gas exchange', Troubleshooting: 'সমস্যা সমাধান', 'My topics': 'আমার টপিক' };
if (typeof module !== 'undefined') module.exports = { TOPICS_BN, CAT_BN };
