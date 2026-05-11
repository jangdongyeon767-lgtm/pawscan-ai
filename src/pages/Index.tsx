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
  PawPrint,
  Loader2,
  RefreshCw,
  Star,
  ExternalLink,
  Beef,
  Droplet,
  Wheat,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Allergen = { name: string; present: boolean };
type SmartSwap = {
  name: string;
  tagline: string;
  bagSize: string;
  protein: string;
  chewy: number;
  amazon: number;
  rating: number;
  reviews: string;
  badge?: string;
};
type Analysis = {
  score: number;
  brand: string;
  lifeStage: string;
  crudeProtein: string;
  crudeFat: string;
  fillers: string;
  servingSize: string;
  allergens: Allergen[];
  pros: string[];
  cons: string[];
  vetNote?: string;
  swaps: SmartSwap[];
};

const MOCK_ANALYSIS: Analysis = {
  score: 72,
  brand: "샘플 어덜트 치킨 키블",
  lifeStage: "성견 유지식",
  crudeProtein: "최소 26%",
  crudeFat: "최소 15%",
  fillers: "옥수수, 대두 검출",
  servingSize: "30 lbs당 1컵 (4 oz)",
  allergens: [
    { name: "옥수수", present: true },
    { name: "밀", present: false },
    { name: "대두", present: true },
    { name: "인공 방부제 (BHA/BHT)", present: false },
  ],
  pros: [
    "닭고기가 1순위 원재료로 표기됨",
    "성견 AAFCO 영양 기준 충족",
    "모질 관리를 위한 오메가-3 추가 함유",
  ],
  cons: [
    "옥수수 함유 — 흔한 충전재이자 알러지 유발 성분",
    "대두 단백질이 민감 반응을 유발할 수 있음",
    "조단백 함량이 프리미엄 기준(30%+) 미달",
  ],
  vetNote:
    "글루코사민 및 콘드로이친 함량이 표기되어 있지 않습니다. 영양 보충에 대해서는 수의사와 상담하세요.",
  swaps: [
    {
      name: "Open Farm RawMix Ancient Grains",
      tagline: "곡물 포함 · 조단백 32%",
      bagSize: "20 lb (약 9kg)",
      protein: "32%",
      chewy: 79.99,
      amazon: 89.49,
      rating: 4.8,
      reviews: "12,400+",
      badge: "추천 1순위",
    },
    {
      name: "The Honest Kitchen Whole Grain Chicken",
      tagline: "건조 자연식 · 휴먼 그레이드",
      bagSize: "10 lb 박스 (40 lbs 분량)",
      protein: "27%",
      chewy: 109.95,
      amazon: 119.99,
      rating: 4.7,
      reviews: "6,200+",
    },
    {
      name: "Stella & Chewy's Wild Red Kibble",
      tagline: "고단백 · 옥수수·밀·대두 무첨가",
      bagSize: "21 lb (약 9.5kg)",
      protein: "38%",
      chewy: 84.99,
      amazon: 92.5,
      rating: 4.9,
      reviews: "3,800+",
      badge: "최고 단백질",
    },
  ],
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
        "카메라 접근이 차단되었습니다. 카메라 권한을 허용한 뒤 다시 시도해 주세요."
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

  const scoreToken =
    analysis && analysis.score >= 80
      ? "success"
      : analysis && analysis.score >= 60
        ? "warning"
        : "danger";

  const scoreLabel =
    analysis && analysis.score >= 80
      ? "안전 — 수의사 권장 품질"
      : analysis && analysis.score >= 60
        ? "주의 — 개선 여지 있음"
        : "경고 — 교체 권장";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-40">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <PawPrint className="h-5 w-5 text-primary" />
            </div>
            <span className="font-semibold tracking-tight text-base sm:text-lg" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif', letterSpacing: '-0.02em' }}>
              My Cat &amp; Dog Market
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            AAFCO 기준 분석
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground mb-6 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            GPT-4o Vision 기반
          </div>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05] text-foreground">
            맞춤형 <br className="hidden sm:block" />
            <span className="text-primary">AI 펫푸드 마켓.</span>
          </h1>
          <p className="mt-5 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            우리 강아지의 사료를 분석하고, 웹 전체에서 가장 좋은 가격을
            맞춤으로 찾아드립니다.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3">
            <Button
              size="lg"
              onClick={openCamera}
              className="h-14 px-8 text-base rounded-2xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
            >
              <Camera className="mr-2 h-5 w-5" />
              사료 라벨 스캔하기
            </Button>
            <p className="text-xs text-muted-foreground">
              무료 • 회원가입 불필요 • 모바일·데스크톱 모두 지원
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
            { icon: ShieldCheck, label: "AAFCO 기준", sub: "성견·퍼피 생애 단계 대응" },
            { icon: Lock, label: "프라이버시 우선", sub: "사진은 서버에 저장되지 않음" },
            { icon: Stethoscope, label: "수의사 자문", sub: "DVM 가이드 기반 설계" },
          ].map((f) => (
            <div
              key={f.label}
              className="rounded-2xl border border-border bg-card p-5 flex items-start gap-3 shadow-sm"
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
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white gap-3">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <div className="text-sm">GPT-4o Vision으로 라벨 분석 중…</div>
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
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                  분석 대시보드
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {analysis.brand}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={reset} className="rounded-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                다시 스캔
              </Button>
            </div>

            {/* Safety Score gauge */}
            <div className="rounded-3xl border border-border bg-card p-6 md:p-8 grid md:grid-cols-[auto_1fr] gap-8 items-center shadow-sm">
              <ScoreGauge score={analysis.score} token={scoreToken} />
              <div>
                <div
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium bg-[hsl(var(--${scoreToken}))]/10 text-[hsl(var(--${scoreToken}))]`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full bg-[hsl(var(--${scoreToken}))]`} />
                  안전 점수
                </div>
                <div className="text-xl font-semibold mt-3">{scoreLabel}</div>
                <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <Stat label="생애 단계" value={analysis.lifeStage} />
                  <Stat label="조단백" value={analysis.crudeProtein} />
                  <Stat label="조지방" value={analysis.crudeFat} />
                  <Stat label="급여량" value={analysis.servingSize} />
                </div>
              </div>
            </div>

            {/* Ingredient breakdown */}
            <div className="grid sm:grid-cols-3 gap-4">
              <BreakdownCard
                icon={Beef}
                title="단백질"
                value={analysis.crudeProtein}
                sub="원재료: 닭고기 (1순위)"
                tone="success"
              />
              <BreakdownCard
                icon={Droplet}
                title="지방"
                value={analysis.crudeFat}
                sub="AAFCO 권장 범위 이내"
                tone="warning"
              />
              <BreakdownCard
                icon={Wheat}
                title="충전재"
                value={analysis.fillers}
                sub="섭취 제한 권장"
                tone="danger"
              />
            </div>

            {/* Allergens */}
            <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm">
              <h3 className="font-semibold mb-4">알러지·충전재 체크</h3>
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
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
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
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
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

            {/* Vet note (hallucination check) */}
            {analysis.vetNote && (
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 text-sm flex gap-3">
                <Stethoscope className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-foreground">수의사 메모</div>
                  <p className="text-muted-foreground mt-1">{analysis.vetNote}</p>
                </div>
              </div>
            )}

            {/* Smart Swaps */}
            <div>
              <div className="flex items-end justify-between mb-4">
                <div>
                  <div className="text-xs uppercase tracking-wider text-primary font-medium">
                    스마트 대안
                  </div>
                  <h3 className="text-2xl font-semibold mt-1">
                    우리 강아지를 위한 프리미엄 대체 사료
                  </h3>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {analysis.swaps.map((s) => (
                  <SwapCard key={s.name} swap={s} />
                ))}
              </div>

              <p className="text-[11px] text-muted-foreground mt-4">
                FTC 고지: My Cat &amp; Dog Market은 Amazon Associates 및 Chewy
                Partner 프로그램에 참여하고 있으며, 적격 구매에 대해 추가 비용
                없이 일정 수수료를 받을 수 있습니다.
              </p>
            </div>

            {/* Disclaimers */}
            <div className="rounded-2xl border border-border bg-secondary/40 p-5 text-xs text-muted-foreground space-y-2">
              <p>
                <strong className="text-foreground">의료 자문 아님.</strong>{" "}
                본 AI 도구는 정보 제공용 인사이트만을 제공합니다. 사료를 변경하기
                전 반드시 수의사와 상담하세요.
              </p>
              <p>
                <strong className="text-foreground">개인정보:</strong> 사진은
                실시간으로 처리되며, 당사 서버에 저장되지 않습니다.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container py-8 text-xs text-muted-foreground flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} My Cat &amp; Dog Market — 반려견 보호자를 위해 만들었습니다 🐾</div>
          <div className="flex gap-4">
            <span>AAFCO 기준 준수</span>
            <span>FTC 고지 준수</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl bg-secondary/60 px-3 py-2">
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
      {label}
    </div>
    <div className="text-sm font-medium mt-0.5">{value}</div>
  </div>
);

const ScoreGauge = ({
  score,
  token,
}: {
  score: number;
  token: "success" | "warning" | "danger";
}) => {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative h-36 w-36">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 140 140">
        <circle
          cx="70"
          cy="70"
          r={radius}
          stroke="hsl(var(--secondary))"
          strokeWidth="12"
          fill="none"
        />
        <circle
          cx="70"
          cy="70"
          r={radius}
          stroke={`hsl(var(--${token}))`}
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className={`text-4xl font-semibold text-[hsl(var(--${token}))]`}>
          {score}
        </div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
          / 100점
        </div>
      </div>
    </div>
  );
};

const BreakdownCard = ({
  icon: Icon,
  title,
  value,
  sub,
  tone,
}: {
  icon: typeof Beef;
  title: string;
  value: string;
  sub: string;
  tone: "success" | "warning" | "danger";
}) => (
  <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
    <div className="flex items-center justify-between">
      <div
        className={`h-10 w-10 rounded-xl flex items-center justify-center bg-[hsl(var(--${tone}))]/10`}
      >
        <Icon className={`h-5 w-5 text-[hsl(var(--${tone}))]`} />
      </div>
      <span
        className={`text-[10px] uppercase tracking-wider font-medium text-[hsl(var(--${tone}))]`}
      >
        {tone === "success" ? "안전" : tone === "warning" ? "주의" : "경고"}
      </span>
    </div>
    <div className="mt-4 text-sm text-muted-foreground">{title}</div>
    <div className="text-lg font-semibold mt-0.5">{value}</div>
    <div className="text-xs text-muted-foreground mt-1">{sub}</div>
  </div>
);

const SwapCard = ({ swap }: { swap: SmartSwap }) => (
  <div className="rounded-3xl border border-border bg-card p-5 shadow-sm flex flex-col">
    {swap.badge && (
      <div className="self-start text-[10px] uppercase tracking-wider font-semibold bg-primary/10 text-primary rounded-full px-2.5 py-1 mb-3">
        {swap.badge}
      </div>
    )}
    <h4 className="font-semibold leading-snug">{swap.name}</h4>
    <div className="text-xs text-muted-foreground mt-1">{swap.tagline}</div>
    <div className="text-xs text-muted-foreground mt-1">{swap.bagSize}</div>

    <div className="flex items-center gap-1 mt-3 text-xs">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="h-3.5 w-3.5 fill-[hsl(var(--warning))] text-[hsl(var(--warning))]"
        />
      ))}
      <span className="text-muted-foreground ml-1">
        {swap.rating} • {swap.reviews}
      </span>
    </div>

    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
      <div className="rounded-lg bg-secondary/60 px-2.5 py-2">
        <div className="text-muted-foreground">Chewy</div>
        <div className="font-semibold text-sm">${swap.chewy.toFixed(2)}</div>
      </div>
      <div className="rounded-lg bg-secondary/60 px-2.5 py-2">
        <div className="text-muted-foreground">Amazon</div>
        <div className="font-semibold text-sm">${swap.amazon.toFixed(2)}</div>
      </div>
    </div>

    <div className="mt-4 grid gap-2">
      <a
        href="#"
        className="group inline-flex items-center justify-between rounded-xl bg-[hsl(var(--brand-chewy))] text-white pl-4 pr-3 py-3 text-sm font-semibold shadow-sm hover:shadow-md hover:brightness-110 active:scale-[0.99] transition"
      >
        <span className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" />
          Chewy에서 구매 · $20 할인
        </span>
        <span className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-2 py-1 text-xs font-medium">
          ${swap.chewy.toFixed(2)}
          <ExternalLink className="h-3 w-3" />
        </span>
      </a>
      <a
        href="#"
        className="group inline-flex items-center justify-between rounded-xl bg-[hsl(var(--brand-amazon))] text-white pl-4 pr-3 py-3 text-sm font-semibold shadow-sm hover:shadow-md hover:brightness-110 active:scale-[0.99] transition"
      >
        <span className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Amazon에서 구매
        </span>
        <span className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-2 py-1 text-xs font-medium">
          ${swap.amazon.toFixed(2)}
          <ExternalLink className="h-3 w-3" />
        </span>
      </a>
    </div>
  </div>
);

export default Index;
