import { useEffect, useRef, useState } from "react";
import {
  Camera,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Stethoscope,
  Lock,
  Bone,
  Loader2,
  RefreshCw,
  Star,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Allergen = { name: string; present: boolean };
type Analysis = {
  score: number;
  brand: string;
  lifeStage: string;
  crudeProtein: string;
  crudeFat: string;
  servingSize: string;
  allergens: Allergen[];
  pros: string[];
  cons: string[];
  alternative: {
    name: string;
    bagSize: string;
    chewy: number;
    amazon: number;
    rating: number;
  };
};

const MOCK_ANALYSIS: Analysis = {
  score: 72,
  brand: "샘플 어덜트 키블",
  lifeStage: "성견 유지식",
  crudeProtein: "최소 26%",
  crudeFat: "최소 15%",
  servingSize: "체중 13kg당 1컵 (약 113g)",
  allergens: [
    { name: "옥수수", present: true },
    { name: "밀", present: false },
    { name: "대두", present: true },
    { name: "인공 방부제 (BHA/BHT)", present: false },
  ],
  pros: [
    "1순위 원료가 진짜 닭고기",
    "AAFCO 영양 기준 충족",
    "오메가-3 함유 — 모질 및 눈물자국 케어",
  ],
  cons: [
    "옥수수 함유 — 흔한 충전재 및 알러지원",
    "대두 단백질이 민감증을 유발할 수 있음",
    "조단백 함량이 프리미엄 기준(30%+) 미달",
  ],
  alternative: {
    name: "오픈팜 로우믹스 에인션트 그레인 레시피",
    bagSize: "9kg (20lb) 백",
    chewy: 79.99,
    amazon: 89.49,
    rating: 4.8,
  },
};

const Index = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOpen(false);
  };

  const openCamera = async () => {
    setError(null);
    setAnalysis(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 50);
    } catch (e) {
      setError(
        "카메라 접근이 차단되었습니다. 카메라 권한을 허용하거나 라벨 사진을 업로드해 주세요."
      );
    }
  };

  const captureAndAnalyze = () => {
    setScanning(true);
    setTimeout(() => {
      stopCamera();
      setAnalysis(MOCK_ANALYSIS);
      setScanning(false);
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 1800);
  };

  const reset = () => {
    setAnalysis(null);
    setError(null);
  };

  const scoreColor =
    analysis && analysis.score >= 80
      ? "text-[hsl(var(--success))]"
      : analysis && analysis.score >= 60
        ? "text-[hsl(var(--warning))]"
        : "text-[hsl(var(--danger))]";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-40">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bone className="h-5 w-5 text-primary" />
            </div>
            <span className="font-semibold tracking-tight">PawScan AI</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            AAFCO 기준 분석
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground mb-6">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            GPT-4o Vision 기반
          </div>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
            우리 강아지 사료, <span className="text-primary">정말 안전할까요?</span>
          </h1>
          <p className="mt-5 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            AI로 단 몇 초 만에 전문 영양 분석을 받아보세요.
            AAFCO 기준과 미국 키블 브랜드에 최적화되어 있습니다.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3">
            <Button
              size="lg"
              onClick={openCamera}
              className="h-14 px-8 text-base rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow"
            >
              <Camera className="mr-2 h-5 w-5" />
              사료 라벨 스캔하기 (카메라)
            </Button>
            <p className="text-xs text-muted-foreground">
              무료 • 회원가입 불필요 • 모바일 & 데스크탑 지원
            </p>
          </div>

          {error && (
            <div className="mt-6 mx-auto max-w-md rounded-xl border border-[hsl(var(--danger))]/30 bg-[hsl(var(--danger))]/5 p-4 text-sm text-[hsl(var(--danger))] flex gap-2 items-start">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Trust strip */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {[
            { icon: ShieldCheck, label: "AAFCO 기준", sub: "성견·퍼피 단계별 분석" },
            { icon: Lock, label: "프라이버시 우선", sub: "사진은 저장되지 않습니다" },
            { icon: Stethoscope, label: "수의사 자문", sub: "DVM 가이드 기반 설계" },
          ].map((f) => (
            <div
              key={f.label}
              className="rounded-2xl border border-border bg-card p-5 flex items-start gap-3"
            >
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-medium text-sm">{f.label}</div>
                <div className="text-xs text-muted-foreground">{f.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Camera modal */}
      {cameraOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-card overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="font-medium text-sm">
                보장성분 또는 원재료 표시 부분을 비춰주세요
              </div>
              <button
                onClick={stopCamera}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                취소
              </button>
            </div>
            <div className="relative aspect-[4/3] bg-black">
              <video
                ref={videoRef}
                playsInline
                muted
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-6 border-2 border-white/70 rounded-2xl pointer-events-none" />
              {scanning && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white gap-3">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <div className="text-sm">AI가 라벨을 분석 중입니다…</div>
                </div>
              )}
            </div>
            <div className="p-4 flex justify-center">
              <Button
                size="lg"
                onClick={captureAndAnalyze}
                disabled={scanning}
                className="rounded-full h-14 w-14 p-0"
              >
                <Camera className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {analysis && (
        <section className="container pb-20">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                분석 결과
              </h2>
              <Button variant="outline" size="sm" onClick={reset} className="rounded-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                다시 스캔
              </Button>
            </div>

            {/* Score */}
            <div className="rounded-3xl border border-border bg-card p-6 md:p-8 grid md:grid-cols-[auto_1fr] gap-6 items-center">
              <div className="flex items-center justify-center">
                <div className="relative h-32 w-32 rounded-full border-8 border-secondary flex items-center justify-center">
                  <div className={`text-4xl font-semibold ${scoreColor}`}>
                    {analysis.score}
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-wider text-muted-foreground bg-card px-2">
                    안전 점수
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">{analysis.brand}</div>
                <div className="text-xl font-semibold mt-1">
                  {analysis.score >= 80
                    ? "최상 — 수의사가 추천하는 품질"
                    : analysis.score >= 60
                      ? "양호 — 개선 여지 있음"
                      : "주의 — 교체를 고려하세요"}
                </div>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  <Stat label="생애 단계" value={analysis.lifeStage} />
                  <Stat label="조단백" value={analysis.crudeProtein} />
                  <Stat label="조지방" value={analysis.crudeFat} />
                  <Stat label="급여량" value={analysis.servingSize} />
                </div>
              </div>
            </div>

            {/* Allergens */}
            <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
              <h3 className="font-semibold mb-4">알러지원 & 충전재 검사</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {analysis.allergens.map((a) => (
                  <div
                    key={a.name}
                    className={`flex items-center gap-3 rounded-xl border p-3 ${
                      a.present
                        ? "border-[hsl(var(--danger))]/30 bg-[hsl(var(--danger))]/5"
                        : "border-[hsl(var(--success))]/30 bg-[hsl(var(--success))]/5"
                    }`}
                  >
                    {a.present ? (
                      <XCircle className="h-5 w-5 text-[hsl(var(--danger))]" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" />
                    )}
                    <div className="text-sm">
                      <div className="font-medium">{a.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {a.present ? "라벨에서 검출됨" : "검출되지 않음"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pros / Cons */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-3xl border border-border bg-card p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" />
                  장점
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {analysis.pros.map((p) => (
                    <li key={p} className="flex gap-2">
                      <span className="text-[hsl(var(--success))]">•</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl border border-border bg-card p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-[hsl(var(--warning))]" />
                  주의사항
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {analysis.cons.map((p) => (
                    <li key={p} className="flex gap-2">
                      <span className="text-[hsl(var(--warning))]">•</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Better Alternative */}
            <div className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/5 to-transparent p-6 md:p-8">
              <div className="text-xs uppercase tracking-wider text-primary font-medium mb-2">
                추천 업그레이드
              </div>
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-semibold">{analysis.alternative.name}</h3>
                  <div className="text-sm text-muted-foreground mt-1">
                    {analysis.alternative.bagSize} • 곡물 포함 • 조단백 32%
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-sm">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-[hsl(var(--warning))] text-[hsl(var(--warning))]"
                      />
                    ))}
                    <span className="text-muted-foreground ml-1">
                      {analysis.alternative.rating} • 리뷰 12,400+
                    </span>
                  </div>
                </div>
              </div>

              {/* Comparison table */}
              <div className="mt-6 rounded-2xl border border-border bg-card overflow-hidden">
                <div className="grid grid-cols-3 text-xs uppercase tracking-wider text-muted-foreground bg-secondary/50 px-4 py-2">
                  <div>판매처</div>
                  <div>가격</div>
                  <div className="text-right">구매하기</div>
                </div>
                <Row
                  retailer="Chewy"
                  price={`$${analysis.alternative.chewy.toFixed(2)}`}
                  badge="최저가"
                  cta={
                    <a
                      href="#"
                      className="inline-flex items-center justify-center rounded-full bg-[hsl(var(--brand-chewy))] text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition"
                    >
                      Chewy 첫 주문 $20 할인받기
                      <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                    </a>
                  }
                />
                <div className="border-t border-border" />
                <Row
                  retailer="Amazon.com"
                  price={`$${analysis.alternative.amazon.toFixed(2)}`}
                  badge="Prime 가능"
                  cta={
                    <a
                      href="#"
                      className="inline-flex items-center justify-center rounded-full bg-[hsl(217_90%_50%)] text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition"
                    >
                      Amazon에서 가격 확인
                      <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                    </a>
                  }
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-3">
                Amazon Associate 및 Chewy Partner로서, 구매 시 일정 수수료를 받을 수 있습니다.
              </p>
            </div>

            {/* Disclaimers */}
            <div className="rounded-2xl border border-border bg-secondary/40 p-5 text-xs text-muted-foreground space-y-2">
              <p>
                <strong className="text-foreground">면책 조항:</strong> 본 분석은
                참고용이며 전문 수의사 진료를 대체하지 않습니다. 반려동물의 식단을
                변경하기 전 반드시 수의사와 상담하세요.
              </p>
              <p>
                <strong className="text-foreground">개인정보:</strong> 사진은
                실시간으로 처리되며, 프라이버시 보호를 위해 서버에 저장되지 않습니다.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container py-8 text-xs text-muted-foreground flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} PawScan AI — 반려견 보호자를 위해 만들었습니다 🐾</div>
          <div className="flex gap-4">
            <span>AAFCO 기준</span>
            <span>FTC 공시 준수</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl bg-secondary/50 px-3 py-2">
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
      {label}
    </div>
    <div className="text-sm font-medium mt-0.5">{value}</div>
  </div>
);

const Row = ({
  retailer,
  price,
  badge,
  cta,
}: {
  retailer: string;
  price: string;
  badge: string;
  cta: React.ReactNode;
}) => (
  <div className="grid grid-cols-3 items-center px-4 py-3 gap-2">
    <div>
      <div className="font-medium text-sm">{retailer}</div>
      <div className="text-[11px] text-muted-foreground">{badge}</div>
    </div>
    <div className="font-semibold">{price}</div>
    <div className="flex justify-end">{cta}</div>
  </div>
);

export default Index;
