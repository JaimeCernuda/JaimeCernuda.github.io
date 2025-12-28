import React, { useEffect, useState } from 'react';
import matter from 'gray-matter';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

const Home = () => {
  const [heroData, setHeroData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [newsData, setNewsData] = useState([]);
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [selectedPublications, setSelectedPublications] = useState([]);
  const [featuredPublication, setFeaturedPublication] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pre-glob all content folders
  const allPubModules = import.meta.glob('/public/content/publications/*.md', { query: '?raw', import: 'default' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Home Data (Hero & Stats)
        const homeRes = await fetch('/content/home.md');
        const homeText = await homeRes.text();
        const { data: homeData } = matter(homeText);
        setHeroData(homeData.hero);
        setStatsData(homeData.stats);

        // 2. Fetch News Data
        const newsRes = await fetch('/content/news.md');
        const newsText = await newsRes.text();
        const { data: newsContent } = matter(newsText);
        setNewsData(newsContent.news || []);

        // 3. Fetch Featured Projects (from home.md references)
        const projectPromises = (homeData.featured_projects || []).map(async (filename) => {
          try {
            const res = await fetch(`/content/projects/${filename}`);
            if (!res.ok) return null;
            const text = await res.text();
            const { data } = matter(text);
            return { ...data, slug: filename.replace('.md', '') };
          } catch (e) {
            console.error(`Error loading project ${filename}`, e);
            return null;
          }
        });
        const projects = (await Promise.all(projectPromises)).filter(p => p !== null);
        setFeaturedProjects(projects);

        // 3.5 Fetch Featured Publication
        if (homeData.featured_publication) {
          const slug = homeData.featured_publication;
          // Find the path for this slug
          const pubPath = Object.keys(allPubModules).find(path => path.includes(slug));
          if (pubPath) {
            try {
              const rawContent = await allPubModules[pubPath]();
              const { data } = matter(rawContent);
              setFeaturedPublication({ ...data, slug });
            } catch (e) {
              console.error("Error loading featured publication", e);
            }
          }
        }

        // 4. Fetch All Publications for "Selected Publications" section (dynamic)
        const pubPaths = Object.keys(allPubModules).filter(path => !path.endsWith('publications.md'));

        const pubPromises = pubPaths.map(async (path) => {
          try {
            const rawContent = await allPubModules[path]();
            const { data } = matter(rawContent);
            const filename = path.split('/').pop();
            return { ...data, slug: filename.replace('.md', '') };
          } catch (e) {
            console.error(`Error loading publication ${path}`, e);
            return null;
          }
        });

        const allPubs = (await Promise.all(pubPromises)).filter(p => p !== null);

        // Filter for specific publications: Jarvis, HStream, HFlow, Hades
        const selectedSlugs = ['cernuda-2024-jarvis-3b52', 'cernuda-2024-hstream-3043', 'cernuda-2021-hflow-2f5b', 'cernuda-2024-hades-e18c'];
        // Also support short slugs if they are used
        const selectedShortSlugs = ['jarvis', 'hstream', 'hflow', 'hades'];

        const filteredPubs = allPubs.filter(pub =>
          selectedSlugs.includes(pub.slug) || selectedShortSlugs.includes(pub.slug)
        );

        // Sort by year descending
        filteredPubs.sort((a, b) => b.year - a.year);

        setSelectedPublications(filteredPubs);

        setLoading(false);
      } catch (error) {
        console.error("Error loading home content:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-20 text-center text-gray-500">Loading content...</div>;
  if (!heroData) return <div className="p-20 text-center text-gray-500">Error loading content.</div>;

  const formatAuthors = (authors) => {
    if (!authors) return null;
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
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative pt-10 pb-12 lg:pt-20 lg:pb-24 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto w-full">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 flex flex-col gap-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-light border border-gray-300 w-fit dark:bg-surface-dark dark:border-gray-800">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs font-medium text-gray-600 tracking-wide uppercase dark:text-gray-300">{heroData.status}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
              {heroData.title}
            </h1>
            <div className="text-lg sm:text-xl text-gray-600 leading-relaxed dark:text-gray-400 prose dark:prose-invert max-w-none">
              <ReactMarkdown>{heroData.subtitle}</ReactMarkdown>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-6 mt-6 text-gray-500 dark:text-gray-400">
              {heroData.social_links && heroData.social_links.map((link, index) => (
                <a key={index} href={link.url} target={link.url.startsWith('http') ? "_blank" : undefined} rel={link.url.startsWith('http') ? "noopener noreferrer" : undefined} className="flex items-center gap-2 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-xl">{link.icon}</span>
                  <span className="text-sm font-medium">{link.name}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 w-full flex justify-center lg:justify-end">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-full lg:h-auto lg:aspect-square max-w-sm rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 group border-4 border-white dark:border-surface-dark">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url("${heroData.image}")` }}
              >
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-gray-200 dark:border-border-dark bg-surface-light-lighter dark:bg-surface-dark/30 py-8">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
            {statsData && statsData.map((stat, index) => (
              <div key={index} className="flex flex-col gap-0.5">
                <p className="text-2xl sm:text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Grid: Projects/Pubs (Left) + News (Right) */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* LEFT COLUMN: Projects & Publications */}
          <div className="lg:col-span-8 flex flex-col gap-16">

            {/* Featured Projects */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Featured Projects</h2>
                </div>
                <Link to="/projects" className="hidden sm:flex items-center text-sm font-bold text-primary hover:underline">
                  View All <span className="material-symbols-outlined text-lg ml-1">arrow_forward</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredProjects.map((project, index) => (
                  <div key={index} className="group flex flex-col bg-surface-light dark:bg-surface-dark rounded-lg overflow-hidden border border-gray-200 dark:border-border-dark hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 relative">
                    {/* Main Card Link - z-0 to sit behind content but capture clicks on empty spaces */}
                    <Link to={`/projects/${project.slug}`} state={{ from: 'home' }} className="absolute inset-0 z-0" aria-label={`View case study for ${project.title}`}></Link>

                    <div
                      className="h-48 w-full bg-cover bg-center relative z-10 pointer-events-none"
                      style={{ backgroundImage: `url("${project.image}")` }}
                    >
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all"></div>
                    </div>
                    <div className="flex flex-col flex-1 p-5 relative z-10 pointer-events-none">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {project.tags && project.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${i === 0 ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors">
                        {/* Title is visually part of the card, clicks pass through to the main link due to pointer-events-none on parent, 
                             but we can also make it explicit if needed. Since parent is pointer-events-none, we don't need a nested link unless we want specific behavior. 
                             Actually, keeping it simple: clicks pass through to the absolute link. */}
                        {project.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 flex-1">
                        {project.description}
                      </p>

                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Publication */}
            {featuredPublication && (
              <div className="mb-16">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Research</h2>
                </div>
                <div className="group relative bg-surface-light dark:bg-surface-dark rounded-2xl overflow-hidden border border-gray-200 dark:border-border-dark shadow-lg hover:shadow-xl transition-all">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="h-64 md:h-auto bg-white dark:bg-gray-800 flex items-center justify-center p-8 border-b md:border-b-0 md:border-r border-gray-200 dark:border-border-dark">
                      <img
                        src="/images/publications/hstream/figure3.png"
                        alt="HStream Architecture"
                        className="max-w-full max-h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-8 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">{featuredPublication.venue}</span>
                        <span className="text-xs font-mono text-gray-500">{featuredPublication.year}</span>
                      </div>
                      <Link to={`/publications/${featuredPublication.slug}`} state={{ from: 'home' }}>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 leading-tight group-hover:text-primary transition-colors">
                          {featuredPublication.title}
                        </h3>
                      </Link>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-3">
                        {formatAuthors(featuredPublication.authors)}
                      </div>
                      <div className="flex gap-4">
                        <Link
                          to={`/publications/${featuredPublication.slug}`}
                          state={{ from: 'home' }}
                          className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-blue-600 transition-colors"
                        >
                          Read Paper <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Selected Publications */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Publications</h2>
                <Link to="/publications" className="hidden sm:flex items-center text-sm font-bold text-primary hover:underline">
                  View All <span className="material-symbols-outlined text-lg ml-1">arrow_forward</span>
                </Link>
              </div>
              <div className="flex flex-col gap-4">
                {selectedPublications.map((pub, index) => (
                  <div key={index} className="group relative p-5 rounded-lg border border-gray-200 dark:border-border-dark bg-surface-light dark:bg-surface-dark hover:border-primary/40 transition-all flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                    <Link to={`/publications/${pub.slug}`} className="absolute inset-0 z-10" aria-label={`View details for ${pub.title}`}></Link>
                    <div className="relative z-20 pointer-events-none">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">{pub.venue}</span>
                        <span className="text-xs font-mono text-gray-500">{pub.year}</span>
                      </div>
                      <Link
                        to={`/publications/${pub.slug}`}
                        state={{ from: 'home' }}
                        className="block pointer-events-auto"
                      >
                        <h4 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors leading-snug mb-1">
                          {pub.title}
                        </h4>
                      </Link>
                      <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                        {formatAuthors(pub.authors)}
                      </div>
                    </div>
                    <div className="flex gap-3 shrink-0 relative z-20 pointer-events-auto">
                      <Link
                        to={`/publications/${pub.slug}`}
                        state={{ from: 'home' }}
                        className="text-xs font-bold text-gray-500 hover:text-primary transition-colors flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">article</span> Read Paper
                      </Link>
                      {pub.links?.pdf && (
                        <a href={pub.links.pdf} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-gray-500 hover:text-primary transition-colors flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">description</span> PDF
                        </a>
                      )}
                      {pub.links?.code && (
                        <a href={pub.links.code} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-gray-500 hover:text-primary transition-colors flex items-center gap-1">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.47 2 2 6.47 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                          </svg>
                          Code
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: News */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-border-dark p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Latest News</h2>
                </div>

                <div className="flex flex-col gap-6 relative">
                  {/* Vertical Line */}
                  <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200 dark:bg-gray-800"></div>

                  {(() => {
                    const displayedNews = newsData.slice(0, 8);
                    let lastYear = null;

                    return displayedNews.map((item, index) => {
                      // Extract year from date (assuming format like "Oct 2025" or "2025-10-10")
                      // Adjust regex based on actual date format. Assuming "Month Year" or similar where Year is 4 digits.
                      const yearMatch = item.date ? item.date.match(/\d{4}/) : null;
                      const currentYear = yearMatch ? yearMatch[0] : null;
                      const showYearSeparator = currentYear && currentYear !== lastYear;
                      if (currentYear) lastYear = currentYear;

                      return (
                        <React.Fragment key={index}>
                          {showYearSeparator && (
                            <div className="relative pl-6 flex items-center gap-3 mb-2 mt-2 first:mt-0">
                              <span className="text-xs font-bold text-gray-400 dark:text-gray-500">{currentYear}</span>
                              <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1"></div>
                            </div>
                          )}
                          <div className="relative pl-6">
                            <div className="absolute left-0 top-1.5 w-3.5 h-3.5 bg-white dark:bg-surface-dark border-2 border-primary rounded-full z-10"></div>
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block uppercase tracking-wider">{item.date}</span>
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1 leading-tight">
                              {item.link && item.link !== '#' ? (
                                <a href={item.link} className="hover:text-primary transition-colors">{item.title}</a>
                              ) : (
                                item.title
                              )}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </React.Fragment>
                      );
                    });
                  })()}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
                  <Link to="/news" state={{ from: 'home' }} className="text-xs font-bold text-primary hover:underline">View Archive</Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Home;
