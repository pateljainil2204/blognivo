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
    <div className="border border-purple-100 rounded-xl p-4 bg-gradient-to-br from-white to-purple-50/30 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <div className="p-1 bg-purple-100 rounded-lg text-purple-600">
            <Sparkles size={16} />
          </div>
          AI Writing Assistant
          {!isEnabled && (
            <span className="text-xs font-normal text-gray-400 ml-2">(Write 2+ lines to activate)</span>
          )}
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-xs text-purple-600 animate-pulse">
            <Loader2 size={12} className="animate-spin" />
            AI is thinking...
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {AI_ACTIONS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => handleAction(key)}
            disabled={!isEnabled || loading !== null}
            className="group flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border border-gray-200 bg-white hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
          >
            <Icon size={13} className="text-gray-400 group-hover:text-purple-500" />
            {label}
          </button>
        ))}
      </div>

      {result && (
        <div className="bg-white border border-purple-100 rounded-xl shadow-sm p-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold text-purple-600 uppercase tracking-wider">AI Suggestion</div>
            <button 
              onClick={() => setResult(null)}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X size={14} />
            </button>
          </div>
          
          {result.action === 'title' ? (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 mb-2">Click a title to apply it:</p>
              {result.titles.map((title, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onTitlesSuggested(title);
                    setResult(null);
                  }}
                  className="w-full text-left p-2.5 text-sm rounded-lg border border-transparent hover:border-purple-200 hover:bg-purple-50 text-gray-700 transition"
                >
                  {title}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {result.text}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onApply(result.text);
                    setResult(null);
                  }}
                  className="flex-1 bg-purple-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-purple-700 transition shadow-sm"
                >
                  Apply to Content
                </button>
                <button
                  onClick={() => handleAction(result.action)}
                  className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 transition"
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