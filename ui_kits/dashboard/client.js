/* Reezer dashboard — single shared Supabase client (used by auth + realtime). */
(function () {
  if (window.NT_CLIENT || !window.supabase || !window.NT_SUPABASE) return;
  window.NT_CLIENT = window.supabase.createClient(
    window.NT_SUPABASE.url, window.NT_SUPABASE.key);
})();
