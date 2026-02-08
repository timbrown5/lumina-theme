/**
 * Interactive color palette with individual color adjustment capabilities.
 *
 * Supports lock/unlock for background (base00-02) and accent (base08-0F) colors.
 * Locked colors get independent H/S/L sliders; unlocked accents use hue offset sliders.
 */

import React, { useState, useEffect } from 'react';
import type { Base24Colors, AccentColorKey, ThemeParams, LockableColorKey } from '../types/index.ts';
import { Base24 } from '../classes/Base24.ts';
import { hslToRgb } from '../utils/colorUtils.ts';

/** Convert a hex color (#rrggbb) to HSL {hue: 0-360, saturation: 0-100, lightness: 0-100} */
const hexToHSL = (hex: string): { hue: number; saturation: number; lightness: number } => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { hue: 0, saturation: 0, lightness: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { hue: Math.round(h * 360), saturation: Math.round(s * 100), lightness: Math.round(l * 100) };
};

const ACCENT_KEYS: AccentColorKey[] = ['base08','base09','base0A','base0B','base0C','base0D','base0E','base0F'];
const BG_KEYS: LockableColorKey[] = ['base00', 'base01', 'base02'];
const FG_KEYS: LockableColorKey[] = ['base03', 'base04', 'base05', 'base06', 'base07'];
const MUTED_KEYS: LockableColorKey[] = ['base10', 'base11', 'base12', 'base13', 'base14', 'base15', 'base16', 'base17'];
const LOCKABLE_KEYS: LockableColorKey[] = [...BG_KEYS, ...FG_KEYS, ...ACCENT_KEYS, ...MUTED_KEYS];

const isLockable = (key: string): key is LockableColorKey =>
  LOCKABLE_KEYS.includes(key as LockableColorKey);

const isAccentKey = (key: string): key is AccentColorKey =>
  ACCENT_KEYS.includes(key as AccentColorKey);

const generateOffsetGradient = (baseHue: number, sat: number, light: number): string => {
  const colors = [];
  for (let i = 0; i <= 24; i++) {
    const offset = -179 + (359 * i) / 24;
    let hue = baseHue + offset;
    while (hue < 0) hue += 360;
    while (hue >= 360) hue -= 360;
    colors.push(`hsl(${hue}, ${sat}%, ${light}%)`);
  }
  return `linear-gradient(90deg, ${colors.join(', ')})`;
};

const generateHslGradient = (type: 'hue' | 'saturation' | 'lightness', hsl: { hue: number; saturation: number; lightness: number }): string => {
  if (type === 'hue') {
    // Show full spectrum at the current saturation and lightness
    const stops = Array.from({ length: 25 }, (_, i) => {
      const h = (360 * i) / 24;
      return `hsl(${h}, ${hsl.saturation}%, ${hsl.lightness}%)`;
    });
    return `linear-gradient(90deg, ${stops.join(', ')})`;
  }
  if (type === 'saturation') {
    // Show 0% to 100% saturation at the current hue and lightness
    return `linear-gradient(90deg, hsl(${hsl.hue}, 0%, ${hsl.lightness}%), hsl(${hsl.hue}, 50%, ${hsl.lightness}%), hsl(${hsl.hue}, 100%, ${hsl.lightness}%))`;
  }
  // Show 0% to 100% lightness at the current hue and saturation
  return `linear-gradient(90deg, hsl(${hsl.hue}, ${hsl.saturation}%, 0%), hsl(${hsl.hue}, ${hsl.saturation}%, 50%), hsl(${hsl.hue}, ${hsl.saturation}%, 100%))`;
};

/** Panel shown when a locked color is selected — 3 HSL sliders */
interface LockedColorPanelProps {
  colorKey: LockableColorKey;
  colors: Base24Colors;
  hsl: { hue: number; saturation: number; lightness: number };
  colorName: string;
  onUpdateOverride: (colorKey: LockableColorKey, prop: 'hue' | 'saturation' | 'lightness', value: number) => void;
  onUnlock: (colorKey: LockableColorKey) => void;
  onClose: () => void;
}

const LockedColorPanel: React.FC<LockedColorPanelProps> = ({
  colorKey, colors, hsl, colorName, onUpdateOverride, onUnlock, onClose,
}) => {
  const currentHex = colors[colorKey as keyof Base24Colors];
  const [hexInput, setHexInput] = useState(currentHex);
  const [hexFocused, setHexFocused] = useState(false);

  // Sync from external changes when not focused
  useEffect(() => {
    if (!hexFocused) setHexInput(currentHex);
  }, [currentHex, hexFocused]);

  const sliders: { label: string; prop: 'hue' | 'saturation' | 'lightness'; min: number; max: number; unit: string }[] = [
    { label: 'Hue', prop: 'hue', min: 0, max: 360, unit: '°' },
    { label: 'Saturation', prop: 'saturation', min: 0, max: 100, unit: '%' },
    { label: 'Lightness', prop: 'lightness', min: 0, max: 100, unit: '%' },
  ];

  return (
    <div
      style={{ background: colors.base01, border: `2px solid ${colors.base0D}`, borderRadius: '8px' }}
      className="p-4 mb-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 style={{ color: colors.base05 }} className="text-base font-semibold">
            {colorName} (Manual)
          </h4>
          <div style={{ color: colors.base04 }} className="text-xs mt-1">
            {colors[colorKey as keyof Base24Colors]} &bull; H:{Math.round(hsl.hue)}° S:{Math.round(hsl.saturation)}% L:{Math.round(hsl.lightness)}%
          </div>
        </div>
        <button onClick={onClose} style={{ color: colors.base04 }} className="hover:opacity-70 text-lg" title="Close">
          ✕
        </button>
      </div>

      <div className="space-y-3">
        {sliders.map(({ label, prop, min, max, unit }) => (
          <div key={prop}>
            <div className="flex justify-between text-xs mb-1" style={{ color: colors.base04 }}>
              <span>{label}</span>
              <span>{Math.round(hsl[prop])}{unit}</span>
            </div>
            <div className="relative">
              <div
                style={{
                  background: generateHslGradient(prop, hsl),
                  border: `1px solid ${colors.base02}`,
                }}
                className="h-6 rounded"
              />
              <input
                type="range"
                min={min}
                max={max}
                value={Math.round(hsl[prop])}
                onChange={(e) => onUpdateOverride(colorKey, prop, parseInt(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div
                style={{
                  position: 'absolute',
                  left: `${((hsl[prop] - min) / (max - min)) * 100}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '4px',
                  height: '100%',
                  background: colors.base00,
                  border: `1px solid ${colors.base05}`,
                  borderRadius: '2px',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>
        ))}

        <div className="flex items-center gap-3">
          <input
            type="color"
            value={hslToRgb(hsl.hue, hsl.saturation, hsl.lightness)}
            onChange={(e) => {
              const newHSL = hexToHSL(e.target.value);
              onUpdateOverride(colorKey, 'hue', newHSL.hue);
              onUpdateOverride(colorKey, 'saturation', newHSL.saturation);
              onUpdateOverride(colorKey, 'lightness', newHSL.lightness);
            }}
            className="w-10 h-10 rounded cursor-pointer border-0 p-0"
            title="Pick a color"
          />
          <input
            type="text"
            value={hexInput}
            onChange={(e) => {
              const val = e.target.value;
              setHexInput(val);
              const trimmed = val.trim();
              if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) {
                const newHSL = hexToHSL(trimmed);
                onUpdateOverride(colorKey, 'hue', newHSL.hue);
                onUpdateOverride(colorKey, 'saturation', newHSL.saturation);
                onUpdateOverride(colorKey, 'lightness', newHSL.lightness);
              }
            }}
            onFocus={() => setHexFocused(true)}
            onBlur={() => {
              setHexFocused(false);
              setHexInput(colors[colorKey as keyof Base24Colors]);
            }}
            style={{
              background: colors[colorKey as keyof Base24Colors],
              border: `1px solid ${colors.base02}`,
              color: colors.base00,
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
            }}
            className="h-10 flex-1 rounded text-center text-sm font-mono outline-none"
          />
          <button
            onClick={() => onUnlock(colorKey)}
            style={{ color: colors.base0A, border: `1px solid ${colors.base0A}` }}
            className="px-2 py-2 rounded hover:opacity-70 text-xs whitespace-nowrap"
          >
            Auto
          </button>
        </div>
      </div>
    </div>
  );
};

/** Panel for unlocked accent — hue offset slider (existing behavior) */
interface UnlockedAccentPanelProps {
  selectedColorKey: AccentColorKey;
  colors: Base24Colors;
  params: ThemeParams;
  colorName: string;
  getCurrentOffset: (colorKey: AccentColorKey) => number;
  getCalculatedHue: (colorKey: AccentColorKey) => number;
  onColorAdjust: (colorKey: AccentColorKey, offset: number) => void;
  onResetToDefault: (colorKey: AccentColorKey) => void;
  onLock: (colorKey: LockableColorKey) => void;
  onClose: () => void;
}

const UnlockedAccentPanel: React.FC<UnlockedAccentPanelProps> = ({
  selectedColorKey, colors, params, colorName,
  getCurrentOffset, getCalculatedHue,
  onColorAdjust, onResetToDefault, onLock, onClose,
}) => {
  const [tempOffset, setTempOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);

  const currentOffset = getCurrentOffset(selectedColorKey);
  const calculatedHue = getCalculatedHue(selectedColorKey);

  useEffect(() => {
    setTempOffset(currentOffset);
  }, [currentOffset, selectedColorKey]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const step = e.shiftKey ? 5 : 1;
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          onColorAdjust(selectedColorKey, Math.max(-179, currentOffset - step));
          break;
        case 'ArrowRight':
          e.preventDefault();
          onColorAdjust(selectedColorKey, Math.min(180, currentOffset + step));
          break;
        case 'Escape':
          onClose();
          break;
        case 'r': case 'R':
          if (e.ctrlKey || e.metaKey) { e.preventDefault(); onResetToDefault(selectedColorKey); }
          break;
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedColorKey, currentOffset, onColorAdjust, onClose, onResetToDefault]);

  const handleSliderChange = (newOffset: number) => {
    setTempOffset(newOffset);
    if (!isDragging) onColorAdjust(selectedColorKey, newOffset);
  };

  const handleSliderCommit = () => {
    onColorAdjust(selectedColorKey, tempOffset);
    setIsDragging(false);
  };

  const baseHue = params.accentHue || 0;

  return (
    <div
      style={{ background: colors.base01, border: `2px solid ${colors.base0D}`, borderRadius: '8px' }}
      className="p-4 mb-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 style={{ color: colors.base05 }} className="text-base font-semibold">
            {colorName} Adjustment
          </h4>
          <div style={{ color: colors.base04 }} className="text-xs mt-1">
            {colors[selectedColorKey]} &bull; {Math.round(calculatedHue)}°
          </div>
        </div>
        <button onClick={onClose} style={{ color: colors.base04 }} className="hover:opacity-70 text-lg" title="Close (Esc)">
          ✕
        </button>
      </div>

      <div className="space-y-3">
        <div
          style={{ background: generateOffsetGradient(calculatedHue - currentOffset, params.accentSat ?? 80, params.accentLight ?? 60), border: `1px solid ${colors.base02}` }}
          className="h-8 rounded relative cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percent = x / rect.width;
            onColorAdjust(selectedColorKey, Math.round(-179 + (359 * percent)));
          }}
        >
          <div
            style={{
              position: 'absolute', left: `${((tempOffset + 179) / 359) * 100}%`,
              top: '50%', transform: 'translate(-50%, -50%)',
              width: '4px', height: '100%',
              background: colors.base00, border: `1px solid ${colors.base05}`, borderRadius: '2px', cursor: 'grab',
            }}
            onMouseDown={() => setIsDragging(true)}
          />
        </div>

        <input
          type="range" min={-179} max={180} value={tempOffset}
          onChange={(e) => handleSliderChange(parseInt(e.target.value))}
          onMouseUp={handleSliderCommit} onTouchEnd={handleSliderCommit}
          style={{ background: `linear-gradient(90deg, ${colors.base02}, ${colors.base0D})` }}
          className="w-full h-2 rounded appearance-none cursor-pointer"
        />

        <div className="flex gap-2 justify-between text-xs">
          <div style={{ color: colors.base04 }}>
            ←/→ (±1°) &bull; Shift (±5°) &bull; Ctrl+R (reset) &bull; Esc (close)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onLock(selectedColorKey)}
              style={{ color: colors.base0C, border: `1px solid ${colors.base0C}` }}
              className="px-2 py-1 rounded hover:opacity-70 text-xs"
              title="Switch to manual color control"
            >
              Manual
            </button>
            <button
              onClick={() => onResetToDefault(selectedColorKey)}
              style={{ color: colors.base0A, border: `1px solid ${colors.base0A}` }}
              className="px-2 py-1 rounded hover:opacity-70 text-xs"
              title="Reset to theme default"
            >
              Reset
            </button>
          </div>
        </div>

        <div
          style={{ background: colors[selectedColorKey], border: `1px solid ${colors.base02}` }}
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
  selectedColorKey: LockableColorKey | null;
  onColorSelect: (colorKey: LockableColorKey | null) => void;
  onColorAdjust: (colorKey: AccentColorKey, hueOffset: number) => void;
  onResetToDefault: (colorKey: AccentColorKey) => void;
  getCurrentOffset: (colorKey: AccentColorKey) => number;
  getCalculatedHue: (colorKey: AccentColorKey) => number;
  getThemeOffset: (colorKey: AccentColorKey) => number;
  onLockColor: (colorKey: LockableColorKey) => void;
  onUnlockColor: (colorKey: LockableColorKey) => void;
  isColorLocked: (colorKey: LockableColorKey) => boolean;
  onUpdateColorOverride: (colorKey: LockableColorKey, prop: 'hue' | 'saturation' | 'lightness', value: number) => void;
  getColorHSL: (colorKey: LockableColorKey) => { hue: number; saturation: number; lightness: number };
}

const ColorPaletteEditor: React.FC<ColorPaletteEditorProps> = ({
  colors, params, selectedColorKey,
  onColorSelect, onColorAdjust, onResetToDefault,
  getCurrentOffset, getCalculatedHue, getThemeOffset,
  onLockColor, onUnlockColor, isColorLocked,
  onUpdateColorOverride, getColorHSL,
}) => {
  const colorSections = Base24.getColorSections();

  const renderAdjustmentPanel = () => {
    if (!selectedColorKey) return null;

    const colorName = Base24.getColorName(selectedColorKey);
    const locked = isColorLocked(selectedColorKey);

    if (locked) {
      const hsl = getColorHSL(selectedColorKey);
      return (
        <LockedColorPanel
          colorKey={selectedColorKey}
          colors={colors}
          hsl={hsl}
          colorName={colorName}
          onUpdateOverride={onUpdateColorOverride}
          onUnlock={onUnlockColor}
          onClose={() => onColorSelect(null)}
        />
      );
    }

    // Unlocked accent
    if (isAccentKey(selectedColorKey)) {
      return (
        <UnlockedAccentPanel
          selectedColorKey={selectedColorKey}
          colors={colors}
          params={params}
          colorName={colorName}
          getCurrentOffset={getCurrentOffset}
          getCalculatedHue={getCalculatedHue}
          onColorAdjust={onColorAdjust}
          onResetToDefault={onResetToDefault}
          onLock={onLockColor}
          onClose={() => onColorSelect(null)}
        />
      );
    }

    // Unlocked non-accent — prompt to lock, or pick a color to lock+set
    const currentHex = colors[selectedColorKey as keyof Base24Colors];
    return (
      <div
        style={{ background: colors.base01, border: `2px solid ${colors.base0D}`, borderRadius: '8px' }}
        className="p-4 mb-4"
      >
        <div className="flex items-center justify-between mb-3">
          <h4 style={{ color: colors.base05 }} className="text-base font-semibold">
            {colorName}
          </h4>
          <button onClick={() => onColorSelect(null)} style={{ color: colors.base04 }} className="hover:opacity-70 text-lg">
            ✕
          </button>
        </div>
        <div style={{ color: colors.base04 }} className="text-sm mb-3">
          This color is auto-calculated from shared sliders. Switch to manual for independent control.
        </div>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={currentHex}
            onChange={(e) => {
              const newHSL = hexToHSL(e.target.value);
              // Lock first if not already locked, then set the color
              if (!isColorLocked(selectedColorKey)) {
                onLockColor(selectedColorKey);
              }
              onUpdateColorOverride(selectedColorKey, 'hue', newHSL.hue);
              onUpdateColorOverride(selectedColorKey, 'saturation', newHSL.saturation);
              onUpdateColorOverride(selectedColorKey, 'lightness', newHSL.lightness);
            }}
            className="w-10 h-10 rounded cursor-pointer border-0 p-0"
            title="Pick a color (switches to manual)"
          />
          <button
            onClick={() => onLockColor(selectedColorKey)}
            style={{ color: colors.base0C, border: `1px solid ${colors.base0C}` }}
            className="px-3 py-2 rounded hover:opacity-70 text-sm"
          >
            Switch to manual
          </button>
        </div>
      </div>
    );
  };

  const renderColorGroup = (section: typeof colorSections[0]) => (
    <div key={section.title} className="mb-4">
      <h4 style={{ color: colors.base04 }} className="text-sm font-medium mb-2">
        {section.title}
      </h4>
      <div className="grid grid-cols-4 gap-2">
        {section.colors.map((color) => {
          const colorKey = color.key;
          const lockable = isLockable(colorKey);
          const isEditable = section.editable && lockable;
          const isSelected = isEditable && selectedColorKey === colorKey;
          const locked = lockable && isColorLocked(colorKey as LockableColorKey);

          return (
            <div
              key={colorKey}
              onClick={() => isEditable ? onColorSelect(colorKey as LockableColorKey) : undefined}
              style={{
                background: colors[colorKey as keyof Base24Colors],
                border: isSelected
                  ? `3px solid ${colors.base0D}`
                  : `1px solid ${colors.base02}`,
                cursor: isEditable ? 'pointer' : 'default',
                position: 'relative',
              }}
              className={`h-12 rounded flex items-center justify-center text-xs font-mono transition-all duration-150 ${
                isEditable ? 'hover:scale-105' : ''
              }`}
              title={`${color.name} (${colorKey}): ${colors[colorKey as keyof Base24Colors]}${locked ? ' [manual]' : ''}`}
            >
              <span
                style={{
                  color: colors.base00,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                  fontSize: '10px',
                }}
              >
                {colorKey}
              </span>
              {locked && (
                <span
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '3px',
                    fontSize: '9px',
                    color: colors.base00,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                  }}
                >
                  M
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div
      style={{ background: colors.base00, border: `1px solid ${colors.base02}` }}
      className="rounded-xl p-5"
    >
      <h3 style={{ color: colors.base0E }} className="mb-4 text-lg font-semibold">
        Color Palette
      </h3>

      <div style={{ color: colors.base04 }} className="text-xs mb-4">
        Click a color to adjust. "M" = manually set color.
      </div>

      <div className="space-y-4">
        {colorSections.map(renderColorGroup)}
      </div>

      {renderAdjustmentPanel()}
    </div>
  );
};

export default ColorPaletteEditor;
