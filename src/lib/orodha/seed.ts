import type { OrodhaData } from "./types";

const now = "2026-04-26T09:00:00.000Z";

const patient = (
  id: string,
  hospital_number: string,
  full_name: string,
  sex: OrodhaData["patients"][number]["sex"],
  date_of_birth: string,
  residence: string,
  caregiver_name: string,
  phone_primary: string,
  sha_status: OrodhaData["patients"][number]["sha_status"],
  notes: string | null = null,
): OrodhaData["patients"][number] => ({
  id,
  hospital_number,
  full_name,
  sex,
  date_of_birth,
  age_text: null,
  residence,
  caregiver_name,
  phone_primary,
  phone_secondary: null,
  sha_status,
  notes,
  created_at: now,
  updated_at: now,
});

const session = (
  id: string,
  session_date: string,
  max_cases = 3,
  overrides: Partial<OrodhaData["theatre_sessions"][number]> = {},
): OrodhaData["theatre_sessions"][number] => ({
  id,
  theatre_id: "th-main",
  session_date,
  session_name: "Paediatric Surgery List",
  max_cases,
  start_time: "08:00",
  end_time: "16:00",
  is_blocked: false,
  block_reason: null,
  notes: null,
  created_at: now,
  ...overrides,
});

const holiday = (id: string, session_date: string, block_reason: string) =>
  session(id, session_date, 3, {
    session_name: "Public Holiday",
    start_time: null,
    end_time: null,
    is_blocked: true,
    block_reason,
    notes: "Theatre closed for public holiday",
  });

const surgicalCase = (
  id: string,
  patient_id: string,
  specialty_id: string,
  procedure_name: string,
  priority: OrodhaData["surgical_cases"][number]["priority"],
  status: OrodhaData["surgical_cases"][number]["status"],
  overrides: Partial<OrodhaData["surgical_cases"][number]> = {},
): OrodhaData["surgical_cases"][number] => ({
  id,
  patient_id,
  specialty_id,
  procedure_id: null,
  procedure_name,
  diagnosis: null,
  indication: null,
  case_description: null,
  priority,
  status,
  estimated_duration_minutes: null,
  weight_kg: null,
  asa_class: "II",
  comorbidities: null,
  allergies: null,
  special_requirements: null,
  surgeon_id: null,
  anaesthetist_id: null,
  created_at: now,
  updated_at: now,
  ...overrides,
});

const preop = (
  id: string,
  case_id: string,
  overrides: Partial<OrodhaData["preop_assessments"][number]> = {},
): OrodhaData["preop_assessments"][number] => ({
  id,
  case_id,
  anaesthesia_status: "Pending",
  surgical_status: "Cleared",
  nursing_status: "Pending",
  consent_done: true,
  fasting_instructions_given: true,
  labs_required: false,
  labs_done: false,
  imaging_required: false,
  imaging_done: false,
  blood_required: false,
  blood_available: false,
  financial_clearance: true,
  preop_notes: null,
  assessed_at: null,
  updated_at: now,
  ...overrides,
});

const booking = (
  id: string,
  case_id: string,
  session_id: string,
  slot: number,
  booking_status: OrodhaData["bookings"][number]["booking_status"],
  overrides: Partial<OrodhaData["bookings"][number]> = {},
): OrodhaData["bookings"][number] => ({
  id,
  case_id,
  session_id,
  slot,
  booking_status,
  order_on_list: slot,
  postop_destination: "Ward",
  cancellation_reason: null,
  postponement_reason: null,
  outcome_notes: null,
  created_at: now,
  updated_at: now,
  ...overrides,
});

const patients: OrodhaData["patients"] = [
  patient("p1", "UMR0482156", "Amara Wanjiku Kamau", "Female", "2019-03-15", "Nairobi", "Mary Kamau", "0712345678", "Active"),
  patient("p2", "UMR0174803", "David Otieno Odhiambo", "Male", "2021-07-22", "Kisumu", "Peter Odhiambo", "0723456789", "Active"),
  patient("p3", "UMR0231256", "Faith Njeri Mwangi", "Female", "2018-11-08", "Thika", "Jane Mwangi", "0734567890", "Inactive", "Family prefers weekday theatre lists."),
  patient("p4", "UMR0395841", "Michael Kipchoge Langat", "Male", "2020-04-30", "Eldoret", "Daniel Langat", "0745678901", "Active"),
  patient("p5", "UMR0156234", "Grace Achieng Owino", "Female", "2022-01-14", "Mombasa", "Rose Owino", "0756789012", "Active"),
  patient("p6", "UMR0421789", "Samuel Mutua Kioko", "Male", "2017-09-03", "Machakos", "Mutua Kioko", "0767890123", "Inactive"),
  patient("p7", "UMR0308654", "Fatuma Hassan Ali", "Female", "2023-02-19", "Garissa", "Hassan Ali", "0778901234", "Active"),
  patient("p8", "UMR0267431", "Peter Njenga Kariuki", "Male", "2019-08-11", "Nyeri", "John Kariuki", "0789012345", "Active"),
  patient("p9", "UMR0512098", "Esther Wairimu Gachoki", "Female", "2020-12-05", "Nakuru", "Wairimu Gachoki", "0790123456", "Active"),
  patient("p10", "UMR0183742", "Ali Mohamed Abdullahi", "Male", "2018-05-27", "Wajir", "Mohamed Abdullahi", "0701234567", "Inactive"),
  patient("p11", "UMR0542801", "Leah Atieno Naliaka", "Female", "2019-10-09", "Bungoma", "Atieno Naliaka", "0718456123", "Active"),
  patient("p12", "UMR0563184", "Brian Omondi Oketch", "Male", "2021-02-03", "Siaya", "Janet Oketch", "0728345612", "Active"),
  patient("p13", "UMR0589902", "Zainab Noor Ibrahim", "Female", "2022-08-18", "Isiolo", "Noor Ibrahim", "0738345612", "Active"),
  patient("p14", "UMR0601245", "Kevin Kiptoo Cheruiyot", "Male", "2017-06-11", "Kericho", "Sarah Cheruiyot", "0748345612", "Active"),
  patient("p15", "UMR0617720", "Ruth Muthoni Kibe", "Female", "2020-02-20", "Kiambu", "Muthoni Kibe", "0758345612", "Active"),
  patient("p16", "UMR0634419", "Hannah Jepkosgei Tanui", "Female", "2018-01-29", "Uasin Gishu", "Jepkosgei Tanui", "0768345612", "Active"),
  patient("p17", "UMR0648103", "Elijah Mwangi Karanja", "Male", "2021-09-12", "Muranga", "Mwangi Karanja", "0778345612", "Active"),
  patient("p18", "UMR0672150", "Asha Wanjiru Ndegwa", "Female", "2023-03-07", "Naivasha", "Wanjiru Ndegwa", "0788345612", "Active"),
  patient("p19", "UMR0684501", "Mercy Atieno Adongo", "Female", "2020-06-18", "Kakamega", "John Adongo", "0798345612", "Active"),
  patient("p20", "UMR0691104", "Dennis Kiprono Sang", "Male", "2018-04-24", "Bomet", "Lucy Sang", "0708345612", "Active"),
  patient("p21", "UMR0702257", "Naomi Wambui Wanyoike", "Female", "2021-12-01", "Nyahururu", "Wambui Wanyoike", "0719345612", "Active"),
  patient("p22", "UMR0713370", "Ian Ochieng Ombasa", "Male", "2019-09-16", "Homa Bay", "Joseph Ombasa", "0729345612", "Active"),
  patient("p23", "UMR0724483", "Halima Abdinoor Mohamed", "Female", "2022-05-04", "Mandera", "Abdinoor Mohamed", "0739345612", "Active"),
  patient("p24", "UMR0735596", "Tabitha Jelagat Rono", "Female", "2017-07-09", "Nandi", "Jelagat Rono", "0749345612", "Inactive"),
  patient("p25", "UMR0746609", "Victor Muli Musyoka", "Male", "2020-10-28", "Kitui", "Muli Musyoka", "0759345612", "Active"),
  patient("p26", "UMR0757722", "Sofia Akinyi Were", "Female", "2021-01-13", "Busia", "Akinyi Were", "0769345612", "Active"),
  patient("p27", "UMR0768835", "Tobias Kimani Maina", "Male", "2018-08-22", "Limuru", "Kimani Maina", "0779345612", "Active"),
  patient("p28", "UMR0779948", "Mariam Hussein Abdi", "Female", "2023-01-30", "Marsabit", "Hussein Abdi", "0789345612", "Active"),
  patient("p29", "UMR0791061", "Kelvin Barasa Wekesa", "Male", "2019-05-17", "Webuye", "Barasa Wekesa", "0799345612", "Active"),
  patient("p30", "UMR0802174", "Purity Nanjala Simiyu", "Female", "2020-08-06", "Kitale", "Nanjala Simiyu", "0709345612", "Active"),
  patient("p31", "UMR0813287", "Abel Mworia Muriuki", "Male", "2017-03-03", "Meru", "Mworia Muriuki", "0710445612", "Active"),
  patient("p32", "UMR0824300", "Joyce Chebet Kiplagat", "Female", "2021-11-11", "Baringo", "Chebet Kiplagat", "0720445612", "Active"),
  patient("p33", "UMR0835413", "Yusuf Ahmed Farah", "Male", "2022-07-14", "Moyale", "Ahmed Farah", "0730445612", "Inactive"),
  patient("p34", "UMR0846526", "Brenda Awuor Ouma", "Female", "2018-02-26", "Migori", "Awuor Ouma", "0740445612", "Active"),
  patient("p35", "UMR0857639", "Paul Kibet Yegon", "Male", "2019-12-08", "Kapsabet", "Kibet Yegon", "0750445612", "Active"),
  patient("p36", "UMR0868752", "Sakina Ali Noor", "Female", "2023-04-10", "Lamu", "Ali Noor", "0760445612", "Active"),
  // p37–p50: new patients
  patient("p37", "UMR0879865", "Caroline Njambi Kamau", "Female", "2019-11-23", "Nairobi", "Peter Kamau", "0711567890", "Active"),
  patient("p38", "UMR0890978", "James Kiplangat Rotich", "Male", "2020-07-14", "Eldoret", "Sarah Rotich", "0721567890", "Active"),
  patient("p39", "UMR0902091", "Amina Wanjiku Otieno", "Female", "2021-03-08", "Kisumu", "Grace Otieno", "0731567890", "Active"),
  patient("p40", "UMR0913204", "Moses Kipchoge Kibet", "Male", "2018-12-31", "Kericho", "Alice Kibet", "0741567890", "Active"),
  patient("p41", "UMR0924317", "Consolata Anyango Oloo", "Female", "2022-09-05", "Kisumu", "Thomas Oloo", "0751567890", "Active"),
  patient("p42", "UMR0935430", "Benjamin Mwangi Njoroge", "Male", "2019-04-19", "Thika", "Martha Njoroge", "0761567890", "Active"),
  patient("p43", "UMR0946543", "Josephine Wanjiru Karanja", "Female", "2023-05-21", "Nakuru", "David Karanja", "0771567890", "Active"),
  patient("p44", "UMR0957656", "Abdullahi Omar Hassan", "Male", "2017-08-15", "Garissa", "Omar Hassan", "0781567890", "Inactive"),
  patient("p45", "UMR0968769", "Winnie Atieno Omondi", "Female", "2020-11-30", "Bungoma", "Paul Omondi", "0791567890", "Active"),
  patient("p46", "UMR0979882", "Patrick Kipkemoi Ruto", "Male", "2021-07-04", "Eldoret", "Anne Ruto", "0701567890", "Active"),
  patient("p47", "UMR0990995", "Amelia Nyambura Gitau", "Female", "2018-09-25", "Kiambu", "Francis Gitau", "0712467890", "Active"),
  patient("p48", "UMR1002108", "Joseph Oduya Otieno", "Male", "2022-01-16", "Siaya", "Catherine Otieno", "0722467890", "Active"),
  patient("p49", "UMR1013221", "Miriam Cherop Kiptoo", "Female", "2019-06-07", "Bomet", "Isaac Kiptoo", "0732467890", "Active"),
  patient("p50", "UMR1024334", "Isaac Mwenda Nkrumah", "Male", "2020-03-22", "Meru", "Hannah Nkrumah", "0742467890", "Active"),
];

const theatre_sessions: OrodhaData["theatre_sessions"] = [
  holiday("ts-2026-01-01", "2026-01-01", "New Year's Day"),
  session("ts-2026-02-03", "2026-02-03", 3, { notes: "Completed early February list" }),
  session("ts-2026-02-10", "2026-02-10", 3, { notes: "Mixed outcomes day" }),
  session("ts-2026-02-17", "2026-02-17", 3, { notes: "One postponed for reassessment" }),
  session("ts-2026-02-24", "2026-02-24", 3, { notes: "Short completed list" }),
  session("ts-2026-03-03", "2026-03-03", 3, { notes: "Completed colorectal and upper GI cases" }),
  session("ts-2026-03-10", "2026-03-10", 3, { notes: "Two completed, one empty slot" }),
  session("ts-2026-03-17", "2026-03-17", 3, { notes: "One case postponed and later relisted" }),
  holiday("ts-2026-03-20", "2026-03-20", "Idd ul-Fitr"),
  session("ts-2026-03-24", "2026-03-24", 3, { notes: "Relisted postponed cases" }),
  session("ts-2026-03-31", "2026-03-31", 3, { notes: "Month-end theatre list" }),
  holiday("ts-2026-04-03", "2026-04-03", "Good Friday"),
  holiday("ts-2026-04-06", "2026-04-06", "Easter Monday"),
  session("ts-2026-04-07", "2026-04-07", 3, { notes: "Post-holiday catch-up list" }),
  session("ts-2026-04-14", "2026-04-14", 3, { notes: "Completed full list" }),
  session("ts-2026-04-17", "2026-04-17", 3, { notes: "Mixed outcomes day" }),
  session("ts-2026-04-21", "2026-04-21", 3, { notes: "One postponed, one completed" }),
  session("ts-2026-04-24", "2026-04-24", 3, { notes: "Completed day list" }),
  session("ts-2026-04-28", "2026-04-28", 3, { notes: "Upcoming partial list" }),
  session("ts-2026-04-29", "2026-04-29", 3, { notes: "Upcoming full list" }),
  holiday("ts-2026-05-01", "2026-05-01", "Labour Day"),
  session("ts-2026-05-05", "2026-05-05", 4, { notes: "Four-slot overflow list" }),
  session("ts-2026-05-12", "2026-05-12", 3),
  session("ts-2026-05-19", "2026-05-19", 3),
  session("ts-2026-05-26", "2026-05-26", 3),
  holiday("ts-2026-06-01", "2026-06-01", "Madaraka Day"),
  session("ts-2026-06-04", "2026-06-04", 3),
  session("ts-2026-06-09", "2026-06-09", 3, { notes: "Short list with one cancellation" }),
  session("ts-2026-06-16", "2026-06-16", 3, { notes: "Booked to capacity" }),
  session("ts-2026-06-23", "2026-06-23", 3),
  session("ts-2026-06-30", "2026-06-30", 3, { notes: "Month-end elective list" }),
  session("ts-2026-07-07", "2026-07-07", 3),
  session("ts-2026-07-14", "2026-07-14", 3, { notes: "Additional July list" }),
  session("ts-2026-07-21", "2026-07-21", 3, { notes: "Booked mixed-acuity list" }),
  session("ts-2026-07-28", "2026-07-28", 3),
  session("ts-2026-08-04", "2026-08-04", 3, { notes: "August opening list" }),
  session("ts-2026-08-11", "2026-08-11", 3),
  session("ts-2026-08-18", "2026-08-18", 3),
  session("ts-2026-08-25", "2026-08-25", 3, { notes: "End of August list" }),
  session("ts-2026-09-01", "2026-09-01", 3, { notes: "September opening list" }),
  session("ts-2026-09-08", "2026-09-08", 3),
  session("ts-2026-09-15", "2026-09-15", 3),
  session("ts-2026-09-22", "2026-09-22", 3),
  session("ts-2026-09-29", "2026-09-29", 3, { notes: "September closing list" }),
  holiday("ts-2026-10-10", "2026-10-10", "Mazingira Day"),
  holiday("ts-2026-10-20", "2026-10-20", "Mashujaa Day"),
  session("ts-2026-11-03", "2026-11-03", 3),
  holiday("ts-2026-12-12", "2026-12-12", "Jamhuri Day"),
  holiday("ts-2026-12-25", "2026-12-25", "Christmas Day"),
  holiday("ts-2026-12-26", "2026-12-26", "Boxing Day"),
];

const surgical_cases: OrodhaData["surgical_cases"] = [
  // --- Existing cases c1–c49 (c9, c16, c22, c27 status updated to "Done") ---
  surgicalCase("c1", "p5", "sp-urology", "Pyeloplasty", "Elective", "Booked", { diagnosis: "UPJO", indication: "Progressive hydronephrosis", estimated_duration_minutes: 150, weight_kg: 13.4, asa_class: "II", special_requirements: "MAG3 renogram reviewed" }),
  surgicalCase("c2", "p2", "sp-colorectal", "Pull-through Procedure", "Elective", "Booked", { diagnosis: "Hirschsprung disease", indication: "Definitive repair", estimated_duration_minutes: 180, weight_kg: 16.2, special_requirements: "Biopsy confirmed aganglionosis to sigmoid" }),
  surgicalCase("c3", "p3", "sp-hernia", "Bilateral Inguinal Hernia Repair", "Elective", "Awaiting booking", { diagnosis: "Bilateral inguinal hernias", indication: "Reducible hernias", estimated_duration_minutes: 90, weight_kg: 19.1, asa_class: "I" }),
  surgicalCase("c4", "p1", "sp-hpb", "Hepatoportoenterostomy", "Urgent", "Booked", { diagnosis: "Biliary atresia", indication: "Persistent cholestasis", estimated_duration_minutes: 240, weight_kg: 21.6, asa_class: "III", comorbidities: "Cholestasis", special_requirements: "ICU bed required" }),
  surgicalCase("c5", "p4", "sp-minor", "Circumcision", "Elective", "Done", { diagnosis: "Phimosis", indication: "Recurrent balanitis", estimated_duration_minutes: 45, weight_kg: 18.8, asa_class: "I" }),
  surgicalCase("c6", "p2", "sp-colorectal", "Colostomy Takedown", "Elective", "Done", { diagnosis: "Anorectal malformation", indication: "Stoma closure", estimated_duration_minutes: 120, weight_kg: 16.2 }),
  surgicalCase("c7", "p5", "sp-hernia", "Bilateral Orchidopexy", "Elective", "Done", { diagnosis: "Bilateral undescended testes", indication: "Definitive fixation", estimated_duration_minutes: 90, weight_kg: 13.4, asa_class: "I" }),
  surgicalCase("c8", "p10", "sp-hpb", "Hepatoportoenterostomy (Kasai)", "Urgent", "Done", { diagnosis: "Biliary atresia", indication: "Early biliary drainage", estimated_duration_minutes: 240, weight_kg: 18.1, asa_class: "III", special_requirements: "ICU booked" }),
  surgicalCase("c9", "p7", "sp-oncology", "Retroperitoneal Lymph Node Dissection", "Urgent", "Done", { diagnosis: "Germ cell tumour", indication: "Residual mass", estimated_duration_minutes: 210, weight_kg: 10.2, asa_class: "III", special_requirements: "Blood available" }),
  surgicalCase("c10", "p8", "sp-urology", "Orchidopexy", "Elective", "Booked", { diagnosis: "Undescended testis", indication: "Elective fixation", estimated_duration_minutes: 80, weight_kg: 20.2, asa_class: "I" }),
  surgicalCase("c11", "p9", "sp-urology", "Ureteric Reimplantation", "Elective", "Cancelled", { diagnosis: "VUR", indication: "Breakthrough infections", estimated_duration_minutes: 150, weight_kg: 17.8 }),
  surgicalCase("c12", "p6", "sp-other", "Appendicostomy Revision", "Semi-urgent", "Booked", { diagnosis: "Stomal stenosis", indication: "Revision for washout access", estimated_duration_minutes: 120, weight_kg: 24.1, special_requirements: "Stoma therapist review" }),
  surgicalCase("c13", "p4", "sp-urology", "Hypospadias Repair", "Elective", "Done", { diagnosis: "Distal hypospadias", indication: "Planned repair", estimated_duration_minutes: 140, weight_kg: 18.8 }),
  surgicalCase("c14", "p1", "sp-urology", "Bladder Neck Reconstruction", "Elective", "Booked", { diagnosis: "Bladder outlet dysfunction", indication: "Continence pathway", estimated_duration_minutes: 210, weight_kg: 21.6 }),
  surgicalCase("c15", "p3", "sp-urology", "Nephrectomy", "Elective", "Cancelled", { diagnosis: "Non-functioning kidney", indication: "Symptomatic hydronephrosis", estimated_duration_minutes: 170, weight_kg: 19.1 }),
  surgicalCase("c16", "p11", "sp-uppergi", "Choledochal Cyst Excision", "Urgent", "Done", { diagnosis: "Choledochal cyst", indication: "Progressive cholangitis", estimated_duration_minutes: 220, weight_kg: 20.1, asa_class: "III" }),
  surgicalCase("c17", "p12", "sp-colorectal", "Anal Dilatation", "Elective", "Done", { diagnosis: "Post-operative stricture", indication: "Planned dilatation", estimated_duration_minutes: 50, weight_kg: 12.5, asa_class: "I" }),
  surgicalCase("c18", "p13", "sp-uppergi", "Ladd Procedure", "Urgent", "Booked", { diagnosis: "Malrotation", indication: "Intermittent volvulus symptoms", estimated_duration_minutes: 160, weight_kg: 11.2, asa_class: "II" }),
  surgicalCase("c19", "p14", "sp-oncology", "Wilms Tumour Biopsy", "Urgent", "Booked", { diagnosis: "Left renal mass", indication: "Tissue diagnosis", estimated_duration_minutes: 90, weight_kg: 28.3, asa_class: "II" }),
  surgicalCase("c20", "p15", "sp-other", "Port Insertion", "Elective", "Postponed", { diagnosis: "Need for chemotherapy access", indication: "Long-term venous access", estimated_duration_minutes: 60, weight_kg: 15.6, asa_class: "II" }),
  surgicalCase("c21", "p16", "sp-urology", "Urethroplasty", "Elective", "Booked", { diagnosis: "Urethral stricture", indication: "Definitive repair", estimated_duration_minutes: 160, weight_kg: 22.0 }),
  surgicalCase("c22", "p17", "sp-colorectal", "Ileostomy Closure", "Elective", "Done", { diagnosis: "Protective ileostomy", indication: "Restoration of continuity", estimated_duration_minutes: 130, weight_kg: 13.1 }),
  surgicalCase("c23", "p18", "sp-oncology", "Excision Biopsy", "Semi-urgent", "Booked", { diagnosis: "Abdominal wall mass", indication: "Histology", estimated_duration_minutes: 70, weight_kg: 9.8 }),
  surgicalCase("c24", "p7", "sp-urology", "Ureteric Reimplantation", "Elective", "Booked", { diagnosis: "Ectopic ureter", indication: "Recurrent infections", estimated_duration_minutes: 160, weight_kg: 10.2 }),
  surgicalCase("c25", "p9", "sp-minor", "Central Line Insertion", "Elective", "Booked", { diagnosis: "Need for prolonged antibiotics", indication: "Long line placement", estimated_duration_minutes: 45, weight_kg: 17.8, asa_class: "I" }),
  surgicalCase("c26", "p11", "sp-uppergi", "Oesophageal Dilatation", "Semi-urgent", "Booked", { diagnosis: "Anastomotic stricture", indication: "Dysphagia", estimated_duration_minutes: 60, weight_kg: 20.1 }),
  surgicalCase("c27", "p16", "sp-urology", "Pyeloplasty", "Elective", "Done", { diagnosis: "UPJO", indication: "Persistent pain and dilatation", estimated_duration_minutes: 150, weight_kg: 22.0 }),
  surgicalCase("c28", "p17", "sp-colorectal", "Pull-through Revision", "Semi-urgent", "Booked", { diagnosis: "Residual cuff issues", indication: "Ongoing obstructive symptoms", estimated_duration_minutes: 190, weight_kg: 13.1, asa_class: "III" }),
  surgicalCase("c29", "p18", "sp-other", "Hydrocele Repair", "Elective", "Booked", { diagnosis: "Communicating hydrocele", indication: "Persistent symptoms", estimated_duration_minutes: 55, weight_kg: 9.8, asa_class: "I" }),
  surgicalCase("c30", "p14", "sp-oncology", "Port Removal", "Elective", "Booked", { diagnosis: "Completed treatment", indication: "Device no longer required", estimated_duration_minutes: 40, weight_kg: 28.3, asa_class: "I" }),
  surgicalCase("c31", "p12", "sp-other", "Patent Urachus Excision", "Elective", "Booked", { diagnosis: "Patent urachus", indication: "Persistent discharge", estimated_duration_minutes: 85, weight_kg: 12.5, asa_class: "I" }),
  surgicalCase("c32", "p19", "sp-urology", "Ureteric Reimplantation", "Elective", "Done", { diagnosis: "Grade IV VUR", indication: "Breakthrough infections", estimated_duration_minutes: 150, weight_kg: 18.3 }),
  surgicalCase("c33", "p20", "sp-minor", "Cystoscopy", "Elective", "Done", { diagnosis: "Recurrent haematuria", indication: "Diagnostic evaluation", estimated_duration_minutes: 45, weight_kg: 24.6, asa_class: "I" }),
  surgicalCase("c34", "p21", "sp-uppergi", "Gastrostomy Insertion", "Semi-urgent", "Cancelled", { diagnosis: "Feeding difficulty", indication: "Long-term enteral access", estimated_duration_minutes: 90, weight_kg: 11.8 }),
  surgicalCase("c35", "p22", "sp-colorectal", "Stoma Revision", "Semi-urgent", "Done", { diagnosis: "Stomal prolapse", indication: "Difficult appliance fitting", estimated_duration_minutes: 110, weight_kg: 20.4 }),
  surgicalCase("c36", "p23", "sp-oncology", "Biopsy of Abdominal Mass", "Urgent", "Booked", { diagnosis: "Abdominal mass", indication: "Tissue diagnosis", estimated_duration_minutes: 80, weight_kg: 10.9 }),
  surgicalCase("c37", "p24", "sp-urology", "Orchidopexy", "Elective", "Done", { diagnosis: "Undescended right testis", indication: "Definitive fixation", estimated_duration_minutes: 75, weight_kg: 26.2 }),
  surgicalCase("c38", "p25", "sp-hernia", "Inguinal Hernia Repair", "Elective", "Done", { diagnosis: "Right inguinal hernia", indication: "Reducible hernia", estimated_duration_minutes: 70, weight_kg: 17.7 }),
  surgicalCase("c39", "p26", "sp-uppergi", "Laparotomy for Adhesiolysis", "Urgent", "Booked", { diagnosis: "Adhesive bowel obstruction", indication: "Recurrent admissions", estimated_duration_minutes: 170, weight_kg: 14.1, asa_class: "III" }),
  surgicalCase("c40", "p27", "sp-urology", "Posterior Urethral Valve Ablation", "Urgent", "Done", { diagnosis: "Posterior urethral valves", indication: "Obstructive uropathy", estimated_duration_minutes: 95, weight_kg: 23.2 }),
  surgicalCase("c41", "p28", "sp-minor", "Broviac Line Insertion", "Semi-urgent", "Done", { diagnosis: "Need for prolonged IV access", indication: "Long-term access", estimated_duration_minutes: 60, weight_kg: 8.7 }),
  surgicalCase("c42", "p29", "sp-oncology", "Lymph Node Biopsy", "Urgent", "Done", { diagnosis: "Persistent cervical nodes", indication: "Histology", estimated_duration_minutes: 70, weight_kg: 19.4 }),
  surgicalCase("c43", "p30", "sp-other", "Excision of Thyroglossal Cyst", "Elective", "Done", { diagnosis: "Thyroglossal cyst", indication: "Recurrent infection", estimated_duration_minutes: 100, weight_kg: 16.7 }),
  surgicalCase("c44", "p31", "sp-urology", "Pyelolithotomy", "Semi-urgent", "Done", { diagnosis: "Renal pelvic stone", indication: "Persistent pain", estimated_duration_minutes: 140, weight_kg: 29.1 }),
  surgicalCase("c45", "p32", "sp-hernia", "Umbilical Hernia Repair", "Elective", "Cancelled", { diagnosis: "Umbilical hernia", indication: "Symptomatic hernia", estimated_duration_minutes: 55, weight_kg: 12.3, asa_class: "I" }),
  surgicalCase("c46", "p33", "sp-uppergi", "Fundoplication", "Urgent", "Done", { diagnosis: "Severe reflux", indication: "Aspiration risk", estimated_duration_minutes: 150, weight_kg: 11.4, asa_class: "III" }),
  surgicalCase("c47", "p34", "sp-colorectal", "Seton Placement", "Semi-urgent", "Done", { diagnosis: "Perianal fistula", indication: "Persistent sepsis", estimated_duration_minutes: 60, weight_kg: 21.7 }),
  surgicalCase("c48", "p35", "sp-urology", "Hypospadias Repair", "Elective", "Done", { diagnosis: "Mid-shaft hypospadias", indication: "Planned reconstruction", estimated_duration_minutes: 160, weight_kg: 18.5 }),
  surgicalCase("c49", "p36", "sp-minor", "Tongue Tie Release", "Elective", "Booked", { diagnosis: "Ankyloglossia", indication: "Feeding difficulty", estimated_duration_minutes: 30, weight_kg: 8.9, asa_class: "I" }),

  // --- New cases c50–c86 ---

  // June 9 (past, done)
  surgicalCase("c50", "p37", "sp-hernia", "Umbilical Hernia Repair", "Elective", "Done", { diagnosis: "Umbilical hernia", indication: "Symptomatic since infancy", estimated_duration_minutes: 55, weight_kg: 14.2, asa_class: "I" }),
  surgicalCase("c51", "p38", "sp-urology", "Cystoscopy and Ureteric Stent Insertion", "Semi-urgent", "Done", { diagnosis: "Ureteric stone with obstruction", indication: "Hydronephrosis and pain", estimated_duration_minutes: 60, weight_kg: 17.5 }),
  surgicalCase("c52", "p39", "sp-uppergi", "Gastrostomy Insertion", "Semi-urgent", "Cancelled", { diagnosis: "Failure to thrive", indication: "Long-term enteral feeding", estimated_duration_minutes: 90, weight_kg: 9.1, asa_class: "III" }),

  // June 30 (future)
  surgicalCase("c53", "p40", "sp-urology", "Hypospadias Repair", "Elective", "Booked", { diagnosis: "Mid-shaft hypospadias", indication: "Planned reconstruction", estimated_duration_minutes: 140, weight_kg: 21.3 }),
  surgicalCase("c54", "p41", "sp-colorectal", "Ileostomy Formation", "Urgent", "Booked", { diagnosis: "Anorectal malformation", indication: "Defunctioning prior to repair", estimated_duration_minutes: 120, weight_kg: 10.4, asa_class: "III", special_requirements: "HDU bed required" }),
  surgicalCase("c55", "p42", "sp-hernia", "Orchidopexy", "Elective", "Booked", { diagnosis: "Undescended left testis", indication: "Elective fixation", estimated_duration_minutes: 75, weight_kg: 15.9, asa_class: "I" }),

  // July 7 additions (already has c18)
  surgicalCase("c56", "p43", "sp-urology", "Urethroplasty", "Elective", "Booked", { diagnosis: "Urethral stricture post-hypospadias", indication: "Obstructive voiding", estimated_duration_minutes: 160, weight_kg: 11.8 }),
  surgicalCase("c57", "p44", "sp-other", "Laparotomy for Adhesiolysis", "Urgent", "Booked", { diagnosis: "Adhesive small bowel obstruction", indication: "Recurrent episodes, failed conservative", estimated_duration_minutes: 170, weight_kg: 30.1, asa_class: "III", special_requirements: "Blood grouped and saved" }),

  // July 14
  surgicalCase("c58", "p45", "sp-uppergi", "Pyloromyotomy", "Urgent", "Booked", { diagnosis: "Hypertrophic pyloric stenosis", indication: "Projectile vomiting, confirmed on ultrasound", estimated_duration_minutes: 60, weight_kg: 4.2, asa_class: "II", special_requirements: "Electrolytes corrected pre-operatively" }),
  surgicalCase("c59", "p46", "sp-urology", "Pyeloplasty", "Elective", "Booked", { diagnosis: "UPJO right kidney", indication: "Progressive hydronephrosis on MAG3", estimated_duration_minutes: 150, weight_kg: 14.8 }),
  surgicalCase("c60", "p47", "sp-oncology", "Wilms Tumour Nephrectomy", "Urgent", "Booked", { diagnosis: "Left Wilms tumour", indication: "Post-chemotherapy resection", estimated_duration_minutes: 200, weight_kg: 25.6, asa_class: "III", comorbidities: "Post-chemotherapy", special_requirements: "ICU bed, blood available" }),

  // July 21
  surgicalCase("c61", "p48", "sp-colorectal", "Colostomy Takedown", "Elective", "Booked", { diagnosis: "Anorectal malformation", indication: "Stoma closure after successful pull-through", estimated_duration_minutes: 130, weight_kg: 12.3 }),
  surgicalCase("c62", "p49", "sp-hpb", "Choledochal Cyst Excision", "Urgent", "Booked", { diagnosis: "Type I choledochal cyst", indication: "Recurrent cholangitis", estimated_duration_minutes: 220, weight_kg: 18.7, asa_class: "III", special_requirements: "MRCP reviewed in MDT" }),
  surgicalCase("c63", "p50", "sp-urology", "Posterior Urethral Valve Ablation", "Urgent", "Booked", { diagnosis: "Posterior urethral valves", indication: "Obstructive uropathy with recurrent UTIs", estimated_duration_minutes: 95, weight_kg: 13.6, asa_class: "II" }),

  // July 28
  surgicalCase("c64", "p37", "sp-uppergi", "Fundoplication", "Elective", "Booked", { diagnosis: "Severe gastro-oesophageal reflux", indication: "Aspiration events and growth failure", estimated_duration_minutes: 140, weight_kg: 15.0, asa_class: "II" }),
  surgicalCase("c65", "p38", "sp-minor", "Port Insertion", "Semi-urgent", "Booked", { diagnosis: "Acute lymphoblastic leukaemia", indication: "Long-term chemotherapy access", estimated_duration_minutes: 55, weight_kg: 18.1, asa_class: "II" }),
  surgicalCase("c66", "p39", "sp-other", "Excision of Dermoid Cyst", "Elective", "Booked", { diagnosis: "Midline dermoid cyst", indication: "Enlarging mass, cosmetic and risk of infection", estimated_duration_minutes: 70, weight_kg: 9.8, asa_class: "I" }),

  // August 4
  surgicalCase("c67", "p40", "sp-uppergi", "Ladd Procedure", "Urgent", "Booked", { diagnosis: "Intestinal malrotation", indication: "Recurrent bilious vomiting, risk of volvulus", estimated_duration_minutes: 160, weight_kg: 22.0, asa_class: "II" }),
  surgicalCase("c68", "p41", "sp-urology", "Hypospadias Repair", "Elective", "Booked", { diagnosis: "Distal hypospadias", indication: "Planned primary repair", estimated_duration_minutes: 130, weight_kg: 10.8, asa_class: "I" }),
  surgicalCase("c69", "p42", "sp-other", "Appendicostomy Revision", "Semi-urgent", "Booked", { diagnosis: "Stomal stenosis", indication: "Obstruction to antegrade flushes", estimated_duration_minutes: 120, weight_kg: 16.2 }),

  // August 11 additions (already has c30)
  surgicalCase("c70", "p43", "sp-uppergi", "Oesophageal Stricture Dilatation", "Semi-urgent", "Booked", { diagnosis: "Caustic oesophageal stricture", indication: "Dysphagia", estimated_duration_minutes: 70, weight_kg: 12.0 }),
  surgicalCase("c71", "p44", "sp-oncology", "Lymph Node Biopsy", "Urgent", "Booked", { diagnosis: "Anterior mediastinal mass", indication: "Histological diagnosis", estimated_duration_minutes: 90, weight_kg: 30.5, asa_class: "III", special_requirements: "Anaesthesia risk assessment — airway" }),

  // August 18
  surgicalCase("c72", "p45", "sp-urology", "Ureteric Reimplantation", "Elective", "Booked", { diagnosis: "High-grade VUR", indication: "Breakthrough infections", estimated_duration_minutes: 160, weight_kg: 21.2 }),
  surgicalCase("c73", "p46", "sp-colorectal", "Pull-through Revision", "Semi-urgent", "Booked", { diagnosis: "Residual cuff", indication: "Enterocolitis and obstructive symptoms", estimated_duration_minutes: 180, weight_kg: 14.5, asa_class: "III" }),
  surgicalCase("c74", "p47", "sp-minor", "Central Line Insertion", "Elective", "Booked", { diagnosis: "Haematological malignancy", indication: "Long-term IV access", estimated_duration_minutes: 55, weight_kg: 26.3, asa_class: "II" }),

  // August 25
  surgicalCase("c75", "p48", "sp-hpb", "Hepatoportoenterostomy (Kasai)", "Urgent", "Booked", { diagnosis: "Biliary atresia", indication: "Age-appropriate window for Kasai", estimated_duration_minutes: 240, weight_kg: 7.4, asa_class: "III", special_requirements: "ICU bed, blood available, neonatal team" }),
  surgicalCase("c76", "p49", "sp-hernia", "Bilateral Inguinal Hernia Repair", "Elective", "Booked", { diagnosis: "Bilateral inguinal hernias", indication: "Symptomatic reducible hernias", estimated_duration_minutes: 90, weight_kg: 18.2, asa_class: "I" }),

  // September 1
  surgicalCase("c77", "p50", "sp-urology", "Pyelolithotomy", "Semi-urgent", "Booked", { diagnosis: "Staghorn calculus left kidney", indication: "Recurrent infections and obstruction", estimated_duration_minutes: 150, weight_kg: 14.0 }),
  surgicalCase("c78", "p37", "sp-oncology", "Biopsy of Abdominal Mass", "Urgent", "Booked", { diagnosis: "Retroperitoneal mass", indication: "Tissue diagnosis for oncology MDT", estimated_duration_minutes: 90, weight_kg: 15.3, asa_class: "II", special_requirements: "Pathologist on standby for intraoperative frozen section" }),

  // September 8 additions (already has c19)
  surgicalCase("c79", "p38", "sp-colorectal", "Colostomy Takedown", "Elective", "Booked", { diagnosis: "Sigmoid colostomy", indication: "Restoration of bowel continuity", estimated_duration_minutes: 130, weight_kg: 18.8 }),
  surgicalCase("c80", "p39", "sp-urology", "Bladder Augmentation", "Elective", "Booked", { diagnosis: "Neuropathic bladder", indication: "Recurrent UTIs, low-capacity bladder", estimated_duration_minutes: 210, weight_kg: 10.2, asa_class: "II" }),

  // September 15
  surgicalCase("c81", "p40", "sp-oncology", "Adrenal Mass Excision", "Urgent", "Booked", { diagnosis: "Right adrenal neuroblastoma", indication: "Resectable after chemotherapy", estimated_duration_minutes: 200, weight_kg: 23.0, asa_class: "III", special_requirements: "Endocrine team, ICU bed" }),
  surgicalCase("c82", "p41", "sp-minor", "Tongue-Tie Release", "Elective", "Booked", { diagnosis: "Ankyloglossia", indication: "Feeding and speech difficulty", estimated_duration_minutes: 30, weight_kg: 11.1, asa_class: "I" }),

  // September 22
  surgicalCase("c83", "p42", "sp-urology", "Nephrectomy (Non-functioning Kidney)", "Elective", "Booked", { diagnosis: "Non-functioning right kidney", indication: "Recurrent pain and infections", estimated_duration_minutes: 170, weight_kg: 17.0 }),
  surgicalCase("c84", "p43", "sp-other", "Excision of Sacrococcygeal Teratoma", "Semi-urgent", "Booked", { diagnosis: "Sacrococcygeal teratoma", indication: "Growing mass, risk of malignant change", estimated_duration_minutes: 160, weight_kg: 12.0, asa_class: "II" }),

  // September 29
  surgicalCase("c85", "p44", "sp-urology", "Ureteroscopy and Lithotripsy", "Elective", "Booked", { diagnosis: "Ureteric stone", indication: "Failed conservative management", estimated_duration_minutes: 90, weight_kg: 31.2, asa_class: "I" }),
  surgicalCase("c86", "p45", "sp-hernia", "Umbilical Hernia Repair", "Elective", "Booked", { diagnosis: "Large umbilical hernia", indication: "Symptomatic", estimated_duration_minutes: 55, weight_kg: 22.5, asa_class: "I" }),
];

const preop_assessments: OrodhaData["preop_assessments"] = [
  // --- Existing pa1–pa49 ---
  preop("pa1", "c1", { anaesthesia_status: "Cleared", nursing_status: "Pending", labs_required: true, labs_done: true, imaging_required: true, imaging_done: true, preop_notes: "MAG3 renogram done. Parent counselled.", assessed_at: now }),
  preop("pa2", "c2", { anaesthesia_status: "Pending", labs_required: true, labs_done: false, blood_required: true, blood_available: false, preop_notes: "Bowel prep plan to confirm." }),
  preop("pa3", "c3", { anaesthesia_status: "Not assessed", surgical_status: "Pending", nursing_status: "Not assessed", consent_done: false, fasting_instructions_given: false, financial_clearance: false }),
  preop("pa4", "c4", { anaesthesia_status: "Not cleared", labs_required: true, labs_done: true, imaging_required: true, imaging_done: true, blood_required: true, blood_available: false, financial_clearance: false, preop_notes: "Original date postponed pending ICU and blood availability.", assessed_at: now }),
  preop("pa5", "c5", { anaesthesia_status: "Cleared", surgical_status: "Cleared", nursing_status: "Cleared", preop_notes: "Completed uneventfully.", assessed_at: now }),
  preop("pa6", "c6", { anaesthesia_status: "Cleared", surgical_status: "Cleared", nursing_status: "Cleared", labs_required: true, labs_done: true, preop_notes: "Bowel prep completed.", assessed_at: now }),
  preop("pa7", "c7", { anaesthesia_status: "Cleared", surgical_status: "Cleared", nursing_status: "Cleared", assessed_at: now }),
  preop("pa8", "c8", { anaesthesia_status: "Cleared", surgical_status: "Cleared", nursing_status: "Cleared", labs_required: true, labs_done: true, imaging_required: true, imaging_done: true, blood_required: true, blood_available: true, preop_notes: "ICU bed reserved.", assessed_at: now }),
  preop("pa9", "c9", { labs_required: true, labs_done: true, imaging_required: true, imaging_done: true, blood_required: true, blood_available: true, preop_notes: "CT reviewed in MDT.", assessed_at: now }),
  preop("pa10", "c10", { consent_done: false, fasting_instructions_given: false }),
  preop("pa11", "c11", { anaesthesia_status: "Pending", preop_notes: "Cancelled due to intercurrent URTI." }),
  preop("pa12", "c12", { labs_required: true, labs_done: true, preop_notes: "Rebooked after anaesthesia review.", assessed_at: now }),
  preop("pa13", "c13", { anaesthesia_status: "Cleared", surgical_status: "Cleared", nursing_status: "Cleared", assessed_at: now }),
  preop("pa14", "c14", { labs_required: true, labs_done: true, blood_required: true, blood_available: true, preop_notes: "Urodynamics filed.", assessed_at: now }),
  preop("pa15", "c15", { financial_clearance: false, preop_notes: "Family requested deferment." }),
  preop("pa16", "c16", { labs_required: true, labs_done: true, imaging_required: true, imaging_done: true, blood_required: true, blood_available: true, preop_notes: "MRCP images uploaded.", assessed_at: now }),
  preop("pa17", "c17", { anaesthesia_status: "Cleared", surgical_status: "Cleared", nursing_status: "Cleared", assessed_at: now }),
  preop("pa18", "c18", { labs_required: true, labs_done: true, preop_notes: "Intermittent bilious vomiting. Prioritise if symptoms worsen." }),
  preop("pa19", "c19", { imaging_required: true, imaging_done: true, labs_required: true, labs_done: true, preop_notes: "Cross-match available.", assessed_at: now }),
  preop("pa20", "c20", { preop_notes: "Family did not attend for original date.", financial_clearance: false }),
  preop("pa21", "c21", { labs_required: true, labs_done: true, preop_notes: "Urethrogram reviewed.", assessed_at: now }),
  preop("pa22", "c22", { labs_required: true, labs_done: true, preop_notes: "Stoma output reducing appropriately.", assessed_at: now }),
  preop("pa23", "c23", { preop_notes: "Short case. Day-case review acceptable.", assessed_at: now }),
  preop("pa24", "c24", { labs_required: true, labs_done: true, preop_notes: "DMSA reviewed.", assessed_at: now }),
  preop("pa25", "c25", { preop_notes: "Ward antibiotics ongoing.", assessed_at: now }),
  preop("pa26", "c26", { preop_notes: "Swallow study uploaded.", assessed_at: now }),
  preop("pa27", "c27", { labs_required: true, labs_done: true, imaging_required: true, imaging_done: true, preop_notes: "Renal split function stable.", assessed_at: now }),
  preop("pa28", "c28", { labs_required: true, labs_done: true, preop_notes: "To be discussed in morning brief.", assessed_at: now }),
  preop("pa29", "c29", { assessed_at: now }),
  preop("pa30", "c30", { assessed_at: now }),
  preop("pa31", "c31", { labs_required: true, labs_done: true, assessed_at: now }),
  preop("pa32", "c32", { labs_required: true, labs_done: true, imaging_required: true, imaging_done: true, assessed_at: now, preop_notes: "MCUG reviewed pre-op." }),
  preop("pa33", "c33", { assessed_at: now, preop_notes: "Normal coagulation profile." }),
  preop("pa34", "c34", { anaesthesia_status: "Pending", financial_clearance: false, preop_notes: "Cancelled after family requested more time for counselling." }),
  preop("pa35", "c35", { labs_required: true, labs_done: true, assessed_at: now, preop_notes: "Stoma nurse reviewed and marked." }),
  preop("pa36", "c36", { labs_required: true, labs_done: true, imaging_required: true, imaging_done: true, blood_required: true, blood_available: true, preop_notes: "No-show in February; rebooked for April list.", assessed_at: now }),
  preop("pa37", "c37", { assessed_at: now }),
  preop("pa38", "c38", { assessed_at: now }),
  preop("pa39", "c39", { labs_required: true, labs_done: true, imaging_required: true, imaging_done: true, blood_required: true, blood_available: true, preop_notes: "Rebooked after bowel rest and repeat review.", assessed_at: now }),
  preop("pa40", "c40", { labs_required: true, labs_done: true, assessed_at: now }),
  preop("pa41", "c41", { assessed_at: now }),
  preop("pa42", "c42", { labs_required: true, labs_done: true, assessed_at: now }),
  preop("pa43", "c43", { assessed_at: now }),
  preop("pa44", "c44", { labs_required: true, labs_done: true, assessed_at: now }),
  preop("pa45", "c45", { preop_notes: "Cancelled due to active URTI symptoms on pre-op review." }),
  preop("pa46", "c46", { labs_required: true, labs_done: true, blood_required: true, blood_available: true, assessed_at: now }),
  preop("pa47", "c47", { assessed_at: now }),
  preop("pa48", "c48", { assessed_at: now }),
  preop("pa49", "c49", { assessed_at: now, preop_notes: "Short day-case procedure." }),

  // --- New pa50–pa86 ---
  preop("pa50", "c50", { anaesthesia_status: "Cleared", surgical_status: "Cleared", nursing_status: "Cleared", assessed_at: now }),
  preop("pa51", "c51", { anaesthesia_status: "Cleared", surgical_status: "Cleared", nursing_status: "Cleared", labs_required: true, labs_done: true, assessed_at: now, preop_notes: "KUB reviewed." }),
  preop("pa52", "c52", { financial_clearance: false, consent_done: false, preop_notes: "Family not ready for procedure." }),
  preop("pa53", "c53", { labs_required: true, labs_done: true, preop_notes: "Urethrogram available.", assessed_at: now }),
  preop("pa54", "c54", { labs_required: true, labs_done: true, blood_required: true, blood_available: true, preop_notes: "HDU bed confirmed.", assessed_at: now }),
  preop("pa55", "c55"),
  preop("pa56", "c56", { labs_required: true, labs_done: true, preop_notes: "Urethrogram reviewed.", assessed_at: now }),
  preop("pa57", "c57", { labs_required: true, labs_done: true, imaging_required: true, imaging_done: true, blood_required: true, blood_available: true, preop_notes: "CT abdomen reviewed.", assessed_at: now }),
  preop("pa58", "c58", { labs_required: true, labs_done: true, preop_notes: "Electrolytes corrected. Ultrasound confirmed.", assessed_at: now }),
  preop("pa59", "c59", { labs_required: true, labs_done: true, imaging_required: true, imaging_done: true, preop_notes: "MAG3 available.", assessed_at: now }),
  preop("pa60", "c60", { labs_required: true, labs_done: true, imaging_required: true, imaging_done: true, blood_required: true, blood_available: true, preop_notes: "Post-chemo bloods stable. ICU and blood confirmed.", assessed_at: now }),
  preop("pa61", "c61", { labs_required: true, labs_done: true, assessed_at: now, preop_notes: "Stoma output reviewed." }),
  preop("pa62", "c62", { labs_required: true, labs_done: true, imaging_required: true, imaging_done: true, blood_required: true, blood_available: true, preop_notes: "MRCP reviewed in MDT.", assessed_at: now }),
  preop("pa63", "c63", { labs_required: true, labs_done: true, preop_notes: "Urodynamics and MAG3 available.", assessed_at: now }),
  preop("pa64", "c64", { labs_required: true, labs_done: true, preop_notes: "pH study done. Growth chart reviewed.", assessed_at: now }),
  preop("pa65", "c65", { preop_notes: "Oncology team consent obtained.", assessed_at: now }),
  preop("pa66", "c66"),
  preop("pa67", "c67", { labs_required: true, labs_done: true, imaging_required: true, imaging_done: true, preop_notes: "Upper GI contrast study reviewed.", assessed_at: now }),
  preop("pa68", "c68", { anaesthesia_status: "Cleared", surgical_status: "Cleared", nursing_status: "Cleared", assessed_at: now }),
  preop("pa69", "c69", { labs_required: true, labs_done: true, preop_notes: "Stoma therapist review booked." }),
  preop("pa70", "c70", { preop_notes: "Endoscopy report reviewed.", assessed_at: now }),
  preop("pa71", "c71", { labs_required: true, labs_done: true, imaging_required: true, imaging_done: true, preop_notes: "CT chest reviewed. Anaesthesia airway risk noted.", assessed_at: now }),
  preop("pa72", "c72", { labs_required: true, labs_done: true, imaging_required: true, imaging_done: true, preop_notes: "DMSA reviewed." }),
  preop("pa73", "c73", { labs_required: true, labs_done: true, preop_notes: "Rectal biopsy reviewed." }),
  preop("pa74", "c74", { preop_notes: "Oncology consent obtained.", assessed_at: now }),
  preop("pa75", "c75", { labs_required: true, labs_done: true, blood_required: true, blood_available: true, preop_notes: "ICU bed confirmed. Neonatal bloods acceptable.", assessed_at: now }),
  preop("pa76", "c76"),
  preop("pa77", "c77", { labs_required: true, labs_done: true, imaging_required: true, imaging_done: true, preop_notes: "CT KUB reviewed." }),
  preop("pa78", "c78", { labs_required: true, labs_done: true, imaging_required: true, imaging_done: true, preop_notes: "MRI abdomen reviewed. Pathologist notified.", assessed_at: now }),
  preop("pa79", "c79", { labs_required: true, labs_done: true, preop_notes: "Stoma output reducing. Nutritional status reviewed." }),
  preop("pa80", "c80", { labs_required: true, labs_done: true, imaging_required: true, imaging_done: true, preop_notes: "Urodynamics reviewed. CIC plan in place." }),
  preop("pa81", "c81", { labs_required: true, labs_done: true, imaging_required: true, imaging_done: true, blood_required: true, blood_available: true, preop_notes: "Post-chemo imaging stable. ICU confirmed.", assessed_at: now }),
  preop("pa82", "c82", { anaesthesia_status: "Cleared", surgical_status: "Cleared", nursing_status: "Cleared", assessed_at: now }),
  preop("pa83", "c83", { labs_required: true, labs_done: true, imaging_required: true, imaging_done: true, preop_notes: "DMSA and MAG3 available." }),
  preop("pa84", "c84", { labs_required: true, labs_done: true, imaging_required: true, imaging_done: true, preop_notes: "MRI reviewed in oncology MDT.", assessed_at: now }),
  preop("pa85", "c85", { labs_required: true, labs_done: true, imaging_required: true, imaging_done: true, preop_notes: "CT urogram reviewed." }),
  preop("pa86", "c86"),
];

const bookings: OrodhaData["bookings"] = [
  // --- Existing bookings (b9, b17, b25, b26 status updated to "Done") ---
  booking("b6", "c6", "ts-2026-04-14", 1, "Done", { postop_destination: "Ward", outcome_notes: "Completed." }),
  booking("b7", "c7", "ts-2026-04-14", 2, "Done", { postop_destination: "Day case", outcome_notes: "Completed." }),
  booking("b8", "c8", "ts-2026-04-14", 3, "Done", { postop_destination: "ICU", outcome_notes: "Completed." }),
  booking("b11", "c11", "ts-2026-04-17", 1, "Cancelled", { cancellation_reason: "Upper respiratory tract infection", postop_destination: null }),
  booking("b18", "c17", "ts-2026-04-17", 2, "Done", { postop_destination: "Day case", outcome_notes: "Completed." }),
  booking("b20", "c20", "ts-2026-04-17", 3, "No-show", { postop_destination: null, outcome_notes: "Family did not arrive for admission." }),
  booking("b14", "c13", "ts-2026-04-21", 1, "Done", { postop_destination: "Ward", outcome_notes: "Completed." }),
  booking("b31", "c4", "ts-2026-04-21", 2, "Postponed", { postop_destination: "ICU", postponement_reason: "No ICU bed available" }),
  booking("b5", "c5", "ts-2026-04-24", 1, "Done", { postop_destination: "Day case", outcome_notes: "Discharged stable." }),
  booking("b1", "c1", "ts-2026-04-28", 1, "Booked", { postop_destination: "Ward" }),
  booking("b2", "c2", "ts-2026-04-29", 1, "Booked", { postop_destination: "HDU" }),
  booking("b33", "c21", "ts-2026-04-29", 2, "Booked", { postop_destination: "Ward" }),
  booking("b34", "c24", "ts-2026-04-29", 3, "Booked", { postop_destination: "Ward" }),
  booking("b4", "c4", "ts-2026-05-05", 1, "Booked", { postop_destination: "ICU" }),
  booking("b22", "c23", "ts-2026-05-05", 2, "Booked", { postop_destination: "Ward" }),
  booking("b23", "c25", "ts-2026-05-05", 3, "Booked", { postop_destination: "Ward" }),
  booking("b24", "c26", "ts-2026-05-05", 4, "Booked", { postop_destination: "Ward" }),
  booking("b15", "c14", "ts-2026-05-12", 1, "Booked", { postop_destination: "Ward" }),
  booking("b10", "c10", "ts-2026-05-12", 2, "Booked", { postop_destination: "Ward" }),
  booking("b12", "c12", "ts-2026-05-19", 2, "Postponed", { postop_destination: "Ward", postponement_reason: "Anaesthesia review incomplete" }),
  booking("b35", "c29", "ts-2026-05-26", 1, "Booked", { postop_destination: "Day case" }),
  booking("b16", "c15", "ts-2026-05-26", 3, "Cancelled", { postop_destination: null, cancellation_reason: "Family requested deferment" }),
  booking("b9", "c9", "ts-2026-06-04", 3, "Done", { postop_destination: "HDU", outcome_notes: "Nodal tissue sent to histopathology. Good haemostasis achieved." }),
  booking("b17", "c16", "ts-2026-06-16", 1, "Done", { postop_destination: "HDU", outcome_notes: "Choledochal cyst excised. Roux-en-Y hepaticojejunostomy performed." }),
  booking("b25", "c22", "ts-2026-06-16", 2, "Done", { postop_destination: "Ward", outcome_notes: "Continuity restored. Good anastomosis." }),
  booking("b26", "c27", "ts-2026-06-16", 3, "Done", { postop_destination: "Ward", outcome_notes: "Pyeloplasty completed. JJ stent left in situ." }),
  booking("b27", "c28", "ts-2026-06-23", 1, "Booked", { postop_destination: "Ward" }),
  booking("b13", "c12", "ts-2026-06-23", 2, "Booked", { postop_destination: "Ward" }),
  booking("b19", "c18", "ts-2026-07-07", 1, "Booked", { postop_destination: "Ward" }),
  booking("b36", "c32", "ts-2026-02-03", 1, "Done", { postop_destination: "Ward", outcome_notes: "Smooth recovery." }),
  booking("b37", "c33", "ts-2026-02-03", 2, "Done", { postop_destination: "Day case", outcome_notes: "Discharged same day." }),
  booking("b38", "c34", "ts-2026-02-03", 3, "Cancelled", { postop_destination: null, cancellation_reason: "Family requested deferment" }),
  booking("b39", "c35", "ts-2026-02-10", 1, "Done", { postop_destination: "Ward", outcome_notes: "Revised successfully." }),
  booking("b40", "c36", "ts-2026-02-10", 2, "No-show", { postop_destination: null, outcome_notes: "Family unreachable on admission day." }),
  booking("b41", "c37", "ts-2026-02-10", 3, "Done", { postop_destination: "Day case", outcome_notes: "Stable after recovery." }),
  booking("b42", "c38", "ts-2026-02-17", 1, "Done", { postop_destination: "Day case", outcome_notes: "Completed uneventfully." }),
  booking("b43", "c39", "ts-2026-02-17", 2, "Postponed", { postop_destination: "Ward", postponement_reason: "Needed repeat imaging and bowel optimisation" }),
  booking("b44", "c40", "ts-2026-02-17", 3, "Done", { postop_destination: "Ward", outcome_notes: "Valve ablation completed." }),
  booking("b45", "c41", "ts-2026-02-24", 1, "Done", { postop_destination: "Ward", outcome_notes: "Line functioning well." }),
  booking("b46", "c42", "ts-2026-02-24", 2, "Done", { postop_destination: "Ward", outcome_notes: "Biopsy samples sent." }),
  booking("b47", "c43", "ts-2026-03-03", 1, "Done", { postop_destination: "Ward", outcome_notes: "Cyst excised completely." }),
  booking("b48", "c44", "ts-2026-03-03", 2, "Done", { postop_destination: "Ward", outcome_notes: "Stone removed." }),
  booking("b49", "c45", "ts-2026-03-03", 3, "Cancelled", { postop_destination: null, cancellation_reason: "Upper respiratory tract infection" }),
  booking("b50", "c46", "ts-2026-03-10", 1, "Done", { postop_destination: "HDU", outcome_notes: "Observed overnight." }),
  booking("b51", "c47", "ts-2026-03-10", 2, "Done", { postop_destination: "Ward", outcome_notes: "Improved pain control post-op." }),
  booking("b52", "c48", "ts-2026-03-17", 1, "Done", { postop_destination: "Ward", outcome_notes: "Dressing dry in recovery." }),
  booking("b53", "c49", "ts-2026-03-17", 2, "Postponed", { postop_destination: "Day case", postponement_reason: "Anaesthetist requested repeat fasting interval" }),
  booking("b54", "c39", "ts-2026-03-24", 1, "Done", { postop_destination: "Ward", outcome_notes: "Completed after relisting." }),
  booking("b55", "c49", "ts-2026-04-28", 2, "Booked", { postop_destination: "Day case" }),
  booking("b56", "c36", "ts-2026-04-21", 3, "Booked", { postop_destination: "Ward" }),
  booking("b28", "c30", "ts-2026-08-11", 2, "Booked", { postop_destination: "Day case" }),
  booking("b21", "c19", "ts-2026-09-08", 1, "Booked", { postop_destination: "Ward" }),
  booking("b29", "c31", "ts-2026-11-03", 1, "Booked", { postop_destination: "Ward" }),

  // --- New bookings b57–b93 ---

  // June 9 (past, done)
  booking("b57", "c50", "ts-2026-06-09", 1, "Done", { outcome_notes: "Hernia sac excised. Mesh not required." }),
  booking("b58", "c51", "ts-2026-06-09", 2, "Done", { outcome_notes: "Stent inserted. Good drainage confirmed on fluoroscopy.", postop_destination: "Day case" }),
  booking("b59", "c52", "ts-2026-06-09", 3, "Cancelled", { postop_destination: null, cancellation_reason: "Family not ready; requested further counselling" }),

  // June 30
  booking("b60", "c53", "ts-2026-06-30", 1, "Booked"),
  booking("b61", "c54", "ts-2026-06-30", 2, "Booked", { postop_destination: "HDU" }),
  booking("b62", "c55", "ts-2026-06-30", 3, "Booked", { postop_destination: "Day case" }),

  // July 7
  booking("b63", "c56", "ts-2026-07-07", 2, "Booked"),
  booking("b64", "c57", "ts-2026-07-07", 3, "Booked", { postop_destination: "HDU" }),

  // July 14
  booking("b65", "c58", "ts-2026-07-14", 1, "Booked", { postop_destination: "Ward" }),
  booking("b66", "c59", "ts-2026-07-14", 2, "Booked"),
  booking("b67", "c60", "ts-2026-07-14", 3, "Booked", { postop_destination: "ICU" }),

  // July 21
  booking("b68", "c61", "ts-2026-07-21", 1, "Booked"),
  booking("b69", "c62", "ts-2026-07-21", 2, "Booked", { postop_destination: "HDU" }),
  booking("b70", "c63", "ts-2026-07-21", 3, "Booked"),

  // July 28
  booking("b71", "c64", "ts-2026-07-28", 1, "Booked"),
  booking("b72", "c65", "ts-2026-07-28", 2, "Booked", { postop_destination: "Ward" }),
  booking("b73", "c66", "ts-2026-07-28", 3, "Booked", { postop_destination: "Day case" }),

  // August 4
  booking("b74", "c67", "ts-2026-08-04", 1, "Booked"),
  booking("b75", "c68", "ts-2026-08-04", 2, "Booked", { postop_destination: "Day case" }),
  booking("b76", "c69", "ts-2026-08-04", 3, "Booked"),

  // August 11
  booking("b77", "c70", "ts-2026-08-11", 1, "Booked"),
  booking("b78", "c71", "ts-2026-08-11", 3, "Booked", { postop_destination: "HDU" }),

  // August 18
  booking("b79", "c72", "ts-2026-08-18", 1, "Booked"),
  booking("b80", "c73", "ts-2026-08-18", 2, "Booked", { postop_destination: "HDU" }),
  booking("b81", "c74", "ts-2026-08-18", 3, "Booked"),

  // August 25
  booking("b82", "c75", "ts-2026-08-25", 1, "Booked", { postop_destination: "ICU" }),
  booking("b83", "c76", "ts-2026-08-25", 2, "Booked", { postop_destination: "Day case" }),

  // September 1
  booking("b84", "c77", "ts-2026-09-01", 1, "Booked"),
  booking("b85", "c78", "ts-2026-09-01", 2, "Booked"),

  // September 8
  booking("b86", "c79", "ts-2026-09-08", 2, "Booked"),
  booking("b87", "c80", "ts-2026-09-08", 3, "Booked"),

  // September 15
  booking("b88", "c81", "ts-2026-09-15", 1, "Booked", { postop_destination: "ICU" }),
  booking("b89", "c82", "ts-2026-09-15", 2, "Booked", { postop_destination: "Day case" }),

  // September 22
  booking("b90", "c83", "ts-2026-09-22", 1, "Booked"),
  booking("b91", "c84", "ts-2026-09-22", 2, "Booked"),

  // September 29
  booking("b92", "c85", "ts-2026-09-29", 1, "Booked"),
  booking("b93", "c86", "ts-2026-09-29", 2, "Booked", { postop_destination: "Day case" }),
];

const emergencyBooking = (
  id: string,
  patient_id: string,
  procedure_notes: string,
  surgeon: string,
  urgency: OrodhaData["emergency_bookings"][number]["urgency"],
  booking_status: OrodhaData["emergency_bookings"][number]["booking_status"],
  surgery_date: string,
  overrides: Partial<OrodhaData["emergency_bookings"][number]> = {},
): OrodhaData["emergency_bookings"][number] => ({
  id,
  patient_id,
  surgical_case_id: null,
  procedure_notes,
  surgeon,
  urgency,
  booking_status,
  surgery_date,
  surgery_time: null,
  indication: null,
  cancellation_reason: null,
  created_at: now,
  updated_at: now,
  ...overrides,
});

const emergency_bookings: OrodhaData["emergency_bookings"] = [
  // --- Existing e1–e9 ---
  emergencyBooking("e1", "p3", "Exploratory Laparotomy", "Dr. Oduya", "P1", "Done", "2026-02-06", { surgery_time: "02:30", indication: "Suspected bowel perforation following blunt abdominal trauma", outcome_notes: "Segment of ileum resected; primary anastomosis." } as Partial<OrodhaData["emergency_bookings"][number]>),
  emergencyBooking("e2", "p8", "Appendicectomy", "Dr. Mwangi", "P2", "Done", "2026-03-14", { surgery_time: "09:15", indication: "Acute appendicitis with localised peritonism" } as Partial<OrodhaData["emergency_bookings"][number]>),
  emergencyBooking("e3", "p15", "I&D Abscess — Neck", "Dr. Oduya", "P3", "Done", "2026-04-02", { surgery_time: "14:00", indication: "Parapharyngeal abscess with impending airway compromise" } as Partial<OrodhaData["emergency_bookings"][number]>),
  emergencyBooking("e4", "p22", "Reduction of Intussusception", "Dr. Mwangi", "P1", "Done", "2026-05-08", { surgery_time: "06:45", indication: "Failed pneumatic reduction x2; surgical reduction required" } as Partial<OrodhaData["emergency_bookings"][number]>),
  emergencyBooking("e5", "p6", "Incision & Drainage — Perianal Abscess", "Dr. Oduya", "P3", "Done", "2026-05-21", { surgery_time: "11:30", indication: "Recurrent perianal abscess, fluctuant" } as Partial<OrodhaData["emergency_bookings"][number]>),
  emergencyBooking("e6", "p18", "Emergency Colostomy", "Dr. Mwangi", "P1", "Done", "2026-06-03", { surgery_time: "03:00", indication: "Sigmoid volvulus with ischaemia" } as Partial<OrodhaData["emergency_bookings"][number]>),
  emergencyBooking("e7", "p25", "Appendicectomy", "Dr. Oduya", "P2", "Done", "2026-06-10", { surgery_time: "10:00", indication: "Perforated appendicitis with pelvic collection" } as Partial<OrodhaData["emergency_bookings"][number]>),
  emergencyBooking("e8", "p11", "Exploratory Laparotomy", "Dr. Mwangi", "P1", "Booked", "2026-06-22", { surgery_time: "08:00", indication: "Suspected mesenteric ischaemia" } as Partial<OrodhaData["emergency_bookings"][number]>),
  emergencyBooking("e9", "p30", "I&D Abscess — Submandibular", "Dr. Oduya", "P2", "Booked", "2026-06-22", { surgery_time: "13:30", indication: "Submandibular space abscess, bilateral" } as Partial<OrodhaData["emergency_bookings"][number]>),

  // --- New emergency bookings e10–e61 ---

  // June 22 (past, Done)
  emergencyBooking("e10", "p1", "Appendicectomy", "Dr. Mwangi", "P2", "Done", "2026-06-22", { surgery_time: "11:20", indication: "Acute appendicitis with peritonism" } as Partial<OrodhaData["emergency_bookings"][number]>),
  emergencyBooking("e11", "p4", "Testicular Detorsion", "Dr. Oduya", "P1", "Done", "2026-06-22", { surgery_time: "23:45", indication: "Left testicular torsion — 4 hours from onset" } as Partial<OrodhaData["emergency_bookings"][number]>),

  // June 23 (past, Done)
  emergencyBooking("e12", "p6", "I&D Perianal Abscess", "Dr. Oduya", "P3", "Done", "2026-06-23", { surgery_time: "10:00", indication: "Fluctuant perianal abscess, 5 days" } as Partial<OrodhaData["emergency_bookings"][number]>),
  emergencyBooking("e13", "p7", "Reduction of Intussusception", "Dr. Mwangi", "P2", "Done", "2026-06-23", { surgery_time: "07:30", indication: "Failed pneumatic reduction, surgical reduction required" } as Partial<OrodhaData["emergency_bookings"][number]>),
  emergencyBooking("e14", "p8", "Exploratory Laparotomy", "Dr. K. Kimani", "P1", "Done", "2026-06-23", { surgery_time: "14:15", indication: "Blunt abdominal trauma, free fluid on FAST scan" } as Partial<OrodhaData["emergency_bookings"][number]>),

  // June 24 (past, Done)
  emergencyBooking("e15", "p9", "Appendicectomy", "Dr. Mwangi", "P2", "Done", "2026-06-24", { surgery_time: "08:45", indication: "Perforated appendicitis with pelvic collection" } as Partial<OrodhaData["emergency_bookings"][number]>),
  emergencyBooking("e16", "p10", "I&D Neck Abscess", "Dr. Oduya", "P3", "Done", "2026-06-24", { surgery_time: "15:00", indication: "Submandibular abscess, fever and trismus" } as Partial<OrodhaData["emergency_bookings"][number]>),

  // June 25 (today, Booked)
  emergencyBooking("e17", "p12", "Appendicectomy", "Dr. Mwangi", "P2", "Booked", "2026-06-25", { surgery_time: "09:00", indication: "Acute appendicitis, Alvarado score 9" } as Partial<OrodhaData["emergency_bookings"][number]>),
  emergencyBooking("e18", "p13", "Exploratory Laparotomy", "Dr. Oduya", "P1", "Booked", "2026-06-25", { surgery_time: "06:30", indication: "Suspected bowel ischaemia — bilious vomiting and abdominal distension" } as Partial<OrodhaData["emergency_bookings"][number]>),
  emergencyBooking("e19", "p14", "I&D Thigh Abscess", "Dr. K. Kimani", "P3", "Booked", "2026-06-25", { surgery_time: "13:00", indication: "Fluctuant thigh abscess — 7 cm, MRSA risk" } as Partial<OrodhaData["emergency_bookings"][number]>),

  // June 26 (Booked)
  emergencyBooking("e20", "p15", "Bowel Resection", "Dr. Gitau", "P1", "Booked", "2026-06-26", { surgery_time: "08:00", indication: "Midgut volvulus on upper GI series" } as Partial<OrodhaData["emergency_bookings"][number]>),
  emergencyBooking("e21", "p16", "Appendicectomy", "Dr. Mwangi", "P2", "Booked", "2026-06-26", { surgery_time: "14:30", indication: "Appendicitis with localised guarding" } as Partial<OrodhaData["emergency_bookings"][number]>),

  // June 27 (Booked)
  emergencyBooking("e22", "p17", "Testicular Detorsion", "Dr. Oduya", "P1", "Booked", "2026-06-27", { surgery_time: "02:00", indication: "Right testicular torsion — 3 hours" } as Partial<OrodhaData["emergency_bookings"][number]>),
  emergencyBooking("e23", "p18", "I&D Perianal Abscess", "Dr. K. Kimani", "P3", "Booked", "2026-06-27", { surgery_time: "10:30", indication: "Recurrent perianal abscess" } as Partial<OrodhaData["emergency_bookings"][number]>),

  // June 28 (Booked)
  emergencyBooking("e24", "p19", "Reduction of Intussusception", "Dr. Mwangi", "P2", "Booked", "2026-06-28", { surgery_time: "09:30", indication: "Failed air enema x2" } as Partial<OrodhaData["emergency_bookings"][number]>),
  emergencyBooking("e25", "p20", "Wound Debridement", "Dr. Gitau", "P3", "Booked", "2026-06-28", { surgery_time: "15:00", indication: "Infected surgical wound — necrotising change" } as Partial<OrodhaData["emergency_bookings"][number]>),

  // June 29 (Booked)
  emergencyBooking("e26", "p21", "Appendicectomy", "Dr. Oduya", "P2", "Booked", "2026-06-29", { surgery_time: "11:00", indication: "Appendicitis — 48-hour history" } as Partial<OrodhaData["emergency_bookings"][number]>),

  // June 30 (Booked)
  emergencyBooking("e27", "p22", "Emergency Colostomy", "Dr. K. Kimani", "P1", "Booked", "2026-06-30", { surgery_time: "04:00", indication: "Sigmoid volvulus with ischaemic change" } as Partial<OrodhaData["emergency_bookings"][number]>),
  emergencyBooking("e28", "p23", "Appendicectomy", "Dr. Mwangi", "P2", "Booked", "2026-06-30", { surgery_time: "12:00", indication: "Perforated appendicitis" } as Partial<OrodhaData["emergency_bookings"][number]>),

  // July 1 (Booked)
  emergencyBooking("e29", "p24", "Testicular Detorsion", "Dr. Oduya", "P1", "Booked", "2026-07-01", { surgery_time: "01:30", indication: "Bilateral testicular torsion — 2 hours" } as Partial<OrodhaData["emergency_bookings"][number]>),
  emergencyBooking("e30", "p25", "I&D Neck Abscess", "Dr. Gitau", "P3", "Booked", "2026-07-01", { surgery_time: "11:00", indication: "Parapharyngeal abscess with stridor" } as Partial<OrodhaData["emergency_bookings"][number]>),

  // July 2 (Booked)
  emergencyBooking("e31", "p26", "Appendicectomy", "Dr. Mwangi", "P2", "Booked", "2026-07-02", { surgery_time: "08:00", indication: "Acute appendicitis" } as Partial<OrodhaData["emergency_bookings"][number]>),

  // July 4 (Booked)
  emergencyBooking("e32", "p27", "Exploratory Laparotomy", "Dr. K. Kimani", "P1", "Booked", "2026-07-04", { surgery_time: "05:45", indication: "Peritonitis, free air on X-ray" } as Partial<OrodhaData["emergency_bookings"][number]>),
  emergencyBooking("e33", "p28", "Appendicectomy", "Dr. Oduya", "P2", "Booked", "2026-07-04", { surgery_time: "14:00", indication: "Appendicitis with mass" } as Partial<OrodhaData["emergency_bookings"][number]>),

  // July 7 (Booked)
  emergencyBooking("e34", "p29", "I&D Perianal Abscess", "Dr. Gitau", "P3", "Booked", "2026-07-07", { surgery_time: "13:00", indication: "Perianal abscess, first episode" } as Partial<OrodhaData["emergency_bookings"][number]>),
  emergencyBooking("e35", "p30", "Reduction of Intussusception", "Dr. Mwangi", "P2", "Booked", "2026-07-07", { surgery_time: "09:00", indication: "Ileo-colic intussusception, failed pneumatic" } as Partial<OrodhaData["emergency_bookings"][number]>),
  emergencyBooking("e36", "p31", "Appendicectomy", "Dr. Oduya", "P2", "Booked", "2026-07-07", { surgery_time: "16:00", indication: "Appendicitis with perforation risk" } as Partial<OrodhaData["emergency_bookings"][number]>),

  // July 9 (Booked)
  emergencyBooking("e37", "p32", "Emergency Colostomy", "Dr. K. Kimani", "P1", "Booked", "2026-07-09", { surgery_time: "03:30", indication: "Colonic obstruction with ischaemia" } as Partial<OrodhaData["emergency_bookings"][number]>),

  // July 11 (Booked)
  emergencyBooking("e38", "p33", "Appendicectomy", "Dr. Mwangi", "P2", "Booked", "2026-07-11", { surgery_time: "10:00", indication: "Appendicitis in weekend call" } as Partial<OrodhaData["emergency_bookings"][number]>),
  emergencyBooking("e39", "p34", "I&D Thigh Abscess", "Dr. Gitau", "P3", "Booked", "2026-07-11", { surgery_time: "14:30", indication: "Large thigh abscess, 2-week history" } as Partial<OrodhaData["emergency_bookings"][number]>),

  // July 14 (Booked)
  emergencyBooking("e40", "p35", "Testicular Detorsion", "Dr. Oduya", "P1", "Booked", "2026-07-14", { surgery_time: "00:45", indication: "Left torsion — onset at midnight" } as Partial<OrodhaData["emergency_bookings"][number]>),
  emergencyBooking("e41", "p36", "Appendicectomy", "Dr. Mwangi", "P2", "Booked", "2026-07-14", { surgery_time: "08:30", indication: "Classic appendicitis" } as Partial<OrodhaData["emergency_bookings"][number]>),

  // July 16 (Booked)
  emergencyBooking("e42", "p37", "Bowel Resection", "Dr. K. Kimani", "P1", "Booked", "2026-07-16", { surgery_time: "07:00", indication: "Segment of bowel necrosis — adhesion" } as Partial<OrodhaData["emergency_bookings"][number]>),

  // July 18 (Booked)
  emergencyBooking("e43", "p38", "Appendicectomy", "Dr. Oduya", "P2", "Booked", "2026-07-18", { surgery_time: "09:45", indication: "Perforated appendicitis" } as Partial<OrodhaData["emergency_bookings"][number]>),
  emergencyBooking("e44", "p39", "I&D Neck Abscess", "Dr. Gitau", "P3", "Booked", "2026-07-18", { surgery_time: "15:30", indication: "Cervical lymph node abscess" } as Partial<OrodhaData["emergency_bookings"][number]>),

  // July 21 (Booked)
  emergencyBooking("e45", "p40", "Reduction of Intussusception", "Dr. Mwangi", "P2", "Booked", "2026-07-21", { surgery_time: "09:00", indication: "Failed air enema" } as Partial<OrodhaData["emergency_bookings"][number]>),
  emergencyBooking("e46", "p41", "I&D Perianal Abscess", "Dr. Oduya", "P3", "Booked", "2026-07-21", { surgery_time: "12:30", indication: "Recurrent perianal abscess" } as Partial<OrodhaData["emergency_bookings"][number]>),

  // July 23 (Booked)
  emergencyBooking("e47", "p42", "Appendicectomy", "Dr. K. Kimani", "P2", "Booked", "2026-07-23", { surgery_time: "10:15", indication: "Appendicitis with inflammatory mass" } as Partial<OrodhaData["emergency_bookings"][number]>),

  // July 25 (Booked)
  emergencyBooking("e48", "p43", "Testicular Detorsion", "Dr. Oduya", "P1", "Booked", "2026-07-25", { surgery_time: "03:20", indication: "Right testicular torsion — 5 hours" } as Partial<OrodhaData["emergency_bookings"][number]>),
  emergencyBooking("e49", "p44", "Wound Debridement", "Dr. Gitau", "P3", "Booked", "2026-07-25", { surgery_time: "11:00", indication: "Post-op wound breakdown" } as Partial<OrodhaData["emergency_bookings"][number]>),

  // July 28 (Booked)
  emergencyBooking("e50", "p45", "Exploratory Laparotomy", "Dr. Mwangi", "P1", "Booked", "2026-07-28", { surgery_time: "06:00", indication: "Acute intestinal obstruction" } as Partial<OrodhaData["emergency_bookings"][number]>),
  emergencyBooking("e51", "p46", "Appendicectomy", "Dr. K. Kimani", "P2", "Booked", "2026-07-28", { surgery_time: "14:00", indication: "Classic appendicitis" } as Partial<OrodhaData["emergency_bookings"][number]>),

  // July 31 (Booked)
  emergencyBooking("e52", "p47", "I&D Abscess", "Dr. Oduya", "P3", "Booked", "2026-07-31", { surgery_time: "09:30", indication: "Gluteal abscess" } as Partial<OrodhaData["emergency_bookings"][number]>),

  // August 4 (Booked)
  emergencyBooking("e53", "p48", "Appendicectomy", "Dr. Mwangi", "P2", "Booked", "2026-08-04", { surgery_time: "11:00", indication: "Appendicitis, non-perforated" } as Partial<OrodhaData["emergency_bookings"][number]>),
  emergencyBooking("e54", "p49", "Testicular Detorsion", "Dr. Oduya", "P1", "Booked", "2026-08-04", { surgery_time: "22:00", indication: "Right torsion — 2.5 hours" } as Partial<OrodhaData["emergency_bookings"][number]>),

  // August 11 (Booked)
  emergencyBooking("e55", "p50", "Emergency Colostomy", "Dr. K. Kimani", "P1", "Booked", "2026-08-11", { surgery_time: "05:00", indication: "Large bowel obstruction with ischaemia" } as Partial<OrodhaData["emergency_bookings"][number]>),

  // August 18 (Booked)
  emergencyBooking("e56", "p37", "Appendicectomy", "Dr. Mwangi", "P2", "Booked", "2026-08-18", { surgery_time: "10:30", indication: "Appendicitis with pelvic collection" } as Partial<OrodhaData["emergency_bookings"][number]>),
  emergencyBooking("e57", "p38", "Reduction of Intussusception", "Dr. Gitau", "P2", "Booked", "2026-08-18", { surgery_time: "07:00", indication: "Intussusception, failed enema" } as Partial<OrodhaData["emergency_bookings"][number]>),

  // August 25 (Booked)
  emergencyBooking("e58", "p39", "Exploratory Laparotomy", "Dr. Oduya", "P1", "Booked", "2026-08-25", { surgery_time: "04:30", indication: "Peritonitis" } as Partial<OrodhaData["emergency_bookings"][number]>),

  // September 8 (Booked)
  emergencyBooking("e59", "p40", "Appendicectomy", "Dr. Mwangi", "P2", "Booked", "2026-09-08", { surgery_time: "09:00", indication: "Appendicitis" } as Partial<OrodhaData["emergency_bookings"][number]>),
  emergencyBooking("e60", "p41", "I&D Abscess", "Dr. K. Kimani", "P3", "Booked", "2026-09-08", { surgery_time: "14:00", indication: "Buttock abscess, week history" } as Partial<OrodhaData["emergency_bookings"][number]>),

  // September 15 (Booked)
  emergencyBooking("e61", "p42", "Testicular Detorsion", "Dr. Oduya", "P1", "Booked", "2026-09-15", { surgery_time: "01:00", indication: "Left torsion, sudden onset" } as Partial<OrodhaData["emergency_bookings"][number]>),
];

export const demoData: OrodhaData = {
  specialties: [
    { id: "sp-urology", name: "Urological", active: true },
    { id: "sp-colorectal", name: "Colorectal", active: true },
    { id: "sp-hernia", name: "Hernias & Testis", active: true },
    { id: "sp-uppergi", name: "Upper GI", active: true },
    { id: "sp-hpb", name: "Hepatobiliary", active: true },
    { id: "sp-minor", name: "Minor Procedures", active: true },
    { id: "sp-oncology", name: "Oncological", active: true },
    { id: "sp-other", name: "Other", active: true },
  ],
  procedures: [
    { id: "pr-pyeloplasty", specialty_id: "sp-urology", name: "Pyeloplasty", default_duration_minutes: 150, active: true },
    { id: "pr-pullthrough", specialty_id: "sp-colorectal", name: "Pull-through Procedure", default_duration_minutes: 180, active: true },
    { id: "pr-hernia", specialty_id: "sp-hernia", name: "Inguinal Hernia Repair", default_duration_minutes: 75, active: true },
    { id: "pr-kasai", specialty_id: "sp-hpb", name: "Hepatoportoenterostomy", default_duration_minutes: 240, active: true },
    { id: "pr-nephrectomy", specialty_id: "sp-urology", name: "Nephrectomy", default_duration_minutes: 170, active: true },
    { id: "pr-ureteric", specialty_id: "sp-urology", name: "Ureteric Reimplantation", default_duration_minutes: 160, active: true },
    { id: "pr-hypospadias", specialty_id: "sp-urology", name: "Hypospadias Repair", default_duration_minutes: 140, active: true },
    { id: "pr-biopsy", specialty_id: "sp-oncology", name: "Excision Biopsy", default_duration_minutes: 70, active: true },
  ],
  theatres: [
    { id: "th-main", name: "Main Paediatric Theatre", location: "Main theatre block", active: true },
    { id: "th-day", name: "Day Surgery Theatre", location: "Ambulatory wing", active: true },
  ],
  theatre_sessions,
  patients,
  surgical_cases,
  preop_assessments,
  bookings,
  emergency_bookings,
  case_notes: [
    { id: "n1", case_id: "c4", note_type: "Booking", note: "Original booking postponed; rebooked without losing history.", created_at: now },
    { id: "n2", case_id: "c11", note_type: "Cancellation", note: "Cancelled after URI symptoms on pre-op review.", created_at: now },
    { id: "n3", case_id: "c12", note_type: "Theatre", note: "Rebooked to June list after anaesthesia review completed.", created_at: now },
    { id: "n4", case_id: "c20", note_type: "Attendance", note: "Marked no-show; nurse to contact family for re-listing.", created_at: now },
    { id: "n5", case_id: "c39", note_type: "Relisting", note: "February list postponed and rebooked onto the March 24 list.", created_at: now },
    { id: "n6", case_id: "c49", note_type: "Relisting", note: "Short day-case procedure moved from March to April after fasting issue.", created_at: now },
    { id: "n7", case_id: "c36", note_type: "Attendance", note: "No-show in February, family contacted, then relisted in April.", created_at: now },
    { id: "n8", case_id: "c34", note_type: "Cancellation", note: "Family requested deferment after counselling for gastrostomy care.", created_at: now },
  ],
};

export const cancellationReasons = [
  "Patient unfit for surgery",
  "Upper respiratory tract infection",
  "No-show / did not attend",
  "Fasting failure",
  "Theatre overrun",
  "Equipment unavailable",
  "Surgeon unavailable",
  "Other",
];
