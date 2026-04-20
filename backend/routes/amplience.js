/**
 * Amplience Routes
 *
 * GET  /amplience/status               → check connection + credentials status
 * POST /amplience/content/preview      → build payload without creating it
 * POST /amplience/content/create       → create a content item from an enriched product
 * GET  /amplience/content/:id          → fetch a content item by ID
 * PUT  /amplience/content/:id          → update an existing content item
 * POST /amplience/content/:id/publish  → publish a content item live
 */

import express from "express";

import {
  getAccessToken,
  createContentItem,
  getContentItem,
  publishContentItem,
  updateContentItem,
  buildContentPayload,
} from "../services/amplienceService.js";

const router = express.Router();

// ─── STATUS CHECK ─────────────────────────────────────────────────────────────
// GET /amplience/status
router.get("/status", async (_req, res) => {
  const isMock = !process.env.AMPLIENCE_CLIENT_ID ||
                 process.env.AMPLIENCE_CLIENT_ID === "your_client_id";
  try {
    const token = await getAccessToken();
    res.json({
      success:  true,
      mode:     isMock ? "mock" : "live",
      message:  isMock
        ? "Running in MOCK mode — fill .env with real Amplience credentials to go live"
        : "Connected to Amplience ✅",
      hubId:    process.env.AMPLIENCE_HUB_ID || "not set",
      hasToken: !!token,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── PREVIEW PAYLOAD ─────────────────────────────────────────────────────────
// POST /amplience/content/preview
// Body: { product }
router.post("/content/preview", (req, res) => {
  const { product } = req.body;
  if (!product) return res.status(400).json({ success: false, error: "product is required" });

  const payload = buildContentPayload(product);
  res.json({ success: true, preview: payload });
});

// ─── CREATE CONTENT ITEM ─────────────────────────────────────────────────────
// POST /amplience/content/create
// Body: { product }
router.post("/content/create", async (req, res) => {
  const { product } = req.body;
  if (!product) return res.status(400).json({ success: false, error: "product is required" });

  try {
    console.log(`\n[Amplience] Creating content for: "${product.title}"`);
    const contentItem = await createContentItem(product);
    res.json({
      success:     true,
      contentItem,
      message:     `Content item created with status: ${contentItem.status}`,
    });
  } catch (err) {
    console.error("[Amplience Create Error]", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET CONTENT ITEM ────────────────────────────────────────────────────────
// GET /amplience/content/:id
router.get("/content/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const contentItem = await getContentItem(id);
    res.json({ success: true, contentItem });
  } catch (err) {
    console.error("[Amplience Get Error]", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── UPDATE CONTENT ITEM ─────────────────────────────────────────────────────
// PUT /amplience/content/:id
// Body: { product }  — rebuilds payload from updated product data
router.put("/content/:id", async (req, res) => {
  const { id }      = req.params;
  const { product } = req.body;
  if (!product) return res.status(400).json({ success: false, error: "product is required" });

  try {
    console.log(`\n[Amplience] Updating content item: ${id}`);
    const contentItem = await updateContentItem(id, product);
    res.json({
      success:     true,
      contentItem,
      message:     `Content item ${id} updated — status: ${contentItem.status}`,
    });
  } catch (err) {
    console.error("[Amplience Update Error]", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── PUBLISH CONTENT ITEM ────────────────────────────────────────────────────
// POST /amplience/content/:id/publish
router.post("/content/:id/publish", async (req, res) => {
  const { id } = req.params;
  try {
    console.log(`\n[Amplience] Publishing content item: ${id}`);
    const result = await publishContentItem(id);
    res.json({
      success: true,
      result,
      message: `Content item ${id} published — status: ${result.status}`,
    });
  } catch (err) {
    console.error("[Amplience Publish Error]", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
