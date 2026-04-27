
// ── New Booking Form ──────────────────────────────────────────────────────────

function NewBookingScreen({ bookings, bookingDate, setScreen }) {
  const isMobile = useIsMobile();
  const [step, setStep] = React.useState(1);
  const [patientSearch, setPatientSearch] = React.useState('');
  const [selectedPatient, setSelectedPatient] = React.useState(null);
  const [form, setForm] = React.useState({
    date: bookingDate || '', specialty:'', procedure:'', diagnosis:'',
    urgency:'Elective', slot:'', caseDesc:'', estDuration:'', preOpNotes:'',
  });
  const [errors, setErrors] = React.useState({});
  const [submitted, setSubmitted] = React.useState(false);

  const filteredPatients = PATIENTS.filter(p =>
    patientSearch.length > 1 &&
    (p.full_name.toLowerCase().includes(patientSearch.toLowerCase()) ||
     p.umr.toLowerCase().includes(patientSearch.toLowerCase()))
  );

  const existingOnDate = form.date ? bookings.filter(b=>b.date===form.date) : [];
  const slotsAvailable = [1,2,3].filter(s => !existingOnDate.find(b=>b.slot===s));

  function setF(k,v) { setForm(f=>({...f,[k]:v})); setErrors(e=>({...e,[k]:''})); }

  function validateStep1() {
    if (!selectedPatient) { setErrors({patient:'Please select a patient'}); return false; }
    return true;
  }

  function validateStep2() {
    const e = {};
    if (!form.date) e.date = 'Required';
    if (!form.specialty) e.specialty = 'Required';
    if (!form.procedure.trim()) e.procedure = 'Required';
    if (!form.slot) e.slot = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  if (submitted) {
    return (
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:24 }}>
        <div style={{ textAlign:'center', maxWidth:380 }}>
          <div style={{ width:60, height:60, borderRadius:'50%', background:'#dcfce7', display:'inline-flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>
          </div>
          <h2 style={{ fontSize:20, fontWeight:700, color:'var(--text)', margin:'0 0 8px', letterSpacing:'-0.3px' }}>Booking confirmed</h2>
          <p style={{ color:'var(--muted)', fontSize:14, margin:'0 0 28px', lineHeight:1.6 }}>
            <strong>{selectedPatient?.full_name}</strong> booked for <strong>{form.procedure}</strong> on{' '}
            <strong>{new Date(form.date+'T00:00:00').toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})}</strong>, Slot {form.slot}.
          </p>
          <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={()=>{ setSubmitted(false); setStep(1); setSelectedPatient(null); setPatientSearch(''); setForm({date:bookingDate||'',specialty:'',procedure:'',diagnosis:'',urgency:'Elective',slot:'',caseDesc:'',estDuration:'',preOpNotes:''}); }} style={btnSecondaryStyle}>New booking</button>
            <button onClick={()=>setScreen('calendar')} style={btnPrimaryStyle}>Back to calendar</button>
          </div>
        </div>
      </div>
    );
  }

  const pad = isMobile ? '20px 16px' : '28px 40px';

  return (
    <div style={{ flex:1, overflowY:'auto', padding:pad, background:'var(--bg)', paddingBottom: isMobile ? 80 : pad }}>
      <div style={{ maxWidth:680 }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
          <button onClick={()=>setScreen('calendar')} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--muted)',padding:4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          </button>
          <div>
            <h2 style={{ fontSize:isMobile?17:19, fontWeight:700, color:'var(--text)', margin:0, letterSpacing:'-0.3px' }}>New Booking</h2>
            <p style={{ color:'var(--muted)', fontSize:12.5, margin:'3px 0 0' }}>Step {step} of 2 — {step===1?'Select patient':'Booking details'}</p>
          </div>
        </div>

        {/* Step tabs */}
        <div style={{ display:'flex', gap:0, marginBottom:20, borderRadius:9, border:'1px solid var(--border)', overflow:'hidden', width:'fit-content' }}>
          {['Patient','Details'].map((label,i)=>{
            const active = step===i+1, done = step>i+1;
            return (
              <div key={label} onClick={()=>done&&setStep(i+1)}
                style={{ padding:'7px 18px', fontSize:13, fontWeight:600, background:active?'var(--green-deep)':'white', color:active?'white':done?'var(--green-accent)':'var(--muted)', cursor:done?'pointer':'default', borderRight:i===0?'1px solid var(--border)':'none' }}>
                {done && '✓ '}{label}
              </div>
            );
          })}
        </div>

        <div style={{ background:'white', borderRadius:12, border:'1px solid var(--border)', padding: isMobile ? 20 : 28, boxShadow:'0 1px 8px rgba(0,0,0,0.04)' }}>
          {step===1 && (
            <div>
              <h3 style={sectionHeadStyle}>Find or create patient</h3>
              <div style={{ position:'relative', marginBottom:14 }}>
                <svg style={{ position:'absolute',left:11,top:11,color:'var(--muted)' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                <input value={patientSearch} onChange={e=>setPatientSearch(e.target.value)} placeholder="Search by name or UMR…"
                  style={{ ...inputStyle, paddingLeft:34 }}
                  onFocus={e=>e.target.style.borderColor='var(--green-accent)'}
                  onBlur={e=>e.target.style.borderColor='var(--border)'} />
              </div>

              {filteredPatients.length>0 && (
                <div style={{ border:'1px solid var(--border)', borderRadius:8, overflow:'hidden', marginBottom:14 }}>
                  {filteredPatients.map((p,i)=>(
                    <div key={p.id} onClick={()=>{setSelectedPatient(p);setPatientSearch(p.full_name);setErrors({});}}
                      style={{ padding:'11px 14px', cursor:'pointer', background:selectedPatient?.id===p.id?'#f0fdf4':'white', borderBottom:i<filteredPatients.length-1?'1px solid #f3f4f6':'none', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div>
                        <div style={{ fontSize:13.5, fontWeight:600, color:'var(--text)' }}>{p.full_name}</div>
                        <div style={{ fontSize:12, color:'var(--muted)', marginTop:1 }}>{p.umr} · {p.sex} · {calcAge(p.dob)} · {p.residence}</div>
                      </div>
                      {selectedPatient?.id===p.id && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>}
                    </div>
                  ))}
                </div>
              )}

              {selectedPatient && (
                <div style={{ padding:'13px 14px', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:8, marginBottom:14 }}>
                  <div style={{ fontSize:11.5, fontWeight:700, color:'#166534', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:7 }}>Selected Patient</div>
                  <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr':'1fr 1fr', gap:'5px 14px', fontSize:13 }}>
                    {[['Name',selectedPatient.full_name],['UMR',selectedPatient.umr],['DOB',`${new Date(selectedPatient.dob+'T00:00:00').toLocaleDateString('en-GB')} (${calcAge(selectedPatient.dob)})`],['Sex',selectedPatient.sex],['Residence',selectedPatient.residence],['SHA',selectedPatient.sha]].map(([k,v])=>(
                      <div key={k}><span style={{ color:'var(--muted)', fontSize:11.5 }}>{k}: </span><span style={{ color:'var(--text)', fontWeight:500 }}>{v}</span></div>
                    ))}
                  </div>
                </div>
              )}

              {errors.patient && <div style={errorStyle}>{errors.patient}</div>}
              <div style={{ display:'flex', gap:8, justifyContent:'space-between', marginTop:8 }}>
                <button onClick={()=>setScreen('newpatient')} style={btnSecondaryStyle}>+ New patient</button>
                <button onClick={()=>{ if(validateStep1()) setStep(2); }} style={btnPrimaryStyle}>Continue →</button>
              </div>
            </div>
          )}

          {step===2 && (
            <div>
              <h3 style={sectionHeadStyle}>Booking details</h3>
              <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:14 }}>

                <label style={labelStyle}>Theatre date *
                  <input type="date" value={form.date} onChange={e=>setF('date',e.target.value)} min="2026-01-01" max="2026-12-31"
                    style={{ ...inputStyle, marginTop:5, borderColor:errors.date?'#f87171':'var(--border)' }}
                    onFocus={e=>e.target.style.borderColor='var(--green-accent)'}
                    onBlur={e=>e.target.style.borderColor=errors.date?'#f87171':'var(--border)'} />
                  {errors.date && <div style={errorStyle}>{errors.date}</div>}
                  {form.date && existingOnDate.length>=3 && <div style={errorStyle}>Theatre fully booked. Max 3 cases per day.</div>}
                </label>

                <label style={labelStyle}>Slot *
                  <select value={form.slot} onChange={e=>setF('slot',e.target.value)}
                    style={{ ...inputStyle, marginTop:5, borderColor:errors.slot?'#f87171':'var(--border)' }}>
                    <option value="">Auto-assign</option>
                    {slotsAvailable.map(s=><option key={s} value={s}>Slot {s}</option>)}
                    {[1,2,3].filter(s=>!slotsAvailable.includes(s)).map(s=><option key={s} disabled>Slot {s} — taken</option>)}
                  </select>
                  {errors.slot && <div style={errorStyle}>{errors.slot}</div>}
                </label>

                <label style={labelStyle}>Specialty *
                  <select value={form.specialty} onChange={e=>setF('specialty',e.target.value)}
                    style={{ ...inputStyle, marginTop:5, borderColor:errors.specialty?'#f87171':'var(--border)' }}>
                    <option value="">Select…</option>
                    {SPECIALTIES.map(s=><option key={s}>{s}</option>)}
                  </select>
                  {errors.specialty && <div style={errorStyle}>{errors.specialty}</div>}
                </label>

                <label style={labelStyle}>Urgency
                  <select value={form.urgency} onChange={e=>setF('urgency',e.target.value)} style={{ ...inputStyle, marginTop:5 }}>
                    {['Elective','Urgent','Emergency'].map(u=><option key={u}>{u}</option>)}
                  </select>
                </label>

                <label style={{ ...labelStyle, gridColumn: isMobile?'auto':'span 2' }}>Procedure *
                  <input value={form.procedure} onChange={e=>setF('procedure',e.target.value)} placeholder="e.g. Orchidopexy"
                    style={{ ...inputStyle, marginTop:5, borderColor:errors.procedure?'#f87171':'var(--border)' }}
                    onFocus={e=>e.target.style.borderColor='var(--green-accent)'}
                    onBlur={e=>e.target.style.borderColor=errors.procedure?'#f87171':'var(--border)'} />
                  {errors.procedure && <div style={errorStyle}>{errors.procedure}</div>}
                </label>

                <label style={{ ...labelStyle, gridColumn: isMobile?'auto':'span 2' }}>Diagnosis
                  <input value={form.diagnosis} onChange={e=>setF('diagnosis',e.target.value)} placeholder="e.g. Undescended testis"
                    style={{ ...inputStyle, marginTop:5 }}
                    onFocus={e=>e.target.style.borderColor='var(--green-accent)'}
                    onBlur={e=>e.target.style.borderColor='var(--border)'} />
                </label>

                <label style={labelStyle}>Est. duration (min)
                  <input type="number" value={form.estDuration} onChange={e=>setF('estDuration',e.target.value)} placeholder="60"
                    style={{ ...inputStyle, marginTop:5 }}
                    onFocus={e=>e.target.style.borderColor='var(--green-accent)'}
                    onBlur={e=>e.target.style.borderColor='var(--border)'} />
                </label>

                <label style={{ ...labelStyle, gridColumn: isMobile?'auto':'span 2' }}>Pre-operative notes
                  <textarea value={form.preOpNotes} onChange={e=>setF('preOpNotes',e.target.value)} rows={2} placeholder="Anaesthetic considerations, investigations, consents…"
                    style={{ ...inputStyle, marginTop:5, resize:'vertical' }}
                    onFocus={e=>e.target.style.borderColor='var(--green-accent)'}
                    onBlur={e=>e.target.style.borderColor='var(--border)'} />
                </label>
              </div>

              <div style={{ display:'flex', gap:8, justifyContent:'space-between', marginTop:20, paddingTop:18, borderTop:'1px solid var(--border)' }}>
                <button onClick={()=>setStep(1)} style={btnSecondaryStyle}>← Back</button>
                <button onClick={e=>{ e.preventDefault(); if(validateStep2()) setSubmitted(true); }} style={btnPrimaryStyle}>Confirm booking</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── New Patient Form ──────────────────────────────────────────────────────────
function NewPatientScreen({ setScreen }) {
  const isMobile = useIsMobile();
  const [form, setForm] = React.useState({ umr:'', full_name:'', sex:'', dob:'', residence:'', phone_primary:'', phone_secondary:'', sha:'Active' });
  const [errors, setErrors] = React.useState({});
  const [saved, setSaved] = React.useState(false);

  function setF(k,v) { setForm(f=>({...f,[k]:v})); setErrors(e=>({...e,[k]:''})); }

  function validate() {
    const e = {};
    if (!form.umr) e.umr='Required';
    else if (!/^UMR\d{4,7}$/.test(form.umr.toUpperCase())) e.umr="Format: 'UMR' + 4–7 digits (e.g. UMR048215)";
    if (!form.full_name) e.full_name='Required';
    if (!form.sex) e.sex='Required';
    if (!form.dob) e.dob='Required';
    else if (form.dob > TODAY) e.dob='Date of birth cannot be in the future';
    if (!form.phone_primary) e.phone_primary='Required';
    setErrors(e);
    return Object.keys(e).length===0;
  }

  if (saved) {
    return (
      <div style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)',padding:24 }}>
        <div style={{ textAlign:'center', maxWidth:360 }}>
          <div style={{ width:60,height:60,borderRadius:'50%',background:'#dcfce7',display:'inline-flex',alignItems:'center',justifyContent:'center',marginBottom:18 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>
          </div>
          <h2 style={{ fontSize:20,fontWeight:700,color:'var(--text)',margin:'0 0 8px' }}>Patient created</h2>
          <p style={{ color:'var(--muted)',fontSize:14,margin:'0 0 24px' }}>{form.full_name} ({form.umr.toUpperCase()}) added to registry.</p>
          <div style={{ display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap' }}>
            <button onClick={()=>setScreen('patients')} style={btnSecondaryStyle}>View registry</button>
            <button onClick={()=>setScreen('newbooking')} style={btnPrimaryStyle}>Book for theatre</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex:1,overflowY:'auto',padding: isMobile?'20px 16px':'28px 40px',background:'var(--bg)', paddingBottom: isMobile?80:28 }}>
      <div style={{ maxWidth:620 }}>
        <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:24 }}>
          <button onClick={()=>setScreen('patients')} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--muted)',padding:4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          </button>
          <h2 style={{ fontSize:isMobile?17:19,fontWeight:700,color:'var(--text)',margin:0,letterSpacing:'-0.3px' }}>New Patient Record</h2>
        </div>
        <div style={{ background:'white',borderRadius:12,border:'1px solid var(--border)',padding: isMobile?20:28,boxShadow:'0 1px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display:'grid',gridTemplateColumns: isMobile?'1fr':'1fr 1fr',gap:14 }}>
            <label style={{ ...labelStyle, gridColumn: isMobile?'auto':'span 2' }}>UMR *
              <input value={form.umr} onChange={e=>setF('umr',e.target.value.toUpperCase())} placeholder="UMR048215"
                style={{ ...inputStyle,marginTop:5,borderColor:errors.umr?'#f87171':'var(--border)' }}
                onFocus={e=>e.target.style.borderColor='var(--green-accent)'}
                onBlur={e=>e.target.style.borderColor=errors.umr?'#f87171':'var(--border)'} />
              {errors.umr&&<div style={errorStyle}>{errors.umr}</div>}
              <div style={{ fontSize:11.5,color:'var(--muted)',marginTop:3 }}>Format: UMR + 4–7 digits, uppercase</div>
            </label>
            <label style={{ ...labelStyle, gridColumn: isMobile?'auto':'span 2' }}>Full name *
              <input value={form.full_name} onChange={e=>setF('full_name',e.target.value)} placeholder="Patient's full name"
                style={{ ...inputStyle,marginTop:5,borderColor:errors.full_name?'#f87171':'var(--border)' }}
                onFocus={e=>e.target.style.borderColor='var(--green-accent)'}
                onBlur={e=>e.target.style.borderColor=errors.full_name?'#f87171':'var(--border)'} />
              {errors.full_name&&<div style={errorStyle}>{errors.full_name}</div>}
            </label>
            <label style={labelStyle}>Sex *
              <select value={form.sex} onChange={e=>setF('sex',e.target.value)} style={{ ...inputStyle,marginTop:5,borderColor:errors.sex?'#f87171':'var(--border)' }}>
                <option value="">Select…</option><option>Male</option><option>Female</option>
              </select>
              {errors.sex&&<div style={errorStyle}>{errors.sex}</div>}
            </label>
            <label style={labelStyle}>Date of birth *
              <input type="date" value={form.dob} onChange={e=>setF('dob',e.target.value)} max={TODAY}
                style={{ ...inputStyle,marginTop:5,borderColor:errors.dob?'#f87171':'var(--border)' }}
                onFocus={e=>e.target.style.borderColor='var(--green-accent)'}
                onBlur={e=>e.target.style.borderColor=errors.dob?'#f87171':'var(--border)'} />
              {errors.dob&&<div style={errorStyle}>{errors.dob}</div>}
              {form.dob&&!errors.dob&&<div style={{ fontSize:11.5,color:'var(--green-accent)',marginTop:3 }}>Age: {calcAge(form.dob)}</div>}
            </label>
            <label style={labelStyle}>Primary phone *
              <input value={form.phone_primary} onChange={e=>setF('phone_primary',e.target.value)} placeholder="0712 345 678"
                style={{ ...inputStyle,marginTop:5,borderColor:errors.phone_primary?'#f87171':'var(--border)' }}
                onFocus={e=>e.target.style.borderColor='var(--green-accent)'}
                onBlur={e=>e.target.style.borderColor=errors.phone_primary?'#f87171':'var(--border)'} />
              {errors.phone_primary&&<div style={errorStyle}>{errors.phone_primary}</div>}
            </label>
            <label style={labelStyle}>Secondary phone
              <input value={form.phone_secondary||''} onChange={e=>setF('phone_secondary',e.target.value)} placeholder="Optional"
                style={{ ...inputStyle,marginTop:5 }}
                onFocus={e=>e.target.style.borderColor='var(--green-accent)'}
                onBlur={e=>e.target.style.borderColor='var(--border)'} />
            </label>
            <label style={labelStyle}>Residence
              <input value={form.residence} onChange={e=>setF('residence',e.target.value)} placeholder="e.g. Nairobi"
                style={{ ...inputStyle,marginTop:5 }}
                onFocus={e=>e.target.style.borderColor='var(--green-accent)'}
                onBlur={e=>e.target.style.borderColor='var(--border)'} />
            </label>
            <label style={labelStyle}>SHA status
              <select value={form.sha} onChange={e=>setF('sha',e.target.value)} style={{ ...inputStyle,marginTop:5 }}>
                <option>Active</option><option>Inactive</option>
              </select>
            </label>
          </div>
          <div style={{ display:'flex',justifyContent:'flex-end',marginTop:20,paddingTop:18,borderTop:'1px solid var(--border)' }}>
            <button onClick={()=>{ if(validate()) setSaved(true); }} style={btnPrimaryStyle}>Save patient record</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const labelStyle = { display:'block', fontSize:13, fontWeight:500, color:'var(--text)' };
const inputStyle = {
  display:'block', width:'100%', padding:'9px 12px', border:'1px solid var(--border)',
  borderRadius:8, fontSize:13.5, fontFamily:'var(--font)', color:'var(--text)',
  background:'white', outline:'none', transition:'border-color 0.15s', boxSizing:'border-box',
};
const errorStyle = { fontSize:11.5, color:'#b91c1c', marginTop:4, padding:'4px 8px', background:'#fef2f2', borderRadius:4, border:'1px solid #fecaca' };
const sectionHeadStyle = { fontSize:15, fontWeight:700, color:'var(--text)', margin:'0 0 18px', letterSpacing:'-0.2px' };

Object.assign(window, { NewBookingScreen, NewPatientScreen, labelStyle, inputStyle, errorStyle, sectionHeadStyle });
