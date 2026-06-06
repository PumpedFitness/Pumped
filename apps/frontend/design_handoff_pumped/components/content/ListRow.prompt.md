**ListRow** — a settings/detail row with a soft accent icon tile. Group them inside a `<Card pad={0}>`.

```jsx
<Card pad={0}>
  <ListRow icon={<Icon name="dumbbell" size={18} />} label="Units" detail="Kilograms" />
  <ListRow icon={<Icon name="rest" size={18} />} label="Default rest" detail="90 sec" divider />
  <ListRow icon={<Icon name="bolt" size={18} />} label="Reminders" trailing={<Toggle checked />} divider />
</Card>
```

- First row has no `divider`; every following row sets `divider` to draw the hairline.
- Put a chevron `<Icon name="chevron" />` in `trailing` for navigable rows.
