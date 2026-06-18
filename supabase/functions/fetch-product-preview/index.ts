const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function pickMeta(html: string, patterns: RegExp[]): string | null {
  for (const re of patterns) {
    const m = html.match(re);
    if (m && m[1]) return m[1].trim();
  }
  return null;
}

function decode(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string" || !/^https?:\/\//i.test(url)) {
      return new Response(JSON.stringify({ error: "Please provide a valid URL." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: `Unable to fetch the product page (${res.status})` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const html = await res.text();

    const title =
      pickMeta(html, [
        /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
        /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i,
        /<meta[^>]+name=["']title["'][^>]+content=["']([^"']+)["']/i,
        /<title[^>]*>([^<]+)<\/title>/i,
      ]) ?? "Product";

    const image = pickMeta(html, [
      /<meta[^>]+property=["']og:image:secure_url["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
      /id=["']landingImage["'][^>]+src=["']([^"']+)["']/i,
      /data-old-hires=["']([^"']+)["']/i,
    ]);

    let price =
      pickMeta(html, [
        /<meta[^>]+property=["']product:price:amount["'][^>]+content=["']([^"']+)["']/i,
        /<meta[^>]+property=["']og:price:amount["'][^>]+content=["']([^"']+)["']/i,
        /<meta[^>]+itemprop=["']price["'][^>]+content=["']([^"']+)["']/i,
      ]) ?? null;

    if (!price) {
      const m =
        html.match(/<span[^>]*class=["'][^"']*a-offscreen[^"']*["'][^>]*>\s*\$([\d,]+\.\d{2})/i) ??
        html.match(/"priceAmount"\s*:\s*"?\$?([\d,]+\.\d{2})"?/i);
      if (m) price = m[1];
    }

    const currency =
      pickMeta(html, [
        /<meta[^>]+property=["']product:price:currency["'][^>]+content=["']([^"']+)["']/i,
        /<meta[^>]+property=["']og:price:currency["'][^>]+content=["']([^"']+)["']/i,
      ]) ?? "USD";

    return new Response(
      JSON.stringify({
        title: decode(title).slice(0, 240),
        image: image ? decode(image) : null,
        price: price ? `${currency === "USD" ? "$" : ""}${price.replace(/[^\d.,]/g, "")}` : null,
        priceLabel: price ? null : "Check price",
        sourceUrl: url,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
