require("dotenv").config({ path: "../.env" });
const express = require("express");
const cors = require("cors");
const productRoutes = require("./routes/products");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/", productRoutes);

app.listen(PORT, () => {
  console.log(`\n🚀 Retail AI POC backend running at http://localhost:${PORT}`);
  console.log(`   POST /ingest-products  → enrich & load products`);
  console.log(`   GET  /products         → list all enriched products`);
  console.log(`   GET  /search?q=<term>  → search products\n`);
});
