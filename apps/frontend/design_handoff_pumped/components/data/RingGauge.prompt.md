**RingGauge** — a conic progress ring with a value in the middle, for recovery / readiness / rest countdowns.

```jsx
{/* on a moss hero card */}
<RingGauge value={86} center="var(--surface-raised)">
  <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--clay-cream)' }}>86</span>
  <span style={{ fontSize: 8.5, letterSpacing: '0.1em', color: 'var(--text-on-raised-dim)', textTransform: 'uppercase' }}>ready</span>
</RingGauge>

{/* rest timer — accent fill */}
<RingGauge value={70} size={52} thickness={6} fill="var(--accent)" center="var(--surface-raised)" />
```

- Always set `center` to the color of the surface behind the ring so the hole disappears.
- On a moss surface keep `fill` cream (recovery) or accent (active rest). Avoid two competing bright arcs.
