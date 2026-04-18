import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, PenSquare, Shield, User, BookOpen, Home, Bookmark, Heart } from 'lucide-react';

export default function Navbar() {
  const { user, profile, signOut, isAuthor, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActivePath = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/70 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-black text-white flex items-center gap-2 group">
            <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-lg transition-transform group-hover:rotate-12 shadow-lg shadow-indigo-500/20">
              <BookOpen size={20} />
            </div>
            <span className="tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">BlogNivo</span>
          </Link>

          {/* Desktop User Nav */}
          {user && (
            <div className="hidden md:flex items-center gap-6 ml-6">
              {[
                { id: 'feed', label: 'My Feed', icon: Home, path: '/feed' },
                { id: 'saved', label: 'Saved', icon: Bookmark, path: '/saved' },
                { id: 'liked', label: 'Liked', icon: Heart, path: '/liked' },
                { id: 'following', label: 'Following', icon: User, path: '/following' },
              ].map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-1.5 text-sm font-bold transition-all hover:-translate-y-0.5 ${
                      isActive
                        ? "text-white border-b-2 border-indigo-500 pb-1 mt-1"
                        : "text-gray-400 hover:text-indigo-400"
                    }`}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop Links */}
        <div className="flex items-center gap-6">
          {user ? (
            <>
              {isAuthor && (
                <Link 
                  to="/editor" 
                  className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${isActivePath('/editor') ? 'text-indigo-400' : 'text-gray-400 hover:text-indigo-400'}`}
                >
                  <PenSquare size={16} /> Write
                </Link>
              )}
              <Link 
                to="/dashboard" 
                className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${isActivePath('/dashboard') && !location.search ? 'text-indigo-400' : 'text-gray-400 hover:text-indigo-400'}`}
              >
                <User size={16} /> Dashboard
              </Link>

              {isAdmin && (
                <Link 
                  to="/admin" 
                  className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${isActivePath('/admin') ? 'text-indigo-400' : 'text-gray-400 hover:text-indigo-400'}`}
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

      {/* Mobile User Nav */}
      {user && (
        <div className="md:hidden overflow-x-auto flex items-center gap-6 px-4 py-3 border-t border-white/10 bg-slate-900/50 relative z-40" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {[
            { id: 'feed', label: 'Feed', icon: Home, path: '/feed' },
            { id: 'saved', label: 'Saved', icon: Bookmark, path: '/saved' },
            { id: 'liked', label: 'Liked', icon: Heart, path: '/liked' },
            { id: 'following', label: 'Following', icon: User, path: '/following' },
          ].map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                  isActive
                    ? "text-indigo-400 border-b-2 border-indigo-500 pb-1 mt-1"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                <item.icon size={14} />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
}