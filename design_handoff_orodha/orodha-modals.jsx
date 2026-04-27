
// ── Shared hooks + Modal components ──────────────────────────────────────────

function useIsMobile() {
  const [mobile, setMobile] = React.useState(window.innerWidth < 768);
  React.useEffect(() => {
    const h = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return mobile;
}

// Base overlay modal
function Modal({ onClose, children, maxWidth = 460, bottomSheet = false }) {
  React.useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  if (bottomSheet) {
    return (
      <div style={{
        position:'fixed', inset:0, zIndex:1000,
        background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'flex-end',
      }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div style={{
          width:'100%', background:'white', borderRadius:'16px 16px 0 0',
          maxHeight:'90vh', overflowY:'auto',
          animation:'slideUp 0.25s ease',
        }}>
          <div style={{ width:40, height:4, borderRadius:2, background:'#e5e7eb', margin:'12px auto 0' }}></div>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:1000,
      background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', padding:16,
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        width:'100%', maxWidth, background:'white', borderRadius:14,
        boxShadow:'0 20px 60px rgba(0,0,0,0.2)',
        animation:'fadeIn 0.15s ease',
      }}>
        {children}
      </div>
    </div>
  );
}

// Cancellation reason picker
function CancellationModal({ booking, patient, onConfirm, onClose }) {
  const isMobile = useIsMobile();
  const [reason, setReason] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [error, setError] = React.useState('');

  function handleConfirm() {
    if (!reason) { setError('Please select a cancellation reason.'); return; }
    if (reason === 'Other' && !notes.trim()) { setError('Please describe the reason.'); return; }
    onConfirm(reason === 'Other' ? notes.trim() : reason);
  }

  const content = (
    <div style={{ padding:'24px 24px 20px' }}>
      <h3 style={{ fontSize:16, fontWeight:700, color:'var(--text)', margin:'0 0 4px', letterSpacing:'-0.2px' }}>Cancel booking</h3>
      <p style={{ fontSize:13, color:'var(--muted)', margin:'0 0 20px' }}>
        {patient?.full_name} — {booking?.procedure}
      </p>

      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:12.5, fontWeight:600, color:'var(--text)', marginBottom:8 }}>Cancellation reason *</div>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {CANCELLATION_REASONS.map(r => (
            <label key={r} style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', padding:'9px 12px', borderRadius:8, border:`1.5px solid ${reason===r?'var(--green-accent)':'var(--border)'}`, background:reason===r?'var(--green-light)':'white', transition:'all 0.12s' }}>
              <input type="radio" name="cancel_reason" value={r} checked={reason===r} onChange={()=>{ setReason(r); setError(''); }}
                style={{ accentColor:'var(--green-accent)', width:14, height:14, flexShrink:0 }} />
              <span style={{ fontSize:13, color:'var(--text)', fontWeight:reason===r?600:400 }}>{r}</span>
            </label>
          ))}
        </div>
      </div>

      {reason === 'Other' && (
        <label style={{ display:'block', fontSize:13, fontWeight:500, color:'var(--text)', marginBottom:16 }}>
          Please describe *
          <textarea value={notes} onChange={e=>{setNotes(e.target.value);setError('');}}
            rows={2} placeholder="Describe the reason…"
            style={{ display:'block', width:'100%', marginTop:5, padding:'9px 12px', border:'1px solid var(--border)', borderRadius:8, fontSize:13, fontFamily:'var(--font)', resize:'vertical', outline:'none', boxSizing:'border-box' }}
            onFocus={e=>e.target.style.borderColor='var(--green-accent)'}
            onBlur={e=>e.target.style.borderColor='var(--border)'}
          />
        </label>
      )}

      {error && <div style={{ marginBottom:12, padding:'8px 12px', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:7, color:'#b91c1c', fontSize:12.5 }}>{error}</div>}

      <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
        <button onClick={onClose} style={{ ...btnSecondaryStyle, fontSize:13 }}>Keep booking</button>
        <button onClick={handleConfirm} style={{ ...btnDangerStyle, fontSize:13 }}>Confirm cancellation</button>
      </div>
    </div>
  );

  return <Modal onClose={onClose} maxWidth={480} bottomSheet={isMobile}>{content}</Modal>;
}

// Block / unblock date
function BlockDateModal({ dateStr, existingReason, onConfirm, onClose }) {
  const isMobile = useIsMobile();
  const isBlocking = !existingReason;
  const [reason, setReason] = React.useState(existingReason || '');
  const [error, setError] = React.useState('');
  const d = new Date(dateStr + 'T00:00:00');
  const dateLabel = d.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'});

  function handleConfirm() {
    if (isBlocking && !reason.trim()) { setError('Please enter a reason for blocking.'); return; }
    onConfirm(isBlocking ? reason.trim() : null);
  }

  const content = (
    <div style={{ padding:'24px 24px 20px' }}>
      <h3 style={{ fontSize:16, fontWeight:700, color:'var(--text)', margin:'0 0 4px' }}>
        {isBlocking ? 'Block theatre date' : 'Remove date block'}
      </h3>
      <p style={{ fontSize:13, color:'var(--muted)', margin:'0 0 20px' }}>{dateLabel}</p>

      {isBlocking ? (
        <label style={{ display:'block', fontSize:13, fontWeight:500, color:'var(--text)', marginBottom:16 }}>
          Reason for blocking *
          <input value={reason} onChange={e=>{setReason(e.target.value);setError('');}}
            placeholder="e.g. Equipment maintenance, Training day…"
            style={{ display:'block', width:'100%', marginTop:5, padding:'9px 12px', border:'1px solid var(--border)', borderRadius:8, fontSize:13, fontFamily:'var(--font)', outline:'none', boxSizing:'border-box' }}
            onFocus={e=>e.target.style.borderColor='var(--green-accent)'}
            onBlur={e=>e.target.style.borderColor='var(--border)'}
          />
        </label>
      ) : (
        <div style={{ padding:'12px 14px', background:'#fef9c3', border:'1px solid #fde68a', borderRadius:8, marginBottom:16, fontSize:13, color:'#854d0e' }}>
          <strong>Currently blocked:</strong> {existingReason}<br/>
          <span style={{ fontSize:12, marginTop:4, display:'block' }}>Removing this block will allow bookings on this date.</span>
        </div>
      )}

      {error && <div style={{ marginBottom:12, padding:'8px 12px', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:7, color:'#b91c1c', fontSize:12.5 }}>{error}</div>}

      <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
        <button onClick={onClose} style={{ ...btnSecondaryStyle, fontSize:13 }}>Cancel</button>
        <button onClick={handleConfirm}
          style={{ ...(isBlocking ? btnDangerStyle : btnPrimaryStyle), fontSize:13 }}>
          {isBlocking ? 'Block date' : 'Remove block'}
        </button>
      </div>
    </div>
  );

  return <Modal onClose={onClose} maxWidth={420} bottomSheet={isMobile}>{content}</Modal>;
}

// Simple confirm modal
function ConfirmModal({ title, message, confirmLabel='Confirm', onConfirm, onClose }) {
  const isMobile = useIsMobile();
  const content = (
    <div style={{ padding:'24px 24px 20px' }}>
      <h3 style={{ fontSize:16, fontWeight:700, color:'var(--text)', margin:'0 0 8px' }}>{title}</h3>
      <p style={{ fontSize:13, color:'var(--muted)', margin:'0 0 20px' }}>{message}</p>
      <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
        <button onClick={onClose} style={{ ...btnSecondaryStyle, fontSize:13 }}>Cancel</button>
        <button onClick={onConfirm} style={{ ...btnPrimaryStyle, fontSize:13 }}>{confirmLabel}</button>
      </div>
    </div>
  );
  return <Modal onClose={onClose} maxWidth={380} bottomSheet={isMobile}>{content}</Modal>;
}

const btnDangerStyle = {
  background:'#dc2626', color:'white', border:'none',
  borderRadius:8, padding:'8px 16px', fontSize:13.5, fontWeight:600,
  cursor:'pointer', fontFamily:'var(--font)',
};

Object.assign(window, { useIsMobile, Modal, CancellationModal, BlockDateModal, ConfirmModal, btnDangerStyle });
