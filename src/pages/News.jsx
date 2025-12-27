import React, { useEffect, useState } from 'react';
import matter from 'gray-matter';
import { Link, useLocation } from 'react-router-dom';

const News = () => {
    const [newsData, setNewsData] = useState([]);
    const [loading, setLoading] = useState(true);

    const location = useLocation();
    const showBackLink = location.state?.from === 'home';

    useEffect(() => {
        fetch('/content/news.md')
            .then(res => res.text())
            .then(text => {
                const { data } = matter(text);
                setNewsData(data.news || []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading news:", err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-20 text-center text-gray-500">Loading news...</div>;

    return (
        <div className="w-full max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {showBackLink && (
                <Link to="/" className="inline-flex items-center gap-2 text-primary font-bold hover:underline mb-8">
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    Back to Home
                </Link>
            )}

            <div className="mb-12">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">News Archive</h1>
                <p className="text-xl text-gray-600 dark:text-gray-400">Updates, announcements, and recent activities.</p>
            </div>
            <div className="relative border-l-2 border-gray-200 dark:border-gray-800 ml-3 md:ml-6 space-y-12">
                {(() => {
                    let lastYear = null;
                    return newsData.map((item, index) => {
                        const yearMatch = item.date ? item.date.match(/\d{4}/) : null;
                        const currentYear = yearMatch ? yearMatch[0] : null;
                        const showYearSeparator = currentYear && currentYear !== lastYear;
                        if (currentYear) lastYear = currentYear;

                        return (
                            <React.Fragment key={index}>
                                {showYearSeparator && (
                                    <div className="relative pl-8 md:pl-12 pt-4">
                                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{currentYear}</span>
                                    </div>
                                )}
                                <div className="relative pl-8 md:pl-12">
                                    <div className="absolute -left-[9px] top-1.5 w-4 h-4 bg-white dark:bg-surface-dark border-4 border-primary rounded-full"></div>

                                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-2">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                            {item.link && item.link !== '#' ? (
                                                <a href={item.link} className="hover:text-primary transition-colors">{item.title}</a>
                                            ) : (
                                                item.title
                                            )}
                                        </h3>
                                        <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide shrink-0">{item.date}</span>
                                    </div>

                                    <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">
                                        {item.description}
                                    </p>
                                </div>
                            </React.Fragment>
                        );
                    });
                })()}
            </div>
        </div>
    );
};

export default News;
