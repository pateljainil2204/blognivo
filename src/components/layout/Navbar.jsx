import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, PenSquare, Shield, User, BookOpen } from 'lucide-react';

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
    <nav className="sticky top-0 z-50 bg-slate-950/70 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-black text-white flex items-center gap-2 group">
          <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-lg transition-transform group-hover:rotate-12 shadow-lg shadow-indigo-500/20">
            <BookOpen size={20} />
          </div>
          <span className="tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">BlogNivo</span>
        </Link>

        {/* Desktop Links */}
        <div className="flex items-center gap-6">
          {user ? (
            <>
              {isAuthor && (
                <Link 
                  to="/editor" 
                  className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${isActive('/editor') ? 'text-indigo-400' : 'text-gray-400 hover:text-indigo-400'}`}
                >
                  <PenSquare size={16} /> Write
                </Link>
              )}
              <Link 
                to="/dashboard" 
                className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${isActive('/dashboard') ? 'text-indigo-400' : 'text-gray-400 hover:text-indigo-400'}`}
              >
                <User size={16} /> Dashboard
              </Link>

              {isAdmin && (
                <Link 
                  to="/admin" 
                  className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${isActive('/admin') ? 'text-indigo-400' : 'text-gray-400 hover:text-indigo-400'}`}
                >
                  <Shield size={16} /> Admin
                </Link>
              )}
              
              <div className="h-6 w-px bg-white/10 mx-2" />
              
              <div className="flex items-center gap-3 pl-2">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-white leading-tight">
                    {profile?.name || user?.email?.split('@')[0]}
                  </p>
                  <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-tighter">
                    {profile?.role || 'User'}
                  </p>
                </div>

                <button 
                  onClick={handleSignOut}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                  title="Sign Out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-gray-400 hover:text-white transition">
                Sign In
              </Link>
              <Link to="/signup" className="btn-primary flex items-center gap-2 text-sm shadow-indigo-500/20">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}