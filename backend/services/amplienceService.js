/**
 * Amplience Integration Service
 *
 * Currently mocked with console.log + simulated axios call.
 * To plug in real Amplience:
 *  1. Set AMPLIENCE_HUB_ID and AMPLIENCE_API_KEY in your .env
 *  2. Replace the mock block below with the real axios call (scaffold provided)
 */

const axios = require("axios");

// ─── REAL AMPLIENCE SCAFFOLD (plug in later) ─────────────────────────────────
//
// async function pushToAmplienceReal(product) {
//   const hubId = process.env.AMPLIENCE_HUB_ID;
//   const apiKey = process.env.AMPLIENCE_API_KEY;
//   const url = `https://api.amplience.net/v2/content/hubs/${hubId}/content-items`;
//
//   const payload = {
//     label: product.title,
//     body: {
//       _meta: { schema: "https://yourschema.amplience.net/product.json" },
//       title: product.title,
//       description: product.description,
//       seoTitle: product.seo_title,
//       tags: product.tags,
//       imageUrl: product.image,
//     },
//     locale: "en-US",
//   };
//
//   const response = await axios.post(url, payload, {
//     headers: {
//       Authorization: `Bearer ${apiKey}`,
//       "Content-Type": "application/json",
//     },
//   });
//
//   return response.data;
// }

// ─── MOCK IMPLEMENTATION ─────────────────────────────────────────────────────

/**
 * Pushes enriched product to Amplience CMS.
 * @param {Object} product - Enriched product object
 */
async function pushToAmplience(product) {
  const payload = {
    label: product.title,
    body: {
      title: product.title,
      description: product.description,
      seoTitle: product.seo_title,
      tags: product.tags,
      imageUrl: product.image,
    },
    locale: "en-US",
  };

  // Mock: simulate a network call
  try {
    // When real: replace with actual Amplience endpoint
    await axios.post(
      process.env.AMPLIENCE_MOCK_URL || "https://httpbin.org/post",
      payload,
      { timeout: 3000 }
    ).catch(() => {}); // swallow mock errors
  } catch (_) {
    // Silently fail in mock mode
  }

  console.log(`  [Amplience] ✅ Pushed: "${product.title}" (id: ${product.id})`);
  // Uncomment below to see full payload:
  // console.log("  [Amplience] Payload:", JSON.stringify(payload, null, 2));
}

module.exports = { pushToAmplience };
