# isometric-training

Static gallery of the isometric hold catalog. Dark mono. Hosted on GitHub Pages.

`index.html` is generated from `training.movements` by `build.mjs`.

## Regenerate (after more exercise images are rendered)
```
set -a; source /home/kai/.config/hhg-credentials/empty-words-training.env; set +a
node build.mjs
git commit -am "chore: rebuild gallery" && git push
```
Images are served from Supabase Storage (permanent public URLs).
