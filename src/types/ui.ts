/**
 * Type definitions for UI components and interactions.
 */

/**
 * Available preview tab identifiers for code and UI previews.
 */
export type TabKey = 'colors' | 'ui-preview' | 'vscode' | 'javascript' | 'python' | 'cpp' | 'terminal';

/**
 * Slider component type classifications for gradient generation.
 */
export type SliderType = 'hue' | 'saturation' | 'lightness';

/**
 * Color metadata for UI display and organization.
 */
export interface ColorGroup {
  key: string;
  name: string;
}
