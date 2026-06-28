import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import xml from 'react-syntax-highlighter/dist/esm/languages/hljs/xml';
import yaml from 'react-syntax-highlighter/dist/esm/languages/hljs/yaml';
import { atomOneDark, atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useSettingsStore } from '../../store/useSettingsStore';

SyntaxHighlighter.registerLanguage('xml', xml);
SyntaxHighlighter.registerLanguage('yaml', yaml);

interface SyntaxViewerProps {
  text: string;
  language: 'xml' | 'yaml';
}

export function SyntaxViewer({ text, language }: SyntaxViewerProps) {
  const { theme } = useSettingsStore();
  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <SyntaxHighlighter
        language={language}
        style={theme === 'dark' ? atomOneDark : atomOneLight}
        showLineNumbers
        customStyle={{
          margin: 0,
          padding: '16px',
          background: 'var(--bg-primary)',
          fontSize: '12px',
          fontFamily: 'var(--font-mono)',
          minHeight: '100%',
        }}
        lineNumberStyle={{ color: 'var(--text-muted)', minWidth: '3em' }}
      >
        {text}
      </SyntaxHighlighter>
    </div>
  );
}
