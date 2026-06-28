import { Suspense } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import 'katex/dist/katex.min.css';

interface MarkdownViewerProps {
  text: string;
}

export function MarkdownViewer({ text }: MarkdownViewerProps) {
  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      <div className="markdown-viewer">
        <Suspense fallback={<div className="spinner" />}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex, rehypeHighlight]}
          >
            {text}
          </ReactMarkdown>
        </Suspense>
      </div>
    </div>
  );
}
