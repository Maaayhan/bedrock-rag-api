# Bedrock RAG API

Minimal RAG API for Amazon Bedrock Knowledge Bases - Cloud deployable

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
```bash
cp env.example .env
# Edit .env file with your AWS configuration
```

### 3. Local Development
```bash
npm run dev
```

### 4. Test API

**Using curl:**
```bash
curl -X POST http://localhost:3000/rag/query \
  -H "Content-Type: application/json" \
  -d '{"query":"20-minute GP telehealth for chronic disease review"}'
```

**Health check:**
```bash
curl http://localhost:3000/health
```

## Render Deployment

1. Connect GitHub repository to Render
2. Select "Web Service" type
3. Set Environment Variables:
   - `AWS_REGION=us-east-1`
   - `BEDROCK_KB_ID=your_knowledge_base_id`  
   - `BEDROCK_MODEL_ARN=arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-sonnet-20240620-v1:0`
   - `AWS_ACCESS_KEY_ID=your_access_key`
   - `AWS_SECRET_ACCESS_KEY=your_secret_key`
4. Render will automatically run `npm install && npm run build` and `npm start`

### Railway Deployment (Alternative)

1. Connect GitHub repository to Railway
2. Set environment variables in Railway Project → Variables (same as above)
3. Railway will automatically run `npm run build` and `npm start`

## API Endpoints

### POST /rag/query
Request body:
```json
{
  "query": "your search query"
}
```

Response: MBS-related JSON results

### GET /health
Health check endpoint

## Tech Stack

- TypeScript (CommonJS output)
- Express.js
- AWS SDK v3 (Bedrock Agent Runtime)
- Cloud deployment ready (Render/Railway)
