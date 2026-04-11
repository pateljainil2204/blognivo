import { useAuth } from '../hooks/useAuth';
import AuthorDashboard from './AuthorDashboard';
import UserDashboard from './UserDashboard';
import AdminDashboard from './AdminDashboard';
import { Loader2 } from 'lucide-react';

export default function DashboardSwitcher() {
  const { user, loading, isAdmin, isAuthor } = useAuth();

  if (loading && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs animate-pulse">
          Synchronizing Experience...
        </p>
      </div>
    );
  }

  // If we have a user but no profile yet, the deriveRole in context already set isAdmin/isAuthor
  if (isAdmin) return <AdminDashboard />;
  if (isAuthor) return <AuthorDashboard />;
  
  return <UserDashboard />;
}
