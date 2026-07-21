import { useState, useMemo } from 'react';
import { MAX_JSON_COLLAPSE_DEPTH } from '../../utils/constants';
import { AlertTriangle } from 'lucide-react';

interface JsonNodeProps {
  data: unknown;
  depth?: number;
  keyName?: string;
}

function JsonNode({ data, depth = 0, keyName }: JsonNodeProps) {
  const [collapsed, setCollapsed] = useState(depth >= MAX_JSON_COLLAPSE_DEPTH);

  const renderValue = () => {
    if (data === null) return <span className="json-null">null</span>;
    if (typeof data === 'boolean') return <span className="json-boolean">{String(data)}</span>;
    if (typeof data === 'number') return <span className="json-number">{data}</span>;
    if (typeof data === 'string') return <span className="json-string">"{data.length > 200 ? data.slice(0, 200) + '…' : data}"</span>;

    if (Array.isArray(data)) {
      if (data.length === 0) return <span style={{ color: 'var(--text-muted)' }}>[]</span>;
      if (collapsed) {
        return (
          <span
            className="json-toggle"
            onClick={() => setCollapsed(false)}
          >
            [<span style={{ color: 'var(--text-muted)' }}>{data.length} items</span>]
          </span>
        );
      }
      return (
        <span>
          <span className="json-toggle" onClick={() => setCollapsed(true)}>[</span>
          <div style={{ paddingLeft: 16 }}>
            {data.map((item, i) => (
              <div key={i} className="json-node">
                <span style={{ color: 'var(--text-muted)', marginRight: 4 }}>{i}:</span>
                <JsonNode data={item} depth={depth + 1} />
                {i < data.length - 1 && <span style={{ color: 'var(--text-muted)' }}>,</span>}
              </div>
            ))}
          </div>
          <span className="json-toggle" onClick={() => setCollapsed(true)}>]</span>
        </span>
      );
    }

    if (typeof data === 'object') {
      const entries = Object.entries(data as Record<string, unknown>);
      if (entries.length === 0) return <span style={{ color: 'var(--text-muted)' }}>{'{}'}</span>;
      if (collapsed) {
        return (
          <span
            className="json-toggle"
            onClick={() => setCollapsed(false)}
          >
            {'{'}<span style={{ color: 'var(--text-muted)' }}>{entries.length} keys</span>{'}'}
          </span>
        );
      }
      return (
        <span>
          <span className="json-toggle" onClick={() => setCollapsed(true)}>{'{'}</span>
          <div style={{ paddingLeft: 16 }}>
            {entries.map(([k, v], i) => (
              <div key={k} className="json-node">
                <span className="json-key">"{k}"</span>
                <span style={{ color: 'var(--text-muted)' }}>: </span>
                <JsonNode data={v} depth={depth + 1} />
                {i < entries.length - 1 && <span style={{ color: 'var(--text-muted)' }}>,</span>}
              </div>
            ))}
          </div>
          <span className="json-toggle" onClick={() => setCollapsed(true)}>{'}'}</span>
        </span>
      );
    }

    return <span>{String(data)}</span>;
  };

  return (
    <span>
      {keyName !== undefined && (
        <>
          <span className="json-key">"{keyName}"</span>
          <span style={{ color: 'var(--text-muted)' }}>: </span>
        </>
      )}
      {renderValue()}
    </span>
  );
}

interface JsonViewerProps {
  text: string;
}

export function JsonViewer({ text }: JsonViewerProps) {
  const { parsed, error } = useMemo(() => {
    try {
      return { parsed: JSON.parse(text), error: null };
    } catch (e) {
      return { parsed: null, error: (e as Error).message };
    }
  }, [text]);

  if (error) {
    return (
      <div className="error-state">
        <div className="error-icon"><AlertTriangle size={32} strokeWidth={1.5} /></div>
        <div style={{ fontWeight: 600 }}>Invalid JSON</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-danger)' }}>
          {error}
        </div>
        {/* Fall back to raw text */}
        <pre style={{ marginTop: 16, background: 'var(--bg-tertiary)', padding: 12, borderRadius: 6, overflow: 'auto', maxWidth: '100%', textAlign: 'left', fontSize: 11 }}>
          {text.slice(0, 5000)}
        </pre>
      </div>
    );
  }

  return (
    <div className="json-viewer" id="json-viewer">
      <JsonNode data={parsed} depth={0} />
    </div>
  );
}
