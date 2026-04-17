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
      <div className="flex flex-col items-center justify-center p-20 text-center relative z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-500/10 rounded-full blur-[80px] pointer-events-none -z-10"></div>
        <Shield size={64} className="text-red-500 mb-6 opacity-30 shadow-red-500/20 drop-shadow-2xl" />
        <h2 className="text-3xl font-black text-white tracking-tight">Access Denied</h2>
        <p className="text-gray-400 mt-3 font-medium">Only authorized administrators can access this terminal.</p>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Users',
      value: platformStats.totalUsers,
      icon: <Users size={22} />,
      bg: 'bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/20',
      iconBg: 'bg-indigo-500/20 text-indigo-400',
    },
    {
      label: 'Total Blogs',
      value: platformStats.totalBlogs,
      icon: <BarChart2 size={22} />,
      bg: 'bg-white/5 hover:bg-white/10 border-white/10',
      iconBg: 'bg-white/10 text-gray-300',
    },
    {
      label: 'Pending Review',
      value: platformStats.pending,
      icon: <Clock size={22} />,
      bg: 'bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/20',
      iconBg: 'bg-yellow-500/20 text-yellow-400',
      onClick: () => { setActiveTab('blogs'); setFilterStatus('pending'); },
      highlight: platformStats.pending > 0,
    },
    {
      label: 'Approved',
      value: platformStats.approved,
      icon: <CheckCircle size={22} />,
      bg: 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20',
      iconBg: 'bg-emerald-500/20 text-emerald-400',
      onClick: () => { setActiveTab('blogs'); setFilterStatus('approved'); },
    },
    {
      label: 'Rejected',
      value: platformStats.rejected,
      icon: <XCircle size={22} />,
      bg: 'bg-red-500/10 hover:bg-red-500/20 border-red-500/20',
      iconBg: 'bg-red-500/20 text-red-400',
      onClick: () => { setActiveTab('blogs'); setFilterStatus('rejected'); },
    },
    {
      label: 'Drafts',
      value: platformStats.draft,
      icon: <Eye size={22} />,
      bg: 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/20',
      iconBg: 'bg-cyan-500/20 text-cyan-400',
      onClick: () => { setActiveTab('blogs'); setFilterStatus('draft'); },
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 relative z-10 w-full">
      <div className="absolute top-0 left-0 -ml-32 -mt-32 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
             <Shield className="text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]" size={32} /> Central Authority
          </h1>
          <p className="text-gray-400 font-medium mt-2">Manage the platform ecosystem, content moderation, and user roles.</p>
        </div>
      </div>

      {/* Platform Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {statCards.map((card) => (
          <div
            key={card.label}
            onClick={card.onClick}
            className={`glass p-5 flex flex-col gap-3 border transition-colors relative overflow-hidden ${card.bg} ${card.onClick ? 'cursor-pointer hover:-translate-y-1' : ''} ${card.highlight ? 'ring-2 ring-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : ''}`}
          >
            <div className={`p-2.5 rounded-xl w-fit ${card.iconBg}`}>
              {card.icon}
            </div>
            {statsLoading
              ? <div className="h-8 w-14 bg-white/10 rounded-lg animate-pulse mt-1" />
              : <p className="text-3xl font-black text-white tracking-tighter mt-1">{card.value}</p>
            }
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-tight">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-white/5 p-1 rounded-2xl mb-8 w-fit border border-white/5 shadow-lg">
        <button
          onClick={() => setActiveTab('blogs')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'blogs' ? 'bg-indigo-500/20 text-indigo-300 shadow-sm border border-indigo-500/30' : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <LayoutDashboard size={18} /> Content Moderation
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'users' ? 'bg-indigo-500/20 text-indigo-300 shadow-sm border border-indigo-500/30' : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <Users size={18} /> User Management
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'analytics' ? 'bg-indigo-500/20 text-indigo-300 shadow-sm border border-indigo-500/30' : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <Tag size={18} /> Category Analytics
        </button>
      </div>

      {activeTab === 'blogs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white/5 p-4 rounded-3xl border border-white/10 shadow-lg">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-xs font-black text-gray-500 uppercase tracking-widest pl-2 hidden sm:inline-block">Filter By:</span>
              <div className="flex flex-wrap gap-2">
                {['pending', 'approved', 'rejected', 'draft'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                      filterStatus === s 
                        ? 'bg-indigo-600 text-white border-transparent shadow-lg shadow-indigo-500/30' 
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border-white/10'
                    }`}
                  >
                    {s}
                    {s === 'pending' && platformStats.pending > 0 && (
                      <span className="ml-2 bg-yellow-500 text-yellow-950 rounded-full px-1.5 py-0.5 text-[8px]">{platformStats.pending}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 text-indigo-400 font-bold text-xs pr-4 bg-indigo-500/10 px-4 py-2 rounded-xl border border-indigo-500/20">
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
            <h2 className="text-xl font-black text-white mb-6 tracking-tight">Category Performance (Approved Blogs)</h2>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3,4,5].map(i => <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse border border-white/10" />)}
              </div>
            ) : categoryStats.length === 0 ? (
              <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-[2rem] text-gray-500 font-medium">
                No approved blogs yet.
              </div>
            ) : (
              <div className="space-y-3 max-w-4xl">
                {categoryStats.map((cat, idx) => {
                  const maxCount = categoryStats[0]?.count || 1;
                  const pct = (cat.count / maxCount) * 100;
                  return (
                    <div key={cat.category} className="glass p-5 flex items-center gap-5 border border-white/5 hover:bg-white/5 transition-colors rounded-2xl">
                      <span className="text-[10px] font-black text-gray-600 w-5 shrink-0 bg-white/5 rounded px-1.5 py-1 text-center">#{idx + 1}</span>
                      <div className="w-40 shrink-0">
                        <p className="text-sm font-black text-white truncate">{cat.category}</p>
                      </div>
                      <div className="flex-1 bg-white/5 rounded-full h-3 overflow-hidden border border-white/5">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-1000 ease-out"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-sm font-black text-indigo-300 w-12 text-right shrink-0 bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/20">{cat.count}</span>
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