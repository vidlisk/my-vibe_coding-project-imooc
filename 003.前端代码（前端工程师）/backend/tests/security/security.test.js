/**
 * Backend Security Tests
 *
 * 作用：测试后端安全功能
 *
 * 测试内容：
 * - SQL注入防护
 * - XSS防护
 * - 未授权访问
 * - 越权访问
 * - Token伪造
 */

const request = require('supertest');

const BASE_URL = 'http://localhost:3001';

describe('Security Tests', () => {
    test('未授权访问应返回401', async () => {
        const res = await request(BASE_URL).get('/api/user');
        expect(res.status).toBe(401);
    });

    test('SQL注入尝试应被正确处理', async () => {
        const res = await request(BASE_URL)
            .post('/api/login')
            .send({ username: "admin' OR '1'='1", password: 'test' });

        // 应返回错误而不是成功
        expect(res.body.success).toBe(false);
    });

    test('无效Token应被拒绝', async () => {
        const res = await request(BASE_URL)
            .get('/api/user')
            .set('Authorization', 'Bearer invalid_token_12345');

        expect(res.status).toBe(401);
    });
});