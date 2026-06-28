import React, { useMemo, useEffect, useRef } from 'react';
import { X, ArrowUpDown, ArrowUp, ArrowDown, Plus, ChevronsDown, ChevronsUp } from 'lucide-react';
import { useExplorerStore } from '../../store/useExplorerStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useZipLoader } from '../../hooks/useZipLoader';
import { FileTreeItem } from './FileTreeItem';
import { SearchBar } from './SearchBar';
import type { VFSNode, VFSFile, SortConfig, SortField } from '../../core/vfs/types';
import { flattenNodes } from '../../core/vfs/ZipVFS';
import { SEARCH_DEBOUNCE_MS, RECURSIVE_SEARCH_MAX } from '../../utils/constants';

import { sortNodes } from '../../utils/sortNodes';

export function FileTree() {
  const { rootZips, searchQuery, setSearchQuery, searchResults, setSearchResults, setSearching, expandAll, collapseAll } =
    useExplorerStore();
  const { sort, setSort } = useSettingsStore();
  const { unloadRootZip, expandNestedZip } = useZipLoader();
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isExpandingAll, setIsExpandingAll] = React.useState(false);

  // Deep expand all, including lazy-loading nested zips
  const handleExpandAll = async () => {
    setIsExpandingAll(true);
    try {
      let newlyLoaded = false;
      const attempted = new Set<string>();
      
      do {
        newlyLoaded = false;
        const currentRootZips = useExplorerStore.getState().rootZips;
        const unexpandedZips: import('../../core/vfs/types').VFSZipFile[] = [];
        
        const gatherUnexpanded = (nodes: import('../../core/vfs/types').VFSNode[]) => {
          for (const n of nodes) {
            if (n.kind === 'zip' && !n.isLoaded && !attempted.has(n.path)) {
              unexpandedZips.push(n);
              attempted.add(n.path);
            } else if (n.kind === 'folder' || (n.kind === 'zip' && n.isLoaded)) {
              gatherUnexpanded(n.children || []);
            }
          }
        };
        
        currentRootZips.forEach(rz => gatherUnexpanded(rz.nodes));
        
        for (const z of unexpandedZips) {
          newlyLoaded = true;
          await expandNestedZip(z, z.depth + 1);
        }
      } while (newlyLoaded);

      expandAll();
    } finally {
      setIsExpandingAll(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      const q = searchQuery.toLowerCase();
      const allFiles: VFSFile[] = [];
      for (const rz of rootZips) {
        allFiles.push(...flattenNodes(rz.nodes));
      }
      const results = allFiles
        .filter((f) => f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q))
        .slice(0, RECURSIVE_SEARCH_MAX)
        .map((f) => ({ node: f, matchType: 'name' as const, score: 1 }));
      setSearchResults(results);
      setSearching(false);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchQuery, rootZips]);

  const cycleSort = (field: SortField) => {
    if (sort.field === field) {
      setSort({ field, order: sort.order === 'asc' ? 'desc' : 'asc' });
    } else {
      setSort({ field, order: 'asc' });
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sort.field !== field) return <ArrowUpDown size={10} />;
    return sort.order === 'asc' ? <ArrowUp size={10} /> : <ArrowDown size={10} />;
  };

  // Add another zip
  const addZip = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.zip';
    input.multiple = true;
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;
      const { loadRootZip } = await import('../../core/vfs/ZipVFS').then(m => ({
        loadRootZip: (f: File) => import('../../hooks/useZipLoader')
      }));
      // Use global loader via DOM event
      const event = new CustomEvent('load-zips', { detail: Array.from(files) });
      window.dispatchEvent(event);
    };
    input.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div className="explorer-header">
        <span>Explorer</span>
        <div style={{ display: 'flex', gap: 2 }}>
          <button
            className="btn btn-ghost btn-icon"
            onClick={handleExpandAll}
            title="Expand All (Includes Nested ZIPs)"
            disabled={isExpandingAll}
          >
            {isExpandingAll ? <div className="spinner" style={{ width: 13, height: 13, borderWidth: 2 }} /> : <ChevronsDown size={13} />}
          </button>
          <button
            className="btn btn-ghost btn-icon"
            onClick={collapseAll}
            title="Collapse All"
          >
            <ChevronsUp size={13} />
          </button>
          <div style={{ width: 1, background: 'var(--border-muted)', margin: '4px 2px' }} />
          <button
            className="btn btn-ghost btn-icon"
            onClick={addZip}
            title="Open another ZIP"
            id="add-zip-btn"
          >
            <Plus size={13} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="explorer-search">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search files (Ctrl+F)"
          id="explorer-search"
        />
      </div>

      {/* Sort controls */}
      <div style={{
        display: 'flex', gap: 4, padding: '4px 8px',
        borderBottom: '1px solid var(--border-muted)',
        flexShrink: 0,
      }}>
        {(['name', 'size', 'modified'] as SortField[]).map((f) => (
          <button
            key={f}
            className={`btn btn-ghost`}
            style={{ padding: '2px 6px', fontSize: 10, gap: 3, color: sort.field === f ? 'var(--text-accent)' : 'var(--text-muted)' }}
            onClick={() => cycleSort(f)}
          >
            <SortIcon field={f} />
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Tree */}
      <div className="explorer-tree">
        {rootZips.length === 0 && (
          <div style={{ padding: '16px 12px', color: 'var(--text-muted)', fontSize: 12, textAlign: 'center' }}>
            No files loaded.<br />
            <span style={{ fontSize: 11 }}>Drop a ZIP or use the upload button.</span>
          </div>
        )}

        {/* Search results mode */}
        {searchQuery.trim() && searchResults.length > 0 && (
          <div>
            <div style={{ padding: '4px 12px', fontSize: 11, color: 'var(--text-muted)' }}>
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
            </div>
            {searchResults.map((r) => (
              <FileTreeItem key={r.node.path} node={r.node} depth={0} highlight={searchQuery} />
            ))}
          </div>
        )}

        {searchQuery.trim() && searchResults.length === 0 && (
          <div style={{ padding: '16px 12px', color: 'var(--text-muted)', fontSize: 12, textAlign: 'center' }}>
            No files matching "{searchQuery}"
          </div>
        )}

        {/* Normal tree mode */}
        {!searchQuery.trim() && rootZips.map((rz) => (
          <div key={rz.zipId} style={{ marginBottom: 4 }}>
            {/* Root zip header */}
            <div
              className="tree-item"
              style={{ paddingLeft: 8, background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-muted)' }}
              title={rz.name}
            >
              <span style={{ fontSize: 14 }}>📦</span>
              <span className="tree-item-name" style={{ fontWeight: 600, color: 'var(--text-accent)' }}>
                {rz.name}
              </span>
              <button
                className="btn btn-ghost btn-icon"
                style={{ marginLeft: 'auto', width: 20, height: 20 }}
                onClick={(e) => { e.stopPropagation(); unloadRootZip(rz.zipId); }}
                title="Close ZIP"
              >
                <X size={11} />
              </button>
            </div>
            {sortNodes(rz.nodes, sort).map((node) => (
              <FileTreeItem key={node.path} node={node} depth={0} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
