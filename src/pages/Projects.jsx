import React, { useEffect, useState } from 'react';
import matter from 'gray-matter';
import { Link } from 'react-router-dom';

const Projects = () => {
    const [headerInfo, setHeaderInfo] = useState(null);
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All Topics');
    const [selectedYear, setSelectedYear] = useState('All Years');
    const [selectedStatus, setSelectedStatus] = useState('All Statuses');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
    const [loading, setLoading] = useState(true);

    // Pre-glob all content folders (Vite requires static paths)
    const allContentModules = import.meta.glob('/public/content/**/*.md', { query: '?raw', import: 'default' });

    useEffect(() => {
        const fetchContent = async () => {
            try {
                // Fetch header info and folder path
                const res = await fetch('/content/projects.md');
                const text = await res.text();
                const { data } = matter(text);
                setHeaderInfo(data.header);

                // Get folder name from markdown (e.g., "projects")
                const folderName = data.folder || 'projects';
                const folderPath = `/public/content/${folderName}/`;

                // Filter modules to only those in the specified folder
                const projectPaths = Object.keys(allContentModules).filter(path =>
                    path.startsWith(folderPath) && path !== `/public/content/${folderName}.md`
                );

                const projectPromises = projectPaths.map(async (path) => {
                    try {
                        const rawContent = await allContentModules[path]();
                        const { data: projectData } = matter(rawContent);
                        const filename = path.split('/').pop();
                        return {
                            ...projectData,
                            slug: filename.replace('.md', '')
                        };
                    } catch (e) {
                        console.error(`Error loading project from ${path}`, e);
                        return null;
                    }
                });

                const fetchedProjects = (await Promise.all(projectPromises)).filter(p => p !== null);
                setProjects(fetchedProjects);
                setFilteredProjects(fetchedProjects);
                setLoading(false);
            } catch (error) {
                console.error("Error loading projects:", error);
                setLoading(false);
            }
        };

        fetchContent();
    }, []);

    useEffect(() => {
        let result = projects;

        if (selectedCategory !== 'All Topics') {
            result = result.filter(p => p.category === selectedCategory);
        }

        if (selectedYear !== 'All Years') {
            result = result.filter(p => p.year === selectedYear);
        }

        if (selectedStatus !== 'All Statuses') {
            result = result.filter(p => p.status === selectedStatus);
        }

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(p => {
                if (!p) return false;
                const titleMatch = (p.title || '').toLowerCase().includes(lowerQuery);
                const descMatch = (p.description || '').toLowerCase().includes(lowerQuery);
                const tagMatch = Array.isArray(p.tags) && p.tags.some(t => t && t.toLowerCase().includes(lowerQuery));
                return titleMatch || descMatch || tagMatch;
            });
        }

        setFilteredProjects(result);
    }, [selectedCategory, selectedYear, selectedStatus, searchQuery, projects]);

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!headerInfo) return <div className="p-10 text-center">Error loading content.</div>;

    const featuredProject = projects.find(p => p.featured);

    const displayProjects = filteredProjects.filter(p => p !== featuredProject);

    const years = ['All Years', ...new Set(projects.map(p => p.year).filter(y => y))].sort().reverse();
    const categories = ['All Topics', ...new Set(projects.map(p => p.category).filter(c => c))];
    const statuses = ['All Statuses', 'On-going', 'Completed'];

    return (
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-10">
            {/* Header */}
            <div className="flex flex-col gap-3 max-w-2xl">
                <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em] text-gray-900 dark:text-white">{headerInfo.title}</h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg font-normal leading-normal">
                    {headerInfo.subtitle}
                </p>
            </div>

            {/* Featured Project */}
            {featuredProject && selectedCategory === 'All Topics' && selectedYear === 'All Years' && selectedStatus === 'All Statuses' && (
                <div className="flex flex-col items-stretch justify-start rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-surface-dark relative group">
                    <Link to={`/projects/${featuredProject.slug}`} state={{ from: 'projects' }} className="absolute inset-0 z-10" aria-label={`View ${featuredProject.title}`}></Link>
                    <div className="flex flex-col lg:flex-row relative z-20 pointer-events-none">
                        <div
                            className="w-full lg:w-2/5 h-64 lg:h-auto bg-cover bg-center relative"
                            style={{ backgroundImage: `url("${featuredProject.image}")` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-black/10"></div>
                            <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                                {featuredProject.label || 'Featured Project'}
                            </div>
                        </div>
                        <div className="flex w-full lg:w-3/5 flex-col justify-center gap-4 p-6 lg:p-8">
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">{featuredProject.venue}</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold leading-tight text-gray-900 dark:text-white">
                                <Link to={`/projects/${featuredProject.slug}`} state={{ from: 'projects' }} className="hover:text-primary transition-colors">
                                    {featuredProject.title}
                                </Link>
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
                                {featuredProject.description}
                            </p>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {featuredProject.status && (
                                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded border ${featuredProject.status === 'On-going' ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' : 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'}`}>
                                        {featuredProject.status}
                                    </span>
                                )}
                                {(featuredProject.tags || []).map((tag, i) => (
                                    <span key={i} className="text-xs font-medium text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-surface-dark-lighter px-2 py-1 rounded border border-gray-200 dark:border-border-dark">{tag}</span>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-3 mt-2 pointer-events-auto">
                                <a href="https://github.com/JaimeCernuda" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors" aria-label="View on GitHub">
                                    <svg className="w-10 h-10 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2C6.47 2 2 6.47 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="sticky top-16 z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm py-4 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-gray-200 dark:border-gray-800 lg:border-none lg:bg-transparent lg:backdrop-blur-none lg:static lg:p-0">
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
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="h-10 px-3 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="h-10 px-3 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {statuses.map(status => <option key={status} value={status}>{status}</option>)}
                        </select>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <span className="material-symbols-outlined text-[20px]">search</span>
                            </span>
                            <input
                                type="text"
                                placeholder="Search projects..."
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

            {/* Project Archive Grid */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayProjects.map((project, index) => (
                        <div key={index} className="group relative flex flex-col bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-xl overflow-hidden hover:border-primary/50 transition-colors">
                            <Link to={`/projects/${project.slug}`} state={{ from: 'projects' }} className="absolute inset-0 z-10" aria-label={`View case study for ${project.title}`}></Link>
                            <div className="h-48 overflow-hidden relative pointer-events-none">
                                {project.image ? (
                                    <>
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                                        <img
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                            src={project.image}
                                            alt={project.title}
                                        />
                                    </>
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-surface-dark-lighter">
                                        <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600">{project.icon || 'folder'}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col flex-1 p-5 gap-4 pointer-events-none">
                                <div className="flex items-start justify-between gap-4">
                                    {/* Title/Category/Year block */}
                                    <div className="flex-1">
                                        <h3 className="text-gray-900 dark:text-white text-xl font-bold mb-1 group-hover:text-primary transition-colors pointer-events-auto">
                                            <Link to={`/projects/${project.slug}`} state={{ from: 'projects' }} className="hover:underline">
                                                {project.title}
                                            </Link>
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{project.category} · {project.year}</p>
                                    </div>
                                    {/* GitHub Icon - Right side */}
                                    <a href="https://github.com/JaimeCernuda" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors flex-shrink-0 pointer-events-auto relative z-20" aria-label="View on GitHub">
                                        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 2C6.47 2 2 6.47 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                                        </svg>
                                    </a>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-3">
                                    {project.description}
                                </p>
                                <div className="mt-auto flex flex-wrap gap-2">
                                    {project.status && (
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${project.status === 'On-going' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'}`}>
                                            {project.status}
                                        </span>
                                    )}
                                    {(project.tags || []).map((tag, i) => (
                                        <span key={i} className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-surface-dark-lighter px-2 py-1 rounded border border-gray-200 dark:border-border-dark">{tag}</span>
                                    ))}
                                </div>
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
                                <th className="px-6 py-4">Project</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Links</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-surface-dark">
                            {displayProjects.map((project, index) => (
                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-surface-dark-lighter transition-colors">
                                    <td className="px-6 py-4 font-mono text-gray-500">{project.year}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900 dark:text-white mb-1">
                                            <Link to={`/projects/${project.slug}`} state={{ from: 'projects' }} className="hover:underline">
                                                {project.title}
                                            </Link>
                                        </div>
                                        <div className="text-gray-500 dark:text-gray-400 text-xs line-clamp-1">{project.description}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {project.status && (
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${project.status === 'On-going' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`}>
                                                {project.status}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-surface-dark-lighter text-gray-800 dark:text-gray-300">
                                            {project.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <a href="https://github.com/JaimeCernuda" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors" title="View on GitHub">
                                            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 2C6.47 2 2 6.47 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                                            </svg>
                                        </a>
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

export default Projects;
