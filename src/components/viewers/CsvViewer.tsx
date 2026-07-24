import { useEffect, useMemo, useState } from 'react';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';
import { HighlightText } from '../common/HighlightText';

interface CsvViewerProps {
  text: string;
}

function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return { headers: [], rows: [] };

  function parseLine(line: string): string[] {
    const result: string[] = [];
    let cur = '';
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQuote && line[i + 1] === '"') { cur += '"'; i++; }
        else { inQuote = !inQuote; }
      } else if (c === ',' && !inQuote) {
        result.push(cur); cur = '';
      } else {
        cur += c;
      }
    }
    result.push(cur);
    return result;
  }

  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(parseLine);
  return { headers, rows };
}

export function CsvViewer({ text }: CsvViewerProps) {
  const [filter, setFilter] = useState('');
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const { headers, rows } = useMemo(() => parseCsv(text), [text]);

  const sortedRows = useMemo(() => {
    let r = [...rows];
    if (sortCol !== null) {
      r.sort((a, b) => {
        const av = a[sortCol] ?? '';
        const bv = b[sortCol] ?? '';
        const n1 = parseFloat(av), n2 = parseFloat(bv);
        let cmp = !isNaN(n1) && !isNaN(n2) ? n1 - n2 : av.localeCompare(bv);
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return r;
  }, [rows, sortCol, sortDir]);

  const [activeMatchIndex, setActiveMatchIndex] = useState(0);

  const matchData = useMemo(() => {
    if (!filter.trim()) return { total: 0, rowStarts: [] };
    const regex = new RegExp(`(${filter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    let total = 0;
    const rowStarts = sortedRows.map(row => {
      return row.map(cell => {
        const start = total;
        total += (cell.match(regex) || []).length;
        return start;
      });
    });
    return { total, rowStarts };
  }, [sortedRows, filter]);

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

  const toggleSort = (colIdx: number) => {
    if (sortCol === colIdx) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(colIdx); setSortDir('asc'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div style={{ padding: '6px 12px', borderBottom: '1px solid var(--border-muted)', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {filter.trim() && matchData.total > 0 ? `${activeMatchIndex + 1} of ${matchData.total} matches · ` : filter.trim() ? `0 matches · ` : ''}{rows.length} rows · {headers.length} cols
        </span>
        <div style={{ flex: 1 }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={11} style={{ position: 'absolute', left: 8, color: 'var(--text-muted)' }} />
          <input
            className="search-input"
            style={{ paddingLeft: 26, paddingRight: filter.trim() ? 50 : 8, width: 220 }}
            placeholder="Search in CSV..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            id="csv-filter"
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

      {/* Table */}
      <div className="csv-viewer">
        <table className="csv-table">
          <thead>
            <tr>
              <th style={{ width: 40, color: 'var(--text-muted)', textAlign: 'right' }}>#</th>
              {headers.map((h, i) => (
                <th key={i} onClick={() => toggleSort(i)} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {h}
                    {sortCol === i && <span>{sortDir === 'asc' ? '↑' : '↓'}</span>}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, ri) => (
              <tr key={ri}>
                <td style={{ color: 'var(--text-muted)', textAlign: 'right' }}>{ri + 1}</td>
                {headers.map((_, ci) => (
                  <td key={ci}>{row[ci] ? <HighlightText text={row[ci]} query={filter} matchStartIndex={matchData.rowStarts[ri]?.[ci]} activeMatchIndex={activeMatchIndex} /> : ''}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
