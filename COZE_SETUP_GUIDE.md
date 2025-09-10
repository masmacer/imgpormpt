# 🔧 扣子中国版 API 配置指南

## 问题诊断结果

**您的当前token `pat_YRtNgZ...` 已失效。**

由于您使用的是**中国版扣子**，需要确保token和API地址都使用中国版配置。

## 🎯 中国版扣子配置方案

### 第一步：获取新的中国版token
1. 访问 [https://www.coze.cn](https://www.coze.cn)
2. 登录您的扣子账户
3. 进入个人设置 → Personal Access Tokens (个人访问令牌)
4. 点击"Create New Token"创建新的token
5. 复制生成的token (格式: `pat_xxxxx...`)

### 第二步：更新配置
在您的 `.env.local` 文件中更新以下配置：
```bash
# 使用您新创建的中国版token替换这里
COZE_ACCESS_TOKEN='你的新token'

# 确保使用中国版API地址
COZE_API_BASE_URL='https://api.coze.cn'

# 工作流ID (如果需要更新)
COZE_WORKFLOW_ID='7444003419414962176'
```

### 第三步：创建/配置工作流 (如果需要)
1. 在 [coze.cn](https://www.coze.cn) 上创建工作流
2. 确保工作流支持图片上传和prompt生成
3. 获取新的工作流ID并更新到配置中

## ⚠️ 重要提示

**中国版扣子专用配置：**
- ✅ API地址：`https://api.coze.cn`
- ✅ 官网：`https://www.coze.cn`
- ❌ 不要使用国际版的token或API地址
- ❌ 国际版token无法在中国版API上使用

## 🔄 测试步骤

配置完成后，按顺序测试：

1. **Token验证测试**：
   ```
   访问：http://localhost:3000/api/test-token
   预期：返回成功响应，不是401错误
   ```

2. **完整功能测试**：
   ```
   访问：http://localhost:3000/zh
   操作：上传一张图片，选择模型，点击生成
   预期：成功生成图片prompt
   ```

## 📋 当前配置状态

当前 `.env.local` 配置：
```bash
COZE_ACCESS_TOKEN='pat_YRtNgZ...'  # ❌ 需要更新为中国版新token
COZE_API_BASE_URL='https://api.coze.cn'  # ✅ 已设为中国版
COZE_WORKFLOW_ID='7444003419414962176'  # ✅ 工作流ID
```

## 🆘 常见问题

**Q: 如何知道token是否有效？**
A: 访问测试接口 `http://localhost:3000/api/test-token`，如果返回401说明token无效。

**Q: 工作流ID需要更新吗？**
A: 如果您在中国版上重新创建了工作流，需要使用新的工作流ID。

**Q: 国际版和中国版可以混用吗？**
A: 不可以，必须保持一致：中国版token + 中国版API地址。

更新token后即可正常使用Image to Prompt功能！
