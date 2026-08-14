#!/usr/bin/env python3
"""
Regenerates the two self-hosted Pretendard files in `src/fonts/`.

This is offline tooling, not part of `next build` — the .woff2 files it writes
are committed. Run it only when the site's Korean copy changes enough that the
first tier should be re-cut.

    pip install fonttools brotli
    npm install --no-save pretendard@1.3.9
    python3 scripts/build-pretendard-subset.py

Why two files instead of one:

  Pretendard Variable ships every Hangul syllable, which is 2.0 MB. Cutting it
  to KS X 1001 — the 2,350-syllable set that covers essentially all modern
  Korean, names included — still costs 445 KB, and that is a lot to put in
  front of first paint.

  So the face is cut twice. `PretendardVariable.subset.woff2` holds Latin plus
  only the syllables this site's own copy actually sets, which is 95 KB, and it
  is the one that gets preloaded. `PretendardVariable.ko-ext.woff2` holds all
  of KS X 1001 and is listed after it in the font stack with no preload, so the
  browser fetches it only if it meets a syllable the first file lacks — in
  practice only when a reader types an unusual name into the waitlist form.

  Font matching runs per glyph, so the two behave as one face. The failure mode
  of an out-of-date first tier is one extra lazy request, never a wrong glyph.

Pretendard is © 2021 Kil Hyung-jin, SIL Open Font License 1.1. The license
travels with the fonts in `src/fonts/OFL.txt`.
"""

from __future__ import annotations

import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SOURCE = ROOT / (
    "node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2"
)
OUT_DIR = ROOT / "src/fonts"

# Latin, the punctuation the design sets, and the compatibility jamo a Korean
# IME shows mid-composition before a syllable is committed.
ASCII = "".join(chr(c) for c in range(0x20, 0x7F))
LATIN_1 = "".join(chr(c) for c in range(0xA0, 0x100))
PUNCTUATION = "…—–·•’‘“”°×÷©®™€£¥₩"
JAMO = (
    "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ"
    "ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ"
)
COMMON = ASCII + LATIN_1 + PUNCTUATION + JAMO


def page_syllables() -> set[str]:
    """Every Hangul syllable the site's own source actually renders."""
    blob = "".join(
        path.read_text(encoding="utf-8")
        for path in (ROOT / "src").rglob("*")
        if path.is_file() and path.suffix in {".ts", ".tsx", ".css"}
    )
    return {c for c in blob if 0xAC00 <= ord(c) <= 0xD7A3}


def ks_x_1001_syllables() -> set[str]:
    """
    The 2,350 wansung syllables. Python's `euc_kr` codec is really CP949, whose
    extension area uses lead bytes 0x81-0xA0, so the byte range check is what
    separates KS X 1001 proper from the full 11,172.
    """
    out = set()
    for cp in range(0xAC00, 0xD7A4):
        ch = chr(cp)
        try:
            encoded = ch.encode("euc-kr")
        except UnicodeEncodeError:
            continue
        if len(encoded) == 2 and all(0xA1 <= b <= 0xFE for b in encoded):
            out.add(ch)
    return out


def subset(text: str, out_name: str) -> None:
    out_path = OUT_DIR / out_name
    unicodes = ",".join(f"U+{ord(c):04X}" for c in sorted(set(text)))
    subprocess.run(
        [
            sys.executable,
            "-m",
            "fontTools.subset",
            str(SOURCE),
            f"--unicodes={unicodes}",
            "--flavor=woff2",
            f"--output-file={out_path}",
            # Keep kerning and the variable weight axis; drop hinting, which a
            # variable webfont does not need.
            "--layout-features=*",
            "--no-hinting",
            "--name-IDs=*",
            "--drop-tables+=DSIG",
        ],
        check=True,
    )
    size = out_path.stat().st_size / 1024
    print(f"  {out_name:38} {size:6.0f} KB  ({len(set(text)):5} codepoints)")


def main() -> int:
    if not SOURCE.exists():
        print(f"missing source font: {SOURCE}", file=sys.stderr)
        print("run: npm install --no-save pretendard@1.3.9", file=sys.stderr)
        return 1

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    page = page_syllables()
    ksx = ks_x_1001_syllables()
    print(f"page syllables: {len(page)}  |  KS X 1001: {len(ksx)}")

    subset(COMMON + "".join(sorted(page)), "PretendardVariable.subset.woff2")
    subset(COMMON + "".join(sorted(ksx | page)), "PretendardVariable.ko-ext.woff2")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
