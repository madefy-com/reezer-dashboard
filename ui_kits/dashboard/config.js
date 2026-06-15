/* Reezer dashboard — Supabase connection (read-only anon key).
   Gitignored. The anon key + RLS policies allow read of the nitro tables. */
window.NT_SUPABASE = {
  url: "https://agvnbohngjwxsvbfkqzb.supabase.co",
  key: "sb_publishable_2KzoBk-YckYP-npoxRlM7A_15vRO6oL",
  // Gate on Google sign-in everywhere (incl. localhost) — only the allow-listed
  // emails can see the data. Set false only for throwaway local UI tinkering.
  requireAuth: true,
  allowedEmails: ["giannivandort@gmail.com", "dderese@gmail.com"],
};
