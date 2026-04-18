import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { BookOpen, Eye, Heart, Clock, PenSquare, Trash2, TrendingUp, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import BlogCard from '../components/blog/BlogCard';
import toast from 'react-hot-toast';

export default function MyBlogs() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMyBlogs = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*, users!blogs_author_id_fkey(name, avatar)')
        .eq('author_id', user.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlogs(data || []);
    } catch (err) {
      console.error('Error fetching blogs:', err);
      toast.error('Failed to load your publications');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMyBlogs();
  }, [fetchMyBlogs]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this blog? This action cannot be undone.')) return;
    try {
      const { error } = await supabase.from('blogs').delete().eq('id', id);
      if (error) throw error;
      toast.success('Blog deleted successfully');
      setBlogs(blogs.filter(b => b.id !== id));
    } catch (err) {
      toast.error('Failed to delete blog');
    }
  };

  const filteredBlogs = blogs.filter(blog => 
    blog.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: blogs.length,
    views: blogs.reduce((sum, b) => sum + (b.views || 0), 0),
    likes: blogs.reduce((sum, b) => sum + (b.likes_count || 0), 0)
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 relative z-10 w-full mb-20">
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <BookOpen size={36} className="text-indigo-400" /> My Publications
          </h1>
          <p className="text-gray-400 font-medium mt-2">Manage and monitor your live stories across the platform.</p>
        </div>
        <Link to="/editor" className="btn-primary group flex items-center gap-2 shadow-xl shadow-indigo-500/20">
          <PenSquare size={20} className="group-hover:rotate-12 transition-transform" />
          Create New Story
        </Link>
      </div>

      {/* Hero Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: 'Published Articles', value: stats.total, icon: BookOpen, color: 'text-indigo-400' },
          { label: 'Total Readership', value: stats.views, icon: Eye, color: 'text-cyan-400' },
          { label: 'Community Love', value: stats.likes, icon: Heart, color: 'text-pink-400' },
        ].map((stat, i) => (
          <div key={i} className="glass p-8 rounded-3xl border border-white/10 flex flex-col gap-2 transition-all hover:bg-white/10 group">
            <div className={`p-3 rounded-2xl bg-white/5 w-fit ${stat.color} group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} />
            </div>
            <p className="text-4xl font-black text-white mt-2 tracking-tighter">{stat.value}</p>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters & Content */}
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-white/5 pb-6">
          <div className="relative w-full sm:w-80">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text"
              placeholder="Search your stories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm"
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl border border-white/5">
            <Filter size={14} /> Showing {filteredBlogs.length} Results
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-80 bg-white/5 rounded-[2.5rem] border border-white/10" />)}
          </div>
        ) : filteredBlogs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.map(blog => (
              <div key={blog.id} className="group relative">
                <BlogCard blog={blog} />
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <Link to={`/editor/${blog.id}`} className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white hover:bg-white hover:text-black transition-all">
                    <PenSquare size={18} />
                  </Link>
                  <button 
                    onClick={() => handleDelete(blog.id)}
                    className="p-3 bg-red-500/20 backdrop-blur-md rounded-2xl border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 glass rounded-[3rem] border border-dashed border-white/10">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-600">
               <BookOpen size={40} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No publications found</h3>
            <p className="text-gray-500 font-medium max-w-sm mx-auto mb-8">
              {searchQuery ? "We couldn't find any articles matching your search query." : "You haven't published any stories yet. Your first masterpiece is just a click away."}
            </p>
            {!searchQuery && (
              <Link to="/editor" className="text-indigo-400 font-black uppercase tracking-widest hover:text-indigo-300 flex items-center gap-2 justify-center">
                Start Writing Now →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
