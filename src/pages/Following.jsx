import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { User, Loader2, ArrowLeft, UserMinus, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Following() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFollowing = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('*, users!follows_following_id_fkey(id, name, avatar, bio, role)')
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

  const handleUnfollow = async (event, authorId, authorName) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', authorId);
      
      if (error) throw error;
      toast.success(`Unfollowed ${authorName}`);
      setFollowing(prev => prev.filter(f => f.following_id !== authorId));
    } catch (err) {
      toast.error('Failed to unfollow');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 relative z-10 w-full mb-20">
      {/* Background ambient light */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      <div className="flex items-center gap-4 mb-10">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-all hover:bg-white/10"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Your Muse Circle</h1>
          <p className="text-gray-500 font-medium text-sm mt-1">Authors you're currently following.</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white/5 rounded-[2.5rem] border border-white/5">
            <Loader2 className="animate-spin text-cyan-500 mb-4" size={40} />
            <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">Updating your circle...</p>
          </div>
        ) : following.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {following.map(follow => {
              const followingUser = follow.users;
              const profilePath = followingUser?.role === 'admin' 
                ? `/admin-profile/${followingUser.id}` 
                : followingUser?.role === 'author' 
                  ? `/author/${followingUser.id}` 
                  : `/profile/${followingUser.id}`;

              return (
                <div key={follow.id} className="relative group">
                  <Link 
                    to={profilePath} 
                    className="p-6 flex items-center gap-5 hover:border-cyan-500/50 hover:bg-white/[0.07] transition-all bg-white/8 border border-white/5 rounded-[2rem] shadow-xl hover:shadow-cyan-500/10 cursor-pointer active:scale-[0.98] w-full"
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white text-xl font-black shrink-0 ring-4 ring-white/5 overflow-hidden group-hover:scale-110 transition-transform duration-500">
                      {followingUser?.avatar
                        ? <img src={followingUser.avatar} className="w-full h-full object-cover" alt={followingUser.name} />
                        : followingUser?.name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-white group-hover:text-cyan-400 transition-colors text-lg tracking-tight truncate">{followingUser?.name}</h3>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1 truncate">
                        {followingUser?.role === 'author' ? 'Creator' : followingUser?.role === 'admin' ? 'Master Admin' : 'Community Member'}
                      </p>
                    </div>
                    
                    <button
                      onClick={(e) => handleUnfollow(e, follow.following_id, followingUser?.name)}
                      className="p-3 bg-white/5 rounded-xl border border-white/5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all z-20 relative"
                      title="Unfollow"
                    >
                      <UserMinus size={18} />
                    </button>
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-32 glass rounded-[2.5rem] border border-white/10 border-dashed">
            <Users size={40} className="mx-auto mb-6 text-gray-700" />
            <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Your circle is empty</p>
            <p className="text-gray-600 text-sm mt-2 font-medium">Discover some amazing authors to follow!</p>
          </div>
        )}
      </div>
    </div>
  );
}
