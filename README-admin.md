# Members admin dashboard

A password-protected page at **`/admin`** lets you add, and remove, members
(name, title, and photo) without touching code. Each change is saved straight
into this repository — the photo goes into `assets/img/`, the member list into
`members.json` — and the site redeploys automatically, so new members appear on
the Members page about a minute later.

## One-time setup (required before it works)

The dashboard needs two secrets configured in Vercel. Until they're set, the
`/admin` page loads but shows *"Server not configured."*

### 1. Create a GitHub token (lets the dashboard save changes)

1. Go to **https://github.com/settings/personal-access-tokens/new** (Fine-grained token).
2. **Token name:** `esr-members-admin` · **Expiration:** your choice (e.g. 1 year).
3. **Resource owner:** `AhmedMohamed809` · **Repository access → Only select repositories → `european-sudanese-reef`**.
4. **Repository permissions → Contents → Read and write.** (Leave everything else as *No access*.)
5. Click **Generate token** and copy it (starts with `github_pat_…`). You won't see it again.

### 2. Add the secrets to Vercel

In the Vercel project (**european-sudanese-reef**) → **Settings → Environment
Variables**, add these (Production, Preview, Development):

| Name             | Value                                             |
| ---------------- | ------------------------------------------------- |
| `ADMIN_EMAIL`    | the email the admin logs in with                  |
| `ADMIN_PASSWORD` | a strong password you choose for logging in       |
| `GITHUB_TOKEN`   | the fine-grained token from step 1                |

Then **redeploy** (Deployments → ⋯ → Redeploy) so the new variables take effect.

**Login vs. saving:** logging in only needs `ADMIN_EMAIL` + `ADMIN_PASSWORD`.
Actually *saving* members (add/remove) also needs `GITHUB_TOKEN`. If you log in
before setting the token, the dashboard says so instead of breaking.
`ADMIN_EMAIL` is optional — if you leave it out, any email works as long as the
password matches.

> Optional overrides (defaults shown): `GH_OWNER=AhmedMohamed809`,
> `GH_REPO=european-sudanese-reef`, `GH_BRANCH=main`.

## Using it

1. Go to **`https://<your-site>/admin`** — or click **"Admin login"** in the site footer.
2. Log in with your `ADMIN_EMAIL` + `ADMIN_PASSWORD`.
3. **Add a member:** type the name, an optional title (defaults to "Member"),
   pick a photo (it's automatically resized before upload), then **إضافة العضو**.
4. **Remove a member:** press **حذف** next to them.
5. Changes commit to the repo and go live after the automatic redeploy (~1 min).

## How it works

- `admin.html` — the dashboard UI (login + add/remove). No secrets live here.
- `api/login.js` — validates the admin email + password (no GitHub token needed).
- `api/add-member.js`, `api/delete-member.js`, `api/members.js` — Vercel
  serverless functions. They validate the password server-side and use the
  GitHub token (server-side only, never sent to the browser) to commit changes.
- `members.json` — the member list the site reads from. The Members page loads
  it at runtime; if it can't be fetched, it falls back to the built-in list in
  `index.html`.

## Security notes

- The GitHub token is scoped to **one repo, Contents only** — minimal blast radius.
- Pick a **strong** `ADMIN_PASSWORD`; there's no rate-limiting on login.
- `admin.html` is marked `noindex` so search engines skip it.
