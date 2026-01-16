
import React, { useState, useRef, useEffect } from 'react';
import { ICONS } from '../constants';
import { transliterate } from '../services/transliterationService';
import { checkTamilGrammar } from '../services/geminiService';
import { AppStatus, Suggestion, AIModel } from '../types';

const Editor: React.FC = () => {
  const [text, setText] = useState('');
  const [history, setHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [tamilEnabled, setTamilEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [fontSize, setFontSize] = useState(20);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>('gemini-3-flash-preview');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  // Synchronize scrolling between textarea and highlight backdrop
  const handleScroll = () => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const recordChange = (newText: string) => {
    if (newText === history[historyIndex]) return;
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newText);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setText(prev);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setText(next);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const rawValue = e.target.value;
    // Clear suggestions when text changes manually to avoid offset drift
    if (suggestions.length > 0) setSuggestions([]);
    
    if (tamilEnabled) {
      const transliterated = transliterate(rawValue);
      setText(transliterated);
      recordChange(transliterated);
    } else {
      setText(rawValue);
      recordChange(rawValue);
    }
  };

  const handleMagicCheck = async () => {
    if (!text.trim() || status === AppStatus.LOADING) return;
    setStatus(AppStatus.LOADING);
    setShowAiPanel(true);
    try {
      const result = await checkTamilGrammar(text, selectedModel);
      setSuggestions(result.suggestions);
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setStatus(AppStatus.ERROR);
      alert(err.message || "An error occurred while checking grammar.");
    }
  };

  const handleClear = () => {
    if (text && window.confirm("Are you sure you want to clear all text?")) {
      setText('');
      setSuggestions([]);
      setStatus(AppStatus.IDLE);
      recordChange('');
    }
  };

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'ta-IN';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const newText = text + (text.length > 0 ? ' ' : '') + transcript;
      setText(newText);
      recordChange(newText);
    };
    recognition.start();
  };

  const acceptSuggestion = (suggestion: Suggestion) => {
    // If we have index information, we can be more precise
    let newText = text;
    if (suggestion.index !== undefined && suggestion.length !== undefined) {
      const before = text.substring(0, suggestion.index);
      const after = text.substring(suggestion.index + suggestion.length);
      newText = before + suggestion.suggestion + after;
    } else {
      newText = text.replace(suggestion.original, suggestion.suggestion);
    }
    
    setText(newText);
    recordChange(newText);
    
    // Update other suggestions' offsets if needed (for simplicity we just clear them or recalculate)
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id).map(s => {
      // Very basic offset adjustment: if the removed suggestion was before this one, adjust index
      if (suggestion.index !== undefined && s.index !== undefined && suggestion.index < s.index) {
        const diff = suggestion.suggestion.length - suggestion.original.length;
        return { ...s, index: s.index + diff };
      }
      return s;
    }));
  };

  const ignoreSuggestion = (id: string) => {
    setSuggestions(suggestions.filter(s => s.id !== id));
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  // Function to render text with highlights
  const renderHighlightedText = () => {
    if (!text) return null;
    if (suggestions.length === 0) return text;

    // Sort suggestions by index to process text linearly
    const sorted = [...suggestions].filter(s => s.index !== undefined).sort((a, b) => (a.index || 0) - (b.index || 0));
    
    const parts = [];
    let lastIndex = 0;

    sorted.forEach((s, i) => {
      const start = s.index!;
      const end = start + s.length!;
      
      // Text before highlight
      if (start > lastIndex) {
        parts.push(text.substring(lastIndex, start));
      }
      
      // Highlighted segment
      parts.push(
        <span 
          key={`highlight-${s.id}`} 
          className="bg-amber-200/50 border-b-2 border-amber-400 rounded-sm cursor-help"
          title={s.reason}
        >
          {text.substring(start, end)}
        </span>
      );
      
      lastIndex = end;
    });

    // Remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 mt-4 mb-20">
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-white p-3 rounded-2xl border border-slate-200/60 shadow-sm sticky top-[84px] z-40">
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1 mr-2 pr-2 border-r border-slate-100">
            <button onClick={undo} disabled={historyIndex === 0} className="p-2 text-slate-400 hover:text-slate-800 disabled:opacity-20 transition-colors">{ICONS.Undo}</button>
            <button onClick={redo} disabled={historyIndex === history.length - 1} className="p-2 text-slate-400 hover:text-slate-800 disabled:opacity-20 transition-colors">{ICONS.Redo}</button>
          </div>
          
          <div className="flex items-center gap-1 mr-2 pr-2 border-r border-slate-100">
            <button onClick={() => setFontSize(s => Math.max(12, s - 2))} className="p-2 text-slate-400 hover:text-slate-800 transition-colors">{ICONS.Minus}</button>
            <span className="text-[10px] font-black text-slate-300 w-6 text-center">{fontSize}</span>
            <button onClick={() => setFontSize(s => Math.min(64, s + 2))} className="p-2 text-slate-400 hover:text-slate-800 transition-colors">{ICONS.Plus}</button>
          </div>

          <button onClick={handleCopy} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">{ICONS.Copy}</button>
          <button onClick={handleClear} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">{ICONS.Trash}</button>
        </div>

        <div className="flex items-center gap-2">
           <div className="hidden sm:flex items-center gap-2 mr-4 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Model:</span>
             <select 
              value={selectedModel} 
              onChange={(e) => setSelectedModel(e.target.value as AIModel)}
              className="bg-transparent text-[10px] font-bold text-slate-600 outline-none cursor-pointer"
             >
               <option value="gemini-3-flash-preview">Flash (Fast)</option>
               <option value="gemini-3-pro-preview">Pro (Smart)</option>
             </select>
           </div>

           <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-full border border-slate-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tamil</span>
              <button 
                onClick={() => setTamilEnabled(!tamilEnabled)}
                className={`w-9 h-4.5 rounded-full transition-all relative ${tamilEnabled ? 'bg-purple-600' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all duration-200 ${tamilEnabled ? 'left-5' : 'left-0.5'}`}></div>
              </button>
            </div>

            <button 
              onClick={startListening}
              className={`p-2.5 rounded-full transition-all shadow-sm ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-purple-600 bg-white border border-purple-100 hover:bg-purple-50'}`}
            >
              {ICONS.Mic}
            </button>

            <button 
              onClick={handleMagicCheck}
              disabled={status === AppStatus.LOADING || !text.trim()}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-xs transition-all shadow-lg active:scale-95 disabled:opacity-50 ${status === AppStatus.LOADING ? 'bg-white text-slate-400 border border-slate-100' : 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-200'}`}
            >
              {status === AppStatus.LOADING ? <div className="w-4 h-4 border-2 border-slate-300 border-t-purple-600 rounded-full animate-spin"></div> : ICONS.Sparkles}
              <span>Check Grammar</span>
            </button>
        </div>
      </div>

      <div className="relative flex flex-col lg:flex-row gap-6">
        {/* Main Workspace with Highlight Overlay */}
        <div className="flex-1 bg-white rounded-[2rem] border-2 border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col transition-all focus-within:border-purple-200 relative group">
          
          <div className="relative flex-1 min-h-[550px]">
            {/* Highlighting Backdrop */}
            <div 
              ref={highlightRef}
              className="absolute inset-0 p-12 leading-relaxed text-transparent pointer-events-none whitespace-pre-wrap break-words overflow-hidden"
              style={{ fontSize: `${fontSize}px`, fontFamily: 'inherit' }}
            >
              {renderHighlightedText()}
            </div>

            {/* Main Textarea */}
            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleTextChange}
              onScroll={handleScroll}
              placeholder="Type phonetically (e.g., 'vanakkam') to see the magic..."
              style={{ fontSize: `${fontSize}px` }}
              className="relative w-full h-full p-12 leading-relaxed text-slate-800 placeholder:text-slate-200 resize-none outline-none bg-transparent font-medium"
              spellCheck={false}
            />
          </div>
          
          <div className="px-12 py-5 bg-white flex items-center justify-between border-t border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <div>{wordCount} Words • {charCount} Characters</div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${status === AppStatus.ERROR ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></span>
              Gemini {selectedModel.includes('pro') ? 'Pro' : 'Flash'} Active
            </div>
          </div>
        </div>

        {/* AI Assistant Sidebar */}
        {(showAiPanel || suggestions.length > 0) && (
          <div className="w-full lg:w-96 bg-white border border-slate-200 rounded-[2rem] shadow-xl overflow-hidden flex flex-col animate-fade-in-up">
            <div className="flex items-center justify-between px-6 py-5 bg-white border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
                  {ICONS.Sparkles}
                </div>
                <h4 className="font-bold text-slate-800 text-sm tracking-tight">AI Assistant</h4>
              </div>
              <button onClick={() => setShowAiPanel(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                {ICONS.Close}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[500px] bg-white">
              {status === AppStatus.LOADING ? (
                <div className="flex flex-col items-center justify-center h-full py-16 space-y-4">
                   <div className="w-10 h-10 border-4 border-purple-50 border-t-purple-600 rounded-full animate-spin"></div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Analyzing Tamil Text...</p>
                </div>
              ) : suggestions.length > 0 ? (
                suggestions.map((s) => (
                  <div key={s.id} className="p-5 bg-white rounded-2xl border border-slate-100 space-y-4 hover:border-purple-200 transition-all shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-widest rounded-md border border-amber-100">{s.type}</span>
                    </div>
                    <div className="space-y-3">
                       <div className="space-y-1">
                         <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Found</span>
                         <p className="text-sm font-bold text-slate-400 line-through decoration-amber-300">{s.original}</p>
                       </div>
                       <div className="space-y-1">
                         <span className="text-[8px] font-black text-green-400 uppercase tracking-widest">Suggest</span>
                         <p className="text-sm font-bold text-green-700 bg-green-50 p-2 rounded-xl border border-green-100">{s.suggestion}</p>
                       </div>
                       <p className="text-[11px] text-slate-500 leading-relaxed italic px-1">"{s.reason}"</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => acceptSuggestion(s)}
                        className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 shadow-md shadow-purple-500/10 transition-all active:scale-95"
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => ignoreSuggestion(s.id)}
                        className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl text-xs font-bold hover:text-slate-600 transition-all"
                      >
                        Ignore
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center text-slate-300">
                   <div className="mb-4 scale-125">{ICONS.Check}</div>
                   <p className="text-[10px] font-black uppercase tracking-widest">No issues detected</p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-white">
               <button onClick={handleMagicCheck} className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black text-slate-400 hover:text-purple-600 hover:border-purple-100 transition-all">
                  {ICONS.Magic} RE-SCAN
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Editor;
