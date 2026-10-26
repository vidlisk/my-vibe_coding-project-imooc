/**
 * 财务管家 - Frontend Web应用自动化测试
 *
 * 覆盖：页面结构、关键元素、功能链接
 *
 * 运行：
 * node tests/test-frontend.js
 */

const fs = require('fs');
const path = require('path');

const PAGES_DIR = './pages';
const REPORT_DIR = './tests/reports';

// 测试结果
let results = { total: 0, passed: 0, failed: 0 };
let tests = [];

function test(name, passed, message = '') {
    results.total++;
    if (passed) results.passed++;
    else results.failed++;
    tests.push({ name, passed, message, time: new Date().toISOString() });
    console.log(`${passed ? '✅' : '❌'} ${name}: ${message}`);
}

function generateReport() {
    if (!fs.existsSync(REPORT_DIR)) {
        fs.mkdirSync(REPORT_DIR, { recursive: true });
    }

    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>财务管家 - Frontend测试报告</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; padding: 20px; }
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
        <h1>财务管家 - Frontend Web应用测试报告</h1>
        <div class="summary">
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="summary-value">${results.total}</div>
                    <div class="summary-label">总计</div>
                </div>
                <div class="summary-item passed">
                    <div class="summary-value">${results.passed}</div>
                    <div class="summary-label">通过</div>
                </div>
                <div class="summary-item failed">
                    <div class="summary-value">${results.failed}</div>
                    <div class="summary-label">失败</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value">${results.total > 0 ? ((results.passed / results.total) * 100).toFixed(0) : 0}%</div>
                    <div class="summary-label">通过率</div>
                </div>
            </div>
        </div>
        <div class="test-list">
            ${tests.map(t => `
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

    fs.writeFileSync(path.join(REPORT_DIR, 'frontend-test-report.html'), html);
    console.log(`\n📊 报告已生成: ${REPORT_DIR}/frontend-test-report.html`);
}

function validateHTML(pageName) {
    const filePath = path.join(PAGES_DIR, pageName);

    if (!fs.existsSync(filePath)) {
        return { exists: false, error: '文件不存在' };
    }

    const content = fs.readFileSync(filePath, 'utf-8');

    // 检查基本结构
    const checks = {
        hasDoctype: content.includes('<!DOCTYPE html>'),
        hasHtml: content.includes('<html'),
        hasHead: content.includes('<head>'),
        hasBody: content.includes('<body>'),
        hasTitle: /<title>.*<\/title>/.test(content),
        hasViewport: content.includes('viewport'),
        hasCharset: content.includes('charset=')
    };

    return { exists: true, checks };
}

function validatePageElements(pageName) {
    const filePath = path.join(PAGES_DIR, pageName);
    const content = fs.readFileSync(filePath, 'utf-8');

    const elements = {
        // 表单元素
        hasInput: content.includes('<input'),
        hasButton: content.includes('<button') || content.includes('onclick='),

        // 样式引用
        hasTailwind: content.includes('tailwind') || content.includes('class="'),
        hasStyles: content.includes('<style') || content.includes('.css'),

        // 脚本引用
        hasScript: content.includes('<script'),

        // 功能元素
        hasForm: content.includes('<form'),
        hasApiCall: content.includes('fetch') || content.includes('API')
    };

    return elements;
}

function runTests() {
    console.log('\n========================================');
    console.log('财务管家 - Frontend Web应用自动化测试');
    console.log('========================================\n');

    const pages = [
        'login.html',
        'register.html',
        'dashboard.html',
        'add_record.html',
        'statistics.html',
        'transaction_history.html',
        'settings.html',
        'account.html',
        'category.html'
    ];

    console.log('📋 测试组: 页面结构验证\n');

    // 1. 验证所有页面文件存在
    pages.forEach(page => {
        const filePath = path.join(PAGES_DIR, page);
        test(`页面存在: ${page}`, fs.existsSync(filePath), fs.existsSync(filePath) ? '文件存在' : '文件不存在');
    });

    console.log('\n📋 测试组: 基本HTML结构验证\n');

    // 2. 验证基本HTML结构
    ['login.html', 'dashboard.html', 'statistics.html'].forEach(page => {
        const filePath = path.join(PAGES_DIR, page);
        const content = fs.readFileSync(filePath, 'utf-8');
        const result = validateHTML(page);
        if (result.exists) {
            test(`${page} - DOCTYPE`, result.checks.hasDoctype);
            test(`${page} - HTML标签`, result.checks.hasHtml);
            test(`${page} - HEAD标签`, result.checks.hasHead);
            test(`${page} - BODY标签`, result.checks.hasBody || content.includes('<body '));
            test(`${page} - Title`, result.checks.hasTitle);
        }
    });

    console.log('\n📋 测试组: 关键元素验证\n');

    // 3. 登录页关键元素
    const loginContent = fs.readFileSync(path.join(PAGES_DIR, 'login.html'), 'utf-8');
    test('登录页 - 用户名输入框', loginContent.includes('username') || loginContent.includes('type="text"'));
    test('登录页 - 密码输入框', loginContent.includes('type="password"'));
    test('登录页 - 登录按钮', loginContent.includes('登录') || loginContent.includes('onclick'));
    test('登录页 - 注册链接', loginContent.includes('register') || loginContent.includes('注册'));

    // 4. 注册页关键元素
    const registerContent = fs.readFileSync(path.join(PAGES_DIR, 'register.html'), 'utf-8');
    test('注册页 - 用户名输入框', registerContent.includes('username'));
    test('注册页 - 密码输入框', registerContent.includes('type="password"'));
    test('注册页 - 昵称输入框', registerContent.includes('nickname'));
    test('注册页 - 注册按钮', registerContent.includes('注册'));

    // 5. 首页关键元素
    const dashboardContent = fs.readFileSync(path.join(PAGES_DIR, 'dashboard.html'), 'utf-8');
    test('首页 - 收入显示', dashboardContent.includes('收入') || dashboardContent.includes('income'));
    test('首页 - 支出显示', dashboardContent.includes('支出') || dashboardContent.includes('expense'));
    test('首页 - 分类列表', dashboardContent.includes('分类') || dashboardContent.includes('category'));
    test('首页 - 最近记账', dashboardContent.includes('最近') || dashboardContent.includes('recent'));
    test('首页 - 底部导航', dashboardContent.includes('bottom') || dashboardContent.includes('nav'));

    // 6. 记一笔页面关键元素
    const addRecordContent = fs.readFileSync(path.join(PAGES_DIR, 'add_record.html'), 'utf-8');
    test('记一笔 - 支出按钮', addRecordContent.includes('支出'));
    test('记一笔 - 收入按钮', addRecordContent.includes('收入'));
    test('记一笔 - 金额输入', addRecordContent.includes('amount') || addRecordContent.includes('number'));
    test('记一笔 - 分类选择', addRecordContent.includes('分类'));
    test('记一笔 - 账户选择', addRecordContent.includes('账户'));
    test('记一笔 - 日期选择', addRecordContent.includes('日期') || addRecordContent.includes('date'));
    test('记一笔 - 备注输入', addRecordContent.includes('备注') || addRecordContent.includes('remark'));
    test('记一笔 - 保存按钮', addRecordContent.includes('保存'));

    // 7. 统计页关键元素
    const statsContent = fs.readFileSync(path.join(PAGES_DIR, 'statistics.html'), 'utf-8');
    test('统计页 - 年度选择', statsContent.includes('年份') || statsContent.includes('year'));
    test('统计页 - 收入总计', statsContent.includes('收入'));
    test('统计页 - 支出总计', statsContent.includes('支出'));
    test('统计页 - 结余显示', statsContent.includes('结余') || statsContent.includes('balance'));
    test('统计页 - 图表引用', statsContent.includes('Chart') || statsContent.includes('chart'));
    test('统计页 - Canvas元素', statsContent.includes('canvas'));

    // 8. 明细页关键元素
    const historyContent = fs.readFileSync(path.join(PAGES_DIR, 'transaction_history.html'), 'utf-8');
    test('明细页 - 筛选功能', historyContent.includes('筛选') || historyContent.includes('filter'));
    test('明细页 - 交易列表', historyContent.includes('transaction') || historyContent.includes('记录'));
    test('明细页 - 分页功能', historyContent.includes('分页') || historyContent.includes('page'));

    // 9. 设置页关键元素
    const settingsContent = fs.readFileSync(path.join(PAGES_DIR, 'settings.html'), 'utf-8');
    test('设置页 - 用户信息', settingsContent.includes('用户') || settingsContent.includes('user'));
    test('设置页 - 分类管理入口', settingsContent.includes('分类管理'));
    test('设置页 - 账户管理入口', settingsContent.includes('账户管理'));
    test('设置页 - 退出登录', settingsContent.includes('退出') || settingsContent.includes('logout'));

    // 10. 样式验证
    console.log('\n📋 测试组: 样式和脚本验证\n');

    pages.forEach(page => {
        const content = fs.readFileSync(path.join(PAGES_DIR, page), 'utf-8');
        const hasStyle = content.includes('<style') || content.includes('.css');
        const hasScript = content.includes('<script') || content.includes('.js');
        test(`${page} - 样式引用`, hasStyle, hasStyle ? '有样式' : '无样式');
        test(`${page} - 脚本引用`, hasScript, hasScript ? '有脚本' : '无脚本');
    });

    // 生成报告
    generateReport();

    console.log('\n========================================');
    console.log(`测试完成: ${results.passed}/${results.total} 通过 (${((results.passed/results.total)*100).toFixed(0)}%)`);
    console.log('========================================\n');

    process.exit(results.failed > 0 ? 1 : 0);
}

runTests();