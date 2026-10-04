# Phi9 Memorial · 第九章落幕纪念站

献给 Phigros 第九章主线完结与解谜落幕，感谢解谜三群的共同努力。
纯静态、零构建、零运行时依赖 —— 一个 `index.html` 打开即用。

## 内容

| 板块 | 说明 |
| --- | --- |
| **解谜记录** | 固定舞台 + 滚动驱动的七幕解谜全记录：源码图 → 傅里叶显影 → 13 段碎片归位 → 顺时针读取 → 零宽字符/Morse → Nihilist 方阵 → 栅栏之字读取 |
| **曲绘回廊** | 12 幅 2048×1080 曲绘原图，灯箱赏阅、随曲同听、原图下载 |
| **收藏品档案馆** | 诗笺、剧情原画与档案条目 |
| **音乐厅** | 12 章完整音轨在线试听、单曲下载、批量打包、**收藏槽**（拖拽 / 点击 / 键盘皆可收纳与取出，localStorage 持久化）、**实时频谱**（AnalyserNode 读取真实音频信号） |
| **音效实验室** | 52 条客户端原版音效，点击即试听 |

## 本地运行

直接双击 `index.html` 即可（`file://` 下音乐照常播放，频谱自动隐藏而非显示假动画）。

推荐用本地 HTTP 服务获得完整体验（实时频谱依赖 `AudioContext`）：

```bash
cd Phi9-Memorial
python3 -m http.server 8000
# 浏览器打开 http://localhost:8000
```

## 部署

任意静态托管即可（GitHub Pages / Vercel / 自建 Nginx 均可）。

**注意**：两个超过 GitHub 100MB 单文件上限的打包已被 `.gitignore` 排除，部署后请手动上传到服务器对应路径，页面里的批量下载卡片才会生效：

```bash
# 在本机原目录找到这两个文件，直接 scp 到部署机同路径即可
scp assets/zip/Chapter9_Music_Full_WAV.zip   user@server:/path/to/site/assets/zip/
scp assets/zip/Chapter9_音效全集_原版WAV.zip  user@server:/path/to/site/assets/zip/
```

GitHub Pages 方式：Settings → Pages → Deploy from branch → `main` / root。

## 交互速查

- **解谜舞台**：纯滚动推进，七幕自动切换；`prefers-reduced-motion` 下动效自动降级。
- **音乐收藏槽**：拖动曲目入槽 / 点击曲目行 `＋` / 聚焦曲目后回车；点击槽内条目即取出并播放。
- **频谱**：真实 `AnalyserNode` 频域数据实时渲染；不可用时隐藏画布，绝不显示合成动画。

## 开发与验证

`tools/` 下是浏览器级验收脚本（依赖本机的 playwright-core，路径为绝对路径，仅供原机复验）：

```bash
node tools/decrypt-stage.spec.js   # 七幕滚动断言：进度、居中、图片加载、移动端
node tools/qa.js                    # 全站 QA：区块、音轨、收藏槽、实时频谱、双视口
```

## 致谢

解谜三群 —— 第九章解谜全过程由社群共同完成，本站解谜链路与素材均取自社群整理稿。
