import { BookOpen, Star, ShieldCheck, Users, Zap, BarChart3, Globe, Shield } from 'lucide-react';

export default function AuthCreativePanel() {
  return (
    <div className="relative flex flex-col justify-between h-full w-full px-12 lg:px-16 py-8 lg:py-10 overflow-hidden bg-gradient-to-br from-[#0b0f1a] via-[#0f172a] to-[#020617] text-white">
      
      {/* Background Glows & Mesh */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] -left-[20%] w-[800px] h-[800px] bg-purple-600/15 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen"></div>
        <div className="absolute top-[50%] left-[30%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[100px] mix-blend-screen"></div>
      </div>

      {/* TOP SECTION */}
      <div className="relative z-10 w-full">
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 shadow-lg shadow-purple-600/20">
            <BookOpen size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">BlogNivo</span>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 mb-4 w-fit">
          <Users size={12} className="text-purple-400" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-gray-300">Join 10,000+ Creators</span>
        </div>

        <h2 className="text-3xl lg:text-4xl font-extrabold leading-[1.1] tracking-tight mb-3">
          Chart your path to <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-violet-500">success</span>
        </h2>
        
        <p className="text-xs lg:text-sm text-gray-400 font-medium leading-relaxed max-w-md">
          The all-in-one platform for modern writers. Build your audience, track your growth, and monetize your content.
        </p>
      </div>

      {/* MIDDLE SECTION (GRID) */}
      <div className="relative z-10 w-full grid grid-cols-2 gap-6 items-center my-6">
        
        {/* Left Column: Features */}
        <div className="space-y-3">
          {[
            { icon: Zap, title: "AI-Powered Writing" },
            { icon: BarChart3, title: "Advanced Analytics" },
            { icon: Globe, title: "Engaged Community" },
            { icon: Shield, title: "Fast & Reliable" }
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-3 group">
              <div className="flex-shrink-0 w-8 h-8 rounded-md bg-white/[0.03] border border-white/5 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/10 group-hover:text-purple-300 transition-colors">
                <feature.icon size={14} />
              </div>
              <h4 className="text-xs lg:text-sm font-bold text-gray-200">{feature.title}</h4>
            </div>
          ))}
        </div>

        {/* Right Column: Analytics Card */}
        <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-gray-200 tracking-wide">Overview</h3>
            <select className="bg-white/5 border border-white/10 rounded text-[9px] px-1 py-0.5 text-gray-400 outline-none">
              <option>30 Days</option>
            </select>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-white/[0.03] border border-white/5 rounded-lg p-2">
              <p className="text-[8px] text-gray-500 font-bold uppercase mb-0.5">Reads</p>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-black text-white">128K</span>
              </div>
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-lg p-2">
              <p className="text-[8px] text-gray-500 font-bold uppercase mb-0.5">Followers</p>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-black text-white">8.4K</span>
              </div>
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-lg p-2">
              <p className="text-[8px] text-gray-500 font-bold uppercase mb-0.5">Posts</p>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-black text-white">42</span>
              </div>
            </div>
          </div>

          {/* Line Chart */}
          <div className="mb-3">
            <p className="text-[9px] font-bold text-gray-400 mb-1">Reads Trend</p>
            <div className="h-16 w-full relative flex items-end">
              <svg viewBox="0 0 400 100" className="w-full h-full overflow-visible preserve-3d">
                <line x1="0" y1="50" x2="400" y2="50" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                <line x1="0" y1="100" x2="400" y2="100" stroke="rgba(255,255,255,0.1)" />
                <path 
                  d="M 0 80 C 50 80, 80 50, 130 60 C 180 70, 220 20, 270 30 C 320 40, 360 10, 400 5" 
                  fill="none" 
                  stroke="url(#lineGradient)" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                />
                <path 
                  d="M 0 80 C 50 80, 80 50, 130 60 C 180 70, 220 20, 270 30 C 320 40, 360 10, 400 5 L 400 100 L 0 100 Z" 
                  fill="url(#areaGradient)" 
                  className="opacity-50"
                />
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#9333ea" />
                    <stop offset="100%" stopColor="#d946ef" />
                  </linearGradient>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9333ea" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#9333ea" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Donut Charts / Bottom Section */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2 flex items-center justify-between">
              <p className="text-[8px] font-bold text-gray-500 uppercase">Categories</p>
              <div className="relative w-6 h-6">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4"></circle>
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#a855f7" strokeWidth="4" strokeDasharray="60 40" strokeDashoffset="0"></circle>
                </svg>
              </div>
            </div>
            
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2 flex items-center justify-between">
              <p className="text-[8px] font-bold text-gray-500 uppercase">Device</p>
              <div className="relative w-6 h-6">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4"></circle>
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#d946ef" strokeWidth="4" strokeDasharray="75 25" strokeDashoffset="0"></circle>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="relative z-10 flex items-center gap-4 pt-4 border-t border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`w-8 h-8 rounded-full border border-[#0f172a] flex items-center justify-center text-[10px] font-bold text-white shadow-lg z-${10-i}
                ${i === 1 ? 'bg-purple-600' : i === 2 ? 'bg-violet-500' : 'bg-indigo-500'}`}>
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
          <div>
            <div className="flex text-yellow-500 gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={10} fill="currentColor" />)}
            </div>
            <p className="text-[10px] text-gray-400 font-medium leading-none mt-1">10,000+ guided</p>
          </div>
        </div>
        
        <div className="h-6 w-px bg-white/10 mx-2"></div>
        
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-400">
            <ShieldCheck size={12} className="text-emerald-400" /> Secure
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-400">
            <Users size={12} className="text-purple-400" /> Trusted
          </div>
        </div>
      </div>

    </div>
  );
}
