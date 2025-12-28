import React, { useEffect, useState } from 'react';

const TableOfContents = ({ content, title }) => {
    const [headings, setHeadings] = useState([]);
    const [activeId, setActiveId] = useState('');

    useEffect(() => {
        if (!content) return;

        // Parse headings from markdown
        const lines = content.split('\n');
        const extractedHeadings = [];

        // Simple regex to find headers inside code blocks (to ignore them)
        let inCodeBlock = false;

        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('```')) {
                inCodeBlock = !inCodeBlock;
                return;
            }
            if (inCodeBlock) return;

            const match = trimmedLine.match(/^(#{1,3})\s+(.+)$/);
            if (match) {
                const level = match[1].length;
                const text = match[2].trim();
                // Generate ID compatible with MarkdownRenderer (lowercase, remove special chars, replace spaces with dashes)
                const id = text
                    .toLowerCase()
                    .trim()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/[\s_-]+/g, '-')
                    .replace(/^-+|-+$/g, '');

                extractedHeadings.push({ id, text, level });
            }
        });

        setHeadings(extractedHeadings);
    }, [content]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: '-100px 0px -66% 0px' }
        );

        headings.forEach(({ id }) => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        // Observe the top element if title is provided
        if (title) {
            const topElement = document.getElementById('top');
            if (topElement) observer.observe(topElement);
        }

        return () => observer.disconnect();
    }, [headings, title]);

    if (headings.length === 0 && !title) return null;

    const handleScroll = (e, id) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            const navbarHeight = 80; // Account for sticky navbar
            const elementPosition = element.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({
                top: elementPosition - navbarHeight,
                behavior: 'smooth'
            });
        }
        setActiveId(id);
    };

    return (
        <nav className="hidden xl:block sticky top-24 self-start w-64 pr-8 max-h-[calc(100vh-6rem)] overflow-y-auto">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">On this page</h4>
            <ul className="space-y-2 text-sm border-l border-gray-200 dark:border-gray-800">
                {title && (
                    <li>
                        <a
                            href="#top"
                            className={`block py-1 border-l-2 -ml-[2px] transition-colors ${activeId === 'top'
                                ? 'border-primary text-primary font-medium'
                                : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                            style={{ paddingLeft: '1rem' }}
                            onClick={(e) => handleScroll(e, 'top')}
                        >
                            {title}
                        </a>
                    </li>
                )}
                {headings.map(({ id, text, level }) => (
                    <li key={id}>
                        <a
                            href={`#${id}`}
                            className={`block py-1 border-l-2 -ml-[2px] transition-colors ${activeId === id
                                ? 'border-primary text-primary font-medium'
                                : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                            style={{ paddingLeft: `${1 + (level - 1) * 0.75}rem` }}
                            onClick={(e) => handleScroll(e, id)}
                        >
                            {text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default TableOfContents;
