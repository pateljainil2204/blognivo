import { useState } from 'react';
import { ai } from '../lib/ai';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

/**
 * useAI Hook
 * Provides an easy interface for triggering AI actions like summarization, 
 * moderation, and text generation helpers.
 */
export const useAI = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const summarize = async (blogId) => {
    setLoading(true);
    try {
      // Immediate check for session to give better feedback
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please login to use AI features');
        return;
      }

      const data = await ai.summarize(blogId);
      setResult(data);
      return data;
    } catch (err) {
      toast.error(err.message || 'AI Summarization failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const moderate = async (blogId) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Please login to use moderation features');
      }
      const data = await ai.moderate(blogId);
      return data;
    } catch (err) {
      // For moderation, we check if it was explicitly called vs worker called.
      // Callers handle surfacing the toast.
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAuthorSuggestions = async (content, action) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please login to use AI editor tools');
        return;
      }
      const data = await ai.authorAction(content, action);
      return data;
    } catch (err) {
      toast.error(err.message || `AI ${action} failed`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    summarize,
    moderate,
    getAuthorSuggestions,
    loading,
    result,
    setResult
  };
};