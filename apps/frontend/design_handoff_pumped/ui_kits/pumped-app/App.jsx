// App.jsx — Pumped app shell: tab nav + start→session flow, device scaling.
// (The standalone interactive prototype with live theme tweaks lives at the
// project root as Pumped.html; this kit is the clean, token-driven recreation.)

function useFit(w, h, pad = 48) {
  const [s, setS] = React.useState(1);
  React.useEffect(() => {
    const calc = () => setS(Math.min(1, (window.innerWidth - pad) / w, (window.innerHeight - pad) / h));
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, [w, h, pad]);
  return s;
}

function TabBar({ T, tab, setTab }) {
  const { C } = T;
  const tabs = [['home', IconHome, 'Home'], ['plan', IconCalendar, 'Plan'], ['progress', IconPulse, 'Progress'], ['you', IconSettings, 'You']];
  return (
    <div style={{
      position: 'absolute', left: 16, right: 16, bottom: 22, height: 64, zIndex: 30,
      background: C.moss, borderRadius: 999, boxShadow: 'var(--shadow-nav)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 8px',
    }}>
      {tabs.map(([id, Ic, label]) => {
        const active = tab === id;
        return (
          <button key={id} onClick={() => setTab(id)} style={{
            height: 46, border: 'none', cursor: 'pointer', borderRadius: 999,
            padding: active ? '0 16px' : '0 12px', display: 'flex', alignItems: 'center', gap: 8,
            background: active ? 'rgba(243,238,226,0.16)' : 'transparent',
            color: active ? C.cream : 'rgba(243,238,226,0.55)', transition: 'all 0.2s ease',
          }}>
            <Ic size={22} stroke={active ? 2.1 : 1.8} />
            {active && <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600 }}>{label}</span>}
          </button>
        );
      })}
    </div>
  );
}

function Toast({ msg }) {
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 70, zIndex: 80, display: 'flex', justifyContent: 'center', pointerEvents: 'none', animation: 'pumpToast 0.4s ease' }}>
      <div style={{
        background: 'var(--clay-moss)', color: 'var(--clay-cream)', padding: '12px 18px', borderRadius: 999,
        display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, fontWeight: 600,
        boxShadow: 'var(--shadow-raised)', fontFamily: 'var(--font-display)',
      }}>
        <span style={{ width: 22, height: 22, borderRadius: 999, background: 'var(--accent)', color: 'var(--accent-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconCheck size={13} stroke={2.6} /></span>
        {msg}
      </div>
    </div>
  );
}

function PumpedApp() {
  const T = React.useMemo(() => buildKitTheme('regular'), []);
  const scale = useFit(402, 874);
  const [tab, setTab] = React.useState('home');
  const [inSession, setInSession] = React.useState(false);
  const [toast, setToast] = React.useState(null);

  const finish = () => {
    setInSession(false); setTab('home');
    setToast('Workout complete — nice work!');
    setTimeout(() => setToast(null), 2600);
  };

  let screen;
  if (tab === 'home') screen = <HomeScreen T={T} onStart={() => setInSession(true)} />;
  else if (tab === 'plan') screen = <PlanScreen T={T} />;
  else if (tab === 'progress') screen = <ProgressScreen T={T} />;
  else screen = <ProfileScreen T={T} />;

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(120% 120% at 50% 0%, #E7DECB 0%, #D8CFBC 100%)' }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
        <IOSDevice>
          {inSession
            ? <SessionScreen T={T} onClose={() => setInSession(false)} onFinish={finish} />
            : screen}
          {!inSession && <TabBar T={T} tab={tab} setTab={setTab} />}
          {toast && <Toast msg={toast} />}
        </IOSDevice>
      </div>
    </div>
  );
}

window.PumpedApp = PumpedApp;
