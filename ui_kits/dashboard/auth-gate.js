/* Reezer dashboard — Google login gate (Supabase Auth).
   When NT_SUPABASE.requireAuth is true, the dashboard only renders for a signed-in
   Google account whose email is in NT_SUPABASE.allowedEmails. Otherwise it shows a
   sign-in screen (or an access-denied screen). Returns true => proceed to render. */
(function () {
  function injectStyle() {
    if (document.getElementById("nt-splash-style")) return;
    var s = document.createElement("style");
    s.id = "nt-splash-style";
    s.textContent =
      "@keyframes ntLogoIn{0%{transform:scale(1.75);opacity:0}14%{transform:scale(1.75);opacity:1}" +
      "64%{transform:scale(1.75);opacity:1}100%{transform:scale(1);opacity:1}}" +
      "@keyframes ntFadeIn{0%,66%{opacity:0;transform:translateY(7px)}100%{opacity:1;transform:translateY(0)}}" +
      ".nt-logo-anim{animation:ntLogoIn 2.2s cubic-bezier(.22,1,.36,1) both;will-change:transform,opacity}" +
      ".nt-fade-anim{animation:ntFadeIn 2.4s cubic-bezier(.22,1,.36,1) both}" +
      "@media(prefers-reduced-motion:reduce){.nt-logo-anim,.nt-fade-anim{animation:none!important;opacity:1!important;transform:none!important}}";
    document.head.appendChild(s);
  }
  function screen(inner, animate) {
    injectStyle();
    var r = document.getElementById("root");
    var lc = animate ? ' class="nt-logo-anim"' : "";
    var fc = animate ? ' class="nt-fade-anim"' : "";
    r.innerHTML =
      '<div style="height:100vh;display:grid;place-items:center;background:var(--bg-app);' +
      'color:var(--text-primary);font-family:var(--font-sans)">' +
      '<div style="text-align:center;max-width:340px;padding:32px">' +
      '<img' + lc + ' src="/assets/logo-mark.png" alt="Reezer" width="56" height="56" ' +
      'style="display:block;margin:0 auto 18px;border-radius:14px" />' +
      '<div' + fc + ">" + inner + "</div></div></div>";
  }
  function loginScreen() {
    screen(
      '<div style="font:600 22px/1.1 var(--font-sans);margin-bottom:6px">Reezer</div>' +
      '<div style="color:var(--text-tertiary);font-size:13px;margin-bottom:24px">Trader access</div>' +
      '<button id="nt-google" style="width:100%;padding:12px 16px;border-radius:9px;border:1px solid var(--line-2,rgba(255,255,255,0.12));' +
      'background:var(--ink-2,#151518);color:var(--text-primary);font:500 14px/1 var(--font-sans);cursor:pointer">' +
      'Sign in with Google</button>', true);
    document.getElementById("nt-google").onclick = function () {
      window.NT_CLIENT.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: location.origin + location.pathname,
          queryParams: { prompt: "select_account" },  // always show the account chooser
        },
      });
    };
  }
  function deniedScreen(email) {
    screen(
      '<div style="font:600 18px/1.2 var(--font-sans);margin-bottom:8px">Access denied</div>' +
      '<div style="color:var(--text-tertiary);font-size:13px;margin-bottom:20px">' + email +
      ' is not authorized for this dashboard.</div>' +
      '<button id="nt-out" style="padding:10px 16px;border-radius:9px;border:1px solid var(--line-2,rgba(255,255,255,0.12));' +
      'background:transparent;color:var(--text-secondary);font:500 13px/1 var(--font-sans);cursor:pointer">Sign out</button>');
    document.getElementById("nt-out").onclick = function () {
      window.NT_CLIENT.auth.signOut().then(function () { location.reload(); });
    };
  }

  window.NT_AUTH_GATE = async function () {
    var cfg = window.NT_SUPABASE || {};
    if (!cfg.requireAuth) return true;            // local / open mode
    if (!window.NT_CLIENT) { screen("auth unavailable"); return false; }
    var res = await window.NT_CLIENT.auth.getSession();
    var session = res.data.session;
    if (!session) {
      loginScreen();
      window.NT_CLIENT.auth.onAuthStateChange(function (_e, s) { if (s) location.reload(); });
      return false;
    }
    var email = ((session.user && session.user.email) || "").toLowerCase();
    var allow = (cfg.allowedEmails || []).map(function (x) { return x.toLowerCase(); });
    if (allow.length && allow.indexOf(email) < 0) { deniedScreen(email); return false; }
    var su = session.user || {};
    var meta = su.user_metadata || {};
    var first = meta.given_name ||
      (meta.full_name || meta.name || "").trim().split(/\s+/)[0] ||
      email.split("@")[0].split(/[._-]/)[0] || "";
    window.NT_USER_NAME = first ? first.charAt(0).toUpperCase() + first.slice(1) : "Trader";
    window.NT_USER_EMAIL = su.email || email;
    return true;
  };
})();
