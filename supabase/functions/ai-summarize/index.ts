import "jsr:@supabase/functions-js/edge-runtime.d.ts" 
// @ts-ignore: TS doesn't natively resolve JSR imports in this local setup
import { createClient } from "jsr:@supabase/supabase-js@2"  
declare const Deno: any;

const OPENROUTER_KEY = Deno.env.get('OPENROUTER_API_KEY') 
const OPENROUTER_URL = `https://openrouter.ai/api/v1/chat/completions` 
 
const corsHeaders = { 
  'Access-Control-Allow-Origin': '*', 
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 
} 
 
Deno.serve(async (req: Request) => { 
  console.log(`AI Summarize function called at ${new Date().toISOString()}`)
  if (req.method === 'OPTIONS') { 
    return new Response('ok', { headers: corsHeaders }) 
  } 
 
  try { 
    const authHeader = req.headers.get('Authorization') 
    console.log(`Auth header present: ${!!authHeader}`)
    
    if (!authHeader) { 
      console.error('Missing Authorization header')
      return new Response( 
        JSON.stringify({ error: 'Login required to use AI summary' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } } 
      ) 
    } 
 
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
        console.error("Missing Supabase environment variables");
        throw new Error("Missing Supabase environment variables");
    }

    if (!OPENROUTER_KEY) {
        console.error("OPENROUTER_API_KEY is not set in Edge Function secrets");
        throw new Error("AI provider configuration missing (OPENROUTER_API_KEY)");
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
 
    console.log(`Calling OpenRouter API for blogId: ${blogId}`);
    const aiRes = await fetch(OPENROUTER_URL, { 
      method: 'POST', 
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_KEY}`
      }, 
      body: JSON.stringify({ 
        model: "openrouter/free", 
        messages: [{ role: "user", content: prompt }] 
      }), 
    }) 

    if (!aiRes.ok) {
      const errorData = await aiRes.json().catch(() => ({}));
      console.error('OpenRouter API Error:', errorData);
      throw new Error(`OpenRouter API returned ${aiRes.status}: ${errorData?.error?.message || 'Unknown error'}`);
    }
 
    const aiData = await aiRes.json() 
    let summary = 'Summary unavailable' 
    let keyPoints: string[] = [] 

    try { 
      const rawText = aiData?.choices?.[0]?.message?.content || '' 
      console.log(`OpenRouter raw response snippet: ${rawText.substring(0, 100)}...`);
      
      // Robust JSON extraction
      let cleaned = rawText.trim();
      if (cleaned.includes('```json')) {
        cleaned = cleaned.split('```json')[1].split('```')[0].trim();
      } else if (cleaned.includes('```')) {
        cleaned = cleaned.split('```')[1].split('```')[0].trim();
      }
      
      if (!cleaned) throw new Error("Could not extract JSON from AI response");
      
      const parsed = JSON.parse(cleaned) 
      summary = parsed.summary || summary 
      keyPoints = parsed.keyPoints || [] 
      console.log(`Successfully parsed AI response`);
    } catch (e: any) { 
      console.warn('AI Parsing Failure:', e.message);
      const rawText = aiData?.choices?.[0]?.message?.content || 'Summary unavailable'
      summary = rawText.slice(0, 800) // Fallback to raw text if parsing fails
    } 
 
    // Cache it 
    console.log(`Upserting summary into ai_summaries table...`);
    const { error: upsertError } = await supabase.from('ai_summaries').upsert({ 
      blog_id: blogId, 
      summary, 
      key_points: keyPoints, 
    }) 

    if (upsertError) {
      console.error(`Database upsert error:`, upsertError);
      throw new Error(`Database error: ${upsertError.message}`);
    }
    
    console.log(`AI Summarize completed successfully`);
 
    return new Response( 
      JSON.stringify({ summary, keyPoints, cached: false }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } } 
    ) 
  } catch (err: any) { 
    console.error('AI Summarize Error:', err.message);
    return new Response( 
      JSON.stringify({ error: err.message || 'Summary service unavailable' }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } } 
    ) 
  } 
})
