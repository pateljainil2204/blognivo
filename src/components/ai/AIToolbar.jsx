import { useState } from 'react';
import { ai } from '../../lib/ai';
import { Sparkles, Check, Type, RefreshCw, Tags, Search, Expand, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const AI_ACTIONS = [
  { key: 'improve', label: 'Improve Writing', icon: Sparkles },
  { key: 'grammar', label: 'Fix Grammar', icon: Check },
  { key: 'rewrite', label: 'Rewrite', icon: RefreshCw },
  { key: 'title', label: 'Suggest Titles', icon: Type },
  { key: 'seo', label: 'SEO Optimize', icon: Search },
  { key: 'tags', label: 'Suggest Tags', icon: Tags },
  { key: 'expand', label: 'Expand Content', icon: Expand },
];

export default function AIToolbar({ content, onApply, onTagsSuggested, onTitlesSuggested }) {
  const [loading, setLoading] = useState(null);
  const [result, setResult] = useState(null);

  const lineCount = content.split('\n').filter((l) => l.trim()).length;
  const isEnabled = lineCount >= 2;

  const handleAction = async (action) => {
    if (!isEnabled) return;
    setLoading(action);
    setResult(null);

    try {
      const data = await ai.authorAction(content, action);

      if (action === 'tags' && onTagsSuggested) {
        onTagsSuggested(data.result.split(',').map((t) => t.trim()));
        toast.success('Tags suggested!');
      } else if (action === 'title') {
        // Parse titles (expects 1. Title \n 2. Title format)
        const titles = data.result.split('\n')
          .map(t => t.replace(/^\d+\.\s*/, '').trim())
          .filter(t => t);
        setResult({ action, titles });
        toast.success('Title suggestions ready!');
      } else {
        setResult({ action, text: data.result });
        toast.success('AI suggestion ready!');
      }
    } catch (err) {
      toast.error(err.message || 'AI failed. Try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="border border-indigo-500/30 rounded-2xl p-6 bg-slate-900/50 backdrop-blur-xl shadow-2xl shadow-indigo-500/10 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700 ring-1 ring-white/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm font-black text-white">
          <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-300 shadow-lg shadow-indigo-500/20">
            <Sparkles size={18} strokeWidth={2.5} />
          </div>
          <span className="tracking-wide uppercase text-xs">AI Writing Assistant</span>
          {!isEnabled && (
            <span className="text-[10px] font-medium text-gray-500 bg-white/5 px-2 py-0.5 rounded-full ml-1">
              Write 2+ lines to activate
            </span>
          )}
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400 animate-pulse bg-indigo-500/5 px-3 py-1 rounded-full border border-indigo-500/10">
            <Loader2 size={12} className="animate-spin" />
            Thinking...
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {AI_ACTIONS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => handleAction(key)}
            disabled={!isEnabled || loading !== null}
            className="group flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border border-white/10 bg-white/5 hover:bg-indigo-500/20 hover:border-indigo-500/40 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-300 shadow-md"
          >
            <Icon size={14} strokeWidth={2.5} className="text-indigo-400 group-hover:scale-110 transition-transform" />
            {label}
          </button>
        ))}
      </div>

      {result && (
        <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-2xl shadow-3xl p-6 animate-in zoom-in-95 duration-500 backdrop-blur-md">
          <div className="flex items-center justify-between mb-5">
            <div className="text-[10px] font-black text-white bg-indigo-600 px-3 py-1 rounded-full uppercase tracking-[0.2em] shadow-lg shadow-indigo-600/20">AI Suggestion</div>
            <button 
              onClick={() => setResult(null)}
              className="text-gray-400 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-xl"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>
          
          {result.action === 'title' ? (
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-gray-500 mb-3 ml-1">Select a title to apply:</p>
              <div className="grid gap-2">
                {result.titles.map((title, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      onTitlesSuggested(title);
                      setResult(null);
                    }}
                    className="w-full text-left p-3 text-sm rounded-xl border border-white/5 bg-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/10 text-gray-300 hover:text-white transition-all duration-300"
                  >
                    {title}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-sm text-gray-100 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto pr-4 custom-scrollbar font-medium bg-black/40 p-6 rounded-2xl border border-white/10 selection:bg-indigo-500/50">
                {result.text}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onApply(result.text);
                    setResult(null);
                  }}
                  className="flex-1 bg-indigo-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                >
                  Apply Changes
                </button>
                <button
                  onClick={() => handleAction(result.action)}
                  className="px-5 py-2.5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
                >
                  Regenerate
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}