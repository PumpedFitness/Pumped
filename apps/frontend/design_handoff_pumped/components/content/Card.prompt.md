**Card** — a rounded surface; the structural unit of every Pumped screen.

```jsx
<Card>Standard cream card</Card>
<Card variant="raised" radius="2xl" pad={22}>Moss hero — the most important card on the screen</Card>
<Card variant="sunk">Inset well, e.g. a list of sets inside a card</Card>
```

- Use `raised` (moss) for the one hero card per screen — today's session, a readiness summary. Don't stack two raised cards adjacently.
- `radius` climbs with importance: `lg` for ordinary cards, `xl`/`2xl` for feature & hero cards.
- Cards sit directly on the oatmeal ground with a hairline border; reserve `float` (drop shadow) for things that genuinely float, like a detached nav or popover.
