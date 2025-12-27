import { useState, useEffect } from 'react';

export const useTheme = () => {
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        // Initialize theme from localStorage or system preference
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = savedTheme || (prefersDark ? 'dark' : 'dark'); // Default to dark

        setTheme(initialTheme);

        // Ensure DOM matches initial state
        if (initialTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);

        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // Dispatch a custom event so other components can listen if needed (optional but helpful)
        window.dispatchEvent(new Event('theme-change'));
    };

    return { theme, toggleTheme };
};
