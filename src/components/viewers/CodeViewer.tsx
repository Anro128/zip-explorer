import React, { Suspense } from 'react';
import type { VFSFile } from '../../core/vfs/types';
import { useSettingsStore } from '../../store/useSettingsStore';
import { getMonacoLanguage } from '../../utils/fileTypes';
import { usePreviewStore } from '../../store/usePreviewStore';

const MonacoEditor = React.lazy(() => import('@monaco-editor/react'));

interface CodeViewerProps {
  file: VFSFile;
  text: string;
  paneId: 'primary' | 'secondary';
}

export function CodeViewer({ file, text, paneId }: CodeViewerProps) {
  const { theme, editorFontSize } = useSettingsStore();
  const pane = usePreviewStore((s) => s[paneId]);
  const activeTab = pane?.tabs.find((t) => t.id === pane?.activeTabId);
  const zoom = activeTab?.zoom ?? 1;
  const language = getMonacoLanguage(file.name);

  return (
    <div
      style={{
        // Fill the entire flex column given by PreviewPanel
        flex: 1,
        minHeight: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Info bar */}
      <div
        style={{
          padding: '4px 12px',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-muted)',
          fontSize: 11,
          color: 'var(--text-muted)',
          flexShrink: 0,
          display: 'flex',
          gap: 16,
          alignItems: 'center',
        }}
      >
        <span>
          Language:{' '}
          <strong style={{ color: 'var(--text-accent)' }}>{language}</strong>
        </span>
        <span>{text.split('\n').length.toLocaleString()} lines</span>
        <span>{text.length.toLocaleString()} chars</span>
      </div>

      {/* Monaco fills remaining space */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Suspense
          fallback={
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: 10,
                color: 'var(--text-secondary)',
              }}
            >
              <div className="spinner" />
              <span>Loading editor...</span>
            </div>
          }
        >
          <MonacoEditor
            height="100%"
            width="100%"
            language={language}
            value={text}
            theme={theme === 'dark' ? 'vs-dark' : 'vs'}
            options={{
              readOnly: true,
              fontSize: editorFontSize * zoom,
              wordWrap: 'on',
              minimap: { enabled: true },
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              renderWhitespace: 'selection',
              automaticLayout: true,
              smoothScrolling: true,
              cursorStyle: 'line',
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontLigatures: true,
              padding: { top: 8, bottom: 8 },
            }}
          />
        </Suspense>
      </div>
    </div>
  );
}
