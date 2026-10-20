# CharlyMC

正式网站：https://playmc.charlyw.top/

静态网站，无构建依赖。Vercel 从 `dist/` 部署，推送 `main` 自动发布。

## 页面

- 首页：原版方块景观、最新版下载、最新更新日志。
- 版本与日志：包含最新版的完整版本列表，各版本下载与日志放在一起。
- 游玩指南：PCL 安装、升级、服务器地址、IPv6 与常见问题。
- 小镇展示：待开放，后续补充真实服务器截图与介绍。

Tab 支持水平滚轮、触摸板横滑、触屏左右滑动（一次手势切换一页），并保留竖向滚动、缩放和屏幕边缘手势。也支持键盘左右方向键、Home/End、浏览器前进后退和链接直达，例如 `/#versions`。

## 更新版本

编辑 `dist/releases.js`，第一项为最新版。首页、版本页和指南自动读取同一份版本数据。

- `downloadUrl`：GitHub Release 附件直链。
- `nasUrl`：NAS 备用下载；未填写时不显示。
- `changes`：分类更新日志。
- 老版本缺失的日志或文件地址显示待补充，不放无效链接。

当前 4.1 使用 GitHub 主下载和 NAS 备用直链。`window.CHARLY_DOWNLOADS.feishuUrl` 为所有版本通用的飞书备用总览；网站日志与指南仍在本站呈现。

## 本地预览

```sh
python3 -m http.server 4173 --directory dist
```

`dist/index.html` 定义页面结构，`dist/style.css` 定义样式，`dist/app.js` 提供 Tab、渲染、复制及方块景观功能。服务器区域为静态连接信息。
