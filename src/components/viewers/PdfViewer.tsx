import { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, RotateCcw, AlertTriangle } from 'lucide-react';
import type { VFSFile } from '../../core/vfs/types';
import { PDF_INITIAL_SCALE } from '../../utils/constants';

// ── Import pdfjs-dist at module level (not lazily) so it's ready immediately ──
import * as pdfjsLib from 'pdfjs-dist';

// @ts-ignore
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

interface PdfViewerProps {
  file: VFSFile;
  blobUrl: string;
}

// ── Single page canvas component with lazy render via IntersectionObserver ──
function PdfPage({
  pdf,
  pageNum,
  scale,
  onVisible,
}: {
  pdf: pdfjsLib.PDFDocumentProxy;
  pageNum: number;
  scale: number;
  onVisible?: (n: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasRendered = useRef(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const renderPage = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Cancel any running task
      renderTaskRef.current?.cancel();

      const task = page.render({ canvasContext: ctx, viewport, canvas: canvasRef.current! });
      renderTaskRef.current = task;
      await task.promise;
      hasRendered.current = true;
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'RenderingCancelledException') {
        console.warn(`PDF page ${pageNum} render error:`, err.message);
      }
    }
  }, [pdf, pageNum, scale]);

  // Re-render when scale changes
  useEffect(() => {
    if (hasRendered.current) {
      renderPage();
    }
  }, [scale, renderPage]);

  // IntersectionObserver — render only when visible
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasRendered.current) {
          hasRendered.current = true;
          renderPage();
          onVisible?.(pageNum);
        }
      },
      { threshold: 0.01 }
    );
    observerRef.current.observe(wrapper);

    return () => {
      observerRef.current?.disconnect();
      renderTaskRef.current?.cancel();
    };
  }, [renderPage, pageNum, onVisible]);

  return (
    <div
      ref={wrapperRef}
      id={`pdf-page-${pageNum}`}
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '8px 0',
        minHeight: `${800 * scale}px`,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
          borderRadius: 2,
          background: '#fff',
          maxWidth: '100%',
        }}
      />
    </div>
  );
}

export function PdfViewer({ file, blobUrl }: PdfViewerProps) {
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(PDF_INITIAL_SCALE);
  const [pageInput, setPageInput] = useState('1');
  const [loadError, setLoadError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Load PDF — fast because pdfjs is pre-imported ──────────────────────
  useEffect(() => {
    if (!blobUrl) return;
    let cancelled = false;

    const task = pdfjsLib.getDocument({ url: blobUrl, disableStream: false });

    // Show progress
    task.onProgress = () => {};

    task.promise
      .then((doc) => {
        if (cancelled) return;
        setPdf(doc);
        setNumPages(doc.numPages);
        setCurrentPage(1);
        setPageInput('1');
        setLoadError(null);
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err?.message ?? 'Failed to load PDF');
          console.error('PDF load error:', err);
        }
      });

    return () => {
      cancelled = true;
      task.destroy?.();
    };
  }, [blobUrl]);

  const goToPage = useCallback((n: number) => {
    if (!pdf) return;
    const clamped = Math.max(1, Math.min(n, numPages));
    setCurrentPage(clamped);
    setPageInput(String(clamped));
    const el = document.getElementById(`pdf-page-${clamped}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [pdf, numPages]);

  const handleDownload = async () => {
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = file.name;
    a.click();
  };

  // Track current page via scroll
  const onPageVisible = useCallback((n: number) => {
    setCurrentPage(n);
    setPageInput(String(n));
  }, []);

  if (loadError) {
    return (
      <div className="error-state">
        <div className="error-icon"><AlertTriangle size={32} strokeWidth={1.5} /></div>
        <div style={{ fontWeight: 600 }}>Failed to load PDF</div>
        <div style={{ fontSize: 11, color: 'var(--text-danger)', maxWidth: 400 }}>{loadError}</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* ── Toolbar ── */}
      <div className="pdf-toolbar">
        <button
          className="btn btn-ghost btn-icon"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1 || !pdf}
        >
          <ChevronLeft size={14} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
          <input
            type="number"
            value={pageInput}
            min={1}
            max={numPages}
            onChange={e => setPageInput(e.target.value)}
            onBlur={() => goToPage(parseInt(pageInput) || 1)}
            onKeyDown={e => e.key === 'Enter' && goToPage(parseInt(pageInput) || 1)}
            style={{
              width: 50, padding: '2px 6px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-default)',
              borderRadius: 4, color: 'var(--text-primary)',
              textAlign: 'center', fontSize: 12,
            }}
          />
          <span style={{ color: 'var(--text-muted)' }}>/ {numPages || '…'}</span>
        </div>

        <button
          className="btn btn-ghost btn-icon"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= numPages || !pdf}
        >
          <ChevronRight size={14} />
        </button>

        <div style={{ width: 1, height: 16, background: 'var(--border-default)', margin: '0 4px' }} />

        <button className="btn btn-ghost btn-icon" onClick={() => setScale(s => Math.min(s + 0.25, 4))} title="Zoom In">
          <ZoomIn size={14} />
        </button>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 40, textAlign: 'center' }}>
          {Math.round(scale * 100)}%
        </span>
        <button className="btn btn-ghost btn-icon" onClick={() => setScale(s => Math.max(s - 0.25, 0.25))} title="Zoom Out">
          <ZoomOut size={14} />
        </button>
        <button className="btn btn-ghost btn-icon" onClick={() => setScale(PDF_INITIAL_SCALE)} title="Reset zoom">
          <RotateCcw size={14} />
        </button>

        <div style={{ flex: 1 }} />

        <button className="btn btn-ghost" onClick={handleDownload}>
          <Download size={13} /> Download
        </button>
      </div>

      {/* ── Pages area ── */}
      <div
        ref={containerRef}
        className="pdf-pages"
        style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '8px 0' }}
      >
        {!pdf ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, gap: 12 }}>
            <div className="spinner" />
            <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Loading PDF…</span>
          </div>
        ) : (
          Array.from({ length: numPages }, (_, i) => i + 1).map(pageNum => (
            <PdfPage
              key={pageNum}
              pdf={pdf}
              pageNum={pageNum}
              scale={scale}
              onVisible={onPageVisible}
            />
          ))
        )}
      </div>
    </div>
  );
}
