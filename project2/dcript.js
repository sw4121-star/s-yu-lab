// ======================
// 1) Google Sheet endpoint
// ======================
const SHEET_ID = "YOUR_SHEET_ID_HERE";
const GVIZ_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

// ======================
// 2) DOM
// ======================
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

document.getElementById("year").textContent = new Date().getFullYear();

// ======================
// 3) State
// ======================
let allItems = [];
let filteredItems = [];
let viewMode = "collage"; // collage | list

const batchSize = 20;     // you said you want 20 in this layout — scroll loads more
let renderedCount = 0;

const rarityOrder = {
  "common": 1,
  "uncommon": 2,
  "rare": 3,
  "epic": 4,
  "legendary": 5
};

// Detect touch (no hover)
const isTouch = window.matchMedia("(hover: none)").matches;

// ======================
// 4) Helpers
// ======================
function gvizToObjects(text){
  // Google returns: "/*O_o*/\ngoogle.visualization.Query.setResponse({...});"
  const json = JSON.parse(text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1));
  const cols = json.table.cols.map(c => (c.label || "").trim());
  const rows = json.table.rows;

  return rows.map(r => {
    const obj = {};
    cols.forEach((colName, i) => {
      const cell = r.c[i];
      obj[colName] = cell ? (cell.v ?? "") : "";
    });
    return obj;
  });
}

function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

function shuffle(arr){
  const a = [...arr];
  for(let i=a.length-1; i>0; i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function uniqueTags(items){
  return [...new Set(items.map(x => String(x.tag || "").trim()).filter(Boolean))].sort();
}

function applyFilterAndSort(){
  const tag = tagFilterEl.value;

  filteredItems = (tag === "all")
    ? [...allItems]
    : allItems.filter(it => String(it.tag).trim() === tag);

  const sortMode = sortSelectEl.value;

  if(sortMode === "random"){
    filteredItems = shuffle(filteredItems);
  } else if(sortMode === "title"){
    filteredItems.sort((a,b) => String(a.title).localeCompare(String(b.title)));
  } else if(sortMode === "rarity"){
    filteredItems.sort((a,b) => (rarityOrder[String(a.rarity).toLowerCase()] || 999) -
                                (rarityOrder[String(b.rarity).toLowerCase()] || 999));
  }

  // reset render
  renderedCount = 0;
  collageEl.innerHTML = "";
  listGridEl.innerHTML = "";
  renderNextBatch();
}

function setZoomContent(item){
  zoomImg.src = item.zoom_image || item.main_image || "";
  zoomImg.alt = item.title ? `Zoomed-in detail of ${item.title}` : "Zoomed-in detail photo";
  zoomTitle.textContent = item.title || "(untitled)";
  zoomRarity.textContent = item.rarity || "-";
  zoomTag.textContent = item.tag || "-";
}

function showZoomAt(x, y){
  // keep inside viewport
  const w = zoomEl.offsetWidth || 230;
  const h = zoomEl.offsetHeight || 260;
  const pad = 14;

  const left = clamp(x + 18, pad, window.innerWidth - w - pad);
  const top  = clamp(y + 18, pad, window.innerHeight - h - pad);

  zoomEl.style.left = `${left}px`;
  zoomEl.style.top  = `${top}px`;
  zoomEl.classList.remove("hidden");
}

function hideZoom(){
  zoomEl.classList.add("hidden");
}

// ======================
// 5) Render
// ======================
function renderNextBatch(){
  const slice = filteredItems.slice(renderedCount, renderedCount + batchSize);
  if(slice.length === 0) return;

  if(viewMode === "collage"){
    renderCollageSlice(slice);
  } else {
    renderListSlice(slice);
  }

  renderedCount += slice.length;
}

function renderCollageSlice(items){
  // create a new "strip" canvas chunk for this batch
  const strip = document.createElement("div");
  strip.className = "strip";
  collageEl.appendChild(strip);

  const stripRect = () => strip.getBoundingClientRect();

  items.forEach((item, idx) => {
    const el = document.createElement("article");
    el.className = "item";
    el.setAttribute("role", "article");

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

    // random sizes close to your template vibe
    const sizePreset = [
      { w: rand(240, 330), h: rand(170, 240) },
      { w: rand(280, 420), h: rand(220, 320) },
      { w: rand(200, 280), h: rand(150, 210) }
    ][Math.floor(Math.random()*3)];

    // random positions inside strip
    const maxW = Math.max(320, strip.clientWidth);
    const x = rand(10, maxW - sizePreset.w - 10);
    const y = rand(40, strip.clientHeight - sizePreset.h - 80);

    const rot = rand(-18, 18);

    el.style.width = `${sizePreset.w}px`;
    el.style.height = `${sizePreset.h}px`;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.transform = `rotate(${rot}deg)`;

    // interaction: hover => show zoom popup (no click needed)
    if(!isTouch){
      el.addEventListener("mouseenter", (e) => {
        setZoomContent(item);
        showZoomAt(e.clientX, e.clientY);
      });
      el.addEventListener("mousemove", (e) => {
        showZoomAt(e.clientX, e.clientY);
      });
      el.addEventListener("mouseleave", hideZoom);
    } else {
      // mobile: tap to toggle zoom
      el.addEventListener("click", (e) => {
        const isHidden = zoomEl.classList.contains("hidden");
        if(isHidden){
          setZoomContent(item);
          showZoomAt(window.innerWidth * 0.5, window.innerHeight * 0.25);
        } else {
          hideZoom();
        }
      });
    }

    strip.appendChild(el);
  });
}

function renderListSlice(items){
  items.forEach(item => {
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

    // in list view, hover/tap still zoom
    if(!isTouch){
      card.addEventListener("mouseenter", (e) => {
        setZoomContent(item);
        showZoomAt(e.clientX, e.clientY);
      });
      card.addEventListener("mousemove", (e) => showZoomAt(e.clientX, e.clientY));
      card.addEventListener("mouseleave", hideZoom);
    } else {
      card.addEventListener("click", () => {
        const isHidden = zoomEl.classList.contains("hidden");
        if(isHidden){
          setZoomContent(item);
          showZoomAt(window.innerWidth * 0.5, window.innerHeight * 0.25);
        } else hideZoom();
      });
    }

    card.appendChild(img);
    card.appendChild(meta);
    listGridEl.appendChild(card);
  });
}

// infinite scroll
function onScroll(){
  const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 900;
  if(nearBottom) renderNextBatch();
}

// switch view
function setView(mode){
  viewMode = mode;
  if(mode === "collage"){
    collageEl.classList.remove("hidden");
    listEl.classList.add("hidden");
    viewToggleBtn.textContent = "Switch to List";
  } else {
    collageEl.classList.add("hidden");
    listEl.classList.remove("hidden");
    viewToggleBtn.textContent = "Switch to Collage";
  }

  // re-render from current filtered dataset
  renderedCount = 0;
  collageEl.innerHTML = "";
  listGridEl.innerHTML = "";
  renderNextBatch();
  hideZoom();
}

// ======================
// 6) Boot
// ======================
fetch(GVIZ_URL)
  .then(res => res.text())
  .then(text => {
    allItems = gvizToObjects(text);

    // populate filter options
    uniqueTags(allItems).forEach(t => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t;
      tagFilterEl.appendChild(opt);
    });

    applyFilterAndSort();
  })
  .catch(err => {
    console.error(err);
    collageEl.innerHTML = `<p>Failed to load Google Sheet data. Check your SHEET_ID and publish settings.</p>`;
  });

tagFilterEl.addEventListener("change", applyFilterAndSort);
sortSelectEl.addEventListener("change", applyFilterAndSort);

viewToggleBtn.addEventListener("click", () => {
  setView(viewMode === "collage" ? "list" : "collage");
});

window.addEventListener("scroll", onScroll);
window.addEventListener("resize", hideZoom);
document.addEventListener("keydown", (e) => {
  if(e.key === "Escape") hideZoom();
});

// ======================
// utils
// ======================
function rand(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function escapeHtml(str){
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
