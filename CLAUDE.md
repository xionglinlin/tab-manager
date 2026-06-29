# Tab Manager 浏览器标签页管理插件

## 项目概述

开发一个智能的浏览器标签页管理插件，解决标签页过多时难以找到和清理的问题。

## 项目位置

- **项目目录**：`./tab-manager/`
- **文档目录**：`./tab-manager/docs/`
- **项目 README**：`./tab-manager/README.md`

## 技术约束

- Chrome Extension Manifest V3
- 前端框架：Vue 3 + Composition API
- 状态管理：Pinia
- 构建工具：Vite
- CSS 方案：手写 CSS + CSS Variables
- 本地运行，数据不外发
- 兼容 Chrome / Edge 等 Chromium 系浏览器

## 设计原则

1. **简洁美观** - 现代化 UI 设计，视觉舒适
2. **高效实用** - 快速找到目标标签页，减少操作步骤
3. **智能分组** - 自动分类，减少用户思考负担
4. **轻量级** - 不影响浏览器性能

## 功能清单

### 核心功能
1. ✅ 域名分组 - 按域名自动分组显示标签页
2. ✅ 域名置顶 - 置顶常用域名，持久化存储
3. ✅ 一键清理 - 关闭整个域名分组
4. ✅ 重复检测 - 显示重复标签页，支持去重
5. ✅ 点击跳转 - 点击标签页跳转到对应窗口
6. ✅ 主题切换 - 支持深色/浅色/跟随系统
7. ✅ 窗口合并 - 合并多个浏览器窗口
8. ✅ 好看的动画 - 关闭时的微动画效果

### 高级功能
9. ✅ 休眠建议 - 标记长时间未访问的标签页
10. ✅ 搜索过滤 - 搜索标签页标题和 URL
11. ✅ 复制单个标签页链接 - 鼠标悬浮显示复制按钮
12. ✅ 设置页面 - 高级设置集中管理

## 项目文档

### 文档索引

**重要说明**：所有项目文档位于 `./tab-manager/docs/` 目录下，当设计、功能、架构等发生变化时，必须及时更新对应文档！

| 文档 | 路径 | 说明 | 更新时机 |
|------|------|------|---------|
| 文档索引 | [docs/README.md](tab-manager/docs/README.md) | 所有文档的索引和快速导航 | 新增或删除文档时 |
| 需求分析文档 | [docs/development/01-requirements.md](tab-manager/docs/development/01-requirements.md) | 功能需求、用户场景、优先级 | 需求变更时 |
| 架构设计文档 | [docs/development/02-architecture.md](tab-manager/docs/development/02-architecture.md) | 技术选型、架构设计、模块划分 | 架构调整时 |
| 开发计划文档 | [docs/development/03-development-plan.md](tab-manager/docs/development/03-development-plan.md) | 开发阶段、任务分解、时间安排 | 进度变化时 |
| 技术方案文档 | [docs/development/04-technical-solution.md](tab-manager/docs/development/04-technical-solution.md) | 具体技术实现方案 | 技术方案变化时 |
| 项目总结文档 | [docs/development/05-project-summary.md](tab-manager/docs/development/05-project-summary.md) | 项目完成情况、经验总结 | 项目完成时 |
| 测试指南文档 | [docs/development/06-testing-guide.md](tab-manager/docs/development/06-testing-guide.md) | 测试环境、测试清单、测试报告 | 测试完成时 |
| UI 设计文档 | [docs/design/01-ui-design.md](tab-manager/docs/design/01-ui-design.md) | UI 设计方案、组件设计、交互设计 | 设计变更时 |

### 文档更新规范

**⚠️ 重要：文档同步更新要求**

当发生以下情况时，**必须**同步更新相关文档：

1. **需求变更**
   - 更新：需求分析文档 (`docs/development/01-requirements.md`)
   - 同步更新：项目总结文档、开发计划文档

2. **架构调整**
   - 更新：架构设计文档 (`docs/development/02-architecture.md`)
   - 同步更新：技术方案文档、项目总结文档

3. **设计变更**
   - 更新：UI 设计文档 (`docs/design/01-ui-design.md`)
   - 同步更新：项目总结文档

4. **技术方案变化**
   - 更新：技术方案文档 (`docs/development/04-technical-solution.md`)
   - 同步更新：架构设计文档、项目总结文档

5. **开发进度变化**
   - 更新：开发计划文档 (`docs/development/03-development-plan.md`)
   - 同步更新：项目总结文档

6. **功能完成**
   - 更新：项目总结文档 (`docs/development/05-project-summary.md`)
   - 同步更新：开发计划文档、需求分析文档

**文档更新流程**：
1. 修改代码或设计
2. 立即更新对应文档
3. 更新文档的变更记录表
4. 检查是否需要同步更新其他文档

## 开发指南

### 快速开始

```bash
# 进入项目目录
cd tab-manager

# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build
```

### 项目结构

```
tab-manager/
├── src/
│   ├── main.js                # 入口文件
│   ├── App.vue                # 根组件
│   ├── components/            # 组件
│   │   ├── Header.vue         # 顶部栏
│   │   ├── StatsBar.vue       # 统计栏
│   │   ├── SearchBar.vue      # 搜索栏
│   │   ├── DomainCard.vue     # 域名卡片
│   │   ├── TabItem.vue        # 标签页列表项
│   │   ├── SleepSuggestion.vue # 休眠建议
│   │   └── Toast.vue          # 提示消息
│   ├── views/                 # 页面
│   │   ├── Dashboard.vue      # 主面板
│   │   └── Settings.vue       # 设置页面
│   ├── stores/                # 状态管理
│   │   ├── tabs.js            # 标签页状态
│   │   ├── settings.js        # 设置状态
│   │   └── theme.js           # 主题状态
│   └── assets/styles/         # 样式
├── public/
│   ├── manifest.json          # Chrome Extension 配置
│   └── background.js          # Service Worker
└── docs/                      # 项目文档
```

### 加载到 Chrome

1. 构建项目：`npm run build`
2. 打开 Chrome 扩展管理页面：`chrome://extensions`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择 `dist` 目录

## 相关资源

- Chrome Extension 开发文档：https://developer.chrome.com/docs/extensions/
- Vue 3 文档：https://vuejs.org/
- Pinia 文档：https://pinia.vuejs.org/
- Vite 文档：https://vitejs.dev/

## 变更记录

| 日期 | 版本 | 变更内容 |
|------|------|---------|
| 2026-06-05 | 1.0 | 初始项目创建 |
| 2026-06-05 | 1.1 | 完成核心功能开发 |
| 2026-06-05 | 1.2 | 完善项目文档体系 |
| 2026-06-05 | 1.3 | 修复性能问题：添加防抖处理、加载状态、限制标签页数量 |
| 2026-06-05 | 1.4 | 优化功能：修复重复检测；导出改为单个复制；优化按钮布局 |
| 2026-06-05 | 1.5 | 修复运行时错误：优化重复检测逻辑，添加更多错误处理 |
| 2026-06-05 | 1.6 | 优化重复检测显示：明确标记重复网页，域名统计包含重复数量 |
