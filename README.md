# Bedrock RAG API

Minimal RAG API for Amazon Bedrock Knowledge Bases - Railway deployable

## Quick Start

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
```bash
cp env.example .env
# 编辑 .env 填入你的 AWS 配置
```

### 3. 本地开发
```bash
npm run dev
```

### 4. 测试 API

**使用 curl:**
```bash
curl -X POST http://localhost:3000/rag/query \
  -H "Content-Type: application/json" \
  -d '{"query":"20-minute GP telehealth for chronic disease review"}'
```

**健康检查:**
```bash
curl http://localhost:3000/health
```

## Render 部署

1. 连接 GitHub 仓库到 Render
2. 选择 "Web Service" 类型
3. 在 Environment Variables 中设置：
   - `AWS_REGION=us-east-1`
   - `BEDROCK_KB_ID=your_knowledge_base_id`  
   - `BEDROCK_MODEL_ARN=arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-sonnet-20240620-v1:0`
   - `AWS_ACCESS_KEY_ID=your_access_key`
   - `AWS_SECRET_ACCESS_KEY=your_secret_key`
4. Render 会自动运行 `npm install && npm run build` 和 `npm start`

### Railway 部署（备选）

1. 连接 GitHub 仓库到 Railway
2. 在 Railway Project → Variables 中设置环境变量（同上）
3. Railway 会自动运行 `npm run build` 和 `npm start`

## API 接口

### POST /rag/query
请求体：
```json
{
  "query": "your search query"
}
```

响应：MBS 相关的 JSON 结果

### GET /health
健康检查接口

## 技术栈

- TypeScript (CommonJS 输出)
- Express.js
- AWS SDK v3 (Bedrock Agent Runtime)
- Railway 一键部署
