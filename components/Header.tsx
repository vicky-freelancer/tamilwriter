
import React from 'react';
import { APP_NAME, ICONS } from '../constants';

const Header: React.FC = () => {
  const scrollToSection = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
      <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
            T
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            {APP_NAME}
          </h1>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#transliterate" onClick={scrollToSection('transliterate')} className="hover:text-blue-600 transition-colors">Transliterate</a>
          <a href="#grammar" onClick={scrollToSection('grammar')} className="hover:text-blue-600 transition-colors">Grammar Check</a>
          <a href="#benefits" onClick={scrollToSection('benefits')} className="hover:text-blue-600 transition-colors">How it works</a>
        </nav>

        <div className="flex items-center gap-4">
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {ICONS.Github}
          </a>
          <button 
            onClick={scrollToSection('footer')}
            className="hidden sm:block px-4 py-2 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
          >
            Join Waitlist
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
