import React, { useEffect, useState } from 'react';

const TableOfContents = ({ content }) => {
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
            if (line.trim().startsWith('```')) {
                inCodeBlock = !inCodeBlock;
                return;
            }
            if (inCodeBlock) return;

            const match = line.match(/^(#{1,3})\s+(.+)$/);
            if (match) {
                const level = match[1].length;
                const text = match[2].trim();
                // Generate ID compatible with rehype-slug (lowercase, remove special chars, replace spaces with dashes)
                const id = text
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '-');

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

        return () => observer.disconnect();
    }, [headings]);

    if (headings.length === 0) return null;

    return (
        <nav className="hidden xl:block sticky top-24 self-start w-64 pr-8 max-h-[calc(100vh-6rem)] overflow-y-auto">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">On this page</h4>
            <ul className="space-y-2 text-sm border-l border-gray-200 dark:border-gray-800">
                {headings.map(({ id, text, level }) => (
                    <li key={id}>
                        <a
                            href={`#${id}`}
                            className={`block pl-4 py-1 border-l-2 -ml-[2px] transition-colors ${activeId === id
                                    ? 'border-primary text-primary font-medium'
                                    : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                            style={{ paddingLeft: `${(level - 1) * 1}rem` }}
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                                setActiveId(id);
                            }}
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
