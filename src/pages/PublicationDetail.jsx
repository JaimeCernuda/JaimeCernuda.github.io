import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import matter from 'gray-matter';
import MarkdownRenderer from '../components/MarkdownRenderer';
import CitationModal from '../components/CitationModal';

const PublicationDetail = () => {
    const { slug } = useParams();
    const location = useLocation();
    const [content, setContent] = useState('');
    const [metadata, setMetadata] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toc, setToc] = useState([]);
    const [activeCitation, setActiveCitation] = useState(null);

    // Determine back link destination and label
    const backLink = location.state?.from === 'home' ? '/' : '/publications';
    const backLabel = location.state?.from === 'home' ? 'Back to Home' : 'Back to Publications';

    useEffect(() => {
        const fetchPublication = async () => {
            try {
                // Dynamic import for the specific publication file
                const module = await import(`../../public/content/publications/${slug}.md?raw`);
                const { data, content } = matter(module.default);
                setMetadata(data);
                setContent(content);

                // Extract headings for TOC
                const headings = content.match(/^##\s+(.+)$/gm);
                if (headings) {
                    const tocItems = headings.map(h => {
                        const title = h.replace(/^##\s+/, '');
                        const id = title.toLowerCase().replace(/[^\w]+/g, '-');
                        return { title, id };
                    });
                    setToc(tocItems);
                }

                setLoading(false);
            } catch (error) {
                console.error("Error loading publication:", error);
                setLoading(false);
            }
        };

        fetchPublication();
    }, [slug]);

    // Handle hash scrolling for citations
    useEffect(() => {
        if (!loading && location.hash) {
            const id = location.hash.replace('#', '');
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [loading, location.hash]);

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!metadata) return <div className="p-10 text-center">Publication not found</div>;

    const formatAuthors = (authors) => {
        if (!authors) return null;
        // Split authors by comma
        const authorList = authors.split(',').map(a => a.trim());
        return authorList.map((author, index) => (
            <span key={index}>
                {author.includes('Jaime Cernuda') ? (
                    <strong className="text-gray-900 dark:text-white font-bold">Jaime Cernuda</strong>
                ) : (
                    <span className="text-gray-600 dark:text-gray-400">{author}</span>
                )}
                {index < authorList.length - 1 && ", "}
            </span>
        ));
    };

    return (
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Link to={backLink} className="inline-flex items-center gap-2 text-primary hover:text-blue-600 transition-colors mb-8 font-medium">
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                {backLabel}
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Sidebar TOC */}
                <aside className="lg:col-span-3 order-2 lg:order-1">
                    <div className="sticky top-24 space-y-8">
                        {toc.length > 0 && (
                            <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 border border-gray-200 dark:border-border-dark">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">On this page</h3>
                                <nav className="space-y-2 text-sm border-l border-gray-200 dark:border-gray-800">
                                    {toc.map((item, index) => (
                                        <a
                                            key={index}
                                            href={`#${item.id}`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                                            }}
                                            className="block pl-4 py-1 border-l-2 -ml-[2px] border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300 transition-colors"
                                        >
                                            {item.title}
                                        </a>
                                    ))}
                                </nav>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Main Content */}
                <article className="lg:col-span-9 order-1 lg:order-2">
                    <header className="mb-12">
                        <div className="flex flex-wrap gap-3 mb-6">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-primary/10 text-primary">
                                {metadata.venue}
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                {metadata.year}
                            </span>
                            {metadata.type && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300">
                                    {metadata.type}
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight text-gray-900 dark:text-white mb-6">
                            {metadata.title}
                        </h1>

                        <div className="text-lg leading-relaxed mb-8">
                            {formatAuthors(metadata.authors)}
                        </div>

                        <div className="flex flex-wrap gap-4">
                            {metadata.links?.pdf && (
                                <a href={metadata.links.pdf} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-blue-600 text-white rounded-lg font-bold transition-colors shadow-sm shadow-primary/30">
                                    <span className="material-symbols-outlined">description</span>
                                    Read PDF
                                </a>
                            )}
                            {metadata.links?.code && (
                                <a href={metadata.links.code} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-bold transition-colors">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2C6.47 2 2 6.47 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                                    </svg>
                                    View Code
                                </a>
                            )}
                            {metadata.citation && (
                                <button
                                    onClick={() => setActiveCitation(metadata.citation)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-bold transition-colors"
                                >
                                    <span className="material-symbols-outlined">format_quote</span>
                                    Cite
                                </button>
                            )}
                        </div>
                    </header>

                    <div className="prose prose-lg dark:prose-invert max-w-none">
                        <MarkdownRenderer content={content} />
                    </div>
                </article>
            </div>

            {activeCitation && (
                <CitationModal citation={activeCitation} onClose={() => setActiveCitation(null)} />
            )}
        </div>
    );
};

export default PublicationDetail;
