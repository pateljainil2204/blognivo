import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useBlogs } from '../hooks/useBlogs';
import { Heart, Bookmark, User, Loader2, Clock, BookOpen, Search, LayoutDashboard, ArrowRight, Activity, TrendingUp, Star, BarChart3, ChevronRight, Calendar, Flame, MessageSquare, Compass, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function UserDashboard() {
  const { user, profile } = useAuth();
  const { toggleLike, toggleBookmark } = useBlogs();
  
  const [likes, setLikes] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [following, setFollowing] = useState([]);
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedLoading, setFeedLoading] = useState(false);
  const [tab, setTab] = useState('bookmarks');

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [bmRes, likeRes, followRes] = await Promise.all([
        supabase
          .from('bookmarks')
          .select('*, blogs(*, users!blogs_author_id_fkey(name, avatar))')
          .eq('user_id', user.id),
        supabase
          .from('likes')
          .select('*, blogs(*, users!blogs_author_id_fkey(name, avatar))')
          .eq('user_id', user.id),
        supabase
          .from('follows')
          .select('*, users!follows_following_id_fkey(name, avatar, bio)')
          .eq('follower_id', user.id),
      ]);
      setBookmarks(bmRes.data || []);
      setLikes(likeRes.data || []);
      setFollowing(followRes.data || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      toast.error('Failed to load your activity');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchFeed = useCallback(async () => {
    if (!user) return;
    setFeedLoading(true);
    try {
      // Get all following IDs
      const { data: followData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);
      
      const followingIds = (followData || []).map(f => f.following_id);
      
      if (followingIds.length === 0) {
        setFeed([]);
        setFeedLoading(false);
        return;
      }

      // Fetch approved blogs from followed authors
      const { data: feedData } = await supabase
        .from('blogs')
        .select('*, users!blogs_author_id_fkey(name, avatar)')
        .in('author_id', followingIds)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(30);
      
      setFeed(feedData || []);
    } catch (err) {
      toast.error('Failed to load your feed');
    } finally {
      setFeedLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchData();
  }, [user, fetchData]);

  useEffect(() => {
    if (user && tab === 'feed') fetchFeed();
  }, [user, tab, fetchFeed]);

  const handleUnfollow = async (authorId) => {
    try {
      await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', authorId);
      toast.success('Unfollowed successfully');
      fetchData();
      if (tab === 'feed') fetchFeed();
    } catch (err) {
      toast.error('Failed to unfollow');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse relative z-10 w-full overflow-hidden">
        <div className="h-40 bg-white/5 rounded-[2.5rem] mb-12 border border-white/10" />
        <div className="h-10 bg-white/5 w-64 rounded-xl mb-8" />
        <div className="grid gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl border border-white/10" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 relative z-10 w-full overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>
      
      {/* Floating Analytics Elements */}
      <div className="absolute top-20 right-10 glass px-4 py-2 rounded-full border border-white/10 animate-[float_6s_ease-in-out_infinite] hidden lg:flex items-center gap-2 shadow-lg shadow-indigo-500/10 z-20">
        <TrendingUp size={14} className="text-emerald-400" />
        <span className="text-[10px] font-black text-white uppercase tracking-widest">+20% Reading this week</span>
      </div>
      <div className="absolute top-48 right-32 glass px-4 py-2 rounded-full border border-white/10 animate-[float_7s_ease-in-out_infinite_1s] hidden lg:flex items-center gap-2 shadow-lg shadow-pink-500/10 z-20">
        <Star size={14} className="text-pink-400" />
        <span className="text-[10px] font-black text-white uppercase tracking-widest">Top category: AI</span>
      </div>

      {/* Premium Header */}
      <div className="mb-12 relative z-10">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
          Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{profile?.name || 'Reader'}</span>
        </h1>
        <p className="text-lg text-gray-400 font-medium tracking-tight">Here's your activity overview and personalized analytics.</p>
      </div>

      {/* Metric Cards (4 cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Total Blogs Read', value: (feed.length + bookmarks.length * 2) || 12, icon: BookOpen, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
          { label: 'Likes Given', value: likes.length, icon: Heart, color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
          { label: 'Saved Bookmarks', value: bookmarks.length, icon: Bookmark, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
          { label: 'Following Authors', value: following.length, icon: User, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
        ].map((stat, i) => (
          <div key={i} className="glass p-6 rounded-3xl border border-white/10 shadow-lg relative overflow-hidden group hover:border-white/20 transition-colors">
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-[30px] opacity-20 ${stat.color.split(' ')[1]}`}></div>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 border ${stat.color} transition-transform group-hover:scale-110`}>
              <stat.icon size={18} />
            </div>
            <p className="text-3xl font-black text-white tracking-tight shadow-sm">{stat.value}</p>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Analytics & Content */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Analytics Visuals Row 1 */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Reading Heatmap */}
            <div className="glass p-6 rounded-3xl border border-white/10 shadow-lg flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-pink-400" />
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Reading Heatmap</h3>
                </div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md">This Week</span>
              </div>
              <div className="grid grid-cols-7 gap-2 flex-grow content-center">
                {['M','T','W','T','F','S','S'].map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all hover:scale-110 cursor-pointer ${
                      [2, 4, 6].includes(i) ? 'bg-indigo-500/80 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]' :
                      [1, 3].includes(i) ? 'bg-indigo-500/40 text-white/80' :
                      'bg-white/5 border border-white/10 text-gray-500 hover:text-white'
                    }`}>
                      {d}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] uppercase font-black tracking-widest text-gray-500">
                <span>Less</span>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-white/5 border border-white/10"></div>
                  <div className="w-3 h-3 rounded-sm bg-indigo-500/40"></div>
                  <div className="w-3 h-3 rounded-sm bg-indigo-500/80"></div>
                </div>
                <span>More</span>
              </div>
            </div>

            {/* Interaction Breakdown */}
            <div className="glass p-6 rounded-3xl border border-white/10 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Activity size={16} className="text-cyan-400" />
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Interactions</h3>
                </div>
                <div className="space-y-5">
                  {[
                    { label: 'Likes Given', value: 45, max: 50, color: 'bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]' },
                    { label: 'Comments', value: 12, max: 20, color: 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]' },
                    { label: 'Bookmarks', value: 28, max: 40, color: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' },
                  ].map((item, i) => (
                    <div key={i} className="group">
                      <div className="flex justify-between text-[11px] font-bold text-gray-400 mb-2">
                        <span className="uppercase tracking-widest text-[9px] group-hover:text-white transition-colors">{item.label}</span>
                        <span className="text-white bg-white/5 px-2 py-0.5 rounded text-[10px]">{item.value}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5 relative">
                        <div className={`absolute top-0 left-0 h-full rounded-full ${item.color} opacity-90`} style={{ width: `${(item.value/item.max)*100}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Visuals Row 2 */}
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* AI Personal Insight */}
            <div className="glass p-6 rounded-3xl border border-indigo-500/30 shadow-lg bg-gradient-to-b from-indigo-500/10 to-transparent flex flex-col">
              <div className="flex items-center gap-2 mb-5">
                <Sparkles size={16} className="text-indigo-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-widest">AI Insight</h3>
              </div>
              <div className="space-y-4 flex-grow flex flex-col justify-center">
                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm p-4 text-sm font-medium text-gray-300 tracking-tight leading-relaxed shadow-sm hover:scale-[1.02] transition-transform origin-left cursor-default group">
                  You prefer <span className="text-indigo-400 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded group-hover:bg-indigo-500/20 transition-colors">short blogs under 5 minutes</span>. We've adjusted your recommended feed to prioritize bite-sized reads!
                </div>
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl rounded-tr-sm p-4 text-sm font-medium text-gray-300 tracking-tight leading-relaxed ml-8 shadow-sm hover:scale-[1.02] transition-transform origin-right cursor-default group">
                  <span className="text-cyan-400 font-bold bg-cyan-500/20 px-1.5 py-0.5 rounded group-hover:bg-cyan-500/30 transition-colors">Artificial Intelligence</span> is your most read category this week. Keep exploring!
                </div>
              </div>
            </div>

            {/* Time Spent Analytics */}
            <div className="glass p-6 rounded-3xl border border-white/10 shadow-lg bg-gradient-to-br from-slate-900 to-indigo-900/20 flex flex-col justify-between group overflow-hidden relative">
              <div className="absolute right-0 bottom-0 opacity-5 group-hover:opacity-10 transition-opacity transform translate-x-1/4 translate-y-1/4 pointer-events-none">
                <Clock size={150} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <Clock size={16} className="text-amber-400" />
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Total Time Reading</h3>
                </div>
                <div className="flex items-end gap-3 mb-6">
                  <span className="text-6xl font-black text-white tracking-tight">12h <span className="text-3xl text-gray-400">45m</span></span>
                </div>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5 mb-5 relative">
                  <div className="absolute top-0 left-0 h-full rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)] w-[80%]"></div>
                </div>
                <p className="text-[11px] font-black text-emerald-400 flex items-center gap-1.5 uppercase tracking-widest">
                  <TrendingUp size={14} className="bg-emerald-400/20 p-0.5 rounded" /> ↑ 20% from last week
                </p>
              </div>
            </div>
            
          </div>

          {/* Main Content Tabs (Feed/Bookmarks/Likes) */}
          <div className="glass p-6 rounded-3xl border border-white/10 shadow-lg">
            <div className="flex items-center gap-6 border-b border-white/10 mb-6 overflow-x-auto custom-scrollbar pb-1">
              {[
                { key: 'feed', icon: <BookOpen size={16} />, label: 'My Feed' },
                { key: 'bookmarks', icon: <Bookmark size={16} />, label: 'Saved Stories' },
                { key: 'likes', icon: <Heart size={16} />, label: 'Liked Articles' },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${tab === t.key ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <div className="flex items-center gap-2">
                    {t.icon} {t.label}
                  </div>
                  {tab === t.key && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 rounded-t-full shadow-[0_-2px_8px_rgba(99,102,241,0.5)]" />}
                </button>
              ))}
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
              {/* Feed Tab */}
              {tab === 'feed' && (
                feedLoading ? (
                  <div className="space-y-4">
                    {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-900 border border-white/5 rounded-2xl animate-pulse" />)}
                  </div>
                ) : feed.length > 0 ? (
                  feed.map(blog => (
                    <div key={blog.id} className="p-5 group flex items-center justify-between gap-4 hover:border-indigo-500/50 hover:bg-white/5 transition-all bg-slate-900/50 border text-gray-300 border-white/5 rounded-2xl">
                      <Link to={`/blog/${blog.id}`} className="flex-1 min-w-0">
                        <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors truncate text-lg tracking-tight">{blog.title}</h3>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
                            <User size={12} /> {blog.users?.name}
                          </span>
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
                            <Clock size={12} /> {new Date(blog.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </Link>
                      <Link to={`/blog/${blog.id}`} className="p-2.5 text-gray-500 hover:text-indigo-400 hover:bg-white/10 rounded-xl transition shrink-0 bg-white/5 border border-white/5">
                        <ArrowRight size={18} />
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 border border-white/5 rounded-2xl border-dashed">
                    <BookOpen size={32} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-white font-bold tracking-tight mb-2">Your feed is empty</p>
                    <p className="text-gray-500 text-sm mb-6">Follow authors to see their latest articles here.</p>
                    <Link to="/blogs" className="btn-primary text-sm px-6 py-2.5 inline-flex">Explore Blogs</Link>
                  </div>
                )
              )}

              {/* Bookmarks Tab */}
              {tab === 'bookmarks' && (
                bookmarks.length > 0 ? (
                  bookmarks.map(bm => (
                    <div key={bm.id} className="p-5 group flex items-center justify-between hover:border-amber-500/50 hover:bg-white/5 transition-all bg-slate-900/50 border text-gray-300 border-white/5 rounded-2xl">
                      <Link to={`/blog/${bm.blogs?.id}`} className="flex-1 truncate pr-4">
                        <h3 className="font-bold text-white group-hover:text-amber-400 transition-colors text-lg tracking-tight truncate">{bm.blogs?.title}</h3>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2 truncate">
                          By {bm.blogs?.users?.name} • Saved {new Date(bm.created_at).toLocaleDateString()}
                        </p>
                      </Link>
                      <button 
                        onClick={() => toggleBookmark(bm.blogs?.id, user.id, true).then(fetchData)}
                        className="p-2.5 text-amber-500 hover:bg-amber-500/10 hover:text-amber-400 rounded-xl transition bg-amber-500/5 border border-amber-500/10 shrink-0"
                      >
                        <Bookmark size={20} fill="currentColor" />
                      </button>
                    </div>
                  ))
                ) : <EmptyState message="You haven't bookmarked any stories yet." />
              )}

              {/* Likes Tab */}
              {tab === 'likes' && (
                likes.length > 0 ? (
                  likes.map(like => (
                    <div key={like.id} className="p-5 group flex items-center justify-between hover:border-pink-500/50 hover:bg-white/5 transition-all bg-slate-900/50 border text-gray-300 border-white/5 rounded-2xl">
                      <Link to={`/blog/${like.blogs?.id}`} className="flex-1 truncate pr-4">
                        <h3 className="font-bold text-white group-hover:text-pink-400 transition-colors text-lg tracking-tight truncate">{like.blogs?.title}</h3>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2 truncate">
                          By {like.blogs?.users?.name} • Liked {new Date(like.created_at).toLocaleDateString()}
                        </p>
                      </Link>
                      <button 
                        onClick={() => toggleLike(like.blogs?.id, user.id, true).then(fetchData)}
                        className="p-2.5 text-pink-500 hover:bg-pink-500/10 hover:text-pink-400 rounded-xl transition bg-pink-500/5 border border-pink-500/10 shrink-0"
                      >
                        <Heart size={20} fill="currentColor" />
                      </button>
                    </div>
                  ))
                ) : <EmptyState message="No liked articles yet. Start exploring!" />
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Shortcuts & Following */}
        <aside className="space-y-6">

          {/* Reading Streak */}
          <div className="glass p-6 rounded-3xl border border-white/10 shadow-lg bg-gradient-to-tr from-amber-500/10 to-transparent relative overflow-hidden group">
            <div className="absolute right-[-20px] top-[-10px] opacity-10 transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
              <Flame size={120} />
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-black text-white tracking-tight mb-2 flex items-center gap-2">
                <Flame className="text-amber-500 group-hover:animate-pulse" size={24} fill="currentColor" /> 5 Day Streak!
              </h3>
              <p className="text-xs font-bold text-gray-400 mb-5 tracking-tight leading-relaxed lg:pr-4">You're on fire! Read tomorrow to keep it going.</p>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5 relative">
                <div className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400 shadow-[0_0_10px_rgba(245,158,11,0.5)] w-[70%]"></div>
              </div>
              <div className="flex justify-between text-[9px] font-black text-gray-500 uppercase tracking-widest mt-3">
                <span>Day 1</span>
                <span>Day 7 Goal</span>
              </div>
            </div>
          </div>

          {/* Reading Level */}
          <div className="glass p-6 rounded-3xl border border-emerald-500/20 shadow-lg relative overflow-hidden bg-gradient-to-bl from-emerald-500/5 to-transparent flex flex-col group">
            <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.07] group-hover:rotate-12 transition-transform duration-1000 pointer-events-none">
              <Compass size={120} />
            </div>
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 relative z-10">
              <Compass size={14} className="group-hover:animate-spin transition-all duration-1000" /> Reader Type
            </p>
            <h3 className="text-2xl font-black text-white tracking-tight mb-3 relative z-10">Explorer 🧭</h3>
            <p className="text-xs font-bold text-gray-400 mb-5 tracking-tight leading-relaxed relative z-10 lg:pr-4">You consistently unearth niche topics and find emerging trends before they hit the mainstream.</p>
            
            <div className="flex flex-wrap gap-2 relative z-10">
              <span className="text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm">Curious</span>
              <span className="text-[9px] font-black bg-white/5 text-gray-400 border border-white/10 px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm">Trend Follower</span>
              <span className="text-[9px] font-black bg-white/5 text-gray-400 border border-white/10 px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm">Deep Reader</span>
            </div>
          </div>
          
          {/* Quick Access UI */}
          <div className="glass p-6 rounded-3xl border border-white/10 shadow-lg">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <LayoutDashboard size={16} className="text-indigo-400" /> Quick Access
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setTab('bookmarks')} className="group p-4 bg-slate-900/80 border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-white/5 hover:border-amber-500/30 transition-colors text-center shadow-lg">
                <Bookmark size={20} className="text-amber-500 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-1 group-hover:text-white">Bookmarks</span>
              </button>
              <button onClick={() => setTab('likes')} className="group p-4 bg-slate-900/80 border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-white/5 hover:border-pink-500/30 transition-colors text-center shadow-lg">
                <Heart size={20} className="text-pink-500 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-1 group-hover:text-white">Liked Posts</span>
              </button>
            </div>
          </div>

          {/* Following List */}
          <div className="glass p-6 rounded-3xl border border-white/10 shadow-lg">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2"><User size={16} className="text-cyan-400" /> Following</span>
              <span className="bg-white/10 text-xs px-2 py-0.5 rounded-full text-gray-300">{following.length}</span>
            </h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
              {following.length > 0 ? (
                following.map(follow => (
                  <div key={follow.id} className="group p-3 flex items-center justify-between hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5 transition-colors">
                    <Link to={`/profile/${follow.following_id}`} className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-inner">
                        {follow.users?.avatar
                          ? <img src={follow.users.avatar} className="w-full h-full rounded-full object-cover" alt={follow.users.name} />
                          : follow.users?.name?.[0]}
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-white text-sm tracking-tight hover:text-cyan-400 transition truncate">{follow.users?.name}</p>
                        <p className="text-[10px] text-gray-500 font-medium truncate uppercase tracking-widest mt-0.5">Author</p>
                      </div>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-xs font-medium text-gray-500">Not following anyone yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Recommended Blogs (Smart UI placeholder) */}
          <div className="glass p-6 rounded-3xl border border-transparent bg-gradient-to-br from-indigo-500/10 to-cyan-500/5 border-indigo-500/20 shadow-lg relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/20 blur-2xl rounded-full"></div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
              <Star size={16} className="text-indigo-400" /> Recommended For You
            </h3>
            <div className="space-y-4 relative z-10">
              {/* Fake UI recommendation */}
              <div className="group cursor-pointer">
                <Link to="/blogs" className="block p-4 bg-slate-900 border border-white/5 rounded-2xl hover:border-indigo-500/30 transition-colors">
                  <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1.5 block">Trending in Tech</span>
                  <h4 className="font-bold text-gray-200 text-sm line-clamp-2 leading-tight group-hover:text-indigo-300 transition-colors">Why AI is the Future of UI Design and Frontend Development</h4>
                </Link>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 relative z-10 text-center">
              <Link to="/blogs" className="text-xs font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors flex items-center justify-center gap-1">
                Explore More <ChevronRight size={14} />
              </Link>
            </div>
          </div>

        </aside>
      </div>

    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="text-center py-20 glass rounded-[2rem] border border-white/10 border-dashed">
      <p className="text-gray-400 font-bold italic">{message}</p>
    </div>
  );
}
