
// ── Sidebar + Mobile Bottom Nav + Login ───────────────────────────────────────

const NAV_ITEMS = [
  { id:'calendar',  label:'Calendar',   mobileLabel:'Calendar',  icon:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id:'patients',  label:'Patients',   mobileLabel:'Patients',  icon:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { id:'specialty', label:'Specialty Lists', mobileLabel:'Lists',icon:'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { id:'theatre',   label:'Theatre List', mobileLabel:'Print',   icon:'M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z' },
  { id:'audit',     label:'Audit Log',  mobileLabel:'Audit',     icon:'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
];

function SvgIcon({ d, size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <path d={d} />
    </svg>
  );
}

function Sidebar({ screen, setScreen, user }) {
  return (
    <aside style={{
      width:224, minWidth:224, background:'var(--sidebar-bg)',
      display:'flex', flexDirection:'column', height:'100vh',
      position:'sticky', top:0, flexShrink:0,
    }}>
      <div style={{ padding:'28px 24px 20px', borderBottom:'1px solid var(--sidebar-border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:8, background:'var(--green-accent)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/>
            </svg>
          </div>
          <div>
            <div style={{ color:'white', fontWeight:700, fontSize:17, letterSpacing:'-0.3px', lineHeight:1 }}>Orodha</div>
            <div style={{ color:'var(--sidebar-muted)', fontSize:11, marginTop:3, letterSpacing:'0.02em' }}>Theatre Management</div>
          </div>
        </div>
      </div>

      <nav style={{ flex:1, padding:'12px 10px', overflowY:'auto' }}>
        {NAV_ITEMS.map(item => {
          const active = screen === item.id;
          return (
            <button key={item.id} onClick={() => setScreen(item.id)}
              style={{
                width:'100%', display:'flex', alignItems:'center', gap:10,
                padding:'9px 14px', borderRadius:7, border:'none', cursor:'pointer',
                background: active ? 'var(--sidebar-active-bg)' : 'transparent',
                color: active ? 'white' : 'var(--sidebar-muted)',
                fontSize:13.5, fontWeight: active ? 600 : 400,
                transition:'all 0.15s', textAlign:'left', marginBottom:2,
              }}
              onMouseEnter={e=>{ if(!active) e.currentTarget.style.background='var(--sidebar-hover)'; }}
              onMouseLeave={e=>{ if(!active) e.currentTarget.style.background='transparent'; }}
            >
              <SvgIcon d={item.icon} size={16} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div style={{ padding:'14px 16px', borderTop:'1px solid var(--sidebar-border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:30, height:30, borderRadius:'50%', background:'var(--green-accent)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:12 }}>
            {user.name.split(' ').map(w=>w[0]).slice(0,2).join('')}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ color:'white', fontSize:12.5, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user.name}</div>
            <div style={{ color:'var(--sidebar-muted)', fontSize:11, marginTop:1 }}>{user.role}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ── Mobile Bottom Nav ─────────────────────────────────────────────────────────
function MobileNav({ screen, setScreen, user }) {
  // Show only 4 primary items on mobile
  const mobileItems = NAV_ITEMS.slice(0, 4);
  return (
    <nav style={{
      position:'fixed', bottom:0, left:0, right:0, zIndex:200,
      background:'white', borderTop:'1px solid var(--border)',
      display:'flex', alignItems:'stretch',
      paddingBottom:'env(safe-area-inset-bottom)',
    }}>
      {mobileItems.map(item => {
        const active = screen === item.id || (item.id === 'calendar' && screen === 'newbooking');
        return (
          <button key={item.id} onClick={()=>setScreen(item.id)}
            style={{
              flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              gap:4, padding:'10px 4px 8px', border:'none', background:'transparent',
              color: active ? 'var(--green-accent)' : 'var(--muted)',
              cursor:'pointer', fontFamily:'var(--font)',
            }}>
            <SvgIcon d={item.icon} size={active ? 22 : 20} />
            <span style={{ fontSize:10.5, fontWeight: active ? 700 : 400 }}>{item.mobileLabel}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ── Mobile Top Bar ────────────────────────────────────────────────────────────
function MobileTopBar({ screen, user, setScreen }) {
  const titles = { calendar:'Theatre Calendar', patients:'Patients', specialty:'Specialty Lists', theatre:'Theatre List', audit:'Audit Log', newbooking:'New Booking', newpatient:'New Patient' };
  return (
    <div style={{
      height:54, display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'0 16px', background:'var(--green-deep)', flexShrink:0,
      paddingTop:'env(safe-area-inset-top)',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:28, height:28, borderRadius:6, background:'var(--green-accent)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/>
          </svg>
        </div>
        <span style={{ color:'white', fontWeight:700, fontSize:16 }}>{titles[screen] || 'Orodha'}</span>
      </div>
      <button onClick={()=>setScreen('newbooking')} style={{
        background:'var(--green-accent)', color:'white', border:'none', borderRadius:7,
        padding:'6px 14px', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'var(--font)',
      }}>+ Book</button>
    </div>
  );
}

// ── Login Screen ──────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const isMobile = useIsMobile();

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true);
    setTimeout(() => {
      if (email === 'admin@paeds.go.ke' && password === 'password') {
        onLogin({ name:'Dr. K. Mwangi', role:'Admin', email });
      } else if (email === 'surgeon@paeds.go.ke' && password === 'password') {
        onLogin({ name:'Dr. A. Oduya', role:'Surgeon', email });
      } else if (email === 'anaes@paeds.go.ke' && password === 'password') {
        onLogin({ name:'Dr. J. Kamau', role:'Anaesthetist', email });
      } else {
        setError('Invalid credentials. Try admin@paeds.go.ke / password');
        setLoading(false);
      }
    }, 600);
  }

  const inStyle = {
    display:'block', width:'100%', marginTop:6, padding:'10px 13px',
    border:'1px solid var(--border)', borderRadius:9, fontSize:15,
    fontFamily:'var(--font)', color:'var(--text)', background:'white',
    outline:'none', transition:'border-color 0.15s', boxSizing:'border-box',
  };

  return (
    <div style={{ minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', background: isMobile ? 'var(--green-deep)' : 'var(--bg)', fontFamily:'var(--font)', padding:isMobile?0:'0 24px' }}>
      <div style={{ width:'100%', maxWidth: isMobile ? '100%' : 400 }}>
        {isMobile && (
          <div style={{ padding:'48px 32px 32px', textAlign:'center' }}>
            <div style={{ width:56, height:56, borderRadius:14, background:'var(--green-accent)', display:'inline-flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/>
              </svg>
            </div>
            <div style={{ color:'white', fontWeight:700, fontSize:26, letterSpacing:'-0.5px' }}>Orodha</div>
            <div style={{ color:'rgba(255,255,255,0.65)', fontSize:13, marginTop:4 }}>Paediatric Surgery · Theatre Management</div>
          </div>
        )}

        <div style={{ background:'white', borderRadius: isMobile ? '20px 20px 0 0' : 14, padding: isMobile ? '28px 24px 40px' : 32, boxShadow: isMobile ? 'none' : '0 2px 20px rgba(0,0,0,0.08)', minHeight: isMobile ? 'calc(100dvh - 200px)' : 'auto' }}>
          {!isMobile && (
            <div style={{ textAlign:'center', marginBottom:28 }}>
              <div style={{ width:50, height:50, borderRadius:13, background:'var(--green-deep)', display:'inline-flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/>
                </svg>
              </div>
              <h1 style={{ fontSize:24, fontWeight:700, color:'var(--text)', margin:'0 0 4px', letterSpacing:'-0.4px' }}>Orodha</h1>
              <p style={{ color:'var(--muted)', fontSize:13.5, margin:0 }}>Paediatric Surgery Theatre Management</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <h2 style={{ fontSize:17, fontWeight:700, color:'var(--text)', margin:'0 0 20px' }}>Sign in</h2>
            <label style={{ display:'block', fontSize:13.5, fontWeight:500, color:'var(--text)', marginBottom:14 }}>
              Email address
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@paeds.go.ke" style={inStyle}
                onFocus={e=>e.target.style.borderColor='var(--green-accent)'}
                onBlur={e=>e.target.style.borderColor='var(--border)'} />
            </label>
            <label style={{ display:'block', fontSize:13.5, fontWeight:500, color:'var(--text)', marginBottom:14 }}>
              Password
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" style={inStyle}
                onFocus={e=>e.target.style.borderColor='var(--green-accent)'}
                onBlur={e=>e.target.style.borderColor='var(--border)'} />
            </label>
            {error && <div style={{ marginBottom:12, padding:'10px 14px', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:8, color:'#b91c1c', fontSize:13 }}>{error}</div>}
            <button type="submit" disabled={loading} style={{ width:'100%', marginTop:8, padding:'12px 0', borderRadius:9, background:loading?'var(--green-mid)':'var(--green-deep)', color:'white', fontWeight:700, fontSize:15, border:'none', cursor:'pointer', fontFamily:'var(--font)' }}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
            <div style={{ marginTop:14, textAlign:'center' }}>
              <a href="#" style={{ color:'var(--green-accent)', fontSize:13, textDecoration:'none' }}>Forgot password?</a>
            </div>
          </form>

          <p style={{ textAlign:'center', marginTop:20, color:'var(--muted)', fontSize:12, lineHeight:1.5 }}>
            New accounts require Admin approval.<br/>Contact your unit lead.
          </p>
          <div style={{ marginTop:14, padding:'10px 14px', background:'var(--bg)', borderRadius:8, fontSize:12, color:'var(--muted)' }}>
            <strong style={{ color:'var(--text)' }}>Demo logins:</strong><br/>
            admin@paeds.go.ke · surgeon@paeds.go.ke · anaes@paeds.go.ke<br/>
            <span style={{ color:'var(--green-accent)' }}>password: password</span>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Sidebar, MobileNav, MobileTopBar, LoginScreen, SvgIcon, NAV_ITEMS });
