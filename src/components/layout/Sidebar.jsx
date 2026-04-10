import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, PenSquare, Settings, Bookmark, User, Shield, BarChart2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function Sidebar() {
  const location = useLocation();
  const { profile, isAdmin, isAuthor } = useAuth();

  const isActive = (path) => location.pathname === path;

  const links = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard, role: 'author' },
    { name: 'My Blogs', path: '/dashboard/blogs', icon: BarChart2, role: 'author' },
    { name: 'Bookmarks', path: '/dashboard/bookmarks', icon: Bookmark, role: 'author' },
    { name: 'Profile Settings', path: '/dashboard/profile', icon: User, role: 'author' },
  ];

  if (isAdmin) {
    links.push({ name: 'Admin Panel', path: '/admin', icon: Shield, role: 'admin' });
  }

  return (
    <aside className="w-64 flex-shrink-0 hidden md:block">
      <div className="sticky top-24 space-y-1">
        <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
          Management
        </p>
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive(link.path)
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <link.icon size={18} />
            {link.name}
          </Link>
        ))}
        
        <div className="pt-8 px-4">
          <div className="glass p-4 rounded-2xl border border-blue-100/50 bg-gradient-to-br from-blue-50/50 to-purple-50/50">
            <h5 className="text-xs font-bold text-blue-900 mb-1">Need help?</h5>
            <p className="text-[10px] text-blue-700 leading-relaxed mb-3">
              Check out our AI-writing guide for the best tips and tricks.
            </p>
            <Link to="/guide" className="text-[10px] font-bold text-blue-600 hover:underline">
              View Guide →
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}