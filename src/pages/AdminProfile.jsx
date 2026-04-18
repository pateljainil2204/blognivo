import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Shield, Users, BarChart2, CheckCircle, XCircle, TrendingUp, Activity, PieChart } from 'lucide-react';
import ProfileLayout from '../components/profile/ProfileLayout';
import toast from 'react-hot-toast';

export default function AdminProfile() {
  const { user, profile, isAdmin } = useAuth();
  const [platformStats, setPlatformStats] = useState({
    totalUsers: 0,
    totalBlogs: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    activeAuthors: 0
  });
  const [categoryStats, setCategoryStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const [usersRes, blogsRes, authorsRes] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('blogs').select('status'),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'author'),
      ]);

      const blogs = blogsRes.data || [];
      const stats = {
        totalUsers: usersRes.count || 0,
        totalBlogs: blogs.length,
        pending: blogs.filter(b => b.status === 'pending').length,
        approved: blogs.filter(b => b.status === 'approved').length,
        rejected: blogs.filter(b => b.status === 'rejected').length,
        activeAuthors: authorsRes.count || 0
      };
      setPlatformStats(stats);

      // Category Analytics logic
      const approvedBlogs = blogs.filter(b => b.status === 'approved');
      const counts = {};
      approvedBlogs.forEach(b => {
        counts[b.category] = (counts[b.category] || 0) + 1;
      });
      const sortedCategories = Object.entries(counts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);
      setCategoryStats(sortedCategories);

    } catch (err) {
      console.error('Error fetching admin stats:', err);
      toast.error('Failed to load platform overview');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) fetchStats();
  }, [isAdmin, fetchStats]);

  const stats = [
    { label: 'Total Users', value: platformStats.totalUsers, icon: Users, iconColor: 'text-indigo-400', hoverColor: 'group-hover:text-indigo-400', borderColor: 'hover:border-indigo-500/30' },
    { label: 'Total Blogs', value: platformStats.totalBlogs, icon: BarChart2, iconColor: 'text-cyan-400', hoverColor: 'group-hover:text-cyan-400', borderColor: 'hover:border-cyan-500/30' },
    { label: 'Active Authors', value: platformStats.activeAuthors, icon: Shield, iconColor: 'text-purple-400', hoverColor: 'group-hover:text-purple-400', borderColor: 'hover:border-purple-500/30' },
    { label: 'Pending Review', value: platformStats.pending, icon: Activity, iconColor: 'text-yellow-400', hoverColor: 'group-hover:text-yellow-400', borderColor: 'hover:border-yellow-500/30' },
  ];

  const actionButton = (
    <div className="px-6 py-2 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 backdrop-blur-md">
      <Shield size={12} /> Root Access
    </div>
  );

  return (
    <ProfileLayout profile={profile} stats={stats} actionButton={actionButton}>
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Category Analytics Section */}
        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
              <PieChart className="text-indigo-400" size={24} /> Content Distribution
            </h2>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              [1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />)
            ) : categoryStats.length > 0 ? (
              categoryStats.map((cat, idx) => {
                const maxCount = categoryStats[0].count;
                const pct = (cat.count / maxCount) * 100;
                return (
                  <div key={cat.category} className="glass p-5 rounded-2xl border border-white/5 flex items-center gap-4 transition-all hover:bg-white/5">
                    <div className="w-32 truncate text-sm font-bold text-gray-300">{cat.category}</div>
                    <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                    <div className="text-sm font-black text-white">{cat.count}</div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 italic text-center py-10">No data available yet.</p>
            )}
          </div>
        </section>

        {/* Platform Growth & Insights */}
        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
              <TrendingUp className="text-emerald-400" size={24} /> Platform Insights
            </h2>
          </div>

          <div className="grid gap-6">
            {/* Approved Posts vs Rejected */}
            <div className="glass p-8 rounded-[2.5rem] border border-white/10 flex items-center justify-between">
               <div className="space-y-2">
                 <p className="text-sm font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                   <CheckCircle size={16} /> Quality Ratio
                 </p>
                 <p className="text-3xl font-black text-white">
                   {platformStats.totalBlogs ? Math.round((platformStats.approved / platformStats.totalBlogs) * 100) : 0}%
                 </p>
                 <p className="text-xs text-gray-500 font-medium">Approval rate across all categories.</p>
               </div>
               <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20 flex items-center justify-center relative">
                  <div className="absolute inset-2 rounded-full border-4 border-emerald-500/50"></div>
                  <CheckCircle size={24} className="text-emerald-400" />
               </div>
            </div>

             {/* System Health */}
             <div className="glass p-8 rounded-[2.5rem] border border-white/10 flex items-center justify-between">
               <div className="space-y-2">
                 <p className="text-sm font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                   <Activity size={16} /> Operational
                 </p>
                 <p className="text-3xl font-black text-white">99.9%</p>
                 <p className="text-xs text-gray-500 font-medium">Platform uptime and response metrics.</p>
               </div>
               <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-3xl border border-indigo-500/20">
                  <Activity size={32} />
               </div>
            </div>
          </div>

          {/* User Review Required Badge */}
          {platformStats.pending > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 p-6 rounded-[2.5rem] flex items-center gap-6 group">
              <div className="p-4 bg-yellow-500/20 text-yellow-400 rounded-2xl group-hover:scale-110 transition-transform">
                <XCircle size={32} className="rotate-45" />
              </div>
              <div>
                <h4 className="text-lg font-black text-yellow-300 tracking-tight">Pending Moderation</h4>
                <p className="text-sm text-yellow-500/70 font-medium">{platformStats.pending} blogs are waiting for your final review.</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </ProfileLayout>
  );
}
