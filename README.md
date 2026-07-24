# Zip Explorer

Zip Explorer is a blazing-fast, modern, browser-based tool to extract and explore ZIP archives locally. Without uploading anything to a server, you can preview source code, massive datasets, and complex documents instantly directly in your browser.

## Key Features

- **100% Local Processing:** Files are extracted and processed locally in your browser. No server uploads, ensuring complete privacy and speed.
- **Dynamic Infinite Scrolling:** Effortlessly load gigabyte-sized CSVs, Spreadsheets, and massive PDFs without freezing your browser. The app instantly renders chunks on-the-fly as you scroll.
- **1-by-1 Interactive Search:** VS Code style search functionality across text and data files. Includes Next/Prev navigation, keyboard shortcuts, dynamic index recalculation on sorting, and smart auto-scrolling.
- **Universal Zoom:** Global zoom controls applied natively to text, data tables, PDFs, presentations, and media viewers.
- **Modern UI/UX:** Resizable panels, tabbed viewing, clean typography, and buttery-smooth interactions.

## Supported File Viewers

Zip Explorer includes highly optimized built-in viewers for almost any file type you might find in an archive:

- **Source Code & Text:** Powered by Monaco Editor with full syntax highlighting.
- **Data (CSV, XLSX, XLSB, XLSM):** Interactive tabular data viewers with column sorting and 1-by-1 search capabilities.
- **Documents (PDF, DOCX):** High-fidelity document rendering natively in the browser.
- **Presentations (PPTX):** View slides directly without external software.
- **Media:** First-class support for images, video, and audio.
- **Markdown & JSON:** Beautifully formatted and rendered with structure.

## Tech Stack

- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS V4 + Vanilla CSS
- **State Management:** Zustand
- **Extraction:** `@zip.js/zip.js` & `fflate`
- **Core Viewers:** `pdfjs-dist`, `mammoth`, `xlsx`, `@monaco-editor/react`

## Getting Started

### Prerequisites
Make sure you have Node.js and npm installed.

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd zip-explorer
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Building for Production
To build the application for production, run:
```bash
npm run build
```
The output will be placed in the `dist` folder.

## License
This project is licensed under the MIT License.
