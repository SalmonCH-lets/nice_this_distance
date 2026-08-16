// Main JavaScript for 「よかったこの距離で」風 テロップ＆写真合成ジェネレーター

// Initial State (Set to User Requested Defaults)
const state = {
  text: 'よかったこの距離で',
  subtext: '',
  fontFamily: "'極太明朝', 'Shippori Mincho', serif",
  fontSize: 140,        // 文字サイズ: 140
  letterSpacing: -10,   // 文字間隔: -10
  textColor: '#FFFFFF',  // 色: 白
  stroke1Color: '#FFFFFF',
  stroke1Width: 0,      // 装飾: 0
  stroke2Color: '#1E0E38',
  stroke2Width: 0,      // 装飾: 0
  shadowColor: '#000000',
  shadowBlur: 0,        // 装飾: 0
  
  // Independent Text Scale X / Y
  textScaleX: 1.55,     // x拡大率: 1.55
  textScaleY: 1.75,     // y拡大率: 1.75
  
  // Banner & Pattern
  patternScale: 0.7,    // パターン倍率: 0.7
  bannerPaddingX: 10,   // 左右パディング: 10
  bannerHeight: 288,    // 枠の高さ: 288
  bannerRadius: 0,      // 角丸: 0
  bannerBorderColor: '#FFFFFF',
  bannerBorderWidth: 0, // 枠線の太さ: 0
  bannerPosY: 18,       // 上下位置: 18
  
  // ScaleX Auto Compressor
  scaleXEnabled: true,
  maxWidthPercent: 85,
  scaleOrigin: 'center',
  
  // Background Photo
  bgMode: 'sunset', // 'sunset' | 'night' | 'room' | 'dark' | 'transparent' | 'user'
  userBgImg: null,
  patternImg: null,
  
  // Computed
  currentScaleX: 1.0
};

// Canvas & Elements Reference
let canvas, ctx;

// DOM Element Selectors
const elements = {};

// Theme Manager State
let currentTheme = localStorage.getItem('yokatta_theme') || 'light';

// DOM Ready Initialization
document.addEventListener('DOMContentLoaded', () => {
  initDOMElements();
  initTheme();
  initCanvas();
  bindEvents();

  // 1. Initialize Pattern Image synchronously from Base64
  initDefaultPattern();

  // 2. Render Canvas IMMEDIATELY (0ms delay, zero async blocking)
  render();

  // 3. Load custom font in background asynchronously
  loadCustomFontInBackground();
});

function initTheme() {
  applyTheme(currentTheme);
  
  const toggleBtn = document.getElementById('themeToggleBtn');
  const fabBtn = document.getElementById('themeFabBtn');

  if (fabBtn && toggleBtn) {
    fabBtn.addEventListener('click', () => {
      toggleBtn.classList.toggle('hidden');
      fabBtn.classList.toggle('active');
    });

    toggleBtn.addEventListener('click', () => {
      const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
      applyTheme(nextTheme);
    });
  }
}

function applyTheme(theme) {
  currentTheme = theme;
  localStorage.setItem('yokatta_theme', theme);
  const textEl = document.getElementById('themeToggleText');
  const iconEl = document.getElementById('themeToggleIcon');

  if (theme === 'dark') {
    document.body.classList.remove('theme-light');
    document.body.classList.add('theme-dark');
    if (textEl) textEl.textContent = 'ライトモードにする';
    if (iconEl) iconEl.textContent = '☀️';
  } else {
    document.body.classList.remove('theme-dark');
    document.body.classList.add('theme-light');
    if (textEl) textEl.textContent = 'ダークモードにする';
    if (iconEl) iconEl.textContent = '🌙';
  }
}

function initDOMElements() {
  canvas = document.getElementById('previewCanvas');
  ctx = canvas.getContext('2d');

  elements.scaleBadge = document.getElementById('scaleBadge');
  elements.scaleBadgeText = document.getElementById('scaleBadgeText');
  elements.bgFileInput = document.getElementById('bgFileInput');
  elements.patternFileInput = document.getElementById('patternFileInput');
  elements.resetPatternBtn = document.getElementById('resetPatternBtn');
  elements.patternTilePreview = document.getElementById('patternTilePreview');
  elements.fontFileInput = document.getElementById('fontFileInput');
  elements.loadedFontStatus = document.getElementById('loadedFontStatus');

  // Inputs
  elements.textInput = document.getElementById('textInput');
  elements.subtextInput = document.getElementById('subtextInput');
  elements.fontSelect = document.getElementById('fontSelect');
  elements.fontSize = document.getElementById('fontSize');
  elements.fontSizeVal = document.getElementById('fontSizeVal');
  elements.letterSpacing = document.getElementById('letterSpacing');
  elements.letterSpacingVal = document.getElementById('letterSpacingVal');
  elements.textColor = document.getElementById('textColor');
  elements.textColorHex = document.getElementById('textColorHex');

  elements.textScaleX = document.getElementById('textScaleX');
  elements.textScaleXVal = document.getElementById('textScaleXVal');
  elements.textScaleY = document.getElementById('textScaleY');
  elements.textScaleYVal = document.getElementById('textScaleYVal');

  elements.stroke1Color = document.getElementById('stroke1Color');
  elements.stroke1ColorHex = document.getElementById('stroke1ColorHex');
  elements.stroke1Width = document.getElementById('stroke1Width');
  elements.stroke1WidthVal = document.getElementById('stroke1WidthVal');

  elements.stroke2Color = document.getElementById('stroke2Color');
  elements.stroke2ColorHex = document.getElementById('stroke2ColorHex');
  elements.stroke2Width = document.getElementById('stroke2Width');
  elements.stroke2WidthVal = document.getElementById('stroke2WidthVal');

  elements.shadowColor = document.getElementById('shadowColor');
  elements.shadowColorHex = document.getElementById('shadowColorHex');
  elements.shadowBlur = document.getElementById('shadowBlur');
  elements.shadowBlurVal = document.getElementById('shadowBlurVal');

  elements.patternScale = document.getElementById('patternScale');
  elements.patternScaleVal = document.getElementById('patternScaleVal');
  elements.bannerPaddingX = document.getElementById('bannerPaddingX');
  elements.bannerPaddingXVal = document.getElementById('bannerPaddingXVal');
  elements.bannerHeight = document.getElementById('bannerHeight');
  elements.bannerHeightVal = document.getElementById('bannerHeightVal');
  elements.bannerRadius = document.getElementById('bannerRadius');
  elements.bannerRadiusVal = document.getElementById('bannerRadiusVal');
  elements.bannerBorderColor = document.getElementById('bannerBorderColor');
  elements.bannerBorderColorHex = document.getElementById('bannerBorderColorHex');
  elements.bannerBorderWidth = document.getElementById('bannerBorderWidth');
  elements.bannerBorderWidthVal = document.getElementById('bannerBorderWidthVal');
  elements.bannerPosY = document.getElementById('bannerPosY');
  elements.bannerPosYVal = document.getElementById('bannerPosYVal');

  elements.scaleXEnabled = document.getElementById('scaleXEnabled');
  elements.maxWidthPercent = document.getElementById('maxWidthPercent');
  elements.maxWidthPercentVal = document.getElementById('maxWidthPercentVal');

  elements.downloadCompositeBtn = document.getElementById('downloadCompositeBtn');
  elements.downloadTransparentBtn = document.getElementById('downloadTransparentBtn');
  elements.copyClipboardBtn = document.getElementById('copyClipboardBtn');
}

function initCanvas() {
  canvas.width = 1920;
  canvas.height = 1080;
}

// Synchronous Pattern Initialization from Base64
function initDefaultPattern() {
  try {
    const src = (typeof DEFAULT_PATTERN_BASE64 !== 'undefined') ? DEFAULT_PATTERN_BASE64 : './pattern.png';
    const img = new Image();
    img.onload = () => {
      state.patternImg = img;
      if (elements.patternTilePreview) {
        elements.patternTilePreview.style.backgroundImage = `url('${src}')`;
      }
      render();
    };
    img.onerror = () => {
      console.warn('Pattern base64 load error, using procedural pattern fallback');
      state.patternImg = createFallbackPatternImage();
      render();
    };
    img.src = src;
    state.patternImg = img;
  } catch (err) {
    console.warn('Pattern init exception:', err);
    state.patternImg = createFallbackPatternImage();
  }
}

// Background Font Loader
async function loadCustomFontInBackground() {
  try {
    const font = new FontFace('極太明朝', "url('./font/極太明朝.ttf')");
    const loadedFont = await font.load();
    document.fonts.add(loadedFont);
    console.log('極太明朝.ttf loaded');
    render();
  } catch (err) {
    console.warn('Font load notice (CSS @font-face or fallback active):', err);
  }
}

function createFallbackPatternImage() {
  const offCanvas = document.createElement('canvas');
  offCanvas.width = 100;
  offCanvas.height = 100;
  const oCtx = offCanvas.getContext('2d');
  oCtx.fillStyle = '#5A2A82';
  oCtx.fillRect(0, 0, 100, 100);
  oCtx.fillStyle = '#3D1A5C';
  oCtx.beginPath();
  oCtx.arc(50, 50, 20, 0, Math.PI * 2);
  oCtx.fill();
  const img = new Image();
  img.src = offCanvas.toDataURL();
  return img;
}

// Bind UI Events
function bindEvents() {
  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const pane = document.getElementById(btn.dataset.tab);
      if (pane) pane.classList.add('active');
    });
  });

  // Background Presets
  document.querySelectorAll('.preset-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.preset-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.bgMode = pill.dataset.bg;
      render();
    });
  });

  // User Background Upload (100% Local FileReader)
  if (elements.bgFileInput) {
    elements.bgFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            state.userBgImg = img;
            state.bgMode = 'user';
            canvas.width = img.naturalWidth || 1920;
            canvas.height = img.naturalHeight || 1080;
            
            document.querySelectorAll('.preset-pill').forEach(p => p.classList.remove('active'));
            render();
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Custom Font File Upload (.ttf / .otf / .woff)
  if (elements.fontFileInput) {
    elements.fontFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const fontName = 'CustomFont_' + Date.now();
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const fontFace = new FontFace(fontName, event.target.result);
            await fontFace.load();
            document.fonts.add(fontFace);

            const option = document.createElement('option');
            option.value = `'${fontName}', serif`;
            option.textContent = `✨ ${file.name.replace(/\.[^/.]+$/, '')} (独自フォント)`;
            option.selected = true;
            elements.fontSelect.appendChild(option);

            state.fontFamily = `'${fontName}', serif`;

            elements.loadedFontStatus.style.display = 'block';
            elements.loadedFontStatus.textContent = `✅ フォント「${file.name}」の読み込みに成功しました！`;
            
            render();
          } catch (fontErr) {
            console.error('Font load error:', fontErr);
            alert('フォントファイルの読み込みに失敗しました。有効な.ttfまたは.otfファイルか確認してください。');
          }
        };
        reader.readAsArrayBuffer(file);
      }
    });
  }

  // User Pattern Upload
  if (elements.patternFileInput) {
    elements.patternFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            state.patternImg = img;
            if (elements.patternTilePreview) {
              elements.patternTilePreview.style.backgroundImage = `url('${event.target.result}')`;
            }
            render();
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (elements.resetPatternBtn) {
    elements.resetPatternBtn.addEventListener('click', () => {
      initDefaultPattern();
      render();
    });
  }

  // Inputs Binds
  bindInput('textInput', 'text');
  bindInput('subtextInput', 'subtext');
  bindInput('fontSelect', 'fontFamily');
  bindRange('fontSize', 'fontSize', 'fontSizeVal');
  bindRange('letterSpacing', 'letterSpacing', 'letterSpacingVal');
  bindColor('textColor', 'textColor', 'textColorHex');

  // Text Scale X / Y
  bindRange('textScaleX', 'textScaleX', 'textScaleXVal', true);
  bindRange('textScaleY', 'textScaleY', 'textScaleYVal', true);

  bindColor('stroke1Color', 'stroke1Color', 'stroke1ColorHex');
  bindRange('stroke1Width', 'stroke1Width', 'stroke1WidthVal');
  bindColor('stroke2Color', 'stroke2Color', 'stroke2ColorHex');
  bindRange('stroke2Width', 'stroke2Width', 'stroke2WidthVal');
  bindColor('shadowColor', 'shadowColor', 'shadowColorHex');
  bindRange('shadowBlur', 'shadowBlur', 'shadowBlurVal');

  bindRange('patternScale', 'patternScale', 'patternScaleVal', true);
  bindRange('bannerPaddingX', 'bannerPaddingX', 'bannerPaddingXVal');
  bindRange('bannerHeight', 'bannerHeight', 'bannerHeightVal');
  bindRange('bannerRadius', 'bannerRadius', 'bannerRadiusVal');
  bindColor('bannerBorderColor', 'bannerBorderColor', 'bannerBorderColorHex');
  bindRange('bannerBorderWidth', 'bannerBorderWidth', 'bannerBorderWidthVal');
  bindRange('bannerPosY', 'bannerPosY', 'bannerPosYVal');

  if (elements.scaleXEnabled) {
    elements.scaleXEnabled.addEventListener('change', (e) => {
      state.scaleXEnabled = e.target.checked;
      render();
    });
  }

  bindRange('maxWidthPercent', 'maxWidthPercent', 'maxWidthPercentVal');

  // Downloads
  if (elements.downloadCompositeBtn) elements.downloadCompositeBtn.addEventListener('click', downloadCompositePhoto);
  if (elements.downloadTransparentBtn) elements.downloadTransparentBtn.addEventListener('click', downloadTransparentTelop);
  if (elements.copyClipboardBtn) elements.copyClipboardBtn.addEventListener('click', copyToClipboard);

  // Font loading re-render
  if (document.fonts) {
    document.fonts.ready.then(() => render()).catch(() => {});
  }
}

function bindInput(id, stateKey) {
  if (!elements[id]) return;
  elements[id].addEventListener('input', (e) => {
    state[stateKey] = e.target.value;
    render();
  });
}

function bindRange(id, stateKey, valDisplayId, isFloat = false) {
  if (!elements[id]) return;
  elements[id].addEventListener('input', (e) => {
    const val = isFloat ? parseFloat(e.target.value) : parseInt(e.target.value, 10);
    state[stateKey] = val;
    if (elements[valDisplayId]) elements[valDisplayId].textContent = val;
    render();
  });
}

function bindColor(id, stateKey, hexDisplayId) {
  if (!elements[id]) return;
  elements[id].addEventListener('input', (e) => {
    state[stateKey] = e.target.value;
    if (elements[hexDisplayId]) elements[hexDisplayId].textContent = e.target.value.toUpperCase();
    render();
  });
}

// RENDER ENGINE
function render() {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. Draw Background
  drawBackground(ctx, canvas.width, canvas.height);

  // 2. Draw Telop Overlay
  drawTelop(ctx, canvas.width, canvas.height);
}

// 1. Background Renderer
function drawBackground(cCtx, width, height) {
  if (state.bgMode === 'user' && state.userBgImg) {
    cCtx.drawImage(state.userBgImg, 0, 0, width, height);
    return;
  }

  if (state.bgMode === 'transparent') {
    const size = 32;
    for (let x = 0; x < width; x += size) {
      for (let y = 0; y < height; y += size) {
        cCtx.fillStyle = ((x / size + y / size) % 2 === 0) ? '#1E1B2E' : '#141122';
        cCtx.fillRect(x, y, size, size);
      }
    }
    return;
  }

  if (state.bgMode === 'dark') {
    cCtx.fillStyle = '#0a0812';
    cCtx.fillRect(0, 0, width, height);
    return;
  }

  // Sample Procedural Anime Style Backgrounds
  if (state.bgMode === 'sunset') {
    const grad = cCtx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#1a0033');
    grad.addColorStop(0.4, '#660066');
    grad.addColorStop(0.7, '#cc3366');
    grad.addColorStop(1, '#ff9966');
    cCtx.fillStyle = grad;
    cCtx.fillRect(0, 0, width, height);

    const sunGrad = cCtx.createRadialGradient(width * 0.7, height * 0.5, 10, width * 0.7, height * 0.5, 200);
    sunGrad.addColorStop(0, 'rgba(255, 240, 200, 0.9)');
    sunGrad.addColorStop(0.3, 'rgba(255, 120, 150, 0.5)');
    sunGrad.addColorStop(1, 'rgba(255, 120, 150, 0)');
    cCtx.fillStyle = sunGrad;
    cCtx.fillRect(0, 0, width, height);
  } else if (state.bgMode === 'night') {
    const grad = cCtx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#050314');
    grad.addColorStop(0.5, '#120b38');
    grad.addColorStop(1, '#2b1055');
    cCtx.fillStyle = grad;
    cCtx.fillRect(0, 0, width, height);

    cCtx.fillStyle = 'rgba(199, 125, 255, 0.2)';
    for (let i = 0; i < 20; i++) {
      const bx = (Math.sin(i * 99) * 0.5 + 0.5) * width;
      const by = (Math.cos(i * 33) * 0.3 + 0.5) * height;
      cCtx.beginPath();
      cCtx.arc(bx, by, 40 + (i % 5) * 20, 0, Math.PI * 2);
      cCtx.fill();
    }
  } else if (state.bgMode === 'room') {
    const grad = cCtx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#2d1b4e');
    grad.addColorStop(0.5, '#1c1032');
    grad.addColorStop(1, '#0d0718');
    cCtx.fillStyle = grad;
    cCtx.fillRect(0, 0, width, height);
  }
}

// 2. Telop Overlay Renderer
function drawTelop(cCtx, width, height) {
  const text = state.text || ' ';
  cCtx.save();

  // Font setup
  cCtx.font = `${state.fontSize}px ${state.fontFamily}`;

  // Base unscaled text width measurement
  const baseUnscaledTextWidth = measureTextWithSpacing(cCtx, text, state.letterSpacing);

  // Apply user manual textScaleX
  const userTextWidth = baseUnscaledTextWidth * state.textScaleX;

  // Maximum allowed inner text width inside banner
  const maxBannerWidth = width * (state.maxWidthPercent / 100);
  const maxAvailableTextWidth = Math.max(50, maxBannerWidth - (state.bannerPaddingX * 2));

  // Compute final effective scaleX
  let finalScaleX = state.textScaleX;
  if (state.scaleXEnabled && userTextWidth > maxAvailableTextWidth && maxAvailableTextWidth > 0) {
    const autoFactor = maxAvailableTextWidth / userTextWidth;
    finalScaleX = state.textScaleX * autoFactor;
  }
  state.currentScaleX = finalScaleX;

  // Update Scale Badge Indicator
  updateScaleBadge(finalScaleX / state.textScaleX);

  // Computed Banner Width (expands horizontally matching text scale)
  const finalScaledTextWidth = baseUnscaledTextWidth * finalScaleX;
  const bannerWidth = Math.min(finalScaledTextWidth + (state.bannerPaddingX * 2), maxBannerWidth);
  const bannerHeight = state.bannerHeight;

  // Banner Center Coordinates
  const bannerX = (width - bannerWidth) / 2;
  const bannerY = height * (1 - (state.bannerPosY / 100)) - (bannerHeight / 2);

  // A. Draw Telop Pattern Background
  if (state.patternImg) {
    cCtx.save();
    
    let patternSource = state.patternImg;
    if (state.patternScale !== 1.0) {
      patternSource = getScaledPatternCanvas(state.patternImg, state.patternScale);
    }

    try {
      const pattern = cCtx.createPattern(patternSource, 'repeat');
      if (pattern) {
        cCtx.fillStyle = pattern;
        drawRoundedRect(cCtx, bannerX, bannerY, bannerWidth, bannerHeight, state.bannerRadius);
        cCtx.fill();
      }
    } catch (e) {
      console.warn('Pattern fill notice:', e);
      cCtx.fillStyle = '#5A2A82';
      drawRoundedRect(cCtx, bannerX, bannerY, bannerWidth, bannerHeight, state.bannerRadius);
      cCtx.fill();
    }

    if (state.bannerBorderWidth > 0) {
      cCtx.strokeStyle = state.bannerBorderColor;
      cCtx.lineWidth = state.bannerBorderWidth;
      drawRoundedRect(cCtx, bannerX, bannerY, bannerWidth, bannerHeight, state.bannerRadius);
      cCtx.stroke();
    }
    cCtx.restore();
  }

  // B. Draw Subtext / Speaker Tag (Only if non-empty!)
  if (state.subtext && state.subtext.trim() !== '') {
    cCtx.save();
    const tagFontSize = Math.max(18, Math.round(state.fontSize * 0.35));
    cCtx.font = `${tagFontSize}px ${state.fontFamily}`;
    cCtx.fillStyle = '#E0AAFF';
    cCtx.shadowColor = 'rgba(0,0,0,0.8)';
    cCtx.shadowBlur = 4;
    
    const tagX = bannerX + 16;
    const tagY = bannerY - 12;
    cCtx.fillText(state.subtext, tagX, tagY);
    cCtx.restore();
  }

  // C. Draw Main Text with finalScaleX and textScaleY
  cCtx.save();
  const textCenterY = bannerY + (bannerHeight / 2) + ((state.fontSize * state.textScaleY) * 0.36);
  const textAnchorX = bannerX + (bannerWidth / 2);

  cCtx.translate(textAnchorX, textCenterY);
  cCtx.scale(finalScaleX, state.textScaleY);

  // 1. Text Shadow
  if (state.shadowBlur > 0) {
    cCtx.shadowColor = state.shadowColor;
    cCtx.shadowBlur = state.shadowBlur;
    cCtx.shadowOffsetX = 2;
    cCtx.shadowOffsetY = 4;
  }

  // 2. Stroke 2 (Outer Outline)
  if (state.stroke2Width > 0) {
    cCtx.strokeStyle = state.stroke2Color;
    cCtx.lineWidth = (state.stroke1Width + state.stroke2Width) * 2;
    cCtx.lineJoin = 'round';
    cCtx.miterLimit = 2;
    strokeTextWithSpacing(cCtx, text, 0, 0, state.letterSpacing);
  }

  cCtx.shadowColor = 'transparent';

  // 3. Stroke 1 (Inner Outline)
  if (state.stroke1Width > 0) {
    cCtx.strokeStyle = state.stroke1Color;
    cCtx.lineWidth = state.stroke1Width * 2;
    cCtx.lineJoin = 'round';
    cCtx.miterLimit = 2;
    strokeTextWithSpacing(cCtx, text, 0, 0, state.letterSpacing);
  }

  // 4. Main Fill Text
  cCtx.fillStyle = state.textColor;
  fillTextWithSpacing(cCtx, text, 0, 0, state.letterSpacing);

  cCtx.restore();
  cCtx.restore();
}

// Helpers for Letter Spacing & Drawing
function measureTextWithSpacing(cCtx, text, spacing) {
  const chars = Array.from(text);
  let totalWidth = 0;
  chars.forEach((char, index) => {
    totalWidth += cCtx.measureText(char).width;
    if (index < chars.length - 1) totalWidth += spacing;
  });
  return totalWidth;
}

function fillTextWithSpacing(cCtx, text, x, y, spacing) {
  const chars = Array.from(text);
  const totalWidth = measureTextWithSpacing(cCtx, text, spacing);
  
  cCtx.save();
  cCtx.textAlign = 'left';

  let currentX = x - (totalWidth / 2);

  chars.forEach((char) => {
    const charWidth = cCtx.measureText(char).width;
    cCtx.fillText(char, currentX, y);
    currentX += charWidth + spacing;
  });
  cCtx.restore();
}

function strokeTextWithSpacing(cCtx, text, x, y, spacing) {
  const chars = Array.from(text);
  const totalWidth = measureTextWithSpacing(cCtx, text, spacing);

  cCtx.save();
  cCtx.textAlign = 'left';

  let currentX = x - (totalWidth / 2);

  chars.forEach((char) => {
    const charWidth = cCtx.measureText(char).width;
    cCtx.strokeText(char, currentX, y);
    currentX += charWidth + spacing;
  });
  cCtx.restore();
}

function drawRoundedRect(cCtx, x, y, width, height, radius) {
  if (radius <= 0) {
    cCtx.beginPath();
    cCtx.rect(x, y, width, height);
    cCtx.closePath();
    return;
  }
  const r = Math.min(radius, width / 2, height / 2);
  cCtx.beginPath();
  cCtx.moveTo(x + r, y);
  cCtx.lineTo(x + width - r, y);
  cCtx.arcTo(x + width, y, x + width, y + height, r);
  cCtx.lineTo(x + width, y + height - r);
  cCtx.arcTo(x + width, y + height, x + width - r, y + height, r);
  cCtx.lineTo(x + r, y + height);
  cCtx.arcTo(x, y + height, x, y + height - r, r);
  cCtx.lineTo(x, y + r);
  cCtx.arcTo(x, y, x + r, y, r);
  cCtx.closePath();
}

function getScaledPatternCanvas(img, scale) {
  const pCanvas = document.createElement('canvas');
  pCanvas.width = Math.max(1, Math.round(img.width * scale));
  pCanvas.height = Math.max(1, Math.round(img.height * scale));
  const pCtx = pCanvas.getContext('2d');
  pCtx.drawImage(img, 0, 0, pCanvas.width, pCanvas.height);
  return pCanvas;
}

function updateScaleBadge(ratio) {
  if (!elements.scaleBadge || !elements.scaleBadgeText) return;
  if (ratio < 0.999) {
    const pct = (ratio * 100).toFixed(1);
    elements.scaleBadgeText.textContent = `ScaleX: ${pct}% (自動収縮中)`;
    elements.scaleBadge.classList.add('scaling');
  } else {
    elements.scaleBadgeText.textContent = `ScaleX: 100% (標準)`;
    elements.scaleBadge.classList.remove('scaling');
  }
}

// EXPORT HANDLERS
function downloadCompositePhoto() {
  try {
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    link.download = `yokatta_telop_composite_${Date.now()}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Download error:', err);
    alert('画像のダウンロード中にエラーが発生しました。');
  }
}

function downloadTransparentTelop() {
  try {
    const offscreen = document.createElement('canvas');
    offscreen.width = canvas.width;
    offscreen.height = canvas.height;
    const oCtx = offscreen.getContext('2d');

    // Draw Telop ONLY
    drawTelop(oCtx, offscreen.width, offscreen.height);

    const dataUrl = offscreen.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    link.download = `yokatta_telop_transparent_${Date.now()}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Download error:', err);
    alert('透過画像のダウンロード中にエラーが発生しました。');
  }
}

async function copyToClipboard() {
  try {
    canvas.toBlob(async (blob) => {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      alert('📋 合成画像をクリップボードにコピーしました！');
    });
  } catch (err) {
    console.error(err);
    alert('クリップボードへのコピーに失敗しました。ダウンロードボタンをご利用ください。');
  }
}
