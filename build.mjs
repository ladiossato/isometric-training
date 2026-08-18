// Regenerates index.html from holds.json + local images/.
// No database or network needed. Run: node build.mjs
//
// To add an exercise image: drop a file at images/<slug>.png (slug = the
// "slug" field in holds.json, e.g. images/dead-hang-grip.png). Then rerun
// this script and commit. Missing images render as a clean placeholder.
import { readFileSync, writeFileSync, existsSync } from "fs";

const holds = JSON.parse(readFileSync(new URL("./holds.json", import.meta.url)));

const titleCase = (s) =>
  s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const esc = (s) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const imgPath = (slug) => `images/${slug}.png`;
const hasImg = (slug) => existsSync(new URL(`./images/${slug}.png`, import.meta.url));
const bodyParts = [...new Set(holds.map((h) => h.body_part))].sort();

const rendered = holds.filter((h) => hasImg(h.slug)).length;

const forceMap = {
  "squat-iso-pins": "up",
  "wall-shoulder-press-iso": "up",
  "wrist-radial-ulnar-iso": "side",
  "neck-lateral-hold-L": "left",
  "neck-lateral-hold-R": "right",
  "neck-extension-hold": "back",
  "neck-flexion-hold": "forward",
  "adductor-squeeze-iso": "in",
  "hip-extension-iso-wall": "back",
  "leg-extension-iso-wall": "forward",
};

const forceDirection = (h) => {
  if (forceMap[h.slug]) return forceMap[h.slug];
  if (/press|raise|extension|plantarflexion|calf|squat|thrust|bridge/.test(h.slug)) return "up";
  if (/curl|pull|row|hang|pulldown|pinch|grip/.test(h.slug)) return "down";
  if (/abduction|lateral|eversion|inversion/.test(h.slug)) return "side";
  if (/plank|hollow|superman|balance|hold|sit/.test(h.slug)) return "brace";
  return "up";
};

const card = (h) => {
  const has = hasImg(h.slug);
  const media = has
    ? `<img src="${esc(imgPath(h.slug))}" alt="${esc(titleCase(h.slug))}" loading="lazy" decoding="async">`
    : `<div class="ph" aria-hidden="true">${esc(h.iso_class)}</div>`;
  return `      <li class="card${has ? "" : " no-img"}" data-body="${esc(h.body_part)}" data-force="${esc(forceDirection(h))}" data-execution="${esc(h.execution)}">
        <div class="media">${media}</div>
        <div class="meta">
          <div class="name">${esc(titleCase(h.slug))}</div>
          <div class="tags">${esc(h.iso_class)} &middot; ${esc(h.iso_mode)} &middot; ${esc(h.body_part)}</div>
        </div>
      </li>`;
};

// images first, then by class/body_part/slug
const ordered = [...holds].sort((a, b) => {
  const ai = hasImg(a.slug) ? 0 : 1, bi = hasImg(b.slug) ? 0 : 1;
  return ai - bi || a.iso_class.localeCompare(b.iso_class) ||
    a.body_part.localeCompare(b.body_part) || a.slug.localeCompare(b.slug);
});

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
  .tabs { position: sticky; top: 0; z-index: 5; display: flex; gap: 0.4rem; overflow-x: auto; margin-top: 1.35rem; padding: 0.65rem 0; background: rgba(10,10,10,0.92); backdrop-filter: blur(10px); scrollbar-width: none; }
  .tabs::-webkit-scrollbar { display: none; }
  .tab { appearance: none; border: 1px solid var(--border); background: #0d0d0d; color: var(--muted); padding: 0.45rem 0.65rem; font: inherit; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; white-space: nowrap; cursor: pointer; }
  .tab.active { border-color: var(--border-strong); color: var(--fg); background: #151515; }
  ul.grid { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 0.75rem; }
  .card { border: 1px solid var(--border); background: #0d0d0d; overflow: hidden; display: flex; flex-direction: column; }
  .card[hidden] { display: none; }
  .media { aspect-ratio: 1 / 1; background: #0f0f0f; display: grid; place-items: center; overflow: hidden; border-bottom: 1px solid var(--border); }
  .media img { width: 100%; height: 100%; object-fit: cover; display: block; filter: grayscale(0.15) contrast(1.03); cursor: zoom-in; }
  #lb { position: fixed; inset: 0; z-index: 50; background: rgba(5,5,5,0.96); display: grid; place-items: center; padding: 1rem; }
  #lb[hidden] { display: none; }
  .lb-panel { position: relative; width: min(100%, 920px); max-height: calc(100vh - 2rem); display: grid; gap: 0.7rem; }
  .close { position: absolute; top: 0.5rem; right: 0.5rem; z-index: 2; width: 36px; height: 36px; border: 1px solid var(--border); background: rgba(10,10,10,0.78); color: var(--fg); font: inherit; font-size: 20px; line-height: 1; cursor: pointer; }
  .lb-stage { position: relative; min-height: 0; display: grid; place-items: center; overflow: hidden; border: 1px solid var(--border); background: #080808; }
  #lb img { max-width: 100%; max-height: min(72vh, 760px); object-fit: contain; display: block; }
  .force { position: absolute; inset: 0; pointer-events: none; display: grid; place-items: center; opacity: 0.92; }
  .force span { width: min(24vw, 190px); height: 3px; background: #ededed; position: relative; filter: drop-shadow(0 0 8px rgba(255,255,255,0.28)); }
  .force span::after { content: ""; position: absolute; right: -2px; top: 50%; width: 17px; height: 17px; border-top: 3px solid #ededed; border-right: 3px solid #ededed; transform: translateY(-50%) rotate(45deg); }
  .force[data-force="up"] span { transform: rotate(-90deg); }
  .force[data-force="down"] span { transform: rotate(90deg); }
  .force[data-force="left"] span { transform: rotate(180deg); }
  .force[data-force="right"] span, .force[data-force="forward"] span, .force[data-force="side"] span { transform: rotate(0deg); }
  .force[data-force="back"] span { transform: rotate(180deg); }
  .force[data-force="in"] span::before { content: ""; position: absolute; left: -2px; top: 50%; width: 17px; height: 17px; border-top: 3px solid #ededed; border-right: 3px solid #ededed; transform: translateY(-50%) rotate(-135deg); }
  .force[data-force="brace"] { opacity: 0.5; }
  .force[data-force="brace"] span { width: min(16vw, 120px); border: 2px solid #ededed; height: min(16vw, 120px); border-radius: 999px; background: transparent; }
  .force[data-force="brace"] span::after { display: none; }
  .lb-meta { display: grid; gap: 0.3rem; text-align: center; }
  #lb .cap { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--fg); }
  #lb .cue { max-width: 80ch; margin: 0 auto; font-size: 10px; letter-spacing: 0.04em; text-transform: uppercase; color: var(--muted); }
  .timer { display: grid; grid-template-columns: repeat(3, minmax(52px, 1fr)) minmax(64px, 0.8fr) minmax(48px, 0.7fr) minmax(64px, 0.8fr); gap: 0.45rem; align-items: center; }
  .timer button, .timer input { height: 38px; border: 1px solid var(--border); background: #101010; color: var(--fg); font: inherit; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; text-align: center; }
  .timer button { cursor: pointer; }
  .timer button:hover { border-color: var(--border-strong); background: #171717; }
  .timer input::placeholder { color: #555; }
  .readout { height: 38px; border: 1px solid var(--border); display: grid; place-items: center; color: var(--fg); font-size: 12px; letter-spacing: 0.14em; }
  .bar { grid-column: 1 / -1; height: 3px; background: #181818; overflow: hidden; }
  .bar i { display: block; width: 0%; height: 100%; background: #ededed; transition: width 0.18s linear; }
  .ph { font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #3f3f3f; }
  .card.no-img { opacity: 0.62; }
  .meta { padding: 0.7rem 0.75rem 0.85rem; }
  .name { font-size: 0.8rem; letter-spacing: 0.01em; text-transform: uppercase; line-height: 1.25; }
  .tags { margin-top: 0.4rem; font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); }
  footer { margin-top: 3.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border); color: var(--muted); font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; }
  @media (max-width: 640px) {
    .wrap { padding-top: 2rem; }
    ul.grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .timer { grid-template-columns: repeat(3, 1fr); }
    .timer input, .timer button[data-custom], .readout { grid-column: span 1; }
    #lb { padding: 0.65rem; }
    .lb-panel { max-height: calc(100vh - 1.3rem); }
    #lb img { max-height: 58vh; }
  }
</style>
</head>
<body>
  <div class="wrap">
    <header>
      <p class="kicker">all is ours</p>
      <h1>Isometric Training</h1>
      <p class="sub">The isometric hold catalog. Full body, head to toe. No performance theater.</p>
      <span class="count"><b>${rendered}</b> / ${holds.length} rendered</span>
      <nav class="tabs" aria-label="Body part filters">
        <button type="button" class="tab active" data-filter="all">All</button>
${bodyParts.map((part) => `        <button type="button" class="tab" data-filter="${esc(part)}">${esc(titleCase(part))}</button>`).join("\n")}
      </nav>
    </header>
    <ul class="grid">
${ordered.map(card).join("\n")}
    </ul>
    <footer>Empty Words &middot; isometric hold catalog</footer>
  </div>
  <div id="lb" hidden>
    <div class="lb-panel" role="dialog" aria-modal="true" aria-label="Hold view">
      <button type="button" class="close" aria-label="Close">×</button>
      <div class="lb-stage">
        <img alt="">
        <div class="force" aria-hidden="true"><span></span></div>
      </div>
      <div class="lb-meta">
        <span class="cap"></span>
        <span class="cue"></span>
      </div>
      <div class="timer" data-running="false">
        <button type="button" data-seconds="20">20s</button>
        <button type="button" data-seconds="40">40s</button>
        <button type="button" data-seconds="60">60s</button>
        <input type="number" min="5" max="600" step="5" inputmode="numeric" placeholder="sec" aria-label="Custom seconds">
        <button type="button" data-custom="true">Go</button>
        <div class="readout">00:00</div>
        <div class="bar"><i></i></div>
      </div>
    </div>
  </div>
  <script>
  (function () {
    var cards = Array.prototype.slice.call(document.querySelectorAll(".card"));
    document.querySelectorAll(".tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        var filter = tab.getAttribute("data-filter");
        document.querySelectorAll(".tab").forEach(function (t) { t.classList.remove("active"); });
        tab.classList.add("active");
        cards.forEach(function (card) {
          card.hidden = filter !== "all" && card.getAttribute("data-body") !== filter;
        });
      });
    });

    var lb = document.getElementById("lb");
    var lbimg = lb.querySelector("img");
    var cap = lb.querySelector(".cap");
    var cue = lb.querySelector(".cue");
    var force = lb.querySelector(".force");
    var timer = lb.querySelector(".timer");
    var input = timer.querySelector("input");
    var readout = timer.querySelector(".readout");
    var fill = timer.querySelector(".bar i");
    var interval = null;
    var startedAt = 0;
    var duration = 0;
    function fmt(seconds) {
      var s = Math.max(0, Math.ceil(seconds));
      return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
    }
    function stopTimer() {
      if (interval) clearInterval(interval);
      interval = null;
      timer.setAttribute("data-running", "false");
      fill.style.width = "0%";
      readout.textContent = "00:00";
    }
    function startTimer(seconds) {
      seconds = Number(seconds);
      if (!Number.isFinite(seconds) || seconds <= 0) return;
      stopTimer();
      duration = seconds * 1000;
      startedAt = Date.now();
      timer.setAttribute("data-running", "true");
      readout.textContent = fmt(seconds);
      interval = setInterval(function () {
        var elapsed = Date.now() - startedAt;
        var left = Math.max(0, (duration - elapsed) / 1000);
        readout.textContent = fmt(left);
        fill.style.width = Math.min(100, elapsed / duration * 100) + "%";
        if (elapsed >= duration) {
          clearInterval(interval);
          interval = null;
          timer.setAttribute("data-running", "done");
          readout.textContent = "00:00";
          fill.style.width = "100%";
        }
      }, 200);
    }
    timer.querySelectorAll("button[data-seconds]").forEach(function (button) {
      button.addEventListener("click", function (e) {
        e.stopPropagation();
        startTimer(button.getAttribute("data-seconds"));
      });
    });
    timer.querySelector("button[data-custom]").addEventListener("click", function (e) {
      e.stopPropagation();
      startTimer(input.value);
    });
    input.addEventListener("click", function (e) { e.stopPropagation(); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") startTimer(input.value);
    });
    lb.querySelector(".close").addEventListener("click", function (e) {
      e.stopPropagation();
      close();
    });
    document.querySelectorAll(".media img").forEach(function (im) {
      im.addEventListener("click", function () {
        var card = im.closest(".card");
        lbimg.src = im.src; lbimg.alt = im.alt;
        cap.textContent = im.alt;
        cue.textContent = card.getAttribute("data-execution") || "";
        force.setAttribute("data-force", card.getAttribute("data-force") || "up");
        lb.hidden = false; document.body.style.overflow = "hidden";
      });
    });
    function close() { stopTimer(); lb.hidden = true; lbimg.src = ""; document.body.style.overflow = ""; }
    lb.addEventListener("click", function (e) {
      if (e.target === lb) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !lb.hidden) close();
    });
  })();
  </script>
</body>
</html>
`;

writeFileSync(new URL("./index.html", import.meta.url), html);
console.log(`wrote index.html — ${holds.length} holds, ${rendered} with images`);
