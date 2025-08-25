# Deployment Checklist

## Render Deployment (Recommended)

### 1. Create Render Service
1. Visit [Render.com](https://render.com) and login
2. Click "New" → "Web Service"
3. Connect your GitHub repository: `https://github.com/Maaayhan/bedrock-rag-api`
4. Configure service:
   - **Name**: `bedrock-rag-api`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free` (suitable for testing)

### 2. Environment Variables Configuration
Set the following variables in Render Dashboard → Environment:

```
AWS_REGION=us-east-1
BEDROCK_KB_ID=your_knowledge_base_id
BEDROCK_MODEL_ARN=arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-sonnet-20240620-v1:0
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
```

### 3. Deployment Verification
After deployment is complete, visit:
- `GET https://your-app.onrender.com/health` - Health check
- `POST https://your-app.onrender.com/rag/query` - Main API

---

## Railway Deployment (Alternative)

### 1. Environment Variables Configuration
Set the following variables in Railway Project → Variables:

```
AWS_REGION=us-east-1
BEDROCK_KB_ID=your_knowledge_base_id
BEDROCK_MODEL_ARN=arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-sonnet-20240620-v1:0
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
```

### 2. AWS Permission Requirements
Ensure AWS user/role has the following permissions:
- `bedrock:InvokeModel`
- `bedrock:RetrieveAndGenerate`
- Access permissions to the specified Knowledge Base

### 3. Deployment Steps
1. Push code to GitHub repository
2. Connect GitHub repository in Railway
3. Set environment variables
4. Railway will automatically run:
   - `npm install`
   - `npm run build` (via postinstall)
   - `npm start`

### 4. Deployment Verification
After deployment is complete, visit:
- `GET https://your-app.railway.app/health` - Health check
- `POST https://your-app.railway.app/rag/query` - Main API

### 5. Troubleshooting

#### Compilation Errors
- Check TypeScript version compatibility
- Confirm all dependencies are installed

#### Runtime Errors
- Check if environment variables are correctly set
- Verify AWS credentials and permissions
- Check if Bedrock service is available in the specified region

#### API Call Failures
- Verify Knowledge Base ID is correct
- Check Model ARN format
- Confirm AWS region configuration

## Performance Optimization Recommendations

1. **Cold Start Optimization**: Free tier platforms have cold start delays, consider using scheduled health checks to keep service active
2. **Error Handling**: Production environments should add more detailed error logging and monitoring
3. **Request Limiting**: Consider adding request rate limiting and timeout handling
4. **Response Validation**: Add JSON format validation to ensure valid data return

## Monitoring and Maintenance

- Regularly check deployment platform logs
- Monitor AWS Bedrock usage and costs
- Regularly update dependency security patches
