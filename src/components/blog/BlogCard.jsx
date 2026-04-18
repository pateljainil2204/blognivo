import { Link } from 'react-router-dom';
import { BookOpen, Clock, Heart, Eye, Bookmark } from 'lucide-react';

export default function BlogCard({ blog }) {
  if (!blog) return null;

  const authorRole = blog.users?.role;
  const profilePath = authorRole === 'admin' 
    ? `/admin-profile/${blog.author_id}` 
    : authorRole === 'author' 
      ? `/author/${blog.author_id}` 
      : `/profile/${blog.author_id}`;

  return (
    <div className="group card-premium overflow-hidden flex flex-col h-full bg-white/5 hover:bg-white/[0.08] transition-all border border-white/5 relative">
      {/* Blog Detail Link Overlay (Image + Content) */}
      <Link to={`/blog/${blog.id}`} className="absolute inset-0 z-0"></Link>

      <div className="relative overflow-hidden aspect-[16/10] bg-slate-900 pointer-events-none relative z-10">
        {blog.cover_image ? (
          <>
            <img 
              src={blog.cover_image} 
              alt={blog.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-900/40 to-slate-800 flex items-center justify-center relative">
            <BookOpen size={48} className="text-indigo-400/50" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/10 to-transparent"></div>
          </div>
        )}
        <div className="absolute top-4 left-4 flex gap-2 z-20 pointer-events-auto">
          {blog.category && (
            <span className="glass bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
              {blog.category}
            </span>
          )}
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-1 relative z-10">
        <div className="flex items-center gap-2 mb-4 relative z-20">
          <Link 
            to={profilePath}
            className="flex items-center gap-2 group/author hover:text-indigo-400 transition-all pointer-events-auto"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] text-white font-bold shadow-sm overflow-hidden shrink-0">
              {blog.users?.avatar ? (
                <img src={blog.users.avatar} alt="" className="w-full h-full object-cover group-hover/author:scale-110 transition-transform" />
              ) : (
                blog.users?.name?.[0]?.toUpperCase()
              )}
            </div>
            <span className="text-xs font-semibold text-gray-300 group-hover/author:text-indigo-400">{blog.users?.name}</span>
          </Link>
          <span className="text-gray-600">•</span>
          <span className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium whitespace-nowrap">
            <Clock size={12} /> {blog.read_time} min
          </span>
        </div>
        
        <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-2 mb-3 leading-tight pointer-events-none">
          {blog.title}
        </h3>
        
        <p className="text-sm text-gray-400 line-clamp-3 mb-6 leading-relaxed flex-1 pointer-events-none">
          {blog.content.slice(0, 150)}...
        </p>
        
        <div className="flex items-center justify-between pt-5 border-t border-white/5 mt-auto pointer-events-none">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            {new Date(blog.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[11px] font-bold text-gray-400" title="Views">
              <Eye size={14} className="text-indigo-400/70" /> {blog.views || 0}
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-gray-400 group-hover:text-amber-400 transition-colors" title="Bookmarks">
              <Bookmark size={14} className="group-hover:fill-amber-400 group-hover:text-amber-400 transition-all" /> {blog.bookmarks_count || 0}
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-gray-400 group-hover:text-pink-400 transition-colors" title="Likes">
              <Heart size={14} className="group-hover:fill-pink-400 group-hover:text-pink-400 transition-all" /> {blog.likes_count || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}