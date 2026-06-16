/* Reezer dashboard — Google login gate (Supabase Auth).
   When NT_SUPABASE.requireAuth is true, the dashboard only renders for a signed-in
   Google account whose email is in NT_SUPABASE.allowedEmails. Otherwise it shows a
   sign-in screen (or an access-denied screen). Returns true => proceed to render. */
(function () {
  function screen(inner) {
    var r = document.getElementById("root");
    r.innerHTML =
      '<div style="height:100vh;display:grid;place-items:center;background:var(--bg-app);' +
      'color:var(--text-primary);font-family:var(--font-sans)">' +
      '<div style="text-align:center;max-width:340px;padding:32px">' +
      '<img src="../../assets/logo-mark.png" alt="Reezer" width="56" height="56" ' +
      'style="display:block;margin:0 auto 18px;border-radius:14px" />' +
      inner + "</div></div>";
  }
  function loginScreen() {
    screen(
      '<div style="font:600 22px/1.1 var(--font-sans);margin-bottom:6px">Reezer</div>' +
      '<div style="color:var(--text-tertiary);font-size:13px;margin-bottom:24px">Trader access</div>' +
      '<button id="nt-google" style="width:100%;padding:12px 16px;border-radius:9px;border:1px solid var(--line-2,rgba(255,255,255,0.12));' +
      'background:var(--ink-2,#151518);color:var(--text-primary);font:500 14px/1 var(--font-sans);cursor:pointer">' +
      'Sign in with Google</button>');
    document.getElementById("nt-google").onclick = function () {
      window.NT_CLIENT.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: location.origin + location.pathname },
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
    return true;
  };
})();
