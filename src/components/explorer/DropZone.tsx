import React, { useState, useCallback } from 'react';
import { useZipLoader } from '../../hooks/useZipLoader';
import { SUPPORTED_VIEWERS_TEXT } from '../../utils/constants';
import { FolderOpen, Archive, AlertTriangle } from 'lucide-react';

export function DropZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { loadRootZip } = useZipLoader();

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const zips = Array.from(files).filter(
        (f) => f.name.toLowerCase().endsWith('.zip')
      );
      if (zips.length === 0) {
        setError('Please select one or more .zip files');
        return;
      }
      setError(null);
      setIsLoading(true);
      try {
        await Promise.all(zips.map((f) => loadRootZip(f)));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to open ZIP');
      } finally {
        setIsLoading(false);
      }
    },
    [loadRootZip]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onBrowse = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.zip';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) handleFiles(files);
    };
    input.click();
  };

  return (
    <div
      className={`drop-zone ${isDragging ? 'drop-zone-active' : ''}`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      id="drop-zone"
    >
      <div className="drop-zone-icon flex justify-center items-center">
        <Archive size={42} strokeWidth={1.5} />
      </div>

      <div>
        <div className="drop-zone-title">Drop ZIP files here</div>
        <div className="drop-zone-subtitle" style={{ marginTop: 8 }}>
          or browse from your computer
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn btn-secondary" onClick={onBrowse} id="browse-zip-btn">
          <FolderOpen size={14} />
          Browse Files
        </button>
      </div>

      {isLoading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
          <div className="spinner" />
          <span>Reading ZIP...</span>
        </div>
      )}

      {error && (
        <div style={{ color: 'var(--text-danger)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.8 }}>
        {SUPPORTED_VIEWERS_TEXT}
      </div>
    </div>
  );
}
