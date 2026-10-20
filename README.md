# CharlyMC

正式网站：https://playmc.charlyw.top/

静态中文整合包网站，无构建依赖。Vercel 从 `dist/` 发布，推送 `main` 自动部署。

## 本地预览

```sh
python3 -m http.server 4173 --directory dist
```

## 内容维护

- `dist/index.html`：版本、GitHub 下载入口、折叠更新说明、安装与入服指南。
- `dist/app.js`：复制服务器地址、Canvas 方块景观。
- `dist/style.css`：桌面与手机布局。

主下载入口为原仓库 GitHub Releases。当前 4.1 Release 尚无整合包附件，页面已明确说明；上传后将主按钮替换为真实附件直链并移除待上传提示。NAS 备用地址确认后再添加，不放置无效链接。

下载文件不经过 Vercel。所有说明在本站展示，不依赖飞书。服务器地址为静态连接信息。
