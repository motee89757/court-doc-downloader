/**
 * 法院文书自动下载工具
 * 用法: node index.js <送达链接> [输出目录]
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

const args = process.argv.slice(2);
let url = args[0];
let outputDir = args[1] || path.join(__dirname, 'downloads');

// 下载文件
function downloadFile(fileUrl, filename, outputPath) {
  return new Promise((resolve, reject) => {
    const protocol = fileUrl.startsWith('https') ? https : http;

    const request = protocol.get(fileUrl, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        console.log(`  重定向到: ${response.headers.location.substring(0, 80)}...`);
        downloadFile(response.headers.location, filename, outputPath).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`下载失败: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(outputPath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`  已下载: ${filename}`);
        resolve();
      });
    });

    request.on('error', reject);
  });
}

// 主函数
async function main() {
  if (!url) {
    console.log('用法: node index.js <送达链接> [输出目录]');
    console.log('示例: node index.js "https://zxfw.court.gov.cn/zxfw/#/..." "C:\\Downloads"');
    process.exit(1);
  }

  console.log('送达链接:', url);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  console.log('输出目录:', outputDir);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const pdfLinks = new Map();

  page.on('request', req => {
    const reqUrl = req.url();
    if (reqUrl.includes('oss') && (reqUrl.includes('.pdf') || reqUrl.includes('%25E8'))) {
      const fileMatch = reqUrl.match(/file=([^&]+)/);
      if (fileMatch) {
        const pdfUrl = decodeURIComponent(fileMatch[1]);
        const nameMatch = pdfUrl.match(/([^/]+)\.pdf/i);
        if (nameMatch) {
          const decodedFilename = decodeURIComponent(nameMatch[1]) + '.pdf';
          pdfLinks.set(decodedFilename, pdfUrl);
        }
      }
    }
  });

  console.log('\n正在加载页面...');
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  const pdfFiles = await page.locator('text=/\\.pdf/i').all();
  console.log(`\n找到 ${pdfFiles.length} 个文件，准备下载...\n`);

  for (const pdfFile of pdfFiles) {
    const filename = await pdfFile.textContent();
    console.log(`点击: ${filename}`);
    await pdfFile.click();
    await page.waitForTimeout(1500);
  }

  await browser.close();

  console.log('\n开始下载文件...\n');
  for (const [filename, fileUrl] of pdfLinks) {
    const decodedFilename = decodeURIComponent(filename);
    const outputPath = path.join(outputDir, decodedFilename);
    try {
      await downloadFile(fileUrl, filename, outputPath);
    } catch (err) {
      console.error(`  下载失败 ${filename}: ${err.message}`);
    }
  }

  console.log('\n完成！');
}

main().catch(console.error);