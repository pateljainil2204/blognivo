import { Link } from 'react-router-dom';
import { BookOpen, Clock, Heart, Eye } from 'lucide-react';

export default function BlogCard({ blog }) {
  return (
    <Link
      to={`/blog/${blog.id}`}
      className="group card-premium overflow-hidden flex flex-col h-full"
    >
      <div className="relative overflow-hidden aspect-[16/10]">
        {blog.cover_image ? (
          <img 
            src={blog.cover_image} 
            alt={blog.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
            <BookOpen size={48} className="text-blue-100" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 backdrop-blur text-blue-600 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
            {blog.category}
          </span>
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-[10px] text-white font-bold">
            {blog.users?.name?.[0]?.toUpperCase()}
          </div>
          <span className="text-xs font-semibold text-slate-600">{blog.users?.name}</span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
            <Clock size={10} /> {blog.read_time} min read
          </span>
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-3">
          {blog.title}
        </h3>
        
        <p className="text-sm text-slate-500 line-clamp-3 mb-6 leading-relaxed flex-1">
          {blog.content.slice(0, 150)}...
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {new Date(blog.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
              <Eye size={12} /> {blog.views || 0}
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
              <Heart size={12} /> {blog.likes_count || 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}