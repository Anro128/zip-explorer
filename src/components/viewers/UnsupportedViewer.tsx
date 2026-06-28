import { Download, AlertCircle } from 'lucide-react';
import type { VFSFile } from '../../core/vfs/types';
import { readFileBlob } from '../../core/vfs/ZipVFS';

interface UnsupportedViewerProps {
  file: VFSFile;
}

export function UnsupportedViewer({ file }: UnsupportedViewerProps) {
  const download = async () => {
    try {
      const blob = await readFileBlob(file.zipId, file.entryPath, file.mimeType);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="unsupported-viewer">
      <AlertCircle size={40} style={{ color: 'var(--text-muted)' }} />
      <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>
        Preview not available
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        <code style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: 4 }}>
          .{file.name.split('.').pop()}
        </code>{' '}
        files cannot be previewed in the browser.
      </div>
      <button className="btn btn-primary" onClick={download} id="download-file-btn">
        <Download size={14} />
        Download {file.name}
      </button>
    </div>
  );
}
