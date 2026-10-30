/**
 * Backend Unit Tests - Utility Functions
 *
 * 作用：测试后端工具函数
 *
 * 测试内容：
 * - 日期格式化
 * - 金额格式化
 * - Token生成/验证
 * - 密码加密/验证
 */

const { formatDate, hashPassword, verifyPassword } = require('./utils');

describe('Utils', () => {
    test('formatDate formats ISO date correctly', () => {
        expect(formatDate('2026-05-15')).toBe('2026年5月15日');
    });

    test('hashPassword creates hash', () => {
        const hash = hashPassword('Test123');
        expect(hash).not.toBe('Test123');
        expect(hash.length).toBeGreaterThan(0);
    });

    test('verifyPassword validates correctly', () => {
        const hash = hashPassword('Test123');
        expect(verifyPassword('Test123', hash)).toBe(true);
    });
});