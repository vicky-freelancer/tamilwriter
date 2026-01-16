
import React, { useState } from 'react';
import { ICONS, APP_NAME } from '../constants';
import { saveLead } from '../services/supabaseService';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    const success = await saveLead(email);
    setLoading(false);
    
    if (success) {
      setSubmitted(true);
      setEmail('');
      setTimeout(() => setSubmitted(false), 5000);
    }
  };

  return (
    <footer id="footer" className="mt-auto border-t border-slate-100 bg-white py-16 px-4">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        <div className="max-w-md w-full text-center space-y-6">
          <h3 className="text-2xl font-bold text-slate-900">Stay in the loop</h3>
          <p className="text-slate-500">
            Get updates on new features, Tamil writing tips, and more. No spam, we promise.
          </p>
          
          <form onSubmit={handleSubmit} className="relative flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                {ICONS.Mail}
              </div>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Get Updates</span>
                  {ICONS.Send}
                </>
              )}
            </button>
          </form>
          
          {submitted && (
            <p className="text-green-600 text-sm font-medium animate-bounce">
              Welcome to the family! We've saved your spot.
            </p>
          )}
        </div>

        <div className="mt-16 pt-8 border-t border-slate-200 w-full flex flex-col sm:flex-row items-center justify-between gap-6 text-slate-400 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">{APP_NAME}</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-slate-600">Privacy Policy</a>
            <a href="#" className="hover:text-slate-600">Terms of Service</a>
            <a href="#" className="hover:text-slate-600">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
