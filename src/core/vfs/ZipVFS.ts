/**
 * ZipVFS — Virtual File System built on top of @zip.js/zip.js
 *
 * Reads ZIP entries lazily (only central directory on open).
 * Supports nested ZIPs as virtual folders — no disk extraction.
 * Supports password-protected ZIPs.
 */

import {
  ZipReader,
  BlobReader,
  Uint8ArrayWriter,
  type Entry,
} from '@zip.js/zip.js';

import type { VFSNode, VFSFile, VFSFolder, VFSZipFile, ZipContext } from './types';
import { getFileType, getMimeType } from '../../utils/fileTypes';
import { normalizeEntryName, isDirectory } from './VFSPath';
import { fileContentCache } from './cache';
import { MAX_NESTED_ZIP_DEPTH } from '../../utils/constants';

let _zipIdCounter = 0;
function newZipId(name: string) {
  return `zip_${++_zipIdCounter}_${name}`;
}

// Keep open ZipReader instances keyed by zipId
const _openReaders = new Map<string, ZipReader<Blob>>();

// Keep raw bytes of nested zips keyed by zipId (so we can open them)
const _nestedZipBytes = new Map<string, Uint8Array>();

// Context registry
const _contexts = new Map<string, ZipContext>();

// ─────────────────────────────────────────────────────────────────────────────
// Open a root ZIP file (from <input type="file">)
// ─────────────────────────────────────────────────────────────────────────────
export async function openRootZip(
  file: File,
  password?: string
): Promise<{ zipId: string; nodes: VFSNode[]; context: ZipContext }> {
  const zipId = newZipId(file.name);
  const reader = new ZipReader(new BlobReader(file), {
    password,
    useWebWorkers: true,
  });

  const entries = await reader.getEntries();
  _openReaders.set(zipId, reader as unknown as ZipReader<Blob>);

  const context: ZipContext = {
    id: zipId,
    name: file.name,
    file,
    password,
    totalSize: file.size,
    entryCount: entries.length,
    isRoot: true,
  };
  _contexts.set(zipId, context);

  const nodes = buildTree(entries, zipId, '', 0);
  return { zipId, nodes, context };
}

// ─────────────────────────────────────────────────────────────────────────────
// Open a nested ZIP (bytes already in memory from parent)
// ─────────────────────────────────────────────────────────────────────────────
export async function openNestedZip(
  bytes: Uint8Array,
  name: string,
  parentZipId: string,
  parentEntryPath: string,
  depth: number,
  password?: string
): Promise<{ zipId: string; nodes: VFSNode[]; context: ZipContext }> {
  if (depth > MAX_NESTED_ZIP_DEPTH) {
    throw new Error(`Max nested ZIP depth (${MAX_NESTED_ZIP_DEPTH}) exceeded`);
  }

  const zipId = newZipId(name);
  _nestedZipBytes.set(zipId, bytes);

  const blob = new Blob([bytes as unknown as BlobPart]);
  const reader = new ZipReader(new BlobReader(blob), {
    password,
    useWebWorkers: true,
  });

  const entries = await reader.getEntries();
  _openReaders.set(zipId, reader as unknown as ZipReader<Blob>);

  const context: ZipContext = {
    id: zipId,
    name,
    parentZipId,
    parentEntryPath,
    password,
    totalSize: bytes.byteLength,
    entryCount: entries.length,
    isRoot: false,
  };
  _contexts.set(zipId, context);

  const nodes = buildTree(entries, zipId, '', depth);
  return { zipId, nodes, context };
}

// ─────────────────────────────────────────────────────────────────────────────
// Build a virtual tree from zip entries
// ─────────────────────────────────────────────────────────────────────────────
function buildTree(
  entries: Entry[],
  zipId: string,
  basePath: string,
  depth: number
): VFSNode[] {
  // Map: directory path → VFSFolder
  const folderMap = new Map<string, VFSFolder>();
  const roots: VFSNode[] = [];

  // Ensure folder exists in map
  function getOrCreateFolder(dirPath: string): VFSFolder {
    if (folderMap.has(dirPath)) return folderMap.get(dirPath)!;
    const parts = dirPath.split('/').filter(Boolean);
    const name = parts[parts.length - 1] ?? dirPath;
    const fullPath = basePath ? `${basePath}/${dirPath}` : dirPath;
    const folder: VFSFolder = {
      kind: 'folder',
      name,
      path: fullPath,
      depth,
      children: [],
      isExpanded: false,
      zipId,
    };
    folderMap.set(dirPath, folder);

    // Attach to parent
    const parentPath = parts.slice(0, -1).join('/');
    if (parentPath) {
      const parent = getOrCreateFolder(parentPath);
      if (!parent.children.find(c => c.path === folder.path)) {
        parent.children.push(folder);
      }
    } else {
      if (!roots.find(r => r.path === folder.path)) {
        roots.push(folder);
      }
    }
    return folder;
  }

  for (const entry of entries) {
    const rawName = normalizeEntryName(entry.filename);
    if (!rawName) continue;

    if (isDirectory(entry.filename)) {
      // Create folder node
      getOrCreateFolder(rawName);
      continue;
    }

    const parts = rawName.split('/');
    const fileName = parts[parts.length - 1];
    const parentDirPath = parts.slice(0, -1).join('/');
    const fullPath = basePath ? `${basePath}/${rawName}` : rawName;
    const fileType = getFileType(fileName);

    if (fileType === 'zip') {
      // Nested zip — create as VFSZipFile
      const zipNode: VFSZipFile = {
        kind: 'zip',
        name: fileName,
        path: fullPath,
        depth,
        size: entry.uncompressedSize,
        compressedSize: entry.compressedSize,
        lastModified: entry.lastModDate,
        children: [],
        isExpanded: false,
        isLoaded: false,
        zipId: '',          // Will be filled when user expands it
        parentZipId: zipId,
        entryPath: rawName,
      };

      if (parentDirPath) {
        const parent = getOrCreateFolder(parentDirPath);
        parent.children.push(zipNode);
      } else {
        roots.push(zipNode);
      }
    } else {
      // Regular file
      const fileNode: VFSFile = {
        kind: 'file',
        name: fileName,
        path: fullPath,
        depth,
        size: entry.uncompressedSize,
        compressedSize: entry.compressedSize,
        lastModified: entry.lastModDate,
        fileType,
        mimeType: getMimeType(fileName),
        zipId,
        entryPath: rawName,
        parentZipPath: '',
      };

      if (parentDirPath) {
        const parent = getOrCreateFolder(parentDirPath);
        parent.children.push(fileNode);
      } else {
        roots.push(fileNode);
      }
    }
  }

  return roots;
}

// ─────────────────────────────────────────────────────────────────────────────
// Read file content as Uint8Array
// ─────────────────────────────────────────────────────────────────────────────
export async function readFileBytes(
  zipId: string,
  entryPath: string,
  password?: string
): Promise<Uint8Array> {
  const cacheKey = `${zipId}::${entryPath}`;
  const cached = fileContentCache.get(cacheKey);
  if (cached) return cached;

  const reader = _openReaders.get(zipId);
  if (!reader) throw new Error(`ZipReader not found for zipId: ${zipId}`);

  const entries = await reader.getEntries();
  const entry = entries.find(e => normalizeEntryName(e.filename) === entryPath);
  if (!entry) throw new Error(`Entry not found: ${entryPath} in ${zipId}`);

  const writer = new Uint8ArrayWriter();
  const bytes = await (entry as any).getData!(writer, {
    password: password ?? _contexts.get(zipId)?.password,
  });

  fileContentCache.set(cacheKey, bytes, bytes.byteLength);
  return bytes;
}

// ─────────────────────────────────────────────────────────────────────────────
// Read file content as text
// ─────────────────────────────────────────────────────────────────────────────
export async function readFileText(
  zipId: string,
  entryPath: string,
  password?: string
): Promise<string> {
  const bytes = await readFileBytes(zipId, entryPath, password);
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
}

// ─────────────────────────────────────────────────────────────────────────────
// Read file as Blob (for PDF, images)
// ─────────────────────────────────────────────────────────────────────────────
export async function readFileBlob(
  zipId: string,
  entryPath: string,
  mimeType: string,
  password?: string
): Promise<Blob> {
  const bytes = await readFileBytes(zipId, entryPath, password);
  return new Blob([bytes as unknown as BlobPart], { type: mimeType });
}

// ─────────────────────────────────────────────────────────────────────────────
// Load a nested ZIP node (expand it for the first time)
// ─────────────────────────────────────────────────────────────────────────────
export async function loadNestedZip(
  zipNode: VFSZipFile,
  depth: number,
  password?: string
): Promise<{ zipId: string; children: VFSNode[] }> {
  // Read the nested zip bytes from its parent
  const bytes = await readFileBytes(zipNode.parentZipId, zipNode.entryPath, password);

  const result = await openNestedZip(
    bytes,
    zipNode.name,
    zipNode.parentZipId,
    zipNode.entryPath,
    depth + 1,
    password
  );

  return { zipId: result.zipId, children: result.nodes };
}

// ─────────────────────────────────────────────────────────────────────────────
// Close / cleanup a zip reader
// ─────────────────────────────────────────────────────────────────────────────
export async function closeZip(zipId: string): Promise<void> {
  const reader = _openReaders.get(zipId);
  if (reader) {
    try { await reader.close(); } catch { /* ignore */ }
    _openReaders.delete(zipId);
  }
  _nestedZipBytes.delete(zipId);
  _contexts.delete(zipId);
}

// ─────────────────────────────────────────────────────────────────────────────
// Get all file entries recursively (for search)
// ─────────────────────────────────────────────────────────────────────────────
export function flattenNodes(nodes: VFSNode[]): VFSFile[] {
  const files: VFSFile[] = [];
  function walk(list: VFSNode[]) {
    for (const node of list) {
      if (node.kind === 'file') {
        files.push(node);
      } else if (node.kind === 'folder') {
        walk(node.children);
      } else if (node.kind === 'zip') {
        // Only walk already-loaded nested zips
        if (node.isLoaded) walk(node.children);
      }
    }
  }
  walk(nodes);
  return files;
}

export function getContext(zipId: string): ZipContext | undefined {
  return _contexts.get(zipId);
}
