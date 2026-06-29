import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [16, 48, 128];
const inputSvg = path.join(__dirname, 'icon.svg');

async function generateIcons() {
  console.log('开始生成图标...\n');

  // 检查输入文件是否存在
  if (!fs.existsSync(inputSvg)) {
    console.error('错误：找不到 icon.svg 文件');
    process.exit(1);
  }

  for (const size of sizes) {
    const outputFile = path.join(__dirname, `icon${size}.png`);

    try {
      await sharp(inputSvg)
        .resize(size, size)
        .png()
        .toFile(outputFile);

      console.log(`✅ 生成成功: icon${size}.png (${size}x${size})`);
    } catch (err) {
      console.error(`❌ 生成失败: icon${size}.png`, err.message);
    }
  }

  console.log('\n图标生成完成！');
  console.log('\n下一步：');
  console.log('1. 运行 npm run build 构建项目');
  console.log('2. 在 Chrome 中加载扩展');
}

generateIcons().catch(console.error);
