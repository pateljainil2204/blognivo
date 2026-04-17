import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useBlogs } from '../hooks/useBlogs';
import { Search, Activity, Users, Star, MessageSquare, Plus, ChevronRight, LayoutDashboard, BrainCircuit, Eye } from 'lucide-react';
import BlogCard from '../components/blog/BlogCard';

export default function Home() {
  const { blogs, loading, fetchBlogs } = useBlogs();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchBlogs({ category });
    
    supabase
      .from('categories')
      .select('name')
      .then(({ data }) => {
        if (data) setCategories(data.map((c) => c.name));
      });
  }, [category, fetchBlogs]);

  const filtered = blogs.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.tags?.some((t) => t.includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 relative z-10 w-full overflow-hidden">
      {/* Hero Section */}
      <div className="relative text-center mb-24 pt-16">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-indigo-500/30 text-sm font-medium text-indigo-300 mb-8 animate-pulse-glow">
          <BrainCircuit size={16} /> <span>Next-Gen Publishing Platform</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tight leading-tight">
          Write Faster. <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
            Think Bigger.
          </span>
        </h1>
        
        <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed mb-10">
          The premium platform for modern creators. Harness the power of community and beautiful dark mode aesthetics to elevate your content.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-10">
          <button onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })} className="btn-primary flex items-center gap-2 py-4 px-8 text-lg w-full sm:w-auto">
            Explore Articles <ChevronRight size={20} />
          </button>
          <a href="/signup" className="btn-premium flex items-center gap-2 py-4 px-8 text-lg w-full sm:w-auto border border-white/10 hover:border-white/30">
            Start Writing Free
          </a>
        </div>
      </div>

      {/* Floating Dashboard Preview (Static UI Only) */}
      <div className="max-w-5xl mx-auto mb-32 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 pointer-events-none self-end h-[50%] top-auto bottom-0"></div>
        <div className="glass rounded-[2rem] p-4 md:p-8 border border-white/10 shadow-2xl shadow-indigo-500/10 animate-float">
          
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                <LayoutDashboard className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Creator Studio Overview</h3>
                <p className="text-gray-400 text-sm">Real-time metrics</p>
              </div>
            </div>
            <div className="hidden md:flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-400/80"></div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-4">
            {[
              { label: 'Total Views', value: '124.5K', icon: Eye, color: 'text-indigo-400' },
              { label: 'Engagement', value: '18.2%', icon: Activity, color: 'text-cyan-400' },
              { label: 'Readers', value: '8,432', icon: Users, color: 'text-purple-400' },
              { label: 'Subscribers', value: '2.1K', icon: Star, color: 'text-amber-400' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:bg-white/10 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                    <stat.icon size={20} />
                  </div>
                </div>
                <h4 className="text-3xl font-bold text-white mb-1">{stat.value}</h4>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="glass sticky top-20 z-40 p-4 rounded-[2rem] mb-16 flex flex-col md:flex-row gap-4 max-w-4xl mx-auto border border-white/10 shadow-lg shadow-indigo-500/5">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search blogs, tags, or authors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 pl-12 focus:ring-1 focus:ring-indigo-500/50 outline-none transition font-medium text-white placeholder-gray-500"
          />
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3.5 outline-none focus:ring-1 focus:ring-indigo-500/50 transition cursor-pointer font-bold text-gray-300 text-sm appearance-none"
        >
          <option value="" className="bg-slate-900">All Topics</option>
          {categories.map((c) => (
            <option key={c} value={c} className="bg-slate-900">{c}</option>
          ))}
        </select>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-96 glass rounded-2xl animate-pulse border-white/5" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="max-w-md mx-auto text-center py-24 glass rounded-[3rem] border border-white/10 shadow-lg animate-float mt-12">
              <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-500">
                <Search size={48} strokeWidth={1.5} />
              </div>
              <h2 className="text-3xl font-black text-white mb-3 tracking-tight">No results found</h2>
              <p className="text-gray-400 font-medium px-8 mb-8">We couldn't find any articles matching your search criteria.</p>
              <button 
                onClick={() => { setSearch(''); setCategory(''); }}
                className="btn-primary"
              >
                Clear Filters
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}