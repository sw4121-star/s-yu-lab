// =====================================================
// Project2 Catalog — Full Vanilla JS (Local Images 1–20)
// =====================================================

// ----------------------
// DOM
// ----------------------
const collageEl = document.getElementById("collage");
const listEl = document.getElementById("list");
const listGridEl = document.getElementById("listGrid");

const tagFilterEl = document.getElementById("tagFilter");
const sortSelectEl = document.getElementById("sortSelect");
const viewToggleBtn = document.getElementById("viewToggle");

const zoomEl = document.getElementById("zoom");
const zoomImg = document.getElementById("zoomImg");
const zoomTitle = document.getElementById("zoomTitle");
const zoomRarity = document.getElementById("zoomRarity");
const zoomTag = document.getElementById("zoomTag");

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ----------------------
// Touch detection
// ----------------------
const isTouch = window.matchMedia("(hover: none)").matches;

// ----------------------
// Data (LOCAL)
// - You asked for ./images/1.jpg format
// ----------------------
const items = [
  { title: "Dump 1",  main_image: "./images/1.png",  zoom_image: "./images/1.png",  tag: "plastic", rarity: "common" },
  { title: "Dump 2",  main_image: "./images/2.png",  zoom_image: "./images/2.png",  tag: "plastic", rarity: "common" },
  { title: "Dump 3",  main_image: "./images/3.png",  zoom_image: "./images/3.png",  tag: "paper",   rarity: "uncommon" },
  { title: "Dump 4",  main_image: "./images/4.png",  zoom_image: "./images/4.png",  tag: "organic", rarity: "common" },
  { title: "Dump 5",  main_image: "./images/5.png",  zoom_image: "./images/5.png",  tag: "plastic", rarity: "rare" },
  { title: "Dump 6",  main_image: "./images/6.png",  zoom_image: "./images/6.png",  tag: "metal",   rarity: "uncommon" },
  { title: "Dump 7",  main_image: "./images/7.png",  zoom_image: "./images/7.png",  tag: "paper",   rarity: "common" },
  { title: "Dump 8",  main_image: "./images/8.png",  zoom_image: "./images/8.png",  tag: "plastic", rarity: "legendary" },
  { title: "Dump 9",  main_image: "./images/9.png",  zoom_image: "./images/9.png",  tag: "unknown", rarity: "rare" },
  { title: "Dump 10", main_image: "./images/10.png", zoom_image: "./images/10.png", tag: "plastic", rarity: "common" },
  { title: "Dump 11", main_image: "./images/11.png", zoom_image: "./images/11.png", tag: "organic", rarity: "uncommon" },
  { title: "Dump 12", main_image: "./images/12.png", zoom_image: "./images/12.png", tag: "paper",   rarity: "common" },
  { title: "Dump 13", main_image: "./images/13.png", zoom_image: "./images/13.png", tag: "metal",   rarity: "rare" },
  { title: "Dump 14", main_image: "./images/14.png", zoom_image: "./images/14.png", tag: "plastic", rarity: "common" },
  { title: "Dump 15", main_image: "./images/15.png", zoom_image: "./images/15.png", tag: "unknown", rarity: "epic" },
  { title: "Dump 16", main_image: "./images/16.png", zoom_image: "./images/16.png", tag: "paper",   rarity: "common" },
  { title: "Dump 17", main_image: "./images/17.png", zoom_image: "./images/17.png", tag: "plastic", rarity: "uncommon" },
  { title: "Dump 18", main_image: "./images/18.png", zoom_image: "./images/18.png", tag: "metal",   rarity: "rare" },
  { title: "Dump 19", main_image: "./images/19.png", zoom_image: "./images/19.png", tag: "organic", rarity: "common" },
  { title: "Dump 20", main_image: "./images/20.png", zoom_image: "./images/20.png", tag: "plastic", rarity: "legendary" }
];


// ----------------------
// State
// ----------------------
let allItems = [...items];
let filteredItems = [];
let viewMode = "collage"; // collage | list

// infinite scroll: each "strip" renders N items
const perStrip = 20;
let renderedCount = 0;

// rarity sorting weights
const rarityOrder = {
  common: 1,
  uncommon: 2,
  rare: 3,
  epic: 4,
  legendary: 5
};

// ----------------------
// Utils
// ----------------------
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function uniqueTags(arr) {
  return [...new Set(arr.map(x => String(x.tag || "").trim()).filter(Boolean))].sort();
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ----------------------
// Zoom popup
// ----------------------
function setZoomContent(item) {
  zoomImg.src = item.zoom_image || item.main_image || "";
  zoomImg.alt = item.title ? `Zoom detail of ${item.title}` : "Zoom detail image";
  zoomTitle.textContent = item.title || "(untitled)";
  zoomRarity.textContent = item.rarity || "-";
  zoomTag.textContent = item.tag || "-";
}

function showZoomAt(x, y) {
  if (!zoomEl) return;

  // make sure it has layout before positioning
  zoomEl.classList.remove("hidden");

  const w = zoomEl.offsetWidth || 230;
  const h = zoomEl.offsetHeight || 260;
  const pad = 14;

  const left = clamp(x + 18, pad, window.innerWidth - w - pad);
  const top = clamp(y + 18, pad, window.innerHeight - h - pad);

  zoomEl.style.left = `${left}px`;
  zoomEl.style.top = `${top}px`;
}

function hideZoom() {
  if (!zoomEl) return;
  zoomEl.classList.add("hidden");
}

// ----------------------
// Filtering + Sorting
// ----------------------
function populateTagFilter() {
  if (!tagFilterEl) return;

  // reset options to keep "All"
  const keepFirst = tagFilterEl.querySelector('option[value="all"]');
  tagFilterEl.innerHTML = "";
  if (keepFirst) tagFilterEl.appendChild(keepFirst);
  else {
    const opt = document.createElement("option");
    opt.value = "all";
    opt.textContent = "All tags";
    tagFilterEl.appendChild(opt);
  }

  uniqueTags(allItems).forEach(t => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    tagFilterEl.appendChild(opt);
  });
}

function applyFilterAndSort() {
  const tag = tagFilterEl ? tagFilterEl.value : "all";
  const sortMode = sortSelectEl ? sortSelectEl.value : "random";

  filteredItems = (tag === "all")
    ? [...allItems]
    : allItems.filter(it => String(it.tag).trim() === tag);

  if (sortMode === "random") {
    filteredItems = shuffle(filteredItems);
  } else if (sortMode === "title") {
    filteredItems.sort((a, b) => String(a.title || "").localeCompare(String(b.title || "")));
  } else if (sortMode === "rarity") {
    filteredItems.sort((a, b) => {
      const ra = rarityOrder[String(a.rarity || "").toLowerCase()] || 999;
      const rb = rarityOrder[String(b.rarity || "").toLowerCase()] || 999;
      return ra - rb;
    });
  }

  // reset render
  renderedCount = 0;
  if (collageEl) collageEl.innerHTML = "";
  if (listGridEl) listGridEl.innerHTML = "";
  hideZoom();

  renderNextStrip(); // render first strip immediately
}

// ----------------------
// Render: Collage (yellow blocks in random layout)
// ----------------------
function createCollageItem(item, strip) {
  const el = document.createElement("article");
  el.className = "item";

  const img = document.createElement("img");
  img.src = item.main_image;
  img.alt = item.title ? item.title : "Street dump photo";
  img.loading = "lazy";

  el.appendChild(img);

  const label = document.createElement("div");
  label.className = "item-label";
  label.innerHTML = `
    <div><strong>ITEM NAME:</strong> ${escapeHtml(item.title || "")}</div>
    <div><strong>RARITY LEVEL:</strong> ${escapeHtml(item.rarity || "")}</div>
  `;
  el.appendChild(label);

  // size presets (feel like template: mix of small/medium/large)
  const presets = [
    { w: rand(210, 290), h: rand(150, 210) },
    { w: rand(260, 360), h: rand(190, 260) },
    { w: rand(320, 460), h: rand(240, 340) }
  ];
  const p = presets[Math.floor(Math.random() * presets.length)];

  // positions inside strip
  const stripW = strip.clientWidth || window.innerWidth;
  const stripH = strip.clientHeight || 1200;

  const x = rand(10, Math.max(20, stripW - p.w - 10));
  const y = rand(40, Math.max(80, stripH - p.h - 90));
  const rot = rand(-18, 18);

  el.style.width = `${p.w}px`;
  el.style.height = `${p.h}px`;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.transform = `rotate(${rot}deg)`;

  // Interaction: hover => popup zoom (no click)
  if (!isTouch) {
    el.addEventListener("mouseenter", (e) => {
      setZoomContent(item);
      showZoomAt(e.clientX, e.clientY);
    });
    el.addEventListener("mousemove", (e) => {
      showZoomAt(e.clientX, e.clientY);
    });
    el.addEventListener("mouseleave", hideZoom);
  } else {
    // Mobile: tap to toggle zoom
    el.addEventListener("click", () => {
      const hidden = zoomEl.classList.contains("hidden");
      if (hidden) {
        setZoomContent(item);
        showZoomAt(window.innerWidth * 0.5, window.innerHeight * 0.25);
      } else {
        hideZoom();
      }
    });
  }

  strip.appendChild(el);
}

function renderCollageSlice(slice) {
  if (!collageEl) return;

  // each strip is a "canvas chunk"
  const strip = document.createElement("div");
  strip.className = "strip";
  collageEl.appendChild(strip);

  slice.forEach(item => createCollageItem(item, strip));
}

// ----------------------
// Render: List view
// ----------------------
function renderListSlice(slice) {
  if (!listGridEl) return;

  slice.forEach(item => {
    const card = document.createElement("article");
    card.className = "card";

    const img = document.createElement("img");
    img.src = item.main_image;
    img.alt = item.title ? item.title : "Street dump photo";
    img.loading = "lazy";

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.innerHTML = `
      <div><strong>ITEM NAME:</strong> ${escapeHtml(item.title || "")}</div>
      <div><strong>RARITY LEVEL:</strong> ${escapeHtml(item.rarity || "")}</div>
      <div><strong>TAG:</strong> ${escapeHtml(item.tag || "")}</div>
    `;

    if (!isTouch) {
      card.addEventListener("mouseenter", (e) => {
        setZoomContent(item);
        showZoomAt(e.clientX, e.clientY);
      });
      card.addEventListener("mousemove", (e) => showZoomAt(e.clientX, e.clientY));
      card.addEventListener("mouseleave", hideZoom);
    } else {
      card.addEventListener("click", () => {
        const hidden = zoomEl.classList.contains("hidden");
        if (hidden) {
          setZoomContent(item);
          showZoomAt(window.innerWidth * 0.5, window.innerHeight * 0.25);
        } else {
          hideZoom();
        }
      });
    }

    card.appendChild(img);
    card.appendChild(meta);
    listGridEl.appendChild(card);
  });
}

// ----------------------
// Infinite scroll
// - each time you near bottom, render another strip
// - if only 20 items, we loop them so it can go "endlessly"
// ----------------------
function getNextSlice() {
  if (filteredItems.length === 0) return [];

  const slice = [];
  for (let i = 0; i < perStrip; i++) {
    // loop through items endlessly
    const idx = (renderedCount + i) % filteredItems.length;
    slice.push(filteredItems[idx]);
  }
  renderedCount += perStrip;
  return slice;
}

function renderNextStrip() {
  const slice = getNextSlice();
  if (slice.length === 0) return;

  if (viewMode === "collage") {
    renderCollageSlice(slice);
  } else {
    renderListSlice(slice);
  }
}

function onScroll() {
  const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 900;
  if (nearBottom) renderNextStrip();
}

// ----------------------
// View toggle
// ----------------------
function setView(mode) {
  viewMode = mode;

  if (mode === "collage") {
    if (collageEl) collageEl.classList.remove("hidden");
    if (listEl) listEl.classList.add("hidden");
    if (viewToggleBtn) viewToggleBtn.textContent = "Switch to List";
  } else {
    if (collageEl) collageEl.classList.add("hidden");
    if (listEl) listEl.classList.remove("hidden");
    if (viewToggleBtn) viewToggleBtn.textContent = "Switch to Collage";
  }

  // re-render from current filtered dataset
  renderedCount = 0;
  if (collageEl) collageEl.innerHTML = "";
  if (listGridEl) listGridEl.innerHTML = "";
  hideZoom();

  // first strip in new mode
  renderNextStrip();
}

// ----------------------
// Boot
// ----------------------
populateTagFilter();
applyFilterAndSort();

if (tagFilterEl) tagFilterEl.addEventListener("change", applyFilterAndSort);
if (sortSelectEl) sortSelectEl.addEventListener("change", applyFilterAndSort);

if (viewToggleBtn) {
  viewToggleBtn.addEventListener("click", () => {
    setView(viewMode === "collage" ? "list" : "collage");
  });
}

window.addEventListener("scroll", onScroll);
window.addEventListener("resize", hideZoom);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") hideZoom();
});
