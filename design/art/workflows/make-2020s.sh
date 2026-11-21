#!/usr/bin/env bash
# The 2020s pack photo: four candidates in the real-photo style of the 2019 pack photos.
# Run from this folder with ComfyUI up: ./make-2020s.sh ; each job JSON is kept beside its prompt.
set -euo pipefail
COMFY=~/comfy/mcp/official-env/bin/comfy
STYLE="Realistic sports photograph taken on a full-frame camera with a fast lens, shallow depth of field, rich contrast, modern night-match atmosphere with cool blue light and a hint of magenta in the haze. No text, no letters, no logos, no brand names, no sponsor boards, no club badges, no recognisable people."
declare -A SUBJ=(
  [2020s-ball]="A modern white match ball resting on the centre spot of a pristine floodlit pitch at night, camera low to the grass, the stadium glowing out of focus behind it."
  [2020s-tunnel]="The view from inside a players' tunnel looking out onto a bright floodlit pitch at night, the packed stands a soft blur of light."
  [2020s-net]="A football bulging the back of the net at night, floodlights flaring through the netting, grass and stands softly out of focus."
  [2020s-stadium]="A wide view across a huge modern stadium at night with an LED light show sweeping over the stands and the pitch lit vivid green."
)
seed=2020
for name in 2020s-ball 2020s-tunnel 2020s-net 2020s-stadium; do
  cp flux2-t2i.json "$name.json"
  "$COMFY" workflow set-slot "$name.json" "98.text=${SUBJ[$name]} $STYLE" "98.width=1536" "98.height=1024" "98.noise_seed=$seed" "9.filename_prefix=footballwhoami/$name" >/dev/null
  seed=$((seed + 1))
done
echo "wrote 4 workflows"
