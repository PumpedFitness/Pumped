// screen-session.jsx — active workout flow. Props: { T, onClose, onFinish }
const SESSION_EXERCISES = [
  { name: 'Barbell Bench Press', muscle: 'Chest', prev: '60 kg × 8', step: 2.5, rest: 120, sets: [{ w: 60, r: 8 }, { w: 60, r: 8 }, { w: 62.5, r: 8 }, { w: 62.5, r: 8 }] },
  { name: 'Incline DB Press', muscle: 'Chest', prev: '20 kg × 10', step: 2.5, rest: 90, sets: [{ w: 22.5, r: 10 }, { w: 22.5, r: 10 }, { w: 22.5, r: 10 }] },
  { name: 'Overhead Press', muscle: 'Shoulders', prev: '40 kg × 6', step: 2.5, rest: 120, sets: [{ w: 40, r: 6 }, { w: 40, r: 6 }, { w: 42.5, r: 6 }, { w: 42.5, r: 6 }] },
  { name: 'Cable Fly', muscle: 'Chest', prev: '15 kg × 12', step: 1, rest: 75, sets: [{ w: 16, r: 12 }, { w: 16, r: 12 }, { w: 16, r: 12 }] },
  { name: 'Lateral Raise', muscle: 'Shoulders', prev: '10 kg × 15', step: 1, rest: 60, sets: [{ w: 10, r: 15 }, { w: 10, r: 15 }, { w: 10, r: 15 }] },
  { name: 'Triceps Pushdown', muscle: 'Triceps', prev: '25 kg × 12', step: 2.5, rest: 75, sets: [{ w: 27.5, r: 12 }, { w: 27.5, r: 12 }, { w: 27.5, r: 12 }] },
];

const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

function SessionScreen({ T, onClose, onFinish }) {
  const { C } = T;
  const [data, setData] = React.useState(() =>
    SESSION_EXERCISES.map(e => ({ ...e, sets: e.sets.map(s => ({ ...s, done: false })) })));
  const [idx, setIdx] = React.useState(0);
  const [elapsed, setElapsed] = React.useState(0);
  const [rest, setRest] = React.useState(null); // { remaining, total }

  // session timer
  React.useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);
  // rest timer
  React.useEffect(() => {
    if (!rest) return;
    if (rest.remaining <= 0) { setRest(null); return; }
    const t = setTimeout(() => setRest(r => r && { ...r, remaining: r.remaining - 1 }), 1000);
    return () => clearTimeout(t);
  }, [rest]);

  const ex = data[idx];
  const activeSet = ex.sets.findIndex(s => !s.done);
  const exDone = activeSet === -1;
  const totalSets = data.reduce((n, e) => n + e.sets.length, 0);
  const doneSets = data.reduce((n, e) => n + e.sets.filter(s => s.done).length, 0);
  const isLastEx = idx === data.length - 1;

  const upd = (si, field, dv) => setData(d => d.map((e, ei) => ei !== idx ? e :
    { ...e, sets: e.sets.map((s, k) => k !== si ? s : { ...s, [field]: Math.max(0, Math.round((s[field] + dv) * 10) / 10) }) }));

  const logSet = (si) => {
    setData(d => d.map((e, ei) => ei !== idx ? e : { ...e, sets: e.sets.map((s, k) => k !== si ? s : { ...s, done: true }) }));
    setRest({ remaining: ex.rest, total: ex.rest });
  };

  const stepBtn = (onClick, icon) => (
    <button onClick={onClick} style={{
      width: 40, height: 40, borderRadius: 13, border: '1px solid ' + C.line, background: C.bg,
      color: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
    }}>{icon}</button>
  );

  return (
    <div style={{ minHeight: '100%', background: C.bg, color: C.ink, fontFamily: '"Hanken Grotesk", system-ui, sans-serif', paddingBottom: rest ? 150 : 110 }}>
      {/* top bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10, background: 'rgba(234,227,213,0.9)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        padding: '58px 16px 12px', borderBottom: '1px solid ' + C.line,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={onClose} style={{ width: 40, height: 40, borderRadius: 999, border: '1px solid ' + C.line, background: C.card, color: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <IconX size={20} />
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 17, fontWeight: 700 }}>Push Day</div>
            <div style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>Exercise {idx + 1} of {data.length}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, height: 40, padding: '0 14px', borderRadius: 999, background: C.moss, color: C.cream, fontWeight: 600, fontSize: 14, fontVariantNumeric: 'tabular-nums' }}>
            <IconClock size={15} /> {fmt(elapsed)}
          </div>
        </div>
        {/* overall progress */}
        <div style={{ marginTop: 12, height: 6, borderRadius: 999, background: 'rgba(52,54,44,0.08)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(doneSets / totalSets) * 100}%`, background: C.accent, borderRadius: 999, transition: 'width 0.4s ease' }} />
        </div>
      </div>

      {/* exercise header */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.accent, fontWeight: 700 }}>{ex.muscle}</div>
            <div style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 27, fontWeight: 700, letterSpacing: '-0.01em', marginTop: 3 }}>{ex.name}</div>
            <div style={{ fontSize: 13.5, color: C.muted, marginTop: 5, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
              <IconRest size={14} /> Last time · {ex.prev}
            </div>
          </div>
          <button style={{ width: 40, height: 40, borderRadius: 13, border: '1px solid ' + C.line, background: C.card, color: C.ink2, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <IconSwap size={19} />
          </button>
        </div>
      </div>

      {/* sets */}
      <div style={{ padding: '18px 20px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {ex.sets.map((s, si) => {
          const isActive = si === activeSet;
          if (s.done) {
            return (
              <div key={si} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 18, background: C.card, border: '1px solid ' + C.line }}>
                <div style={{ width: 26, height: 26, borderRadius: 999, background: C.moss, color: C.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <IconCheck size={15} stroke={2.6} />
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: C.ink2 }}>Set {si + 1}</span>
                <span style={{ marginLeft: 'auto', fontSize: 14, color: C.muted, fontVariantNumeric: 'tabular-nums' }}>{s.w} kg × {s.r}</span>
              </div>
            );
          }
          if (isActive) {
            return (
              <div key={si} style={{ borderRadius: 22, background: C.moss, color: C.cream, padding: '16px 16px 18px', boxShadow: '0 16px 34px -20px rgba(70,88,60,0.8)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <span style={{ width: 26, height: 26, borderRadius: 999, background: 'rgba(243,238,226,0.18)', color: C.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>{si + 1}</span>
                  <span style={{ fontSize: 14.5, fontWeight: 600, whiteSpace: 'nowrap' }}>Current set</span>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  {[['Weight', 'w', ex.step, 'kg'], ['Reps', 'r', 1, '']].map(([lab, f, dv, unit]) => (
                    <div key={f} style={{ flex: 1, background: C.mossDeep, borderRadius: 16, padding: '10px 10px 12px' }}>
                      <div style={{ fontSize: 11, color: C.creamDim, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 8 }}>{lab}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {stepBtn(() => upd(si, f, -dv), <IconMinus size={18} />)}
                        <span style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 22, fontWeight: 700, color: C.cream, fontVariantNumeric: 'tabular-nums' }}>{s[f]}<span style={{ fontSize: 12, color: C.creamDim, fontWeight: 500 }}>{unit ? ' ' + unit : ''}</span></span>
                        {stepBtn(() => upd(si, f, dv), <IconPlus size={18} />)}
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => logSet(si)} style={{
                  marginTop: 14, width: '100%', height: 52, borderRadius: 15, border: 'none', cursor: 'pointer',
                  background: C.accent, color: C.accentInk, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                  fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 16, fontWeight: 600,
                }}>
                  <IconCheck size={18} stroke={2.4} /> <span style={{ whiteSpace: 'nowrap' }}>Log set {si + 1}</span>
                </button>
              </div>
            );
          }
          return (
            <div key={si} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 18, background: 'transparent', border: '1px dashed ' + C.line, opacity: 0.7 }}>
              <div style={{ width: 26, height: 26, borderRadius: 999, border: '1.5px solid ' + C.line, color: C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{si + 1}</div>
              <span style={{ fontSize: 14, fontWeight: 600, color: C.muted }}>Set {si + 1}</span>
              <span style={{ marginLeft: 'auto', fontSize: 14, color: C.muted, fontVariantNumeric: 'tabular-nums' }}>{s.w} kg × {s.r}</span>
            </div>
          );
        })}
      </div>

      {/* advance */}
      {exDone && (
        <div style={{ padding: '18px 20px 0' }}>
          <button onClick={() => isLastEx ? onFinish() : setIdx(i => i + 1)} style={{
            width: '100%', height: 56, borderRadius: 18, border: 'none', cursor: 'pointer',
            background: C.moss, color: C.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 16.5, fontWeight: 600,
          }}>
            {isLastEx ? <>Finish workout <IconCheck size={18} stroke={2.4} /></> : <>Next exercise <IconChevron size={18} /></>}
          </button>
        </div>
      )}

      {/* rest timer banner */}
      {rest && (
        <div style={{
          position: 'absolute', left: 14, right: 14, bottom: 24, zIndex: 20,
          background: C.moss, color: C.cream, borderRadius: 24, padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: 14,
          boxShadow: '0 20px 40px -16px rgba(70,88,60,0.7)',
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 999, flexShrink: 0,
            background: `conic-gradient(${C.accent} 0deg ${(rest.remaining / rest.total) * 360}deg, rgba(243,238,226,0.18) 0deg)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 999, background: C.moss, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{fmt(rest.remaining)}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: C.creamDim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Rest</div>
            <div style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 16, fontWeight: 600 }}>Next set in {fmt(rest.remaining)}</div>
          </div>
          <button onClick={() => setRest(r => ({ ...r, remaining: r.remaining + 15 }))} style={{ height: 38, padding: '0 12px', borderRadius: 999, border: '1px solid rgba(243,238,226,0.25)', background: 'transparent', color: C.cream, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+15s</button>
          <button onClick={() => setRest(null)} style={{ height: 38, padding: '0 14px', borderRadius: 999, border: 'none', background: C.accent, color: C.accentInk, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconSkip size={14} /> Skip
          </button>
        </div>
      )}
    </div>
  );
}

window.SessionScreen = SessionScreen;
