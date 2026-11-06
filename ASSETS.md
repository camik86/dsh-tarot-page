# Card artwork provenance

All 78 card images in `assets/cards/*.webp` are derived from scans of the
**Rider-Waite-Smith (RWS) tarot deck**, first published in 1909, illustrated by
**Pamela Colman Smith** (1878–1951) under the direction of A. E. Waite.

## Public domain

- **United States:** published in 1909, before the 1929 public-domain cutoff, so
  the artwork is in the public domain.
- **Life + 70 jurisdictions (EU/UK and others):** the illustrator died in 1951,
  so protection expired at the end of 2021; the artwork is public domain there
  since 2022.

The high-resolution scans were downloaded from Wikimedia Commons, which hosts
them as public-domain material, then resized to 340 px wide and re-encoded as
WebP by `scripts/fetch-cards.py`.

## Source files

Majors are published on Commons as `RWS Tarot <NN> <Name>.jpg` (for example
`RWS Tarot 00 Fool.jpg`). Minors use the classic filenames `<Suit><NN>.jpg`
with `Pents` for the suit of Pentacles (for example `Wands01.jpg`,
`Cups14.jpg`, `Pents09.jpg`).

- Category: https://commons.wikimedia.org/wiki/Category:Rider-Waite_tarot_deck
- Download: https://commons.wikimedia.org/wiki/Special:FilePath/<file>?width=500

`scripts/fetch-cards.py` contains the complete filename mapping and can rebuild
`assets/cards/` from scratch.

## Reusing the artwork

The artwork itself may be reused freely as public-domain material. If you
redistribute this plugin's image files, keep this file so provenance stays
attached. The plugin's **code** is MIT-licensed (see `LICENSE`).
