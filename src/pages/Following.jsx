import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { User, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Following() {
  const { user } = useAuth();
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFollowing = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('*, users!follows_following_id_fkey(name, avatar, bio)')
        .eq('follower_id', user.id);
      
      if (error) throw error;
      setFollowing(data || []);
    } catch (err) {
      console.error('Error fetching following:', err);
      toast.error('Failed to load your following list');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchFollowing();
  }, [user, fetchFollowing]);

  const handleUnfollow = async (authorId) => {
    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', authorId);
      
      if (error) throw error;
      toast.success('Unfollowed successfully');
      fetchFollowing();
    } catch (err) {
      toast.error('Failed to unfollow');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold text-white mb-6">Following</h1>
      
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-cyan-500 mb-4" size={40} />
            <p className="text-gray-500 font-medium italic">Loading following list...</p>
          </div>
        ) : following.length > 0 ? (
          following.map(follow => (
            <div key={follow.id} className="p-5 group flex items-center justify-between hover:border-cyan-500/50 hover:bg-white/5 transition-all bg-slate-900/50 border text-gray-300 border-white/5 rounded-2xl">
              <Link to={`/profile/${follow.following_id}`} className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-lg font-bold shrink-0 shadow-inner overflow-hidden">
                  {follow.users?.avatar
                    ? <img src={follow.users.avatar} className="w-full h-full object-cover" alt={follow.users.name} />
                    : follow.users?.name?.[0]}
                </div>
                <div>
                  <h3 className="font-bold text-white group-hover:text-cyan-400 transition-colors text-lg tracking-tight">{follow.users?.name}</h3>
                  <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest mt-1">Author</p>
                </div>
              </Link>
              <button
                onClick={() => handleUnfollow(follow.following_id)}
                className="p-2.5 text-cyan-500 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition bg-cyan-500/5 border border-cyan-500/10 shrink-0 text-xs font-bold uppercase"
              >
                Unfollow
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-20 glass rounded-[2rem] border border-white/10 border-dashed">
            <p className="text-gray-400 font-bold italic">You aren't following anyone yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
