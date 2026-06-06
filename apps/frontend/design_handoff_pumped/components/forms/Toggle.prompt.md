**Toggle** — an on/off switch; accent track when on.

```jsx
const [on, setOn] = React.useState(true);
<Toggle checked={on} onChange={setOn} />
```

Most often lives in a `ListRow`'s `trailing` slot for settings.
