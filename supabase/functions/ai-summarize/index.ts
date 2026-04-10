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
    const authHeader = req.headers.get('Authorization') 
    if (!authHeader) { 
      return new Response( 
        JSON.stringify({ error: 'Login required to use AI summary' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } } 
      ) 
    } 
 
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
 
    const { blogId } = await req.json() 
 
    // Check cache first 
    const { data: cached } = await supabase 
      .from('ai_summaries') 
      .select('*') 
      .eq('blog_id', blogId) 
      .single() 
 
    if (cached) { 
      return new Response( 
        JSON.stringify({ summary: cached.summary, keyPoints: cached.key_points, cached: true }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } } 
      ) 
    } 
 
    // Fetch blog 
    const { data: blog } = await supabase 
      .from('blogs') 
      .select('content, title') 
      .eq('id', blogId) 
      .eq('status', 'approved') 
      .single() 
 
    if (!blog) { 
      return new Response( 
        JSON.stringify({ error: 'Blog not found or not published' }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } } 
      ) 
    } 
 
    const prompt = `Summarize this blog post. Provide:\n1. A concise summary (2-3 sentences)\n2. 3-5 key points as bullet items\n\nTitle: ${blog.title}\nContent: ${blog.content}\n\nRespond in EXACTLY this JSON format (no markdown):\n{"summary": "your summary here", "keyPoints": ["point 1", "point 2", "point 3"]}` 
 
    const geminiRes = await fetch(GEMINI_URL, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ 
        contents: [{ parts: [{ text: prompt }] }], 
        generationConfig: { temperature: 0.3, maxOutputTokens: 512 }, 
      }), 
    }) 
 
    const geminiData = await geminiRes.json() 
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '' 
 
    let summary = 'Summary unavailable' 
    let keyPoints: string[] = [] 
 
    try { 
      const cleaned = rawText.replace(/```json\n?|\n?```/g, '').trim() 
      const parsed = JSON.parse(cleaned) 
      summary = parsed.summary || summary 
      keyPoints = parsed.keyPoints || [] 
    } catch { 
      summary = rawText.slice(0, 500) 
    } 
 
    // Cache it 
    await supabase.from('ai_summaries').upsert({ 
      blog_id: blogId, 
      summary, 
      key_points: keyPoints, 
    }) 
 
    return new Response( 
      JSON.stringify({ summary, keyPoints, cached: false }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } } 
    ) 
  } catch (err: any) { 
    return new Response( 
      JSON.stringify({ error: 'Summary service unavailable', message: err.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } } 
    ) 
  } 
})
