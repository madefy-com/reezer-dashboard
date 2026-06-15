**StatusDot** — tiny blinking indicator for the live state of a trade or process. `live`/`firing`/`open` pulse; `done` is solid gray; `cancelled` is a hollow red ring. Use in the trades log status column and anywhere the "real-time feel" needs reinforcing.

```jsx
<StatusDot status="live" label />          {/* pulsing green + "live" */}
<StatusDot status="done" label="filled" /> {/* custom label */}
<StatusDot status="cancelled" />           {/* dot only */}
```

`label` accepts `true` (default text), a string, or omit for dot-only. Pulse respects `prefers-reduced-motion`.
