#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成纪念站数据文件：曲绘/音乐、音效、收藏品、剧情原画。"""
import json, os, re

ROOT = "/Users/wujian/Documents/Phi9"
SITE = os.path.join(ROOT, "Phi9-Memorial")
JS = os.path.join(SITE, "assets", "js")

# ---------- 1. 曲目 ----------
SONGS = [
    # (file base, title, composer, illustrator)
    ("AboutTheUniverse", "About The Universe", "SOTUI & MIssionary", "MC大神knife美工刀"),
    ("Implexrough", "Implexrough", "Silentroom × mommy", "Nate"),
    ("Evanescent", "Evanescent", "LeaF", "海产 feat. 佑木いずみ"),
    ("EntrancetotheChaos", "Entrance to the Chaos", "打打だいず vs. siromaru", "群青kurara"),
    ("ExoplanetaryMirage", "Exoplanetary Mirage", "Camellia (かめりあ)", "神居冰绘 feat. 祈莲"),
    ("TrueHomeTrueWorldRework", "True Home, True World (Rework)", "816ThreeNumbers", "PEZZ"),
    ("Ametrine", "Ametrine", "GRYSCL & MIssionary", "子狼"),
    ("Petrichor", "Petrichor", "void (Mournfinale)", "青鸟 feat. 祈莲"),
    ("ハテ", "ハテ", "rN || Frums", "宙風みけ || rN"),
    ("DesultorySignals", "Desultory Signals", "technoplanet", "月光大刺剑"),
    ("Message", "Message", "くるぶっこちゃん", "神居冰绘 feat. 祈莲"),
    ("WhatdoyouwantmorethanaHappyending", "What do you want more than a Happy ending?",
     'Apo11o"HALO"program ft. 安月名莉子 × 大瀬良あい', "Amor fati"),
]
wavdur = json.load(open(os.path.join(ROOT, "c9_songs/work/wavdur.json")))
dur_by_base = {k.split(".")[0]: v for k, v in wavdur.items()}

def sz(p):
    return os.path.getsize(p)

def fmt_size(n):
    return f"{n/1048576:.1f} MB" if n >= 1048576 else f"{n/1024:.0f} KB"

songs = []
for i, (base, title, comp, illus) in enumerate(SONGS, 1):
    wav = os.path.join(SITE, f"assets/audio/music/{base}.wav")
    m4a = os.path.join(SITE, f"assets/audio/music/{base}.m4a")
    img = os.path.join(SITE, f"assets/img/illus/{base}.png")
    d = dur_by_base.get(base, 0)
    songs.append({
        "no": i, "id": base, "title": title, "composer": comp, "illustrator": illus,
        "duration": round(d, 2),
        "art": f"assets/img/illus/{base}.png",
        "wav": f"assets/audio/music/{base}.wav",
        "m4a": f"assets/audio/music/{base}.m4a",
        "wavSize": fmt_size(sz(wav)), "m4aSize": fmt_size(sz(m4a)), "artSize": fmt_size(sz(img)),
    })

# ---------- 2. 音效 ----------
SFX_DIR = os.path.join(SITE, "assets/audio/sfx")

GROUPS = {
    "tap": "打击音",
    "ui": "界面与系统",
    "puzzle": "拼图机关",
    "password": "密码与推演",
    "story": "演绎与转场",
    "ambient": "氛围与音乐",
    "secret": "秘密包",
    "misc": "其他",
}

def classify(name):
    n = name.lower()
    if name.startswith("secret_"):
        return "secret"
    if re.search(r"tap\d|hitsong|calibration", n):
        return "tap"
    if "拼图" in name:
        return "puzzle"
    if "密码" in name or "课题组" in name:
        return "password"
    if "演绎" in name or "地图解锁" in name:
        return "story"
    if any(k in n for k in ("ambient", "bg_loop", "bgm", "氛围音乐")):
        return "ambient"
    return "ui"

PRETTY = {
    "main_Tap1": "打击音 1", "main_Tap2": "打击音 2", "main_Tap3": "打击音 3",
    "main_Tap4": "打击音 4", "main_Tap5": "打击音 5", "main_Tap6": "打击音 6",
    "main_Tap7": "打击音 7（长）",
    "main_HitSong0": "击打反馈 1", "main_HitSong1": "击打反馈 2", "main_HitSong2": "击打反馈 3",
    "main_Calibration": "延迟校准", "main_CalibrationHit": "校准命中",
    "main_ChapterSelect0": "章节选择界面 BGM",
    "main_Clock": "钟摆声",
    "main_FakeAboutUs0": "伪·关于我们",
    "main_IgalltaUnlock0": "魔王曲解锁",
    "main_Message": "通讯提示音",
    "main_NewSplashSceneBGM": "新启动页 BGM（完整）",
    "main_SplashScene4BGM": "启动页 BGM 4（完整）",
    "main_openChapter9": "开启第九章",
    "main_openSaturnOS": "开启 SaturnOS",
    "main_songInfoHide": "歌曲信息·收起",
    "main_songInfoShow": "歌曲信息·展开",
    "main_地图解锁": "地图解锁",
    "main_地图解锁_包含蓄力_": "地图解锁（含蓄力）",
    "main_拼图单击选择图块": "拼图·选取图块",
    "main_拼图完成后环境音循环": "拼图完成后·环境音循环",
    "main_拼图弹出确认窗口音效": "拼图·确认窗口弹出",
    "main_拼图拼单个图块": "拼图·拼合单块",
    "main_拼图拼最后一个图块": "拼图·拼合最后一块",
    "main_拼图点击继续故障音": "拼图·点击继续（故障音）",
    "main_收集品关闭": "收集品·关闭",
    "main_收集品打开": "收集品·打开",
    "main_文字浮现音效": "文字浮现",
    "main_歌曲详情关闭": "歌曲详情·关闭",
    "main_歌曲详情打开": "歌曲详情·打开",
    "main_演绎背景环境音": "演绎·背景环境音",
    "main_演绎转场音_1": "演绎·转场音 1",
    "main_演绎转场音_2_火车音效": "演绎·转场音 2（火车）",
    "main_演绎转场音_3_靴子": "演绎·转场音 3（靴音）",
    "main_演绎转场音_4": "演绎·转场音 4",
    "main_表包氛围音乐": "表包·氛围音乐",
    "main_里包氛围音乐": "里包·氛围音乐",
    "main_课题组开始游戏音效_可能是密码错误音效": "课题组·开始游戏（疑似密码错误音）",
    "main_输入密码音效": "输入密码",
    "secret_music": "秘密包·音乐",
    "secret_文字浮现音效": "秘密包·文字浮现",
    "secret_黑洞音效_故障背景音_": "秘密包·黑洞（故障背景音）",
    "secret_黑洞音效_转场_": "秘密包·黑洞（转场）",
}

sfx = []
for fn in sorted(os.listdir(SFX_DIR)):
    if not fn.endswith(".wav"):
        continue
    base = fn[:-4]
    p = os.path.join(SFX_DIR, fn)
    sfx.append({
        "file": f"assets/audio/sfx/{fn}",
        "raw": base,
        "name": PRETTY.get(base, base.replace("main_", "").replace("secret_", "秘密包·")),
        "group": classify(base),
        "size": fmt_size(sz(p)),
    })

# ---------- 3. 收藏品 ----------
coll = json.load(open(os.path.join(ROOT, "c9_collection_full.json")))
CAT_LABEL = {"main": "主线", "bold": "着重", "souvenir": "纪念", "key": "关键", "nonsense": "杂记", "nazo": "谜题"}

def clean(s):
    if not s:
        return ""
    return s.replace("\\n", "\n").strip()

collections = []
name_of = {}   # (key, subIndex) -> zh name, 供剧情原画命名
idx = 0
for src, items in coll.items():
    for it in items:
        idx += 1
        names = it.get("name") or []
        sups = it.get("supervisor") or []
        conts = it.get("content") or []
        zh_name = clean(names[1]) if len(names) > 1 else (names[0] if names else "")
        en_name = clean(names[3]) if len(names) > 3 else ""
        zh_sup = clean(sups[1]) if len(sups) > 1 else ""
        zh_cont = clean(conts[1]) if len(conts) > 1 else ""
        entry = {
            "i": idx, "key": it.get("key", ""), "sub": it.get("subIndex", 1),
            "name": zh_name or en_name, "en": en_name,
            "date": it.get("date", ""), "sup": zh_sup,
            "cat": it.get("category", ""), "content": zh_cont,
        }
        collections.append(entry)
        name_of[(entry["key"], entry["sub"])] = entry["name"]

# ---------- 4. 剧情原画 ----------
STORY_DIR = os.path.join(SITE, "assets/img/story")
story = []
for fn in sorted(os.listdir(STORY_DIR)):
    if not fn.endswith(".png"):
        continue
    m = re.match(r"ART_([a-zA-Z0-9]+?)(\d+)\.jpg_(\d+)x(\d+)\.png", fn)
    if m:
        key, sub, w, h = m.group(1), int(m.group(2)) + 1, m.group(3), m.group(4)
        title = name_of.get((key, sub)) or name_of.get((key, 1)) or key
        kind = "art"
    elif fn.startswith("CHAPTER_"):
        title, w, h, kind = "第九章主线封面", 1024, 540, "cover"
        if "_2" in fn:
            title = "第九章主线封面·II"
    elif fn.startswith("SECRET_CollectionHeader"):
        title, w, h, kind = "收藏馆页眉", 2048, 1152, "secret"
    elif fn.startswith("SECRET_IllustrationBlur"):
        title, w, h, kind = "曲绘残影（模糊态）", 256, 135, "secret"
    elif fn.startswith("ILLUS_"):
        continue  # 曲绘已在曲绘区
    else:
        title, w, h, kind = fn, 0, 0, "misc"
    p = os.path.join(STORY_DIR, fn)
    story.append({"img": f"assets/img/story/{fn}", "title": title,
                  "res": f"{w}×{h}", "size": fmt_size(sz(p)), "kind": kind})

# ---------- 5. 写文件 ----------
def dump(name, obj):
    path = os.path.join(JS, name)
    with open(path, "w", encoding="utf-8") as f:
        f.write("window." + name.replace("data-", "PHI9_").replace(".js", "").upper()
                + " = " + json.dumps(obj, ensure_ascii=False) + ";\n")
    print(name+'.js', os.path.getsize(path)//1024, "KB")

dump("data-songs", songs)
dump("data-sfx", {"groups": GROUPS, "items": sfx})
dump("data-collections", {"catLabel": CAT_LABEL, "items": collections})
dump("data-story", story)
print("songs", len(songs), "sfx", len(sfx), "collections", len(collections), "story", len(story))
