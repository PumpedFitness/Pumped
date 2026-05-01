/* global React, ReactDOM,
   Button, IconButton, Input, NumberField, Card, ListRow, AppBar, TabBar,
   SyncStatus, EmptyState, Toast, BottomSheet, Stepper, SetRow, Stat, Badge,
   Icon, ICONS, PhoneFrame,
   Tabs, Switch, Slider, Alert, Skeleton, SkeletonGroup, Tag, TagGroup, Popover, PopoverItem,
   AreaChart, Sparkline, MonthGrid, YearHeatmap,
   LoginScreen, ActiveWorkoutScreen, HistoryDetailScreen, PickerScreen, ProgressScreen,
   TweaksPanel, useTweaks, TweakSection, TweakRadio, TweakToggle */
const { useState, useMemo } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "clay",
  "theme": "dark",
  "view": "screens"
}/*EDITMODE-END*/;

// ═══════════════════════════════════════════════════════════════
// Section frame for the design system canvas
// ═══════════════════════════════════════════════════════════════
function Section({ id, eyebrow, title, sub, children, full }) {
  return (
    <section id={id} style={{
      padding: '64px 48px', borderBottom: '1px solid var(--border-soft)',
      maxWidth: full ? 'none' : 1280, margin: '0 auto', width: '100%',
    }}>
      <div style={{display:'flex', alignItems:'baseline', gap:16, marginBottom:32, flexWrap:'wrap'}}>
        <span className="eyebrow" style={{color:'var(--accent)'}}>{eyebrow}</span>
        <h2 style={{fontSize:32, fontWeight:700, letterSpacing:'-0.02em', margin:0}}>{title}</h2>
        {sub && <p style={{color:'var(--text-muted)', fontSize:15, margin:0, maxWidth:520}}>{sub}</p>}
      </div>
      {children}
    </section>
  );
}

function SwatchRow({ swatches }) {
  return (
    <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:12}}>
      {swatches.map(s => (
        <div key={s.name} style={{
          border:'1px solid var(--border)', borderRadius:'var(--radius-2)',
          overflow:'hidden', background:'var(--surface-raised)',
        }}>
          <div style={{height:64, background: s.bg, borderBottom:'1px solid var(--border-soft)'}}/>
          <div style={{padding:'10px 12px'}}>
            <div style={{fontSize:13, fontWeight:600}}>{s.name}</div>
            <div style={{fontSize:11, color:'var(--text-muted)', fontFamily:'var(--font-mono)', marginTop:2}}>{s.token}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TypeRow({ size, name, sample = 'Bench Press · 185 × 8', mono, weight = 600 }) {
  return (
    <div style={{
      display:'grid', gridTemplateColumns:'140px 1fr 100px', alignItems:'baseline',
      gap:24, padding:'18px 0', borderBottom:'1px solid var(--border-soft)',
    }}>
      <div>
        <div style={{fontSize:13, fontWeight:600}}>{name}</div>
        <div className="eyebrow tnum" style={{marginTop:4}}>{size}px</div>
      </div>
      <div style={{
        fontSize: size, fontWeight: weight, lineHeight: 1.05,
        letterSpacing: size >= 32 ? '-0.02em' : '-0.01em',
        fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
        fontVariantNumeric: 'tabular-nums',
      }}>{sample}</div>
      <div className="eyebrow" style={{textAlign:'right'}}>{mono ? 'Mono' : 'Sans'}</div>
    </div>
  );
}

function CompCell({ label, children, w = 'auto', bg }) {
  return (
    <div style={{
      border:'1px solid var(--border)', borderRadius:'var(--radius-2)',
      overflow:'hidden', background:'var(--surface-raised)',
      display:'flex', flexDirection:'column',
    }}>
      <div style={{
        padding: 24, display:'flex', alignItems:'center', justifyContent:'center',
        background: bg || 'var(--bg)', minHeight: 100,
        flex: 1,
      }}>
        <div style={{width: w}}>{children}</div>
      </div>
      <div style={{
        padding:'10px 14px', borderTop:'1px solid var(--border-soft)',
        fontSize:12, color:'var(--text-muted)',
        fontFamily:'var(--font-mono)', letterSpacing:'0.02em',
      }}>{label}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [stepWeight, setStepWeight] = useState(135);
  const [stepReps, setStepReps] = useState(8);
  const [bigWeight, setBigWeight] = useState('185');
  const [bigReps, setBigReps] = useState('8');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [tabRange, setTabRange] = useState('3M');
  const [swA, setSwA] = useState(true);
  const [swB, setSwB] = useState(false);
  const [sliderVal, setSliderVal] = useState(75);
  const [tagSel, setTagSel] = useState('Push');

  // Apply theme + accent to root
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', t.theme);
    document.documentElement.setAttribute('data-accent', t.accent);
  }, [t.theme, t.accent]);

  return (
    <div style={{background:'var(--bg)', color:'var(--text-primary)', minHeight:'100vh'}}>
      {/* ── Hero ───────────────────────────────────────────── */}
      <header style={{
        padding:'72px 48px 56px', maxWidth:1280, margin:'0 auto',
        display:'flex', alignItems:'flex-end', justifyContent:'space-between',
        gap:48, flexWrap:'wrap',
      }}>
        <div>
          <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:24}}>
            <span style={{
              display:'inline-block', width:14, height:14,
              background:'var(--accent)', borderRadius:2,
            }}/>
            <span className="eyebrow">Pumped · Design System v0.1</span>
            <SyncStatus state="synced"/>
          </div>
          <h1 style={{
            fontSize:64, fontWeight:700, letterSpacing:'-0.03em',
            margin:0, lineHeight:0.98, maxWidth: 720,
          }}>
            A tracker that
            <br/>
            <span style={{color:'var(--accent)'}}>reads at a glance.</span>
          </h1>
          <p style={{
            color:'var(--text-secondary)', fontSize:17, lineHeight:1.5,
            marginTop:20, maxWidth:560,
          }}>
            Mobile-first, dark by default. Sharp edges, hairline borders, tabular numerals.
            Built for one-handed use under bad gym lighting.
          </p>
        </div>
        <nav style={{display:'flex', flexDirection:'column', gap:6, fontFamily:'var(--font-mono)', fontSize:12}}>
          {[
            ['01', 'Tokens', '#tokens'],
            ['02', 'Components', '#components'],
            ['03', 'Data viz', '#dataviz'],
            ['04', 'Screens', '#screens'],
            ['05', 'Rationale', '#rationale'],
          ].map(([n, l, h]) => (
            <a key={n} href={h} style={{
              color:'var(--text-secondary)', textDecoration:'none',
              display:'flex', gap:14, alignItems:'baseline',
              padding:'4px 0',
            }}>
              <span style={{color:'var(--text-muted)'}}>{n}</span>
              <span>{l}</span>
            </a>
          ))}
        </nav>
      </header>

      <div className="divider"/>

      {/* ── TOKENS ─────────────────────────────────────────── */}
      <Section id="tokens" eyebrow="01 / Tokens" title="Foundation" sub="Semantic CSS custom properties. The accent and theme below propagate live via Tweaks.">
        {/* Surfaces */}
        <h3 style={{fontSize:14, fontWeight:600, margin:'0 0 12px', color:'var(--text-secondary)'}} className="eyebrow">Surfaces</h3>
        <SwatchRow swatches={[
          {name:'bg', token:'--bg', bg:'var(--bg)'},
          {name:'surface', token:'--surface', bg:'var(--surface)'},
          {name:'surface-raised', token:'--surface-raised', bg:'var(--surface-raised)'},
          {name:'surface-input', token:'--surface-input', bg:'var(--surface-input)'},
          {name:'surface-hover', token:'--surface-hover', bg:'var(--surface-hover)'},
          {name:'surface-press', token:'--surface-press', bg:'var(--surface-press)'},
        ]}/>

        <h3 style={{fontSize:14, fontWeight:600, margin:'32px 0 12px', color:'var(--text-secondary)'}} className="eyebrow">Borders & Text</h3>
        <SwatchRow swatches={[
          {name:'border-soft', token:'--border-soft', bg:'var(--border-soft)'},
          {name:'border', token:'--border', bg:'var(--border)'},
          {name:'border-strong', token:'--border-strong', bg:'var(--border-strong)'},
          {name:'text-primary', token:'--text-primary', bg:'var(--text-primary)'},
          {name:'text-secondary', token:'--text-secondary', bg:'var(--text-secondary)'},
          {name:'text-muted', token:'--text-muted', bg:'var(--text-muted)'},
        ]}/>

        <h3 style={{fontSize:14, fontWeight:600, margin:'32px 0 12px', color:'var(--text-secondary)'}} className="eyebrow">Accent & Status</h3>
        <SwatchRow swatches={[
          {name:'accent', token:'--accent', bg:'var(--accent)'},
          {name:'accent-soft', token:'--accent-soft', bg:'var(--accent-soft)'},
          {name:'success', token:'--success', bg:'var(--success)'},
          {name:'warning', token:'--warning', bg:'var(--warning)'},
          {name:'danger', token:'--danger', bg:'var(--danger)'},
          {name:'offline', token:'--offline', bg:'var(--offline)'},
        ]}/>

        <h3 style={{fontSize:14, fontWeight:600, margin:'48px 0 0', color:'var(--text-secondary)'}} className="eyebrow">Type scale · Geist Sans / Geist Mono</h3>
        <div>
          <TypeRow size={56} name="Display" sample="185" mono weight={600}/>
          <TypeRow size={32} name="H1" sample="Push Day"/>
          <TypeRow size={24} name="H2" sample="Bench Press"/>
          <TypeRow size={20} name="H3" sample="Set 3 of 3"/>
          <TypeRow size={16} name="Body" sample="Tap to edit weight or reps."/>
          <TypeRow size={14} name="Label" sample="WEIGHT (LB)"/>
          <TypeRow size={12} name="Caption" sample="Last logged 2 days ago"/>
          <TypeRow size={11} name="Micro" sample="SYNCED · 14:02" mono/>
        </div>

        <h3 style={{fontSize:14, fontWeight:600, margin:'48px 0 16px', color:'var(--text-secondary)'}} className="eyebrow">Spacing & Radius</h3>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24}}>
          <div>
            <div className="eyebrow" style={{marginBottom:12}}>Spacing scale (4-base)</div>
            <div style={{display:'flex', alignItems:'flex-end', gap:8}}>
              {[4, 8, 12, 16, 20, 24, 32, 40, 48, 64].map(n => (
                <div key={n} style={{display:'flex', flexDirection:'column', alignItems:'center', gap:6}}>
                  <div style={{width:20, height:n, background:'var(--accent)'}}/>
                  <span className="eyebrow tnum" style={{fontSize:10}}>{n}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="eyebrow" style={{marginBottom:12}}>Radius scale (sharp)</div>
            <div style={{display:'flex', gap:12, alignItems:'center'}}>
              {[
                {n:0, label:'0'}, {n:2, label:'1'}, {n:4, label:'2'}, {n:6, label:'3'},
              ].map(r => (
                <div key={r.n} style={{display:'flex', flexDirection:'column', alignItems:'center', gap:6}}>
                  <div style={{width:64, height:64, background:'var(--surface-raised)', border:'1px solid var(--border-strong)', borderRadius: r.n}}/>
                  <span className="eyebrow tnum" style={{fontSize:10}}>r{r.label} · {r.n}px</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── COMPONENTS ─────────────────────────────────────── */}
      <Section id="components" eyebrow="02 / Components" title="Components" sub="Each shown in its principal states. The numeric stepper gets the most space — it's the workhorse.">
        {/* Stepper hero */}
        <div style={{
          border:'1px solid var(--border)', borderRadius:'var(--radius-2)',
          padding:'40px 32px', marginBottom:32, background:'var(--surface-raised)',
        }}>
          <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:8}}>
            <div>
              <div className="eyebrow" style={{color:'var(--accent)', marginBottom:6}}>Hero · Stepper</div>
              <h3 style={{fontSize:20, margin:0, fontWeight:600}}>Numeric stepper</h3>
            </div>
            <span style={{fontSize:13, color:'var(--text-muted)', maxWidth:380}}>
              72px tall, 56px tap targets, mono numerals at 38px. Tap to step. Press-and-hold to ramp (try it).
            </span>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, maxWidth:560}}>
            <Stepper value={stepWeight} onChange={setStepWeight} step={5} unit="lb" label="Weight"/>
            <Stepper value={stepReps} onChange={setStepReps} step={1} unit="reps" label="Reps" max={50}/>
          </div>
          <div style={{marginTop:20, display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, maxWidth:560}}>
            <Stepper value={45} onChange={()=>{}} step={5} unit="lb" label="Disabled" disabled/>
            <Stepper value={12} onChange={()=>{}} step={1} unit="reps" label="Compact" size="sm"/>
          </div>
        </div>

        {/* Buttons */}
        <h3 className="eyebrow" style={{margin:'8px 0 12px'}}>Buttons</h3>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:12, marginBottom:32}}>
          <CompCell label="primary · default"><Button variant="primary">Start workout</Button></CompCell>
          <CompCell label="primary · loading"><Button variant="primary" loading>Loading</Button></CompCell>
          <CompCell label="secondary"><Button variant="secondary">Add exercise</Button></CompCell>
          <CompCell label="ghost"><Button variant="ghost">Cancel</Button></CompCell>
          <CompCell label="destructive"><Button variant="destructive">End workout</Button></CompCell>
          <CompCell label="primary · disabled"><Button variant="primary" disabled>Disabled</Button></CompCell>
          <CompCell label="size · lg"><Button variant="primary" size="lg">Log set</Button></CompCell>
          <CompCell label="size · sm"><Button variant="secondary" size="sm">Skip</Button></CompCell>
        </div>

        {/* Inputs */}
        <h3 className="eyebrow" style={{margin:'8px 0 12px'}}>Inputs</h3>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:12, marginBottom:32}}>
          <CompCell label="default" w="100%"><Input label="Email" placeholder="you@somewhere.co"/></CompCell>
          <CompCell label="filled" w="100%"><Input label="Password" type="password" value="••••••••"/></CompCell>
          <CompCell label="error" w="100%"><Input label="Email" value="bad" error="Doesn't look like an email."/></CompCell>
          <CompCell label="hint" w="100%"><Input label="Display name" placeholder="Alex" hint="Shown on shared workouts."/></CompCell>
          <CompCell label="numeric · weight" w="100%"><NumberField value={bigWeight} onChange={setBigWeight} label="Weight" unit="lb"/></CompCell>
          <CompCell label="numeric · reps" w="100%"><NumberField value={bigReps} onChange={setBigReps} label="Reps"/></CompCell>
        </div>

        {/* List rows */}
        <h3 className="eyebrow" style={{margin:'8px 0 12px'}}>List rows</h3>
        <div style={{maxWidth:480, marginBottom:32}}>
          <Card>
            <ListRow title="Bench Press" subtitle="3 × 8 · 185 lb" leading={<NumChip n="1"/>} chevron/>
            <ListRow title="Incline Press" subtitle="Last: 60 lb × 10" leading={<NumChip n="2"/>} chevron/>
            <ListRow title="Cable Fly" subtitle="3 × 12" leading={<NumChip n="3"/>} trailing={<Badge>NEW</Badge>}/>
          </Card>
        </div>

        {/* Cards */}
        <h3 className="eyebrow" style={{margin:'8px 0 12px'}}>Cards</h3>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:12, marginBottom:32}}>
          <CompCell label="card · stat trio" w="100%">
            <div className="card" style={{padding:14, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14}}>
              <Stat label="Volume" value="14,420"/>
              <Stat label="Sets" value="15"/>
              <Stat label="Time" value="52:08"/>
            </div>
          </CompCell>
          <CompCell label="card · empty" w="100%">
            <div className="card"><EmptyState title="Nothing logged." sub="Start a workout to see it here." action={<Button variant="primary" size="sm">New workout</Button>}/></div>
          </CompCell>
        </div>

        {/* Bars + tabs */}
        <h3 className="eyebrow" style={{margin:'8px 0 12px'}}>App bar & tab nav</h3>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:32}}>
          <CompCell label="appbar · default" w="100%" bg="var(--surface)">
            <div style={{border:'1px solid var(--border)', borderRadius:'var(--radius-2)', overflow:'hidden'}}>
              <AppBar title="Push Day" eyebrow="WED · APR 22"
                leading={<IconButton icon={ICONS.arrowL.props.d} label="Back"/>}
                trailing={<IconButton icon={ICONS.more.props.d} label="More"/>}/>
            </div>
          </CompCell>
          <CompCell label="tabbar · workout active" w="100%" bg="var(--surface)">
            <div style={{border:'1px solid var(--border)', borderRadius:'var(--radius-2)', overflow:'hidden'}}>
              <TabBar current="workout" items={[
                {id:'home', label:'Home', icon: ICONS.dumb.props.d},
                {id:'workout', label:'Workout', icon: ICONS.flame.props.d},
                {id:'history', label:'History', icon: ICONS.history.props.d},
                {id:'me', label:'Me', icon: ICONS.user.props.d},
              ]}/>
            </div>
          </CompCell>
        </div>

        {/* Toasts + sync */}
        <h3 className="eyebrow" style={{margin:'8px 0 12px'}}>Sync status & toasts</h3>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:12, marginBottom:32}}>
          <CompCell label="sync · synced"><SyncStatus state="synced"/></CompCell>
          <CompCell label="sync · syncing"><SyncStatus state="syncing"/></CompCell>
          <CompCell label="sync · offline"><SyncStatus state="offline"/></CompCell>
          <CompCell label="toast · default" w="100%"><Toast>Set logged. 90s rest started.</Toast></CompCell>
          <CompCell label="toast · success" w="100%"><Toast variant="success">Synced 3 workouts.</Toast></CompCell>
          <CompCell label="toast · danger" w="100%"><Toast variant="danger">Couldn't reach server.</Toast></CompCell>
        </div>

        {/* Sheet */}
        <h3 className="eyebrow" style={{margin:'8px 0 12px'}}>Bottom sheet</h3>
        <Button variant="secondary" onClick={() => setSheetOpen(true)}>Open sheet preview</Button>

        {/* Patterns */}
        <h3 className="eyebrow" style={{margin:'32px 0 12px'}}>Tabs / Switch / Slider</h3>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:12, marginBottom:24}}>
          <CompCell label="tabs · segmented" w="100%">
            <Tabs items={['1M','3M','6M','1Y','All']} current={tabRange} onChange={setTabRange} full/>
          </CompCell>
          <CompCell label="switch · on" w="100%">
            <Switch checked={swA} onChange={setSwA} label="Rest timer auto-start"/>
          </CompCell>
          <CompCell label="switch · off" w="100%">
            <Switch checked={swB} onChange={setSwB} label="Plate-math hint"/>
          </CompCell>
          <CompCell label="slider · weight bias" w="100%">
            <Slider value={sliderVal} onChange={setSliderVal} min={0} max={100} step={5} showValue format={v => v + '%'}/>
          </CompCell>
        </div>

        <h3 className="eyebrow" style={{margin:'8px 0 12px'}}>Alerts</h3>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:12, marginBottom:24}}>
          <Alert variant="success" title="PR logged">Bench 235 × 1 — your previous best was 220.</Alert>
          <Alert variant="warning" title="Deload week">Volume dropped 40% by design. Recover, don't grind.</Alert>
          <Alert variant="danger" title="Sync failed">3 sets stuck in queue. Check connection.</Alert>
        </div>

        <h3 className="eyebrow" style={{margin:'8px 0 12px'}}>Tags · filter chips</h3>
        <div style={{marginBottom:24}}>
          <TagGroup>
            {['All','Push','Pull','Legs','Core','Cardio'].map(t =>
              <Tag key={t} selected={tagSel === t} onClick={() => setTagSel(t)}>{t}</Tag>
            )}
          </TagGroup>
        </div>

        <h3 className="eyebrow" style={{margin:'8px 0 12px'}}>Skeletons</h3>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:12, marginBottom:24}}>
          <CompCell label="card skeleton" w="100%">
            <SkeletonGroup>
              <Skeleton w="60%" h={14}/>
              <Skeleton w="100%" h={11}/>
              <Skeleton w="80%" h={11}/>
            </SkeletonGroup>
          </CompCell>
          <CompCell label="list-row skeleton" w="100%">
            <div style={{display:'flex', alignItems:'center', gap:12}}>
              <Skeleton w={40} h={40} circle/>
              <div style={{flex:1}}>
                <Skeleton w="70%" h={14} style={{marginBottom:6}}/>
                <Skeleton w="40%" h={11}/>
              </div>
            </div>
          </CompCell>
        </div>

        <h3 className="eyebrow" style={{margin:'8px 0 12px'}}>Popover · overflow menu</h3>
        <div style={{display:'flex', gap:24, flexWrap:'wrap', alignItems:'flex-start', marginBottom:8}}>
          <Popover>
            <PopoverItem onClick={() => {}}>Edit workout</PopoverItem>
            <PopoverItem onClick={() => {}}>Reorder exercises</PopoverItem>
            <PopoverItem onClick={() => {}}>Save as template</PopoverItem>
            <div style={{height:1, background:'var(--divider)', margin:'4px 0'}}/>
            <PopoverItem onClick={() => {}}>Discard…</PopoverItem>
          </Popover>
        </div>
      </Section>

      {/* ── DATA VIZ ───────────────────────────────────────── */}
      <Section id="dataviz" eyebrow="03 / Data viz" title="Charts & calendar" sub="Numbers are the product. The system has two surfaces for them: trend (area chart, sparkline) and density (month grid, year heatmap). Single accent only — no categorical palette.">

        {/* Area chart hero */}
        <div style={{
          border:'1px solid var(--border)', borderRadius:'var(--radius-2)',
          padding:'40px 32px', marginBottom:32, background:'var(--surface-raised)',
        }}>
          <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:8}}>
            <div>
              <div className="eyebrow" style={{color:'var(--accent)', marginBottom:6}}>Hero · Area chart</div>
              <h3 style={{fontSize:20, margin:0, fontWeight:600}}>Bench 1RM, last 12 weeks</h3>
            </div>
            <span style={{fontSize:13, color:'var(--text-muted)', maxWidth:420}}>
              Smooth line, soft accent gradient, no grid. Compare series renders as dashed neutral. PR + deload annotated inline. Hover or tap to scrub — axis values appear only when needed.
            </span>
          </div>
          <AreaChart
            data={[
              { y: 195, label: 'W1' }, { y: 200, label: 'W2' }, { y: 197, label: 'W3' },
              { y: 205, label: 'W4' }, { y: 210, label: 'W5' }, { y: 208, label: 'W6' },
              { y: 215, label: 'W7' }, { y: 220, label: 'W8' }, { y: 195, label: 'W9' },
              { y: 222, label: 'W10' }, { y: 228, label: 'W11' }, { y: 235, label: 'W12' },
            ]}
            compare={[
              { y: 180 }, { y: 178 }, { y: 185 }, { y: 188 }, { y: 190 }, { y: 192 },
              { y: 195 }, { y: 198 }, { y: 200 }, { y: 199 }, { y: 202 }, { y: 205 },
            ]}
            annotations={[
              { x: 8, y: 195, label: 'DELOAD', kind: 'deload' },
              { x: 11, y: 235, label: 'PR', kind: 'pr' },
            ]}
            height={280}
            yFormat={v => `${v}`}
            ariaLabel="Bench press 1RM trend"
          />
          <div style={{display:'flex', alignItems:'center', gap:14, marginTop:14, fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-muted)', letterSpacing:'0.06em', textTransform:'uppercase'}}>
            <span style={{display:'flex', alignItems:'center', gap:6}}>
              <span style={{width:14, height:2, background:'var(--accent)', borderRadius:1}}/>
              This cycle
            </span>
            <span style={{display:'flex', alignItems:'center', gap:6}}>
              <svg width="14" height="2"><line x1="0" y1="1" x2="14" y2="1" stroke="var(--text-muted)" strokeWidth="2" strokeDasharray="3 3"/></svg>
              Previous
            </span>
            <span style={{display:'flex', alignItems:'center', gap:6, marginLeft:'auto'}}>
              <span style={{width:8, height:8, background:'var(--accent)', borderRadius:1}}/>
              PR
            </span>
            <span style={{display:'flex', alignItems:'center', gap:6}}>
              <span style={{width:8, height:8, border:'2px solid var(--text-muted)', background:'var(--bg)'}}/>
              Deload
            </span>
          </div>
        </div>

        {/* Area chart states */}
        <h3 className="eyebrow" style={{margin:'8px 0 12px'}}>Area chart · states</h3>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(360px, 1fr))', gap:16, marginBottom:32}}>
          <div>
            <div className="eyebrow" style={{marginBottom:8}}>Single series</div>
            <AreaChart
              data={[
                { y: 168 }, { y: 167 }, { y: 169 }, { y: 168 }, { y: 166 },
                { y: 167 }, { y: 165 }, { y: 164 }, { y: 165 }, { y: 163 },
                { y: 162 }, { y: 161 },
              ]}
              height={160}
              yFormat={v => `${v}lb`}
              xFormat={i => `wk${i+1}`}
              ariaLabel="Bodyweight"
            />
          </div>
          <div>
            <div className="eyebrow" style={{marginBottom:8}}>Loading</div>
            <AreaChart loading height={160}/>
          </div>
          <div>
            <div className="eyebrow" style={{marginBottom:8}}>Empty</div>
            <AreaChart data={[]} height={160}/>
          </div>
          <div>
            <div className="eyebrow" style={{marginBottom:8}}>Volume per week</div>
            <AreaChart
              data={[
                { y: 12000, label: 'W1' }, { y: 13200 }, { y: 12800 }, { y: 14100 },
                { y: 14800 }, { y: 13900 }, { y: 15200 }, { y: 15800, label: 'W8' },
              ]}
              height={160}
              yFormat={v => `${(v/1000).toFixed(0)}k`}
            />
          </div>
        </div>

        {/* Sparkline */}
        <h3 className="eyebrow" style={{margin:'8px 0 12px'}}>Sparkline · inline trend</h3>
        <div style={{
          border:'1px solid var(--border)', borderRadius:'var(--radius-2)',
          background:'var(--surface-raised)', padding:0, marginBottom:32, overflow:'hidden',
        }}>
          {[
            { lift:'Bench Press', value:'235', delta:'+15', data:[195,200,197,205,210,208,215,220,195,222,228,235] },
            { lift:'Squat',       value:'315', delta:'+10', data:[270,275,280,278,285,290,288,295,300,295,308,315] },
            { lift:'Deadlift',    value:'385', delta:'+5',  data:[340,345,350,355,360,358,365,370,365,375,380,385] },
            { lift:'OHP',         value:'135', delta:'\u2212\u20095', data:[125,130,128,132,135,138,135,140,138,135,133,130], down:true },
          ].map((row, i, arr) => (
            <div key={row.lift} style={{
              display:'grid', gridTemplateColumns:'1fr 120px 60px 56px',
              alignItems:'center', gap:16, padding:'14px 20px',
              borderBottom: i < arr.length - 1 ? '1px solid var(--border-soft)' : 'none',
            }}>
              <span style={{fontSize:15, color:'var(--text-primary)', fontWeight:500}}>{row.lift}</span>
              <Sparkline data={row.data} width={120} height={28}/>
              <span style={{fontFamily:'var(--font-mono)', fontSize:16, fontWeight:600, color:'var(--text-primary)', textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{row.value}</span>
              <span style={{fontFamily:'var(--font-mono)', fontSize:12, fontWeight:600, color: row.down ? 'var(--danger)' : 'var(--accent)', textAlign:'right'}}>{row.delta}</span>
            </div>
          ))}
        </div>

        {/* Calendar */}
        <h3 className="eyebrow" style={{margin:'8px 0 12px'}}>Month grid</h3>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:16, marginBottom:32, maxWidth:900}}>
          <div>
            <div className="eyebrow" style={{marginBottom:8}}>Workouts as filled cells</div>
            <MonthGrid
              year={2025} month={3}
              workouts={new Set([1,2,4,7,9,11,14,15,17,21,22,24,28,29])}
              today={22}
            />
          </div>
          <div>
            <div className="eyebrow" style={{marginBottom:8}}>Volume intensity (heatmap variant)</div>
            <MonthGrid
              year={2025} month={3}
              intensity={new Map([
                [1,2],[2,3],[4,1],[7,4],[9,2],[11,3],[14,2],[15,4],
                [17,3],[21,2],[22,4],[24,3],[28,2],[29,1],
              ])}
              today={22}
            />
          </div>
        </div>

        {/* Year heatmap */}
        <h3 className="eyebrow" style={{margin:'8px 0 12px'}}>Year heatmap</h3>
        <div style={{maxWidth:900, marginBottom:8}}>
          <YearHeatmap
            data={(() => {
              const m = new Map();
              const today = new Date();
              for (let i = 0; i < 26 * 7; i++) {
                const d = new Date(today);
                d.setDate(today.getDate() - i);
                const dow = d.getDay();
                const seed = (i * 9301 + 49297) % 233280;
                const r = seed / 233280;
                let v = 0;
                if (dow !== 0 && r > 0.32) v = r > 0.85 ? 4 : r > 0.7 ? 3 : r > 0.5 ? 2 : 1;
                if (i < 14 && dow !== 0 && r > 0.2) v = Math.max(v, 2);
                if (v > 0) m.set(d.toISOString().slice(0, 10), v);
              }
              return m;
            })()}
            weeks={26}
          />
        </div>
      </Section>

      {/* ── SCREENS ────────────────────────────────────────── */}
      <Section id="screens" eyebrow="04 / Screens" title="Validating screens" sub="The system applied to five real screens. Dark is the default; light shown for parity." full>
        <div style={{
          display:'flex', gap:32, overflowX:'auto', padding:'8px 8px 32px',
          scrollSnapType:'x mandatory',
        }} className="scroll">
          <div style={{scrollSnapAlign:'start'}}><PhoneFrame label="01 · Login" theme={t.theme}><LoginScreen/></PhoneFrame></div>
          <div style={{scrollSnapAlign:'start'}}><PhoneFrame label="02 · Active workout (mid-session)" theme={t.theme}><ActiveWorkoutScreen/></PhoneFrame></div>
          <div style={{scrollSnapAlign:'start'}}><PhoneFrame label="03 · History detail" theme={t.theme}><HistoryDetailScreen/></PhoneFrame></div>
          <div style={{scrollSnapAlign:'start'}}><PhoneFrame label="04 · Exercise picker" theme={t.theme}><PickerScreen/></PhoneFrame></div>
          <div style={{scrollSnapAlign:'start'}}><PhoneFrame label="05 · Progress" theme={t.theme}><ProgressScreen/></PhoneFrame></div>
        </div>

        <div style={{marginTop:48}}>
          <div className="eyebrow" style={{marginBottom:16, color:'var(--text-secondary)'}}>Light mode parity (active workout)</div>
          <div style={{display:'flex', gap:32, flexWrap:'wrap'}}>
            <PhoneFrame label="dark" theme="dark"><ActiveWorkoutScreen/></PhoneFrame>
            <PhoneFrame label="light" theme="light"><ActiveWorkoutScreen/></PhoneFrame>
          </div>
        </div>
      </Section>

      {/* ── RATIONALE ──────────────────────────────────────── */}
      <Section id="rationale" eyebrow="05 / Rationale" title="Why this looks the way it does">
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:32, maxWidth:1100, fontSize:15, lineHeight:1.6, color:'var(--text-secondary)'}}>
          <div>
            <h3 style={{fontSize:16, fontWeight:600, color:'var(--text-primary)', margin:'0 0 8px'}}>Mint accent (with cyan + lime alternates)</h3>
            <p style={{margin:0}}>
              Mint reads cool and clinical — instrument panel, not gym pump. It sits comfortably on near-black, hits AA on dark surfaces at the chosen value, and avoids the saturated red/orange cliché. Cyan pushes more medical; lime pushes more industrial. All three pass contrast; switch live in Tweaks. Accent is reserved for state (active set, sync dot, focus, primary CTA) so it stays meaningful.
            </p>
          </div>
          <div>
            <h3 style={{fontSize:16, fontWeight:600, color:'var(--text-primary)', margin:'0 0 8px'}}>Geist Sans + Geist Mono</h3>
            <p style={{margin:0}}>
              Numbers are the hero of this app, so the type system is built around them. Geist Mono carries the load — tabular by default, distinct 0/O, large-counter digits readable at arm's length. Geist Sans handles UI copy. Scale is anchored at a 56px display (the stepper value) and floors at 11px micro for mono labels; 16px is the body floor. No third typeface; no decorative cuts.
            </p>
          </div>
          <div>
            <h3 style={{fontSize:16, fontWeight:600, color:'var(--text-primary)', margin:'0 0 8px'}}>Numeric input, not stepper</h3>
            <p style={{margin:0}}>
              Logging a set is "type 185, type 8, hit log." Tapping +/− 37 times to get from 0 to 185 is the wrong primitive when the keyboard is right there. The active screen uses a numeric variant of the standard Input — same chassis, mono numerals, unit suffix — so the native iOS number pad opens. The stepper stays in the system for the cases where typing is overkill (rest defaults, target reps in templates, settings).
            </p>
          </div>
          <div>
            <h3 style={{fontSize:16, fontWeight:600, color:'var(--text-primary)', margin:'0 0 8px'}}>One accent, one chart</h3>
            <p style={{margin:0}}>
              No categorical palette. The accent does the talking; previous-cycle compare is a dashed neutral. PR markers use the accent at full saturation; deload markers are a hollow neutral pill. The heatmap is five steps of accent-mixed-with-surface — the brightness encodes volume directly. Adding a second hue would invent a hierarchy the data doesn't have.
            </p>
          </div>
          <div>
            <h3 style={{fontSize:16, fontWeight:600, color:'var(--text-primary)', margin:'0 0 8px'}}>Sharp, hairline, near-black</h3>
            <p style={{margin:0}}>
              2–4px radii, no shadows, single-pixel hairline borders. Elevation is communicated by hierarchy and contrast, not by frosted glass or pastel halos. Surfaces step from #0A0B0C → #0F1113 → #16191C. The only motion under 200ms.
            </p>
          </div>
        </div>
      </Section>

      <footer style={{padding:'48px', textAlign:'center', color:'var(--text-muted)', fontSize:12, fontFamily:'var(--font-mono)'}}>
        PUMPED · DESIGN SYSTEM v0.1 · {new Date().getFullYear()}
      </footer>

      {/* Sheet (lives in component cell) */}
      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Workout options">
        <div className="list" style={{margin:'0 -16px'}}>
          <ListRow title="Edit template" subtitle="Add or rearrange exercises" chevron/>
          <ListRow title="Discard workout" subtitle="Today's progress will be lost" chevron/>
          <ListRow title="Settings" subtitle="Units, rest defaults" chevron/>
        </div>
        <div style={{padding:'16px 0 0'}}>
          <Button variant="ghost" block onClick={() => setSheetOpen(false)}>Close</Button>
        </div>
      </BottomSheet>

      {/* ── TWEAKS ─────────────────────────────────────────── */}
      <TweaksPanel title="Pumped · Tweaks">
        <TweakSection label="Theme"/>
        <TweakRadio
          label="Mode"
          value={t.theme}
          options={['dark', 'light']}
          onChange={v => setTweak('theme', v)}
        />
        <TweakSection label="Accent"/>
        <TweakRadio
          label="Color"
          value={t.accent}
          options={['mint', 'cyan', 'lime', 'steel', 'sage', 'glacier', 'clay', 'rust', 'bone', 'graphite']}
          onChange={v => setTweak('accent', v)}
        />
      </TweaksPanel>
    </div>
  );
}

function NumChip({ n }) {
  return (
    <span style={{
      width:28, height:28, borderRadius:2,
      border:'1px solid var(--border)',
      display:'grid', placeItems:'center',
      fontFamily:'var(--font-mono)', fontSize:13, fontWeight:600,
      color:'var(--text-muted)',
    }}>{n}</span>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
