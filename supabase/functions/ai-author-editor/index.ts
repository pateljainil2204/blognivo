import "jsr:@supabase/functions-js/edge-runtime.d.ts" 
declare const Deno: any;
const OPENROUTER_KEY = Deno.env.get('OPENROUTER_API_KEY') 
const OPENROUTER_URL = `https://openrouter.ai/api/v1/chat/completions` 

const corsHeaders = { 
  'Access-Control-Allow-Origin': '*', 
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 
} 

const PROMPTS: Record<string, (content: string) => string> = { 
  improve: (c) => `Improve the following blog content. Keep the meaning but make it more engaging and professional. Return ONLY the improved text:\n\n${c}`, 
  grammar: (c) => `Fix all grammar, spelling, and punctuation errors in this text. Return ONLY the corrected text:\n\n${c}`, 
  rewrite: (c) => `Rewrite this paragraph in a fresh, engaging style. Return ONLY the rewritten text:\n\n${c}`, 
  title: (c) => `Generate 5 compelling blog titles for this content. Return ONLY the titles, one per line, numbered 1-5:\n\n${c}`, 
  seo: (c) => `Optimize this blog content for SEO. Add relevant keywords naturally. Return ONLY the optimized text:\n\n${c}`, 
  tags: (c) => `Suggest 5-8 relevant tags for this blog content. Return ONLY the tags as a comma-separated list:\n\n${c}`, 
  expand: (c) => `Expand this blog content with more detail, examples, and depth. Return ONLY the expanded text:\n\n${c}`, 
  category: (c) => `Based on this blog content, suggest the single most appropriate category from: Technology, Lifestyle, Education, Health, Business, Travel, Food, Science, Entertainment, General. Return ONLY the category name:\n\n${c}`, 
} 
 
Deno.serve(async (req: Request) => { 
  console.log(`AI Author Editor function called at ${new Date().toISOString()}`)
  if (req.method === 'OPTIONS') { 
    return new Response('ok', { headers: corsHeaders }) 
  } 
 
  try { 
    const authHeader = req.headers.get('Authorization') 
    console.log(`Auth header present: ${!!authHeader}`)

    const { content, action } = await req.json() 
 
    if (!content || content.trim().length < 10) { 
      return new Response( 
        JSON.stringify({ error: 'Content is too short. Please write at least a sentence.' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } } 
      ) 
    } 
 
    const promptFn = PROMPTS[action] 
    if (!promptFn) { 
      return new Response( 
        JSON.stringify({ error: `Invalid action: ${action}` }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } } 
      ) 
    } 
 
    if (!OPENROUTER_KEY) {
      console.error("OPENROUTER_API_KEY is not set in Edge Function secrets");
      return new Response( 
        JSON.stringify({ error: 'AI provider configuration missing (OPENROUTER_API_KEY)' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } } 
      ) 
    }

    const aiRes = await fetch(OPENROUTER_URL, { 
      method: 'POST', 
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_KEY}`
      }, 
      body: JSON.stringify({ 
        model: "openrouter/free", 
        messages: [{ role: "user", content: promptFn(content) }] 
      }), 
    }) 

    if (!aiRes.ok) {
      const errBody = await aiRes.json().catch(() => ({}));
      console.error(`OpenRouter error (${aiRes.status}):`, errBody);
      return new Response( 
        JSON.stringify({ error: `AI service error: ${errBody?.error?.message || 'Unknown provider error'}` }), 
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } } 
      ) 
    }
 
    const aiData = await aiRes.json() 
    let result = aiData?.choices?.[0]?.message?.content || '' 
 
    // If Gemini still returned markdown-style code blocks for plain text, clean it
    if (result.includes('```')) {
       result = result.replace(/```[a-z]*\n?/gi, '').replace(/\n?```/g, '').trim();
    }

    if (!result) { 
      return new Response( 
        JSON.stringify({ error: 'AI returned empty response. Try again.' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } } 
      ) 
    } 
 
    return new Response( 
      JSON.stringify({ result }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } } 
    ) 
  } catch (err) { 
    return new Response( 
      JSON.stringify({ error: 'AI service temporarily unavailable' }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } } 
    ) 
  } 
})
