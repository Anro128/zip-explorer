/**
 * useFileContent — fetches and caches file content from VFS
 */
import { useState, useEffect, useRef } from 'react';
import { readFileBytes, readFileText } from '../core/vfs/ZipVFS';
import type { VFSFile } from '../core/vfs/types';
import { BINARY_EXTENSIONS } from '../utils/constants';

interface UseFileContentResult {
  text: string | null;
  bytes: Uint8Array | null;
  blobUrl: string | null;
  isLoading: boolean;
  error: string | null;
}

const EMPTY: UseFileContentResult = {
  text: null, bytes: null, blobUrl: null, isLoading: false, error: null,
};

export function useFileContent(file: VFSFile | null): UseFileContentResult {
  const [state, setState] = useState<UseFileContentResult>(EMPTY);
  const prevUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!file) {
      setState(EMPTY);
      return;
    }

    setState({ text: null, bytes: null, blobUrl: null, isLoading: true, error: null });

    let cancelled = false;

    async function load() {
      if (!file) return;
      try {
        const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
        const isBinary = BINARY_EXTENSIONS.has(ext) ||
          ['image', 'pdf', 'docx'].includes(file.fileType);

        if (isBinary) {
          const bytes = await readFileBytes(file.zipId, file.entryPath);
          if (cancelled) return;
          // Revoke previous URL
          if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
          const blob = new Blob([bytes as unknown as BlobPart], { type: file.mimeType });
          const url = URL.createObjectURL(blob);
          prevUrlRef.current = url;
          setState({ text: null, bytes, blobUrl: url, isLoading: false, error: null });
        } else {
          const text = await readFileText(file.zipId, file.entryPath);
          if (cancelled) return;
          setState({ text, bytes: null, blobUrl: null, isLoading: false, error: null });
        }
      } catch (err) {
        if (cancelled) return;
        setState({
          text: null, bytes: null, blobUrl: null, isLoading: false,
          error: err instanceof Error ? err.message : 'Failed to load file',
        });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [file?.zipId, file?.entryPath]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
    };
  }, []);

  return state;
}
