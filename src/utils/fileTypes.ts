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

import {
  FileText,
  FileCode,
  FileJson,
  FileSpreadsheet,
  FileArchive,
  FileQuestion,
  Image as ImageIcon,
  Folder,
  Presentation,
  Film,
  Terminal,
  BookOpen,
  Code,
  Table
} from 'lucide-react';
import React from 'react';

export interface FileIconConfig {
  icon: React.ElementType;
  colorClass: string;
  label: string;
}

export const FILE_ICONS: Record<FileType | 'folder', FileIconConfig> = {
  pdf: { icon: FileText, colorClass: 'text-red-400', label: 'PDF' },
  docx: { icon: FileText, colorClass: 'text-blue-500', label: 'Word Document' },
  python: { icon: Terminal, colorClass: 'text-blue-400', label: 'Python' },
  notebook: { icon: BookOpen, colorClass: 'text-orange-400', label: 'Jupyter Notebook' },
  markdown: { icon: FileText, colorClass: 'text-gray-300', label: 'Markdown' },
  text: { icon: FileText, colorClass: 'text-gray-400', label: 'Text' },
  csv: { icon: Table, colorClass: 'text-green-400', label: 'CSV' },
  json: { icon: FileJson, colorClass: 'text-yellow-400', label: 'JSON' },
  image: { icon: ImageIcon, colorClass: 'text-purple-400', label: 'Image' },
  html: { icon: Code, colorClass: 'text-orange-400', label: 'HTML' },
  xml: { icon: Code, colorClass: 'text-cyan-400', label: 'XML' },
  yaml: { icon: FileJson, colorClass: 'text-teal-400', label: 'YAML' },
  log: { icon: FileText, colorClass: 'text-gray-400', label: 'Log' },
  code: { icon: FileCode, colorClass: 'text-blue-300', label: 'Code' },
  zip: { icon: FileArchive, colorClass: 'text-yellow-500', label: 'ZIP Archive' },
  spreadsheet: { icon: FileSpreadsheet, colorClass: 'text-green-500', label: 'Spreadsheet' },
  presentation: { icon: Presentation, colorClass: 'text-orange-500', label: 'Presentation' },
  media: { icon: Film, colorClass: 'text-purple-500', label: 'Media' },
  folder: { icon: Folder, colorClass: 'text-yellow-300', label: 'Folder' },
  unsupported: { icon: FileQuestion, colorClass: 'text-gray-500', label: 'Unknown' },
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
