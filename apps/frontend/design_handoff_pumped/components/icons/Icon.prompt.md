**Icon** — renders one of Pumped's custom line icons by name; use it everywhere an icon is needed so stroke weight and corner style stay consistent.

```jsx
<Icon name="dumbbell" size={22} />
<Icon name="flame" size={16} color="var(--clay-sage)" />
{/* inherits text color by default */}
<span style={{ color: 'var(--accent)' }}><Icon name="play" size={15} /></span>
```

- Icons inherit `currentColor` — set color on the parent rather than passing `color` where you can.
- At sizes ≤14px bump `stroke` to ~2.2–2.6 so the icon stays crisp.
- Names: dumbbell, flame, clock, chevron, chevronDown, back, plus, minus, check, x, arrowUp, bolt, calendar, pulse, play, target, trend, settings, home, award, skip, rest, swap, edit, more. (`ICON_NAMES` exports the full list.)
