import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, FileText } from 'lucide-react';
import { useExplorerStore } from '../../store/useExplorerStore';
import { usePreviewStore } from '../../store/usePreviewStore';
import { flattenNodes } from '../../core/vfs/ZipVFS';
import type { VFSFile } from '../../core/vfs/types';
import { FileIcon } from '../explorer/FileIcon';

interface QuickOpenProps {
  onClose: () => void;
}

export function QuickOpenDialog({ onClose }: QuickOpenProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<VFSFile[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const { rootZips } = useExplorerStore();
  const { openFile } = usePreviewStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      setResults([]);
      setSelectedIdx(0);
      return;
    }
    const allFiles: VFSFile[] = [];
    for (const rz of rootZips) {
      allFiles.push(...flattenNodes(rz.nodes));
    }
    const filtered = allFiles
      .filter((f) => f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q))
      .slice(0, 50);
    setResults(filtered);
    setSelectedIdx(0);
  }, [query, rootZips]);

  const openSelected = useCallback((file: VFSFile) => {
    openFile(file);
    onClose();
  }, [openFile, onClose]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (results[selectedIdx]) openSelected(results[selectedIdx]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="quick-open-overlay" onClick={onClose} id="quick-open-overlay">
      <div className="quick-open" onClick={(e) => e.stopPropagation()} id="quick-open-dialog">
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={14} style={{ position: 'absolute', left: 16, color: 'var(--text-muted)' }} />
          <input
            ref={inputRef}
            className="quick-open-input"
            style={{ paddingLeft: 40 }}
            placeholder="Search files... (Ctrl+P)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            id="quick-open-input"
          />
        </div>

        <div className="quick-open-results">
          {query.trim() === '' && (
            <div style={{ padding: '16px', color: 'var(--text-muted)', fontSize: 12, textAlign: 'center' }}>
              Start typing to search all files...
            </div>
          )}
          {results.length === 0 && query.trim() && (
            <div style={{ padding: '16px', color: 'var(--text-muted)', fontSize: 12, textAlign: 'center' }}>
              No files found for "{query}"
            </div>
          )}
          {results.map((file, idx) => (
            <div
              key={file.path}
              className={`quick-open-item ${idx === selectedIdx ? 'selected' : ''}`}
              onClick={() => openSelected(file)}
              onMouseEnter={() => setSelectedIdx(idx)}
              id={`quick-result-${idx}`}
            >
              <FileIcon fileType={file.fileType} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {file.name}
                </div>
                <div className="quick-open-path">{file.path}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
