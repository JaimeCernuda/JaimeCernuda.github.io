import React from 'react';
import { useTheme } from '../hooks/useTheme';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            aria-label="Toggle Dark Mode"
            className="flex items-center justify-center p-2 rounded-lg text-gray-700 hover:bg-surface-light-lighter hover:text-primary transition-all dark:text-gray-400 dark:hover:bg-surface-dark-lighter dark:hover:text-white"
        >
            <span className="material-symbols-outlined">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
        </button>
    );
};

export default ThemeToggle;
