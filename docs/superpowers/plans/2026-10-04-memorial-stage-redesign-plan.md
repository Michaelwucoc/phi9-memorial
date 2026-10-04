# Phi9 Memorial 舞台重设计实施计划

> **For agentic workers:** Implement task-by-task with verification after each task.

**Goal:** 将解谜图片替换为文字演算舞台，并实现音乐收藏槽与真实音频频谱。

**Architecture:** 保持静态 HTML/CSS/JS；解谜舞台由 DOM 字符矩阵与滚动进度驱动；播放器使用原生 audio，用户播放后尝试一次 AudioContext analyser，失败则隐藏频谱并保留声音。

**Tech Stack:** HTML5, CSS, vanilla JavaScript, Web Audio API, Playwright Core.

**Spec:** `docs/superpowers/specs/2026-10-04-memorial-stage-redesign-design.md`

## Global Constraints
- 解谜舞台不嵌入截图；资源下载区保留原始图片。
- 不使用随机/时间合成假频谱。
- 音频分析失败时原生播放必须继续可用。
- 拖拽操作必须有点击与键盘替代。

### Task 1: Text-based decrypt stage
**Files:** Modify `index.html`, `assets/css/style.css`, `assets/js/main.js`; Test `tools/decrypt-stage.spec.js`.
- 删除解谜舞台中的所有 `img`/`figure`。
- 添加 FFT 字符扫描、`OUTSIDE_THE_BIRDCAGE` 字符层、13 段碎片矩阵、黄色格读序、Morse/Nihilist/Fence 文本层。
- 延长第二阶段滚动占比，并让结果向矩阵过渡。
- 验证 0 个解谜图片、7 阶段可逆切换、桌面移动无 JS 错误。

### Task 2: Music archive slot
**Files:** Modify `index.html`, `assets/css/style.css`, `assets/js/main.js`; Test `tools/music-archive.spec.js`.
- 添加收藏槽 DOM 与空状态。
- 曲目支持 click/Enter 收纳，拖拽收纳，槽内 click/Enter 取出并播放，状态写入 localStorage。
- 验证 12 首仍可播放/下载、键盘路径可用、收藏不重复。

### Task 3: Real analyser spectrum
**Files:** Modify `assets/js/main.js`, `assets/css/style.css`; Test `tools/audio-spectrum.spec.js`.
- 首次用户播放时尝试创建单一 AudioContext/source/analyser，读取 `getByteFrequencyData`。
- 分析失败时 disconnect/隐藏 canvas，保留 audio 原生播放。
- 验证播放 currentTime 前进、无随机频谱代码、暂停停止 RAF、错误无页面异常。

### Task 4: Full browser QA
**Files:** Modify `tools/qa.js` if needed.
- Run decrypt, music, audio tests at desktop and mobile.
- Check 404s, page errors, image paths outside decrypt, and syntax.
