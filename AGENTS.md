# AGENTS.md

本仓库是使用 Hugo + PaperMod 的个人博客，生产地址 <https://xiaozhiwei.tech/>。本文件记录仓库约定、常用命令，以及“飞书文档 → 博客”的固定流程。后续每次迁移都请更新本文件末尾的「迁移日志」，并把新踩到的坑补进 skill。

## 常用命令

```bash
bun install                 # 安装依赖
bun run dev                 # 本地开发（hugo server）
bun run build               # 构建到 dist/
node_modules/.bin/hugo --gc --minify --cleanDestinationDir --destination dist
```

部署：`.github/workflows/deploy.yml` 在 push 到 `main` / `master` 时自动构建并部署；PR 只做构建校验。

## 目录约定

- 文章：`content/posts/<slug>/index.md`（page bundle），图片：`content/posts/<slug>/images/`。
- 全站样式：`assets/css/extended/blog.css`（PaperMod 会自动打包）。
- 短代码：`layouts/_shortcodes/callout.html`、`feature-list.html`。
- 代码块：`layouts/_markup/render-codeblock.html`（语言栏 + 复制按钮），复制脚本在 `layouts/_partials/extend_footer.html`。
- 文章布局：`layouts/posts/page.html`（PaperMod `single.html` 副本；避免被根目录 `layouts/page.html` 的普通页布局接管）。
- 数学：`hugo.toml` 已开启 Goldmark passthrough，`layouts/_partials/extend_head.html` 加载 MathJax 3。
- 分享按钮：`ShowShareButtons = false`，文章底部不显示 X / Facebook 等分享图标。
- 临时目录：`.larkdoc/`（飞书拉取）、`.screens/`（截图/PDF）、`.tmptest/`（Hugo 小实验），均不入库。

## 版式规范

### Front matter

```yaml
title: "原文标题"
date: 2026-11-03T12:00:00+08:00
lastmod: 2026-11-03T12:00:00+08:00
draft: false
author: "ZhiWei Xiao"
description: "用于 SEO 的一句话摘要"
summary: "列表页摘要"
tags: ["大模型", "Transformer"]
categories: ["大模型架构"]
ShowToc: true
TocOpen: true
UseHugoToc: true
ShowCodeCopyButtons: false
math: true
```

### 组件

- 高亮块：`{{% callout emoji="🤔" title="Q & A" type="qa" %}}`，`type` 为 `note` / `qa`。
- 要点卡片组：`{{% feature-list %}}` 包一个列表，每项首行加粗作为标题，后续内容缩进 2 空格。
- 图片：`{{< figure src="images/x.png" alt="..." caption="..." >}}`，**题注/描述不能丢**。
- 公式：行内 `$...$`；独立公式 `$$` 独占行且上下留空行；多行用 `\begin{aligned}`；少用裸 `<` `>`，用 `\langle \rangle`。
- 代码：普通 fenced block，语言标注要正确。
- 目录：由 `ShowToc` 自动生成，标题层级保持原文。

### 首页

- 首页列表由 `layouts/list.html` 覆盖：紧凑 hero + “最新文章”栏 + 卡片 + “阅读全文”提示。
- 文章卡片的覆盖链接使用 `.RelPermalink`，避免从 HTTP 首页点进 HTTPS 文章时切换协议失败。
- 首页样式在 `assets/css/extended/blog.css` 的 `Home page` 段，`home-info` 不再使用 320px 最小高度。

## 飞书文档迁移流程

详细步骤、命令与坑位见 [`skills/feishu-to-hugo-blog/SKILL.md`](skills/feishu-to-hugo-blog/SKILL.md)。核心步骤：

1. `lark-cli wiki +node-get --node-token '<url>'` 解析节点。
2. `lark-cli docs +fetch` 同时拉 Markdown 与 XML（XML 用于图片 token / caption / callout）。
3. `lark-cli docs +media-download` 下载全部图片，语义化命名，题注与 alt 原样保留。
4. 建 page bundle，按上面的版式重排；只做错别字、标点、明显笔误的润色，技术含义不改。
5. 本地构建 + 分段截图验收（公式换行、长公式溢出、代码截断、图片题注、目录）。
6. commit + push，确认 GitHub Actions 部署成功并线上复核。

### 必须避开的坑

1. `{{% shortcode %}}` 后必须空一行，闭合标签前也空一行，否则第一段按原始 Markdown 输出。
2. `hugo.toml` 必须有 `[markup.goldmark.renderer] unsafe = true`，否则 shortcode 的 HTML 被丢弃。
3. `$$` 块内以 `+` / `-` / `*` 开头的行会被当成 Markdown 列表，导致公式整块失效；用 `&\quad +` 或把运算符放上一行。
4. 裸 `<f(x), g(y)>` 会被浏览器当 HTML 标签吞掉；改成 `\langle ... \rangle`。
5. 截图/打印长文前把 `img.loading` 改为 `eager`，否则懒加载图片是空白。
6. `lark-cli` 需要写 `~/.local/share/lark-cli` 的 token 缓存；沙箱只读时临时放宽权限，否则报 `keychain Set failed`。
7. 本机 SSH 配置损坏或 22 端口不通时，用 443 推送：`GIT_SSH_COMMAND='ssh -F /dev/null' git push ssh://git@ssh.github.com:443/xzwsloser/MyBlog.git main:main`。

## 验收清单

- [ ] 原文段落/列表/公式/图片/题注无遗漏
- [ ] 公式全部渲染，多行公式对齐，长公式不溢出
- [ ] 代码块语言正确、长行不截断、复制按钮可用
- [ ] 图片本地化且题注可见
- [ ] 目录层级正确
- [ ] 手机宽度无可横向滚动
- [ ] `hugo` 构建无 raw HTML 警告
- [ ] push 后 Actions 成功，线上页面复核

## 迁移日志

### 2026-11-03 · 大模型架构(一): 位置编码

- 来源：<https://dcnlcoue52zc.feishu.cn/wiki/Kyejw6zF5iDM89k2WLgc3ef7n1e>
- 产物：`content/posts/llm-architecture-1-positional-encoding/`（10 张图 + 2 段代码 + 3 个 Q&A 卡片 + 2 个提示卡片 + 4 张性质卡片）
- 新增：callout / feature-list 短代码、代码块 render hook、`posts/page.html`、MathJax passthrough、`blog.css`、`i18n/en.yaml` 目录标题
- 修正的明显笔误：`编程→变成`、`相似新→相似性`、`集合→几何`、`不放→不妨`、`蓄念→训练`、`不适用→不使用`、`有点是→优点是`、`确实是→缺点是`、`高频（应低频）`、`衰减区间→衰减趋势`
- 版式：自动目录、卡片式 Q&A / 性质块、图注、代码语言栏、公式居中与 aligned 换行

### 2026-11-03 · 首页改版

- 问题：`home-info` 最小高度 320px 把文章列表推得过低；卡片链接使用绝对 `Permalink`，从 HTTP 首页点击会跳到当前不可用的 HTTPS。
- 修复：`layouts/list.html` 增加“最新文章”栏、分类眉标、阅读全文提示；卡片改用 `.RelPermalink`；`blog.css` 压缩 hero 并重做卡片 hover。
- 同步更新 `skills/feishu-to-hugo-blog/SKILL.md` 的发布注意事项。
