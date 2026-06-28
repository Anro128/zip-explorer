import React, { useState, useCallback } from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';
import type { VFSNode, VFSFile, VFSZipFile, VFSFolder } from '../../core/vfs/types';
import { FileIcon } from './FileIcon';
import { ContextMenu } from './ContextMenu';
import { useExplorerStore } from '../../store/useExplorerStore';
import { usePreviewStore } from '../../store/usePreviewStore';
import { useZipLoader } from '../../hooks/useZipLoader';
import { useSettingsStore } from '../../store/useSettingsStore';
import { formatSize } from '../../utils/formatSize';
import { sortNodes } from '../../utils/sortNodes';

interface FileTreeItemProps {
  node: VFSNode;
  depth?: number;
  highlight?: string;
}

export function FileTreeItem({ node, depth = 0, highlight }: FileTreeItemProps) {
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null);
  const { expandedPaths, selectedPath, loadingPaths, setSelected } = useExplorerStore();
  const { toggleExpand } = useExplorerStore();
  const { openFile } = usePreviewStore();
  const { expandNestedZip } = useZipLoader();
  const { showFileSizes, sort } = useSettingsStore();

  const isExpanded = expandedPaths.has(node.path);
  const isSelected = selectedPath === node.path;
  const isLoading = loadingPaths.has(node.path);

  const indent = depth * 12;

  const handleClick = useCallback(async () => {
    setSelected(node.path);

    if (node.kind === 'file') {
      openFile(node as VFSFile);
    } else if (node.kind === 'folder') {
      toggleExpand(node.path);
    } else if (node.kind === 'zip') {
      const zipNode = node as VFSZipFile;
      if (!zipNode.isLoaded) {
        await expandNestedZip(zipNode, depth);
      } else {
        toggleExpand(node.path);
      }
    }
  }, [node, depth, setSelected, openFile, toggleExpand, expandNestedZip]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setCtxMenu({ x: e.clientX, y: e.clientY });
  };

  function highlightText(text: string, query: string) {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="highlight-match">{text.slice(idx, idx + query.length)}</mark>
        {text.slice(idx + query.length)}
      </>
    );
  }

  const renderChildren = () => {
    if (!isExpanded) return null;
    let children: VFSNode[] = [];
    if (node.kind === 'folder') children = (node as VFSFolder).children;
    if (node.kind === 'zip') children = (node as VFSZipFile).children;
    
    // Sort children using the global sort utility
    return sortNodes(children, sort).map((child: VFSNode) => (
      <FileTreeItem key={child.path} node={child} depth={depth + 1} highlight={highlight} />
    ));
  };

  const fileType = node.kind === 'folder' ? 'folder' : node.kind === 'zip' ? 'zip' : node.fileType;

  return (
    <>
      <div
        className={`tree-item ${isSelected ? 'selected' : ''}`}
        style={{ paddingLeft: 8 + indent }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        title={node.path}
        id={`tree-${node.path.replace(/[^a-z0-9]/gi, '-')}`}
      >
        {/* Chevron for expand/collapse */}
        {(node.kind === 'folder' || node.kind === 'zip') && (
          isLoading ? (
            <Loader2 size={12} className="tree-chevron" style={{ animation: 'spin 600ms linear infinite' }} />
          ) : (
            <ChevronRight
              size={12}
              className={`tree-chevron ${isExpanded ? 'open' : ''}`}
            />
          )
        )}
        {node.kind === 'file' && <span style={{ width: 14, flexShrink: 0 }} />}

        <FileIcon fileType={fileType} />

        <span className="tree-item-name">
          {highlightText(node.name, highlight ?? '')}
        </span>

        {node.kind === 'zip' && !node.isLoaded && (
          <span className="nested-zip-badge">ZIP</span>
        )}

        {showFileSizes && node.kind === 'file' && node.size > 0 && (
          <span className="tree-item-size">{formatSize(node.size)}</span>
        )}
      </div>

      {renderChildren()}

      {ctxMenu && (
        <ContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          node={node}
          onClose={() => setCtxMenu(null)}
        />
      )}
    </>
  );
}
