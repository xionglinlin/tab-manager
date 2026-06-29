# 技术方案文档

## Chrome Extension 实现

### manifest.json 配置

```json
{
  "manifest_version": 3,
  "name": "Tab Manager",
  "version": "1.0.0",
  "description": "智能浏览器标签页管理插件",
  "permissions": [
    "tabs",
    "activeTab",
    "storage",
    "windows"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_title": "Tab Manager"
  }
}
```

**权限说明**：
- `tabs`：访问标签页 API，获取所有标签页信息
- `activeTab`：访问当前活动标签页
- `storage`：持久化存储设置和置顶域名
- `windows`：窗口管理和合并

---

### Service Worker 实现

**职责**：
1. 监听标签页事件，更新徽章数字
2. 处理扩展图标点击，打开管理面板
3. 管理扩展生命周期

**核心代码**：

```javascript
// 更新徽章
async function updateBadge() {
  const tabs = await chrome.tabs.query({});
  const count = tabs.filter(t => {
    const url = t.url || '';
    return !url.startsWith('chrome://') && !url.startsWith('chrome-extension://');
  }).length;

  await chrome.action.setBadgeText({ text: count > 0 ? String(count) : '' });

  // 根据数量设置颜色
  let color;
  if (count <= 10) color = '#4ade80';      // 绿色
  else if (count <= 20) color = '#fbbf24'; // 琥珀色
  else color = '#f87171';                  // 红色

  await chrome.action.setBadgeBackgroundColor({ color });
}

// 监听标签页事件
chrome.tabs.onCreated.addListener(updateBadge);
chrome.tabs.onRemoved.addListener(updateBadge);
chrome.tabs.onUpdated.addListener(updateBadge);

// 处理扩展图标点击
chrome.action.onClicked.addListener(async () => {
  const url = chrome.runtime.getURL('index.html');
  const tabs = await chrome.tabs.query({ url: url });

  if (tabs.length > 0) {
    // 聚焦已有标签页
    await chrome.windows.update(tabs[0].windowId, { focused: true });
    await chrome.tabs.update(tabs[0].id, { active: true });
  } else {
    // 创建新标签页
    await chrome.tabs.create({ url: url });
  }
});
```

---

## Vue 3 应用实现

### 入口文件 (main.js)

```javascript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')
```

### 根组件 (App.vue)

**职责**：
- 组合所有子组件
- 管理全局状态
- 处理用户交互

**核心结构**：

```vue
<template>
  <div class="app" :data-theme="currentTheme">
    <div class="container">
      <Header />
      <StatsBar />
      <SearchBar />
      <Dashboard v-if="!showSettings" />
      <Settings v-else />
    </div>
    <Toast />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTabStore } from './stores/tabs'
import { useSettingStore } from './stores/settings'
import { useThemeStore } from './stores/theme'

// 状态管理
const tabStore = useTabStore()
const settingStore = useSettingStore()
const themeStore = useThemeStore()

// 生命周期
onMounted(async () => {
  await themeStore.loadTheme()
  await settingStore.loadSettings()
  await tabStore.loadTabs()
})
</script>
```

---

## 状态管理实现

### tabs.js - 标签页状态

**核心功能**：
1. 获取和管理标签页数据
2. 按域名分组
3. 域名置顶（持久化）
4. 重复检测
5. 休眠建议
6. 标签页操作

**状态结构**：

```javascript
{
  allTabs: [],           // 所有标签页
  groupedTabs: {},       // 按域名分组
  pinnedDomains: [],     // 置顶域名
  duplicateTabs: {},     // 重复标签页
  sleepSuggestions: [],  // 休眠建议
  currentWindowId: null  // 当前窗口 ID
}
```

**核心方法**：

```javascript
// 加载标签页
const loadTabs = async () => {
  // 获取当前窗口 ID
  const currentWindow = await chrome.windows.getCurrent()
  currentWindowId.value = currentWindow.id

  // 获取所有标签页
  const tabs = await chrome.tabs.query({})
  allTabs.value = tabs
    .filter(t => {
      const url = t.url || '';
      return !url.startsWith('chrome://') && !url.startsWith('chrome-extension://');
    })
    .map(t => ({
      id: t.id,
      url: t.url,
      title: t.title,
      windowId: t.windowId,
      active: t.active,
      favIconUrl: t.favIconUrl,
      lastAccessed: t.lastAccessed || Date.now(),
    }))

  // 加载置顶域名
  await loadPinnedDomains()

  // 按域名分组
  groupTabsByDomain()

  // 检测重复标签页
  detectDuplicates()

  // 生成休眠建议
  generateSleepSuggestions()
}

// 按域名分组
const groupTabsByDomain = () => {
  const groups = {}

  allTabs.value.forEach(tab => {
    let domain = '其他'
    try {
      if (tab.url) {
        const url = new URL(tab.url)
        domain = url.hostname || '其他'
      }
    } catch {
      domain = '其他'
    }

    if (!groups[domain]) {
      groups[domain] = []
    }
    groups[domain].push(tab)
  })

  // 按标签数量排序
  const sortedEntries = Object.entries(groups).sort((a, b) => b[1].length - a[1].length)
  groupedTabs.value = Object.fromEntries(sortedEntries)
}

// 置顶域名
const pinDomain = async (domain) => {
  if (!pinnedDomains.value.includes(domain)) {
    pinnedDomains.value.push(domain)
    await savePinnedDomains()
  }
}

// 保存置顶域名
const savePinnedDomains = async () => {
  if (chrome?.storage?.local) {
    await chrome.storage.local.set({ pinnedDomains: pinnedDomains.value })
  } else {
    localStorage.setItem('tab-manager-pinned-domains', JSON.stringify(pinnedDomains.value))
  }
}

// 检测重复标签页
const detectDuplicates = () => {
  const urlMap = {}

  allTabs.value.forEach(tab => {
    if (tab.url) {
      if (!urlMap[tab.url]) {
        urlMap[tab.url] = []
      }
      urlMap[tab.url].push(tab)
    }
  })

  const duplicates = {}
  Object.entries(urlMap).forEach(([url, tabs]) => {
    if (tabs.length > 1) {
      const domain = new URL(url).hostname
      if (!duplicates[domain]) {
        duplicates[domain] = []
      }
      duplicates[domain].push(...tabs.slice(1))
    }
  })

  duplicateTabs.value = duplicates
}

// 生成休眠建议
const generateSleepSuggestions = () => {
  const threshold = (settingStore.settings.sleepThreshold || 2) * 60 * 60 * 1000
  const now = Date.now()

  const suggestions = allTabs.value
    .filter(tab => {
      const lastAccessed = tab.lastAccessed || 0
      return (now - lastAccessed) > threshold && !tab.active
    })
    .sort((a, b) => (a.lastAccessed || 0) - (b.lastAccessed || 0))
    .slice(0, 10)

  sleepSuggestions.value = suggestions
}
```

---

### theme.js - 主题状态

**核心功能**：
1. 管理主题状态
2. 主题切换（深色/浅色/跟随系统）
3. 系统主题监听
4. 持久化存储

**核心方法**：

```javascript
// 应用主题
const applyTheme = () => {
  const theme = currentTheme.value === 'system' ? systemTheme.value : currentTheme.value
  document.documentElement.setAttribute('data-theme', theme)
}

// 切换主题
const toggleTheme = () => {
  const themes = ['dark', 'light', 'system']
  const currentIndex = themes.indexOf(currentTheme.value)
  const nextIndex = (currentIndex + 1) % themes.length
  currentTheme.value = themes[nextIndex]

  saveTheme(currentTheme.value)
  applyTheme()
}

// 监听系统主题
const initSystemTheme = () => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  systemTheme.value = mediaQuery.matches ? 'dark' : 'light'

  mediaQuery.addEventListener('change', (e) => {
    systemTheme.value = e.matches ? 'dark' : 'light'
    if (currentTheme.value === 'system') {
      applyTheme()
    }
  })
}
```

---

## 组件实现

### DomainCard.vue - 域名卡片

**核心功能**：
1. 显示域名信息
2. 显示标签页列表
3. 提供操作按钮
4. 折叠/展开

**Props**：

```javascript
{
  domain: String,    // 域名
  tabs: Array,       // 标签页列表
  isPinned: Boolean, // 是否置顶
  duplicates: Array  // 重复标签页
}
```

**Events**：

```javascript
{
  'pin-domain': Function,      // 置顶域名
  'unpin-domain': Function,    // 取消置顶
  'close-tab': Function,       // 关闭标签页
  'close-domain': Function,    // 关闭域名分组
  'focus-tab': Function,       // 跳转到标签页
  'close-duplicates': Function // 关闭重复
}
```

**核心模板**：

```vue
<template>
  <div class="domain-card" :class="{ 'is-pinned': isPinned, 'has-duplicates': hasDuplicates }">
    <div class="card-header">
      <div class="card-title">
        <span class="domain-icon">{{ domainInitial }}</span>
        <span class="domain-name">{{ domainName }}</span>
        <button v-if="isPinned" class="pin-badge" @click.stop="$emit('unpin-domain', domain)">
          ⭐
        </button>
      </div>
      <div class="card-stats">
        <span class="stat-badge">{{ tabs.length }} 个标签</span>
        <span v-if="duplicateCount > 0" class="stat-badge duplicate-badge">
          {{ duplicateCount }} 个重复
        </span>
      </div>
    </div>

    <div class="card-body">
      <div class="tab-list">
        <TabItem
          v-for="tab in visibleTabs"
          :key="tab.id"
          :tab="tab"
          :is-duplicate="isDuplicate(tab)"
          @focus-tab="$emit('focus-tab', tab.id)"
          @close-tab="$emit('close-tab', tab.id)"
        />
        <button v-if="hiddenTabs.length > 0" class="expand-btn" @click="isExpanded = !isExpanded">
          {{ isExpanded ? '收起' : `+${hiddenTabs.length} 更多` }}
        </button>
      </div>
    </div>

    <div class="card-footer">
      <button class="action-btn close-btn" @click="$emit('close-domain', domain)">
        关闭全部 {{ tabs.length }} 个
      </button>
      <button v-if="!isPinned" class="action-btn pin-btn" @click="$emit('pin-domain', domain)">
        置顶
      </button>
      <button v-if="duplicateCount > 0" class="action-btn dedup-btn" @click="$emit('close-duplicates', domain)">
        关闭 {{ duplicateCount }} 个重复
      </button>
    </div>
  </div>
</template>
```

---

### TabItem.vue - 标签页列表项

**核心功能**：
1. 显示标签页信息
2. 显示 favicon
3. 提供操作按钮

**Props**：

```javascript
{
  tab: Object,         // 标签页数据
  isDuplicate: Boolean // 是否重复
}
```

**核心模板**：

```vue
<template>
  <div class="tab-item" :class="{ 'is-duplicate': isDuplicate }" @click="$emit('focus-tab', tab.id)">
    <img v-if="tab.favIconUrl" :src="tab.favIconUrl" class="tab-favicon" alt="">
    <div v-else class="tab-favicon-placeholder">{{ tabInitial }}</div>
    <div class="tab-info">
      <div class="tab-title">{{ tabTitle }}</div>
      <div class="tab-url">{{ tabUrl }}</div>
    </div>
    <div class="tab-actions">
      <button class="tab-action" @click.stop="$emit('close-tab', tab.id)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>
```

---

## 样式实现

### CSS Variables 主题切换

```css
:root {
  /* 深色主题 */
  --bg-primary: #0a0a0f;
  --bg-secondary: #12121a;
  --text-primary: #e8e8ed;
  --text-secondary: #8888a0;
  --accent-blue: #6c8cff;
  --border-primary: #252535;
}

:root[data-theme="light"] {
  /* 浅色主题 */
  --bg-primary: #fafafe;
  --bg-secondary: #ffffff;
  --text-primary: #1a1a2e;
  --text-secondary: #666680;
  --accent-blue: #4f6df5;
  --border-primary: #e5e5f0;
}
```

### 动画实现

```css
/* 入场动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 应用动画 */
.header { animation: fadeInUp 0.2s ease both; }
.stats-bar { animation: fadeInUp 0.2s ease 100ms both; }
.search-bar { animation: fadeInUp 0.2s ease 200ms both; }
.dashboard { animation: fadeInUp 0.2s ease 300ms both; }

/* 关闭动画 */
.tab-item {
  transition: opacity 0.2s, transform 0.2s;
}

.tab-item.closing {
  opacity: 0;
  transform: translateX(-20px);
}
```

---

## 存储方案

### chrome.storage.local

**存储结构**：

```javascript
{
  // 置顶域名
  pinnedDomains: ['github.com', 'youtube.com'],

  // 设置
  settings: {
    columns: 'auto',
    showThumbnails: true,
    sleepThreshold: 2,
    showSleepSuggestions: true,
    language: 'zh-CN'
  },

  // 主题
  theme: 'dark'
}
```

**读取数据**：

```javascript
const loadData = async () => {
  if (chrome?.storage?.local) {
    const result = await chrome.storage.local.get(['pinnedDomains', 'settings', 'theme'])
    return result
  } else {
    // 本地开发时使用 localStorage
    return {
      pinnedDomains: JSON.parse(localStorage.getItem('tab-manager-pinned-domains') || '[]'),
      settings: JSON.parse(localStorage.getItem('tab-manager-settings') || '{}'),
      theme: localStorage.getItem('tab-manager-theme') || 'dark'
    }
  }
}
```

**保存数据**：

```javascript
const saveData = async (data) => {
  if (chrome?.storage?.local) {
    await chrome.storage.local.set(data)
  } else {
    Object.entries(data).forEach(([key, value]) => {
      localStorage.setItem(`tab-manager-${key}`, JSON.stringify(value))
    })
  }
}
```

---

## 性能优化

### 1. 虚拟滚动
如果标签页数量很多（> 100），考虑使用虚拟滚动：

```javascript
// 使用 vue-virtual-scroller
import { RecycleScroller } from 'vue-virtual-scroller'

<RecycleScroller
  :items="tabs"
  :item-size="40"
  key-field="id"
>
  <template #default="{ item }">
    <TabItem :tab="item" />
  </template>
</RecycleScroller>
```

### 2. 防抖搜索
搜索输入使用防抖：

```javascript
import { debounce } from 'lodash-es'

const debouncedSearch = debounce((query) => {
  // 执行搜索
}, 300)
```

### 3. 懒加载
设置页面使用懒加载：

```javascript
const Settings = defineAsyncComponent(() => import('./views/Settings.vue'))
```

---

## 错误处理

### Chrome API 错误处理

```javascript
const safeChromeApi = async (api, ...args) => {
  try {
    return await api(...args)
  } catch (err) {
    console.error('Chrome API error:', err)
    return null
  }
}

// 使用
const tabs = await safeChromeApi(chrome.tabs.query, {})
```

### 数据解析错误处理

```javascript
const safeParseUrl = (url) => {
  try {
    return new URL(url)
  } catch {
    return null
  }
}
```

---

## 测试方案

### 功能测试清单

- [ ] 域名分组显示正确
- [ ] 域名置顶功能正常
- [ ] 置顶状态持久化
- [ ] 一键清理功能正常
- [ ] 重复检测准确
- [ ] 点击跳转功能正常
- [ ] 主题切换功能正常
- [ ] 窗口合并功能正常
- [ ] 休眠建议准确
- [ ] 搜索过滤功能正常
- [ ] 导出功能正常
- [ ] 设置页面功能正常

### 性能测试

- [ ] 打开时间 < 1 秒
- [ ] 搜索响应 < 100ms
- [ ] 动画流畅（60fps）
- [ ] 内存占用合理

### 兼容性测试

- [ ] Chrome 浏览器
- [ ] Edge 浏览器
- [ ] 不同屏幕尺寸

---

## 变更记录

| 日期 | 版本 | 变更内容 |
|------|------|---------|
| 2026-06-05 | 1.0 | 初始技术方案 |
| 2026-06-05 | 1.1 | 修复性能问题：添加防抖处理、加载状态、限制标签页数量 |
| 2026-06-05 | 1.2 | 优化功能：修复重复检测逻辑；移除全局导出，改为单个标签页复制 |
| 2026-06-05 | 1.3 | 修复运行时错误：优化重复检测逻辑，添加更多错误处理 |
| 2026-06-05 | 1.4 | 优化重复检测显示：明确标记重复网页，域名统计包含重复数量 |
