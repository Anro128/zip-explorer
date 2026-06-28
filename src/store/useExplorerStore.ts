import { create } from 'zustand';
import type { VFSNode, VFSZipFile, VFSFolder, SortConfig, BreadcrumbItem, SearchResult } from '../core/vfs/types';

interface RootZip {
  zipId: string;
  name: string;
  nodes: VFSNode[];
}

interface ExplorerState {
  // Loaded root ZIPs
  rootZips: RootZip[];

  // Currently browsed path (for breadcrumb)
  currentPath: string;
  breadcrumbs: BreadcrumbItem[];

  // Tree state
  expandedPaths: Set<string>;
  selectedPath: string | null;

  // Sort
  sort: SortConfig;

  // Search
  searchQuery: string;
  searchResults: SearchResult[];
  isSearching: boolean;

  // Loading states
  loadingPaths: Set<string>;  // paths of nodes currently being loaded

  // Password prompts
  pendingPasswordFor: { zipId: string; name: string; resolve: (pw: string | null) => void } | null;

  // Actions
  addRootZip: (rz: RootZip) => void;
  removeRootZip: (zipId: string) => void;
  toggleExpand: (path: string) => void;
  setExpanded: (path: string, expanded: boolean) => void;
  collapseAll: () => void;
  expandAll: () => void;
  setSelected: (path: string | null) => void;
  setSort: (sort: SortConfig) => void;
  setSearchQuery: (q: string) => void;
  setSearchResults: (results: SearchResult[]) => void;
  setSearching: (v: boolean) => void;
  setLoadingPath: (path: string, loading: boolean) => void;
  updateZipNode: (zipId: string, newZipNode: Partial<VFSZipFile> & { path: string }) => void;
  setBreadcrumbs: (crumbs: BreadcrumbItem[]) => void;
  setCurrentPath: (path: string) => void;
  setPendingPassword: (v: ExplorerState['pendingPasswordFor']) => void;
}

export const useExplorerStore = create<ExplorerState>((set, _get) => ({
  rootZips: [],
  currentPath: '',
  breadcrumbs: [],
  expandedPaths: new Set(),
  selectedPath: null,
  sort: { field: 'name', order: 'asc' },
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  loadingPaths: new Set(),
  pendingPasswordFor: null,

  addRootZip: (rz) =>
    set((s) => ({ rootZips: [...s.rootZips, rz] })),

  removeRootZip: (zipId) =>
    set((s) => ({ rootZips: s.rootZips.filter((r) => r.zipId !== zipId) })),

  toggleExpand: (path) =>
    set((s) => {
      const next = new Set(s.expandedPaths);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return { expandedPaths: next };
    }),

  setExpanded: (path, expanded) =>
    set((s) => {
      const next = new Set(s.expandedPaths);
      if (expanded) next.add(path);
      else next.delete(path);
      return { expandedPaths: next };
    }),

  collapseAll: () => set({ expandedPaths: new Set() }),

  expandAll: () =>
    set((s) => {
      const allPaths = new Set<string>();
      const traverse = (nodes: VFSNode[]) => {
        for (const n of nodes) {
          if (n.kind === 'folder' || n.kind === 'zip') {
            allPaths.add(n.path);
            traverse(n.children);
          }
        }
      };
      s.rootZips.forEach((rz) => traverse(rz.nodes));
      return { expandedPaths: allPaths };
    }),

  setSelected: (path) => set({ selectedPath: path }),

  setSort: (sort) => set({ sort }),

  setSearchQuery: (q) => set({ searchQuery: q }),

  setSearchResults: (results) => set({ searchResults: results }),

  setSearching: (v) => set({ isSearching: v }),

  setLoadingPath: (path, loading) =>
    set((s) => {
      const next = new Set(s.loadingPaths);
      if (loading) next.add(path);
      else next.delete(path);
      return { loadingPaths: next };
    }),

  updateZipNode: (_zipId, update) =>
    set((s) => {
      const updateInTree = (nodes: VFSNode[]): VFSNode[] =>
        nodes.map((n) => {
          if (n.path === update.path && n.kind === 'zip') {
            return { ...n, ...update } as VFSZipFile;
          }
          if (n.kind === 'folder' || n.kind === 'zip') {
            return { ...n, children: updateInTree(n.children) } as VFSFolder | VFSZipFile;
          }
          return n;
        });

      return {
        rootZips: s.rootZips.map((rz) => ({
          ...rz,
          nodes: updateInTree(rz.nodes),
        })),
      };
    }),

  setBreadcrumbs: (crumbs) => set({ breadcrumbs: crumbs }),
  setCurrentPath: (path) => set({ currentPath: path }),
  setPendingPassword: (v) => set({ pendingPasswordFor: v }),
}));
