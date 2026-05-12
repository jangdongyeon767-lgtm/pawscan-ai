import { convertToModelMessages, streamText, type UIMessage } from "npm:ai";
import { createOpenAICompatible } from "npm:@ai-sdk/openai-compatible";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AMAZON_TAG = "mycatdogmarket-20";
const SYSTEM_PROMPT = `당신은 'My Cat & Dog Market'의 반려동물 영양 전문 추천 어시스턴트입니다.
- 항상 한국어로 답변합니다.
- 사용자가 반려동물 정보(종/나이/체중/건강 관심사)를 알려주면 그에 맞는 사료/간식을 1~3개 추천합니다.
- 추천 시 브랜드, 제품명(영문 가능), 추천 이유 2-3가지를 간결하게 말합니다.
- 가격은 모르면 추측하지 말고 "Amazon에서 확인" 이라고 안내합니다.
- AAFCO 영양 가이드라인을 기준으로 안전한 옵션만 제시합니다.
- 답변은 마크다운으로 깔끔하게 정리합니다.
- 추천하는 모든 제품에는 반드시 Amazon 검색 링크를 마크다운 링크 형태로 포함합니다.
  형식: [Amazon에서 보기](https://www.amazon.com/s?k=<제품명을+plus로+연결>&tag=${AMAZON_TAG})
  예: [Amazon에서 보기](https://www.amazon.com/s?k=Hill%27s+Science+Diet+Adult+Perfect+Weight&tag=${AMAZON_TAG})
- 링크의 tag 파라미터는 절대 생략하거나 변경하지 마세요. 항상 tag=${AMAZON_TAG} 를 포함해야 합니다.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages }: { messages: UIMessage[] } = await req.json();
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI 키가 설정되어 있지 않습니다." }), {
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
