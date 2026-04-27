
// ── Main App — lifted state, mobile layout ────────────────────────────────────

function App() {
  const [user, setUser]                   = React.useState(null);
  const [screen, setScreen]               = React.useState('calendar');
  const [bookings, setBookings]           = React.useState([...BOOKINGS]);
  const [blockedDates, setBlockedDates]   = React.useState([...BLOCKED_DATES]);
  const [selectedDate, setSelectedDate]   = React.useState(TODAY);
  const [bookingDate, setBookingDate]     = React.useState('');
  const isMobile                          = useIsMobile();

  if (!user) return <LoginScreen onLogin={u => setUser(u)} />;

  const commonProps = { bookings, setBookings, blockedDates, setBlockedDates, user };

  function renderScreen() {
    switch (screen) {
      case 'calendar':    return <CalendarScreen {...commonProps} setScreen={setScreen} setSelectedDate={setSelectedDate} setBookingDate={setBookingDate} />;
      case 'patients':    return <PatientRegistryScreen bookings={bookings} setScreen={setScreen} />;
      case 'newpatient':  return <NewPatientScreen setScreen={setScreen} />;
      case 'newbooking':  return <NewBookingScreen bookings={bookings} bookingDate={bookingDate} setScreen={setScreen} />;
      case 'specialty':   return <SpecialtyListScreen bookings={bookings} />;
      case 'theatre':     return <TheatreListScreen bookings={bookings} selectedDate={selectedDate} />;
      case 'audit':       return <AuditLogScreen />;
      default:            return <CalendarScreen {...commonProps} setScreen={setScreen} setSelectedDate={setSelectedDate} setBookingDate={setBookingDate} />;
    }
  }

  if (isMobile) {
    return (
      <div style={{ display:'flex', flexDirection:'column', height:'100dvh', fontFamily:'var(--font)', background:'var(--bg)' }}>
        <MobileTopBar screen={screen} user={user} setScreen={setScreen} />
        <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column', minHeight:0 }}>
          {renderScreen()}
        </div>
        <MobileNav screen={screen} setScreen={setScreen} user={user} />
      </div>
    );
  }

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', fontFamily:'var(--font)', background:'var(--bg)' }}>
      <Sidebar screen={screen} setScreen={setScreen} user={user} />
      <main style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden' }}>
        {/* Top bar */}
        <div style={{ height:52, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px', borderBottom:'1px solid var(--border)', background:'white', flexShrink:0 }}>
          <div style={{ fontSize:13, color:'var(--muted)' }}>
            {new Date(TODAY).toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ position:'relative' }}>
              <svg style={{ position:'absolute',left:10,top:9,color:'var(--muted)' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input placeholder="Search patients, UMR…"
                style={{ paddingLeft:30, paddingRight:10, paddingTop:7, paddingBottom:7, border:'1px solid var(--border)', borderRadius:7, fontSize:13, fontFamily:'var(--font)', outline:'none', width:200, color:'var(--text)', background:'var(--bg)' }}
                onFocus={e=>{e.target.style.borderColor='var(--green-accent)'; e.target.style.background='white';}}
                onBlur={e=>{e.target.style.borderColor='var(--border)'; e.target.style.background='var(--bg)';}} />
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--green-deep)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:11 }}>
                {user.name.split(' ').map(w=>w[0]).slice(0,2).join('')}
              </div>
              <div>
                <div style={{ fontSize:12.5, fontWeight:600, color:'var(--text)', lineHeight:1.2 }}>{user.name}</div>
                <div style={{ fontSize:11, color:'var(--muted)' }}>{user.role}</div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ flex:1, display:'flex', minHeight:0, overflow:'hidden' }}>
          {renderScreen()}
        </div>
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
