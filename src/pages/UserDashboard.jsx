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
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse">
        <div className="h-40 bg-slate-50 rounded-[2.5rem] mb-12" />
        <div className="h-10 bg-slate-100 w-64 rounded-xl mb-8" />
        <div className="grid gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-50 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="card-premium p-8 mb-12 bg-gradient-to-br from-blue-600/5 to-purple-600/5 border-blue-100/50">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-lg">
            {profile?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Welcome back, {profile?.name || 'Reader'}!
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Your personalized space for everything you love on BlogNivo.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="text-center px-4 py-2 bg-white rounded-2xl border border-slate-100">
              <p className="text-xl font-black text-slate-900">{bookmarks.length}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saved</p>
            </div>
            <div className="text-center px-4 py-2 bg-white rounded-2xl border border-slate-100">
              <p className="text-xl font-black text-slate-900">{likes.length}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Liked</p>
            </div>
            <div className="text-center px-4 py-2 bg-white rounded-2xl border border-slate-100">
              <p className="text-xl font-black text-slate-900">{following.length}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Following</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1">
          <div className="flex items-center gap-2 border-b border-slate-100 mb-8 overflow-x-auto">
            {[
              { key: 'bookmarks', icon: <Bookmark size={16} />, label: 'Saved Stories' },
              { key: 'feed', icon: <BookOpen size={16} />, label: 'My Feed' },
              { key: 'likes', icon: <Heart size={16} />, label: 'Liked Articles' },
              { key: 'following', icon: <User size={16} />, label: 'Following' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${tab === t.key ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <div className="flex items-center gap-2">
                  {t.icon} {t.label}
                  {t.key === 'feed' && following.length > 0 && (
                    <span className="bg-blue-600 text-white text-[8px] rounded-full px-1.5 py-0.5 font-black">{following.length}</span>
                  )}
                </div>
                {tab === t.key && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full" />}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {/* Feed Tab */}
            {tab === 'feed' && (
              feedLoading ? (
                <div className="space-y-4">
                  {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-50 rounded-2xl animate-pulse" />)}
                </div>
              ) : feed.length > 0 ? (
                feed.map(blog => (
                  <div key={blog.id} className="card-premium p-5 group flex items-center justify-between gap-4 hover:border-blue-200 transition-all">
                    <Link to={`/blog/${blog.id}`} className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">{blog.title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <User size={10} /> {blog.users?.name}
                        </span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Clock size={10} /> {new Date(blog.created_at).toLocaleDateString()}
                        </span>
                        {blog.category && (
                          <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full uppercase tracking-widest">
                            {blog.category}
                          </span>
                        )}
                      </div>
                    </Link>
                    <Link to={`/blog/${blog.id}`} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition shrink-0">
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-24 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300 shadow-sm">
                    <BookOpen size={32} />
                  </div>
                  <p className="text-slate-500 font-bold mb-2">Your feed is empty</p>
                  <p className="text-slate-400 text-sm mb-6">Follow authors to see their latest articles here.</p>
                  <Link to="/" className="btn-primary text-sm px-6 py-2.5 inline-flex items-center gap-2">
                    <Search size={16} /> Discover Authors
                  </Link>
                </div>
              )
            )}

            {/* Bookmarks Tab */}
            {tab === 'bookmarks' && (
              bookmarks.length > 0 ? (
                bookmarks.map(bm => (
                  <div key={bm.id} className="card-premium p-5 group flex items-center justify-between hover:border-blue-200 transition-all">
                    <Link to={`/blog/${bm.blogs?.id}`} className="flex-1">
                      <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{bm.blogs?.title}</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        By {bm.blogs?.users?.name} • Saved {new Date(bm.created_at).toLocaleDateString()}
                      </p>
                    </Link>
                    <button 
                      onClick={() => toggleBookmark(bm.blogs?.id, user.id, true).then(fetchData)}
                      className="p-2 text-yellow-500 hover:bg-yellow-50 rounded-xl transition"
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
                  <div key={like.id} className="card-premium p-5 group flex items-center justify-between hover:border-red-200 transition-all">
                    <Link to={`/blog/${like.blogs?.id}`} className="flex-1">
                      <h3 className="font-bold text-slate-800 group-hover:text-red-600 transition-colors">{like.blogs?.title}</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        By {like.blogs?.users?.name} • Liked {new Date(like.created_at).toLocaleDateString()}
                      </p>
                    </Link>
                    <button 
                      onClick={() => toggleLike(like.blogs?.id, user.id, true).then(fetchData)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition"
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
                  <div key={follow.id} className="card-premium p-6 group flex items-center gap-6 hover:border-blue-200 transition-all">
                    <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xl font-bold border border-slate-200 shrink-0">
                      {follow.users?.avatar
                        ? <img src={follow.users.avatar} className="w-full h-full rounded-full object-cover" alt={follow.users.name} />
                        : follow.users?.name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link to={`/profile/${follow.following_id}`} className="font-black text-slate-900 tracking-tight hover:text-blue-600 transition">
                        {follow.users?.name}
                      </Link>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{follow.users?.bio || 'Passionate storyteller on BlogNivo'}</p>
                    </div>
                    <button 
                      onClick={() => handleUnfollow(follow.following_id)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition shrink-0"
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
        <aside className="lg:w-80">
          <div className="glass p-8 rounded-3xl border border-blue-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <LayoutDashboard size={32} />
            </div>
            <h4 className="text-lg font-black text-slate-900 mb-2 tracking-tight">Reader Insights</h4>
            <div className="w-full space-y-3 mt-4 text-left">
              {[
                { label: 'Bookmarked', value: bookmarks.length },
                { label: 'Articles Liked', value: likes.length },
                { label: 'Authors Following', value: following.length },
                { label: 'Feed Articles', value: feed.length },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="text-xs font-bold text-slate-500">{item.label}</span>
                  <span className="text-sm font-black text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
            <Link to="/" className="w-full btn-primary py-3 text-sm flex items-center justify-center gap-2 mt-6">
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
    <div className="text-center py-20 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
      <p className="text-slate-400 font-bold italic">{message}</p>
    </div>
  );
}
