import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useAI } from '../../hooks/useAI';
import { CheckCircle, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminBlogList from '../../components/admin/AdminBlogList';
import ConfirmModal from '../../components/admin/ConfirmModal';

export default function ApprovedBlogs() {
  const { user, isAdmin } = useAuth();
  const { moderate } = useAI();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moderating, setModerating] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchBlogs();
  }, [isAdmin]);

  const fetchBlogs = async () => {
    if (!isAdmin) return;
    setLoading(true);
    const { data } = await supabase
      .from('blogs')
      .select('*, users!blogs_author_id_fkey(name, avatar)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    setBlogs(data || []);
    setLoading(false);
  };

  const handleModerate = async (blogId) => {
    setModerating(blogId);
    try {
      await moderate(blogId);
      toast.success('AI Moderation completed!');
      fetchBlogs();
    } catch (err) {
      toast.error('AI Moderation failed');
    } finally {
      setModerating(null);
    }
  };

  const updateBlogStatus = async (blogId, status) => {
    const { error } = await supabase.from('blogs').update({ status }).eq('id', blogId);
    if (error) {
      toast.error('Update failed');
    } else {
      toast.success(`Article ${status}`);
      fetchBlogs();
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from('blogs').delete().eq('id', deleteId);
    if (error) {
      toast.error('Deletion failed');
    } else {
      toast.success('Blog deleted successfully');
      fetchBlogs();
    }
    setDeleteId(null);
  };

  if (!isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 relative z-10 w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
             <CheckCircle className="text-emerald-400" size={32} /> Approved Blogs
          </h1>
          <p className="text-gray-400 font-medium mt-2">Manage published content and platform ecosystem.</p>
        </div>
      </div>

      <AdminBlogList
        blogs={blogs}
        loading={loading}
        moderating={moderating}
        onModerate={handleModerate}
        onApprove={(id) => updateBlogStatus(id, 'approved')}
        onReject={(id) => updateBlogStatus(id, 'rejected')}
        onDelete={(id) => setDeleteId(id)}
        onPreview={(blog) => window.open(`/blog/${blog.id}`, '_blank')}
      />

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Blog?"
        message="Are you sure you want to remove this published blog? This will remove it from all user feeds."
      />
    </div>
  );
}
