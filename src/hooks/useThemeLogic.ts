import { useState, useEffect, useCallback } from 'react';
import { ThemeManager } from '../classes/ThemeManager.ts';
import type { ThemeKey, FlavorKey, TabKey, AccentColorKey, Base24Colors } from '../types/index.ts';

export interface ThemeLogic {
  // State
  activeTheme: ThemeKey;
  activeFlavor: FlavorKey;
  activeTab: TabKey;
  selectedColorKey: AccentColorKey | null;
  colors: Base24Colors;
  pageColors: Base24Colors;
  copied: boolean;

  // Theme operations
  switchTheme: (themeKey: ThemeKey) => void;
  switchFlavor: (flavor: FlavorKey) => void;
  setActiveTab: (tab: TabKey) => void;
  setSelectedColor: (colorKey: AccentColorKey | null) => void;

  // Parameter updates
  updateParam: (key: string, value: number) => void;

  // Color adjustments
  updateColorAdjustment: (colorKey: AccentColorKey, hueOffset: number) => void;
  resetColorAdjustment: (colorKey: AccentColorKey) => void;
  resetColorToDefault: (colorKey: AccentColorKey) => void;

  // Reset operations
  resetToFlavor: () => void;
  resetToTheme: () => void;

  // Export operations
  exportNvimTheme: () => void;
  exportTheme: () => void;
  exportStylixTheme: () => void;
  copyThemeParams: () => void;

  // Helper methods
  getThemeInfo: () => { name: string; tagline: string; inspirations: string };
  getCurrentParams: () => any;
  getAllThemeKeys: () => ThemeKey[];
  getAllFlavorKeys: () => FlavorKey[];
}

export const useThemeLogic = (): ThemeLogic => {
  // Initialize theme manager
  const [themeManager] = useState(() => new ThemeManager());
  const [, forceUpdate] = useState({});
  const [activeTab, setActiveTab] = useState<TabKey>('ui-preview');
  const [copied, setCopied] = useState<boolean>(false);

  // Force re-render when theme manager state changes
  const triggerUpdate = useCallback(() => {
    forceUpdate({});
  }, []);

  // Handle keyboard events for color adjustment
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const selectedColorKey = themeManager.selectedColorKey;
      if (selectedColorKey) {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          const currentOffset = themeManager.getColorAdjustment(selectedColorKey);
          const newOffset = Math.max(-60, currentOffset - 5);
          themeManager.updateColorAdjustment(selectedColorKey, newOffset);
          triggerUpdate();
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          const currentOffset = themeManager.getColorAdjustment(selectedColorKey);
          const newOffset = Math.min(60, currentOffset + 5);
          themeManager.updateColorAdjustment(selectedColorKey, newOffset);
          triggerUpdate();
        } else if (event.key === 'Escape') {
          event.preventDefault();
          themeManager.setSelectedColor(null);
          triggerUpdate();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [themeManager, triggerUpdate]);

  // Parameter update handler
  const updateParam = useCallback(
    (key: string, value: number) => {
      switch (key) {
        case 'bgHue':
          themeManager.updateBackgroundHue(value);
          break;
        case 'bgSat':
          themeManager.updateBackgroundSat(value);
          break;
        case 'bgLight':
          themeManager.updateBackgroundLight(value);
          break;
        case 'accentHue':
          themeManager.updateAccentHue(value);
          break;
        case 'accentSat':
          themeManager.updateAccentSat(value);
          break;
        case 'accentLight':
          themeManager.updateAccentLight(value);
          break;
        case 'commentLight':
          themeManager.updateCommentLight(value);
          break;
        default:
          console.warn(`Unknown parameter: ${key}`);
      }
      triggerUpdate();
    },
    [themeManager, triggerUpdate]
  );

  // Theme operations
  const switchTheme = useCallback(
    (themeKey: ThemeKey) => {
      themeManager.switchTheme(themeKey);
      triggerUpdate();
    },
    [themeManager, triggerUpdate]
  );

  const switchFlavor = useCallback(
    (flavor: FlavorKey) => {
      themeManager.switchFlavor(flavor);
      triggerUpdate();
    },
    [themeManager, triggerUpdate]
  );

  const setSelectedColor = useCallback(
    (colorKey: AccentColorKey | null) => {
      themeManager.setSelectedColor(colorKey);
      triggerUpdate();
    },
    [themeManager, triggerUpdate]
  );

  // Color adjustment operations
  const updateColorAdjustment = useCallback(
    (colorKey: AccentColorKey, hueOffset: number) => {
      themeManager.updateColorAdjustment(colorKey, hueOffset);
      triggerUpdate();
    },
    [themeManager, triggerUpdate]
  );

  const resetColorAdjustment = useCallback(
    (colorKey: AccentColorKey) => {
      themeManager.resetColorAdjustment(colorKey);
      triggerUpdate();
    },
    [themeManager, triggerUpdate]
  );

  const resetColorToDefault = useCallback(
    (colorKey: AccentColorKey) => {
      themeManager.resetColorToDefault(colorKey);
      triggerUpdate();
    },
    [themeManager, triggerUpdate]
  );

  // Reset operations
  const resetToFlavor = useCallback(() => {
    themeManager.resetToFlavor();
    triggerUpdate();
  }, [themeManager, triggerUpdate]);

  const resetToTheme = useCallback(() => {
    themeManager.resetToTheme();
    triggerUpdate();
  }, [themeManager, triggerUpdate]);

  // Clipboard helper
  const copyToClipboard = useCallback((content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  // Export operations
  const exportNvimTheme = useCallback(() => {
    copyToClipboard(themeManager.exportNeovim());
  }, [themeManager, copyToClipboard]);

  const exportTheme = useCallback(() => {
    copyToClipboard(themeManager.exportBase24());
  }, [themeManager, copyToClipboard]);

  const exportStylixTheme = useCallback(() => {
    copyToClipboard(themeManager.exportStylix());
  }, [themeManager, copyToClipboard]);

  const copyThemeParams = useCallback(() => {
    copyToClipboard(themeManager.exportRawData());
  }, [themeManager, copyToClipboard]);

  // Helper methods
  const getThemeInfo = useCallback(() => {
    return themeManager.getThemeInfo();
  }, [themeManager]);

  const getCurrentParams = useCallback(() => {
    return themeManager.getCurrentParams();
  }, [themeManager]);

  const getAllThemeKeys = useCallback(() => {
    return themeManager.getAllThemeKeys();
  }, [themeManager]);

  const getAllFlavorKeys = useCallback(() => {
    return themeManager.getAllFlavorKeys();
  }, [themeManager]);

  // Get current state from theme manager
  const colors = themeManager.getCurrentColors();
  const pageColors = colors; // Same as colors for now

  return {
    // State
    activeTheme: themeManager.activeTheme,
    activeFlavor: themeManager.activeFlavor,
    activeTab,
    selectedColorKey: themeManager.selectedColorKey,
    colors,
    pageColors,
    copied,

    // Theme operations
    switchTheme,
    switchFlavor,
    setActiveTab,
    setSelectedColor,

    // Parameter updates
    updateParam,

    // Color adjustments
    updateColorAdjustment,
    resetColorAdjustment,
    resetColorToDefault,

    // Reset operations
    resetToFlavor,
    resetToTheme,

    // Export operations
    exportNvimTheme,
    exportTheme,
    exportStylixTheme,
    copyThemeParams,

    // Helper methods
    getThemeInfo,
    getCurrentParams,
    getAllThemeKeys,
    getAllFlavorKeys,
  };
};
