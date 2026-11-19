# Neon Coast Cover Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/errnex/gta6-cover-art-01-v2/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/errnex/gta6-cover-art-01-v2/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

An offline web app that turns any photo and caption into multi-panel GTA-style cover art — the poster look with bold lettering and a Vice City sunset or neon grade — and exports it as a PNG to share. Built for the [gta6-cover-art-01 bounty on make.fun](https://make.fun/bounty/gta6-cover-art-01).

## What it does

- **Any photo:** drop in up to 3 photos from your machine (they never leave it), or try the two built-in samples. Click a panel to pick it, drag to crop and position its photo, scroll to zoom, and assign any photo to any panel.
- **Six layouts:** Hero + Duo, Four Panel Grid, Triptych, Tilted Snapshots, Full Bleed, and Tall Strip.
- **Five colour grades:** Vice Sunset, Neon Nights, Golden Hour, Miami Fade, and Noir Vice — plus a synthwave sun, palm silhouettes, film grain, and a vignette.
- **Bold lettering:** an Anton title (white or sunset-gradient fill) with a glowing Pacifico neon subtitle and a badge ribbon.
- **Fast export:** one click writes a PNG in 1080 x 1080, 1080 x 1350, or 1920 x 1080. Shuffle, undo, and redo included.

Everything is original: no Rockstar Games logo, artwork, or font. The Anton and Pacifico fonts ship under the SIL Open Font License (see `app/fonts/`).

## Run it

No build step, no network. Serve `app/` with any static server and open `index.html` in desktop Chrome:

```sh
node serve.ts   # serves app/ at http://localhost:8080
```

or simply:

```sh
cd app && python3 -m http.server 8080
```

## Entry program

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json` with the vendored `vendor/makefun-app.ts` library:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT — see `LICENSE`.
