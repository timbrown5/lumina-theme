# Contributing to Lumina

## Development Setup

### Using devenv (Recommended)

```bash
git clone https://github.com/yourusername/lumina-theme-generator.git
cd lumina-theme-generator
devenv shell
npm install
npm run dev
```

### Using Node.js directly

```bash
git clone https://github.com/yourusername/lumina-theme-generator.git
cd lumina-theme-generator
npm install
npm run dev
```

### Build commands

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
```

## Adding a New Theme

1. Create a directory under `themes/` with your theme name (e.g. `themes/forest/`)
2. Add variant JSON files (e.g. `balanced.json`, `bold.json`, `muted.json`)
3. Each file needs: `name`, `variant`, and a `definition` block with bgHue/bgSat/bgLight, accentHue/accentSat/accentLight, commentLight, and accentOffsets
4. The theme is automatically discovered at build time — no code changes needed

## How to Contribute

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request
