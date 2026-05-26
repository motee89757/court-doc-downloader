---
name: court-doc-downloader
description: 法院文书送达自动下载。当用户提供的链接包含 zxfw.court.gov.cn 时自动触发。自动解析法院电子送达链接，提取并下载 PDF 文书（起诉状、证据材料等）。适用于收到法院短信链接后需要批量下载文书材料的场景。
compatibility:
  - node >= 18
  - playwright >= 1.40
---

# 法院文书送达自动下载

当用户提供的链接包含 `zxfw.court.gov.cn` 时自动使用此 skill。

## 触发条件

- 链接包含 `zxfw.court.gov.cn`（法院送达平台域名）
- 用户请求下载送达文书

## 使用方式

### 输入

1. **送达链接**（必需）：法院系统发送的短信中的链接
   ```
   https://zxfw.court.gov.cn/zxfw/#/pagesAjkj/app/wssd/index?qdbh=xxx&sdbh=xxx&sdsin=xxx
   ```

2. **输出目录**（可选）：下载文件保存位置
   - 默认：`./downloads`

### 运行命令

```bash
node scripts/index.js "<送达链接>" [输出目录]
```

示例：
```bash
# 下载到当前目录的 downloads 文件夹
node scripts/index.js "https://zxfw.court.gov.cn/zxfw/#/pagesAjkj/app/wssd/index?qdbh=xxx"

# 下载到指定目录
node scripts/index.js "链接" "D:/MyDocuments"
```

## 工作原理

1. 使用 Playwright 打开送达链接（Vue SPA 应用，内容动态渲染）
2. 模拟点击列表中的每个 PDF 文件
3. 拦截浏览器请求，提取阿里云 OSS 直链 URL
4. 使用 Node.js 原生模块直接下载文件到本地

## 依赖

首次使用需要安装依赖：

```bash
npm install
npx playwright install chromium
```

## 输出

成功下载后显示：
```
送达链接: https://zxfw.court.gov.cn/...
输出目录: D:\...\downloads

正在加载页面...
找到 4 个文件，准备下载...

点击: 起诉状.pdf
点击: 证据目录.pdf
...

开始下载文件...
  已下载: 起诉状.pdf
  已下载: 证据目录.pdf

完成！
```

## 错误处理

常见错误：
- `链接无效`：请检查链接是否完整包含 zxfw.court.gov.cn
- `页面加载超时`：网络较慢，增加等待时间后重试
- `没有找到 PDF`：链接可能已过期或无效

## 参考

核心脚本位于 `scripts/index.js`