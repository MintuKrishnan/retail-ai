const BASE = "/api";

// ─── PRODUCTS ────────────────────────────────────────────
export async function ingestProducts() {
  const res  = await fetch(`${BASE}/ingest-products`, { method: "POST" });
  if (!res.ok) throw new Error(`Server error: ${res.status}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Ingest failed");
  return data.products;
}

export async function fetchProducts() {
  const res  = await fetch(`${BASE}/products`);
  if (!res.ok) throw new Error(`Server error: ${res.status}`);
  const data = await res.json();
  return data.products;
}

export async function searchProducts(query) {
  const res  = await fetch(`${BASE}/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error(`Server error: ${res.status}`);
  const data = await res.json();
  return data.products;
}

// ─── AMPLIENCE ───────────────────────────────────────────
export async function amplienceStatus() {
  const res  = await fetch(`${BASE}/amplience/status`);
  if (!res.ok) throw new Error(`Status check failed: ${res.status}`);
  return res.json();
}

export async function ampliencePreview(product) {
  const res  = await fetch(`${BASE}/amplience/content/preview`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ product }),
  });
  if (!res.ok) throw new Error(`Preview failed: ${res.status}`);
  return res.json();
}

export async function amplienceCreate(product) {
  const res  = await fetch(`${BASE}/amplience/content/create`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ product }),
  });
  if (!res.ok) throw new Error(`Create failed: ${res.status}`);
  return res.json();
}

export async function amplienceGetItem(contentId) {
  const res  = await fetch(`${BASE}/amplience/content/${contentId}`);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.json();
}

export async function amplienceUpdate(contentId, product) {
  const res  = await fetch(`${BASE}/amplience/content/${contentId}`, {
    method:  "PUT",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ product }),
  });
  if (!res.ok) throw new Error(`Update failed: ${res.status}`);
  return res.json();
}

export async function ampliencePublish(contentId) {
  const res  = await fetch(`${BASE}/amplience/content/${contentId}/publish`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(`Publish failed: ${res.status}`);
  return res.json();
}
