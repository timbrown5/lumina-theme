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

import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import type { Base24Colors, TabKey } from '../types/index.ts';

/**
 * Creates a complete custom syntax highlighting theme based on Base24 colors.
 * Built entirely from scratch with no external dependencies.
 *
 * @param colors - Base24 color scheme to apply
 * @returns Complete syntax highlighter theme object with Base24 color mappings
 */
const createBase24Theme = (colors: Base24Colors) => ({
  'code[class*="language-"]': {
    color: colors.base05,
    background: 'transparent',
    textShadow: 'none',
    fontFamily: '"Maple Mono NF", "JetBrains Mono", Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
    fontSize: '1em',
    lineHeight: '1.5',
    whiteSpace: 'pre' as const,
    wordSpacing: 'normal',
    wordBreak: 'normal' as const,
    wordWrap: 'normal' as const,
    tabSize: '4',
    hyphens: 'none' as const,
  },
  'pre[class*="language-"]': {
    color: colors.base05,
    background: colors.base00,
    textShadow: 'none',
    fontFamily: '"Maple Mono NF", "JetBrains Mono", Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
    fontSize: '1em',
    lineHeight: '1.5',
    whiteSpace: 'pre' as const,
    wordSpacing: 'normal',
    wordBreak: 'normal' as const,
    wordWrap: 'normal' as const,
    tabSize: '4',
    hyphens: 'none' as const,
    padding: '1em',
    margin: '0.5em 0',
    overflow: 'auto',
    borderRadius: '0.5em',
    border: `1px solid ${colors.base02}`,
  },
  ':not(pre) > code[class*="language-"]': {
    background: colors.base01,
    padding: '0.1em',
    borderRadius: '0.3em',
    whiteSpace: 'normal',
  },

  // Comments and documentation
  'comment': { color: colors.base03, fontStyle: 'italic' },
  'prolog': { color: colors.base03, fontStyle: 'italic' },
  'doctype': { color: colors.base03, fontStyle: 'italic' },
  'cdata': { color: colors.base03, fontStyle: 'italic' },

  // Punctuation and operators
  'punctuation': { color: colors.base05 },
  'operator': { color: colors.base05 },
  'entity': { color: colors.base05 },
  'url': { color: colors.base05 },

  // Properties and attributes
  'property': { color: colors.base08 },
  'tag': { color: colors.base08 },
  'constant': { color: colors.base09 },
  'symbol': { color: colors.base09 },
  'deleted': { color: colors.base08 },

  // Numbers and booleans
  'boolean': { color: colors.base09 },
  'number': { color: colors.base09 },

  // Selectors and classes
  'selector': { color: colors.base0A },
  'attr-name': { color: colors.base0A },
  'string': { color: colors.base0B },
  'char': { color: colors.base0B },
  'builtin': { color: colors.base0A },
  'inserted': { color: colors.base0B },

  // Functions and methods
  'function': { color: colors.base0D },
  'function-name': { color: colors.base0D },
  'class-name': { color: colors.base0A },

  // Keywords and language constructs
  'keyword': { color: colors.base0E, fontWeight: 'bold' },
  'atrule': { color: colors.base0E },
  'attr-value': { color: colors.base0B },
  'regex': { color: colors.base0C },
  'important': { color: colors.base08, fontWeight: 'bold' },

  // Variables
  'variable': { color: colors.base08 },

  // Special characters
  'namespace': { color: colors.base0F },

  // Specific language tokens
  'token.comment': { color: colors.base03, fontStyle: 'italic' },
  'token.string': { color: colors.base0B },
  'token.number': { color: colors.base09 },
  'token.boolean': { color: colors.base09 },
  'token.keyword': { color: colors.base0E, fontWeight: 'bold' },
  'token.function': { color: colors.base0D },
  'token.class-name': { color: colors.base0A },
  'token.operator': { color: colors.base05 },
  'token.punctuation': { color: colors.base05 },

  // Additional syntax elements
  'bold': { fontWeight: 'bold' },
  'italic': { fontStyle: 'italic' },
  'entity.name.tag': { color: colors.base08 },
  'entity.other.attribute-name': { color: colors.base0A },
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
   * Maps internal language keys to Prism.js language identifiers.
   */
  const languageMap: Record<string, string> = {
    terminal: 'bash',
    cpp: 'cpp',
    javascript: 'javascript',
    python: 'python',
    'ui-preview': 'javascript',
    'vscode': 'javascript',
  };

  const code = CODE_EXAMPLES[language] || CODE_EXAMPLES.javascript;
  const syntaxLanguage = languageMap[language] || 'javascript';
  const theme = createBase24Theme(colors);

  return (
    <SyntaxHighlighter
      language={syntaxLanguage}
      style={theme}
      customStyle={{
        margin: 0,
        fontSize: '1rem',
        lineHeight: '1.6',
        background: colors.base00,
        border: `1px solid ${colors.base02}`,
        borderRadius: '0.5rem',
        fontFamily: '"Maple Mono NF", "JetBrains Mono", Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
      }}
    >
      {code}
    </SyntaxHighlighter>
  );
};

export default SyntaxPreview;
