/**
 * Type definitions for theme configuration and customization.
 *
 * ## Key Types
 * - ThemeParams: All adjustable theme parameters
 * - ColorAdjustment: Individual color fine-tuning data
 * - ThemeFileData: On-disk theme file format
 */

/**
 * Core theme metadata and background color parameters.
 */
export interface BaseTheme {
  name: string;
  bgHue: number;
  bgSat: number;
  bgLight: number;
}

/**
 * Individual color fine-tuning adjustment data.
 */
export interface ColorAdjustment {
  hueOffset: number;
}

/**
 * Complete set of adjustable theme parameters.
 * Includes all slider values and individual color adjustments.
 */
export interface ThemeParams {
  bgHue: number;
  bgSat: number;
  bgLight: number;
  accentHue: number;
  accentSat: number;
  accentLight: number;
  commentLight: number;
  colorAdjustments?: {
    base08?: ColorAdjustment;
    base09?: ColorAdjustment;
    base0A?: ColorAdjustment;
    base0B?: ColorAdjustment;
    base0C?: ColorAdjustment;
    base0D?: ColorAdjustment;
    base0E?: ColorAdjustment;
    base0F?: ColorAdjustment;
  };
}

/**
 * Theme-specific color offset definition for accent colors.
 */
export interface AccentOffsetDefinition {
  hue: number;
  saturation?: number;
  lightness?: number;
}

/**
 * Accent offsets map keyed by color name.
 */
export interface AccentOffsets {
  red: AccentOffsetDefinition;
  orange: AccentOffsetDefinition;
  yellow: AccentOffsetDefinition;
  green: AccentOffsetDefinition;
  cyan: AccentOffsetDefinition;
  blue: AccentOffsetDefinition;
  purple: AccentOffsetDefinition;
  pink: AccentOffsetDefinition;
}

/**
 * The definition block stored inside a theme file.
 * Contains all parameters needed to regenerate colors.
 */
export interface ThemeDefinitionParams {
  bgHue: number;
  bgSat: number;
  bgLight: number;
  accentHue: number;
  accentSat: number;
  accentLight: number;
  commentLight: number;
  accentOffsets: AccentOffsets;
}

/**
 * On-disk theme file format (themes/<theme>/<theme>-<variant>.json).
 * Source of truth for the editor. Consumed by the generation script to produce base24/ files.
 */
export interface ThemeFileData {
  name: string;
  variant: string;
  definition: ThemeDefinitionParams;
}
