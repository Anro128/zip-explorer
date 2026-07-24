import { Download } from 'lucide-react';
import type { VFSFile } from '../../core/vfs/types';
import { readFileBlob } from '../../core/vfs/ZipVFS';

interface ImageViewerProps {
  file: VFSFile;
  blobUrl: string;
}

export function ImageViewer({ file, blobUrl }: ImageViewerProps) {
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
            transition: 'transform 200ms ease',
          }}
          id="image-preview"
        />
      </div>
    </div>
  );
}
