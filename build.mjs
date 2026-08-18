// Regenerates index.html from the training.movements catalog.
// Usage: set -a; source /home/kai/.config/hhg-credentials/empty-words-training.env; set +a; node build.mjs
import postgres from "postgres";
import { writeFileSync } from "fs";

const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });

const titleCase = (s) =>
  s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const esc = (s) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const rows = await sql`
  select name, iso_mode, iso_class, body_part, image_url
  from training.movements
  where active = true
  order by (image_url is null), iso_class, body_part, name`;
await sql.end();

const rendered = rows.filter((r) => r.image_url).length;

const card = (r) => {
  const media = r.image_url
    ? `<img src="${esc(r.image_url)}" alt="${esc(titleCase(r.name))}" loading="lazy" decoding="async">`
    : `<div class="ph" aria-hidden="true">${esc(r.iso_class)}</div>`;
  return `      <li class="card${r.image_url ? "" : " no-img"}">
        <div class="media">${media}</div>
        <div class="meta">
          <div class="name">${esc(titleCase(r.name))}</div>
          <div class="tags">${esc(r.iso_class)} &middot; ${esc(r.iso_mode)} &middot; ${esc(r.body_part)}</div>
        </div>
      </li>`;
};

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Isometric Training</title>
<meta name="description" content="Isometric hold catalog. Full body. No performance theater.">
<style>
  :root {
    --bg: #0a0a0a; --fg: #ededed; --muted: #7d7d7d; --border: #222; --border-strong: #3a3a3a;
  }
  * { box-sizing: border-box; }
  html { -webkit-text-size-adjust: 100%; }
  body {
    margin: 0; background: var(--bg); color: var(--fg);
    font-family: "JetBrains Mono", ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
    line-height: 1.5; padding: 0;
  }
  .wrap { max-width: 1080px; margin: 0 auto; padding: 3.5rem 1.25rem 5rem; }
  header { margin-bottom: 2.5rem; }
  .kicker { font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--muted); margin: 0 0 0.9rem; }
  h1 { font-size: clamp(2rem, 7vw, 3.4rem); letter-spacing: 0.02em; margin: 0 0 1rem; font-weight: 700; }
  .sub { color: var(--muted); max-width: 40ch; margin: 0 0 1.25rem; font-size: 0.9rem; }
  .count { display: inline-block; border: 1px solid var(--border); padding: 0.4rem 0.7rem; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); }
  .count b { color: var(--fg); font-weight: 700; }
  ul.grid { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 0.75rem; }
  .card { border: 1px solid var(--border); background: #0d0d0d; overflow: hidden; display: flex; flex-direction: column; }
  .media { aspect-ratio: 1 / 1; background: #0f0f0f; display: grid; place-items: center; overflow: hidden; border-bottom: 1px solid var(--border); }
  .media img { width: 100%; height: 100%; object-fit: cover; display: block; filter: grayscale(0.15) contrast(1.03); }
  .ph { font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #3f3f3f; }
  .card.no-img { opacity: 0.62; }
  .meta { padding: 0.7rem 0.75rem 0.85rem; }
  .name { font-size: 0.8rem; letter-spacing: 0.01em; text-transform: uppercase; line-height: 1.25; }
  .tags { margin-top: 0.4rem; font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); }
  footer { margin-top: 3.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border); color: var(--muted); font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; }
</style>
</head>
<body>
  <div class="wrap">
    <header>
      <p class="kicker">all is ours</p>
      <h1>Isometric Training</h1>
      <p class="sub">The isometric hold catalog. Full body, head to toe. No performance theater.</p>
      <span class="count"><b>${rendered}</b> / ${rows.length} rendered</span>
    </header>
    <ul class="grid">
${rows.map(card).join("\n")}
    </ul>
    <footer>Empty Words &middot; isometric hold catalog</footer>
  </div>
</body>
</html>
`;

writeFileSync(new URL("./index.html", import.meta.url), html);
console.log(`wrote index.html — ${rows.length} holds, ${rendered} with images`);
