import React from 'react';
import { 
  BarChart, 
  LineChart, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity, 
  Users, 
  Target, 
  MousePointer2, 
  FileText, 
  CheckCircle, 
  BrainCircuit, 
  Clock,
  Sparkles, 
  PieChart, 
  Layers, 
  UserPlus, 
  UserMinus,
  MessageSquare,
  Command,
  HelpCircle,
  Hash,
  Star,
  Zap,
  ChevronRight
} from 'lucide-react';

export default function AIAnalyticsDashboard() {
  return (
    <div className="mt-12 space-y-24 pb-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* SECTION 1: USER INSIGHT (SPLIT LAYOUT) */}
      <section className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center relative py-14 min-h-[60vh]">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="space-y-4 max-w-xl">
           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-indigo-500/30 text-[10px] font-bold text-indigo-400 tracking-widest uppercase">
            <Sparkles size={14} /> Intelligence Suite
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-[1.05] tracking-tighter">
            Measure what <br />
            <span className="text-indigo-400">truly matters.</span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed font-medium">
            Go beyond simple view counts. Our proprietary scoring system analyzes readability, SEO strength, and deep engagement patterns to give your content a professional edge.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-2">
             {[
               { val: '24.8%', lbl: 'Conversion', col: 'text-indigo-400' },
               { val: '12.4K', lbl: 'New Interactions', col: 'text-purple-400' },
             ].map((s, i) => (
                <div key={i} className="space-y-1">
                   <p className={`text-3xl font-black ${s.col} tracking-tighter`}>{s.val}</p>
                   <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{s.lbl}</p>
                </div>
             ))}
          </div>
        </div>

        <div className="relative group">
          {/* Floating Badge */}
          <div className="absolute -top-10 -right-10 glass p-5 rounded-3xl shadow-2xl border-white/10 z-20 animate-float hidden md:flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Target size={24} />
             </div>
             <div>
                <p className="text-sm font-black text-white">Top 5%</p>
                <p className="text-[10px] font-bold text-gray-500 uppercase">Globally Ranked</p>
             </div>
          </div>

          <div className="glass rounded-[2rem] p-6 md:p-8 relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-700 bg-gradient-to-br from-white/[0.03] to-transparent">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            <div className="flex flex-col items-center">
              <div className="relative w-48 h-48 mb-8">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle className="text-white/5" strokeWidth="8" stroke="currentColor" fill="transparent" r="42" cx="50" cy="50"/>
                  <circle className="text-indigo-500 transition-all duration-1000 ease-out" strokeWidth="8" strokeDasharray="264" strokeDashoffset={264 * (1 - 0.92)} strokeLinecap="round" stroke="currentColor" fill="transparent" r="42" cx="50" cy="50" style={{ filter: 'drop-shadow(0 0 12px rgba(99, 102, 241, 0.6))' }}/>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-6xl font-black text-white tracking-tighter">92<span className="text-2xl text-indigo-400">%</span></span>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-2 bg-emerald-500/10 px-3 py-1 rounded-full">Excellent</span>
                </div>
              </div>

              <div className="w-full space-y-6">
                {[
                  { label: 'Readability', value: 88, color: 'bg-indigo-500' },
                  { label: 'Engagement', value: 95, color: 'bg-purple-500' },
                  { label: 'SEO Strength', value: 91, color: 'bg-cyan-500' },
                ].map((m, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                      <span>{m.label}</span>
                      <span className="text-white">{m.value}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full ${m.color} rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(255,255,255,0.2)]`} style={{ width: `${m.value}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: BEHAVIOR & TIMELINE (SPLIT LAYOUT) */}
      <section className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-center py-14 min-h-[60vh] lg:flex-row-reverse relative">
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="order-2 lg:order-1 relative group">
           {/* Floating Mini Chart Card */}
           <div className="absolute -bottom-10 -left-10 glass p-6 rounded-3xl shadow-2xl border-white/10 z-20 animate-float [animation-delay:3s] hidden md:block w-56">
              <div className="flex items-center justify-between mb-4">
                 <span className="text-[10px] font-black text-white uppercase tracking-widest">Active Readers</span>
                 <Activity size={14} className="text-cyan-400" />
              </div>
              <div className="flex gap-1 items-end h-8">
                 {[4, 7, 5, 9, 6, 8, 10].map((h, i) => (
                    <div key={i} className="flex-1 bg-cyan-500/20 rounded-sm" style={{ height: `${h * 10}%` }}></div>
                 ))}
              </div>
              <p className="mt-4 text-xl font-black text-white">1,424 <span className="text-[10px] text-emerald-400 ml-1">+4%</span></p>
           </div>

           <div className="glass rounded-[3rem] p-10 border-white/5 relative overflow-hidden group-hover:scale-[1.01] transition-transform duration-500">
             <div className="flex items-center justify-between mb-12">
               <div>
                  <h3 className="text-white font-black text-2xl tracking-tight">Growth Timeline</h3>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Expansion Index</p>
               </div>
               <div className="flex gap-2">
                  <button className="px-4 py-1.5 rounded-xl bg-indigo-500 text-white text-[11px] font-black group-hover:shadow-lg group-hover:shadow-indigo-500/50 transition-all">W</button>
                  <button className="px-4 py-1.5 rounded-xl text-gray-500 text-[11px] font-bold hover:bg-white/5">M</button>
               </div>
             </div>

             <div className="h-64 mt-12 relative flex items-center justify-center">
                <svg className="w-full h-full overflow-visible p-4" viewBox="0 0 400 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="growthGradV3" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="50%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>
                    <filter id="glowV3">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <path d="M0,90 C50,85 100,20 150,45 C200,70 250,10 300,30 C350,50 400,5 450,5" fill="none" stroke="url(#growthGradV3)" strokeWidth="6" strokeLinecap="round" filter="url(#glowV3)" />
                  <circle cx="150" cy="45" r="6" fill="#a855f7" className="animate-pulse shadow-lg" />
                  <circle cx="300" cy="30" r="6" fill="#22d3ee" className="animate-pulse shadow-lg" />
                </svg>
             </div>
              <div className="flex justify-between mt-8 text-[10px] font-bold text-gray-600 uppercase tracking-widest border-t border-white/5 pt-6">
                  <span>Week 1</span>
                  <span>Week 2</span>
                  <span>Week 3</span>
                  <span>Week 4</span>
             </div>
           </div>
        </div>

        <div className="order-1 lg:order-2 space-y-6 max-w-xl lg:pl-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-purple-500/30 text-[10px] font-bold text-purple-400 tracking-widest uppercase">
            <Activity size={14} /> Performance Velocity
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-[1.1] tracking-tighter">
            Visualize your <br />
            <span className="text-purple-400">upward momentum.</span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed font-medium">
            Our timeline analytics help you pinpoint exactly when and why your content goes viral. Map interaction spikes to platform updates and content themes.
          </p>
          <div className="space-y-6">
             <div className="p-6 glass rounded-2xl border-white/5 flex gap-5 items-center group">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 transition-all duration-500 group-hover:text-white">
                   <MousePointer2 size={24} />
                </div>
                <div>
                   <h4 className="text-white font-black tracking-tight">Scroll Depth</h4>
                   <p className="text-gray-500 text-sm font-medium">Avg. 74% completion across all devices.</p>
                </div>
             </div>
             <div className="p-6 glass rounded-2xl border-white/5 flex gap-5 items-center group">
                <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 transition-all duration-500 group-hover:text-white">
                   <CheckCircle size={24} />
                </div>
                <div>
                   <h4 className="text-white font-black tracking-tight">Read Completion</h4>
                   <p className="text-gray-500 text-sm font-medium">62% of readers reach the conclusion.</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: AI INSIGHTS & JOURNEY (SPLIT LAYOUT) */}
      <section className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center py-14 min-h-[60vh] relative">
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none text-cyan-500"></div>
        
        <div className="space-y-6 max-w-xl">
           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-indigo-500/30 text-[10px] font-bold text-indigo-400 tracking-widest uppercase">
            <BrainCircuit size={14} /> AI Agent Analysis
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-[1.05] tracking-tighter">
            Smart suggestions <br />
            <span className="text-indigo-400">for deep impact.</span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed font-medium">
            Our AI doesn't just show data; it explains it. Receive actionable insights daily that help you choose the right topics, titles, and posting times.
          </p>
          <div className="space-y-4">
            {[
              { t: 'Your content is 35% more likely to be saved on weekends.', icon: Star },
              { t: 'The "AI" category is currently receiving 40% more traffic.', icon: TrendingUp },
            ].map((i, idx) => (
              <div key={idx} className="flex items-center gap-4 text-sm font-bold text-gray-300">
                <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <i.icon size={12} />
                </div>
                {i.t}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative">
           {/* Floating AI Status Card */}
           <div className="absolute top-[20%] -right-12 glass p-5 rounded-3xl shadow-2xl border-white/20 z-20 animate-float hidden md:flex items-center gap-4 w-48">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                 <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              </div>
              <div>
                 <p className="text-[10px] font-black text-white">AI Assistant</p>
                 <p className="text-[8px] font-bold text-gray-500 uppercase">Processing Trends</p>
              </div>
           </div>

           <div className="glass rounded-[2rem] p-6 border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent flex flex-col justify-between hover:-rotate-1 transition-transform duration-500 bg-white/5 shadow-xl backdrop-blur-md">
               <div className="flex items-center gap-3 mb-6">
                  <PieChart size={24} className="text-purple-400" />
                  <h3 className="text-white font-black text-lg tracking-tight">Category Intelligence</h3>
               </div>
               <div className="space-y-4">
                {[
                  { label: 'Technology', percent: 45, color: 'text-indigo-400' },
                  { label: 'AI & Data', percent: 30, color: 'text-purple-400' },
                  { label: 'Business', percent: 25, color: 'text-cyan-400' },
                ].map((c, i) => (
                  <div key={i} className="group">
                     <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{c.label}</span>
                        <span className="text-sm font-black text-white">{c.percent}%</span>
                     </div>
                     <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full ${c.color.replace('text', 'bg')} rounded-full opacity-60`} style={{ width: `${c.percent}%` }}></div>
                     </div>
                  </div>
                ))}
               </div>
           </div>

           <div className="glass rounded-[2rem] p-6 border-white/5 flex flex-col justify-between hover:rotate-1 transition-transform duration-500 [animation-delay:1s] bg-white/5 shadow-xl backdrop-blur-md">
               <h3 className="text-white font-black text-lg tracking-tight mb-6">Engagement Cycle</h3>
               <div className="space-y-3 relative">
                  <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-indigo-500/10"></div>
                  {[
                    { step: 'Discover', icon: Hash },
                    { step: 'Engage', icon: Activity },
                    { step: 'Connect', icon: UserPlus },
                    { step: 'Return', icon: Sparkles },
                  ].map((flow, i) => (
                    <div key={i} className="flex items-center gap-4 relative z-10 group">
                      <div className="w-8 h-8 rounded-lg glass border-white/10 flex items-center justify-center text-gray-500 group-hover:text-indigo-400 transition-colors">
                          <flow.icon size={14} />
                      </div>
                      <span className="text-[11px] font-black text-gray-400 group-hover:text-white">{flow.step}</span>
                    </div>
                  ))}
               </div>
           </div>
        </div>
      </section>

      {/* SECTION 4: TRENDS & TRUST (SPLIT LAYOUT) */}
      <section className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-center py-14 min-h-[60vh] lg:flex-row-reverse relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-indigo-500/10 rounded-full blur-[120px] -z-10 pointer-events-none opacity-50"></div>
        
        <div className="order-2 lg:order-1 relative group">
           {/* Floating Verified Badge */}
           <div className="absolute -top-12 -right-12 glass p-6 rounded-full shadow-2xl border-white/10 z-20 animate-float hidden md:flex items-center justify-center">
              <Star size={32} className="text-amber-400" />
           </div>

           <div className="lg:col-span-8 glass rounded-[2rem] p-8 border-white/5 relative overflow-hidden group-hover:shadow-[0_0_50px_rgba(99,102,241,0.15)] transition-all duration-700">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-white font-black text-2xl tracking-tight">Platform-Wide Trends</h3>
                 <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                    <Sparkles size={14} /> Updated Hourly
                 </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                 {['AI', 'Web3', 'SaaS', 'UI UX', 'Growth'].map((tag, i) => (
                    <div key={i} className="px-4 py-1.5 glass border-white/10 rounded-xl text-[10px] font-black text-gray-400 hover:text-white transition-all cursor-pointer">
                       #{tag}
                    </div>
                 ))}
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <h4 className="text-sm font-black text-white mb-4 uppercase tracking-widest text-indigo-400">Keywords</h4>
                    {[
                      { kw: 'Generative AI', growth: '+240%' },
                      { kw: 'Edge Dev', growth: '+120%' },
                    ].map((k, i) => (
                      <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                         <span className="text-xs font-bold text-gray-300">{k.kw}</span>
                         <span className="text-[10px] font-black text-emerald-400">{k.growth}</span>
                      </div>
                    ))}
                 </div>
                 <div className="space-y-4">
                    <h4 className="text-sm font-black text-white mb-4 uppercase tracking-widest text-purple-400">Top Authors</h4>
                    {[
                      { name: 'Alex Rivera', initial: 'A' },
                      { name: 'Sarah Chen', initial: 'S' },
                    ].map((a, i) => (
                      <div key={i} className="flex gap-4 items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                         <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-black text-white">
                            {a.initial}
                         </div>
                         <span className="text-xs font-bold text-gray-300">{a.name}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        <div className="order-1 lg:order-2 space-y-6 max-w-xl lg:pl-12">
           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-emerald-500/30 text-[10px] font-bold text-emerald-400 tracking-widest uppercase">
            <Users size={14} /> Social Proof
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-[1.1] tracking-tighter">
            Trusted by the <br />
            <span className="text-indigo-400">smart generation.</span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed font-medium">
            Join a community of data-driven storytellers. Our stats aren't just for show — they represent a global network of high-quality content moderation and reader trust.
          </p>
          <div className="space-y-4 pt-4">
            {[
              { label: 'Approval Quality', value: '95%' },
              { label: 'Monthly Readers', value: '50K+' },
            ].map((stat, i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</span>
                <span className="text-2xl font-black text-white tracking-tighter">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL ANALYTICS CTA */}
      <section className="text-center pt-16 pb-8 relative">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/5 rounded-full blur-[120px] -z-10"></div>
         <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass border border-indigo-500/30 text-xs font-black text-indigo-400 mb-6 tracking-[0.2em] uppercase">
           <Zap size={14} /> Power your storytelling
         </div>
         <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-10 leading-[1.05]">
            Unleash the full power of <br />
            <span className="text-indigo-400">behavioral data.</span>
         </h2>
         <div className="flex gap-4 justify-center">
            <button className="btn-primary py-5 px-14 rounded-3xl font-black text-xl shadow-2xl shadow-indigo-500/30 hover:scale-105 transition-transform">
               Activate Intelligence
            </button>
         </div>
      </section>
    </div>
  );
}
