import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
    const location = useLocation();
    const isHome = location.pathname === '/';

    return (
        <div className="min-h-screen flex flex-col font-display selection:bg-primary/30 selection:text-white">
            <Navbar />
            <main className="flex-1 flex flex-col w-full">
                <Outlet />
            </main>

            {isHome ? (
                // Home Page Footer - Contact Focused
                <footer className="mt-auto border-t border-border-dark bg-surface-dark py-12 lg:py-16">
                    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col items-center text-center gap-8">
                            <div>
                                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Let's Collaborate</h3>
                                <p className="text-gray-400 mb-8 max-w-lg mx-auto text-lg">
                                    I am always looking for motivated PhD students and collaboration opportunities. Reach out if you are interested in pushing the boundaries of AI.
                                </p>
                                <a href="mailto:jcernudagarcia@hawk.illinoistech.edu" className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-primary hover:bg-primary-hover text-white text-lg font-bold transition-all shadow-lg shadow-primary/25">
                                    <span className="material-symbols-outlined mr-2">mail</span>
                                    Get in Touch
                                </a>
                            </div>

                            <div className="w-full h-px bg-gray-800/50 my-4"></div>

                            <div className="flex flex-col md:flex-row justify-between items-center w-full gap-6">
                                <p className="text-gray-600 text-sm">
                                    &copy; {new Date().getFullYear()} Jaime Cernuda. All rights reserved.
                                </p>
                                <div className="flex gap-6">
                                    <a href="https://linkedin.com" className="text-gray-400 hover:text-primary transition-colors">LinkedIn</a>
                                    <a href="https://github.com" className="text-gray-400 hover:text-primary transition-colors">GitHub</a>
                                    <a href="https://scholar.google.com" className="text-gray-400 hover:text-primary transition-colors">Scholar</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
            ) : (
                // Other Pages Footer - Minimalist
                <footer className="mt-auto border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-surface-dark py-8">
                    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            &copy; {new Date().getFullYear()} Jaime Cernuda
                        </p>
                        <div className="flex gap-4 text-gray-500 dark:text-gray-400">
                            <a href="https://www.iit.edu" className="hover:text-primary transition-colors" title="Illinois Tech">
                                <span className="material-symbols-outlined text-[20px]">account_balance</span>
                            </a>
                            <a href="#" className="hover:text-primary transition-colors" title="Chicago, IL">
                                <span className="material-symbols-outlined text-[20px]">location_on</span>
                            </a>
                            <a href="mailto:jcernudagarcia@hawk.illinoistech.edu" className="hover:text-primary transition-colors" title="Email">
                                <span className="material-symbols-outlined text-[20px]">mail</span>
                            </a>
                            <a href="https://scholar.google.com" className="hover:text-primary transition-colors" title="Google Scholar">
                                <span className="material-symbols-outlined text-[20px]">school</span>
                            </a>
                            <a href="https://github.com" className="hover:text-primary transition-colors" title="GitHub">
                                <span className="material-symbols-outlined text-[20px]">code</span>
                            </a>
                            <a href="https://linkedin.com" className="hover:text-primary transition-colors" title="LinkedIn">
                                <span className="material-symbols-outlined text-[20px]">work</span>
                            </a>
                        </div>
                    </div>
                </footer>
            )}
        </div>
    );
};

export default Layout;
