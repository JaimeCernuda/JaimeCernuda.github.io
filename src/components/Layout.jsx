import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import matter from 'gray-matter';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    const location = useLocation();
    const isHome = location.pathname === '/';
    const [footerData, setFooterData] = useState(null);

    useEffect(() => {
        const fetchFooter = async () => {
            try {
                const res = await fetch('/content/footer.md');
                const text = await res.text();
                const { data } = matter(text);
                setFooterData(data);
            } catch (error) {
                console.error("Error loading footer data:", error);
            }
        };
        fetchFooter();
    }, []);

    if (!footerData) return null; // Or a loading spinner/skeleton

    return (
        <div className="min-h-screen flex flex-col font-display selection:bg-primary/30 selection:text-white">
            <Navbar />
            <main className="flex-1 flex flex-col w-full">
                {children || <Outlet />}
            </main>

            {isHome ? (
                // Home Page Footer - Contact Focused
                <>
                    {/* Let's Collaborate Section - Stats Section Color */}
                    <section className="mt-auto border-t border-gray-200 dark:border-border-dark bg-surface-light-lighter dark:bg-surface-dark/30 py-8 lg:py-12 transition-colors">
                        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex flex-col items-center text-center gap-6">
                                <div>
                                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">{footerData.contact.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-lg mx-auto text-lg">
                                        {footerData.contact.text}
                                    </p>
                                    <a href={`mailto:${footerData.contact.email}`} className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-primary hover:bg-primary-hover text-white text-lg font-bold transition-all shadow-lg shadow-primary/25">
                                        <span className="material-symbols-outlined mr-2">mail</span>
                                        {footerData.contact.button_text}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>
                    {/* Footer - Same as other pages */}
                    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-surface-dark py-8">
                        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                {footerData.copyright}
                            </p>
                            <div className="flex gap-4">
                                {footerData.social_links.map((link, index) => (
                                    <a key={index} href={link.url} className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors" title={link.name}>
                                        <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </footer>
                </>
            ) : (
                // Other Pages Footer - Minimalist
                <footer className="mt-auto border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-surface-dark py-8">
                    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            {footerData.copyright}
                        </p>
                        <div className="flex gap-4 text-gray-500 dark:text-gray-400">
                            {footerData.social_links.map((link, index) => (
                                <a key={index} href={link.url} className="hover:text-primary transition-colors" title={link.name}>
                                    <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </footer>
            )}
        </div>
    );
};

export default Layout;
