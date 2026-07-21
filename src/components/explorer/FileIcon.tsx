import React from 'react';
import type { FileType } from '../../core/vfs/types';
import { FILE_ICONS } from '../../utils/fileTypes';

interface FileIconProps {
  fileType: FileType | 'folder';
  className?: string;
  style?: React.CSSProperties;
}

export function FileIcon({ fileType, className = '', style }: FileIconProps) {
  const config = FILE_ICONS[fileType] ?? FILE_ICONS.unsupported;
  const IconComponent = config.icon;
  
  return (
    <span
      className={`tree-item-icon ${config.colorClass} ${className} flex items-center justify-center`}
      style={style}
      title={config.label}
      aria-label={config.label}
    >
      <IconComponent size={16} strokeWidth={2} />
    </span>
  );
}
