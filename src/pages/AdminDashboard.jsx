import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useAI } from '../hooks/useAI';
import { Shield, Users, BarChart2, Eye, LayoutDashboard, CheckCircle, XCircle, Clock, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminBlogList from '../components/admin/AdminBlogList';
import AdminUserList from '../components/admin/AdminUserList';

export default function AdminDashboard() {
  const { user, profile, isAdmin } = useAuth();
  const { moderate } = useAI();
  const [activeTab, setActiveTab] = useState('blogs');
  const [blogs, setBlogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [moderating, setModerating] = useState(null);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [platformStats, setPlatformStats] = useState({
    totalUsers: 0,
    totalBlogs: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    draft: 0,
  });
  const [categoryStats, setCategoryStats] = useState([]);

  useEffect(() => {
    fetchPlatformStats();
  }, [isAdmin]);

  useEffect(() => {
    if (activeTab === 'blogs') fetchBlogs();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'analytics') fetchCategoryStats();
  }, [activeTab, filterStatus, isAdmin]);

  const fetchPlatformStats = async () => {
    if (!isAdmin) return;
    setStatsLoading(true);
    const [usersRes, pendingRes, approvedRes, rejectedRes, draftRes] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('blogs').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('blogs').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('blogs').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
      supabase.from('blogs').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    ]);
    const total =
      (pendingRes.count || 0) + (approvedRes.count || 0) +
      (rejectedRes.count || 0) + (draftRes.count || 0);

    setPlatformStats({
      totalUsers: usersRes.count || 0,
      totalBlogs: total,
      pending: pendingRes.count || 0,
      approved: approvedRes.count || 0,
      rejected: rejectedRes.count || 0,
      draft: draftRes.count || 0,
    });
    setStatsLoading(false);
  };

  const fetchCategoryStats = async () => {
    if (!isAdmin) return;
    setLoading(true);
    const { data } = await supabase
      .from('blogs')
      .select('category, status')
      .eq('status', 'approved');
    
    if (data) {
      const counts = {};
      data.forEach(b => {
        counts[b.category] = (counts[b.category] || 0) + 1;
      });
      const sorted = Object.entries(counts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);
      setCategoryStats(sorted);
    }
    setLoading(false);
  };

  const fetchBlogs = async () => {
    if (!isAdmin) return;
    setLoading(true);
    const { data } = await supabase
      .from('blogs')
      .select('*, users!blogs_author_id_fkey(name, avatar)')
      .eq('status', filterStatus)
      .order('created_at', { ascending: false });
    setBlogs(data || []);
    setLoading(false);
  };

  const fetchUsers = async () => {
    if (!isAdmin) return;
    setLoading(true);
    const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  const handleModerate = async (blogId) => {
    setModerating(blogId);
    try {
      await moderate(blogId);
      toast.success('AI Moderation completed!');
      fetchBlogs();
    } catch (err) {
      toast.error('AI Moderation failed');
    } finally {
      setModerating(null);
    }
  };

  const updateBlogStatus = async (blogId, status) => {
    const { error } = await supabase.from('blogs').update({ status }).eq('id', blogId);
    if (error) {
      toast.error('Update failed');
    } else {
      toast.success(`Article ${status}`);
      fetchBlogs();
      fetchPlatformStats(); // refresh stat cards
    }
  };

  const updateUserRole = async (userId, role) => {
    const { error } = await supabase.from('users').update({ role }).eq('id', userId);
    if (error) {
      toast.error('Role update failed');
    } else {
      toast.success(`Role updated to ${role}`);
      fetchUsers();
    }
  };

  if (!user || !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <Shield size={64} className="text-red-500 mb-6 opacity-20" />
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Access Denied</h2>
        <p className="text-slate-500 mt-2">Only authorized administrators can access this terminal.</p>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Users',
      value: platformStats.totalUsers,
      icon: <Users size={22} />,
      bg: 'from-blue-50/80 to-white',
      iconBg: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Total Blogs',
      value: platformStats.totalBlogs,
      icon: <BarChart2 size={22} />,
      bg: 'from-slate-50/80 to-white',
      iconBg: 'bg-slate-100 text-slate-600',
    },
    {
      label: 'Pending Review',
      value: platformStats.pending,
      icon: <Clock size={22} />,
      bg: 'from-yellow-50/80 to-white',
      iconBg: 'bg-yellow-100 text-yellow-600',
      onClick: () => { setActiveTab('blogs'); setFilterStatus('pending'); },
      highlight: platformStats.pending > 0,
    },
    {
      label: 'Approved',
      value: platformStats.approved,
      icon: <CheckCircle size={22} />,
      bg: 'from-green-50/80 to-white',
      iconBg: 'bg-green-100 text-green-600',
      onClick: () => { setActiveTab('blogs'); setFilterStatus('approved'); },
    },
    {
      label: 'Rejected',
      value: platformStats.rejected,
      icon: <XCircle size={22} />,
      bg: 'from-red-50/80 to-white',
      iconBg: 'bg-red-100 text-red-600',
      onClick: () => { setActiveTab('blogs'); setFilterStatus('rejected'); },
    },
    {
      label: 'Drafts',
      value: platformStats.draft,
      icon: <Eye size={22} />,
      bg: 'from-purple-50/80 to-white',
      iconBg: 'bg-purple-100 text-purple-600',
      onClick: () => { setActiveTab('blogs'); setFilterStatus('draft'); },
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             <Shield className="text-blue-600" size={32} /> Central Authority
          </h1>
          <p className="text-slate-500 font-medium mt-2">Manage the BlogNivo ecosystem, content moderation, and user roles.</p>
        </div>
      </div>

      {/* Platform Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {statCards.map((card) => (
          <div
            key={card.label}
            onClick={card.onClick}
            className={`card-premium p-5 flex flex-col gap-3 bg-gradient-to-br ${card.bg} ${card.onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''} ${card.highlight ? 'ring-2 ring-yellow-300 ring-offset-1' : ''}`}
          >
            <div className={`p-2.5 rounded-xl w-fit ${card.iconBg}`}>
              {card.icon}
            </div>
            {statsLoading
              ? <div className="h-7 w-14 bg-slate-100 rounded-lg animate-pulse" />
              : <p className="text-2xl font-black text-slate-900 tracking-tighter">{card.value}</p>
            }
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-slate-100 p-1 rounded-2xl mb-8 w-fit">
        <button
          onClick={() => setActiveTab('blogs')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'blogs' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <LayoutDashboard size={18} /> Content Moderation
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'users' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users size={18} /> User Management
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'analytics' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Tag size={18} /> Category Analytics
        </button>
      </div>

      {activeTab === 'blogs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-3xl border border-slate-100">
            <div className="flex items-center gap-4">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Filter By:</span>
              <div className="flex gap-2">
                {['pending', 'approved', 'rejected', 'draft'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                      filterStatus === s 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                        : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {s}
                    {s === 'pending' && platformStats.pending > 0 && (
                      <span className="ml-1.5 bg-yellow-400 text-yellow-900 rounded-full px-1 text-[8px]">{platformStats.pending}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 text-slate-400 font-bold text-xs pr-2">
              <BarChart2 size={16} /> {blogs.length} Articles Found
            </div>
          </div>

          <AdminBlogList
            blogs={blogs}
            loading={loading}
            moderating={moderating}
            onModerate={handleModerate}
            onApprove={(id) => updateBlogStatus(id, 'approved')}
            onReject={(id) => updateBlogStatus(id, 'rejected')}
            onPreview={(blog) => window.open(`/blog/${blog.id}`, '_blank')}
          />
        </div>
      )}

      {activeTab === 'users' && (
        <AdminUserList
          users={users}
          loading={loading}
          onUpdateRole={updateUserRole}
        />
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-6 tracking-tight">Category Performance (Approved Blogs)</h2>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-slate-50 rounded-2xl animate-pulse" />)}
              </div>
            ) : categoryStats.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 border border-dashed border-slate-200 rounded-3xl text-slate-400 font-medium">
                No approved blogs yet.
              </div>
            ) : (
              <div className="space-y-3">
                {categoryStats.map((cat, idx) => {
                  const maxCount = categoryStats[0]?.count || 1;
                  const pct = (cat.count / maxCount) * 100;
                  return (
                    <div key={cat.category} className="card-premium p-5 flex items-center gap-5">
                      <span className="text-[10px] font-black text-slate-400 w-5 shrink-0">#{idx + 1}</span>
                      <div className="w-40 shrink-0">
                        <p className="text-sm font-black text-slate-900 truncate">{cat.category}</p>
                      </div>
                      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-sm font-black text-slate-700 w-10 text-right shrink-0">{cat.count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}