import { supabase } from './supabase' 
 
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL 
 
async function callEdgeFunction(functionName, body) { 
  const { data: { session }, error: sessionError } = await supabase.auth.getSession() 
  
  if (sessionError) {
    console.error('Session error:', sessionError)
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, { 
      method: 'POST', 
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${session?.access_token || ''}`, 
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY, 
      }, 
      body: JSON.stringify(body), 
    }) 
 
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || `AI Request failed (${res.status})`) 
    }

    return await res.json() 
  } catch (err) {
    console.error(`Error calling ${functionName}:`, err)
    throw err
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