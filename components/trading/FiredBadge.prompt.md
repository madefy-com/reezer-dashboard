**FiredBadge** — the outcome stamp in the Discord firing log: did the message trigger a real order (`FIRED`, green dot + caps) or get ignored (`FILTERED`, muted with a reason). The calm system stamp against the loud quoted message is the product's core tension.

```jsx
<FiredBadge fired />
<FiredBadge fired={false} reason="hype" />     {/* FILTERED · hype */}
<FiredBadge fired={false} reason="+23% brag" />
```

Filtered rows should also be visually de-emphasized (lower opacity, muted text) in the feed, not just badged.
