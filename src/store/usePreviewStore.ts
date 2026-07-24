import { create } from 'zustand';
import type { VFSFile, OpenTab } from '../core/vfs/types';

let tabCounter = 0;

interface PreviewState {
  tabs: OpenTab[];
  activeTabId: string | null;

  openFile: (file: VFSFile) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  closeAllTabs: () => void;
  setTabZoom: (tabId: string, zoom: number) => void;
}

export const usePreviewStore = create<PreviewState>((set, get) => ({
  tabs: [],
  activeTabId: null,

  openFile: (file) => {
    const existing = get().tabs.find(
      (t) => t.file.path === file.path && t.file.zipId === file.zipId
    );
    if (existing) {
      set({ activeTabId: existing.id });
      return;
    }
    const id = `tab_${++tabCounter}`;
    const tab: OpenTab = {
      id,
      file,
      label: file.name,
      isPinned: false,
    };
    set((s) => ({
      tabs: [...s.tabs, tab],
      activeTabId: id,
    }));
  },

  closeTab: (tabId) =>
    set((s) => {
      const idx = s.tabs.findIndex((t) => t.id === tabId);
      const newTabs = s.tabs.filter((t) => t.id !== tabId);
      let newActiveId = s.activeTabId;
      if (s.activeTabId === tabId) {
        // Activate adjacent tab
        if (newTabs.length > 0) {
          const newIdx = Math.min(idx, newTabs.length - 1);
          newActiveId = newTabs[newIdx].id;
        } else {
          newActiveId = null;
        }
      }
      return { tabs: newTabs, activeTabId: newActiveId };
    }),

  setActiveTab: (tabId) => set({ activeTabId: tabId }),

  closeAllTabs: () => set({ tabs: [], activeTabId: null }),

  setTabZoom: (tabId, zoom) =>
    set((s) => ({
      tabs: s.tabs.map((t) => (t.id === tabId ? { ...t, zoom } : t)),
    })),
}));
