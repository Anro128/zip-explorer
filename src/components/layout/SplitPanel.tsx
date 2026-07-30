import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FileTree } from '../explorer/FileTree';
import { PreviewPanel } from '../preview/PreviewPanel';
import { DropZone } from '../explorer/DropZone';
import { useExplorerStore } from '../../store/useExplorerStore';
import { useZipLoader } from '../../hooks/useZipLoader';
import { usePreviewStore } from '../../store/usePreviewStore';

const MIN_SIDEBAR = 200;   // px
const MAX_SIDEBAR = 600;   // px
const DEFAULT_SIDEBAR = 280; // px

export function SplitPanel() {
  const { rootZips, isSidebarVisible } = useExplorerStore();
  const { secondary } = usePreviewStore();
  const { loadRootZip } = useZipLoader();
  const [isDroppingOnApp, setIsDroppingOnApp] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, width: DEFAULT_SIDEBAR });
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Drag-to-resize logic ──────────────────────────────────────────────────
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    dragStart.current = { x: e.clientX, width: sidebarWidth };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [sidebarWidth]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = e.clientX - dragStart.current.x;
      const newWidth = Math.max(MIN_SIDEBAR, Math.min(MAX_SIDEBAR, dragStart.current.width + delta));
      setSidebarWidth(newWidth);
    };
    const onMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  // ── Global drag-and-drop ──────────────────────────────────────────────────
  useEffect(() => {
    const onDragOver = (e: DragEvent) => {
      if (!e.dataTransfer?.types?.includes('Files') || e.dataTransfer?.types?.includes('application/zip-explorer-tab')) {
        return;
      }
      e.preventDefault();
      setIsDroppingOnApp(true);
    };
    const onDragLeave = (e: DragEvent) => { if (e.clientX === 0 || e.clientY === 0) setIsDroppingOnApp(false); };
    const onDrop = async (e: DragEvent) => {
      if (!e.dataTransfer?.types?.includes('Files') || e.dataTransfer?.types?.includes('application/zip-explorer-tab')) {
        return;
      }
      e.preventDefault();
      setIsDroppingOnApp(false);
      const files = e.dataTransfer?.files;
      if (!files) return;
      const zips = Array.from(files).filter(f => f.name.toLowerCase().endsWith('.zip'));
      await Promise.all(zips.map(f => loadRootZip(f)));
    };
    const onLoadZips = async (e: Event) => {
      const files = (e as CustomEvent<File[]>).detail;
      await Promise.all(files.map(f => loadRootZip(f)));
    };
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('drop', onDrop);
    window.addEventListener('load-zips', onLoadZips);
    return () => {
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('drop', onDrop);
      window.removeEventListener('load-zips', onLoadZips);
    };
  }, [loadRootZip]);

  const hasZips = rootZips.length > 0;

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        overflow: 'hidden',
      }}
    >
      {!hasZips ? (
        <DropZone />
      ) : (
        <>
          {/* ── Sidebar ── */}
          {isSidebarVisible && (
            <>
              <div
                id="explorer-panel"
                style={{
                  width: sidebarWidth,
                  minWidth: sidebarWidth,
                  maxWidth: sidebarWidth,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  background: 'var(--bg-secondary)',
                  borderRight: '1px solid var(--border-default)',
                  flexShrink: 0,
                }}
              >
                <FileTree />
              </div>

              {/* ── Drag Handle ── */}
              <div
                onMouseDown={onMouseDown}
                style={{
                  width: 4,
                  flexShrink: 0,
                  cursor: 'col-resize',
                  background: 'var(--border-default)',
                  transition: 'background 120ms',
                  zIndex: 10,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-primary)')}
                onMouseLeave={e => {
                  if (!isDragging.current) e.currentTarget.style.background = 'var(--border-default)';
                }}
              />
            </>
          )}

          {/* ── Preview ── */}
          <div
            id="preview-panel-container"
            style={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'row',
              overflow: 'hidden',
              outline: isDroppingOnApp ? '2px dashed var(--accent-primary)' : undefined,
              outlineOffset: -4,
            }}
          >
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <PreviewPanel paneId="primary" />
            </div>
            {secondary && (
              <>
                <div style={{ width: 1, background: 'var(--border-default)', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  <PreviewPanel paneId="secondary" />
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
