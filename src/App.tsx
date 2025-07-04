import React from 'react';
import {
  getBaseTheme,
  getAllThemeKeys,
  getAllFlavorKeys,
  COLOR_GROUPS,
  TABS,
  SLIDER_CONFIGS,
  SLIDER_GENERATORS,
} from './constants/index.ts';
import { useThemeLogic } from './hooks/useThemeLogic.ts';
import Button from './components/Button.tsx';
import Slider from './components/Slider.tsx';
import { ColorList, ColorPalette } from './components/ColorComponents.tsx';
import SyntaxPreview from './components/SyntaxHighlighter.tsx';
import UIPreview from './components/UIPreview.tsx';
import type { ThemeKey, FlavorKey, TabKey, Base24Colors, ThemeParams } from './types/index.ts';

interface SelectorProps<T> {
  title: string;
  items: T[];
  activeItem: T;
  onSelect: (item: T) => void;
  pageColors: Base24Colors;
  renderItem: (item: T) => { label: string; description?: string; inspiration?: string };
  variant?: 'theme' | 'flavor';
  className?: string;
}

function Selector<T>({
  title,
  items,
  activeItem,
  onSelect,
  pageColors,
  renderItem,
  variant = 'theme',
  className = '',
}: SelectorProps<T>) {
  return (
    <div className={`mb-6 ${className}`}>
      <h3 style={{ color: pageColors.base0E }} className="text-center text-lg font-semibold mb-4">
        {title}
      </h3>

      {variant === 'theme' ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl mx-auto">
          {items.map((item, index) => {
            const rendered = renderItem(item);
            return (
              <button
                key={index}
                onClick={() => onSelect(item)}
                title={rendered.inspiration}
                style={{
                  background: activeItem === item ? pageColors.base02 : pageColors.base01,
                  border: `2px solid ${activeItem === item ? pageColors.base0D : pageColors.base02}`,
                  color: pageColors.base05,
                }}
                className="rounded-lg p-3 cursor-pointer transition-all duration-200 hover:scale-105 text-left"
              >
                <div className="font-bold text-sm mb-1">{rendered.label}</div>
                {rendered.description && (
                  <div style={{ color: pageColors.base04 }} className="text-xs leading-tight">
                    {rendered.description}
                  </div>
                )}
                {activeItem === item && (
                  <div style={{ color: pageColors.base0D }} className="mt-2 text-xs font-bold">
                    ✨ Selected
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex gap-4 justify-center mb-4 flex-wrap">
          {items.map((item, index) => {
            const rendered = renderItem(item);
            return (
              <Button
                key={index}
                onClick={() => onSelect(item)}
                variant={activeItem === item ? 'gradientWarm' : 'secondary'}
                active={activeItem === item}
                colors={pageColors}
                className="text-sm py-3 px-6 capitalize font-semibold"
              >
                {rendered.label}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface HeaderProps {
  pageColors: Base24Colors;
}

const Header: React.FC<HeaderProps> = ({ pageColors }) => (
  <div className="text-center mb-8">
    <h1
      className="text-4xl font-bold mb-3"
      style={{
        background: `linear-gradient(135deg, ${pageColors.base0E}, ${pageColors.base08})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}
    >
      ✨ Lumina Theme Generator
    </h1>
    <p style={{ color: pageColors.base04 }} className="mb-6">
      Create beautiful Base24 themes for Neovim and terminals
    </p>
  </div>
);

interface CustomizePanelProps {
  params: ThemeParams;
  updateParam: (key: keyof ThemeParams, value: number) => void;
  resetToFlavor: () => void;
  resetToTheme: () => void;
  flavor: FlavorKey;
  pageColors: Base24Colors;
  onExpandChange: (expanded: boolean) => void;
}

const CustomizePanel: React.FC<CustomizePanelProps> = ({
  params,
  updateParam,
  resetToFlavor,
  resetToTheme,
  flavor,
  pageColors,
  onExpandChange,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true);

  const handleExpandChange = (expanded: boolean) => {
    setIsExpanded(expanded);
    onExpandChange(expanded);
  };

  const getSliderProps = (configKey: keyof ThemeParams) => {
    const generator = SLIDER_GENERATORS[configKey];
    const gradient = generator.gradient(params);
    const preview = generator.preview
      ? generator.preview(params[configKey], params)
      : { color: undefined, label: undefined };

    return {
      gradientColors: gradient,
      previewColor: preview.color,
      previewLabel: preview.label,
    };
  };

  return (
    <div
      style={{
        background: pageColors.base01,
        border: `1px solid ${pageColors.base02}`,
      }}
      className="rounded-xl p-5"
    >
      <button
        onClick={() => handleExpandChange(!isExpanded)}
        className="w-full flex items-center justify-between mb-5 text-left"
        style={{ color: pageColors.base0E }}
      >
        <h3 className="text-lg font-semibold">🎨 Customize Colors</h3>
        <span className="text-xl">{isExpanded ? '▼' : '▶'}</span>
      </button>

      {isExpanded && (
        <>
          <div className="mb-5">
            <h4 style={{ color: pageColors.base05 }} className="mb-3 text-sm font-medium">
              Background & UI Colors
            </h4>
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
                  previewColor={sliderProps.previewColor}
                  previewLabel={sliderProps.previewLabel}
                  onChange={(v) => updateParam(config.key, v)}
                />
              );
            })}
          </div>

          <div className="mb-5">
            <h4 style={{ color: pageColors.base05 }} className="mb-3 text-sm font-medium">
              Syntax & Accent Colors
            </h4>
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
                  previewColor={sliderProps.previewColor}
                  previewLabel={sliderProps.previewLabel}
                  onChange={(v) => updateParam(config.key, v)}
                />
              );
            })}
          </div>

          <div className="mb-5">
            <h4 style={{ color: pageColors.base05 }} className="mb-3 text-sm font-medium">
              Accent Color Offsets
            </h4>
            <div style={{ color: pageColors.base04 }} className="text-xs mb-3">
              Fine-tune individual accent color positions on the color wheel
            </div>
            {SLIDER_CONFIGS.offsets.map((config) => {
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
                  onChange={(v) => updateParam(config.key, v)}
                />
              );
            })}
          </div>

          <div className="mb-5">
            <h4 style={{ color: pageColors.base05 }} className="mb-3 text-sm font-medium">
              Comments & Subtle Text
            </h4>
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
                  onChange={(v) => updateParam(config.key, v)}
                />
              );
            })}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={resetToFlavor}
              variant="gradientWarm"
              colors={pageColors}
              className="text-xs font-bold flex-1"
            >
              🔄 Reset to {flavor.charAt(0).toUpperCase() + flavor.slice(1)}
            </Button>

            <Button
              onClick={resetToTheme}
              variant="gradientRed"
              colors={pageColors}
              className="text-xs font-bold flex-1"
            >
              🔄 Reset Theme
            </Button>
          </div>
        </>
      )}
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
    if (activeTab === 'colors') {
      return (
        <div
          style={{ background: colors.base00, color: colors.base05 }}
          className="p-4 rounded border border-white border-opacity-10"
        >
          <div className="grid grid-cols-3 gap-3 mb-5">
            {Object.entries(COLOR_GROUPS).map(([groupName, colorData]) => (
              <ColorList
                key={groupName}
                title={`${groupName.charAt(0).toUpperCase() + groupName.slice(1)} Colors`}
                colors={colors}
                colorData={colorData}
              />
            ))}
          </div>
          <div className="mt-5">
            <h4 className="text-base mb-3">Color Palette</h4>
            {Object.values(COLOR_GROUPS).map((group, i) => (
              <ColorPalette key={i} colors={colors} colorKeys={group.map(({ key }) => key)} />
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === 'ui-preview') {
      return <UIPreview colors={colors} />;
    }

    return <SyntaxPreview colors={colors} language={activeTab} />;
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
        👀 Theme Preview
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
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {renderPreviewContent()}
    </div>
  );
};

interface ExportPanelProps {
  exportNvimTheme: () => void;
  exportTheme: () => void;
  exportStylixTheme: () => void;
  copyThemeParams: () => void;
  copied: boolean;
  pageColors: Base24Colors;
}

const ExportPanel: React.FC<ExportPanelProps> = ({
  exportNvimTheme,
  exportTheme,
  exportStylixTheme,
  copyThemeParams,
  copied,
  pageColors,
}) => (
  <div
    style={{
      background: pageColors.base01,
      border: `1px solid ${pageColors.base02}`,
    }}
    className="rounded-xl p-5 text-center"
  >
    <h3 style={{ color: pageColors.base0E }} className="mb-4 text-lg font-semibold">
      📦 Export Your Base24 Theme
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      <Button
        onClick={exportNvimTheme}
        variant="gradient"
        colors={pageColors}
        className="px-4 py-3 text-sm font-bold"
      >
        🎨 Neovim Theme
      </Button>

      <Button
        onClick={exportTheme}
        variant="gradientWarm"
        colors={pageColors}
        className="px-4 py-3 text-sm font-bold"
      >
        📋 Base24 JSON
      </Button>

      <Button
        onClick={exportStylixTheme}
        variant="gradientRed"
        colors={pageColors}
        className="px-4 py-3 text-sm font-bold"
      >
        ❄️ Stylix Theme
      </Button>

      <Button
        onClick={copyThemeParams}
        variant="secondary"
        colors={pageColors}
        className="px-4 py-3 text-sm font-bold"
      >
        📊 Parameters
      </Button>
    </div>

    {copied && (
      <div
        style={{
          background: pageColors.base0B,
          color: pageColors.base00,
        }}
        className="mb-4 py-2 px-4 rounded inline-block"
      >
        ✅ Copied to clipboard!
      </div>
    )}

    <div style={{ color: pageColors.base04 }} className="text-xs leading-relaxed">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-left">
        <div>
          <strong>Neovim:</strong> Complete Lua theme file
        </div>
        <div>
          <strong>Base24:</strong> Standard JSON for editors
        </div>
        <div>
          <strong>Stylix:</strong> Nix system-wide theming
        </div>
        <div>
          <strong>Parameters:</strong> Raw values for tweaking
        </div>
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
          themeLogic.params.bgLight > 50
            ? `linear-gradient(135deg, ${themeLogic.pageColors.base00}, ${themeLogic.pageColors.base02})`
            : `linear-gradient(135deg, ${themeLogic.pageColors.base00}, ${themeLogic.pageColors.base01})`,
        color: themeLogic.pageColors.base05,
      }}
    >
      <div className="max-w-6xl mx-auto">
        <Header pageColors={themeLogic.pageColors} />

        <Selector
          title="🎯 Select Base Theme to Customize"
          items={getAllThemeKeys()}
          activeItem={themeLogic.activeTheme}
          onSelect={themeLogic.switchTheme}
          pageColors={themeLogic.pageColors}
          variant="theme"
          renderItem={(themeKey) => {
            const theme = getBaseTheme(themeKey);
            return {
              label: theme.name,
              description: theme.tagline,
              inspiration: `${theme.tagline} - Inspired by: ${theme.inspirations}`,
            };
          }}
        />

        <Selector
          title="🎭 Choose Flavor Intensity"
          items={getAllFlavorKeys()}
          activeItem={themeLogic.flavor}
          onSelect={themeLogic.switchFlavor}
          pageColors={themeLogic.pageColors}
          variant="flavor"
          renderItem={(flavorKey) => ({
            label: flavorKey,
          })}
        />

        <div
          style={{ color: themeLogic.pageColors.base04 }}
          className="text-center text-xs max-w-lg mx-auto mb-8"
        >
          <strong>Muted:</strong> Gentle, softer colors • <strong>Balanced:</strong> Harmonious
          everyday use • <strong>Bold:</strong> High contrast, maximum readability
        </div>

        <div className="flex flex-col xl:flex-row gap-8 mb-8">
          <div
            className={`${isCustomizePanelExpanded ? 'xl:w-3/5' : 'xl:w-4/5 xl:max-w-6xl xl:mx-auto'} transition-all duration-300`}
          >
            <PreviewPanel
              colors={themeLogic.colors}
              activeTab={themeLogic.activeTab}
              setActiveTab={themeLogic.setActiveTab}
            />
          </div>

          <div
            className={`${isCustomizePanelExpanded ? 'xl:w-2/5' : 'xl:w-1/5'} transition-all duration-300`}
          >
            <CustomizePanel
              params={themeLogic.params}
              updateParam={themeLogic.updateParam}
              resetToFlavor={themeLogic.resetToFlavor}
              resetToTheme={themeLogic.resetToTheme}
              flavor={themeLogic.flavor}
              pageColors={themeLogic.pageColors}
              onExpandChange={setIsCustomizePanelExpanded}
            />
          </div>
        </div>
        <ExportPanel
          exportNvimTheme={themeLogic.exportNvimTheme}
          exportTheme={themeLogic.exportTheme}
          exportStylixTheme={themeLogic.exportStylixTheme}
          copyThemeParams={themeLogic.copyThemeParams}
          copied={themeLogic.copied}
          pageColors={themeLogic.pageColors}
        />
      </div>
    </div>
  );
};

export default App;
