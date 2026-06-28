import { Sun, Moon, Upload, Keyboard, Search } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useZipLoader } from '../../hooks/useZipLoader';
import { APP_NAME } from '../../utils/constants';

interface HeaderProps {
  onQuickOpen: () => void;
  onGlobalSearch: () => void;
  onShowShortcuts: () => void;
}

export function Header({ onQuickOpen, onShowShortcuts }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { loadRootZip } = useZipLoader();

  const openZip = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.zip';
    input.multiple = true;
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;
      await Promise.all(Array.from(files).map((f) => loadRootZip(f)));
    };
    input.click();
  };

  return (
    <header className="app-header" id="app-header">
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span style={{ fontSize: 20 }}>📦</span>
        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
          {APP_NAME}
        </span>
        <span style={{
          fontSize: 10,
          padding: '1px 5px',
          background: 'var(--accent-muted)',
          color: 'var(--text-accent)',
          borderRadius: 4,
          fontWeight: 600,
          letterSpacing: '0.05em',
        }}>
          BETA
        </span>
      </div>

      {/* Search bar (middle) */}
      <div style={{ flex: 1, maxWidth: 400, margin: '0 16px' }}>
        <button
          onClick={onQuickOpen}
          id="header-search-btn"
          style={{
            width: '100%',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-default)',
            borderRadius: 6,
            padding: '5px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            color: 'var(--text-muted)',
            fontSize: 12,
            transition: 'all 200ms',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-default)')}
        >
          <Search size={13} />
          <span>Quick Open...</span>
          <span style={{ marginLeft: 'auto', fontSize: 10, opacity: 0.6 }}>Ctrl+P</span>
        </button>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
        <button
          className="btn btn-primary"
          onClick={openZip}
          id="upload-zip-btn"
          style={{ fontSize: 12 }}
        >
          <Upload size={13} />
          Open ZIP
        </button>

        <button
          className="btn btn-ghost btn-icon tooltip"
          onClick={toggleTheme}
          data-tooltip={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
          id="theme-toggle-btn"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        <button
          className="btn btn-ghost btn-icon tooltip"
          onClick={onShowShortcuts}
          data-tooltip="Keyboard Shortcuts"
          id="shortcuts-btn"
        >
          <Keyboard size={15} />
        </button>
      </div>
    </header>
  );
}
