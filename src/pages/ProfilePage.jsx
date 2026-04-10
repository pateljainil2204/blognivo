import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { User, Calendar, Grid, List, Shield, Award, UserPlus, UserCheck, Loader2 } from 'lucide-react';
import BlogCard from '../components/blog/BlogCard';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    fetchProfile();
    fetchBlogs();
    fetchFollowerCount();
  }, [id]);

  useEffect(() => {
    if (currentUser && id && currentUser.id !== id) {
      checkFollowing();
    }
  }, [currentUser, id]);

  const fetchProfile = async () => {
    const { data } = await supabase.from('users').select('*').eq('id', id).single();
    if (data) setProfile(data);
  };

  const fetchBlogs = async () => {
    const { data } = await supabase
      .from('blogs')
      .select('*, users!blogs_author_id_fkey(name, avatar)')
      .eq('author_id', id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    setBlogs(data || []);
    setLoading(false);
  };

  const fetchFollowerCount = async () => {
    const { count } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', id);
    setFollowerCount(count || 0);
  };

  const checkFollowing = async () => {
    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', currentUser.id)
      .eq('following_id', id)
      .maybeSingle();
    setIsFollowing(!!data);
  };

  const handleToggleFollow = async () => {
    if (!currentUser) return toast.error('Please login to follow authors');
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await supabase.from('follows').delete().eq('follower_id', currentUser.id).eq('following_id', id);
        setIsFollowing(false);
        setFollowerCount(prev => Math.max(0, prev - 1));
        toast.success(`Unfollowed ${profile?.name}`);
      } else {
        await supabase.from('follows').insert({ follower_id: currentUser.id, following_id: id });
        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);
        toast.success(`Now following ${profile?.name}`);
      }
    } catch (err) {
      toast.error('Action failed');
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) return (
    <div className="max-w-6xl mx-auto p-4 animate-pulse">
      <div className="h-64 bg-slate-50 rounded-3xl mb-12" />
      <div className="grid md:grid-cols-3 gap-8">
        {[1,2,3].map(i => <div key={i} className="h-80 bg-slate-50 rounded-2xl" />)}
      </div>
    </div>
  );

  if (!profile) return <div className="text-center py-20 text-slate-500 font-bold">User not found.</div>;

  const isOwnProfile = currentUser?.id === id;
  const totalViews = blogs.reduce((sum, b) => sum + (b.views || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Profile Header */}
      <div className="card-premium p-8 md:p-12 mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.04] grayscale rotate-12 pointer-events-none">
          <User size={220} />
        </div>
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white text-5xl font-black shadow-2xl border-4 border-white shrink-0">
            {profile.avatar
              ? <img src={profile.avatar} alt={profile.name} className="w-full h-full rounded-full object-cover" />
              : profile.name?.[0]?.toUpperCase()
            }
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">{profile.name}</h1>
              {profile.role === 'admin' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-[10px] font-black uppercase tracking-widest w-fit mx-auto md:mx-0">
                  <Shield size={12} /> Admin
                </span>
              )}
              {profile.role === 'author' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest w-fit mx-auto md:mx-0">
                  <Award size={12} /> Author
                </span>
              )}
            </div>
            
            <p className="text-base text-slate-500 max-w-2xl mb-6 leading-relaxed">
              {profile.bio || `Welcome to ${profile.name}'s profile. This author hasn't added a bio yet!`}
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <Calendar size={16} className="text-slate-400" />
                Joined {new Date(profile.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="shrink-0">
            {isOwnProfile ? (
              <Link to="/dashboard" className="btn-primary">
                Edit Profile
              </Link>
            ) : currentUser ? (
              <button
                onClick={handleToggleFollow}
                disabled={followLoading}
                className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
                  isFollowing
                    ? 'bg-blue-50 text-blue-700 border-2 border-blue-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200'
                    : 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700'
                }`}
              >
                {followLoading
                  ? <Loader2 size={18} className="animate-spin" />
                  : isFollowing
                  ? <UserCheck size={18} />
                  : <UserPlus size={18} />
                }
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            ) : (
              <Link to="/login" className="btn-primary flex items-center gap-2">
                <UserPlus size={18} /> Follow
              </Link>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-slate-100">
          <div className="text-center">
            <p className="text-2xl font-black text-slate-900">{blogs.length}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Articles</p>
          </div>
          <div className="text-center border-x border-slate-100">
            <p className="text-2xl font-black text-slate-900">{totalViews.toLocaleString()}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Total Views</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-slate-900">{followerCount}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Followers</p>
          </div>
        </div>
      </div>

      {/* Publications Section */}
      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Publications</h2>
          <div className="flex bg-slate-50 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Grid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {blogs.length === 0 ? (
          <div className="py-20 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
            <p className="text-slate-400 font-bold italic">No public articles yet. Check back later!</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-6'}>
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}