/* =========================================================
   salonn landing page — dynamic behaviour
   - live stats from Supabase with a count-up animation
   - Play Store link pulled from Supabase (app_settings)
   - graceful fallback to static values if the DB is offline
   ========================================================= */

// Fallback link used instantly, before/if Supabase responds.
const FALLBACK_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.salonn.salonn";

function wireStoreLinks(url) {
  document.querySelectorAll("[data-store-link]").forEach((el) => {
    el.setAttribute("href", url);
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
  });
}
wireStoreLinks(FALLBACK_PLAY_URL);

// Footer year
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---------------- count-up animation ---------------- */
const REDUCE_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function formatNum(v, decimals) {
  return Number(v).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

function countUp(el, target, { prefix = "", suffix = "", decimals = 0 } = {}) {
  const render = (n) => (el.textContent = prefix + formatNum(n, decimals) + suffix);
  if (REDUCE_MOTION || !target) return render(target);

  const duration = 1600;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
    render(target * eased);
    if (p < 1) requestAnimationFrame(tick);
    else render(target);
  }
  requestAnimationFrame(tick);
}

/* ---------------- load live data ---------------- */
(async function init() {
  // Play Store link from Supabase
  try {
    const settings = await sbGet("app_settings?select=key,value");
    const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    if (map.play_store_url) wireStoreLinks(map.play_store_url);
  } catch (e) {
    console.warn("[salonn] settings load failed, using fallback link:", e);
  }

  // Stats from Supabase -> animated hero numbers
  try {
    const stats = await sbGet(
      "stats?select=key,label,value,prefix,suffix,decimals,display_order&order=display_order"
    );
    const ul = document.getElementById("heroStats");
    if (ul && Array.isArray(stats) && stats.length) {
      ul.innerHTML = "";
      stats.forEach((s) => {
        const li = document.createElement("li");
        const strong = document.createElement("strong");
        const span = document.createElement("span");
        strong.textContent = (s.prefix || "") + "0" + (s.suffix || "");
        span.textContent = s.label;
        li.append(strong, span);
        ul.append(li);
        countUp(strong, Number(s.value), {
          prefix: s.prefix || "",
          suffix: s.suffix || "",
          decimals: s.decimals || 0
        });
      });
    }
  } catch (e) {
    console.warn("[salonn] stats load failed, keeping static values:", e);
  }
})();
