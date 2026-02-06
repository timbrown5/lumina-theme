/**
 * Object-oriented wrapper for Base24 color specification.
 *
 * Provides structured access to the Base24 color standard with metadata
 * about color purposes, syntax highlighting roles, and validation capabilities.
 * This class serves as the authoritative source for Base24 specification
 * compliance and color organization within the theme system.
 *
 * Specifications handled:
 * - Complete Base24 color group definitions and metadata
 * - Color purpose documentation for syntax highlighting
 * - Validation functions for Base24 scheme compliance
 * - Standard offset calculations for accent color positioning
 * - Export utilities for Base24 JSON format
 */

import type { Base24Colors, AccentColorKey } from '../types/index.ts';
import { getStandardOffset } from '../utils/colorUtils.ts';

export interface ColorGroup {
  key: string;
  name: string;
  description: string;
}

export interface ColorSection {
  title: string;
  colors: ColorGroup[];
  editable: boolean;
}

export class Base24 {
  static readonly BASE_COLORS: ColorGroup[] = [
    { key: 'base00', name: 'Background', description: 'Primary background color' },
    { key: 'base01', name: 'Alt Background', description: 'Secondary background for panels' },
    { key: 'base02', name: 'Selection', description: 'Selection background' },
    { key: 'base03', name: 'Comments', description: 'Comments and subtle text' },
    { key: 'base04', name: 'Secondary Text', description: 'Secondary foreground (low contrast)' },
    { key: 'base05', name: 'Main Text', description: 'Primary foreground (main text)' },
    { key: 'base06', name: 'Light Surface', description: 'Emphasized foreground' },
    { key: 'base07', name: 'Light Accent', description: 'Strong emphasis (high contrast)' },
  ];

  static readonly ACCENT_COLORS: Array<{ key: AccentColorKey; name: string; description: string }> =
    [
      { key: 'base08', name: 'Red', description: 'Variables, errors, deletion' },
      { key: 'base09', name: 'Orange', description: 'Numbers, constants' },
      { key: 'base0A', name: 'Yellow', description: 'Classes, warnings' },
      { key: 'base0B', name: 'Green', description: 'Strings, additions' },
      { key: 'base0C', name: 'Cyan', description: 'Support, regex' },
      { key: 'base0D', name: 'Blue', description: 'Functions, methods' },
      { key: 'base0E', name: 'Purple', description: 'Keywords, storage' },
      { key: 'base0F', name: 'Pink', description: 'Tags, deprecated' },
    ];

  static readonly MUTED_COLORS: ColorGroup[] = [
    { key: 'base10', name: 'Muted Red', description: 'Subtle red variant' },
    { key: 'base11', name: 'Muted Orange', description: 'Subtle orange variant' },
    { key: 'base12', name: 'Muted Yellow', description: 'Subtle yellow variant' },
    { key: 'base13', name: 'Muted Green', description: 'Subtle green variant' },
    { key: 'base14', name: 'Muted Cyan', description: 'Subtle cyan variant' },
    { key: 'base15', name: 'Muted Blue', description: 'Subtle blue variant' },
    { key: 'base16', name: 'Muted Purple', description: 'Subtle purple variant' },
    { key: 'base17', name: 'Muted Pink', description: 'Subtle pink variant' },
  ];

  static readonly COLOR_SECTIONS: ColorSection[] = [
    {
      title: 'Base Colors',
      colors: Base24.BASE_COLORS,
      editable: false,
    },
    {
      title: 'Accent Colors (Editable)',
      colors: Base24.ACCENT_COLORS,
      editable: true,
    },
    {
      title: 'Muted Accent Colors',
      colors: Base24.MUTED_COLORS,
      editable: false,
    },
  ];

  static getAccentColorKeys(): AccentColorKey[] {
    return Base24.ACCENT_COLORS.map((color) => color.key);
  }

  static getColorName(colorKey: string): string {
    const allColors = [...Base24.BASE_COLORS, ...Base24.ACCENT_COLORS, ...Base24.MUTED_COLORS];
    return allColors.find((color) => color.key === colorKey)?.name || colorKey;
  }

  static getColorDescription(colorKey: string): string {
    const allColors = [...Base24.BASE_COLORS, ...Base24.ACCENT_COLORS, ...Base24.MUTED_COLORS];
    return allColors.find((color) => color.key === colorKey)?.description || '';
  }

  static getAccentColorIndex(colorKey: AccentColorKey): number {
    return Base24.ACCENT_COLORS.findIndex((color) => color.key === colorKey);
  }

  static getStandardOffset(colorKey: AccentColorKey): number {
    return getStandardOffset(colorKey);
  }

  static isAccentColor(colorKey: string): colorKey is AccentColorKey {
    return Base24.getAccentColorKeys().includes(colorKey as AccentColorKey);
  }

  static createBase24Json(
    colors: Base24Colors,
    themeName: string,
    author: string = 'Lumina Theme Generator'
  ): string {
    return JSON.stringify(
      {
        name: themeName,
        scheme: 'base24',
        author,
        colors,
      },
      null,
      2
    );
  }

  static validateBase24Colors(colors: any): colors is Base24Colors {
    const requiredKeys = [
      ...Base24.BASE_COLORS.map((c) => c.key),
      ...Base24.ACCENT_COLORS.map((c) => c.key),
      ...Base24.MUTED_COLORS.map((c) => c.key),
    ];

    return requiredKeys.every(
      (key) => typeof colors[key] === 'string' && /^#[0-9A-Fa-f]{6}$/.test(colors[key])
    );
  }

  static getColorsByGroup() {
    return {
      base: Base24.BASE_COLORS,
      accent: Base24.ACCENT_COLORS,
      muted: Base24.MUTED_COLORS,
    };
  }

  /**
   * Gets organized color sections for UI display.
   * @returns Array of color sections with metadata
   */
  static getColorSections(): ColorSection[] {
    return [
      {
        title: 'Background & UI',
        colors: this.BASE_COLORS,
        editable: false,
      },
      {
        title: 'Accent Colors',
        colors: this.ACCENT_COLORS,
        editable: true,
      },
      {
        title: 'Muted Accents',
        colors: this.MUTED_COLORS,
        editable: false,
      },
    ];
  }
}
