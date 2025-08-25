# Railway 部署检查清单

## 部署前准备

### 1. 环境变量配置
在 Railway Project → Variables 中设置以下变量：

```
PORT=3000
AWS_REGION=ap-southeast-2
BEDROCK_KB_ID=kb-xxxxxxxxxxxxxxxx
BEDROCK_MODEL_ARN=arn:aws:bedrock:ap-southeast-2::foundation-model/anthropic.claude-3-5-sonnet-20240620-v1:0
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

### 2. AWS 权限要求
确保 AWS 用户/角色具有以下权限：
- `bedrock:InvokeModel`
- `bedrock:RetrieveAndGenerate`
- 对指定 Knowledge Base 的访问权限

### 3. 部署步骤
1. 推送代码到 GitHub 仓库
2. 在 Railway 中连接 GitHub 仓库
3. 设置环境变量
4. Railway 会自动运行：
   - `npm install`
   - `npm run build` (通过 postinstall)
   - `npm start`

### 4. 验证部署
部署完成后，访问：
- `GET https://your-app.railway.app/health` - 健康检查
- `POST https://your-app.railway.app/rag/query` - 主要 API

### 5. 故障排除

#### 编译错误
- 检查 TypeScript 版本兼容性
- 确认所有依赖都已安装

#### 运行时错误
- 检查环境变量是否正确设置
- 验证 AWS 凭据和权限
- 检查 Bedrock 服务在指定区域是否可用

#### API 调用失败
- 验证 Knowledge Base ID 是否正确
- 检查 Model ARN 格式
- 确认 AWS 区域配置

## 性能优化建议

1. **冷启动优化**: Railway 的免费套餐有冷启动延迟，考虑使用定时健康检查保持服务活跃
2. **错误处理**: 生产环境建议添加更详细的错误日志和监控
3. **请求限制**: 考虑添加请求频率限制和超时处理
4. **响应验证**: 添加 JSON 格式验证确保返回有效数据

## 监控和维护

- 定期检查 Railway 日志
- 监控 AWS Bedrock 使用量和费用
- 定期更新依赖包安全补丁
