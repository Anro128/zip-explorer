import { useMemo } from 'react';
import { AlertTriangle, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';


SyntaxHighlighter.registerLanguage('python', python);

// Jupyter Notebook types
interface NotebookMetadata {
  kernelspec?: { language?: string; display_name?: string };
  language_info?: { name?: string };
}

interface OutputBase {
  output_type: string;
}

interface StreamOutput extends OutputBase {
  output_type: 'stream';
  name: string;
  text: string | string[];
}

interface DisplayData extends OutputBase {
  output_type: 'display_data' | 'execute_result';
  data: Record<string, string | string[]>;
  execution_count?: number;
}

interface ErrorOutput extends OutputBase {
  output_type: 'error';
  ename: string;
  evalue: string;
  traceback: string[];
}

type Output = StreamOutput | DisplayData | ErrorOutput;

interface Cell {
  cell_type: 'code' | 'markdown' | 'raw';
  source: string | string[];
  outputs?: Output[];
  execution_count?: number | null;
  metadata?: Record<string, unknown>;
}

interface Notebook {
  nbformat: number;
  nbformat_minor: number;
  metadata: NotebookMetadata;
  cells: Cell[];
}

function getCellSource(source: string | string[]): string {
  return Array.isArray(source) ? source.join('') : source;
}

function getOutputText(data: string | string[]): string {
  return Array.isArray(data) ? data.join('') : data;
}

// Strip ANSI escape codes
function stripAnsi(str: string): string {
  return str.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '');
}

function CellOutput({ output }: { output: Output }) {
  if (output.output_type === 'stream') {
    const stream = output as StreamOutput;
    const text = getOutputText(stream.text);
    return (
      <div className="nb-cell-output" style={{
        borderLeft: stream.name === 'stderr' ? '2px solid var(--text-danger)' : undefined,
      }}>
        {stripAnsi(text)}
      </div>
    );
  }

  if (output.output_type === 'display_data' || output.output_type === 'execute_result') {
    const disp = output as DisplayData;
    const data = disp.data;

    // Priority: image > html > text
    if (data['image/png']) {
      return (
        <div className="nb-cell-output" style={{ background: 'transparent', padding: 8 }}>
          <img
            src={`data:image/png;base64,${getOutputText(data['image/png'])}`}
            alt="notebook output"
            style={{ maxWidth: '100%' }}
          />
        </div>
      );
    }
    if (data['image/jpeg'] || data['image/jpg']) {
      const key = data['image/jpeg'] ? 'image/jpeg' : 'image/jpg';
      return (
        <div className="nb-cell-output" style={{ background: 'transparent', padding: 8 }}>
          <img
            src={`data:${key};base64,${getOutputText(data[key])}`}
            alt="notebook output"
            style={{ maxWidth: '100%' }}
          />
        </div>
      );
    }
    if (data['image/svg+xml']) {
      const svgContent = getOutputText(data['image/svg+xml']);
      return (
        <div
          className="nb-cell-output"
          style={{ background: 'white', padding: 8 }}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      );
    }
    if (data['text/html']) {
      const html = getOutputText(data['text/html']);
      return (
        <div
          className="nb-cell-output"
          style={{ background: 'white', color: '#111', padding: 8, overflow: 'auto' }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }
    if (data['text/plain']) {
      return (
        <div className="nb-cell-output">
          {stripAnsi(getOutputText(data['text/plain']))}
        </div>
      );
    }
    return null;
  }

  if (output.output_type === 'error') {
    const err = output as ErrorOutput;
    return (
      <div className="nb-cell-output" style={{ color: 'var(--text-danger)', borderLeft: '2px solid var(--text-danger)' }}>
        <strong>{err.ename}: {err.evalue}</strong>
        {'\n'}
        {err.traceback.map(stripAnsi).join('\n')}
      </div>
    );
  }

  return null;
}

function CodeCell({ cell, language }: { cell: Cell; language: string }) {
  const source = getCellSource(cell.source);
  
  return (
    <div className="nb-cell nb-cell-code">
      <div className="nb-input-prompt">
        In [{cell.execution_count ?? ' '}]:
      </div>
      <SyntaxHighlighter
        language={language}
        style={atomOneDark}
        showLineNumbers
        customStyle={{
          margin: 0,
          padding: '12px',
          background: 'var(--bg-tertiary)',
          fontSize: 12,
          fontFamily: 'var(--font-mono)',
        }}
        lineNumberStyle={{ color: 'var(--text-muted)', minWidth: '2.5em' }}
      >
        {source}
      </SyntaxHighlighter>
      {cell.outputs && cell.outputs.length > 0 && (
        <div>
          {cell.outputs.map((out, oi) => (
            <CellOutput key={oi} output={out} />
          ))}
        </div>
      )}
    </div>
  );
}

function MarkdownCell({ cell }: { cell: Cell }) {
  const source = getCellSource(cell.source);
  return (
    <div className="nb-cell nb-cell-markdown">
      <div className="markdown-viewer" style={{ padding: 0 }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
        >
          {source}
        </ReactMarkdown>
      </div>
    </div>
  );
}

interface NotebookViewerProps {
  text: string;
}

export function NotebookViewer({ text }: NotebookViewerProps) {
  const { parsed, error } = useMemo(() => {
    try {
      if (!text || text.trim() === '') {
        throw new Error('File is empty');
      }
      // Strip BOM if present
      const cleanText = text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
      return { parsed: JSON.parse(cleanText) as Notebook, error: null };
    } catch (e) {
      console.error('Notebook parse error. First 50 chars:', text.substring(0, 50));
      return { parsed: null, error: (e as Error).message };
    }
  }, [text]);

  if (error || !parsed) {
    return (
      <div className="error-state">
        <div className="error-icon"><AlertTriangle size={32} strokeWidth={1.5} /></div>
        <div>Failed to parse notebook: {error}</div>
      </div>
    );
  }

  const language = parsed.metadata?.kernelspec?.language
    || parsed.metadata?.language_info?.name
    || 'python';

  const kernelDisplay = parsed.metadata?.kernelspec?.display_name ?? language;

  return (
    <div className="notebook-viewer">
      {/* Notebook header */}
      <div style={{
        marginBottom: 16,
        padding: '12px 16px',
        background: 'var(--bg-secondary)',
        borderRadius: 8,
        border: '1px solid var(--border-muted)',
        display: 'flex',
        gap: 16,
        fontSize: 12,
        color: 'var(--text-secondary)',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><BookOpen size={14} /> Jupyter Notebook</span>
        <span>Kernel: <strong style={{ color: 'var(--text-primary)' }}>{kernelDisplay}</strong></span>
        <span>Cells: <strong style={{ color: 'var(--text-primary)' }}>{parsed.cells.length}</strong></span>
        <span>nbformat: {parsed.nbformat}.{parsed.nbformat_minor}</span>
      </div>

      {/* Cells */}
      {parsed.cells.map((cell, idx) => {
        if (cell.cell_type === 'code') {
          return <CodeCell key={idx} cell={cell} language={language} />;
        }
        if (cell.cell_type === 'markdown') {
          return <MarkdownCell key={idx} cell={cell} />;
        }
        // raw cell
        return (
          <div key={idx} className="nb-cell">
            <pre style={{ padding: 12, margin: 0, fontFamily: 'var(--font-mono)', fontSize: 12, whiteSpace: 'pre-wrap', color: 'var(--text-muted)' }}>
              {getCellSource(cell.source)}
            </pre>
          </div>
        );
      })}
    </div>
  );
}
