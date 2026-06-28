import React, { useEffect, useRef } from 'react';
import { Download, Copy, Link, Info } from 'lucide-react';
import type { VFSNode } from '../../core/vfs/types';
import { readFileBlob } from '../../core/vfs/ZipVFS';

interface ContextMenuProps {
  x: number;
  y: number;
  node: VFSNode;
  onClose: () => void;
}

export function ContextMenu({ x, y, node, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  // Adjust position so menu stays in viewport
  const style: React.CSSProperties = {
    left: Math.min(x, window.innerWidth - 200),
    top: Math.min(y, window.innerHeight - 250),
  };

  const copyPath = () => {
    navigator.clipboard.writeText(node.path);
    onClose();
  };

  const copyName = () => {
    navigator.clipboard.writeText(node.name);
    onClose();
  };

  const download = async () => {
    if (node.kind !== 'file') return;
    try {
      const blob = await readFileBlob(node.zipId, node.entryPath, node.mimeType);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = node.name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      console.error('Download failed:', e);
    }
    onClose();
  };

  return (
    <div className="context-menu" style={style} ref={ref} id="context-menu">
      {node.kind === 'file' && (
        <div className="context-menu-item" onClick={download}>
          <Download size={13} />
          Download
        </div>
      )}
      <div className="context-menu-item" onClick={copyPath}>
        <Link size={13} />
        Copy Path
      </div>
      <div className="context-menu-item" onClick={copyName}>
        <Copy size={13} />
        Copy Name
      </div>
      <div className="context-menu-separator" />
      <div className="context-menu-item" onClick={onClose} style={{ color: 'var(--text-muted)' }}>
        <Info size={13} />
        {node.kind === 'file'
          ? `${node.name}`
          : node.name}
      </div>
    </div>
  );
}
