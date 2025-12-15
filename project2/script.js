// =====================================================
// URBAN DUMPS — Full Vanilla JS (20 items, linear strips, HUD zoom)
// Works with your current HTML ids:
// collage, list, listGrid, zoom, zoomImg, zoomTitle, zoomRarity, zoomTag, zoomObj, rarityFill,
// tagFilter, sortSelect, viewToggle, year
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
const zoomObj = document.getElementById("zoomObj");
const rarityFill = document.getElementById("rarityFill");

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Touch detection (for mobile tap behavior)
const isTouch = window.matchMedia("(hover: none)").matches;

// ----------------------
// Data (20 items)
// image = main image in yellow blocks
// zoom_image = zoom HUD image (can be same for now)
// zoom = name of zoomed-in object
// ----------------------
const allItems = [
  { id: 1,  title: "Overflowed Basket",     rarity: "UNSTABLE",  tag: "container failure", zoom: "Plastic Liner",      image: "./images/1.png",  zoom_image: "./images/1.png"  },
  { id: 2,  title: "Compressed Parade",     rarity: "DENSE",     tag: "bag cluster",       zoom: "Tied Bag",           image: "./images/2.png",  zoom_image: "./images/2.png"  },
  { id: 3,  title: "Sidewalk Occupation",   rarity: "COMMON",    tag: "street edge",       zoom: "Cardboard Flap",     image: "./images/3.png",  zoom_image: "./images/3.png"  },
  { id: 4,  title: "Collapsed Stack",       rarity: "UNSTABLE",  tag: "box collapse",      zoom: "Broken Box Edge",    image: "./images/4.png",  zoom_image: "./images/4.png"  },
  { id: 5,  title: "Corner Spill",          rarity: "EPHEMERAL", tag: "wind-ready",        zoom: "Loose Paper",        image: "./images/5.png",  zoom_image: "./images/5.png"  },
  { id: 6,  title: "Night Residue",         rarity: "COMMON",    tag: "leftovers",         zoom: "Plastic Wrap",       image: "./images/6.png",  zoom_image: "./images/6.png"  },
  { id: 7,  title: "Intersection Scatter",  rarity: "UNSTABLE",  tag: "crossing",          zoom: "Street Debris",      image: "./images/7.png",  zoom_image: "./images/7.png"  },
  { id: 8,  title: "Public Bin Failure",    rarity: "UNSTABLE",  tag: "overflow",          zoom: "Cup Lid",            image: "./images/8.png",  zoom_image: "./images/8.png"  },
  { id: 9,  title: "Crosswalk Heap",        rarity: "DENSE",     tag: "lane edge",         zoom: "Flattened Carton",   image: "./images/9.png",  zoom_image: "./images/9.png"  },
  { id: 10, title: "Temporary Mountain",    rarity: "LEGENDARY", tag: "city-scale",        zoom: "Layered Bags",       image: "./images/10.png", zoom_image: "./images/10.png" },

  { id: 11, title: "Morning After",         rarity: "EPHEMERAL", tag: "overnight",         zoom: "Loose Bag",          image: "./images/11.png", zoom_image: "./images/11.png" },
  { id: 12, title: "Transparent Mass",      rarity: "DENSE",     tag: "clear plastic",     zoom: "Clear Plastic",      image: "./images/12.png", zoom_image: "./images/12.png" },
  { id: 13, title: "Box Drift",             rarity: "UNSTABLE",  tag: "shipping",          zoom: "Shipping Label",     image: "./images/13.png", zoom_image: "./images/13.png" },
  { id: 14, title: "Threshold Pile",        rarity: "COMMON",    tag: "door edge",         zoom: "Folded Cardboard",   image: "./images/14.png", zoom_image: "./images/14.png" },
  { id: 15, title: "Curbside Compression",  rarity: "DENSE",     tag: "taped stack",       zoom: "Taped Seam",         image: "./images/15.png", zoom_image: "./images/15.png" },
  { id: 16, title: "Urban Afterimage",      rarity: "EPHEMERAL", tag: "trace",             zoom: "Paper Fragment",     image: "./images/16.png", zoom_image: "./images/16.png" },
  { id: 17, title: "Midnight Overflow",     rarity: "UNSTABLE",  tag: "bin failure",       zoom: "Bin Rim",            image: "./images/17.png", zoom_image: "./images/17.png" },
  { id: 18, title: "Accumulated Delay",     rarity: "DENSE",     tag: "compressed",        zoom: "Compressed Bag",     image: "./images/18.png", zoom_image: "./images/18.png" },
  { id: 19, title: "Walking Past",          rarity: "COMMON",    tag: "bystander",         zoom: "Sidewalk Crack",     image: "./images/19.png", zoom_image: "./images/19.png" },
  { id: 20, title: "Uncollected Event",     rarity: "LEGENDARY", tag: "mass",              zoom: "Massed Refuse",      image: "./images/20.png", zoom_image: "./images/20.png" }
];

// ----------------------
// State
// ----------------------
let filteredItems = [];
let viewMode = "collage"; // "collage" | "list"

const rarityOrder = { COMMON: 1, UNSTABLE: 2, DENSE: 3, EPHEMERAL: 4, LEGENDARY: 5 };
const rarityBarPct = { COMMON: 20, UNSTABLE: 40, DENSE: 60, EPHEMERAL: 80, LEGENDARY: 100 };

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
// Zoom HUD
// ----------------------
function setZoomContent(item) {
  const zoomSrc = item.zoom_image || item.image || "";
  zoomImg.src = zoomSrc;
  zoomImg.alt = item.title ? `Zoom detail of ${item.title}` : "Zoom detail image";

  zoomTitle.textContent = item.title || "(untitled)";
  zoomRarity.textContent = item.rarity || "-";
  zoomTag.textContent = item.tag || "-";
  if (zoomObj) zoomObj.textContent = item.zoom || "-";

  const key = String(item.rarity || "").toUpperCase();
  const pct = rarityBarPct[key] ?? 20;
  if (rarityFill) rarityFill.style.width = pct + "%";
}

function showZoomAt(x, y) {
  if (!zoomEl) return;
  zoomEl.classList.remove("hidden");

  const w = zoomEl.offsetWidth || 280;
  const h = zoomEl.offsetHeight || 320;
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
// Controls
// ----------------------
function populateTagFilter() {
  if (!tagFilterEl) return;

  tagFilterEl.innerHTML = "";
  const allOpt = document.createElement("option");
  allOpt.value = "all";
  allOpt.textContent = "All tags";
  tagFilterEl.appendChild(allOpt);

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
    filteredItems.sort((a, b) => String(a.title).localeCompare(String(b.title)));
  } else if (sortMode === "rarity") {
    filteredItems.sort((a, b) => {
      const ra = rarityOrder[String(a.rarity || "").toUpperCase()] ?? 999;
      const rb = rarityOrder[String(b.rarity || "").toUpperCase()] ?? 999;
      return ra - rb;
    });
  }

  renderView(); // render ONCE (no infinite)
}

// ----------------------
// Render: Collage (1 item per strip)
// ----------------------
function renderCollage(items) {
  collageEl.innerHTML = "";

  items.slice(0, 20).forEach((item, index) => {
    const strip = document.createElement("div");
    strip.className = "strip";
    collageEl.appendChild(strip);

    const card = document.createElement("article");
    card.className = "item";

    const img = document.createElement("img");
    img.src = item.image;
    img.alt = item.title || "Dump image";
    img.loading = "lazy";
    card.appendChild(img);

    const label = document.createElement("div");
    label.className = "item-label";
    label.innerHTML = `
      <div><strong>ITEM NAME:</strong> ${escapeHtml(item.title)}</div>
      <div><strong>RARITY:</strong> ${escapeHtml(item.rarity)}</div>
    `;
    card.appendChild(label);

    // BIG sizes — tweak these if you want even bigger
    const width = rand(700, 980);
    const height = rand(460, 650);

    const stripW = strip.clientWidth || window.innerWidth;
    const pad = 24;

    // Linear / template-like: left-right alternating
    const side = (index % 2 === 0) ? "left" : "right";
    const drift = rand(-80, 80);

    let x;
    if (side === "left") {
      x = pad + rand(0, 160) + drift;
    } else {
      x = stripW - width - pad - rand(0, 160) + drift;
    }

    const y = rand(70, 170);
    const rot = rand(-10, 10);

    card.style.width = `${width}px`;
    card.style.height = `${height}px`;
    card.style.left = `${clamp(x, pad, stripW - width - pad)}px`;
    card.style.top = `${y}px`;
    card.style.transform = `rotate(${rot}deg)`;

    attachZoomInteraction(card, item);
    strip.appendChild(card);
  });
}

// ----------------------
// Render: List
// ----------------------
function renderList(items) {
  listGridEl.innerHTML = "";

  items.slice(0, 20).forEach(item => {
    const card = document.createElement("article");
    card.className = "card";

    const img = document.createElement("img");
    img.src = item.image;
    img.alt = item.title || "Dump image";
    img.loading = "lazy";

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.innerHTML = `
      <div><strong>ITEM NAME:</strong> ${escapeHtml(item.title)}</div>
      <div><strong>RARITY:</strong> ${escapeHtml(item.rarity)}</div>
      <div><strong>ZOOM OBJECT:</strong> ${escapeHtml(item.zoom)}</div>
      <div><strong>TAG:</strong> ${escapeHtml(item.tag)}</div>
    `;

    card.appendChild(img);
    card.appendChild(meta);

    attachZoomInteraction(card, item);
    listGridEl.appendChild(card);
  });
}

// ----------------------
// View mode
// ----------------------
function renderView() {
  hideZoom();

  if (viewMode === "collage") {
    collageEl.classList.remove("hidden");
    listEl.classList.add("hidden");
    if (viewToggleBtn) viewToggleBtn.textContent = "Switch to List";
    renderCollage(filteredItems);
  } else {
    collageEl.classList.add("hidden");
    listEl.classList.remove("hidden");
    if (viewToggleBtn) viewToggleBtn.textContent = "Switch to Collage";
    renderList(filteredItems);
  }
}

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
