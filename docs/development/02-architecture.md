# 架构设计文档

## 技术选型

### 前端框架

#### 选项分析

| 框架 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 原生 JS | 无依赖、体积小、性能好 | 代码组织困难、维护性差 | 小型项目、快速原型 |
| React | 生态丰富、组件化、社区支持好 | 依赖多、学习曲线陡 | 中大型项目、团队协作 |
| Vue 3 | 易学易用、组件化、响应式 | 生态不如 React | 中小型项目、快速开发 |
| Preact | 兼容 React、体积小（3KB） | 生态不完整 | 对体积敏感的项目 |
| Svelte | 无运行时、性能最佳、代码简洁 | 生态较小、学习曲线 | 对性能要求极高的项目 |

#### 最终选择：Vue 3

**选择理由**：
1. **易学易用**：上手快，学习成本低
2. **组件化开发**：代码组织清晰，易于维护
3. **响应式数据绑定**：状态管理方便
4. **Composition API**：逻辑复用灵活
5. **Vite 支持**：开发体验好

**版本**：Vue 3.4+

---

### 状态管理

#### 选项分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 全局变量 | 简单直接、无依赖 | 容易出错、难以维护 | 小型项目 |
| Vuex | Vue 官方、功能完整 | 配置复杂、学习成本高 | 大型项目 |
| Pinia | 轻量级、TypeScript 支持好、DevTools 支持 | 生态不如 Vuex | 中小型项目 |
| Redux | 流行、生态丰富 | 配置复杂、样板代码多 | React 项目 |

#### 最终选择：Pinia

**选择理由**：
1. **Vue 3 官方推荐**：替代 Vuex 的新一代状态管理
2. **轻量级**：体积小，性能好
3. **TypeScript 支持好**：类型安全
4. **DevTools 支持**：调试方便
5. **Composition API 风格**：与 Vue 3 契合

**版本**：Pinia 2.1+

---

### 构建工具

#### 选项分析

| 工具 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 无构建 | 最简单、无配置 | 功能受限、无法使用现代语法 | 小型项目、快速原型 |
| Webpack | 功能强大、配置灵活、生态丰富 | 配置复杂、构建速度慢 | 大型项目、复杂需求 |
| Vite | 开发快速、配置简单、支持现代语法 | 对 Chrome Extension 支持需要额外配置 | 现代项目、快速开发 |
| Rollup | 打包体积小、Tree-shaking 好 | 配置复杂、生态不如 Webpack | 库开发 |

#### 最终选择：Vite

**选择理由**：
1. **开发服务器快速**：HMR 速度快
2. **配置简单**：开箱即用
3. **支持现代语法**：ES Modules、TypeScript 等
4. **生产环境优化好**：自动代码分割、压缩
5. **Vue 3 官方支持**：@vitejs/plugin-vue

**版本**：Vite 5+

---

### CSS 方案

#### 选项分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 手写 CSS | 无依赖、完全控制、学习成本低 | 开发效率低、样式复用困难 | 小型项目、定制化需求高 |
| Tailwind CSS | 实用优先、开发快速、响应式设计方便 | 类名较长、需要学习工具类 | 快速开发、响应式设计 |
| CSS Modules | 样式隔离、无全局污染 | 需要构建工具支持 | 组件化开发 |
| SCSS/Less | 功能强大、变量、混合、嵌套 | 需要编译、学习成本 | 中大型项目 |

#### 最终选择：手写 CSS + CSS Variables

**选择理由**：
1. **无依赖**：不需要额外的 CSS 框架
2. **完全控制**：样式完全可控
3. **CSS Variables**：主题切换方便
4. **响应式设计**：手写媒体查询
5. **性能好**：无额外的 CSS 框架体积

---

### Chrome Extension

#### Manifest 版本

**选择：Manifest V3**

**理由**：
1. **Chrome 官方推荐**：未来趋势
2. **安全性更好**：Service Worker 替代 Background Page
3. **性能更好**：按需加载
4. **隐私保护**：更严格的权限控制

**版本**：Manifest V3

#### 权限设计

```json
{
  "permissions": [
    "tabs",          // 访问标签页 API
    "activeTab",     // 访问当前标签页
    "storage",       // 访问存储 API
    "windows"        // 访问窗口 API
  ]
}
```

**权限说明**：
- `tabs`：获取所有标签页信息
- `activeTab`：访问当前活动标签页
- `storage`：持久化存储设置和置顶域名
- `windows`：窗口管理和合并

---

## 架构设计

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│  Chrome Extension                                            │
├─────────────────────────────────────────────────────────────┤
│  Service Worker (background.js)                              │
│  - 监听标签页事件                                             │
│  - 更新徽章数字                                              │
│  - 处理扩展图标点击                                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Main Panel (index.html)                                     │
│  - Vue 3 应用                                                │
│  - 组件化界面                                                │
│  - 状态管理                                                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Chrome APIs                                                 │
│  - chrome.tabs                                               │
│  - chrome.storage                                            │
│  - chrome.windows                                            │
└─────────────────────────────────────────────────────────────┘
```

### 前端架构

```
┌─────────────────────────────────────────────────────────────┐
│  Vue 3 App                                                   │
├─────────────────────────────────────────────────────────────┤
│  Views (页面)                                                │
│  ├── Dashboard.vue (主面板)                                  │
│  └── Settings.vue (设置页面)                                 │
├─────────────────────────────────────────────────────────────┤
│  Components (组件)                                           │
│  ├── Header.vue (顶部栏)                                    │
│  ├── StatsBar.vue (统计栏)                                   │
│  ├── SearchBar.vue (搜索栏)                                  │
│  ├── DomainCard.vue (域名卡片)                               │
│  ├── TabItem.vue (标签页列表项)                              │
│  ├── SleepSuggestion.vue (休眠建议)                          │
│  └── Toast.vue (提示消息)                                    │
├─────────────────────────────────────────────────────────────┤
│  Stores (状态管理)                                           │
│  ├── tabs.js (标签页状态)                                    │
│  ├── settings.js (设置状态)                                  │
│  └── theme.js (主题状态)                                     │
├─────────────────────────────────────────────────────────────┤
│  Styles (样式)                                               │
│  ├── variables.css (CSS 变量)                                │
│  ├── base.css (基础样式)                                     │
│  └── animations.css (动画)                                   │
└─────────────────────────────────────────────────────────────┘
```

### 数据流

```
用户操作
    │
    ▼
┌─────────────┐
│  Component  │ (组件)
└─────────────┘
    │
    ▼
┌─────────────┐
│   Action    │ (触发 action)
└─────────────┘
    │
    ▼
┌─────────────┐
│    Store    │ (状态管理)
└─────────────┘
    │
    ▼
┌─────────────┐
│ Chrome API  │ (调用 API)
└─────────────┘
    │
    ▼
┌─────────────┐
│   State     │ (更新状态)
└─────────────┘
    │
    ▼
┌─────────────┐
│   Render    │ (重新渲染)
└─────────────┘
```

---

## 模块设计

### 状态管理模块

#### tabs.js - 标签页状态

**职责**：
- 管理标签页数据
- 域名分组
- 域名置顶
- 重复检测
- 休眠建议
- 标签页操作

**状态**：
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

**计算属性**：
```javascript
{
  stats,          // 统计信息
  pinnedGroups,   // 置顶域名分组
  otherGroups     // 其他域名分组
}
```

**Actions**：
```javascript
{
  loadTabs(),           // 加载标签页
  pinDomain(domain),    // 置顶域名
  unpinDomain(domain),  // 取消置顶
  closeTab(tabId),      // 关闭标签页
  closeDomainGroup(domain), // 关闭域名分组
  closeDuplicates(domain),  // 关闭重复
  focusTab(tabId),      // 跳转到标签页
  mergeWindows(),       // 合并窗口
  exportTabs()          // 导出标签页
}
```

#### settings.js - 设置状态

**职责**：
- 管理设置数据
- 持久化存储

**状态**：
```javascript
{
  settings: {
    columns: 'auto',           // 列数
    showThumbnails: true,      // 显示缩略图
    sleepThreshold: 2,         // 休眠阈值（小时）
    showSleepSuggestions: true, // 显示休眠建议
    language: 'zh-CN'          // 语言
  }
}
```

**Actions**：
```javascript
{
  loadSettings(),        // 加载设置
  saveSettings(settings), // 保存设置
  resetSettings()        // 重置设置
}
```

#### theme.js - 主题状态

**职责**：
- 管理主题状态
- 主题切换
- 系统主题监听

**状态**：
```javascript
{
  currentTheme: 'dark',  // 当前主题
  systemTheme: 'dark'    // 系统主题
}
```

**Actions**：
```javascript
{
  loadTheme(),      // 加载主题
  saveTheme(theme), // 保存主题
  toggleTheme(),    // 切换主题
  applyTheme()      // 应用主题
}
```

---

### 组件设计

#### Header.vue - 顶部栏

**职责**：
- 显示标题
- 主题切换按钮
- 设置按钮

**Props**：
```javascript
{
  theme: String  // 当前主题
}
```

**Events**：
```javascript
{
  'toggle-theme': Function,  // 切换主题
  'open-settings': Function  // 打开设置
}
```

#### DomainCard.vue - 域名卡片

**职责**：
- 显示域名信息
- 显示标签页列表
- 提供操作按钮

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

#### TabItem.vue - 标签页列表项

**职责**：
- 显示标签页信息
- 提供操作按钮

**Props**：
```javascript
{
  tab: Object,         // 标签页数据
  isDuplicate: Boolean // 是否重复
}
```

**Events**：
```javascript
{
  'focus-tab': Function,  // 跳转到标签页
  'close-tab': Function   // 关闭标签页
}
```

---

## 文件结构

```
tab-manager/
├── public/
│   ├── manifest.json          # Chrome Extension 配置
│   ├── background.js          # Service Worker
│   └── icons/                 # 图标资源
├── src/
│   ├── main.js                # 入口文件
│   ├── App.vue                # 根组件
│   ├── assets/
│   │   └── styles/
│   │       ├── variables.css  # CSS 变量
│   │       ├── base.css       # 基础样式
│   │       └── animations.css # 动画样式
│   ├── components/
│   │   ├── Header.vue         # 顶部栏
│   │   ├── StatsBar.vue       # 统计栏
│   │   ├── SearchBar.vue      # 搜索栏
│   │   ├── DomainCard.vue     # 域名卡片
│   │   ├── TabItem.vue        # 标签页列表项
│   │   ├── SleepSuggestion.vue # 休眠建议
│   │   └── Toast.vue          # 提示消息
│   ├── views/
│   │   ├── Dashboard.vue      # 主面板
│   │   └── Settings.vue       # 设置页面
│   ├── stores/
│   │   ├── tabs.js            # 标签页状态
│   │   ├── settings.js        # 设置状态
│   │   └── theme.js           # 主题状态
│   └── utils/                 # 工具函数（可选）
├── docs/                      # 项目文档
├── package.json
├── vite.config.js
└── README.md
```

---

## 技术约束

### 浏览器兼容性
- Chrome 88+
- Edge 88+
- 其他 Chromium 系浏览器

### 性能要求
- 打开管理面板时间 < 1 秒
- 搜索响应时间 < 100ms
- 动画流畅（60fps）

### 安全要求
- 数据不外发
- 本地存储
- 最小权限原则

---

## 变更记录

| 日期 | 版本 | 变更内容 |
|------|------|---------|
| 2026-06-05 | 1.0 | 初始架构设计 |
| 2026-06-05 | 1.1 | 修复性能问题：添加防抖处理、加载状态、限制标签页数量 |
| 2026-06-05 | 1.2 | 优化功能：修复重复检测逻辑；移除全局导出，改为单个标签页复制 |
| 2026-06-05 | 1.3 | 修复运行时错误：优化重复检测逻辑，添加更多错误处理 |
| 2026-06-05 | 1.4 | 优化重复检测显示：明确标记重复网页，域名统计包含重复数量 |
