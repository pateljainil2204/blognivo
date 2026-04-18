import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { User, Clock, BookOpen, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Feed() {
  const { user } = useAuth();
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Get all following IDs
      const { data: followData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      const followingIds = (followData || []).map(f => f.following_id);

      if (followingIds.length === 0) {
        setFeed([]);
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
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchFeed();
  }, [user, fetchFeed]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold text-white mb-6">My Feed</h1>
      
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
            <p className="text-gray-500 font-medium italic">Loading your feed...</p>
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
          <div className="text-center py-16 border border-white/5 rounded-2xl border-dashed glass">
            <BookOpen size={32} className="mx-auto text-gray-600 mb-4" />
            <p className="text-white font-bold tracking-tight mb-2">Your feed is empty</p>
            <p className="text-gray-500 text-sm mb-6">Follow authors to see their latest articles here.</p>
            <Link to="/blogs" className="btn-primary text-sm px-6 py-2.5 inline-flex">Explore Blogs</Link>
          </div>
        )}
      </div>
    </div>
  );
}
