import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Eye, Heart, Users, BookOpen, TrendingUp, Clock, PenSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProfileLayout from '../components/profile/ProfileLayout';
import BlogCard from '../components/blog/BlogCard';
import toast from 'react-hot-toast';

export default function AuthorProfile() {
  const { user, profile } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [stats, setStats] = useState({ views: 0, likes: 0, followers: 0, totalBlogs: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('blogs')
        .select('*, users!blogs_author_id_fkey(name, avatar)')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });
      
      const allBlogs = data || [];
      setBlogs(allBlogs);

      const totalViews = allBlogs.reduce((sum, b) => sum + (b.views || 0), 0);
      const blogIds = allBlogs.map(b => b.id);

      const [likeRes, followerRes] = await Promise.all([
        blogIds.length > 0
          ? supabase.from('likes').select('*', { count: 'exact', head: true }).in('blog_id', blogIds)
          : Promise.resolve({ count: 0 }),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', user.id),
      ]);

      setStats({
        views: totalViews,
        likes: likeRes.count || 0,
        followers: followerRes.count || 0,
        totalBlogs: allBlogs.length
      });
    } catch (err) {
      console.error('Error fetching author profile:', err);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchData();
  }, [user, fetchData]);

  const profileStats = [
    { label: 'Published Blogs', value: stats.totalBlogs, icon: BookOpen, iconColor: 'text-indigo-400', hoverColor: 'group-hover:text-indigo-400', borderColor: 'hover:border-indigo-500/30' },
    { label: 'Total Views', value: stats.views, icon: Eye, iconColor: 'text-cyan-400', hoverColor: 'group-hover:text-cyan-400', borderColor: 'hover:border-cyan-500/30' },
    { label: 'Total Likes', value: stats.likes, icon: Heart, iconColor: 'text-pink-400', hoverColor: 'group-hover:text-pink-400', borderColor: 'hover:border-pink-500/30' },
    { label: 'Followers', value: stats.followers, icon: Users, iconColor: 'text-purple-400', hoverColor: 'group-hover:text-purple-400', borderColor: 'hover:border-purple-500/30' },
  ];

  const actionButton = (
    <Link to="/editor" className="btn-primary flex items-center gap-2 group shadow-xl shadow-indigo-500/20">
      <PenSquare size={20} className="group-hover:rotate-12 transition-transform" />
      Craft New Story
    </Link>
  );

  const topBlog = [...blogs].sort((a, b) => (b.views + b.likes_count) - (a.views + a.likes_count))[0];

  return (
    <ProfileLayout profile={profile} stats={profileStats} actionButton={actionButton}>
      <div className="grid lg:grid-cols-3 gap-12">
        {/* Main Content: Published Blogs */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
              <BookOpen className="text-indigo-400" size={24} /> My Publications
            </h2>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{blogs.length} Articles</span>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 gap-6 animate-pulse">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-white/5 rounded-3xl" />)}
            </div>
          ) : blogs.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {blogs.map(blog => <BlogCard key={blog.id} blog={blog} />)}
            </div>
          ) : (
            <div className="py-20 text-center glass rounded-[2.5rem] border border-dashed border-white/10">
              <p className="text-gray-400 font-bold italic tracking-tight">No articles published yet.</p>
              <Link to="/editor" className="mt-4 inline-block text-indigo-400 font-black uppercase tracking-widest hover:text-indigo-300">Start Writing →</Link>
            </div>
          )}
        </div>

        {/* Sidebar: performance & highlights */}
        <aside className="space-y-8">
          {/* Top Performing Blog */}
          {topBlog && (
            <div className="glass p-8 rounded-[2.5rem] border border-white/10 shadow-lg relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 text-indigo-400 group-hover:scale-110 transition-transform">
                  <TrendingUp size={64} />
               </div>
               <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <TrendingUp size={16} /> Top Performing
               </h3>
               <Link to={`/blog/${topBlog.id}`}>
                 <h4 className="text-xl font-bold text-white mb-4 line-clamp-2 hover:text-indigo-400 transition-colors">{topBlog.title}</h4>
               </Link>
               <div className="flex items-center gap-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                 <span className="flex items-center gap-1.5"><Eye size={14} /> {topBlog.views}</span>
                 <span className="flex items-center gap-1.5"><Heart size={14} /> {topBlog.likes_count || 0}</span>
                 <span className="flex items-center gap-1.5"><Clock size={14} /> {new Date(topBlog.created_at).toLocaleDateString()}</span>
               </div>
            </div>
          )}

          {/* Quick Stats Summary */}
          <div className="glass p-8 rounded-[2.5rem] border border-white/10 shadow-lg">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Execution Summary</h3>
            <div className="space-y-4">
               {[
                 { label: 'Published', value: blogs.filter(b => b.status === 'approved').length, color: 'text-emerald-400' },
                 { label: 'Pending', value: blogs.filter(b => b.status === 'pending').length, color: 'text-yellow-400' },
                 { label: 'Views/Post', value: blogs.length ? Math.round(stats.views / blogs.length) : 0, color: 'text-indigo-400' },
                 { label: 'Average Likes', value: blogs.length ? (stats.likes / blogs.length).toFixed(1) : 0, color: 'text-pink-400' },
               ].map(item => (
                 <div key={item.label} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                   <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{item.label}</span>
                   <span className={`text-base font-black ${item.color}`}>{item.value}</span>
                 </div>
               ))}
            </div>
          </div>
        </aside>
      </div>
    </ProfileLayout>
  );
}
