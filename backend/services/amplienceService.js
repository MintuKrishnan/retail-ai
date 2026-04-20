/**
 * Amplience Integration Service
 * REST API — Management API v2
 *
 * Flow:
 *   1. getAccessToken()     → POST auth.amplience.net/oauth/token
 *   2. createContentItem()  → POST api.amplience.net/v2/content/hubs/{hubId}/content-repositories/{repoId}/content-items
 *   3. getContentItem()     → GET  api.amplience.net/v2/content/content-items/{id}
 *   4. updateContentItem()  → PATCH api.amplience.net/v2/content/content-items/{id}
 *   5. publishContentItem() → POST api.amplience.net/v2/content/content-items/{id}/publish
 *
 * Env vars are read lazily inside each function (not at module load time)
 * so dotenv has time to populate process.env before they are accessed.
 *
 * To go live: fill AMPLIENCE_* vars in .env — zero code changes needed.
 */

import axios from "axios";

const AUTH_URL = "https://auth.amplience.net/oauth/token";
const API_BASE = "https://api.amplience.net/v2/content";

// Simple in-memory token cache
let _tokenCache = { token: null, expiresAt: 0 };

// ─── MOCK MODE DETECTION ─────────────────────────────────────────────────────
function isMockMode() {
  const id     = process.env.AMPLIENCE_CLIENT_ID;
  const secret = process.env.AMPLIENCE_CLIENT_SECRET;
  return !id || id === "your_client_id" || !secret || secret === "your_client_secret";
}

// ─── 1. AUTH ─────────────────────────────────────────────────────────────────
async function getAccessToken() {
  const now = Date.now();
  if (_tokenCache.token && now < _tokenCache.expiresAt) return _tokenCache.token;

  if (isMockMode()) {
    console.log("  [Amplience Auth] MOCK mode — using fake token");
    _tokenCache = { token: "mock-token-abc123", expiresAt: now + 270_000 };
    return _tokenCache.token;
  }

  const params = new URLSearchParams({
    grant_type:    "client_credentials",
    client_id:     process.env.AMPLIENCE_CLIENT_ID,
    client_secret: process.env.AMPLIENCE_CLIENT_SECRET,
  });

  const res = await axios.post(AUTH_URL, params.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  const { access_token, expires_in } = res.data;
  _tokenCache = { token: access_token, expiresAt: now + (expires_in - 30) * 1000 };
  console.log("  [Amplience Auth] ✅ Token obtained");
  return _tokenCache.token;
}

// ─── 2. CREATE CONTENT ITEM ──────────────────────────────────────────────────
async function createContentItem(product) {
  const token   = await getAccessToken();
  const payload = buildContentPayload(product);

  if (isMockMode()) {
    console.log(`  [Amplience Create] MOCK — "${product.title}"`);
    return {
      id:               `mock-${product.id}-${Date.now()}`,
      label:            payload.label,
      status:           "DRAFT",
      body:             payload.body,
      version:          1,
      createdDate:      new Date().toISOString(),
      lastModifiedDate: new Date().toISOString(),
      _isMock:          true,
    };
  }

  const repoId = process.env.AMPLIENCE_REPO_ID;
  const hubId  = process.env.AMPLIENCE_HUB_ID;
  const url    = `${API_BASE}/hubs/${hubId}/content-repositories/${repoId}/content-items`;

  const res = await axios.post(url, payload, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });

  console.log(`  [Amplience Create] ✅ Created: ${res.data.id}`);
  return res.data;
}

// ─── 3. GET CONTENT ITEM ─────────────────────────────────────────────────────
async function getContentItem(contentItemId) {
  const token = await getAccessToken();

  if (String(contentItemId).startsWith("mock-")) {
    return {
      id:      contentItemId,
      status:  "DRAFT",
      label:   "Mock Content Item",
      body:    { title: "Preview available after real Amplience connection" },
      _isMock: true,
    };
  }

  const res = await axios.get(`${API_BASE}/content-items/${contentItemId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

// ─── 4. UPDATE CONTENT ITEM ──────────────────────────────────────────────────
async function updateContentItem(contentItemId, product) {
  const token   = await getAccessToken();
  const payload = buildContentPayload(product);

  if (String(contentItemId).startsWith("mock-")) {
    console.log(`  [Amplience Update] MOCK — updating ${contentItemId}`);
    return {
      id:               contentItemId,
      label:            payload.label,
      status:           "DRAFT",
      body:             payload.body,
      version:          2,
      lastModifiedDate: new Date().toISOString(),
      _isMock:          true,
    };
  }

  const res = await axios.patch(
    `${API_BASE}/content-items/${contentItemId}`,
    payload,
    { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
  );

  console.log(`  [Amplience Update] ✅ Updated: ${contentItemId}`);
  return res.data;
}

// ─── 5. PUBLISH CONTENT ITEM ─────────────────────────────────────────────────
async function publishContentItem(contentItemId) {
  const token = await getAccessToken();

  if (String(contentItemId).startsWith("mock-")) {
    console.log(`  [Amplience Publish] MOCK — simulating publish for ${contentItemId}`);
    return { id: contentItemId, status: "ACTIVE", publishedDate: new Date().toISOString(), _isMock: true };
  }

  const res = await axios.post(
    `${API_BASE}/content-items/${contentItemId}/publish`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );

  console.log(`  [Amplience Publish] ✅ Published: ${contentItemId}`);
  return res.data;
}

// ─── 6. PUSH TO AMPLIENCE (bulk ingestion helper) ────────────────────────────
// Wraps createContentItem with graceful error handling so a single failure
// does not abort the entire ingestion pipeline.
async function pushToAmplience(product) {
  try {
    const contentItem = await createContentItem(product);
    console.log(`  [Amplience Push] ✅ "${product.title}" → ${contentItem.id}`);
    return contentItem;
  } catch (err) {
    console.warn(`  [Amplience Push] ⚠ Failed for "${product.title}": ${err.message}`);
    return null;
  }
}

// ─── PAYLOAD BUILDER ─────────────────────────────────────────────────────────
function buildContentPayload(product) {
  return {
    label: `Product — ${product.title}`,
    body: {
      _meta: {
        schema: process.env.AMPLIENCE_SCHEMA_ID ||
          "https://schema.amplience.net/retail-ai-poc/product.json",
      },
      productId:     product.id,
      title:         product.title,
      description:   product.description,
      seoTitle:      product.seo_title,
      tags:          product.tags          || [],
      category:      product.category      || "",
      price:         product.price         || null,
      imageUrl:      product.image         || "",
      enrichedAt:    product.enriched_at   || new Date().toISOString(),
      enrichmentSrc: product.enrichment_source || "mock",
    },
    locale: "en-US",
  };
}

export {
  getAccessToken,
  createContentItem,
  getContentItem,
  updateContentItem,
  publishContentItem,
  pushToAmplience,
  buildContentPayload,
};
