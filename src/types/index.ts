export interface BaseTheme {
  name: string;
  tagline: string;
  inspirations: string;
  bgHue: number;
  bgSat: number;
  bgLight: number;
}

export interface ThemeParams {
  bgHue: number;
  bgSat: number;
  bgLight: number;
  accentHue: number;
  accentSat: number;
  accentLight: number;
  commentLight: number;
}

interface FlavorData {
  accentHue: number;
  accentSat: number;
  accentLight: number;
  commentLight: number;
}

export interface Base24Colors {
  base00: string;
  base01: string;
  base02: string;
  base03: string;
  base04: string;
  base05: string;
  base06: string;
  base07: string;
  base08: string;
  base09: string;
  base0A: string;
  base0B: string;
  base0C: string;
  base0D: string;
  base0E: string;
  base0F: string;
  base10: string;
  base11: string;
  base12: string;
  base13: string;
  base14: string;
  base15: string;
  base16: string;
  base17: string;
}

export type ThemeKey = 'midnight' | 'twilight' | 'dawn' | 'noon';
export type FlavorKey = 'muted' | 'balanced' | 'bold';
export type TabKey = 'colors' | 'ui-preview' | 'javascript' | 'python' | 'cpp' | 'terminal';
export type SliderType = 'hue' | 'saturation' | 'lightness';

export interface ColorGroup {
  key: string;
  name: string;
}

export interface Tab {
  id: TabKey;
  label: string;
}

export interface SliderConfig {
  label: string;
  key: keyof ThemeParams;
  min: number;
  max: number;
  type: SliderType;
}

export interface ThemeLogic {
  activeTheme: ThemeKey;
  params: ThemeParams;
  copied: boolean;
  activeTab: TabKey;
  flavor: FlavorKey;
  colors: Base24Colors;
  pageColors: Base24Colors;
  updateParam: (key: keyof ThemeParams, value: number) => void;
  switchTheme: (themeKey: ThemeKey) => void;
  switchFlavor: (flavor: FlavorKey) => void;
  resetToFlavor: () => void;
  resetToTheme: () => void;
  setActiveTab: (tab: TabKey) => void;
  exportNvimTheme: () => void;
  exportTheme: () => void;
  exportStylixTheme: () => void;
  copyThemeParams: () => void;
}
