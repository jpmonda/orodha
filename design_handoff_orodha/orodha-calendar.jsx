
// ── Calendar Screen + Day Panel (with mobile, status updates, block dates) ────

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS_IN_MONTH = [31,28,31,30,31,30,31,31,30,31,30,31];
const WEEKDAY_START = [3,0,0,2,4,6,1,4,0,2,5,0]; // getDay() of 1st of each month 2026

function isWeekend(monthIdx, day) {
  return ((WEEKDAY_START[monthIdx] + day - 1) % 7) % 6 === 0;
}

function countColor(n, blocked) {
  if (blocked) return { bg:'#e5e7eb', color:'#6b7280', border:'#d1d5db' };
  if (n === 0) return { bg:'white', color:'#9ca3af', border:'#e5e7eb' };
  if (n === 1) return { bg:'#dcfce7', color:'#166534', border:'#bbf7d0' };
  if (n === 2) return { bg:'#fef9c3', color:'#854d0e', border:'#fde68a' };
  return { bg:'#fee2e2', color:'#991b1b', border:'#fca5a5' };
}

// ── Week strip for mobile ─────────────────────────────────────────────────────
function WeekStrip({ bookings, blockedDates, selectedDay, onSelectDay }) {
  const todayDate = new Date(TODAY + 'T00:00:00');
  const [weekOffset, setWeekOffset] = React.useState(0);

  // Current week Mon
  const baseMonday = new Date(todayDate);
  const dow = baseMonday.getDay() || 7;
  baseMonday.setDate(baseMonday.getDate() - dow + 1 + weekOffset * 7);

  const days = Array.from({length:7}, (_,i) => {
    const d = new Date(baseMonday);
    d.setDate(d.getDate() + i);
    return d;
  });

  const fmt = d => d.toISOString().slice(0,10);

  return (
    <div>
      {/* Week nav */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px 8px', background:'white', borderBottom:'1px solid var(--border)' }}>
        <button onClick={()=>setWeekOffset(o=>o-1)} style={{ background:'none',border:'none',cursor:'pointer',padding:6,color:'var(--muted)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <span style={{ fontSize:13.5, fontWeight:600, color:'var(--text)' }}>
          {days[0].toLocaleDateString('en-GB',{day:'numeric',month:'short'})} – {days[6].toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
        </span>
        <button onClick={()=>setWeekOffset(o=>o+1)} style={{ background:'none',border:'none',cursor:'pointer',padding:6,color:'var(--muted)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      {/* Day cells */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4, padding:'10px 12px', background:'white' }}>
        {['M','T','W','T','F','S','S'].map((d,i)=>(
          <div key={i} style={{ textAlign:'center', fontSize:11, color:'var(--muted)', fontWeight:600, marginBottom:4 }}>{d}</div>
        ))}
        {days.map(d => {
          const ds = fmt(d);
          const bks = bookings.filter(b=>b.date===ds);
          const blk = blockedDates.some(b=>b.date===ds);
          const isToday = ds === TODAY;
          const isSel = ds === selectedDay;
          const {bg,color,border} = countColor(bks.length, blk);
          return (
            <div key={ds} onClick={()=>onSelectDay(ds)}
              style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', borderRadius:10, border: isSel?'2px solid var(--green-accent)':`1px solid ${border}`, background:bg, padding:'8px 4px', cursor:'pointer', minHeight:52, position:'relative', boxShadow:isToday?'0 0 0 2px var(--green-accent) inset':'none' }}>
              <span style={{ fontSize:14, fontWeight:isToday?700:500, color:isToday?'var(--green-accent)':color }}>{d.getDate()}</span>
              {bks.length>0 && <span style={{ fontSize:11, fontWeight:700, color, marginTop:2 }}>{bks.length}</span>}
              {blk && <span style={{ fontSize:10, color:'#6b7280' }}>🔒</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Annual Calendar Grid ──────────────────────────────────────────────────────
function AnnualGrid({ bookings, blockedDates, selectedDay, onSelectDay }) {
  return (
    <div style={{ flex:1, overflowY:'auto', padding:'20px 24px' }}>
      <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', marginBottom:6 }}>
          <div style={{ width:88, flexShrink:0 }}></div>
          <div style={{ flex:1, display:'grid', gridTemplateColumns:'repeat(31,1fr)', gap:2 }}>
            {Array.from({length:31},(_,i)=>(
              <div key={i} style={{ textAlign:'center', fontSize:10, color:'var(--muted)', fontWeight:500 }}>{i+1}</div>
            ))}
          </div>
        </div>

        {MONTHS.map((month, mi) => (
          <div key={mi} style={{ display:'flex', alignItems:'center' }}>
            <div style={{ width:88, flexShrink:0, fontSize:12, fontWeight:600, color:'var(--text)', paddingRight:6 }}>{month}</div>
            <div style={{ flex:1, display:'grid', gridTemplateColumns:'repeat(31,1fr)', gap:2 }}>
              {Array.from({length:31},(_,di)=>{
                const day = di+1;
                if (day > DAYS_IN_MONTH[mi]) return <div key={di} style={{ height:26 }}></div>;
                const ds = `2026-${String(mi+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                const bks = bookings.filter(b=>b.date===ds);
                const blk = blockedDates.some(b=>b.date===ds);
                const wknd = isWeekend(mi, day);
                const isToday = ds === TODAY;
                const isSel = ds === selectedDay;
                const isPast = ds < TODAY;
                const { bg, color, border } = countColor(bks.length, blk);
                return (
                  <div key={di} onClick={()=>onSelectDay(ds)}
                    title={blk ? blockedDates.find(b=>b.date===ds)?.reason : `${bks.length} booking${bks.length!==1?'s':''}`}
                    style={{
                      height:26, borderRadius:5,
                      border: isSel ? '2px solid var(--green-accent)' : `1px solid ${border}`,
                      background: wknd&&!blk&&bks.length===0 ? '#f9fafb' : bg,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      cursor:'pointer', transition:'transform 0.1s',
                      opacity: isPast&&bks.length===0&&!blk ? 0.4 : 1,
                      boxShadow: isToday ? '0 0 0 2px var(--green-accent)' : 'none',
                    }}
                    onMouseEnter={e=>e.currentTarget.style.transform='scale(1.18)'}
                    onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
                  >
                    {blk ? (
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 5h2v6h-2zm0 8h2v2h-2z"/></svg>
                    ) : bks.length > 0 ? (
                      <span style={{ fontSize:11, fontWeight:700, color }}>{bks.length}</span>
                    ) : (
                      <span style={{ fontSize:9, color:'#d1d5db' }}>{day}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Day Panel ─────────────────────────────────────────────────────────────────
function DayPanel({ dateStr, bookings, blockedDates, setBookings, setBlockedDates, onClose, setScreen, setBookingDate, user, isMobile }) {
  const [cancelTarget, setCancelTarget] = React.useState(null);
  const [confirmDone, setConfirmDone] = React.useState(null);
  const [showBlockModal, setShowBlockModal] = React.useState(false);

  const dayBookings = bookings.filter(b=>b.date===dateStr).sort((a,b)=>a.slot-b.slot);
  const blocked = blockedDates.find(b=>b.date===dateStr);
  const d = new Date(dateStr + 'T00:00:00');
  const dayName = d.toLocaleDateString('en-GB',{weekday:'long'});
  const dateLabel = d.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
  const isPast = dateStr < TODAY;
  const slots = [1,2,3].map(s=>dayBookings.find(b=>b.slot===s)||null);
  const canBlock = user.role === 'Admin';

  function markDone(bookingId) {
    setBookings(bs => bs.map(b => b.id===bookingId ? {...b, status:'Done'} : b));
    setConfirmDone(null);
  }

  function markCancelled(bookingId, reason) {
    setBookings(bs => bs.map(b => b.id===bookingId ? {...b, status:'Cancelled', cancelReason:reason} : b));
    setCancelTarget(null);
  }

  function handleBlockToggle(reason) {
    if (blocked) {
      setBlockedDates(bs => bs.filter(b=>b.date!==dateStr));
    } else {
      setBlockedDates(bs => [...bs, { date:dateStr, reason }]);
    }
    setShowBlockModal(false);
  }

  const panelContent = (
    <div style={{ display:'flex', flexDirection:'column', height: isMobile ? 'auto' : '100%' }}>
      {/* Header */}
      <div style={{ padding:'18px 20px 14px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <div style={{ fontSize:11, fontWeight:600, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:2 }}>{dayName}</div>
          <div style={{ fontSize:17, fontWeight:700, color:'var(--text)', letterSpacing:'-0.3px' }}>{dateLabel}</div>
          {blocked && (
            <div style={{ marginTop:6, display:'inline-flex', alignItems:'center', gap:5, background:'#f1f5f9', borderRadius:6, padding:'3px 8px' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              <span style={{ fontSize:11, color:'#64748b', fontWeight:500 }}>BLOCKED — {blocked.reason}</span>
            </div>
          )}
        </div>
        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
          {canBlock && (
            <button onClick={()=>setShowBlockModal(true)}
              title={blocked?'Remove block':'Block this date'}
              style={{ background:'none', border:'1px solid var(--border)', borderRadius:6, cursor:'pointer', padding:'4px 8px', color:'var(--muted)', fontSize:11.5, fontWeight:500, fontFamily:'var(--font)' }}>
              {blocked ? '🔓 Unblock' : '🔒 Block'}
            </button>
          )}
          <button onClick={onClose} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--muted)',padding:4,borderRadius:4 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      </div>

      {/* Slots */}
      <div style={{ padding:'14px 20px', flex:1, overflowY: isMobile ? 'visible' : 'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <span style={{ fontSize:12, fontWeight:600, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{dayBookings.length}/3 slots booked</span>
          {!isPast && !blocked && dayBookings.length < 3 && (
            <button onClick={()=>{ setBookingDate(dateStr); setScreen('newbooking'); if(onClose) onClose(); }}
              style={{ fontSize:12, color:'var(--green-accent)', background:'none', border:'1px solid var(--green-accent)', borderRadius:6, padding:'4px 10px', cursor:'pointer', fontFamily:'var(--font)', fontWeight:600 }}>
              + Book slot
            </button>
          )}
        </div>

        {slots.map((bk, i) => {
          const slotNum = i+1;
          if (!bk) {
            return (
              <div key={slotNum} style={{ marginBottom:10, borderRadius:8, border:'1.5px dashed #e5e7eb', padding:'12px 14px' }}>
                <div style={{ fontSize:11, fontWeight:600, color:'#d1d5db', textTransform:'uppercase', letterSpacing:'0.05em' }}>Slot {slotNum} — available</div>
              </div>
            );
          }
          const pt = PATIENTS.find(p=>p.id===bk.patientId);
          const sc = {
            Pending:   { bg:'#fffbeb', color:'#b45309', border:'#fde68a' },
            Done:      { bg:'#f0fdf4', color:'#166534', border:'#bbf7d0' },
            Cancelled: { bg:'#fef2f2', color:'#991b1b', border:'#fecaca' },
          }[bk.status];

          return (
            <div key={slotNum} style={{ marginBottom:10, borderRadius:8, border:`1px solid ${sc.border}`, background:sc.bg, padding:'13px 14px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:7 }}>
                <div style={{ fontSize:11, fontWeight:600, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.05em' }}>Slot {slotNum}</div>
                <span style={{ fontSize:11, fontWeight:600, color:sc.color, background:'white', border:`1px solid ${sc.border}`, borderRadius:4, padding:'2px 7px' }}>{bk.status}</span>
              </div>
              <div style={{ fontSize:14, fontWeight:700, color:'var(--text)', marginBottom:2 }}>{pt?.full_name}</div>
              <div style={{ fontSize:12, color:'var(--muted)', marginBottom:6 }}>{pt?.umr} · {calcAge(pt?.dob)} · {pt?.sex}</div>
              <div style={{ fontSize:12.5, color:'var(--text)', marginBottom:2 }}>{bk.procedure}</div>
              <div style={{ fontSize:11.5, color:'var(--muted)', marginBottom: bk.preOpNotes||bk.cancelReason?6:0 }}>{bk.specialty} · <span style={{ fontWeight:600, color:bk.urgency==='Emergency'?'#dc2626':bk.urgency==='Urgent'?'#b45309':'var(--muted)' }}>{bk.urgency}</span></div>
              {bk.cancelReason && <div style={{ fontSize:11, color:'#b91c1c', fontStyle:'italic', marginBottom:4 }}>Reason: {bk.cancelReason}</div>}
              {bk.preOpNotes && <div style={{ fontSize:11, color:'#4b5563', background:'rgba(0,0,0,0.04)', borderRadius:4, padding:'4px 8px', marginTop:4 }}>{bk.preOpNotes}</div>}

              {/* Status actions — only for Pending + non-past + appropriate roles */}
              {bk.status === 'Pending' && (user.role === 'Admin' || user.role === 'Surgeon') && (
                <div style={{ display:'flex', gap:6, marginTop:10 }}>
                  <button onClick={()=>setConfirmDone(bk)}
                    style={{ flex:1, padding:'6px 0', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:6, color:'#166534', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'var(--font)' }}>
                    ✓ Mark Done
                  </button>
                  <button onClick={()=>setCancelTarget(bk)}
                    style={{ flex:1, padding:'6px 0', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:6, color:'#991b1b', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'var(--font)' }}>
                    ✕ Cancel
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ padding:'12px 20px', borderTop:'1px solid var(--border)' }}>
        <button onClick={()=>{ setBookingDate(dateStr); setScreen('theatre'); if(onClose) onClose(); }}
          style={{ ...btnSecondaryStyle, width:'100%', fontSize:12.5, textAlign:'center' }}>
          Print Theatre List
        </button>
      </div>
    </div>
  );

  return (
    <>
      {isMobile ? (
        <Modal onClose={onClose} bottomSheet={true}>
          {panelContent}
        </Modal>
      ) : (
        <div style={{ width:330, flexShrink:0, borderLeft:'1px solid var(--border)', background:'white', display:'flex', flexDirection:'column', height:'100%', overflowY:'auto' }}>
          {panelContent}
        </div>
      )}

      {/* Confirm Done modal */}
      {confirmDone && (
        <ConfirmModal
          title="Mark as Done?"
          message={`Confirm that ${PATIENTS.find(p=>p.id===confirmDone.patientId)?.full_name}'s case (${confirmDone.procedure}) was completed.`}
          confirmLabel="Mark Done"
          onConfirm={()=>markDone(confirmDone.id)}
          onClose={()=>setConfirmDone(null)}
        />
      )}

      {/* Cancellation modal */}
      {cancelTarget && (
        <CancellationModal
          booking={cancelTarget}
          patient={PATIENTS.find(p=>p.id===cancelTarget.patientId)}
          onConfirm={reason=>markCancelled(cancelTarget.id, reason)}
          onClose={()=>setCancelTarget(null)}
        />
      )}

      {/* Block date modal */}
      {showBlockModal && (
        <BlockDateModal
          dateStr={dateStr}
          existingReason={blocked?.reason || null}
          onConfirm={handleBlockToggle}
          onClose={()=>setShowBlockModal(false)}
        />
      )}
    </>
  );
}

// ── Calendar Screen ───────────────────────────────────────────────────────────
function CalendarScreen({ bookings, setBookings, blockedDates, setBlockedDates, setScreen, setSelectedDate, setBookingDate, user }) {
  const isMobile = useIsMobile();
  const [selectedDay, setSelectedDay] = React.useState(TODAY);
  const [panelOpen, setPanelOpen] = React.useState(!isMobile);

  function selectDay(ds) {
    setSelectedDay(ds);
    setSelectedDate(ds);
    setPanelOpen(true);
  }

  return (
    <div style={{ display:'flex', flex:1, flexDirection:'column', minHeight:0, overflow:'hidden' }}>
      {/* Desktop top bar */}
      {!isMobile && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 28px 16px', flexShrink:0, borderBottom:'1px solid var(--border)', background:'white' }}>
          <div>
            <h2 style={{ fontSize:19, fontWeight:700, color:'var(--text)', margin:0, letterSpacing:'-0.3px' }}>Theatre Calendar</h2>
            <p style={{ color:'var(--muted)', fontSize:12.5, margin:'3px 0 0' }}>2026 — Paediatric Surgery Unit</p>
          </div>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <Legend />
            <button onClick={()=>{ setBookingDate(''); setScreen('newbooking'); }} style={btnPrimaryStyle}>+ New Booking</button>
          </div>
        </div>
      )}

      <div style={{ display:'flex', flex:1, minHeight:0, overflow:'hidden' }}>
        {/* Main calendar area */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', minHeight:0, overflow:'hidden' }}>
          {isMobile ? (
            <>
              <WeekStrip bookings={bookings} blockedDates={blockedDates} selectedDay={selectedDay} onSelectDay={selectDay} />
              {/* Mobile booking list below strip */}
              <div style={{ flex:1, overflowY:'auto', padding:'12px 16px', paddingBottom:80 }}>
                <MobileBookingList bookings={bookings} blockedDates={blockedDates} selectedDay={selectedDay} onSelectDay={selectDay} />
              </div>
            </>
          ) : (
            <AnnualGrid bookings={bookings} blockedDates={blockedDates} selectedDay={selectedDay} onSelectDay={selectDay} />
          )}
        </div>

        {/* Day panel — desktop only (mobile uses bottom sheet) */}
        {!isMobile && panelOpen && (
          <DayPanel
            dateStr={selectedDay}
            bookings={bookings}
            setBookings={setBookings}
            blockedDates={blockedDates}
            setBlockedDates={setBlockedDates}
            onClose={()=>setPanelOpen(false)}
            setScreen={setScreen}
            setBookingDate={setBookingDate}
            user={user}
            isMobile={false}
          />
        )}
      </div>

      {/* Mobile day panel (bottom sheet, triggered by tapping a day) */}
      {isMobile && panelOpen && (
        <DayPanel
          dateStr={selectedDay}
          bookings={bookings}
          setBookings={setBookings}
          blockedDates={blockedDates}
          setBlockedDates={setBlockedDates}
          onClose={()=>setPanelOpen(false)}
          setScreen={setScreen}
          setBookingDate={setBookingDate}
          user={user}
          isMobile={true}
        />
      )}
    </div>
  );
}

// Upcoming/recent bookings list for mobile calendar screen
function MobileBookingList({ bookings, blockedDates, selectedDay, onSelectDay }) {
  // Show next 10 upcoming bookings from today
  const upcoming = bookings
    .filter(b => b.date >= TODAY && b.status === 'Pending')
    .sort((a,b) => a.date.localeCompare(b.date) || a.slot - b.slot)
    .slice(0, 12);

  if (upcoming.length === 0) return <div style={{ color:'var(--muted)', fontSize:13, textAlign:'center', padding:24 }}>No upcoming bookings.</div>;

  let lastDate = '';
  return (
    <div>
      <div style={{ fontSize:12, fontWeight:600, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:10 }}>Upcoming bookings</div>
      {upcoming.map(bk => {
        const pt = PATIENTS.find(p=>p.id===bk.patientId);
        const showDate = bk.date !== lastDate;
        lastDate = bk.date;
        const d = new Date(bk.date+'T00:00:00');
        return (
          <React.Fragment key={bk.id}>
            {showDate && (
              <div style={{ fontSize:12, fontWeight:700, color:'var(--green-deep)', margin:'12px 0 6px', paddingBottom:4, borderBottom:'1px solid var(--border)' }}>
                {d.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})}
              </div>
            )}
            <div onClick={()=>onSelectDay(bk.date)}
              style={{ padding:'10px 12px', background:'white', borderRadius:8, border:'1px solid var(--border)', marginBottom:6, cursor:'pointer' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13.5, fontWeight:700, color:'var(--text)' }}>{pt?.full_name}</div>
                  <div style={{ fontSize:12, color:'var(--muted)', marginTop:1 }}>{bk.procedure} · Slot {bk.slot}</div>
                </div>
                <span style={{ fontSize:11, color:'var(--muted)', marginLeft:8 }}>{bk.specialty.split(' ')[0]}</span>
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

function Legend() {
  return (
    <div style={{ display:'flex', gap:10, alignItems:'center' }}>
      {[['#dcfce7','#bbf7d0','1'],['#fef9c3','#fde68a','2'],['#fee2e2','#fca5a5','Full'],['#e5e7eb','#d1d5db','Blocked']].map(([bg,border,text])=>(
        <div key={text} style={{ display:'flex', alignItems:'center', gap:4 }}>
          <div style={{ width:13,height:13,borderRadius:3,background:bg,border:`1px solid ${border}` }}></div>
          <span style={{ fontSize:11.5, color:'var(--muted)' }}>{text}</span>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { CalendarScreen, btnPrimaryStyle: { background:'var(--green-deep)', color:'white', border:'none', borderRadius:8, padding:'8px 16px', fontSize:13.5, fontWeight:600, cursor:'pointer', fontFamily:'var(--font)', letterSpacing:'-0.2px' }, btnSecondaryStyle: { background:'white', color:'var(--text)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 14px', fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'var(--font)' } });
