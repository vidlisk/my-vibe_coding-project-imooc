# 财务管家后端

基于 **Node.js + Express + MySQL** 的 REST API，为前端 `frontend/` 提供完整的记账业务接口。

## 技术栈

| 依赖 | 用途 |
|------|------|
| express | Web 框架 |
| mysql2 | 连接 MySQL（连接池 + 预编译） |
| bcryptjs | 密码哈希（注册加密、登录校验） |
| jsonwebtoken | 生成 / 校验 JWT token |
| cors | 跨域支持 |
| dotenv | 读取 `.env` 配置 |

## 目录结构

```
backend/
├── package.json
├── server.js            # 唯一入口，含全部 API（登录/注册/账户/分类/交易/统计等）
├── .env                 # 本地配置（数据库连接、JWT 密钥，勿提交）
├── .env.example         # 配置模板
└── tests/               # 测试套件
```

## 运行前准备

1. 确保 MySQL 容器已启动，并已执行数据库脚本 `finance_manager.sql`（含 `finance_manager` 库及表结构、种子数据）。
2. 确认 `.env` 里的数据库连接信息正确（默认 `127.0.0.1:13306`，root/root）。

## 安装与启动

```bash
cd backend
npm install
npm start          # 或 npm run dev（监听文件变化自动重启）
```

启动成功后监听 `http://localhost:3001`（端口来自 `.env` 的 `PORT`，前端已写死 3001，勿改动）。

## 接口一览

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/register` | 注册（自动创建默认账本 + 现金/微信/支付宝 3 个账户） |
| POST | `/api/login` | 登录，返回 JWT token |
| GET | `/api/verify` | 校验 token |
| GET / PUT | `/api/user` | 查询 / 更新当前用户信息 |
| GET / POST | `/api/accounts` | 账户列表 / 新增账户 |
| PUT / DELETE | `/api/accounts/:id` | 更新 / 删除账户 |
| GET / POST | `/api/categories` | 分类列表 / 新增分类 |
| PUT / DELETE | `/api/categories/:id` | 更新 / 删除分类 |
| POST | `/api/transactions` | 新增记账 |
| GET | `/api/transactions` | 交易明细（按类型/月份分页） |
| DELETE | `/api/transactions/:id` | 删除记账 |
| GET | `/api/home` | 首页汇总数据 |
| GET | `/api/statistics` | 统计报表 |
| GET | `/api/export` | 导出 CSV |
| GET | `/api/account-types` | 账户类型 |
| GET | `/api/category-types` | 收支类型 |

除注册/登录外，均需请求头 `Authorization: Bearer <token>`。

## 登录 / 注册示例

```
POST /api/register
{ "username": "alice", "password": "123456", "nickname": "爱丽丝" }

POST /api/login
{ "username": "alice", "password": "123456" }
```

成功返回统一结构：
```json
{
  "success": true,
  "message": "登录成功",
  "data": { "token": "...", "userId": 1, "username": "alice", "nickname": "爱丽丝", "theme": "light" }
}
```

失败返回：
```json
{ "success": false, "message": "用户名或密码错误" }
```

> 返回结构与前端 `frontend/pages/login.html`、`register.html` 里的预期格式完全一致，无需改前端即可联调。

## 说明

- **密码安全**：密码使用 bcrypt 哈希存储，数据库不保存明文。
- **种子用户**：数据库脚本预置的 `test` 用户密码是明文 `password123`，无法通过 bcrypt 校验。建议直接通过注册接口创建新账号（会自动建默认账本和 3 个账户）；如需要让 `test` 也能登录，可将其密码更新为 bcrypt 哈希。
