import { useState, useEffect } from 'react';
import { createGradientBg } from '../utils/colorUtils.ts';
import type { SliderType } from '../types/index.ts';

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
}) => {
  // Handle undefined or null values by providing defaults
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

  const getUnit = () => {
    return type === 'hue' ? '°' : '%';
  };

  return (
    <div className="my-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm">{label}</span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={min}
            max={max}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setIsInputFocused(true)}
            onBlur={handleInputBlur}
            className="bg-black bg-opacity-10 border border-white border-opacity-20 text-white px-2 py-1 rounded text-xs w-16 text-right outline-none"
          />
          <span className="text-xs opacity-70 min-w-4">{getUnit()}</span>
        </div>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
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
            className="w-4 h-4 rounded border border-white border-opacity-30"
            style={{ backgroundColor: previewColor }}
          />
          {previewLabel && <span className="text-xs opacity-70">{previewLabel}</span>}
        </div>
      )}
    </div>
  );
};

export default Slider;
