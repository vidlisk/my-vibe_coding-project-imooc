require('dotenv').config();

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();

// 中间件
app.use(cors());           // 允许前端跨域访问
app.use(express.json());   // 解析 JSON 请求体

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'ok', time: new Date().toISOString() });
});

// 业务路由
app.use('/api', authRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: '接口不存在' });
});

// 统一错误处理
app.use((err, req, res, next) => {
  console.error('未捕获错误:', err);
  res.status(500).json({ success: false, message: '服务器内部错误' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`✅ 后端服务已启动: http://localhost:${PORT}`);
  console.log(`   健康检查: GET  http://localhost:${PORT}/api/health`);
  console.log(`   登录接口: POST http://localhost:${PORT}/api/login`);
  console.log(`   注册接口: POST http://localhost:${PORT}/api/register`);
});
