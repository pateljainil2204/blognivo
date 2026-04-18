import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useBlogs } from '../hooks/useBlogs';
import { Search, Activity, Users, Star, MessageSquare, Plus, ChevronRight, LayoutDashboard, BrainCircuit, Eye, FileText, Zap, Target } from 'lucide-react';
import BlogCard from '../components/blog/BlogCard';
import { Link } from 'react-router-dom';
import HomeEnrichment from '../components/home/HomeEnrichment';
import AIAnalyticsDashboard from '../components/home/AIAnalyticsDashboard';
import InteractiveHomeSections from '../components/home/InteractiveHomeSections';

export default function Home() {
  const { blogs, loading, fetchBlogs } = useBlogs();
  useEffect(() => {
    fetchBlogs({ });
  }, [fetchBlogs]);

  // Hardcoded featured blog IDs to freeze the homepage layout
  const featuredBlogIds = [
    "970b73ef-d87e-46ce-9f58-1e76874936dd",
    "9c7fd422-1b58-40e9-b6f8-9244ebf4e447",
    "f190e3d3-0d45-4359-8024-5dec75f578a9",
    "ef277582-6fd1-47dc-aa76-7d4cd1fb5bab",
    "3bac711c-10a0-4729-8153-c19b68fd4f70",
    "7bc3c23f-f780-4b4d-aa47-ca8e4fc7412f"
  ];

  // Limit explicitly chosen blogs for the homepage
  const recentBlogs = blogs.filter(blog => featuredBlogIds.includes(blog.id));

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 relative z-10 w-full overflow-hidden">
      {/* Hero Section */}
      <div className="relative text-center mb-14 pt-8 min-h-[75vh] flex flex-col justify-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-indigo-500/30 text-sm font-medium text-indigo-300 mb-6 animate-pulse-glow">
          <BrainCircuit size={16} /> <span>Next-Gen Publishing Platform</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight leading-tight">
          Write Faster. <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
            Think Bigger.
          </span>
        </h1>

        <p className="text-xl text-gray-400 max-w-xl mx-auto font-medium leading-relaxed mb-6 tracking-tight">
          The premium platform for modern creators. Harness the power of community and beautiful dark mode aesthetics to elevate your content.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-10">
          <button onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })} className="btn-primary flex items-center gap-2 py-4 px-8 text-lg w-full sm:w-auto">
            Explore Articles <ChevronRight size={20} />
          </button>
          <Link to="/signup" className="btn-premium flex items-center gap-2 py-4 px-8 text-lg w-full sm:w-auto border border-white/10 hover:border-white/30">
            Start Writing Free
          </Link>
        </div>
      </div>

      {/* Floating Dashboard Preview (Static UI Only) */}
      <div className="max-w-4xl mx-auto mb-14 relative group">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 pointer-events-none self-end h-[50%] top-auto bottom-0"></div>
        <div className="glass rounded-[2rem] p-6 md:p-8 border border-white/10 shadow-2xl shadow-indigo-500/10 transition-all duration-500 hover:shadow-indigo-500/20 hover:scale-[1.01]">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/5">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Activity size={20} />
                </div>
                <div>
                  <h3 className="text-white font-black text-xl tracking-tight">Blog Performance Report</h3>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">Real-time data stream • Oct 2023</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-950 bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-white glass">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <button className="px-4 py-1.5 rounded-xl glass border border-white/10 text-[11px] font-bold text-gray-300 hover:bg-white/5 transition-colors">Export PDF</button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Views', value: '124.5K', trend: '+12.5%', icon: Eye, color: 'text-indigo-400', progress: 85 },
              { label: 'Avg Reads', value: '4.2K', trend: '+8.2%', icon: FileText, color: 'text-purple-400', progress: 62 },
              { label: 'Engagement', value: '24.8%', trend: '+4.1%', icon: Zap, color: 'text-cyan-400', progress: 45 },
              { label: 'Global Rank', value: '#1,424', trend: '-2%', icon: Target, color: 'text-emerald-400', progress: 92 },
            ].map((stat, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors group/item">
                <div className="flex justify-between items-start mb-3">
                  <div className={`p-2 rounded-lg bg-white/5 ${stat.color} group-hover/item:scale-110 transition-transform`}>
                    <stat.icon size={16} />
                  </div>
                  <span className={`text-[10px] font-black ${stat.trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {stat.trend}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-black text-white tracking-tighter">{stat.value}</p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
                </div>
                <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full opacity-60 rounded-full transition-all duration-1000 ${stat.color.replace('text', 'bg')}`}
                    style={{ width: `${stat.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Explore More Blogs Call to action instead of Search & Filter */}
      <div className="flex justify-between items-end mb-8 max-w-4xl mx-auto px-2">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Recent Insights</h2>
          <p className="text-gray-400 font-medium mt-2">The latest from our community of writers</p>
        </div>
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentBlogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/blogs" className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-base font-bold">
              View All Blogs <ChevronRight size={18} />
            </Link>
          </div>
        </>
      )}

      <InteractiveHomeSections />
      <HomeEnrichment />
      <AIAnalyticsDashboard />
    </div>
  );
}