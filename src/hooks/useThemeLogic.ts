import { useState, useEffect } from 'react';
import { getBaseTheme, getThemeParams, RAW_THEME_DATA } from '../constants/index.ts';
import { generateColors } from '../utils/colorUtils.ts';
import {
  createNvimTheme,
  createBase24Json,
  createThemeParams,
  createStylixTheme,
} from '../utils/exportUtils.ts';
import type { ThemeKey, FlavorKey, TabKey, ThemeParams, ThemeLogic } from '../types/index.ts';

const STORAGE_KEY = 'lumina-theme-settings';

interface StoredSettings {
  [key: string]: ThemeParams;
}

const saveSettings = (settings: StoredSettings) => {
  try {
    const serialized = JSON.stringify(settings);
    sessionStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.warn('Failed to save theme settings:', error);
  }
};

const loadSettings = (): StoredSettings => {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.warn('Failed to load theme settings:', error);
    return {};
  }
};

// Helper function to ensure all required properties exist
const ensureCompleteParams = (
  params: Partial<ThemeParams>,
  theme: ThemeKey,
  flavor: FlavorKey
): ThemeParams => {
  const defaultParams = getThemeParams(theme, flavor);
  return {
    bgHue: params.bgHue ?? defaultParams.bgHue,
    bgSat: params.bgSat ?? defaultParams.bgSat,
    bgLight: params.bgLight ?? defaultParams.bgLight,
    redOffset: params.redOffset ?? defaultParams.redOffset,
    orangeOffset: params.orangeOffset ?? defaultParams.orangeOffset,
    yellowOffset: params.yellowOffset ?? defaultParams.yellowOffset,
    greenOffset: params.greenOffset ?? defaultParams.greenOffset,
    cyanOffset: params.cyanOffset ?? defaultParams.cyanOffset,
    blueOffset: params.blueOffset ?? defaultParams.blueOffset,
    purpleOffset: params.purpleOffset ?? defaultParams.purpleOffset,
    pinkOffset: params.pinkOffset ?? defaultParams.pinkOffset,
    accentHue: params.accentHue ?? defaultParams.accentHue,
    accentSat: params.accentSat ?? defaultParams.accentSat,
    accentLight: params.accentLight ?? defaultParams.accentLight,
    commentLight: params.commentLight ?? defaultParams.commentLight,
  };
};

const getSettingsKey = (theme: ThemeKey, flavor: FlavorKey) => `${theme}-${flavor}`;

export const useThemeLogic = (): ThemeLogic => {
  const [activeTheme, setActiveTheme] = useState<ThemeKey>('twilight');
  const [flavor, setFlavor] = useState<FlavorKey>('balanced');
  const [params, setParams] = useState<ThemeParams>(() => getThemeParams('twilight', 'balanced'));
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabKey>('colors');
  const [storedSettings, setStoredSettings] = useState<StoredSettings>({});

  useEffect(() => {
    setStoredSettings(loadSettings());
  }, []);

  useEffect(() => {
    const settingsKey = getSettingsKey(activeTheme, flavor);
    const stored = storedSettings[settingsKey];

    if (stored) {
      // Ensure the stored params have all required properties
      const completeParams = ensureCompleteParams(stored, activeTheme, flavor);
      setParams(completeParams);
    } else {
      const newParams = getThemeParams(activeTheme, flavor);
      setParams(newParams);
    }
  }, [activeTheme, flavor, storedSettings]);

  const colors = generateColors(params);
  const pageColors = colors;

  const updateParam = (key: keyof ThemeParams, value: number) => {
    const newParams = { ...params, [key]: value };
    setParams(newParams);

    const settingsKey = getSettingsKey(activeTheme, flavor);
    const newStoredSettings = { ...storedSettings, [settingsKey]: newParams };
    setStoredSettings(newStoredSettings);
    saveSettings(newStoredSettings);
  };

  const switchTheme = (themeKey: ThemeKey) => {
    try {
      console.log('Switching to theme:', themeKey);
      setActiveTheme(themeKey);
    } catch (error) {
      console.error('Error switching theme:', error);
    }
  };

  const switchFlavor = (newFlavor: FlavorKey) => {
    setFlavor(newFlavor);
  };

  const resetToFlavor = () => {
    const newParams = getThemeParams(activeTheme, flavor);
    setParams(newParams);

    const settingsKey = getSettingsKey(activeTheme, flavor);
    const newStoredSettings = { ...storedSettings, [settingsKey]: newParams };
    setStoredSettings(newStoredSettings);
    saveSettings(newStoredSettings);
  };

  const resetToTheme = () => {
    console.log('Reset theme called for:', activeTheme);

    // Clear ALL stored settings
    setStoredSettings({});
    saveSettings({});
    sessionStorage.removeItem(STORAGE_KEY);

    // Get fresh params directly from constants
    const freshParams = getThemeParams(activeTheme, 'balanced');
    console.log('Fresh params from constants:', freshParams);

    setParams(freshParams);
    setFlavor('balanced');

    console.log('Reset complete');
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const exportNvimTheme = () =>
    copyToClipboard(createNvimTheme(colors, getBaseTheme(activeTheme).name, flavor));
  const exportTheme = () =>
    copyToClipboard(createBase24Json(colors, getBaseTheme(activeTheme).name));
  const exportStylixTheme = () =>
    copyToClipboard(createStylixTheme(colors, getBaseTheme(activeTheme).name, flavor));
  const copyThemeParams = () => {
    // Collect all flavor params for the current theme
    const allFlavorParams: { [key in FlavorKey]: ThemeParams } = {
      muted:
        storedSettings[getSettingsKey(activeTheme, 'muted')] ||
        getThemeParams(activeTheme, 'muted'),
      balanced:
        storedSettings[getSettingsKey(activeTheme, 'balanced')] ||
        getThemeParams(activeTheme, 'balanced'),
      bold:
        storedSettings[getSettingsKey(activeTheme, 'bold')] || getThemeParams(activeTheme, 'bold'),
    };

    copyToClipboard(createThemeParams(activeTheme, flavor, params, colors, allFlavorParams));
  };

  return {
    activeTheme,
    params,
    copied,
    activeTab,
    flavor,
    colors,
    pageColors,
    updateParam,
    switchTheme,
    switchFlavor,
    resetToFlavor,
    resetToTheme,
    setActiveTab,
    exportNvimTheme,
    exportTheme,
    exportStylixTheme,
    copyThemeParams,
  };
};
