/* ═══════════════════════════════════════════════
   CHAPTER IX MEMORIAL — main.js
   ═══════════════════════════════════════════════ */
"use strict";
const $  = (s, c) => (c || document).querySelector(s);
const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fmtT = s => { s = Math.max(0, s | 0); return (s / 60 | 0) + ":" + String(s % 60).padStart(2, "0"); };

/* ─────────── SATURN terminal boot ─────────── */
(function boot() {
  const el = $("#boot"), log = $("#boot-log"), tail = $("#boot-tail");
  const now = () => { const d = new Date(); return [d.getHours(), d.getMinutes(), d.getSeconds()].map(n => String(n).padStart(2, "0")).join(":"); };
  const clock = $("#boot-clock");
  if (clock) { clock.textContent = now(); setInterval(() => { if (clock.isConnected) clock.textContent = now(); }, 1000); }
  function buildTitle() {
    const h = $("#shard-title");
    if (!h || h.childElementCount) return;
    [..."第九章"].forEach((ch, i) => {
      const span = document.createElement("span"); span.className = "shard-char"; span.textContent = ch;
      span.style.setProperty("--delay", `${i * 180}ms`);
      span.style.setProperty("--sx", `${(i % 2 ? 1 : -1) * (150 + i * 18)}px`);
      span.style.setProperty("--sy", `${i % 2 ? -120 : 130}px`);
      span.style.setProperty("--sz", `${-100 - i * 30}px`);
      span.style.setProperty("--sr", `${i % 2 ? 28 : -24}deg`);
      h.appendChild(span);
    });
  }
  buildTitle();
  const finish = () => { document.body.dataset.boot = "done"; };
  if (sessionStorage.getItem("phi9-booted")) { document.body.dataset.boot = "done"; el.remove(); return; }
  const lines = [
    { text: "SATURN TERMINAL // PHIGROS 4.0.1", cls: "term-user" },
    { text: "saturn@phigros:~$ recover --chapter IX", cls: "term-user" },
    { text: "[OK] chaocipher ........ verified", cls: "term-ok" },
    { text: "[OK] solivault ......... linked", cls: "term-ok" },
    { text: "[OK] collection db .... 503 entries", cls: "term-ok" },
    { text: "[OK] illustrations .... 12 textures", cls: "term-ok" },
    { text: "[OK] audio ............ 12 tracks / 52 sfx", cls: "term-ok" },
  ];
  let cancelled = false;
  const skip = () => { if (cancelled) return; cancelled = true; sessionStorage.setItem("phi9-booted", "1"); finish(); };
  el.addEventListener("click", skip);
  addEventListener("keydown", skip, { once: true });
  async function typeLine(line) {
    const row = document.createElement("span"); row.className = `term-line ${line.cls || "term-muted"}`; log.appendChild(row);
    for (const ch of line.text) { if (cancelled) return; row.textContent += ch; await new Promise(r => setTimeout(r, 10)); }
  }
  (async () => {
    for (const line of lines) { if (cancelled) return; await typeLine(line); await new Promise(r => setTimeout(r, 90)); }
    if (!cancelled) { tail.textContent = "open /archive/chapter-ix"; await new Promise(r => setTimeout(r, 650)); skip(); }
  })();
})();

/* ─────────── 星空 ─────────── */
(function stars() {
  const cv = $("#stars"), ctx = cv.getContext("2d");
  let W, H, dpr, field = [], comets = [];
  const N = 190;
  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize(); addEventListener("resize", resize);
  for (let i = 0; i < N; i++) field.push({
    x: Math.random(), y: Math.random(), z: .3 + Math.random() * .7,
    r: .4 + Math.random() * 1.3, p: Math.random() * Math.PI * 2, s: .008 + Math.random() * .03,
  });
  function spawnComet() {
    comets.push({ x: Math.random() * W * .8 + W * .1, y: Math.random() * H * .3, vx: 5 + Math.random() * 4, vy: 2 + Math.random() * 1.6, life: 1 });
  }
  setInterval(() => { if (!reduced && Math.random() < .34) spawnComet(); }, 4200);
  let t = 0;
  (function frame() {
    t++;
    ctx.clearRect(0, 0, W, H);
    const sy = scrollY;
    for (const st of field) {
      st.p += st.s;
      const tw = .45 + Math.sin(st.p) * .55;
      const y = ((st.y * H) - sy * st.z * .18 + H * 3) % (H * 1.5) - H * .25;
      ctx.globalAlpha = tw * st.z * .9;
      ctx.fillStyle = st.z > .75 ? "#cfe8ff" : "#7f95c8";
      ctx.beginPath(); ctx.arc(st.x * W, y, st.r * (0.8 + tw * .4), 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
    comets = comets.filter(c => c.life > 0);
    for (const c of comets) {
      c.x += c.vx; c.y += c.vy; c.life -= .012;
      const g = ctx.createLinearGradient(c.x - c.vx * 12, c.y - c.vy * 12, c.x, c.y);
      g.addColorStop(0, "rgba(123,232,255,0)"); g.addColorStop(1, `rgba(180,240,255,${.8 * c.life})`);
      ctx.strokeStyle = g; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(c.x - c.vx * 12, c.y - c.vy * 12); ctx.lineTo(c.x, c.y); ctx.stroke();
    }
    if (!reduced) requestAnimationFrame(frame);
  })();
})();

/* ─────────── 光标辉光 ─────────── */
(function glow() {
  if (matchMedia("(pointer: coarse)").matches) return;
  const g = $("#cursor-glow");
  let raf = null, x = 0, y = 0;
  addEventListener("mousemove", e => {
    x = e.clientX; y = e.clientY; g.style.opacity = 1;
    if (!raf) raf = requestAnimationFrame(() => { g.style.left = x + "px"; g.style.top = y + "px"; raf = null; });
  });
  document.addEventListener("mouseleave", () => g.style.opacity = 0);
})();

/* ─────────── 滚动：进度 / 导航 / 揭示 / 计数 ─────────── */
(function scrollFX() {
  const bar = $("#scrollbar-progress"), nav = $("#nav");
  addEventListener("scroll", () => {
    const h = document.documentElement;
    bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + "%";
    nav.classList.toggle("scrolled", h.scrollTop > 30);
  }, { passive: true });

  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: .12, rootMargin: "0px 0px -6% 0px" });
  window.__reveal = el => { el.classList.add("reveal"); io.observe(el); };
  $$(".reveal").forEach(el => io.observe(el));

  // 导航高亮
  const links = $$(".nav-links a");
  const secIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    links.forEach(a => a.classList.toggle("active", a.dataset.nav === e.target.id));
  }), { rootMargin: "-40% 0px -55% 0px" });
  $$("main .sec").forEach(s => secIO.observe(s));

  // 逐页压入的滚动层次感：离开视口的页面轻微缩远、压暗
  const pages = $$(".page");
  let stackRaf = 0;
  function stackPages() {
    stackRaf = 0;
    pages.forEach(page => {
      const r = page.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height * .58)));
      if (p > 0 && r.bottom > 0) {
        if (!page.classList.contains("decrypt-section")) {
          page.style.transform = `scale(${1 - p * .045})`;
          page.style.filter = `brightness(${1 - p * .22})`;
        }
      } else if (!page.classList.contains("decrypt-section")) { page.style.transform = ""; page.style.filter = ""; }
    });
  }
  addEventListener("scroll", () => { if (!stackRaf) stackRaf = requestAnimationFrame(stackPages); }, { passive: true });
  addEventListener("resize", stackPages); stackPages();

  // 数字滚动
  const statIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    statIO.unobserve(e.target);
    $$("b[data-count]", e.target).forEach(b => {
      const n = +b.dataset.count, t0 = performance.now();
      (function tick(t) {
        const p = Math.min((t - t0) / 1400, 1), ease = 1 - Math.pow(1 - p, 4);
        b.textContent = Math.round(n * ease);
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    });
  }), { threshold: .4 });
  statIO.observe($("#hero-stats"));
})();

/* ─────────── 磁吸按钮 & 卡片倾斜 ─────────── */
(function tactile() {
  if (matchMedia("(pointer: coarse)").matches) return;
  $$(".magnetic").forEach(el => {
    const inner = el.querySelector("span") || el;
    el.addEventListener("mousemove", e => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - r.left - r.width / 2, dy = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${dx * .18}px,${dy * .22}px)`;
      inner.style.transform = `translate(${dx * .1}px,${dy * .12}px)`;
    });
    el.addEventListener("mouseleave", () => { el.style.transform = ""; inner.style.transform = ""; });
  });
  document.addEventListener("mousemove", e => {
    const card = e.target.closest && e.target.closest(".art-card");
    $$(".art-card").forEach(c => { if (c !== card) { c.style.setProperty("--rx", "0deg"); c.style.setProperty("--ry", "0deg"); } });
    if (!card) return;
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
    card.style.setProperty("--rx", (-py * 4) + "deg");
    card.style.setProperty("--ry", (px * 5) + "deg");
  });
})();

/* ─────────── 播放器：原生音频直出，避免 file:// WebAudio 静音 ─────────── */
const Player = (function () {
  const au = $("#main-audio"), bar = $("#player"), viz = $("#viz"), vctx = viz.getContext("2d"), list = window.PHI9_SONGS;
  let cur = -1, active = false, raf = 0;
  let context = null, analyser = null, bins = null, source = null, spectrumFailed = false;
  function prepareSpectrum() {
    if (spectrumFailed || location.protocol === "file:" || !(window.AudioContext || window.webkitAudioContext)) { viz.hidden = true; return Promise.resolve(false); }
    try {
      if (!context) {
        context = new (window.AudioContext || window.webkitAudioContext)();
        analyser = context.createAnalyser();
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = .75;
        bins = new Uint8Array(analyser.frequencyBinCount);
        source = context.createMediaElementSource(au);
        source.connect(analyser);
        analyser.connect(context.destination);
      }
      return context.resume().then(() => { viz.hidden = false; return true; }).catch(failSpectrum);
    } catch (err) { return Promise.resolve(failSpectrum(err)); }
  }
  function failSpectrum() {
    spectrumFailed = true;
    if (source) { try { source.disconnect(); } catch {} }
    try { au.crossOrigin = "anonymous"; au.load(); } catch {}
    analyser = null; source = null; context = null; viz.hidden = true;
    return false;
  }
  function ui() {
    const s = list[cur]; if (!s) return;
    $("#p-cover").src = s.art; $("#p-title").textContent = s.title; $("#p-sub").textContent = s.composer;
    $("#p-dl").href = s.wav; $("#p-dur").textContent = fmtT(s.duration);
    $$(".track").forEach(t => t.classList.toggle("playing", +t.dataset.i === cur));
    $$(".art-play").forEach(b => { const on = +b.dataset.i === cur; b.classList.toggle("playing", on); b.textContent = on && !au.paused ? "❚❚" : "▶"; });
    document.title = (au.paused ? "" : "♪ ") + s.title + " — 第九章 · 落幕纪念";
  }
  function draw() {
    raf = 0;
    if (!active || !analyser || viz.hidden || !bar.classList.contains("on")) return;
    const w = viz.clientWidth, h = viz.clientHeight, dpr = Math.min(devicePixelRatio || 1, 2);
    if (!w || !h) return;
    if (viz.width !== Math.round(w * dpr) || viz.height !== Math.round(h * dpr)) { viz.width = Math.round(w * dpr); viz.height = Math.round(h * dpr); }
    vctx.setTransform(dpr, 0, 0, dpr, 0, 0); vctx.clearRect(0, 0, w, h);
    analyser.getByteFrequencyData(bins);
    const n = Math.min(bins.length, Math.max(48, Math.floor(w / 5))), bw = w / n;
    for (let i = 0; i < n; i++) {
      const bin = bins[Math.floor(i * bins.length / n)] / 255;
      const bh = Math.max(1, h * bin);
      vctx.fillStyle = `rgba(156,205,245,${.2 + bin * .7})`;
      vctx.fillRect(i * bw + .5, h - bh, Math.max(1, bw - 1), bh);
    }
    raf = requestAnimationFrame(draw);
  }
  function startViz() { active = true; prepareSpectrum().then(ok => { if (ok && active && !raf) raf = requestAnimationFrame(draw); }); }
  function stopViz() { active = false; if (raf) cancelAnimationFrame(raf); raf = 0; vctx.clearRect(0, 0, viz.width, viz.height); }
  function play(i) {
    stopSfx();
    if (!Number.isInteger(i) || i < 0 || i >= list.length) return;
    if (i === cur && !au.paused) { au.pause(); return; }
    if (i !== cur) { cur = i; au.src = list[i].m4a; au.load(); }
    if (context && context.state === "suspended") context.resume().catch(() => {});
    bar.classList.add("on"); bar.setAttribute("aria-hidden", "false"); ui();
    prepareSpectrum();
    au.play().then(startViz).catch(err => { stopViz(); console.error("Audio playback failed:", err); });
  }
  au.addEventListener("play", () => { startViz(); ui(); $("#p-toggle").textContent = "❚❚"; });
  au.addEventListener("pause", () => { stopViz(); ui(); $("#p-toggle").textContent = "▶"; });
  au.addEventListener("ended", () => play((cur + 1) % list.length));
  au.addEventListener("timeupdate", () => { if (!au.duration) return; $("#p-seek-fill").style.width = `${au.currentTime / au.duration * 100}%`; $("#p-cur").textContent = fmtT(au.currentTime); });
  au.addEventListener("progress", () => { if (!au.duration || !au.buffered.length) return; const end = au.buffered.end(au.buffered.length - 1); $("#p-buf").style.width = `${Math.min(100, end / au.duration * 100)}%`; });
  $("#p-seek").addEventListener("click", e => { if (!au.duration) return; const r = e.currentTarget.getBoundingClientRect(); au.currentTime = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * au.duration; });
  $("#p-toggle").addEventListener("click", () => cur < 0 ? play(0) : au.paused ? play(cur) : au.pause());
  $("#p-prev").addEventListener("click", () => play((cur - 1 + list.length) % list.length));
  $("#p-next").addEventListener("click", () => play((cur + 1) % list.length));
  $("#p-close").addEventListener("click", () => { au.pause(); bar.classList.remove("on"); });
  return { play, get cur() { return cur; } };
})();

/* ─────────── 音效（全局单实例，与主播放器互斥） ─────────── */
let sfxAu = null, sfxChip = null;
function stopSfx() {
  if (sfxAu) { sfxAu.pause(); sfxAu = null; }
  if (sfxChip) { sfxChip.classList.remove("playing"); $(".sfx-btn", sfxChip).textContent = "▶"; $(".sfx-wave", sfxChip).style.width = 0; sfxChip = null; }
}
function playSfx(chip, file) {
  if (sfxChip === chip) { stopSfx(); return; }
  stopSfx();
  $("#main-audio").pause();
  sfxAu = new Audio(encodeURI(file));
  sfxChip = chip; chip.classList.add("playing");
  $(".sfx-btn", chip).textContent = "❚❚";
  const wave = $(".sfx-wave", chip);
  sfxAu.addEventListener("timeupdate", () => { if (sfxAu && sfxAu.duration) wave.style.width = (sfxAu.currentTime / sfxAu.duration * 100) + "%"; });
  sfxAu.addEventListener("ended", stopSfx);
  sfxAu.play().catch(stopSfx);
}

/* ─────────── 灯箱 ─────────── */
const Lightbox = (function () {
  const lb = $("#lightbox"), img = $("#lb-img"), ttl = $("#lb-title"), sub = $("#lb-sub"), dl = $("#lb-dl");
  let items = [], idx = 0;
  function show() {
    const it = items[idx];
    img.src = it.src; img.alt = it.title;
    ttl.textContent = it.title; sub.textContent = it.sub || "";
    dl.href = it.src; dl.setAttribute("download", it.src.split("/").pop());
    dl.querySelector("span").textContent = "下载原图 ↓ " + (it.size || "");
  }
  function open(list, i) { items = list; idx = i; show(); lb.classList.add("open"); }
  function move(d) { idx = (idx + d + items.length) % items.length;
    img.style.opacity = 0; setTimeout(() => { show(); img.style.opacity = 1; }, 140); }
  $(".lb-nav.prev").addEventListener("click", e => { e.stopPropagation(); move(-1); });
  $(".lb-nav.next").addEventListener("click", e => { e.stopPropagation(); move(1); });
  return { open, move };
})();
function closeModals() { $$(".modal").forEach(m => m.classList.remove("open")); }
$$(".modal").forEach(m => m.addEventListener("click", e => { if (e.target === m || e.target.closest("[data-close]")) closeModals(); }));
addEventListener("keydown", e => {
  if (e.key === "Escape") closeModals();
  if ($("#lightbox").classList.contains("open")) {
    if (e.key === "ArrowLeft") Lightbox.move(-1);
    if (e.key === "ArrowRight") Lightbox.move(1);
  }
});

/* ─────────── Scroll-led evidence sequence ─────────── */
(function decryptionSequence() {
  const story = $("#decrypt-story"), beats = $$(".decrypt-beat"), fill = $("#decrypt-progress-fill");
  if (!story || !beats.length) return;
  let raf = 0;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const stageIndex = $("#decrypt-stage-index");
  const stage = $(".decrypt-stage"), flash = $(".stage-flash");
  let lastActive = -1, impactFired = false;
  beats.forEach((beat, i) => { beat.dataset.num = String(i + 1).padStart(2, "0"); });
  const fragments = $$(".fragment-grid i");
  fragments.forEach(row => {
    const chars = [...row.textContent];
    row.textContent = "";
    chars.forEach((ch, column) => {
      const cell = document.createElement("span");
      cell.textContent = ch;
      cell.className = column === chars.length - 1 ? "fragment-tail" : "fragment-cell";
      row.appendChild(cell);
    });
  });
  const numbers = [56,75,65,76,35,56,75,63,97,66,67,47,72];
  const key = [31,32,53,43,12,14];
  const grid = "PSZLMYQEBJARTFCHNUGVKDOXW";
  const operations = $("#nihilist-operations");
  numbers.forEach((number, i) => {
    const coordinate = number - key[i % key.length];
    const row = Math.floor(coordinate / 10), col = coordinate % 10;
    const letter = grid[(row - 1) * 5 + col - 1] || "?";
    const step = document.createElement("span");
    step.className = "operation-step";
    step.style.setProperty("--n", i);
    step.textContent = `${number} − ${key[i % key.length]} = ${coordinate} → ${letter}`;
    operations.appendChild(step);
  });
  const solution = document.createElement("strong");
  solution.textContent = [...operations.querySelectorAll(".operation-step")].map(step => step.textContent.split("→ ").pop()).join("");
  operations.append(document.createElement("br"), solution);
  function render() {
    raf = 0;
    const vh = innerHeight, sr = story.getBoundingClientRect();
    const travel = Math.max(1, sr.height - vh);
    const progress = clamp(-sr.top / travel, 0, 1);
    const boundaries = [0, .10, .34, .50, .62, .74, .90, 1];
    const nextBoundary = boundaries.findIndex((end, i) => i > 0 && progress < end);
    const activeIndex = nextBoundary < 0 ? beats.length - 1 : nextBoundary - 1;
    const local = clamp((progress - boundaries[activeIndex]) / (boundaries[activeIndex + 1] - boundaries[activeIndex]), 0, 1);
    if (activeIndex === 1) {
      const transform = beats[1].querySelector(".fft-original");
      transform?.style.setProperty("--reveal", String(local));
      beats[1].classList.toggle("to-fragments", progress > .32);
    }
    if (activeIndex !== lastActive) {
      if (flash) { flash.classList.remove("go"); void flash.offsetWidth; flash.classList.add("go"); }
      impactFired = false;
      lastActive = activeIndex;
    }
    if (!impactFired && local > .8) impactFired = true;
    beats.forEach((beat, i) => {
      let reveal = i === activeIndex ? local : (i < activeIndex ? 1 : 0);
      if (i === 2) reveal = activeIndex === 1 ? clamp((progress - .28) / .06, 0, .98) : reveal;
      beat.style.setProperty("--reveal", reveal.toFixed(3));
      beat.classList.toggle("is-active", i === activeIndex);
      beat.classList.toggle("impact", i === activeIndex && impactFired);
    });
    if (fill) {
      fill.style.transform = `scale${innerWidth <= 850 ? "X" : "Y"}(${progress})`;
    }
    if (stageIndex) {
      const label = `${String(activeIndex + 1).padStart(2, "0")} / ${String(beats.length).padStart(2, "0")}`;
      if (stageIndex.textContent !== label) {
        stageIndex.textContent = label;
        stageIndex.classList.remove("tick"); void stageIndex.offsetWidth; stageIndex.classList.add("tick");
      }
    }
  }
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(render); };
  addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll); render();
})();

/* ─────────── 曲绘回廊 ─────────── */
(function gallery() {
  const grid = $("#gallery-grid");
  const lbItems = [];
  window.PHI9_SONGS.forEach((s, i) => {
    lbItems.push({ src: s.art, title: s.title, sub: `${s.composer} · 插画 ${s.illustrator} · 2048×1080`, size: s.artSize });
    const card = document.createElement("article");
    card.className = "art-card reveal";
    card.innerHTML = `
      <div class="art-thumb"><img loading="lazy" decoding="async" src="${s.art}" alt="${s.title} 曲绘">
        <button class="art-play mono" data-i="${i}" aria-label="播放 ${s.title}">▶</button></div>
      <div class="art-info">
        <span class="art-no">TRACK ${String(s.no).padStart(2, "0")}</span>
        <h3>${s.title}</h3>
        <p class="mono">${s.composer}<br>插画 ${s.illustrator} · ${fmtT(s.duration)}</p>
        <div class="art-acts">
          <a class="act gold" href="${s.art}" download>原图 PNG · ${s.artSize}</a>
          <a class="act" href="${s.wav}" download>音乐 WAV · ${s.wavSize}</a>
          <a class="act" href="${s.m4a}" download>AAC · ${s.m4aSize}</a>
        </div>
      </div>`;
    card.querySelector(".art-thumb").addEventListener("click", e => {
      if (e.target.closest(".art-play")) return;
      Lightbox.open(lbItems, i);
    });
    card.querySelector(".art-play").addEventListener("click", () => Player.play(i));
    grid.appendChild(card);
    window.__reveal(card);
    card.style.transitionDelay = (i % 2) * 90 + "ms";
  });
})();

/* ─────────── 音乐厅 ─────────── */
(function music() {
  const ol = $("#track-list");
  const slot = $("#archive-slot"), slotCount = $("#archive-slot-count");
  let savedItems = [];
  try { savedItems = JSON.parse(localStorage.getItem("phi9-archive") || "[]"); } catch {}
  const saved = new Set(savedItems.filter(i => Number.isInteger(i) && i >= 0 && i < window.PHI9_SONGS.length));
  function persist() { localStorage.setItem("phi9-archive", JSON.stringify([...saved])); }
  function renderSlot() {
    slot.replaceChildren();
    slotCount.textContent = `${saved.size} / 12`;
    if (!saved.size) { const empty = document.createElement("span"); empty.className = "archive-empty mono"; empty.textContent = "将曲目收进这里"; slot.appendChild(empty); return; }
    saved.forEach(i => {
      const s = window.PHI9_SONGS[i]; if (!s) return;
      const chip = document.createElement("button"); chip.className = "archive-item mono"; chip.dataset.i = i; chip.textContent = `${String(s.no).padStart(2,"0")}　${s.title}　↗`; chip.setAttribute("aria-label", `取出并播放 ${s.title}`); chip.addEventListener("click", () => { saved.delete(i); persist(); renderSlot(); Player.play(i); }); slot.appendChild(chip);
    });
  }
  function storeTrack(i) { if (saved.has(i)) return; saved.add(i); persist(); renderSlot(); const row = $(`.track[data-i="${i}"]`); if (row) { row.classList.add("stored"); setTimeout(() => row.classList.remove("stored"), 700); } }
  renderSlot();
  slot.addEventListener("dragover", e => { e.preventDefault(); slot.classList.add("drop-ready"); });
  slot.addEventListener("dragleave", e => { if (!slot.contains(e.relatedTarget)) slot.classList.remove("drop-ready"); });
  slot.addEventListener("drop", e => { e.preventDefault(); slot.classList.remove("drop-ready"); const i = Number(e.dataTransfer.getData("text/plain")); if (Number.isInteger(i) && i >= 0 && i < window.PHI9_SONGS.length) storeTrack(i); });
  window.PHI9_SONGS.forEach((s, i) => {
    const li = document.createElement("li");
    li.className = "track reveal"; li.dataset.i = i; li.draggable = true; li.tabIndex = 0; li.setAttribute("aria-label", `${s.title}，回车加入收藏，空格播放`);
    li.innerHTML = `
      <span class="t-idx">${String(s.no).padStart(2, "0")}</span>
      <span class="t-cover"><img loading="lazy" decoding="async" src="${s.art}" alt=""></span>
      <span class="t-main">
        <span class="t-title">${s.title}</span>
        <span class="t-sub">${s.composer} · 插画 ${s.illustrator}</span>
      </span>
      <span class="t-dur">${fmtT(s.duration)}</span>
      <span class="t-acts">
        <button class="t-btn play" data-i="${i}">▶ 试听</button>
        <button class="t-btn store" type="button" aria-label="收纳 ${s.title}">＋</button>
        <a class="t-btn" href="${s.wav}" download>WAV</a>
        <a class="t-btn" href="${s.m4a}" download>AAC</a>
      </span>`;
    li.querySelector(".t-btn.play").addEventListener("click", () => Player.play(i));
    li.querySelector(".t-btn.store").addEventListener("click", () => storeTrack(i));
    li.querySelector(".t-cover").addEventListener("click", () => Player.play(i));
    li.addEventListener("dragstart", e => { e.dataTransfer.setData("text/plain", String(i)); e.dataTransfer.effectAllowed = "copy"; li.classList.add("dragging"); });
    li.addEventListener("dragend", () => li.classList.remove("dragging"));
    li.addEventListener("keydown", e => { if (e.target !== li) return; if (e.key === "Enter") { e.preventDefault(); storeTrack(i); } else if (e.key === " ") { e.preventDefault(); Player.play(i); } });
    li.addEventListener("dblclick", () => storeTrack(i));
    ol.appendChild(li);
    window.__reveal(li);
  });
})();

/* ─────────── 浏览器内打包：零依赖 ZIP 写入器（STORE 直存 · CRC32 · UTF-8 文件名） ─────────── */
(function batchPacker() {
  const CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) { let c = i; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[i] = c; }
    return t;
  })();
  function crc32(view) {
    let crc = -1;
    for (let i = 0; i < view.length; i++) crc = CRC_TABLE[(crc ^ view[i]) & 255] ^ (crc >>> 8);
    return (crc ^ -1) >>> 0;
  }
  function buildZip(entries) {
    const now = new Date();
    const time = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >>> 1);
    const date = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
    const enc = new TextEncoder();
    const parts = [], central = [];
    let offset = 0;
    for (const e of entries) {
      const name = enc.encode(e.name);
      const size = e.data.byteLength;
      const lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0, 0x04034b50, true);   // local file header signature
      lh.setUint16(4, 20, true);            // version needed
      lh.setUint16(6, 0x0800, true);        // flags: UTF-8 filename (ハテ 等)
      lh.setUint16(8, 0, true);             // method: STORE
      lh.setUint16(10, time, true); lh.setUint16(12, date, true);
      lh.setUint32(14, e.crc, true);
      lh.setUint32(18, size, true); lh.setUint32(22, size, true);
      lh.setUint16(26, name.length, true);
      parts.push(new Uint8Array(lh.buffer), name, new Uint8Array(e.data));
      const ch = new DataView(new ArrayBuffer(46));
      ch.setUint32(0, 0x02014b50, true);     // central directory signature
      ch.setUint16(4, 20, true); ch.setUint16(6, 20, true);
      ch.setUint16(8, 0x0800, true); ch.setUint16(10, 0, true);
      ch.setUint16(12, time, true); ch.setUint16(14, date, true);
      ch.setUint32(16, e.crc, true);
      ch.setUint32(20, size, true); ch.setUint32(24, size, true);
      ch.setUint16(28, name.length, true);
      ch.setUint32(38, 0, true);             // external attrs
      ch.setUint32(42, offset, true);        // local header offset
      central.push(new Uint8Array(ch.buffer), name);
      offset += 30 + name.length + size;
    }
    let cdSize = 0;
    for (const c of central) cdSize += c.byteLength;
    const eocd = new DataView(new ArrayBuffer(22));
    eocd.setUint32(0, 0x06054b50, true);    // end of central directory
    eocd.setUint16(8, entries.length, true); eocd.setUint16(10, entries.length, true);
    eocd.setUint32(12, cdSize, true); eocd.setUint32(16, offset, true);
    return new Blob([...parts, ...central, new Uint8Array(eocd.buffer)], { type: "application/zip" });
  }
  const basename = p => p.split("/").pop();
  const PACKS = {
    wav: { name: "Chapter9_Music_Full_WAV.zip", files: () => window.PHI9_SONGS.map(s => s.wav) },
    aac: { name: "Chapter9_Music_AAC256.zip", files: () => window.PHI9_SONGS.map(s => s.m4a) },
    art: { name: "Chapter9_曲绘全集_2048px_PNG.zip", files: () => window.PHI9_SONGS.map(s => s.art) },
    sfx: { name: "Chapter9_音效全集_原版WAV.zip", files: () => window.PHI9_SFX.items.map(i => i.file) },
    story: { name: "Chapter9_剧情原画集_PNG.zip", files: () => [
      ...window.PHI9_STORY.map(x => x.img),
      "assets/img/story/ILLUS_AboutTheUniverse.SOTUIMIssionary.0_2048x1080.png",
      "assets/img/story/ILLUS_Ametrine.GRYSCLMIssionary.0_2048x1080.png",
      "assets/img/story/ILLUS_DesultorySignals.technoplanet.0_2048x1080.png",
      "assets/img/story/ILLUS_EntrancetotheChaos.打打だいずvssiromaru.0_2048x1080.png",
      "assets/img/story/ILLUS_Evanescent.LeaF.0_2048x1080.png",
      "assets/img/story/ILLUS_ExoplanetaryMirage.かめりあ.0_2048x1080.png",
      "assets/img/story/ILLUS_Implexrough.Silentroommommy.0_2048x1080.png",
      "assets/img/story/ILLUS_Message.くるぶっこちゃん.0_2048x1080.png",
      "assets/img/story/ILLUS_Petrichor.voidMournfinale.0_2048x1080.png",
      "assets/img/story/ILLUS_TrueHomeTrueWorldRework.816ThreeNumbers.0_2048x1080.png",
      "assets/img/story/ILLUS_ハテ.rNFrums.0_2048x1080.png"
    ] }
  };
  const running = new Set();
  async function run(btn) {
    const pack = PACKS[btn.dataset.pack];
    if (!pack || running.has(btn)) return;
    running.add(btn);
    btn.classList.add("packing");
    const status = btn.querySelector(".batch-go") || btn.querySelector("span");
    const original = status ? status.textContent : "";
    try {
      if (location.protocol === "file:") throw new Error("file:// 无法读取打包资源，请通过 HTTP 访问");
      const files = pack.files();
      const entries = [];
      let loaded = 0;
      for (let i = 0; i < files.length; i++) {
        const res = await fetch(files[i]);
        if (!res.ok) throw new Error(`${files[i]} → HTTP ${res.status}`);
        const data = await res.arrayBuffer();
        loaded += data.byteLength;
        entries.push({ name: basename(files[i]), data, crc: crc32(new Uint8Array(data)) });
        if (status) status.textContent = `获取 ${i + 1}/${files.length} · ${(loaded / 1048576).toFixed(1)} MB`;
      }
      if (status) status.textContent = "打包中 …";
      await new Promise(r => requestAnimationFrame(() => r()));
      const blob = buildZip(entries);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = pack.name;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      if (status) status.textContent = `完成 · ${(blob.size / 1048576).toFixed(0)} MB ↓`;
    } catch (err) {
      console.error("Pack failed:", err);
      btn.classList.add("pack-error");
      if (status) status.textContent = "打包失败 · 请重试";
    } finally {
      btn.classList.remove("packing");
      running.delete(btn);
      if (status && original && !btn.classList.contains("pack-error")) setTimeout(() => { status.textContent = original; }, 5000);
      setTimeout(() => btn.classList.remove("pack-error"), 3000);
    }
  }
  $$("[data-pack]").forEach(b => b.addEventListener("click", () => run(b)));
})();

/* ─────────── 收藏品档案馆 ─────────── */
(function collections() {
  // 选项卡
  $$("#coll-tabs .tab").forEach(t => t.addEventListener("click", () => {
    $$("#coll-tabs .tab").forEach(x => x.classList.toggle("active", x === t));
    $("#pane-art").classList.toggle("active", t.dataset.tab === "art");
    $("#pane-archive").classList.toggle("active", t.dataset.tab === "archive");
  }));

  // 剧情原画
  const sg = $("#story-grid");
  const lbItems = window.PHI9_STORY.map(x => ({ src: x.img, title: x.title, sub: `${x.res} · ${x.size}`, size: x.size }));
  const KIND = { art: "演绎原画", cover: "章节封面", secret: "SECRET", misc: "档案" };
  window.PHI9_STORY.forEach((x, i) => {
    const c = document.createElement("article");
    c.className = "story-card reveal";
    c.innerHTML = `
      <figure><img loading="lazy" decoding="async" src="${x.img}" alt="${x.title}"></figure>
      <div class="story-meta">
        <span class="kind ${x.kind}">${KIND[x.kind] || x.kind}</span>
        <b>${x.title}</b>
        <span class="res">${x.res}</span>
        <a class="sfx-dl" href="${x.img}" download title="下载原图">↓</a>
      </div>`;
    c.querySelector("figure").addEventListener("click", () => Lightbox.open(lbItems, i));
    sg.appendChild(c);
    window.__reveal(c);
  });

  // 档案全录
  const { catLabel, items } = window.PHI9_COLLECTIONS;
  const chipsEl = $("#archive-chips"), listEl = $("#archive-list"),
        countEl = $("#archive-count"), moreBtn = $("#archive-more"),
        searchEl = $("#archive-search");
  const cats = ["all", "main", "bold", "key", "souvenir", "nonsense", "nazo"];
  let fCat = "all", fQ = "", shown = 0, filtered = items;
  const STEP = 60;
  cats.forEach(c => {
    const b = document.createElement("button");
    b.className = "chip" + (c === "all" ? " active" : "");
    b.textContent = c === "all" ? "全部" : catLabel[c];
    b.addEventListener("click", () => {
      fCat = c; shown = 0;
      $$(".chip", chipsEl).forEach(x => x.classList.toggle("active", x === b));
      apply();
    });
    chipsEl.appendChild(b);
  });
  let deb = null;
  searchEl.addEventListener("input", () => {
    clearTimeout(deb);
    deb = setTimeout(() => { fQ = searchEl.value.trim().toLowerCase(); shown = 0; apply(); }, 160);
  });
  function apply() {
    filtered = items.filter(x =>
      (fCat === "all" || x.cat === fCat) &&
      (!fQ || (x.name + x.en + x.content + x.sup + x.key).toLowerCase().includes(fQ)));
    listEl.innerHTML = ""; shown = 0; more();
  }
  function more() {
    const slice = filtered.slice(shown, shown + STEP);
    for (const x of slice) {
      const row = document.createElement("div");
      row.className = "arch-row";
      row.innerHTML = `
        <span class="arch-idx">#${String(x.i).padStart(3, "0")}</span>
        <span class="arch-name">${escapeH(x.name)}<small>${escapeH(x.en)}　主管 ${escapeH(x.sup || "—")}</small></span>
        <span class="arch-date">${escapeH(x.date)}</span>
        <span class="badge ${x.cat}">${catLabel[x.cat] || x.cat}</span>`;
      row.addEventListener("click", () => openReader(x));
      listEl.appendChild(row);
    }
    shown += slice.length;
    countEl.textContent = `共 ${filtered.length} 条档案 · 已展出 ${shown} 条`;
    moreBtn.parentElement.style.display = shown < filtered.length ? "" : "none";
  }
  moreBtn.addEventListener("click", more);
  function escapeH(s) { return String(s).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])); }
  function openReader(x) {
    $("#reader-file").textContent = `FILE #${String(x.i).padStart(3, "0")} · ${x.key} · sub${x.sub} · ${catLabel[x.cat] || x.cat}`;
    $("#reader-title").textContent = x.name;
    $("#reader-meta").textContent = `DATE ${x.date || "——"} · SUPERVISOR ${x.sup || "——"}${x.en ? " · " + x.en : ""}`;
    $("#reader-body").textContent = x.content || "（本条档案无正文）";
    $("#reader").classList.add("open");
  }
  apply();
})();

/* ─────────── 音效实验室 ─────────── */
(function sfxLab() {
  const { groups, items } = window.PHI9_SFX;
  const order = ["tap", "ui", "puzzle", "password", "story", "ambient", "secret", "misc"];
  const wrap = $("#sfx-groups");
  const chipsAll = [];
  order.forEach(g => {
    const list = items.filter(x => x.group === g);
    if (!list.length) return;
    const sec = document.createElement("div");
    sec.className = "sfx-group reveal";
    sec.innerHTML = `<div class="sfx-group-title"><h3>${groups[g]}</h3><span>${list.length} CLIPS</span></div>`;
    const grid = document.createElement("div");
    grid.className = "sfx-grid";
    list.forEach(x => {
      const chip = document.createElement("div");
      chip.className = "sfx-chip";
      chip.innerHTML = `
        <button class="sfx-btn mono" aria-label="试听 ${x.name}">▶</button>
        <span class="sfx-info"><span class="sfx-name">${x.name}</span>
        <span class="sfx-meta">${x.size} · WAV 原版</span></span>
        <a class="sfx-dl" href="${encodeURI(x.file)}" download title="下载">↓</a>
        <i class="sfx-wave"></i>`;
      chip.querySelector(".sfx-btn").addEventListener("click", () => playSfx(chip, x.file));
      chip.dataset.file = x.file;
      grid.appendChild(chip);
      chipsAll.push(chip);
    });
    sec.appendChild(grid);
    wrap.appendChild(sec);
    window.__reveal(sec);
  });
  $("#sfx-random").addEventListener("click", () => {
    const chip = chipsAll[Math.random() * chipsAll.length | 0];
    chip.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => playSfx(chip, chip.dataset.file), 450);
  });
})();

/* ─────────── Error feedback & download polish ─────────── */
$("#main-audio").addEventListener("error", () => {
  const au = $("#main-audio"), msg = au.error ? `音频加载失败（${au.error.code}），请检查文件是否完整。` : "音频加载失败，请检查本地文件。";
  $("#p-title").textContent = msg;
  $("#p-toggle").textContent = "!";
});

/* ─────────── 致谢跑马灯（无缝） ─────────── */
(function marquee() {
  const t = $("#marquee-track");
  const set = t.innerHTML;
  t.innerHTML = set + set;
  while (t.scrollWidth / 2 < innerWidth) t.innerHTML += t.innerHTML;
})();
