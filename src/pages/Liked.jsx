import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useBlogs } from '../hooks/useBlogs';
import { Heart, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Liked() {
  const { user } = useAuth();
  const { toggleLike } = useBlogs();
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLikes = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('likes')
        .select('*, blogs(*, users!blogs_author_id_fkey(name, avatar))')
        .eq('user_id', user.id);
      
      if (error) throw error;
      setLikes(data || []);
    } catch (err) {
      console.error('Error fetching likes:', err);
      toast.error('Failed to load liked articles');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchLikes();
  }, [user, fetchLikes]);

  const handleUnlike = async (blogId) => {
    await toggleLike(blogId, user.id, true);
    fetchLikes();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold text-white mb-6">Liked Articles</h1>
      
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-pink-500 mb-4" size={40} />
            <p className="text-gray-500 font-medium italic">Loading liked articles...</p>
          </div>
        ) : likes.length > 0 ? (
          likes.map(like => (
            <div key={like.id} className="p-5 group flex items-center justify-between hover:border-pink-500/50 hover:bg-white/5 transition-all bg-slate-900/50 border text-gray-300 border-white/5 rounded-2xl">
              <Link to={`/blog/${like.blogs?.id}`} className="flex-1 truncate pr-4">
                <h3 className="font-bold text-white group-hover:text-pink-400 transition-colors text-lg tracking-tight truncate">{like.blogs?.title}</h3>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2 truncate">
                  By {like.blogs?.users?.name} • Liked {new Date(like.created_at).toLocaleDateString()}
                </p>
              </Link>
              <button
                onClick={() => handleUnlike(like.blogs?.id)}
                className="p-2.5 text-pink-500 hover:bg-pink-500/10 hover:text-pink-400 rounded-xl transition bg-pink-500/5 border border-pink-500/10 shrink-0"
              >
                <Heart size={20} fill="currentColor" />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-20 glass rounded-[2rem] border border-white/10 border-dashed">
            <p className="text-gray-400 font-bold italic">No liked articles yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
