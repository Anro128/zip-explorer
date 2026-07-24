export const APP_NAME = 'ZIP Explorer';
export const APP_VERSION = '1.0.0';
export const SUPPORTED_VIEWERS_TEXT = 'Supports PDF, Office, Media, Code, Data & Nested ZIP Archives';

export const MAX_CACHE_MB = 100;
export const MAX_NESTED_ZIP_DEPTH = 20;   // safety limit
export const SEARCH_DEBOUNCE_MS = 300;
export const MAX_TEXT_PREVIEW_BYTES = 5 * 1024 * 1024;  // 5 MB
export const MAX_CSV_ROWS_DISPLAY = 10_000;
export const MAX_JSON_COLLAPSE_DEPTH = 3;
export const PDF_INITIAL_SCALE = 1.2;
export const VIRTUAL_LIST_OVERSCAN = 5;
export const RECURSIVE_SEARCH_MAX = 5000;  // max search results

export const BINARY_EXTENSIONS = new Set([
  'exe', 'dll', 'so', 'dylib', 'bin', 'obj', 'o',
  'class', 'jar', 'war', 'ear',
  'mp3', 'mp4', 'avi', 'mov', 'mkv', 'flv', 'wmv',
  'wav', 'ogg', 'flac',
  'zip', 'tar', 'gz', 'bz2', 'xz', '7z', 'rar',
  'psd', 'ai', 'eps', 'sketch',
  'db', 'sqlite', 'sqlite3',
  'woff', 'woff2', 'ttf', 'otf', 'eot',
  'pyc', 'pyo',
  'pkl', 'pickle', 'npy', 'npz',
  'doc', 'docx', 'xls', 'xlsx', 'xlsb', 'xlsm', 'xltx', 'xltm', 'xlam', 'ppt', 'pptx'
]);
