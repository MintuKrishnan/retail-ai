const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

const { enrichProduct } = require("../services/aiEnrichmentService");
const { pushToAmplience } = require("../services/amplienceService");
const { pushToConstructor } = require("../services/constructorService");

// In-memory store for enriched products
let enrichedProducts = [];

// POST /ingest-products
// Reads raw products from JSON, enriches them, stores in memory, pushes to external APIs
router.post("/ingest-products", async (req, res) => {
  try {
    const dataPath = path.join(__dirname, "../data/products.json");
    const raw = fs.readFileSync(dataPath, "utf-8");
    const products = JSON.parse(raw);

    console.log(`\n📦 Ingesting ${products.length} products...`);

    const enriched = await Promise.all(
      products.map(async (product) => {
        const enrichedProduct = await enrichProduct(product);

        // Push to external APIs (mocked)
        await pushToAmplience(enrichedProduct);
        await pushToConstructor(enrichedProduct);

        return enrichedProduct;
      })
    );

    enrichedProducts = enriched;
    console.log(`✅ ${enrichedProducts.length} products enriched and stored.\n`);

    res.json({
      success: true,
      count: enrichedProducts.length,
      products: enrichedProducts,
    });
  } catch (err) {
    console.error("❌ Ingest error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /products
// Returns all enriched products
router.get("/products", (req, res) => {
  res.json({ success: true, count: enrichedProducts.length, products: enrichedProducts });
});

// GET /search?q=<term>
// Searches title, description, and tags
router.get("/search", (req, res) => {
  const query = (req.query.q || "").toLowerCase().trim();

  if (!query) {
    return res.json({ success: true, count: enrichedProducts.length, products: enrichedProducts });
  }

  const results = enrichedProducts.filter((p) => {
    const inTitle = p.title?.toLowerCase().includes(query);
    const inDescription = p.description?.toLowerCase().includes(query);
    const inSeoTitle = p.seo_title?.toLowerCase().includes(query);
    const inTags = p.tags?.some((tag) => tag.toLowerCase().includes(query));
    return inTitle || inDescription || inSeoTitle || inTags;
  });

  res.json({ success: true, count: results.length, products: results });
});

module.exports = router;
