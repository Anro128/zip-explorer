import React, { useState, useCallback } from 'react';
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
  const { tabs } = usePreviewStore();

  const totalFiles = rootZips.reduce((sum, rz) => sum + rz.nodes.length, 0);

  return (
    <div className="status-bar" id="status-bar">
      <span className="status-item">
        📦 {rootZips.length} ZIP{rootZips.length !== 1 ? 's' : ''} loaded
      </span>
      {tabs.length > 0 && (
        <span className="status-item">
          📂 {tabs.length} tab{tabs.length !== 1 ? 's' : ''} open
        </span>
      )}
      {searchQuery && (
        <span className="status-item">
          🔍 {searchResults.length} results for "{searchQuery}"
        </span>
      )}
      <span style={{ marginLeft: 'auto', opacity: 0.7 }}>
        ZIP Explorer — No extraction. Pure virtual filesystem.
      </span>
    </div>
  );
}

export function AppLayout() {
  const [showQuickOpen, setShowQuickOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  useTheme(); // Apply theme to document

  const { setSearchQuery } = useExplorerStore();
  const { closeTab, activeTabId } = usePreviewStore();

  const handlers = {
    onQuickOpen: useCallback(() => setShowQuickOpen(true), []),
    onSearch: useCallback(() => {
      const el = document.getElementById('explorer-search') as HTMLInputElement;
      el?.focus();
    }, []),
    onGlobalSearch: useCallback(() => setShowQuickOpen(true), []),
    onCloseTab: useCallback(() => {
      if (activeTabId) closeTab(activeTabId);
    }, [activeTabId, closeTab]),
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
