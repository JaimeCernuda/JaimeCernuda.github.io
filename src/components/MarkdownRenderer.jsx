import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';

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

    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSlug]}
            components={{
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
