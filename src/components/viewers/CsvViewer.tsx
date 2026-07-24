import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
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

  const matchCount = useMemo(() => {
    if (!filter.trim()) return 0;
    const q = filter.toLowerCase();
    return rows.filter((row) => row.some((cell) => cell.toLowerCase().includes(q))).length;
  }, [rows, filter]);

  const toggleSort = (colIdx: number) => {
    if (sortCol === colIdx) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(colIdx); setSortDir('asc'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div style={{ padding: '6px 12px', borderBottom: '1px solid var(--border-muted)', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {filter.trim() ? `${matchCount} matches · ` : ''}{rows.length} rows · {headers.length} cols
        </span>
        <div style={{ flex: 1 }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={11} style={{ position: 'absolute', left: 8, color: 'var(--text-muted)' }} />
          <input
            className="search-input"
            style={{ paddingLeft: 26, width: 200 }}
            placeholder="Search in CSV..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            id="csv-filter"
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
