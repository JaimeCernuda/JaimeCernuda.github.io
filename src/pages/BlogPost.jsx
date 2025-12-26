import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import matter from 'gray-matter';
import MarkdownRenderer from '../components/MarkdownRenderer';

const BlogPost = () => {
    const { slug } = useParams();
    const [content, setContent] = useState(null);
    const [metadata, setMetadata] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`/content/blog/${slug}.md?t=${Date.now()}`)
            .then(res => {
                if (!res.ok) throw new Error('Post not found');
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

    if (loading) return <div className="p-20 text-center text-gray-500">Loading post...</div>;
    if (!content) return <div className="p-20 text-center text-gray-500">Post not found.</div>;

    return (
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Link to="/blog" className="inline-flex items-center gap-2 text-primary font-bold hover:underline mb-8">
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Back to Blog
            </Link>

            <article className="prose prose-lg dark:prose-invert max-w-none">
                <div className="mb-8 not-prose">
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded font-bold text-xs uppercase tracking-wide">{metadata.category}</span>
                        <span>•</span>
                        <span>{metadata.date}</span>
                        <span>•</span>
                        <span>{metadata.readTime}</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight mb-4">
                        {metadata.title}
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                        {metadata.summary}
                    </p>
                </div>

                <div className="w-full h-px bg-gray-200 dark:bg-gray-800 my-8"></div>

                <MarkdownRenderer content={content} />
            </article>
        </div>
    );
};

export default BlogPost;
