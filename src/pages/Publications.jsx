import React, { useEffect, useState } from 'react';
import matter from 'gray-matter';
import { Link } from 'react-router-dom';

const CitationModal = ({ citation, onClose }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(citation);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-surface-dark rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Cite this paper</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="p-6">
                    <div className="relative">
                        <pre className="bg-gray-50 dark:bg-surface-dark-lighter p-4 rounded-lg text-sm font-mono text-gray-700 dark:text-gray-300 overflow-x-auto whitespace-pre-wrap border border-gray-200 dark:border-gray-700">
                            {citation}
                        </pre>
                        <button
                            onClick={handleCopy}
                            className="absolute top-2 right-2 p-2 bg-white dark:bg-surface-dark rounded-md shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                            title="Copy to clipboard"
                        >
                            <span className={`material-symbols-outlined text-[18px] ${copied ? 'text-green-500' : 'text-gray-500 group-hover:text-primary'}`}>
                                {copied ? 'check' : 'content_copy'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Publications = () => {
    const [headerInfo, setHeaderInfo] = useState(null);
    const [publications, setPublications] = useState([]);
    const [filteredPublications, setFilteredPublications] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedYear, setSelectedYear] = useState('All Years');
    const [selectedTag, setSelectedTag] = useState('All Topics');

    // View State
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
    const [activeCitation, setActiveCitation] = useState(null);

    // Pre-glob all content folders (Vite requires static paths)
    const allContentModules = import.meta.glob('/public/content/**/*.md', { query: '?raw', import: 'default' });

    useEffect(() => {
        const fetchContent = async () => {
            try {
                // Fetch header info and folder path
                const res = await fetch('/content/publications.md');
                const text = await res.text();
                const { data } = matter(text);
                setHeaderInfo(data.header);

                // Get folder name from markdown (e.g., "publications")
                const folderName = data.folder || 'publications';
                const folderPath = `/public/content/${folderName}/`;

                // Filter modules to only those in the specified folder
                const pubPaths = Object.keys(allContentModules).filter(path =>
                    path.startsWith(folderPath) && path !== `/public/content/${folderName}.md`
                );

                const pubPromises = pubPaths.map(async (path) => {
                    try {
                        const rawContent = await allContentModules[path]();
                        const { data: pubData, content: pubContent } = matter(rawContent);
                        const filename = path.split('/').pop();
                        return {
                            ...pubData,
                            slug: filename.replace('.md', ''),
                            abstract: pubContent // Store abstract content
                        };
                    } catch (e) {
                        console.error(`Error loading publication from ${path}`, e);
                        return null;
                    }
                });

                const fetchedPubs = (await Promise.all(pubPromises)).filter(p => p !== null);

                // Sort by year descending
                fetchedPubs.sort((a, b) => b.year - a.year);

                setPublications(fetchedPubs);
                setFilteredPublications(fetchedPubs);
                setLoading(false);
            } catch (error) {
                console.error("Error loading publications:", error);
                setLoading(false);
            }
        };

        fetchContent();
    }, []);

    // Filter Logic
    useEffect(() => {
        let result = publications;

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(pub => {
                if (!pub) return false;
                const titleMatch = (pub.title || '').toLowerCase().includes(lowerQuery);
                const authorsMatch = (pub.authors || '').toLowerCase().includes(lowerQuery);
                const venueMatch = (pub.venue || '').toLowerCase().includes(lowerQuery);
                return titleMatch || authorsMatch || venueMatch;
            });
        }

        if (selectedYear !== 'All Years') {
            // Ensure strict comparison works by converting to string if needed
            result = result.filter(pub => String(pub.year) === String(selectedYear));
        }

        if (selectedTag !== 'All Topics') {
            result = result.filter(pub => pub.tags && pub.tags.includes(selectedTag));
        }

        setFilteredPublications(result);
    }, [searchQuery, selectedYear, selectedTag, publications]);

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

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    const years = ['All Years', ...new Set(publications.map(p => p.year).filter(y => y))].sort().reverse();
    const tags = ['All Topics', ...new Set(publications.flatMap(p => p.tags || []).filter(t => t))];

    const featuredPub = publications.find(p => p.featured);

    return (
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-10">
            {/* Header */}
            <div className="flex flex-col gap-3 max-w-2xl">
                <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em] text-gray-900 dark:text-white">{headerInfo.title}</h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg font-normal leading-normal">
                    {headerInfo.subtitle}
                </p>
            </div>

            {/* Featured Publication */}
            {featuredPub && (
                <div className="flex flex-col items-stretch justify-start rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-surface-dark">
                    <div className="flex flex-col lg:flex-row">
                        <div className="w-full lg:w-2/5 h-64 lg:h-auto bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center p-8 relative">
                            <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                                Featured Paper
                            </div>
                            <span className="material-symbols-outlined text-9xl text-primary/40">article</span>
                        </div>
                        <div className="flex w-full lg:w-3/5 flex-col justify-center gap-4 p-6 lg:p-8">
                            <div className="flex items-center gap-2">
                                <span className="text-primary font-bold text-sm">{featuredPub.venue}</span>
                                <span className="text-gray-400 text-sm">•</span>
                                <span className="text-gray-500 text-sm">{featuredPub.year}</span>
                            </div>
                            <Link to={`/publications/${featuredPub.slug}`} className="group">
                                <h2 className="text-2xl md:text-3xl font-bold leading-tight text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                                    {featuredPub.title}
                                </h2>
                            </Link>
                            <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed line-clamp-3">
                                {featuredPub.abstract.split('## Full Paper')[0].replace('# Abstract', '').trim()}
                            </p>
                            <div className="flex flex-wrap gap-3 mt-2">
                                <Link to={`/publications/${featuredPub.slug}`} className="flex items-center justify-center gap-2 rounded-lg h-10 px-5 bg-primary hover:bg-blue-600 text-white text-sm font-bold transition-colors shadow-sm shadow-primary/30">
                                    <span>Read Paper</span>
                                </Link>
                                {featuredPub.links?.pdf && (
                                    <a href={featuredPub.links.pdf} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-lg h-10 px-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white text-sm font-bold transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">description</span>
                                        <span>PDF</span>
                                    </a>
                                )}
                                {featuredPub.citation && (
                                    <button onClick={() => setActiveCitation(featuredPub.citation)} className="flex items-center justify-center gap-2 rounded-lg h-10 px-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white text-sm font-bold transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">format_quote</span>
                                        <span>Cite</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="flex flex-col gap-4 sticky top-16 z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm py-4 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-gray-200 dark:border-gray-800 lg:static lg:border-none lg:bg-transparent lg:backdrop-blur-none lg:p-0">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="h-10 px-3 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {years.map(year => <option key={year} value={year}>{year}</option>)}
                        </select>
                        <select
                            value={selectedTag}
                            onChange={(e) => setSelectedTag(e.target.value)}
                            className="h-10 px-3 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {tags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
                        </select>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <span className="material-symbols-outlined text-[20px]">search</span>
                            </span>
                            <input
                                type="text"
                                placeholder="Search papers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-10 pl-10 pr-4 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div className="flex bg-gray-100 dark:bg-surface-dark-lighter p-1 rounded-lg border border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-surface-dark shadow-sm text-primary' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                                <span className="material-symbols-outlined text-[20px]">grid_view</span>
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-white dark:bg-surface-dark shadow-sm text-primary' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                                <span className="material-symbols-outlined text-[20px]">table_rows</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPublications.map((pub, index) => (
                        <div key={index} className="flex flex-col bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-xl overflow-hidden hover:border-primary/50 transition-colors p-6 gap-4 group">
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{pub.venue}</span>
                                    {pub.type && <span className="text-xs text-gray-500">{pub.type}</span>}
                                </div>
                                <span className="text-xs font-mono text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{pub.year}</span>
                            </div>

                            <Link to={`/publications/${pub.slug}`} className="block">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight mb-2 group-hover:text-primary transition-colors">
                                    {pub.title}
                                </h3>
                            </Link>

                            <div className="text-sm leading-relaxed">
                                {formatAuthors(pub.authors)}
                            </div>

                            {pub.tags && (
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                    {pub.tags.slice(0, 3).map(tag => (
                                        <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                            {tag}
                                        </span>
                                    ))}
                                    {pub.tags.length > 3 && (
                                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                            +{pub.tags.length - 3}
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                <div className="flex gap-3">
                                    {pub.links?.pdf && (
                                        <a href={pub.links.pdf} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors" title="PDF">
                                            <span className="material-symbols-outlined text-[20px]">description</span>
                                        </a>
                                    )}
                                    {pub.links?.code && (
                                        <a href={pub.links.code} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors" title="Code">
                                            <svg className="w-[20px] h-[20px]" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 2C6.47 2 2 6.47 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                                            </svg>
                                        </a>
                                    )}
                                    {pub.citation && (
                                        <button onClick={() => setActiveCitation(pub.citation)} className="text-gray-400 hover:text-primary transition-colors" title="Cite">
                                            <span className="material-symbols-outlined text-[20px]">format_quote</span>
                                        </button>
                                    )}
                                </div>
                                <Link to={`/publications/${pub.slug}`} className="text-xs font-bold text-primary hover:underline">
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-border-dark">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-surface-dark-lighter text-gray-900 dark:text-white font-bold uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4">Year</th>
                                <th className="px-6 py-4">Title & Authors</th>
                                <th className="px-6 py-4">Venue</th>
                                <th className="px-6 py-4">Links</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-surface-dark">
                            {filteredPublications.map((pub, index) => (
                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-surface-dark-lighter transition-colors">
                                    <td className="px-6 py-4 font-mono text-gray-500">{pub.year}</td>
                                    <td className="px-6 py-4">
                                        <Link to={`/publications/${pub.slug}`} className="font-bold text-gray-900 dark:text-white mb-1 hover:text-primary block">
                                            {pub.title}
                                        </Link>
                                        <div className="text-gray-500 dark:text-gray-400 text-xs">
                                            {formatAuthors(pub.authors)}
                                        </div>
                                        {pub.tags && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {pub.tags.slice(0, 3).map(tag => (
                                                    <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">
                                            {pub.venue}
                                        </span>
                                        {pub.type && <div className="text-xs text-gray-500 mt-1">{pub.type}</div>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-3">
                                            {pub.links?.pdf && (
                                                <a href={pub.links.pdf} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors" title="PDF">
                                                    <span className="material-symbols-outlined">description</span>
                                                </a>
                                            )}
                                            {pub.links?.code && (
                                                <a href={pub.links.code} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors" title="Code">
                                                    <svg className="w-[20px] h-[20px]" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M12 2C6.47 2 2 6.47 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                                                    </svg>
                                                </a>
                                            )}
                                            {pub.citation && (
                                                <button onClick={() => setActiveCitation(pub.citation)} className="text-gray-400 hover:text-primary transition-colors" title="Cite">
                                                    <span className="material-symbols-outlined">format_quote</span>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeCitation && (
                <CitationModal citation={activeCitation} onClose={() => setActiveCitation(null)} />
            )}
        </div>
    );
};

export default Publications;
