import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useAI } from '../hooks/useAI';
import toast from 'react-hot-toast';
import BlogEditor from '../components/blog/BlogEditor';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export default function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { moderate } = useAI();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Technology');
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [coverUrl, setCoverUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!id);
  const [originalStatus, setOriginalStatus] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchCategories();
    if (id) fetchBlog();
  }, [id]);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('name');
    if (data) setCategories(data.map(c => c.name));
  };

  const fetchBlog = async () => {
    const { data, error } = await supabase.from('blogs').select('*').eq('id', id).single();
    if (data) {
      setTitle(data.title);
      setContent(data.content);
      setCategory(data.category);
      setTags(data.tags || []);
      setCoverUrl(data.cover_image);
      setOriginalStatus(data.status);
      setRejectionReason(data.ai_reason || '');
    }
    setLoading(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSaving(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(filePath, file);

    if (uploadError) {
      toast.error('Image upload failed');
      setSaving(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('blog-images')
      .getPublicUrl(filePath);

    setCoverUrl(publicUrl);
    setSaving(false);
    toast.success('Cover image uploaded!');
  };

  const handleSave = async (isDraft = true) => {
    if (!title || !content) {
      toast.error('Title and content are required');
      return;
    }

    setSaving(true);

    try {
      // Determine the new status:
      // - Saving as draft → always 'draft'
      // - Publishing: if original was 'rejected', reset to 'pending' (resubmit)
      //               if original was 'draft' or new blog → 'pending'
      //               if already 'approved', keep as 'approved' (minor edits)
      let newStatus;
      if (isDraft) {
        newStatus = 'draft';
      } else if (originalStatus === 'approved') {
        newStatus = 'approved';
      } else {
        // draft, rejected, pending → submit / resubmit
        newStatus = 'pending';
      }

      const blogData = {
        title,
        content,
        category,
        tags,
        cover_image: coverUrl,
        author_id: user.id,
        status: newStatus,
        read_time: Math.ceil(content.split(' ').length / 200),
        updated_at: new Date().toISOString(),
      };

      let result;
      if (id) {
        result = await supabase.from('blogs').update(blogData).eq('id', id).select();
      } else {
        result = await supabase.from('blogs').insert([blogData]).select('id').single();
      }

      if (result.error) {
        console.error('Database error during save:', JSON.stringify(result.error));
        toast.error(`Failed to save: ${result.error.message || 'Unknown error'}`);
        return;
      }

      if (isDraft) {
        toast.success('Draft saved!');
        // Navigate to editor URL so future saves are updates, not inserts
        const newId = result.data?.[0]?.id || result.data?.id;
        if (!id && newId) navigate(`/editor/${newId}`, { replace: true });
        setSaving(false);
      } else {
        const isResubmit = originalStatus === 'rejected';
        toast.success(isResubmit ? 'Resubmitted for review! 🎉' : 'Submitted for review! 🎉');
        
        const blogId = id || result.data?.[0]?.id || result.data?.id;
        console.log('Publish successful, blogId:', blogId);
        
        if (blogId) {
          // Fire-and-forget AI moderation — silently ignored if edge function unavailable
          // We don't await this to keep the UI fast
          (async () => {
            try { 
              console.log('Spawning AI moderation for:', blogId);
              await moderate(blogId); 
              console.log('AI moderation completed for:', blogId);
            } catch (_e) { 
              console.warn('Moderate worker failed:', _e.message || _e); 
            }
          })();
        }
        
        console.log('Navigating to dashboard...');
        // Navigation should be the LAST thing we do before finishing the save flow
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Unexpected exception during handleSave:', err);
      toast.error(`Error: ${err.message || 'An unexpected error occurred'}`);
      setSaving(false);
    }
  };

  if (loading) return <div className="max-w-4xl mx-auto p-12 text-center text-slate-400 font-black animate-pulse uppercase tracking-widest">Loading Editor...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold text-sm uppercase tracking-widest transition-colors group">
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> Dashboard
        </Link>
        {originalStatus && (
          <span className={`ml-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
            originalStatus === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
            originalStatus === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
            originalStatus === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
            'bg-slate-100 text-slate-600 border-slate-200'
          }`}>
            {originalStatus}
          </span>
        )}
      </div>

      {/* Rejection Banner */}
      {originalStatus === 'rejected' && (
        <div className="mb-8 p-5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-4">
          <div className="p-2 bg-red-100 rounded-xl text-red-600 shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-sm font-black text-red-900 mb-1">This article was rejected</p>
            {rejectionReason
              ? <p className="text-sm text-red-700 leading-relaxed">Reason: <span className="italic">{rejectionReason}</span></p>
              : <p className="text-sm text-red-600 opacity-70">No specific reason was provided. Please review and improve your content before resubmitting.</p>
            }
            <p className="text-xs text-red-500 font-bold mt-2 uppercase tracking-widest">Edit your article and click "Publish Article" to resubmit for review.</p>
          </div>
        </div>
      )}

      <BlogEditor
        title={title} setTitle={setTitle}
        content={content} setContent={setContent}
        category={category} setCategory={setCategory}
        categories={categories}
        tags={tags} setTags={setTags}
        coverUrl={coverUrl}
        handleImageUpload={handleImageUpload}
        removeImage={() => setCoverUrl('')}
        saving={saving}
        onSave={() => handleSave(true)}
        onPublish={() => handleSave(false)}
        isResubmit={originalStatus === 'rejected'}
      />
    </div>
  );
}