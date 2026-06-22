/* Reezer dashboard — LIVE updates via Supabase Realtime (websocket push).
   Subscribes to inserts/updates on the nitro tables; the moment the bot writes
   a trade or alert, Supabase pushes it here, we rebuild NT_DATA and fire an
   "nt-data" event that re-renders the dashboard. No polling. */
(function () {
  var client = null, timer = null;

  function refresh() {
    if (!window.NT_LIVE) return;
    window.NT_LIVE().then(function (live) {
      if (live) {
        window.NT_DATA = live;
        window.dispatchEvent(new Event("nt-data"));  // App listens, re-renders
      }
    });
  }
  function debounced() { clearTimeout(timer); timer = setTimeout(refresh, 120); }

  window.NT_REALTIME_START = function () {
    if (!window.NT_CLIENT || client) return;
    client = window.NT_CLIENT;  // shared client (also used by auth)
    var ch = client.channel("reezer-live");
    ["alerts", "positions", "trade_events", "operator_flags", "strategies", "sources", "machines"].forEach(function (t) {
      ch.on("postgres_changes", { event: "*", schema: "public", table: t }, function (payload) {
        var tbl = payload.table, ev = payload.eventType;
        // positions/alerts/operator_flags/strategies/sources carry everything the UI
        // needs -> patch in place, instant, zero queries. trade_events only feeds the
        // detail drawer -> a light debounced refetch keeps that fresh.
        if ((tbl === "positions" || tbl === "alerts" || tbl === "operator_flags"
             || tbl === "strategies" || tbl === "sources") && window.NT_APPLY) {
          window.NT_APPLY(tbl, ev, payload.new, payload.old);
        } else {
          debounced();
        }
      });
    });
    ch.subscribe(function (status) { console.log("[reezer realtime]", status); });

    // Safety-net poll: the websocket push can be silently blocked (RLS, proxy,
    // dropped socket). Refetch every 10s while the tab is visible so the dashboard
    // stays live without a manual refresh. (Realtime above still gives instant
    // updates when the socket is healthy; this just guarantees freshness.)
    setInterval(function () { if (!document.hidden) refresh(); }, 10000);
    document.addEventListener("visibilitychange", function () { if (!document.hidden) refresh(); });
  };
})();
