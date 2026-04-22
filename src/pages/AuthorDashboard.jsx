import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useAnalytics } from '../context/AnalyticsContext';
import { 
  Eye, Heart, PenSquare, Clock, Award, 
  Users, TrendingUp, Sparkles, Activity,
  BarChart3, Settings, Pen, Bookmark, 
  ArrowUpRight, ArrowDownRight,
  Zap, Bell, Plus, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AuthorDashboard() {
  const { user, profile } = useAuth();
  const { authorStats, fetchAuthorStats } = useAnalytics();
  
  const { 
    blogs, totalViews, totalLikes, totalFollowers, totalBookmarks, 
    categoryStats, recentActivity, bestPerformers, loading 
  } = authorStats;

  useEffect(() => {
    fetchAuthorStats();

    // Set up Real-time subscription for dashboard updates
    if (user?.id) {
      const channel = supabase
        .channel('dashboard-updates')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const types = ['like', 'bookmark', 'follow'];
            if (types.includes(payload.new.type)) {
              // Trigger a silent refresh to update counters and activity list
              fetchAuthorStats(true);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id, fetchAuthorStats]);

  const engagementRate = blogs.length > 0 
    ? ((totalLikes + totalBookmarks) / blogs.length).toFixed(1)
    : '0';

  const calculateHealth = (blog) => {
    if (!blog?.views || blog.views === 0) return 0;
    return Math.min(((blog.likes_count || 0) / (blog.views / 15)) * 100, 100).toFixed(0);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 animate-pulse space-y-6">
        <div className="h-64 bg-white/5 rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          <div className="lg:col-span-7 h-96 bg-white/5 rounded-3xl" />
          <div className="lg:col-span-3 h-96 bg-white/5 rounded-3xl" />
        </div>
      </div>
    );
  }

  const latestDraft = blogs.find(b => b.status === 'draft');

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 w-full mb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Author Command Center</h1>
          <p className="text-gray-500 font-medium text-sm mt-1">Real-time performance metrics and content strategy.</p>
        </div>
        <div className="flex items-center gap-3">
          {latestDraft && (
            <Link to={`/editor/${latestDraft.id}`} className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:bg-white/10 transition-all flex items-center gap-2">
              <Pen size={14} /> Resume Draft
            </Link>
          )}
          <Link to="/editor" className="btn-primary flex items-center gap-2 px-6 py-2.5 text-xs font-black uppercase tracking-widest">
            <Plus size={18} /> New Story
          </Link>
        </div>
      </div>

      {/* HERO ANALYTICS CARD */}
      <div className="bg-gradient-to-br from-indigo-600/20 to-indigo-950/40 p-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden mb-6 group">
        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-1000">
          <TrendingUp size={180} />
        </div>
        <div className="relative z-10">
          <h2 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">Core Performance</h2>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <h1 className="text-5xl font-black text-white tracking-tighter mb-2">{totalViews.toLocaleString()}</h1>
              <p className="text-sm font-bold text-gray-400 flex items-center gap-2">
                Total Content Reach
              </p>
            </div>
            <div className="max-w-xs">
              <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                 <p className="text-xs text-gray-300 font-medium leading-relaxed">
                   Your engagement rate per blog is <span className="text-white font-black">{engagementRate}</span> interactions.
                 </p>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* MAIN CONTENT GRID (70/30) */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        
        {/* LEFT COLUMN: 70% */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* BLOG PERFORMANCE LIST */}
          <section className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
               <h3 className="text-lg font-black text-white flex items-center gap-3">
                  <BarChart3 size={20} className="text-indigo-400" /> Project Performance
               </h3>
               <Link to="/my-blogs" className="text-[10px] font-black text-gray-500 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-2">
                  View All <ChevronRight size={14} />
               </Link>
            </div>
            <div className="divide-y divide-white/5">
               {blogs.filter(b => b.status === 'approved').slice(0, 5).map((blog, i) => (
                 <div key={blog.id} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                    <div className="flex items-center gap-6 flex-1 min-w-0 pr-4">
                       <span className="text-[10px] font-black text-gray-600 shrink-0">0{i+1}</span>
                       <div className="truncate">
                          <h4 className="font-bold text-white group-hover:text-indigo-400 transition-colors truncate">{blog.title}</h4>
                          <div className="flex items-center gap-6 mt-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                             <span className="flex items-center gap-1.5"><Eye size={12} /> {blog.views || 0}</span>
                             <span className="flex items-center gap-1.5"><Heart size={12} /> {blog.likes_count || 0}</span>
                          </div>
                       </div>
                    </div>
                    <Link to={`/editor/${blog.id}`} className="p-2.5 bg-white/5 rounded-lg text-gray-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                       <Pen size={14} />
                    </Link>
                 </div>
               ))}
            </div>
          </section>

          {/* CATEGORY METRICS */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="p-8 bg-white/5 rounded-3xl border border-white/10">
                <h3 className="text-sm font-black text-white mb-6 uppercase tracking-widest">Category Distribution</h3>
                <div className="space-y-5">
                   {categoryStats.slice(0, 4).map((cat, i) => (
                     <div key={i}>
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                           <span className="text-gray-400">{cat.name}</span>
                           <span className="text-white">{cat.percentage}% ({cat.count})</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                           <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${cat.percentage}%` }} />
                        </div>
                     </div>
                   ))}
                   {categoryStats.length === 0 && (
                     <p className="text-gray-500 text-sm">No data available yet.</p>
                   )}
                </div>
             </div>
             
             <div className="p-8 bg-white/5 rounded-3xl border border-white/10 relative overflow-hidden">
                <Sparkles className="absolute -bottom-4 -right-4 text-white opacity-5" size={120} />
                <h3 className="text-sm font-black text-white mb-6 uppercase tracking-widest">Audience Insights</h3>
                <div className="grid grid-cols-2 gap-8">
                   <div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Avg Read Time</p>
                      <h4 className="text-2xl font-black text-white">4.2m</h4>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">New Readers</p>
                      <h4 className="text-2xl font-black text-emerald-400">64%</h4>
                   </div>
                </div>
                <div className="mt-8 pt-6 border-t border-white/5">
                   <p className="text-xs text-gray-400 font-medium">Your content shows the highest engagement on <span className="text-white">Wednesdays at 7PM</span>.</p>
                </div>
             </div>
          </section>

        </div>

        {/* RIGHT COLUMN: 30% */}
        <div className="lg:col-span-3 space-y-6">
           
           {/* RECENT ACTIVITY LIST */}
           <section className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/5">
                 <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-widest">
                    <Bell size={16} className="text-indigo-400" /> Recent Activity
                 </h3>
              </div>
              <div className="divide-y divide-white/5">
                 {recentActivity.map((activity, i) => (
                   <div key={i} className="p-5 flex gap-4 group">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                        activity.type === 'like' ? 'bg-pink-500/10 text-pink-400' : 
                        activity.type === 'bookmark' ? 'bg-amber-500/10 text-amber-400' : 
                        'bg-indigo-500/10 text-indigo-400'
                      }`}>
                         {activity.type === 'like' ? <Heart size={14} fill="currentColor" /> : activity.type === 'bookmark' ? <Bookmark size={14} fill="currentColor" /> : <Users size={14} />}
                      </div>
                      <div className="min-w-0">
                         <p className="text-xs font-bold text-white truncate">{activity.user}</p>
                         <p className="text-[10px] text-gray-500 font-medium mt-0.5 truncate">
                            {activity.type === 'follow' ? 'Followed you' : `Liked: ${activity.target}`}
                         </p>
                      </div>
                   </div>
                 ))}
                 {recentActivity.length === 0 && (
                   <p className="p-10 text-center text-xs text-gray-500 italic">No recent activity.</p>
                 )}
              </div>
           </section>

           {/* HEALTH SCORE COMPACT */}
           {bestPerformers.views && (
             <div className="p-8 bg-indigo-600 rounded-3xl text-white shadow-xl relative overflow-hidden group">
                <Award className="absolute -bottom-2 -left-2 text-indigo-400 opacity-20" size={100} />
                <div className="relative z-10 flex flex-col items-center text-center">
                   <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-4">Content Quality Score</p>
                   <div className="text-5xl font-black mb-2 tracking-tighter">{calculateHealth(bestPerformers.views)}<span className="text-xl text-indigo-200">/100</span></div>
                   <p className="text-xs font-bold text-indigo-100">Performance Status: <span className="text-white">Elite</span></p>
                </div>
             </div>
           )}

           {/* STRATEGY WIDGET */}
           <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
              <div className="flex items-center gap-2">
                 <Zap size={16} className="text-amber-400" />
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Growth Tip</span>
              </div>
              <p className="text-xs text-gray-300 font-medium leading-relaxed">
                Articles with <span className="text-white font-bold">5+ code snippets</span> receive 40% more bookmarks in your niche.
              </p>
              <button className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-black text-white uppercase tracking-widest transition-all">
                Analyze Strategy
              </button>
           </div>

        </div>

      </div>
    </div>
  );
}