import { X, Trash2 } from 'lucide-react';
import { usePreviewStore } from '../../store/usePreviewStore';
import { FileIcon } from '../explorer/FileIcon';
import type { OpenTab } from '../../core/vfs/types';

export function TabBar() {
  const { tabs, activeTabId, closeTab, setActiveTab, closeAllTabs } = usePreviewStore();

  if (tabs.length === 0) return null;

  return (
    <div className="tab-bar" id="tab-bar" role="tablist" style={{ overflow: 'hidden', paddingRight: 4 }}>
      <div style={{ flex: 1, display: 'flex', overflowX: 'auto', overflowY: 'hidden', height: '100%' }} className="hide-scrollbar">
        {tabs.map((tab: OpenTab) => (
          <div
            key={tab.id}
            className={`tab ${activeTabId === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={activeTabId === tab.id}
            id={`tab-${tab.id}`}
            title={tab.file.path}
          >
            <FileIcon fileType={tab.file.fileType} style={{ fontSize: 12 }} />
            <span className="tab-name">{tab.label}</span>
            <button
              className="tab-close"
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              title="Close tab"
              aria-label={`Close ${tab.label}`}
            >
              <X size={11} />
            </button>
          </div>
        ))}
      </div>
      
      {tabs.length > 1 && (
        <button
          className="btn btn-ghost btn-icon"
          onClick={closeAllTabs}
          title="Close All Tabs"
          style={{ flexShrink: 0, marginLeft: 4, width: 26, height: 26 }}
        >
          <Trash2 size={14} style={{ color: 'var(--text-muted)' }} />
        </button>
      )}
    </div>
  );
}
