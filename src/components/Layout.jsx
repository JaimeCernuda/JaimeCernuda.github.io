import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
    return (
        <div className="min-h-screen flex flex-col font-display selection:bg-primary/30 selection:text-white">
            <Navbar />
            <main className="flex-1 flex flex-col w-full">
                <Outlet />
            </main>
            <footer className="mt-auto border-t border-border-dark bg-surface-dark py-12">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-4">Let's Collaborate</h3>
                            <p className="text-gray-400 mb-6 max-w-sm">
                                I am always looking for motivated PhD students and collaboration opportunities. Reach out if you are interested in pushing the boundaries of AI.
                            </p>
                            <a href="mailto:jcernudagarcia@hawk.illinoistech.edu" className="inline-flex items-center text-primary hover:text-white font-bold text-lg transition-colors">
                                jcernudagarcia@hawk.illinoistech.edu
                            </a>
                        </div>
                        <div className="flex flex-col md:items-end justify-between">
                            <div className="flex gap-6 mb-6">
                                <a href="https://linkedin.com" className="text-gray-400 hover:text-primary transition-colors">LinkedIn</a>
                                <a href="https://github.com" className="text-gray-400 hover:text-primary transition-colors">GitHub</a>
                                <a href="https://scholar.google.com" className="text-gray-400 hover:text-primary transition-colors">Scholar</a>
                            </div>
                            <p className="text-gray-600 text-sm">
                                &copy; {new Date().getFullYear()} Jaime Cernuda. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
