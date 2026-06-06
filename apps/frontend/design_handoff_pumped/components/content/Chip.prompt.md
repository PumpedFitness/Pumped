**Chip** — a rounded pill for status (muscle freshness) or filters, with an optional colored leading dot.

```jsx
<Chip dot="var(--clay-sage)">Chest</Chip>      {/* fresh */}
<Chip dot="var(--accent)">Legs</Chip>          {/* needs rest */}
<Chip active>This week</Chip>                  {/* selected filter */}
```

- Use the dot color to encode state: sage = good/fresh, accent = attention/resting.
- `active` is for selectable filters; plain chips are read-only status.
