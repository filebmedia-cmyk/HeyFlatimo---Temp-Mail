'use client';

export function getStoredTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = localStorage.getItem('tmail_theme');
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    if (document.documentElement.classList.contains('dark')) {
      return 'dark';
    }
  } catch (e) {
    // Ignore storage access errors
  }
  return 'light';
}

export function isDarkModeActive(): boolean {
  return getStoredTheme() === 'dark';
}

export function applyTheme(isDark: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('tmail_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('tmail_theme', 'light');
    }
    // Dispatch custom event for same-window cross-component synchronization
    window.dispatchEvent(new CustomEvent('tmail_theme_change', { detail: { isDark } }));
  } catch (e) {
    // Ignore storage access errors
  }
}

export function toggleThemeMode(): boolean {
  const current = isDarkModeActive();
  const next = !current;
  applyTheme(next);
  return next;
}

export function initThemeListener(callback: (isDark: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleCustomChange = (e: Event) => {
    const customEvent = e as CustomEvent<{ isDark: boolean }>;
    if (customEvent.detail && typeof customEvent.detail.isDark === 'boolean') {
      callback(customEvent.detail.isDark);
    } else {
      callback(isDarkModeActive());
    }
  };

  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'tmail_theme') {
      const isDark = e.newValue === 'dark';
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      callback(isDark);
    }
  };

  window.addEventListener('tmail_theme_change', handleCustomChange);
  window.addEventListener('storage', handleStorageChange);

  return () => {
    window.removeEventListener('tmail_theme_change', handleCustomChange);
    window.removeEventListener('storage', handleStorageChange);
  };
}
