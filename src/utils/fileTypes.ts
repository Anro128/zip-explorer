// File type detection utilities

import type { FileType } from '../core/vfs/types';

const EXTENSION_MAP: Record<string, FileType> = {
  // Documents
  pdf: 'pdf',
  docx: 'docx',
  doc: 'docx',
  // Python
  py: 'python',
  pyw: 'python',
  // Notebooks
  ipynb: 'notebook',
  // Markdown
  md: 'markdown',
  mdx: 'markdown',
  markdown: 'markdown',
  // Data
  csv: 'csv',
  tsv: 'csv',
  // JSON
  json: 'json',
  jsonl: 'json',
  // Images
  png: 'image',
  jpg: 'image',
  jpeg: 'image',
  gif: 'image',
  svg: 'image',
  webp: 'image',
  bmp: 'image',
  ico: 'image',
  // HTML
  html: 'html',
  htm: 'html',
  // XML
  xml: 'xml',
  // YAML
  yml: 'yaml',
  yaml: 'yaml',
  // Logs
  log: 'log',
  // Text
  txt: 'text',
  rst: 'text',
  ini: 'text',
  cfg: 'text',
  conf: 'text',
  toml: 'text',
  env: 'text',
  // Code (syntax highlight)
  js: 'code',
  jsx: 'code',
  ts: 'code',
  tsx: 'code',
  css: 'code',
  scss: 'code',
  sass: 'code',
  less: 'code',
  sh: 'code',
  bash: 'code',
  zsh: 'code',
  fish: 'code',
  ps1: 'code',
  bat: 'code',
  cmd: 'code',
  rb: 'code',
  go: 'code',
  rs: 'code',
  c: 'code',
  cpp: 'code',
  cc: 'code',
  h: 'code',
  hpp: 'code',
  java: 'code',
  kt: 'code',
  swift: 'code',
  r: 'code',
  lua: 'code',
  php: 'code',
  sql: 'code',
  dockerfile: 'code',
  makefile: 'code',
  // Spreadsheet
  xlsx: 'spreadsheet',
  xls: 'spreadsheet',
  // Presentation
  pptx: 'presentation',
  ppt: 'presentation',
  // Media
  mp4: 'media',
  webm: 'media',
  mkv: 'media',
  mp3: 'media',
  wav: 'media',
  ogg: 'media',
  // ZIP (nested)
  zip: 'zip',
  gz: 'zip',
  tar: 'zip',
};

export function getFileType(filename: string): FileType {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'zip' || filename.toLowerCase().endsWith('.zip')) return 'zip';
  return EXTENSION_MAP[ext] ?? 'unsupported';
}

export function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  const mimeMap: Record<string, string> = {
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    webp: 'image/webp',
    bmp: 'image/bmp',
    html: 'text/html',
    htm: 'text/html',
    csv: 'text/csv',
    json: 'application/json',
    xml: 'application/xml',
    zip: 'application/zip',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xls: 'application/vnd.ms-excel',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ppt: 'application/vnd.ms-powerpoint',
    mp4: 'video/mp4',
    webm: 'video/webm',
    mkv: 'video/x-matroska',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
  };
  return mimeMap[ext] ?? 'application/octet-stream';
}

export interface FileIconConfig {
  emoji: string;
  colorClass: string;
  label: string;
}

export const FILE_ICONS: Record<FileType | 'folder', FileIconConfig> = {
  pdf: { emoji: '📄', colorClass: 'text-red-400', label: 'PDF' },
  docx: { emoji: '📝', colorClass: 'text-blue-500', label: 'Word Document' },
  python: { emoji: '🐍', colorClass: 'text-blue-400', label: 'Python' },
  notebook: { emoji: '📒', colorClass: 'text-orange-400', label: 'Jupyter Notebook' },
  markdown: { emoji: '📝', colorClass: 'text-gray-300', label: 'Markdown' },
  text: { emoji: '📃', colorClass: 'text-gray-400', label: 'Text' },
  csv: { emoji: '📊', colorClass: 'text-green-400', label: 'CSV' },
  json: { emoji: '{ }', colorClass: 'text-yellow-400', label: 'JSON' },
  image: { emoji: '🖼️', colorClass: 'text-purple-400', label: 'Image' },
  html: { emoji: '🌐', colorClass: 'text-orange-400', label: 'HTML' },
  xml: { emoji: '📋', colorClass: 'text-cyan-400', label: 'XML' },
  yaml: { emoji: '⚙️', colorClass: 'text-teal-400', label: 'YAML' },
  log: { emoji: '📜', colorClass: 'text-gray-400', label: 'Log' },
  code: { emoji: '💻', colorClass: 'text-blue-300', label: 'Code' },
  zip: { emoji: '📦', colorClass: 'text-yellow-500', label: 'ZIP Archive' },
  spreadsheet: { emoji: '📊', colorClass: 'text-green-500', label: 'Spreadsheet' },
  presentation: { emoji: '📽️', colorClass: 'text-orange-500', label: 'Presentation' },
  media: { emoji: '🎵', colorClass: 'text-purple-500', label: 'Media' },
  folder: { emoji: '📁', colorClass: 'text-yellow-300', label: 'Folder' },
  unsupported: { emoji: '❓', colorClass: 'text-gray-500', label: 'Unknown' },
};

export function getFileIcon(fileType: FileType): FileIconConfig {
  return FILE_ICONS[fileType] ?? FILE_ICONS.unsupported;
}

export const MONACO_LANGUAGE_MAP: Record<string, string> = {
  py: 'python',
  pyw: 'python',
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  css: 'css',
  scss: 'scss',
  sass: 'scss',
  less: 'less',
  html: 'html',
  htm: 'html',
  xml: 'xml',
  json: 'json',
  yaml: 'yaml',
  yml: 'yaml',
  sh: 'shell',
  bash: 'shell',
  zsh: 'shell',
  ps1: 'powershell',
  bat: 'bat',
  cmd: 'bat',
  rb: 'ruby',
  go: 'go',
  rs: 'rust',
  c: 'c',
  cpp: 'cpp',
  cc: 'cpp',
  h: 'c',
  hpp: 'cpp',
  java: 'java',
  kt: 'kotlin',
  swift: 'swift',
  r: 'r',
  lua: 'lua',
  php: 'php',
  sql: 'sql',
  md: 'markdown',
  csv: 'plaintext',
  log: 'plaintext',
  txt: 'plaintext',
  toml: 'toml',
};

export function getMonacoLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return MONACO_LANGUAGE_MAP[ext] ?? 'plaintext';
}
