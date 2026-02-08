/**
 * Type definitions for theme configuration and customization.
 *
 * ## Key Types
 * - ThemeParams: All adjustable theme parameters
 * - ColorAdjustment: Individual color fine-tuning data
 * - ThemeFileData: On-disk theme file format
 */

import type { AccentColorKey, MutedColorKey } from './base24.ts';

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
 * Override for an individual color's HSL values, used when a color is "locked".
 */
export interface ColorOverride {
  hue: number;
  saturation: number;
  lightness: number;
}

/**
 * Background color keys that can be individually locked.
 */
export type BackgroundColorKey = 'base00' | 'base01' | 'base02';

/**
 * Foreground & UI color keys that can be individually locked.
 */
export type ForegroundColorKey = 'base03' | 'base04' | 'base05' | 'base06' | 'base07';

/**
 * All color keys that support individual lock/override.
 */
export type LockableColorKey = BackgroundColorKey | ForegroundColorKey | AccentColorKey | MutedColorKey;

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
  colorOverrides?: Partial<Record<LockableColorKey, ColorOverride>>;
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
  colorOverrides?: Partial<Record<LockableColorKey, ColorOverride>>;
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
