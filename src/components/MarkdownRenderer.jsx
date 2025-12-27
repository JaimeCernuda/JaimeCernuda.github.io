import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
            components={{
                img: ({ node, ...props }) => {
                    const alt = props.alt || '';
                    const [caption, size] = alt.split('|').map(s => s.trim());

                    return (
                        <figure className="my-8">
                            <img
                                {...props}
                                alt={caption}
                                style={size ? { maxWidth: size, width: '100%' } : undefined}
                                className="rounded-xl shadow-lg mx-auto"
                            />
                            {caption && (
                                <figcaption className="text-center text-gray-500 dark:text-gray-400 text-sm mt-3 italic">
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
