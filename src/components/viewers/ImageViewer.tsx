import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Download } from 'lucide-react';
import type { VFSFile } from '../../core/vfs/types';
import { readFileBlob } from '../../core/vfs/ZipVFS';

interface ImageViewerProps {
  file: VFSFile;
  blobUrl: string;
}

export function ImageViewer({ file, blobUrl }: ImageViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const download = async () => {
    const blob = await readFileBlob(file.zipId, file.entryPath, file.mimeType);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div className="pdf-toolbar">
        <button className="btn btn-ghost btn-icon" onClick={() => setZoom((z) => Math.min(z + 0.25, 5))} title="Zoom In">
          <ZoomIn size={14} />
        </button>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 40, textAlign: 'center' }}>
          {Math.round(zoom * 100)}%
        </span>
        <button className="btn btn-ghost btn-icon" onClick={() => setZoom((z) => Math.max(z - 0.25, 0.1))} title="Zoom Out">
          <ZoomOut size={14} />
        </button>
        <button className="btn btn-ghost btn-icon" onClick={() => setZoom(1)} title="Reset">
          <RotateCcw size={14} />
        </button>
        <div style={{ flex: 1 }} />
        <button className="btn btn-ghost" onClick={download}>
          <Download size={13} /> Download
        </button>
      </div>

      {/* Image */}
      <div className="image-viewer" style={{ flex: 1 }}>
        <img
          src={blobUrl}
          alt={file.name}
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transition: 'transform 200ms ease',
            maxWidth: zoom > 1 ? 'none' : '100%',
            maxHeight: zoom > 1 ? 'none' : '100%',
          }}
          id="image-preview"
        />
      </div>
    </div>
  );
}
