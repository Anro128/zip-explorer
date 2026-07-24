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
  xlsb: 'spreadsheet',
  xlsm: 'spreadsheet',
  xltx: 'spreadsheet',
  xltm: 'spreadsheet',
  xlam: 'spreadsheet',
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
    xlsb: 'application/vnd.ms-excel.sheet.binary.macroEnabled.12',
    xlsm: 'application/vnd.ms-excel.sheet.macroEnabled.12',
    xltx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
    xltm: 'application/vnd.ms-excel.template.macroEnabled.12',
    xlam: 'application/vnd.ms-excel.addin.macroEnabled.12',
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
  color: string;
  label: string;
}

export const FILE_ICONS: Record<FileType | 'folder', FileIconConfig> = {
  pdf: { icon: FileText, color: '#DC2626', label: 'PDF' },
  docx: { icon: FileText, color: '#2563EB', label: 'Word Document' },
  python: { icon: Terminal, color: '#CA8A04', label: 'Python' },
  notebook: { icon: BookOpen, color: '#EA580C', label: 'Jupyter Notebook' },
  markdown: { icon: FileText, color: '#52525B', label: 'Markdown' },
  text: { icon: FileText, color: '#71717A', label: 'Text' },
  csv: { icon: Table, color: '#16A34A', label: 'CSV' },
  json: { icon: FileJson, color: '#71717A', label: 'JSON' },
  image: { icon: ImageIcon, color: '#9333EA', label: 'Image' },
  html: { icon: Code, color: '#F97316', label: 'HTML' },
  xml: { icon: Code, color: '#71717A', label: 'XML' },
  yaml: { icon: FileJson, color: '#71717A', label: 'YAML' },
  log: { icon: FileText, color: '#71717A', label: 'Log' },
  code: { icon: FileCode, color: '#2563EB', label: 'Code' },
  zip: { icon: FileArchive, color: '#D97706', label: 'ZIP Archive' },
  spreadsheet: { icon: FileSpreadsheet, color: '#16A34A', label: 'Spreadsheet' },
  presentation: { icon: Presentation, color: '#EA580C', label: 'Presentation' },
  media: { icon: Film, color: '#0891B2', label: 'Media' },
  folder: { icon: Folder, color: '#EAB308', label: 'Folder' },
  unsupported: { icon: FileQuestion, color: '#71717A', label: 'Unknown' },
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
