/**
 * AI Enrichment Service
 *
 * Currently uses mock enrichment logic.
 * To plug in AWS Bedrock, replace the `mockEnrich` call inside `enrichProduct`
 * with a call to `bedrockEnrich` (scaffold provided below).
 */

// ─── MOCK ENRICHMENT ──────────────────────────────────────────────────────────

const TAG_MAP = {
  jacket:    ["outerwear", "layering", "fashion", "winter"],
  sneaker:   ["footwear", "casual", "sport", "streetwear"],
  shoe:      ["footwear", "fashion", "lifestyle"],
  watch:     ["accessories", "timekeeping", "luxury", "wearable"],
  bag:       ["accessories", "carry", "fashion", "storage"],
  shirt:     ["tops", "casual", "apparel", "everyday"],
  dress:     ["womenswear", "occasion", "apparel", "style"],
  laptop:    ["electronics", "computing", "productivity", "tech"],
  headphone: ["audio", "electronics", "music", "wireless"],
  camera:    ["photography", "electronics", "imaging", "creative"],
};

function mockEnrich(product) {
  const titleLower = (product.title || "").toLowerCase();

  // Generate tags from title keywords
  let tags = ["retail", "new-arrival"];
  for (const [keyword, keywordTags] of Object.entries(TAG_MAP)) {
    if (titleLower.includes(keyword)) {
      tags = [...tags, ...keywordTags];
      break;
    }
  }

  // Deduplicate tags
  tags = [...new Set(tags)];

  // Generate a mock description
  const description =
    product.description ||
    `Discover the ${product.title} — crafted for everyday excellence. ` +
      `Designed with premium materials and modern aesthetics, this piece blends ` +
      `functionality with style. Perfect for those who appreciate quality without compromise.`;

  // Generate a mock SEO title
  const seo_title = `Buy ${product.title} Online | Best Price & Fast Shipping`;

  return {
    id:                product.id,
    title:             product.title,
    description,
    seo_title,
    tags,
    image:             product.image || `https://picsum.photos/seed/${product.id}/400/300`,
    price:             product.price || null,
    category:          product.category || "general",
    enriched_at:       new Date().toISOString(),
    enrichment_source: "mock", // change to "bedrock" when live
  };
}

// ─── AWS BEDROCK SCAFFOLD (plug in later) ────────────────────────────────────
//
// import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
//
// async function bedrockEnrich(product) {
//   const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION });
//   const prompt = `
//     You are a retail content writer. Given this product:
//     Name: ${product.title}
//     Category: ${product.category}
//
//     Return a JSON object with:
//     - description (2-3 sentences, engaging, SEO-friendly)
//     - seo_title (under 60 chars)
//     - tags (array of 5-8 relevant lowercase keywords)
//   `;
//   const command = new InvokeModelCommand({
//     modelId:     process.env.BEDROCK_MODEL_ID || "anthropic.claude-3-sonnet-20240229-v1:0",
//     body:        JSON.stringify({ prompt, max_tokens: 300 }),
//     contentType: "application/json",
//     accept:      "application/json",
//   });
//   const response = await client.send(command);
//   const parsed   = JSON.parse(new TextDecoder().decode(response.body));
//   return { ...product, ...parsed, enrichment_source: "bedrock" };
// }

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

/**
 * Enriches a single product with AI-generated content.
 * @param {Object} product - Raw product from JSON
 * @returns {Promise<Object>} Enriched product
 */
async function enrichProduct(product) {
  // Simulate async latency (remove when using real AI)
  await new Promise((resolve) => setTimeout(resolve, 30));

  // SWAP THIS LINE to use Bedrock:
  // return await bedrockEnrich(product);
  return mockEnrich(product);
}

export { enrichProduct };
