import "jsr:@supabase/functions-js/edge-runtime.d.ts" 
declare const Deno: any;
const GEMINI_KEY = Deno.env.get('GEMINI_API_KEY') 
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}` 

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
  if (req.method === 'OPTIONS') { 
    return new Response('ok', { headers: corsHeaders }) 
  } 
 
  try { 
    const { content, action } = await req.json() 
 
    if (!content || content.split('\n').length < 2) { 
      return new Response( 
        JSON.stringify({ error: 'Content must be at least 2 lines' }), 
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
 
    const geminiRes = await fetch(GEMINI_URL, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ 
        contents: [{ parts: [{ text: promptFn(content) }] }], 
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }, 
      }), 
    }) 
 
    const geminiData = await geminiRes.json() 
    const result = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '' 
 
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
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } } 
    ) 
  } 
})
