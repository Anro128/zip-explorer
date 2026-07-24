import { useEffect, useMemo, useState } from 'react';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';
import { HighlightText } from '../common/HighlightText';

interface TextViewerProps {
  text: string;
}

export function TextViewer({ text }: TextViewerProps) {
  const [filter, setFilter] = useState('');

  const lines = useMemo(() => text.split('\n'), [text]);
  const lineNumWidth = String(lines.length).length;

  const [activeMatchIndex, setActiveMatchIndex] = useState(0);

  const matchData = useMemo(() => {
    if (!filter.trim()) return { total: 0, lineStarts: [] };
    const regex = new RegExp(`(${filter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    let total = 0;
    const lineStarts = lines.map(line => {
      const start = total;
      total += (line.match(regex) || []).length;
      return start;
    });
    return { total, lineStarts };
  }, [lines, filter]);

  // Reset active match when filter changes
  useEffect(() => {
    setActiveMatchIndex(0);
  }, [filter]);

  // Auto-scroll to active match
  useEffect(() => {
    if (matchData.total > 0) {
      const el = document.getElementById('active-search-match');
      if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [activeMatchIndex, matchData.total]);

  const nextMatch = () => {
    if (matchData.total > 0) setActiveMatchIndex(prev => (prev + 1) % matchData.total);
  };
  const prevMatch = () => {
    if (matchData.total > 0) setActiveMatchIndex(prev => (prev - 1 + matchData.total) % matchData.total);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div style={{ padding: '6px 12px', borderBottom: '1px solid var(--border-muted)', background: 'var(--bg-secondary)', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {filter.trim() && matchData.total > 0 ? `${activeMatchIndex + 1} of ${matchData.total} matches · ` : filter.trim() ? `0 matches · ` : ''}{lines.length} lines
        </span>
        <div style={{ flex: 1 }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={11} style={{ position: 'absolute', left: 8, color: 'var(--text-muted)' }} />
          <input
            className="search-input"
            style={{ paddingLeft: 26, paddingRight: filter.trim() ? 50 : 8, width: 220 }}
            placeholder="Search text..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            id="text-filter"
            onKeyDown={e => {
              if (e.key === 'Enter') {
                if (e.shiftKey) prevMatch();
                else nextMatch();
              }
            }}
          />
          {filter.trim() && matchData.total > 0 && (
            <div style={{ position: 'absolute', right: 4, display: 'flex', gap: 2 }}>
              <button 
                onClick={prevMatch}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}
              >
                <ChevronUp size={14} />
              </button>
              <button 
                onClick={nextMatch}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}
              >
                <ChevronDown size={14} />
              </button>
            </div>
          )}
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
                  {line ? <HighlightText text={line} query={filter} matchStartIndex={matchData.lineStarts[idx]} activeMatchIndex={activeMatchIndex} /> : ' '}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
