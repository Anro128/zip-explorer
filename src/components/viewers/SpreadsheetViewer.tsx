import { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';
import { HighlightText } from '../common/HighlightText';

interface SpreadsheetViewerProps {
  bytes: Uint8Array;
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
    
    const maxCols = Math.max(...json.map(r => r.length));
    const rawHeaders = json[0] || [];
    // Ensure headers array is long enough
    const headers = Array.from({ length: maxCols }, (_, i) => String(rawHeaders[i] || `Col ${i + 1}`));
    
    const rows = json.slice(1).map(r => {
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
        {workbook.SheetNames.length > 1 && (
          <select 
            value={activeSheet} 
            onChange={(e) => { setActiveSheet(e.target.value); setSortCol(null); setFilter(''); }}
            style={{ padding: '2px 8px', borderRadius: 4, border: '1px solid var(--border-default)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
          >
            {workbook.SheetNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        )}
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
      <div className="csv-viewer" onScroll={handleScroll}>
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
      </div>
    </div>
  );
}
