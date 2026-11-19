// Neon Coast Cover Studio — editor wiring.
// Owns the app state, the control panel, panel picking / panning / zooming,
// photo loading, undo + redo, shuffle and PNG export.

import {
  LAYOUTS,
  GRADES,
  SIZES,
  SAMPLE_TITLES,
  freshState,
  layoutPanelCount,
  ensurePanels,
  renderCover,
  downloadCover,
} from './cover.js';

const PREVIEW_MAX = 880;

function loadImageFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, name: file.name || 'photo', url });
    img.onerror = () => reject(new Error('could not read that image'));
    img.src = url;
  });
}

function loadImageUrl(url, name) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ img, name, url });
    img.onerror = () => reject(new Error('could not load ' + name));
    img.src = url;
  });
}

function snapshotOf(state) {
  return JSON.stringify({
    layout: state.layout,
    grade: state.grade,
    size: state.size,
    title: state.title,
    subtitle: state.subtitle,
    badge: state.badge,
    titleFill: state.titleFill,
    grain: state.grain,
    sun: state.sun,
    palms: state.palms,
    panels: state.panels,
    photoNames: state.photos.map((p) => p.name),
  });
}

function restoreSnapshot(state, snap) {
  const s = JSON.parse(snap);
  state.layout = s.layout;
  state.grade = s.grade;
  state.size = s.size;
  state.title = s.title;
  state.subtitle = s.subtitle;
  state.badge = s.badge;
  state.titleFill = s.titleFill;
  state.grain = s.grain;
  state.sun = s.sun;
  state.palms = s.palms;
  state.panels = s.panels;
  ensurePanels(state);
}

export function createEditor(root) {
  const state = freshState();
  const preview = root.querySelector('#preview');
  const statusLine = root.querySelector('#statusLine');
  const photoSlots = root.querySelector('#photoSlots');
  const zoomRange = root.querySelector('#zoomRange');
  const layoutRow = root.querySelector('#layoutRow');
  const gradeRow = root.querySelector('#gradeRow');
  const sizeRow = root.querySelector('#sizeRow');
  const titleInput = root.querySelector('#titleInput');
  const subtitleInput = root.querySelector('#subtitleInput');
  const badgeInput = root.querySelector('#badgeInput');
  const titleFillRow = root.querySelector('#titleFillRow');
  const fileInput = root.querySelector('#fileInput');
  const undoBtn = root.querySelector('#undoBtn');
  const redoBtn = root.querySelector('#redoBtn');
  const shuffleBtn = root.querySelector('#shuffleBtn');
  const exportBtn = root.querySelector('#exportBtn');
  const sampleBoulevard = root.querySelector('#sampleBoulevard');
  const samplePier = root.querySelector('#samplePier');

  let selected = 0;
  let undoStack = [];
  let redoStack = [];
  let renderQueued = false;
  let drag = null;

  function pushHistory() {
    undoStack.push(snapshotOf(state));
    if (undoStack.length > 60) undoStack.shift();
    redoStack = [];
    syncHistoryButtons();
  }

  function syncHistoryButtons() {
    undoBtn.disabled = undoStack.length === 0;
    redoBtn.disabled = redoStack.length === 0;
  }

  function previewSize() {
    const size = SIZES[state.size];
    const scale = Math.min(1, PREVIEW_MAX / Math.max(size.w, size.h));
    return { w: Math.round(size.w * scale), h: Math.round(size.h * scale) };
  }

  function render() {
    renderQueued = false;
    const { w, h } = previewSize();
    renderCover(preview, state, w, h);
    syncPhotoSlots();
  }

  function queueRender() {
    if (renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(render);
  }

  function setStatus(text) {
    statusLine.textContent = text;
  }

  function syncPhotoSlots() {
    photoSlots.innerHTML = '';
    state.photos.forEach((photo, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'photo-slot';
      btn.textContent = `Photo ${i + 1} · ${photo.name}`;
      btn.title = 'Click to put this photo in the selected panel';
      btn.addEventListener('click', () => {
        pushHistory();
        ensurePanels(state);
        state.panels[selected].photo = i;
        queueRender();
        setStatus(`Panel ${selected + 1} now shows photo ${i + 1}.`);
      });
      photoSlots.appendChild(btn);
    });
    if (state.photos.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'hint';
      empty.textContent = 'No photos yet — add one below, or try a sample.';
      photoSlots.appendChild(empty);
    }
    const active = state.panels[selected];
    if (active) zoomRange.value = String(active.zoom || 1);
  }

  function buildOptionRows() {
    layoutRow.innerHTML = '';
    Object.entries(LAYOUTS).forEach(([key, def]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip' + (state.layout === key ? ' active' : '');
      btn.textContent = def.label;
      btn.title = def.blurb;
      btn.addEventListener('click', () => {
        if (state.layout === key) return;
        pushHistory();
        state.layout = key;
        ensurePanels(state);
        selected = 0;
        buildOptionRows();
        queueRender();
        setStatus(`${def.label} layout — click a panel to pick it, drag to move its photo.`);
      });
      layoutRow.appendChild(btn);
    });

    gradeRow.innerHTML = '';
    Object.entries(GRADES).forEach(([key, def]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'swatch' + (state.grade === key ? ' active' : '');
      btn.style.background = `linear-gradient(135deg, ${def.stops.join(', ')})`;
      btn.textContent = def.label;
      btn.addEventListener('click', () => {
        if (state.grade === key) return;
        pushHistory();
        state.grade = key;
        buildOptionRows();
        queueRender();
        setStatus(`${def.label} grade applied.`);
      });
      gradeRow.appendChild(btn);
    });

    sizeRow.innerHTML = '';
    Object.entries(SIZES).forEach(([key, def]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip' + (state.size === key ? ' active' : '');
      btn.textContent = def.label;
      btn.addEventListener('click', () => {
        if (state.size === key) return;
        pushHistory();
        state.size = key;
        buildOptionRows();
        queueRender();
        setStatus(`Export size: ${def.label}.`);
      });
      sizeRow.appendChild(btn);
    });

    titleFillRow.innerHTML = '';
    [['white', 'White letters'], ['sunset', 'Sunset letters']].forEach(([key, label]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip' + (state.titleFill === key ? ' active' : '');
      btn.textContent = label;
      btn.addEventListener('click', () => {
        if (state.titleFill === key) return;
        pushHistory();
        state.titleFill = key;
        buildOptionRows();
        queueRender();
      });
      titleFillRow.appendChild(btn);
    });
  }

  function bindInputs() {
    titleInput.addEventListener('input', () => {
      state.title = titleInput.value;
      queueRender();
    });
    titleInput.addEventListener('change', () => pushHistory());
    subtitleInput.addEventListener('input', () => {
      state.subtitle = subtitleInput.value;
      queueRender();
    });
    subtitleInput.addEventListener('change', () => pushHistory());
    badgeInput.addEventListener('input', () => {
      state.badge = badgeInput.value;
      queueRender();
    });
    badgeInput.addEventListener('change', () => pushHistory());

    zoomRange.addEventListener('input', () => {
      ensurePanels(state);
      state.panels[selected].zoom = parseFloat(zoomRange.value);
      queueRender();
    });
    zoomRange.addEventListener('change', () => pushHistory());

    root.querySelectorAll('[data-toggle]').forEach((box) => {
      box.addEventListener('change', () => {
        pushHistory();
        state[box.dataset.toggle] = box.checked;
        queueRender();
      });
    });

    fileInput.addEventListener('change', async () => {
      const files = [...fileInput.files];
      fileInput.value = '';
      if (!files.length) return;
      await addFiles(files);
    });

    const dropZone = root.querySelector('#dropZone');
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('dragging');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragging'));
    dropZone.addEventListener('drop', async (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragging');
      const files = [...e.dataTransfer.files].filter((f) => f.type.startsWith('image/'));
      if (files.length) await addFiles(files);
    });

    sampleBoulevard.addEventListener('click', () => addSample('samples/boulevard.jpg', 'boulevard.jpg'));
    samplePier.addEventListener('click', () => addSample('samples/pier.jpg', 'pier.jpg'));

    undoBtn.addEventListener('click', () => {
      if (!undoStack.length) return;
      redoStack.push(snapshotOf(state));
      restoreSnapshot(state, undoStack.pop());
      syncInputsFromState();
      buildOptionRows();
      queueRender();
      syncHistoryButtons();
      setStatus('Undid the last change.');
    });
    redoBtn.addEventListener('click', () => {
      if (!redoStack.length) return;
      undoStack.push(snapshotOf(state));
      restoreSnapshot(state, redoStack.pop());
      syncInputsFromState();
      buildOptionRows();
      queueRender();
      syncHistoryButtons();
      setStatus('Redid the change.');
    });

    shuffleBtn.addEventListener('click', () => {
      pushHistory();
      const layoutKeys = Object.keys(LAYOUTS);
      const gradeKeys = Object.keys(GRADES);
      state.layout = layoutKeys[Math.floor(Math.random() * layoutKeys.length)];
      state.grade = gradeKeys[Math.floor(Math.random() * gradeKeys.length)];
      state.title = SAMPLE_TITLES[Math.floor(Math.random() * SAMPLE_TITLES.length)];
      ensurePanels(state);
      state.panels.forEach((p) => {
        p.photo = Math.floor(Math.random() * Math.max(1, state.photos.length));
      });
      syncInputsFromState();
      buildOptionRows();
      queueRender();
      setStatus(`Shuffled: ${LAYOUTS[state.layout].label} + ${GRADES[state.grade].label} + “${state.title}”.`);
    });

    exportBtn.addEventListener('click', async () => {
      exportBtn.disabled = true;
      exportBtn.textContent = 'Rendering PNG…';
      try {
        const blob = await downloadCover(state);
        if (blob) {
          const size = SIZES[state.size];
          setStatus(`Exported ${size.w} x ${size.h} PNG (${Math.round(blob.size / 1024)} KB). Share it anywhere.`);
        } else {
          setStatus('Export did not produce a file — try again.');
        }
      } finally {
        exportBtn.disabled = false;
        exportBtn.textContent = 'Export PNG';
      }
    });
  }

  function syncInputsFromState() {
    titleInput.value = state.title;
    subtitleInput.value = state.subtitle;
    badgeInput.value = state.badge;
    root.querySelectorAll('[data-toggle]').forEach((box) => {
      box.checked = !!state[box.dataset.toggle];
    });
  }

  async function addFiles(files) {
    pushHistory();
    let added = 0;
    for (const file of files.slice(0, 3 - state.photos.length)) {
      try {
        const photo = await loadImageFile(file);
        state.photos.push(photo);
        added += 1;
      } catch {
        setStatus(`Could not read ${file.name} — try a JPG or PNG.`);
      }
    }
    if (state.photos.length > 3) state.photos.length = 3;
    if (added) {
      ensurePanels(state);
      state.panels.forEach((p) => {
        if (p.photo >= state.photos.length) p.photo = 0;
      });
      setStatus(`${added} photo${added > 1 ? 's' : ''} loaded. Click a panel, then drag to crop it.`);
    }
    queueRender();
  }

  async function addSample(url, name) {
    if (state.photos.some((p) => p.name === name)) {
      setStatus(`${name} is already loaded.`);
      return;
    }
    if (state.photos.length >= 3) {
      setStatus('Three photos max — the panels are full.');
      return;
    }
    pushHistory();
    try {
      const photo = await loadImageUrl(url, name);
      state.photos.push(photo);
      ensurePanels(state);
      setStatus(`Sample photo ${name} loaded.`);
      queueRender();
    } catch {
      setStatus(`Could not load the sample ${name}.`);
    }
  }

  function panelAt(clientX, clientY) {
    const rect = preview.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * preview.width;
    const py = ((clientY - rect.top) / rect.height) * preview.height;
    const layout = LAYOUTS[state.layout];
    const panels = layout.panels(preview.width, preview.height);
    for (let i = panels.length - 1; i >= 0; i--) {
      const p = panels[i];
      if (px >= p.x && px <= p.x + p.w && py >= p.y && py <= p.y + p.h) return { index: i, panel: p, px, py };
    }
    return null;
  }

  function bindCanvas() {
    preview.addEventListener('pointerdown', (e) => {
      const hit = panelAt(e.clientX, e.clientY);
      if (!hit) return;
      selected = hit.index;
      drag = { startX: e.clientX, startY: e.clientY, moved: false, panel: hit.panel, index: hit.index };
      preview.setPointerCapture(e.pointerId);
      queueRender();
    });
    preview.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const rect = preview.getBoundingClientRect();
      const dxPx = (e.clientX - drag.startX) / rect.width * preview.width;
      const dyPx = (e.clientY - drag.startY) / rect.height * preview.height;
      if (Math.abs(dxPx) + Math.abs(dyPx) > 2) drag.moved = true;
      if (!drag.moved) return;
      const spec = state.panels[drag.index];
      const start = drag.startSpec || (drag.startSpec = { dx: spec.dx, dy: spec.dy });
      spec.dx = start.dx + dxPx / drag.panel.w;
      spec.dy = start.dy + dyPx / drag.panel.h;
      queueRender();
    });
    preview.addEventListener('pointerup', () => {
      if (drag && drag.moved) pushHistory();
      if (drag) setStatus(`Panel ${drag.index + 1} selected — drag to move its photo, scroll to zoom.`);
      drag = null;
    });
    preview.addEventListener('wheel', (e) => {
      e.preventDefault();
      const hit = panelAt(e.clientX, e.clientY);
      const index = hit ? hit.index : selected;
      ensurePanels(state);
      const spec = state.panels[index];
      spec.zoom = Math.min(3, Math.max(1, (spec.zoom || 1) * (e.deltaY < 0 ? 1.08 : 0.92)));
      selected = index;
      queueRender();
    }, { passive: false });
  }

  buildOptionRows();
  bindInputs();
  bindCanvas();
  syncInputsFromState();
  syncHistoryButtons();
  queueRender();

  return {
    state,
    render: queueRender,
    addSample,
    loadImageUrl,
    setStatus,
    syncAll() {
      syncInputsFromState();
      buildOptionRows();
      queueRender();
    },
  };
}
