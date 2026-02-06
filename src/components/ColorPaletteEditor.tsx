/**
 * Interactive color palette with individual color adjustment capabilities.
 *
 * Provides a comprehensive interface for fine-tuning individual accent colors within
 * a Base24 scheme. This component bridges the gap between global theme adjustments
 * and precise color control, allowing users to perfect their color relationships
 * while maintaining the overall theme harmony.
 *
 * Features provided:
 * - Complete Base24 color structure display with visual organization
 * - Click-to-edit functionality for individual accent colors
 * - Visual hue adjustment sliders with real-time preview
 * - Reset options for individual colors and theme defaults
 * - Keyboard shortcuts for precise adjustments
 */

import React, { useState, useEffect } from 'react';
import type { Base24Colors, AccentColorKey, ThemeParams } from '../types/index.ts';
import { Base24 } from '../classes/Base24.ts';

const generateOffsetGradient = (baseHue: number): string => {
  const colors = [];
  for (let i = 0; i <= 24; i++) {
    const offset = -179 + (359 * i) / 24;
    let hue = baseHue + offset;
    while (hue < 0) hue += 360;
    while (hue >= 360) hue -= 360;
    colors.push(`hsl(${hue}, 80%, 60%)`);
  }
  return `linear-gradient(90deg, ${colors.join(', ')})`;
};

interface ColorAdjustmentPanelProps {
  selectedColorKey: AccentColorKey;
  colors: Base24Colors;
  params: ThemeParams;
  accentColors: { key: AccentColorKey; name: string }[];
  getCurrentOffset: (colorKey: AccentColorKey) => number;
  getCalculatedHue: (colorKey: AccentColorKey) => number;
  getThemeOffset: (colorKey: AccentColorKey) => number;
  onColorSelect: (colorKey: AccentColorKey | null) => void;
  onColorAdjust: (colorKey: AccentColorKey, offset: number) => void;
  onResetToDefault: (colorKey: AccentColorKey) => void;
}

const ColorAdjustmentPanel: React.FC<ColorAdjustmentPanelProps> = ({
  selectedColorKey,
  colors,
  params,
  accentColors,
  getCurrentOffset,
  getCalculatedHue,
  getThemeOffset,
  onColorSelect,
  onColorAdjust,
  onResetToDefault,
}) => {
  const [tempOffset, setTempOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);

  const currentOffset = getCurrentOffset(selectedColorKey);
  const calculatedHue = getCalculatedHue(selectedColorKey);
  const themeOffset = getThemeOffset(selectedColorKey);

  useEffect(() => {
    setTempOffset(currentOffset);
  }, [currentOffset, selectedColorKey]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!selectedColorKey) return;
      
      const step = e.shiftKey ? 10 : 1;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          const newLeftOffset = Math.max(-179, currentOffset - step);
          onColorAdjust(selectedColorKey, newLeftOffset);
          break;
        case 'ArrowRight':
          e.preventDefault();
          const newRightOffset = Math.min(180, currentOffset + step);
          onColorAdjust(selectedColorKey, newRightOffset);
          break;
        case 'Escape':
          onColorSelect(null);
          break;
        case 'r':
        case 'R':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            onResetToDefault(selectedColorKey);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedColorKey, currentOffset, onColorAdjust, onColorSelect, onResetToDefault]);

  const handleSliderChange = (newOffset: number) => {
    setTempOffset(newOffset);
    if (!isDragging) {
      onColorAdjust(selectedColorKey, newOffset);
    }
  };

  const handleSliderCommit = () => {
    onColorAdjust(selectedColorKey, tempOffset);
    setIsDragging(false);
  };

  const selectedColor = accentColors.find(c => c.key === selectedColorKey);
  const baseHue = params.accentHue || 0;

  return (
    <div
      style={{
        background: colors.base01,
        border: `2px solid ${colors.base0D}`,
        borderRadius: '8px',
      }}
      className="p-4 mb-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 style={{ color: colors.base05 }} className="text-base font-semibold">
            🎨 {selectedColor?.name} Adjustment
          </h4>
          <div style={{ color: colors.base04 }} className="text-xs mt-1">
            Base: {Math.round(baseHue)}° • Theme: {themeOffset > 0 ? '+' : ''}{themeOffset}° • Your: {currentOffset > 0 ? '+' : ''}{currentOffset}° → {Math.round(calculatedHue)}°
          </div>
        </div>
        <button
          onClick={() => onColorSelect(null)}
          style={{ color: colors.base04 }}
          className="hover:opacity-70 text-lg"
          title="Close adjustment panel (Esc)"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        <div
          style={{
            background: generateOffsetGradient(baseHue + themeOffset),
            border: `1px solid ${colors.base02}`,
          }}
          className="h-8 rounded relative cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percent = x / rect.width;
            const newOffset = Math.round(-179 + (359 * percent));
            onColorAdjust(selectedColorKey, newOffset);
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: `${((tempOffset + 179) / 359) * 100}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '4px',
              height: '100%',
              background: colors.base00,
              border: `1px solid ${colors.base05}`,
              borderRadius: '2px',
              cursor: 'grab',
            }}
            onMouseDown={() => setIsDragging(true)}
          />
        </div>

        <input
          type="range"
          min={-179}
          max={180}
          value={tempOffset}
          onChange={(e) => handleSliderChange(parseInt(e.target.value))}
          onMouseUp={handleSliderCommit}
          onTouchEnd={handleSliderCommit}
          style={{
            background: `linear-gradient(90deg, ${colors.base02}, ${colors.base0D})`,
          }}
          className="w-full h-2 rounded appearance-none cursor-pointer"
        />

        <div className="flex gap-2 justify-between text-xs">
          <div style={{ color: colors.base04 }}>
            Keyboard: ←/→ (±1°) • Shift+←/→ (±10°) • Ctrl/Cmd+R (reset) • Esc (close)
          </div>
          <button
            onClick={() => onResetToDefault(selectedColorKey)}
            style={{ 
              color: colors.base0A,
              border: `1px solid ${colors.base0A}`,
            }}
            className="px-2 py-1 rounded hover:opacity-70 text-xs"
            title="Reset to theme default"
          >
            Reset
          </button>
        </div>

        <div
          style={{
            background: colors[selectedColorKey],
            border: `1px solid ${colors.base02}`,
          }}
          className="h-12 rounded flex items-center justify-center text-sm font-mono"
        >
          <span style={{ color: colors.base00, textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
            {colors[selectedColorKey]}
          </span>
        </div>
      </div>
    </div>
  );
};

interface ColorPaletteEditorProps {
  colors: Base24Colors;
  params: ThemeParams;
  selectedColorKey: AccentColorKey | null;
  onColorSelect: (colorKey: AccentColorKey | null) => void;
  onColorAdjust: (colorKey: AccentColorKey, hueOffset: number) => void;
  onResetToDefault: (colorKey: AccentColorKey) => void;
  getCurrentOffset: (colorKey: AccentColorKey) => number;
  getCalculatedHue: (colorKey: AccentColorKey) => number;
  getThemeOffset: (colorKey: AccentColorKey) => number;
}

/**
 * Interactive color palette editor with individual color adjustment capabilities.
 *
 * Displays the complete Base24 color structure with click-to-edit functionality
 * for accent colors. Provides visual hue adjustment sliders with real-time preview.
 *
 * @param props - Color palette configuration and callbacks
 * @param props.colors - Current Base24 color scheme
 * @param props.params - Current theme parameters
 * @param props.selectedColorKey - Currently selected accent color for editing
 * @param props.onColorSelect - Callback when user selects/deselects a color
 * @param props.onColorAdjust - Callback when user adjusts a color's hue offset
 * @param props.onResetToDefault - Callback to reset color to theme default
 * @param props.getCurrentOffset - Function to get current user offset for a color
 * @param props.getCalculatedHue - Function to get final calculated hue for a color
 * @param props.getThemeOffset - Function to get theme's default offset for a color
 * @returns Interactive color palette component
 */
const ColorPaletteEditor: React.FC<ColorPaletteEditorProps> = ({
  colors,
  params,
  selectedColorKey,
  onColorSelect,
  onColorAdjust,
  onResetToDefault,
  getCurrentOffset,
  getCalculatedHue,
  getThemeOffset,
}) => {
  const colorSections = Base24.getColorSections();
  const accentColors = Base24.ACCENT_COLORS;

  const renderColorGroup = (section: typeof colorSections[0]) => (
    <div key={section.title} className="mb-4">
      <h4 style={{ color: colors.base04 }} className="text-sm font-medium mb-2">
        {section.title}
      </h4>
      <div className="grid grid-cols-4 gap-2">
        {section.colors.map((color) => {
          const isAccent = section.title === 'Accent Colors';
          const isSelected = isAccent && selectedColorKey === color.key;
          const isEditable = isAccent && section.editable;
          
          return (
            <div
              key={color.key}
              onClick={() => isEditable ? onColorSelect(color.key as AccentColorKey) : undefined}
              style={{
                background: colors[color.key as keyof Base24Colors],
                border: isSelected 
                  ? `3px solid ${colors.base0D}` 
                  : `1px solid ${colors.base02}`,
                cursor: isEditable ? 'pointer' : 'default',
              }}
              className={`h-12 rounded flex items-center justify-center text-xs font-mono transition-all duration-150 ${
                isEditable ? 'hover:scale-105' : ''
              }`}
              title={`${color.name} (${color.key}): ${colors[color.key as keyof Base24Colors]}`}
            >
              <span 
                style={{ 
                  color: colors.base00, 
                  textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                  fontSize: '10px'
                }}
              >
                {color.key}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div
      style={{
        background: colors.base00,
        border: `1px solid ${colors.base02}`,
      }}
      className="rounded-xl p-5"
    >
      <h3 style={{ color: colors.base0E }} className="mb-4 text-lg font-semibold">
        🎨 Color Palette
      </h3>
      
      {selectedColorKey && (
        <ColorAdjustmentPanel
          selectedColorKey={selectedColorKey}
          colors={colors}
          params={params}
          accentColors={accentColors}
          getCurrentOffset={getCurrentOffset}
          getCalculatedHue={getCalculatedHue}
          getThemeOffset={getThemeOffset}
          onColorSelect={onColorSelect}
          onColorAdjust={onColorAdjust}
          onResetToDefault={onResetToDefault}
        />
      )}
      
      <div style={{ color: colors.base04 }} className="text-xs mb-4">
        Click accent colors (base08-base0F) to fine-tune individual hues
      </div>
      
      <div className="space-y-4">
        {colorSections.map(renderColorGroup)}
      </div>
    </div>
  );
};

export default ColorPaletteEditor;
