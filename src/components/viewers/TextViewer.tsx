import React from 'react';

interface TextViewerProps {
  text: string;
}

export function TextViewer({ text }: TextViewerProps) {
  const lines = text.split('\n');
  const lineNumWidth = String(lines.length).length;

  return (
    <div
      style={{
        height: '100%',
        overflowY: 'auto',
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        background: 'var(--bg-primary)',
      }}
      id="text-viewer"
    >
      <table style={{ borderCollapse: 'collapse', width: '100%', tableLayout: 'fixed' }}>
        <tbody>
          {lines.map((line, idx) => (
            <tr key={idx} style={{ lineHeight: '20px' }}>
              <td
                style={{
                  width: `${lineNumWidth + 2}ch`,
                  paddingLeft: 12,
                  paddingRight: 8,
                  color: 'var(--text-muted)',
                  userSelect: 'none',
                  textAlign: 'right',
                  verticalAlign: 'top',
                  borderRight: '1px solid var(--border-muted)',
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                {idx + 1}
              </td>
              <td
                style={{
                  paddingLeft: 12,
                  paddingRight: 12,
                  color: 'var(--text-primary)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  verticalAlign: 'top',
                }}
              >
                {line || ' '}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
