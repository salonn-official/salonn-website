/* =========================================================
   Supabase connection (shared by index.html & privacy.html)
   ---------------------------------------------------------
   These two values are PUBLIC by design:
   - the project URL, and
   - the "anon" public key (read-only, protected by RLS).
   It is safe for them to live in the website / on GitHub.
   NEVER put the secret service_role or access (sbp_) token here.
   ========================================================= */
window.SB = {
  url: "https://wpxzxqalveofocafjnuy.supabase.co",
  anon: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndweHp4cWFsdmVvZm9jYWZqbnV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4OTA0NDIsImV4cCI6MjEwMzQ2NjQ0Mn0.9hkYSO1fGg6mzvpNDaQLZswEDqRcaeHLZ2-y_gDvmic"
};

/* Tiny GET helper against the Supabase REST (PostgREST) API. */
window.sbGet = async function (pathAndQuery) {
  const res = await fetch(`${window.SB.url}/rest/v1/${pathAndQuery}`, {
    headers: {
      apikey: window.SB.anon,
      Authorization: `Bearer ${window.SB.anon}`
    }
  });
  if (!res.ok) throw new Error("Supabase request failed: " + res.status);
  return res.json();
};
