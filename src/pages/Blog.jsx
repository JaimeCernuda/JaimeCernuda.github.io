import React, { useEffect, useState } from 'react';
import matter from 'gray-matter';
import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useData } from '../context/DataContext';

const Blog = () => {
    const { theme } = useTheme();
    const { cache, updateCache } = useData();
    const [headerInfo, setHeaderInfo] = useState(null);
    const [sidebarInfo, setSidebarInfo] = useState(null);
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [loading, setLoading] = useState(true);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 6;

    useEffect(() => {
        const fetchContent = async () => {
            if (cache.blog) {
                setHeaderInfo(cache.blog.headerInfo);
                setSidebarInfo(cache.blog.sidebarInfo);
                setPosts(cache.blog.posts);
                setFilteredPosts(cache.blog.posts);
                setLoading(false);
                return;
            }

            try {
                // 1. Fetch Manifest
                const res = await fetch('/content/blog.md');
                const text = await res.text();
                const { data } = matter(text);

                // 2. Fetch all posts
                const postPromises = data.posts.map(async (filename) => {
                    const postRes = await fetch(`/content/blog/${filename}`);
                    const postText = await postRes.text();
                    const { data: postData } = matter(postText);
                    return {
                        ...postData,
                        slug: filename.replace('.md', ''),
                        rawDate: new Date(postData.date) // For sorting if needed
                    };
                });

                const fetchedPosts = await Promise.all(postPromises);

                const blogData = {
                    headerInfo: data.header,
                    sidebarInfo: data.sidebar,
                    posts: fetchedPosts
                };

                setHeaderInfo(blogData.headerInfo);
                setSidebarInfo(blogData.sidebarInfo);
                setPosts(blogData.posts);
                setFilteredPosts(blogData.posts);
                updateCache('blog', blogData);
                setLoading(false);
            } catch (error) {
                console.error("Error loading blog content:", error);
                setLoading(false);
            }
        };

        fetchContent();
    }, [cache.blog, updateCache]);

    // Filter Logic
    useEffect(() => {
        if (!posts.length) return;

        let result = posts;

        // Search Filter
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(post =>
                post.title.toLowerCase().includes(lowerQuery) ||
                post.summary.toLowerCase().includes(lowerQuery)
            );
        }

        // Category Filter
        if (selectedCategory !== 'All') {
            result = result.filter(post => post.category === selectedCategory);
        }

        setFilteredPosts(result);
        setCurrentPage(1); // Reset to page 1 on filter change
    }, [searchQuery, selectedCategory, posts]);

    // Pagination Logic
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Derived Data
    const categories = posts.length ? ['All', ...new Set(posts.map(p => p.category))] : [];
    const popularPosts = posts.filter(p => p.popular).slice(0, 3); // Limit popular to 3

    if (loading) return <div className="p-20 text-center text-gray-500">Loading blog...</div>;

    // Dynamic Image Logic
    const headerImage = (theme === 'dark' && headerInfo.image_dark) ? headerInfo.image_dark : headerInfo.image;

    // Dynamic Gradient Logic
    const gradient = theme === 'dark'
        ? `linear-gradient(rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.8) 100%)`
        : `linear-gradient(rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.9) 100%)`;

    return (
        <div className="flex flex-1 justify-center py-8 w-full">
            <div className="flex flex-col max-w-[1600px] flex-1 w-full px-4 sm:px-6 lg:px-8">
                {/* Header / Featured */}
                <div className="mb-12">
                    <div
                        className="flex min-h-[320px] md:min-h-[400px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-2xl items-start justify-end px-6 pb-10 md:px-12 shadow-2xl relative overflow-hidden group"
                        style={{ backgroundImage: `${gradient}, url("${headerImage}")` }}
                    >
                        <div className="flex flex-col gap-3 text-left z-10 max-w-3xl">
                            <h1 className="text-gray-900 dark:text-white text-4xl md:text-6xl font-black leading-tight tracking-tight">
                                {headerInfo.title}
                            </h1>
                            <h2 className="text-gray-700 dark:text-gray-200 text-lg md:text-xl font-normal leading-relaxed max-w-2xl">
                                {headerInfo.subtitle}
                            </h2>
                        </div>
                        <div className="mt-6 z-10">
                            <a href="/rss.xml" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-3 rounded-lg font-bold transition-all shadow-lg shadow-primary/30">
                                <span className="material-symbols-outlined">rss_feed</span>
                                Subscribe via RSS
                            </a>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-12">
                    {/* Main Feed */}
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        {currentPosts.length > 0 ? (
                            <>
                                {currentPosts.map((post, index) => (
                                    <React.Fragment key={index}>
                                        <article className="relative flex flex-col gap-4 p-6 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 hover:border-primary/30 dark:hover:border-primary/30 hover:shadow-lg transition-all group">
                                            <Link to={`/blog/${post.slug}`} state={{ from: 'blog' }} className="absolute inset-0 z-10" aria-label={`Read ${post.title}`}></Link>
                                            <div className="flex items-center gap-3 text-xs md:text-sm text-gray-500 dark:text-gray-400 relative z-20 pointer-events-none">
                                                <div className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                                                    <span>{post.date}</span>
                                                </div>
                                                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                                <div className="flex items-center gap-1 text-primary font-bold uppercase tracking-wide text-xs">
                                                    {post.category}
                                                </div>
                                                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                                <span>{post.readTime}</span>
                                            </div>
                                            <Link to={`/blog/${post.slug}`} state={{ from: 'blog' }} className="group-hover:text-primary transition-colors relative z-20">
                                                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                                                    {post.title}
                                                </h3>
                                            </Link>
                                            <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3 relative z-20 pointer-events-none">
                                                {post.summary}
                                            </p>
                                            <Link to={`/blog/${post.slug}`} state={{ from: 'blog' }} className="inline-flex items-center gap-1 text-primary font-bold text-sm hover:underline mt-2 relative z-20">
                                                Read full article <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                            </Link>
                                        </article>
                                    </React.Fragment>
                                ))}

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center mt-8 gap-2">
                                        <button
                                            onClick={() => paginate(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <span className="material-symbols-outlined">chevron_left</span>
                                        </button>

                                        {[...Array(totalPages)].map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => paginate(i + 1)}
                                                className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-colors ${currentPage === i + 1
                                                    ? 'bg-primary text-white'
                                                    : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                    }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}

                                        <button
                                            onClick={() => paginate(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <span className="material-symbols-outlined">chevron_right</span>
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="p-10 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-surface-dark rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                                No posts found matching your criteria.
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:col-span-4 flex flex-col gap-8">
                        {/* Search */}
                        <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                            <h4 className="text-base font-bold text-gray-900 dark:text-white mb-4">Search</h4>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                                    <span className="material-symbols-outlined text-[20px]">search</span>
                                </span>
                                <input
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    placeholder="Search posts..."
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Profile */}
                        <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-full bg-gray-200 mb-4 overflow-hidden border-2 border-primary/20">
                                <img className="w-full h-full object-cover" src={sidebarInfo.profile.image} alt={sidebarInfo.profile.name} />
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white">{sidebarInfo.profile.name}</h4>
                            <p className="text-xs text-primary font-medium mb-3">{sidebarInfo.profile.role}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                                {sidebarInfo.profile.bio}
                            </p>
                            <Link to="/cv" className="text-sm font-semibold text-gray-900 dark:text-white hover:text-primary transition-colors flex items-center gap-1">
                                More about me <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                            </Link>
                        </div>

                        {/* Categories */}
                        <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                            <h4 className="text-base font-bold text-gray-900 dark:text-white mb-4">Categories</h4>
                            <div className="flex flex-wrap gap-2">
                                {categories.map((cat, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedCategory === cat
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Popular Reads */}
                        {popularPosts.length > 0 && (
                            <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                <h4 className="text-base font-bold text-gray-900 dark:text-white mb-4">Popular Reads</h4>
                                <div className="flex flex-col gap-4">
                                    {popularPosts.map((post, index) => (
                                        <Link key={index} to={`/blog/${post.slug}`} state={{ from: 'blog' }} className="group">
                                            <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-300 group-hover:text-primary transition-colors mb-1">{post.title}</h5>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{post.date}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default Blog;
