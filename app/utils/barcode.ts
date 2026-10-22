/**
 * Code 128 Barcode & QR Code SVG Generators for Student ID Cards
 * Lightweight, zero-dependency, works entirely in browser and SSR.
 */

// Code 128B pattern table (patterns of bar and space widths, 6 digits summing to 11)
const CODE128_PATTERNS = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
  '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
  '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
  '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
  '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
  '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
  '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
  '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
  '114131', '311141', '411131', '211412', '211214', '211232', '2331112' // 106 = Stop
];

const START_CODE_B = 104;
const STOP_CODE = 106;

/**
 * Generates an SVG string containing a Code 128B barcode.
 */
export function generateBarcodeSvg(text: string, height = 36): string {
  const safeText = (text || 'CARD').slice(0, 30);
  const codes: number[] = [START_CODE_B];

  for (let i = 0; i < safeText.length; i++) {
    const code = safeText.charCodeAt(i) - 32;
    codes.push(Math.max(0, Math.min(code, 95)));
  }

  // Calculate checksum
  let checksum = codes[0] ?? START_CODE_B;
  for (let i = 1; i < codes.length; i++) {
    const val = codes[i] ?? 0;
    checksum += val * i;
  }
  codes.push(checksum % 103);
  codes.push(STOP_CODE);

  // Convert codes to bar pattern string
  let pattern = '';
  for (const c of codes) {
    pattern += CODE128_PATTERNS[c] || '212222';
  }

  // Calculate total modules
  let totalModules = 0;
  for (let i = 0; i < pattern.length; i++) {
    totalModules += parseInt(pattern[i] ?? '1', 10);
  }

  // Build SVG rects
  let x = 0;
  let rects = '';
  for (let i = 0; i < pattern.length; i++) {
    const width = parseInt(pattern[i] ?? '1', 10);
    const isBar = i % 2 === 0;
    if (isBar) {
      rects += `<rect x="${x}" y="0" width="${width}" height="${height}" fill="currentColor" />`;
    }
    x += width;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalModules} ${height}" class="w-full h-full" preserveAspectRatio="none">${rects}</svg>`;
}

/**
 * Generates a clean procedural 2D QR-style SVG pattern for student badges.
 * Deterministic based on input text with corner finder marks.
 */
export function generateQrCodeSvg(text: string, size = 64): string {
  const matrixSize = 21; // 21x21 standard Version 1 grid
  const grid: boolean[] = new Array(matrixSize * matrixSize).fill(false);

  const setCell = (r: number, c: number, val = true) => {
    if (r >= 0 && r < matrixSize && c >= 0 && c < matrixSize) {
      grid[r * matrixSize + c] = val;
    }
  };

  const isCell = (r: number, c: number): boolean => {
    return Boolean(grid[r * matrixSize + c]);
  };

  // Finder patterns at top-left, top-right, bottom-left
  const addFinder = (row: number, col: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          setCell(row + r, col + c, true);
        }
      }
    }
  };

  addFinder(0, 0);
  addFinder(0, matrixSize - 7);
  addFinder(matrixSize - 7, 0);

  // Timing patterns
  for (let i = 8; i < matrixSize - 8; i++) {
    if (i % 2 === 0) {
      setCell(6, i, true);
      setCell(i, 6, true);
    }
  }

  // Deterministic hash fill for data area
  let hash = 0;
  const str = text || 'SMART-SCHOOL';
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }

  let bitIdx = 0;
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      // Skip finder areas
      const inTL = r < 9 && c < 9;
      const inTR = r < 9 && c >= matrixSize - 8;
      const inBL = r >= matrixSize - 8 && c < 9;
      if (inTL || inTR || inBL || r === 6 || c === 6) continue;

      const pseudoBit = ((hash >> (bitIdx % 28)) ^ (r * 13 + c * 7 + bitIdx)) & 1;
      setCell(r, c, pseudoBit === 1);
      bitIdx++;
    }
  }

  // Generate SVG path for crisp scaling
  let path = '';
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (isCell(r, c)) {
        path += `M${c},${r}h1v1h-1z `;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${matrixSize} ${matrixSize}" width="${size}" height="${size}" class="w-full h-full text-slate-900 dark:text-white"><path d="${path}" fill="currentColor" /></svg>`;
}
