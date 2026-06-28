import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SortConfig } from '../core/vfs/types';

interface SettingsState {
  theme: 'dark' | 'light';
  explorerWidth: number;
  sort: SortConfig;
  showHiddenFiles: boolean;
  showFileSizes: boolean;
  editorFontSize: number;
  recentFiles: string[];  // paths

  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  setExplorerWidth: (w: number) => void;
  setSort: (s: SortConfig) => void;
  toggleHiddenFiles: () => void;
  toggleFileSizes: () => void;
  setEditorFontSize: (size: number) => void;
  addRecentFile: (path: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, _get) => ({
      theme: 'dark',
      explorerWidth: 280,
      sort: { field: 'name', order: 'asc' },
      showHiddenFiles: false,
      showFileSizes: true,
      editorFontSize: 13,
      recentFiles: [],

      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setExplorerWidth: (w) => set({ explorerWidth: w }),
      setSort: (sort) => set({ sort }),
      toggleHiddenFiles: () => set((s) => ({ showHiddenFiles: !s.showHiddenFiles })),
      toggleFileSizes: () => set((s) => ({ showFileSizes: !s.showFileSizes })),
      setEditorFontSize: (size) => set({ editorFontSize: size }),
      addRecentFile: (path) =>
        set((s) => ({
          recentFiles: [path, ...s.recentFiles.filter((p) => p !== path)].slice(0, 20),
        })),
    }),
    {
      name: 'zip-explorer-settings',
      partialize: (s) => ({
        theme: s.theme,
        explorerWidth: s.explorerWidth,
        sort: s.sort,
        showHiddenFiles: s.showHiddenFiles,
        showFileSizes: s.showFileSizes,
        editorFontSize: s.editorFontSize,
        recentFiles: s.recentFiles,
      }),
    }
  )
);
