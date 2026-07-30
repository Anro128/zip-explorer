import { create } from 'zustand';
import type { VFSFile, OpenTab } from '../core/vfs/types';

let tabCounter = 0;

export interface PaneState {
  tabs: OpenTab[];
  activeTabId: string | null;
}

export interface PreviewState {
  primary: PaneState;
  secondary: PaneState | null;
  activePane: 'primary' | 'secondary';

  openFile: (file: VFSFile) => void;
  closeTab: (paneId: 'primary' | 'secondary', tabId: string) => void;
  setActiveTab: (paneId: 'primary' | 'secondary', tabId: string) => void;
  closeAllTabs: (paneId: 'primary' | 'secondary') => void;
  setTabZoom: (paneId: 'primary' | 'secondary', tabId: string, zoom: number) => void;
  moveTab: (paneId: 'primary' | 'secondary', fromIndex: number, toIndex: number) => void;
  closeOtherTabs: (paneId: 'primary' | 'secondary', tabId: string) => void;
  
  setActivePane: (paneId: 'primary' | 'secondary') => void;
  toggleSplit: () => void;
}

export const usePreviewStore = create<PreviewState>((set, get) => ({
  primary: { tabs: [], activeTabId: null },
  secondary: null,
  activePane: 'primary',

  openFile: (file) => {
    const state = get();
    const paneId = state.activePane;
    const pane = state[paneId];
    if (!pane) return;

    const existing = pane.tabs.find(
      (t) => t.file.path === file.path && t.file.zipId === file.zipId
    );

    if (existing) {
      set({
        [paneId]: { ...pane, activeTabId: existing.id }
      } as Partial<PreviewState>);
      return;
    }

    const id = `tab_${++tabCounter}`;
    const tab: OpenTab = {
      id,
      file,
      label: file.name,
      isPinned: false,
    };

    set({
      [paneId]: {
        ...pane,
        tabs: [...pane.tabs, tab],
        activeTabId: id,
      }
    } as Partial<PreviewState>);
  },

  closeTab: (paneId, tabId) =>
    set((s) => {
      const pane = s[paneId];
      if (!pane) return s;

      const idx = pane.tabs.findIndex((t) => t.id === tabId);
      const newTabs = pane.tabs.filter((t) => t.id !== tabId);
      let newActiveId = pane.activeTabId;

      if (pane.activeTabId === tabId) {
        if (newTabs.length > 0) {
          const newIdx = Math.min(idx, newTabs.length - 1);
          newActiveId = newTabs[newIdx].id;
        } else {
          newActiveId = null;
        }
      }

      return {
        [paneId]: { ...pane, tabs: newTabs, activeTabId: newActiveId }
      } as Partial<PreviewState>;
    }),

  setActiveTab: (paneId, tabId) => 
    set((s) => {
      const pane = s[paneId];
      if (!pane) return s;
      return { [paneId]: { ...pane, activeTabId: tabId } } as Partial<PreviewState>;
    }),

  closeAllTabs: (paneId) => 
    set((s) => {
      if (!s[paneId]) return s;
      return { [paneId]: { tabs: [], activeTabId: null } } as Partial<PreviewState>;
    }),

  setTabZoom: (paneId, tabId, zoom) =>
    set((s) => {
      const pane = s[paneId];
      if (!pane) return s;
      return {
        [paneId]: {
          ...pane,
          tabs: pane.tabs.map((t) => (t.id === tabId ? { ...t, zoom } : t)),
        }
      } as Partial<PreviewState>;
    }),

  moveTab: (paneId, fromIndex, toIndex) =>
    set((s) => {
      const pane = s[paneId];
      if (!pane) return s;
      if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= pane.tabs.length || toIndex >= pane.tabs.length) {
        return s;
      }
      const newTabs = [...pane.tabs];
      const [moved] = newTabs.splice(fromIndex, 1);
      newTabs.splice(toIndex, 0, moved);
      return { [paneId]: { ...pane, tabs: newTabs } } as Partial<PreviewState>;
    }),

  closeOtherTabs: (paneId, tabId) =>
    set((s) => {
      const pane = s[paneId];
      if (!pane) return s;
      const target = pane.tabs.find((t) => t.id === tabId);
      if (!target) return s;
      return { [paneId]: { ...pane, tabs: [target], activeTabId: tabId } } as Partial<PreviewState>;
    }),

  setActivePane: (paneId) => set({ activePane: paneId }),

  toggleSplit: () => set((s) => {
    if (s.secondary) {
      return {
        secondary: null,
        activePane: 'primary'
      };
    } else {
      return {
        secondary: { tabs: [], activeTabId: null },
        activePane: 'secondary'
      };
    }
  }),
}));
