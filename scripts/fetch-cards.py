#!/usr/bin/env python3
"""Download the public-domain Rider-Waite-Smith deck and build assets/cards/*.webp.

Usage:
    python scripts/fetch-cards.py            # skip files that already exist
    python scripts/fetch-cards.py --force    # re-download everything

Requires Python 3.8+ and Pillow. Files come from Wikimedia Commons
(public domain); see ASSETS.md for provenance and licensing.
"""
from __future__ import annotations

import argparse
import io
import os
import sys
import urllib.parse
import urllib.request

try:
    from PIL import Image
except ImportError:  # pragma: no cover
    sys.exit("Pillow is required: python -m pip install Pillow")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "assets", "cards")
USER_AGENT = "dsh-tarot-page/1.0 (https://github.com/zhngz/dsh-tarot-page)"
WIDTH = 340
QUALITY = 80

MAJORS = [
    "00 Fool", "01 Magician", "02 High Priestess", "03 Empress", "04 Emperor",
    "05 Hierophant", "06 Lovers", "07 Chariot", "08 Strength", "09 Hermit",
    "10 Wheel of Fortune", "11 Justice", "12 Hanged Man", "13 Death",
    "14 Temperance", "15 Devil", "16 Tower", "17 Star", "18 Moon", "19 Sun",
    "20 Judgement", "21 World",
]
SUITS = {"wands": "Wands", "cups": "Cups", "swords": "Swords", "pentacles": "Pents"}


def targets() -> list[tuple[str, str]]:
    out: list[tuple[str, str]] = []
    for index, name in enumerate(MAJORS):
        out.append((f"major-{index:02d}", f"RWS Tarot {name}.jpg"))
    for suit, commons in SUITS.items():
        for number in range(1, 15):
            out.append((f"{suit}-{number:02d}", f"{commons}{number:02d}.jpg"))
    return out


def download(commons_name: str) -> bytes:
    url = (
        "https://commons.wikimedia.org/wiki/Special:FilePath/"
        + urllib.parse.quote(commons_name)
        + f"?width=500"
    )
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read()


def convert(raw: bytes, destination: str) -> None:
    image = Image.open(io.BytesIO(raw)).convert("RGB")
    width, height = image.size
    if width > WIDTH:
        image = image.resize((WIDTH, round(height * WIDTH / width)), Image.LANCZOS)
    image.save(destination, "WEBP", quality=QUALITY, method=6)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--force", action="store_true", help="re-download existing files")
    args = parser.parse_args()
    os.makedirs(OUT_DIR, exist_ok=True)
    todo = targets()
    for index, (card_id, commons_name) in enumerate(todo, start=1):
        destination = os.path.join(OUT_DIR, card_id + ".webp")
        if os.path.exists(destination) and not args.force:
            continue
        try:
            convert(download(commons_name), destination)
            print(f"[{index}/{len(todo)}] {card_id} <- {commons_name}")
        except Exception as error:  # noqa: BLE001 - report and continue
            print(f"[{index}/{len(todo)}] FAILED {card_id} ({commons_name}): {error}", file=sys.stderr)
    print("done:", OUT_DIR)


if __name__ == "__main__":
    main()
