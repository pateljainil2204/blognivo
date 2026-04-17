import { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, User, Users, Star, MessageSquare, ExternalLink, RefreshCw, Radio } from 'lucide-react';

const TOP_AUTHORS = [
  { name: 'Alex Rivera', followers: '12.4K', category: 'AI & Tech', avatar: 'AR' },
  { name: 'Sarah Chen', followers: '8.2K', category: 'Creative Writing', avatar: 'SC' },
  { name: 'Marcus J.', followers: '15.1K', category: 'Productivity', avatar: 'MJ' },
  { name: 'Elena Vance', followers: '6.7K', category: 'Philosophy', avatar: 'EV' },
];

const FEED_ITEMS = [
  { text: 'A. Rivera just published "The Future of LLMs"', time: '2m ago' },
  { text: 'Sarah Chen gained 150 new followers', time: '5m ago' },
  { text: 'New trending topic: Meta-Cognition', time: '12m ago' },
  { text: 'Marcus J. reach 15K total reads today', time: '15m ago' },
];

export default function InteractiveHomeSections() {
  const [aiInput, setAiInput] = useState('');
  const [aiOutput, setAiOutput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeActivity, setActiveActivity] = useState(0);

  // Live Activity Feed rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveActivity((prev) => (prev + 1) % FEED_ITEMS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleAiTry = () => {
    if (!aiInput.trim()) return;
    setIsTyping(true);
    setAiOutput('');
    
    const text = `AI Summary: Your thought on "${aiInput}" is fascinating. It reflects a growing trend in digital mindfulness where technology serves as a bridge rather than a barrier. This approach could lead to 40% higher engagement in your next article.`;
    
    let i = 0;
    const interval = setInterval(() => {
      setAiOutput(text.slice(0, i));
      i++;
      if (i > text.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 30);
  };

  return (
    <div className="space-y-24 py-12">
      {/* 1. TRY AI INSTANTLY */}
      <section className="relative">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-white mb-2">Try AI Instantly</h2>
            <p className="text-gray-400">Experience the power of our engine in real-time.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass p-6 rounded-[2rem] border-white/10 shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest pl-1">Your Topic</label>
                <textarea 
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Paste a thought or a short sentence..."
                  className="w-full h-32 bg-white/5 border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-indigo-500/50 transition-colors resize-none placeholder:text-gray-600"
                />
              </div>
              <button 
                onClick={handleAiTry}
                disabled={isTyping}
                className="mt-6 btn-primary w-full flex items-center justify-center gap-2 group"
              >
                {isTyping ? <RefreshCw className="animate-spin" size={20} /> : <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />}
                {isTyping ? 'Generating...' : 'Analyze with AI'}
              </button>
            </div>

            <div className="glass p-6 rounded-[2rem] border-white/10 shadow-xl bg-indigo-500/5 min-h-[200px] flex flex-col">
               <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-4">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Output Preview</span>
               </div>
               <div className="flex-1 text-gray-300 font-medium leading-relaxed italic">
                 {aiOutput || (
                   <span className="text-gray-600">The AI output will appear here as you type...</span>
                 )}
                 {isTyping && <span className="inline-block w-1.5 h-4 bg-indigo-400 ml-1 animate-pulse"></span>}
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. AI INSIGHT OF THE DAY */}
      <section className="px-4">
         <div className="max-w-5xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative glass p-10 md:p-16 rounded-[2.5rem] bg-slate-900/90 flex flex-col md:flex-row items-center gap-10">
               <div className="flex-1 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                     <Star size={14} /> Insight of the day
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black leading-tight">
                    "AI isn't a replacement for the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Writer</span>; it's a bridge to their <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Unconscious</span>."
                  </h2>
                  <p className="text-gray-400 text-lg">
                    Discover how premium creators are using neural networks to double their creative output without losing their unique voice.
                  </p>
               </div>
               <div className="w-full md:w-auto">
                  <button className="btn-premium whitespace-nowrap flex items-center gap-2 text-lg py-4 px-8 group border-indigo-500/30">
                    Explore Trends <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
               </div>
            </div>
         </div>
      </section>

      {/* 3. BEFORE vs AFTER AI */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-white mb-2">Before vs After AI</h2>
          <p className="text-gray-400">Why top authors are switching to BlogNivo.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
           <div className="glass p-8 rounded-[2rem] border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <ArrowRight size={100} className="rotate-45" />
              </div>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-rose-400">
                <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
                  <span className="text-sm font-black">X</span>
                </div>
                Traditional Workflow
              </h3>
              <ul className="space-y-4 text-gray-400 font-medium">
                <li className="flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-600 shrink-0"></div>
                  Manual SEO keyword research
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-600 shrink-0"></div>
                  Hours spent on editing & proofreading
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-600 shrink-0"></div>
                  Guessing which titles perform best
                </li>
              </ul>
           </div>

           <div className="glass p-8 rounded-[2rem] border-indigo-500/20 shadow-lg shadow-indigo-500/10 relative overflow-hidden group">
              <div className="absolute -inset-px bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none"></div>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-emerald-400">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 size={18} />
                </div>
                BlogNivo + AI
              </h3>
              <ul className="space-y-4 text-gray-200 font-medium">
                <li className="flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 shadow-glow"></div>
                  Automated SEO & Tagging
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 shadow-glow"></div>
                  Instant tone & readability optimization
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 shadow-glow"></div>
                  Predictive Title Analytics
                </li>
              </ul>
           </div>
        </div>
      </section>

      {/* 4. LIVE ACTIVITY FEED & 5. TOP AUTHORS */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Activity Feed */}
          <div className="md:col-span-1 glass p-6 rounded-[2rem] border-white/10 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold flex items-center gap-2">
                <Radio size={16} className="text-rose-500 animate-pulse" />
                Live Feed
              </h3>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md">Real-time</span>
            </div>
            
            <div className="space-y-4 flex-1">
              {FEED_ITEMS.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-2xl border transition-all duration-700 ${idx === activeActivity ? 'bg-indigo-500/10 border-indigo-500/20 scale-100 opacity-100' : 'bg-transparent border-transparent opacity-40 scale-95'}`}
                >
                  <p className="text-sm font-medium text-gray-300 leading-tight mb-1">{item.text}</p>
                  <span className="text-[10px] text-gray-500 font-bold">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Authors */}
          <div className="md:col-span-2 glass p-8 rounded-[2rem] border-white/10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold">Top Authors</h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Leading voices this week</p>
              </div>
              <button className="p-2 rounded-full glass border-white/10 hover:bg-white/5 transition-colors">
                <ExternalLink size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {TOP_AUTHORS.map((author, idx) => (
                <div key={idx} className="group cursor-pointer">
                  <div className="relative mb-4">
                    <div className="aspect-square rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-xl font-black text-indigo-300 border border-white/5 group-hover:border-indigo-500/50 transition-all group-hover:scale-105">
                      {author.avatar}
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full glass border border-white/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                         <Star size={12} fill="currentColor" />
                      </div>
                    </div>
                  </div>
                  <h4 className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{author.name}</h4>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">{author.followers} Followers</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
