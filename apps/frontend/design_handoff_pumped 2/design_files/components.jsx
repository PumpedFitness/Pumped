/* global React */
const { useState, useEffect, useRef, useCallback } = React;

// ───── Icons (lucide-style inline) ─────
const Icon = ({ d, size = 20, stroke = 2, fill = 'none' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke="currentColor" strokeWidth={stroke}
    strokeLinecap="round" strokeLinejoin="round">
    {typeof d === 'string' ? <path d={d}/> : d}
  </svg>
);
const ICONS = {
  plus:    <path d="M12 5v14M5 12h14"/>,
  minus:   <path d="M5 12h14"/>,
  check:   <path d="M20 6L9 17l-5-5"/>,
  x:       <path d="M18 6L6 18M6 6l12 12"/>,
  chevR:   <path d="M9 6l6 6-6 6"/>,
  chevL:   <path d="M15 6l-6 6 6 6"/>,
  chevD:   <path d="M6 9l6 6 6-6"/>,
  chevU:   <path d="M6 15l6-6 6 6"/>,
  more:    <><circle cx="12" cy="5" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="19" r="1.5" fill="currentColor"/></>,
  search:  <><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></>,
  dumb:    <path d="M2 12h2M20 12h2M6 6v12M9 6v12M15 6v12M18 6v12M6 12h12"/>,
  history: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  user:    <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></>,
  flame:   <path d="M12 2c1 4 5 5 5 10a5 5 0 11-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z"/>,
  pause:   <><rect x="6" y="5" width="4" height="14" rx="0.5"/><rect x="14" y="5" width="4" height="14" rx="0.5"/></>,
  play:    <path d="M7 5l12 7-12 7V5z" fill="currentColor"/>,
  timer:   <><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/></>,
  arrow:   <path d="M5 12h14M13 6l6 6-6 6"/>,
  arrowL:  <path d="M19 12H5M11 6l-6 6 6 6"/>,
  bolt:    <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>,
  edit:    <path d="M12 20h9M16.5 3.5a2.1 2.1 0 113 3L7 19l-4 1 1-4 12.5-12.5z"/>,
  trash:   <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M6 6v14a2 2 0 002 2h8a2 2 0 002-2V6"/>,
  filter:  <path d="M3 4h18l-7 9v6l-4 2v-8L3 4z"/>,
  cloud:   <path d="M18 18a4 4 0 000-8 6 6 0 00-12 1 4 4 0 002 7h10z"/>,
  cloudOff:<><path d="M3 3l18 18"/><path d="M18 18a4 4 0 000-8 6 6 0 00-9-3"/><path d="M6 11a4 4 0 002 7h8"/></>,
  done:    <path d="M5 12l5 5L20 7"/>,
};

// ───── Button ─────
function Button({
  children, variant = 'primary', size = 'md', block, loading, disabled,
  leadingIcon, trailingIcon, onClick, type = 'button', className = '',
}) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size} ${block ? 'btn-block' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
      data-loading={loading || undefined}
    >
      {leadingIcon && <Icon d={leadingIcon} size={size === 'sm' ? 16 : 18} />}
      {children}
      {trailingIcon && <Icon d={trailingIcon} size={size === 'sm' ? 16 : 18} />}
    </button>
  );
}

function IconButton({ icon, onClick, label, bordered, className = '' }) {
  return (
    <button
      className={`icon-btn ${className}`}
      onClick={onClick}
      aria-label={label}
      data-bordered={bordered || undefined}
    >
      <Icon d={icon} size={20}/>
    </button>
  );
}

// ───── Input ─────
function Input({ label, hint, error, value, onChange, type = 'text', placeholder, autoFocus, inputMode, readOnly }) {
  const isReadOnly = readOnly || (value !== undefined && !onChange);
  return (
    <div className="input-wrap">
      {label && <label className="input-label">{label}</label>}
      <input
        className="input"
        type={type}
        value={value ?? ''}
        onChange={onChange || (() => {})}
        readOnly={isReadOnly}
        placeholder={placeholder}
        autoFocus={autoFocus}
        inputMode={inputMode}
        aria-invalid={!!error || undefined}
      />
      {(hint || error) && (
        <span className={`input-help ${error ? 'error' : ''}`}>{error || hint}</span>
      )}
    </div>
  );
}

// ───── Card ─────
function Card({ children, className = '' }) {
  return <div className={`card ${className}`}>{children}</div>;
}

// ───── List Row ─────
function ListRow({ title, subtitle, leading, trailing, onClick, chevron }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag className="list-row" onClick={onClick} type={onClick ? 'button' : undefined}>
      {leading && <div style={{flexShrink: 0}}>{leading}</div>}
      <div className="list-row-main">
        <div className="list-row-title">{title}</div>
        {subtitle && <div className="list-row-sub">{subtitle}</div>}
      </div>
      <div className="list-row-trail">
        {trailing}
        {chevron && <Icon d={ICONS.chevR.props.d} size={16}/>}
      </div>
    </Tag>
  );
}

// ───── App Bar ─────
function AppBar({ title, leading, trailing, eyebrow }) {
  return (
    <div className="appbar">
      <div className="appbar-side">{leading}</div>
      <div className="appbar-center">
        {eyebrow && <span className="appbar-eyebrow">{eyebrow}</span>}
        <span className="appbar-title">{title}</span>
      </div>
      <div className="appbar-side">{trailing}</div>
    </div>
  );
}

// ───── Tab Bar ─────
function TabBar({ items, current, onChange }) {
  return (
    <nav className="tabbar">
      {items.map(it => {
        const k = it.id ?? it.key;
        return (
          <button
            key={k}
            className="tab"
            aria-current={current === k ? 'page' : undefined}
            onClick={() => onChange?.(k)}
          >
            <Icon d={it.icon} size={20}/>
            <span>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ───── Sync Status ─────
function SyncStatus({ state = 'synced' }) {
  const labels = { synced: 'Synced', syncing: 'Syncing', offline: 'Offline' };
  return (
    <span className="sync" data-state={state}>
      <span className="sync-dot"/>
      {labels[state]}
    </span>
  );
}

// ───── Empty State ─────
function EmptyState({ title, sub, action }) {
  return (
    <div className="empty">
      <div className="empty-mark"><Icon d={ICONS.dumb.props.d} size={24}/></div>
      <div>
        <div className="empty-title">{title}</div>
        {sub && <div className="empty-sub" style={{marginTop:6}}>{sub}</div>}
      </div>
      {action}
    </div>
  );
}

// ───── Toast ─────
function Toast({ children, variant = 'default', onClose }) {
  return (
    <div className="toast" data-variant={variant}>
      <span className="toast-dot"/>
      <span style={{flex:1}}>{children}</span>
      {onClose && <IconButton icon={ICONS.x.props.d} onClick={onClose} label="Dismiss"/>}
    </div>
  );
}

// ───── Bottom Sheet ─────
function BottomSheet({ open, onClose, title, children, height }) {
  if (!open) return null;
  return (
    <div className="scrim" onClick={onClose}>
      <div className="sheet" style={{height}} onClick={e => e.stopPropagation()}>
        <div className="sheet-handle"/>
        {title && (
          <div className="sheet-header">
            <div className="sheet-title">{title}</div>
            <IconButton icon={ICONS.x.props.d} onClick={onClose} label="Close"/>
          </div>
        )}
        <div className="sheet-body scroll">{children}</div>
      </div>
    </div>
  );
}

// ───── Stepper (the workhorse) ─────
// Tap to step. Press-and-hold to ramp.
function Stepper({
  value, onChange, min = 0, max = 9999, step = 5, unit = 'lb', label,
  size = 'lg', disabled,
}) {
  const [pressed, setPressed] = useState(null); // 'inc' | 'dec' | null
  const timerRef = useRef(null);
  const rampRef = useRef(null);
  const valueRef = useRef(value);
  useEffect(() => { valueRef.current = value; }, [value]);

  const clamp = useCallback(v => Math.max(min, Math.min(max, v)), [min, max]);

  const adjust = useCallback((dir) => {
    onChange?.(clamp(valueRef.current + dir * step));
  }, [onChange, clamp, step]);

  const startRamp = useCallback((dir) => {
    if (disabled) return;
    setPressed(dir > 0 ? 'inc' : 'dec');
    adjust(dir);
    // hold delay
    timerRef.current = setTimeout(() => {
      let interval = 120;
      const tick = () => {
        adjust(dir);
        // accelerate
        interval = Math.max(40, interval - 8);
        rampRef.current = setTimeout(tick, interval);
      };
      rampRef.current = setTimeout(tick, interval);
    }, 350);
  }, [adjust, disabled]);

  const endRamp = useCallback(() => {
    setPressed(null);
    clearTimeout(timerRef.current);
    clearTimeout(rampRef.current);
  }, []);

  useEffect(() => () => endRamp(), [endRamp]);

  const handlers = (dir) => ({
    onMouseDown: (e) => { e.preventDefault(); startRamp(dir); },
    onMouseUp: endRamp,
    onMouseLeave: endRamp,
    onTouchStart: (e) => { e.preventDefault(); startRamp(dir); },
    onTouchEnd: endRamp,
    onTouchCancel: endRamp,
  });

  const formatValue = (v) => {
    if (typeof v !== 'number') return '—';
    if (Number.isInteger(v)) return v.toString();
    return v.toFixed(1);
  };

  return (
    <div className="stepper-wrap">
      {(label || unit) && (
        <div className="stepper-wrap-label">
          <span>{label}</span>
          {unit && size !== 'sm' && <span style={{opacity: 0.7}}>{unit}</span>}
        </div>
      )}
      <div className={`stepper ${size === 'sm' ? 'stepper-sm' : ''}`} data-active={!!pressed || undefined}>
        <button
          className="stepper-btn"
          {...handlers(-1)}
          data-pressed={pressed === 'dec' || undefined}
          disabled={disabled || value <= min}
          aria-label={`Decrease ${label || 'value'}`}
        >
          <Icon d={ICONS.minus.props.d} size={size === 'sm' ? 16 : 22} stroke={2.5}/>
        </button>
        <div className="stepper-value">
          <span className="stepper-num">{formatValue(value)}</span>
        </div>
        <button
          className="stepper-btn"
          {...handlers(1)}
          data-pressed={pressed === 'inc' || undefined}
          disabled={disabled || value >= max}
          aria-label={`Increase ${label || 'value'}`}
        >
          <Icon d={ICONS.plus.props.d} size={size === 'sm' ? 16 : 22} stroke={2.5}/>
        </button>
      </div>
    </div>
  );
}

// ───── Set Row (workout-specific) ─────
function SetRow({ index, weight, reps, state = 'pending', onChangeWeight, onChangeReps, onComplete, onActivate, prev }) {
  // states: 'done' | 'active' | 'pending'
  if (state === 'done') {
    return (
      <div className="setrow" data-state="done">
        <span className="setrow-num">{index}</span>
        <div className="setrow-stat"><span className="setrow-val">{weight}</span><span className="setrow-unit">lb</span></div>
        <div className="setrow-stat"><span className="setrow-val">{reps}</span><span className="setrow-unit">reps</span></div>
        <button className="setrow-check" data-checked="true" aria-label="Logged">
          <Icon d={ICONS.check.props.d} size={18} stroke={3}/>
        </button>
      </div>
    );
  }
  if (state === 'active') {
    return (
      <div className="setrow" data-state="active">
        <span className="setrow-num" style={{color:'var(--accent)'}}>{index}</span>
        <input
          className="setrow-input"
          inputMode="decimal"
          value={weight ?? ''}
          placeholder={prev?.weight?.toString() ?? '0'}
          onChange={e => onChangeWeight?.(e.target.value)}
          aria-label="Weight"
        />
        <input
          className="setrow-input"
          inputMode="numeric"
          value={reps ?? ''}
          placeholder={prev?.reps?.toString() ?? '0'}
          onChange={e => onChangeReps?.(e.target.value)}
          aria-label="Reps"
        />
        <button className="setrow-check" onClick={onComplete} aria-label="Complete set">
          <Icon d={ICONS.check.props.d} size={18} stroke={2.5}/>
        </button>
      </div>
    );
  }
  return (
    <button
      className="setrow"
      style={{cursor:'pointer', width:'100%', border:'none', background:'transparent', textAlign:'left'}}
      onClick={onActivate}
      type="button"
    >
      <span className="setrow-num">{index}</span>
      <div className="setrow-stat" style={{opacity:0.45}}>
        <span className="setrow-val">{prev?.weight ?? '—'}</span>
        <span className="setrow-unit">lb</span>
      </div>
      <div className="setrow-stat" style={{opacity:0.45}}>
        <span className="setrow-val">{prev?.reps ?? '—'}</span>
        <span className="setrow-unit">reps</span>
      </div>
      <span className="setrow-check" aria-hidden="true"/>
    </button>
  );
}

// ───── Stat Block ─────
function Stat({ label, value, large }) {
  return (
    <div className="stat">
      <span className="stat-label">{label}</span>
      <span className={`stat-value ${large ? 'stat-value-lg' : ''}`}>{value}</span>
    </div>
  );
}

// ───── Badge ─────
function Badge({ children, variant }) {
  return <span className={`badge ${variant === 'accent' ? 'badge-accent' : ''}`}>{children}</span>;
}

// ───── Phone Frame (custom — no chrome) ─────
function PhoneFrame({ children, theme = 'dark', label }) {
  const safeTop = 47;     // status bar height
  const safeBot = 28;     // home indicator
  return (
    <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:12}}>
      {label && <div className="eyebrow" style={{color:'var(--text-muted)'}}>{label}</div>}
      <div style={{
        width: 390, height: 844,
        borderRadius: 48,
        background: '#000',
        padding: 8,
        boxShadow: '0 0 0 1px #1a1a1a, 0 30px 60px -20px rgba(0,0,0,0.7)',
        position: 'relative',
      }}>
        <div data-theme={theme} style={{
          width: '100%', height: '100%',
          borderRadius: 40,
          overflow: 'hidden',
          background: 'var(--bg)',
          color: 'var(--text-primary)',
          position: 'relative',
          fontFamily: 'var(--font-sans)',
        }}>
          {/* Status bar */}
          <div style={{
            position:'absolute', top:0, left:0, right:0, height: safeTop,
            display:'flex', alignItems:'flex-end', justifyContent:'space-between',
            padding:'0 28px 8px', zIndex:50,
            fontFamily:'var(--font-mono)', fontSize:14, fontWeight:600,
            color:'var(--text-primary)',
            pointerEvents:'none',
          }}>
            <span>9:41</span>
            <span style={{display:'flex', gap:6, alignItems:'center'}}>
              <svg width="16" height="10" viewBox="0 0 16 10" fill="currentColor"><rect x="0" y="6" width="2.4" height="4" rx="0.5"/><rect x="3.6" y="4" width="2.4" height="6" rx="0.5"/><rect x="7.2" y="2" width="2.4" height="8" rx="0.5"/><rect x="10.8" y="0" width="2.4" height="10" rx="0.5"/></svg>
              <svg width="22" height="10" viewBox="0 0 22 10"><rect x="0.5" y="0.5" width="18" height="9" rx="2" stroke="currentColor" fill="none" opacity="0.5"/><rect x="2" y="2" width="13" height="6" rx="1" fill="currentColor"/><rect x="20" y="3" width="1.5" height="4" rx="0.5" fill="currentColor" opacity="0.5"/></svg>
            </span>
          </div>
          {/* Dynamic island */}
          <div style={{
            position:'absolute', top:11, left:'50%', transform:'translateX(-50%)',
            width:114, height:32, borderRadius:20, background:'#000', zIndex:60,
          }}/>
          {/* Content area below status bar */}
          <div style={{
            position:'absolute', top:safeTop, left:0, right:0, bottom:0,
            display:'flex', flexDirection:'column',
            overflow:'hidden',
          }}>
            {children}
          </div>
          {/* Home indicator */}
          <div style={{
            position:'absolute', bottom:8, left:'50%', transform:'translateX(-50%)',
            width:134, height:5, borderRadius:3,
            background: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)',
            zIndex:70, pointerEvents:'none',
          }}/>
        </div>
      </div>
    </div>
  );
}

// ───── Number Field — same chassis as Input, mono numerals + optional unit suffix
function NumberField({ label, hint, error, value, onChange, unit, placeholder, autoFocus, inputMode = 'decimal' }) {
  return (
    <div className="input-wrap">
      {label && <label className="input-label">{label}{unit ? ` (${unit})` : ''}</label>}
      <div className="input-num-wrap">
        <input
          className="input input-num"
          type="text"
          inputMode={inputMode}
          value={value ?? ''}
          onChange={e => onChange?.(e.target.value.replace(/[^\d.]/g, ''))}
          placeholder={placeholder ?? '0'}
          autoFocus={autoFocus}
          aria-invalid={!!error || undefined}
          style={unit ? { paddingRight: 56 } : undefined}
        />
        {unit && <span className="input-num-unit">{unit}</span>}
      </div>
      {(hint || error) && (
        <span className={`input-help ${error ? 'error' : ''}`}>{error || hint}</span>
      )}
    </div>
  );
}

// ───── Tabs (segmented) ─────
function Tabs({ items, current, onChange, full }) {
  return (
    <div className="tabs" data-full={full ? 'true' : undefined} role="tablist">
      {items.map(it => {
        const key = typeof it === 'string' ? it : it.key;
        const label = typeof it === 'string' ? it : it.label;
        return (
          <button key={key} role="tab" aria-selected={current === key}
            className="tab-item" onClick={() => onChange?.(key)}>{label}</button>
        );
      })}
    </div>
  );
}

// ───── Switch ─────
function Switch({ checked, onChange, disabled, label }) {
  const btn = (
    <button className="switch" role="switch" aria-checked={checked}
      disabled={disabled} onClick={() => onChange?.(!checked)} />
  );
  if (!label) return btn;
  return (
    <label style={{display:'flex', alignItems:'center', gap:12, cursor:'pointer'}}>
      <span style={{flex:1, fontSize:14, color:'var(--foreground)'}}>{label}</span>
      {btn}
    </label>
  );
}

// ───── Slider ─────
function Slider({ value, onChange, min = 0, max = 100, step = 1, showValue, format }) {
  const ref = React.useRef(null);
  const pct = ((value - min) / (max - min)) * 100;
  const drag = (clientX) => {
    const r = ref.current.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    const raw = min + p * (max - min);
    const stepped = Math.round(raw / step) * step;
    onChange?.(Math.max(min, Math.min(max, stepped)));
  };
  return (
    <div style={{display:'flex', alignItems:'center', gap:12, width:'100%'}}>
      <div ref={ref} className="slider"
        onPointerDown={e => { e.target.setPointerCapture(e.pointerId); drag(e.clientX); }}
        onPointerMove={e => { if (e.buttons) drag(e.clientX); }}>
        <div className="slider-track">
          <div className="slider-fill" style={{width: pct + '%'}} />
        </div>
        <div className="slider-thumb" style={{left: pct + '%'}} />
      </div>
      {showValue && <span className="slider-value">{format ? format(value) : value}</span>}
    </div>
  );
}

// ───── Alert ─────
function Alert({ variant = 'default', title, children, icon }) {
  const def = { success: '✓', warning: '!', danger: '×' }[variant] || 'i';
  return (
    <div className="alert" data-variant={variant}>
      <div className="alert-icon">{icon || def}</div>
      <div className="alert-body">
        {title && <div className="alert-title">{title}</div>}
        {children && <div className="alert-desc">{children}</div>}
      </div>
    </div>
  );
}

// ───── Skeleton ─────
function Skeleton({ w, h, circle, className = '', style }) {
  return <div className={`skeleton ${circle ? 'skeleton-circle' : ''} ${className}`}
    style={{width: w, height: h, ...style}} />;
}
function SkeletonGroup({ children }) {
  return <div className="skeleton-group">{children}</div>;
}

// ───── Tag / Chip ─────
function Tag({ children, selected, onClick }) {
  return (
    <button className="tag" aria-pressed={selected} onClick={onClick}>{children}</button>
  );
}
function TagGroup({ children }) {
  return <div className="tag-group">{children}</div>;
}

// ───── Popover (simple — caller positions) ─────
function Popover({ children }) {
  return <div className="popover">{children}</div>;
}
function PopoverItem({ children, onClick, leading }) {
  return (
    <button className="popover-item" onClick={onClick}>
      {leading}
      <span>{children}</span>
    </button>
  );
}

// ───── ScrollShadow / Pressable ─────
function ScrollShadow({ children, style, maxH }) {
  return <div className="scroll-shadow" style={{maxHeight: maxH, ...style}}>{children}</div>;
}
function Pressable({ children, onClick, as = 'button', ...rest }) {
  const Tag = as;
  return <Tag className="pressable" onClick={onClick} {...rest}>{children}</Tag>;
}

Object.assign(window, {
  Icon, ICONS, Button, IconButton, Input, NumberField, Card, ListRow, AppBar, TabBar,
  SyncStatus, EmptyState, Toast, BottomSheet, Stepper, SetRow, Stat, Badge, PhoneFrame,
  Tabs, Switch, Slider, Alert, Skeleton, SkeletonGroup, Tag, TagGroup,
  Popover, PopoverItem, ScrollShadow, Pressable,
});
