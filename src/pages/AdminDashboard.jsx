import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { 
  Shield, Users, BarChart2, CheckCircle, 
  TrendingUp, Activity, Sparkles, Tag, Award, XCircle,
  ArrowUpRight, Zap, Target
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const [statsLoading, setStatsLoading] = useState(true);
  const [platformStats, setPlatformStats] = useState({
    totalUsers: 0,
    totalBlogs: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    activeAuthors: 0,
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchPlatformStats();
      setTimeout(() => setIsVisible(true), 100);
    }
  }, [isAdmin]);

  const fetchPlatformStats = async () => {
    if (!isAdmin) return;
    setStatsLoading(true);
    const [usersRes, pendingRes, approvedRes, rejectedRes, authorsRes] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('blogs').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('blogs').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('blogs').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'author'),
    ]);

    const totalBlogs = (pendingRes.count || 0) + (approvedRes.count || 0) + (rejectedRes.count || 0);

    setPlatformStats({
      totalUsers: usersRes.count || 0,
      totalBlogs,
      pending: pendingRes.count || 0,
      approved: approvedRes.count || 0,
      rejected: rejectedRes.count || 0,
      activeAuthors: authorsRes.count || 0,
    });
    setStatsLoading(false);
  };


  if (!user || !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center relative z-10 min-h-[60vh]">
        <Shield size={64} className="text-red-500 mb-6 opacity-30" />
        <h2 className="text-3xl font-black text-white tracking-tight">Access Denied</h2>
        <p className="text-gray-400 mt-3 font-medium">Authentication required for administrative access.</p>
      </div>
    );
  }

  const approvalRate = platformStats.totalBlogs > 0 
    ? Math.round((platformStats.approved / platformStats.totalBlogs) * 100) 
    : 0;
  
  const rejectionRate = platformStats.totalBlogs > 0 
    ? Math.round((platformStats.rejected / platformStats.totalBlogs) * 100) 
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 relative animate-in fade-in duration-1000">
      
      {/* 1. TOP: WELCOME HEADER */}
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-black text-white tracking-tight">Welcome back, Admin</h1>
        <p className="text-gray-500 font-medium mt-2">Here’s your platform overview and performance insights.</p>
      </header>

      <div className="space-y-6">
        
        {/* SECTION 1: OVERVIEW CARDS (Equal size row) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Users', value: platformStats.totalUsers, icon: Users, color: 'text-indigo-400' },
            { label: 'Total Blogs', value: platformStats.totalBlogs, icon: BarChart2, color: 'text-cyan-400' },
            { label: 'Active Authors', value: platformStats.activeAuthors, icon: Sparkles, color: 'text-purple-400' },
            { label: 'Engagement Rate', value: '74.2%', icon: Activity, color: 'text-emerald-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 p-8 rounded-2xl border border-white/5 hover:bg-white/[0.07] transition-all flex flex-col items-center text-center group">
              <div className={`p-3 bg-white/5 rounded-xl ${stat.color} mb-4 group-hover:scale-110 transition-transform`}>
                <stat.icon size={20} />
              </div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
              <h4 className="text-3xl font-black text-white tracking-tighter tabular-nums">
                {statsLoading ? '...' : stat.value}
              </h4>
            </div>
          ))}
        </div>

        {/* SECTION 2: PERFORMANCE INSIGHTS HERO */}
        <div className="bg-gradient-to-br from-indigo-600/10 to-transparent p-10 rounded-[2.5rem] border border-white/10 relative overflow-hidden group mb-10">
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-1000">
            <TrendingUp size={150} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight mb-2 flex items-center gap-2">
                <Target size={20} className="text-indigo-400" /> Platform Performance
              </h2>
              <div className="flex items-center gap-4 mt-4">
                <span className="text-5xl font-black text-white tracking-tighter">98.4%</span>
                <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                  <ArrowUpRight size={12} /> +5.2%
                </div>
              </div>
            </div>
            <div className="max-w-xs">
              <div className="p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                <p className="text-sm text-gray-400 font-medium leading-relaxed">
                  Platform engagement is <span className="text-white font-bold">trending upward</span>. User registrations have increased by <span className="text-indigo-400 font-bold">12%</span> this week.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-10 gap-6">
          

          {/* SECTION 4: QUICK SNAPSHOT (Compact) */}
          <div className="lg:col-span-10 space-y-6">
             <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 group hover:bg-white/[0.07] transition-all">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">Administrative Snapshot</h3>
                <div className="space-y-6">
                   {[
                     { label: 'Pending Requests', value: platformStats.pending, color: platformStats.pending > 0 ? 'text-amber-400' : 'text-gray-500' },
                     { label: 'Approval Rate', value: approvalRate + '%', color: 'text-emerald-400' },
                     { label: 'Rejection Rate', value: rejectionRate + '%', color: 'text-red-400' },
                   ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                         <span className="text-xs font-bold text-gray-500">{item.label}</span>
                         <span className={`text-xl font-black ${item.color}`}>{item.value}</span>
                      </div>
                   ))}
                </div>
                <div className="mt-8 pt-6 border-t border-white/5">
                   <p className="text-[10px] text-gray-600 font-medium leading-relaxed">
                     Process the <span className="text-white">pending queue</span> to maintain platform content flow.
                   </p>
                </div>
             </div>

             <div className="p-8 bg-indigo-600 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
                <Zap className="absolute -bottom-4 -left-4 text-indigo-400 opacity-20" size={100} />
                <div className="relative z-10 text-center">
                   <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-2">Growth Trend</p>
                   <h4 className="text-4xl font-black tracking-tighter mb-4">Positive</h4>
                   <p className="text-xs font-bold text-indigo-100">Stability Index: <span className="text-white">Optimal</span></p>
                </div>
             </div>
          </div>

        </div>

      </div>
    </div>
  );
}

const Link = ({ to, children, className }) => (
  <a href={to} className={className}>{children}</a>
);