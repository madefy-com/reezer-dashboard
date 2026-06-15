**ResultBadge** — the outcome stamp on a trade row. `WIN` green, `LOSS` red, `OPEN` blue (still live / unrealized), `BE` gray (breakeven). This is the canonical P&L semantic; reuse these exact colors anywhere money is signed.

```jsx
<ResultBadge result="WIN" />
<ResultBadge result="OPEN" size="sm" />
```

Sizes: `sm | md`. Green always = profit, red always = loss — never repurpose. For partial exits the row still resolves to one badge (usually WIN/BE); show the `1.80/be` detail in the exit cell, not the badge.
