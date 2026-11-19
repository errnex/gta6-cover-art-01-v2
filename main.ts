// Neon Coast Cover Studio — make.fun entry program (Node 22, stdlib only).
// Hands the entry in: copies the offline web app (app/) and the screenshots
// (screenshots/) from this repository into the output directory and writes
// the dossier the judge reads, built by the vendored make.fun library.
//
// Local check:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// The grader runs this twice; both runs must write identical bytes.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const appSource = join(repoRoot, 'app');
const shotSource = join(repoRoot, 'screenshots');

mkdirSync(outputDir, { recursive: true });
cpSync(appSource, join(outputDir, 'app'), { recursive: true });

const shotTarget = join(outputDir, 'screenshots');
mkdirSync(shotTarget, { recursive: true });
if (existsSync(shotSource)) {
  cpSync(shotSource, shotTarget, { recursive: true });
}

// Caps mirror the competition gate (reference/gate.json): the dossier text
// budget, at most 4 screenshots of 256 KiB, app/ at most 993 entries and
// 48 MiB, paths at most 1000 bytes.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);
