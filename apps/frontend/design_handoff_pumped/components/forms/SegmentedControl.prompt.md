**SegmentedControl** — pick one of 2–4 short options; the accent thumb slides between them.

```jsx
const [range, setRange] = React.useState('week');
<SegmentedControl value={range} onChange={setRange}
  options={['week', 'month', 'year']} />
```

Keep labels to one short word. For more than ~4 options or long labels, use a native `<select>` instead.
