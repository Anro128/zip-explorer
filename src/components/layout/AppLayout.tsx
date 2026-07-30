import { useState, useCallback } from 'react';
import { Archive, FolderOpen, Search } from 'lucide-react';
import { Header } from './Header';
import { SplitPanel } from './SplitPanel';
import { useExplorerStore } from '../../store/useExplorerStore';
import { usePreviewStore } from '../../store/usePreviewStore';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { PasswordDialog } from '../dialogs/PasswordDialog';
import { QuickOpenDialog } from '../dialogs/QuickOpenDialog';
import { useTheme } from '../../hooks/useTheme';

import { ShortcutsDialog } from '../dialogs/ShortcutsDialog';

// Status bar
function StatusBar() {
  const { rootZips, searchQuery, searchResults } = useExplorerStore();
  const { primary, secondary } = usePreviewStore();
  const tabsCount = primary.tabs.length + (secondary ? secondary.tabs.length : 0);
  
  return (
    <div className="status-bar" id="status-bar">
      <span className="status-item flex items-center gap-1">
        <Archive size={12} /> {rootZips.length} ZIP{rootZips.length !== 1 ? 's' : ''} loaded
      </span>
      {tabsCount > 0 && (
        <span className="status-item flex items-center gap-1">
          <FolderOpen size={12} /> {tabsCount} tab{tabsCount !== 1 ? 's' : ''} open
        </span>
      )}
      {searchQuery && (
        <span className="status-item flex items-center gap-1">
          <Search size={12} /> {searchResults.length} results for "{searchQuery}"
        </span>
      )}
      <span style={{ marginLeft: 'auto', opacity: 0.7 }}>
        © 2026 Anro128. All rights reserved.
      </span>
    </div>
  );
}

export function AppLayout() {
  const [showQuickOpen, setShowQuickOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  useTheme(); // Apply theme to document

  const store = usePreviewStore();
  const { closeTab, activePane } = store;
  const activePaneState = store[activePane];
  const activeTabId = activePaneState?.activeTabId;

  const handlers = {
    onQuickOpen: useCallback(() => setShowQuickOpen(true), []),
    onSearch: useCallback(() => {
      const el = document.getElementById('explorer-search') as HTMLInputElement;
      el?.focus();
    }, []),
    onGlobalSearch: useCallback(() => setShowQuickOpen(true), []),
    onCloseTab: useCallback(() => {
      if (activeTabId) closeTab(activePane, activeTabId);
    }, [activeTabId, closeTab, activePane]),
    onEscape: useCallback(() => {
      setShowQuickOpen(false);
      setShowShortcuts(false);
    }, []),
  };

  useKeyboardShortcuts(handlers);

  return (
    <div className="app-layout" id="app-root">
      <Header
        onQuickOpen={handlers.onQuickOpen}
        onGlobalSearch={handlers.onGlobalSearch}
        onShowShortcuts={() => setShowShortcuts(true)}
      />
      <SplitPanel />
      <StatusBar />

      {/* Dialogs */}
      <PasswordDialog />
      {showQuickOpen && (
        <QuickOpenDialog onClose={() => setShowQuickOpen(false)} />
      )}
      {showShortcuts && (
        <ShortcutsDialog onClose={() => setShowShortcuts(false)} />
      )}
    </div>
  );
}
