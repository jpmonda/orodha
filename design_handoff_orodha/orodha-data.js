
// ── Orodha Mock Data ─────────────────────────────────────────────────────────
const TODAY = '2026-04-26';

const PATIENTS = [
  { id:'p1',  umr:'UMR0482156', full_name:'Amara Wanjiku Kamau',      sex:'Female', dob:'2019-03-15', residence:'Nairobi',   phone_primary:'0712345678', sha:'Active'   },
  { id:'p2',  umr:'UMR0174803', full_name:'David Otieno Odhiambo',    sex:'Male',   dob:'2021-07-22', residence:'Kisumu',    phone_primary:'0723456789', sha:'Active'   },
  { id:'p3',  umr:'UMR0231256', full_name:'Faith Njeri Mwangi',       sex:'Female', dob:'2018-11-08', residence:'Thika',     phone_primary:'0734567890', sha:'Inactive' },
  { id:'p4',  umr:'UMR0395841', full_name:'Michael Kipchoge Langat',  sex:'Male',   dob:'2020-04-30', residence:'Eldoret',   phone_primary:'0745678901', sha:'Active'   },
  { id:'p5',  umr:'UMR0156234', full_name:'Grace Achieng Owino',      sex:'Female', dob:'2022-01-14', residence:'Mombasa',   phone_primary:'0756789012', sha:'Active'   },
  { id:'p6',  umr:'UMR0421789', full_name:'Samuel Mutua Kioko',       sex:'Male',   dob:'2017-09-03', residence:'Machakos',  phone_primary:'0767890123', sha:'Inactive' },
  { id:'p7',  umr:'UMR0308654', full_name:'Fatuma Hassan Ali',        sex:'Female', dob:'2023-02-19', residence:'Garissa',   phone_primary:'0778901234', sha:'Active'   },
  { id:'p8',  umr:'UMR0267431', full_name:'Peter Njenga Kariuki',     sex:'Male',   dob:'2019-08-11', residence:'Nyeri',     phone_primary:'0789012345', sha:'Active'   },
  { id:'p9',  umr:'UMR0512098', full_name:'Esther Wairimu Gachoki',   sex:'Female', dob:'2020-12-05', residence:'Nakuru',    phone_primary:'0790123456', sha:'Active'   },
  { id:'p10', umr:'UMR0183742', full_name:'Ali Mohamed Abdullahi',    sex:'Male',   dob:'2018-05-27', residence:'Wajir',     phone_primary:'0701234567', sha:'Inactive' },
];

const BOOKINGS = [
  // ── April – past ─────────────────────────────────────────────────────────
  { id:'b1',  patientId:'p6',  date:'2026-04-03', slot:1, specialty:'Minor Procedures', procedure:'Circumcision',                 diagnosis:'Phimosis',           urgency:'Elective', status:'Done',      cancelReason:null, preOpNotes:'Consented. Nil allergies.' },
  { id:'b2',  patientId:'p3',  date:'2026-04-03', slot:2, specialty:'Hernias & Testis', procedure:'Inguinal Hernia Repair',        diagnosis:'Right inguinal hernia', urgency:'Elective', status:'Done',   cancelReason:null, preOpNotes:'' },
  { id:'b3',  patientId:'p1',  date:'2026-04-08', slot:1, specialty:'Urological',       procedure:'Orchidopexy',                   diagnosis:'Undescended testis',  urgency:'Elective', status:'Done',      cancelReason:null, preOpNotes:'Group & crossmatch done.' },
  { id:'b4',  patientId:'p8',  date:'2026-04-08', slot:2, specialty:'Upper GI',         procedure:'Pyloromyotomy',                 diagnosis:'Pyloric stenosis',    urgency:'Urgent',   status:'Done',      cancelReason:null, preOpNotes:'Corrected alkalosis. NBM 4h.' },
  { id:'b5',  patientId:'p4',  date:'2026-04-08', slot:3, specialty:'Minor Procedures', procedure:'Excision of skin tag',          diagnosis:'Perianal skin tag',   urgency:'Elective', status:'Cancelled', cancelReason:'URTI', preOpNotes:'' },
  { id:'b6',  patientId:'p9',  date:'2026-04-10', slot:1, specialty:'Oncological',      procedure:'Wilms Tumour Nephrectomy',      diagnosis:'Wilms tumour Rt kidney', urgency:'Urgent', status:'Done',    cancelReason:null, preOpNotes:'Pre-op chemo x 4 wks complete. HDU post-op.' },
  { id:'b7',  patientId:'p2',  date:'2026-04-14', slot:1, specialty:'Colorectal',       procedure:'Colostomy Takedown',            diagnosis:'Anorectal malformation', urgency:'Elective', status:'Done',   cancelReason:null, preOpNotes:'Bowel prep completed.' },
  { id:'b8',  patientId:'p5',  date:'2026-04-14', slot:2, specialty:'Hernias & Testis', procedure:'Bilateral Orchidopexy',         diagnosis:'Bilateral undescended testes', urgency:'Elective', status:'Done', cancelReason:null, preOpNotes:'' },
  { id:'b9',  patientId:'p10', date:'2026-04-14', slot:3, specialty:'Hepatobiliary',    procedure:'Hepatoportoenterostomy (Kasai)', diagnosis:'Biliary atresia',     urgency:'Urgent',   status:'Done',      cancelReason:null, preOpNotes:'Jaundice index <60 days. ICU booked.' },
  { id:'b10', patientId:'p7',  date:'2026-04-17', slot:1, specialty:'Urological',       procedure:'Ureteral Reimplantation',       diagnosis:'VUJ obstruction',     urgency:'Elective', status:'Done',      cancelReason:null, preOpNotes:'' },
  { id:'b11', patientId:'p3',  date:'2026-04-17', slot:2, specialty:'Minor Procedures', procedure:'Circumcision',                  diagnosis:'Phimosis',            urgency:'Elective', status:'Cancelled', cancelReason:'No-show / did not attend', preOpNotes:'' },
  { id:'b12', patientId:'p6',  date:'2026-04-22', slot:1, specialty:'Upper GI',         procedure:'Intussusception Reduction',     diagnosis:'Intussusception',     urgency:'Emergency',status:'Done',      cancelReason:null, preOpNotes:'Air enema failed. Proceed to OT.' },
  { id:'b13', patientId:'p1',  date:'2026-04-22', slot:2, specialty:'Colorectal',       procedure:'Posterior Sagittal Anorectoplasty', diagnosis:'Rectal stricture', urgency:'Elective', status:'Done',    cancelReason:null, preOpNotes:'Stoma in situ.' },
  { id:'b14', patientId:'p8',  date:'2026-04-22', slot:3, specialty:'Hepatobiliary',    procedure:'Splenectomy',                   diagnosis:'Hereditary spherocytosis', urgency:'Elective', status:'Done', cancelReason:null, preOpNotes:'Vaccines given 2 wks pre-op.' },
  { id:'b15', patientId:'p4',  date:'2026-04-24', slot:1, specialty:'Urological',       procedure:'Hypospadias Repair',            diagnosis:'Hypospadias, mid-shaft', urgency:'Elective', status:'Done',  cancelReason:null, preOpNotes:'' },
  { id:'b16', patientId:'p9',  date:'2026-04-24', slot:2, specialty:'Hernias & Testis', procedure:'Inguinal Hernia Repair',        diagnosis:'Left inguinal hernia', urgency:'Elective', status:'Done',    cancelReason:null, preOpNotes:'' },
  // ── April – future ───────────────────────────────────────────────────────
  { id:'b17', patientId:'p5',  date:'2026-04-28', slot:1, specialty:'Urological',       procedure:'Pyeloplasty',                   diagnosis:'UPJO',                urgency:'Elective', status:'Pending',   cancelReason:null, preOpNotes:'MAG3 renogram done.' },
  { id:'b18', patientId:'p2',  date:'2026-04-29', slot:1, specialty:'Colorectal',       procedure:'Pull-through Procedure',        diagnosis:'Hirschsprung disease', urgency:'Elective', status:'Pending',  cancelReason:null, preOpNotes:'Biopsy confirmed aganglionosis to sigmoid.' },
  { id:'b19', patientId:'p10', date:'2026-04-29', slot:2, specialty:'Hepatobiliary',    procedure:'Cholecystectomy',               diagnosis:'Cholelithiasis',       urgency:'Elective', status:'Pending',   cancelReason:null, preOpNotes:'' },
  { id:'b20', patientId:'p7',  date:'2026-04-29', slot:3, specialty:'Oncological',      procedure:'Biopsy — Retroperitoneal mass', diagnosis:'? Neuroblastoma',     urgency:'Urgent',   status:'Pending',   cancelReason:null, preOpNotes:'CT done. MDT reviewed.' },
  // ── May ──────────────────────────────────────────────────────────────────
  { id:'b21', patientId:'p3',  date:'2026-05-05', slot:1, specialty:'Hernias & Testis', procedure:'Bilateral Inguinal Hernia Repair', diagnosis:'Bilateral inguinal hernias', urgency:'Elective', status:'Pending', cancelReason:null, preOpNotes:'' },
  { id:'b22', patientId:'p6',  date:'2026-05-05', slot:2, specialty:'Minor Procedures', procedure:'Circumcision',                  diagnosis:'Phimosis',            urgency:'Elective', status:'Pending',   cancelReason:null, preOpNotes:'Rescheduled from Apr 17.' },
  { id:'b23', patientId:'p4',  date:'2026-05-07', slot:1, specialty:'Upper GI',         procedure:'Fundoplication',                diagnosis:'GERD with failure to thrive', urgency:'Elective', status:'Pending', cancelReason:null, preOpNotes:'' },
  { id:'b24', patientId:'p1',  date:'2026-05-12', slot:1, specialty:'Urological',       procedure:'Bladder Neck Reconstruction',   diagnosis:'Bladder exstrophy',   urgency:'Elective', status:'Pending',   cancelReason:null, preOpNotes:'MDT reviewed. Parents counselled.' },
  { id:'b25', patientId:'p8',  date:'2026-05-12', slot:2, specialty:'Colorectal',       procedure:'Appendicectomy',                diagnosis:'Recurrent appendicitis', urgency:'Elective', status:'Pending', cancelReason:null, preOpNotes:'' },
  { id:'b26', patientId:'p9',  date:'2026-05-12', slot:3, specialty:'Oncological',      procedure:'Wilms Tumour Nephrectomy — Left', diagnosis:'Wilms tumour Lt kidney', urgency:'Urgent', status:'Pending', cancelReason:null, preOpNotes:'Chemo complete.' },
  { id:'b27', patientId:'p10', date:'2026-05-14', slot:1, specialty:'Minor Procedures', procedure:'Tongue-tie Division',           diagnosis:'Ankyloglossia',       urgency:'Elective', status:'Pending',   cancelReason:null, preOpNotes:'' },
  { id:'b28', patientId:'p5',  date:'2026-05-14', slot:2, specialty:'Urological',       procedure:'Urethroplasty',                 diagnosis:'Urethral stricture',  urgency:'Elective', status:'Pending',   cancelReason:null, preOpNotes:'' },
  { id:'b29', patientId:'p2',  date:'2026-05-19', slot:1, specialty:'Hepatobiliary',    procedure:'Liver Biopsy',                  diagnosis:'Neonatal hepatitis syndrome', urgency:'Elective', status:'Pending', cancelReason:null, preOpNotes:'' },
  { id:'b30', patientId:'p7',  date:'2026-05-21', slot:1, specialty:'Oncological',      procedure:'Port Insertion',                diagnosis:'ALL — chemo access',  urgency:'Urgent',   status:'Pending',   cancelReason:null, preOpNotes:'' },
  { id:'b31', patientId:'p3',  date:'2026-05-21', slot:2, specialty:'Hernias & Testis', procedure:'Inguinal Hernia Repair',        diagnosis:'Left inguinal hernia', urgency:'Elective', status:'Pending',   cancelReason:null, preOpNotes:'' },
  { id:'b32', patientId:'p6',  date:'2026-05-21', slot:3, specialty:'Upper GI',         procedure:'Oesophageal Dilatation',        diagnosis:'Oesophageal stricture', urgency:'Elective', status:'Pending', cancelReason:null, preOpNotes:'' },
  { id:'b33', patientId:'p4',  date:'2026-05-26', slot:1, specialty:'Colorectal',       procedure:'Colostomy Formation',           diagnosis:'Imperforate anus',    urgency:'Urgent',   status:'Pending',   cancelReason:null, preOpNotes:'' },
  { id:'b34', patientId:'p8',  date:'2026-05-26', slot:2, specialty:'Urological',       procedure:'Orchidopexy',                   diagnosis:'Undescended testis',  urgency:'Elective', status:'Pending',   cancelReason:null, preOpNotes:'' },
  { id:'b35', patientId:'p1',  date:'2026-05-28', slot:1, specialty:'Minor Procedures', procedure:'Excision of Thyroglossal Cyst', diagnosis:'Thyroglossal cyst',   urgency:'Elective', status:'Pending',   cancelReason:null, preOpNotes:'' },
  // ── June ─────────────────────────────────────────────────────────────────
  { id:'b36', patientId:'p9',  date:'2026-06-02', slot:1, specialty:'Hepatobiliary',    procedure:'Splenectomy',                   diagnosis:'Sickle cell disease', urgency:'Elective', status:'Pending',   cancelReason:null, preOpNotes:'' },
  { id:'b37', patientId:'p10', date:'2026-06-02', slot:2, specialty:'Minor Procedures', procedure:'Excision of dermoid cyst',      diagnosis:'Scalp dermoid',       urgency:'Elective', status:'Pending',   cancelReason:null, preOpNotes:'' },
  { id:'b38', patientId:'p5',  date:'2026-06-04', slot:1, specialty:'Urological',       procedure:'Nephrectomy',                   diagnosis:'Non-functioning kidney', urgency:'Elective', status:'Pending', cancelReason:null, preOpNotes:'DMSA scan confirmed.' },
  { id:'b39', patientId:'p2',  date:'2026-06-04', slot:2, specialty:'Colorectal',       procedure:'Sigmoid Colectomy',             diagnosis:'Familial polyposis',  urgency:'Elective', status:'Pending',   cancelReason:null, preOpNotes:'' },
  { id:'b40', patientId:'p7',  date:'2026-06-04', slot:3, specialty:'Oncological',      procedure:'Retroperitoneal Lymph Node Dissection', diagnosis:'Germ cell tumour', urgency:'Urgent', status:'Pending', cancelReason:null, preOpNotes:'' },
];

const BLOCKED_DATES = [
  { date:'2026-05-01', reason:'Labour Day — Public Holiday' },
  { date:'2026-06-01', reason:'Madaraka Day — Public Holiday' },
];

const SPECIALTIES = ['Urological','Colorectal','Hernias & Testis','Upper GI','Hepatobiliary','Minor Procedures','Oncological','Other'];

const CANCELLATION_REASONS = [
  'Patient unfit for surgery',
  'Upper respiratory tract infection (URTI)',
  'No-show / did not attend',
  'Fasting failure',
  'Theatre overrun',
  'Equipment unavailable',
  'Surgeon unavailable',
  'Other',
];

const AUDIT_LOG = [
  { id:'a1', user:'Dr. K. Mwangi', action:'Booking created',   target:'b40 — Fatuma Hassan Ali',        timestamp:'2026-04-26 09:14' },
  { id:'a2', user:'Dr. A. Oduya',  action:'Status → Done',      target:'b16 — Esther Wairimu Gachoki',   timestamp:'2026-04-24 16:45' },
  { id:'a3', user:'Dr. A. Oduya',  action:'Status → Done',      target:'b15 — Michael Kipchoge Langat',  timestamp:'2026-04-24 16:42' },
  { id:'a4', user:'Dr. K. Mwangi', action:'Booking created',    target:'b39 — David Otieno Odhiambo',    timestamp:'2026-04-23 11:02' },
  { id:'a5', user:'Dr. K. Mwangi', action:'Status → Done',      target:'b14 — Peter Njenga Kariuki',     timestamp:'2026-04-22 17:30' },
  { id:'a6', user:'Dr. K. Mwangi', action:'Status → Done',      target:'b13 — Amara Wanjiku Kamau',      timestamp:'2026-04-22 15:55' },
  { id:'a7', user:'Dr. A. Oduya',  action:'Status → Done',      target:'b12 — Samuel Mutua Kioko',       timestamp:'2026-04-22 13:11' },
  { id:'a8', user:'Dr. J. Kamau',  action:'Status → Cancelled', target:'b11 — Faith Njeri Mwangi (No-show)', timestamp:'2026-04-17 08:05' },
  { id:'a9', user:'Dr. A. Oduya',  action:'Pre-op note added',  target:'b20 — Fatuma Hassan Ali',        timestamp:'2026-04-16 14:22' },
  { id:'a10',user:'Dr. K. Mwangi', action:'Date blocked',       target:'2026-05-01 Labour Day',          timestamp:'2026-04-15 09:00' },
];

function calcAge(dob) {
  const birth = new Date(dob);
  const now = new Date(TODAY);
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (months < 0) { years--; months += 12; }
  if (years === 0) return `${months}mo`;
  if (months === 0) return `${years}y`;
  return `${years}y ${months}mo`;
}

function getPatient(id) { return PATIENTS.find(p => p.id === id); }
function getBookingsForDate(date) { return BOOKINGS.filter(b => b.date === date); }
function isBlocked(date) { return BLOCKED_DATES.some(b => b.date === date); }
function getBlockReason(date) { return BLOCKED_DATES.find(b => b.date === date)?.reason || ''; }
