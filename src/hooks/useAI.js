import { useState } from 'react';
import { ai } from '../lib/ai';
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
      const data = await ai.summarize(blogId);
      setResult(data);
      return data;
    } catch (err) {
      toast.error('AI Summarization failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const moderate = async (blogId) => {
    setLoading(true);
    try {
      const data = await ai.moderate(blogId);
      return data;
    } catch (err) {
      // Silently rethrow — callers decide whether to surface this error
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAuthorSuggestions = async (content, action) => {
    setLoading(true);
    try {
      const data = await ai.authorAction(content, action);
      return data;
    } catch (err) {
      toast.error(`AI ${action} failed`);
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