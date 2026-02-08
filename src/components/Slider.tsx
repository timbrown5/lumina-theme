/**
 * Reusable slider component with visual gradient backgrounds.
 *
 * A specialized input component designed for theme parameter adjustment with
 * immediate visual feedback. The component combines traditional range inputs
 * with color-aware gradients to help users understand the impact of their
 * adjustments in real-time.
 *
 * Capabilities include:
 * - Real-time parameter adjustment with visual gradient backgrounds
 * - Keyboard shortcuts for fine-grained control
 * - Number input field for precise value entry
 * - Dynamic gradient generation based on current theme state
 * - Support for hue, saturation, and lightness parameter types
 */

import React, { useState, useEffect } from 'react';
import { createGradientBg } from '../utils/colorUtils.js';
import type { SliderType, Base24Colors } from '../types/index.js';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  type: SliderType;
  gradientColors: string[];
  previewColor?: string;
  previewLabel?: string;
  colors: Base24Colors;
  onPreviewClick?: () => void;
}

const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  onChange,
  type,
  gradientColors,
  previewColor,
  previewLabel,
  colors,
  onPreviewClick,
}) => {
  const safeValue = value ?? min ?? 0;
  const [inputValue, setInputValue] = useState<string>(safeValue.toString());
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);

  useEffect(() => {
    if (!isInputFocused) {
      setInputValue(safeValue.toString());
    }
  }, [safeValue, isInputFocused]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInputValue = e.target.value;
    setInputValue(newInputValue);
    const newValue = parseInt(newInputValue);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
    const newValue = parseInt(inputValue);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    } else {
      setInputValue(safeValue.toString());
    }
  };

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseInt(e.target.value));
  };

  const handleNumberInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle up/down arrow keys for single increments
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newValue = Math.min(max, safeValue + 1);
      onChange(newValue);
      setInputValue(newValue.toString());
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newValue = Math.max(min, safeValue - 1);
      onChange(newValue);
      setInputValue(newValue.toString());
    }
  };

  const getUnit = () => {
    return type === 'hue' ? '°' : '%';
  };

  const getStep = () => {
    return type === 'hue' ? 1 : 1;
  };

  return (
    <div className="my-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm" style={{ color: colors.base05 }}>
          {label}
        </span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={min}
            max={max}
            step={getStep()}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleNumberInputKeyDown}
            onFocus={() => setIsInputFocused(true)}
            onBlur={handleInputBlur}
            style={{
              background: colors.base01,
              border: `1px solid ${colors.base02}`,
              color: colors.base05,
            }}
            className="px-2 py-1 rounded text-xs w-16 text-right outline-none focus:ring-1"
          />
          <span className="text-xs min-w-4" style={{ color: colors.base04 }}>
            {getUnit()}
          </span>
        </div>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={getStep()}
          value={safeValue}
          onChange={handleRangeChange}
          className="w-full h-4 rounded cursor-pointer outline-none appearance-none"
          style={{
            background: createGradientBg(gradientColors),
            WebkitAppearance: 'none',
          }}
        />
        <style>{`
          input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #ffffff;
            border: 2px solid #333333;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          }

          input[type="range"]::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #ffffff;
            border: 2px solid #333333;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          }
        `}</style>
      </div>

      {previewColor && (
        <div className="flex items-center gap-2 mt-1">
          <div
            className={`w-4 h-4 rounded border border-white border-opacity-30${onPreviewClick ? ' cursor-pointer hover:scale-125 transition-transform' : ''}`}
            style={{ backgroundColor: previewColor }}
            onClick={onPreviewClick}
            title={onPreviewClick ? 'Click to pick a color' : undefined}
          />
          {previewLabel && (
            <span className="text-xs" style={{ color: colors.base04 }}>
              {previewLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Slider;
