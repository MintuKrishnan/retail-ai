/**
 * Constructor.io Integration Service
 *
 * Currently mocked with console.log + simulated axios call.
 * To plug in real Constructor.io:
 *  1. Set CONSTRUCTOR_API_KEY and CONSTRUCTOR_API_TOKEN in your .env
 *  2. Replace the mock block below with the real axios call (scaffold provided)
 */

const axios = require("axios");

// ─── REAL CONSTRUCTOR.IO SCAFFOLD (plug in later) ────────────────────────────
//
// async function pushToConstructorReal(product) {
//   const apiKey = process.env.CONSTRUCTOR_API_KEY;
//   const apiToken = process.env.CONSTRUCTOR_API_TOKEN;
//   const url = `https://ac.cnstrc.com/v1/item?autocomplete_key=${apiKey}`;
//
//   const payload = {
//     item_name: product.title,
//     id: String(product.id),
//     description: product.description,
//     keywords: product.tags,
//     metadata: {
//       seo_title: product.seo_title,
//       image_url: product.image,
//       price: product.price,
//       category: product.category,
//     },
//   };
//
//   const response = await axios.post(url, payload, {
//     auth: { username: apiToken, password: "" },
//     headers: { "Content-Type": "application/json" },
//   });
//
//   return response.data;
// }

// ─── MOCK IMPLEMENTATION ─────────────────────────────────────────────────────

/**
 * Pushes enriched product to Constructor.io search index.
 * @param {Object} product - Enriched product object
 */
async function pushToConstructor(product) {
  const payload = {
    item_name: product.title,
    id: String(product.id),
    description: product.description,
    keywords: product.tags,
    metadata: {
      seo_title: product.seo_title,
      image_url: product.image,
      price: product.price,
      category: product.category,
    },
  };

  // Mock: simulate a network call
  try {
    await axios.post(
      process.env.CONSTRUCTOR_MOCK_URL || "https://httpbin.org/post",
      payload,
      { timeout: 3000 }
    ).catch(() => {}); // swallow mock errors
  } catch (_) {
    // Silently fail in mock mode
  }

  console.log(`  [Constructor] ✅ Indexed: "${product.title}" (id: ${product.id})`);
  // Uncomment below to see full payload:
  // console.log("  [Constructor] Payload:", JSON.stringify(payload, null, 2));
}

module.exports = { pushToConstructor };
