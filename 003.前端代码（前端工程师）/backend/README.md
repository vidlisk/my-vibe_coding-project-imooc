# 财务管家后端（登录 / 注册）

基于 **Node.js + Express + MySQL** 的 REST API，为前端 `frontend/` 提供登录、注册接口。

## 技术栈

| 依赖 | 用途 |
|------|------|
| express | Web 框架 |
| mysql2 | 连接 MySQL（连接池 + 预编译） |
| bcryptjs | 密码哈希（注册时加密、登录时校验） |
| jsonwebtoken | 生成 JWT token |
| cors | 跨域支持 |
| dotenv | 读取 `.env` 配置 |

## 目录结构

```
backend/
├── package.json
├── .env                 # 本地配置（含数据库连接、JWT 密钥）
├── .env.example         # 配置模板
├── .gitignore
└── src/
    ├── server.js        # 入口，启动服务
    ├── db.js            # MySQL 连接池
    ├── routes/
    │   └── auth.js      # 登录/注册路由
    ├── controllers/
    │   └── authController.js  # 登录/注册业务逻辑
    └── middleware/
        └── auth.js      # JWT 校验中间件（供后续受保护接口使用）
```

## 运行前准备

1. 确保 MySQL 容器已启动，并已执行数据库脚本 `finance_manager.sql`（包含 `finance_manager` 库和 `users` 表）。
2. 确认 `.env` 里的数据库连接信息正确（默认 `127.0.0.1:13306`，root/root）。

## 安装与启动

```bash
cd backend
npm install
npm start          # 或 npm run dev（监听文件变化自动重启）
```

启动成功后监听 `http://localhost:3001`。

## 接口说明

### 注册

```
POST /api/register
Content-Type: application/json

{ "username": "alice", "password": "123456", "nickname": "爱丽丝" }
```

成功返回：
```json
{
  "success": true,
  "message": "注册成功",
  "data": { "token": "...", "userId": 1, "username": "alice", "nickname": "爱丽丝" }
}
```

失败返回（如用户名已存在）：
```json
{ "success": false, "message": "用户名已存在" }
```

### 登录

```
POST /api/login
Content-Type: application/json

{ "username": "alice", "password": "123456" }
```

成功返回：
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "token": "...",
    "userId": 1,
    "username": "alice",
    "nickname": "爱丽丝",
    "theme": "light"
  }
}
```

失败返回：
```json
{ "success": false, "message": "用户名或密码错误" }
```

> 返回结构与前端 `frontend/pages/login.html`、`register.html` 里的预期格式完全一致，无需改前端即可联调。

## 说明

- **密码安全**：密码使用 bcrypt 哈希存储，数据库里不保存明文。
- **种子用户注意**：数据库脚本里预置的 `test` 用户密码是明文 `password123`，无法通过 bcrypt 校验。建议直接用注册接口创建新账号；如需要让 `test` 也能登录，可将其密码更新为 bcrypt 哈希。
