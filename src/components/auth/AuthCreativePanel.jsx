import { BookOpen, TrendingUp, Users, FileText, Star } from 'lucide-react';

export default function AuthCreativePanel() {
  return (
    <div className="hidden lg:flex flex-col relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 h-full p-12 text-white">
      {/* Abstract Background Shapes */}
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-indigo-400/20 rounded-full blur-3xl"></div>
      
      {/* Logo Section */}
      <div className="relative z-10 mb-20">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 shadow-2xl">
            <BookOpen size={32} />
          </div>
          <span className="text-3xl font-black tracking-tighter">BlogNivo</span>
        </div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center">
        <h2 className="text-5xl font-black leading-tight mb-6">
          Welcome to the <br />
          <span className="text-indigo-200">Creative Hub</span>
        </h2>
        <p className="text-xl text-indigo-100/80 font-medium max-w-md leading-relaxed mb-12">
          Write smarter. Grow faster. Harness the power of AI to elevate your content and reach thousands of readers globally.
        </p>

        {/* Floating Stats UI */}
        <div className="grid grid-cols-2 gap-4 max-w-sm">
          <div className="glass p-4 rounded-2xl border-white/20 animate-float">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-1.5 bg-indigo-500/30 rounded-lg text-indigo-300">
                <FileText size={16} />
              </div>
              <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Blogs</span>
            </div>
            <p className="text-2xl font-black">10K+</p>
          </div>
          
          <div className="glass p-4 rounded-2xl border-white/20 animate-float [animation-delay:1s]">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-1.5 bg-purple-500/30 rounded-lg text-purple-300">
                <Users size={16} />
              </div>
              <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Users</span>
            </div>
            <p className="text-2xl font-black">50K+</p>
          </div>

          <div className="col-span-2 glass p-4 rounded-2xl border-white/20 animate-float [animation-delay:2s]">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-1.5 bg-cyan-500/30 rounded-lg text-cyan-300">
                    <TrendingUp size={16} />
                  </div>
                  <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Monthly Reads</span>
                </div>
                <p className="text-2xl font-black">120K+</p>
              </div>
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-indigo-600 bg-indigo-500/50 flex items-center justify-center text-[10px] font-bold">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Quote */}
      <div className="relative z-10 pt-10 border-t border-white/10 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-indigo-400/20 flex items-center justify-center">
            <Star size={18} className="text-yellow-400 fill-yellow-400" />
        </div>
        <div>
          <p className="text-xs font-bold opacity-60 uppercase tracking-widest leading-none mb-1">Editor's Choice</p>
          <p className="text-sm font-medium italic">"The most premium experience for modern authors."</p>
        </div>
      </div>
    </div>
  );
}
