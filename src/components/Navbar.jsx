import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isActive = (path) => {
        return location.pathname === path
            ? "text-primary font-medium"
            : "text-gray-300 hover:text-primary transition-colors font-medium";
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo & Name */}
                    <div className="flex items-center gap-3 flex-1">
                        <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                            <span className="material-symbols-outlined text-2xl">science</span>
                        </div>
                        <Link to="/" className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                            Jaime Cernuda
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center justify-center gap-8">
                        <Link to="/" className={`text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-primary' : 'text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-primary'}`}>Home</Link>
                        <Link to="/publications" className={`text-sm font-medium transition-colors ${location.pathname === '/publications' ? 'text-primary' : 'text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-primary'}`}>Publications</Link>
                        <Link to="/projects" className={`text-sm font-medium transition-colors ${location.pathname === '/projects' ? 'text-primary' : 'text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-primary'}`}>Projects</Link>
                        <Link to="/news" className={`text-sm font-medium transition-colors ${location.pathname === '/news' ? 'text-primary' : 'text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-primary'}`}>News</Link>
                        <Link to="/cv" className={`text-sm font-medium transition-colors ${location.pathname === '/cv' ? 'text-primary' : 'text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-primary'}`}>CV</Link>
                        <Link to="/blog" className={`text-sm font-medium transition-colors ${location.pathname === '/blog' ? 'text-primary' : 'text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-primary'}`}>Blog</Link>
                    </nav>

                    {/* Right Side Actions */}
                    <div className="flex items-center justify-end gap-4 flex-1">
                        <ThemeToggle />

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 text-gray-700 hover:text-primary dark:text-gray-500 dark:hover:text-white"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu (Simple implementation) */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-gray-800 px-4 py-4 flex flex-col gap-4">
                    <Link to="/" className={`text-sm font-medium ${location.pathname === '/' ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`} onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                    <Link to="/publications" className={`text-sm font-medium ${location.pathname === '/publications' ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`} onClick={() => setIsMobileMenuOpen(false)}>Publications</Link>
                    <Link to="/projects" className={`text-sm font-medium ${location.pathname === '/projects' ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`} onClick={() => setIsMobileMenuOpen(false)}>Projects</Link>
                    <Link to="/news" className={`text-sm font-medium ${location.pathname === '/news' ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`} onClick={() => setIsMobileMenuOpen(false)}>News</Link>
                    <Link to="/cv" className={`text-sm font-medium ${location.pathname === '/cv' ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`} onClick={() => setIsMobileMenuOpen(false)}>CV</Link>
                    <Link to="/blog" className={`text-sm font-medium ${location.pathname === '/blog' ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`} onClick={() => setIsMobileMenuOpen(false)}>Blog</Link>
                </div>
            )}
        </header>
    );
};

export default Navbar;
