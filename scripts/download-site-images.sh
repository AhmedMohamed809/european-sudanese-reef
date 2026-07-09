#!/usr/bin/env bash
#
# Downloads every image the site references from the live WordPress host into
# assets/img/, preserving the original filenames. Run this locally (it needs
# outbound access to europeansudanesereef.com), then commit the assets/img/
# folder. After that, point the site at the local copies by changing the image
# base in index.html (see README-images.md) — one line.
#
# Usage:  bash scripts/download-site-images.sh
#
set -u

BASE="https://europeansudanesereef.com/wp-content/uploads/2026/04"
DEST="assets/img"

# Run from the repo root regardless of where the script is invoked from.
cd "$(dirname "$0")/.." || exit 1
mkdir -p "$DEST"

FILES=(
  "11Recovered.png"
  "2222Untitled-1-Recovered22.png"
  "23overed.png"
  "26331746351_9bd05e2dfb_b.jpg"
  "2ered.png"
  "342fgd.png"
  "492486871_1089952626499716_7330707620141970626_n.jpg"
  "EUROPIAN-SUDANESE-REEF.webp"
  "Undddd.png"
  "Unqw2titled-1.png"
  "Untiaas3435435tled-1.png"
  "Untitderrrreled-1.png"
  "Untitl66756575786567ed-1.png"
  "Untitle4vered.png"
  "Untitled-1-Rec333333333333333overed.png"
  "Untitled-1-Rec33345overed.png"
  "Untitled-1-Reco17vered.png"
  "Untitled-1-Recov223ered6.png"
  "Untitled-1-Recove888red.png"
  "Untitled-1-Recovered389.png"
  "Untitled-1-Recovered990.png"
  "Untitled-14345rsdgdgdfg.png"
  "Untitled-1789797897078996786.png"
  "Untitled-1878544.png"
  "Untitled-1dfgsdgsdgsdgsdg.png"
  "Untitled-1qqqqqqqqqq.png"
  "Untitled-1qw24s.png"
  "Untitled-2-1024x308.png"
  "Untitled-37ered.png"
  "Untitled-design.png"
  "Untitljhhkjhhjhed-1.png"
  "Untitlooooooed-1.png"
  "Untitlqq23sdsdsed-1.png"
  "a1.png"
  "a2.png"
  "abbas35.png"
  "cd.png"
  "e1.png"
  "e2.png"
  "e3.png"
  "e4.png"
  "fresh-product-market-sale111111111111111111-scaled.png"
  "image-1.jpeg"
  "image-2.jpeg"
  "image-3.jpeg"
  "image.jpeg"
  "q111.jpg"
  "save.jpg"
  "we.png"
)

ok=0; fail=0; skip=0
failed_list=()

for f in "${FILES[@]}"; do
  out="$DEST/$f"
  if [ -s "$out" ]; then
    echo "skip (exists): $f"
    skip=$((skip+1))
    continue
  fi
  # -f: fail on HTTP errors, -L: follow redirects, --create-dirs just in case
  if curl -fSL --create-dirs --retry 3 --retry-delay 2 --max-time 60 \
       -o "$out" "$BASE/$f"; then
    echo "ok:   $f"
    ok=$((ok+1))
  else
    echo "FAIL: $f"
    rm -f "$out"
    fail=$((fail+1))
    failed_list+=("$f")
  fi
done

echo
echo "----------------------------------------"
echo "Downloaded: $ok   Skipped: $skip   Failed: $fail   (of ${#FILES[@]})"
if [ "$fail" -gt 0 ]; then
  echo "Failed files (likely removed from the host):"
  printf '  - %s\n' "${failed_list[@]}"
fi
echo "Images are in: $DEST/"
echo "Next: commit the folder, then switch index.html to local paths (see README-images.md)."
