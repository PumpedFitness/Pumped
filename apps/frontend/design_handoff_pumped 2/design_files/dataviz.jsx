/* global React */
const { useState, useMemo, useRef, useId } = React;

// ─────────────────────────────────────────────────────────────
// Math helpers
// ─────────────────────────────────────────────────────────────

// Catmull-Rom → cubic Bezier, smooths a polyline through points
function smoothPath(points, tension = 0.5) {
  if (points.length < 2) return '';
  const t = tension;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) * t / 6;
    const c1y = p1.y + (p2.y - p0.y) * t / 6;
    const c2x = p2.x - (p3.x - p1.x) * t / 6;
    const c2y = p2.y - (p3.y - p1.y) * t / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function niceRange(min, max, ticks = 4) {
  if (min === max) { min -= 1; max += 1; }
  const range = max - min;
  const step = Math.pow(10, Math.floor(Math.log10(range / ticks)));
  const err = (range / ticks) / step;
  const mult = err >= 7.5 ? 10 : err >= 3 ? 5 : err >= 1.5 ? 2 : 1;
  const niceStep = mult * step;
  const niceMin = Math.floor(min / niceStep) * niceStep;
  const niceMax = Math.ceil(max / niceStep) * niceStep;
  return { min: niceMin, max: niceMax, step: niceStep };
}

// ─────────────────────────────────────────────────────────────
// AreaChart
//   data: [{ x: number|Date, y: number, label?: string }]
//   compare?: same shape (drawn as muted line, no fill)
//   annotations?: [{ x, y, label, kind: 'pr'|'deload' }]
//   loading, empty, height, yLabel, xFormat, yFormat
// ─────────────────────────────────────────────────────────────
function AreaChart({
  data = [],
  compare,
  annotations = [],
  loading,
  height = 220,
  width: propWidth,
  pad = { top: 24, right: 16, bottom: 28, left: 8 },
  yFormat = v => `${Math.round(v)}`,
  xFormat = i => i,
  ariaLabel,
}) {
  const [hover, setHover] = useState(null); // index into data
  const wrapRef = useRef(null);
  const [width, setWidth] = useState(propWidth || 560);
  const gradId = useId();

  React.useEffect(() => {
    if (propWidth) return;
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setWidth(Math.max(280, e.contentRect.width));
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [propWidth]);

  if (loading) {
    return (
      <div ref={wrapRef} className="chart-wrap" style={{ height }}>
        <ChartSkeleton width={width} height={height} pad={pad}/>
      </div>
    );
  }
  if (!data.length) {
    return (
      <div ref={wrapRef} className="chart-wrap chart-empty" style={{ height }}>
        <span>No data yet</span>
      </div>
    );
  }

  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  // Y domain across both series
  const allY = [...data.map(d => d.y), ...(compare?.map(d => d.y) || [])];
  const { min: yMin, max: yMax, step: yStep } = niceRange(Math.min(...allY), Math.max(...allY), 4);
  const yTicks = [];
  for (let v = yMin; v <= yMax + 0.0001; v += yStep) yTicks.push(v);

  // X is index-based for simplicity (works for time-series with even cadence)
  const n = data.length;
  const xAt = i => pad.left + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const yAt = v => pad.top + (1 - (v - yMin) / (yMax - yMin || 1)) * innerH;

  const points = data.map((d, i) => ({ x: xAt(i), y: yAt(d.y), d, i }));
  const linePath = smoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${pad.top + innerH} L ${points[0].x} ${pad.top + innerH} Z`;

  let comparePath = '';
  if (compare && compare.length) {
    const cN = compare.length;
    const cPoints = compare.map((d, i) => ({
      x: pad.left + (cN === 1 ? innerW / 2 : (i / (cN - 1)) * innerW),
      y: yAt(d.y),
    }));
    comparePath = smoothPath(cPoints);
  }

  const handleMove = e => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * width;
    if (x < pad.left || x > pad.left + innerW) { setHover(null); return; }
    const ratio = (x - pad.left) / innerW;
    const idx = Math.round(ratio * (n - 1));
    setHover(Math.max(0, Math.min(n - 1, idx)));
  };

  return (
    <div ref={wrapRef} className="chart-wrap" style={{ height }}>
      <svg
        width="100%" height={height} viewBox={`0 0 ${width} ${height}`}
        role="img" aria-label={ariaLabel || 'area chart'}
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
        onTouchMove={e => {
          const t = e.touches[0]; if (!t) return;
          handleMove({ currentTarget: e.currentTarget, clientX: t.clientX });
        }}
        onTouchEnd={() => setHover(null)}
        style={{ display: 'block' }}
      >
        <defs>
          <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.32"/>
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"/>
          </linearGradient>
        </defs>

        {/* Y baseline only — no full grid */}
        <line
          x1={pad.left} x2={pad.left + innerW}
          y1={pad.top + innerH} y2={pad.top + innerH}
          stroke="var(--chart-grid)" strokeWidth={1}
        />

        {/* Compare series (drawn first, behind) */}
        {comparePath && (
          <path d={comparePath} fill="none"
            stroke="var(--chart-line-prev)" strokeWidth={1.5}
            strokeDasharray="3 4" strokeLinecap="round"
          />
        )}

        {/* Area fill */}
        <path d={areaPath} fill={`url(#${gradId})`}/>

        {/* Line */}
        <path d={linePath} fill="none"
          stroke="var(--chart-line)" strokeWidth={2}
          strokeLinecap="round" strokeLinejoin="round"
        />

        {/* Annotations */}
        {annotations.map((a, i) => {
          const px = xAt(a.x);
          const py = yAt(a.y);
          const isPR = a.kind !== 'deload';
          return (
            <g key={i}>
              <line x1={px} x2={px} y1={py} y2={pad.top + innerH}
                stroke={isPR ? 'var(--chart-pr)' : 'var(--chart-deload)'}
                strokeWidth={1} strokeDasharray="2 3" opacity={0.6}
              />
              <circle cx={px} cy={py} r={4}
                fill="var(--bg)"
                stroke={isPR ? 'var(--chart-pr)' : 'var(--chart-deload)'}
                strokeWidth={2}
              />
              <g transform={`translate(${px}, ${py - 12})`}>
                <rect x={-18} y={-13} width={36} height={16} rx={2}
                  fill={isPR ? 'var(--chart-pr)' : 'var(--surface-raised)'}
                  stroke={isPR ? 'var(--chart-pr)' : 'var(--border-strong)'}
                />
                <text x={0} y={-2} textAnchor="middle"
                  fontFamily="var(--font-mono)" fontSize={9} fontWeight={600}
                  letterSpacing="0.06em"
                  fill={isPR ? 'var(--accent-ink)' : 'var(--text-secondary)'}
                >{a.label}</text>
              </g>
            </g>
          );
        })}

        {/* Hover crosshair */}
        {hover != null && (
          <g>
            <line
              x1={points[hover].x} x2={points[hover].x}
              y1={pad.top} y2={pad.top + innerH}
              stroke="var(--chart-crosshair)" strokeWidth={1}
            />
            <circle cx={points[hover].x} cy={points[hover].y} r={4}
              fill="var(--bg)" stroke="var(--chart-line)" strokeWidth={2}
            />
            {/* Y-axis labels appear on hover only */}
            {yTicks.map((v, i) => (
              <text key={i}
                x={pad.left + 4} y={yAt(v) - 4}
                fontFamily="var(--font-mono)" fontSize={10}
                fill="var(--chart-axis)"
              >{yFormat(v)}</text>
            ))}
            {/* Hover value tooltip */}
            <g transform={`translate(${points[hover].x}, ${pad.top - 6})`}>
              {(() => {
                const txt = `${yFormat(data[hover].y)}`;
                const subTxt = data[hover].label || xFormat(hover);
                const wMain = txt.length * 7 + 16;
                const wSub = String(subTxt).length * 5.5 + 16;
                const w = Math.max(wMain, wSub, 56);
                const xOff = points[hover].x - w / 2 < 4 ? -points[hover].x + 4 + w / 2 :
                             points[hover].x + w / 2 > width - 4 ? width - 4 - points[hover].x - w / 2 : 0;
                return (
                  <g transform={`translate(${xOff}, 0)`}>
                    <rect x={-w/2} y={-32} width={w} height={32} rx={2}
                      fill="var(--surface-raised)" stroke="var(--border-strong)"
                    />
                    <text x={0} y={-19} textAnchor="middle"
                      fontFamily="var(--font-mono)" fontSize={12} fontWeight={600}
                      fill="var(--text-primary)"
                    >{txt}</text>
                    <text x={0} y={-7} textAnchor="middle"
                      fontFamily="var(--font-mono)" fontSize={9}
                      letterSpacing="0.06em"
                      fill="var(--text-muted)"
                    >{String(subTxt).toUpperCase()}</text>
                  </g>
                );
              })()}
            </g>
          </g>
        )}

        {/* X axis labels — show first/last only when not hovering, to keep clean */}
        {hover == null && n >= 2 && (
          <g>
            <text x={xAt(0)} y={height - 8}
              fontFamily="var(--font-mono)" fontSize={10}
              fill="var(--chart-axis)" textAnchor="start"
            >{String(data[0].label || xFormat(0)).toUpperCase()}</text>
            <text x={xAt(n - 1)} y={height - 8}
              fontFamily="var(--font-mono)" fontSize={10}
              fill="var(--chart-axis)" textAnchor="end"
            >{String(data[n - 1].label || xFormat(n - 1)).toUpperCase()}</text>
          </g>
        )}
      </svg>
    </div>
  );
}

function ChartSkeleton({ width, height, pad }) {
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  // generate a fake smooth path for the shimmer
  const pts = Array.from({ length: 8 }, (_, i) => ({
    x: pad.left + (i / 7) * innerW,
    y: pad.top + innerH * (0.4 + 0.3 * Math.sin(i * 1.1) + 0.1 * Math.cos(i * 2.3)),
  }));
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
      <line x1={pad.left} x2={pad.left + innerW}
        y1={pad.top + innerH} y2={pad.top + innerH}
        stroke="var(--chart-grid)" strokeWidth={1}
      />
      <path d={smoothPath(pts)} fill="none"
        stroke="var(--border-strong)" strokeWidth={2} strokeDasharray="4 6"
        opacity={0.6}
      >
        <animate attributeName="opacity" values="0.3;0.7;0.3" dur="1.6s" repeatCount="indefinite"/>
      </path>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Sparkline — compact, inline, optional delta dot at end
// ─────────────────────────────────────────────────────────────
function Sparkline({ data = [], width = 96, height = 28, showEnd = true, ariaLabel }) {
  const gradId = useId();
  if (!data.length) {
    return <span className="spark-empty" style={{ width, height }}/>;
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const pad = 3;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;
  const points = data.map((y, i) => ({
    x: pad + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW),
    y: pad + (1 - (y - min) / (max - min || 1)) * innerH,
  }));
  const linePath = smoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - pad} L ${points[0].x} ${height - pad} Z`;
  const last = points[points.length - 1];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}
      role="img" aria-label={ariaLabel || 'trend'}
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`}/>
      <path d={linePath} fill="none" stroke="var(--chart-line)"
        strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
      />
      {showEnd && (
        <circle cx={last.x} cy={last.y} r={2.5}
          fill="var(--chart-line)" stroke="var(--bg)" strokeWidth={1}
        />
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// MonthGrid — full month, filled-cell variant for workout days
//   year, month (0-11), workouts: Set<number> of day-of-month, today?: number
// ─────────────────────────────────────────────────────────────
function MonthGrid({
  year, month,
  workouts = new Set(),
  intensity, // optional: Map<day, 0-4> for heatmap cell shading; if absent, workouts are solid accent
  today,
  weekStart = 0, // 0 = Sun, 1 = Mon
  onSelectDay,
  selectedDay,
}) {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = (first.getDay() - weekStart + 7) % 7;
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const dayLabels = weekStart === 1
    ? ['M','T','W','T','F','S','S']
    : ['S','M','T','W','T','F','S'];

  const monthName = first.toLocaleString('en-US', { month: 'long' });

  return (
    <div className="cal-month">
      <div className="cal-month-head">
        <span className="cal-month-title">{monthName} <span className="cal-month-year">{year}</span></span>
      </div>
      <div className="cal-dow">
        {dayLabels.map((l, i) => <span key={i}>{l}</span>)}
      </div>
      <div className="cal-grid">
        {cells.map((d, i) => {
          if (d == null) return <span key={i} className="cal-cell cal-cell-empty"/>;
          const isWorkout = workouts.has(d);
          const isToday = today === d;
          const isSelected = selectedDay === d;
          const intensityLevel = intensity?.get(d);
          const Tag = onSelectDay ? 'button' : 'span';
          return (
            <Tag
              key={i}
              type={onSelectDay ? 'button' : undefined}
              className={[
                'cal-cell',
                isWorkout && 'cal-cell-workout',
                isToday && 'cal-cell-today',
                isSelected && 'cal-cell-selected',
                intensityLevel != null && `cal-cell-h${intensityLevel}`,
              ].filter(Boolean).join(' ')}
              onClick={onSelectDay ? () => onSelectDay(d) : undefined}
              aria-label={`${monthName} ${d}${isWorkout ? ', workout' : ''}`}
            >
              <span className="cal-cell-num">{d}</span>
            </Tag>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// YearHeatmap — GitHub-style; weeks as columns, days as rows
//   data: Map<ISO date string, intensity 0-4>
//   end?: Date (defaults to today). 53 weeks back.
// ─────────────────────────────────────────────────────────────
function YearHeatmap({
  data = new Map(),
  end = new Date(),
  weeks = 26,
  cellSize = 12,
  gap = 3,
  weekStart = 0,
  onSelectDay,
  ariaLabel,
}) {
  // Find Sunday (or Monday) at start
  const today = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  const endDow = (today.getDay() - weekStart + 7) % 7;
  // last column anchor = Sunday of this week (or weekStart)
  const lastWeekStart = new Date(today);
  lastWeekStart.setDate(today.getDate() - endDow);
  const startDate = new Date(lastWeekStart);
  startDate.setDate(lastWeekStart.getDate() - (weeks - 1) * 7);

  const rows = 7;
  const cols = weeks;
  const w = cols * (cellSize + gap) - gap;
  const h = rows * (cellSize + gap) - gap + 18; // + month label row

  const monthLabels = [];
  let lastMonth = -1;
  const cells = [];
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + c * 7 + r);
      if (d > today) continue;
      const iso = d.toISOString().slice(0, 10);
      const v = data.get(iso) || 0;
      cells.push({ c, r, d, iso, v });
      if (r === 0 && d.getMonth() !== lastMonth) {
        lastMonth = d.getMonth();
        monthLabels.push({
          c,
          label: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
        });
      }
    }
  }

  return (
    <div className="heatmap-wrap" role="img" aria-label={ariaLabel || 'workout activity heatmap'}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
        {/* Month labels */}
        {monthLabels.map((m, i) => (
          <text key={i}
            x={m.c * (cellSize + gap)} y={10}
            fontFamily="var(--font-mono)" fontSize={9}
            letterSpacing="0.06em" fill="var(--text-muted)"
          >{m.label}</text>
        ))}
        {/* Cells */}
        {cells.map(({ c, r, d, iso, v }) => {
          const x = c * (cellSize + gap);
          const y = r * (cellSize + gap) + 18;
          const Tag = onSelectDay ? 'rect' : 'rect';
          return (
            <Tag key={iso}
              x={x} y={y} width={cellSize} height={cellSize} rx={1}
              fill={`var(--heat-${v})`}
              stroke={v === 0 ? 'var(--border-soft)' : 'transparent'}
              strokeWidth={v === 0 ? 1 : 0}
              style={onSelectDay ? { cursor: 'pointer' } : undefined}
              onClick={onSelectDay ? () => onSelectDay(d) : undefined}
            >
              <title>{`${iso}${v ? ` · level ${v}` : ' · rest'}`}</title>
            </Tag>
          );
        })}
      </svg>
      <div className="heatmap-legend">
        <span>Less</span>
        {[0,1,2,3,4].map(i => (
          <span key={i} className="heatmap-legend-cell" style={{ background: `var(--heat-${i})` }}/>
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

Object.assign(window, { AreaChart, Sparkline, MonthGrid, YearHeatmap });
