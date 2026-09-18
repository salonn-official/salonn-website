/* ============================================================================
 * Salonn website — a mobile app-style interface on the SAME Supabase backend.
 * anon key is public by design; RLS protects data (anon reads only approved/
 * bookable salons + their reels/services/images).
 * ==========================================================================*/
const SUPABASE_URL = "https://wwvzcksmngklpqicasrn.supabase.co";
const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3dnpja3NtbmdrbHBxaWNhc3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5ODUyOTYsImV4cCI6MjA5NzU2MTI5Nn0.Sy9qn6qwqEo8tFdXExPh7WbeO2JmhbgLgAlTTKGsaYo";
const PLAY_URL = "https://play.google.com/store/apps/details?id=com.salonn.salonn";
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

// Did we just land back here from a Google OAuth redirect? Capture this BEFORE
// supabase-js processes and strips the tokens from the URL.
const OAUTH_RETURN = /[?&#](code|access_token|error|error_description)=/.test(location.href);
function cleanUrl() { try { history.replaceState(null, "", location.pathname); } catch (_) {} }
const DEFAULT_TITLE = document.title;

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Proper brand logos (inline SVG, tint via currentColor).
const SOCIAL_SVG = {
  instagram: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c2.7 0 3 0 4.1.1 1 .1 1.6.2 2 .4.5.2.9.4 1.3.8.4.4.6.8.8 1.3.2.4.3 1 .4 2 .1 1.1.1 1.4.1 4.1s0 3-.1 4.1c-.1 1-.2 1.6-.4 2a3.5 3.5 0 0 1-.8 1.3c-.4.4-.8.6-1.3.8-.4.2-1 .3-2 .4-1.1.1-1.4.1-4.1.1s-3 0-4.1-.1c-1-.1-1.6-.2-2-.4a3.5 3.5 0 0 1-1.3-.8 3.5 3.5 0 0 1-.8-1.3c-.2-.4-.3-1-.4-2C2 15 2 14.7 2 12s0-3 .1-4.1c.1-1 .2-1.6.4-2 .2-.5.4-.9.8-1.3.4-.4.8-.6 1.3-.8.4-.2 1-.3 2-.4C7.7 2 8 2 12 2Zm0 1.8c-2.7 0-3 0-4 .1-.8 0-1.2.2-1.5.3-.4.1-.6.3-.9.6-.3.3-.5.5-.6.9-.1.3-.3.7-.3 1.5-.1 1-.1 1.3-.1 4s0 3 .1 4c0 .8.2 1.2.3 1.5.1.4.3.6.6.9.3.3.5.5.9.6.3.1.7.3 1.5.3 1 .1 1.3.1 4 .1s3 0 4-.1c.8 0 1.2-.2 1.5-.3.4-.1.6-.3.9-.6.3-.3.5-.5.6-.9.1-.3.3-.7.3-1.5.1-1 .1-1.3.1-4s0-3-.1-4c0-.8-.2-1.2-.3-1.5a2.4 2.4 0 0 0-.6-.9 2.4 2.4 0 0 0-.9-.6c-.3-.1-.7-.3-1.5-.3-1-.1-1.3-.1-4-.1Zm0 3.1a5.1 5.1 0 1 1 0 10.2 5.1 5.1 0 0 1 0-10.2Zm0 1.8a3.3 3.3 0 1 0 0 6.6 3.3 3.3 0 0 0 0-6.6Zm5.3-3.1a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z"/></svg>`,
  facebook: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.7-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12Z"/></svg>`,
  x: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.9 2H22l-7.1 8.1L23.2 22h-6.4l-5-6.5L6 22H2.8l7.6-8.7L1.2 2h6.6l4.5 6 5.2-6Zm-1.1 18h1.8L7.3 3.9H5.4L17.8 20Z"/></svg>`,
  youtube: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23 12s0-3.2-.4-4.7a2.5 2.5 0 0 0-1.8-1.8C19.3 5.1 12 5.1 12 5.1s-7.3 0-8.8.4A2.5 2.5 0 0 0 1.4 7.3C1 8.8 1 12 1 12s0 3.2.4 4.7c.2.9.9 1.6 1.8 1.8 1.5.4 8.8.4 8.8.4s7.3 0 8.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.5.4-4.7.4-4.7Zm-13.2 3V9l5.2 3-5.2 3Z"/></svg>`,
};
let session = null, userPos = null, allSalons = [], reelsLoaded = false;
let activeCat = "All", selectedServices = [], userArea = null, salonCats = {}, userGeo = null;

// Category chip → the words that identify it in a salon's service list.
// (DB categories are Hair/Skin/… so we match by keyword, not exact label.)
const CAT_TOKENS = {
  Haircut: ["hair"],
  Beard: ["beard", "shave", "saving", "trim"],
  Facial: ["skin", "facial", "face", "clean"],
  Colour: ["colour", "color", "dye", "highlight"],
  Spa: ["spa", "massage", "massaga"],
};

/* ── Toast ── */
let toastT;
function toast(msg) {
  const t = $("toast"); t.textContent = msg; t.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => (t.hidden = true), 2600);
}

/* ── Tab router ── */
const screens = { home: "screen-home", explore: "screen-explore", bookings: "screen-bookings", profile: "screen-profile" };
const TAB_PATH = { home: "/home", explore: "/explore", bookings: "/bookings", profile: "/profile" };
function show(tab) {
  for (const k in screens) $(screens[k]).hidden = k !== tab;
  if (!$("screen-detail").hidden) document.title = DEFAULT_TITLE; // leaving a salon
  $("screen-detail").hidden = true;
  document.querySelectorAll(".tab").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
  // Reflect the section in the address bar (real, crawlable URLs for SEO).
  try { history.replaceState(null, "", TAB_PATH[tab] || "/"); } catch (_) {}
  if (tab === "explore" && !reelsLoaded) loadReels();
  if (tab === "bookings") renderBookings();
  if (tab === "profile") renderProfile();
}
document.querySelectorAll(".tab, .tb-brand").forEach((b) => b.addEventListener("click", (e) => {
  if (b.dataset.tab) { e.preventDefault(); show(b.dataset.tab); }
}));

/* ── Splash: play the intro, then reveal the app ── */
setTimeout(() => { const sp = $("splash"); if (sp) sp.classList.add("hide"); }, 2600);

/* ── Location + salons ── */
$("locBtn").addEventListener("click", askLocation);

function askLocation() {
  if (!navigator.geolocation) { loadSalons(); return; }
  $("locLabel").textContent = "Locating…";
  navigator.geolocation.getCurrentPosition(
    (p) => {
      userPos = { lat: p.coords.latitude, lng: p.coords.longitude };
      loadSalons();
      reverseGeocode(userPos.lat, userPos.lng);
    },
    () => { $("locLabel").textContent = "Enable location"; loadSalons(); toast("Location blocked — showing top salons."); },
    { enableHighAccuracy: true, timeout: 8000 }
  );
}
// Turn coordinates into an area name (like the app), no API key needed.
// The resolved locality (e.g. "Hirakud") drives which salons are shown, and the
// full breakdown (area/city/district/state/country/pincode) is saved at sign-up.
async function reverseGeocode(lat, lng) {
  try {
    const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
    const j = await r.json();
    const admins = (j.localityInfo && j.localityInfo.administrative) || [];
    const distEntry = admins.find((a) => /district/i.test(a.description || "") || /district/i.test(a.name || ""));
    const pin = String(j.postcode || "").match(/\d{4,6}/);
    userArea = j.locality || j.city || j.principalSubdivision || null;
    userGeo = {
      area: j.locality || j.city || null,
      city: j.city || j.locality || null,
      district: distEntry ? distEntry.name.replace(/\s+district$/i, "") : null,
      state: j.principalSubdivision || null,
      country: j.countryName || null,
      pincode: pin ? pin[0] : null,
      latitude: lat, longitude: lng,
    };
    $("locLabel").textContent = userArea || "Near you";
  } catch { $("locLabel").textContent = "Near you"; }
  renderSalons(); // re-filter to the customer's area now that it's known
}
// Salon belongs to the customer's area — same rule as the app, which treats the
// salon's `city` (falling back to address/area) as its area name. Substring
// match both ways; never hide a salon whose location isn't set.
function salonInArea(s) {
  if (!userArea) return true;                 // area unknown → show all (app parity)
  const sa = (s.city || s.area || s.address || "").trim().toLowerCase();
  if (!sa) return true;                       // salon has no location → don't hide it
  const a = userArea.trim().toLowerCase();
  if (!a) return true;
  return sa === a || sa.includes(a) || a.includes(sa);
}
function distanceKm(a, b, c, d) {
  const R = 6371, r = (x) => (x * Math.PI) / 180, dLat = r(c - a), dLng = r(d - b);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}
async function loadSalons() {
  $("salonList").innerHTML = `<div class="empty">Loading salons…</div>`;
  // Salons + their service categories + popularity signal, in parallel.
  const [salonsRes, svcRes, actRes] = await Promise.all([
    sb.from("salons").select("id,name,area,city,rating,image_url,latitude,longitude,address").eq("status", "approved"),
    sb.from("services").select("salon_id,category,name").eq("active", true),
    sb.rpc("salon_activity"),
  ]);
  const data = salonsRes.data;
  if (salonsRes.error || !data) { $("salonList").innerHTML = `<div class="empty">Couldn't load salons.</div>`; return; }

  // Map salon → its service keywords (for category filter + search).
  salonCats = {};
  for (const v of (svcRes.data || [])) {
    (salonCats[v.salon_id] ||= []).push(`${v.category || ""} ${v.name || ""}`.toLowerCase());
  }
  // Map salon → activity score: bookings + reviews + likes (more = higher).
  const score = {};
  for (const a of (actRes.data || [])) {
    score[a.salon_id] = (a.bookings || 0) * 3 + (a.reviews || 0) * 2 + (a.likes || 0);
  }

  allSalons = data.map((s) => ({
    ...s,
    dist: userPos && s.latitude && s.longitude ? distanceKm(userPos.lat, userPos.lng, s.latitude, s.longitude) : null,
    activity: score[s.id] || 0,
  }));
  // Most-active salon first (booking/likes/reviews), then rating, then distance.
  allSalons.sort((a, b) =>
    (b.activity - a.activity) ||
    ((b.rating || 0) - (a.rating || 0)) ||
    ((a.dist ?? 9e9) - (b.dist ?? 9e9)));
  renderSalons();
}
// True when a salon offers the selected category (keyword match on its services).
function salonHasCat(s, cat) {
  if (cat === "All") return true;
  const toks = CAT_TOKENS[cat] || [cat.toLowerCase()];
  const svcs = salonCats[s.id] || [];
  return svcs.some((hay) => toks.some((t) => hay.includes(t)));
}
function salonCard(s) {
  const area = esc([s.area, s.city].filter(Boolean).join(", ") || "Nearby");
  const img = s.image_url ? `<img class="scard-img" src="${esc(s.image_url)}" loading="lazy" onerror="this.remove()">` : `<div class="scard-img"></div>`;
  const div = document.createElement("div");
  div.className = "scard";
  div.innerHTML = `${img}<div class="scard-b"><div class="scard-t">${esc(s.name || "Salon")}</div>
    <div class="scard-m"><span class="rate">★ ${(s.rating || 0)}</span><span>${area}</span>
    <span class="dist">${s.dist != null ? s.dist.toFixed(1) + " km" : ""}</span></div></div>`;
  div.addEventListener("click", () => openSalon(s));
  return div;
}
function renderSalons() {
  const q = $("searchInput").value.trim().toLowerCase();
  const filtering = q || activeCat !== "All";
  // Base: search (name/area/city + service names) + category (by service)
  const base = allSalons.filter((s) => {
    const hay = `${s.name} ${s.area} ${s.city}`.toLowerCase();
    const matchesSearch = !q || hay.includes(q) || (salonCats[s.id] || []).some((x) => x.includes(q));
    return matchesSearch && salonHasCat(s, activeCat);
  });
  // Only salons that serve the customer's fetched area.
  let list = base.filter(salonInArea);
  const feat = $("featured"), el = $("salonList");

  // Area known, salons exist elsewhere, but none here → "We're expanding" page.
  if (!filtering && userArea && allSalons.length && !list.length) {
    feat.innerHTML = ""; $("count").textContent = "";
    el.innerHTML = expandingState(userArea);
    const again = $("expCheck"); if (again) again.addEventListener("click", askLocation);
    return;
  }

  $("count").textContent = list.length ? `${list.length} found` : "";
  if (!list.length) { feat.innerHTML = ""; el.innerHTML = `<div class="empty">No salons match. Try another search.</div>`; return; }

  // App-style: one FEATURED salon on top, the rest listed below.
  let rest = list;
  if (!filtering) {
    const f = list[0];
    rest = list.slice(1);
    const area = esc([f.area, f.city].filter(Boolean).join(", ") || "Nearby");
    const fimg = f.image_url ? `<img src="${esc(f.image_url)}" onerror="this.style.display='none'">` : "";
    feat.innerHTML = `<div class="fcard">${fimg}<div class="fov"></div><div class="ftag">★ FEATURED</div>
      <div class="fbody"><div class="fname">${esc(f.name || "Salon")}</div>
      <div class="fmeta"><span class="rate">★ ${f.rating || 0}</span><span>${area}</span>
      <span class="dist">${f.dist != null ? f.dist.toFixed(1) + " km" : ""}</span></div></div></div>`;
    feat.querySelector(".fcard").addEventListener("click", () => openSalon(f));
  } else {
    feat.innerHTML = "";
  }

  el.innerHTML = "";
  for (const s of rest) el.appendChild(salonCard(s));
}
// Shown when we know the customer's area but no salon serves it yet (app parity).
function expandingState(area) {
  return `<div class="expanding">
    <div class="exp-ico"><svg viewBox="0 0 24 24" width="46" height="46" fill="currentColor"><path d="M13.5 2.6c2.6 1 4.6 3 5.6 5.6.8 2.2.7 4.2.2 6-.3 1-.8 2-1.5 3l1.4 3.3-3.2-1a9 9 0 0 1-3 1.2 9.4 9.4 0 0 1-2.7-.1L7 22.1l-.5-3.3a9 9 0 0 1-2.3-2.2C2.3 13.9 2 10.5 3.4 7.6a9.4 9.4 0 0 1 10.1-5ZM12 7a2.4 2.4 0 1 0 0 4.8A2.4 2.4 0 0 0 12 7Z"/></svg></div>
    <h3 class="exp-title">We're expanding!</h3>
    <p class="exp-sub">Salonn isn't in <b>${esc(area)}</b> yet. We're growing fast and will reach your area very soon.</p>
    <button class="exp-btn" id="expCheck">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 5V2L8 6l4 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7Z"/></svg>
      Check again
    </button>
  </div>`;
}
$("searchInput").addEventListener("input", renderSalons);

/* categories */
const CATS = ["All", "Haircut", "Beard", "Facial", "Colour", "Spa"];
$("cats").innerHTML = CATS.map((c, i) => `<button class="chip ${i === 0 ? "active" : ""}" data-cat="${c}">${c}</button>`).join("");
$("cats").querySelectorAll(".chip").forEach((b) => b.addEventListener("click", () => {
  activeCat = b.dataset.cat;
  $("cats").querySelectorAll(".chip").forEach((x) => x.classList.toggle("active", x === b));
  renderSalons();
}));

/* ── Explore / reels ── */
let allReels = [];
async function loadReels() {
  const g = $("reelGrid");
  const { data, error } = await sb.from("reels")
    .select("id,salon_id,media_type,image_urls,video_url,caption,like_count,views,salon:salons(name,image_url,status,area,city,rating,latitude,longitude,address)")
    .order("created_at", { ascending: false }).limit(60);
  if (error || !data) { g.innerHTML = `<div class="empty">Couldn't load reels.</div>`; return; }
  allReels = data.filter((r) => r.salon && r.salon.status === "approved");
  reelsLoaded = true;
  renderReelGrid();
}
// One square thumbnail in the Explore grid.
function reelThumb(r) {
  const thumb = (r.image_urls && r.image_urls[0]) || r.salon?.image_url;
  const isPost = (r.media_type || "").toLowerCase() !== "video";
  const badge = isPost ? ((r.image_urls || []).length > 1 ? "▦" : "▣") : "▶";
  const div = document.createElement("div");
  div.className = "reel";
  div.innerHTML = `${thumb ? `<img src="${esc(thumb)}" loading="lazy">` : ""}<div class="ov"></div>
    <div class="badge">${badge}</div>
    <div class="cap">❤ ${r.like_count || 0} · ${esc(r.salon?.name || "")}</div>`;
  div.addEventListener("click", () => openReel(r));
  return div;
}
// Explore grid — when searching we also surface matching SALONS (openable), so
// a salon with no post can still be found; otherwise it's the posts grid.
function renderReelGrid() {
  const g = $("reelGrid");
  const q = ($("reelSearch")?.value || "").trim().toLowerCase();
  if (!q) {
    g.className = "reel-grid";
    if (!allReels.length) { g.innerHTML = `<div class="empty">No reels yet.</div>`; return; }
    g.innerHTML = ""; for (const r of allReels) g.appendChild(reelThumb(r));
    return;
  }
  const salons = allSalons.filter((s) => `${s.name} ${s.area} ${s.city}`.toLowerCase().includes(q));
  const reels = allReels.filter((r) => (r.salon?.name || "").toLowerCase().includes(q) || (r.caption || "").toLowerCase().includes(q));
  g.className = "ex-results";
  if (!salons.length && !reels.length) { g.innerHTML = `<div class="empty">No salons match “${esc(q)}”.</div>`; return; }
  g.innerHTML = "";
  if (salons.length) {
    const sec = document.createElement("div"); sec.className = "ex-sec";
    sec.innerHTML = `<div class="ex-h">Salons</div>`;
    const list = document.createElement("div"); list.className = "list";
    for (const s of salons) list.appendChild(salonCard(s));
    sec.appendChild(list); g.appendChild(sec);
  }
  if (reels.length) {
    const sec = document.createElement("div"); sec.className = "ex-sec";
    sec.innerHTML = `<div class="ex-h">Posts</div>`;
    const grid = document.createElement("div"); grid.className = "reel-grid";
    for (const r of reels) grid.appendChild(reelThumb(r));
    sec.appendChild(grid); g.appendChild(sec);
  }
}
$("reelSearch").addEventListener("input", renderReelGrid);

/* ── Reel viewer: vertical scroll feed with like / comment / share ── */
const heartSvg = (f) => f
  ? `<svg viewBox="0 0 24 24" width="27" height="27" fill="#ff3b5c"><path d="M12 21s-7.5-4.6-10-9.3C.4 8.6 1.7 5 5 5c2 0 3.2 1.1 4 2.3C9.8 6.1 11 5 13 5c3.3 0 4.6 3.6 3 6.7C19.5 16.4 12 21 12 21Z"/></svg>`
  : `<svg viewBox="0 0 24 24" width="27" height="27" fill="none" stroke="#fff" stroke-width="2"><path d="M12 20.3S3 15.5 3 9.3C3 6.4 5.2 5 7 5c1.8 0 3.2 1 5 3 1.8-2 3.2-3 5-3 1.8 0 4 1.4 4 4.3 0 6.2-9 11-9 11Z"/></svg>`;
const commentSvg = () => `<svg viewBox="0 0 24 24" width="25" height="25" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"><path d="M21 11.5A7.5 7.5 0 0 1 6 15l-3 1 1-3a7.5 7.5 0 1 1 17-1.5Z"/></svg>`;
const shareSvgW = () => `<svg viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M18 16.1a3 3 0 0 0-2.3 1.1l-6-3.5a3 3 0 0 0 0-1.4l6-3.5A3 3 0 1 0 15 6c0 .2 0 .4.1.6L9 10.2a3 3 0 1 0 0 3.6l6.1 3.6c0 .2-.1.4-.1.6a3 3 0 1 0 3-2.5Z"/></svg>`;

let reelIO = null, likedReels = new Set();
async function openReel(startReel) {
  const feed = $("rvFeed");
  feed.innerHTML = "";
  const list = allReels.length ? allReels : [startReel];
  const startIdx = Math.max(0, list.findIndex((x) => x.id === startReel.id));
  likedReels = new Set();
  if (session) {
    try {
      const { data } = await sb.from("reel_likes").select("reel_id").eq("user_id", session.user.id).in("reel_id", list.map((x) => x.id));
      (data || []).forEach((x) => likedReels.add(x.reel_id));
    } catch (_) {}
  }
  for (const r of list) feed.appendChild(buildReelSlide(r));
  $("reelViewer").hidden = false;
  requestAnimationFrame(() => {
    const slide = feed.children[startIdx];
    if (slide) feed.scrollTop = slide.offsetTop;
    observeReelVideos(feed);
  });
}
// One full-screen post: brand top bar, media, right-side actions, info.
function buildReelSlide(r) {
  const imgs = (r.image_urls && r.image_urls.length) ? r.image_urls : (r.salon?.image_url ? [r.salon.image_url] : []);
  const isVideo = (r.media_type || "").toLowerCase() === "video" && r.video_url;
  const slide = document.createElement("div"); slide.className = "rv-slide";

  const top = document.createElement("div"); top.className = "rv-topbar";
  top.innerHTML = `<img class="rv-logo" src="/favicon-192.png?v=3" alt="Salonn" width="30" height="30"><div class="rv-brand"><b>Salonn</b><small>Hairstyle &amp; Grooming</small></div>`;

  const media = document.createElement("div"); media.className = "rv-media";
  const dots = document.createElement("div"); dots.className = "rv-dots";
  let i = 0;
  function paint() {
    if (isVideo) {
      media.innerHTML = `<video src="${esc(r.video_url)}" loop muted playsinline></video>`;
      dots.innerHTML = "";
    } else {
      media.innerHTML = `<img src="${esc(imgs[i] || "")}">
        ${imgs.length > 1 ? `<button class="rv-arrow l" aria-label="Previous"></button><button class="rv-arrow r" aria-label="Next"></button>` : ""}`;
      dots.innerHTML = imgs.map((_, k) => `<i class="${k === i ? "on" : ""}"></i>`).join("");
      const l = media.querySelector(".rv-arrow.l"), rr = media.querySelector(".rv-arrow.r");
      if (l) l.onclick = (e) => { e.stopPropagation(); i = (i - 1 + imgs.length) % imgs.length; paint(); };
      if (rr) rr.onclick = (e) => { e.stopPropagation(); i = (i + 1) % imgs.length; paint(); };
    }
  }
  paint();
  let sx = 0, sy = 0;
  media.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  media.addEventListener("touchend", (e) => {
    if (isVideo || imgs.length < 2) return;
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      i = dx < 0 ? (i + 1) % imgs.length : (i - 1 + imgs.length) % imgs.length; paint();
    }
  }, { passive: true });

  const liked = likedReels.has(r.id);
  const actions = document.createElement("div"); actions.className = "rv-actions"; actions.dataset.reel = r.id;
  actions.innerHTML = `
    <button class="rv-act like${liked ? " on" : ""}" data-act="like">${heartSvg(liked)}<span class="rv-c" data-c="like">${r.like_count || 0}</span></button>
    <button class="rv-act" data-act="comment">${commentSvg()}<span class="rv-c" data-c="comment">${r.comment_count || 0}</span></button>
    <button class="rv-act" data-act="share">${shareSvgW()}<span class="rv-c">Share</span></button>`;
  actions.querySelector('[data-act="like"]').onclick = () => toggleLike(r);
  actions.querySelector('[data-act="comment"]').onclick = () => openComments(r);
  actions.querySelector('[data-act="share"]').onclick = () => shareReel(r);

  const info = document.createElement("div"); info.className = "rv-info";
  info.innerHTML = `
    <div class="rv-salon">${esc(r.salon?.name || "Salon")}<button class="bk">Book</button></div>
    ${r.caption ? `<div class="rv-cap">${esc(r.caption)}</div>` : ""}
    <div class="rv-likes">${r.views || 0} views</div>`;
  info.querySelector(".bk").onclick = () => { closeReel(); if (r.salon) openSalon({ id: r.salon_id, ...r.salon }); };

  slide.append(top, media, dots, actions, info);
  return slide;
}

// Like requires login. Optimistic toggle; reel_likes triggers keep like_count.
async function toggleLike(r) {
  if (!session) { gateReelLogin(r); return; }
  const nowLiked = !likedReels.has(r.id);
  if (nowLiked) { likedReels.add(r.id); r.like_count = (r.like_count || 0) + 1; }
  else { likedReels.delete(r.id); r.like_count = Math.max(0, (r.like_count || 0) - 1); }
  const btn = document.querySelector(`.rv-actions[data-reel="${r.id}"] [data-act="like"]`);
  if (btn) { btn.classList.toggle("on", nowLiked); btn.innerHTML = heartSvg(nowLiked) + `<span class="rv-c" data-c="like">${r.like_count}</span>`; btn.onclick = () => toggleLike(r); }
  try {
    if (nowLiked) await sb.from("reel_likes").insert({ reel_id: r.id, user_id: session.user.id });
    else await sb.from("reel_likes").delete().eq("reel_id", r.id).eq("user_id", session.user.id);
  } catch (_) {}
}

// Stash which post to reopen after a Google login (page reloads on OAuth).
function gateReelLogin(r) {
  try { localStorage.setItem("salonn_pending_reel", r.id); } catch (_) {}
  closeReel();
  openAuth("reel");
}
async function openReelById(id) {
  show("explore");
  if (!allReels.length) await loadReels();
  const r = allReels.find((x) => x.id === id);
  if (r) openReel(r);
}

/* Comments panel (slides up inside the reel viewer). */
async function openComments(r) {
  $("rvcList").innerHTML = `<div class="empty">Loading…</div>`;
  $("rvComments").hidden = false;
  renderCommentFoot(r);
  const { data } = await sb.from("reel_comments").select("user_name,body,created_at")
    .eq("reel_id", r.id).order("created_at", { ascending: true }).limit(200);
  const rows = data || [];
  $("rvcList").innerHTML = rows.length ? rows.map((c) => `
    <div class="rvc-item"><div class="rvc-av">${esc((c.user_name || "U").trim()[0] || "U").toUpperCase()}</div>
      <div class="rvc-body"><b>${esc(c.user_name || "Someone")}</b><p>${esc(c.body || "")}</p></div></div>`).join("")
    : `<div class="empty">No comments yet — be the first!</div>`;
  $("rvcList").scrollTop = $("rvcList").scrollHeight;
}
function renderCommentFoot(r) {
  const f = $("rvcFoot");
  if (!session) {
    f.innerHTML = `<button class="btn google-btn block" id="rvcLogin">${GOOGLE_G_SVG}<span>Log in to comment</span></button>`;
    $("rvcLogin").onclick = () => { closeComments(); gateReelLogin(r); };
  } else {
    f.innerHTML = `<form id="rvcForm"><input id="rvcInput" placeholder="Add a comment…" maxlength="300" autocomplete="off"><button class="rvc-send" id="rvcSend" type="submit">Post</button></form>`;
    $("rvcForm").onsubmit = async (e) => { e.preventDefault(); await postComment(r); };
  }
}
async function postComment(r) {
  const inp = $("rvcInput"); const body = inp.value.trim(); if (!body) return;
  inp.disabled = true;
  const name = session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "You";
  try {
    await sb.from("reel_comments").insert({ reel_id: r.id, user_id: session.user.id, user_name: name, body });
    r.comment_count = (r.comment_count || 0) + 1;
    const cEl = document.querySelector(`.rv-actions[data-reel="${r.id}"] [data-c="comment"]`);
    if (cEl) cEl.textContent = r.comment_count;
    await openComments(r); // reload list
  } catch (_) {}
}
function closeComments() { $("rvComments").hidden = true; }
$("rvcClose").addEventListener("click", closeComments);
$("rvComments").addEventListener("click", (e) => { if (e.target.id === "rvComments") closeComments(); });

// Share the post: the photo AND the salon link (native share sheet), or copy.
async function shareReel(r) {
  const url = r.salon_id ? salonLink({ id: r.salon_id, name: r.salon?.name || "salon" }) : location.origin;
  const text = `Check out ${r.salon?.name || "this salon"} on Salonn: ${url}`;
  const imgUrl = (r.image_urls && r.image_urls[0]) || r.salon?.image_url;
  if (imgUrl && navigator.canShare) {
    try {
      const blob = await (await fetch(imgUrl)).blob();
      const file = new File([blob], "salonn.jpg", { type: blob.type || "image/jpeg" });
      if (navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: "Salonn", text, url }); return; }
    } catch (_) {}
  }
  if (navigator.share) { try { await navigator.share({ title: "Salonn", text, url }); return; } catch (_) {} }
  try { await navigator.clipboard.writeText(url); toast("Link copied — share it anywhere!"); } catch (_) { window.prompt("Copy this link:", url); }
}
// Play only the post that's on screen; pause the others.
function observeReelVideos(feed) {
  if (reelIO) reelIO.disconnect();
  reelIO = new IntersectionObserver((entries) => {
    for (const en of entries) {
      const v = en.target.querySelector("video"); if (!v) continue;
      if (en.isIntersecting && en.intersectionRatio > 0.6) v.play().catch(() => {});
      else v.pause();
    }
  }, { root: feed, threshold: [0, 0.6, 1] });
  feed.querySelectorAll(".rv-slide").forEach((s) => reelIO.observe(s));
}
function closeReel() {
  if (reelIO) { reelIO.disconnect(); reelIO = null; }
  closeComments();
  $("rvFeed").innerHTML = ""; $("reelViewer").hidden = true;
}
$("rvClose").addEventListener("click", closeReel);

/* ── Trending looks ──────────────────────────────────────────────────────── */
let allTrending = [];
async function loadTrending() {
  const { data } = await sb.from("trending_items")
    .select("id,media_type,media_urls,video_url,rating_sum,rating_count,category:trending_categories(name,sort_order)")
    .eq("active", true);
  allTrending = (data || []).sort((a, b) => (a.category?.sort_order || 0) - (b.category?.sort_order || 0));
  renderTrending();
}
const trendAvg = (t) => (t.rating_count > 0 ? t.rating_sum / t.rating_count : 5);
function trendThumb(t) {
  const url = (t.media_urls && t.media_urls[0]) || "";
  if (url) return `<img src="${esc(url)}" loading="lazy">`;
  if (t.video_url) return `<video src="${esc(t.video_url)}" muted playsinline></video>`;
  return "";
}
// Stars reflect the ACTUAL customer average (0 filled when no one has rated).
function starIcons(t) {
  const n = t.rating_count > 0 ? Math.round(t.rating_sum / t.rating_count) : 0;
  let s = "";
  for (let k = 1; k <= 5; k++) s += `<span${k <= n ? "" : ' class="off"'}>★</span>`;
  return s;
}
function renderTrending() {
  const el = $("trending");
  if (!allTrending.length) { el.innerHTML = ""; return; }
  el.innerHTML = `<div class="sec-head"><h2>Trending</h2></div><div class="trend-grid"></div>`;
  const grid = el.querySelector(".trend-grid");
  for (const t of allTrending) {
    const card = document.createElement("div");
    card.className = "trend-card";
    card.innerHTML = `<div class="trend-media">${trendThumb(t)}<div class="trend-stars">${starIcons(t)}</div></div>
      <div class="trend-cat">${esc(t.category?.name || "Trending")}</div>`;
    card.onclick = () => openTrend(t);
    grid.appendChild(card);
  }
}

// Detail: swipeable images + interactive star rating + the local salon to book.
let trendMyStars = 0;
async function openTrend(t) {
  const imgs = (t.media_urls && t.media_urls.length) ? t.media_urls : [];
  const isVid = t.media_type === "video" && t.video_url && !imgs.length;
  let i = 0;
  const car = $("tvCarousel"), dots = $("tvDots");
  function paint() {
    if (isVid) { car.innerHTML = `<video src="${esc(t.video_url)}" controls autoplay loop playsinline></video>`; dots.innerHTML = ""; return; }
    car.innerHTML = `<img src="${esc(imgs[i] || "")}">
      ${imgs.length > 1 ? `<button class="tv-arrow l" aria-label="Previous"></button><button class="tv-arrow r" aria-label="Next"></button>` : ""}`;
    dots.innerHTML = imgs.map((_, k) => `<i class="${k === i ? "on" : ""}"></i>`).join("");
    const l = car.querySelector(".tv-arrow.l"), r = car.querySelector(".tv-arrow.r");
    if (l) l.onclick = () => { i = (i - 1 + imgs.length) % imgs.length; paint(); };
    if (r) r.onclick = () => { i = (i + 1) % imgs.length; paint(); };
  }
  paint();
  let sx = 0;
  car.ontouchstart = (e) => (sx = e.touches[0].clientX);
  car.ontouchend = (e) => { if (isVid || imgs.length < 2) return; const dx = e.changedTouches[0].clientX - sx; if (dx < -40) { i = (i + 1) % imgs.length; paint(); } else if (dx > 40) { i = (i - 1 + imgs.length) % imgs.length; paint(); } };

  $("tvCat").textContent = t.category?.name || "Trending look";
  trendMyStars = 0;
  if (session) {
    try { const { data } = await sb.from("trending_ratings").select("stars").eq("item_id", t.id).eq("user_id", session.user.id).maybeSingle(); trendMyStars = data?.stars || 0; } catch (_) {}
  }
  renderTrendStars(t);
  renderTrendSalon(t);
  $("trendViewer").hidden = false;
  const sc = $("trendViewer").querySelector(".tv-scroll"); if (sc) sc.scrollTop = 0;
  document.title = `${t.category?.name || "Trending"} — Salonn`;
  try { history.replaceState(null, "", `/trending/${slugify(t.category?.name || "look")}-${t.id}`); } catch (_) {}
}
function renderTrendStars(t) {
  const box = $("tvStars");
  box.innerHTML = [1, 2, 3, 4, 5].map((n) => `<button class="tv-star${n <= trendMyStars ? " on" : ""}" data-n="${n}">★</button>`).join("");
  box.querySelectorAll(".tv-star").forEach((b) => (b.onclick = () => rateTrend(t, +b.dataset.n)));
  $("tvAvg").textContent = t.rating_count > 0 ? `★ ${trendAvg(t).toFixed(1)} · ${t.rating_count} rating${t.rating_count > 1 ? "s" : ""}` : "Be the first to rate";
}
async function rateTrend(t, stars) {
  if (!session) { try { localStorage.setItem("salonn_pending_trend", t.id); } catch (_) {} closeTrend(); openAuth("trend"); return; }
  trendMyStars = stars;
  try {
    await sb.from("trending_ratings").upsert({ item_id: t.id, user_id: session.user.id, stars }, { onConflict: "item_id,user_id" });
    const { data } = await sb.from("trending_items").select("rating_sum,rating_count").eq("id", t.id).maybeSingle();
    if (data) { t.rating_sum = data.rating_sum; t.rating_count = data.rating_count; }
  } catch (_) {}
  renderTrendStars(t); renderTrending();
  toast("Thanks for rating!");
}
function renderTrendSalon(t) {
  const list = (typeof salonInArea === "function") ? allSalons.filter(salonInArea) : allSalons;
  const s = list[0] || allSalons[0];
  const el = $("tvSalon");
  if (!s) { el.innerHTML = ""; return; }
  const logo = s.image_url ? `<img class="tv-slogo" src="${esc(s.image_url)}">` : `<span class="brand-mark small">S</span>`;
  el.innerHTML = `${logo}<div class="tv-sinfo"><b>${esc(s.name)}</b><small>${esc([s.area, s.city].filter(Boolean).join(", ") || "Nearby")}</small></div>
    <button class="btn gold tv-book">Book</button>`;
  el.querySelector(".tv-book").onclick = () => { closeTrend(); openSalon(s); };
}
function closeTrend() {
  $("trendViewer").hidden = true; $("tvCarousel").innerHTML = "";
  document.title = DEFAULT_TITLE;
  if (location.pathname.startsWith("/trending")) {
    const cur = document.querySelector(".tab.active")?.dataset.tab || "home";
    try { history.replaceState(null, "", TAB_PATH[cur] || "/"); } catch (_) {}
  }
}
async function openTrendById(id) {
  if (!allTrending.length) await loadTrending();
  const t = allTrending.find((x) => x.id === id);
  if (t) openTrend(t);
}
$("tvClose").addEventListener("click", closeTrend);

/* ── Salon detail ── */
async function openSalon(s) {
  selectedServices = [];
  $("screen-detail").hidden = false;
  // Pretty URL + tab title while viewing this salon.
  document.title = `${s.name || "Salon"} — Salonn`;
  try { history.replaceState(null, "", `/s/${slugify(s.name)}-${s.id}`); } catch (_) {}
  const area = esc([s.area, s.city].filter(Boolean).join(", ") || "Nearby");
  const dist = s.dist != null ? ` · ${s.dist.toFixed(1)} km away` : "";
  $("detailBody").innerHTML = `
    <div class="d-head">
      <span class="brand-mark small">S</span><b class="d-hbrand">Salonn</b>
      <button class="d-getapp" id="dGetApp">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M3 3.5v17c0 .8.9 1.3 1.6.9l14-8.5c.7-.4.7-1.4 0-1.8l-14-8.5C3.9 2.2 3 2.7 3 3.5Z"/></svg>
        Get app
      </button>
    </div>
    <div class="d-hero">
      <img id="dHeroImg" src="${esc(s.image_url || "")}" onerror="this.style.background='#1f1f1f'">
      <div class="d-dots" id="dDots"></div>
    </div>
    <div class="d-body">
      <div class="d-title-row">
        <div class="d-title">${esc(s.name || "Salon")}</div>
        <button class="d-share" id="dShare" title="Share this salon" aria-label="Share this salon">
          <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M18 16.1a3 3 0 0 0-2.3 1.1l-6-3.5a3 3 0 0 0 0-1.4l6-3.5A3 3 0 1 0 15 6c0 .2 0 .4.1.6L9 10.2a3 3 0 1 0 0 3.6l6.1 3.6c0 .2-.1.4-.1.6a3 3 0 1 0 3-2.5Z"/></svg>
        </button>
      </div>
      <div class="d-row">★ <b style="color:var(--gold-ink)">${s.rating || 0}</b> · ${area}${dist}</div>
      <div class="sec-head" style="margin-top:20px"><h2>Choose services</h2></div>
      <div id="svcList"><div class="empty">Loading services…</div></div>
      <div id="detailReels"></div>
      <div id="revSection"></div>
    </div>
    <div class="d-note">↩️ Track your <b>refund status</b> and see <b>reschedules</b> live in the <b>Salonn app</b>.</div>`;
  $("detailPrice").textContent = "₹0";
  $("dGetApp").onclick = () => window.open(PLAY_URL, "_blank");
  $("dShare").onclick = () => shareSalon(s);
  $("detailBook").onclick = () => bookNow(s);
  loadGallery(s.id);
  loadServices(s.id);
  loadDetailReels(s);
  loadReviews(s.id);
}

// "Sharp Cuts & Co." → "sharp-cuts-co"
function slugify(name) {
  return String(name || "salon").toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "salon";
}
// A pretty, shareable URL that carries the name AND the id, e.g.
// https://www.salonn.hair/s/sharp-cuts-co-9fdb9389-8e2f-47bb-a4f7-5023500d702f
function salonLink(s) { return `${location.origin}/s/${slugify(s.name)}-${s.id}`; }

// Share a direct link to this salon — native share sheet on phones, clipboard
// on desktop. Opening the link jumps straight into this salon.
async function shareSalon(s) {
  const url = salonLink(s);
  const data = { title: `${s.name} on Salonn`, text: `Check out ${s.name} on Salonn and book an appointment:`, url };
  if (navigator.share) {
    try { await navigator.share(data); } catch (_) {/* user cancelled */}
  } else {
    try { await navigator.clipboard.writeText(url); toast("Link copied — share it anywhere!"); }
    catch (_) { window.prompt("Copy this salon link:", url); }
  }
}

// Deep link: open a specific salon by id (from a shared /s/… or ?salon= link).
async function openSalonById(id) {
  const found = allSalons.find((x) => x.id === id);
  if (found) { openSalon(found); return; }
  const { data } = await sb.from("salons")
    .select("id,name,area,city,rating,image_url,latitude,longitude,address")
    .eq("id", id).eq("status", "approved").maybeSingle();
  if (!data) { toast("That salon isn't available."); return; }
  const dist = userPos && data.latitude && data.longitude ? distanceKm(userPos.lat, userPos.lng, data.latitude, data.longitude) : null;
  openSalon({ ...data, dist });
}

// Reels & posts strip inside the salon detail (above reviews), like the app.
async function loadDetailReels(s) {
  const el = $("detailReels");
  if (!el) return;
  const { data } = await sb.from("reels")
    .select("id,salon_id,media_type,image_urls,video_url,caption,like_count,views")
    .eq("salon_id", s.id).order("created_at", { ascending: false }).limit(15);
  const rows = data || [];
  if (!rows.length) { el.innerHTML = ""; return; }
  el.innerHTML = `<div class="sec-head" style="margin-top:26px"><h2>Reels &amp; posts</h2></div>
    <div class="dreel-strip"></div>`;
  const strip = el.querySelector(".dreel-strip");
  for (const r of rows) {
    const thumb = (r.image_urls && r.image_urls[0]) || s.image_url;
    const isPost = (r.media_type || "").toLowerCase() !== "video";
    const badge = isPost ? ((r.image_urls || []).length > 1 ? "▦" : "▣") : "▶";
    const d = document.createElement("div");
    d.className = "dreel";
    d.innerHTML = `${thumb ? `<img src="${esc(thumb)}" loading="lazy">` : ""}<div class="ov"></div>
      <div class="badge">${badge}</div><div class="cap">❤ ${r.like_count || 0}</div>`;
    d.addEventListener("click", () => openReel({ ...r, salon: { name: s.name, image_url: s.image_url } }));
    strip.appendChild(d);
  }
}

async function loadReviews(id) {
  const { data } = await sb.from("reviews")
    .select("id,rating,comment,reviewer_name,media_urls,created_at")
    .eq("salon_id", id).order("created_at", { ascending: false }).limit(20);
  const el = $("revSection");
  if (!el) return;
  const rows = data || [];
  const stars = (n) => "★★★★★☆☆☆☆☆".slice(5 - Math.round(n), 10 - Math.round(n));
  const avg = rows.length ? (rows.reduce((a, r) => a + (r.rating || 0), 0) / rows.length).toFixed(1) : "0.0";
  el.innerHTML = `
    <div class="sec-head" style="margin-top:26px">
      <h2>Ratings &amp; reviews</h2>
      <button class="write-btn" id="writeRevBtn"><svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M3 17.2V21h3.8L17.8 10 14 6.2 3 17.2ZM20.7 7.1c.4-.4.4-1 0-1.4l-2.4-2.4a1 1 0 0 0-1.4 0l-1.9 1.9L18.8 9l1.9-1.9Z"/></svg> Write</button>
    </div>
    ${rows.length ? `<div class="rev-sum">
      <div class="rev-avg">${avg}<small>${rows.length} review${rows.length > 1 ? "s" : ""}</small></div>
      <div><div class="rev-stars">${stars(avg)}</div>
      <div class="muted" style="font-size:13px;margin-top:4px">Based on customer visits</div></div>
    </div>` : `<div class="muted" style="font-size:13.5px;padding-bottom:2px">No reviews yet — be the first to review this salon.</div>`}
    ${rows.map((r) => {
      const nm = r.reviewer_name || "Customer";
      const media = (r.media_urls || []).filter(Boolean);
      return `<div class="rev-card">
        <div class="rev-head"><div class="rev-ava">${esc(nm[0].toUpperCase())}</div>
          <div><div class="rev-name">${esc(nm)}</div><div class="rev-when">${timeAgo(r.created_at)}</div>
          <div class="rev-stars-sm">${stars(r.rating || 0)}</div></div></div>
        ${r.comment ? `<div class="rev-text">${esc(r.comment)}</div>` : ""}
        ${media.length ? `<div class="rev-media">${media.map((m) => isVideoUrl(m) ? "" : `<img src="${esc(m)}" loading="lazy">`).join("")}</div>` : ""}
      </div>`;
    }).join("")}`;
  const w = $("writeRevBtn");
  if (w) w.onclick = () => openReviewForm(id);
}
function isVideoUrl(u) { return /\.(mp4|mov|webm|m4v)(\?|$)/i.test(u || ""); }

/* ── Sheet modal (booking + review forms) ── */
function openSheet(html) { $("sheetBody").innerHTML = html; $("sheetModal").hidden = false; }
window.closeSheet = () => { $("sheetModal").hidden = true; $("sheetBody").innerHTML = ""; };
$("sheetModal").addEventListener("click", (e) => { if (e.target.id === "sheetModal") closeSheet(); });

/* ── Write a review ── */
function openReviewForm(salonId) {
  if (!session) { openAuth("login"); return; }
  let rating = 5;
  openSheet(`
    <button class="sheet-close" onclick="closeSheet()">✕</button>
    <h3>Write a review</h3>
    <p class="muted">Share your experience at this salon.</p>
    <div class="star-input" id="starIn">${[1, 2, 3, 4, 5].map((i) => `<span data-v="${i}">★</span>`).join("")}</div>
    <textarea id="revComment" class="rev-textarea" placeholder="How was your visit? (optional)"></textarea>
    <div id="revErr" class="auth-error" hidden></div>
    <button class="btn gold block" id="revSubmit">Submit review</button>`);
  const setStars = (v) => { rating = v; document.querySelectorAll("#starIn span").forEach((s, i) => s.classList.toggle("on", i < v)); };
  document.querySelectorAll("#starIn span").forEach((s) => (s.onclick = () => setStars(+s.dataset.v)));
  setStars(5);
  $("revSubmit").onclick = async () => {
    $("revSubmit").disabled = true; $("revSubmit").textContent = "Submitting…";
    try {
      const name = session.user.user_metadata?.full_name || session.user.email.split("@")[0];
      const { error } = await sb.from("reviews").insert({
        salon_id: salonId, customer_id: session.user.id, rating,
        comment: $("revComment").value.trim() || null, reviewer_name: name,
      });
      if (error) throw error;
      closeSheet(); toast("Thanks for your review!"); loadReviews(salonId);
    } catch (ex) {
      const e = $("revErr"); e.textContent = ex.message || "Couldn't submit — did you already review this salon?"; e.hidden = false;
      $("revSubmit").disabled = false; $("revSubmit").textContent = "Submit review";
    }
  };
}
function timeAgo(t) {
  const d = (Date.now() - new Date(t).getTime()) / 1000;
  if (d < 3600) return Math.max(1, Math.floor(d / 60)) + "m ago";
  if (d < 86400) return Math.floor(d / 3600) + "h ago";
  if (d < 2592000) return Math.floor(d / 86400) + "d ago";
  return Math.floor(d / 2592000) + "mo ago";
}
window.closeDetail = () => {
  $("screen-detail").hidden = true;
  document.title = DEFAULT_TITLE;
  const cur = document.querySelector(".tab.active")?.dataset.tab || "home";
  try { history.replaceState(null, "", TAB_PATH[cur] || "/"); } catch (_) {}
};

async function loadGallery(id) {
  const { data } = await sb.from("salon_images").select("url").eq("salon_id", id).order("sort_order");
  if (!data || !data.length) return;
  let i = 0;
  const imgs = data.map((x) => x.url);
  $("dHeroImg").src = imgs[0];
  $("dDots").innerHTML = imgs.map((_, k) => `<i class="${k === 0 ? "on" : ""}"></i>`).join("");
  const hero = $("dHeroImg");
  hero.style.cursor = "pointer";
  hero.onclick = () => {
    i = (i + 1) % imgs.length; hero.src = imgs[i];
    $("dDots").querySelectorAll("i").forEach((d, k) => d.classList.toggle("on", k === i));
  };
}
async function loadServices(id) {
  const el = $("svcList");
  // Services (and prices) are visible only to logged-in customers.
  if (!session) { renderServiceGate(); return; }
  const { data, error } = await sb.from("services")
    .select("id,name,price,duration_minutes,category,active").eq("salon_id", id);
  const rows = (data || []).filter((s) => s.active !== false);
  if (error || !rows.length) { el.innerHTML = `<div class="empty">No services listed.</div>`; return; }
  el.innerHTML = "";
  for (const sv of rows) {
    const sub = [sv.category, sv.duration_minutes ? sv.duration_minutes + " min" : ""].filter(Boolean).join(" · ");
    const row = document.createElement("div");
    row.className = "svc";
    row.innerHTML = `<div class="svc-info"><b>${esc(sv.name)}</b><small>${esc(sub)}</small></div>
      <div class="svc-price">₹${sv.price}</div><div class="svc-check">✓</div>`;
    row.addEventListener("click", () => {
      row.classList.toggle("on");
      if (row.classList.contains("on")) selectedServices.push(sv); else selectedServices = selectedServices.filter((x) => x.id !== sv.id);
      $("detailPrice").textContent = "₹" + selectedServices.reduce((a, x) => a + (x.price || 0), 0);
    });
    el.appendChild(row);
  }
}
// Blurred placeholder + login overlay shown to logged-out visitors.
function renderServiceGate() {
  const rows = [["Haircut", "45 min"], ["Beard Trim", "20 min"], ["Hair Colour", "60 min"]]
    .map(([n, d]) => `<div class="svc"><div class="svc-info"><b>${n}</b><small>${d}</small></div><div class="svc-price">₹••</div></div>`).join("");
  $("svcList").innerHTML = `
    <div class="svc-gate">
      <div class="svc-gate-rows">${rows}</div>
      <div class="svc-gate-panel">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" class="svc-lock"><path d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5Zm3 8H9V6a3 3 0 0 1 6 0v3Z"/></svg>
        <b>Log in to see services &amp; prices</b>
        <p class="muted small">Continue with Google to view services and book your appointment.</p>
        <button class="btn google-btn" id="svcGoogle">${GOOGLE_G_SVG}<span>Continue with Google</span></button>
      </div>
    </div>`;
  const g = $("svcGoogle"); if (g) g.onclick = googleLogin;
}
async function bookNow(s) {
  if (!session) { openAuth("book"); return; }
  if (!selectedServices.length) { toast("Select at least one service first."); return; }
  openBookingSheet(s);
}

// Booking: "Select date & time" — a 1:1 clone of the app's DateTimeScreen.
// Real opening hours + break + booked slots, one box per open hour split into
// Morning/Afternoon/Evening, and an appointment-window card that shows the
// start–end time and total duration ("how long it'll take").
function openBookingSheet(s) {
  const total = selectedServices.reduce((a, x) => a + (x.price || 0), 0);
  const totalMin = selectedServices.reduce((a, x) => a + (x.duration_minutes || 0), 0);
  const dur = totalMin > 0 ? totalMin : 30;
  const summary = selectedServices.map((x) => x.name).join(", ") || "Service";
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const MONTHS_UP = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const pad = (n) => String(n).padStart(2, "0");
  const hourOf = (hms, fb) => { if (!hms) return fb; const h = parseInt(String(hms).split(":")[0], 10); return isNaN(h) ? fb : h; };

  const now = new Date();
  // Today is bookable only before 21:00 (matches the app), then start tomorrow.
  const startOffset = now.getHours() < 21 ? 0 : 1;
  const dayOffsets = Array.from({ length: 7 }, (_, i) => startOffset + i);
  let selOffset = startOffset;
  let selDate = dayStart(selOffset);
  let selTimeStr = null;    // "HH:MM"
  let av = {};              // current day's availability

  function dayStart(off) { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + off); return d; }

  const mLabel = `${MONTHS_UP[now.getMonth()]} ${now.getFullYear()}`;
  openSheet(`
    <button class="sheet-close" onclick="closeSheet()">✕</button>
    <div class="bk">
      <h3 class="bk-title">Select date &amp; time</h3>
      <p class="bk-sub">${esc(summary)} at ${esc(s.name)}</p>
      <div class="bk-month">${mLabel}</div>
      <div class="day-row" id="dayRow"></div>
      <div class="appt-window" id="apptWin" hidden></div>
      <div id="slotSections"></div>
      <div id="bkErr" class="auth-error" hidden></div>
      <button class="btn gold block" id="bkPay" disabled>Select a time</button>
      <p class="muted small bk-note">Secure payment via Razorpay. Free cancellation up to 2 hours before (refund minus ~2.36% gateway fee).</p>
    </div>`);

  // ── Day chips ──
  const dayRow = $("dayRow");
  dayOffsets.forEach((off) => {
    const d = dayStart(off);
    const chip = document.createElement("button");
    chip.className = "day-chip" + (off === selOffset ? " on" : "");
    chip.innerHTML = `<small>${off === 0 ? "Today" : DAYS[d.getDay()]}</small><b>${d.getDate()}</b>`;
    chip.onclick = () => {
      selOffset = off; selDate = d;
      dayRow.querySelectorAll(".day-chip").forEach((c) => c.classList.toggle("on", c === chip));
      loadSlots();
    };
    dayRow.appendChild(chip);
  });

  // ── Availability helpers (mirror the app's AppState logic) ──
  function busyIntervals() {
    return (av.busy || []).map((b) => { const st = new Date(b.start).getTime(); return { start: st, end: st + ((b.minutes || 30) * 60000) }; });
  }
  function dateFor(hhmm) { const [h, m] = hhmm.split(":").map(Number); const t = new Date(selDate); t.setHours(h, m, 0, 0); return t; }
  // Exact break window on the selected day (uses HH:MM, not just the hour).
  function timeOn(hms) { if (!hms) return null; const p = String(hms).split(":"); const t = new Date(selDate); t.setHours(+p[0] || 0, +p[1] || 0, 0, 0); return t; }

  function isSlotAvailable(hhmm, busy) {
    if (av.is_open === false) return false;
    const openH = hourOf(av.open_at, 9), closeH = hourOf(av.close_at, 20);
    const h = parseInt(hhmm.split(":")[0], 10);
    if (h < openH || h >= closeH) return false;
    const start = dateFor(hhmm);
    if (selOffset === 0 && start.getTime() < Date.now() + 15 * 60000) return false; // past (15-min buffer)
    const end = new Date(start.getTime() + dur * 60000);
    const close = new Date(selDate); close.setHours(closeH, 0, 0, 0);
    if (end.getTime() > close.getTime()) return false; // service must fit before closing
    // Never offer a slot whose service touches the break — not even one that
    // starts before the break but runs into it.
    if (av.has_break === true) {
      const bStart = timeOn(av.break_start), bEnd = timeOn(av.break_end);
      if (bStart && bEnd && start.getTime() < bEnd.getTime() && bStart.getTime() < end.getTime()) return false;
    }
    const staff = (av.staff_count && av.staff_count > 0) ? av.staff_count : 1;
    let clashes = 0;
    for (const b of busy) { if (start.getTime() < b.end && b.start < end.getTime()) clashes++; }
    return clashes < staff;
  }

  // One box per open hour; if the top of the hour is taken, shift to the first
  // free 5-min moment inside that hour; drop the hour only if fully booked.
  function availableSlots() {
    const busy = busyIntervals();
    const openH = hourOf(av.open_at, 9), closeH = hourOf(av.close_at, 20);
    const out = [];
    for (let h = openH; h < closeH; h++) {
      const top = `${pad(h)}:00`;
      if (isSlotAvailable(top, busy)) { out.push(top); continue; }
      for (let m = 5; m < 60; m += 5) {
        const cand = `${pad(h)}:${pad(m)}`;
        if (isSlotAvailable(cand, busy)) { out.push(cand); break; }
      }
    }
    return out;
  }

  const fmt12 = (hhmm) => { let [h, m] = hhmm.split(":").map(Number); const ap = h >= 12 ? "PM" : "AM"; const h12 = h % 12 === 0 ? 12 : h % 12; return `${h12}:${pad(m)} ${ap}`; };
  const addMin = (hhmm, mins) => { let [h, m] = hhmm.split(":").map(Number); const tot = h * 60 + m + mins; return `${pad(Math.floor(tot / 60) % 24)}:${pad(tot % 60)}`; };

  function updateWindow() {
    const win = $("apptWin"), pay = $("bkPay");
    if (!selTimeStr) {
      win.hidden = true; pay.disabled = true; pay.textContent = "Select a time";
      return;
    }
    const range = `${fmt12(selTimeStr)} – ${fmt12(addMin(selTimeStr, dur))}`;
    win.hidden = false;
    win.innerHTML = `
      <div class="aw-ico"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 10.4 4 2.3-1 1.7-5-2.9V6h2Z"/></svg></div>
      <div class="aw-body"><small>YOUR APPOINTMENT WINDOW</small><b>${range}</b></div>
      <span class="aw-min">${dur} min</span>`;
    pay.disabled = false; pay.textContent = `Pay ₹${total} & book`;
  }

  async function loadSlots() {
    selTimeStr = null; updateWindow();
    const wrap = $("slotSections");
    wrap.innerHTML = `<div class="slot-msg">Loading times…</div>`;
    const dayStr = `${selDate.getFullYear()}-${pad(selDate.getMonth() + 1)}-${pad(selDate.getDate())}`;
    av = {};
    try { const { data } = await sb.rpc("salon_day_availability", { p_salon_id: s.id, p_day: dayStr }); av = data || {}; } catch (_) { av = {}; }
    renderSlots();
  }

  function renderSlots() {
    const wrap = $("slotSections"); wrap.innerHTML = "";
    if (av.is_open === false) { wrap.innerHTML = emptyState(false); return; }
    const slots = availableSlots();
    if (!slots.length) { wrap.innerHTML = emptyState(true); return; }
    const groups = [
      ["Morning", slots.filter((t) => +t.split(":")[0] < 12)],
      ["Afternoon", slots.filter((t) => { const h = +t.split(":")[0]; return h >= 12 && h < 16; })],
      ["Evening", slots.filter((t) => +t.split(":")[0] >= 16)],
    ];
    for (const [title, times] of groups) {
      if (!times.length) continue;
      const sec = document.createElement("div"); sec.className = "slot-sec";
      sec.innerHTML = `<h4>${title}</h4>`;
      const grid = document.createElement("div"); grid.className = "slot-wrap";
      for (const t of times) {
        const b = document.createElement("button");
        b.className = "tslot" + (t === selTimeStr ? " on" : "");
        b.textContent = fmt12(t);
        b.onclick = () => {
          selTimeStr = t;
          wrap.querySelectorAll(".tslot").forEach((x) => x.classList.remove("on"));
          b.classList.add("on");
          updateWindow();
        };
        grid.appendChild(b);
      }
      sec.appendChild(grid); wrap.appendChild(sec);
    }
  }

  function emptyState(open) {
    return `<div class="slot-empty">
      <div class="se-ico">${open
        ? `<svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M7 2v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2Zm12 8v10H5V10Zm-4.3 2.3L11 16l-1.7-1.7-1.4 1.4L11 18.8l5.1-5.1z"/></svg>`
        : `<svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M4 8h16l-1 12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 8Zm2-4h12l1 3H5l1-3Z"/></svg>`}</div>
      <b>${open ? "Fully booked this day" : "Closed this day"}</b>
      <span>${open ? "All stylists are reserved — try another date." : "This salon is closed — try another date."}</span>
    </div>`;
  }

  loadSlots();

  $("bkPay").onclick = async () => {
    if (!selTimeStr) { const e = $("bkErr"); e.textContent = "Please pick a time slot."; e.hidden = false; return; }
    const btn = $("bkPay"); btn.disabled = true;
    const ok = await ensurePhone(); // ask for phone here if we don't have it yet
    if (btn) btn.disabled = false;
    if (!ok) return; // cancelled the phone step
    payAndBook(s, total, dateFor(selTimeStr));
  };
}

async function payAndBook(s, total, scheduledAt) {
  const err = $("bkErr");
  if (!scheduledAt || scheduledAt.getTime() < Date.now()) { err.textContent = "Pick a future time."; err.hidden = false; return; }
  err.hidden = true;
  $("bkPay").disabled = true; $("bkPay").textContent = "Starting payment…";
  try {
    const res = await sb.functions.invoke("create-razorpay-order", { body: { amount_rupees: total, receipt: "web_" + Date.now() } });
    const d = res.data;
    if (!d || !d.order_id) throw new Error("Could not start the payment. Please try again.");
    const rzp = new Razorpay({
      key: d.key_id, amount: d.amount, currency: "INR", order_id: d.order_id,
      name: "Salonn", description: selectedServices.map((x) => x.name).join(", "),
      prefill: { email: session.user.email },
      theme: { color: "#FFD700" },
      handler: async (resp) => {
        const v = await sb.functions.invoke("verify-razorpay-payment", {
          body: { razorpay_order_id: resp.razorpay_order_id, razorpay_payment_id: resp.razorpay_payment_id, razorpay_signature: resp.razorpay_signature },
        });
        if (!(v.data && v.data.valid)) { toast("Payment could not be verified. Any amount debited is auto-refunded."); resetPayBtn(total); return; }
        await createWebBooking(s, total, scheduledAt, resp);
      },
      modal: { ondismiss: () => resetPayBtn(total) },
    });
    rzp.open();
  } catch (ex) {
    err.textContent = ex.message || "Payment failed."; err.hidden = false;
    resetPayBtn(total);
  }
}
function resetPayBtn(total) { const b = $("bkPay"); if (b) { b.disabled = false; b.textContent = `Pay ₹${total} & book`; } }

async function createWebBooking(s, total, scheduledAt, resp) {
  const dur = selectedServices.reduce((a, x) => a + (x.duration_minutes || 0), 0) || 30;
  const summary = selectedServices.map((x) => x.name).join(", ");
  const name = session.user.user_metadata?.full_name || session.user.email.split("@")[0];
  const { error } = await sb.from("bookings").insert({
    salon_id: s.id, customer_id: session.user.id, customer_name: name,
    service_id: selectedServices[0].id, service_name: summary,
    scheduled_at: scheduledAt.toISOString(), duration_minutes: dur, amount: total,
    status: "upcoming", payment_status: "paid", payment_mode: "online",
    razorpay_order_id: resp.razorpay_order_id, razorpay_payment_id: resp.razorpay_payment_id,
  });
  if (error) {
    toast("Paid, but the booking couldn't be saved. Email support with payment id " + resp.razorpay_payment_id);
    return;
  }
  closeSheet(); closeDetail();
  const when = scheduledAt.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" }) +
    " · " + scheduledAt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  showThankYou({ salon: s.name, service: summary, when, amount: total, paymentId: resp.razorpay_payment_id });
}

/* ── Thank-you screen (animated green tick + booking details) ── */
function checkSvg() {
  return `<svg class="ty-check" viewBox="0 0 52 52" aria-hidden="true">
    <circle class="ty-circle" cx="26" cy="26" r="24"/>
    <path class="ty-tick" d="M14 27l7 7 16-16"/>
  </svg>`;
}
function showThankYou(info) {
  $("tyBadge").innerHTML = checkSvg(); // re-inject so the draw animation replays
  $("tyCard").innerHTML = `
    <div class="ty-row"><span>Salon</span><b>${esc(info.salon || "Salon")}</b></div>
    <div class="ty-row"><span>Service</span><b>${esc(info.service || "Service")}</b></div>
    <div class="ty-row"><span>Date &amp; time</span><b>${esc(info.when)}</b></div>
    <div class="ty-row"><span>Amount paid</span><b class="ty-amt">₹${info.amount}</b></div>
    <div class="ty-row"><span>Payment ID</span><b class="ty-mono">${esc(info.paymentId || "—")}</b></div>`;
  $("thankYou").hidden = false;
}
function closeThankYou() { $("thankYou").hidden = true; }
$("tyDone").addEventListener("click", () => { closeThankYou(); show("bookings"); });

/* ── Bookings ── */
async function renderBookings() {
  const b = $("bookingsBody");
  if (!session) {
    b.innerHTML = gate("calendar", "Your bookings", "Log in to see and manage your appointments.");
    wireGate(); return;
  }
  b.innerHTML = `<div class="empty">Loading your bookings…</div>`;
  const { data } = await sb.from("bookings").select("id,service_name,scheduled_at,status,amount,salon:salons(name)")
    .eq("customer_id", session.user.id).order("scheduled_at", { ascending: false }).limit(20);
  const rows = data || [];
  let html = "";
  if (!rows.length) html = `<div class="empty" style="margin-top:16px">No bookings yet — find a salon on Home.</div>`;
  else html = rows.map((r) => {
    const dt = new Date(r.scheduled_at);
    const when = dt.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" }) + " · " + dt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    const col = r.status === "cancelled" ? "var(--red)" : r.status === "completed" ? "var(--muted)" : "var(--green)";
    return `<div class="scard" style="cursor:default;margin-bottom:12px"><div class="scard-b">
      <div class="scard-t">${esc(r.service_name || "Appointment")}</div>
      <div class="scard-m"><span>${esc(r.salon?.name || "Salon")}</span><span class="dist">₹${r.amount || 0}</span></div>
      <div class="scard-m"><span>${when}</span><span style="margin-left:auto;color:${col};font-weight:800;text-transform:uppercase;font-size:11px">${esc(r.status)}</span></div>
    </div></div>`;
  }).join("");
  b.innerHTML = `<div style="padding-top:8px">${html}
    <div class="d-note" style="margin:16px 0">↩️ To <b>reschedule</b>, track <b>refunds</b> or <b>pay</b>, use the Salonn app.
    <br><a class="link" href="${PLAY_URL}" target="_blank">Get the app →</a></div><div class="pad"></div></div>`;
}

/* ── Profile ── */
// Clean line icons (no emojis) for the profile menu rows.
const MENU_ICON = {
  app: `<svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor"><path d="M17 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Zm-5 19a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4ZM17 17H7V5h10Z"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor"><path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Zm-1 13-3.5-3.5 1.4-1.4L11 12.2l4.1-4.1 1.4 1.4L11 15Z"/></svg>`,
  doc: `<svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor"><path d="M6 2h7l5 5v15H6V2Zm7 1.5V7h3.5L13 3.5ZM8.5 11h7v1.6h-7V11Zm0 3.4h7V16h-7v-1.6Z"/></svg>`,
  help: `<svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor"><path d="M12 2a9 9 0 0 0-9 9v5.5A2.5 2.5 0 0 0 5.5 19H7v-7H5.2A6.8 6.8 0 0 1 18.8 12H17v7h1.5a2.5 2.5 0 0 0 2.5-2.5V11a9 9 0 0 0-9-9Z"/></svg>`,
};

async function renderProfile() {
  const el = $("profileBody");
  const name = session?.user?.user_metadata?.full_name || (session ? session.user.email.split("@")[0] : "Guest");
  const initial = (name || "S").trim()[0].toUpperCase();
  const menu = [
    { i: MENU_ICON.app, t: "Get the Salonn app", act: () => window.open(PLAY_URL, "_blank") },
    { i: MENU_ICON.shield, t: "Privacy Policy", act: () => openLegalSheet("privacy") },
    { i: MENU_ICON.doc, t: "Terms & Conditions", act: () => openLegalSheet("terms") },
    { i: MENU_ICON.help, t: "Help & support", act: openHelpSheet },
  ];
  el.innerHTML = `<div class="p-top">
      <div class="avatar">${esc(initial)}</div>
      <div class="p-name">${esc(name)}</div>
      ${session ? `<div class="p-mail">${esc(session.user.email)}</div>` : ""}
      ${session ? "" : `<button class="btn gold" style="margin-top:14px" id="pLogin">Log in</button>`}
    </div>
    <div class="menu">
      ${menu.map((m, k) => `<div class="mi" data-mi="${k}"><span class="ico">${m.i}</span>${m.t}<span class="arr">›</span></div>`).join("")}
    </div>
    ${session ? `<button class="btn logout-btn" id="pLogout">Log out</button>` : ""}
    <div class="social" id="pSocial">
      <a data-s="instagram" class="nolink" aria-label="Instagram">${SOCIAL_SVG.instagram}</a>
      <a data-s="facebook" class="nolink" aria-label="Facebook">${SOCIAL_SVG.facebook}</a>
      <a data-s="x" class="nolink" aria-label="X">${SOCIAL_SVG.x}</a>
      <a data-s="youtube" class="nolink" aria-label="YouTube">${SOCIAL_SVG.youtube}</a>
    </div>
    <div class="muted small" style="text-align:center;padding-bottom:8px">Salonn · salonn.hair</div>
    <div class="pad"></div>`;
  el.querySelectorAll(".mi[data-mi]").forEach((n) => n.addEventListener("click", () => menu[+n.dataset.mi].act()));
  if ($("pLogin")) $("pLogin").addEventListener("click", () => openAuth("login"));
  if ($("pLogout")) $("pLogout").addEventListener("click", async () => { await sb.auth.signOut(); toast("Logged out"); });
  applySocial(el);
}

/* ── Help & support — a 1:1 clone of the app's Call/Email sheet ── */
const SUPPORT_PHONE_FALLBACK = "+917381204652";
const SUPPORT_EMAIL_FALLBACK = "support.salonn@gmail.com";
const HELP_ICON = {
  call: `<svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor"><path d="M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.2.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.4 0 .8-.3 1l-2.1 2.2Z"/></svg>`,
  mail: `<svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor"><path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm9 7 8-5H4l8 5Zm0 2L4 9v8h16V9l-8 5Z"/></svg>`,
};
function contactRow(kind, label, value) {
  const href = kind === "call" ? "tel:" + value : "mailto:" + value + "?subject=Salonn%20Support";
  return `<a class="contact-row" href="${href}">
    <span class="cr-ico">${HELP_ICON[kind]}</span>
    <span class="cr-body"><b>${label}</b><small>${esc(value)}</small></span>
    <svg class="cr-arr" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8.6 5 15.6 12l-7 7-1.5-1.4L12.7 12 7.1 6.4z"/></svg>
  </a>`;
}
function openHelpSheet() {
  openSheet(`
    <button class="sheet-close" onclick="closeSheet()">✕</button>
    <div class="help-sheet">
      <h3>Help &amp; support</h3>
      <p class="muted help-sub">Questions, feedback or trouble with a booking? Call or email us and we’ll help you out.</p>
      <div id="helpRows">
        ${contactRow("mail", "Email us", SUPPORT_EMAIL_FALLBACK)}
      </div>
    </div>`);
  // Swap in the live (superadmin-editable) email once fetched.
  sb.from("support_contacts").select("email").eq("audience", "customer").maybeSingle()
    .then(({ data }) => {
      const rows = $("helpRows"); if (!rows) return;
      const email = (data?.email || "").trim() || SUPPORT_EMAIL_FALLBACK;
      rows.innerHTML = contactRow("mail", "Email us", email);
    })
    .catch(() => {});
}

/* ── Terms & Privacy — rendered in-site from the legal_documents table ── */
// Same block-formatting rules as the app's legal renderer: blank lines split
// blocks; a block of "- " lines becomes a bullet list; a block whose first line
// is "N. Heading" becomes a heading + paragraph; anything else is a paragraph.
function fmtLegal(text) {
  const out = [];
  for (const block of String(text || "").split(/\n\n+/)) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    if (lines.every((l) => l.startsWith("-"))) {
      out.push("<ul>" + lines.map((l) => "<li>" + esc(l.slice(1).trim()) + "</li>").join("") + "</ul>");
      continue;
    }
    if (/^\d+\.\s/.test(lines[0])) {
      out.push("<h2>" + esc(lines[0]) + "</h2>");
      const rest = lines.slice(1).join(" ");
      if (rest) out.push("<p>" + esc(rest) + "</p>");
    } else {
      out.push("<p>" + esc(lines.join(" ")) + "</p>");
    }
  }
  return out.join("");
}
async function openLegalSheet(slug) {
  const fallbackTitle = slug === "terms" ? "Terms & Conditions" : "Privacy Policy";
  openSheet(`
    <button class="sheet-close" onclick="closeSheet()">✕</button>
    <div class="legal-sheet">
      <h3 id="legalTitle">${fallbackTitle}</h3>
      <div class="legal-body" id="legalBody"><p class="muted">Loading…</p></div>
    </div>`);
  try {
    const { data } = await sb.from("legal_documents").select("title,body,updated_at").eq("slug", slug).maybeSingle();
    if ($("legalTitle") && data?.title) $("legalTitle").textContent = data.title;
    const upd = data?.updated_at ? new Date(data.updated_at).toISOString().slice(0, 10) : "";
    const body = fmtLegal(data?.body);
    const el = $("legalBody"); if (!el) return;
    el.innerHTML = (upd ? `<div class="legal-updated">Last updated: ${upd}</div>` : "") +
      (body || "<p class='muted'>This document is being finalised. Please check back soon.</p>");
  } catch (_) {
    if ($("legalBody")) $("legalBody").innerHTML = "<p class='muted'>Couldn't load right now. Please try again.</p>";
  }
}

function gate(icon, title, sub) {
  return `<div class="info-card"><div class="big-emoji">📅</div><h3>${title}</h3>
    <p class="muted" style="margin-top:4px">${sub}</p>
    <button class="btn gold block" style="margin-top:18px" id="gateLogin">Log in to continue</button>
    <a class="link" style="display:inline-block;margin-top:14px" href="${PLAY_URL}" target="_blank">Get the app →</a></div><div class="pad"></div>`;
}
function wireGate() { const g = $("gateLogin"); if (g) g.addEventListener("click", () => openAuth("login")); }

/* ── Auth: Google only ──────────────────────────────────────────────────────
 * One button — Continue with Google. Google signs an existing user in or
 * creates a new account automatically. We don't ask for a phone here; that's
 * requested at booking time (see ensurePhone). Location is saved on sign-in. */
const GOOGLE_G_SVG = `<svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.3l7.9 6.1C12.3 13.2 17.7 9.5 24 9.5Z"/><path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9.3h12.4c-.5 2.9-2.1 5.3-4.6 7l7.2 5.6c4.2-3.9 6.6-9.6 6.6-16.3Z"/><path fill="#FBBC05" d="M10.5 28.6c-.5-1.4-.7-2.9-.7-4.6s.3-3.2.7-4.6l-7.9-6.1C1 16.5 0 20.1 0 24s1 7.5 2.6 10.7l7.9-6.1Z"/><path fill="#34A853" d="M24 48c6.3 0 11.7-2.1 15.6-5.7l-7.2-5.6c-2 1.4-4.6 2.2-8.4 2.2-6.3 0-11.7-3.7-13.5-9.4l-7.9 6.1C6.5 42.6 14.6 48 24 48Z"/></svg>`;
$("authModal").addEventListener("click", (e) => { if (e.target.id === "authModal") closeAuth(); });
function closeAuth() { $("authModal").hidden = true; }
function openAuth(_reason) { renderAuthLogin(); $("authModal").hidden = false; }
// Return to the SAME page after Google (so a gated salon/trend reopens itself).
function googleLogin() { return sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: location.origin + location.pathname } }); }

function renderAuthLogin() {
  $("authBody").innerHTML = `
    <button class="sheet-close" onclick="closeAuth()">✕</button>
    <div class="brand-mark big">S</div>
    <h3>Log in to Salonn</h3>
    <p class="muted">Continue with your Google account to book appointments.</p>
    <button class="btn google-btn block" id="googleBtn">${GOOGLE_G_SVG}<span>Continue with Google</span></button>
    <p class="muted small" style="margin-top:16px;text-align:center">New to Salonn? We'll create your account automatically.</p>`;
  $("googleBtn").addEventListener("click", googleLogin);
}

// Save the fetched location parts to the customer's row.
async function saveCustomerLocation(uid) {
  if (!userGeo) return;
  try {
    await sb.from("customers").upsert({
      id: uid,
      area: userGeo.area, city: userGeo.city, district: userGeo.district,
      state: userGeo.state, country: userGeo.country, pincode: userGeo.pincode,
      latitude: userGeo.latitude, longitude: userGeo.longitude,
      location_updated_at: new Date().toISOString(),
    }, { onConflict: "id" });
  } catch (_) {}
}

// After a sign-in: close the modal, greet once, and save the location. A phone
// is NOT required here — it's collected at booking time.
let greetedUid = null;
async function afterAuth(sess) {
  if (!sess) return;
  closeAuth();
  if (greetedUid !== sess.user.id) {
    greetedUid = sess.user.id;
    toast("Welcome to Salonn!");
    saveCustomerLocation(sess.user.id); // best-effort, fire & forget
  }
  const cur = document.querySelector(".tab.active")?.dataset.tab;
  if (cur === "profile") renderProfile();
  if (cur === "bookings") renderBookings();
  // Came here to like/comment a post, or rate a trending look → reopen it.
  let pend = null; try { pend = localStorage.getItem("salonn_pending_reel"); } catch (_) {}
  if (pend) { try { localStorage.removeItem("salonn_pending_reel"); } catch (_) {} openReelById(pend); }
  let pendT = null; try { pendT = localStorage.getItem("salonn_pending_trend"); } catch (_) {}
  if (pendT) { try { localStorage.removeItem("salonn_pending_trend"); } catch (_) {} openTrendById(pendT); }
}

/* ── Phone capture at booking time ── */
// Resolves true once the signed-in customer has a phone on file (asking for it
// with a modal if missing). Called right before payment.
async function ensurePhone() {
  if (!session) return false;
  let phone = null;
  try { const { data } = await sb.from("profiles").select("phone").eq("id", session.user.id).maybeSingle(); phone = data?.phone; } catch (_) {}
  if (phone && phone.trim()) return true;
  return await collectPhoneModal();
}
let phoneResolve = null; // lets the Back button cancel the phone prompt cleanly
function collectPhoneModal() {
  return new Promise((resolve) => {
    phoneResolve = resolve;
    $("phoneBody").innerHTML = `
      <button class="sheet-close" id="phClose">✕</button>
      <div class="brand-mark big">S</div>
      <h3>Add your phone number</h3>
      <p class="muted">The salon needs your number to confirm this booking and send reminders.</p>
      <form id="phForm">
        <input type="tel" id="phInput" inputmode="numeric" maxlength="10" placeholder="10-digit phone number" required autofocus>
        <div id="phErr" class="auth-error" hidden></div>
        <button type="submit" class="btn gold block" id="phBtn">Save &amp; continue</button>
      </form>`;
    $("phoneModal").hidden = false;
    const done = (val) => { phoneResolve = null; $("phoneModal").hidden = true; resolve(val); };
    $("phClose").onclick = () => done(false);
    $("phoneModal").onclick = (e) => { if (e.target.id === "phoneModal") done(false); };
    $("phInput").addEventListener("input", (e) => { e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10); });
    $("phForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const phone = $("phInput").value.replace(/\D/g, "");
      const err = $("phErr"), btn = $("phBtn"); err.hidden = true;
      if (!/^\d{10}$/.test(phone)) { err.textContent = "Enter a valid 10-digit phone number."; err.hidden = false; return; }
      btn.disabled = true; btn.textContent = "Please wait…";
      let taken = false;
      try { const { data } = await sb.rpc("phone_is_registered", { p_phone: phone }); taken = data === true; } catch (_) {}
      if (taken) { err.textContent = "This number is already registered. Please use another number."; err.hidden = false; btn.disabled = false; btn.textContent = "Save & continue"; return; }
      try { await sb.from("profiles").update({ phone }).eq("id", session.user.id); } catch (_) {}
      done(true);
    });
  });
}

/* ── Social links ── */
let socialCache = null;
async function applySocial(root) {
  if (!socialCache) { const { data } = await sb.from("app_social").select("*").eq("id", 1).maybeSingle(); socialCache = data || {}; }
  root.querySelectorAll("[data-s]").forEach((a) => {
    const u = (socialCache[a.dataset.s] || "").trim();
    if (u) { a.href = u; a.target = "_blank"; a.rel = "noopener"; a.classList.remove("nolink"); }
    else { a.removeAttribute("href"); a.classList.add("nolink"); }
  });
}

/* ── Back-button handling ──────────────────────────────────────────────────
 * A single-page site has only one history entry, so the browser Back button
 * would leave the site entirely. We trap it: each Back closes the top-most open
 * layer (sheet → auth → reel → salon detail → non-home tab) and stays in the
 * app. Only when nothing is open on the Home tab does Back finally exit.       */
function closeTopLayer() {
  if (!$("phoneModal").hidden) { $("phoneModal").hidden = true; if (phoneResolve) { phoneResolve(false); phoneResolve = null; } return true; }
  if (!$("trendViewer").hidden) { closeTrend(); return true; }
  if (!$("thankYou").hidden) { closeThankYou(); show("bookings"); return true; }
  if (!$("sheetModal").hidden) { closeSheet(); return true; }
  if (!$("authModal").hidden) { $("authModal").hidden = true; return true; }
  if (!$("reelViewer").hidden && !$("rvComments").hidden) { closeComments(); return true; }
  if (!$("reelViewer").hidden) { closeReel(); return true; }
  if (!$("screen-detail").hidden) { closeDetail(); return true; }
  const cur = document.querySelector(".tab.active")?.dataset.tab;
  if (cur && cur !== "home") { show("home"); return true; }
  return false; // nothing left → allow the site to close
}
history.pushState(null, ""); // seed one buffer entry so the first Back is caught
window.addEventListener("popstate", () => {
  if (closeTopLayer()) history.pushState(null, ""); // re-arm for the next Back
});

/* ── Boot ── */
sb.auth.getSession().then(({ data }) => {
  session = data.session;
  // Fallback: if we came back from Google OAuth and the session is already
  // restored, finish the login here too (in case the auth event was missed).
  if (data.session && OAUTH_RETURN) { afterAuth(data.session); cleanUrl(); }
});
sb.auth.onAuthStateChange((event, s) => {
  session = s;
  // Finish the login when: a password login just succeeded (modal open), or we
  // returned from a Google OAuth redirect (event can be SIGNED_IN or
  // INITIAL_SESSION depending on timing).
  const activeLogin = event === "SIGNED_IN" && !$("authModal").hidden;
  const oauthBack = OAUTH_RETURN && s && (event === "SIGNED_IN" || event === "INITIAL_SESSION");
  if (s && (activeLogin || oauthBack)) {
    afterAuth(s);
    if (OAUTH_RETURN) cleanUrl();
  }
  const cur = document.querySelector(".tab.active")?.dataset.tab;
  if (cur === "bookings") renderBookings();
  if (cur === "profile") renderProfile();
});

// Surface a Google OAuth error instead of failing silently. Keep it on screen
// (and in the console + URL) so it can actually be read and diagnosed.
if (OAUTH_RETURN) {
  const p = new URLSearchParams((location.search.slice(1) + "&" + location.hash.slice(1)));
  const e = p.get("error_description") || p.get("error");
  if (e) {
    const msg = decodeURIComponent(e).replace(/\+/g, " ");
    console.error("Salonn Google sign-in error:", msg, "| URL:", location.href);
    setTimeout(() => {
      openAuth();
      const el = $("authErr");
      if (el) { el.textContent = "Google sign-in failed: " + msg; el.hidden = false; }
    }, 400);
  }
}

// Sitelinks search-box entry point: /?q=term pre-fills the salon search.
const _q = new URLSearchParams(location.search).get("q");
if (_q) { const si = $("searchInput"); if (si) si.value = _q; }

loadSalons();   // show salons immediately (applies ?q= filter if present)
loadTrending(); // trending looks section
askLocation();  // auto-trigger the browser's native location permission prompt

// A pending "reopen this post after login" only survives across the Google
// redirect; on any normal load, drop it so it can't fire later unexpectedly.
if (!OAUTH_RETURN) { try { localStorage.removeItem("salonn_pending_reel"); localStorage.removeItem("salonn_pending_trend"); } catch (_) {} }

// Deep link: a shared /s/<name>-<id> (or legacy /?salon=<id>) opens that salon.
function salonIdFromUrl() {
  const m = location.pathname.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  return m ? m[0] : new URLSearchParams(location.search).get("salon");
}
const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
const _path = location.pathname.replace(/\/+$/, "");
if (_path.startsWith("/trending")) {
  const m = _path.match(UUID_RE); if (m) openTrendById(m[0]);
} else {
  const _salon = salonIdFromUrl();
  if (_salon) {
    openSalonById(_salon);
  } else {
    // Section deep links (real URLs → help Google build sitelinks).
    if (_path === "/home") show("home");
    else if (_path === "/explore") show("explore");
    else if (_path === "/bookings") show("bookings");
    else if (_path === "/profile") show("profile");
    else if (_path === "/login") openAuth("login");
  }
}
