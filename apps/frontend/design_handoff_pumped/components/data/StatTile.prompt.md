**StatTile** — a labelled metric with a chunky tabular-figure value.

```jsx
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
  <StatTile icon={<Icon name="flame" size={16} />} label="Streak" value="12" unit="days" />
  <StatTile label="Volume" value="96.2k" unit="kg" />
  <StatTile variant="raised" label="This week" value="24.8k" unit="kg" />
</div>
```

- Lay tiles in a 2- or 3-column grid with a 10–12px gap.
- Promote the single most important number to `variant="raised"` (moss) instead of giving every tile equal weight.
