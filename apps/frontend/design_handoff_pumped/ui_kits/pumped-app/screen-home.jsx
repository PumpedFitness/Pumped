// screen-home.jsx — refined Clay home. Props: { T, onStart }
function HomeScreen({ T, onStart }) {
  const { C, sp } = T;
  const [pressed, setPressed] = React.useState(false);
  const pct = 86;

  const ring = (
    <div style={{
      width: 84, height: 84, borderRadius: 999, flexShrink: 0,
      background: `conic-gradient(${C.cream} 0deg ${pct * 3.6}deg, rgba(243,238,226,0.2) ${pct * 3.6}deg 360deg)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 999, background: C.moss,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0,
      }}>
        <span style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 22, fontWeight: 700, color: C.cream, lineHeight: 1 }}>{pct}</span>
        <span style={{ fontSize: 8.5, letterSpacing: '0.1em', color: C.creamDim, textTransform: 'uppercase', marginTop: 2 }}>ready</span>
      </div>
    </div>
  );

  const muscles = [['Chest', 'fresh', C.sageDot], ['Triceps', 'fresh', C.sageDot], ['Shoulders', 'fresh', C.sageDot], ['Legs', 'resting', C.accent], ['Back', 'fresh', C.sageDot]];

  return (
    <div style={{
      minHeight: '100%', background: C.bg, color: C.ink,
      padding: `64px ${sp(20)}px 124px`, boxSizing: 'border-box',
      fontFamily: '"Hanken Grotesk", system-ui, sans-serif',
    }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: sp(22) }}>
        <div>
          <div style={{ fontSize: 14, color: C.muted, fontWeight: 500 }}>Thursday morning</div>
          <div style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 1 }}>
            Let's move, Alex
          </div>
        </div>
        <div style={{
          width: 48, height: 48, borderRadius: 999, background: C.moss, color: C.cream,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16,
        }}>AK</div>
      </div>

      {/* hero — readiness + today */}
      <div style={{
        background: C.moss, color: C.cream, borderRadius: 34, padding: `${sp(22)}px ${sp(22)}px ${sp(20)}px`,
        boxShadow: '0 20px 44px -22px rgba(70,88,60,0.7)', marginBottom: sp(18),
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {ring}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.creamDim, fontWeight: 700 }}>Recovery</div>
            <div style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 20, fontWeight: 600, lineHeight: 1.15, marginTop: 4 }}>
              You're primed<br />for Push Day
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: sp(20), padding: `${sp(14)}px 4px 0`, borderTop: '1px solid rgba(243,238,226,0.16)' }}>
          <div style={{ display: 'flex', gap: 18 }}>
            <div>
              <div style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 19, fontWeight: 700 }}>6</div>
              <div style={{ fontSize: 12, color: C.creamDim }}>movements</div>
            </div>
            <div>
              <div style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 19, fontWeight: 700 }}>48<span style={{ fontSize: 12 }}>m</span></div>
              <div style={{ fontSize: 12, color: C.creamDim }}>est. time</div>
            </div>
          </div>
          <button onClick={onStart} onMouseDown={() => setPressed(true)} onMouseUp={() => setPressed(false)} onMouseLeave={() => setPressed(false)}
            style={{
              height: 52, padding: '0 24px', borderRadius: 999, border: 'none', cursor: 'pointer',
              background: C.accent, color: C.accentInk, display: 'flex', alignItems: 'center', gap: 9,
              fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 16, fontWeight: 600,
              transform: pressed ? 'scale(0.96)' : 'scale(1)', transition: 'transform 0.12s ease',
              boxShadow: `0 10px 22px -10px ${C.accent}`,
            }}>
            Start <IconPlay size={15} />
          </button>
        </div>
      </div>

      {/* muscle freshness */}
      <div style={{ marginBottom: sp(18) }}>
        <div style={{ fontSize: 13.5, color: C.muted, fontWeight: 600, marginBottom: 10, paddingLeft: 2 }}>Muscle freshness</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {muscles.map(([name, state, col], i) => (
            <div key={i} title={state} style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '9px 14px', borderRadius: 999,
              background: C.card, border: '1px solid ' + C.line, fontSize: 13.5, fontWeight: 500,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: col }} />
              {name}
            </div>
          ))}
        </div>
      </div>

      {/* week + volume */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 12, marginBottom: sp(14) }}>
        <div style={{ background: C.card, borderRadius: 24, padding: `${sp(16)}px ${sp(18)}px`, border: '1px solid ' + C.line }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.sageDot, marginBottom: 12 }}>
            <IconFlame size={17} /><span style={{ fontSize: 12.5, color: C.muted, fontWeight: 600 }}>12-day streak</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[1, 1, 0, 1, 0, 0, 0].map((d, i) => (
              <div key={i} style={{ flex: 1, height: 30, borderRadius: 9, background: d ? C.sageDot : 'rgba(52,54,44,0.07)' }} />
            ))}
          </div>
        </div>
        <div style={{ background: C.moss, color: C.cream, borderRadius: 24, padding: `${sp(16)}px ${sp(18)}px` }}>
          <div style={{ fontSize: 12.5, color: C.creamDim, fontWeight: 600 }}>This week</div>
          <div style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 28, fontWeight: 700, marginTop: 6 }}>24.8k<span style={{ fontSize: 13, fontWeight: 500 }}> kg</span></div>
        </div>
      </div>

      {/* last session recap */}
      <div style={{ background: C.card, borderRadius: 24, padding: `${sp(14)}px ${sp(16)}px`, border: '1px solid ' + C.line, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: 14, background: C.accentSoft, color: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <IconDumbbell size={22} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>Last session · Tuesday</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginTop: 1 }}>Pull Day — 52 min</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: C.good, fontWeight: 600 }}>
          <IconAward size={16} /> 2 PRs
        </div>
      </div>
    </div>
  );
}

window.HomeScreen = HomeScreen;
