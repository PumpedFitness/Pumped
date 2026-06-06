**Button** — the brand's primary action; pill-shaped with a chunky display-font label and a soft press-shrink.

```jsx
<Button variant="primary" icon={<Icon name="play" size={15} />}>Start</Button>
<Button variant="secondary" size="lg" block iconRight={<Icon name="chevron" size={18} />}>Next exercise</Button>
<Button variant="ghost" size="sm">Skip</Button>
```

- One `primary` (accent) button per screen — it's the loudest thing. `secondary` is moss for "next / continue". `ghost` is a quiet outline.
- Use `block` for the full-width CTA at the bottom of a card or sheet.
- Pass icons via `icon` / `iconRight`, not inside `children`, so the 9px gap is consistent.
