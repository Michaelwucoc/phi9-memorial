#!/usr/bin/env python3
"""分片工具：把超过静态托管平台单文件上限（Cloudflare Pages 25MiB）的资产切片入库。

- 阈值：> 24MiB 的文件分片（留安全余量，24–25MiB 之间不整存）
- 切片：20MiB/片，写入 assets/chunks/<原相对路径>.NNN
- 清单：assets/js/data-chunks.js —— window.PHI9_CHUNKS = { 原路径: {size, crc, parts} }
- 安全：重组后 SHA-256 与原件逐字节核对通过才删除原件

浏览器端（main.js）按清单抓取分片、拼接、CRC32 校验后原样还原。
"""
import hashlib
import json
import os
import zlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "assets")
CHUNK_DIR = os.path.join(ASSETS, "chunks")
SKIP_DIRS = {CHUNK_DIR, os.path.join(ASSETS, "zip")}  # zip 已 gitignore，仅本地对照用
THRESHOLD = 24 * 1024 * 1024
CHUNK = 20 * 1024 * 1024


def main() -> None:
    manifest = {}
    for dirpath, dirnames, files in os.walk(ASSETS):
        dirnames[:] = [d for d in dirnames if os.path.join(dirpath, d) not in SKIP_DIRS]
        for name in sorted(files):
            full = os.path.join(dirpath, name)
            size = os.path.getsize(full)
            if size <= THRESHOLD:
                continue
            rel = os.path.relpath(full, ASSETS)
            key = "assets/" + rel.replace(os.sep, "/")
            data = open(full, "rb").read()
            digest = hashlib.sha256(data).hexdigest()
            crc = zlib.crc32(data) & 0xFFFFFFFF
            outdir = os.path.join(CHUNK_DIR, os.path.dirname(rel))
            os.makedirs(outdir, exist_ok=True)
            parts = []
            for idx in range(0, size, CHUNK):
                part_path = os.path.join(outdir, f"{name}.{len(parts):03d}")
                with open(part_path, "wb") as f:
                    f.write(data[idx:idx + CHUNK])
                parts.append(os.path.relpath(part_path, ROOT).replace(os.sep, "/"))
            # 重组核对：逐字节等价才删除原件
            rebuilt = b"".join(open(os.path.join(ROOT, p), "rb").read() for p in parts)
            assert hashlib.sha256(rebuilt).hexdigest() == digest, f"重组校验失败: {rel}"
            assert len(rebuilt) == size
            manifest[key] = {"size": size, "crc": crc, "parts": parts}
            os.remove(full)
            print(f"chunked {key}  {size/1048576:.1f}MiB -> {len(parts)} 片")
    with open(os.path.join(ROOT, "assets", "js", "data-chunks.js"), "w", encoding="utf-8") as f:
        f.write("// 由 tools/make_chunks.py 生成，勿手改；浏览器端按此清单重组分片\n")
        f.write("window.PHI9_CHUNKS = ")
        f.write(json.dumps(manifest, ensure_ascii=False, indent=2))
        f.write(";\n")
    print(f"\n{len(manifest)} 个文件已分片，清单写入 assets/js/data-chunks.js")


if __name__ == "__main__":
    main()
