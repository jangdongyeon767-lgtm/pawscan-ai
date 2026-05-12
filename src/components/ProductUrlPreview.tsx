import { useState } from "react";
import { Link as LinkIcon, Sparkles, ArrowRight, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Preview = {
  title: string;
  image: string | null;
  price: string | null;
  priceLabel: string | null;
  sourceUrl: string;
};

// 폴백: 스크래핑이 차단되면 여기에 수동으로 imageUrl을 채워 넣을 수 있어요.
const FALLBACK_IMAGES: { match: RegExp; imageUrl: string; title?: string }[] = [
  // { match: /B0XXXXXXX/i, imageUrl: "https://...", title: "수동 등록 상품" },
];

export function ProductUrlPreview() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Preview | null>(null);
  const [imgError, setImgError] = useState(false);

  const fetchPreview = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setData(null);
    setImgError(false);
    try {
      const { data: res, error } = await supabase.functions.invoke("fetch-product-preview", {
        body: { url: url.trim() },
      });
      if (error) throw error;

      let preview = res as Preview;

      // 스크래핑 실패 시 폴백 이미지 적용
      if (!preview.image) {
        const fb = FALLBACK_IMAGES.find((f) => f.match.test(url));
        if (fb) {
          preview = {
            ...preview,
            image: fb.imageUrl,
            title: preview.title || fb.title || "상품",
          };
        }
      }

      setData(preview);
    } catch (err: any) {
      toast({
        title: "미리보기를 불러오지 못했습니다",
        description: err.message || "잠시 후 다시 시도해 주세요.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container py-12 md:py-16">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium mb-3">
            <LinkIcon className="h-3.5 w-3.5" />
            URL 상품 미리보기
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Amazon 링크만 붙여넣으면 상품 정보가 자동으로 떠요.
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            이미지 · 상품명 · 가격을 즉시 미리보기 합니다.
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 md:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="amazonUrl" className="sr-only">
                Amazon 상품 URL
              </Label>
              <Input
                id="amazonUrl"
                placeholder="https://www.amazon.com/dp/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchPreview()}
                className="rounded-xl h-11"
              />
            </div>
            <Button
              onClick={fetchPreview}
              disabled={loading || !url.trim()}
              className="rounded-xl h-11 px-5"
            >
              {loading ? "불러오는 중..." : "미리보기"}
              {!loading && <ArrowRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>

          {/* Skeleton */}
          {loading && (
            <div className="mt-6 rounded-2xl border border-border overflow-hidden animate-pulse">
              <div className="aspect-[4/3] bg-secondary" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-secondary rounded w-3/4" />
                <div className="h-4 bg-secondary rounded w-1/2" />
                <div className="h-8 bg-secondary rounded w-24" />
              </div>
            </div>
          )}

          {/* Result card — Royal Blue 테마 */}
          {data && !loading && (
            <div className="mt-6 rounded-2xl border border-primary/20 overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 shadow-sm">
              <div className="relative aspect-[4/3] bg-secondary/60 flex items-center justify-center">
                {/* AI-Matched 배지 */}
                <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-primary/85 backdrop-blur text-primary-foreground px-3 py-1 text-[11px] font-medium shadow">
                  <Sparkles className="h-3 w-3" />
                  AI-Matched for Your Pet
                </div>

                {data.image && !imgError ? (
                  <img
                    src={data.image}
                    alt={data.title}
                    className="absolute inset-0 w-full h-full object-contain p-6"
                    loading="lazy"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground text-sm">
                    <ImageOff className="h-8 w-8" />
                    이미지를 불러올 수 없어요
                  </div>
                )}
              </div>

              <div className="p-5 md:p-6 bg-card">
                <h3 className="font-semibold leading-snug line-clamp-2">{data.title}</h3>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <div>
                    <div className="text-xs text-muted-foreground">현재가</div>
                    <div className="text-2xl font-semibold text-primary mt-0.5">
                      {data.price ? data.price : data.priceLabel ?? "가격 확인"}
                    </div>
                  </div>
                  <a href={data.sourceUrl} target="_blank" rel="noopener noreferrer sponsored">
                    <Button className="rounded-xl">
                      Amazon에서 보기
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
