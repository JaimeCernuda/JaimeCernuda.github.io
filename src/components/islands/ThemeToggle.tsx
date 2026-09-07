import { useCallback } from 'react';

/**
 * Dark mode toggle. The server renders <html class="dark">; the inline head
 * script removes the class before paint when localStorage says "light".
 * Both icons are rendered and CSS picks the visible one, so the button is
 * correct before hydration.
 */
export default function ThemeToggle() {
  const toggle = useCallback(() => {
    const dark = document.documentElement.classList.toggle('dark');
    try {
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    } catch {
      // Storage may be unavailable; the toggle still works for this page.
    }
  }, []);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle Dark Mode"
      className="flex items-center justify-center p-2 rounded-lg text-gray-700 hover:bg-surface-light-lighter hover:text-primary transition-all dark:text-gray-400 dark:hover:bg-surface-dark-lighter dark:hover:text-white cursor-pointer"
    >
      <span className="material-symbols-outlined dark:hidden" aria-hidden="true">
        dark_mode
      </span>
      <span className="material-symbols-outlined hidden dark:inline" aria-hidden="true">
        light_mode
      </span>
    </button>
  );
}
