// =====================================================
// Dumps Catalog — Full Vanilla JS (20 items, linear strips)
// - No infinite scroll
// - Each image = one strip (one paragraph)
// - Bigger images
// - Hover (no click) => green zoom popup
// - Collage ↔ List toggle + Filter + Sort
// - Local PNG paths: ./images/1.png ... ./images/20.png
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
// Data: 1–20 (PNG)
// ----------------------
const allItems = [
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
let filteredItems = [];
let viewMode = "collage"; // collage | list

const rarityOrder = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 };

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

function attachZoomInteraction(el, item) {
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
    // mobile: tap to toggle
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
}

// ----------------------
// Controls: filter + sort
// ----------------------
function populateTagFilter() {
  if (!tagFilterEl) return;

  // keep "All tags"
  const first = document.createElement("option");
  first.value = "all";
  first.textContent = "All tags";

  tagFilterEl.innerHTML = "";
  tagFilterEl.appendChild(first);

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

  renderView(); // IMPORTANT: render once, no infinite behavior
}

// ----------------------
// Render: Collage (Linear strips: 1 item per strip)
// ----------------------
function renderCollage(items) {
  if (!collageEl) return;
  collageEl.innerHTML = "";

  items.slice(0, 20).forEach((item, index) => {
    // Each item = one "paragraph"
    const strip = document.createElement("div");
    strip.className = "strip";
    collageEl.appendChild(strip);

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

    // BIGGER sizes (tweak here if you want even bigger)
    const width = rand(700, 980);
    const height = rand(460, 650);

    const stripW = strip.clientWidth || window.innerWidth;
    const pad = 24;

    // left-right alternating like your template
    const side = (index % 2 === 0) ? "left" : "right";
    const drift = rand(-80, 80);

    let x;
    if (side === "left") {
      x = pad + rand(0, 160) + drift;
    } else {
      x = stripW - width - pad - rand(0, 160) + drift;
    }

    // within each strip: slight vertical offset
    const y = rand(70, 170);

    // rotation: light, not messy
    const rot = rand(-10, 10);

    el.style.width = `${width}px`;
    el.style.height = `${height}px`;
    el.style.left = `${clamp(x, pad, stripW - width - pad)}px`;
    el.style.top = `${y}px`;
    el.style.transform = `rotate(${rot}deg)`;

    attachZoomInteraction(el, item);
    strip.appendChild(el);
  });
}

// ----------------------
// Render: List (still supports zoom on hover)
// ----------------------
function renderList(items) {
  if (!listGridEl) return;
  listGridEl.innerHTML = "";

  items.slice(0, 20).forEach(item => {
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

    attachZoomInteraction(card, item);

    card.appendChild(img);
    card.appendChild(meta);
    listGridEl.appendChild(card);
  });
}

// ----------------------
// Render according to current view
// ----------------------
function renderView() {
  hideZoom();

  if (viewMode === "collage") {
    collageEl.classList.remove("hidden");
    listEl.classList.add("hidden");
    viewToggleBtn.textContent = "Switch to List";
    renderCollage(filteredItems);
  } else {
    collageEl.classList.add("hidden");
    listEl.classList.remove("hidden");
    viewToggleBtn.textContent = "Switch to Collage";
    renderList(filteredItems);
  }
}

// ----------------------
// View toggle
// ----------------------
function setView(mode) {
  viewMode = mode;
  renderView();
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

window.addEventListener("resize", hideZoom);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") hideZoom();
});
