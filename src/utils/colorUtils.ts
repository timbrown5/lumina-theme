/**
 * Core color generation engine for Lumina Theme Generator.
 * Converts theme parameters into complete Base24 color schemes using OKHSL color space.
 */

import type { ThemeParams, Base24Colors, AccentColorKey, AccentOffsets, LockableColorKey, ColorOverride, BackgroundColorKey, ForegroundColorKey, MutedColorKey } from '../types/index.js';
import { lab, formatHex } from 'culori';

/**
 * Standard Base16 hue offsets in degrees for color wheel distribution.
 */
export const STANDARD_BASE16_OFFSETS = [0, 30, 60, 150, 180, 210, 270, 330];

/**
 * Maps accent color keys to their index in the standard offset array.
 */
const ACCENT_COLOR_INDEX_MAP: Record<AccentColorKey, number> = {
  base08: 0, // Red
  base09: 1, // Orange
  base0A: 2, // Yellow
  base0B: 3, // Green
  base0C: 4, // Cyan
  base0D: 5, // Blue
  base0E: 6, // Purple
  base0F: 7, // Pink
};

const COLOR_NAMES = ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple', 'pink'] as const;

/**
 * Gets the standard Base16 hue offset for an accent color.
 */
export function getStandardOffset(colorKey: AccentColorKey): number {
  const index = ACCENT_COLOR_INDEX_MAP[colorKey];
  return STANDARD_BASE16_OFFSETS[index] ?? 0;
}

/**
 * Gets the accent offset for a color from the given offsets map.
 */
export function getAccentOffset(offsets: AccentOffsets | null, colorKey: AccentColorKey): number {
  if (!offsets) return 0;
  const index = ACCENT_COLOR_INDEX_MAP[colorKey];
  const name = COLOR_NAMES[index];
  return offsets[name]?.hue ?? 0;
}

/**
 * Gets all accent offsets as an array from an offsets map.
 */
export function getAccentOffsetsArray(offsets: AccentOffsets | null): number[] {
  if (!offsets) return [0, 0, 0, 0, 0, 0, 0, 0];
  return COLOR_NAMES.map(name => offsets[name]?.hue ?? 0);
}

/**
 * Calculates final hue combining all adjustments.
 * Formula: Base Accent Hue + Standard Offset + Accent Offset + User Adjustment
 */
export function getFinalHue(
  params: ThemeParams,
  colorKey: AccentColorKey,
  accentOffsets: AccentOffsets | null
): number {
  const baseHue = params.accentHue || 0;
  const standardOffset = getStandardOffset(colorKey);
  const accentOffset = getAccentOffset(accentOffsets, colorKey);
  const userAdjustment = params.colorAdjustments?.[colorKey]?.hueOffset ?? 0;

  let finalHue = baseHue + standardOffset + accentOffset + userAdjustment;

  while (finalHue < 0) finalHue += 360;
  while (finalHue >= 360) finalHue -= 360;

  return Math.round(finalHue);
}

/**
 * Extracts user's hue adjustment for a specific accent color.
 */
export function getUserAdjustment(params: ThemeParams, colorKey: AccentColorKey): number {
  return params.colorAdjustments?.[colorKey]?.hueOffset ?? 0;
}

const BACKGROUND_KEYS: BackgroundColorKey[] = ['base00', 'base01', 'base02'];
const FOREGROUND_KEYS: ForegroundColorKey[] = ['base03', 'base04', 'base05', 'base06', 'base07'];
const MUTED_KEYS: MutedColorKey[] = ['base10', 'base11', 'base12', 'base13', 'base14', 'base15', 'base16', 'base17'];
const MUTED_TO_ACCENT: Record<MutedColorKey, AccentColorKey> = {
  base10: 'base08', base11: 'base09', base12: 'base0A', base13: 'base0B',
  base14: 'base0C', base15: 'base0D', base16: 'base0E', base17: 'base0F',
};

/**
 * Returns effective H/S/L for any lockable color.
 * If the color has an override, returns the override values.
 * Otherwise, computes the parametric values.
 */
export function getEffectiveHSL(
  params: ThemeParams,
  colorKey: LockableColorKey,
  accentOffsets: AccentOffsets | null
): { hue: number; saturation: number; lightness: number } {
  const override = params.colorOverrides?.[colorKey];
  if (override) {
    return { ...override };
  }

  const isLight = params.bgLight > 50;

  if (BACKGROUND_KEYS.includes(colorKey as BackgroundColorKey)) {
    switch (colorKey) {
      case 'base00':
        return { hue: params.bgHue, saturation: params.bgSat, lightness: params.bgLight };
      case 'base01':
        return {
          hue: params.bgHue,
          saturation: Math.min(100, params.bgSat * 1.2),
          lightness: Math.max(0, Math.min(100, params.bgLight + (isLight ? -4 : 4))),
        };
      case 'base02':
        return {
          hue: params.bgHue,
          saturation: Math.min(100, params.bgSat * 1.5),
          lightness: Math.max(0, Math.min(100, params.bgLight + (isLight ? -8 : 8))),
        };
    }
  }

  if (FOREGROUND_KEYS.includes(colorKey as ForegroundColorKey)) {
    const autoForegroundLight = isLight ? 5 : 95;
    switch (colorKey) {
      case 'base03': {
        const commentHue = (params.bgHue + (isLight ? 180 : 0)) % 360;
        return { hue: commentHue, saturation: 15, lightness: params.commentLight };
      }
      case 'base04': {
        const base04Light = isLight
          ? Math.min(100, autoForegroundLight + 15)
          : Math.max(0, autoForegroundLight - 15);
        return { hue: params.bgHue, saturation: 20, lightness: base04Light };
      }
      case 'base05':
        return { hue: params.bgHue, saturation: 15, lightness: autoForegroundLight };
      case 'base06': {
        const base06Hue = (params.bgHue + (isLight ? -60 : 60) + 360) % 360;
        return { hue: base06Hue, saturation: params.bgSat, lightness: isLight ? 20 : 80 };
      }
      case 'base07': {
        const base07Hue = (params.bgHue + (isLight ? 60 : -60) + 360) % 360;
        return { hue: base07Hue, saturation: params.bgSat, lightness: isLight ? 20 : 80 };
      }
    }
  }

  if (MUTED_KEYS.includes(colorKey as MutedColorKey)) {
    const parentAccent = MUTED_TO_ACCENT[colorKey as MutedColorKey];
    const parentHSL = getEffectiveHSL(params, parentAccent, accentOffsets);
    const mutedSat = Math.max(25, parentHSL.saturation * 0.7);
    const mutedLight = getMutedLightness(parentHSL.lightness);
    return { hue: parentHSL.hue, saturation: mutedSat, lightness: mutedLight };
  }

  // Accent color
  const finalHue = getFinalHue(params, colorKey as AccentColorKey, accentOffsets);
  return { hue: finalHue, saturation: params.accentSat, lightness: params.accentLight };
}

/**
 * Converts HSL values to RGB hex string.
 */
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

/**
 * Pulls accent L* toward the neutral-gray baseline at the same HSL lightness.
 * Yellow/green (high L*) get pulled down, purple/blue (low L*) get pulled up.
 * Low-chroma colors (backgrounds, foreground) skip correction entirely.
 */
const adjustColorPerceptually = (h: number, s: number, l: number): string => {
  const basic = hslToRgb(h, s, l);
  try {
    const labColor = lab(basic);
    if (!labColor || typeof labColor.l !== 'number') return basic;
    const chroma = Math.sqrt((labColor.a || 0) ** 2 + (labColor.b || 0) ** 2);
    if (chroma < 35) return basic; // skip low-chroma colors
    // Target L* = what an achromatic color at this lightness would be
    const targetLab = lab(hslToRgb(0, 0, l));
    if (!targetLab) return basic;
    const delta = targetLab.l - labColor.l;
    // Only correct when the L* gap is significant — small gaps are natural
    // and correcting them causes muddiness (e.g. yellow at low accentLight)
    if (Math.abs(delta) < 10) return basic;
    const strength = 0.25;
    const newL = labColor.l + delta * strength;
    const result = formatHex({ ...labColor, l: newL });
    if (result && result !== '#000000' && result !== '#ffffff') return result;
    return basic;
  } catch {
    return basic;
  }
};

/**
 * Converts HSL to RGB with perceptual adjustments.
 */
export const adjustedHslToRgb = (h: number, s: number, l: number): string => {
  return adjustColorPerceptually(h, s, l);
};

/**
 * Creates CSS linear gradient from array of colors.
 */
export const createGradientBg = (colors: string[]): string =>
  `linear-gradient(90deg, ${colors.join(', ')})`;

/**
 * Calculates appropriate lightness for muted accent colors.
 */
const getMutedLightness = (accentLightness: number): number => {
  const minDifference = 8;
  const maxDifference = 18;
  const maxMutedLightness = 85;

  const t = accentLightness / 100;
  const difference = maxDifference - (maxDifference - minDifference) * t * t;

  return Math.min(maxMutedLightness, accentLightness + difference);
};

/**
 * Converts theme parameters into complete Base24 color scheme.
 * @param params - Theme parameters including all user customizations
 * @param accentOffsets - Accent color offsets for this theme/variant
 * @returns Complete 24-color Base24 scheme
 */
export const generateColors = (params: ThemeParams, accentOffsets: AccentOffsets | null): Base24Colors => {
  const isLight = params.bgLight > 50;
  const overrides = params.colorOverrides;

  // Base colors (00-07) — check overrides for base00-02
  const bg00 = overrides?.base00;
  const base00 = bg00
    ? hslToRgb(bg00.hue, bg00.saturation, bg00.lightness)
    : hslToRgb(params.bgHue, params.bgSat, params.bgLight);

  const bg01 = overrides?.base01;
  const base01 = bg01
    ? hslToRgb(bg01.hue, bg01.saturation, bg01.lightness)
    : hslToRgb(
        params.bgHue,
        Math.min(100, params.bgSat * 1.2),
        Math.max(0, Math.min(100, params.bgLight + (isLight ? -4 : 4)))
      );

  const bg02 = overrides?.base02;
  const base02 = bg02
    ? hslToRgb(bg02.hue, bg02.saturation, bg02.lightness)
    : hslToRgb(
        params.bgHue,
        Math.min(100, params.bgSat * 1.5),
        Math.max(0, Math.min(100, params.bgLight + (isLight ? -8 : 8)))
      );

  // Foreground & UI colors (03-07) — check overrides
  const fg03 = overrides?.base03;
  const commentHue = (params.bgHue + (isLight ? 180 : 0)) % 360;
  const base03 = fg03
    ? hslToRgb(fg03.hue, fg03.saturation, fg03.lightness)
    : hslToRgb(commentHue, 15, params.commentLight);

  const autoForegroundLight = isLight ? 5 : 95;

  const fg04 = overrides?.base04;
  const base04Light = isLight
    ? Math.min(100, autoForegroundLight + 15)
    : Math.max(0, autoForegroundLight - 15);
  const base04 = fg04
    ? hslToRgb(fg04.hue, fg04.saturation, fg04.lightness)
    : hslToRgb(params.bgHue, 20, base04Light);

  const fg05 = overrides?.base05;
  const base05 = fg05
    ? hslToRgb(fg05.hue, fg05.saturation, fg05.lightness)
    : hslToRgb(params.bgHue, 15, autoForegroundLight);

  const fg06 = overrides?.base06;
  const base06Hue = (params.bgHue + (isLight ? -60 : 60) + 360) % 360;
  const fgSat = Math.min(params.bgSat, 35);
  const base06 = fg06
    ? hslToRgb(fg06.hue, fg06.saturation, fg06.lightness)
    : isLight
      ? hslToRgb(base06Hue, fgSat, 20)
      : hslToRgb(base06Hue, fgSat, 80);

  const fg07 = overrides?.base07;
  const base07Hue = (params.bgHue + (isLight ? 60 : -60) + 360) % 360;
  const base07 = fg07
    ? hslToRgb(fg07.hue, fg07.saturation, fg07.lightness)
    : isLight
      ? hslToRgb(base07Hue, fgSat, 20)
      : hslToRgb(base07Hue, fgSat, 80);

  // Accent colors (08-0F) — check overrides per color
  const accentColorKeys: AccentColorKey[] = [
    'base08', 'base09', 'base0A', 'base0B', 'base0C', 'base0D', 'base0E', 'base0F',
  ];

  const accents = accentColorKeys.map((colorKey) => {
    const accentOverride = overrides?.[colorKey];
    if (accentOverride) {
      return adjustedHslToRgb(accentOverride.hue, accentOverride.saturation, accentOverride.lightness);
    }
    const finalHue = getFinalHue(params, colorKey, accentOffsets);
    return adjustedHslToRgb(finalHue, params.accentSat, params.accentLight);
  });

  // Muted colors (10-17) — check direct override first, else derive from parent accent
  const mutedColorKeys: MutedColorKey[] = [
    'base10', 'base11', 'base12', 'base13', 'base14', 'base15', 'base16', 'base17',
  ];
  const muted = mutedColorKeys.map((mutedKey, i) => {
    const mutedOverride = overrides?.[mutedKey];
    if (mutedOverride) {
      return adjustedHslToRgb(mutedOverride.hue, mutedOverride.saturation, mutedOverride.lightness);
    }
    const accentKey = accentColorKeys[i];
    const accentOverride = overrides?.[accentKey];
    const sat = accentOverride ? accentOverride.saturation : params.accentSat;
    const light = accentOverride ? accentOverride.lightness : params.accentLight;
    const hue = accentOverride ? accentOverride.hue : getFinalHue(params, accentKey, accentOffsets);
    const mutedSat = Math.max(25, sat * 0.7);
    const mutedLight = getMutedLightness(light);
    return adjustedHslToRgb(hue, mutedSat, mutedLight);
  });

  return {
    base00, base01, base02, base03, base04, base05, base06, base07,
    base08: accents[0], base09: accents[1], base0A: accents[2], base0B: accents[3],
    base0C: accents[4], base0D: accents[5], base0E: accents[6], base0F: accents[7],
    base10: muted[0], base11: muted[1], base12: muted[2], base13: muted[3],
    base14: muted[4], base15: muted[5], base16: muted[6], base17: muted[7],
  };
};
