# Hosting the site images locally

All the site's photos currently load from the live WordPress host
(`https://europeansudanesereef.com/wp-content/uploads/2026/04/`). To keep local
copies in this repo instead — so the site no longer depends on WordPress — do
the following.

## 1. Download every image into `assets/img/`

Run this from the repo root, on a machine with normal internet access:

```bash
bash scripts/download-site-images.sh
```

It fetches all 49 referenced images into `assets/img/`, keeping the original
filenames, and prints a summary (downloaded / skipped / failed). Re-running it
skips files already present, so it's safe to run again.

## 2. Commit the images

```bash
git add assets/img
git commit -m "Add local copies of site images"
```

## 3. Point the site at the local copies

Every image URL in `index.html` uses the same base
(`https://europeansudanesereef.com/wp-content/uploads/2026/04/`). Switch them
all to the local folder with one find-and-replace:

```bash
sed -i 's#https://europeansudanesereef.com/wp-content/uploads/2026/04/#assets/img/#g' index.html
```

That updates both the inline `<img src>` tags and the `IMG` base used for the
member/leadership photos. Commit and push:

```bash
git add index.html
git commit -m "Serve images from local assets/img instead of WordPress"
```

> Tell me once `assets/img/` is committed and I can do step 3 for you in a PR.
> I can't run steps 1–2 myself because this environment's network policy blocks
> `europeansudanesereef.com`.
