import { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { Search } from 'lucide-react';
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

  const matchCount = useMemo(() => {
    if (!filter.trim()) return 0;
    const q = filter.toLowerCase();
    return rows.filter((row) => row.some((cell) => cell.toLowerCase().includes(q))).length;
  }, [rows, filter]);

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
          {filter.trim() ? `${matchCount} matches · ` : ''}{rows.length} rows · {headers.length} cols
        </span>
        <div style={{ flex: 1 }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={11} style={{ position: 'absolute', left: 8, color: 'var(--text-muted)' }} />
          <input
            className="search-input"
            style={{ paddingLeft: 26, width: 200 }}
            placeholder="Search in Spreadsheet..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
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
                  <td key={ci}>{row[ci] ? <HighlightText text={row[ci]} query={filter} /> : ''}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
