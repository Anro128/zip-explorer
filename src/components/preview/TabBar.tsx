import { useState, useRef, useEffect } from 'react';
import { X, Trash2, ArrowLeftToLine, ArrowRightToLine, Minimize2 } from 'lucide-react';
import { usePreviewStore } from '../../store/usePreviewStore';
import { FileIcon } from '../explorer/FileIcon';
import type { OpenTab } from '../../core/vfs/types';

interface TabBarProps {
  paneId: 'primary' | 'secondary';
}

export function TabBar({ paneId }: TabBarProps) {
  const store = usePreviewStore();
  const pane = store[paneId];
  if (!pane) return null;

  const { tabs, activeTabId } = pane;
  const { closeTab, setActiveTab, closeAllTabs, moveTab, closeOtherTabs } = store;

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; tabId: string; index: number } | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<number | null>(null);
  const scrollDirectionRef = useRef<'left' | 'right' | null>(null);

  const stopAutoScroll = () => {
    if (scrollIntervalRef.current !== null) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
    scrollDirectionRef.current = null;
  };

  const startAutoScroll = () => {
    if (scrollIntervalRef.current !== null) return;
    scrollIntervalRef.current = window.setInterval(() => {
      const container = scrollContainerRef.current;
      if (!container || !scrollDirectionRef.current) return;
      if (scrollDirectionRef.current === 'left') {
        container.scrollLeft -= 18;
      } else {
        container.scrollLeft += 18;
      }
    }, 16); // ~60fps smooth scroll
  };

  useEffect(() => {
    const onClick = () => setContextMenu(null);
    window.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('click', onClick);
      stopAutoScroll();
    };
  }, []);

  if (tabs.length === 0) return null;

  const handleContainerDragOver = (e: React.DragEvent) => {
    if (!e.dataTransfer?.types?.includes('application/zip-explorer-tab')) return;
    e.preventDefault();
    const container = scrollContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const edgeSize = 60; // distance from edge in pixels to trigger auto-scroll

    if (e.clientX - rect.left < edgeSize && container.scrollLeft > 0) {
      scrollDirectionRef.current = 'left';
      startAutoScroll();
    } else if (rect.right - e.clientX < edgeSize && container.scrollLeft < container.scrollWidth - container.clientWidth) {
      scrollDirectionRef.current = 'right';
      startAutoScroll();
    } else {
      stopAutoScroll();
    }
  };

  return (
    <div className="tab-bar" id={`tab-bar-${paneId}`} role="tablist" style={{ overflow: 'hidden', padding: '0 6px', position: 'relative' }}>
      <div
        ref={scrollContainerRef}
        style={{ flex: 1, display: 'flex', overflowX: 'auto', overflowY: 'hidden', height: '100%' }}
        className="hide-scrollbar"
        onDragOver={handleContainerDragOver}
        onDragLeave={() => stopAutoScroll()}
        onDrop={(e) => {
          e.preventDefault();
          stopAutoScroll();
          if (draggedIndex !== null && dragOverIndex === null) {
            moveTab(paneId, draggedIndex, tabs.length - 1);
          }
          setDraggedIndex(null);
          setDragOverIndex(null);
        }}
      >
        {tabs.map((tab: OpenTab, index: number) => {
          const isDragging = draggedIndex === index;
          const isDragOver = dragOverIndex === index;

          return (
            <div
              key={tab.id}
              className={`tab ${activeTabId === tab.id ? 'active' : ''}`}
              style={{
                opacity: isDragging ? 0.4 : 1,
                boxShadow: isDragOver && (draggedIndex === null || draggedIndex > index)
                  ? 'inset 3px 0 0 0 var(--accent-primary)'
                  : isDragOver && draggedIndex !== null && draggedIndex < index
                  ? 'inset -3px 0 0 0 var(--accent-primary)'
                  : undefined,
                transition: 'opacity 0.15s, box-shadow 0.1s',
                userSelect: 'none',
              }}
              onClick={() => setActiveTab(paneId, tab.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({ x: e.clientX, y: e.clientY, tabId: tab.id, index });
              }}
              role="tab"
              aria-selected={activeTabId === tab.id}
              id={`tab-${paneId}-${tab.id}`}
              title={tab.file.path}
              draggable
              onDragStart={(e) => {
                setDraggedIndex(index);
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('application/zip-explorer-tab', String(index));
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (dragOverIndex !== index) {
                  setDragOverIndex(index);
                }
              }}
              onDragLeave={() => {
                if (dragOverIndex === index) {
                  setDragOverIndex(null);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                stopAutoScroll();
                if (draggedIndex !== null && draggedIndex !== index) {
                  moveTab(paneId, draggedIndex, index);
                }
                setDraggedIndex(null);
                setDragOverIndex(null);
              }}
              onDragEnd={() => {
                stopAutoScroll();
                setDraggedIndex(null);
                setDragOverIndex(null);
              }}
            >
              <FileIcon fileType={tab.file.fileType} style={{ fontSize: 12 }} />
              <span className="tab-name">{tab.label}</span>
              <button
                className="tab-close"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(paneId, tab.id);
                }}
                title="Close tab"
                aria-label={`Close ${tab.label}`}
              >
                <X size={11} />
              </button>
            </div>
          );
        })}
      </div>
      
      {tabs.length > 1 && (
        <button
          className="btn btn-ghost btn-icon"
          onClick={() => closeAllTabs(paneId)}
          title="Close All Tabs"
          style={{ flexShrink: 0, marginLeft: 4, width: 26, height: 26 }}
        >
          <Trash2 size={14} style={{ color: 'var(--text-muted)' }} />
        </button>
      )}

      {/* ── Right-Click Context Menu ── */}
      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-default)',
            borderRadius: 6,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            padding: '4px 0',
            zIndex: 9999,
            minWidth: 160,
            fontSize: 12,
            color: 'var(--text-primary)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '6px 12px', textAlign: 'left', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            onClick={() => {
              moveTab(paneId, contextMenu.index, 0);
              setContextMenu(null);
            }}
          >
            <ArrowLeftToLine size={13} /> Pindahkan ke Awal (Kiri)
          </button>
          <button
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '6px 12px', textAlign: 'left', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            onClick={() => {
              moveTab(paneId, contextMenu.index, tabs.length - 1);
              setContextMenu(null);
            }}
          >
            <ArrowRightToLine size={13} /> Pindahkan ke Akhir (Kanan)
          </button>
          <div style={{ height: 1, background: 'var(--border-muted)', margin: '4px 0' }} />
          <button
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '6px 12px', textAlign: 'left', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            onClick={() => {
              closeOtherTabs(paneId, contextMenu.tabId);
              setContextMenu(null);
            }}
          >
            <Minimize2 size={13} /> Tutup Tab Lainnya
          </button>
          <button
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '6px 12px', textAlign: 'left', background: 'none', border: 'none', color: 'var(--text-danger)', cursor: 'pointer' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            onClick={() => {
              closeTab(paneId, contextMenu.tabId);
              setContextMenu(null);
            }}
          >
            <X size={13} /> Tutup Tab
          </button>
        </div>
      )}
    </div>
  );
}
