/**
 * Main application component providing theme generation and customization interface.
 */

import React from 'react';
import { themeLoader } from './utils/themeLoader.ts';
import { useThemeLogic } from './hooks/useThemeLogic.ts';
import Button from './components/Button.tsx';
import Slider from './components/Slider.tsx';
import ColorPaletteEditor from './components/ColorPaletteEditor.tsx';
import UIPreview from './components/UIPreview.tsx';
import VSCodePreview from './components/VSCodePreview.tsx';
import type { TabKey, Base24Colors, ThemeParams } from './types/index.ts';
import { getStandardOffset } from './utils/colorUtils.ts';

const SyntaxPreview = React.lazy(() => import('./components/SyntaxHighlighter.tsx'));

const TABS = [
  { id: 'ui-preview', label: 'UI Preview' },
  { id: 'vscode', label: 'VSCode' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
  { id: 'cpp', label: 'C++' },
  { id: 'terminal', label: 'Terminal' },
] as const;

const generateHueGradient = () => {
  const colors = [];
  for (let i = 0; i <= 12; i++) {
    const hue = (360 * i) / 12;
    colors.push(`hsl(${hue}, 70%, 50%)`);
  }
  return colors;
};

const generateSaturationGradient = (hue: number) => [
  `hsl(${hue}, 0%, 50%)`,
  `hsl(${hue}, 100%, 50%)`,
];

const generateLightnessGradient = (hue: number, sat: number) => [
  `hsl(${hue}, ${sat}%, 0%)`,
  `hsl(${hue}, ${sat}%, 50%)`,
  `hsl(${hue}, ${sat}%, 100%)`,
];

type ValidSliderKey =
  | 'bgHue'
  | 'bgSat'
  | 'bgLight'
  | 'accentHue'
  | 'accentSat'
  | 'accentLight'
  | 'commentLight';

interface SliderConfig {
  label: string;
  key: ValidSliderKey;
  min: number;
  max: number;
  type: 'hue' | 'saturation' | 'lightness';
}

const SLIDER_CONFIGS: Record<string, SliderConfig[]> = {
  main: [
    { label: 'Background Hue', key: 'bgHue', min: 0, max: 360, type: 'hue' },
    { label: 'Background Saturation', key: 'bgSat', min: 0, max: 100, type: 'saturation' },
    { label: 'Background Lightness', key: 'bgLight', min: 0, max: 100, type: 'lightness' },
  ],
  accent: [
    { label: 'Accent Hue', key: 'accentHue', min: 0, max: 360, type: 'hue' },
    { label: 'Accent Saturation', key: 'accentSat', min: 0, max: 100, type: 'saturation' },
    { label: 'Accent Lightness', key: 'accentLight', min: 0, max: 100, type: 'lightness' },
  ],
  comment: [
    { label: 'Comment Lightness', key: 'commentLight', min: 0, max: 100, type: 'lightness' },
  ],
};

const SLIDER_GENERATORS: Record<
  ValidSliderKey,
  {
    gradient: (params: any) => string[];
    preview?: (value: number, params: any) => { color?: string; label?: string };
  }
> = {
  bgHue: {
    gradient: () => generateHueGradient(),
    preview: (value) => ({ color: `hsl(${value}, 80%, 60%)`, label: `${value}°` }),
  },
  bgSat: {
    gradient: (params) => generateSaturationGradient(params.bgHue || 0),
  },
  bgLight: {
    gradient: (params) => generateLightnessGradient(params.bgHue || 0, params.bgSat || 50),
  },
  accentHue: {
    gradient: () => generateHueGradient(),
    preview: (value) => ({ color: `hsl(${value}, 80%, 60%)`, label: `${value}°` }),
  },
  accentSat: {
    gradient: (params) => generateSaturationGradient(params.accentHue || 0),
  },
  accentLight: {
    gradient: (params) =>
      generateLightnessGradient(params.accentHue || 0, params.accentSat || 70),
  },
  commentLight: {
    gradient: (params) => {
      const isLight = (params.bgLight || 50) > 50;
      const commentHue = ((params.bgHue || 0) + (isLight ? 180 : 0) + 360) % 360;
      return generateLightnessGradient(commentHue, 15);
    },
  },
};

interface HeaderProps {
  pageColors: Base24Colors;
}

const Header: React.FC<HeaderProps> = ({ pageColors }) => (
  <div className="text-center mb-8">
    <h1
      style={{ color: pageColors.base0E }}
      className="text-4xl md:text-5xl font-bold mb-3"
    >
      Lumina
    </h1>
    <p style={{ color: pageColors.base04 }} className="text-lg md:text-xl">
      Beautiful Base24 themes for Neovim and terminals
    </p>
  </div>
);

interface ThemeDropdownProps {
  activeTheme: string;
  onSelect: (theme: string) => void;
  pageColors: Base24Colors;
}

const ThemeDropdown: React.FC<ThemeDropdownProps> = ({ activeTheme, onSelect, pageColors }) => {
  const allThemes = themeLoader.getAllThemeKeys();

  return (
    <div className="text-center mb-6">
      <h3 style={{ color: pageColors.base05 }} className="mb-3 text-lg font-medium">
        Select Base Theme
      </h3>
      <div className="flex flex-wrap gap-3 justify-center">
        {allThemes.map((themeKey) => {
          const theme = themeLoader.getTheme(themeKey);
          return (
            <Button
              key={themeKey}
              onClick={() => onSelect(themeKey)}
              variant="secondary"
              active={activeTheme === themeKey}
              colors={pageColors}
              className="px-4 py-3 text-sm font-bold capitalize"
              title={theme.name}
            >
              {theme.name}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

interface VariantSelectorProps {
  activeTheme: string;
  activeVariant: string;
  onSelect: (variant: string) => void;
  pageColors: Base24Colors;
}

const VariantSelector: React.FC<VariantSelectorProps> = ({ activeTheme, activeVariant, onSelect, pageColors }) => {
  const variants = themeLoader.getVariantsForTheme(activeTheme);

  return (
    <div className="text-center mb-8">
      <h3 style={{ color: pageColors.base05 }} className="mb-3 text-lg font-medium">
        Choose Variant
      </h3>
      <div className="flex flex-wrap gap-2 justify-center">
        {variants.map((variant) => (
          <Button
            key={variant}
            onClick={() => onSelect(variant)}
            variant="primary"
            active={activeVariant === variant}
            colors={pageColors}
            className="px-3 py-2 text-sm font-medium capitalize"
          >
            {variant}
          </Button>
        ))}
      </div>
    </div>
  );
};

interface PreviewPanelProps {
  colors: Base24Colors;
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ colors, activeTab, setActiveTab }) => {
  const renderPreviewContent = () => {
    switch (activeTab) {
      case 'ui-preview':
        return <UIPreview colors={colors} />;
      case 'vscode':
        return <VSCodePreview colors={colors} />;
      default:
        return (
          <React.Suspense fallback={<div style={{ color: colors.base04, padding: '2rem', textAlign: 'center' }}>Loading syntax highlighter...</div>}>
            <SyntaxPreview colors={colors} language={activeTab} />
          </React.Suspense>
        );
    }
  };

  return (
    <div
      style={{
        background: colors.base00,
        border: `1px solid ${colors.base02}`,
      }}
      className="rounded-xl p-5"
    >
      <h3 style={{ color: colors.base0E }} className="mb-5 text-lg font-semibold">
        Live Theme Preview
      </h3>

      <div className="flex gap-1 mb-4 border-b pb-2" style={{ borderColor: colors.base02 }}>
        {TABS.map((tab) => (
          <Button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            variant="primary"
            active={activeTab === tab.id}
            colors={colors}
            className="text-xs"
            title={`Preview theme in ${tab.label} context`}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {renderPreviewContent()}
    </div>
  );
};

interface CustomizePanelProps {
  params: ThemeParams;
  updateParam: (key: string, value: number) => void;
  resetVariant: () => void;
  resetTheme: () => void;
  variant: string;
  pageColors: Base24Colors;
  onExpandChange: (expanded: boolean) => void;
  themeLogic: any;
}

const CustomizePanel: React.FC<CustomizePanelProps> = ({
  params,
  updateParam,
  resetVariant,
  resetTheme,
  variant,
  pageColors,
  onExpandChange,
  themeLogic,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const colorPickerRef = React.useRef<HTMLInputElement>(null);
  const colorPickerGroupRef = React.useRef<'bg' | 'accent' | null>(null);

  React.useEffect(() => {
    onExpandChange(isExpanded);
  }, [isExpanded, onExpandChange]);

  const hexToHSL = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h = 0;
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const openColorPicker = (group: 'bg' | 'accent') => {
    colorPickerGroupRef.current = group;
    if (colorPickerRef.current) {
      colorPickerRef.current.value = group === 'bg' ? pageColors.base00 : pageColors.base07;
      colorPickerRef.current.click();
    }
  };

  const handleColorPicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { h, s, l } = hexToHSL(e.target.value);
    if (colorPickerGroupRef.current === 'bg') {
      updateParam('bgHue', h);
      updateParam('bgSat', s);
      updateParam('bgLight', l);
    } else if (colorPickerGroupRef.current === 'accent') {
      updateParam('accentHue', h);
      updateParam('accentSat', s);
      updateParam('accentLight', l);
    }
  };

  const getSliderProps = (key: ValidSliderKey) => {
    const generator = SLIDER_GENERATORS[key];
    const gradientColors = generator.gradient(params);
    const preview = generator.preview?.(params[key], params);

    return {
      gradientColors,
      previewColor: preview?.color,
      previewLabel: preview?.label,
    };
  };

  const resetLabels = themeLogic.getResetLabels();

  return (
    <div
      style={{
        background: pageColors.base01,
        border: `1px solid ${pageColors.base02}`,
      }}
      className="rounded-xl p-5"
    >
      <input
        ref={colorPickerRef}
        type="color"
        onChange={handleColorPicked}
        className="absolute w-0 h-0 opacity-0 pointer-events-none"
      />
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ color: pageColors.base05 }}
        className="w-full flex items-center justify-between mb-4 hover:opacity-80 transition-opacity"
        title={isExpanded ? 'Collapse customization panel' : 'Expand customization panel'}
      >
        <h3 className="text-lg font-semibold">Customize Colors</h3>
        <span className="text-xl">{isExpanded ? '▼' : '▶'}</span>
      </button>

      {isExpanded && (
        <>
          <div className="mb-5">
            <h4 style={{ color: pageColors.base05 }} className="mb-3 text-sm font-medium">
              Background & UI Colors
            </h4>
            <div style={{ color: pageColors.base04 }} className="text-xs mb-3">
              Adjust the overall appearance of backgrounds, panels, and user interface elements
            </div>
            {SLIDER_CONFIGS.main.map((config) => {
              const sliderProps = getSliderProps(config.key);
              return (
                <Slider
                  key={config.key}
                  label={config.label}
                  value={params[config.key]}
                  min={config.min}
                  max={config.max}
                  type={config.type}
                  gradientColors={sliderProps.gradientColors}
                  previewColor={config.key === 'bgHue' ? pageColors.base00 : sliderProps.previewColor}
                  previewLabel={sliderProps.previewLabel}
                  colors={pageColors}
                  onChange={(v) => updateParam(config.key, v)}
                  onPreviewClick={config.key === 'bgHue' ? () => openColorPicker('bg') : undefined}
                />
              );
            })}
          </div>

          <div className="mb-5">
            <h4 style={{ color: pageColors.base05 }} className="mb-3 text-sm font-medium">
              Syntax & Accent Colors
            </h4>
            <div style={{ color: pageColors.base04 }} className="text-xs mb-3">
              Control the colors used for syntax highlighting, keywords, and accent elements
            </div>
            {SLIDER_CONFIGS.accent.map((config) => {
              const sliderProps = getSliderProps(config.key);
              return (
                <Slider
                  key={config.key}
                  label={config.label}
                  value={params[config.key]}
                  min={config.min}
                  max={config.max}
                  type={config.type}
                  gradientColors={sliderProps.gradientColors}
                  previewColor={config.key === 'accentHue' ? pageColors.base07 : sliderProps.previewColor}
                  previewLabel={sliderProps.previewLabel}
                  colors={pageColors}
                  onChange={(v) => updateParam(config.key, v)}
                  onPreviewClick={config.key === 'accentHue' ? () => openColorPicker('accent') : undefined}
                />
              );
            })}
          </div>

          <div className="mb-5">
            <h4 style={{ color: pageColors.base05 }} className="mb-3 text-sm font-medium">
              Comments & Subtle Text
            </h4>
            <div style={{ color: pageColors.base04 }} className="text-xs mb-3">
              Adjust the visibility and contrast of comments and secondary text elements
            </div>
            {SLIDER_CONFIGS.comment.map((config) => {
              const sliderProps = getSliderProps(config.key);
              return (
                <Slider
                  key={config.key}
                  label={config.label}
                  value={params[config.key]}
                  min={config.min}
                  max={config.max}
                  type={config.type}
                  gradientColors={sliderProps.gradientColors}
                  previewColor={sliderProps.previewColor}
                  previewLabel={sliderProps.previewLabel}
                  colors={pageColors}
                  onChange={(v) => updateParam(config.key, v)}
                />
              );
            })}
          </div>

          <div className="mb-5">
            <ColorPaletteEditor
              colors={themeLogic.colors}
              params={themeLogic.getCurrentParams()}
              selectedColorKey={themeLogic.selectedColorKey}
              onColorSelect={themeLogic.setSelectedColor}
              onColorAdjust={themeLogic.updateColorAdjustment}
              onResetToDefault={themeLogic.resetColorToDefault}
              getCurrentOffset={(colorKey) => themeLogic.getCurrentParams().colorAdjustments?.[colorKey]?.hueOffset || 0}
              getCalculatedHue={(colorKey) => {
                const baseHue = themeLogic.getCurrentParams().accentHue || 0;
                const standardOffset = getStandardOffset(colorKey);
                const themeOffset = themeLogic.getThemeOffset(colorKey);
                const userOffset = themeLogic.getCurrentParams().colorAdjustments?.[colorKey]?.hueOffset || 0;
                return (baseHue + standardOffset + themeOffset + userOffset + 360) % 360;
              }}
              getThemeOffset={themeLogic.getThemeOffset}
              onLockColor={themeLogic.lockColor}
              onUnlockColor={themeLogic.unlockColor}
              isColorLocked={themeLogic.isColorLocked}
              onUpdateColorOverride={themeLogic.updateColorOverride}
              getColorHSL={themeLogic.getColorHSL}
            />
          </div>

          <div className="flex gap-2 justify-end text-xs flex-wrap">
            <Button
              onClick={() => themeLogic.copyBgToVariants()}
              variant="secondary"
              colors={pageColors}
              className="px-3 py-2"
              title="Copy background hue/sat/light and manual BG colors to all other variants"
            >
              Copy BG to variants
            </Button>
            <Button
              onClick={resetVariant}
              variant="secondary"
              colors={pageColors}
              className="px-3 py-2"
              title={`Reset to default ${variant} variant parameters`}
            >
              Reset {resetLabels.variant}
            </Button>
            <Button
              onClick={resetTheme}
              variant="secondary"
              colors={pageColors}
              className="px-3 py-2"
              title="Reset to base theme defaults (removes all customizations)"
            >
              {resetLabels.theme}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

interface ExportPanelProps {
  themeLogic: ReturnType<typeof useThemeLogic>;
  pageColors: Base24Colors;
}

const ExportPanel: React.FC<ExportPanelProps> = ({ themeLogic, pageColors }) => (
  <div
    style={{
      background: pageColors.base01,
      border: `1px solid ${pageColors.base02}`,
    }}
    className="rounded-xl p-5 text-center"
  >
    <h3 style={{ color: pageColors.base0E }} className="mb-4 text-lg font-semibold">
      Export Your Theme
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
      <Button
        onClick={themeLogic.exportNvimTheme}
        variant="gradient"
        colors={pageColors}
        className="px-4 py-3 text-sm font-bold"
        title="Export as Neovim Lua theme file"
      >
        Neovim Theme
      </Button>

      <Button
        onClick={themeLogic.exportTheme}
        variant="gradientWarm"
        colors={pageColors}
        className="px-4 py-3 text-sm font-bold"
        title="Copy Base24 JSON to clipboard"
      >
        Base24 JSON
      </Button>

      <Button
        onClick={themeLogic.downloadThemeJson}
        variant="primary"
        colors={pageColors}
        className="px-4 py-3 text-sm font-bold"
        title="Download theme parameters as JSON file"
      >
        Download JSON
      </Button>

      {themeLogic.isLocalDev && (
        <Button
          onClick={() => themeLogic.saveThemeToFile()}
          variant="gradientRed"
          colors={pageColors}
          className="px-4 py-3 text-sm font-bold"
          title="Save theme parameters to project filesystem"
        >
          Save to Project
        </Button>
      )}
    </div>

    {themeLogic.copied && (
      <div
        style={{
          background: pageColors.base0B,
          color: pageColors.base00,
        }}
        className="mb-4 py-2 px-4 rounded inline-block"
      >
        Saved/copied successfully!
      </div>
    )}

    <div style={{ color: pageColors.base04 }} className="text-xs leading-relaxed">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-left">
        <div>
          <strong>Neovim:</strong> Complete Lua theme file
        </div>
        <div>
          <strong>Base24:</strong> Standard JSON format for editors
        </div>
        <div>
          <strong>Download:</strong> Save theme params as JSON file
        </div>
        {themeLogic.isLocalDev && (
          <div>
            <strong>Save:</strong> Write to themes/ in the project
          </div>
        )}
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const themeLogic = useThemeLogic();
  const [isCustomizePanelExpanded, setIsCustomizePanelExpanded] = React.useState(true);

  return (
    <div
      className="min-h-screen p-5 font-sans"
      style={{
        background:
          themeLogic.getCurrentParams().bgLight > 50
            ? `linear-gradient(135deg, ${themeLogic.pageColors.base00}, ${themeLogic.pageColors.base02})`
            : `linear-gradient(135deg, ${themeLogic.pageColors.base00}, ${themeLogic.pageColors.base01})`,
        color: themeLogic.pageColors.base05,
      }}
    >
      <div className="max-w-6xl mx-auto">
        <Header pageColors={themeLogic.pageColors} />

        <ThemeDropdown
          activeTheme={themeLogic.activeTheme}
          onSelect={(theme) => themeLogic.switchTheme(theme)}
          pageColors={themeLogic.pageColors}
        />

        <VariantSelector
          activeTheme={themeLogic.activeTheme}
          activeVariant={themeLogic.activeVariant}
          onSelect={(variant) => themeLogic.switchVariant(variant)}
          pageColors={themeLogic.pageColors}
        />

        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          <div
            className={`${isCustomizePanelExpanded ? 'lg:w-3/5' : 'lg:w-4/5 lg:max-w-6xl lg:mx-auto'} transition-all duration-300`}
          >
            <PreviewPanel
              colors={themeLogic.colors}
              activeTab={themeLogic.activeTab}
              setActiveTab={themeLogic.setActiveTab}
            />
          </div>

          <div
            className={`${isCustomizePanelExpanded ? 'lg:w-2/5' : 'lg:w-1/5'} transition-all duration-300`}
          >
            <CustomizePanel
              params={themeLogic.getCurrentParams()}
              updateParam={themeLogic.updateParam}
              resetVariant={themeLogic.resetVariant}
              resetTheme={themeLogic.resetTheme}
              variant={themeLogic.activeVariant}
              pageColors={themeLogic.pageColors}
              onExpandChange={setIsCustomizePanelExpanded}
              themeLogic={themeLogic}
            />
          </div>
        </div>

        <ExportPanel
          themeLogic={themeLogic}
          pageColors={themeLogic.pageColors}
        />
      </div>
    </div>
  );
};

export default App;
