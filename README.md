# Lumina Theme Generator

Base24 theme generator for Neovim and terminals with real-time preview.

## Features

- **3 themes** (Midnight, Twilight, Sunset) with 3 variants each (Balanced, Bold, Muted)
- **Real-time preview** across UI, VSCode, JavaScript, Python, C++, and Terminal views
- **Per-color control** — any of the 24 colors can be switched from auto-calculated to manually set with independent H/S/L sliders and a color picker
- **Copy BG to variants** — sync background colors across all variants of a theme
- **Export** as Neovim Lua, Base24 JSON, or download/save theme files
- Themes are dynamically discovered from `themes/` directory — no hardcoded lists

## Quick Start

```bash
npm install
npm run dev
```

## How It Works

Colors are generated parametrically from 7 sliders (background H/S/L, accent H/S/L, comment lightness). Each theme variant stores these parameters plus per-color accent offsets in `themes/<theme>/<variant>.json`.

Any individual color can be switched to **manual** mode, giving it independent hue, saturation, and lightness controls that are unaffected by the shared sliders. This enables multi-tonal themes that the parametric system alone can't express.

## Color System

### Auto-calculated colors

All 24 Base24 colors are derived from 7 parameters:

- **Background** (base00-02): Controlled by bgHue/bgSat/bgLight. base01 and base02 are progressively more saturated/lighter variants.
- **Foreground & UI** (base03-07): Derived from background hue with automatic contrast. Comments (base03) use a complementary hue.
- **Accents** (base08-0F): Eight colors distributed around the color wheel from `accentHue`, with per-theme offsets for each color. Perceptual lightness correction via OKHSL.
- **Muted accents** (base10-17): Softer versions of base08-0F with reduced saturation and increased lightness.

### Manual color selection

Any color can be switched from auto-calculated to manually selected:

1. Click a color swatch in the palette
2. Click **Switch to manual** (or use the color picker, which switches automatically)
3. Adjust with the H/S/L sliders, the color picker, or type a hex value directly
4. Click **Auto** to return to the calculated value

Manual colors are stored as `colorOverrides` in the theme JSON and are unaffected by shared slider changes. The "M" badge on a swatch indicates a manually set color.

## Project Structure

```
themes/                    # Theme parameter JSON files (source of truth)
src/
  App.tsx                  # Main app with inline layout components
  classes/
    ThemeManager.ts        # Central state manager
    Base24.ts              # Base24 spec wrapper
  components/
    ColorPaletteEditor.tsx # Per-color editing with manual/auto controls
    SyntaxHighlighter.tsx  # Lazy-loaded syntax preview
    UIPreview.tsx          # UI element preview
    VSCodePreview.tsx      # VSCode-style preview
  hooks/useThemeLogic.ts   # React hook wrapping ThemeManager
  utils/
    colorUtils.ts          # HSL/OKHSL color generation
    exportUtils.ts         # Neovim, Base24, file exports
    themeLoader.ts         # Dynamic theme discovery via import.meta.glob
  types/                   # TypeScript type definitions
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and how to add new themes.

## License

MIT
