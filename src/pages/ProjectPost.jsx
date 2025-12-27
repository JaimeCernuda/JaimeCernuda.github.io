import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import matter from 'gray-matter';
import MarkdownRenderer from '../components/MarkdownRenderer';

import TableOfContents from '../components/TableOfContents';

const ProjectPost = () => {
    const { slug } = useParams();
    const location = useLocation();
    const [content, setContent] = useState(null);
    const [metadata, setMetadata] = useState(null);
    const [loading, setLoading] = useState(true);

    const backLink = location.state?.from === 'home' ? '/' : '/projects';
    const backText = location.state?.from === 'home' ? 'Back to Home' : 'Back to Projects';

    useEffect(() => {
        setLoading(true);
        fetch(`/content/projects/${slug}.md?t=${Date.now()}`)
            .then(res => {
                if (!res.ok) throw new Error('Project not found');
                return res.text();
            })
            .then(text => {
                const { data, content } = matter(text);
                setMetadata(data);
                setContent(content);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [slug]);

    if (loading) return <div className="p-20 text-center text-gray-500">Loading project...</div>;
    if (!content) return <div className="p-20 text-center text-gray-500">Project not found.</div>;

    const hasHeadings = content && /^#{1,3}\s/m.test(content);

    return (
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Link to={backLink} className="inline-flex items-center gap-2 text-primary font-bold hover:underline mb-6">
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                {backText}
            </Link>

            <div className="flex flex-col xl:flex-row gap-12 items-start">
                <TableOfContents content={content} />

                <article className={`prose prose-lg dark:prose-invert max-w-3xl mx-auto w-full ${hasHeadings ? 'xl:mx-0' : ''}`}>
                    <div className="mb-6 pb-10 not-prose">
                        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-3">
                            <span className="bg-primary/10 text-primary px-2 py-1 rounded font-bold text-xs uppercase tracking-wide">{metadata.category}</span>
                            <span>•</span>
                            <span>{metadata.year}</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight mb-3">
                            {metadata.title}
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-16">
                            {metadata.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {metadata.tags && metadata.tags.map((tag, i) => (
                                <span key={i} className="text-xs font-medium text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-surface-dark-lighter px-2 py-1 rounded border border-gray-200 dark:border-border-dark">{tag}</span>
                            ))}
                        </div>

                        <div className="flex gap-4">
                            <a href="https://github.com/JaimeCernuda" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors" aria-label="View on GitHub">
                                <svg className="w-6 h-6 flex-shrink-0" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12C2 16.42 5.743 20 10.207 20C10.707 20 11 19.793 11 19.5V17.39C8.03 18.03 7.4 16 7.4 16C6.945 14.845 6.288 14.537 6.288 14.537C5.318 13.875 6.362 13.89 6.362 13.89C7.433 13.965 8 15 8 15C8.953 16.633 10.498 16.16 11.105 15.887C11.202 15.197 11.478 14.725 11.783 14.458C9.413 14.19 6.92 13.273 6.92 9.18C6.92 8.013 7.337 7.053 8.025 6.3C7.917 6.03 7.55 4.943 8.13 3.47C8.13 3.47 9.027 3.183 11.07 4.567C11.923 4.33 12.837 4.213 13.75 4.213C14.663 4.213 15.577 4.33 16.43 4.567C18.473 3.183 19.37 3.47 19.37 3.47C19.95 4.943 19.583 6.03 19.475 6.3C20.163 7.053 20.58 8.013 20.58 9.18C20.58 13.283 18.083 14.187 15.707 14.45C16.087 14.777 16.427 15.423 16.427 16.413V19.5C16.427 19.793 16.717 20 17.22 20C21.68 20 25.423 16.42 25.423 12C25.423 6.477 20.947 2 15.423 2H12Z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    <div className="w-full h-px bg-gray-200 dark:bg-gray-800 my-12"></div>

                    <MarkdownRenderer content={content} />
                </article>
            </div>
        </div>
    );
};

export default ProjectPost;
