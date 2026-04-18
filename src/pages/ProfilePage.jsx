import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { User, Calendar, Grid, List, Shield, Award, UserPlus, UserCheck, Loader2, BookOpen, Heart } from 'lucide-react';
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
  const totalLikes = blogs.reduce((sum, b) => sum + (b.likes_count || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 relative z-10 w-full overflow-hidden">
      
      {/* Background ambient light */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>
      
      {/* 1. Cover Banner & Profile Info */}
      <div className="relative mb-24 md:mb-32">
        <div className="h-48 md:h-64 rounded-[2.5rem] bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 overflow-hidden relative shadow-[0_0_40px_rgba(79,70,229,0.2)] border border-white/5">
           <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950/90 mix-blend-multiply"></div>
           {/* Abstract shapes */}
           <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/20 blur-[80px] rounded-full translate-x-1/3 -translate-y-1/3"></div>
           <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/20 blur-[80px] rounded-full -translate-x-1/3 translate-y-1/3"></div>
        </div>

        {/* Profile Info overlaying banner */}
        <div className="absolute -bottom-16 md:-bottom-24 left-4 md:left-12 flex flex-col md:flex-row items-center md:items-end gap-6 w-[calc(100%-2rem)] md:w-[calc(100%-6rem)] px-2">
          
          <div className="relative group shrink-0">
            <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-700"></div>
            <div className="w-32 h-32 md:w-44 md:h-44 rounded-full bg-slate-900 flex items-center justify-center text-white text-5xl font-black shadow-2xl border-4 border-slate-950 relative z-10 overflow-hidden">
              {profile.avatar
                ? <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                : profile.name?.[0]?.toUpperCase()
              }
            </div>
          </div>
          
          <div className="flex-1 pb-2 flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-4 text-center md:text-left w-full mt-2 md:mt-0">
            <div>
               <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-2 drop-shadow-lg">{profile.name}</h1>
               <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                 {profile.role === 'admin' && (
                   <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-sm">
                     <Shield size={12} /> Admin
                   </span>
                 )}
                 {profile.role === 'author' && (
                   <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-sm">
                     <Award size={12} /> Author
                   </span>
                 )}
                 <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-bold tracking-widest uppercase bg-white/5 border border-white/5 px-3 py-1 rounded-full backdrop-blur-md">
                   <Calendar size={12} /> Joined {new Date(profile.created_at).getFullYear()}
                 </div>
               </div>
            </div>
             
            {/* Action Button */}
            <div className="shrink-0 flex items-center justify-center">
              {isOwnProfile ? (
                <Link to="/dashboard" className="px-6 py-3 rounded-2xl font-bold text-sm transition-all bg-white/10 text-white border border-white/20 shadow-lg hover:bg-white/20 hover:scale-105">
                  Edit Profile
                </Link>
              ) : currentUser ? (
                <button
                  onClick={handleToggleFollow}
                  disabled={followLoading}
                  className={`flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                    isFollowing
                      ? 'bg-slate-800 text-white border border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 shadow-lg'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] hover:scale-105'
                  }`}
                >
                  {followLoading ? <Loader2 size={18} className="animate-spin" /> : isFollowing ? <UserCheck size={18} /> : <UserPlus size={18} />}
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              ) : (
                <Link to="/login" className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] hover:scale-105 transition-all">
                  <UserPlus size={18} /> Follow
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bio Section */}
      <div className="px-4 md:px-12 mb-12 text-center md:text-left mt-[110px] md:mt-0 relative z-10">
        <p className="text-base md:text-lg text-gray-300 max-w-3xl leading-relaxed">
          {profile.bio || `Welcome to ${profile.name}'s profile. This author hasn't added a bio yet!`}
        </p>
      </div>

      {/* 2. Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-12 mb-16 relative z-10">
        <div className="glass p-6 rounded-3xl border border-white/10 shadow-lg hover:border-indigo-500/30 transition-all hover:-translate-y-1 group bg-gradient-to-br from-slate-900 to-slate-900/50 text-center">
          <p className="text-4xl font-black text-white tracking-tight group-hover:text-indigo-400 transition-colors drop-shadow-sm">{blogs.length}</p>
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-1.5 flex items-center justify-center gap-1.5">
            <BookOpen size={14} className="text-indigo-500/50" /> Total Blogs
          </p>
        </div>
        <div className="glass p-6 rounded-3xl border border-white/10 shadow-lg hover:border-pink-500/30 transition-all hover:-translate-y-1 group bg-gradient-to-br from-slate-900 to-slate-900/50 text-center">
          <p className="text-4xl font-black text-white tracking-tight group-hover:text-pink-400 transition-colors drop-shadow-sm">{totalLikes || 0}</p>
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-1.5 flex items-center justify-center gap-1.5">
            <Heart size={14} className="text-pink-500/50" /> Total Likes
          </p>
        </div>
        <div className="glass p-6 rounded-3xl border border-white/10 shadow-lg hover:border-cyan-500/30 transition-all hover:-translate-y-1 group bg-gradient-to-br from-slate-900 to-slate-900/50 text-center">
          <p className="text-4xl font-black text-white tracking-tight group-hover:text-cyan-400 transition-colors drop-shadow-sm">{followerCount}</p>
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-1.5 flex items-center justify-center gap-1.5">
            <User size={14} className="text-cyan-500/50" /> Followers
          </p>
        </div>
      </div>

      {/* 3. Publications Section */}
      <div className="px-4 md:px-12 relative z-10">
        <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8">
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Grid className="text-indigo-400 hidden md:block" size={24} /> Publications
          </h2>
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-500/20 text-indigo-400 shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Grid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-500/20 text-indigo-400 shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {blogs.length === 0 ? (
          <div className="py-20 text-center glass rounded-[2rem] border border-dashed border-white/10">
            <p className="text-gray-400 font-bold italic tracking-tight">No public articles yet. Check back later!</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6 max-w-4xl mx-auto'}>
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}