import React, { useEffect, useState } from 'react';
import matter from 'gray-matter';

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
    const [expandedAbstracts, setExpandedAbstracts] = useState({}); // { slug: boolean }

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
            result = result.filter(pub => pub.year === selectedYear);
        }

        if (selectedTag !== 'All Topics') {
            result = result.filter(pub => pub.tags && pub.tags.includes(selectedTag));
        }

        setFilteredPublications(result);
    }, [searchQuery, selectedYear, selectedTag, publications]);

    const toggleAbstract = (slug) => {
        setExpandedAbstracts(prev => ({
            ...prev,
            [slug]: !prev[slug]
        }));
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
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold leading-tight text-gray-900 dark:text-white">
                                {featuredPub.title}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed line-clamp-3">
                                {featuredPub.abstract.replace('# Abstract', '').trim()}
                            </p>
                            <div className="flex flex-wrap gap-3 mt-2">
                                {featuredPub.links?.pdf && (
                                    <a href={featuredPub.links.pdf} className="flex items-center justify-center gap-2 rounded-lg h-10 px-5 bg-primary hover:bg-blue-600 text-white text-sm font-bold transition-colors shadow-sm shadow-primary/30">
                                        <span className="material-symbols-outlined text-[18px]">description</span>
                                        <span>Read Paper</span>
                                    </a>
                                )}
                                {featuredPub.links?.code && (
                                    <a href={featuredPub.links.code} className="flex items-center justify-center gap-2 rounded-lg h-10 px-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white text-sm font-bold transition-colors">
                                        <svg className="w-[18px] h-[18px] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 2C6.47 2 2 6.47 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                                        </svg>
                                        <span>View Code</span>
                                    </a>
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
                        <div key={index} className="flex flex-col bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-xl overflow-hidden hover:border-primary/50 transition-colors p-6 gap-4">
                            <div className="flex justify-between items-start">
                                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">{pub.venue}</span>
                                <span className="text-xs font-mono text-gray-500">{pub.year}</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight mb-2">{pub.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 italic">{pub.authors}</p>
                            </div>

                            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-3">
                                <div className="flex flex-wrap gap-2">
                                    {pub.links?.pdf && (
                                        <a href={pub.links.pdf} className="flex items-center gap-1 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
                                            <span className="material-symbols-outlined text-[16px]">description</span> PDF
                                        </a>
                                    )}
                                    {pub.links?.code && (
                                        <a href={pub.links.code} className="flex items-center gap-1 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
                                            <svg className="w-[16px] h-[16px] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 2C6.47 2 2 6.47 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                                            </svg> Code
                                        </a>
                                    )}
                                    {pub.links?.slides && (
                                        <a href={pub.links.slides} className="flex items-center gap-1 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
                                            <span className="material-symbols-outlined text-[16px]">slideshow</span> Slides
                                        </a>
                                    )}
                                </div>
                                <button
                                    onClick={() => toggleAbstract(pub.slug)}
                                    className="flex items-center justify-between w-full text-xs font-medium text-gray-500 hover:text-primary transition-colors"
                                >
                                    <span>Abstract</span>
                                    <span className={`material-symbols-outlined text-[16px] transform transition-transform ${expandedAbstracts[pub.slug] ? 'rotate-180' : ''}`}>expand_more</span>
                                </button>
                                {expandedAbstracts[pub.slug] && (
                                    <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-surface-dark-lighter p-3 rounded-lg">
                                        {pub.abstract.replace('# Abstract', '').trim()}
                                    </div>
                                )}
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
                                        <div className="font-bold text-gray-900 dark:text-white mb-1">{pub.title}</div>
                                        <div className="text-gray-500 dark:text-gray-400 text-xs">{pub.authors}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                            {pub.venue}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-3">
                                            {pub.links?.pdf && (
                                                <a href={pub.links.pdf} className="text-gray-400 hover:text-primary transition-colors" title="PDF">
                                                    <span className="material-symbols-outlined">description</span>
                                                </a>
                                            )}
                                            {pub.links?.code && (
                                                <a href={pub.links.code} className="text-gray-400 hover:text-primary transition-colors" title="Code">
                                                    <svg className="w-[20px] h-[20px] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M12 2C6.47 2 2 6.47 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                                                    </svg>
                                                </a>
                                            )}
                                            {pub.links?.slides && (
                                                <a href={pub.links.slides} className="text-gray-400 hover:text-primary transition-colors" title="Slides">
                                                    <span className="material-symbols-outlined">slideshow</span>
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Publications;
