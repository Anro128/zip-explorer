import React, { useMemo } from 'react';
import { useRef, useState } from 'react';

interface HtmlViewerProps {
  text: string;
}

export function HtmlViewer({ text }: HtmlViewerProps) {
  const [view, setView] = useState<'preview' | 'source'>('preview');

  // Create sandboxed blob URL
  const blobUrl = useMemo(() => {
    const blob = new Blob([text], { type: 'text/html' });
    return URL.createObjectURL(blob);
  }, [text]);

  React.useEffect(() => {
    return () => URL.revokeObjectURL(blobUrl);
  }, [blobUrl]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        display: 'flex', gap: 4, padding: '4px 12px',
        background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-muted)',
        flexShrink: 0, alignItems: 'center',
      }}>
        <button
          className={`btn ${view === 'preview' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ padding: '2px 8px', fontSize: 11 }}
          onClick={() => setView('preview')}
        >
          Preview
        </button>
        <button
          className={`btn ${view === 'source' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ padding: '2px 8px', fontSize: 11 }}
          onClick={() => setView('source')}
        >
          Source
        </button>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 8 }}>
          🔒 Sandboxed — scripts disabled
        </span>
      </div>

      {view === 'preview' ? (
        <iframe
          className="html-sandbox"
          src={blobUrl}
          sandbox="allow-same-origin allow-forms"  // NO allow-scripts for security
          title="HTML Preview"
          id="html-sandbox"
          style={{ flex: 1 }}
        />
      ) : (
        <div style={{ height: '100%', overflow: 'auto', fontFamily: 'var(--font-mono)', fontSize: 12, padding: 16, whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
          {text}
        </div>
      )}
    </div>
  );
}
