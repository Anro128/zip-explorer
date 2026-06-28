// VFS Path utilities
// Manages virtual paths across nested ZIP boundaries.

/**
 * Join path segments with forward slashes.
 */
export function joinPath(...segments: string[]): string {
  return segments
    .map((s) => s.replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/');
}

/**
 * Get the parent directory of a path.
 */
export function dirname(path: string): string {
  const parts = path.split('/');
  parts.pop();
  return parts.join('/') || '/';
}

/**
 * Get the base name (last segment) of a path.
 */
export function basename(path: string): string {
  return path.split('/').pop() ?? path;
}

/**
 * Get the file extension (lowercase, without dot).
 */
export function extname(path: string): string {
  const base = basename(path);
  const dotIdx = base.lastIndexOf('.');
  if (dotIdx < 1) return '';
  return base.slice(dotIdx + 1).toLowerCase();
}

/**
 * Split a virtual path into its ZIP boundary segments.
 * Each segment ending in .zip is a boundary.
 *
 * Example:
 *   "root.zip/archive.zip/src/main.py"
 *   → [{ zip: "root.zip", inner: "archive.zip/src/main.py" }, ...]
 */
export interface ZipBoundary {
  zipSegment: string;  // The .zip filename
  remainder: string;   // Everything after this zip
}

export function splitZipBoundaries(virtualPath: string): ZipBoundary[] {
  const parts = virtualPath.split('/');
  const boundaries: ZipBoundary[] = [];

  let current = '';
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    current = current ? `${current}/${part}` : part;
    if (part.toLowerCase().endsWith('.zip')) {
      boundaries.push({
        zipSegment: current,
        remainder: parts.slice(i + 1).join('/'),
      });
      current = '';
    }
  }
  return boundaries;
}

/**
 * Build breadcrumb items from a virtual path.
 */
export interface BreadcrumbSegment {
  label: string;
  path: string;
}

export function buildBreadcrumbs(virtualPath: string): BreadcrumbSegment[] {
  const parts = virtualPath.split('/').filter(Boolean);
  const crumbs: BreadcrumbSegment[] = [];
  let acc = '';
  for (const part of parts) {
    acc = acc ? `${acc}/${part}` : part;
    crumbs.push({ label: part, path: acc });
  }
  return crumbs;
}

/**
 * Normalize an entry path from a zip reader (handles backslashes, trailing slashes).
 */
export function normalizeEntryName(name: string): string {
  return name.replace(/\\/g, '/').replace(/\/$/, '');
}

/**
 * Determine if an entry path represents a directory.
 */
export function isDirectory(entryName: string): boolean {
  return entryName.endsWith('/');
}
