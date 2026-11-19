// Neon Coast Cover Studio — cover renderer.
// Draws a multi-panel GTA-poster-style cover onto any canvas at any size.
// Every photo stays on the machine: images are drawn from local Image objects only.

export const LAYOUTS = {
  hero: {
    label: 'Hero + Duo',
    blurb: 'One big hero panel, two small ones below',
    panels(W, H) {
      const gap = Math.round(W * 0.012);
      const heroH = Math.round(H * 0.6);
      const lowY = heroH + gap;
      const lowH = H - lowY;
      const halfW = Math.round((W - gap) / 2);
      return [
        { x: 0, y: 0, w: W, h: heroH, tilt: 0 },
        { x: 0, y: lowY, w: halfW, h: lowH, tilt: 0 },
        { x: halfW + gap, y: lowY, w: W - halfW - gap, h: lowH, tilt: 0 },
      ];
    },
  },
  grid4: {
    label: 'Four Panel Grid',
    blurb: 'Classic 2 x 2 poster grid',
    panels(W, H) {
      const gap = Math.round(W * 0.012);
      const halfW = Math.round((W - gap) / 2);
      const halfH = Math.round((H - gap) / 2);
      return [
        { x: 0, y: 0, w: halfW, h: halfH, tilt: 0 },
        { x: halfW + gap, y: 0, w: W - halfW - gap, h: halfH, tilt: 0 },
        { x: 0, y: halfH + gap, w: halfW, h: H - halfH - gap, tilt: 0 },
        { x: halfW + gap, y: halfH + gap, w: W - halfW - gap, h: H - halfH - gap, tilt: 0 },
      ];
    },
  },
  triptych: {
    label: 'Triptych',
    blurb: 'Three tall columns side by side',
    panels(W, H) {
      const gap = Math.round(W * 0.012);
      const colW = Math.round((W - gap * 2) / 3);
      return [
        { x: 0, y: 0, w: colW, h: H, tilt: 0 },
        { x: colW + gap, y: 0, w: colW, h: H, tilt: 0 },
        { x: (colW + gap) * 2, y: 0, w: W - (colW + gap) * 2, h: H, tilt: 0 },
      ];
    },
  },
  tilt: {
    label: 'Tilted Snapshots',
    blurb: 'Overlapping tilted snapshots over a sunset sky',
    panels(W, H) {
      const pw = Math.round(W * 0.52);
      const ph = Math.round(H * 0.58);
      return [
        { x: Math.round(W * 0.05), y: Math.round(H * 0.06), w: pw, h: ph, tilt: -4 },
        { x: Math.round(W * 0.43), y: Math.round(H * 0.3), w: pw, h: ph, tilt: 3 },
        { x: Math.round(W * 0.2), y: Math.round(H * 0.12), w: Math.round(W * 0.42), h: Math.round(H * 0.46), tilt: -1.5 },
      ];
    },
  },
  fullbleed: {
    label: 'Full Bleed',
    blurb: 'One photo edge to edge',
    panels(W, H) {
      return [{ x: 0, y: 0, w: W, h: H, tilt: 0 }];
    },
  },
  strip: {
    label: 'Tall Strip',
    blurb: 'Tall hero left, stacked duo right',
    panels(W, H) {
      const gap = Math.round(W * 0.012);
      const leftW = Math.round(W * 0.58);
      const rightX = leftW + gap;
      const rightW = W - rightX;
      const halfH = Math.round((H - gap) / 2);
      return [
        { x: 0, y: 0, w: leftW, h: H, tilt: 0 },
        { x: rightX, y: 0, w: rightW, h: halfH, tilt: 0 },
        { x: rightX, y: halfH + gap, w: rightW, h: H - halfH - gap, tilt: 0 },
      ];
    },
  },
};

export const GRADES = {
  sunset: {
    label: 'Vice Sunset',
    stops: ['#ffb347', '#ff5e62', '#c642c8'],
    wash: 'rgba(255, 94, 98, 0.20)',
    deep: 'rgba(123, 47, 247, 0.22)',
    filter: 'saturate(1.25) contrast(1.08)',
  },
  neon: {
    label: 'Neon Nights',
    stops: ['#00f5d4', '#00b4ff', '#ff00a8'],
    wash: 'rgba(0, 245, 212, 0.16)',
    deep: 'rgba(255, 0, 168, 0.24)',
    filter: 'saturate(1.35) contrast(1.12)',
  },
  golden: {
    label: 'Golden Hour',
    stops: ['#ffe29a', '#ffb347', '#ff7b00'],
    wash: 'rgba(255, 179, 71, 0.22)',
    deep: 'rgba(255, 123, 0, 0.20)',
    filter: 'saturate(1.2) contrast(1.05) brightness(1.04)',
  },
  miami: {
    label: 'Miami Fade',
    stops: ['#ffd1e8', '#ff8fc7', '#5eead4'],
    wash: 'rgba(255, 143, 199, 0.18)',
    deep: 'rgba(94, 234, 212, 0.16)',
    filter: 'saturate(1.15) contrast(1.02)',
  },
  noir: {
    label: 'Noir Vice',
    stops: ['#f5f5f5', '#ff2e63', '#1a1a2e'],
    wash: 'rgba(255, 46, 99, 0.14)',
    deep: 'rgba(10, 10, 30, 0.28)',
    filter: 'grayscale(1) contrast(1.22) brightness(1.02)',
  },
};

export const SIZES = {
  square: { label: 'Square · 1080 x 1080', w: 1080, h: 1080 },
  story: { label: 'Story · 1080 x 1350', w: 1080, h: 1350 },
  wide: { label: 'Wide · 1920 x 1080', w: 1920, h: 1080 },
};

export const SAMPLE_TITLES = [
  'Neon Coast',
  'Sunset Hustle',
  'Coastline Nights',
  'Golden Getaway',
  'Midnight Boulevard',
  'Palm & Chrome',
];

export function freshState() {
  return {
    layout: 'hero',
    grade: 'sunset',
    size: 'square',
    title: 'Neon Coast',
    subtitle: 'chasing the last light',
    badge: 'NEON COAST · 2026',
    titleFill: 'sunset',
    grain: true,
    sun: true,
    palms: true,
    photos: [],
    panels: [
      { photo: 0, zoom: 1, dx: 0, dy: 0 },
      { photo: 0, zoom: 1, dx: 0, dy: 0 },
      { photo: 1, zoom: 1, dx: 0, dy: 0 },
      { photo: 1, zoom: 1, dx: 0, dy: 0 },
    ],
  };
}

export function layoutPanelCount(layoutKey) {
  return LAYOUTS[layoutKey].panels(100, 100).length;
}

export function ensurePanels(state) {
  const want = layoutPanelCount(state.layout);
  while (state.panels.length < want) state.panels.push({ photo: 0, zoom: 1, dx: 0, dy: 0 });
  state.panels.length = want;
}

let noiseTile = null;
function getNoiseTile() {
  if (noiseTile) return noiseTile;
  const c = document.createElement('canvas');
  c.width = 140;
  c.height = 140;
  const g = c.getContext('2d');
  const data = g.createImageData(140, 140);
  for (let i = 0; i < data.data.length; i += 4) {
    const v = Math.floor(Math.random() * 255);
    data.data[i] = v;
    data.data[i + 1] = v;
    data.data[i + 2] = v;
    data.data[i + 3] = 255;
  }
  g.putImageData(data, 0, 0);
  noiseTile = c;
  return noiseTile;
}

function drawPalm(ctx, x, y, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(10, -60, 4, -118);
  ctx.stroke();
  for (let i = 0; i < 6; i++) {
    const a = (-Math.PI / 6) + (i * Math.PI) / 7.5;
    const bx = 4 + Math.cos(a - Math.PI / 2) * 52;
    const by = -118 + Math.sin(a - Math.PI / 2) * 52 + 26;
    ctx.beginPath();
    ctx.moveTo(4, -118);
    ctx.quadraticCurveTo(4 + Math.cos(a - Math.PI / 2) * 34, -118 + Math.sin(a - Math.PI / 2) * 30 - 14, bx, by);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(4, -118, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSynthwaveSun(ctx, cx, cy, r, grade) {
  const grad = ctx.createLinearGradient(cx, cy - r, cx, cy + r);
  grad.addColorStop(0, '#ffe259');
  grad.addColorStop(0.55, grade.stops[1] || '#ff5e62');
  grad.addColorStop(1, '#ff2e63');
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.globalCompositeOperation = 'destination-out';
  let y = cy + r * 0.05;
  let h = r * 0.045;
  while (y < cy + r) {
    ctx.fillRect(cx - r - 2, y, r * 2 + 4, h);
    y += h + r * 0.16;
    h *= 1.55;
  }
  ctx.restore();
}

function drawPhotoInto(ctx, img, panel, grade, state) {
  const { x, y, w, h } = panel;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  if (!img) {
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, '#2b1055');
    g.addColorStop(1, '#7597de');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = `700 ${Math.max(14, Math.round(h * 0.05))}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ADD A PHOTO', x + w / 2, y + h / 2);
    ctx.restore();
    return;
  }
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const base = Math.max(w / iw, h / ih);
  const scale = base * (panel.zoom || 1);
  const dw = iw * scale;
  const dh = ih * scale;
  const cx = x + w / 2 + (panel.dx || 0) * w;
  const cy = y + h / 2 + (panel.dy || 0) * h;
  ctx.filter = grade.filter;
  ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
  ctx.filter = 'none';
  const wash = ctx.createLinearGradient(x, y, x + w, y + h);
  wash.addColorStop(0, grade.wash);
  wash.addColorStop(1, grade.deep);
  ctx.globalCompositeOperation = 'soft-light';
  ctx.fillStyle = wash;
  ctx.fillRect(x, y, w, h);
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
}

function drawTitleBlock(ctx, state, W, H) {
  const grade = GRADES[state.grade];
  const bandH = Math.round(H * 0.21);
  const bandY = H - bandH;
  const bg = ctx.createLinearGradient(0, bandY, 0, H);
  bg.addColorStop(0, 'rgba(12, 4, 28, 0)');
  bg.addColorStop(0.35, 'rgba(12, 4, 28, 0.82)');
  bg.addColorStop(1, 'rgba(12, 4, 28, 0.96)');
  ctx.fillStyle = bg;
  ctx.fillRect(0, bandY, W, H - bandY);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const title = (state.title || 'NEON COAST').toUpperCase();
  let size = Math.round(H * 0.1);
  ctx.font = `${size}px Anton, 'Arial Narrow', sans-serif`;
  const maxW = W * 0.92;
  while (ctx.measureText(title).width > maxW && size > 18) {
    size -= 2;
    ctx.font = `${size}px Anton, 'Arial Narrow', sans-serif`;
  }
  const titleY = bandY + bandH * 0.42;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#160a2e';
  ctx.lineWidth = Math.max(4, Math.round(size * 0.14));
  ctx.strokeText(title, W / 2, titleY);
  if (state.titleFill === 'sunset') {
    const tg = ctx.createLinearGradient(0, titleY - size * 0.6, 0, titleY + size * 0.6);
    tg.addColorStop(0, '#fff7d6');
    tg.addColorStop(0.5, grade.stops[0]);
    tg.addColorStop(1, grade.stops[1]);
    ctx.fillStyle = tg;
  } else {
    ctx.fillStyle = '#ffffff';
  }
  ctx.fillText(title, W / 2, titleY);

  if (state.subtitle) {
    const subSize = Math.max(16, Math.round(H * 0.032));
    ctx.font = `${subSize}px Pacifico, cursive`;
    ctx.shadowColor = '#ff2e9a';
    ctx.shadowBlur = Math.round(subSize * 0.7);
    ctx.fillStyle = '#ffd7ef';
    ctx.fillText(state.subtitle, W / 2, titleY + size * 0.55 + subSize * 0.3);
    ctx.shadowBlur = 0;
  }

  const dotR = Math.max(2, Math.round(W * 0.004));
  ctx.fillStyle = grade.stops[1];
  const dots = 9;
  const span = Math.min(W * 0.4, dots * dotR * 5);
  for (let i = 0; i < dots; i++) {
    const dx = W / 2 - span / 2 + (span * i) / (dots - 1);
    ctx.beginPath();
    ctx.arc(dx, bandY + bandH * 0.1, dotR, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBadge(ctx, state, W, H) {
  if (!state.badge) return;
  const pad = Math.round(W * 0.018);
  const fs = Math.max(12, Math.round(H * 0.02));
  ctx.save();
  ctx.font = `700 ${fs}px system-ui, sans-serif`;
  const tw = ctx.measureText(state.badge).width;
  const bw = tw + pad * 2;
  const bh = fs * 2.1;
  const bx = pad;
  const by = pad;
  ctx.fillStyle = 'rgba(12, 4, 28, 0.78)';
  ctx.fillRect(bx, by, bw, bh);
  ctx.strokeStyle = '#ff2e63';
  ctx.lineWidth = Math.max(2, Math.round(fs * 0.12));
  ctx.strokeRect(bx, by, bw, bh);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(state.badge, bx + pad, by + bh / 2 + 1);
  ctx.restore();
}

export function renderCover(canvas, state, W, H) {
  ensurePanels(state);
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const grade = GRADES[state.grade] || GRADES.sunset;
  const layout = LAYOUTS[state.layout] || LAYOUTS.hero;

  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, grade.stops[2]);
  sky.addColorStop(0.55, grade.stops[1]);
  sky.addColorStop(1, grade.stops[0]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  if (state.sun) {
    const r = Math.min(W, H) * 0.2;
    drawSynthwaveSun(ctx, W * 0.72, H * 0.3, r, grade);
  }

  const panels = layout.panels(W, H);
  const frame = Math.max(3, Math.round(W * 0.006));
  panels.forEach((panel, i) => {
    const spec = state.panels[i] || { photo: 0, zoom: 1, dx: 0, dy: 0 };
    const img = state.photos[spec.photo] ? state.photos[spec.photo].img : null;
    ctx.save();
    if (panel.tilt) {
      ctx.translate(panel.x + panel.w / 2, panel.y + panel.h / 2);
      ctx.rotate((panel.tilt * Math.PI) / 180);
      ctx.translate(-panel.w / 2, -panel.h / 2);
      drawPhotoInto(ctx, img, { x: 0, y: 0, w: panel.w, h: panel.h }, grade, state);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = frame;
      ctx.strokeRect(0, 0, panel.w, panel.h);
      ctx.strokeStyle = 'rgba(20, 6, 40, 0.55)';
      ctx.lineWidth = Math.max(1, frame * 0.35);
      ctx.strokeRect(frame, frame, panel.w - frame * 2, panel.h - frame * 2);
    } else {
      drawPhotoInto(ctx, img, panel, grade, state);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = frame;
      ctx.strokeRect(panel.x, panel.y, panel.w, panel.h);
    }
    ctx.restore();
  });

  if (state.palms) {
    ctx.fillStyle = 'rgba(16, 4, 32, 0.9)';
    drawPalm(ctx, W * 0.06, H * 0.97, Math.min(W, H) * 0.0016, 'rgba(16, 4, 32, 0.92)');
    drawPalm(ctx, W * 0.94, H * 0.99, Math.min(W, H) * 0.0013, 'rgba(16, 4, 32, 0.85)');
  }

  drawTitleBlock(ctx, state, W, H);
  drawBadge(ctx, state, W, H);

  const vig = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.max(W, H) * 0.75);
  vig.addColorStop(0, 'rgba(10, 4, 24, 0)');
  vig.addColorStop(1, 'rgba(10, 4, 24, 0.42)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);

  if (state.grain) {
    const tile = getNoiseTile();
    const pattern = ctx.createPattern(tile, 'repeat');
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  const border = Math.max(6, Math.round(W * 0.008));
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = border;
  ctx.strokeRect(border / 2, border / 2, W - border, H - border);
}

export function exportCoverPng(state) {
  const size = SIZES[state.size] || SIZES.square;
  const off = document.createElement('canvas');
  renderCover(off, state, size.w, size.h);
  return new Promise((resolve) => off.toBlob(resolve, 'image/png'));
}

export function downloadCover(state) {
  return exportCoverPng(state).then((blob) => {
    if (!blob) return null;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neon-coast-cover-${state.size}-${state.layout}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return blob;
  });
}
