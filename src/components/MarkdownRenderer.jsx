import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeRaw from 'rehype-raw';

const MarkdownRenderer = ({ fileName, content }) => {
    const [fetchedContent, setFetchedContent] = useState('');

    useEffect(() => {
        if (content) return;
        if (!fileName) return;

        fetch(`/content/${fileName}.md`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.text();
            })
            .then((text) => setFetchedContent(text))
            .catch((err) => console.error('Error fetching markdown:', err));
    }, [fileName, content]);

    // Helper for consistent slug generation (must match PublicationDetail.jsx)
    const generateSlug = (text) => {
        if (!text) return '';
        // Handle React children if they are strings, otherwise ignore
        const stringText = typeof text === 'string' ? text :
            Array.isArray(text) ? text.map(t => typeof t === 'string' ? t : '').join('') : '';

        return stringText
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]} // Removed rehypeSlug to use custom ID generation
            components={{
                h1: ({ node, children, ...props }) => <h1 {...props} className="text-3xl font-bold mt-10 mb-4 text-gray-900 dark:text-white scroll-mt-24">{children}</h1>,
                h2: ({ node, children, ...props }) => {
                    // Generate ID from children text
                    const id = generateSlug(children);
                    return <h2 id={id} {...props} className="text-2xl font-bold mt-8 mb-3 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 scroll-mt-24">{children}</h2>
                },
                h3: ({ node, children, ...props }) => {
                    // Generate ID from children text for TOC support
                    const id = generateSlug(children);
                    return <h3 id={id} {...props} className="text-xl font-bold mt-6 mb-2 text-gray-900 dark:text-white scroll-mt-24">{children}</h3>
                },
                p: ({ node, children }) => {
                    // Check if any child is an image
                    const hasImage = node.children.some(child => child.tagName === 'img');
                    if (hasImage) {
                        return <>{children}</>;
                    }
                    return <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">{children}</p>;
                },
                img: ({ node, ...props }) => {
                    const alt = props.alt || '';
                    const [caption, size, align] = alt.split('|').map(s => s.trim());

                    let alignClass = "mx-auto"; // Default center
                    if (align === 'left') alignClass = "mr-auto";
                    if (align === 'right') alignClass = "ml-auto";

                    return (
                        <figure className="my-8">
                            <img
                                {...props}
                                alt={caption}
                                style={size ? { maxWidth: size, width: '100%' } : undefined}
                                className={`rounded-xl shadow-lg ${alignClass}`}
                            />
                            {caption && (
                                <figcaption className={`text-gray-500 dark:text-gray-400 text-sm mt-3 italic ${align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center'}`}>
                                    {caption}
                                </figcaption>
                            )}
                        </figure>
                    );
                }
            }}
        >
            {content || fetchedContent}
        </ReactMarkdown>
    );
};

export default MarkdownRenderer;
