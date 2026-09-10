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
let activeCat = "All", selectedServices = [];

/* ── Toast ── */
let toastT;
function toast(msg) {
  const t = $("toast"); t.textContent = msg; t.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => (t.hidden = true), 2600);
}

/* ── Tab router ── */
const screens = { home: "screen-home", explore: "screen-explore", bookings: "screen-bookings", profile: "screen-profile" };
function show(tab) {
  for (const k in screens) $(screens[k]).hidden = k !== tab;
  $("screen-detail").hidden = true;
  document.querySelectorAll(".tab").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
  if (tab === "explore" && !reelsLoaded) loadReels();
  if (tab === "bookings") renderBookings();
  if (tab === "profile") renderProfile();
}
document.querySelectorAll(".tab").forEach((b) => b.addEventListener("click", () => show(b.dataset.tab)));

/* ── Location + salons ── */
$("locBtn").addEventListener("click", askLocation);
$("getAppTop").addEventListener("click", () => window.open(PLAY_URL, "_blank"));

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
async function reverseGeocode(lat, lng) {
  try {
    const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
    const j = await r.json();
    $("locLabel").textContent = j.locality || j.city || j.principalSubdivision || "Near you";
  } catch { $("locLabel").textContent = "Near you"; }
}
function distanceKm(a, b, c, d) {
  const R = 6371, r = (x) => (x * Math.PI) / 180, dLat = r(c - a), dLng = r(d - b);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}
async function loadSalons() {
  $("salonList").innerHTML = `<div class="empty">Loading salons…</div>`;
  const { data, error } = await sb.from("salons")
    .select("id,name,area,city,rating,image_url,latitude,longitude,address").eq("status", "approved");
  if (error || !data) { $("salonList").innerHTML = `<div class="empty">Couldn't load salons.</div>`; return; }
  allSalons = data.map((s) => ({ ...s, dist: userPos && s.latitude && s.longitude ? distanceKm(userPos.lat, userPos.lng, s.latitude, s.longitude) : null }));
  allSalons.sort((a, b) => (a.dist != null && b.dist != null ? a.dist - b.dist : (b.rating || 0) - (a.rating || 0)));
  renderSalons();
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
  let list = allSalons.filter((s) => {
    const hay = `${s.name} ${s.area} ${s.city}`.toLowerCase();
    return (!q || hay.includes(q)) && (activeCat === "All" || hay.includes(activeCat.toLowerCase()));
  });
  const feat = $("featured"), el = $("salonList");
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
$("searchInput").addEventListener("input", renderSalons);

/* categories */
const CATS = ["All", "Haircut", "Beard", "Facial", "Spa", "Colour", "Bridal", "Massage"];
$("cats").innerHTML = CATS.map((c, i) => `<button class="chip ${i === 0 ? "active" : ""}" data-cat="${c}">${c}</button>`).join("");
$("cats").querySelectorAll(".chip").forEach((b) => b.addEventListener("click", () => {
  activeCat = b.dataset.cat;
  $("cats").querySelectorAll(".chip").forEach((x) => x.classList.toggle("active", x === b));
  renderSalons();
}));

/* ── Explore / reels ── */
async function loadReels() {
  const g = $("reelGrid");
  const { data, error } = await sb.from("reels")
    .select("id,salon_id,media_type,image_urls,video_url,caption,like_count,views,salon:salons(name,image_url,status,area,city,rating,latitude,longitude,address)")
    .order("created_at", { ascending: false }).limit(40);
  if (error || !data) { g.innerHTML = `<div class="empty">Couldn't load reels.</div>`; return; }
  const rows = data.filter((r) => r.salon && r.salon.status === "approved");
  reelsLoaded = true;
  if (!rows.length) { g.innerHTML = `<div class="empty">No reels yet.</div>`; return; }
  g.innerHTML = "";
  for (const r of rows) {
    const thumb = (r.image_urls && r.image_urls[0]) || r.salon?.image_url;
    const isPost = (r.media_type || "").toLowerCase() !== "video";
    const badge = isPost
      ? ((r.image_urls || []).length > 1 ? "▦" : "▣")
      : "▶";
    const div = document.createElement("div");
    div.className = "reel";
    div.innerHTML = `${thumb ? `<img src="${esc(thumb)}" loading="lazy">` : ""}<div class="ov"></div>
      <div class="badge">${badge}</div>
      <div class="cap">❤ ${r.like_count || 0} · ${esc(r.salon?.name || "")}</div>`;
    div.addEventListener("click", () => openReel(r));
    g.appendChild(div);
  }
}

/* ── Reel / post viewer (swipeable image posts + video reels) ── */
function openReel(r) {
  const imgs = (r.image_urls && r.image_urls.length) ? r.image_urls
    : (r.salon?.image_url ? [r.salon.image_url] : []);
  const isVideo = (r.media_type || "").toLowerCase() === "video" && r.video_url;
  let i = 0;
  const stage = $("rvStage"), dots = $("rvDots");

  function paint() {
    if (isVideo) {
      stage.innerHTML = `<video src="${esc(r.video_url)}" autoplay loop playsinline controls></video>`;
      dots.innerHTML = "";
    } else {
      stage.innerHTML = `<img src="${esc(imgs[i] || "")}">
        ${imgs.length > 1 ? `<button class="rv-arrow l"></button><button class="rv-arrow r"></button>` : ""}`;
      dots.innerHTML = imgs.map((_, k) => `<i class="${k === i ? "on" : ""}"></i>`).join("");
      const l = stage.querySelector(".rv-arrow.l"), rr = stage.querySelector(".rv-arrow.r");
      if (l) l.onclick = () => { i = (i - 1 + imgs.length) % imgs.length; paint(); };
      if (rr) rr.onclick = () => { i = (i + 1) % imgs.length; paint(); };
    }
  }
  paint();

  $("rvInfo").innerHTML = `
    <div class="rv-salon">${esc(r.salon?.name || "Salon")}
      <button class="bk" id="rvBook">Book</button></div>
    ${r.caption ? `<div class="rv-cap">${esc(r.caption)}</div>` : ""}
    <div class="rv-likes">❤ ${r.like_count || 0} · ${r.views || 0} views</div>`;
  $("rvBook").onclick = () => { closeReel(); if (r.salon) openSalon({ id: r.salon_id, ...r.salon }); };
  $("reelViewer").hidden = false;

  // Swipe (touch) between post images.
  let sx = 0;
  stage.ontouchstart = (e) => (sx = e.touches[0].clientX);
  stage.ontouchend = (e) => {
    if (isVideo || imgs.length < 2) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (dx < -40) { i = (i + 1) % imgs.length; paint(); }
    else if (dx > 40) { i = (i - 1 + imgs.length) % imgs.length; paint(); }
  };
}
function closeReel() { $("rvStage").innerHTML = ""; $("reelViewer").hidden = true; }
$("rvClose").addEventListener("click", closeReel);

/* ── Salon detail ── */
async function openSalon(s) {
  selectedServices = [];
  $("screen-detail").hidden = false;
  const area = esc([s.area, s.city].filter(Boolean).join(", ") || "Nearby");
  const dist = s.dist != null ? ` · ${s.dist.toFixed(1)} km away` : "";
  $("detailBody").innerHTML = `
    <div class="d-hero">
      <button class="d-back" onclick="closeDetail()">✕</button>
      <img id="dHeroImg" src="${esc(s.image_url || "")}" onerror="this.style.background='#1f1f1f'">
      <div class="d-dots" id="dDots"></div>
    </div>
    <div class="d-body">
      <div class="d-title">${esc(s.name || "Salon")}</div>
      <div class="d-row">★ <b style="color:var(--gold)">${s.rating || 0}</b> · ${area}${dist}</div>
      ${s.address ? `<div class="d-row">📍 ${esc(s.address)}</div>` : ""}
      <div class="sec-head" style="margin-top:20px"><h2>Choose services</h2></div>
      <div id="svcList"><div class="empty">Loading services…</div></div>
      <div id="detailReels"></div>
      <div id="revSection"></div>
    </div>
    <div class="d-note">🔒 Booking, secure payment, refund tracking &amp; rescheduling happen in the <b>Salonn app</b> for your security and live updates.</div>`;
  $("detailPrice").textContent = "₹0";
  $("detailBook").onclick = () => bookNow(s);
  loadGallery(s.id);
  loadServices(s.id);
  loadDetailReels(s);
  loadReviews(s.id);
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
  if (!rows.length) { el.innerHTML = ""; return; }
  const avg = (rows.reduce((a, r) => a + (r.rating || 0), 0) / rows.length).toFixed(1);
  const stars = (n) => "★★★★★☆☆☆☆☆".slice(5 - Math.round(n), 10 - Math.round(n));
  el.innerHTML = `
    <div class="sec-head" style="margin-top:26px"><h2>Ratings &amp; reviews</h2></div>
    <div class="rev-sum">
      <div class="rev-avg">${avg}<small>${rows.length} review${rows.length > 1 ? "s" : ""}</small></div>
      <div><div class="rev-stars">${stars(avg)}</div>
      <div class="muted" style="font-size:13px;margin-top:4px">Based on customer visits</div></div>
    </div>
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
}
function isVideoUrl(u) { return /\.(mp4|mov|webm|m4v)(\?|$)/i.test(u || ""); }
function timeAgo(t) {
  const d = (Date.now() - new Date(t).getTime()) / 1000;
  if (d < 3600) return Math.max(1, Math.floor(d / 60)) + "m ago";
  if (d < 86400) return Math.floor(d / 3600) + "h ago";
  if (d < 2592000) return Math.floor(d / 86400) + "d ago";
  return Math.floor(d / 2592000) + "mo ago";
}
window.closeDetail = () => { $("screen-detail").hidden = true; };

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
  const { data, error } = await sb.from("services")
    .select("id,name,price,duration_minutes,category,active").eq("salon_id", id);
  const el = $("svcList");
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
async function bookNow(s) {
  if (!session) { openAuth("book"); return; }
  window.open(PLAY_URL, "_blank");
  toast("Finish booking with secure payment in the app.");
}

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
async function renderProfile() {
  const el = $("profileBody");
  const name = session?.user?.user_metadata?.full_name || (session ? session.user.email.split("@")[0] : "Guest");
  const initial = (name || "S").trim()[0].toUpperCase();
  const menu = [
    { i: "▸", t: "Get the Salonn app", act: () => window.open(PLAY_URL, "_blank") },
    { i: "🛡", t: "Privacy Policy", act: () => window.open(SUPABASE_URL + "/functions/v1/legal?doc=privacy", "_blank") },
    { i: "📄", t: "Terms & Conditions", act: () => window.open(SUPABASE_URL + "/functions/v1/legal?doc=terms", "_blank") },
    { i: "✉", t: "Help & support", act: () => (location.href = "mailto:support.salonn@gmail.com") },
  ];
  el.innerHTML = `<div class="p-top">
      <div class="avatar">${esc(initial)}</div>
      <div class="p-name">${esc(name)}</div>
      ${session ? `<div class="p-mail">${esc(session.user.email)}</div>` : ""}
      ${session ? "" : `<button class="btn gold" style="margin-top:14px" id="pLogin">Log in / Create account</button>`}
    </div>
    <div class="menu">
      ${menu.map((m, k) => `<div class="mi" data-mi="${k}"><span class="ico">${m.i}</span>${m.t}<span class="arr">›</span></div>`).join("")}
      ${session ? `<div class="mi danger" id="pLogout"><span class="ico">⏻</span>Log out<span class="arr">›</span></div>` : ""}
    </div>
    <div class="social" id="pSocial">
      <a data-s="instagram" aria-label="Instagram" href="#">${SOCIAL_SVG.instagram}</a>
      <a data-s="facebook" aria-label="Facebook" href="#">${SOCIAL_SVG.facebook}</a>
      <a data-s="x" aria-label="X" href="#">${SOCIAL_SVG.x}</a>
      <a data-s="youtube" aria-label="YouTube" href="#">${SOCIAL_SVG.youtube}</a>
    </div>
    <div class="muted small" style="text-align:center;padding-bottom:8px">Salonn · salonn.hair</div>
    <div class="pad"></div>`;
  el.querySelectorAll(".mi[data-mi]").forEach((n) => n.addEventListener("click", () => menu[+n.dataset.mi].act()));
  if ($("pLogin")) $("pLogin").addEventListener("click", () => openAuth("login"));
  if ($("pLogout")) $("pLogout").addEventListener("click", async () => { await sb.auth.signOut(); toast("Logged out"); });
  applySocial(el);
}

function gate(icon, title, sub) {
  return `<div class="info-card"><div class="big-emoji">📅</div><h3>${title}</h3>
    <p class="muted" style="margin-top:4px">${sub}</p>
    <button class="btn gold block" style="margin-top:18px" id="gateLogin">Log in / Create account</button>
    <a class="link" style="display:inline-block;margin-top:14px" href="${PLAY_URL}" target="_blank">Get the app →</a></div><div class="pad"></div>`;
}
function wireGate() { const g = $("gateLogin"); if (g) g.addEventListener("click", () => openAuth("login")); }

/* ── Auth ── */
let authMode = "login";
document.querySelector("[data-close-auth]").addEventListener("click", () => ($("authModal").hidden = true));
$("authModal").addEventListener("click", (e) => { if (e.target.id === "authModal") $("authModal").hidden = true; });
$("authSwitch").addEventListener("click", () => setMode(authMode === "login" ? "signup" : "login"));
function openAuth(reason) { setMode(reason === "book" ? "signup" : "login"); $("authModal").hidden = false; }
function setMode(m) {
  authMode = m; const su = m === "signup";
  $("authName").hidden = !su;
  $("authTitle").textContent = su ? "Create your account" : "Welcome back";
  $("authSub").textContent = su ? "Join Salonn to book appointments." : "Log in to book your appointment.";
  $("authSubmit").textContent = su ? "Create account" : "Log in";
  $("authSwitchText").textContent = su ? "Already have an account?" : "New to Salonn?";
  $("authSwitch").textContent = su ? "Log in" : "Create an account";
  $("authError").hidden = true;
}
$("authForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = $("authEmail").value.trim(), password = $("authPassword").value, name = $("authName").value.trim();
  const err = $("authError"); err.hidden = true; $("authSubmit").disabled = true;
  try {
    let res;
    if (authMode === "signup") res = await sb.auth.signUp({ email, password, options: { data: { full_name: name || email.split("@")[0] } } });
    else res = await sb.auth.signInWithPassword({ email, password });
    if (res.error) throw res.error;
    if (authMode === "signup" && !res.data.session) { err.textContent = "Check your email to confirm, then log in."; err.hidden = false; }
    else { $("authModal").hidden = true; toast("Welcome to Salonn!"); }
  } catch (ex) { err.textContent = ex.message || "Something went wrong."; err.hidden = false; }
  finally { $("authSubmit").disabled = false; setMode(authMode); }
});
$("googleBtn").addEventListener("click", () => sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: location.origin } }));

/* ── Social links ── */
let socialCache = null;
async function applySocial(root) {
  if (!socialCache) { const { data } = await sb.from("app_social").select("*").eq("id", 1).maybeSingle(); socialCache = data || {}; }
  root.querySelectorAll("[data-s]").forEach((a) => { const u = socialCache[a.dataset.s]; if (u) { a.href = u; a.target = "_blank"; a.rel = "noopener"; } });
}

/* ── Boot ── */
sb.auth.getSession().then(({ data }) => { session = data.session; });
sb.auth.onAuthStateChange((_e, s) => {
  session = s;
  const cur = document.querySelector(".tab.active")?.dataset.tab;
  if (cur === "bookings") renderBookings();
  if (cur === "profile") renderProfile();
});

loadSalons();   // show salons immediately
askLocation();  // auto-trigger the browser's native location permission prompt
