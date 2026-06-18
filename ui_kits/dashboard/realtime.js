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
    ["alerts", "positions", "trade_events", "operator_flags"].forEach(function (t) {
      ch.on("postgres_changes", { event: "*", schema: "public", table: t }, function (payload) {
        var tbl = payload.table, ev = payload.eventType;
        // positions/alerts/operator_flags carry everything the UI needs -> patch in
        // place, instant, zero queries. trade_events only feeds the detail drawer ->
        // a light debounced refetch keeps that fresh without slowing the table.
        if ((tbl === "positions" || tbl === "alerts" || tbl === "operator_flags") && window.NT_APPLY) {
          window.NT_APPLY(tbl, ev, payload.new, payload.old);
        } else {
          debounced();
        }
      });
    });
    ch.subscribe(function (status) { console.log("[reezer realtime]", status); });
  };
})();
