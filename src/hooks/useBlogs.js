import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

/**
 * useBlogs Hook
 * Handles fetching list of blogs, searching, liking, and bookmarking logic.
 */
export const useBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBlogs = useCallback(async (options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { category, author_id, status = 'approved' } = options;
      
      let query = supabase
        .from('blogs')
        .select('*, users!blogs_author_id_fkey(id, name, avatar, role)')
        .order('created_at', { ascending: false });

      if (status) query = query.eq('status', status);
      if (category) query = query.eq('category', category);
      if (author_id) query = query.eq('author_id', author_id);

      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      setBlogs(data || []);
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setError(err.message);
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleLike = async (blogId, userId, isLiked) => {
    if (!userId) {
      toast.error('Please login to like');
      return false;
    }

    try {
      if (isLiked) {
        await supabase.from('likes').delete().eq('user_id', userId).eq('blog_id', blogId);
      } else {
        await supabase.from('likes').insert({ user_id: userId, blog_id: blogId });
        
        // Notify Author
        const { data: blog } = await supabase.from('blogs').select('author_id, title').eq('id', blogId).single();
        if (blog && blog.author_id !== userId) {
          await supabase.from('notifications').insert({
            user_id: blog.author_id,
            message: `Someone liked your blog: "${blog.title}"`,
            type: 'like',
            metadata: { blog_id: blogId }
          });
        }
      }
      return true;
    } catch (err) {
      toast.error('Action failed');
      return false;
    }
  };

  const toggleBookmark = async (blogId, userId, isBookmarked) => {
    if (!userId) {
      toast.error('Please login to bookmark');
      return false;
    }

    try {
      if (isBookmarked) {
        await supabase.from('bookmarks').delete().eq('user_id', userId).eq('blog_id', blogId);
        toast.success('Removed from bookmarks');
      } else {
        await supabase.from('bookmarks').insert({ user_id: userId, blog_id: blogId });
        toast.success('Saved to bookmarks');

        // Notify Author
        const { data: blog } = await supabase.from('blogs').select('author_id, title').eq('id', blogId).single();
        if (blog && blog.author_id !== userId) {
          await supabase.from('notifications').insert({
            user_id: blog.author_id,
            message: `Someone bookmarked your blog: "${blog.title}"`,
            type: 'info',
            metadata: { blog_id: blogId }
          });
        }
      }
      return true;
    } catch (err) {
      toast.error('Action failed');
      return false;
    }
  };

  return {
    blogs,
    loading,
    error,
    fetchBlogs,
    toggleLike,
    toggleBookmark,
    setBlogs
  };
};