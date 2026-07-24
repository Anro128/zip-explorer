import { useEffect, useRef, useState } from 'react';
import { PptxViewer as Engine } from '@file-viewer/pptx';
import '@file-viewer/pptx/styles.css';

// @ts-ignore
import pptxWorkerUrl from '@file-viewer/pptx/worker/pptx.worker.js?url';

interface PptxViewerProps {
  bytes: Uint8Array;
}

export function PptxViewer({ bytes }: PptxViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Engine | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;
    
    let cancelled = false;
    
    // Create a dedicated DOM node for this load instance to prevent 
    // React Strict Mode race conditions where viewer.destroy() clears 
    // the target of a newer viewer instance.
    const instanceContainer = document.createElement('div');
    instanceContainer.style.width = '100%';
    instanceContainer.style.height = '100%';
    instanceContainer.style.position = 'relative';
    
    // Mount it
    containerRef.current.replaceChildren(instanceContainer);
    
    async function load() {
      try {
        setIsLoading(true);
        // Use slice to get a new ArrayBuffer just for this file data
        const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
        
        const viewer = await Engine.open(buffer, instanceContainer, {
          workerUrl: pptxWorkerUrl,
          listOptions: { windowed: false },
          fitMode: 'contain',
          onRenderComplete: () => {
            if (!cancelled) {
              setIsLoading(false);
            }
          },
          onSlideError: (index, err) => {
            console.error(`Slide ${index} error:`, err);
          },
          onError: (err) => {
            console.error('PPTX Viewer Error:', err);
            if (!cancelled) {
              setError(err instanceof Error ? err.message : String(err));
              setIsLoading(false);
            }
          }
        });
        
        if (cancelled) {
          viewer.destroy();
          return;
        }
        viewerRef.current = viewer;
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load PPTX');
          setIsLoading(false);
        }
      }
    }
    
    load();
    
    return () => {
      cancelled = true;
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
      // instanceContainer is automatically removed by the next effect 
      // via replaceChildren, or we can remove it manually:
      instanceContainer.remove();
    };
  }, [bytes]);

  if (error) {
    return <div style={{ padding: 20, color: 'var(--text-danger)' }}>{error}</div>;
  }

  return (
    <div className="pptx-viewer" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', background: '#e5e7eb', overflow: 'hidden' }}>
      {isLoading && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10, background: 'rgba(229, 231, 235, 0.8)' }}>
          <div className="spinner" style={{ borderColor: 'var(--border-default)', borderTopColor: 'var(--accent-primary)' }} />
          <div style={{ marginTop: 12, color: 'var(--text-secondary)' }}>Parsing PowerPoint slides...</div>
        </div>
      )}

      <div 
        ref={containerRef} 
        style={{ width: '100%', height: '100%', overflow: 'auto', position: 'relative' }} 
      />
    </div>
  );
}
