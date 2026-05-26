# 法院文书送达自动下载工具

自动解析法院电子送达链接，批量下载 PDF 文书材料。

> **特别提醒**：本工具仅适用于**全国法院统一送达平台**（域名为 `zxfw.court.gov.cn`）推送的短信链接。其他法院系统（如地方各级法院自建平台）的送达链接不适用，请勿混用。

## 功能

- 自动检测法院送达链接（包含 `zxfw.court.gov.cn`）
- 批量下载所有 PDF 文书（起诉状、证据、判决书等）
- 支持指定输出目录

## 给 AI 使用

这是一个 Claude Code Skill，AI 会自动识别并使用。

### 自动安装（推荐）

1. 克隆此仓库到本地
2. 在该目录下打开 Claude Code，告诉 AI："注册 court-doc-downloader 这个 skill"

AI 会自动完成依赖安装和 Playwright 浏览器配置。

### 触发方式

将短信直接复制给 AI，如需保存到指定目录，就告诉AI保存地址

AI 会自动识别链接并使用此 skill。

### 手动使用

```bash
# 克隆仓库
git clone <仓库地址>
cd court-doc-downloader

# 安装依赖
npm install
npx playwright install chromium

# 运行
node scripts/index.js "<送达链接>" [输出目录]
```

## 示例输出

```
送达链接: https://zxfw.court.gov.cn/zxfw/#/...
输出目录: D:\Downloads

正在加载页面...
找到 3 个文件，准备下载...

点击: 起诉状.pdf
点击: 证据目录.pdf
点击: 证据材料.pdf

开始下载文件...
  已下载: 起诉状.pdf
  已下载: 证据目录.pdf
  已下载: 证据材料.pdf

完成！
```

## 工作原理

1. 使用 Playwright 打开送达链接（SPA 应用，内容动态渲染）
2. 模拟点击列表中的每个 PDF 文件
3. 拦截浏览器请求，提取阿里云 OSS 直链 URL
4. 使用 Node.js 原生模块直接下载文件

## 环境要求

- Node.js >= 18
- Windows / macOS / Linux

## 目录结构

```
court-doc-downloader/
├── SKILL.md          # Skill 元数据
├── README.md        # 本说明文档
├── package.json     # 依赖配置
└── scripts/
    └── index.js    # 下载脚本
```

## 常见问题

### 链接无效
确保链接包含 `zxfw.court.gov.cn` 域名。

### 页面加载超时
网络较慢时可重试。

### 没有找到 PDF
链接可能已过期，请使用最新的送达链接。

## 许可证

MIT
