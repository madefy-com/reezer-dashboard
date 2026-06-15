**TypeChip** — classifies a Discord message in the firing log by intent: `WATCH` (blue), `ENTRY` (purple), `PARTIAL` (amber), `CLOSE` (teal). Lets the operator scan the feed by message type at a glance.

```jsx
<TypeChip type="ENTRY" />
<TypeChip type="PARTIAL" />
```

Always paired with a `FiredBadge` (did it trigger an order or get filtered) on the same feed row.
