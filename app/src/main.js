// Neon Coast Cover Studio — bootstrap.
// Normal page load starts the editor; ?shot=… runs a screenshot scene instead.

import { createEditor } from './editor.js';
import { runShotScene } from './shots.js';

const params = new URLSearchParams(window.location.search);

if (params.get('shot')) {
  runShotScene(params).catch((err) => {
    document.body.textContent = 'Shot scene failed: ' + err.message;
    window.__shotReady = true;
  });
} else {
  const editor = createEditor(document);
  document.fonts.ready.then(() => editor.render());
}
