import type { VFSFile } from '../../core/vfs/types';
import { useFileContent } from '../../hooks/useFileContent';
import { PdfViewer } from '../viewers/PdfViewer';
import { CodeViewer } from '../viewers/CodeViewer';
import { MarkdownViewer } from '../viewers/MarkdownViewer';
import { NotebookViewer } from '../viewers/NotebookViewer';
import { CsvViewer } from '../viewers/CsvViewer';
import { JsonViewer } from '../viewers/JsonViewer';
import { ImageViewer } from '../viewers/ImageViewer';
import { HtmlViewer } from '../viewers/HtmlViewer';
import { SyntaxViewer } from '../viewers/SyntaxViewer';
import { TextViewer } from '../viewers/TextViewer';
import { DocxViewer } from '../viewers/DocxViewer';
import { UnsupportedViewer } from '../viewers/UnsupportedViewer';

import { SpreadsheetViewer } from '../viewers/SpreadsheetViewer';
import { MediaViewer } from '../viewers/MediaViewer';
import { PptxViewer } from '../viewers/PptxViewer';

interface ViewerRouterProps {
  file: VFSFile;
}

export function ViewerRouter({ file }: ViewerRouterProps) {
  const { text, bytes, blobUrl, isLoading, error } = useFileContent(file);

  if (isLoading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <div className="spinner" />
        <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Loading {file.name}...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <div className="error-icon">⚠️</div>
        <div style={{ fontWeight: 600 }}>Failed to load file</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-danger)', maxWidth: 400, wordBreak: 'break-word' }}>
          {error}
        </div>
      </div>
    );
  }

  // Wrap in a flex container that fills the parent height
  const { fileType } = file;
  const content = (() => {
    switch (fileType) {
      case 'pdf':
        return blobUrl ? <PdfViewer file={file} blobUrl={blobUrl} /> : null;
      case 'docx':
        return bytes ? <DocxViewer file={file} bytes={bytes} /> : null;
      case 'spreadsheet':
        return bytes ? <SpreadsheetViewer bytes={bytes} /> : null;
      case 'media':
        return blobUrl ? <MediaViewer file={file} blobUrl={blobUrl} /> : null;
      case 'presentation':
        return bytes ? <PptxViewer bytes={bytes} /> : null;
      case 'python':
      case 'code':
        return text !== null ? <CodeViewer file={file} text={text} /> : null;
      case 'notebook':
        return text !== null ? <NotebookViewer text={text} /> : null;
      case 'markdown':
        return text !== null ? <MarkdownViewer text={text} /> : null;
      case 'csv':
        return text !== null ? <CsvViewer text={text} /> : null;
      case 'json':
        return text !== null ? <JsonViewer text={text} /> : null;
      case 'image':
        return blobUrl ? <ImageViewer file={file} blobUrl={blobUrl} /> : null;
      case 'html':
        return text !== null ? <HtmlViewer text={text} /> : null;
      case 'xml':
        return text !== null ? <SyntaxViewer text={text} language="xml" /> : null;
      case 'yaml':
        return text !== null ? <SyntaxViewer text={text} language="yaml" /> : null;
      case 'log':
      case 'text':
        return text !== null ? <TextViewer text={text} /> : null;
      default:
        return <UnsupportedViewer file={file} />;
    }
  })();

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {content}
    </div>
  );
}
