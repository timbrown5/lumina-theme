import type { ThemeParams, Base24Colors } from '../types/index.ts';
import { lab, formatHex } from 'culori';

// Convert HSL values to hex color string
export const hslToRgb = (h: number, s: number, l: number): string => {
  const hNorm = h / 360;
  const sNorm = s / 100;
  const lNorm = l / 100;

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((hNorm * 6) % 2) - 1));
  const m = lNorm - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (hNorm >= 0 && hNorm < 1 / 6) {
    r = c;
    g = x;
    b = 0;
  } else if (hNorm >= 1 / 6 && hNorm < 2 / 6) {
    r = x;
    g = c;
    b = 0;
  } else if (hNorm >= 2 / 6 && hNorm < 3 / 6) {
    r = 0;
    g = c;
    b = x;
  } else if (hNorm >= 3 / 6 && hNorm < 4 / 6) {
    r = 0;
    g = x;
    b = c;
  } else if (hNorm >= 4 / 6 && hNorm < 5 / 6) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const adjustColorPerceptually = (h: number, s: number, l: number): string => {
  const basicColor = hslToRgb(h, s, l);

  try {
    const labColor = lab(basicColor);
    if (!labColor || typeof labColor.l !== 'number') {
      return basicColor;
    }

    const chroma = Math.sqrt((labColor.a || 0) ** 2 + (labColor.b || 0) ** 2);
    const hueAngle = (Math.atan2(labColor.b || 0, labColor.a || 0) * 180) / Math.PI;
    const normalizedHue = (hueAngle + 360) % 360;

    let targetLightness = labColor.l;

    if (chroma > 35) {
      if (normalizedHue >= 70 && normalizedHue <= 130) {
        if (targetLightness > 65) {
          targetLightness = targetLightness * 0.94;
        }
      } else if (normalizedHue >= 130 && normalizedHue <= 180) {
        if (targetLightness > 60) {
          targetLightness = targetLightness * 0.88;
        }
      } else if (normalizedHue >= 180 && normalizedHue <= 220) {
        if (targetLightness > 75) {
          targetLightness = targetLightness * 0.95;
        }
      }
    }

    if (Math.abs(targetLightness - labColor.l) > 0.1) {
      const adjustedLabColor = { ...labColor, l: targetLightness };
      const result = formatHex(adjustedLabColor);
      if (result && result !== '#000000' && result !== '#ffffff') {
        return result;
      }
    }

    return basicColor;
  } catch (error) {
    console.warn('Color adjustment failed, using basic color:', error);
    return basicColor;
  }
};

export const adjustedHslToRgb = (h: number, s: number, l: number): string => {
  return adjustColorPerceptually(h, s, l);
};

// Utility functions for UI sliders and gradients
export const createGradientBg = (colors: string[]): string =>
  `linear-gradient(90deg, ${colors.join(', ')})`;

export const generateHueGradient = (steps: number = 25): string[] => {
  return Array.from({ length: steps }, (_, i) => {
    const hue = (360 * i) / (steps - 1);
    return hslToRgb(hue, 80, 60);
  });
};

export const generateAccentHueGradient = (
  baseHue: number,
  minAdjustment: number,
  maxAdjustment: number,
  steps: number = 25
): string[] => {
  return Array.from({ length: steps }, (_, i) => {
    const adjustment = minAdjustment + ((maxAdjustment - minAdjustment) * i) / (steps - 1);
    const finalHue = (baseHue + adjustment + 360) % 360;
    return hslToRgb(finalHue, 80, 60);
  });
};

export const generateSaturationGradient = (hue: number): string[] => [
  hslToRgb(hue, 0, 50),
  hslToRgb(hue, 100, 50),
];

export const generateLightnessGradient = (hue: number, saturation: number): string[] => [
  hslToRgb(hue, saturation, 0),
  hslToRgb(hue, saturation, 50),
  hslToRgb(hue, saturation, 100),
];

const getMutedLightness = (accentLightness: number): number => {
  const minDifference = 8;
  const maxDifference = 18;
  const maxMutedLightness = 85;

  const t = accentLightness / 100;
  const difference = maxDifference - (maxDifference - minDifference) * t * t;

  return Math.min(maxMutedLightness, accentLightness + difference);
};

export const generateColors = (params: ThemeParams): Base24Colors => {
  const isLight = params.bgLight > 50;

  // Background colors
  const base00 = hslToRgb(params.bgHue, params.bgSat, params.bgLight);
  const base01 = hslToRgb(
    params.bgHue,
    Math.min(100, params.bgSat * 1.2),
    Math.max(0, Math.min(100, params.bgLight + (isLight ? -4 : 4)))
  );
  const base02 = hslToRgb(
    params.bgHue,
    Math.min(100, params.bgSat * 1.5),
    Math.max(0, Math.min(100, params.bgLight + (isLight ? -8 : 8)))
  );

  // Comments
  const commentHue = (params.bgHue + (isLight ? 180 : 0)) % 360;
  const base03 = hslToRgb(commentHue, 15, params.commentLight);

  // Foreground colors
  const fgLight = isLight ? 15 : 85;
  const base04 = hslToRgb(params.bgHue, 20, Math.max(0, Math.min(100, fgLight + 15)));
  const base05 = hslToRgb(params.bgHue, 15, fgLight);
  const base06 = hslToRgb(params.bgHue, 12, Math.max(0, Math.min(100, fgLight - 5)));
  const base07 = hslToRgb(params.bgHue, 10, Math.max(0, Math.min(100, fgLight - 10)));

  // Accent color hue positions
  const accentHueOffsets = [0, 30, 60, 120, 180, 210, 270, 330];
  const accentHues = accentHueOffsets.map((offset) => {
    let hue = params.accentHue + offset;
    while (hue < 0) hue += 360;
    while (hue >= 360) hue -= 360;
    return hue;
  });

  const accents = accentHues.map((hue) => {
    return adjustedHslToRgb(hue, params.accentSat, params.foregroundLight);
  });

  const mutedSat = Math.max(25, params.accentSat * 0.7);
  const mutedLight = getMutedLightness(params.foregroundLight);
  const muted = accentHues.map((hue) => {
    return adjustedHslToRgb(hue, mutedSat, mutedLight);
  });

  return {
    base00,
    base01,
    base02,
    base03,
    base04,
    base05,
    base06,
    base07,
    base08: accents[0],
    base09: accents[1],
    base0A: accents[2],
    base0B: accents[3],
    base0C: accents[4],
    base0D: accents[5],
    base0E: accents[6],
    base0F: accents[7],
    base10: muted[0],
    base11: muted[1],
    base12: muted[2],
    base13: muted[3],
    base14: muted[4],
    base15: muted[5],
    base16: muted[6],
    base17: muted[7],
  };
};
