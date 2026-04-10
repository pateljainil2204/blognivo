import { Eye, Shield, CheckCircle, XCircle, Sparkles, AlertTriangle, Loader2 } from 'lucide-react';

export default function AdminBlogList({
  blogs,
  loading,
  moderating,
  onModerate,
  onApprove,
  onReject,
  onPreview
}) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-slate-50 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
          <Eye size={32} />
        </div>
        <p className="text-slate-500 font-medium">No blogs found in this category.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {blogs.map((blog) => (
        <div key={blog.id} className="card-premium p-6 group">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                  {blog.category}
                </span>
                <span className="text-xs text-slate-400 font-medium tracking-tight">
                  {new Date(blog.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">{blog.title}</h3>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-black text-blue-600">
                  {blog.users?.name?.[0]?.toUpperCase()}
                </div>
                <p className="text-sm font-bold text-slate-700">{blog.users?.name}</p>
              </div>

              {/* AI Insight Card */}
              {blog.ai_decision ? (
                <div className={`p-4 rounded-2xl border ${
                  blog.ai_decision === 'APPROVE' 
                    ? 'bg-green-50/50 border-green-100 text-green-900' 
                    : 'bg-red-50/50 border-red-100 text-red-900'
                }`}>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-1.5 opacity-60">
                    {blog.ai_decision === 'APPROVE' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                    AI Recommendation
                  </div>
                  <p className="text-sm font-medium leading-relaxed italic">"{blog.ai_reason}"</p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 text-slate-500 text-xs font-bold flex items-center gap-2 uppercase tracking-wider">
                  <Sparkles size={14} className="text-purple-400" /> Assessment Pending
                </div>
              )}
            </div>

            <div className="flex flex-row md:flex-col gap-2 justify-end md:w-32">
              <button
                onClick={() => onModerate(blog.id)}
                disabled={moderating === blog.id}
                className="btn-premium flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest bg-white border border-slate-200 hover:border-purple-400 hover:text-purple-600 transition-all disabled:opacity-40 shadow-sm"
              >
                {moderating === blog.id ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                Moderate
              </button>

              <button
                onClick={() => onPreview(blog)}
                className="btn-premium flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
              >
                <Eye size={12} /> Preview
              </button>

              <div className="grid grid-cols-2 md:grid-cols-1 gap-2 md:mt-4">
                <button
                  onClick={() => onApprove(blog.id)}
                  className="btn-premium flex items-center justify-center gap-2 py-2.5 text-[10px] font-black uppercase tracking-widest bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-500/20"
                >
                  <CheckCircle size={12} /> Approve
                </button>
                <button
                  onClick={() => onReject(blog.id)}
                  className="btn-premium flex items-center justify-center gap-2 py-2.5 text-[10px] font-black uppercase tracking-widest bg-white text-red-600 border border-red-100 hover:bg-red-50"
                >
                  <XCircle size={12} /> Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}