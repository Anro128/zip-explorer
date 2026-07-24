// Virtual File System Types
// All ZIP contents are represented as VFSNodes — no disk extraction ever happens.

export type FileType =
  | 'pdf' | 'python' | 'notebook' | 'markdown' | 'text' | 'csv'
  | 'json' | 'image' | 'html' | 'xml' | 'yaml' | 'log' | 'zip'
  | 'folder' | 'code' | 'docx' | 'spreadsheet' | 'media' | 'presentation' | 'unsupported';

export interface VFSNodeBase {
  name: string;
  path: string;          // Full virtual path from root zip, e.g. "root.zip/a.zip/src/main.py"
  depth: number;         // Nesting depth (0 = root zip entries)
}

export interface VFSFile extends VFSNodeBase {
  kind: 'file';
  size: number;          // Uncompressed size in bytes
  compressedSize: number;
  lastModified: Date;
  fileType: FileType;
  mimeType: string;
  zipId: string;         // ID of the ZipContext that owns this entry
  entryPath: string;     // Path within its immediate zip (for fetching)
  parentZipPath: string; // Path to the parent zip node
}

export interface VFSFolder extends VFSNodeBase {
  kind: 'folder';
  children: VFSNode[];
  isExpanded: boolean;
  lastModified?: Date;
  zipId: string;
}

export interface VFSZipFile extends VFSNodeBase {
  kind: 'zip';
  // A zip node is both a file (in its parent zip) and a folder (in the virtual tree)
  size: number;
  compressedSize: number;
  lastModified: Date;
  children: VFSNode[];
  isExpanded: boolean;
  isLoaded: boolean;     // Whether nested entries have been read
  zipId: string;         // The ZipContext id for THIS nested zip (created when opened)
  parentZipId: string;   // ID of the parent zip
  entryPath: string;     // Path within parent zip to fetch raw bytes
  password?: string;
}

export type VFSNode = VFSFile | VFSFolder | VFSZipFile;

// A zip context represents an opened zip reader instance
export interface ZipContext {
  id: string;
  name: string;
  file?: File;              // Only for root zips
  parentZipId?: string;     // For nested zips
  parentEntryPath?: string; // Entry path in parent zip
  password?: string;
  totalSize: number;
  entryCount: number;
  isRoot: boolean;
}

export interface SearchResult {
  node: VFSFile;
  matchType: 'name' | 'path';
  score: number;
}

export interface BreadcrumbItem {
  label: string;
  path: string;
  nodeKind: 'folder' | 'zip' | 'root';
}

export type SortField = 'name' | 'size' | 'modified';
export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  order: SortOrder;
}

export interface OpenTab {
  id: string;
  file: VFSFile;
  label: string;
  isPinned: boolean;
  zoom?: number;
}

export interface FileContentResult {
  type: 'text' | 'binary' | 'stream';
  text?: string;
  blob?: Blob;
  url?: string;    // Object URL for binary data
}
