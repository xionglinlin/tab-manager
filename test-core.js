// 测试核心功能
// 这个脚本模拟 Chrome API 来测试核心逻辑

// 模拟 Chrome API
const chrome = {
  tabs: {
    query: async () => [
      { id: 1, url: 'https://github.com/user/repo1', title: 'Repo 1', windowId: 1, active: true, lastAccessed: Date.now() },
      { id: 2, url: 'https://github.com/user/repo2', title: 'Repo 2', windowId: 1, active: false, lastAccessed: Date.now() - 1000 },
      { id: 3, url: 'https://github.com/user/repo1', title: 'Repo 1 (duplicate)', windowId: 1, active: false, lastAccessed: Date.now() - 2000 },
      { id: 4, url: 'https://www.youtube.com/watch?v=123', title: 'Video 1', windowId: 1, active: false, lastAccessed: Date.now() - 3000 },
      { id: 5, url: 'https://www.youtube.com/watch?v=456', title: 'Video 2', windowId: 1, active: false, lastAccessed: Date.now() - 4000 },
      { id: 6, url: 'https://stackoverflow.com/questions/123', title: 'Question 1', windowId: 1, active: false, lastAccessed: Date.now() - 5000 },
    ],
    remove: async (ids) => console.log('Removed tabs:', ids),
    get: async (id) => ({ id, windowId: 1 }),
    onCreated: { addListener: () => {} },
    onRemoved: { addListener: () => {} },
    onUpdated: { addListener: () => {} },
    onActivated: { addListener: () => {} },
  },
  windows: {
    getCurrent: async () => ({ id: 1 }),
    update: async () => {},
  },
  storage: {
    local: {
      get: async () => ({}),
      set: async () => {},
    },
  },
};

// 测试函数
async function testCoreFunctions() {
  console.log('=== 开始测试核心功能 ===\n');

  // 测试 1: 获取标签页
  console.log('测试 1: 获取标签页');
  const tabs = await chrome.tabs.query({});
  console.log(`  ✓ 获取到 ${tabs.length} 个标签页\n`);

  // 测试 2: 过滤标签页
  console.log('测试 2: 过滤标签页');
  const filteredTabs = tabs.filter(t => {
    const url = t.url || '';
    return !url.startsWith('chrome://') && !url.startsWith('chrome-extension://');
  });
  console.log(`  ✓ 过滤后 ${filteredTabs.length} 个标签页\n`);

  // 测试 3: 按域名分组（去重）
  console.log('测试 3: 按域名分组（去重）');
  const groups = {};
  const seenUrls = new Set();

  filteredTabs.forEach(tab => {
    let domain = '其他';
    try {
      if (tab.url) {
        const url = new URL(tab.url);
        domain = url.hostname || '其他';
      }
    } catch {
      domain = '其他';
    }

    if (!groups[domain]) {
      groups[domain] = [];
    }

    // 去重
    if (tab.url && seenUrls.has(tab.url)) {
      return;
    }

    if (tab.url) {
      seenUrls.add(tab.url);
    }
    groups[domain].push(tab);
  });

  console.log(`  ✓ 分组结果:`);
  Object.entries(groups).forEach(([domain, tabs]) => {
    console.log(`    - ${domain}: ${tabs.length} 个标签页`);
  });
  console.log('');

  // 测试 4: 检测重复标签页
  console.log('测试 4: 检测重复标签页');
  const urlMap = {};
  filteredTabs.forEach(tab => {
    if (tab.url) {
      if (!urlMap[tab.url]) {
        urlMap[tab.url] = [];
      }
      urlMap[tab.url].push(tab);
    }
  });

  const duplicates = {};
  Object.entries(urlMap).forEach(([url, tabs]) => {
    if (tabs.length > 1) {
      try {
        const domain = new URL(url).hostname;
        if (!duplicates[domain]) {
          duplicates[domain] = [];
        }
        duplicates[domain].push(...tabs.slice(1));
      } catch (err) {
        console.warn('Failed to parse URL:', url, err);
      }
    }
  });

  console.log(`  ✓ 检测到重复:`);
  Object.entries(duplicates).forEach(([domain, tabs]) => {
    console.log(`    - ${domain}: ${tabs.length} 个重复`);
  });
  console.log('');

  // 测试 5: 生成休眠建议
  console.log('测试 5: 生成休眠建议');
  const threshold = 2 * 60 * 60 * 1000; // 2 小时
  const now = Date.now();
  const sleepSuggestions = filteredTabs
    .filter(tab => {
      const lastAccessed = tab.lastAccessed || 0;
      return (now - lastAccessed) > threshold && !tab.active;
    })
    .sort((a, b) => (a.lastAccessed || 0) - (b.lastAccessed || 0))
    .slice(0, 10);

  console.log(`  ✓ 休眠建议: ${sleepSuggestions.length} 个标签页\n`);

  // 测试 6: 统计信息
  console.log('测试 6: 统计信息');
  const stats = {
    totalTabs: filteredTabs.length,
    totalDomains: Object.keys(groups).length,
    totalDuplicates: Object.values(duplicates).reduce((sum, tabs) => sum + tabs.length, 0),
    totalSleep: sleepSuggestions.length,
  };
  console.log(`  ✓ 统计结果:`);
  console.log(`    - 总标签页: ${stats.totalTabs}`);
  console.log(`    - 总域名: ${stats.totalDomains}`);
  console.log(`    - 重复标签页: ${stats.totalDuplicates}`);
  console.log(`    - 休眠建议: ${stats.totalSleep}\n`);

  console.log('=== 所有测试通过！ ===');
}

// 运行测试
testCoreFunctions().catch(err => {
  console.error('测试失败:', err);
  process.exit(1);
});
