
// ── Patient Registry ──────────────────────────────────────────────────────────

function PatientRegistryScreen({ bookings, setScreen }) {
  const isMobile = useIsMobile();
  const [search, setSearch] = React.useState('');
  const [selected, setSelected] = React.useState(null);

  const filtered = PATIENTS.filter(p =>
    !search || p.full_name.toLowerCase().includes(search.toLowerCase()) || p.umr.toLowerCase().includes(search.toLowerCase())
  );

  const patientBookings = selected ? bookings.filter(b => b.patientId === selected.id) : [];

  return (
    <div style={{ flex:1, display:'flex', minHeight:0, overflow: isMobile?'auto':'hidden', flexDirection: isMobile?'column':'row' }}>
      {/* List */}
      <div style={{ flex:1, overflowY:'auto', padding: isMobile?'16px 16px':'28px 28px', paddingBottom: isMobile?80:28 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <h2 style={{ fontSize: isMobile?18:20, fontWeight:700, color:'var(--text)', margin:0, letterSpacing:'-0.3px' }}>Patients</h2>
            <p style={{ color:'var(--muted)', fontSize:12.5, margin:'3px 0 0' }}>{PATIENTS.length} records</p>
          </div>
          {!isMobile && <button onClick={()=>setScreen('newpatient')} style={btnPrimaryStyle}>+ New patient</button>}
        </div>

        <div style={{ position:'relative', marginBottom:16 }}>
          <svg style={{ position:'absolute',left:11,top:11,color:'var(--muted)' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or UMR…"
            style={{ ...inputStyle, paddingLeft:34 }}
            onFocus={e=>e.target.style.borderColor='var(--green-accent)'}
            onBlur={e=>e.target.style.borderColor='var(--border)'} />
        </div>

        {isMobile ? (
          // ── Mobile: card list ──
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {filtered.map(p => {
              const ptBks = bookings.filter(b=>b.patientId===p.id);
              const isSelected = selected?.id===p.id;
              return (
                <div key={p.id} onClick={()=>setSelected(isSelected?null:p)}
                  style={{ padding:'14px 16px', background:'white', borderRadius:10, border:`1.5px solid ${isSelected?'var(--green-accent)':'var(--border)'}`, cursor:'pointer' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div>
                      <div style={{ fontSize:14.5, fontWeight:700, color:'var(--text)', marginBottom:2 }}>{p.full_name}</div>
                      <div style={{ fontSize:12, color:'var(--muted)', fontFamily:'monospace' }}>{p.umr}</div>
                      <div style={{ fontSize:12, color:'var(--muted)', marginTop:3 }}>{calcAge(p.dob)} · {p.sex} · {p.residence}</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <span style={{ fontSize:11, fontWeight:600, padding:'2px 7px', borderRadius:4, background:p.sha==='Active'?'#dcfce7':'#f1f5f9', color:p.sha==='Active'?'#166534':'#64748b' }}>{p.sha}</span>
                      <div style={{ fontSize:12, color:'var(--muted)', marginTop:6 }}>{ptBks.length} bookings</div>
                    </div>
                  </div>
                  {isSelected && (
                    <div style={{ marginTop:12, paddingTop:10, borderTop:'1px solid var(--border)', display:'flex', gap:8 }}>
                      <button style={{ ...btnSecondaryStyle, flex:1, fontSize:12 }}>Edit</button>
                      <button onClick={e=>{e.stopPropagation();setScreen('newbooking');}} style={{ ...btnPrimaryStyle, flex:1, fontSize:12 }}>Book</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          // ── Desktop: table ──
          <div style={{ background:'white', borderRadius:12, border:'1px solid var(--border)', overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr style={{ background:'#f8fafc', borderBottom:'1px solid var(--border)' }}>
                  {['UMR','Patient Name','Age / Sex','Residence','SHA','Bookings'].map(h=>(
                    <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontWeight:600, color:'var(--muted)', fontSize:11, textTransform:'uppercase', letterSpacing:'0.04em', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p,i) => {
                  const ptBks = bookings.filter(b=>b.patientId===p.id);
                  const isSel = selected?.id===p.id;
                  return (
                    <tr key={p.id} onClick={()=>setSelected(isSel?null:p)}
                      style={{ borderBottom:i<filtered.length-1?'1px solid #f3f4f6':'none', cursor:'pointer', background:isSel?'#f0fdf4':'white', transition:'background 0.1s' }}
                      onMouseEnter={e=>{ if(!isSel) e.currentTarget.style.background='#fafafa'; }}
                      onMouseLeave={e=>{ if(!isSel) e.currentTarget.style.background='white'; }}>
                      <td style={{ padding:'11px 16px', fontFamily:'monospace', fontSize:12, color:'var(--muted)', fontWeight:600 }}>{p.umr}</td>
                      <td style={{ padding:'11px 16px', fontWeight:600, color:'var(--text)' }}>{p.full_name}</td>
                      <td style={{ padding:'11px 16px', color:'var(--muted)' }}>{calcAge(p.dob)} · {p.sex[0]}</td>
                      <td style={{ padding:'11px 16px', color:'var(--muted)' }}>{p.residence}</td>
                      <td style={{ padding:'11px 16px' }}>
                        <span style={{ fontSize:11, fontWeight:600, padding:'2px 7px', borderRadius:4, background:p.sha==='Active'?'#dcfce7':'#f1f5f9', color:p.sha==='Active'?'#166534':'#64748b', border:`1px solid ${p.sha==='Active'?'#bbf7d0':'#e2e8f0'}` }}>{p.sha}</span>
                      </td>
                      <td style={{ padding:'11px 16px', color:'var(--muted)' }}>
                        <span style={{ fontWeight:600, color:'var(--text)' }}>{ptBks.length}</span>
                        <span style={{ marginLeft:5, fontSize:11.5 }}>({ptBks.filter(b=>b.status==='Pending').length} upcoming)</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Patient detail panel — desktop only */}
      {!isMobile && selected && (
        <div style={{ width:330, flexShrink:0, borderLeft:'1px solid var(--border)', background:'white', overflowY:'auto' }}>
          <div style={{ padding:'18px 20px 14px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div>
              <div style={{ fontSize:16, fontWeight:700, color:'var(--text)', letterSpacing:'-0.3px' }}>{selected.full_name}</div>
              <div style={{ fontSize:12, color:'var(--muted)', marginTop:2, fontFamily:'monospace' }}>{selected.umr}</div>
            </div>
            <button onClick={()=>setSelected(null)} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--muted)',padding:4 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <div style={{ padding:'16px 20px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px 12px', marginBottom:18 }}>
              {[['DOB',new Date(selected.dob+'T00:00:00').toLocaleDateString('en-GB')],['Age',calcAge(selected.dob)],['Sex',selected.sex],['Residence',selected.residence],['Phone',selected.phone_primary],['SHA',selected.sha]].map(([k,v])=>(
                <div key={k}>
                  <div style={{ fontSize:11, color:'var(--muted)', fontWeight:500, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:2 }}>{k}</div>
                  <div style={{ fontSize:13, color:'var(--text)', fontWeight:500 }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ borderTop:'1px solid var(--border)', paddingTop:14 }}>
              <div style={{ fontSize:11.5, fontWeight:600, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:10 }}>Bookings ({patientBookings.length})</div>
              {patientBookings.length===0 && <div style={{ color:'var(--muted)', fontSize:13 }}>No bookings yet.</div>}
              {patientBookings.map(bk=>{
                const sc={Pending:{bg:'#fffbeb',color:'#b45309'},Done:{bg:'#f0fdf4',color:'#166534'},Cancelled:{bg:'#fef2f2',color:'#991b1b'}}[bk.status];
                return (
                  <div key={bk.id} style={{ marginBottom:7, padding:'9px 12px', borderRadius:8, border:'1px solid var(--border)', background:'#fafafa' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                      <div style={{ fontSize:11.5, color:'var(--muted)' }}>{new Date(bk.date+'T00:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})} · Slot {bk.slot}</div>
                      <span style={{ fontSize:11, fontWeight:600, color:sc.color, background:sc.bg, borderRadius:3, padding:'1px 6px' }}>{bk.status}</span>
                    </div>
                    <div style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{bk.procedure}</div>
                    <div style={{ fontSize:11.5, color:'var(--muted)' }}>{bk.specialty}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop:14, display:'flex', gap:8 }}>
              <button style={{ ...btnSecondaryStyle, flex:1, fontSize:12 }}>Edit record</button>
              <button onClick={()=>setScreen('newbooking')} style={{ ...btnPrimaryStyle, flex:1, fontSize:12 }}>Book</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Specialty List Screen ─────────────────────────────────────────────────────
function SpecialtyListScreen({ bookings }) {
  const isMobile = useIsMobile();
  const [activeSpec, setActiveSpec] = React.useState('Urological');
  const [statusFilter, setStatusFilter] = React.useState('All');

  const specBookings = bookings
    .filter(b => b.specialty===activeSpec && (statusFilter==='All'||b.status===statusFilter))
    .sort((a,b)=>a.date.localeCompare(b.date));

  return (
    <div style={{ flex:1, overflowY:'auto', padding: isMobile?'16px':'28px 28px', paddingBottom: isMobile?80:28 }}>
      <div style={{ marginBottom:20 }}>
        <h2 style={{ fontSize: isMobile?18:20, fontWeight:700, color:'var(--text)', margin:'0 0 3px', letterSpacing:'-0.3px' }}>Specialty Lists</h2>
        <p style={{ color:'var(--muted)', fontSize:12.5, margin:0 }}>All bookings by surgical specialty</p>
      </div>

      {/* Specialty tabs — scrollable on mobile */}
      <div style={{ display:'flex', gap:6, marginBottom:16, overflowX:'auto', paddingBottom:4 }}>
        {SPECIALTIES.map(s => {
          const count = bookings.filter(b=>b.specialty===s).length;
          const active = s===activeSpec;
          return (
            <button key={s} onClick={()=>setActiveSpec(s)}
              style={{ padding:'5px 12px', borderRadius:20, border:`1.5px solid ${active?'var(--green-accent)':'var(--border)'}`, background:active?'var(--green-deep)':'white', color:active?'white':'var(--text)', fontSize:12, fontWeight:active?600:400, cursor:'pointer', fontFamily:'var(--font)', whiteSpace:'nowrap', flexShrink:0, display:'flex', alignItems:'center', gap:5 }}>
              {s} <span style={{ opacity:0.65, fontSize:11 }}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Status filter */}
      <div style={{ display:'flex', gap:5, marginBottom:14 }}>
        {['All','Pending','Done','Cancelled'].map(s=>(
          <button key={s} onClick={()=>setStatusFilter(s)}
            style={{ padding:'4px 11px', borderRadius:6, border:`1px solid ${statusFilter===s?'var(--green-accent)':'var(--border)'}`, background:statusFilter===s?'var(--green-light)':'white', color:statusFilter===s?'var(--green-deep)':'var(--muted)', fontSize:12, fontWeight:statusFilter===s?600:400, cursor:'pointer', fontFamily:'var(--font)' }}>{s}</button>
        ))}
        <span style={{ marginLeft:'auto', fontSize:12.5, color:'var(--muted)', alignSelf:'center' }}>{specBookings.length} booking{specBookings.length!==1?'s':''}</span>
      </div>

      {isMobile ? (
        // Mobile: cards
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {specBookings.length===0 && <div style={{ color:'var(--muted)', fontSize:13, textAlign:'center', padding:24 }}>No bookings found.</div>}
          {specBookings.map(bk=>{
            const pt=PATIENTS.find(p=>p.id===bk.patientId);
            const sc={Pending:{bg:'#fffbeb',color:'#b45309'},Done:{bg:'#f0fdf4',color:'#166534'},Cancelled:{bg:'#fef2f2',color:'#991b1b'}}[bk.status];
            return (
              <div key={bk.id} style={{ padding:'13px 14px', background:'white', borderRadius:9, border:'1px solid var(--border)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:5 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>{pt?.full_name}</div>
                  <span style={{ fontSize:11, fontWeight:600, color:sc.color, background:sc.bg, borderRadius:4, padding:'2px 7px' }}>{bk.status}</span>
                </div>
                <div style={{ fontSize:12.5, color:'var(--text)', marginBottom:2 }}>{bk.procedure}</div>
                <div style={{ fontSize:12, color:'var(--muted)' }}>
                  {new Date(bk.date+'T00:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short'})} · {calcAge(pt?.dob)} · {bk.urgency}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Desktop: table
        <div style={{ background:'white', borderRadius:12, border:'1px solid var(--border)', overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ background:'#f8fafc', borderBottom:'1px solid var(--border)' }}>
                {['Date','Patient Name','UMR','Age','Procedure','Urgency','Status'].map(h=>(
                  <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontWeight:600, color:'var(--muted)', fontSize:11, textTransform:'uppercase', letterSpacing:'0.04em', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {specBookings.length===0&&<tr><td colSpan={7} style={{ padding:32, textAlign:'center', color:'var(--muted)' }}>No bookings found.</td></tr>}
              {specBookings.map((bk,i)=>{
                const pt=PATIENTS.find(p=>p.id===bk.patientId);
                const sc={Pending:{bg:'#fffbeb',color:'#b45309',border:'#fde68a'},Done:{bg:'#f0fdf4',color:'#166534',border:'#bbf7d0'},Cancelled:{bg:'#fef2f2',color:'#991b1b',border:'#fecaca'}}[bk.status];
                const urgC={Elective:'#475569',Urgent:'#b45309',Emergency:'#dc2626'};
                return (
                  <tr key={bk.id} style={{ borderBottom:i<specBookings.length-1?'1px solid #f3f4f6':'none' }}
                    onMouseEnter={e=>e.currentTarget.style.background='#fafafa'}
                    onMouseLeave={e=>e.currentTarget.style.background='white'}>
                    <td style={{ padding:'10px 14px', color:'var(--text)', fontWeight:500, whiteSpace:'nowrap' }}>{new Date(bk.date+'T00:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</td>
                    <td style={{ padding:'10px 14px', fontWeight:600, color:'var(--text)' }}>{pt?.full_name}</td>
                    <td style={{ padding:'10px 14px', fontFamily:'monospace', fontSize:12, color:'var(--muted)' }}>{pt?.umr}</td>
                    <td style={{ padding:'10px 14px', color:'var(--muted)' }}>{calcAge(pt?.dob)}</td>
                    <td style={{ padding:'10px 14px', color:'var(--text)' }}>{bk.procedure}</td>
                    <td style={{ padding:'10px 14px', fontSize:12, fontWeight:600, color:urgC[bk.urgency] }}>{bk.urgency}</td>
                    <td style={{ padding:'10px 14px' }}><span style={{ fontSize:11.5, fontWeight:600, color:sc.color, background:sc.bg, border:`1px solid ${sc.border}`, borderRadius:4, padding:'2px 7px' }}>{bk.status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Theatre List Screen ───────────────────────────────────────────────────────
function TheatreListScreen({ bookings, selectedDate }) {
  const isMobile = useIsMobile();
  const [printDate, setPrintDate] = React.useState(selectedDate || '2026-04-29');
  const dayBookings = bookings.filter(b=>b.date===printDate).sort((a,b)=>a.slot-b.slot);
  const slots = [1,2,3].map(s=>dayBookings.find(b=>b.slot===s)||null);
  const d = new Date(printDate+'T00:00:00');

  return (
    <div style={{ flex:1, overflowY:'auto', padding: isMobile?'16px':'28px 36px', background:'var(--bg)', paddingBottom: isMobile?80:28 }}>
      <div style={{ maxWidth:740 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, gap:12, flexWrap:'wrap' }}>
          <div>
            <h2 style={{ fontSize: isMobile?18:20, fontWeight:700, color:'var(--text)', margin:0, letterSpacing:'-0.3px' }}>Theatre List</h2>
            <p style={{ color:'var(--muted)', fontSize:12.5, margin:'3px 0 0' }}>Printable daily case list</p>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
            <input type="date" value={printDate} onChange={e=>setPrintDate(e.target.value)}
              style={{ ...inputStyle, width:'auto' }}
              onFocus={e=>e.target.style.borderColor='var(--green-accent)'}
              onBlur={e=>e.target.style.borderColor='var(--border)'} />
            <button onClick={()=>window.print()} style={btnPrimaryStyle}>Print / PDF</button>
          </div>
        </div>

        <div id="print-area" style={{ background:'white', borderRadius:12, border:'1px solid var(--border)', overflow:'hidden', boxShadow:'0 1px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ padding:'22px 24px', borderBottom:'2px solid var(--green-deep)', background:'var(--green-deep)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.55)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:3 }}>Paediatric Surgery Unit</div>
                <div style={{ fontSize:20, fontWeight:700, color:'white', letterSpacing:'-0.4px' }}>Daily Theatre List</div>
                <div style={{ fontSize:14, color:'rgba(255,255,255,0.8)', marginTop:3 }}>
                  {d.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
                </div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)', marginBottom:1 }}>Cases</div>
                <div style={{ fontSize:26, fontWeight:700, color:'white', lineHeight:1 }}>{dayBookings.length}<span style={{ fontSize:13, opacity:0.5 }}>/3</span></div>
              </div>
            </div>
          </div>

          <div style={{ padding:isMobile?'14px 16px':'18px 24px' }}>
            {slots.map((bk, i) => {
              const slotNum = i+1;
              if (!bk) return (
                <div key={slotNum} style={{ marginBottom:12, padding:'14px 16px', borderRadius:9, border:'1.5px dashed #e5e7eb' }}>
                  <div style={{ fontSize:12, fontWeight:600, color:'#d1d5db', textTransform:'uppercase' }}>Slot {slotNum} — Not booked</div>
                </div>
              );
              const pt = PATIENTS.find(p=>p.id===bk.patientId);
              const urgC = {Elective:'#475569',Urgent:'#b45309',Emergency:'#dc2626'};
              return (
                <div key={slotNum} style={{ marginBottom:12, padding:isMobile?'14px 14px':'16px 20px', borderRadius:9, border:'1px solid var(--border)', background:'#fafafa' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:26, height:26, borderRadius:6, background:'var(--green-deep)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:12, flexShrink:0 }}>{slotNum}</div>
                      <div>
                        <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', letterSpacing:'-0.2px' }}>{pt?.full_name}</div>
                        <div style={{ fontSize:12, color:'var(--muted)', marginTop:1 }}>{pt?.umr} · {pt?.sex} · Age {calcAge(pt?.dob)}</div>
                      </div>
                    </div>
                    <span style={{ fontSize:12, fontWeight:700, color:urgC[bk.urgency] }}>{bk.urgency}</span>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr':'1fr 1fr', gap:'6px 20px' }}>
                    {[['Procedure',bk.procedure],['Specialty',bk.specialty],bk.diagnosis&&['Diagnosis',bk.diagnosis],pt?.phone_primary&&['Contact',pt.phone_primary],['SHA',pt?.sha]].filter(Boolean).map(([k,v])=>(
                      <div key={k} style={{ display:'flex', gap:6 }}>
                        <span style={{ fontSize:12, color:'var(--muted)', minWidth:80 }}>{k}:</span>
                        <span style={{ fontSize:12.5, color:'var(--text)', fontWeight:500 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  {bk.preOpNotes && (
                    <div style={{ marginTop:10, padding:'8px 12px', background:'#f0fdf4', borderRadius:7, borderLeft:'3px solid var(--green-accent)' }}>
                      <div style={{ fontSize:10.5, fontWeight:700, color:'var(--green-accent)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:2 }}>Pre-op notes</div>
                      <div style={{ fontSize:12.5, color:'var(--text)' }}>{bk.preOpNotes}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ padding:'12px 24px', borderTop:'1px solid var(--border)', background:'#f8fafc', display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:4 }}>
            <span style={{ fontSize:11, color:'var(--muted)' }}>Generated: {new Date().toLocaleString('en-GB')}</span>
            <span style={{ fontSize:11, color:'var(--muted)' }}>Orodha — Paediatric Surgery Theatre Management</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Audit Log Screen ──────────────────────────────────────────────────────────
function AuditLogScreen() {
  const isMobile = useIsMobile();
  return (
    <div style={{ flex:1, overflowY:'auto', padding: isMobile?'16px':'28px 28px', paddingBottom: isMobile?80:28 }}>
      <div style={{ marginBottom:20 }}>
        <h2 style={{ fontSize: isMobile?18:20, fontWeight:700, color:'var(--text)', margin:'0 0 3px', letterSpacing:'-0.3px' }}>Audit Log</h2>
        <p style={{ color:'var(--muted)', fontSize:12.5, margin:0 }}>All booking actions — timestamped and attributable</p>
      </div>
      {isMobile ? (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {AUDIT_LOG.map(entry=>(
            <div key={entry.id} style={{ padding:'12px 14px', background:'white', borderRadius:9, border:'1px solid var(--border)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                <span style={{ fontSize:11, fontFamily:'monospace', color:'var(--muted)' }}>{entry.timestamp}</span>
                <span style={{ fontSize:11.5, fontWeight:600, color:'var(--text)' }}>{entry.user}</span>
              </div>
              <div style={{ marginBottom:3 }}>
                <span style={{ fontSize:12, fontWeight:600, padding:'2px 7px', borderRadius:4, background:entry.action.includes('created')?'#eff6ff':entry.action.includes('Done')?'#f0fdf4':entry.action.includes('Cancelled')?'#fef2f2':'#f1f5f9', color:entry.action.includes('created')?'#1d4ed8':entry.action.includes('Done')?'#166534':entry.action.includes('Cancelled')?'#991b1b':'#475569' }}>{entry.action}</span>
              </div>
              <div style={{ fontSize:12.5, color:'var(--muted)' }}>{entry.target}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background:'white', borderRadius:12, border:'1px solid var(--border)', overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ background:'#f8fafc', borderBottom:'1px solid var(--border)' }}>
                {['Timestamp','User','Action','Target record'].map(h=>(
                  <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontWeight:600, color:'var(--muted)', fontSize:11, textTransform:'uppercase', letterSpacing:'0.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {AUDIT_LOG.map((entry,i)=>(
                <tr key={entry.id} style={{ borderBottom:i<AUDIT_LOG.length-1?'1px solid #f3f4f6':'none' }}
                  onMouseEnter={e=>e.currentTarget.style.background='#fafafa'}
                  onMouseLeave={e=>e.currentTarget.style.background='white'}>
                  <td style={{ padding:'10px 16px', fontSize:12, color:'var(--muted)', whiteSpace:'nowrap', fontFamily:'monospace' }}>{entry.timestamp}</td>
                  <td style={{ padding:'10px 16px', fontWeight:600, color:'var(--text)', whiteSpace:'nowrap' }}>{entry.user}</td>
                  <td style={{ padding:'10px 16px' }}>
                    <span style={{ fontSize:12, fontWeight:600, padding:'2px 8px', borderRadius:4, background:entry.action.includes('created')?'#eff6ff':entry.action.includes('Done')?'#f0fdf4':entry.action.includes('Cancelled')?'#fef2f2':entry.action.includes('blocked')?'#f1f5f9':'#fffbeb', color:entry.action.includes('created')?'#1d4ed8':entry.action.includes('Done')?'#166534':entry.action.includes('Cancelled')?'#991b1b':entry.action.includes('blocked')?'#475569':'#b45309' }}>{entry.action}</span>
                  </td>
                  <td style={{ padding:'10px 16px', color:'var(--muted)', fontSize:12.5 }}>{entry.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { PatientRegistryScreen, SpecialtyListScreen, TheatreListScreen, AuditLogScreen });
