/**
 * Retail AI POC — Frontend App
 * Communicates with the Express backend at API_BASE.
 */

const API_BASE = "http://localhost:3001";

// ─── DOM REFS ────────────────────────────────────────────────
const loadBtn      = document.getElementById("loadBtn");
const searchInput  = document.getElementById("searchInput");
const clearSearch  = document.getElementById("clearSearch");
const productGrid  = document.getElementById("productGrid");
const emptyState   = document.getElementById("emptyState");
const loadingState = document.getElementById("loadingState");
const loadingMsg   = document.getElementById("loadingMsg");
const noResults    = document.getElementById("noResults");
const searchMeta   = document.getElementById("searchMeta");
const toast        = document.getElementById("toast");
const modal        = document.getElementById("modal");
const modalClose   = document.getElementById("modalClose");
const modalContent = document.getElementById("modalContent");

// ─── STATE ───────────────────────────────────────────────────
let allProducts = [];
let searchDebounce = null;
let toastTimer = null;

// ─── INIT ────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  loadBtn.addEventListener("click", handleLoadProducts);
  searchInput.addEventListener("input", handleSearch);
  clearSearch.addEventListener("click", clearSearchHandler);
  modalClose.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
});

// ─── LOAD / INGEST PRODUCTS ──────────────────────────────────
async function handleLoadProducts() {
  setLoadingState(true);
  loadBtn.disabled = true;
  loadBtn.classList.add("loading");

  try {
    const res = await fetch(`${API_BASE}/ingest-products`, { method: "POST" });
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    const data = await res.json();

    if (!data.success) throw new Error(data.error || "Unknown error");

    allProducts = data.products || [];
    renderProducts(allProducts);
    showToast(`✅ ${allProducts.length} products enriched and loaded`, "success");
  } catch (err) {
    console.error("Load error:", err);
    showToast(`❌ Failed to load products: ${err.message}`, "error");
    setLoadingState(false);
    showState("empty");
  } finally {
    loadBtn.disabled = false;
    loadBtn.classList.remove("loading");
  }
}

// ─── SEARCH ──────────────────────────────────────────────────
function handleSearch() {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(async () => {
    const q = searchInput.value.trim();

    if (!q) {
      updateSearchMeta(null);
      renderProducts(allProducts);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      const results = data.products || [];

      updateSearchMeta({ query: q, count: results.length, total: allProducts.length });
      renderProducts(results, q);
    } catch (err) {
      console.error("Search error:", err);
    }
  }, 280);
}

function clearSearchHandler() {
  searchInput.value = "";
  updateSearchMeta(null);
  renderProducts(allProducts);
  searchInput.focus();
}

function updateSearchMeta(info) {
  if (!info) {
    searchMeta.classList.add("hidden");
    return;
  }
  searchMeta.classList.remove("hidden");
  searchMeta.innerHTML =
    `<strong>${info.count}</strong> result${info.count !== 1 ? "s" : ""} for "<em>${escapeHtml(info.query)}</em>" — ${info.total} products indexed`;
}

// ─── RENDER ──────────────────────────────────────────────────
function renderProducts(products, highlight = "") {
  setLoadingState(false);

  if (!products || products.length === 0) {
    showState(allProducts.length === 0 ? "empty" : "noResults");
    return;
  }

  showState("grid");

  productGrid.innerHTML = products
    .map((p, i) => buildCardHTML(p, highlight, i))
    .join("");

  // Attach click handlers
  productGrid.querySelectorAll(".product-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.dataset.id;
      const product = allProducts.find((p) => p.id === id);
      if (product) openModal(product);
    });
  });
}

function buildCardHTML(product, highlight = "", index = 0) {
  const title = highlightText(escapeHtml(product.title || "—"), highlight);
  const desc  = highlightText(escapeHtml(truncate(product.description || "", 110)), highlight);
  const price = product.price ? `$${Number(product.price).toFixed(2)}` : "";

  const tags = (product.tags || []).slice(0, 4).map((t) => {
    const tagHtml = highlightText(escapeHtml(t), highlight);
    const isAccent = highlight && t.toLowerCase().includes(highlight.toLowerCase());
    return `<span class="tag ${isAccent ? "accent" : ""}">${tagHtml}</span>`;
  }).join("");

  return `
    <article class="product-card" data-id="${escapeHtml(product.id)}" style="animation-delay:${index * 0.04}s">
      <div class="card-img">
        <img src="${escapeHtml(product.image || "")}" alt="${escapeHtml(product.title || "")}"
             loading="lazy" onerror="this.src='https://picsum.photos/seed/${escapeHtml(product.id)}/400/300'" />
        ${product.category ? `<span class="card-category">${escapeHtml(product.category)}</span>` : ""}
        ${price ? `<span class="card-price">${price}</span>` : ""}
      </div>
      <div class="card-body">
        <h2 class="card-title">${title}</h2>
        <p class="card-description">${desc}</p>
        <div class="card-tags">${tags}</div>
      </div>
      <div class="card-footer">
        <span class="card-source">⚙ ${escapeHtml(product.enrichment_source || "ai")}</span>
        <span class="card-arrow">→</span>
      </div>
    </article>`;
}

// ─── MODAL ───────────────────────────────────────────────────
function openModal(product) {
  const price = product.price ? `$${Number(product.price).toFixed(2)}` : "";
  const tags = (product.tags || []).map(
    (t) => `<span class="tag">${escapeHtml(t)}</span>`
  ).join("");
  const enrichedAt = product.enriched_at
    ? new Date(product.enriched_at).toLocaleString()
    : "—";

  modalContent.innerHTML = `
    <img class="modal-image"
         src="${escapeHtml(product.image || "")}"
         alt="${escapeHtml(product.title || "")}"
         onerror="this.src='https://picsum.photos/seed/${escapeHtml(product.id)}/620/260'" />
    <div class="modal-body">
      <div class="modal-meta">
        ${product.category ? `<span class="modal-category">${escapeHtml(product.category)}</span>` : ""}
        ${price ? `<span class="modal-price">${price}</span>` : ""}
      </div>
      <h2 class="modal-title">${escapeHtml(product.title || "—")}</h2>
      ${product.seo_title ? `<p class="modal-seo">SEO: ${escapeHtml(product.seo_title)}</p>` : ""}
      <div>
        <p class="modal-section-label">Description</p>
        <p class="modal-description">${escapeHtml(product.description || "—")}</p>
      </div>
      <div>
        <p class="modal-section-label">Tags</p>
        <div class="modal-tags">${tags || '<span class="tag">—</span>'}</div>
      </div>
      <div class="modal-footer">
        <span>ID: ${escapeHtml(product.id)}</span>
        <span>Enriched: ${enrichedAt}</span>
        <span>Source: ${escapeHtml(product.enrichment_source || "—")}</span>
      </div>
    </div>`;

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.add("hidden");
  document.body.style.overflow = "";
}

// ─── STATE HELPERS ───────────────────────────────────────────
function setLoadingState(visible) {
  if (visible) {
    showState("loading");
  }
}

function showState(which) {
  emptyState.classList.add("hidden");
  loadingState.classList.add("hidden");
  noResults.classList.add("hidden");
  productGrid.classList.add("hidden");

  if (which === "empty")    emptyState.classList.remove("hidden");
  if (which === "loading")  loadingState.classList.remove("hidden");
  if (which === "noResults") noResults.classList.remove("hidden");
  if (which === "grid")     productGrid.classList.remove("hidden");
}

// ─── TOAST ───────────────────────────────────────────────────
function showToast(message, type = "info") {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toastTimer = setTimeout(() => {
    toast.classList.add("hidden");
  }, 3800);
}

// ─── UTILS ───────────────────────────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function truncate(str, max) {
  return str.length <= max ? str : str.slice(0, max).trimEnd() + "…";
}

function highlightText(html, query) {
  if (!query) return html;
  // Safe: html is already escaped, query is escaped before regex
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  return html.replace(regex, `<mark style="background:rgba(212,245,66,0.25);color:#d4f542;border-radius:2px;padding:0 1px;">$1</mark>`);
}
