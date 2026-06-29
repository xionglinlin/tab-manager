# 图标文件说明

## 需要的图标文件

Chrome Extension 需要以下尺寸的图标：
- `icon16.png` (16x16)
- `icon48.png` (48x48)
- `icon128.png` (128x128)

## 生成方法

### 方法 1：使用在线工具（推荐）

1. 访问 [Favicon Generator](https://favicon.io/favicon-generator/) 或 [RealFaviconGenerator](https://realfavicongenerator.net/)
2. 上传 `icon.svg` 文件
3. 生成不同尺寸的图标
4. 下载并重命名为 `icon16.png`, `icon48.png`, `icon128.png`

### 方法 2：使用命令行工具

#### 安装 ImageMagick

```bash
# Ubuntu/Debian
sudo apt-get install imagemagick

# macOS
brew install imagemagick
```

#### 生成图标

```bash
# 进入图标目录
cd public/icons

# 生成 16x16 图标
convert icon.svg -resize 16x16 icon16.png

# 生成 48x48 图标
convert icon.svg -resize 48x48 icon48.png

# 生成 128x128 图标
convert icon.svg -resize 128x128 icon128.png
```

### 方法 3：使用 Node.js 脚本

创建 `generate-icons.js` 文件：

```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [16, 48, 128];
const inputSvg = path.join(__dirname, 'icon.svg');

async function generateIcons() {
  for (const size of sizes) {
    const outputFile = path.join(__dirname, `icon${size}.png`);
    await sharp(inputSvg)
      .resize(size, size)
      .png()
      .toFile(outputFile);
    console.log(`Generated: icon${size}.png`);
  }
}

generateIcons().catch(console.error);
```

运行脚本：

```bash
# 安装 sharp
npm install sharp

# 运行脚本
node generate-icons.js
```

### 方法 4：手动创建

如果没有工具，可以：
1. 在浏览器中打开 `icon.svg`
2. 使用截图工具截取不同尺寸
3. 保存为 PNG 格式

## 图标设计说明

当前图标设计：
- **颜色**：蓝色到紫色渐变
- **元素**：三个重叠的标签页 + 齿轮图标
- **风格**：现代、简洁、易识别

## 验证图标

生成图标后，验证文件是否存在：

```bash
ls -la public/icons/
```

应该看到：
- icon.svg
- icon16.png
- icon48.png
- icon128.png

## 注意事项

1. **透明背景**：图标应该有透明背景
2. **圆角**：Chrome 会自动应用圆角，所以图标应该是方形的
3. **清晰度**：确保图标在不同尺寸下都清晰可见
4. **一致性**：三个尺寸的图标应该保持一致的设计风格

## 下一步

生成图标后，运行以下命令测试：

```bash
# 构建项目
npm run build

# 加载到 Chrome 测试
# 1. 打开 chrome://extensions
# 2. 开启"开发者模式"
# 3. 点击"加载已解压的扩展程序"
# 4. 选择 dist 目录
```
