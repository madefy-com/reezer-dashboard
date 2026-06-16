/* Reezer — on-brand confirm / alert dialogs (replace the browser's native popups).
   window.NT_CONFIRM(message, opts?) -> Promise<boolean>
   window.NT_ALERT(message, opts?)   -> Promise<void>
   opts: { title, ok, cancel, danger }  (cancel:null = single-button alert) */
(function () {
  var BTN = "height:34px;padding:0 16px;border-radius:var(--radius-sm);font:var(--w-semibold) var(--t-sm)/1 var(--font-sans);cursor:pointer;border:1px solid transparent;";
  var GHOST = BTN + "background:transparent;border-color:var(--border-strong);color:var(--text-secondary);";
  var PRIMARY = BTN + "background:var(--accent);color:#fff;";
  var DANGER = BTN + "background:var(--loss);color:#fff;";

  function dialog(o) {
    return new Promise(function (resolve) {
      var ov = document.createElement("div");
      ov.style.cssText = "position:fixed;inset:0;z-index:90;background:rgba(8,8,10,0.62);display:grid;place-items:center;padding:20px;animation:ntFadeIn var(--dur) var(--ease-out);";
      var box = document.createElement("div");
      box.style.cssText = "width:440px;max-width:92vw;background:var(--surface-card);border:1px solid var(--border-strong);border-radius:var(--radius-lg);box-shadow:var(--shadow-pop);padding:22px;display:flex;flex-direction:column;gap:12px;";
      var h = document.createElement("div");
      h.textContent = o.title;
      h.style.cssText = "font:var(--w-semibold) var(--t-h3)/1.2 var(--font-sans);letter-spacing:var(--ls-snug);color:" + (o.danger ? "var(--loss)" : "var(--text-primary)") + ";";
      var m = document.createElement("div");
      m.textContent = o.message;
      m.style.cssText = "font:var(--w-regular) var(--t-sm)/1.55 var(--font-sans);color:var(--text-secondary);white-space:pre-line;";
      var row = document.createElement("div");
      row.style.cssText = "display:flex;justify-content:flex-end;gap:8px;margin-top:6px;";

      function done(val) {
        document.removeEventListener("keydown", onKey);
        if (ov.parentNode) ov.parentNode.removeChild(ov);
        resolve(val);
      }
      function onKey(e) {
        if (e.key === "Escape" && o.cancel) done(false);
        else if (e.key === "Enter") done(true);
      }

      if (o.cancel) {
        var cb = document.createElement("button");
        cb.textContent = o.cancel; cb.style.cssText = GHOST;
        cb.onclick = function () { done(false); };
        row.appendChild(cb);
      }
      var ob = document.createElement("button");
      ob.textContent = o.ok; ob.style.cssText = o.danger ? DANGER : PRIMARY;
      ob.onclick = function () { done(true); };
      row.appendChild(ob);

      ov.onclick = function (e) { if (e.target === ov && o.cancel) done(false); };
      box.appendChild(h); box.appendChild(m); box.appendChild(row);
      ov.appendChild(box); document.body.appendChild(ov);
      document.addEventListener("keydown", onKey);
      setTimeout(function () { ob.focus(); }, 0);
    });
  }

  window.NT_CONFIRM = function (message, opts) {
    return dialog(Object.assign({ title: "Please confirm", ok: "Confirm", cancel: "Cancel", danger: false, message: message }, opts || {}));
  };
  window.NT_ALERT = function (message, opts) {
    return dialog(Object.assign({ title: "Heads up", ok: "OK", cancel: null, danger: false, message: message }, opts || {}));
  };
})();
