import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { User, Loader2, ArrowLeft, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Followers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFollowers = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('*, users!follows_follower_id_fkey(id, name, avatar, bio, role)')
        .eq('following_id', user.id);
      
      if (error) throw error;
      setFollowers(data || []);
    } catch (err) {
      console.error('Error fetching followers:', err);
      toast.error('Failed to load followers list');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchFollowers();
  }, [user, fetchFollowers]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 relative z-10 w-full mb-20">
      {/* Background ambient light */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      <div className="flex items-center gap-4 mb-10">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-all hover:bg-white/10"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Your Followers</h1>
          <p className="text-gray-500 font-medium text-sm mt-1">People following your journey.</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white/5 rounded-[2.5rem] border border-white/5">
            <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
            <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">Syncing audience data...</p>
          </div>
        ) : followers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {followers.map(follow => {
              const follower = follow.users;
              const profilePath = follower?.role === 'admin' 
                ? `/admin-profile/${follower.id}` 
                : follower?.role === 'author' 
                  ? `/author/${follower.id}` 
                  : `/profile/${follower.id}`;

              return (
                <Link 
                  key={follow.id} 
                  to={profilePath} 
                  className="p-6 group flex items-center gap-5 hover:border-indigo-500/50 hover:bg-white/[0.07] transition-all bg-white/8 border border-white/5 rounded-[2rem] shadow-xl hover:shadow-indigo-500/10 cursor-pointer active:scale-[0.98]"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl font-black shrink-0 ring-4 ring-white/5 overflow-hidden group-hover:scale-110 transition-transform duration-500">
                    {follower?.avatar
                      ? <img src={follower.avatar} className="w-full h-full object-cover" alt={follower.name} />
                      : follower?.name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-white group-hover:text-indigo-400 transition-colors text-lg tracking-tight truncate">{follower?.name}</h3>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1 truncate">
                      {follower?.role === 'author' ? 'Verified Author' : follower?.role === 'admin' ? 'System Administrator' : 'Member since ' + new Date().getFullYear()}
                    </p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-gray-500 group-hover:text-white group-hover:bg-indigo-500/20 group-hover:border-indigo-500/30 transition-all">
                    <User size={18} />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-32 glass rounded-[2.5rem] border border-white/10 border-dashed">
            <Users size={40} className="mx-auto mb-6 text-gray-700" />
            <p className="text-gray-400 font-black uppercase tracking-widest text-xs">No followers yet</p>
            <p className="text-gray-600 text-sm mt-2 font-medium">Keep writing to build your audience!</p>
          </div>
        )}
      </div>
    </div>
  );
}
