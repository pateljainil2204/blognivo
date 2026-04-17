import { Sparkles } from 'lucide-react';

export default function AISummary({ summary, keyPoints }) {
  if (!summary) return null;

  return (
    <div className="glass border border-indigo-500/30 rounded-2xl p-6 mb-8 shadow-lg shadow-indigo-500/10 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>
      <div className="flex items-center gap-2 text-indigo-300 font-bold mb-3 uppercase tracking-wider text-xs">
        <Sparkles size={16} className="text-purple-400 animate-pulse" />
        AI Key Insights
      </div>
      
      <p className="text-white leading-relaxed mb-4 text-lg italic relative z-10">
        "{summary}"
      </p>

      {keyPoints?.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-white/10 relative z-10">
          {keyPoints.map((point, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="mt-2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] flex-shrink-0" />
              <p className="text-sm text-gray-300 leading-relaxed font-medium">{point}</p>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6 flex items-center justify-between relative z-10">
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
          Powered by OpenRouter AI
        </p>
      </div>
    </div>
  );
}