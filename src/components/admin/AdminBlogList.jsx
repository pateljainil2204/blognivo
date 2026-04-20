import { Eye, Shield, CheckCircle, XCircle, Sparkles, AlertTriangle, Loader2 } from 'lucide-react';

export default function AdminBlogList({
  blogs,
  loading,
  moderating,
  onModerate,
  onApprove,
  onReject,
  onDelete,
  onPreview
}) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-white/5 border border-white/10 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl">
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500 shadow-sm border border-white/5">
          <Eye size={32} />
        </div>
        <p className="text-gray-400 font-medium">No blogs found in this category.</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      default: return 'bg-white/10 text-gray-400 border-white/10';
    }
  };

  return (
    <div className="grid gap-4">
      {blogs.map((blog) => (
        <div key={blog.id} className="card-premium p-6 group glass bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-all shadow-lg hover:shadow-indigo-500/10">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
                  {blog.category}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(blog.status)}`}>
                  {blog.status}
                </span>
                <span className="text-xs text-gray-400 font-bold tracking-tight">
                  {new Date(blog.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <h3 className="text-xl font-black text-white mb-3 group-hover:text-indigo-400 transition-colors tracking-tight">{blog.title}</h3>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-black text-white shadow-sm border border-white/20">
                  {blog.users?.name?.[0]?.toUpperCase()}
                </div>
                <p className="text-sm font-bold text-gray-300">{blog.users?.name}</p>
              </div>

              {/* AI Insight Card */}
              {blog.ai_decision ? (
                <div className={`p-4 rounded-2xl border backdrop-blur-md ${
                  blog.ai_decision === 'APPROVE' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
                    : 'bg-red-500/10 border-red-500/20 text-red-300'
                }`}>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-1.5 opacity-80">
                    {blog.ai_decision === 'APPROVE' ? <CheckCircle size={14} className="text-emerald-400" /> : <AlertTriangle size={14} className="text-red-400" />}
                    AI Recommendation
                  </div>
                  <p className="text-sm font-medium leading-relaxed italic text-gray-300">"{blog.ai_reason}"</p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl border border-dashed border-white/10 bg-white/5 text-gray-400 text-xs font-bold flex items-center gap-2 uppercase tracking-wider backdrop-blur-sm">
                  <Sparkles size={14} className="text-indigo-400 animate-pulse" /> Assessment Pending
                </div>
              )}
            </div>

            <div className="flex flex-row md:flex-col gap-2 justify-end md:w-36">
              <button
                onClick={() => onModerate(blog.id)}
                disabled={moderating === blog.id}
                className="btn-premium flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-indigo-400 hover:text-indigo-300 transition-all disabled:opacity-40 shadow-sm"
              >
                {moderating === blog.id ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} className="text-purple-400" />}
                Moderate
              </button>

              <button
                onClick={() => onPreview(blog)}
                className="btn-premium flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-all shadow-sm"
              >
                <Eye size={12} /> Preview
              </button>

              <div className="grid grid-cols-2 md:grid-cols-1 gap-2 md:mt-4">
                {blog.status !== 'approved' && (
                  <button
                    onClick={() => onApprove(blog.id)}
                    className="btn-premium flex items-center justify-center gap-2 py-2.5 text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 transition-all"
                  >
                    <CheckCircle size={12} /> Approve
                  </button>
                )}
                {blog.status !== 'rejected' && (
                  <button
                    onClick={() => onReject(blog.id)}
                    className="btn-premium flex items-center justify-center gap-2 py-2.5 text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-all"
                  >
                    <XCircle size={12} /> Reject
                  </button>
                )}
                <button
                  onClick={() => onDelete(blog.id)}
                  className="btn-premium flex items-center justify-center gap-2 py-2.5 text-[10px] font-black uppercase tracking-widest bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/30 transition-all md:mt-2"
                >
                  <AlertTriangle size={12} /> Delete
                </button>
              </div>
            </div>

          </div>
        </div>
      ))}
    </div>
  );
}