#!/usr/bin/env node

/**
 * 直接测试你的 Vite 插件文件的测试脚本
 * 捕获并显示插件的真实输出
 */

const path = require('path');
const { execSync } = require('child_process');

// Mock Git 环境数据
const mockGitCommands = {
  // 场景1: 主分支同步
  'main_sync': {
    'git rev-parse --abbrev-ref HEAD': 'main',
    'git rev-parse --short HEAD': 'a9a4f64',
    'git remote': 'origin',
    'git show-ref --verify --quiet refs/remotes/origin/main': '',
    'git rev-list --count HEAD..origin/main': '0',
    'git rev-list --count origin/main..HEAD': '0'
  },
  
  // 场景2: 功能分支领先远程
  'feature_ahead': {
    'git rev-parse --abbrev-ref HEAD': 'feature/user-login',
    'git rev-parse --short HEAD': 'b2c5e89',
    'git remote': 'origin',
    'git show-ref --verify --quiet refs/remotes/origin/feature/user-login': '',
    'git rev-list --count HEAD..origin/feature/user-login': '0',
    'git rev-list --count origin/feature/user-login..HEAD': '3',
    'git show-ref --verify --quiet refs/remotes/origin/main': '',
    'git merge-base HEAD origin/main': 'abc1234',
    'git rev-list --count abc1234..HEAD': '5',
    'git rev-list --count HEAD..origin/main': '0'
  },
  
  // 场景3: 功能分支落后远程
  'feature_behind': {
    'git rev-parse --abbrev-ref HEAD': 'feature/dashboard',
    'git rev-parse --short HEAD': 'c7f8a12',
    'git remote': 'origin',
    'git show-ref --verify --quiet refs/remotes/origin/feature/dashboard': '',
    'git rev-list --count HEAD..origin/feature/dashboard': '2',
    'git rev-list --count origin/feature/dashboard..HEAD': '0',
    'git show-ref --verify --quiet refs/remotes/origin/main': '',
    'git merge-base HEAD origin/main': 'def5678',
    'git rev-list --count def5678..HEAD': '0',
    'git rev-list --count HEAD..origin/main': '0'
  },
  
  // 场景4: 本地分支
  'local_branch': {
    'git rev-parse --abbrev-ref HEAD': 'hotfix/urgent-fix',
    'git rev-parse --short HEAD': 'd4e9b76',
    'git remote': 'origin',
    'git show-ref --verify --quiet refs/remotes/origin/hotfix/urgent-fix': 'error',
    'git show-ref --verify --quiet refs/remotes/origin/main': '',
    'git merge-base HEAD origin/main': 'ghi9012',
    'git rev-list --count ghi9012..HEAD': '1',
    'git rev-list --count HEAD..origin/main': '0'
  },
  
  // 场景5: 离线状态
  'offline': {
    'git rev-parse --abbrev-ref HEAD': 'feature/offline-test',
    'git rev-parse --short HEAD': 'f1a3d87',
    'git remote': 'error'
  }
};

// 当前模拟场景
let currentScenario = 'main_sync';

// Mock execSync 函数
const originalExecSync = execSync;
function mockExecSync(command, options = {}) {
  const scenario = mockGitCommands[currentScenario];
  
  if (scenario && scenario[command] !== undefined) {
    if (scenario[command] === 'error') {
      throw new Error(`Mocked error for: ${command}`);
    }
    return Buffer.from(scenario[command]);
  }
  
  // 对于非Git命令，使用原始execSync
  if (!command.startsWith('git')) {
    try {
      return originalExecSync(command, options);
    } catch (e) {
      throw e;
    }
  }
  
  throw new Error(`Mocked error for: ${command}`);
}

// 捕获控制台输出
let capturedOutput = [];

function captureConsoleOutput() {
  const originalLog = console.log;
  const originalInfo = console.info;
  const originalWarn = console.warn;
  const originalError = console.error;
  
  capturedOutput = [];
  
  console.log = (...args) => {
    capturedOutput.push(['log', args.join(' ')]);
    originalLog(...args);
  };
  
  console.info = (...args) => {
    capturedOutput.push(['info', args.join(' ')]);
    originalInfo(...args);
  };
  
  console.warn = (...args) => {
    capturedOutput.push(['warn', args.join(' ')]);
    originalWarn(...args);
  };
  
  console.error = (...args) => {
    capturedOutput.push(['error', args.join(' ')]);
    originalError(...args);
  };
  
  return () => {
    console.log = originalLog;
    console.info = originalInfo;
    console.warn = originalWarn;
    console.error = originalError;
  };
}

// 模拟 Vite 服务器对象
class MockViteServer {
  constructor() {
    this.config = {
      server: {
        port: 1988,
        host: 'localhost'
      },
      logger: {
        info: () => {}, // 静默处理，让插件自己输出
        warn: () => {},
        error: () => {}
      }
    };
    
    this.resolvedUrls = {
      network: null // 模拟没有网络访问
    };
    
    this.httpServer = {
      once: (event, callback) => {
        if (event === 'listening') {
          // 延迟执行，模拟服务器启动
          setTimeout(callback, 100);
        }
      }
    };
  }
}

// 动态导入你的插件
async function loadPlugin() {
  try {
    // 尝试不同的可能路径
    const possiblePaths = [
      './index.js',
      './src/index.js',
      './lib/index.js',
      './dist/index.js',
      './vite-console-plugin.js',
      './plugin.js'
    ];
    
    let plugin = null;
    let loadedPath = null;
    
    for (const pluginPath of possiblePaths) {
      try {
        const fullPath = path.resolve(pluginPath);
        // 清除缓存
        delete require.cache[fullPath];
        const module = require(fullPath);
        plugin = module.default || module;
        loadedPath = pluginPath;
        break;
      } catch (e) {
        continue;
      }
    }
    
    if (!plugin) {
      throw new Error('未找到插件文件，请确保插件文件存在于以下路径之一：' + possiblePaths.join(', '));
    }
    
    console.log(`\x1b[32m✅ 成功加载插件: ${loadedPath}\x1b[0m`);
    return plugin;
    
  } catch (error) {
    console.error('\x1b[31m❌ 加载插件失败:\x1b[0m', error.message);
    process.exit(1);
  }
}

// 运行测试
async function runTest(scenarioName) {
  currentScenario = scenarioName;
  
  // 重置全局状态
  if (global.__vite_console_plugin_state__) {
    global.__vite_console_plugin_state__.hasShownWelcome = false;
  }
  
  // 应用 mock
  require('child_process').execSync = mockExecSync;
  
  // 开始捕获输出
  const restoreConsole = captureConsoleOutput();
  
  try {
    const plugin = await loadPlugin();
    const mockServer = new MockViteServer();
    
    // 获取插件实例
    const pluginInstance = plugin({
      systemName: "Robot_Admin",
      description: "后台管理系统", 
      team: "信息化部-业务二室西安领域",
      owner: "CHENY | 编号: 409322",
      warning: "请勿随意修改配置文件",
      security: "禁止部署未加密的敏感数据",
      autoVersion: true
    });
    
    // 模拟 Vite 配置阶段
    if (pluginInstance.config) {
      const userConfig = {};
      pluginInstance.config(userConfig);
    }
    
    // 模拟服务器配置阶段
    if (pluginInstance.configureServer) {
      pluginInstance.configureServer(mockServer);
    }
    
    // 等待输出完成
    await new Promise(resolve => setTimeout(resolve, 500));
    
  } catch (error) {
    console.error('\x1b[31m测试执行失败:\x1b[0m', error.message);
  } finally {
    // 恢复控制台
    restoreConsole();
    // 恢复原始execSync
    require('child_process').execSync = originalExecSync;
  }
}

// 场景描述
const scenarios = {
  'main_sync': '主分支同步状态',
  'feature_ahead': '功能分支领先远程',
  'feature_behind': '功能分支落后远程', 
  'local_branch': '本地分支',
  'offline': '离线状态'
};

// 交互式菜单
function showMenu() {
  console.clear();
  console.log('\x1b[36m\x1b[1m🧪 直接测试你的插件真实输出\x1b[0m');
  console.log('');
  console.log('选择Git场景进行测试：');
  console.log('');
  
  Object.entries(scenarios).forEach(([key, name], index) => {
    console.log(`\x1b[33m${index + 1}.\x1b[0m ${name} \x1b[90m(${key})\x1b[0m`);
  });
  
  console.log(`\x1b[33m${Object.keys(scenarios).length + 1}.\x1b[0m 测试所有场景`);
  console.log('\x1b[33m0.\x1b[0m 退出');
  console.log('');
}

// 等待用户输入
function waitForInput() {
  return new Promise((resolve) => {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    
    process.stdin.once('data', (key) => {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      resolve(key);
    });
  });
}

// 主函数
async function main() {
  if (!process.stdin.isTTY) {
    console.log('\x1b[33m非交互模式，测试默认场景...\x1b[0m');
    await runTest('feature_ahead');
    return;
  }
  
  while (true) {
    showMenu();
    
    const input = await waitForInput();
    const choice = parseInt(input.trim());
    const scenarioKeys = Object.keys(scenarios);
    
    if (choice === 0) {
      console.log('\x1b[32m👋 测试结束！\x1b[0m');
      process.exit(0);
    } else if (choice >= 1 && choice <= scenarioKeys.length) {
      const scenarioKey = scenarioKeys[choice - 1];
      console.clear();
      console.log(`\x1b[33m🧪 正在测试: ${scenarios[scenarioKey]}\x1b[0m`);
      console.log('\x1b[90m─────────────────────────────────────────────────\x1b[0m');
      
      await runTest(scenarioKey);
      
      console.log('\x1b[90m─────────────────────────────────────────────────\x1b[0m');
      console.log('\x1b[90m按任意键返回菜单...\x1b[0m');
      await waitForInput();
    } else if (choice === scenarioKeys.length + 1) {
      for (const [key, name] of Object.entries(scenarios)) {
        console.clear();
        console.log(`\x1b[33m🧪 正在测试: ${name}\x1b[0m`);
        console.log('\x1b[90m─────────────────────────────────────────────────\x1b[0m');
        
        await runTest(key);
        
        console.log('\x1b[90m─────────────────────────────────────────────────\x1b[0m');
        console.log('\x1b[90m按任意键继续下一个...\x1b[0m');
        await waitForInput();
      }
    } else {
      console.log('\x1b[31m无效选择，请重新选择\x1b[0m');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

main().catch(console.error);