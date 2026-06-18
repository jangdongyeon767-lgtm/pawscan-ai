import { convertToModelMessages, streamText, type UIMessage } from "npm:ai";
import { createOpenAICompatible } from "npm:@ai-sdk/openai-compatible";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AMAZON_TAG = "mycatdogmarket-20";
const SYSTEM_PROMPT = `You are PurrPick's expert cat-nutrition recommendation assistant.
- Always respond in English.
- When a user shares their cat's info (breed/age/weight/health concerns), recommend 1-3 suitable cat foods.
- For each recommendation, briefly include the brand, product name, and 2-3 reasons it's a good fit.
- If you don't know a price, do NOT guess — say "Check the current price on Amazon."
- Only suggest options that meet AAFCO nutrition guidelines.
- Format your response cleanly in Markdown.
- Every recommended product MUST include an Amazon search link as a Markdown link.
  Format: [View on Amazon](https://www.amazon.com/s?k=<product+name+with+plus>&tag=${AMAZON_TAG})
  Example: [View on Amazon](https://www.amazon.com/s?k=Hill%27s+Science+Diet+Adult+Perfect+Weight&tag=${AMAZON_TAG})
- Never omit or change the link's tag parameter. Always include tag=${AMAZON_TAG}.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages }: { messages: UIMessage[] } = await req.json();
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI key is not configured." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const gateway = createOpenAICompatible({
      name: "lovable",
      baseURL: "https://ai.gateway.lovable.dev/v1",
      headers: {
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "vercel-ai-sdk",
      },
    });

    const result = streamText({
      model: gateway("google/gemini-3-flash-preview"),
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse({ headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
