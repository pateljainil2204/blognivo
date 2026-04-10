import "jsr:@supabase/functions-js/edge-runtime.d.ts" 
// @ts-ignore: TS doesn't natively resolve JSR imports in this local setup
import { createClient } from "jsr:@supabase/supabase-js@2"  
declare const Deno: any;

const GEMINI_KEY = Deno.env.get('GEMINI_API_KEY') 
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}` 
 
const corsHeaders = { 
  'Access-Control-Allow-Origin': '*', 
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 
} 
 
Deno.serve(async (req: Request) => { 
  if (req.method === 'OPTIONS') { 
    return new Response('ok', { headers: corsHeaders }) 
  } 
 
  try { 
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
 
    const { blogId } = await req.json() 
 
    // Fetch the blog 
    const { data: blog, error: blogErr } = await supabase 
      .from('blogs') 
      .select('*') 
      .eq('id', blogId) 
      .single() 
 
    if (blogErr || !blog) { 
      return new Response( 
        JSON.stringify({ error: 'Blog not found' }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } } 
      ) 
    } 
 
    const prompt = `You are a content moderator. Analyze this blog post and decide if it should be APPROVED or REJECTED.\n\nCheck for: - Harmful content - Hate speech - Spam or low-quality content - Misinformation - Inappropriate language\n\nTitle: ${blog.title}\nContent: ${blog.content}\n\nRespond in EXACTLY this JSON format (no markdown):\n{"decision": "APPROVE" or "REJECT", "reason": "brief explanation"}` 
 
    const geminiRes = await fetch(GEMINI_URL, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ 
        contents: [{ parts: [{ text: prompt }] }], 
        generationConfig: { temperature: 0.2, maxOutputTokens: 256 }, 
      }), 
    }) 
 
    const geminiData = await geminiRes.json() 
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '' 
 
    let decision = 'APPROVE' 
    let reason = 'AI moderation completed' 
 
    try { 
      const cleaned = rawText.replace(/```json\n?|\n?```/g, '').trim() 
      const parsed = JSON.parse(cleaned) 
      decision = parsed.decision || 'APPROVE' 
      reason = parsed.reason || 'No reason provided' 
    } catch { 
      // If parsing fails, default to APPROVE for manual review 
      reason = 'AI could not determine - flagged for manual review' 
    } 
 
    // Update the blog with AI decision 
    await supabase 
      .from('blogs') 
      .update({ 
        ai_decision: decision, 
        ai_reason: reason, 
        ai_checked_at: new Date().toISOString(), 
      }) 
      .eq('id', blogId) 
 
    return new Response( 
      JSON.stringify({ decision, reason }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } } 
    ) 
  } catch (err: any) { 
    return new Response( 
      JSON.stringify({ error: 'Moderation service unavailable', message: err.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } } 
    ) 
  } 
})
