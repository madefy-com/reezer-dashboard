**ModePill** — top-status-bar indicator of whether the bot is trading real money. `LIVE` is green with a pulsing dot (real orders); `DRY-RUN` is amber (paper/simulation). The most consequential state on the screen.

```jsx
<ModePill mode="LIVE" onToggle={confirmSwitch} />
<ModePill mode="DRY-RUN" />
```

Pass `onToggle` to make it clickable. Switching into LIVE should always be gated behind a confirm (real money). Pair with budget + kill-switch state in the status bar.
