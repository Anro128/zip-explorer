import fs from 'fs';
import path from 'path';

function replaceInFile(filePath, pattern, replacement) {
  const fullPath = path.resolve('d:/project/vibecoded/zip-explorer/src', filePath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const newContent = content.replace(pattern, replacement);
    fs.writeFileSync(fullPath, newContent, 'utf8');
  }
}

// Global replace of "import React from 'react';" where it's just React
replaceInFile('App.tsx', /import React from 'react';\r?\n/, '');
replaceInFile('components/explorer/SearchBar.tsx', /import React from 'react';\r?\n/, '');
replaceInFile('components/layout/Header.tsx', /import React from 'react';\r?\n/, '');
replaceInFile('components/preview/PreviewPanel.tsx', /import React from 'react';\r?\n/, '');
replaceInFile('components/preview/TabBar.tsx', /import React from 'react';\r?\n/, '');
replaceInFile('components/viewers/SyntaxViewer.tsx', /import React from 'react';\r?\n/, '');
replaceInFile('components/viewers/TextViewer.tsx', /import React from 'react';\r?\n/, '');
replaceInFile('components/viewers/UnsupportedViewer.tsx', /import React from 'react';\r?\n/, '');
replaceInFile('components/preview/ViewerRouter.tsx', /import React, \{ Suspense \} from 'react';\r?\n/, '');

// Specific file updates
replaceInFile('components/dialogs/PasswordDialog.tsx', /import React, \{ /, 'import { ');
replaceInFile('components/dialogs/QuickOpenDialog.tsx', /Search, FileText/, 'Search');
replaceInFile('components/dialogs/ShortcutsDialog.tsx', /import React, \{ /, 'import { ');
replaceInFile('components/dialogs/ShortcutsDialog.tsx', /, File/, '');
replaceInFile('components/explorer/Breadcrumb.tsx', /item, idx/, 'item, _idx');
replaceInFile('components/explorer/ContextMenu.tsx', /, X/, '');
replaceInFile('components/explorer/DropZone.tsx', /Upload, /, '');
replaceInFile('components/explorer/FileTree.tsx', /import React, \{ useMemo, /, 'import React, { ');
replaceInFile('components/explorer/FileTree.tsx', /VFSNode, VFSFile, SortConfig, /, 'VFSFile, ');
replaceInFile('components/explorer/FileTree.tsx', /const \{ loadRootZip \} = await import\(\'\.\.\/\.\.\/core\/vfs\/ZipVFS\'\)\.then\(m => \(\{\r?\n\s*loadRootZip: \(f: File\) => import\(\'\.\.\/\.\.\/hooks\/useZipLoader\'\)\r?\n\s*\}\)\);\r?\n/, '');
replaceInFile('components/explorer/FileTreeItem.tsx', /, X /, ' ');
replaceInFile('components/layout/AppLayout.tsx', /import React, \{ /, 'import { ');
replaceInFile('components/layout/AppLayout.tsx', /const totalFiles = [^\r\n]+;\r?\n/, '');
replaceInFile('components/layout/AppLayout.tsx', /const \{ setSearchQuery \} = useExplorerStore\(\);\r?\n/, '');
replaceInFile('components/layout/Header.tsx', /onGlobalSearch, /, '');
replaceInFile('components/viewers/CsvViewer.tsx', /import React, \{ /, 'import { ');
replaceInFile('components/viewers/CsvViewer.tsx', /, Filter /, ' ');
replaceInFile('components/viewers/HtmlViewer.tsx', /useRef, /, '');
replaceInFile('components/viewers/ImageViewer.tsx', /import React, \{ /, 'import { ');
replaceInFile('components/viewers/ImageViewer.tsx', /const \[rotation, setRotation\] = useState\(0\);\r?\n/, '');
replaceInFile('components/viewers/JsonViewer.tsx', /import React, \{ /, 'import { ');
replaceInFile('components/viewers/JsonViewer.tsx', /import \{ ChevronRight, ChevronDown \} from 'lucide-react';\r?\n/, '');
replaceInFile('components/viewers/MarkdownViewer.tsx', /import React, \{ useMemo, Suspense \}/, 'import { ');
replaceInFile('components/viewers/NotebookViewer.tsx', /import React, \{ useMemo, Suspense \}/, 'import { useMemo }');
replaceInFile('components/viewers/NotebookViewer.tsx', /index: number;/, '_index: number;');
replaceInFile('components/viewers/NotebookViewer.tsx', /cell, index,/, 'cell, _index,');
replaceInFile('components/viewers/NotebookViewer.tsx', /const \{ theme \} = useSettingsStore\(\);\r?\n/, '');
replaceInFile('components/viewers/PdfViewer.tsx', /import React, \{ /, 'import { ');
replaceInFile('store/useExplorerStore.ts', /VFSNode, VFSFile, /, 'VFSNode, ');
replaceInFile('store/useExplorerStore.ts', /\(set, get\)/, '(set, _get)');
replaceInFile('store/useExplorerStore.ts', /\(zipId, update\)/, '(_zipId, update)');
replaceInFile('store/useSettingsStore.ts', /\(set, get\)/, '(set, _get)');

console.log('Fixes applied.');
