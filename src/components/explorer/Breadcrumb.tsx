import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import type { BreadcrumbItem } from '../../core/vfs/types';

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate: (item: BreadcrumbItem) => void;
}

export function Breadcrumb({ items, onNavigate }: BreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <div className="breadcrumb" id="breadcrumb-nav">
      <span className="breadcrumb-item" onClick={() => onNavigate({ label: 'Home', path: '', nodeKind: 'root' })}>
        <Home size={11} />
      </span>
      {items.map((item, idx) => (
        <React.Fragment key={item.path}>
          <span className="breadcrumb-separator">
            <ChevronRight size={10} />
          </span>
          <span
            className="breadcrumb-item"
            onClick={() => onNavigate(item)}
            title={item.path}
          >
            {item.nodeKind === 'zip' && <span style={{ marginRight: 3 }}>📦</span>}
            {item.nodeKind === 'folder' && <span style={{ marginRight: 3 }}>📁</span>}
            {item.label}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}
