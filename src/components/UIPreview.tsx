import type { Base24Colors } from '../types/index.ts';

interface UIPreviewProps {
  colors: Base24Colors;
}

const UIPreview: React.FC<UIPreviewProps> = ({ colors }) => {
  return (
    <div
      style={{
        background: colors.base00,
        color: colors.base05,
        border: `1px solid ${colors.base02}`,
      }}
      className="rounded-lg p-4 space-y-4 text-base"
    >
      <h4 className="text-base font-semibold mb-4" style={{ color: colors.base0E }}>
        🖥️ UI Elements Preview
      </h4>

      <div
        style={{
          background: colors.base01,
          border: `1px solid ${colors.base02}`,
        }}
        className="rounded border p-3 space-y-3"
      >
        <div className="text-sm font-medium mb-2" style={{ color: colors.base04 }}>
          Code Editor
        </div>

        <div className="flex gap-1 mb-2">
          <div
            style={{
              background: colors.base02,
              color: colors.base05,
            }}
            className="px-3 py-1 rounded-t text-sm"
          >
            main.js
          </div>
          <div
            style={{
              background: colors.base01,
              color: colors.base04,
            }}
            className="px-3 py-1 rounded-t text-sm"
          >
            utils.ts
          </div>
        </div>

        <div
          style={{ background: colors.base00 }}
          className="rounded p-2 text-sm font-mono leading-relaxed"
        >
          <div>
            <span style={{ color: colors.base03 }}>// Function to calculate theme colors</span>
          </div>
          <div>
            <span style={{ color: colors.base0E }}>function</span>{' '}
            <span style={{ color: colors.base0D }}>generateTheme</span>
            <span style={{ color: colors.base05 }}>(</span>
            <span style={{ color: colors.base08 }}>params</span>
            <span style={{ color: colors.base05 }}>: </span>
            <span style={{ color: colors.base0A }}>ThemeParams</span>
            <span style={{ color: colors.base05 }}>
              {')'} {'{'}
            </span>
          </div>
          <div>
            {'  '}
            <span style={{ color: colors.base0E }}>const</span>{' '}
            <span style={{ color: colors.base08 }}>colors</span>{' '}
            <span style={{ color: colors.base05 }}>=</span>{' '}
            <span style={{ color: colors.base0B }}>"#ff5733"</span>
            <span style={{ color: colors.base05 }}>;</span>
          </div>
          <div>
            {'  '}
            <span style={{ color: colors.base0E }}>return</span>{' '}
            <span style={{ color: colors.base08 }}>colors</span>
            <span style={{ color: colors.base05 }}>;</span>
          </div>
          <div>
            <span style={{ color: colors.base05 }}>{'}'}</span>
          </div>
        </div>
      </div>

      <div
        style={{
          background: colors.base00,
          border: `1px solid ${colors.base02}`,
        }}
        className="rounded p-3"
      >
        <div className="text-sm font-medium mb-2" style={{ color: colors.base04 }}>
          Terminal
        </div>
        <div className="text-sm font-mono space-y-1">
          <div>
            <span style={{ color: colors.base0B }}>user@machine</span>
            <span style={{ color: colors.base05 }}>:</span>
            <span style={{ color: colors.base0D }}>~/project</span>
            <span style={{ color: colors.base05 }}>$ </span>
            <span style={{ color: colors.base05 }}>npm run build</span>
          </div>
          <div style={{ color: colors.base0A }}>Building application...</div>
          <div style={{ color: colors.base0B }}>✓ Build successful</div>
          <div style={{ color: colors.base08 }}>⚠ 2 warnings found</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-sm font-medium" style={{ color: colors.base05 }}>
          Interface Elements (Light Text)
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            style={{
              background: colors.base0B,
              color: colors.base05,
            }}
            className="px-3 py-1 rounded text-sm font-bold"
          >
            ✓ Success
          </button>
          <button
            style={{
              background: colors.base0A,
              color: colors.base05,
            }}
            className="px-3 py-1 rounded text-sm font-bold"
          >
            ⚠ Warning
          </button>
          <button
            style={{
              background: colors.base08,
              color: colors.base05,
            }}
            className="px-3 py-1 rounded text-sm font-bold"
          >
            ✗ Failure
          </button>
          <button
            style={{
              background: colors.base0C,
              color: colors.base05,
            }}
            className="px-3 py-1 rounded text-sm font-bold"
          >
            ℹ Info
          </button>
          <button
            style={{
              background: colors.base0E,
              color: colors.base05,
            }}
            className="px-3 py-1 rounded text-sm font-bold"
          >
            ◆ Special
          </button>
          <button
            style={{
              background: colors.base0F,
              color: colors.base05,
            }}
            className="px-3 py-1 rounded text-sm font-bold"
          >
            💖 Pink
          </button>
        </div>

        <div className="mt-4">
          <div className="text-sm font-medium mb-2" style={{ color: colors.base05 }}>
            Text on Accent Colors (Dark Text Test)
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              style={{
                background: colors.base0B,
                color: colors.base00,
              }}
              className="px-3 py-1 rounded text-sm font-bold"
            >
              ✓ Success
            </button>
            <button
              style={{
                background: colors.base0A,
                color: colors.base00,
              }}
              className="px-3 py-1 rounded text-sm font-bold"
            >
              ⚠ Warning
            </button>
            <button
              style={{
                background: colors.base08,
                color: colors.base00,
              }}
              className="px-3 py-1 rounded text-sm font-bold"
            >
              ✗ Failure
            </button>
            <button
              style={{
                background: colors.base0C,
                color: colors.base00,
              }}
              className="px-3 py-1 rounded text-sm font-bold"
            >
              ℹ Info
            </button>
            <button
              style={{
                background: colors.base0E,
                color: colors.base00,
              }}
              className="px-3 py-1 rounded text-sm font-bold"
            >
              ◆ Special
            </button>
            <button
              style={{
                background: colors.base0F,
                color: colors.base00,
              }}
              className="px-3 py-1 rounded text-sm font-bold"
            >
              💖 Pink
            </button>
            :wq
          </div>
        </div>

        <div className="space-y-2">
          <input
            type="text"
            placeholder="Enter text..."
            style={{
              background: colors.base01,
              border: `1px solid ${colors.base02}`,
              color: colors.base05,
            }}
            className="w-full px-2 py-1 rounded text-sm outline-none"
          />
          <div className="flex items-center gap-2">
            <input type="checkbox" style={{ accentColor: colors.base0D }} className="text-sm" />
            <span className="text-sm" style={{ color: colors.base05 }}>
              Enable notifications
            </span>
          </div>
        </div>

        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <div style={{ background: colors.base0B }} className="w-2 h-2 rounded-full" />
            <span style={{ color: colors.base05 }}>Online</span>
          </div>
          <div className="flex items-center gap-1">
            <div style={{ background: colors.base0A }} className="w-2 h-2 rounded-full" />
            <span style={{ color: colors.base05 }}>Warning</span>
          </div>
          <div className="flex items-center gap-1">
            <div style={{ background: colors.base08 }} className="w-2 h-2 rounded-full" />
            <span style={{ color: colors.base05 }}>Error</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-sm" style={{ color: colors.base04 }}>
            Loading Progress
          </div>
          <div
            style={{ background: colors.base02 }}
            className="w-full h-2 rounded-full overflow-hidden"
          >
            <div
              className="h-full rounded-full"
              style={{ width: '65%', background: colors.base0D }}
            />
          </div>
        </div>

        <div
          style={{
            background: colors.base01,
            border: `1px solid ${colors.base0B}`,
            borderLeft: `4px solid ${colors.base0B}`,
          }}
          className="p-2 rounded"
        >
          <div className="text-sm font-medium" style={{ color: colors.base0B }}>
            Success
          </div>
          <div className="text-sm" style={{ color: colors.base05 }}>
            Theme applied successfully!
          </div>
        </div>

        <div
          style={{
            background: colors.base01,
            border: `1px solid ${colors.base0A}`,
            borderLeft: `4px solid ${colors.base0A}`,
          }}
          className="p-2 rounded"
        >
          <div className="text-sm font-medium" style={{ color: colors.base0A }}>
            Warning
          </div>
          <div className="text-sm" style={{ color: colors.base05 }}>
            Some settings may need manual adjustment.
          </div>
        </div>
      </div>

      <div className="pt-2 border-t" style={{ borderColor: colors.base02 }}>
        <div className="text-sm font-medium mb-2" style={{ color: colors.base04 }}>
          Color Palette
        </div>
        <div className="grid grid-cols-8 gap-1">
          {[
            colors.base08,
            colors.base09,
            colors.base0A,
            colors.base0B,
            colors.base0C,
            colors.base0D,
            colors.base0E,
            colors.base0F,
          ].map((color, i) => (
            <div
              key={i}
              style={{ backgroundColor: color }}
              className="w-6 h-6 rounded border border-white border-opacity-20"
              title={`base0${(8 + i).toString(16).toUpperCase()}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default UIPreview;
