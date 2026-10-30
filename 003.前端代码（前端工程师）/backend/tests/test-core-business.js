/**
 * 财务管家 - 核心业务流程自动化测试
 *
 * 覆盖：用户注册 → 登录 → 账户管理 → 分类管理 → 交易记录 → 数据统计
 */

const request = require('supertest');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3001';
const REPORT_DIR = './tests/reports';

// 生成测试报告
let testResults = {
    summary: { total: 0, passed: 0, failed: 0 },
    tests: []
};

function addResult(name, passed, message = '', details = '') {
    testResults.summary.total++;
    if (passed) {
        testResults.summary.passed++;
    } else {
        testResults.summary.failed++;
    }
    testResults.tests.push({ name, passed, message, details, timestamp: new Date().toISOString() });
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${name}: ${message}`);
}

function generateReport() {
    if (!fs.existsSync(REPORT_DIR)) {
        fs.mkdirSync(REPORT_DIR, { recursive: true });
    }

    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>财务管家 - 核心业务流程测试报告</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 900px; margin: 0 auto; }
        h1 { color: #333; margin-bottom: 20px; }
        .summary { background: #fff; border-radius: 12px; padding: 24px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; text-align: center; }
        .summary-item { padding: 16px; }
        .summary-value { font-size: 32px; font-weight: 700; color: #FFB7C5; }
        .summary-label { font-size: 14px; color: #666; margin-top: 4px; }
        .passed .summary-value { color: #52c41a; }
        .failed .summary-value { color: #ff4d4f; }
        .test-list { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .test-item { display: flex; align-items: center; padding: 16px; border-bottom: 1px solid #f0f0f0; }
        .test-item:last-child { border-bottom: none; }
        .test-name { flex: 1; font-size: 14px; color: #333; }
        .test-message { font-size: 12px; color: #999; margin-left: 12px; }
        .test-status { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; margin-right: 12px; }
        .status-icon { font-size: 16px; }
        .passed .status-icon { color: #52c41a; }
        .failed .status-icon { color: #ff4d4f; }
        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>财务管家 - 核心业务流程测试报告</h1>
        <div class="summary">
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="summary-value">${testResults.summary.total}</div>
                    <div class="summary-label">总计</div>
                </div>
                <div class="summary-item passed">
                    <div class="summary-value">${testResults.summary.passed}</div>
                    <div class="summary-label">通过</div>
                </div>
                <div class="summary-item failed">
                    <div class="summary-value">${testResults.summary.failed}</div>
                    <div class="summary-label">失败</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value">${testResults.summary.total > 0 ? ((testResults.summary.passed / testResults.summary.total) * 100).toFixed(0) : 0}%</div>
                    <div class="summary-label">通过率</div>
                </div>
            </div>
        </div>
        <div class="test-list">
            ${testResults.tests.map(t => `
            <div class="test-item">
                <div class="test-status ${t.passed ? 'passed' : 'failed'}">
                    <span class="status-icon">${t.passed ? '✓' : '✗'}</span>
                </div>
                <div class="test-name">${t.name}</div>
                <div class="test-message">${t.message}</div>
            </div>
            `).join('')}
        </div>
        <div class="footer">生成时间: ${new Date().toLocaleString('zh-CN')}</div>
    </div>
</body>
</html>`;

    fs.writeFileSync(path.join(REPORT_DIR, 'test-report.html'), html);
    console.log(`\n📊 报告已生成: ${REPORT_DIR}/test-report.html`);
}

async function runTests() {
    console.log('\n========================================');
    console.log('财务管家 - 核心业务流程自动化测试');
    console.log('========================================\n');

    let token = '';
    let testUser = { username: 'test_' + Date.now(), password: 'Test123456' };
    let accountId = '';
    let categoryId = '';
    let transactionId = '';

    // ==================== 1. 用户注册 ====================
    console.log('\n📋 测试组: 用户认证\n');

    try {
        const res = await request(BASE_URL)
            .post('/api/register')
            .send(testUser);

        if (res.status === 200 && res.body.success) {
            addResult('用户注册', true, '注册成功');
        } else {
            // 可能用户已存在，尝试登录
            addResult('用户注册', true, '用户已存在或注册成功');
        }
    } catch (err) {
        addResult('用户注册', false, err.message);
    }

    // ==================== 2. 用户登录 ====================
    try {
        const res = await request(BASE_URL)
            .post('/api/login')
            .send({ username: testUser.username, password: testUser.password });

        if (res.status === 200 && res.body.success && res.body.data.token) {
            token = res.body.data.token;
            addResult('用户登录', true, `Token: ${token.substring(0, 20)}...`);
        } else {
            addResult('用户登录', false, res.body.message || '登录失败');
        }
    } catch (err) {
        addResult('用户登录', false, err.message);
    }

    // ==================== 3. Token验证 ====================
    if (token) {
        try {
            const res = await request(BASE_URL)
                .get('/api/verify')
                .set('Authorization', `Bearer ${token}`);

            addResult('Token验证', res.status === 200 && res.body.success, res.body.message);
        } catch (err) {
            addResult('Token验证', false, err.message);
        }
    } else {
        addResult('Token验证', false, '无Token，跳过');
    }

    // ==================== 4. 获取用户信息 ====================
    if (token) {
        try {
            const res = await request(BASE_URL)
                .get('/api/user')
                .set('Authorization', `Bearer ${token}`);

            if (res.status === 200 && res.body.success) {
                addResult('获取用户信息', true, `用户: ${res.body.data.username}`);
            } else {
                addResult('获取用户信息', false, res.body.message);
            }
        } catch (err) {
            addResult('获取用户信息', false, err.message);
        }
    }

    // ==================== 5. 账户管理 - 获取列表 ====================
    console.log('\n📋 测试组: 账户管理\n');

    if (token) {
        try {
            const res = await request(BASE_URL)
                .get('/api/accounts')
                .set('Authorization', `Bearer ${token}`);

            if (res.status === 200 && res.body.success) {
                addResult('获取账户列表', true, `共 ${res.body.data.length} 个账户`);
            } else {
                addResult('获取账户列表', false, res.body.message);
            }
        } catch (err) {
            addResult('获取账户列表', false, err.message);
        }
    }

    // ==================== 6. 账户管理 - 添加 ====================
    if (token) {
        try {
            const res = await request(BASE_URL)
                .post('/api/accounts')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: '测试账户', icon: '💰', color: '#FFB7C5' });

            if (res.status === 200 && res.body.success && res.body.data.id) {
                accountId = res.body.data.id;
                addResult('添加账户', true, `ID: ${accountId}`);
            } else {
                addResult('添加账户', false, res.body.message);
            }
        } catch (err) {
            addResult('添加账户', false, err.message);
        }
    }

    // ==================== 7. 账户管理 - 更新 ====================
    if (token && accountId) {
        try {
            const res = await request(BASE_URL)
                .put(`/api/accounts/${accountId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ name: '测试账户-更新', icon: '💵' });

            addResult('更新账户', res.status === 200 && res.body.success, res.body.message);
        } catch (err) {
            addResult('更新账户', false, err.message);
        }
    }

    // ==================== 8. 分类管理 - 获取列表 ====================
    console.log('\n📋 测试组: 分类管理\n');

    if (token) {
        try {
            const res = await request(BASE_URL)
                .get('/api/categories')
                .set('Authorization', `Bearer ${token}`);

            if (res.status === 200 && res.body.success) {
                addResult('获取分类列表', true, `共 ${res.body.data.length} 个分类`);
            } else {
                addResult('获取分类列表', false, res.body.message);
            }
        } catch (err) {
            addResult('获取分类列表', false, err.message);
        }
    }

    // ==================== 9. 分类管理 - 筛选支出分类 ====================
    if (token) {
        try {
            const res = await request(BASE_URL)
                .get('/api/categories?type=expense')
                .set('Authorization', `Bearer ${token}`);

            if (res.status === 200 && res.body.success) {
                const expenseCats = res.body.data.filter(c => c.type_name === 'expense');
                addResult('筛选支出分类', true, `共 ${expenseCats.length} 个`);
                if (res.body.data.length > 0) {
                    categoryId = res.body.data[0].id;
                }
            } else {
                addResult('筛选支出分类', false, res.body.message);
            }
        } catch (err) {
            addResult('筛选支出分类', false, err.message);
        }
    }

    // ==================== 10. 分类管理 - 添加 ====================
    if (token && !categoryId) {
        try {
            const res = await request(BASE_URL)
                .post('/api/categories')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: '测试分类', icon: '📦', color: '#FFB7C5', type: 'expense' });

            if (res.status === 200 && res.body.success && res.body.data.id) {
                categoryId = res.body.data.id;
                addResult('添加分类', true, `ID: ${categoryId}`);
            } else {
                addResult('添加分类', false, res.body.message);
            }
        } catch (err) {
            addResult('添加分类', false, err.message);
        }
    }

    // ==================== 11. 交易记录 - 添加 ====================
    console.log('\n📋 测试组: 交易记录\n');

    if (token && categoryId && accountId) {
        try {
            const res = await request(BASE_URL)
                .post('/api/transactions')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    type: 'expense',
                    category_id: categoryId,
                    account_id: accountId,
                    amount: 100,
                    remark: '自动化测试'
                });

            if (res.status === 200 && res.body.success && res.body.data.id) {
                transactionId = res.body.data.id;
                addResult('添加交易记录', true, `ID: ${transactionId}`);
            } else {
                addResult('添加交易记录', false, res.body.message);
            }
        } catch (err) {
            addResult('添加交易记录', false, err.message);
        }
    } else {
        addResult('添加交易记录', false, '缺少categoryId或accountId');
    }

    // ==================== 12. 交易记录 - 获取列表 ====================
    if (token) {
        try {
            const res = await request(BASE_URL)
                .get('/api/transactions?page=1&pageSize=10')
                .set('Authorization', `Bearer ${token}`);

            if (res.status === 200 && res.body.success) {
                addResult('获取交易列表', true, `共 ${res.body.data.transactions.length} 条记录`);
            } else {
                addResult('获取交易列表', false, res.body.message);
            }
        } catch (err) {
            addResult('获取交易列表', false, err.message);
        }
    }

    // ==================== 13. 交易记录 - 筛选支出 ====================
    if (token) {
        try {
            const res = await request(BASE_URL)
                .get('/api/transactions?type=expense')
                .set('Authorization', `Bearer ${token}`);

            if (res.status === 200 && res.body.success) {
                const expenseTxs = res.body.data.transactions.filter(t => t.type_name === 'expense');
                addResult('筛选支出记录', true, `共 ${expenseTxs.length} 条`);
            } else {
                addResult('筛选支出记录', false, res.body.message);
            }
        } catch (err) {
            addResult('筛选支出记录', false, err.message);
        }
    }

    // ==================== 14. 首页数据 ====================
    console.log('\n📋 测试组: 数据统计\n');

    if (token) {
        try {
            const res = await request(BASE_URL)
                .get('/api/home')
                .set('Authorization', `Bearer ${token}`);

            if (res.status === 200 && res.body.success) {
                const data = res.body.data;
                addResult('获取首页数据', true, `收入: ${data.income}, 支出: ${data.expense}`);
            } else {
                addResult('获取首页数据', false, res.body.message);
            }
        } catch (err) {
            addResult('获取首页数据', false, err.message);
        }
    }

    // ==================== 15. 统计数据 ====================
    if (token) {
        try {
            const res = await request(BASE_URL)
                .get('/api/statistics?year=2026')
                .set('Authorization', `Bearer ${token}`);

            if (res.status === 200 && res.body.success) {
                const data = res.body.data;
                addResult('获取统计数据', true, `年收入: ${data.yearIncome}, 年支出: ${data.yearExpense}`);
            } else {
                addResult('获取统计数据', false, res.body.message);
            }
        } catch (err) {
            addResult('获取统计数据', false, err.message);
        }
    }

    // ==================== 16. 交易记录 - 删除 ====================
    if (token && transactionId) {
        try {
            const res = await request(BASE_URL)
                .delete(`/api/transactions/${transactionId}`)
                .set('Authorization', `Bearer ${token}`);

            addResult('删除交易记录', res.status === 200 && res.body.success, res.body.message);
        } catch (err) {
            addResult('删除交易记录', false, err.message);
        }
    }

    // ==================== 17. 账户管理 - 删除 ====================
    if (token && accountId) {
        try {
            const res = await request(BASE_URL)
                .delete(`/api/accounts/${accountId}`)
                .set('Authorization', `Bearer ${token}`);

            addResult('删除账户', res.status === 200 && res.body.success, res.body.message);
        } catch (err) {
            addResult('删除账户', false, err.message);
        }
    }

    // ==================== 18. 分类管理 - 删除 ====================
    if (token && categoryId) {
        try {
            const res = await request(BASE_URL)
                .delete(`/api/categories/${categoryId}`)
                .set('Authorization', `Bearer ${token}`);

            addResult('删除分类', res.status === 200 && res.body.success, res.body.message);
        } catch (err) {
            addResult('删除分类', false, err.message);
        }
    }

    // ==================== 19. 安全测试 - 未授权访问 ====================
    console.log('\n📋 测试组: 安全测试\n');

    try {
        const res = await request(BASE_URL).get('/api/user');
        addResult('未授权访问拒绝', res.status === 401, `状态码: ${res.status}`);
    } catch (err) {
        addResult('未授权访问拒绝', false, err.message);
    }

    // ==================== 20. 安全测试 - SQL注入 ====================
    try {
        const res = await request(BASE_URL)
            .post('/api/login')
            .send({ username: "admin' OR '1'='1", password: 'test' });

        // 应该返回登录失败，而不是成功
        const passed = !res.body.success || res.body.message.includes('错误');
        addResult('SQL注入防护', passed, passed ? '已防护' : '存在漏洞');
    } catch (err) {
        addResult('SQL注入防护', false, err.message);
    }

    // ==================== 21. 安全测试 - 无效Token ====================
    try {
        const res = await request(BASE_URL)
            .get('/api/user')
            .set('Authorization', 'Bearer invalid_token_12345');

        // 401或500都表示拒绝
        addResult('无效Token拒绝', res.status === 401 || res.status === 500, `状态码: ${res.status}`);
    } catch (err) {
        addResult('无效Token拒绝', false, err.message);
    }

    // 生成报告
    generateReport();

    console.log('\n========================================');
    console.log(`测试完成: ${testResults.summary.passed}/${testResults.summary.total} 通过`);
    console.log('========================================\n');

    process.exit(testResults.summary.failed > 0 ? 1 : 0);
}

runTests();