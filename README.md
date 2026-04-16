# Retail AI Content & Search POC

An end-to-end prototype that ingests products from a JSON file, enriches them with AI-generated content, stores them in memory, syncs to external APIs (Amplience + Constructor), and exposes a searchable frontend.

---

## Folder Structure

```
retail-ai-poc/
├── backend/
│   ├── data/
│   │   └── products.json          # Raw product catalog (source of truth)
│   ├── routes/
│   │   └── products.js            # Express route handlers
│   ├── services/
│   │   ├── aiEnrichmentService.js # AI enrichment (mock → Bedrock)
│   │   ├── amplienceService.js    # Amplience push (mock → real)
│   │   └── constructorService.js  # Constructor push (mock → real)
│   ├── package.json
│   └── server.js                  # Express entry point
├── frontend/
│   ├── index.html
│   ├── app.js
│   └── styles.css
├── .env                           # Environment config
└── README.md
```

---

## Setup & Running

### 1. Install backend dependencies

```bash
cd backend
npm install
```

### 2. Configure environment

Copy `.env` and fill in values (defaults work for mock mode):

```bash
# From project root — defaults are fine for local/mock testing
cat .env
```

### 3. Start the backend

```bash
# From /backend
npm start          # production
npm run dev        # with nodemon auto-reload (recommended for dev)
```

Server runs at: **http://localhost:3001**

### 4. Open the frontend

No build step required. Just open the file directly in your browser:

```bash
# macOS
open frontend/index.html

# Linux
xdg-open frontend/index.html

# Or drag frontend/index.html into Chrome/Firefox
```

### 5. Use the app

1. Click **Load Products** → ingests and enriches all products
2. Use the **search bar** → live search across title, description, tags
3. Click any product card → detailed modal view

---

## API Endpoints

| Method | Endpoint              | Description                                  |
|--------|-----------------------|----------------------------------------------|
| POST   | `/ingest-products`    | Read JSON → enrich → store → push to APIs   |
| GET    | `/products`           | Return all enriched products                 |
| GET    | `/search?q=<term>`    | Search by title, description, or tags        |

---

## Where to Plug In AWS Bedrock

**File:** `backend/services/aiEnrichmentService.js`

1. Install the AWS SDK:
   ```bash
   npm install @aws-sdk/client-bedrock-runtime
   ```

2. Set `.env`:
   ```
   AWS_REGION=us-east-1
   BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
   ```

3. In `aiEnrichmentService.js`, uncomment the `bedrockEnrich` function and replace this line:
   ```js
   // BEFORE (mock):
   return mockEnrich(product);

   // AFTER (Bedrock):
   return await bedrockEnrich(product);
   ```

The scaffold is already written — just uncomment and configure credentials via AWS CLI (`aws configure`) or environment variables.

---

## Where to Plug In Amplience

**File:** `backend/services/amplienceService.js`

1. Set `.env`:
   ```
   AMPLIENCE_HUB_ID=your_hub_id
   AMPLIENCE_API_KEY=your_api_key
   ```

2. In `amplienceService.js`, uncomment `pushToAmplienceReal` and call it instead of the mock block. The payload shape and auth header are already scaffolded.

---

## Where to Plug In Constructor.io

**File:** `backend/services/constructorService.js`

1. Set `.env`:
   ```
   CONSTRUCTOR_API_KEY=your_api_key
   CONSTRUCTOR_API_TOKEN=your_api_token
   ```

2. In `constructorService.js`, uncomment `pushToConstructorReal` and call it instead of the mock block. The correct endpoint URL, auth, and payload structure are already scaffolded.

---

## Extending the Product Catalog

Edit `backend/data/products.json`. Each product supports:

```json
{
  "id": "P001",           // required, unique string
  "title": "...",         // required
  "category": "...",      // optional
  "price": 99.99,         // optional
  "description": "...",   // optional — AI will generate if absent
  "image": "https://..."  // optional — falls back to picsum.photos
}
```

---

## Tech Stack

| Layer     | Tech                          |
|-----------|-------------------------------|
| Backend   | Node.js, Express, Axios, dotenv |
| Frontend  | HTML, CSS, Vanilla JS         |
| AI (mock) | Deterministic string generation |
| AI (real) | AWS Bedrock (Claude 3 Sonnet) |
| CMS       | Amplience Dynamic Media       |
| Search    | Constructor.io                |
