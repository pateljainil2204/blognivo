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
    draft: 'bg-slate-100 text-slate-600 border-slate-200',
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    approved: 'bg-green-50 text-green-700 border-green-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
  };

  const pendingCount = blogs.filter(b => b.status === 'pending').length;
  const rejectedCount = blogs.filter(b => b.status === 'rejected').length;

  const filteredBlogs = statusFilter === 'all'
    ? blogs
    : blogs.filter(b => b.status === statusFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <LayoutDashboard size={32} className="text-blue-600" /> Control Center
          </h1>
          <p className="text-slate-500 font-medium mt-2">Oversee your publications, track performance, and manage your identity.</p>
        </div>
        <Link
          to="/editor"
          className="btn-primary flex items-center gap-2 group shadow-xl shadow-blue-500/20"
        >
          <PenSquare size={20} className="group-hover:rotate-12 transition-transform" />
          Craft New Story
        </Link>
      </div>

      {/* Alerts: Pending / Rejected */}
      {(pendingCount > 0 || rejectedCount > 0) && (
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          {pendingCount > 0 && (
            <div className="flex-1 flex items-center gap-4 bg-yellow-50 border border-yellow-200 rounded-2xl px-6 py-4">
              <div className="p-2 bg-yellow-100 rounded-xl text-yellow-600">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-sm font-black text-yellow-900">
                  {pendingCount} article{pendingCount > 1 ? 's' : ''} awaiting admin review
                </p>
                <p className="text-xs text-yellow-700 mt-0.5">You'll be notified once reviewed.</p>
              </div>
              <button onClick={() => { setTab('blogs'); setStatusFilter('pending'); }} className="ml-auto text-xs font-black text-yellow-700 uppercase tracking-widest hover:underline">View →</button>
            </div>
          )}
          {rejectedCount > 0 && (
            <div className="flex-1 flex items-center gap-4 bg-red-50 border border-red-200 rounded-2xl px-6 py-4">
              <div className="p-2 bg-red-100 rounded-xl text-red-600">
                <AlertTriangle size={20} />
              </div>
              <div>
                <p className="text-sm font-black text-red-900">
                  {rejectedCount} article{rejectedCount > 1 ? 's' : ''} rejected — edit and resubmit
                </p>
                <p className="text-xs text-red-700 mt-0.5">Click the edit icon to revise and resubmit.</p>
              </div>
              <button onClick={() => { setTab('blogs'); setStatusFilter('rejected'); }} className="ml-auto text-xs font-black text-red-700 uppercase tracking-widest hover:underline">View →</button>
            </div>
          )}
        </div>
      )}

      {/* Profile & Stats Header */}
      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 card-premium p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] grayscale translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-700">
            <User size={160} />
          </div>
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white text-3xl font-black shadow-lg border-2 border-white">
              {profile?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{profile?.name}</h2>
                {profile?.role === 'admin' && <Shield size={16} className="text-purple-500" />}
                {profile?.role === 'author' && <Award size={16} className="text-blue-500" />}
              </div>
              <p className="text-slate-500 font-medium mb-4 line-clamp-2 max-w-lg">
                {profile?.bio || "You haven't set a biography yet. Tell the world who you are!"}
              </p>
              <button 
                onClick={() => setEditingProfile(!editingProfile)}
                className="text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 flex items-center gap-2 mx-auto sm:mx-0"
              >
                <Settings size={14} /> Profile Settings
              </button>
            </div>
          </div>

          {editingProfile && (
            <div className="mt-8 pt-8 border-t border-slate-100 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Display Name</label>
                  <input 
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-500/10 transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Biography</label>
                  <textarea 
                    value={newBio}
                    onChange={(e) => setNewBio(e.target.value)}
                    rows={1}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-500/10 transition resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => setEditingProfile(false)} className="text-xs font-bold text-slate-400 px-4">Cancel</button>
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
          <div className="card-premium p-5 flex flex-col gap-2 bg-gradient-to-br from-blue-50/60 to-white">
            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl w-fit">
              <Eye size={20} />
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tighter">{stats.views}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Views</p>
          </div>
          <div className="card-premium p-5 flex flex-col gap-2 bg-gradient-to-br from-red-50/60 to-white">
            <div className="p-2.5 bg-red-100 text-red-600 rounded-xl w-fit">
              <Heart size={20} />
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tighter">{stats.likes}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Likes</p>
          </div>
          <div className="card-premium p-5 flex flex-col gap-2 bg-gradient-to-br from-yellow-50/60 to-white">
            <div className="p-2.5 bg-yellow-100 text-yellow-600 rounded-xl w-fit">
              <Bookmark size={20} />
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tighter">{stats.bookmarksReceived}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bookmarks</p>
          </div>
          <div className="card-premium p-5 flex flex-col gap-2 bg-gradient-to-br from-purple-50/60 to-white">
            <div className="p-2.5 bg-purple-100 text-purple-600 rounded-xl w-fit">
              <Users size={20} />
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tighter">{stats.followers}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Followers</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-8">
            <div className="flex gap-8">
              <button 
                onClick={() => setTab('blogs')}
                className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${
                  tab === 'blogs' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                My Publications
                {tab === 'blogs' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full" />}
              </button>
              <button 
                onClick={() => setTab('bookmarks')}
                className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${
                  tab === 'bookmarks' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Saved Library
                {tab === 'bookmarks' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full" />}
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
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                    statusFilter === s
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {s === 'all' ? 'All' : s}
                  {s === 'pending' && pendingCount > 0 && (
                    <span className="ml-1.5 bg-yellow-400 text-yellow-900 rounded-full px-1.5 py-0.5 text-[8px]">{pendingCount}</span>
                  )}
                  {s === 'rejected' && rejectedCount > 0 && (
                    <span className="ml-1.5 bg-red-400 text-white rounded-full px-1.5 py-0.5 text-[8px]">{rejectedCount}</span>
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-4">
            {tab === 'blogs' ? (
              filteredBlogs.map((blog) => (
                <div key={blog.id} className="card-premium p-5 group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">{blog.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColor[blog.status]}`}>
                        {blog.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Clock size={10} /> {new Date(blog.created_at).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Eye size={10} /> {blog.views || 0} views</span>
                    </div>
                    {blog.status === 'rejected' && blog.ai_reason && (
                      <p className="mt-2 text-xs text-red-600 italic flex items-center gap-1.5">
                        <AlertTriangle size={10} /> {blog.ai_reason}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/blog/${blog.id}`} className="p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition">
                      <Eye size={18} />
                    </Link>
                    <Link to={`/editor/${blog.id}`} className="p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition">
                      <PenSquare size={18} />
                    </Link>
                    <button onClick={() => deleteBlog(blog.id)} className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              bookmarks.map((bm) => (
                <div key={bm.id} className="card-premium p-5 group flex items-center justify-between">
                  <Link to={`/blog/${bm.blogs?.id}`} className="flex-1">
                    <h3 className="font-bold text-slate-800 hover:text-blue-600 transition">{bm.blogs?.title}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                      By {bm.blogs?.users?.name} • Added {new Date(bm.created_at).toLocaleDateString()}
                    </p>
                  </Link>
                  <button 
                    onClick={() => toggleBookmark(bm.blogs?.id, user.id, true).then(() => fetchBookmarks())}
                    className="p-2 text-yellow-500 hover:bg-yellow-50 rounded-xl transition"
                  >
                    <Bookmark size={20} fill="currentColor" />
                  </button>
                </div>
              ))
            )}

            {((tab === 'blogs' && filteredBlogs.length === 0) || (tab === 'bookmarks' && bookmarks.length === 0)) && (
              <div className="text-center py-20 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
                <p className="text-slate-400 font-bold italic">No records found here.</p>
                {tab === 'blogs' && statusFilter !== 'all' && (
                  <button onClick={() => setStatusFilter('all')} className="mt-4 text-xs text-blue-600 font-black uppercase tracking-widest">Show All →</button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mini Sidebar — publication summary */}
        <aside className="lg:w-80">
          <div className="glass p-8 rounded-3xl border border-blue-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <Award size={32} />
            </div>
            <h4 className="text-lg font-black text-slate-900 mb-2 tracking-tight">Author Stats</h4>
            <div className="w-full space-y-3 mt-4 text-left">
              {[
                { label: 'Total Articles', value: blogs.length },
                { label: 'Published', value: blogs.filter(b => b.status === 'approved').length, color: 'text-green-600' },
                { label: 'Pending Review', value: pendingCount, color: 'text-yellow-600' },
                { label: 'Rejected', value: rejectedCount, color: 'text-red-600' },
                { label: 'Drafts', value: blogs.filter(b => b.status === 'draft').length, color: 'text-slate-500' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="text-xs font-bold text-slate-500">{item.label}</span>
                  <span className={`text-sm font-black ${item.color || 'text-slate-900'}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}