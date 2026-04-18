import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useBlogs } from '../hooks/useBlogs';
import { Bookmark, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Saved() {
  const { user } = useAuth();
  const { toggleBookmark } = useBlogs();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*, blogs(*, users!blogs_author_id_fkey(name, avatar))')
        .eq('user_id', user.id);
      
      if (error) throw error;
      setBookmarks(data || []);
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
      toast.error('Failed to load saved stories');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchBookmarks();
  }, [user, fetchBookmarks]);

  const handleRemoveBookmark = async (blogId) => {
    await toggleBookmark(blogId, user.id, true);
    fetchBookmarks();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold text-white mb-6">Saved Stories</h1>
      
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-amber-500 mb-4" size={40} />
            <p className="text-gray-500 font-medium italic">Loading saved stories...</p>
          </div>
        ) : bookmarks.length > 0 ? (
          bookmarks.map(bm => (
            <div key={bm.id} className="p-5 group flex items-center justify-between hover:border-amber-500/50 hover:bg-white/5 transition-all bg-slate-900/50 border text-gray-300 border-white/5 rounded-2xl">
              <Link to={`/blog/${bm.blogs?.id}`} className="flex-1 truncate pr-4">
                <h3 className="font-bold text-white group-hover:text-amber-400 transition-colors text-lg tracking-tight truncate">{bm.blogs?.title}</h3>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2 truncate">
                  By {bm.blogs?.users?.name} • Saved {new Date(bm.created_at).toLocaleDateString()}
                </p>
              </Link>
              <button
                onClick={() => handleRemoveBookmark(bm.blogs?.id)}
                className="p-2.5 text-amber-500 hover:bg-amber-500/10 hover:text-amber-400 rounded-xl transition bg-amber-500/5 border border-amber-500/10 shrink-0"
              >
                <Bookmark size={20} fill="currentColor" />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-20 glass rounded-[2rem] border border-white/10 border-dashed">
            <p className="text-gray-400 font-bold italic">No saved blogs yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
