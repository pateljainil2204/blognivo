import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useBlogs } from '../hooks/useBlogs';
import { Eye, Heart, PenSquare, Trash2, Bookmark, User, Settings, Save, Loader2, Clock, Shield, Award, LayoutDashboard, Users, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AuthorDashboard() {
  const { user, profile } = useAuth();
  const { toggleBookmark } = useBlogs();
  const [blogs, setBlogs] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [stats, setStats] = useState({ views: 0, likes: 0, followers: 0, bookmarksReceived: 0 });
  const [tab, setTab] = useState('blogs');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingProfile, setEditingProfile] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBio, setNewBio] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('blogs')
      .select('*')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false });
    const allBlogs = data || [];
    setBlogs(allBlogs);

    const totalViews = allBlogs.reduce((sum, b) => sum + (b.views || 0), 0);
    const blogIds = allBlogs.map(b => b.id);

    const [likeRes, followerRes, bookmarkRes] = await Promise.all([
      blogIds.length > 0
        ? supabase.from('likes').select('*', { count: 'exact', head: true }).in('blog_id', blogIds)
        : Promise.resolve({ count: 0 }),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', user.id),
      blogIds.length > 0
        ? supabase.from('bookmarks').select('*', { count: 'exact', head: true }).in('blog_id', blogIds)
        : Promise.resolve({ count: 0 }),
    ]);

    setStats({
      views: totalViews,
      likes: likeRes.count || 0,
      followers: followerRes.count || 0,
      bookmarksReceived: bookmarkRes.count || 0,
    });
  }, [user]);

  const fetchBookmarks = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('bookmarks')
      .select('*, blogs(*, users(name))')
      .eq('user_id', user.id);
    setBookmarks(data || []);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchData();
      fetchBookmarks();
    }
  }, [user, fetchData, fetchBookmarks]);

  useEffect(() => {
    if (profile) {
      setNewName(profile.name || '');
      setNewBio(profile.bio || '');
    }
  }, [profile]);

  const updateProfile = async () => {
    setSavingProfile(true);
    const { error } = await supabase
      .from('users')
      .update({ name: newName, bio: newBio })
      .eq('id', user.id);
    
    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated');
      setEditingProfile(false);
    }
    setSavingProfile(false);
  };

  const deleteBlog = async (id) => {
    if (!confirm('Permanently delete this article?')) return;
    const { error } = await supabase.from('blogs').delete().eq('id', id);
    if (error) {
      toast.error('Deletion failed');
    } else {
      toast.success('Article deleted');
      fetchData();
    }
  };

  const statusColor = {
    draft: 'bg-white/10 text-gray-400 border-white/20',
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const pendingCount = blogs.filter(b => b.status === 'pending').length;
  const rejectedCount = blogs.filter(b => b.status === 'rejected').length;

  const filteredBlogs = statusFilter === 'all'
    ? blogs
    : blogs.filter(b => b.status === statusFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 relative z-10 w-full">
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <LayoutDashboard size={32} className="text-indigo-400" /> Control Center
          </h1>
          <p className="text-gray-400 font-medium mt-2">Oversee your publications, track performance, and manage your identity.</p>
        </div>
        <Link
          to="/editor"
          className="btn-primary flex items-center gap-2 group shadow-xl shadow-indigo-500/20"
        >
          <PenSquare size={20} className="group-hover:rotate-12 transition-transform" />
          Craft New Story
        </Link>
      </div>

      {/* Alerts: Pending / Rejected */}
      {(pendingCount > 0 || rejectedCount > 0) && (
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          {pendingCount > 0 && (
            <div className="flex-1 flex items-center gap-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl px-6 py-4 glass">
              <div className="p-2 bg-yellow-500/20 rounded-xl text-yellow-400">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-sm font-black text-yellow-300">
                  {pendingCount} article{pendingCount > 1 ? 's' : ''} awaiting admin review
                </p>
                <p className="text-xs text-yellow-500 mt-0.5">You'll be notified once reviewed.</p>
              </div>
              <button onClick={() => { setTab('blogs'); setStatusFilter('pending'); }} className="ml-auto text-xs font-black text-yellow-400 uppercase tracking-widest hover:underline">View →</button>
            </div>
          )}
          {rejectedCount > 0 && (
            <div className="flex-1 flex items-center gap-4 bg-red-500/10 border border-red-500/20 rounded-2xl px-6 py-4 glass">
              <div className="p-2 bg-red-500/20 rounded-xl text-red-400">
                <AlertTriangle size={20} />
              </div>
              <div>
                <p className="text-sm font-black text-red-300">
                  {rejectedCount} article{rejectedCount > 1 ? 's' : ''} rejected — edit and resubmit
                </p>
                <p className="text-xs text-red-500 mt-0.5">Click the edit icon to revise and resubmit.</p>
              </div>
              <button onClick={() => { setTab('blogs'); setStatusFilter('rejected'); }} className="ml-auto text-xs font-black text-red-400 uppercase tracking-widest hover:underline">View →</button>
            </div>
          )}
        </div>
      )}

      {/* Profile & Stats Header */}
      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 glass card-premium p-8 relative overflow-hidden group shadow-lg">
          <div className="absolute top-0 right-0 p-6 opacity-5 grayscale translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-700 pointer-events-none">
            <User size={160} />
          </div>
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-black shadow-lg border-2 border-white/20 shrink-0">
              {profile?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <h2 className="text-2xl font-black text-white tracking-tight">{profile?.name}</h2>
                {profile?.role === 'admin' && <Shield size={16} className="text-purple-400 shrink-0" />}
                {profile?.role === 'author' && <Award size={16} className="text-indigo-400 shrink-0" />}
              </div>
              <p className="text-gray-400 font-medium mb-4 line-clamp-2 max-w-lg">
                {profile?.bio || "You haven't set a biography yet. Tell the world who you are!"}
              </p>
              <button 
                onClick={() => setEditingProfile(!editingProfile)}
                className="text-xs font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 flex items-center gap-2 mx-auto sm:mx-0 transition-colors"
              >
                <Settings size={14} /> Profile Settings
              </button>
            </div>
          </div>

          {editingProfile && (
            <div className="mt-8 pt-8 border-t border-white/10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Display Name</label>
                  <input 
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:ring-1 focus:ring-indigo-500/50 transition text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Biography</label>
                  <textarea 
                    value={newBio}
                    onChange={(e) => setNewBio(e.target.value)}
                    rows={1}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:ring-1 focus:ring-indigo-500/50 transition resize-none text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => setEditingProfile(false)} className="text-xs font-bold text-gray-400 hover:text-white transition-colors px-4">Cancel</button>
                <button 
                  onClick={updateProfile}
                  disabled={savingProfile}
                  className="btn-primary py-2 px-6 text-xs flex items-center gap-2"
                >
                  {savingProfile ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Save Identity
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid — all 4 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass card-premium p-5 flex flex-col gap-3 bg-white/5 shadow-none hover:shadow-indigo-500/10">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl w-fit">
              <Eye size={20} />
            </div>
            <p className="text-3xl font-black text-white tracking-tighter">{stats.views}</p>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Views</p>
          </div>
          <div className="glass card-premium p-5 flex flex-col gap-3 bg-white/5 shadow-none hover:shadow-pink-500/10">
            <div className="p-2.5 bg-pink-500/20 text-pink-400 rounded-xl w-fit">
              <Heart size={20} />
            </div>
            <p className="text-3xl font-black text-white tracking-tighter">{stats.likes}</p>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Likes</p>
          </div>
          <div className="glass card-premium p-5 flex flex-col gap-3 bg-white/5 shadow-none hover:shadow-amber-500/10">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl w-fit">
              <Bookmark size={20} />
            </div>
            <p className="text-3xl font-black text-white tracking-tighter">{stats.bookmarksReceived}</p>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Bookmarks</p>
          </div>
          <div className="glass card-premium p-5 flex flex-col gap-3 bg-white/5 shadow-none hover:shadow-purple-500/10">
            <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl w-fit">
              <Users size={20} />
            </div>
            <p className="text-3xl font-black text-white tracking-tighter">{stats.followers}</p>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Followers</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1 w-full overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-8">
            <div className="flex gap-8">
              <button 
                onClick={() => setTab('blogs')}
                className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${
                  tab === 'blogs' ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                My Publications
                {tab === 'blogs' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 rounded-t-full shadow-[0_-2px_8px_rgba(99,102,241,0.5)]" />}
              </button>
              <button 
                onClick={() => setTab('bookmarks')}
                className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${
                  tab === 'bookmarks' ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Saved Library
                {tab === 'bookmarks' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 rounded-t-full shadow-[0_-2px_8px_rgba(99,102,241,0.5)]" />}
              </button>
            </div>
          </div>

          {/* Blog Status Filter */}
          {tab === 'blogs' && (
            <div className="flex flex-wrap gap-2 mb-6">
              {['all', 'approved', 'pending', 'rejected', 'draft'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                    statusFilter === s
                      ? 'bg-indigo-500 text-white border-transparent shadow-lg shadow-indigo-500/20'
                      : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {s === 'all' ? 'All' : s}
                  {s === 'pending' && pendingCount > 0 && (
                    <span className="ml-1.5 bg-yellow-500 text-yellow-950 rounded-full px-1.5 py-0.5 text-[8px] tracking-tight">{pendingCount}</span>
                  )}
                  {s === 'rejected' && rejectedCount > 0 && (
                    <span className="ml-1.5 bg-red-500 text-white rounded-full px-1.5 py-0.5 text-[8px] tracking-tight">{rejectedCount}</span>
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-4">
            {tab === 'blogs' ? (
              filteredBlogs.map((blog) => (
                <div key={blog.id} className="card-premium p-5 group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-indigo-500/30 transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors truncate text-lg">{blog.title}</h3>
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusColor[blog.status]}`}>
                        {blog.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><Clock size={12} /> {new Date(blog.created_at).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1.5"><Eye size={12} /> {blog.views || 0} views</span>
                    </div>
                    {blog.status === 'rejected' && blog.ai_reason && (
                      <p className="mt-3 text-xs text-red-400 italic flex items-center gap-1.5 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 w-fit">
                        <AlertTriangle size={12} /> {blog.ai_reason}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link to={`/blog/${blog.id}`} className="p-2.5 text-gray-500 hover:bg-white/10 hover:text-indigo-400 rounded-xl transition bg-white/5 border border-white/5">
                      <Eye size={18} />
                    </Link>
                    <Link to={`/editor/${blog.id}`} className="p-2.5 text-gray-500 hover:bg-white/10 hover:text-white rounded-xl transition bg-white/5 border border-white/5">
                      <PenSquare size={18} />
                    </Link>
                    <button onClick={() => deleteBlog(blog.id)} className="p-2.5 text-gray-500 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition bg-white/5 border border-white/5">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              bookmarks.map((bm) => (
                <div key={bm.id} className="card-premium p-5 group flex items-center justify-between bg-white/5 border border-white/5 hover:bg-white/10 hover:border-amber-500/30 transition-all">
                  <Link to={`/blog/${bm.blogs?.id}`} className="flex-1 truncate pr-4">
                    <h3 className="font-bold text-white hover:text-amber-400 transition truncate text-lg">{bm.blogs?.title}</h3>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2 truncate">
                      By {bm.blogs?.users?.name} • Added {new Date(bm.created_at).toLocaleDateString()}
                    </p>
                  </Link>
                  <button 
                    onClick={() => toggleBookmark(bm.blogs?.id, user.id, true).then(() => fetchBookmarks())}
                    className="p-2.5 text-amber-500 hover:bg-amber-500/10 hover:text-amber-400 rounded-xl transition bg-amber-500/5 border border-amber-500/10 shrink-0"
                  >
                    <Bookmark size={20} fill="currentColor" />
                  </button>
                </div>
              ))
            )}

            {((tab === 'blogs' && filteredBlogs.length === 0) || (tab === 'bookmarks' && bookmarks.length === 0)) && (
              <div className="text-center py-20 glass rounded-[2rem] border border-white/10 border-dashed">
                <p className="text-gray-400 font-bold italic">No records found here.</p>
                {tab === 'blogs' && statusFilter !== 'all' && (
                  <button onClick={() => setStatusFilter('all')} className="mt-4 text-xs text-indigo-400 font-black uppercase tracking-widest hover:text-indigo-300">Show All →</button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mini Sidebar — publication summary */}
        <aside className="lg:w-80 shrink-0">
          <div className="glass p-8 rounded-3xl border border-white/10 flex flex-col items-center text-center shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/20">
              <Award size={32} />
            </div>
            <h4 className="text-xl font-black text-white mb-2 tracking-tight">Author Hub</h4>
            <div className="w-full space-y-2 mt-5 text-left">
              {[
                { label: 'Total Articles', value: blogs.length, color: 'text-white' },
                { label: 'Published', value: blogs.filter(b => b.status === 'approved').length, color: 'text-emerald-400' },
                { label: 'Pending Review', value: pendingCount, color: 'text-yellow-400' },
                { label: 'Rejected', value: rejectedCount, color: 'text-red-400' },
                { label: 'Drafts', value: blogs.filter(b => b.status === 'draft').length, color: 'text-gray-500' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 group">
                  <span className="text-xs font-bold text-gray-400 group-hover:text-gray-300 transition-colors uppercase tracking-widest">{item.label}</span>
                  <span className={`text-base font-black ${item.color} group-hover:scale-110 transition-transform origin-right`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}