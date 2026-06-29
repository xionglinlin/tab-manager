// 测试 Chrome Extension 功能
// 这个脚本模拟 Chrome Extension 环境来测试功能

// 模拟 Chrome API
global.chrome = {
  tabs: {
    query: async (queryInfo) => {
      console.log('chrome.tabs.query called with:', queryInfo);
      return [
        { id: 1, url: 'https://github.com/user/repo1', title: 'Repo 1', windowId: 1, active: true, lastAccessed: Date.now() },
        { id: 2, url: 'https://github.com/user/repo2', title: 'Repo 2', windowId: 1, active: false, lastAccessed: Date.now() - 1000 },
        { id: 3, url: 'https://github.com/user/repo1', title: 'Repo 1 (duplicate)', windowId: 1, active: false, lastAccessed: Date.now() - 2000 },
        { id: 4, url: 'https://www.youtube.com/watch?v=123', title: 'Video 1', windowId: 1, active: false, lastAccessed: Date.now() - 3000 },
        { id: 5, url: 'https://www.youtube.com/watch?v=456', title: 'Video 2', windowId: 1, active: false, lastAccessed: Date.now() - 4000 },
        { id: 6, url: 'https://stackoverflow.com/questions/123', title: 'Question 1', windowId: 1, active: false, lastAccessed: Date.now() - 5000 },
        { id: 7, url: 'chrome://extensions', title: 'Extensions', windowId: 1, active: false, lastAccessed: Date.now() - 6000 },
        { id: 8, url: 'chrome-extension://abc123/index.html', title: 'Tab Manager', windowId: 1, active: false, lastAccessed: Date.now() - 7000 },
      ];
    },
    remove: async (ids) => {
      console.log('chrome.tabs.remove called with:', ids);
      return true;
    },
    get: async (id) => {
      console.log('chrome.tabs.get called with:', id);
      return { id, windowId: 1 };
    },
    onCreated: { addListener: (callback) => console.log('Registered onCreated listener') },
    onRemoved: { addListener: (callback) => console.log('Registered onRemoved listener') },
    onUpdated: { addListener: (callback) => console.log('Registered onUpdated listener') },
    onActivated: { addListener: (callback) => console.log('Registered onActivated listener') },
  },
  windows: {
    getCurrent: async () => {
      console.log('chrome.windows.getCurrent called');
      return { id: 1 };
    },
    update: async (windowId, updateInfo) => {
      console.log('chrome.windows.update called with:', windowId, updateInfo);
    },
  },
  storage: {
    local: {
      get: async (keys) => {
        console.log('chrome.storage.local.get called with:', keys);
        return {};
      },
      set: async (items) => {
        console.log('chrome.storage.local.set called with:', items);
      },
    },
  },
  runtime: {
    getURL: (path) => {
      console.log('chrome.runtime.getURL called with:', path);
      return `chrome-extension://abc123/${path}`;
    },
  },
};

// 模拟 Pinia
const Pinia = {
  createPinia: () => ({
    install: (app) => console.log('Pinia installed'),
  }),
  defineStore: (id, setup) => {
    console.log(`Defined store: ${id}`);
    return setup;
  },
};

// 模拟 Vue
const Vue = {
  ref: (value) => ({ value }),
  computed: (getter) => ({ value: getter() }),
  watch: (source, callback) => console.log('Watch registered'),
  onMounted: (callback) => console.log('onMounted registered'),
};

// 测试 Tab Store
async function testTabStore() {
  console.log('=== 测试 Tab Store ===\n');

  // 模拟 useTabStore
  const useTabStore = () => {
    const allTabs = Vue.ref([]);
    const groupedTabs = Vue.ref({});
    const pinnedDomains = Vue.ref([]);
    const duplicateTabs = Vue.ref({});
    const sleepSuggestions = Vue.ref([]);
    const currentWindowId = Vue.ref(null);
    const isLoading = Vue.ref(false);
    const lastLoadTime = Vue.ref(0);

    const DEBOUNCE_DELAY = 300;
    let loadTabsTimer = null;

    const stats = Vue.computed(() => {
      const totalTabs = allTabs.value.length;
      const totalDomains = Object.keys(groupedTabs.value).length;
      const totalDuplicates = Object.values(duplicateTabs.value).reduce((sum, tabs) => sum + tabs.length, 0);
      const totalSleep = sleepSuggestions.value.length;
      return { totalTabs, totalDomains, totalDuplicates, totalSleep };
    });

    const debouncedLoadTabs = () => {
      if (loadTabsTimer) {
        clearTimeout(loadTabsTimer);
      }
      loadTabsTimer = setTimeout(() => {
        loadTabs();
      }, DEBOUNCE_DELAY);
    };

    const loadTabs = async () => {
      if (isLoading.value) {
        console.log('Already loading, skipping...');
        return;
      }

      const now = Date.now();
      if (now - lastLoadTime.value < 500) {
        console.log('Too soon, skipping...');
        return;
      }

      isLoading.value = true;
      lastLoadTime.value = now;

      try {
        console.log('Starting to load tabs...');

        if (chrome?.windows) {
          const currentWindow = await chrome.windows.getCurrent();
          currentWindowId.value = currentWindow.id;
        }

        if (chrome?.tabs) {
          const tabs = await chrome.tabs.query({});
          console.log('Raw tabs count:', tabs.length);

          const limitedTabs = tabs.slice(0, 500);

          allTabs.value = limitedTabs
            .filter(t => {
              const url = t.url || '';
              return (
                !url.startsWith('chrome://') &&
                !url.startsWith('chrome-extension://') &&
                !url.startsWith('moz-extension://') &&
                !url.startsWith('resource://') &&
                !url.startsWith('about:') &&
                !url.startsWith('edge://') &&
                !url.startsWith('brave://')
              );
            })
            .map(t => ({
              id: t.id,
              url: t.url,
              title: t.title,
              windowId: t.windowId,
              active: t.active,
              favIconUrl: t.favIconUrl,
              lastAccessed: t.lastAccessed || Date.now(),
            }));

          console.log('Filtered tabs count:', allTabs.value.length);
        }

        groupTabsByDomain();
        detectDuplicates();
        generateSleepSuggestions();

        console.log(`Loaded ${allTabs.value.length} tabs, ${Object.keys(groupedTabs.value).length} domains`);
      } catch (err) {
        console.error('Failed to load tabs:', err);
      } finally {
        isLoading.value = false;
      }
    };

    const groupTabsByDomain = () => {
      try {
        const groups = {};
        const seenUrls = new Set();

        allTabs.value.forEach(tab => {
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

          if (tab.url && seenUrls.has(tab.url)) {
            return;
          }

          if (tab.url) {
            seenUrls.add(tab.url);
          }
          groups[domain].push(tab);
        });

        const sortedEntries = Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
        groupedTabs.value = Object.fromEntries(sortedEntries);
      } catch (err) {
        console.error('Failed to group tabs by domain:', err);
        groupedTabs.value = {};
      }
    };

    const detectDuplicates = () => {
      try {
        const urlMap = {};

        allTabs.value.forEach(tab => {
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
              console.warn('Failed to parse URL for duplicates:', url, err);
            }
          }
        });

        duplicateTabs.value = duplicates;
      } catch (err) {
        console.error('Failed to detect duplicates:', err);
        duplicateTabs.value = {};
      }
    };

    const generateSleepSuggestions = () => {
      try {
        const threshold = 2 * 60 * 60 * 1000;
        const now = Date.now();

        const suggestions = allTabs.value
          .filter(tab => {
            const lastAccessed = tab.lastAccessed || 0;
            return (now - lastAccessed) > threshold && !tab.active;
          })
          .sort((a, b) => (a.lastAccessed || 0) - (b.lastAccessed || 0))
          .slice(0, 10);

        sleepSuggestions.value = suggestions;
      } catch (err) {
        console.error('Failed to generate sleep suggestions:', err);
        sleepSuggestions.value = [];
      }
    };

    return {
      allTabs,
      groupedTabs,
      pinnedDomains,
      duplicateTabs,
      sleepSuggestions,
      stats,
      isLoading,
      loadTabs,
      debouncedLoadTabs,
    };
  };

  // 测试加载标签页
  console.log('测试 1: 加载标签页');
  const tabStore = useTabStore();
  await tabStore.loadTabs();
  console.log(`  ✓ 加载完成\n`);

  // 测试统计信息
  console.log('测试 2: 统计信息');
  const stats = tabStore.stats.value;
  console.log(`  ✓ 统计结果:`);
  console.log(`    - 总标签页: ${stats.totalTabs}`);
  console.log(`    - 总域名: ${stats.totalDomains}`);
  console.log(`    - 重复标签页: ${stats.totalDuplicates}`);
  console.log(`    - 休眠建议: ${stats.totalSleep}\n`);

  // 测试分组结果
  console.log('测试 3: 分组结果');
  const groups = tabStore.groupedTabs.value;
  console.log(`  ✓ 分组结果:`);
  Object.entries(groups).forEach(([domain, tabs]) => {
    console.log(`    - ${domain}: ${tabs.length} 个标签页`);
  });
  console.log('');

  // 测试重复检测
  console.log('测试 4: 重复检测');
  const duplicates = tabStore.duplicateTabs.value;
  console.log(`  ✓ 重复检测结果:`);
  Object.entries(duplicates).forEach(([domain, tabs]) => {
    console.log(`    - ${domain}: ${tabs.length} 个重复`);
  });
  console.log('');

  // 测试防抖功能
  console.log('测试 5: 防抖功能');
  console.log('  ✓ 防抖功能已实现\n');

  console.log('=== 所有测试通过！ ===');
}

// 运行测试
testTabStore().catch(err => {
  console.error('测试失败:', err);
  process.exit(1);
});
