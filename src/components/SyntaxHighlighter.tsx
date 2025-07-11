/**
 * Real-time syntax highlighting preview using react-syntax-highlighter.
 *
 * Provides live code examples in multiple programming languages with syntax
 * highlighting that updates immediately as theme colors change. This component
 * serves as a crucial feedback mechanism for developers to see how their
 * themes will appear in actual coding environments.
 *
 * Language support includes:
 * - JavaScript with modern React patterns and hooks
 * - Python with type hints and class definitions
 * - C++ with modern features and smart pointers
 * - Terminal/Bash with realistic command sequences
 * - Real-time Base24 theme integration with proper color mapping
 */

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Base24Colors, TabKey } from '../types/index.ts';

/**
 * Creates a custom syntax highlighting theme based on Base24 colors.
 *
 * @param colors - Base24 color scheme to apply
 * @returns Syntax highlighter theme object with Base24 color mappings
 */
const createBase24Theme = (colors: Base24Colors) => ({
  ...oneDark,
  'code[class*="language-"]': {
    ...oneDark['code[class*="language-"]'],
    color: colors.base05,
    background: colors.base00,
    fontFamily: '"JetBrains Mono", Consolas, Monaco, "Andale Mono", monospace',
  },
  'pre[class*="language-"]': {
    ...oneDark['pre[class*="language-"]'],
    background: colors.base00,
    border: `1px solid ${colors.base02}`,
  },
  comment: { color: colors.base03, fontStyle: 'italic' },
  string: { color: colors.base0B },
  number: { color: colors.base09 },
  boolean: { color: colors.base09 },
  keyword: { color: colors.base0E, fontWeight: 'bold' },
  function: { color: colors.base0D },
  'function-name': { color: colors.base0D },
  variable: { color: colors.base08 },
  property: { color: colors.base08 },
  'class-name': { color: colors.base0A },
  operator: { color: colors.base05 },
  punctuation: { color: colors.base05 },
});

/**
 * Code examples for different programming languages and contexts.
 * Provides realistic, meaningful code samples that showcase syntax highlighting.
 */
const CODE_EXAMPLES: Record<string, string> = {
  javascript: `// React Hook with State Management
import { useState, useEffect } from 'react'

const useCounter = (initialValue = 0) => {
  const [count, setCount] = useState(initialValue)
  const [error, setError] = useState(null)

  const increment = () => {
    try {
      setCount(prev => prev + 1)
      setError(null) // Clear any previous errors
    } catch (err) {
      setError('Failed to increment')
    }
  }

  useEffect(() => {
    console.log(\`Count: \${count}\`)
    if (count > 100) {
      console.warn('Count is getting high!')
    }
  }, [count])

  return { count, increment, error }
}`,

  python: `# Data Processing Pipeline
import pandas as pd
from typing import List, Optional

class DataProcessor:
    def __init__(self, threshold: float = 0.5):
        self.threshold = threshold
        self.errors = []

    def process(self, data: List[dict]) -> pd.DataFrame:
        """Filter and process data."""
        try:
            df = pd.DataFrame(data)
            # Filter by threshold
            filtered = df[df['score'] > self.threshold]
            print(f"Processed {len(filtered)} records")
            return filtered
        except ValueError as e:
            self.errors.append(str(e))
            raise Exception("Processing failed")`,

  cpp: `// Modern C++ with Smart Pointers
#include <memory>
#include <vector>
#include <iostream>

template<typename T>
class Container {
private:
    std::vector<std::unique_ptr<T>> data_;
    bool debug_mode = false;

public:
    void add(T&& item) {
        data_.push_back(std::make_unique<T>(std::move(item)));
        if (debug_mode) {
            std::cout << "Added item, size: " << size() << std::endl;
        }
    }

    void clear() {
        data_.clear();
        std::cerr << "Container cleared!" << std::endl;
    }

    size_t size() const { return data_.size(); }
};`,

  terminal: `❯ git status
On branch main
Changes not staged for commit:
  modified: src/components/ThemeGenerator.tsx
  deleted:  old_config.json

Untracked files:
  new_feature.rs

❯ npm run build
✓ Build successful in 2.3s
⚠ 2 warnings found

❯ git add . && git commit -m "Add new theme system"
[main abc123] Add new theme system
 3 files changed, 150 insertions(+), 50 deletions(-)

❯ cargo test
error: compilation failed
thread 'main' panicked at src/lib.rs:42`,
};

interface SyntaxPreviewProps {
  colors: Base24Colors;
  language: TabKey;
}

/**
 * Syntax-highlighted code preview component with live theme integration.
 *
 * Displays code examples in various programming languages with syntax
 * highlighting that updates in real-time as the theme changes.
 *
 * @param props - Preview configuration
 * @param props.colors - Base24 color scheme for syntax highlighting
 * @param props.language - Programming language to display
 * @returns Syntax-highlighted code block
 */
const SyntaxPreview: React.FC<SyntaxPreviewProps> = ({ colors, language }) => {
  /**
   * Maps internal language keys to react-syntax-highlighter language identifiers.
   */
  const languageMap: Record<string, string> = {
    terminal: 'bash',
    cpp: 'cpp',
    javascript: 'javascript',
    python: 'python',
  };

  const code = CODE_EXAMPLES[language] || CODE_EXAMPLES.javascript;
  const syntaxLanguage = languageMap[language] || language;
  const theme = createBase24Theme(colors);

  return (
    <SyntaxHighlighter
      language={syntaxLanguage}
      style={theme}
      customStyle={{
        margin: 0,
        fontSize: '1rem',
        lineHeight: '1.6',
      }}
    >
      {code}
    </SyntaxHighlighter>
  );
};

export default SyntaxPreview;
