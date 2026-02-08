/**
 * Dynamically discovers and loads theme definitions from the themes/ directory.
 *
 * Uses Vite's import.meta.glob to discover all theme JSON files at build time.
 * Theme keys and variant keys are derived from the directory structure:
 *   themes/<themeKey>/<variantKey>.json
 */

import type { BaseTheme, ThemeParams, ThemeFileData, AccentOffsets } from '../types/index.ts';

// Eagerly import all theme JSON files at build time
const themeModules = import.meta.glob('/themes/**/*.json', { eager: true }) as Record<string, { default: ThemeFileData }>;

interface ThemeVariantEntry {
  themeKey: string;
  variantKey: string;
  data: ThemeFileData;
}

// Parse all discovered theme files into a structured registry
function buildRegistry(): {
  themes: Map<string, Map<string, ThemeFileData>>;
  themeKeys: string[];
} {
  const themes = new Map<string, Map<string, ThemeFileData>>();

  for (const [path, module] of Object.entries(themeModules)) {
    // Path format: /themes/<themeKey>/<variantKey>.json
    const match = path.match(/^\/themes\/([^/]+)\/([^/]+)\.json$/);
    if (!match) continue;

    const [, themeKey, variantKey] = match;
    const data = (module as any).default ?? module;

    if (!themes.has(themeKey)) {
      themes.set(themeKey, new Map());
    }
    themes.get(themeKey)!.set(variantKey, data as ThemeFileData);
  }

  const themeKeys = Array.from(themes.keys()).sort();
  return { themes, themeKeys };
}

const registry = buildRegistry();

class ThemeLoader {
  getAllThemeKeys(): string[] {
    return registry.themeKeys;
  }

  getVariantsForTheme(themeKey: string): string[] {
    const variants = registry.themes.get(themeKey);
    if (!variants) return [];
    return Array.from(variants.keys()).sort();
  }

  getThemeVariant(themeKey: string, variantKey: string): ThemeFileData | null {
    return registry.themes.get(themeKey)?.get(variantKey) ?? null;
  }

  getThemeInfo(themeKey: string): BaseTheme | null {
    const variants = registry.themes.get(themeKey);
    if (!variants || variants.size === 0) return null;
    // Use first variant to get theme metadata
    const first = variants.values().next().value;
    if (!first) return null;
    return {
      name: first.name,
      bgHue: first.definition.bgHue,
      bgSat: first.definition.bgSat,
      bgLight: first.definition.bgLight,
    };
  }

  getTheme(themeKey: string): BaseTheme {
    const info = this.getThemeInfo(themeKey);
    if (!info) {
      const fallbackKey = registry.themeKeys[0];
      if (fallbackKey) return this.getThemeInfo(fallbackKey)!;
      return { name: 'Unknown', bgHue: 270, bgSat: 25, bgLight: 6 };
    }
    return info;
  }

  getDefaultParams(themeKey: string, variantKey: string): ThemeParams {
    const data = this.getThemeVariant(themeKey, variantKey);
    if (!data) {
      return { bgHue: 270, bgSat: 25, bgLight: 6, accentHue: 0, accentSat: 85, accentLight: 75, commentLight: 55 };
    }
    const d = data.definition;
    const params: ThemeParams = {
      bgHue: d.bgHue,
      bgSat: d.bgSat,
      bgLight: d.bgLight,
      accentHue: d.accentHue,
      accentSat: d.accentSat,
      accentLight: d.accentLight,
      commentLight: d.commentLight,
      colorAdjustments: {},
    };
    if (d.colorOverrides && Object.keys(d.colorOverrides).length > 0) {
      params.colorOverrides = d.colorOverrides;
    }
    return params;
  }

  getAccentOffsets(themeKey: string, variantKey: string): AccentOffsets | null {
    const data = this.getThemeVariant(themeKey, variantKey);
    return data?.definition.accentOffsets ?? null;
  }

}

export const themeLoader = new ThemeLoader();
