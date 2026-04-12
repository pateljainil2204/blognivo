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
  console.log(`AI Moderate function called at ${new Date().toISOString()}`)
  if (req.method === 'OPTIONS') { 
    return new Response('ok', { headers: corsHeaders }) 
  } 

  try { 
    const authHeader = req.headers.get('Authorization') 
    console.log(`Auth header present: ${!!authHeader}`)
    
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
 
    console.log(`Calling OpenRouter API for moderation of blogId: ${blogId}`);
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
    let decision = 'APPROVE' 
    let reason = 'AI moderation completed' 

    try { 
      const rawText = aiData?.choices?.[0]?.message?.content || '' 
      console.log(`OpenRouter raw response: ${rawText.substring(0, 100)}...`);
      
      // Robust JSON extraction
      let cleaned = rawText.trim();
      if (cleaned.includes('```json')) {
        cleaned = cleaned.split('```json')[1].split('```')[0].trim();
      } else if (cleaned.includes('```')) {
        cleaned = cleaned.split('```')[1].split('```')[0].trim();
      }
      
      if (!cleaned) throw new Error("Could not extract JSON from AI response");

      const parsed = JSON.parse(cleaned) 
      decision = parsed.decision || 'APPROVE' 
      reason = parsed.reason || 'No reason provided' 
    } catch (e: any) { 
      console.warn('AI Parsing Failure:', e.message, 'Raw response:', aiData?.choices?.[0]?.message?.content);
      decision = 'APPROVE' // Default to approve if AI fails, to allow manual review
      reason = 'AI moderation lookup failed - manual review recommended' 
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
    console.error('AI Moderate Error:', err.message);
    return new Response( 
      JSON.stringify({ error: err.message || 'Moderation service unavailable' }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } } 
    ) 
  } 
})
