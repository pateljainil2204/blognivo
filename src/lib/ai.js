import { supabase } from './supabase' 
 
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL 
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
 
async function callEdgeFunction(functionName, body) { 
  try {
    console.log(`[ai.js] Initializing call to ${functionName}...`);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error(`[ai.js] No active session found for ${functionName}.`);
      throw new Error('Please login to use AI features');
    }
    console.log(`[ai.js] Authenticated session found. Calling function...`);

    // supabase.functions.invoke handles apikey and Authorization headers automatically
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: body
    });

    if (error) {
      console.error(`[ai.js] Error from ${functionName}:`, error);
      
      const errorMessage = data?.error || error.message || `AI Request failed (Status: ${error.status})`;
      
      if (error.status === 401 || errorMessage.toLowerCase().includes('jwt') || errorMessage.toLowerCase().includes('unauthorized')) {
        throw new Error('Please login to use AI features');
      }
      
      throw new Error(errorMessage);
    }

    if (data && data.error) {
      console.error(`[ai.js] Handled API Error from ${functionName}:`, data.error);
      throw new Error(data.error);
    }

    console.log(`[ai.js] Success from ${functionName}`);
    return data;
  } catch (err) {
    console.error(`[ai.js] Exception in callEdgeFunction:`, err);
    throw err;
  }
} 
 
export const ai = { 
  // Author actions 
  authorAction: (content, action) => 
    callEdgeFunction('ai-author-editor', { content, action }), 
 
  // Moderation 
  moderate: (blogId) => 
    callEdgeFunction('ai-moderate', { blogId }), 
 
  // User summary 
  summarize: (blogId) => 
    callEdgeFunction('ai-summarize', { blogId }), 
}