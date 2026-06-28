import React, { useEffect, useRef } from 'react';
import { X, Command, Search, File, XCircle } from 'lucide-react';

interface ShortcutsDialogProps {
  onClose: () => void;
}

export function ShortcutsDialog({ onClose }: ShortcutsDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const shortcuts = [
    { key: 'Ctrl + P', desc: 'Quick Open (Search Files by Name)', icon: <Search size={14} /> },
    { key: 'Ctrl + F', desc: 'Focus File Explorer Search', icon: <Search size={14} /> },
    { key: 'Ctrl + W', desc: 'Close Active Tab', icon: <XCircle size={14} /> },
    { key: 'Esc', desc: 'Close Modal / Dialog', icon: <X size={14} /> },
  ];

  return (
    <div
      className="dialog-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className="dialog-content"
        style={{
          background: 'var(--bg-primary)',
          borderRadius: 8,
          width: 400,
          maxWidth: '90%',
          boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
          border: '1px solid var(--border-default)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-secondary)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
            <Command size={16} style={{ color: 'var(--accent-primary)' }} />
            Keyboard Shortcuts
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {shortcuts.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: i < shortcuts.length - 1 ? '1px solid var(--border-muted)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)' }}>
                  {s.icon}
                  <span style={{ fontSize: 13 }}>{s.desc}</span>
                </div>
                <kbd style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-muted)',
                  borderRadius: 4,
                  padding: '4px 8px',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-primary)',
                  boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
                }}>
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
