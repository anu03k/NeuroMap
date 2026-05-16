import { create } from 'zustand';

const LS_KEY = 'psych-explorer-theme';

function applyTheme(isDark: boolean) {
  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.classList.toggle('light', !isDark);
  localStorage.setItem(LS_KEY, isDark ? 'dark' : 'light');
}

const saved = localStorage.getItem(LS_KEY);
const init = saved ? saved === 'dark' : true;
applyTheme(init);

interface ThemeStore {
  isDark: boolean;
  toggle: () => void;
}

export const useTheme = create<ThemeStore>((set) => ({
  isDark: init,
  toggle: () =>
    set((s) => {
      const next = !s.isDark;
      applyTheme(next);
      return { isDark: next };
    }),
}));
