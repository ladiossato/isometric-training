# Image brief — isometric-training (for hibiki)

## Mission
Generate one image for each of the 84 isometric holds. The single job of every
image: a person looking at it understands **exactly how to execute the hold**,
with no text. Clarity first. Empty Words aesthetic throughout.

## What you have
- This repo (full access). GitHub Pages auto-deploys `main`.
- `holds.json` — all 84 holds. Each has: `slug`, `iso_class`, `iso_mode`,
  `body_part`, and **`execution`** (the exact body position — this is your
  source of truth for what to draw).
- `build.mjs` — regenerates `index.html` from `holds.json` + `images/`.
  No DB, no network. Pure Node.
- The site already supports **click-to-fullscreen** (lightbox, phone-friendly).
  You do not need to touch site code — just add images.

## The one rule for file names
Save each image as `images/<slug>.png`, slug taken verbatim from `holds.json`.
Example: the hold `dead-hang-grip` → `images/dead-hang-grip.png`.
A hold with no matching file renders as a placeholder, so you can fill them in
any order. The header shows `<rendered> / 84`.

## Creative direction (Empty Words style)
The 84 images must read as **one cohesive system** in the grid. Hold every one
of these constant across all 84:

- **Dark monochrome.** Off-white / grayscale subject on a near-black background
  (roughly `#0a0a0a`). No color. High but clean contrast.
- **One figure, clearly rendered, demonstrating the hold.** The whole relevant
  body is visible. Joint angles, contact points, and what bears the load are
  unmistakable. Match the `execution` text precisely.
- **Isometric = a held, static shape.** No motion blur, no mid-rep action.
  Show the position that is held under tension.
- **Minimal.** Only the equipment the hold actually needs (bar, wall, floor,
  strap). Empty background otherwise. No props, no scenery, no clutter.
- **No baked-in text, labels, arrows, or watermarks.** The image speaks alone.
- **Consistent framing, scale, lighting, and vantage** across the set. Same
  treatment every time, so the grid looks like one catalog, not 84 styles.
- **Square, 1:1**, generated at a clean resolution (1024×1024 works well).

Priority order when they conflict: (1) the position is legible and correct,
(2) the set is visually consistent, (3) it looks good.

## Workflow
1. For each hold, read its `execution` in `holds.json`, generate the image,
   save to `images/<slug>.png`.
2. Run `node build.mjs`.
3. Commit + push. Pages redeploys. Repeat / batch as you like.

## Notes
- Live site: https://ladiossato.github.io/isometric-training/
- shin left 9 older images in the training app's Supabase bucket — those belong
  to the app, not this repo. This gallery starts from zero on purpose.
