# Salonn Website (salonn.hair)

Marketing + discovery site for Salonn. It talks to the **same Supabase backend**
as the app. Visitors can **enable location → see nearby approved salons** with no
login; **booking requires an account**; booking payment, refund tracking and
rescheduling live **in the app** (with Download CTAs + QR here).

Plain static site (HTML/CSS/JS) — **no build step**, so it hosts free anywhere.

## Files
- `index.html` — page
- `styles.css` — Carbon/Gold design (matches the app)
- `app.js` — Supabase client, geolocation, nearby salons, auth
- `salonn_playstore_qr.png` — Play Store QR

The Supabase **anon** key in `app.js` is public by design; Row-Level Security
protects the data (anon can only read `approved` salons).

---

## Deploy free on Vercel (recommended)

1. Create a free account at **vercel.com** (sign in with GitHub).
2. Put this folder in a **GitHub repo** (e.g. `salonn-website`):
   ```bash
   cd "Salonn Website"
   git init && git add . && git commit -m "Salonn website"
   git branch -M main
   git remote add origin https://github.com/<you>/salonn-website.git
   git push -u origin main
   ```
3. In Vercel → **Add New → Project → Import** that repo.
   - Framework preset: **Other** · Build command: **(leave empty)** · Output dir: **(leave empty / `.`)**
   - Click **Deploy**. You get a `*.vercel.app` URL in ~20s.
4. Add your domain: Vercel → Project → **Settings → Domains → Add `salonn.hair`**.
   Vercel shows the DNS records — add them at your domain registrar
   (an `A` record to `76.76.21.21`, or set the registrar's nameservers to Vercel).
   HTTPS is issued automatically.

### Or deploy free on GitHub Pages
Push to GitHub → repo **Settings → Pages → Source: `main` / root** → save.
Site goes live at `https://<you>.github.io/salonn-website/`. For `salonn.hair`,
add a `CNAME` file with `salonn.hair` and point the domain's DNS to GitHub Pages.

**Drag-and-drop (no Git):** vercel.com/new → drop this folder → Deploy.

---

## After deploying — one Supabase setting for Google login
Supabase → **Authentication → URL Configuration** → add your site to
**Redirect URLs**: `https://salonn.hair` (and the `*.vercel.app` URL). Without
this, "Continue with Google" won't redirect back. Email/password login works
without any change.

## Roadmap (phase 2)
- Full in-browser booking with **Razorpay web checkout** (reuses the existing
  `create-razorpay-order` / `verify-razorpay-payment` edge functions).
- Service selection + slot picker on web.
