import React from 'react';
import { 
  PenTool, 
  UploadCloud, 
  ShieldCheck, 
  Eye, 
  Activity, 
  Users, 
  Clock, 
  TrendingUp, 
  Heart, 
  Bookmark, 
  UserPlus,
  Zap,
  Brain,
  Layout,
  MessageSquare,
  ChevronRight,
  TrendingUp as ChartIcon,
  BarChart3 as BarIcon
} from 'lucide-react';

export default function HomeEnrichment() {
  return (
    <div className="mt-12 space-y-24 pb-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 1. HOW IT WORKS SECTION */}
      <section className="py-14 min-h-[60vh] flex flex-col justify-center">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-indigo-500/30 text-xs font-bold text-indigo-400 mb-3 tracking-widest uppercase">
            <Zap size={14} /> The Workflow
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-3 tracking-tight leading-tight">
            From Idea to <span className="text-indigo-500">Global Readership.</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed tracking-tight">
            Your journey from inspiration to publication in four simple, highly-optimized steps designed for clarity and impact.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-[2rem] left-[10%] right-[10%] h-0.5 border-t-2 border-dashed border-indigo-500/10 -z-0"></div>

          {[
            { icon: PenTool, title: 'Write Blog', desc: 'Craft your story with our AI-powered editor.' },
            { icon: UploadCloud, title: 'Publish Request', desc: 'Submit your draft for moderation.' },
            { icon: ShieldCheck, title: 'Admin Approval', desc: 'Clean, safe content for our community.' },
            { icon: Eye, title: 'Users Read', desc: 'Connect with readers across the globe.' },
          ].map((step, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-20 h-20 glass border-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-indigo-500 transition-all duration-500 shadow-xl shadow-indigo-500/5 hover:shadow-indigo-500/20 group-hover:-translate-y-2">
                <step.icon size={32} className="text-indigo-400" />
              </div>
              <h3 className="text-white font-black text-xl mb-3 tracking-tight">{step.title}</h3>
              <p className="text-gray-500 text-sm px-4 leading-relaxed font-medium">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 2. GROWTH METRICS (REFECTORED TO SPLIT) */}
      <section className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center py-14 min-h-[60vh] relative">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="space-y-8 max-w-xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-purple-500/30 text-[10px] font-bold text-purple-400 tracking-widest uppercase">
            Real-time Monitoring
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-[1.1] tracking-tighter">
            Visualize your growth <br />
            <span className="text-purple-400">with precision.</span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed tracking-tight">
            Our platform provides granular data on every interaction. From total readership to engagement plateaus, we track everything so you don't have to.
          </p>
          <ul className="space-y-4">
            {['Track every view globally', 'Analyze engagement deltas', 'Compare platform-wide stats'].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm font-bold text-gray-300">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <ChevronRight size={14} />
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-6 relative">
          {/* Floating Element 1 */}
          <div className="absolute -top-6 -right-6 glass p-4 rounded-2xl shadow-2xl border-white/10 z-20 animate-float hidden md:block">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                   <TrendingUp size={16} />
                </div>
                <div>
                   <p className="text-[10px] font-black text-white">Top 5%</p>
                   <p className="text-[8px] font-bold text-emerald-400 uppercase">Performer</p>
                </div>
             </div>
          </div>

          {[
            { label: 'Total Blogs', value: '1,245', icon: PenTool, color: 'text-indigo-400' },
            { label: 'Total Users', value: '8.4K', icon: Users, color: 'text-purple-400' },
            { label: 'Engagement', value: '24.8%', icon: Activity, color: 'text-cyan-400' },
            { label: 'Avg Read Time', value: '4.5m', icon: Clock, color: 'text-emerald-400' },
          ].map((stat, i) => (
            <div key={i} className="group glass p-5 rounded-3xl border-white/5 hover:border-white/10 transition-all duration-500 hover:scale-105 relative overflow-hidden bg-white/5">
              <div className={`${stat.color} mb-4`}>
                <stat.icon size={28} />
              </div>
              <h3 className="text-2xl font-black text-white mb-1 tracking-tighter">{stat.value}</h3>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-[9px]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. ANALYTICS DASHBOARD PREVIEW & 4. BENEFITS (REFECTORED TO SPLIT) */}
      <section className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-center py-14 min-h-[60vh] lg:flex-row-reverse">
        <div className="order-2 lg:order-1 relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-[3rem] blur-2xl pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity"></div>
          
            <div className="relative glass rounded-[2.5rem] p-6 md:p-8 border-white/10 overflow-hidden shadow-2xl">
              {/* Floating Element 2 */}
              <div className="absolute bottom-6 -right-10 glass p-5 rounded-3xl shadow-2xl border-white/20 z-20 animate-float [animation-delay:2s] hidden md:block w-48">
                 <div className="space-y-3">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Growth Rate</span>
                       <span className="text-emerald-400 font-black">+32%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 w-[78%] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    </div>
                 </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-black text-xl tracking-tight flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
                    <TrendingUp size={18} />
                  </div> 
                  Metric Evolution
                </h3>
              </div>
              
              <div className="h-40 w-full mb-6 relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 400 100" preserveAspectRatio="none">
                <defs>
                   <linearGradient id="enrichGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                     <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                     <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                   </linearGradient>
                </defs>
                <path d="M0,80 Q50,70 100,50 T200,60 T300,30 T400,10" fill="none" stroke="#6366f1" strokeWidth="4" className="filter drop-shadow-[0_0_12px_rgba(99,102,241,0.6)]" strokeLinecap="round" />
                <path d="M0,80 Q50,70 100,50 T200,60 T300,30 T400,10 V100 H0 Z" fill="url(#enrichGrad)" />
                {[0, 100, 200, 300, 400].map((x, i) => (
                  <circle key={i} cx={x} cy={i === 0 ? 80 : i === 1 ? 50 : i === 2 ? 60 : i === 3 ? 30 : 10} r="5" fill="#6366f1" className="animate-pulse" />
                ))}
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
               {[
                 { label: 'Likes', icon: Heart, val: '2.4K', col: 'text-pink-400', bar: 'bg-pink-500', perc: '75%' },
                 { label: 'Saves', icon: Bookmark, val: '842', col: 'text-cyan-400', bar: 'bg-cyan-500', perc: '45%' },
               ].map((item, i) => (
                 <div key={i} className="p-5 bg-white/5 rounded-2xl border border-white/5">
                   <div className="flex items-center gap-2 mb-3">
                     <item.icon size={14} className={item.col} />
                     <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{item.label}</span>
                   </div>
                   <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-3">
                     <div className={`h-full ${item.bar} rounded-full`} style={{ width: item.perc }}></div>
                   </div>
                   <p className="text-white font-black text-lg">{item.val}</p>
                 </div>
               ))}
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2 space-y-6 max-w-xl lg:pl-12">
          <h2 className="text-4xl md:text-5xl font-black text-white leading-[1.05] tracking-tighter">
            Smart tools <br />
            <span className="text-indigo-400">for modern writers.</span>
          </h2>
          <div className="space-y-5">
            {[
              { icon: Brain, title: 'AI-Driven Insights', desc: 'Get suggestions based on reader behavior and engagement patterns.' },
              { icon: Zap, title: 'Instant Performance', desc: 'Real-time feedback on your latest publications and interactions.' },
              { icon: Layout, title: 'Engagement Tools', desc: 'Built-in tools to boost your readership and retention.' },
            ].map((benefit, i) => (
              <div key={i} className="flex gap-6 group">
                <div className="w-14 h-14 shrink-0 glass border-white/5 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500">
                  <benefit.icon size={26} />
                </div>
                <div>
                  <h4 className="text-white font-black text-xl mb-2 tracking-tight">{benefit.title}</h4>
                  <p className="text-gray-400 leading-relaxed font-medium">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. ENGAGEMENT PREVIEW (REFECTORED TO SPLIT) */}
      <section className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center py-14 min-h-[60vh] relative">
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="space-y-8 max-w-xl">
           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-cyan-500/30 text-[10px] font-bold text-cyan-400 tracking-widest uppercase">
            Community Interaction
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-[1.1] tracking-tighter">
            Build connections <br />
            <span className="text-cyan-400">that truly matter.</span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed tracking-tight">
            Our platform isn't just about reading; it's about connecting. Engage with authors, follow your favorite topics, and save articles for later with a single click.
          </p>
          <div className="flex gap-12 pt-4">
             <div>
                <p className="text-3xl font-black text-white tracking-tighter">50K+</p>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Active Users</p>
             </div>
             <div>
                <p className="text-3xl font-black text-white tracking-tighter">120K+</p>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Monthly Likes</p>
             </div>
          </div>
        </div>

        <div className="relative group">
           {/* Floating Interaction Badges */}
           <div className="absolute -top-12 -left-12 glass p-4 rounded-2xl shadow-2xl border-white/10 z-20 animate-float hidden md:flex items-center gap-3">
              <div className="flex -space-x-2">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-indigo-500 flex items-center justify-center text-[10px] font-black text-white">
                      {String.fromCharCode(64 + i)}
                   </div>
                 ))}
              </div>
              <p className="text-[10px] font-bold text-gray-300">New followers</p>
           </div>

           <div className="card-premium overflow-hidden group border-white/5 relative z-10 transition-transform duration-700 hover:scale-[1.02]">
            <div className="h-64 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 flex items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 bg-white/5 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-8 z-20">
                 <button className="p-5 rounded-full glass border-white/20 hover:bg-pink-500/20 hover:scale-110 transition-all text-pink-400 hover:text-pink-300">
                    <Heart size={32} />
                 </button>
                 <button className="p-5 rounded-full glass border-white/20 hover:bg-cyan-500/20 hover:scale-110 transition-all text-cyan-400 hover:text-cyan-300">
                    <Bookmark size={32} />
                 </button>
                 <button className="p-5 rounded-full glass border-white/20 hover:bg-indigo-500/20 hover:scale-110 transition-all text-indigo-400 hover:text-indigo-300">
                    <UserPlus size={32} />
                 </button>
               </div>
               <Layout size={80} className="text-indigo-400/10 group-hover:scale-125 transition-transform duration-1000" strokeWidth={1} />
            </div>
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 p-[1px]">
                   <div className="w-full h-full rounded-xl bg-slate-950 flex items-center justify-center text-white font-black">JD</div>
                 </div>
                 <div>
                    <h4 className="text-white font-black text-lg tracking-tight">Jane Doe</h4>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Premium Author</p>
                 </div>
              </div>
              <h3 className="text-2xl font-black text-white mb-6 tracking-tighter leading-tight group-hover:text-indigo-400 transition-colors">How to engineer <br /> high-converting AI narratives.</h3>
              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                 <div className="flex gap-10">
                    <div className="flex items-center gap-3 text-gray-400 font-black text-sm">
                       <Heart size={20} className="text-pink-500/50" /> 1.2K
                    </div>
                    <div className="flex items-center gap-3 text-gray-400 font-black text-sm">
                       <MessageSquare size={20} className="text-indigo-500/50" /> 84
                    </div>
                 </div>
                 <button className="btn-primary py-3 px-8 text-sm font-black tracking-tight">Read Full Story</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRUST METRICS SECTION */}
      <section className="relative py-14 glass rounded-[3rem] border-white/5 shadow-2xl group overflow-hidden bg-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center relative z-10 px-8">
          {[
            { label: 'Published Blogs', value: '10K+' },
            { label: 'Active Users', value: '5K+' },
            { label: 'Quality Score', value: '99%' },
            { label: 'Engagement', value: '25%' },
          ].map((metric, i) => (
            <div key={i} className="space-y-2 group">
               <h3 className="text-3xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-br from-white via-indigo-200 to-indigo-500 group-hover:scale-110 transition-transform duration-500 tracking-tighter">
                 {metric.value}
               </h3>
               <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                 {metric.label}
               </p>
            </div>
          ))}
        </div>
        
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] animate-pulse [animation-delay:2s]"></div>
      </section>

      {/* Final CTA */}
      <section className="text-center py-16 relative">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/5 rounded-full blur-[120px] -z-10"></div>
        <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter leading-tight">
           Ready to share your <br />
           <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">knowledge?</span>
        </h2>
        <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
           <a href="/signup" className="btn-primary px-16 py-6 text-2xl font-black shadow-2xl shadow-indigo-500/40 hover:scale-105 transition-transform">
             Get Started Now
           </a>
           <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="glass px-16 py-6 text-2xl font-black border-white/10 hover:border-white/20 rounded-2xl hover:bg-white/5 transition-all">
              Back to top
           </button>
        </div>
      </section>
    </div>
  );
}
