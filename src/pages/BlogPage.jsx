import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useBlogs } from '../hooks/useBlogs';
import { useAI } from '../hooks/useAI';
import toast from 'react-hot-toast';
import { Heart, Bookmark, Sparkles, Loader2, ArrowLeft, CheckCircle, UserPlus, UserCheck, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import BlogDetail from '../components/blog/BlogDetail';
import AISummary from '../components/blog/AISummary';

export default function BlogPage() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const { toggleLike, toggleBookmark } = useBlogs();
  const { summarize, loading: loadingAI, result: aiResult } = useAI();
  
  const [blog, setBlog] = useState(null);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [following, setFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [restricted, setRestricted] = useState(false);

  useEffect(() => {
    fetchBlog();
  }, [id, user, profile]); // Include profile to handle visibility checks once role is ready

  const fetchBlog = async () => {
    setLoading(true);
    setNotFound(false);
    setRestricted(false);
    
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*, users!blogs_author_id_fkey(name, avatar, bio)')
        .eq('id', id)
        .single();
      
      if (error || !data) {
        console.error('Blog fetch error:', error);
        setNotFound(true);
        return;
      }

      // Visibility guard: non-approved blogs are only visible to author or admin
      const isOwner = user?.id === data.author_id;
      const isAdmin = profile?.role === 'admin';
      
      // If blog is not approved, we need to be careful.
      // If profile is still loading, we might not know if user is admin yet.
      if (data.status !== 'approved' && !isOwner && !isAdmin) {
        setRestricted(true);
        return;
      }

      setBlog(data);
      
      // Get like count
      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('blog_id', id);
      setLikeCount(count || 0);

      // Increment views only for approved blogs
      if (data.status === 'approved') {
        const { error: rpcError } = await supabase.rpc('increment_views', { blog_id: id });
        if (rpcError) console.warn('Views increment failed:', rpcError);
      }

      // Check user interactions after blog is confirmed loaded
      if (user) {
        try {
          await checkInteractions(data.author_id);
        } catch (err) {
          console.warn('Interactions check failed:', err);
        }
      }
    } catch (err) {
      console.error('Unexpected error in fetchBlog:', err);
      // We don't setNotFound here to allow ErrorBoundary to catch truly unexpected fatal errors
      throw err; 
    } finally {
      setLoading(false);
    }
  };

  const checkInteractions = async (authorId) => {
    const [likeRes, bmRes] = await Promise.all([
      supabase.from('likes').select('id').eq('user_id', user.id).eq('blog_id', id).maybeSingle(),
      supabase.from('bookmarks').select('id').eq('user_id', user.id).eq('blog_id', id).maybeSingle(),
    ]);
    setLiked(!!likeRes.data);
    setBookmarked(!!bmRes.data);

    if (authorId && user.id !== authorId) {
      const { data: followData } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', authorId)
        .maybeSingle();
      setFollowing(!!followData);
    }
  };

  const handleToggleLike = async () => {
    if (!user) return toast.error('Please login to like');
    const success = await toggleLike(id, user?.id, liked);
    if (success) {
      setLiked(!liked);
      setLikeCount(prev => liked ? prev - 1 : prev + 1);
    }
  };

  const handleToggleBookmark = async () => {
    if (!user) return toast.error('Please login to bookmark');
    const success = await toggleBookmark(id, user?.id, bookmarked);
    if (success) setBookmarked(!bookmarked);
  };

  const handleToggleFollow = async () => {
    if (!user) return toast.error('Login to follow authors');
    setLoadingFollow(true);
    try {
      if (following) {
        await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', blog.author_id);
        setFollowing(false);
        toast.success(`Unfollowed ${blog.users?.name}`);
      } else {
        await supabase.from('follows').insert({ follower_id: user.id, following_id: blog.author_id });
        setFollowing(true);
        toast.success(`Now following ${blog.users?.name}`);
      }
    } catch (err) {
      toast.error('Follow action failed');
    } finally {
      setLoadingFollow(false);
    }
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto p-4 py-20 animate-pulse relative z-10">
      <div className="h-8 w-24 bg-white/10 rounded-full mb-8" />
      <div className="h-12 bg-white/10 rounded-2xl mb-6" />
      <div className="h-64 bg-white/5 border border-white/10 rounded-3xl mb-10" />
      <div className="space-y-4">
        <div className="h-4 bg-white/5 w-full rounded" />
        <div className="h-4 bg-white/5 w-5/6 rounded" />
        <div className="h-4 bg-white/5 w-4/6 rounded" />
      </div>
    </div>
  );

  if (notFound) return (
    <div className="max-w-md mx-auto text-center py-32 z-10 relative">
      <div className="text-6xl mb-6">📄</div>
      <h2 className="text-2xl font-black text-white mb-3 tracking-tight">Article Not Found</h2>
      <p className="text-gray-400 mb-8 font-medium">This article doesn't exist or has been removed.</p>
      <Link to="/" className="btn-primary">Back to Explore</Link>
    </div>
  );

  if (restricted) return (
    <div className="max-w-md mx-auto text-center py-32 z-10 relative">
      <div className="w-24 h-24 bg-yellow-500/10 border border-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-500/5">
        <Lock size={40} className="text-yellow-400" />
      </div>
      <h2 className="text-2xl font-black text-white mb-3 tracking-tight">Not Available Yet</h2>
      <p className="text-gray-400 mb-8 font-medium">This article is pending review and isn't public yet. Check back soon!</p>
      <Link to="/" className="btn-primary">Explore Other Articles</Link>
    </div>
  );

  if (!blog && !loading) {
    return (
      <div className="max-w-md mx-auto text-center py-32 z-10 relative">
        <h2 className="text-2xl font-black text-white mb-3 tracking-tight">Something Went Wrong</h2>
        <p className="text-gray-400 mb-8 font-medium">We couldn't load the blog content. Please try refreshing.</p>
        <button onClick={() => window.location.reload()} className="btn-primary">Refresh Page</button>
      </div>
    );
  }

  if (!blog) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 relative z-10">
      <div className="absolute top-0 right-0 -mr-64 -mt-32 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      
      <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-indigo-400 font-bold text-sm uppercase tracking-widest mb-10 transition-colors group">
        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> Back to Explore
      </Link>

      {/* Non-approved status banner for author/admin */}
      {blog.status !== 'approved' && (
        <div className={`mb-8 px-6 py-4 rounded-2xl border text-sm font-bold flex items-center gap-3 ${
          blog.status === 'pending'
            ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300 shadow-yellow-500/5'
            : blog.status === 'rejected'
            ? 'bg-red-500/10 border-red-500/30 text-red-300 shadow-red-500/5'
            : 'bg-white/5 border-white/10 text-gray-300 shadow-white/5'
        }`}>
          <span className="uppercase tracking-widest text-[10px] font-black opacity-60">Status:</span>
          <span className="capitalize">{blog.status}</span>
          {blog.status === 'rejected' && blog.ai_reason && (
            <span className="ml-2 font-normal opacity-80">— {blog.ai_reason}</span>
          )}
          {blog.status !== 'approved' && (
            <Link to={`/editor/${blog.id}`} className="ml-auto text-[10px] uppercase tracking-widest font-black underline underline-offset-2 hover:text-white">
              Edit Article →
            </Link>
          )}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1 min-w-0">
          <BlogDetail blog={blog} />
          
          <div className="mt-12">
            <AISummary summary={aiResult?.summary} keyPoints={aiResult?.keyPoints} />
            
            {!aiResult && (
              <button
                onClick={() => {
                  if (!user) {
                    toast.error('Please login to generate AI insights');
                    return;
                  }
                  summarize(id);
                }}
                disabled={loadingAI}
                className="btn-premium w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 border border-indigo-500/30 shadow-lg shadow-indigo-500/10"
              >
                {loadingAI ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} className="text-purple-400" />}
                Generate AI Insights
              </button>
            )}
          </div>
        </div>

        {/* Floating Actions Sidebar */}
        <aside className="lg:w-20 lg:shrink-0 relative z-20">
          <div className="glass lg:sticky lg:top-32 flex lg:flex-col items-center justify-center gap-4 p-3 border border-white/10 rounded-full shadow-2xl">
            <button
              onClick={handleToggleLike}
              title={liked ? 'Unlike' : 'Like'}
              className={`p-4 rounded-full transition-all active:scale-95 ${
                liked ? 'bg-pink-500/20 text-pink-400' : 'text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Heart size={24} fill={liked ? 'currentColor' : 'none'} />
              <span className="block text-[10px] font-black mt-1 text-center">{likeCount}</span>
            </button>
            <button
              onClick={handleToggleBookmark}
              title={bookmarked ? 'Remove Bookmark' : 'Bookmark'}
              className={`p-4 rounded-full transition-all active:scale-95 ${
                bookmarked ? 'bg-amber-500/20 text-amber-400' : 'text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Bookmark size={24} fill={bookmarked ? 'currentColor' : 'none'} />
            </button>
            <div className="h-px w-8 bg-white/10 hidden lg:block" />
            {user?.id !== blog.author_id && (
              <button
                onClick={handleToggleFollow}
                disabled={loadingFollow}
                title={following ? 'Unfollow Author' : 'Follow Author'}
                className={`p-4 rounded-full transition-all active:scale-95 disabled:opacity-30 ${
                  following ? 'bg-indigo-500/20 text-indigo-400' : 'text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {loadingFollow
                  ? <Loader2 size={24} className="animate-spin" />
                  : following
                  ? <UserCheck size={24} />
                  : <UserPlus size={24} />
                }
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}