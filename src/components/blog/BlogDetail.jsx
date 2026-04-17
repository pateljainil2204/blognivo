import ReactMarkdown from 'react-markdown';
import { Clock, Calendar, Hash } from 'lucide-react';

export default function BlogDetail({ blog }) {
  if (!blog) return null;

  return (
    <article className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-10">
        <div className="flex items-center gap-3 text-sm font-semibold text-gray-400 mb-6 tracking-tight uppercase">
          <span className="glass border border-indigo-500/30 text-indigo-300 px-3 py-1 rounded-full text-[10px] tracking-widest font-black shadow-lg">
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

        <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-8 tracking-tight">
          {blog.title}
        </h1>

        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 mb-10 shadow-lg">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {blog.users?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-white font-bold">{blog.users?.name}</p>
            <p className="text-sm text-gray-400 line-clamp-1">{blog.users?.bio || 'Author at BlogNivo'}</p>
          </div>
        </div>

        {blog.cover_image && (
          <div className="rounded-3xl overflow-hidden shadow-2xl mb-12 shadow-indigo-500/20 border border-white/10">
            <img 
              src={blog.cover_image} 
              alt={blog.title} 
              className="w-full h-auto max-h-[500px] object-cover"
            />
          </div>
        )}
      </header>

      <div className="prose prose-invert prose-lg max-w-none prose-headings:font-black prose-a:text-indigo-400 prose-img:rounded-3xl custom-scrollbar text-gray-300">
        <ReactMarkdown>{blog.content}</ReactMarkdown>
      </div>

      {blog.tags?.length > 0 && (
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-wrap gap-2">
            {blog.tags.map((tag) => (
              <span 
                key={tag} 
                className="flex items-center gap-1 px-4 py-2 bg-white/5 text-gray-400 border border-white/5 rounded-xl text-sm font-medium hover:bg-white/10 hover:text-indigo-400 transition cursor-default group shadow-sm"
              >
                <Hash size={14} className="group-hover:text-indigo-400 opacity-60" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}