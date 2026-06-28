import { useEffect } from 'react';

export interface ShortcutHandlers {
  onQuickOpen?: () => void;
  onSearch?: () => void;
  onGlobalSearch?: () => void;
  onCloseTab?: () => void;
  onEscape?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.key === 'p' && !e.shiftKey) {
        e.preventDefault();
        handlers.onQuickOpen?.();
      }
      if (ctrl && e.key === 'f' && !e.shiftKey) {
        e.preventDefault();
        handlers.onSearch?.();
      }
      if (ctrl && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        handlers.onGlobalSearch?.();
      }
      if (ctrl && e.key === 'w') {
        e.preventDefault();
        handlers.onCloseTab?.();
      }
      if (e.key === 'Escape') {
        handlers.onEscape?.();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handlers]);
}
