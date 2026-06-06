// screen-misc.jsx — PlanScreen, ProgressScreen, ProfileScreen. Props: { T }

function ScreenShell({ T, title, sub, children }) {
  const { C, sp } = T;
  return (
    <div style={{ minHeight: '100%', background: C.bg, color: C.ink, padding: `64px ${sp(20)}px 124px`, boxSizing: 'border-box', fontFamily: '"Hanken Grotesk", system-ui, sans-serif' }}>
      <div style={{ marginBottom: sp(20) }}>
        <div style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em' }}>{title}</div>
        {sub && <div style={{ fontSize: 14, color: C.muted, marginTop: 2 }}>{sub}</div>}
      </div>
      {children}
    </div>
  );
}

function PlanScreen({ T }) {
  const { C, sp } = T;
  const days = [
    { d: 'Mon', name: 'Push Day', meta: 'Completed · 6 lifts', status: 'done' },
    { d: 'Tue', name: 'Pull Day', meta: 'Completed · 7 lifts', status: 'done' },
    { d: 'Wed', name: 'Rest', meta: 'Active recovery', status: 'rest' },
    { d: 'Thu', name: 'Push Day', meta: '6 lifts · 48 min', status: 'today' },
    { d: 'Fri', name: 'Leg Day', meta: '5 lifts · 50 min', status: 'up' },
    { d: 'Sat', name: 'Pull Day', meta: '7 lifts · 52 min', status: 'up' },
    { d: 'Sun', name: 'Rest', meta: 'Active recovery', status: 'rest' },
  ];
  return (
    <ScreenShell T={T} title="Your week" sub="Push · Pull · Legs split">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {days.map((day, i) => {
          const today = day.status === 'today';
          const rest = day.status === 'rest';
          const done = day.status === 'done';
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '15px 16px', borderRadius: 22,
              background: today ? C.moss : C.card, color: today ? C.cream : C.ink,
              border: '1px solid ' + (today ? 'transparent' : C.line),
              opacity: rest ? 0.72 : 1,
              boxShadow: today ? '0 16px 32px -20px rgba(70,88,60,0.8)' : 'none',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                background: today ? 'rgba(243,238,226,0.16)' : (rest ? 'transparent' : C.accentSoft),
                color: today ? C.cream : (rest ? C.muted : C.accent),
                border: rest ? '1px dashed ' + C.line : 'none',
              }}>
                <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.8 }}>{day.d}</span>
                {rest ? <IconRest size={16} /> : <IconDumbbell size={18} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 600, fontFamily: '"Bricolage Grotesque", sans-serif' }}>{day.name}</div>
                <div style={{ fontSize: 12.5, color: today ? C.creamDim : C.muted, marginTop: 1 }}>{day.meta}</div>
              </div>
              {done && <div style={{ width: 24, height: 24, borderRadius: 999, background: C.good, color: C.cream, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconCheck size={14} stroke={2.6} /></div>}
              {today && <span style={{ fontSize: 11, fontWeight: 700, padding: '5px 10px', borderRadius: 999, background: C.accent, color: C.accentInk }}>TODAY</span>}
            </div>
          );
        })}
      </div>
    </ScreenShell>
  );
}

function ProgressScreen({ T }) {
  const { C, sp } = T;
  const weeks = [62, 70, 55, 78, 66, 84, 72, 90];
  const max = Math.max(...weeks);
  const prs = [['Barbell Bench Press', '65 kg × 5', '2 days ago'], ['Back Squat', '110 kg × 3', '1 week ago'], ['Deadlift', '140 kg × 2', '2 weeks ago']];
  const tile = (label, val, unit) => (
    <div style={{ background: C.card, borderRadius: 20, padding: '14px 16px', border: '1px solid ' + C.line }}>
      <div style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 24, fontWeight: 700, marginTop: 4 }}>{val}<span style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}> {unit}</span></div>
    </div>
  );
  return (
    <ScreenShell T={T} title="Progress" sub="Last 8 weeks">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: sp(16) }}>
        {tile('Sessions', '14', '')}{tile('Volume', '96.2k', 'kg')}{tile('Streak', '12', 'd')}
      </div>

      <div style={{ background: C.card, borderRadius: 24, padding: '18px 18px 16px', border: '1px solid ' + C.line, marginBottom: sp(16) }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontSize: 14.5, fontWeight: 600 }}>Weekly volume</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12.5, color: C.good, fontWeight: 600 }}><IconTrend size={15} /> +18%</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 7, height: 96 }}>
          {weeks.map((w, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
              <div style={{ width: '100%', height: Math.round((w / max) * 80), borderRadius: 7, background: i === weeks.length - 1 ? C.accent : C.accentSoft }} />
              <span style={{ fontSize: 10, color: C.muted }}>{i === weeks.length - 1 ? 'Now' : `${8 - i}w`}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 13.5, color: C.muted, fontWeight: 600, marginBottom: 10, paddingLeft: 2, display: 'flex', alignItems: 'center', gap: 6 }}><IconAward size={16} /> Recent personal records</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {prs.map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderRadius: 18, background: C.card, border: '1px solid ' + C.line }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: C.accentSoft, color: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><IconAward size={19} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600 }}>{p[0]}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{p[2]}</div>
            </div>
            <div style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 15, fontWeight: 700, color: C.accent }}>{p[1]}</div>
          </div>
        ))}
      </div>
    </ScreenShell>
  );
}

function ProfileScreen({ T }) {
  const { C, sp } = T;
  const [remind, setRemind] = React.useState(true);
  const Row = ({ icon, label, detail, toggle, on, onTog, last }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '14px 16px', borderTop: last ? '1px solid ' + C.line : 'none' }}>
      <div style={{ width: 32, height: 32, borderRadius: 10, background: C.accentSoft, color: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
      <span style={{ flex: 1, fontSize: 15, fontWeight: 500 }}>{label}</span>
      {detail && <span style={{ fontSize: 14, color: C.muted }}>{detail}</span>}
      {toggle && (
        <button onClick={onTog} style={{ width: 46, height: 28, borderRadius: 999, border: 'none', cursor: 'pointer', background: on ? C.accent : 'rgba(52,54,44,0.16)', position: 'relative', transition: 'background 0.2s' }}>
          <span style={{ position: 'absolute', top: 3, left: on ? 21 : 3, width: 22, height: 22, borderRadius: 999, background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
        </button>
      )}
      {!toggle && !detail && <IconChevron size={17} style={{ color: C.muted }} />}
    </div>
  );
  return (
    <ScreenShell T={T} title="You">
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: sp(20) }}>
        <div style={{ width: 64, height: 64, borderRadius: 999, background: C.moss, color: C.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22, fontFamily: '"Bricolage Grotesque", sans-serif' }}>AK</div>
        <div>
          <div style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 21, fontWeight: 700 }}>Alex Kim</div>
          <div style={{ fontSize: 13.5, color: C.muted }}>148 sessions · since 2024</div>
        </div>
      </div>

      <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, paddingLeft: 4 }}>Training</div>
      <div style={{ background: C.card, borderRadius: 22, border: '1px solid ' + C.line, overflow: 'hidden', marginBottom: sp(16) }}>
        <Row icon={<IconDumbbell size={18} />} label="Units" detail="Kilograms" />
        <Row icon={<IconRest size={18} />} label="Default rest" detail="90 sec" last />
        <Row icon={<IconTarget size={18} />} label="Weekly goal" detail="4 sessions" last />
      </div>

      <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, paddingLeft: 4 }}>App</div>
      <div style={{ background: C.card, borderRadius: 22, border: '1px solid ' + C.line, overflow: 'hidden' }}>
        <Row icon={<IconBolt size={18} />} label="Workout reminders" toggle on={remind} onTog={() => setRemind(v => !v)} />
        <Row icon={<IconPulse size={18} />} label="Apple Health" detail="Connected" last />
        <Row icon={<IconSettings size={18} />} label="Appearance" last />
      </div>
    </ScreenShell>
  );
}

Object.assign(window, { PlanScreen, ProgressScreen, ProfileScreen });
