// Neon Coast Cover Studio — screenshot scenes.
// ?shot=cover draws one exported cover full-frame; ?shot=editor opens the
// editor with a sample photo loaded. Both set window.__shotReady when the
// frame is finished, so a headless shotter can wait on it.

import { SIZES, renderCover, freshState, ensurePanels } from './cover.js';
import { createEditor } from './editor.js';

const SAMPLES = {
  boulevard: 'samples/boulevard.jpg',
  pier: 'samples/pier.jpg',
};

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('sample failed: ' + url));
    img.src = url;
  });
}

async function waitForFonts() {
  try {
    await Promise.all([
      document.fonts.load('64px Anton'),
      document.fonts.load('32px Pacifico'),
      document.fonts.ready,
    ]);
  } catch {
    await document.fonts.ready;
  }
}

function finishShot() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.__shotReady = true;
    });
  });
}

export async function runShotScene(params) {
  const mode = params.get('shot') || 'cover';
  const photoName = params.get('photo') || 'pier';
  const caption = params.get('caption') || 'Neon Coast';
  const layout = params.get('layout') || 'tilt';
  const grade = params.get('grade') || 'sunset';
  const sizeKey = params.get('size') || 'wide';

  document.body.classList.add('shot-' + mode);
  await waitForFonts();

  if (mode === 'editor') {
    const editor = createEditor(document);
    const first = photoName === 'boulevard' ? 'boulevard' : 'pier';
    const second = first === 'boulevard' ? 'pier' : 'boulevard';
    await editor.addSample(SAMPLES[first], first + '.jpg');
    await editor.addSample(SAMPLES[second], second + '.jpg');
    editor.state.layout = params.get('layout') || 'hero';
    editor.state.grade = grade;
    editor.state.size = sizeKey;
    editor.state.title = caption;
    editor.state.subtitle = params.get('subtitle') || 'chasing the last light';
    editor.syncAll();
    await waitForFonts();
    editor.render();
    finishShot();
    return;
  }

  const size = SIZES[sizeKey] || SIZES.wide;
  const state = freshState();
  state.layout = layout;
  state.grade = grade;
  state.size = sizeKey;
  state.title = caption;
  state.subtitle = params.get('subtitle') || 'chasing the last light';
  state.badge = params.get('badge') || 'NEON COAST · 2026';
  state.titleFill = params.get('fill') || 'sunset';

  const names = photoName === 'both' ? ['pier', 'boulevard'] : [photoName];
  for (const name of names) {
    const img = await loadImage(SAMPLES[name] || SAMPLES.pier);
    state.photos.push({ img, name: name + '.jpg' });
  }
  ensurePanels(state);
  state.panels.forEach((p, i) => {
    p.photo = names.length > 1 ? i % names.length : 0;
  });

  const stage = document.createElement('div');
  stage.id = 'shotStage';
  const canvas = document.createElement('canvas');
  canvas.id = 'shotCanvas';
  stage.appendChild(canvas);
  document.body.appendChild(stage);
  renderCover(canvas, state, size.w, size.h);
  await waitForFonts();
  renderCover(canvas, state, size.w, size.h);
  finishShot();
}
