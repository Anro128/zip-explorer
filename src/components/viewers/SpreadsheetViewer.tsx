import { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';
import { HighlightText } from '../common/HighlightText';

interface SpreadsheetViewerProps {
  bytes: Uint8Array;
}

function getExcelColName(n: number): string {
  let name = '';
  let col = n;
  while (col >= 0) {
    name = String.fromCharCode((col % 26) + 65) + name;
    col = Math.floor(col / 26) - 1;
  }
  return name;
}

export function SpreadsheetViewer({ bytes }: SpreadsheetViewerProps) {
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [activeSheet, setActiveSheet] = useState<string>('');
  const [filter, setFilter] = useState('');
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const wb = XLSX.read(bytes, { type: 'array' });
      setWorkbook(wb);
      if (wb.SheetNames.length > 0) {
        setActiveSheet(wb.SheetNames[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse spreadsheet');
    }
  }, [bytes]);

  const { headers, rows } = useMemo(() => {
    if (!workbook || !activeSheet) return { headers: [], rows: [] };
    const sheet = workbook.Sheets[activeSheet];
    if (!sheet) return { headers: [], rows: [] };
    
    // header: 1 produces an array of arrays
    const json: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    if (json.length === 0) return { headers: [], rows: [] };
    
    const maxCols = Math.max(...json.map(r => r.length), 0);
    if (maxCols === 0) return { headers: [], rows: [] };

    // Standard Excel Column Labels: A, B, C, D, ...
    const headers = Array.from({ length: maxCols }, (_, i) => getExcelColName(i));
    
    // Keep ALL rows (including row 0) as data rows
    const rows = json.map(r => {
      return Array.from({ length: maxCols }, (_, i) => String(r[i] ?? ''));
    });
    
    return { headers, rows };
  }, [workbook, activeSheet]);

  const sortedRows = useMemo(() => {
    let r = [...rows];
    if (sortCol !== null) {
      r.sort((a, b) => {
        const av = a[sortCol] ?? '';
        const bv = b[sortCol] ?? '';
        const n1 = parseFloat(av), n2 = parseFloat(bv);
        const cmp = !isNaN(n1) && !isNaN(n2) ? n1 - n2 : av.localeCompare(bv);
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return r;
  }, [rows, sortCol, sortDir]);

  const CHUNK_SIZE = 100;
  const [visibleCount, setVisibleCount] = useState(CHUNK_SIZE);

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

  // Auto-scroll to active match and smart expand
  useEffect(() => {
    if (matchData.total > 0) {
      const targetRowIdx = matchData.rowStarts.findIndex((cellStarts, idx) => {
        const rowStart = cellStarts[0] ?? matchData.total;
        const nextRowStart = matchData.rowStarts[idx + 1]?.[0] ?? matchData.total;
        return activeMatchIndex >= rowStart && activeMatchIndex < nextRowStart;
      });

      if (targetRowIdx !== -1 && targetRowIdx >= visibleCount) {
        setVisibleCount(Math.min(targetRowIdx + 50, sortedRows.length));
      } else {
        const el = document.getElementById('active-search-match');
        if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
  }, [activeMatchIndex, matchData, visibleCount, sortedRows.length]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 300) {
      if (visibleCount < sortedRows.length) {
        setVisibleCount(v => Math.min(v + CHUNK_SIZE, sortedRows.length));
      }
    }
  };

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

  if (error) {
    return <div style={{ padding: 20, color: 'var(--text-danger)' }}>{error}</div>;
  }
  if (!workbook) {
    return <div style={{ padding: 20 }}>Parsing spreadsheet...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div style={{ padding: '6px 12px', borderBottom: '1px solid var(--border-muted)', display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0, overflowX: 'auto' }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {filter.trim() && matchData.total > 0 ? `${activeMatchIndex + 1} of ${matchData.total} matches · ` : filter.trim() ? `0 matches · ` : ''}{rows.length} rows · {headers.length} cols
        </span>
        <div style={{ flex: 1 }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={11} style={{ position: 'absolute', left: 8, color: 'var(--text-muted)' }} />
          <input
            className="search-input"
            style={{ paddingLeft: 26, paddingRight: filter.trim() ? 50 : 8, width: 220 }}
            placeholder="Search in Spreadsheet..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
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
      <div className="csv-viewer" onScroll={handleScroll} style={{ flex: 1, minHeight: 0 }}>
        {rows.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: 13 }}>
            No data in sheet "{activeSheet}"
          </div>
        ) : (
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
              {sortedRows.slice(0, visibleCount).map((row, ri) => (
                <tr key={ri}>
                  <td style={{ color: 'var(--text-muted)', textAlign: 'right' }}>{ri + 1}</td>
                  {headers.map((_, ci) => (
                    <td key={ci}>{row[ci] ? <HighlightText text={row[ci]} query={filter} matchStartIndex={matchData.rowStarts[ri]?.[ci]} activeMatchIndex={activeMatchIndex} /> : ''}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Bottom Excel Sheet Tabs Bar ── */}
      {workbook.SheetNames.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            padding: '4px 8px 0 8px',
            background: 'var(--bg-secondary)',
            borderTop: '1px solid var(--border-muted)',
            overflowX: 'auto',
            flexShrink: 0,
          }}
          className="hide-scrollbar"
        >
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginRight: 6, fontWeight: 600, flexShrink: 0, letterSpacing: '0.05em' }}>
            SHEETS ({workbook.SheetNames.length}):
          </div>
          {workbook.SheetNames.map((name) => {
            const isActive = activeSheet === name;
            return (
              <button
                key={name}
                onClick={() => {
                  setActiveSheet(name);
                  setSortCol(null);
                  setFilter('');
                  setVisibleCount(CHUNK_SIZE);
                }}
                style={{
                  padding: '4px 12px',
                  borderTopLeftRadius: 4,
                  borderTopRightRadius: 4,
                  border: '1px solid',
                  borderColor: isActive ? 'var(--border-default)' : 'transparent',
                  borderBottom: isActive ? '2px solid var(--accent-primary)' : '1px solid transparent',
                  background: isActive ? 'var(--bg-primary)' : 'transparent',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontSize: 11,
                  transition: 'all 0.12s ease',
                }}
              >
                {name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
