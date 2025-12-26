import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

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
        <div className="markdown-content">
            <ReactMarkdown>{content || fetchedContent}</ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;
