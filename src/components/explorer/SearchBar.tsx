import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  id?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search files...', id }: SearchBarProps) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <Search
        size={13}
        style={{
          position: 'absolute',
          left: 10,
          color: 'var(--text-muted)',
          pointerEvents: 'none',
        }}
      />
      <input
        id={id ?? 'file-search'}
        type="text"
        className="search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          style={{
            position: 'absolute',
            right: 6,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            padding: 2,
          }}
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}
