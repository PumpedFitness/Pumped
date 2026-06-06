**Stepper** — minus / value / plus for adjusting a number while logging a set.

```jsx
const [w, setW] = React.useState(60);
const [r, setR] = React.useState(8);
<div style={{ display: 'flex', gap: 12 }}>
  <Stepper label="Weight" value={w} unit="kg" step={2.5} onChange={setW} />
  <Stepper label="Reps" value={r} onChange={setR} />
</div>
```

- Use `step={2.5}` for barbell weight, `1` for reps / dumbbell.
- Defaults to the moss-well styling used inside the active-set card; pass `onMoss={false}` on a cream surface.
