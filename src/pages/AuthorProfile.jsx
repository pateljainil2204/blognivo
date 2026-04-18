import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Eye, Heart, Users, BookOpen, TrendingUp, Clock, PenSquare, Award, UserPlus, UserCheck, Loader2, ArrowRight } from 'lucide-react';
import ProfileLayout from '../components/profile/ProfileLayout';
import BlogCard from '../components/blog/BlogCard';
import toast from 'react-hot-toast';

export default function AuthorProfile() {
  const { id } = useParams();
  const { user: currentUser, profile: currentProfile } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [stats, setStats] = useState({ views: 0, likes: 0, followers: 0, totalBlogs: 0 });
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const targetId = id || currentUser?.id;
  const isOwnProfile = !id || id === currentUser?.id;

  const checkFollowing = useCallback(async () => {
    if (!currentUser || isOwnProfile) return;
    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', currentUser.id)
      .eq('following_id', targetId)
      .maybeSingle();
    setIsFollowing(!!data);
  }, [currentUser, targetId, isOwnProfile]);

  const fetchData = useCallback(async () => {
    if (!targetId) return;
    setLoading(true);
    try {
      // Fetch profile info first
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', targetId)
        .single();
      
      if (profileError) throw profileError;
      setActiveProfile(profileData);

      // Fetch blogs
      const { data: blogData } = await supabase
        .from('blogs')
        .select('*, users!blogs_author_id_fkey(name, avatar)')
        .eq('author_id', targetId)
        .order('created_at', { ascending: false });
      
      const allBlogs = blogData || [];
      setBlogs(allBlogs);

      const totalViews = allBlogs.reduce((sum, b) => sum + (b.views || 0), 0);
      const blogIds = allBlogs.map(b => b.id);

      const [likeRes, followerRes] = await Promise.all([
        blogIds.length > 0
          ? supabase.from('likes').select('*', { count: 'exact', head: true }).in('blog_id', blogIds)
          : Promise.resolve({ count: 0 }),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', targetId),
      ]);

      setStats({
        views: totalViews,
        likes: likeRes.count || 0,
        followers: followerRes.count || 0,
        totalBlogs: allBlogs.length
      });

      if (!isOwnProfile) checkFollowing();
    } catch (err) {
      console.error('Error fetching author profile:', err);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, [targetId, isOwnProfile, checkFollowing]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleFollow = async () => {
    if (!currentUser) return toast.error('Please login to follow authors');
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await supabase.from('follows').delete().eq('follower_id', currentUser.id).eq('following_id', targetId);
        setIsFollowing(false);
        setStats(prev => ({ ...prev, followers: Math.max(0, prev.followers - 1) }));
        toast.success(`Unfollowed ${activeProfile?.name}`);
      } else {
        await supabase.from('follows').insert({ follower_id: currentUser.id, following_id: targetId });
        setIsFollowing(true);
        setStats(prev => ({ ...prev, followers: prev.followers + 1 }));
        toast.success(`Now following ${activeProfile?.name}`);
      }
    } catch (err) {
      toast.error('Action failed');
    } finally {
      setFollowLoading(false);
    }
  };

  const profileStats = [
    { label: 'Published Blogs', value: stats.totalBlogs, icon: BookOpen, iconColor: 'text-indigo-400', hoverColor: 'group-hover:text-indigo-400', borderColor: 'hover:border-indigo-500/30' },
    { label: 'Total Views', value: stats.views, icon: Eye, iconColor: 'text-cyan-400', hoverColor: 'group-hover:text-cyan-400', borderColor: 'hover:border-cyan-500/30' },
    { label: 'Total Likes', value: stats.likes, icon: Heart, iconColor: 'text-pink-400', hoverColor: 'group-hover:text-pink-400', borderColor: 'hover:border-pink-500/30' },
    { label: 'Followers', value: stats.followers, icon: Users, iconColor: 'text-purple-400', hoverColor: 'group-hover:text-purple-400', borderColor: 'hover:border-purple-500/30' },
  ];

  const actionButton = isOwnProfile ? (
    <div className="flex flex-wrap items-center gap-3">
      <Link to="/followers" className="px-6 py-3 rounded-2xl font-bold text-sm transition-all bg-white/5 text-white border border-white/10 hover:bg-white/10 flex items-center gap-2">
        <Users size={18} /> Followers
      </Link>
      <Link to="/editor" className="btn-primary flex items-center gap-2 group shadow-xl shadow-indigo-500/20">
        <PenSquare size={20} className="group-hover:rotate-12 transition-transform" />
        Craft New Story
      </Link>
    </div>
  ) : (
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
  );

  const topBlog = blogs.length > 0 ? [...blogs].sort((a, b) => ((b.views || 0) + (b.likes_count || 0)) - ((a.views || 0) + (a.likes_count || 0)))[0] : null;

  return (
    <ProfileLayout profile={activeProfile} stats={profileStats} actionButton={actionButton}>
      <div className="flex flex-col lg:flex-row gap-12 mt-8">
        {/* Main Content: Published Blogs */}
        <div className="flex-1 space-y-10">
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
              <BookOpen className="text-indigo-400" size={24} /> Published Work
            </h2>
            <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/5">
               <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">{blogs.filter(b => b.status === 'approved').length}</span>
               <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Approved Articles</span>
            </div>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 gap-8 animate-pulse">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-72 bg-white/5 rounded-[2.5rem]" />)}
            </div>
          ) : blogs.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-8">
              {blogs.filter(b => b.status === 'approved').map(blog => <BlogCard key={blog.id} blog={blog} />)}
            </div>
          ) : (
            <div className="py-24 text-center glass rounded-[3rem] border border-dashed border-white/10">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-600">
                <BookOpen size={40} />
              </div>
              <p className="text-gray-400 font-bold italic tracking-tight mb-6">No articles published yet.</p>
              {isOwnProfile && (
                <Link to="/editor" className="btn-primary inline-flex items-center gap-2">
                  <PenSquare size={16} /> Start Your Journey
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Sidebar: performance & highlights */}
        <aside className="lg:w-96 space-y-8">
          {/* Top Performing Blog */}
          {topBlog && (
            <div className="glass p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group">
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700"></div>
               
               <div className="relative z-10">
                 <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                   <TrendingUp size={14} /> Star Projection
                 </h3>
                 <Link to={`/blog/${topBlog.id}`}>
                   <h4 className="text-2xl font-black text-white mb-6 line-clamp-2 hover:text-indigo-400 transition-colors leading-tight">{topBlog.title}</h4>
                 </Link>
                 
                 <div className="grid grid-cols-3 gap-2 py-6 border-y border-white/5 mb-6">
                    <div className="text-center">
                       <p className="text-lg font-black text-white">{topBlog.views || 0}</p>
                       <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Views</p>
                    </div>
                    <div className="text-center border-x border-white/5">
                       <p className="text-lg font-black text-white">{topBlog.likes_count || 0}</p>
                       <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Likes</p>
                    </div>
                    <div className="text-center">
                       <p className="text-lg font-black text-white">{Math.floor(Math.random() * 10) + 1}m</p>
                       <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Avg Read</p>
                    </div>
                 </div>

                 <Link to={`/blog/${topBlog.id}`} className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-400 transition-all">
                    View Published Article <ArrowRight size={14} />
                 </Link>
               </div>
            </div>
          )}

          {/* Impact Score Widget */}
          <div className="bg-gradient-to-br from-indigo-500/10 to-transparent p-1 rounded-[2.5rem] border border-white/10">
             <div className="glass p-8 rounded-[2.3rem] text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10 shadow-lg">
                   <Award size={32} className="text-indigo-400" />
                </div>
                <h4 className="text-lg font-black text-white mb-1">Impact Score: 84</h4>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Top Author Ranking</p>
             </div>
          </div>

          {/* Quick Metrics Table */}
          <div className="glass p-8 rounded-[2.5rem] border border-white/10">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-8 text-center border-b border-white/5 pb-4">Activity Insights</h3>
            <div className="space-y-1">
               {[
                 { label: 'Published', value: blogs.filter(b => b.status === 'approved').length, color: 'text-emerald-400', visible: true },
                 { label: 'Pending', value: blogs.filter(b => b.status === 'pending').length, color: 'text-yellow-400', visible: isOwnProfile },
                 { label: 'Drafts', value: blogs.filter(b => b.status === 'draft').length, color: 'text-gray-500', visible: isOwnProfile },
                 { label: 'Total Engagement', value: stats.likes + stats.views, color: 'text-indigo-400', visible: true },
               ]
               .filter(item => item.visible)
               .map(item => (
                 <div key={item.label} className="flex items-center justify-between py-3.5 group">
                   <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider group-hover:text-gray-300 transition-colors">{item.label}</span>
                   <span className={`text-base font-black ${item.color} group-hover:scale-110 transition-transform origin-right`}>{item.value}</span>
                 </div>
               ))}
            </div>
          </div>
        </aside>
      </div>
    </ProfileLayout>
  );
}
