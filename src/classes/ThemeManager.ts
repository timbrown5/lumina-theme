/**
 * Central state manager for theme data, user customizations, and persistence.
 */

import { themeLoader } from '../utils/themeLoader.js';
import { generateColors, getAccentOffset, getUserAdjustment } from '../utils/colorUtils.js';
import {
  exportNeovimTheme,
  exportBase24Theme,
  exportThemeDefinition,
} from '../utils/exportUtils.js';
import type {
  Base24Colors,
  ThemeParams,
  AccentColorKey,
  BaseTheme,
  AccentOffsets,
  ThemeFileData,
} from '../types/index.js';

interface PersistedState {
  activeTheme: string;
  activeVariant: string;
  themeCustomizations: Record<string, Record<string, ThemeParams>>;
  version: string;
  sessionId: string;
}

const STATE_VERSION = '3.0';
const STORAGE_KEY = 'lumina_theme_state';
const SESSION_KEY = 'lumina_session_id';

export class ThemeManager {
  public activeTheme: string;
  public activeVariant: string;
  public selectedColorKey: AccentColorKey | null = null;

  private themeCustomizations: Record<string, Record<string, ThemeParams>> = {};
  private currentSessionId: string;

  constructor() {
    const themes = themeLoader.getAllThemeKeys();
    const firstTheme = themes[0] ?? 'midnight';
    const firstVariant = themeLoader.getVariantsForTheme(firstTheme)[0] ?? 'balanced';

    this.activeTheme = firstTheme;
    this.activeVariant = firstVariant;
    this.currentSessionId = this.generateSessionId();

    if (this.isForceRefresh()) {
      this.clearStoredState();
      this.initializeDefaults();
    } else if (this.restoreFromStorage()) {
      // restored
    } else {
      this.initializeDefaults();
    }

    this.storeSessionId();
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private storeSessionId() {
    try { sessionStorage.setItem(SESSION_KEY, this.currentSessionId); } catch {}
  }

  private isForceRefresh(): boolean {
    try {
      const hasLocal = localStorage.getItem(STORAGE_KEY) !== null;
      const hasSession = sessionStorage.getItem(SESSION_KEY) !== null;
      return hasLocal && !hasSession;
    } catch { return false; }
  }

  private initializeDefaults() {
    this.selectedColorKey = null;
    this.themeCustomizations = {};

    for (const themeKey of themeLoader.getAllThemeKeys()) {
      this.themeCustomizations[themeKey] = {};
      for (const variantKey of themeLoader.getVariantsForTheme(themeKey)) {
        this.themeCustomizations[themeKey][variantKey] =
          themeLoader.getDefaultParams(themeKey, variantKey);
      }
    }

    this.saveToStorage();
  }

  private getCurrentThemeParams(): ThemeParams {
    return (
      this.themeCustomizations[this.activeTheme]?.[this.activeVariant] ??
      this.getDefaultParams()
    );
  }

  private getDefaultParams(): ThemeParams {
    return themeLoader.getDefaultParams(this.activeTheme, this.activeVariant);
  }

  private getActiveAccentOffsets(): AccentOffsets | null {
    return themeLoader.getAccentOffsets(this.activeTheme, this.activeVariant);
  }

  private setCurrentThemeParams(params: ThemeParams) {
    if (!this.themeCustomizations[this.activeTheme]) {
      this.themeCustomizations[this.activeTheme] = {};
    }
    this.themeCustomizations[this.activeTheme][this.activeVariant] = { ...params };
    this.saveToStorage();
  }

  private saveToStorage() {
    try {
      const state: PersistedState = {
        activeTheme: this.activeTheme,
        activeVariant: this.activeVariant,
        themeCustomizations: this.themeCustomizations,
        version: STATE_VERSION,
        sessionId: this.currentSessionId,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }

  private restoreFromStorage(): boolean {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (!storedData) return false;

      const state = JSON.parse(storedData) as PersistedState;
      if (state.version !== STATE_VERSION) {
        localStorage.removeItem(STORAGE_KEY);
        return false;
      }

      // Validate theme/variant still exist
      const themes = themeLoader.getAllThemeKeys();
      if (!themes.includes(state.activeTheme)) return false;

      const variants = themeLoader.getVariantsForTheme(state.activeTheme);
      if (!variants.includes(state.activeVariant)) {
        state.activeVariant = variants[0] ?? 'balanced';
      }

      this.activeTheme = state.activeTheme;
      this.activeVariant = state.activeVariant;
      this.themeCustomizations = state.themeCustomizations;
      this.selectedColorKey = null;
      return true;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return false;
    }
  }

  switchTheme(themeKey: string) {
    if (!this.themeCustomizations[themeKey]) {
      this.themeCustomizations[themeKey] = {};
      for (const v of themeLoader.getVariantsForTheme(themeKey)) {
        this.themeCustomizations[themeKey][v] = themeLoader.getDefaultParams(themeKey, v);
      }
    }

    this.activeTheme = themeKey;

    // If current variant doesn't exist for new theme, pick first available
    const variants = themeLoader.getVariantsForTheme(themeKey);
    if (!variants.includes(this.activeVariant)) {
      this.activeVariant = variants[0] ?? 'balanced';
    }

    if (!this.themeCustomizations[themeKey]?.[this.activeVariant]) {
      this.themeCustomizations[themeKey][this.activeVariant] =
        themeLoader.getDefaultParams(themeKey, this.activeVariant);
    }

    this.saveToStorage();
  }

  switchVariant(variantKey: string) {
    if (!this.themeCustomizations[this.activeTheme]?.[variantKey]) {
      if (!this.themeCustomizations[this.activeTheme]) {
        this.themeCustomizations[this.activeTheme] = {};
      }
      this.themeCustomizations[this.activeTheme][variantKey] =
        themeLoader.getDefaultParams(this.activeTheme, variantKey);
    }

    this.activeVariant = variantKey;
    this.saveToStorage();
  }

  updateBackgroundHue(value: number) {
    const params = this.getCurrentThemeParams();
    params.bgHue = value;
    this.setCurrentThemeParams(params);
  }

  updateBackgroundSat(value: number) {
    const params = this.getCurrentThemeParams();
    params.bgSat = value;
    this.setCurrentThemeParams(params);
  }

  updateBackgroundLight(value: number) {
    const params = this.getCurrentThemeParams();
    params.bgLight = value;
    this.setCurrentThemeParams(params);
  }

  updateAccentHue(value: number) {
    const params = this.getCurrentThemeParams();
    const oldAccentHue = params.accentHue;
    const hueChange = value - oldAccentHue;

    params.accentHue = value;

    if (params.colorAdjustments) {
      Object.keys(params.colorAdjustments).forEach((colorKey) => {
        const adjustment = params.colorAdjustments![colorKey as AccentColorKey];
        if (adjustment) {
          const currentAbsoluteHue = oldAccentHue + adjustment.hueOffset;
          let newAbsoluteHue = currentAbsoluteHue + hueChange;
          while (newAbsoluteHue < 0) newAbsoluteHue += 360;
          while (newAbsoluteHue >= 360) newAbsoluteHue -= 360;
          let newOffset = newAbsoluteHue - value;
          while (newOffset > 180) newOffset -= 360;
          while (newOffset <= -180) newOffset += 360;
          adjustment.hueOffset = newOffset;
        }
      });
    }

    this.setCurrentThemeParams(params);
  }

  updateAccentSat(value: number) {
    const params = this.getCurrentThemeParams();
    params.accentSat = value;
    this.setCurrentThemeParams(params);
  }

  updateAccentLight(value: number) {
    const params = this.getCurrentThemeParams();
    params.accentLight = value;
    this.setCurrentThemeParams(params);
  }

  updateCommentLight(value: number) {
    const params = this.getCurrentThemeParams();
    params.commentLight = value;
    this.setCurrentThemeParams(params);
  }

  setSelectedColor(colorKey: AccentColorKey | null) {
    this.selectedColorKey = colorKey;
  }

  getColorAdjustment(colorKey: AccentColorKey): number {
    return getUserAdjustment(this.getCurrentThemeParams(), colorKey);
  }

  getThemeOffset(colorKey: AccentColorKey): number {
    return getAccentOffset(this.getActiveAccentOffsets(), colorKey);
  }

  updateColorAdjustment(colorKey: AccentColorKey, hueOffset: number) {
    const params = this.getCurrentThemeParams();
    if (!params.colorAdjustments) params.colorAdjustments = {};
    params.colorAdjustments[colorKey] = { hueOffset: Math.max(-180, Math.min(180, hueOffset)) };
    this.setCurrentThemeParams(params);
  }

  resetColorAdjustment(colorKey: AccentColorKey) {
    const params = this.getCurrentThemeParams();
    if (params.colorAdjustments?.[colorKey]) {
      delete params.colorAdjustments[colorKey];
      this.setCurrentThemeParams(params);
    }
  }

  resetColorToDefault(colorKey: AccentColorKey) {
    this.resetColorAdjustment(colorKey);
  }

  resetVariant() {
    this.selectedColorKey = null;
    const defaultParams = themeLoader.getDefaultParams(this.activeTheme, this.activeVariant);
    if (!this.themeCustomizations[this.activeTheme]) {
      this.themeCustomizations[this.activeTheme] = {};
    }
    this.themeCustomizations[this.activeTheme][this.activeVariant] = { ...defaultParams };
    this.saveToStorage();
  }

  resetTheme() {
    this.selectedColorKey = null;
    this.themeCustomizations[this.activeTheme] = {};
    for (const v of themeLoader.getVariantsForTheme(this.activeTheme)) {
      this.themeCustomizations[this.activeTheme][v] =
        themeLoader.getDefaultParams(this.activeTheme, v);
    }
    this.saveToStorage();
  }

  clearStoredState() {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  }

  getCurrentColors(): Base24Colors {
    const params = this.getCurrentThemeParams();
    return generateColors(params, this.getActiveAccentOffsets());
  }

  getCurrentParams(): ThemeParams {
    return { ...this.getCurrentThemeParams() };
  }

  getThemeInfo(): BaseTheme {
    return themeLoader.getTheme(this.activeTheme);
  }

  getAllThemeKeys(): string[] {
    return themeLoader.getAllThemeKeys();
  }

  getVariantsForTheme(themeKey?: string): string[] {
    return themeLoader.getVariantsForTheme(themeKey ?? this.activeTheme);
  }

  getResetLabels() {
    const themeInfo = this.getThemeInfo();
    return {
      variant: `${themeInfo.name} ${this.activeVariant}`,
      theme: `Reset Theme to Default`,
    };
  }

  // --- Exports ---

  exportNeovim(): string {
    const themeInfo = this.getThemeInfo();
    const params = this.getCurrentThemeParams();
    const offsets = this.getActiveAccentOffsets();
    return exportNeovimTheme(params, offsets, themeInfo.name, this.activeVariant);
  }

  exportBase24(): string {
    const themeInfo = this.getThemeInfo();
    const params = this.getCurrentThemeParams();
    const offsets = this.getActiveAccentOffsets();
    return exportBase24Theme(params, offsets, themeInfo.name);
  }

  exportThemeDefinition(): string {
    const themeInfo = this.getThemeInfo();
    const params = this.getCurrentThemeParams();
    const offsets = this.getActiveAccentOffsets();
    return exportThemeDefinition(params, offsets, themeInfo.name, this.activeVariant);
  }

  /**
   * Generates the theme file JSON for saving to disk (themes/<theme>/<variant>.json).
   */
  getThemeFileJson(): string {
    const themeInfo = this.getThemeInfo();
    const params = this.getCurrentThemeParams();
    const offsets = this.getActiveAccentOffsets();

    const themeFile: ThemeFileData = {
      name: themeInfo.name,
      variant: this.activeVariant,
      definition: {
        bgHue: params.bgHue,
        bgSat: params.bgSat,
        bgLight: params.bgLight,
        accentHue: params.accentHue,
        accentSat: params.accentSat,
        accentLight: params.accentLight,
        commentLight: params.commentLight,
        accentOffsets: offsets ?? {
          red: { hue: 0 }, orange: { hue: 0 }, yellow: { hue: 0 }, green: { hue: 0 },
          cyan: { hue: 0 }, blue: { hue: 0 }, purple: { hue: 0 }, pink: { hue: 0 },
        },
      },
    };

    return JSON.stringify(themeFile, null, 2);
  }

  /**
   * Returns the file path for saving the current theme variant.
   */
  getThemeFilePath(): string {
    return `themes/${this.activeTheme}/${this.activeVariant}.json`;
  }
}
