import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { 
  Shield, Users, BarChart2, CheckCircle, XCircle, 
  Activity, ShieldCheck, Zap, UserPlus, FileEdit, 
  ArrowRight, Award, ExternalLink, TrendingUp, Sparkles,
  BarChart3
} from 'lucide-react';
import ProfileLayout from '../components/profile/ProfileLayout';
import toast from 'react-hot-toast';

export default function AdminProfile() {
  const { id } = useParams();
  const { user: currentUser, profile: currentProfile, isAdmin: currentIsAdmin } = useAuth();
  const [platformStats, setPlatformStats] = useState({
    totalUsers: 0,
    totalBlogs: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    activeAuthors: 0
  });
  const [activeProfile, setActiveProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const targetId = id || currentUser?.id;

  const fetchData = useCallback(async () => {
    if (!targetId) return;
    setLoading(true);
    try {
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', targetId)
        .single();
      
      setActiveProfile(profileData);

      if (currentIsAdmin) {
        const [usersRes, blogsRes, authorsRes] = await Promise.all([
          supabase.from('users').select('*', { count: 'exact', head: true }),
          supabase.from('blogs').select('status'),
          supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'author'),
        ]);

        const blogs = blogsRes.data || [];
        setPlatformStats({
          totalUsers: usersRes.count || 0,
          totalBlogs: blogs.length,
          pending: blogs.filter(b => b.status === 'pending').length,
          approved: blogs.filter(b => b.status === 'approved').length,
          rejected: blogs.filter(b => b.status === 'rejected').length,
          activeAuthors: authorsRes.count || 0
        });
      }
    } catch (err) {
      console.error('Error fetching admin profile:', err);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [targetId, currentIsAdmin]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const adminIdentityStats = [
    { label: 'Users Managed', value: platformStats.totalUsers, icon: Users, iconColor: 'text-indigo-400' },
    { label: 'Blogs Reviewed', value: platformStats.approved + platformStats.rejected, icon: BarChart2, iconColor: 'text-cyan-400' },
    { label: 'Total Authors', value: platformStats.activeAuthors, icon: Award, iconColor: 'text-purple-400' },
    { label: 'Platform Growth', value: '+12%', icon: TrendingUp, iconColor: 'text-emerald-400' },
  ];

  const actionButton = (
    <Link to="/admin-dashboard" className="px-8 py-3 rounded-2xl bg-white text-slate-950 text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-200 transition-all shadow-xl">
      <Activity size={16} /> Command Center
    </Link>
  );

  return (
    <ProfileLayout 
      profile={activeProfile} 
      stats={adminIdentityStats} 
      actionButton={actionButton}
      roleBadge="Administrator"
    >
      <div className="space-y-12 mt-8">
        

        {/* SECTION 2: PLATFORM INSIGHTS */}
        <section className="bg-white/5 rounded-[2.5rem] border border-white/5 overflow-hidden">
           <div className="p-8 border-b border-white/5 bg-white/[0.02]">
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                 <Zap size={20} className="text-amber-400" /> Platform Insights
              </h2>
           </div>
           <div className="p-10 grid md:grid-cols-3 gap-12">
              <div className="space-y-4">
                 <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Top Category</p>
                 <h4 className="text-2xl font-black text-white">Technology</h4>
                 <p className="text-xs text-gray-500 font-medium leading-relaxed">Highest growth volume and reader retention this month.</p>
              </div>
              <div className="space-y-4 border-x border-white/5 px-12">
                 <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Growth Trend</p>
                 <h4 className="text-2xl font-black text-emerald-400">+18.5%</h4>
                 <p className="text-xs text-gray-500 font-medium leading-relaxed">System-wide engagement increase across all major verticals.</p>
              </div>
              <div className="space-y-4">
                 <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Engagement Summary</p>
                 <h4 className="text-2xl font-black text-white">Excellent</h4>
                 <p className="text-xs text-gray-500 font-medium leading-relaxed">Reader-author interaction index reached a new all-time high.</p>
              </div>
           </div>
        </section>

      </div>
    </ProfileLayout>
  );
}

