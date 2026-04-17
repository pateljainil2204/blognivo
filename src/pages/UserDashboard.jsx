import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useBlogs } from '../hooks/useBlogs';
import { Heart, Bookmark, User, Loader2, Clock, BookOpen, Search, LayoutDashboard, ArrowRight } from 'lucide-react';
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
    <div className="max-w-7xl mx-auto px-4 py-12 relative z-10 w-full">
      <div className="absolute top-0 left-0 -ml-32 -mt-32 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>
      
      {/* Header */}
      <div className="glass card-premium p-8 mb-12 bg-white/5 border border-white/10 shadow-indigo-500/10">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-3xl font-black shadow-lg">
            {profile?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-black text-white tracking-tight">
              Welcome back, {profile?.name || 'Reader'}!
            </h1>
            <p className="text-gray-400 font-medium mt-1">
              Your personalized space for everything you love on BlogNivo.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="text-center px-4 py-2 bg-white/5 rounded-2xl border border-white/10 max-w-[80px]">
              <p className="text-xl font-black text-white">{bookmarks.length}</p>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-tight">Saved</p>
            </div>
            <div className="text-center px-4 py-2 bg-white/5 rounded-2xl border border-white/10 max-w-[80px]">
              <p className="text-xl font-black text-white">{likes.length}</p>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-tight">Liked</p>
            </div>
            <div className="text-center px-4 py-2 bg-white/5 rounded-2xl border border-white/10 max-w-[80px]">
              <p className="text-xl font-black text-white">{following.length}</p>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-tight">Follows</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex flex-col md:flex-row gap-12">
        <div className="flex-1 w-full overflow-hidden">
          <div className="flex items-center gap-2 border-b border-white/10 mb-8 overflow-x-auto custom-scrollbar pb-1">
            {[
              { key: 'bookmarks', icon: <Bookmark size={16} />, label: 'Saved Stories' },
              { key: 'feed', icon: <BookOpen size={16} />, label: 'My Feed' },
              { key: 'likes', icon: <Heart size={16} />, label: 'Liked Articles' },
              { key: 'following', icon: <User size={16} />, label: 'Following' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${tab === t.key ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <div className="flex items-center gap-2">
                  {t.icon} {t.label}
                  {t.key === 'feed' && following.length > 0 && (
                    <span className="bg-indigo-500 text-white text-[8px] rounded-full px-1.5 py-0.5 font-black shrink-0">{following.length}</span>
                  )}
                </div>
                {tab === t.key && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 rounded-t-full shadow-[0_-2px_8px_rgba(99,102,241,0.5)]" />}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {/* Feed Tab */}
            {tab === 'feed' && (
              feedLoading ? (
                <div className="space-y-4">
                  {[1,2,3].map(i => <div key={i} className="h-24 bg-white/5 border border-white/10 rounded-2xl animate-pulse" />)}
                </div>
              ) : feed.length > 0 ? (
                feed.map(blog => (
                  <div key={blog.id} className="card-premium p-5 group flex items-center justify-between gap-4 hover:border-indigo-500/50 hover:bg-white/10 transition-all bg-white/5 border text-gray-300 border-white/5">
                    <Link to={`/blog/${blog.id}`} className="flex-1 min-w-0">
                      <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors truncate text-lg tracking-tight">{blog.title}</h3>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
                          <User size={12} /> {blog.users?.name}
                        </span>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
                          <Clock size={12} /> {new Date(blog.created_at).toLocaleDateString()}
                        </span>
                        {blog.category && (
                          <span className="text-[9px] font-black bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 border border-indigo-500/30 rounded-full uppercase tracking-widest">
                            {blog.category}
                          </span>
                        )}
                      </div>
                    </Link>
                    <Link to={`/blog/${blog.id}`} className="p-2.5 text-gray-500 hover:text-indigo-400 hover:bg-white/10 rounded-xl transition shrink-0 bg-white/5 border border-white/5">
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-24 glass rounded-[2rem] border border-white/10">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center mx-auto mb-4 text-gray-500 shadow-sm">
                    <BookOpen size={32} />
                  </div>
                  <p className="text-white font-bold text-xl tracking-tight mb-2">Your feed is empty</p>
                  <p className="text-gray-400 text-sm mb-6">Follow authors to see their latest articles here.</p>
                  <Link to="/" className="btn-primary text-sm px-6 py-3 inline-flex items-center gap-2">
                    <Search size={16} /> Discover Authors
                  </Link>
                </div>
              )
            )}

            {/* Bookmarks Tab */}
            {tab === 'bookmarks' && (
              bookmarks.length > 0 ? (
                bookmarks.map(bm => (
                  <div key={bm.id} className="card-premium p-5 group flex items-center justify-between hover:border-amber-500/50 hover:bg-white/10 transition-all bg-white/5 border text-gray-300 border-white/5">
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
                  <div key={like.id} className="card-premium p-5 group flex items-center justify-between hover:border-pink-500/50 hover:bg-white/10 transition-all bg-white/5 border text-gray-300 border-white/5">
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

            {/* Following Tab */}
            {tab === 'following' && (
              following.length > 0 ? (
                following.map(follow => (
                  <div key={follow.id} className="card-premium p-6 group flex items-center gap-6 hover:border-cyan-500/50 hover:bg-white/10 transition-all bg-white/5 border text-gray-300 border-white/5">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-lg">
                      {follow.users?.avatar
                        ? <img src={follow.users.avatar} className="w-full h-full rounded-full object-cover" alt={follow.users.name} />
                        : follow.users?.name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link to={`/profile/${follow.following_id}`} className="font-black text-white text-lg tracking-tight hover:text-cyan-400 transition truncate block">
                        {follow.users?.name}
                      </Link>
                      <p className="text-xs text-gray-400 line-clamp-1 mt-1 font-medium">{follow.users?.bio || 'Passionate storyteller on BlogNivo'}</p>
                    </div>
                    <button 
                      onClick={() => handleUnfollow(follow.following_id)}
                      className="px-4 py-2.5 rounded-xl border border-red-500/20 text-xs font-black uppercase tracking-widest hover:bg-red-500/20 text-red-400 hover:border-red-500/40 transition shrink-0 bg-red-500/5"
                    >
                      Unfollow
                    </button>
                  </div>
                ))
              ) : <EmptyState message="Follow your favorite authors to see them here." />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="md:w-80 shrink-0">
          <div className="glass p-8 rounded-3xl border border-white/10 flex flex-col items-center text-center shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-cyan-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/20">
              <LayoutDashboard size={32} />
            </div>
            <h4 className="text-xl font-black text-white mb-2 tracking-tight">Reader Insights</h4>
            <div className="w-full space-y-3 mt-5 text-left">
              {[
                { label: 'Bookmarked', value: bookmarks.length },
                { label: 'Articles Liked', value: likes.length },
                { label: 'Authors Following', value: following.length },
                { label: 'Feed Articles', value: feed.length },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 group">
                  <span className="text-xs font-bold text-gray-400 group-hover:text-gray-300 transition-colors uppercase tracking-widest">{item.label}</span>
                  <span className="text-base font-black text-indigo-300 group-hover:scale-110 transition-transform origin-right">{item.value}</span>
                </div>
              ))}
            </div>
            <Link to="/" className="w-full btn-primary py-3.5 text-sm flex items-center justify-center gap-2 mt-8">
              <Search size={18} /> Find New Stories
            </Link>
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
