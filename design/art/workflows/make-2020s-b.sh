#!/usr/bin/env bash
# The 2020s pack photo, second batch: bolder ideas that say "this decade", in the app's purple and magenta.
set -euo pipefail
COMFY=~/comfy/mcp/official-env/bin/comfy
STYLE="Realistic, high-end sports advertising photograph, full-frame camera, shallow depth of field, bold contrast, deep navy shadows with vivid purple and magenta light. No text, no letters, no numbers, no logos, no brand names, no sponsor boards, no club badges, no recognisable faces."
declare -A SUBJ=(
  [b-torches]="A packed football stadium at night with tens of thousands of fans holding up their phone torches, a sea of tiny white lights across the stands, the pitch glowing green below."
  [b-cutouts]="Rows of cardboard cut-out fans filling the seats of an empty football stadium under floodlights, a lone ball on the pitch beyond, eerie and quiet."
  [b-monitor]="A pitchside video review monitor on a stand beside a floodlit football pitch at night, its screen glowing, rain in the light, the empty penalty area beyond."
  [b-walkout]="A footballer seen from behind, in silhouette, walking out of the tunnel into a blaze of white floodlight and purple smoke, the crowd a blur of light, plain kit with no number."
  [b-neonball]="A football lit by purple and magenta rim light on wet black grass, droplets glittering, dark stadium behind, dramatic studio-quality lighting."
  [b-boots]="Close-up of a footballer's boots and a ball on a wet floodlit pitch at night, studs kicking up droplets, plain boots with no branding, purple and pink reflections in the water."
  [b-aerial]="A drone shot looking down on a modern football stadium at dusk, the pitch a perfect green rectangle, the sky a gradient of deep purple to magenta, city lights around it."
  [b-confetti]="A floodlit football pitch at night with purple and pink confetti falling through the light after a final, a ball resting on the grass in the foreground."
)
seed=3100
for name in b-torches b-cutouts b-monitor b-walkout b-neonball b-boots b-aerial b-confetti; do
  cp flux2-t2i.json "2020s-$name.json"
  "$COMFY" workflow set-slot "2020s-$name.json" "98.text=${SUBJ[$name]} $STYLE" "98.width=1536" "98.height=1024" "98.noise_seed=$seed" "9.filename_prefix=footballwhoami/2020s-$name" >/dev/null
  seed=$((seed + 1))
done
echo "wrote 8 workflows"
