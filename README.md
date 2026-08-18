# isometric-training

Static gallery of the 84-hold isometric catalog. Dark mono. Hosted on GitHub Pages
at https://ladiossato.github.io/isometric-training/

`index.html` is generated from `holds.json` + local `images/` by `build.mjs`.
No database or network needed to build.

## Adding exercise images (image generation task)

1. Generate one image per hold, named by its `slug` from `holds.json`:
   `images/<slug>.png`  (e.g. `images/dead-hang-grip.png`)
   There are 84 slugs. Square images work best (grid tiles are 1:1).
2. Rebuild the page:  `node build.mjs`
3. Commit + push. GitHub Pages redeploys automatically.

Holds with no matching image render as a clean placeholder, so you can fill
them in any order and rebuild as you go. The header shows `<rendered> / 84`.

`holds.json` fields: `slug`, `iso_class`, `iso_mode`, `body_part`.
