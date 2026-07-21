import { useState, useRef, useEffect } from 'react';
import { Lock, X } from 'lucide-react';
import { useExplorerStore } from '../../store/useExplorerStore';

export function PasswordDialog() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { pendingPasswordFor, setPendingPassword } = useExplorerStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (pendingPasswordFor) {
      setPassword('');
      setError('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [pendingPasswordFor]);

  if (!pendingPasswordFor) return null;

  const handleSubmit = () => {
    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }
    pendingPasswordFor.resolve(password);
    setPendingPassword(null);
  };

  const handleCancel = () => {
    pendingPasswordFor.resolve(null);
    setPendingPassword(null);
  };

  return (
    <div className="dialog-overlay" onClick={handleCancel} id="password-dialog-overlay">
      <div className="dialog" onClick={(e) => e.stopPropagation()} id="password-dialog">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, background: 'var(--accent-muted)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={18} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div>
            <div className="dialog-title" style={{ marginBottom: 0 }}>Password Required</div>
            <div className="dialog-subtitle" style={{ marginBottom: 0 }}>
              <span style={{ color: 'var(--text-accent)' }}>{pendingPasswordFor.name}</span> is encrypted
            </div>
          </div>
          <button
            className="btn btn-ghost btn-icon"
            onClick={handleCancel}
            style={{ marginLeft: 'auto' }}
          >
            <X size={14} />
          </button>
        </div>

        <input
          ref={inputRef}
          type="password"
          className="dialog-input"
          placeholder="Enter ZIP password..."
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(''); }}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          id="password-input"
          autoComplete="off"
        />

        {error && (
          <div style={{ fontSize: 11, color: 'var(--text-danger)', marginTop: -10, marginBottom: 12 }}>
            {error}
          </div>
        )}

        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} id="password-submit-btn">
            <Lock size={13} />
            Open
          </button>
        </div>
      </div>
    </div>
  );
}
