# salonn — Landing Page

A single-page marketing site for the **salonn** app (Book Appointment near by Salon).
Pure static HTML/CSS/JS — no build step, no dependencies. Deploys anywhere, built for
**GitHub Pages + custom domain**.

## Files
| File | Purpose |
|------|---------|
| `index.html` | The main page |
| `privacy.html` | Privacy policy page (content loaded from Supabase) |
| `styles.css` | All styling (yellow/black brand, white theme) |
| `supabase.js` | Supabase URL + **public** anon key + tiny fetch helper |
| `script.js` | Live stats (count-up), Play Store link, footer year |
| `assets/app-home.png` | App screenshot shown in the phone mockup |
| `favicon.svg` | Tab icon |
| `.nojekyll` | Tells GitHub Pages to serve files as-is |
| `CNAME` | Your custom domain (edit this) |

## Backend (Supabase)
The site reads live data from Supabase using the **public anon key** (safe to ship).
Everything is editable from the Supabase dashboard → **Table editor**:

| Table | What it controls |
|-------|------------------|
| `stats` | The animated hero numbers. Edit `value`, `label`, `prefix`, `suffix`, `decimals`, `display_order`. |
| `app_settings` | Row `play_store_url` → the link every "Get the App" button opens. |
| `privacy_policy` | The `content` (HTML) shown on `privacy.html`. |

Read access is public (RLS "select" policy + grant); **writes are blocked** for the
anon key, so only you (via the dashboard) can change these values. If Supabase is ever
unreachable, the site falls back to the static numbers/link baked into the HTML.

> **Security:** the `sbp_...` access token you shared is a **secret admin token**. It was
> used once, locally, to create these tables and is **not** stored anywhere in this project.
> Please **revoke/rotate it** in Supabase → Account → Access Tokens.

## 1. Set your Play Store link
**Preferred:** set it in Supabase → `app_settings` → `play_store_url`. It updates the live
site instantly, no redeploy. As a backup, `script.js` also has a fallback constant:

```js
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=YOUR.PACKAGE.NAME";
```

Every "Get the App / Google Play / Download" button uses this automatically.

## 2. Preview locally
Just open `index.html` in a browser — or run a tiny server:

```bash
python -m http.server 8000
```
Then visit http://localhost:8000

## 3. Deploy to GitHub Pages
1. Create a repo on GitHub and push this `website/` folder's contents to it
   (or push the whole project and set Pages source to `/website`).
2. On GitHub: **Settings → Pages → Build and deployment**
   - Source: *Deploy from a branch*
   - Branch: `main` (folder: `/root` if files are at repo root, or `/website`)
3. Your site goes live at `https://<username>.github.io/<repo>/`

## 4. Connect your custom domain (after you buy it)
1. Edit the `CNAME` file — put your bare domain, e.g. `salonn.app`
2. At your domain registrar, add DNS records:
   - Four `A` records for the apex domain pointing to GitHub Pages:
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - One `CNAME` record for `www` → `<username>.github.io`
3. On GitHub: **Settings → Pages → Custom domain**, enter your domain, and
   tick **Enforce HTTPS** once the certificate is issued.

That's it — the site is live on your own domain. 🎉
