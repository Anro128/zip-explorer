import { useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export function useTheme() {
  const { theme, toggleTheme } = useSettingsStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return { theme, toggleTheme };
}
