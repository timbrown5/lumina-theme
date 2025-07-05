export interface BaseTheme {
  name: string;
  tagline: string;
  inspirations: string;
  bgHue: number;
  bgSat: number;
  bgLight: number;
}

export interface ColorAdjustment {
  hueOffset: number;
}

export interface ThemeParams {
  bgHue: number;
  bgSat: number;
  bgLight: number;
  accentHue: number;
  accentSat: number;
  accentLight: number;
  commentLight: number;
  // Optional individual color offsets (will use standard if not provided)
  redOffset?: number;
  orangeOffset?: number;
  yellowOffset?: number;
  greenOffset?: number;
  cyanOffset?: number;
  blueOffset?: number;
  purpleOffset?: number;
  pinkOffset?: number;
  // Individual color adjustments
  colorAdjustments?: {
    base08?: ColorAdjustment; // Red
    base09?: ColorAdjustment; // Orange
    base0A?: ColorAdjustment; // Yellow
    base0B?: ColorAdjustment; // Green
    base0C?: ColorAdjustment; // Cyan
    base0D?: ColorAdjustment; // Blue
    base0E?: ColorAdjustment; // Purple
    base0F?: ColorAdjustment; // Pink
  };
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
export type AccentColorKey =
  | 'base08'
  | 'base09'
  | 'base0A'
  | 'base0B'
  | 'base0C'
  | 'base0D'
  | 'base0E'
  | 'base0F';

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
  selectedColorKey: AccentColorKey | null;
  updateParam: (key: keyof ThemeParams, value: number) => void;
  updateColorAdjustment: (colorKey: AccentColorKey, hueOffset: number) => void;
  resetColorAdjustment: (colorKey: AccentColorKey) => void;
  resetColorToDefault: (colorKey: AccentColorKey) => void;
  setSelectedColor: (colorKey: AccentColorKey | null) => void;
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
