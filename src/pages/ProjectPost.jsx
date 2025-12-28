import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import matter from 'gray-matter';
import MarkdownRenderer from '../components/MarkdownRenderer';

import TableOfContents from '../components/TableOfContents';

const ProjectPost = () => {
    const { slug } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [content, setContent] = useState(null);
    const [metadata, setMetadata] = useState(null);
    const [loading, setLoading] = useState(true);

    const from = location.state?.from;
    const backLink = from ? (from === 'home' ? '/' : `/${from}`) : '/projects';
    const backLabel = from
        ? `Back to ${from.charAt(0).toUpperCase() + from.slice(1).replace('-', ' ')}`
        : 'Back to Projects';

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

    const handleBack = (e) => {
        if (from) {
            e.preventDefault();
            navigate(-1);
        }
    };

    return (
        <div id="top" className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Link
                to={backLink}
                onClick={handleBack}
                className="inline-flex items-center gap-2 text-primary font-bold hover:underline mb-6"
            >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                {backLabel}
            </Link>

            <div className="flex flex-col xl:flex-row gap-12 items-start">
                <TableOfContents content={content} title={metadata.title} />

                <article className={`max-w-3xl mx-auto w-full ${hasHeadings ? 'xl:mx-0' : ''}`}>
                    <div className="mb-8">
                        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-3">
                            <span className="bg-primary/10 text-primary px-2 py-1 rounded font-bold text-xs uppercase tracking-wide">{metadata.category}</span>
                            <span>•</span>
                            <span>{metadata.year}</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight mb-4">
                            {metadata.title}
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                            {metadata.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {metadata.tags && metadata.tags.map((tag, i) => (
                                <span key={i} className="text-xs font-medium text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-surface-dark-lighter px-2 py-1 rounded border border-gray-200 dark:border-border-dark">{tag}</span>
                            ))}
                        </div>

                        <div className="flex flex-wrap gap-4">
                            {metadata.links?.website && (
                                <a href={metadata.links.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-blue-600 text-white rounded-lg font-bold transition-colors shadow-sm shadow-primary/30 text-base">
                                    <span className="material-symbols-outlined">language</span>
                                    Project Website
                                </a>
                            )}
                            {(metadata.links?.code || metadata.github) && (
                                <a href={metadata.links?.code || metadata.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-bold transition-colors text-base">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2C6.47 2 2 6.47 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                                    </svg>
                                    View Code
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="w-full h-px bg-gray-200 dark:bg-gray-800 my-8"></div>

                    <div className="prose prose-lg dark:prose-invert max-w-none">
                        <MarkdownRenderer content={content} />
                    </div>
                </article>
            </div>
        </div>
    );
};

export default ProjectPost;
