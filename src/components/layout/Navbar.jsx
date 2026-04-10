import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, PenSquare, Shield, User, BookOpen, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { user, profile, signOut, isAuthor, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass sticky top-0 z-50 border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-black text-blue-600 flex items-center gap-2 group">
          <div className="p-1.5 bg-blue-600 text-white rounded-lg transition-transform group-hover:rotate-12">
            <BookOpen size={20} />
          </div>
          <span className="tracking-tighter">BlogNivo</span>
        </Link>

        {/* Desktop Links */}
        <div className="flex items-center gap-6">
          {user ? (
            <>
              {isAuthor && (
                <Link 
                  to="/editor" 
                  className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${isActive('/editor') ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
                >
                  <PenSquare size={16} /> Write
                </Link>
              )}
              <Link 
                to="/dashboard" 
                className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${isActive('/dashboard') ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
              >
                <User size={16} /> Dashboard
              </Link>

              {isAdmin && (
                <Link 
                  to="/admin" 
                  className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${isActive('/admin') ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
                >
                  <Shield size={16} /> Admin
                </Link>
              )}
              
              <div className="h-6 w-px bg-slate-200 mx-2" />
              
              <div className="flex items-center gap-3 pl-2">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    {profile?.name || user?.email?.split('@')[0]}
                  </p>
                  <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tighter">
                    {profile?.role || 'User'}
                  </p>
                </div>

                <button 
                  onClick={handleSignOut}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="Sign Out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition">
                Sign In
              </Link>
              <Link to="/signup" className="btn-primary flex items-center gap-2 text-sm">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}