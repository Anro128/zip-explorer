import { TabBar } from './TabBar';
import { ViewerRouter } from './ViewerRouter';
import { usePreviewStore } from '../../store/usePreviewStore';
import { SUPPORTED_VIEWERS_TEXT } from '../../utils/constants';
import { FolderOpen } from 'lucide-react';

export function PreviewPanel() {
  const { tabs, activeTabId } = usePreviewStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);

  return (
    <div
      className="preview-panel"
      id="preview-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        minHeight: 0,
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      <TabBar />

      {/* File path indicator */}
      {activeTab && (
        <div
          style={{
            padding: '3px 12px',
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-muted)',
            fontSize: 11,
            color: 'var(--text-muted)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {activeTab.file.path}
        </div>
      )}

      {/* Content area — must fill remaining height */}
      <div
        className="preview-content"
        style={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {!activeTab ? (
          <div
            className="drop-zone"
            style={{ height: '100%', flex: 1 }}
          >
            <FolderOpen size={48} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
            <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              Select a file from the explorer to preview it
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: 12, opacity: 0.7 }}>
              {SUPPORTED_VIEWERS_TEXT}
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <ViewerRouter key={activeTab.id} file={activeTab.file} />
          </div>
        )}
      </div>
    </div>
  );
}
