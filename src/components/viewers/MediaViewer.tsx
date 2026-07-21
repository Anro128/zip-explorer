import type { VFSFile } from '../../core/vfs/types';
import { Download } from 'lucide-react';

interface MediaViewerProps {
  file: VFSFile;
  blobUrl: string;
}

export function MediaViewer({ file, blobUrl }: MediaViewerProps) {
  const isAudio = file.name.match(/\.(mp3|wav|ogg)$/i);
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="pdf-toolbar">
        <div style={{ flex: 1 }} />
        <a href={blobUrl} download={file.name} className="btn btn-ghost" style={{ textDecoration: 'none' }}>
          <Download size={13} /> Download
        </a>
      </div>
      
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, background: 'var(--bg-primary)' }}>
        {isAudio ? (
          <audio controls src={blobUrl} style={{ width: '100%', maxWidth: 400 }} />
        ) : (
          <video controls src={blobUrl} style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }} />
        )}
      </div>
    </div>
  );
}
