const redSlider = document.getElementById("red");
const greenSlider = document.getElementById("green");
const blueSlider = document.getElementById("blue");

const redVal = document.getElementById("redVal");
const greenVal = document.getElementById("greenVal");
const blueVal = document.getElementById("blueVal");

const hexCode = document.getElementById("hexCode");
const rgbCode = document.getElementById("rgbCode");
const hslCode = document.getElementById("hslCode");
const cmykCode = document.getElementById("cmykCode");

const preview = document.getElementById("preview");
const hexInput = document.getElementById("hexInput");

const saveBtn = document.getElementById("saveColor");
const exportBtn = document.getElementById("exportPalette");
const palette = document.getElementById("palette");
const themeToggle = document.getElementById("themeToggle");

// Initialize palette
let savedColors = JSON.parse(localStorage.getItem("palette")) || [];
renderPalette();

// Update color on slider change
[redSlider, greenSlider, blueSlider].forEach(slider => {
  slider.addEventListener("input", () => {
    const r = +redSlider.value;
    const g = +greenSlider.value;
    const b = +blueSlider.value;
    updateDisplay(rgbToHex(r, g, b), r, g, b);
  });
});

function updateDisplay(hex, r, g, b) {
  preview.style.background = hex;
  redVal.textContent = r;
  greenVal.textContent = g;
  blueVal.textContent = b;

  hexCode.textContent = hex;
  rgbCode.textContent = `rgb(${r},${g},${b})`;

  const hsl = rgbToHsl(r, g, b);
  hslCode.textContent = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

  const cmyk = rgbToCmyk(r, g, b);
  cmykCode.textContent = `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;

  hexInput.value = hex;
  generateShades(hex);
}

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("").toUpperCase();
}

function hexToRgb(hex) {
  hex = hex.replace("#", "");
  const bigint = parseInt(hex, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = { [r]: (g - b) / d + (g < b ? 6 : 0), [g]: (b - r) / d + 2, [b]: (r - g) / d + 4 }[max];
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function rgbToCmyk(r, g, b) {
  let c = 1 - r / 255, m = 1 - g / 255, y = 1 - b / 255;
  let k = Math.min(c, m, y);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  c = ((c - k) / (1 - k)) * 100;
  m = ((m - k) / (1 - k)) * 100;
  y = ((y - k) / (1 - k)) * 100;
  k = k * 100;
  return { c: Math.round(c), m: Math.round(m), y: Math.round(y), k: Math.round(k) };
}

// HEX input
hexInput.addEventListener("input", () => {
  const hex = hexInput.value.trim();
  if (/^#([A-Fa-f0-9]{6})$/.test(hex)) {
    const { r, g, b } = hexToRgb(hex);
    redSlider.value = r; greenSlider.value = g; blueSlider.value = b;
    updateDisplay(hex, r, g, b);
  }
});

// Copy buttons
["Hex", "Rgb", "Hsl", "Cmyk"].forEach(type => {
  document.getElementById(`copy${type}`).addEventListener("click", () => {
    const text = document.getElementById(`${type.toLowerCase()}Code`).textContent;
    navigator.clipboard.writeText(text);
    alert(`${type} copied!`);
  });
});

// Save to palette
saveBtn.addEventListener("click", () => {
  const color = hexCode.textContent;
  if (!savedColors.includes(color)) {
    savedColors.push(color);
    localStorage.setItem("palette", JSON.stringify(savedColors));
    renderPalette();
  }
});

// Render saved palette
function renderPalette() {
  palette.innerHTML = "";
  savedColors.forEach(color => {
    const div = document.createElement("div");
    div.className = "colorBox";
    div.style.background = color;
    div.title = color;
    div.addEventListener("click", () => {
      const { r, g, b } = hexToRgb(color);
      updateDisplay(color, r, g, b);
    });
    palette.appendChild(div);
  });
}

// Export palette
exportBtn.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(savedColors, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "color-palette.json";
  a.click();
  URL.revokeObjectURL(url);
});

// Eyedropper
if ("EyeDropper" in window) {
  const eyedropper = new EyeDropper();
  document.getElementById("eyedropperBtn").addEventListener("click", async () => {
    try {
      const result = await eyedropper.open();
      const hex = result.sRGBHex.toUpperCase();
      const { r, g, b } = hexToRgb(hex);
      redSlider.value = r; greenSlider.value = g; blueSlider.value = b;
      updateDisplay(hex, r, g, b);
    } catch (e) {
      console.log("Eyedropper cancelled", e);
    }
  });
} else {
  document.getElementById("eyedropperBtn").style.display = "none";
}

// Generate shades
function generateShades(hex) {
  const base = hexToRgb(hex);
  const container = document.getElementById("shades");
  container.innerHTML = "";
  for (let i = -3; i <= 3; i++) {
    const factor = 1 + i * 0.1;
    const r = Math.min(255, Math.max(0, base.r * factor));
    const g = Math.min(255, Math.max(0, base.g * factor));
    const b = Math.min(255, Math.max(0, base.b * factor));
    const shadeHex = rgbToHex(Math.round(r), Math.round(g), Math.round(b));
    const div = document.createElement("div");
    div.className = "shadeBox";
    div.style.background = shadeHex;
    div.title = shadeHex;
    div.addEventListener("click", () => {
      const { r, g, b } = hexToRgb(shadeHex);
      updateDisplay(shadeHex, r, g, b);
    });
    container.appendChild(div);
  }
}

// Theme toggle
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  themeToggle.textContent = isDark ? "🌙" : "🌞";
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

// Apply saved theme
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  themeToggle.textContent = "🌙";
}







