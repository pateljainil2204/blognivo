import { Link } from 'react-router-dom';
import { BookOpen, Clock, Heart, Eye } from 'lucide-react';

export default function BlogCard({ blog }) {
  return (
    <Link
      to={`/blog/${blog.id}`}
      className="group card-premium overflow-hidden flex flex-col h-full bg-white/5 hover:bg-white/10"
    >
      <div className="relative overflow-hidden aspect-[16/10]">
        {blog.cover_image ? (
          <img 
            src={blog.cover_image} 
            alt={blog.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100" 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-900/40 to-slate-800 flex items-center justify-center">
            <BookOpen size={48} className="text-indigo-400/50" />
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className="glass border border-white/10 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
            {blog.category}
          </span>
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] text-white font-bold shadow-sm">
            {blog.users?.name?.[0]?.toUpperCase()}
          </div>
          <span className="text-xs font-semibold text-gray-300">{blog.users?.name}</span>
          <span className="text-gray-600">•</span>
          <span className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium">
            <Clock size={12} /> {blog.read_time} min read
          </span>
        </div>
        
        <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-2 mb-3 leading-tight">
          {blog.title}
        </h3>
        
        <p className="text-sm text-gray-400 line-clamp-3 mb-6 leading-relaxed flex-1">
          {blog.content.slice(0, 150)}...
        </p>

        <div className="flex items-center justify-between pt-5 border-t border-white/5 mt-auto">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            {new Date(blog.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400">
              <Eye size={14} className="text-indigo-400/70" /> {blog.views || 0}
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 group-hover:text-pink-400 transition-colors">
              <Heart size={14} className="group-hover:fill-pink-400 group-hover:text-pink-400 transition-all" /> {blog.likes_count || 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}