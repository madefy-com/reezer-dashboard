**Card** — the base container for everything on the dashboard. Flat `ink-2` surface, 1px hairline border, 16px radius, whisper shadow. Pass `title`/`action` to get a hairline-divided header; omit them for a bare padded panel.

```jsx
<Card title="Live trades" action={<Button size="sm" variant="ghost">Export</Button>}>
  <TradesTable rows={rows} />
</Card>

<Card padding={24}><KpiCard .../></Card>
```

Props: `title`, `action`, `padding` (default 20), `inset` (use ink-3 surface), `interactive` (hover affordance), `as`. Never add a colored left-border stripe or heavy shadow — separation comes from the hairline border.
