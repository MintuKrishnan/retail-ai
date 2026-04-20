import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import express from "express";
import cors from "cors";

// Resolve __dirname for ESM and load .env before any route/service modules
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "../.env") });

// Dynamic imports so env vars are available when services initialise
const { default: productRoutes }   = await import("./routes/products.js");
const { default: amplienceRoutes } = await import("./routes/amplience.js");

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/", productRoutes);
app.use("/amplience", amplienceRoutes);

app.listen(PORT, () => {
  console.log(`\n🚀 Retail AI POC backend running at http://localhost:${PORT}`);
  console.log(`\n  Product endpoints:`);
  console.log(`   POST /ingest-products`);
  console.log(`   GET  /products`);
  console.log(`   GET  /search?q=<term>`);
  console.log(`\n  Amplience endpoints:`);
  console.log(`   GET  /amplience/status`);
  console.log(`   POST /amplience/content/preview`);
  console.log(`   POST /amplience/content/create`);
  console.log(`   GET  /amplience/content/:id`);
  console.log(`   PUT  /amplience/content/:id`);
  console.log(`   POST /amplience/content/:id/publish\n`);
});
