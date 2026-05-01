/* global React, Button, IconButton, Input, NumberField, Card, ListRow, AppBar, TabBar,
   SyncStatus, EmptyState, Toast, BottomSheet, Stepper, SetRow, Stat, Badge, Icon, ICONS,
   AreaChart, Sparkline, MonthGrid, YearHeatmap */
const { useState, useEffect, useRef, useMemo } = React;

// ═══════════════════════════════════════════════════════════════
// LOGIN SCREEN
// ═══════════════════════════════════════════════════════════════
function LoginScreen() {
  const [email, setEmail] = useState('alex@gym.co');
  const [pwd, setPwd] = useState('••••••••');
  const [loading, setLoading] = useState(false);

  return (
    <div style={{flex:1, display:'flex', flexDirection:'column', padding:'24px 20px 24px', position:'relative'}}>
      {/* Wordmark */}
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:64, marginTop: 24}}>
        <Wordmark/>
        <SyncStatus state="offline"/>
      </div>

      <div style={{flex:1, display:'flex', flexDirection:'column', gap:8}}>
        <h1 style={{
          fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em',
          margin: 0, lineHeight: 1.05,
        }}>
          Lift.<br/>
          <span style={{color:'var(--accent)'}}>Log.</span> Repeat.
        </h1>
        <p style={{
          color:'var(--text-muted)', fontSize:15, lineHeight:1.45,
          margin:'12px 0 32px', maxWidth: 280,
        }}>
          A workout tracker that works without signal. Sign in or keep going as a guest.
        </p>

        <div style={{display:'flex', flexDirection:'column', gap:16}}>
          <Input
            label="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@somewhere.co"
            inputMode="email"
          />
          <Input
            label="Password"
            value={pwd}
            type="password"
            onChange={e => setPwd(e.target.value)}
            placeholder="At least 8 characters"
          />
        </div>
      </div>

      <div style={{display:'flex', flexDirection:'column', gap:12, marginTop:24}}>
        <Button
          variant="primary"
          size="lg"
          block
          loading={loading}
          onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1200); }}
        >
          Sign in
        </Button>
        <Button variant="ghost" size="md" block>Continue as guest</Button>
      </div>
    </div>
  );
}

function Wordmark() {
  return (
    <span style={{
      fontFamily:'var(--font-sans)', fontSize:18, fontWeight:700,
      letterSpacing:'-0.02em', color:'var(--text-primary)',
      display:'inline-flex', alignItems:'center', gap:6,
    }}>
      <span style={{
        display:'inline-block', width:10, height:10,
        background:'var(--accent)', borderRadius:1,
        boxShadow:'0 0 0 2px var(--bg), 0 0 0 3px var(--accent)',
      }}/>
      PUMPED
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════
// ACTIVE WORKOUT SCREEN
// ═══════════════════════════════════════════════════════════════
function ActiveWorkoutScreen() {
  // Mid-session: 2 sets logged, 3rd in progress
  const [weight, setWeight] = useState('185');
  const [reps, setReps] = useState('8');
  const [rest, setRest] = useState(73); // seconds remaining

  useEffect(() => {
    const t = setInterval(() => setRest(r => r > 0 ? r - 1 : 0), 1000);
    return () => clearInterval(t);
  }, []);

  const restMin = Math.floor(rest / 60);
  const restSec = String(rest % 60).padStart(2, '0');

  return (
    <div style={{flex:1, display:'flex', flexDirection:'column', minHeight: 0}}>
      <AppBar
        eyebrow="28:14"
        title="Push Day"
        leading={<IconButton icon={ICONS.x.props.d} label="End workout"/>}
        trailing={<SyncStatus state="syncing"/>}
      />

      {/* Rest timer banner */}
      <div style={{
        background:'var(--surface-raised)',
        borderBottom:'1px solid var(--border)',
        padding:'10px 16px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
      }}>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <span style={{color:'var(--text-secondary)'}}><Icon d={ICONS.timer.props.d} size={18}/></span>
          <span className="eyebrow">Rest</span>
          <span style={{
            fontFamily:'var(--font-mono)', fontSize:18, fontWeight:600,
            color:'var(--text-primary)', fontVariantNumeric:'tabular-nums',
          }}>{restMin}:{restSec}</span>
        </div>
        <div style={{display:'flex', gap:4}}>
          <button className="btn btn-ghost btn-sm" style={{height:28}} onClick={() => setRest(r => r + 15)}>+15s</button>
          <button className="btn btn-ghost btn-sm" style={{height:28}} onClick={() => setRest(0)}>Skip</button>
        </div>
      </div>

      {/* Body */}
      <div className="scroll" style={{flex:1, overflowY:'auto', padding:'12px 16px 24px'}}>
        {/* Current exercise (expanded) */}
        <div className="card" style={{borderColor:'var(--border-strong)', marginBottom:12}}>
          <div style={{padding:'14px 16px 4px', display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
            <div>
              <div className="eyebrow" style={{marginBottom:4}}>Exercise 2 of 5</div>
              <h2 style={{
                fontSize:20, fontWeight:600, letterSpacing:'-0.01em', margin:0,
              }}>Bench Press</h2>
              <div style={{fontSize:13, color:'var(--text-muted)', marginTop:2, fontFamily:'var(--font-mono)'}}>
                3 × 8 · 185 lb target
              </div>
            </div>
            <IconButton icon={ICONS.more.props.d} label="More"/>
          </div>

          {/* Set entry — numeric inputs, native keyboard */}
          <div style={{padding:'8px 16px 16px'}}>
            <div className="eyebrow" style={{marginBottom:8, display:'flex', justifyContent:'space-between'}}>
              <span>Set 3</span>
              <span>Last: 8 × 185 lb</span>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
              <NumberField
                value={weight}
                onChange={setWeight}
                label="Weight" unit="lb"
                placeholder="185"
                inputMode="decimal"
              />
              <NumberField
                value={reps}
                onChange={setReps}
                label="Reps"
                placeholder="8"
                inputMode="numeric"
              />
            </div>
            <div style={{marginTop:12}}>
              <Button variant="primary" size="lg" block leadingIcon={ICONS.check.props.d}>Log set</Button>
            </div>
          </div>

          {/* Set history within exercise */}
          <div style={{padding:'8px 12px 12px', borderTop:'1px solid var(--border-soft)'}}>
            <div className="eyebrow" style={{padding:'4px 4px 8px', display:'flex', justifyContent:'space-between'}}>
              <span>Sets</span>
              <span>Last: 8 × 180 lb</span>
            </div>
            <SetRow index={1} weight={185} reps={8} state="done"/>
            <SetRow index={2} weight={185} reps={8} state="done"/>
            {/* Live preview of the value being entered above */}
            <div className="setrow" data-state="active" style={{borderRadius:'var(--radius-1)'}}>
              <span className="setrow-num" style={{color:'var(--accent)'}}>3</span>
              <div className="setrow-stat" style={{opacity: weight ? 1 : 0.45}}>
                <span className="setrow-val">{weight || '—'}</span>
                <span className="setrow-unit">lb</span>
              </div>
              <div className="setrow-stat" style={{opacity: reps ? 1 : 0.45}}>
                <span className="setrow-val">{reps || '—'}</span>
                <span className="setrow-unit">reps</span>
              </div>
              <span className="badge badge-accent" style={{justifySelf:'end'}}>NOW</span>
            </div>
          </div>
        </div>

        {/* Up next */}
        <div className="eyebrow" style={{padding:'12px 4px 8px'}}>Up next</div>
        <Card>
          <ListRow
            title="Incline Dumbbell Press"
            subtitle="3 × 10 · 60 lb"
            leading={<NumChip>3</NumChip>}
            chevron
          />
          <ListRow
            title="Cable Fly"
            subtitle="3 × 12 · 30 lb"
            leading={<NumChip>4</NumChip>}
            chevron
          />
          <ListRow
            title="Tricep Pushdown"
            subtitle="4 × 12 · 50 lb"
            leading={<NumChip>5</NumChip>}
            chevron
          />
        </Card>
      </div>

      <TabBar
        current="workout"
        items={[
          {id:'home', label:'Home', icon: ICONS.dumb.props.d},
          {id:'workout', label:'Workout', icon: ICONS.flame.props.d},
          {id:'history', label:'History', icon: ICONS.history.props.d},
          {id:'me', label:'Me', icon: ICONS.user.props.d},
        ]}
      />
    </div>
  );
}

function NumChip({ children }) {
  return (
    <span style={{
      width:28, height:28, borderRadius:2,
      border:'1px solid var(--border)',
      display:'grid', placeItems:'center',
      fontFamily:'var(--font-mono)', fontSize:13, fontWeight:600,
      color:'var(--text-muted)',
    }}>{children}</span>
  );
}

// ═══════════════════════════════════════════════════════════════
// HISTORY DETAIL SCREEN
// ═══════════════════════════════════════════════════════════════
function HistoryDetailScreen() {
  return (
    <div style={{flex:1, display:'flex', flexDirection:'column', minHeight:0}}>
      <AppBar
        title="Push Day"
        eyebrow="WED · APR 22"
        leading={<IconButton icon={ICONS.arrowL.props.d} label="Back"/>}
        trailing={<><IconButton icon={ICONS.edit.props.d} label="Edit"/><IconButton icon={ICONS.more.props.d} label="More"/></>}
      />

      <div className="scroll" style={{flex:1, overflowY:'auto', padding:'16px 16px 24px'}}>
        {/* Stats */}
        <div style={{
          display:'grid', gridTemplateColumns:'1fr 1fr 1fr',
          gap:1, background:'var(--border)',
          border:'1px solid var(--border)',
          borderRadius:'var(--radius-2)',
          marginBottom:20, overflow:'hidden',
        }}>
          {[
            {label:'Duration', value:'52:08'},
            {label:'Volume',   value:'14,420'},
            {label:'Sets',     value:'15'},
          ].map(s => (
            <div key={s.label} style={{background:'var(--surface-raised)', padding:'14px 12px'}}>
              <Stat label={s.label} value={s.value}/>
            </div>
          ))}
        </div>

        {/* PR callout */}
        <div style={{
          display:'flex', alignItems:'center', gap:10,
          padding:'10px 12px',
          border:'1px solid var(--accent)',
          background:'var(--accent-soft)',
          borderRadius:'var(--radius-1)',
          marginBottom:20,
        }}>
          <Icon d={ICONS.bolt.props.d} size={16}/>
          <span style={{
            fontFamily:'var(--font-mono)', fontSize:11,
            letterSpacing:'0.06em', textTransform:'uppercase',
            color:'var(--accent)', fontWeight:600,
          }}>Personal Record</span>
          <span style={{fontSize:13, color:'var(--text-primary)', flex:1}}>
            Bench Press · 195 lb × 6
          </span>
        </div>

        {/* Exercises */}
        <div style={{display:'flex', flexDirection:'column', gap:14}}>
          <ExerciseSummary
            name="Bench Press"
            order={1}
            sets={[
              {w:185, r:8}, {w:185, r:8}, {w:195, r:6, pr:true},
            ]}
          />
          <ExerciseSummary
            name="Incline Dumbbell Press"
            order={2}
            sets={[
              {w:60, r:10}, {w:60, r:10}, {w:60, r:9},
            ]}
          />
          <ExerciseSummary
            name="Cable Fly"
            order={3}
            sets={[
              {w:30, r:12}, {w:30, r:12}, {w:35, r:10},
            ]}
          />
          <ExerciseSummary
            name="Tricep Pushdown"
            order={4}
            sets={[
              {w:50, r:12}, {w:50, r:12}, {w:50, r:11}, {w:45, r:12},
            ]}
          />
        </div>

        <div style={{marginTop:20, padding:'12px 14px', border:'1px dashed var(--border-strong)', borderRadius:'var(--radius-1)'}}>
          <div className="eyebrow" style={{marginBottom:6}}>Notes</div>
          <p style={{margin:0, fontSize:14, color:'var(--text-secondary)', lineHeight:1.5}}>
            Felt strong on bench. Cable fly form check — last set was sloppy.
          </p>
        </div>
      </div>
    </div>
  );
}

function ExerciseSummary({ name, order, sets }) {
  return (
    <div className="card">
      <div style={{padding:'12px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid var(--border-soft)'}}>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <NumChip>{order}</NumChip>
          <div>
            <div style={{fontSize:15, fontWeight:600, color:'var(--text-primary)'}}>{name}</div>
            <div style={{fontSize:12, color:'var(--text-muted)', fontFamily:'var(--font-mono)', marginTop:2}}>
              {sets.length} sets · {sets.reduce((a, s) => a + s.w * s.r, 0).toLocaleString()} lb total
            </div>
          </div>
        </div>
      </div>
      <div style={{padding:'8px 12px 12px'}}>
        {sets.map((s, i) => (
          <div key={i} className="setrow" style={{padding:'8px 8px'}}>
            <span className="setrow-num">{i + 1}</span>
            <div className="setrow-stat">
              <span className="setrow-val">{s.w}</span>
              <span className="setrow-unit">lb</span>
            </div>
            <div className="setrow-stat">
              <span className="setrow-val">{s.r}</span>
              <span className="setrow-unit">reps</span>
            </div>
            {s.pr ? (
              <span className="badge badge-accent" style={{justifySelf:'end'}}>PR</span>
            ) : (
              <span style={{color:'var(--text-muted)', justifySelf:'end'}}>
                <Icon d={ICONS.check.props.d} size={16}/>
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// EXERCISE PICKER SCREEN
// ═══════════════════════════════════════════════════════════════
function PickerScreen() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(new Set(['Bench Press', 'Cable Fly']));

  const groups = [
    {head:'Recent', items:[
      {name:'Bench Press', meta:'Chest · Barbell', last:'2d'},
      {name:'Squat', meta:'Legs · Barbell', last:'3d'},
    ]},
    {head:'All exercises', items:[
      {name:'Cable Fly', meta:'Chest · Cable'},
      {name:'Chin-Up', meta:'Back · Bodyweight'},
      {name:'Deadlift', meta:'Back · Barbell'},
      {name:'Dumbbell Curl', meta:'Arms · Dumbbell'},
      {name:'Face Pull', meta:'Shoulders · Cable'},
      {name:'Hip Thrust', meta:'Glutes · Barbell'},
      {name:'Incline Dumbbell Press', meta:'Chest · Dumbbell'},
      {name:'Lat Pulldown', meta:'Back · Cable'},
    ]},
  ];

  const toggle = (name) => {
    setSelected(s => {
      const n = new Set(s);
      n.has(name) ? n.delete(name) : n.add(name);
      return n;
    });
  };

  const filter = (items) => query
    ? items.filter(i => i.name.toLowerCase().includes(query.toLowerCase()))
    : items;

  return (
    <div style={{flex:1, display:'flex', flexDirection:'column', minHeight:0}}>
      <AppBar
        title="Add Exercises"
        leading={<IconButton icon={ICONS.x.props.d} label="Cancel"/>}
        trailing={<span className="eyebrow tnum" style={{padding:'0 8px'}}>{selected.size} selected</span>}
      />

      {/* Search */}
      <div style={{padding:'12px 16px', borderBottom:'1px solid var(--border-soft)', display:'flex', gap:8}}>
        <div style={{flex:1, position:'relative'}}>
          <input
            className="input"
            style={{height:44, paddingLeft:40, fontSize:15}}
            placeholder="Search exercises"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <span style={{position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)'}}>
            <Icon d={ICONS.search.props.d} size={18}/>
          </span>
        </div>
        <IconButton icon={ICONS.filter.props.d} label="Filter" bordered/>
      </div>

      <div className="scroll" style={{flex:1, overflowY:'auto'}}>
        {groups.map(g => {
          const items = filter(g.items);
          if (items.length === 0) return null;
          return (
            <div key={g.head}>
              <div className="eyebrow" style={{padding:'14px 16px 6px'}}>{g.head}</div>
              <div className="list">
                {items.map(it => (
                  <button
                    key={it.name}
                    className="list-row"
                    onClick={() => toggle(it.name)}
                    type="button"
                  >
                    <div style={{
                      width:32, height:32, borderRadius:2,
                      border: selected.has(it.name) ? '1px solid var(--accent)' : '1px solid var(--border-strong)',
                      background: selected.has(it.name) ? 'var(--accent)' : 'transparent',
                      display:'grid', placeItems:'center',
                      color: selected.has(it.name) ? 'var(--accent-ink)' : 'var(--text-muted)',
                      flexShrink:0,
                    }}>
                      {selected.has(it.name) && <Icon d={ICONS.check.props.d} size={18} stroke={3}/>}
                    </div>
                    <div className="list-row-main">
                      <div className="list-row-title">{it.name}</div>
                      <div className="list-row-sub">{it.meta}</div>
                    </div>
                    {it.last && <span className="badge tnum">{it.last}</span>}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{padding:'12px 16px', borderTop:'1px solid var(--border)', background:'var(--surface)'}}>
        <Button variant="primary" size="lg" block disabled={selected.size === 0} trailingIcon={ICONS.arrow.props.d}>
          Add {selected.size > 0 ? `${selected.size} ` : ''}exercise{selected.size === 1 ? '' : 's'}
        </Button>
      </div>
    </div>
  );
}

Object.assign(window, {
  LoginScreen, ActiveWorkoutScreen, HistoryDetailScreen, PickerScreen, ProgressScreen,
});

// ═══════════════════════════════════════════════════════════════
// PROGRESS SCREEN — validates AreaChart, Sparkline, YearHeatmap
// ═══════════════════════════════════════════════════════════════
function ProgressScreen() {
  const [lift, setLift] = useState('Bench');
  const [range, setRange] = useState('3M');

  // 12 weeks of estimated 1RM, with PR week and a deload week
  const benchData = [
    { y: 195, label: 'W1' }, { y: 200, label: 'W2' }, { y: 197, label: 'W3' },
    { y: 205, label: 'W4' }, { y: 210, label: 'W5' }, { y: 208, label: 'W6' },
    { y: 215, label: 'W7' }, { y: 220, label: 'W8' }, { y: 195, label: 'W9' }, // deload
    { y: 222, label: 'W10' }, { y: 228, label: 'W11' }, { y: 235, label: 'W12' }, // PR
  ];
  const benchPrev = [
    { y: 180 }, { y: 178 }, { y: 185 }, { y: 188 }, { y: 190 }, { y: 192 },
    { y: 195 }, { y: 198 }, { y: 200 }, { y: 199 }, { y: 202 }, { y: 205 },
  ];
  const annotations = [
    { x: 8, y: 195, label: 'DELOAD', kind: 'deload' },
    { x: 11, y: 235, label: 'PR', kind: 'pr' },
  ];

  // Heatmap: 26 weeks, ~3-5 sessions/week pattern
  const heatmap = useMemo(() => {
    const map = new Map();
    const today = new Date();
    for (let i = 0; i < 26 * 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dow = d.getDay();
      // Skip Sundays mostly, vary intensity
      const seed = (i * 9301 + 49297) % 233280;
      const r = seed / 233280;
      let v = 0;
      if (dow !== 0 && r > 0.32) {
        v = r > 0.85 ? 4 : r > 0.7 ? 3 : r > 0.5 ? 2 : 1;
      }
      // make recent weeks denser
      if (i < 14 && dow !== 0 && r > 0.2) v = Math.max(v, 2);
      if (v > 0) map.set(d.toISOString().slice(0, 10), v);
    }
    return map;
  }, []);

  return (
    <div style={{flex:1, display:'flex', flexDirection:'column', minHeight:0}}>
      <AppBar
        title="Progress"
        eyebrow="LAST 12 WEEKS"
        trailing={<IconButton icon={ICONS.more.props.d} label="More"/>}
      />

      <div className="scroll" style={{flex:1, overflowY:'auto', padding:'8px 16px 24px'}}>
        {/* Sparkline trio — three lifts at a glance */}
        <div style={{
          display:'grid', gridTemplateColumns:'1fr 1fr 1fr',
          gap:1, background:'var(--border)',
          border:'1px solid var(--border)',
          borderRadius:'var(--radius-2)',
          marginBottom:20, overflow:'hidden',
        }}>
          {[
            { label:'Bench', value:'235', delta:'+15', data:[195,200,197,205,210,208,215,220,195,222,228,235] },
            { label:'Squat', value:'315', delta:'+10', data:[270,275,280,278,285,290,288,295,300,295,308,315] },
            { label:'Dead.', value:'385', delta:'+5',  data:[340,345,350,355,360,358,365,370,365,375,380,385] },
          ].map(s => (
            <button key={s.label}
              onClick={() => setLift(s.label === 'Dead.' ? 'Deadlift' : s.label)}
              style={{
                appearance:'none', border:'none', cursor:'pointer',
                background:(lift === s.label || (lift === 'Deadlift' && s.label === 'Dead.')) ? 'var(--surface-hover)' : 'var(--surface-raised)',
                padding:'12px', textAlign:'left',
                borderTop: (lift === s.label || (lift === 'Deadlift' && s.label === 'Dead.')) ? '2px solid var(--accent)' : '2px solid transparent',
              }}>
              <div className="eyebrow" style={{marginBottom:6}}>{s.label} · 1RM</div>
              <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', gap:6, marginBottom:4}}>
                <span style={{fontFamily:'var(--font-mono)', fontSize:20, fontWeight:600, color:'var(--text-primary)', fontVariantNumeric:'tabular-nums'}}>{s.value}</span>
                <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--accent)', fontWeight:600}}>{s.delta}</span>
              </div>
              <Sparkline data={s.data} width={104} height={22} ariaLabel={`${s.label} trend`}/>
            </button>
          ))}
        </div>

        {/* Range selector */}
        <div style={{display:'flex', gap:1, marginBottom:12, background:'var(--border)', border:'1px solid var(--border)', borderRadius:'var(--radius-1)', overflow:'hidden', width:'fit-content'}}>
          {['1M','3M','6M','1Y','ALL'].map(r => (
            <button key={r} onClick={() => setRange(r)} style={{
              appearance:'none', border:'none', cursor:'pointer',
              background: range === r ? 'var(--surface-hover)' : 'var(--surface-raised)',
              color: range === r ? 'var(--text-primary)' : 'var(--text-muted)',
              padding:'6px 12px',
              fontFamily:'var(--font-mono)', fontSize:11, fontWeight:600,
              letterSpacing:'0.06em',
            }}>{r}</button>
          ))}
        </div>

        {/* Main area chart */}
        <div style={{marginBottom:8}}>
          <AreaChart
            data={benchData}
            compare={benchPrev}
            annotations={annotations}
            height={200}
            yFormat={v => `${v}`}
            ariaLabel={`${lift} estimated 1RM, last 12 weeks`}
          />
        </div>
        <div style={{display:'flex', alignItems:'center', gap:14, marginBottom:24, fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-muted)', letterSpacing:'0.06em', textTransform:'uppercase'}}>
          <span style={{display:'flex', alignItems:'center', gap:6}}>
            <span style={{width:10, height:2, background:'var(--accent)', borderRadius:1}}/>
            This cycle
          </span>
          <span style={{display:'flex', alignItems:'center', gap:6}}>
            <span style={{width:10, height:2, background:'var(--text-muted)', borderRadius:1, backgroundImage:'repeating-linear-gradient(90deg, var(--text-muted) 0 2px, transparent 2px 5px)'}}/>
            Previous
          </span>
        </div>

        {/* Heatmap */}
        <div className="eyebrow" style={{marginBottom:8, display:'flex', justifyContent:'space-between'}}>
          <span>Activity</span>
          <span style={{color:'var(--text-secondary)'}}>52 sessions · 12-day streak</span>
        </div>
        <div style={{marginBottom:24}}>
          <YearHeatmap data={heatmap} weeks={26} cellSize={11} gap={3}/>
        </div>

        {/* Recent PRs */}
        <div className="eyebrow" style={{marginBottom:8}}>Recent PRs</div>
        <Card>
          <ListRow
            leading={<div style={{width:32, height:32, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'var(--radius-1)'}}><Icon d={ICONS.bolt.props.d} size={16} stroke={2.5}/></div>}
            title="Bench Press"
            subtitle="235 lb × 1 · est. 1RM"
            trailing={<span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-muted)', letterSpacing:'0.04em'}}>2D AGO</span>}
          />
          <ListRow
            leading={<div style={{width:32, height:32, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'var(--radius-1)'}}><Icon d={ICONS.bolt.props.d} size={16} stroke={2.5}/></div>}
            title="Squat"
            subtitle="315 lb × 3 · volume PR"
            trailing={<span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-muted)', letterSpacing:'0.04em'}}>5D AGO</span>}
          />
          <ListRow
            leading={<div style={{width:32, height:32, background:'var(--surface-hover)', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'var(--radius-1)', border:'1px solid var(--border)'}}><Icon d={ICONS.bolt.props.d} size={16} stroke={2}/></div>}
            title="Deadlift"
            subtitle="385 lb × 1"
            trailing={<span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-muted)', letterSpacing:'0.04em'}}>2W AGO</span>}
          />
        </Card>
      </div>

      <TabBar
        items={[
          {key:'workout', label:'Workout', icon:ICONS.dumb.props.d},
          {key:'history', label:'History', icon:ICONS.history.props.d},
          {key:'progress', label:'Progress', icon:ICONS.bolt.props.d},
          {key:'profile', label:'Profile', icon:ICONS.user.props.d},
        ]}
        current="progress"
      />
    </div>
  );
}
