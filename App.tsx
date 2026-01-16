
import React from 'react';
import Editor from './components/Editor';
import { ICONS, APP_NAME } from './constants';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-purple-100 selection:text-purple-900">
      {/* Dynamic Navigation */}
      <nav className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-8 md:px-12 z-50 sticky top-0 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black shadow-2xl shadow-slate-300 -rotate-2 transform hover:rotate-0 transition-transform cursor-pointer">
            T
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-slate-900 leading-tight uppercase tracking-tighter">
              {APP_NAME}
            </h1>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-black text-slate-400 tracking-[0.3em] uppercase">Powered by</span>
              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 rounded text-[9px] font-black text-blue-600 uppercase tracking-tighter">
                Gemini AI
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-12">
          <a href="#" className="text-[10px] font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-[0.2em]">Writing Tool</a>
          <a href="#" className="text-[10px] font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-[0.2em]">Grammar Guide</a>
          <a href="#" className="text-[10px] font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-[0.2em]">Developer API</a>
          <button className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-2xl shadow-slate-200">
             Get Updates
          </button>
        </div>

        <div className="lg:hidden">
          <button className="p-2 text-slate-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"/></svg>
          </button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col pt-12">
        {/* Modern Hero */}
        <section className="max-w-4xl mx-auto px-6 text-center mb-12 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 text-slate-400 rounded-full text-[9px] font-black uppercase tracking-[0.25em] shadow-sm">
            {ICONS.Sparkles} High Performance Tamil Engine
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
             The smarter way to <br/> <span className="text-purple-600">write in Tamil.</span>
          </h2>
          <p className="text-sm md:text-lg text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            Professional-grade transliteration meets advanced AI grammar correction. Perfect for writers, students, and professionals.
          </p>
        </section>

        {/* Core Editor */}
        <Editor />
      </main>

      <Footer />
    </div>
  );
};

export default App;
