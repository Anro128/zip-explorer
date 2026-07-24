import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { HighlightText } from '../common/HighlightText';

interface TextViewerProps {
  text: string;
}

export function TextViewer({ text }: TextViewerProps) {
  const [filter, setFilter] = useState('');

  const lines = useMemo(() => text.split('\n'), [text]);
  const lineNumWidth = String(lines.length).length;

  const matchCount = useMemo(() => {
    if (!filter.trim()) return 0;
    const q = filter.toLowerCase();
    return lines.filter(line => line.toLowerCase().includes(q)).length;
  }, [lines, filter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div style={{ padding: '6px 12px', borderBottom: '1px solid var(--border-muted)', background: 'var(--bg-secondary)', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {filter.trim() ? `${matchCount} matches · ` : ''}{lines.length} lines
        </span>
        <div style={{ flex: 1 }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={11} style={{ position: 'absolute', left: 8, color: 'var(--text-muted)' }} />
          <input
            className="search-input"
            style={{ paddingLeft: 26, width: 200 }}
            placeholder="Filter text..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            id="text-filter"
          />
        </div>
      </div>

      {/* Text Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          background: 'var(--bg-primary)',
        }}
        id="text-viewer"
        className="text-viewer"
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
                  {line ? <HighlightText text={line} query={filter} /> : ' '}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
