import express from "express";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { enrichProduct } from "../services/aiEnrichmentService.js";
import { pushToAmplience } from "../services/amplienceService.js";
import { pushToConstructor } from "../services/constructorService.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const router    = express.Router();

// In-memory store for enriched products
let enrichedProducts = [];

// POST /ingest-products
// Reads raw products from JSON, enriches them, stores in memory, pushes to external APIs
router.post("/ingest-products", async (req, res) => {
  try {
    const dataPath = join(__dirname, "../data/products.json");
    const raw      = readFileSync(dataPath, "utf-8");
    const products = JSON.parse(raw);

    console.log(`\n📦 Ingesting ${products.length} products...`);

    const enriched = await Promise.all(
      products.map(async (product) => {
        const enrichedProduct = await enrichProduct(product);

        // Push to Amplience — attach content item metadata if successful
        const amplienceItem = await pushToAmplience(enrichedProduct);
        if (amplienceItem) {
          enrichedProduct.amplience_id      = amplienceItem.id;
          enrichedProduct.amplience_status  = amplienceItem.status;
          enrichedProduct.amplience_is_mock = amplienceItem._isMock || false;
        }

        await pushToConstructor(enrichedProduct);

        return enrichedProduct;
      })
    );

    enrichedProducts = enriched;
    console.log(`✅ ${enrichedProducts.length} products enriched and stored.\n`);

    res.json({
      success:  true,
      count:    enrichedProducts.length,
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
// Searches title, description, seo_title, and tags
router.get("/search", (req, res) => {
  const query = (req.query.q || "").toLowerCase().trim();

  if (!query) {
    return res.json({ success: true, count: enrichedProducts.length, products: enrichedProducts });
  }

  const results = enrichedProducts.filter((p) => {
    const inTitle       = p.title?.toLowerCase().includes(query);
    const inDescription = p.description?.toLowerCase().includes(query);
    const inSeoTitle    = p.seo_title?.toLowerCase().includes(query);
    const inTags        = p.tags?.some((tag) => tag.toLowerCase().includes(query));
    return inTitle || inDescription || inSeoTitle || inTags;
  });

  res.json({ success: true, count: results.length, products: results });
});

export default router;
