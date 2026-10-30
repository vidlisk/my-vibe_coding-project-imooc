/**
 * Backend API Tests - Accounts
 *
 * 作用：测试账户管理API接口
 *
 * 测试接口：
 * - GET /api/accounts - 获取账户列表
 * - POST /api/accounts - 添加账户
 * - PUT /api/accounts/:id - 更新账户
 * - DELETE /api/accounts/:id - 删除账户
 */

const request = require('supertest');

const BASE_URL = 'http://localhost:3001';
let authToken = '';
let testAccountId = '';

beforeAll(async () => {
    // 登录获取token
    const loginRes = await request(BASE_URL)
        .post('/api/login')
        .send({ username: 'testuser', password: 'Test123456' });
    authToken = loginRes.body.data.token;
});

describe('Accounts API', () => {
    test('GET /api/accounts - 获取账户列表', async () => {
        const res = await request(BASE_URL)
            .get('/api/accounts')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('POST /api/accounts - 添加账户', async () => {
        const res = await request(BASE_URL)
            .post('/api/accounts')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ name: '测试账户', icon: '💰' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        testAccountId = res.body.data.id;
    });

    test('PUT /api/accounts/:id - 更新账户', async () => {
        const res = await request(BASE_URL)
            .put(`/api/accounts/${testAccountId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ name: '更新后账户' });

        expect(res.status).toBe(200);
    });

    test('DELETE /api/accounts/:id - 删除账户', async () => {
        const res = await request(BASE_URL)
            .delete(`/api/accounts/${testAccountId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
    });
});