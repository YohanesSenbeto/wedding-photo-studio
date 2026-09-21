#!/usr/bin/env bash
# Generate a wedding album end-to-end from the CLI (no browser needed).
# Usage:
#   scripts/generate-album.sh "Joni" "Astu" "03 MAY 2026" "Addis Ababa" [photoId...]
#
# Requires the web app to be running (SERVER_URL, default http://localhost:3000)
# and the local Photoshop agent to be connected.
set -euo pipefail

GROOM="${1:?groom name required}"
BRIDE="${2:?bride name required}"
DATE="${3:?wedding date required}"
LOCATION="${4:?location required}"
shift 4
PHOTO_IDS=("$@")

BASE="${SERVER_URL:-http://localhost:3000}"

ALBUM_JSON=$(curl -fsS -X POST "$BASE/api/album/create" \
  -H "Content-Type: application/json" \
  -d "$(node -e 'console.log(JSON.stringify({groomName:process.argv[1],brideName:process.argv[2],weddingDate:process.argv[3],location:process.argv[4]}))' "$GROOM" "$BRIDE" "$DATE" "$LOCATION")")

ALBUM_ID=$(node -e "console.log(JSON.parse(process.argv[1]).album.id)" "$ALBUM_JSON")
echo "[album] created $ALBUM_ID"

if [[ ${#PHOTO_IDS[@]} -gt 0 ]]; then
  # Round-robin the photos across the 12 pages (cover gets the first photo).
  node - "$ALBUM_ID" "$BASE" "${PHOTO_IDS[@]}" <<'EOF'
const [albumId, base, ...photoIds] = process.argv.slice(2);
const templates = [
  "01_Cover","02_Getting_Ready","03_Bride","04_Groom","05_Ceremony",
  "06_Family","07_Couple_Portraits","08_Reception","09_Dance","10_Details",
  "11_Candid","12_Final_Portrait",
];
const slotCounts = { "01_Cover":1, "02_Getting_Ready":2, "03_Bride":1, "04_Groom":1,
  "05_Ceremony":4, "06_Family":4, "07_Couple_Portraits":2, "08_Reception":3,
  "09_Dance":1, "10_Details":4, "11_Candid":4, "12_Final_Portrait":1 };
const assignments = {};
let idx = 0;
for (const key of templates) {
  const count = slotCounts[key] || 1;
  const ids = [];
  for (let s = 0; s < count; s++) ids.push(photoIds[idx++ % photoIds.length]);
  assignments[key] = ids;
}
(async () => {
  const res = await fetch(`${base}/api/album/${albumId}/assign`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assignments }),
  });
  if (!res.ok) throw new Error(`assign failed: ${res.status} ${await res.text()}`);
  const gen = await fetch(`${base}/api/album/${albumId}/generate`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quality: "PRINT", dpi: 300, outputFormats: ["JPG", "PSD"] }),
  });
  const body = await gen.json();
  if (!gen.ok) throw new Error(`generate failed: ${gen.status} ${JSON.stringify(body)}`);
  console.log(`[album] queued job ${body.job.id} — Photoshop will assemble it now`);
})();
EOF
else
  echo "[album] No photo ids given — assign photos in the UI, then POST /api/album/$ALBUM_ID/generate"
fi
