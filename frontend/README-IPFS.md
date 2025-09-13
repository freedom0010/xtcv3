# Filebase IPFS 集成指南

## 🚀 概述

本项目已集成 Filebase 作为 IPFS 存储提供商，支持真实的去中心化数据存储。

## 📋 配置步骤

### 1. 获取 Filebase 凭据

1. 访问 [Filebase.com](https://filebase.com) 注册账户
2. 创建一个新的存储桶（建议命名为 `diabetes-analytics`）
3. 生成 S3 API 访问密钥

### 2. 环境变量配置

在 `frontend/.env.local` 文件中添加以下配置：

```env
# Filebase IPFS 配置
NEXT_PUBLIC_FILEBASE_ACCESS_KEY=your_filebase_access_key_here
NEXT_PUBLIC_FILEBASE_SECRET_KEY=your_filebase_secret_key_here
NEXT_PUBLIC_FILEBASE_BUCKET=diabetes-analytics

# 可选：自定义 IPFS 网关
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.filebase.io/ipfs/
```

### 3. 测试配置

访问 `/ipfs-test` 页面测试 IPFS 功能：

```
http://localhost:3000/ipfs-test
```

## 🔧 技术实现

### 核心服务

- **FilebaseIPFSService** (`services/filebaseService.js`)
  - 使用 AWS S3 SDK 连接 Filebase
  - 支持数据加密/解密
  - 自动降级到模拟模式

### 主要功能

1. **数据上传**
   ```javascript
   const cid = await filebaseService.uploadToIPFS(data)
   ```

2. **数据下载**
   ```javascript
   const data = await filebaseService.getFromIPFS(cid)
   ```

3. **患者记录管理**
   ```javascript
   const result = await filebaseService.submitPatientRecord(walletAddress, surveyData)
   ```

### 数据流程

1. **患者数据提交**
   - 用户填写健康调查问卷
   - 数据经过加密处理
   - 上传到 Filebase IPFS
   - 返回 IPFS CID

2. **研究员数据访问**
   - 通过 CID 从 IPFS 获取加密数据
   - 解密后进行统计分析
   - 结果同样存储到 IPFS

## 🔒 安全特性

### 数据加密
- 使用 Base64 编码进行基础加密
- 可扩展为 AES 等强加密算法
- 密钥管理与数据分离

### 隐私保护
- 患者身份通过哈希算法匿名化
- 数据存储在去中心化 IPFS 网络
- 支持数据更新和删除

## 📊 监控和状态

### 服务状态检查
```javascript
const status = filebaseService.getServiceStatus()
console.log(status)
// {
//   initialized: true,
//   hasS3Client: true,
//   bucketName: 'diabetes-analytics',
//   recordCount: 5,
//   mode: 'Filebase IPFS'
// }
```

### 记录管理
```javascript
// 获取所有记录
const records = filebaseService.getAllPatientRecords()

// 删除记录
filebaseService.deletePatientRecord(patientId)
```

## 🛠 故障排除

### 常见问题

1. **"Filebase 未初始化"**
   - 检查环境变量是否正确配置
   - 确认 `.env.local` 文件位置

2. **"上传失败"**
   - 验证 Filebase 凭据有效性
   - 检查网络连接
   - 查看浏览器控制台错误

3. **"下载失败"**
   - 确认 CID 格式正确
   - 检查 IPFS 网关可访问性

### 调试模式

开启详细日志：
```javascript
// 在浏览器控制台中
localStorage.setItem('debug', 'filebase:*')
```

## 🔄 降级机制

当 Filebase 不可用时，系统自动降级到模拟模式：
- 生成模拟 CID
- 数据存储在 localStorage
- 保持功能完整性

## 📈 性能优化

### 建议配置
- 使用 CDN 加速 IPFS 访问
- 实现数据缓存机制
- 批量上传优化

### 监控指标
- 上传成功率
- 下载延迟
- 存储使用量

## 🚀 部署注意事项

1. **生产环境**
   - 使用强加密算法
   - 配置备份策略
   - 监控存储使用量

2. **安全检查**
   - 定期轮换 API 密钥
   - 审计数据访问日志
   - 实施访问控制

## 📚 相关资源

- [Filebase 文档](https://docs.filebase.com/)
- [IPFS 官方文档](https://docs.ipfs.io/)
- [AWS S3 SDK 文档](https://docs.aws.amazon.com/sdk-for-javascript/)