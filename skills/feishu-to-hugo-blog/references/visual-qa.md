# 长文视觉验收（无头 Chrome + CDP）

用于检查 20k+ 像素高的长文，避免只看到首屏。

## 1. 起服务

```bash
node_modules/.bin/hugo server --port 1313 --bind 127.0.0.1 --disableFastRender
```

## 2. 起 Chrome（CDP）

```bash
google-chrome-stable --headless=new --disable-gpu --no-sandbox --hide-scrollbars \
  --user-data-dir="$PWD/.screens/cdp-profile" --remote-debugging-port=9222 \
  --window-size=1440,1000 about:blank &
```

## 3. 采样脚本

用 Node 原生 `WebSocket`（Node 22+）连接 `http://127.0.0.1:9222/json`：

1. `Page.enable`、`Emulation.setDeviceMetricsOverride`（1440×1200）。
2. `Page.navigate` 到文章 URL，等待 MathJax 完成（约 7s）。
3. 执行 JS：`document.querySelectorAll('img').forEach(i => i.loading='eager')`，滚到底再回顶。
4. 取 `document.documentElement.scrollHeight` 和每个 `h2/h3` 的 `offsetTop`。
5. `Page.captureScreenshot`，带 `captureBeyondViewport: true` 与 `clip {x:0,y,width:1440,height:1900}`，逐段保存。

检查点：首屏、公式密集段、两个代码块、每张图、文末 Reference。

## 4. 清理

`.screens/`、`.larkdoc/`、`.tmptest/` 不提交；验收完删除或加入 `.gitignore`。
