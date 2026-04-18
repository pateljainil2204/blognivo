import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  LogOut, PenSquare, Shield, User, BookOpen, Home, 
  Bookmark, Heart, Clock, CheckCircle, XCircle, Users, 
  Bell, LayoutDashboard, ChevronDown 
} from 'lucide-react';

export default function Navbar() {
  const { user, profile, signOut, role, isAuthor, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setShowDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setShowDropdown(false);
  }, [location]);

  const isActivePath = (path) => {
    if (path.includes('?')) {
      return location.pathname + location.search === path;
    }
    return location.pathname === path;
  };

  const roleLinks = {
    user: [
      { id: 'feed', label: 'My Feed', icon: Home, path: '/feed' },
      { id: 'saved', label: 'Saved', icon: Bookmark, path: '/saved' },
      { id: 'liked', label: 'Liked', icon: Heart, path: '/liked' },
      { id: 'following', label: 'Following', icon: User, path: '/following' },
    ],
    author: [
      { id: 'write', label: 'Write Blog', icon: PenSquare, path: '/editor' },
      { id: 'my-blogs', label: 'My Blogs', icon: BookOpen, path: '/author-profile' },
      { id: 'drafts', label: 'Drafts', icon: Clock, path: '/dashboard?tab=blogs&status=draft' },
    ],
    admin: [
      { id: 'pending', label: 'Pending', icon: Clock, path: '/admin?status=pending' },
      { id: 'approved', label: 'Approved', icon: CheckCircle, path: '/admin?status=approved' },
      { id: 'rejected', label: 'Rejected', icon: XCircle, path: '/admin?status=rejected' },
      { id: 'users', label: 'Manage Users', icon: Users, path: '/admin?tab=users' },
    ]
  };

  const activeRoleLinks = user ? (roleLinks[role] || roleLinks['user']) : [];
  const profilePath = role === 'admin' ? '/admin-profile' : role === 'author' ? '/author-profile' : '/profile';

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/70 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* LEFT SECTION: Logo & Primary Nav */}
        <div className="flex items-center gap-10">
          <Link 
            to="/" 
            title="Home"
            className="text-2xl font-black text-white flex items-center gap-2 group shrink-0"
          >
            <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-lg transition-transform group-hover:rotate-12 shadow-lg shadow-indigo-500/20">
              <BookOpen size={20} />
            </div>
            <span className="tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 hidden sm:block">BlogNivo</span>
          </Link>

          {/* Role-Based Desktop Links */}
          {user && (
            <div className="hidden lg:flex items-center gap-6">
              {activeRoleLinks.map((item) => {
                const isActive = isActivePath(item.path);
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    title={item.label}
                    className={`flex items-center gap-2 text-sm font-bold transition-all hover:text-indigo-400 relative py-1 ${
                      isActive ? "text-indigo-400" : "text-gray-400"
                    }`}
                  >
                    <item.icon size={16} />
                    <span className="hidden lg:block">{item.label}</span>
                    {isActive && (
                      <div className="absolute -bottom-4 left-0 right-0 h-0.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT SECTION: Notifications & Profile Block */}
        <div className="flex items-center gap-4 md:gap-6">
          {user ? (
            <>
              {/* Notification Bell */}
              <button 
                title="Notifications"
                className="p-2 text-gray-400 hover:text-white transition-colors relative"
              >
                <Bell size={20} />
                <div className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-slate-950" />
              </button>
              
              {/* User Profile Block */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className={`flex items-center gap-3 p-1.5 rounded-2xl transition-all hover:bg-white/5 border border-transparent ${showDropdown ? 'bg-white/5 border-white/10' : ''}`}
                  title="Account Menu"
                >
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white ring-2 ring-white/10 overflow-hidden shadow-lg shrink-0">
                    {profile?.avatar ? (
                      <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-black text-sm uppercase">
                        {profile?.name?.[0] || user?.email?.[0]}
                      </span>
                    )}
                  </div>

                  {/* Name & Role (Desktop) */}
                  <div className="text-left hidden md:block pr-1">
                    <p className="text-xs font-bold text-white leading-tight truncate max-w-[100px]">
                      {profile?.name || user?.email?.split('@')[0]}
                    </p>
                    <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest leading-none mt-0.5">
                      {role || 'User'}
                    </p>
                  </div>

                  <ChevronDown size={14} className={`text-gray-500 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''} hidden sm:block`} />
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-3 w-56 glass card-premium border border-white/10 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-3 py-2 border-b border-white/5 mb-2">
                      <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">Account</p>
                    </div>

                    <Link 
                      to={profilePath}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/5 transition-all group"
                    >
                      <User size={18} className="text-gray-500 group-hover:text-indigo-400" />
                      View Profile
                    </Link>

                    <Link 
                      to="/dashboard"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/5 transition-all group"
                    >
                      <LayoutDashboard size={18} className="text-gray-500 group-hover:text-indigo-400" />
                      Dashboard
                    </Link>

                    <div className="h-px bg-white/5 my-2" />

                    <button 
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-all group"
                    >
                      <LogOut size={18} className="text-red-400/50 group-hover:text-red-400" />
                      Sign Out
                    </button>
                  </div>
                )}
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

      {/* MOBILE NAV: Icons-only scrollable primary links */}
      {user && (
        <div className="lg:hidden overflow-x-auto flex items-center justify-around gap-6 px-6 py-3 border-t border-white/10 bg-slate-950/40 relative z-40 no-scrollbar">
          {activeRoleLinks.map((item) => {
            const isActive = isActivePath(item.path);
            return (
              <Link
                key={item.id}
                to={item.path}
                title={item.label}
                className={`flex items-center justify-center p-2 rounded-xl transition-all relative ${
                  isActive ? "text-indigo-400 bg-indigo-500/10" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <item.icon size={20} />
                {isActive && (
                  <div className="absolute -bottom-3 left-2 right-2 h-0.5 bg-indigo-500 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}