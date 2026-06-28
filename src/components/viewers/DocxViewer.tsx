import React, { useEffect, useState, useRef } from 'react';
import * as mammoth from 'mammoth';
import type { VFSFile } from '../../core/vfs/types';

interface DocxViewerProps {
  file: VFSFile;
  bytes: Uint8Array;
}

export function DocxViewer({ file, bytes }: DocxViewerProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function parseDocx() {
      try {
        const result = await mammoth.convertToHtml(
          { arrayBuffer: bytes.buffer },
          { includeDefaultStyleMap: true }
        );
        if (cancelled) return;

        setHtml(result.value);
        
        if (result.messages.length > 0) {
          console.warn('Mammoth warnings for', file.name, result.messages);
        }
      } catch (err) {
        if (cancelled) return;
        console.error('Docx parse error:', err);
        setError(err instanceof Error ? err.message : 'Failed to parse DOCX file');
      }
    }

    parseDocx();
    return () => { cancelled = true; };
  }, [bytes, file.name]);

  if (error) {
    return (
      <div className="error-state">
        <div className="error-icon">⚠️</div>
        <div style={{ fontWeight: 600 }}>Failed to read DOCX</div>
        <div style={{ fontSize: 11, color: 'var(--text-danger)', maxWidth: 400 }}>{error}</div>
      </div>
    );
  }

  if (html === null) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
        <div className="spinner" />
        <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Parsing document…</span>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        height: '100%',
        overflowY: 'auto',
        background: '#f3f4f6', // Light gray background like a real doc viewer
        padding: '24px 0',
      }}
    >
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          background: '#fff',
          padding: '48px 64px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          minHeight: '1000px', // A4 approximate
          color: '#000',       // Ensure text is black even in dark mode
          lineHeight: 1.6,
          fontSize: '15px',
        }}
        // Add a class that enforces normal web styles inside the docx container
        // since tailwind's preflight resets everything. We can do inline styles for common tags if needed.
        className="docx-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
