import { TabBar } from './TabBar';
import { ViewerRouter } from './ViewerRouter';
import { usePreviewStore } from '../../store/usePreviewStore';
import { SUPPORTED_VIEWERS_TEXT } from '../../utils/constants';
import { FolderOpen, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export function PreviewPanel() {
  const { tabs, activeTabId, setTabZoom } = usePreviewStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);
  
  const handleZoomIn = () => {
    if (!activeTab) return;
    const currentZoom = activeTab.zoom ?? 1;
    setTabZoom(activeTab.id, Math.min(currentZoom + 0.25, 4));
  };

  const handleZoomOut = () => {
    if (!activeTab) return;
    const currentZoom = activeTab.zoom ?? 1;
    setTabZoom(activeTab.id, Math.max(currentZoom - 0.25, 0.25));
  };

  const handleZoomReset = () => {
    if (!activeTab) return;
    setTabZoom(activeTab.id, 1);
  };

  const zoomPercent = Math.round((activeTab?.zoom ?? 1) * 100);

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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {activeTab.file.path}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button className="btn btn-ghost btn-icon" onClick={handleZoomOut} title="Zoom Out" style={{ width: 22, height: 22 }}>
              <ZoomOut size={12} />
            </button>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', minWidth: 32, textAlign: 'center' }}>
              {zoomPercent}%
            </span>
            <button className="btn btn-ghost btn-icon" onClick={handleZoomIn} title="Zoom In" style={{ width: 22, height: 22 }}>
              <ZoomIn size={12} />
            </button>
            <button className="btn btn-ghost btn-icon" onClick={handleZoomReset} title="Reset Zoom" style={{ width: 22, height: 22 }}>
              <RotateCcw size={12} />
            </button>
          </div>
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
          <div style={{ 
            flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden',
            '--viewer-zoom': activeTab.zoom ?? 1 
          } as React.CSSProperties}>
            <ViewerRouter key={activeTab.id} file={activeTab.file} />
          </div>
        )}
      </div>
    </div>
  );
}
