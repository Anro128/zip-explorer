import type { VFSNode, SortConfig } from '../core/vfs/types';

export function sortNodes(nodes: VFSNode[], sort: SortConfig): VFSNode[] {
  return [...nodes].sort((a, b) => {
    // Folders first
    const aIsDir = a.kind !== 'file';
    const bIsDir = b.kind !== 'file';
    if (aIsDir && !bIsDir) return -1;
    if (!aIsDir && bIsDir) return 1;

    let cmp = 0;
    if (sort.field === 'name') {
      cmp = a.name.localeCompare(b.name, undefined, { numeric: true });
    } else if (sort.field === 'size') {
      const aSize = a.kind === 'file' ? a.size : 0;
      const bSize = b.kind === 'file' ? b.size : 0;
      cmp = aSize - bSize;
    } else if (sort.field === 'modified') {
      const aT = a.kind !== 'folder' ? (a.lastModified?.getTime() ?? 0) : 0;
      const bT = b.kind !== 'folder' ? (b.lastModified?.getTime() ?? 0) : 0;
      cmp = aT - bT;
    }
    return sort.order === 'asc' ? cmp : -cmp;
  });
}
