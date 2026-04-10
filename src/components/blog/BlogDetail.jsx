import ReactMarkdown from 'react-markdown';
import { Clock, Calendar, Hash } from 'lucide-react';

export default function BlogDetail({ blog }) {
  if (!blog) return null;

  return (
    <article className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-10">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-400 mb-6 tracking-tight uppercase">
          <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] tracking-widest font-black">
            {blog.category}
          </span>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Clock size={14} />
            {blog.read_time} min read
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Calendar size={14} />
            {new Date(blog.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-8 tracking-tight">
          {blog.title}
        </h1>

        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-10">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {blog.users?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-slate-900 font-bold">{blog.users?.name}</p>
            <p className="text-sm text-slate-500 line-clamp-1">{blog.users?.bio || 'Author at BlogNivo'}</p>
          </div>
        </div>

        {blog.cover_image && (
          <div className="rounded-3xl overflow-hidden shadow-2xl mb-12 shadow-blue-500/10">
            <img 
              src={blog.cover_image} 
              alt={blog.title} 
              className="w-full h-auto max-h-[500px] object-cover"
            />
          </div>
        )}
      </header>

      <div className="prose prose-slate prose-lg max-w-none prose-headings:font-black prose-a:text-blue-600 prose-img:rounded-3xl">
        <ReactMarkdown>{blog.content}</ReactMarkdown>
      </div>

      {blog.tags?.length > 0 && (
        <div className="mt-12 pt-8 border-t border-slate-100">
          <div className="flex flex-wrap gap-2">
            {blog.tags.map((tag) => (
              <span 
                key={tag} 
                className="flex items-center gap-1 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-100 transition cursor-default group"
              >
                <Hash size={14} className="text-slate-300 group-hover:text-blue-400" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}