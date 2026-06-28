/**
 * useZipLoader — handles opening ZIP files (root and nested)
 * with password prompting and error handling.
 */
import { useCallback } from 'react';
import { useExplorerStore } from '../store/useExplorerStore';
import { openRootZip, loadNestedZip, closeZip } from '../core/vfs/ZipVFS';
import type { VFSZipFile } from '../core/vfs/types';

export function useZipLoader() {
  const {
    addRootZip,
    removeRootZip,
    setPendingPassword,
    setLoadingPath,
    updateZipNode,
    setExpanded,
  } = useExplorerStore();

  /**
   * Ask user for a password. Returns null if cancelled.
   */
  const askPassword = useCallback(
    (name: string): Promise<string | null> => {
      return new Promise((resolve) => {
        setPendingPassword({ zipId: '', name, resolve });
      });
    },
    [setPendingPassword]
  );

  /**
   * Load a root ZIP file (from File object).
   */
  const loadRootZip = useCallback(
    async (file: File, password?: string): Promise<void> => {
      try {
        const result = await openRootZip(file, password);
        addRootZip({
          zipId: result.zipId,
          name: file.name,
          nodes: result.nodes,
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        if (
          message.includes('password') ||
          message.includes('encrypted') ||
          message.includes('Wrong password')
        ) {
          const pw = await askPassword(file.name);
          if (pw !== null) {
            await loadRootZip(file, pw);
          }
        } else {
          throw err;
        }
      }
    },
    [addRootZip, askPassword]
  );

  /**
   * Expand / load a nested ZIP node.
   */
  const expandNestedZip = useCallback(
    async (zipNode: VFSZipFile, depth: number): Promise<void> => {
      if (zipNode.isLoaded) {
        setExpanded(zipNode.path, true);
        return;
      }

      setLoadingPath(zipNode.path, true);
      try {
        const result = await loadNestedZip(zipNode, depth);
        updateZipNode(zipNode.parentZipId, {
          path: zipNode.path,
          zipId: result.zipId,
          children: result.children,
          isLoaded: true,
          isExpanded: true,
        });
        setExpanded(zipNode.path, true);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        if (message.includes('password') || message.includes('encrypted')) {
          const pw = await askPassword(zipNode.name);
          if (pw !== null) {
            const result = await loadNestedZip(zipNode, depth, pw);
            updateZipNode(zipNode.parentZipId, {
              path: zipNode.path,
              zipId: result.zipId,
              children: result.children,
              isLoaded: true,
              isExpanded: true,
              password: pw,
            });
            setExpanded(zipNode.path, true);
          }
        } else {
          console.error('Failed to load nested zip:', err);
        }
      } finally {
        setLoadingPath(zipNode.path, false);
      }
    },
    [setLoadingPath, updateZipNode, setExpanded, askPassword]
  );

  const unloadRootZip = useCallback(
    async (zipId: string) => {
      await closeZip(zipId);
      removeRootZip(zipId);
    },
    [removeRootZip]
  );

  return { loadRootZip, expandNestedZip, unloadRootZip };
}
