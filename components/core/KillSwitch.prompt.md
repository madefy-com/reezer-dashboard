**KillSwitch** — the safety toggle that immediately halts all trading. `ARMED` (green, shows "ACTIVE") means the bot may place orders; `TRIPPED` (red, shows "DEACTIVATED") means everything is stopped. Lives in the top status bar next to the mode pill.

```jsx
<KillSwitch state="ARMED" onToggle={trip} />
<KillSwitch state="TRIPPED" onToggle={rearm} label={false} />
```

Heavier visual weight than a plain Switch on purpose — this stops real money. Tripping should be instant (no confirm); re-arming may be gated.
