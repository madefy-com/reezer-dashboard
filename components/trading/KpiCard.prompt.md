**KpiCard** — one headline metric in the dashboard's KPI grid. Lowercase micro-label, large light-weight mono value, optional signed delta pill (auto green-up / red-down), optional sub note. `tone` colors the value itself for money metrics.

```jsx
<KpiCard label="net p&l" value="+$2,840.50" delta="+12.4%" tone="profit" />
<KpiCard label="win rate" value="62%" sub="18W / 11L" />
<KpiCard label="open positions" value="3" sub="+$420 unrealized" tone="profit" />
```

Use `tone="profit|loss"` only for money/return values; leave neutral for counts. Delta sign drives its color; pass `deltaDir` to override. Six of these form the top KPI row.
