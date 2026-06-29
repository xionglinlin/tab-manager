# Tab Manager - 浏览器标签页管理插件

一个智能的浏览器标签页管理插件，帮助你高效管理大量标签页。

## ✨ 功能特性

### 核心功能
- 📊 **域名分组** - 按域名自动分组显示标签页
- ⭐ **域名置顶** - 置顶常用域名，持久化存储
- 🧹 **一键清理** - 关闭整个域名分组
- ⚡ **重复检测** - 明确标记重复网页，显示重复数量，支持一键去重
- 🎯 **点击跳转** - 点击标签页跳转到对应窗口
- 🌙 **主题切换** - 支持深色/浅色/跟随系统
- 🪟 **窗口合并** - 合并多个浏览器窗口
- ✨ **好看的动画** - 关闭时的微动画效果
- 🖱️ **悬浮操作** - 鼠标悬浮显示操作按钮，界面更简洁

### 智能功能
- 💤 **休眠建议** - 标记长时间未访问的标签页
- 🔍 **搜索过滤** - 搜索标签页标题和 URL
- 📋 **复制链接** - 鼠标悬浮显示复制按钮，复制单个标签页链接

### 设置功能
- ⚙️ **设置页面** - 高级设置集中管理
- 📌 **置顶管理** - 添加/删除置顶域名
- 🎨 **主题设置** - 深色/浅色/跟随系统
- ⏰ **休眠阈值** - 自定义休眠时间

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 加载到 Chrome
1. 打开 `chrome://extensions`
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 `dist` 目录

## 📁 项目结构

```
tab-manager/
├── public/
│   ├── manifest.json          # Chrome Extension 配置
│   ├── background.js          # Service Worker
│   └── icons/                 # 图标资源
├── src/
│   ├── main.js                # 入口文件
│   ├── App.vue                # 根组件
│   ├── assets/styles/         # 样式文件
│   │   ├── variables.css      # CSS 变量（主题）
│   │   ├── base.css           # 基础样式
│   │   └── animations.css     # 动画样式
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
│   └── utils/                 # 工具函数
├── package.json
├── vite.config.js
└── README.md
```

## 🛠️ 技术栈

- **前端框架**: Vue 3 + Composition API
- **状态管理**: Pinia
- **构建工具**: Vite
- **CSS 方案**: 手写 CSS + CSS Variables
- **Chrome Extension**: Manifest V3

## 📝 使用说明

### 基本操作
1. 点击扩展图标打开管理面板
2. 标签页按域名自动分组
3. 点击标签页跳转到对应窗口
4. 鼠标悬浮在标签页上显示复制和关闭按钮
5. 使用搜索框快速过滤标签页

### 置顶域名
1. 鼠标悬浮在域名卡片上，点击右上角的置顶按钮
2. 置顶的域名会显示在顶部区域
3. 在设置中可以管理置顶域名

### 休眠建议
1. 超过设定时间未访问的标签页会被标记
2. 可以一键关闭休眠标签页
3. 在设置中可以调整休眠阈值

### 主题切换
1. 点击顶部栏的主题按钮
2. 支持深色/浅色/跟随系统三种模式
3. 主题设置会持久化保存

## 🔧 开发说明

### 本地开发
```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### Chrome Extension 开发
1. 修改代码后重新构建
2. 在 Chrome 中刷新扩展
3. 查看控制台日志调试

### 添加新功能
1. 在 `src/stores/` 中添加状态管理
2. 在 `src/components/` 中创建组件
3. 在 `src/views/` 中创建页面
4. 在 `src/App.vue` 中集成

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系方式

如有问题，请提交 Issue 或联系开发者。
