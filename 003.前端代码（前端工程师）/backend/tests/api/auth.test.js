/**
 * Backend API Tests - Authentication
 *
 * 作用：测试认证相关API接口
 *
 * 测试接口：
 * - POST /api/register - 用户注册
 * - POST /api/login - 用户登录
 * - GET /api/verify - Token验证
 */

const request = require('supertest');

const BASE_URL = 'http://localhost:3001';
let authToken = '';

describe('Auth API', () => {
    const testUser = {
        username: 'test_' + Date.now(),
        password: 'Test123456',
        nickname: '测试用户'
    };

    test('POST /api/register - 用户注册', async () => {
        const res = await request(BASE_URL)
            .post('/api/register')
            .send(testUser);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    test('POST /api/login - 用户登录', async () => {
        const res = await request(BASE_URL)
            .post('/api/login')
            .send({ username: testUser.username, password: testUser.password });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.token).toBeDefined();
        authToken = res.body.data.token;
    });

    test('GET /api/verify - Token验证', async () => {
        const res = await request(BASE_URL)
            .get('/api/verify')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
});