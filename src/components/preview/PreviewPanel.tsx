import { useState } from 'react';
import { TabBar } from './TabBar';
import { ViewerRouter } from './ViewerRouter';
import { usePreviewStore } from '../../store/usePreviewStore';
import { SUPPORTED_VIEWERS_TEXT } from '../../utils/constants';
import { FolderOpen, ZoomIn, ZoomOut, RotateCcw, Columns, X, Download } from 'lucide-react';
import { readFileBytes } from '../../core/vfs/ZipVFS';

interface PreviewPanelProps {
  paneId: 'primary' | 'secondary';
}

export function PreviewPanel({ paneId }: PreviewPanelProps) {
  const store = usePreviewStore();
  const pane = store[paneId];
  if (!pane) return null;
  
  const { tabs, activeTabId } = pane;
  const { setTabZoom, toggleSplit, secondary, setActivePane, activePane } = store;
  const [isDownloading, setIsDownloading] = useState(false);
  
  const activeTab = tabs.find((t) => t.id === activeTabId);
  const isActivePane = activePane === paneId;
  
  const handleDownload = async () => {
    if (!activeTab || isDownloading) return;
    setIsDownloading(true);
    try {
      const bytes = await readFileBytes(activeTab.file.zipId, activeTab.file.entryPath);
      const blob = new Blob([bytes as unknown as BlobPart], { type: activeTab.file.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = activeTab.file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download file', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleZoomIn = () => {
    if (!activeTab) return;
    const currentZoom = activeTab.zoom ?? 1;
    setTabZoom(paneId, activeTab.id, Math.min(currentZoom + 0.25, 4));
  };

  const handleZoomOut = () => {
    if (!activeTab) return;
    const currentZoom = activeTab.zoom ?? 1;
    setTabZoom(paneId, activeTab.id, Math.max(currentZoom - 0.25, 0.25));
  };

  const handleZoomReset = () => {
    if (!activeTab) return;
    setTabZoom(paneId, activeTab.id, 1);
  };

  const zoomPercent = Math.round((activeTab?.zoom ?? 1) * 100);

  return (
    <div
      className={`preview-panel ${isActivePane ? 'active-pane' : ''}`}
      id={`preview-panel-${paneId}`}
      onMouseDownCapture={() => {
        if (!isActivePane) setActivePane(paneId);
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        minHeight: 0,
        minWidth: 0,
        overflow: 'hidden',
        border: isActivePane && secondary ? '1px solid var(--accent-primary)' : '1px solid transparent',
        transition: 'border 0.2s',
      }}
    >
      <TabBar paneId={paneId} />

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
            <button className="btn btn-ghost btn-icon" onClick={handleDownload} disabled={isDownloading} title="Download File" style={{ width: 22, height: 22 }}>
              <Download size={12} style={{ opacity: isDownloading ? 0.5 : 1 }} />
            </button>
            <div style={{ width: 1, height: 12, background: 'var(--border-default)', margin: '0 4px' }} />
            
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
            <div style={{ width: 1, height: 12, background: 'var(--border-default)', margin: '0 4px' }} />
            
            {paneId === 'primary' && !secondary && (
              <button className="btn btn-ghost btn-icon" onClick={toggleSplit} title="Split Right" style={{ width: 22, height: 22 }}>
                <Columns size={12} />
              </button>
            )}
            {paneId === 'secondary' && (
              <button className="btn btn-ghost btn-icon" onClick={toggleSplit} title="Close Split" style={{ width: 22, height: 22 }}>
                <X size={12} />
              </button>
            )}
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
            {paneId === 'primary' && !secondary && (
              <button 
                className="btn btn-secondary" 
                style={{ marginTop: 16 }}
                onClick={toggleSplit}
              >
                <Columns size={14} style={{ marginRight: 6 }} /> Split View
              </button>
            )}
          </div>
        ) : (
          <div style={{ 
            flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden',
            '--viewer-zoom': activeTab.zoom ?? 1 
          } as React.CSSProperties}>
            <ViewerRouter key={activeTab.id} file={activeTab.file} paneId={paneId} />
          </div>
        )}
      </div>
    </div>
  );
}
