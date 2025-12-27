import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import matter from 'gray-matter';
import MarkdownRenderer from '../components/MarkdownRenderer';

import TableOfContents from '../components/TableOfContents';

const ProjectPost = () => {
    const { slug } = useParams();
    const [content, setContent] = useState(null);
    const [metadata, setMetadata] = useState(null);
    const [loading, setLoading] = useState(true);

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
            <Link to="/projects" className="inline-flex items-center gap-2 text-primary font-bold hover:underline mb-6">
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Back to Projects
            </Link>

            <div className="flex flex-col xl:flex-row gap-12 items-start">
                <TableOfContents content={content} />

                <article className={`prose prose-lg dark:prose-invert max-w-3xl mx-auto w-full ${hasHeadings ? 'xl:mx-0' : ''}`}>
                    <div className="mb-6 not-prose">
                        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-3">
                            <span className="bg-primary/10 text-primary px-2 py-1 rounded font-bold text-xs uppercase tracking-wide">{metadata.category}</span>
                            <span>•</span>
                            <span>{metadata.year}</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight mb-3">
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

                        <div className="flex gap-4">
                            <a href="https://github.com/JaimeCernuda" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-lg h-10 px-5 bg-primary hover:bg-blue-600 text-white text-sm font-bold transition-colors shadow-sm shadow-primary/30">
                                <span className="material-symbols-outlined text-[18px]">code</span>
                                <span>View Code</span>
                            </a>
                        </div>
                    </div>

                    <div className="w-full h-px bg-gray-200 dark:bg-gray-800 my-6"></div>

                    <MarkdownRenderer content={content} />
                </article>
            </div>
        </div>
    );
};

export default ProjectPost;
