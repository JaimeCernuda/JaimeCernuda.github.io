import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import matter from 'gray-matter';

const CV = () => {
    const [content, setContent] = useState(null);
    const [activeSection, setActiveSection] = useState('');
    const [publications, setPublications] = useState([]);

    // Pre-glob all content folders
    const allPubModules = import.meta.glob('/public/content/publications/*.md', { query: '?raw', import: 'default' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch CV Content
                const res = await fetch('/content/cv.md');
                const text = await res.text();
                const { data } = matter(text);
                setContent(data);

                // 2. Fetch All Publications (dynamic)
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
                // Sort by year descending
                allPubs.sort((a, b) => b.year - a.year);
                setPublications(allPubs);

            } catch (error) {
                console.error("Error loading CV content:", error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { rootMargin: '-100px 0px -66% 0px' }
        );

        ['summary', 'education', 'experience', 'publications', 'skills'].forEach((id) => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [content]);

    if (!content) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="flex-grow w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
                {/* Sidebar */}
                <aside className="sidebar lg:col-span-4 xl:col-span-3 lg:sticky lg:top-24 h-fit max-h-[calc(100vh-8rem)] overflow-y-auto space-y-6 scrollbar-hide">
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-gray-200 dark:border-border-dark transition-colors">
                        <div className="flex flex-col items-center text-center">
                            <div className="relative w-32 h-32 mb-4 group">
                                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary to-blue-400 opacity-20 blur-sm group-hover:opacity-30 transition-opacity"></div>
                                <img
                                    className="w-full h-full object-cover rounded-full border-4 border-white dark:border-surface-dark relative z-10"
                                    src={content.profile.image}
                                    alt={content.profile.name}
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                                />
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{content.profile.name}</h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 whitespace-pre-line">{content.profile.title}</p>
                            <div className="w-full space-y-3 mb-6">
                                <a href={`mailto:${content.profile.email}`} className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">mail</span>
                                    {content.profile.email}
                                </a>
                                <a href="#" className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">language</span>
                                    {content.profile.website}
                                </a>
                                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="material-symbols-outlined text-[20px]">location_on</span>
                                    {content.profile.location}
                                </div>
                            </div>
                            <a href="/cv/CV_Jaime_latest.pdf" download className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20">
                                <span className="material-symbols-outlined text-[20px]">download</span>
                                Download PDF CV
                            </a>
                        </div>
                    </div>

                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-gray-200 dark:border-border-dark hidden lg:block transition-colors sticky top-24">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">On this page</h3>
                        <nav className="space-y-2 text-sm border-l border-gray-200 dark:border-gray-800">
                            {['summary', 'education', 'experience', 'publications', 'skills'].map((section) => (
                                <a
                                    key={section}
                                    href={`#${section}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className={`block pl-4 py-1 border-l-2 -ml-[2px] transition-colors capitalize ${activeSection === section
                                        ? 'border-primary text-primary font-medium'
                                        : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                                        }`}
                                >
                                    {section}
                                </a>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="main-content lg:col-span-8 xl:col-span-9 space-y-8 pb-20">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white">Curriculum Vitae</h1>
                        <p className="text-lg text-gray-500 dark:text-gray-400 font-light">Specializing in Computer Vision, Self-Supervised Learning, and 3D Scene Understanding.</p>
                    </div>

                    {/* Summary */}
                    <section id="summary" className="scroll-mt-[96px] bg-surface-light dark:bg-surface-dark rounded-xl p-6 md:p-8 shadow-sm border border-gray-200 dark:border-border-dark transition-colors">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <span className="material-symbols-outlined">person</span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Professional Summary</h2>
                        </div>
                        <p className="text-gray-900 dark:text-gray-300 leading-relaxed">
                            {content.summary}
                        </p>
                    </section>

                    {/* Education */}
                    <section id="education" className="scroll-mt-[96px]">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <span className="material-symbols-outlined">school</span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Education</h2>
                        </div>
                        <div className="relative space-y-8 pl-8 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-200 dark:before:bg-gray-700">
                            {content.education.map((edu, index) => (
                                <div key={index} className="relative">
                                    <div className={`absolute -left-[39px] top-1.5 size-4 rounded-full border-4 border-white dark:border-background-dark shadow-sm ${index === 0 ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                    <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-lg border border-gray-200 dark:border-border-dark shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{edu.degree}</h3>
                                                <p className="text-primary font-medium">{edu.school}</p>
                                            </div>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                                                {edu.year}
                                            </span>
                                        </div>
                                        {edu.details.map((detail, i) => (
                                            <p key={i} className="text-sm text-gray-500 dark:text-gray-400 mb-1">{detail}</p>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Experience */}
                    <section id="experience" className="scroll-mt-[96px]">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <span className="material-symbols-outlined">work</span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Experience</h2>
                        </div>
                        <div className="relative space-y-8 pl-8 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-200 dark:before:bg-gray-700">
                            {content.experience.map((exp, index) => (
                                <div key={index} className="relative">
                                    <div className={`absolute -left-[39px] top-1.5 size-4 rounded-full border-4 border-white dark:border-background-dark shadow-sm ${index === 0 ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                    <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-lg border border-gray-200 dark:border-border-dark shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{exp.role}</h3>
                                                <p className="text-primary font-medium">{exp.company}</p>
                                            </div>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                                                {exp.year}
                                            </span>
                                        </div>
                                        <ul className="list-disc list-outside ml-5 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                                            {exp.details.map((detail, i) => (
                                                <li key={i}>{detail}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Publications */}
                    <section id="publications" className="scroll-mt-[96px]">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <span className="material-symbols-outlined">article</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Selected Publications</h2>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {publications.map((pub, index) => (
                                <div key={index} className="group bg-surface-light dark:bg-surface-dark p-5 rounded-lg border border-gray-200 dark:border-border-dark shadow-sm hover:border-primary/30 transition-all">
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <Link to={`/publications/${pub.slug}`} className="block group-hover:text-primary transition-colors">
                                                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                                                    {pub.title}
                                                </h3>
                                            </Link>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                {pub.authors}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 italic mt-0.5">{pub.venue} • {pub.year}</p>
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            {pub.links?.pdf && (
                                                <a href={pub.links.pdf} target="_blank" rel="noopener noreferrer" className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-primary transition-colors" title="PDF">
                                                    <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                                                </a>
                                            )}
                                            {pub.links?.code && (
                                                <a href={pub.links.code} target="_blank" rel="noopener noreferrer" className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-primary transition-colors" title="Code">
                                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M12 2C6.47 2 2 6.47 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                                                    </svg>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Skills & Awards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <section id="skills" className="scroll-mt-[96px]">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <span className="material-symbols-outlined">code</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Skills</h2>
                            </div>
                            <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-gray-200 dark:border-border-dark shadow-sm">
                                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Languages</h3>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {content.skills.languages.map((skill, i) => (
                                        <span key={i} className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 text-sm font-medium">{skill}</span>
                                    ))}
                                </div>
                                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Frameworks & Tools</h3>
                                <div className="flex flex-wrap gap-2">
                                    {content.skills.tools.map((skill, i) => (
                                        <span key={i} className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-primary text-sm font-medium border border-blue-100 dark:border-blue-800">{skill}</span>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section id="awards">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <span className="material-symbols-outlined">emoji_events</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Awards & Honors</h2>
                            </div>
                            <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-gray-200 dark:border-border-dark shadow-sm">
                                <ul className="space-y-4">
                                    {content.awards.map((award, index) => (
                                        <li key={index} className="flex gap-3">
                                            <span className="material-symbols-outlined text-yellow-500 shrink-0">star</span>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white text-sm">{award.title}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{award.venue || award.year}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CV;
