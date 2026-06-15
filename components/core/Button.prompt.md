**Button** — the primary action control; use for any click target that performs an action. `primary` (violet) for the single main action on a view, `secondary` (default, hairline) for everything else, `ghost` for low-emphasis/toolbar actions, `danger` for irreversible money-moving actions (arm kill switch, switch to LIVE).

```jsx
<Button variant="primary" onClick={fire}>Switch to LIVE</Button>
<Button variant="secondary" icon={<LucidePause/>}>Pause bot</Button>
<Button variant="danger" size="sm">Arm kill switch</Button>
```

Variants: `primary | secondary | ghost | danger`. Sizes: `sm | md | lg`. Props: `icon`, `iconRight`, `full`, `disabled`. Hover steps the surface/shade; press is `scale(0.98)`; focus shows the violet ring. Never use `primary` (violet) to signal money — that is green/red only.
