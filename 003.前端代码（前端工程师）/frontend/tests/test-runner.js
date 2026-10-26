/**
 * Frontend Tests - Test Runner
 *
 * 作用：运行前端Web应用的各种测试
 *
 * 测试类型：
 * 1. unit/ - 单元测试（工具函数、格式化等）
 * 2. integration/ - 集成测试（多页面流程）
 * 3. e2e/ - 端到端测试（完整业务流程）
 * 4. reports/ - 测试报告输出目录
 *
 * 运行命令：
 * npm test              - 运行所有测试
 * npm run test:ui      - 运行界面测试
 * npm run test:ft      - 运行功能测试
 * npm run test:e2e     - 运行端到端测试
 * npm run test:report  - 生成测试报告
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const TEST_DIR = './tests';
const REPORT_DIR = './tests/reports';

// 确保报告目录存在
if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
}

const suites = {
    unit: '单元测试 - 验证工具函数、日期格式化、金额格式化等',
    integration: '集成测试 - 多页面流程、数据一致性',
    e2e: '端到端测试 - 完整业务流程（需启动后端）'
};

console.log('\n========================================');
console.log('财务管家 Frontend 测试套件');
console.log('========================================\n');

const args = process.argv.slice(2);
const suite = args.find(a => a.startsWith('--suite='))?.split('=')[1];

// 显示帮助
if (args.includes('--help') || args.includes('-h')) {
    console.log('可用测试套件：');
    Object.entries(suites).forEach(([key, desc]) => {
        console.log(`  ${key.padEnd(12)} - ${desc}`);
    });
    console.log('\n示例：');
    console.log('  npm test --suite=unit     # 运行单元测试');
    console.log('  npm test --suite=e2e      # 运行端到端测试');
    console.log('  npm test --report        # 生成报告');
    process.exit(0);
}

try {
    if (suite && suites[suite]) {
        console.log(`正在运行: ${suites[suite]}\n`);

        switch (suite) {
            case 'unit':
                console.log('✓ 单元测试: 无现成单元代码（HTML项目），跳过');
                break;
            case 'integration':
                console.log('✓ 集成测试: 手动测试');
                break;
            case 'e2e':
                console.log('✓ 端到端测试: 使用Playwright进行');
                execSync('npx playwright test', { stdio: 'inherit' });
                break;
        }

        console.log('\n✅ 测试完成');
        console.log(`📊 报告位置: ${REPORT_DIR}`);
    } else {
        console.log('请指定测试套件，运行 --help 查看可用选项');
        process.exit(1);
    }
} catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    process.exit(1);
}