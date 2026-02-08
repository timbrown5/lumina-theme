/**
 * React hook providing component interface to ThemeManager with singleton pattern.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ThemeManager } from '../classes/ThemeManager.js';
import { triggerDownload, saveThemeToServer } from '../utils/exportUtils.js';
import type { TabKey, AccentColorKey, Base24Colors, LockableColorKey } from '../types/index.js';

export interface ThemeLogic {
  activeTheme: string;
  activeVariant: string;
  activeTab: TabKey;
  selectedColorKey: LockableColorKey | null;
  colors: Base24Colors;
  pageColors: Base24Colors;
  copied: boolean;
  isLocalDev: boolean;

  switchTheme: (themeKey: string) => void;
  switchVariant: (variantKey: string) => void;
  setActiveTab: (tab: TabKey) => void;
  setSelectedColor: (colorKey: LockableColorKey | null) => void;

  updateParam: (key: string, value: number) => void;

  updateColorAdjustment: (colorKey: AccentColorKey, hueOffset: number) => void;
  resetColorAdjustment: (colorKey: AccentColorKey) => void;
  resetColorToDefault: (colorKey: AccentColorKey) => void;

  lockColor: (colorKey: LockableColorKey) => void;
  unlockColor: (colorKey: LockableColorKey) => void;
  isColorLocked: (colorKey: LockableColorKey) => boolean;
  updateColorOverride: (colorKey: LockableColorKey, prop: 'hue' | 'saturation' | 'lightness', value: number) => void;
  getColorHSL: (colorKey: LockableColorKey) => { hue: number; saturation: number; lightness: number };
  copyBgToVariants: () => void;

  resetVariant: () => void;
  resetTheme: () => void;

  exportNvimTheme: () => void;
  exportTheme: () => void;
  exportThemeDefinition: () => void;
  downloadThemeJson: () => void;
  saveThemeToFile: () => Promise<boolean>;

  getThemeInfo: () => { name: string; bgHue: number; bgSat: number; bgLight: number };
  getCurrentParams: () => any;
  getThemeOffset: (colorKey: AccentColorKey) => number;
  getAllThemeKeys: () => string[];
  getVariantsForTheme: (themeKey?: string) => string[];
  getResetLabels: () => { variant: string; theme: string };
}

let globalThemeManager: ThemeManager | null = null;

const getThemeManager = (): ThemeManager => {
  if (!globalThemeManager) {
    globalThemeManager = new ThemeManager();
  }
  return globalThemeManager;
};

const isLocal = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const useThemeLogic = (): ThemeLogic => {
  const themeManagerRef = useRef<ThemeManager | null>(null);

  if (!themeManagerRef.current) {
    themeManagerRef.current = getThemeManager();
  }

  const themeManager = themeManagerRef.current;

  const [, forceUpdate] = useState({});
  const [activeTab, setActiveTab] = useState<TabKey>('ui-preview');
  const [copied, setCopied] = useState<boolean>(false);

  const triggerUpdate = useCallback(() => {
    forceUpdate({});
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (themeManager.selectedColorKey && event.key === 'Escape') {
        event.preventDefault();
        themeManager.setSelectedColor(null);
        triggerUpdate();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [themeManager, triggerUpdate]);

  const updateParam = useCallback(
    (key: string, value: number) => {
      switch (key) {
        case 'bgHue': themeManager.updateBackgroundHue(value); break;
        case 'bgSat': themeManager.updateBackgroundSat(value); break;
        case 'bgLight': themeManager.updateBackgroundLight(value); break;
        case 'accentHue': themeManager.updateAccentHue(value); break;
        case 'accentSat': themeManager.updateAccentSat(value); break;
        case 'accentLight': themeManager.updateAccentLight(value); break;
        case 'commentLight': themeManager.updateCommentLight(value); break;
      }
      triggerUpdate();
    },
    [themeManager, triggerUpdate]
  );

  const switchTheme = useCallback((themeKey: string) => {
    themeManager.switchTheme(themeKey);
    triggerUpdate();
  }, [themeManager, triggerUpdate]);

  const switchVariant = useCallback((variantKey: string) => {
    themeManager.switchVariant(variantKey);
    triggerUpdate();
  }, [themeManager, triggerUpdate]);

  const setSelectedColor = useCallback((colorKey: LockableColorKey | null) => {
    themeManager.setSelectedColor(colorKey);
    triggerUpdate();
  }, [themeManager, triggerUpdate]);

  const updateColorAdjustment = useCallback((colorKey: AccentColorKey, hueOffset: number) => {
    themeManager.updateColorAdjustment(colorKey, hueOffset);
    triggerUpdate();
  }, [themeManager, triggerUpdate]);

  const resetColorAdjustment = useCallback((colorKey: AccentColorKey) => {
    themeManager.resetColorAdjustment(colorKey);
    triggerUpdate();
  }, [themeManager, triggerUpdate]);

  const resetColorToDefault = useCallback((colorKey: AccentColorKey) => {
    themeManager.resetColorToDefault(colorKey);
    triggerUpdate();
  }, [themeManager, triggerUpdate]);

  const lockColor = useCallback((colorKey: LockableColorKey) => {
    themeManager.lockColor(colorKey);
    triggerUpdate();
  }, [themeManager, triggerUpdate]);

  const unlockColor = useCallback((colorKey: LockableColorKey) => {
    themeManager.unlockColor(colorKey);
    triggerUpdate();
  }, [themeManager, triggerUpdate]);

  const isColorLocked = useCallback((colorKey: LockableColorKey) => {
    return themeManager.isColorLocked(colorKey);
  }, [themeManager]);

  const updateColorOverride = useCallback((colorKey: LockableColorKey, prop: 'hue' | 'saturation' | 'lightness', value: number) => {
    themeManager.updateColorOverride(colorKey, prop, value);
    triggerUpdate();
  }, [themeManager, triggerUpdate]);

  const getColorHSL = useCallback((colorKey: LockableColorKey) => {
    return themeManager.getColorHSL(colorKey);
  }, [themeManager]);

  const copyBgToVariants = useCallback(() => {
    themeManager.copyBgToVariants();
    triggerUpdate();
  }, [themeManager, triggerUpdate]);

  const resetVariant = useCallback(() => {
    themeManager.resetVariant();
    triggerUpdate();
  }, [themeManager, triggerUpdate]);

  const resetTheme = useCallback(() => {
    themeManager.resetTheme();
    triggerUpdate();
  }, [themeManager, triggerUpdate]);

  const copyToClipboard = useCallback((content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  const exportNvimTheme = useCallback(() => {
    copyToClipboard(themeManager.exportNeovim());
  }, [themeManager, copyToClipboard]);

  const exportTheme = useCallback(() => {
    copyToClipboard(themeManager.exportBase24());
  }, [themeManager, copyToClipboard]);

  const exportThemeDefinition = useCallback(() => {
    copyToClipboard(themeManager.exportThemeDefinition());
  }, [themeManager, copyToClipboard]);

  const downloadThemeJson = useCallback(() => {
    const json = themeManager.getThemeFileJson();
    const filename = `${themeManager.activeVariant}.json`;
    triggerDownload(filename, json);
  }, [themeManager]);

  const saveThemeToFile = useCallback(async (): Promise<boolean> => {
    const json = themeManager.getThemeFileJson();
    const path = themeManager.getThemeFilePath();
    const ok = await saveThemeToServer(path, json);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    return ok;
  }, [themeManager]);

  const getThemeInfo = useCallback(() => themeManager.getThemeInfo(), [themeManager]);
  const getCurrentParams = useCallback(() => themeManager.getCurrentParams(), [themeManager]);
  const getThemeOffset = useCallback((colorKey: AccentColorKey) => themeManager.getThemeOffset(colorKey), [themeManager]);
  const getAllThemeKeys = useCallback(() => themeManager.getAllThemeKeys(), [themeManager]);
  const getVariantsForTheme = useCallback((themeKey?: string) => themeManager.getVariantsForTheme(themeKey), [themeManager]);
  const getResetLabels = useCallback(() => themeManager.getResetLabels(), [themeManager]);

  const colors = themeManager.getCurrentColors();
  const pageColors = colors;

  return {
    activeTheme: themeManager.activeTheme,
    activeVariant: themeManager.activeVariant,
    activeTab,
    selectedColorKey: themeManager.selectedColorKey,
    colors,
    pageColors,
    copied,
    isLocalDev: isLocal,

    switchTheme,
    switchVariant,
    setActiveTab,
    setSelectedColor,

    updateParam,

    updateColorAdjustment,
    resetColorAdjustment,
    resetColorToDefault,

    lockColor,
    unlockColor,
    isColorLocked,
    updateColorOverride,
    getColorHSL,
    copyBgToVariants,

    resetVariant,
    resetTheme,

    exportNvimTheme,
    exportTheme,
    exportThemeDefinition,
    downloadThemeJson,
    saveThemeToFile,

    getThemeInfo,
    getCurrentParams,
    getThemeOffset,
    getAllThemeKeys,
    getVariantsForTheme,
    getResetLabels,
  };
};
