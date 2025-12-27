import React, { useEffect, useState } from 'react';
import matter from 'gray-matter';
import { Link } from 'react-router-dom';
import MarkdownRenderer from '../components/MarkdownRenderer';

const Home = () => {
  const [heroData, setHeroData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [newsData, setNewsData] = useState([]);
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [selectedPublications, setSelectedPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsLimit, setNewsLimit] = useState(10); // Default limit

  const leftColumnRef = React.useRef(null);
  const newsItemRef = React.useRef(null);

  useEffect(() => {
    const calculateNewsLimit = () => {
      if (leftColumnRef.current && newsItemRef.current) {
        const leftHeight = leftColumnRef.current.offsetHeight;
        // Estimate news container header/footer height (approx 100px) + item height
        // This is a rough estimation. A better way is to measure available height.
        // Let's try to fit as many items as possible within leftHeight.

        // Assuming average item height from the first item if available, or a fixed estimate (e.g., 80px)
        const itemHeight = newsItemRef.current.offsetHeight || 80;
        const containerPadding = 100; // Title + Archive link + padding
        const availableHeight = leftHeight - containerPadding;

        const calculatedLimit = Math.max(3, Math.floor(availableHeight / itemHeight));
        setNewsLimit(calculatedLimit);
      }
    };

    // Run calculation after data load and on resize
    if (!loading && featuredProjects.length > 0 && selectedPublications.length > 0) {
      // Small timeout to allow rendering
      setTimeout(calculateNewsLimit, 100);
    }

    window.addEventListener('resize', calculateNewsLimit);
    return () => window.removeEventListener('resize', calculateNewsLimit);
  }, [loading, featuredProjects, selectedPublications]);

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

        // 4. Fetch Selected Publications (from home.md references)
        const pubPromises = (homeData.selected_publications || []).map(async (filename) => {
          try {
            const res = await fetch(`/content/publications/${filename}`);
            if (!res.ok) return null;
            const text = await res.text();
            const { data } = matter(text);
            return { ...data, slug: filename.replace('.md', '') };
          } catch (e) {
            console.error(`Error loading publication ${filename}`, e);
            return null;
          }
        });
        const pubs = (await Promise.all(pubPromises)).filter(p => p !== null);
        setSelectedPublications(pubs);

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
              <MarkdownRenderer content={heroData.subtitle} />
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
          <div className="lg:col-span-8 flex flex-col gap-16" ref={leftColumnRef}>

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
                    <Link to={`/projects/${project.slug}`} className="absolute inset-0 z-10" aria-label={`View case study for ${project.title}`}></Link>
                    <div
                      className="h-48 w-full bg-cover bg-center relative"
                      style={{ backgroundImage: `url("${project.image}")` }}
                    >
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all"></div>
                    </div>
                    <div className="flex flex-col flex-1 p-5">
                      <div className="flex flex-wrap gap-2 mb-2 relative z-20 pointer-events-none">
                        {project.tags && project.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${i === 0 ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors">{project.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 flex-1">
                        {project.description}
                      </p>
                      <span className="inline-flex items-center text-xs font-bold text-primary hover:text-gray-900 dark:hover:text-white transition-colors mt-auto">
                        Read Case Study
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Publications */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Selected Publications</h2>
                <Link to="/publications" className="hidden sm:flex items-center text-sm font-bold text-primary hover:underline">
                  View All <span className="material-symbols-outlined text-lg ml-1">arrow_forward</span>
                </Link>
              </div>
              <div className="flex flex-col gap-4">
                {selectedPublications.map((pub, index) => (
                  <div key={index} className="group p-5 rounded-lg border border-gray-200 dark:border-border-dark bg-surface-light dark:bg-surface-dark hover:border-primary/40 transition-all flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">{pub.venue}</span>
                        <span className="text-xs font-mono text-gray-500">{pub.year}</span>
                      </div>
                      <h4 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors leading-snug mb-1">
                        {pub.title}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                        {pub.authors}
                      </p>
                    </div>
                    <div className="flex gap-3 shrink-0">
                      <a href="#" className="text-xs font-bold text-gray-500 hover:text-primary transition-colors flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">description</span> PDF
                      </a>
                      <a href="#" className="text-xs font-bold text-gray-500 hover:text-primary transition-colors flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">code</span> Code
                      </a>
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

                  {newsData.slice(0, newsLimit).map((item, index) => (
                    <div key={index} className="relative pl-6" ref={index === 0 ? newsItemRef : null}>
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
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
                  <Link to="/news" className="text-xs font-bold text-primary hover:underline">View Archive</Link>
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
