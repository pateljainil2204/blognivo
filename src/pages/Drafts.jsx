import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Clock, PenSquare, Trash2, AlertCircle, CheckCircle, Search, Filter, Rocket, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Drafts() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDrafts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*, users!blogs_author_id_fkey(name, avatar)')
        .eq('author_id', user.id)
        .in('status', ['draft', 'pending', 'rejected'])
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setBlogs(data || []);
    } catch (err) {
      console.error('Error fetching drafts:', err);
      toast.error('Failed to load your drafts');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this draft?')) return;
    try {
      const { error } = await supabase.from('blogs').delete().eq('id', id);
      if (error) throw error;
      toast.success('Draft deleted');
      setBlogs(blogs.filter(b => b.id !== id));
    } catch (err) {
      toast.error('Failed to delete draft');
    }
  };

  const filteredBlogs = blogs.filter(blog => 
    blog.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusInfo = {
    draft: { icon: FileText, color: 'text-gray-400', bg: 'bg-white/5', border: 'border-white/10', label: 'Draft' },
    pending: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', label: 'Under Review' },
    rejected: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Revision Needed' }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 relative z-10 w-full mb-20">
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 text-center md:text-left">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3 justify-center md:justify-start">
            <Clock size={36} className="text-amber-400" /> Drafts & Review
          </h1>
          <p className="text-gray-400 font-medium mt-2">Finish your stories and monitor their progress through the approval pipeline.</p>
        </div>
        <Link to="/editor" className="btn-primary group flex items-center gap-2 shadow-xl shadow-amber-500/10 w-full md:w-auto justify-center">
          <Rocket size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          Continue Writing
        </Link>
      </div>

      <div className="space-y-8">
        {/* Header with search */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-white/5 pb-6">
          <div className="relative w-full sm:w-80">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text"
              placeholder="Search drafts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-1 focus:ring-amber-500/30 transition-all text-sm"
            />
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-xs font-bold text-gray-400 bg-white/5 px-4 py-2 rounded-xl">
                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                {blogs.filter(b => b.status === 'pending').length} Pending
             </div>
             <div className="flex items-center gap-2 text-xs font-bold text-gray-400 bg-white/5 px-4 py-2 rounded-xl">
                <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                {blogs.filter(b => b.status === 'rejected').length} Revisions
             </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl border border-white/10" />)}
          </div>
        ) : filteredBlogs.length > 0 ? (
          <div className="grid gap-4">
            {filteredBlogs.map(blog => {
              const info = statusInfo[blog.status] || statusInfo.draft;
              return (
                <div key={blog.id} className="glass group p-6 rounded-2xl border border-white/5 hover:border-white/20 transition-all flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className={`p-4 rounded-2xl ${info.bg} ${info.color} shrink-0`}>
                    <info.icon size={24} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors truncate">{blog.title || 'Untitled Story'}</h3>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${info.border} ${info.color}`}>
                        {info.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest flex items-center gap-4">
                      <span>Last updated {new Date(blog.updated_at).toLocaleDateString()}</span>
                      {blog.status === 'rejected' && <span className="text-red-400 italic">Revision required: {blog.ai_reason || 'See guidelines'}</span>}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Link 
                      to={`/editor/${blog.id}`} 
                      className="p-3 bg-white/5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                      title="Edit Story"
                    >
                      <PenSquare size={20} />
                    </Link>
                    <button 
                      onClick={() => handleDelete(blog.id)}
                      className="p-3 bg-white/5 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all border border-white/5"
                      title="Delete Draft"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 glass rounded-[2.5rem] border border-dashed border-white/10">
            <p className="text-gray-500 font-bold italic tracking-tight">
              {searchQuery ? "No matches found in your drafts." : "Your workspace is empty."}
            </p>
            {!searchQuery && (
              <Link to="/editor" className="mt-4 inline-block text-amber-400 font-black uppercase tracking-widest hover:text-amber-300">New Draft →</Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
