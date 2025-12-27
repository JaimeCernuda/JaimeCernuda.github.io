import React, { useEffect, useState } from 'react';
import matter from 'gray-matter';
import { Link } from 'react-router-dom';

const Projects = () => {
    const [headerInfo, setHeaderInfo] = useState(null);
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await fetch('/content/projects.md');
                const text = await res.text();
                const { data } = matter(text);
                setHeaderInfo(data.header);

                const projectPromises = (data.projects || []).map(async (filename) => {
                    try {
                        const projectRes = await fetch(`/content/projects/${filename}`);
                        if (!projectRes.ok) return null;
                        const projectText = await projectRes.text();
                        const { data: projectData } = matter(projectText);
                        return {
                            ...projectData,
                            slug: filename.replace('.md', '')
                        };
                    } catch (e) {
                        console.error(`Error loading project ${filename}`, e);
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
        if (selectedCategory === 'All') {
            setFilteredProjects(projects);
        } else {
            setFilteredProjects(projects.filter(p => p.category === selectedCategory));
        }
    }, [selectedCategory, projects]);

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!headerInfo) return <div className="p-10 text-center">Error loading content.</div>;

    const featuredProject = projects.find(p => p.featured);

    const displayProjects = selectedCategory === 'All'
        ? filteredProjects.filter(p => p !== featuredProject)
        : filteredProjects;

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
            {featuredProject && selectedCategory === 'All' && (
                <div className="flex flex-col items-stretch justify-start rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-surface-dark">
                    <div className="flex flex-col lg:flex-row">
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
                                {featuredProject.title}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
                                {featuredProject.description}
                            </p>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {(featuredProject.tags || []).map((tag, i) => (
                                    <span key={i} className="text-xs font-medium text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-surface-dark-lighter px-2 py-1 rounded border border-gray-200 dark:border-border-dark">{tag}</span>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-3 mt-2">
                                <Link to={`/projects/${featuredProject.slug}`} className="flex items-center justify-center gap-2 rounded-lg h-10 px-5 bg-primary hover:bg-blue-600 text-white text-sm font-bold transition-colors shadow-sm shadow-primary/30">
                                    <span className="material-symbols-outlined text-[18px]">description</span>
                                    <span>View Details</span>
                                </Link>
                                <a href="https://github.com/JaimeCernuda" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-lg h-10 px-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white text-sm font-bold transition-colors">
                                    <span className="material-symbols-outlined text-[18px]">code</span>
                                    <span>View Repo</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="sticky top-16 z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm py-2 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-gray-200 dark:border-gray-800 lg:border-none lg:bg-transparent lg:backdrop-blur-none lg:static">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex gap-3 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                        {['All', 'AI/ML', 'Systems', 'HCI', 'Security'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg px-5 transition-colors ${selectedCategory === cat
                                    ? 'bg-primary text-white font-bold'
                                    : 'bg-gray-200 dark:bg-surface-dark-lighter hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium'
                                    }`}
                            >
                                <span className="text-sm">{cat}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between border-b border-gray-200 dark:border-border-dark pb-4">
                <h2 className="text-gray-900 dark:text-white text-2xl font-bold leading-tight">Project Archive</h2>
                <a href="https://github.com/JaimeCernuda" target="_blank" rel="noopener noreferrer" className="text-primary text-sm font-bold hover:underline">View GitHub Profile</a>
            </div>

            {/* Project Archive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayProjects.map((project, index) => (
                    <div key={index} className="group flex flex-col bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-xl overflow-hidden hover:border-primary/50 transition-colors">
                        <div className="h-48 overflow-hidden relative">
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
                        <div className="flex flex-col flex-1 p-5 gap-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-gray-900 dark:text-white text-xl font-bold mb-1 group-hover:text-primary transition-colors">{project.title}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{project.category} · {project.year}</p>
                                </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-3">
                                {project.description}
                            </p>
                            <div className="mt-auto flex flex-col gap-4">
                                <div className="flex flex-wrap gap-2">
                                    {(project.tags || []).map((tag, i) => (
                                        <span key={i} className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-surface-dark-lighter px-2 py-1 rounded">{tag}</span>
                                    ))}
                                </div>
                                <div className="flex items-center gap-4 pt-2 border-t border-gray-200 dark:border-border-dark">
                                    <Link to={`/projects/${project.slug}`} className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">article</span>
                                        Details
                                    </Link>
                                    <a href="https://github.com/JaimeCernuda" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">code</span>
                                        Code
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Projects;
