# European Sudanese Reef — Website

Single-file static site (Home, About, Members, Contact, Policy) with client-side routing.

## Deploy to Vercel (fastest)

**Option A — Vercel CLI (recommended, ~1 min)**
```bash
npm i -g vercel        # once
cd european-sudanese-reef-site
vercel                 # follow prompts -> gives a preview URL
vercel --prod          # promotes to your shareable *.vercel.app link
```

**Option B — Dashboard (no terminal)**
1. Push this folder to a GitHub repo.
2. Go to vercel.com → Add New… → Project → Import the repo → Deploy.
3. Vercel gives you a live link like `european-sudanese-reef.vercel.app`.

No build step or framework is needed — it's static HTML, so just deploy as-is.

## Notes
- Images currently load from the original site's URLs. To self-host, drop the
  photos into an `/assets` folder and update the `src` / `IMG` values.
- The contact form is a demo; connect it to Formspree or your inbox to go live.
