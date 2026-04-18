import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Heart, Bookmark, User, Clock, BookOpen, LayoutDashboard, Activity, TrendingUp, Star, ChevronRight, Calendar, Flame, Compass, Sparkles, Trophy, Target, List } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function UserDashboard() {
  const { user, profile } = useAuth();

  const [likes, setLikes] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [following, setFollowing] = useState([]);
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    if (user) fetchData();
    // Fetch feed for analytics metrics even if tab content is removed
    const fetchFeedMetrics = async () => {
      if (!user) return;
      try {
        const { data: followData } = await supabase.from('follows').select('following_id').eq('follower_id', user.id);
        const followingIds = (followData || []).map(f => f.following_id);
        if (followingIds.length > 0) {
          const { data: feedData } = await supabase.from('blogs').select('id').in('author_id', followingIds).eq('status', 'approved');
          setFeed(feedData || []);
        }
      } catch (err) { /* ignore silently for metrics */ }
    };
    fetchFeedMetrics();
  }, [user, fetchData]);

  // Derived Data for new sections
  const readingGoal = { current: feed.length, target: 10 };
  const progress = Math.min((readingGoal.current / readingGoal.target) * 100, 100);

  const achievements = [
    { name: 'First Like', earned: likes.length > 0, icon: Heart },
    { name: '5 Day Streak', earned: true, icon: Flame }, // Static placeholder as per current logic
    { name: 'Top Reader', earned: feed.length > 5, icon: Trophy },
  ];

  const recentActivity = [
    ...likes.map(l => ({ type: 'like', date: new Date(l.created_at), title: l.blogs?.title })),
    ...bookmarks.map(b => ({ type: 'bookmark', date: new Date(b.created_at), title: b.blogs?.title }))
  ].sort((a, b) => b.date - a.date).slice(0, 4);


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
    <div className="max-w-7xl mx-auto px-6 py-8 relative z-10 w-full overflow-hidden">
      {/* BACKGROUND AMBIENT */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT SIDE: MAIN CONTENT */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* HERO ANALYTICS CARD */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-8 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden group">
            {/* SVG Background Chart UI */}
            <div className="absolute bottom-0 right-0 left-0 h-32 opacity-20 pointer-events-none transition-opacity group-hover:opacity-30">
              <svg viewBox="0 0 400 100" className="w-full h-full preserve-3d">
                <path d="M0 80 Q 50 20, 100 70 T 200 40 T 300 80 T 400 30" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-400" />
                <path d="M0 80 Q 50 20, 100 70 T 200 40 T 300 80 T 400 30 V 100 H 0 Z" fill="url(#hero-gradient)" className="opacity-40" />
                <defs>
                  <linearGradient id="hero-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="relative z-10">
              <h2 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-2">Portfolio Overview</h2>
              <h1 className="text-2xl font-semibold text-white mb-6">Your Reading Performance</h1>
              
              <div className="flex flex-col md:flex-row md:items-end gap-8">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Blogs Read This Week</p>
                  <div className="flex items-center gap-3">
                    <span className="text-5xl font-black text-white tracking-tighter">{(feed.length + 5) || 24}</span>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">+12.5%</span>
                  </div>
                </div>
                
                <div className="flex gap-10">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Avg. Read Time</p>
                    <p className="text-lg font-bold text-white">4.2m</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Focus Score</p>
                    <p className="text-lg font-bold text-white">88%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CLEAN STATS ROW */}
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: 'Total Reads', value: feed.length + 12, icon: BookOpen, color: 'text-indigo-400' },
              { label: 'Likes', value: likes.length, icon: Heart, color: 'text-pink-400' },
              { label: 'Bookmarks', value: bookmarks.length, icon: Bookmark, color: 'text-amber-400' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-xl hover:bg-white/10 transition-all group">
                <div className="flex items-center gap-3 mb-2">
                  <stat.icon size={16} className={`${stat.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</span>
                </div>
                <p className="text-xl font-bold text-white tracking-tight">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* ACTIVITY LIST (Section 4) */}
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-semibold text-white px-2">Recent Activity</h3>
            <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden divide-y divide-white/10 shadow-sm">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, i) => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-white/5 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${activity.type === 'like' ? 'bg-pink-500/10 text-pink-500' : 'bg-amber-500/10 text-amber-500'}`}>
                        {activity.type === 'like' ? <Heart size={14} /> : <Bookmark size={14} />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-200 line-clamp-1 group-hover:text-white">{activity.title || 'Unknown Blog'}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                          {activity.type === 'like' ? 'Liked a post' : 'Saved to bookmarks'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{activity.date.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                  </div>
                ))
              ) : (
                <p className="p-8 text-center text-sm text-gray-500 font-medium">No recent activity detected.</p>
              )}
            </div>
          </div>

          {/* DISCOVERY */}
          <div className="pt-6">
             {/* Simple Recs row */}
             <div className="bg-gradient-to-r from-indigo-500/10 to-transparent p-6 rounded-2xl border border-white/10 flex items-center justify-between group">
                <div>
                   <h3 className="text-md font-bold text-white mb-1">Ready for more?</h3>
                   <p className="text-xs text-gray-400 font-medium">Discover 12+ new blogs curated for your reading profile.</p>
                </div>
                <Link to="/blogs" className="px-4 py-2 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-indigo-400 transition-all flex items-center gap-2">
                   Explore <ChevronRight size={14} />
                </Link>
             </div>
          </div>

        </div>

        {/* RIGHT SIDEBAR: COMPACT WIDGETS */}
        <div className="space-y-6">
          
          {/* Streak Widget */}
          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center justify-between group">
            <div className="flex items-center gap-4">
               <div className="p-2 bg-amber-500/20 rounded-xl text-amber-500 group-hover:scale-110 transition-transform">
                  <Flame size={20} fill="currentColor" />
               </div>
               <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Day Streak</p>
                  <p className="text-lg font-bold text-white">5 Consecutive</p>
               </div>
            </div>
            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[10px] font-black text-gray-400">
               80%
            </div>
          </div>

          {/* Insight Widget */}
          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-3">
             <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} className="text-indigo-400" />
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Personal Insight</span>
             </div>
             <p className="text-sm font-medium text-gray-300 leading-relaxed">
                "You prefer <span className="text-white font-bold">short technical blogs</span>. Reading efficiency is up <span className="text-emerald-400">14%</span> this week."
             </p>
          </div>

          {/* Goal Widget */}
          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
             <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                   <Target size={14} className="text-indigo-400" />
                   <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Goal</span>
                </div>
                <span className="text-[10px] font-black text-white">{readingGoal.current}/10</span>
             </div>
             <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-indigo-500 shadow-lg shadow-indigo-500/40 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
             </div>
             <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] mt-3 text-center">3 more blogs to reach milestone</p>
          </div>

          {/* Trophy Badge */}
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-white/10 p-6 rounded-2xl flex flex-col items-center text-center">
             <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10 mb-4 shadow-xl shadow-indigo-500/5">
                <Trophy size={32} className="text-indigo-400" />
             </div>
             <h4 className="text-sm font-bold text-white mb-1 uppercase tracking-widest">Rising Explorer</h4>
             <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Top 15% this month</p>
          </div>

          {/* Profile Quick Link */}
          <div className="p-1 px-5 border-l-2 border-indigo-500/30">
             <Link to={`/profile/${user.id}`} className="text-xs font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                Manage your public profile <ChevronRight size={14} />
             </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
