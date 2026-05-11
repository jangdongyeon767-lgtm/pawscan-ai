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
  brand: "Sample Adult Chicken Kibble",
  lifeStage: "Adult Maintenance",
  crudeProtein: "26% min",
  crudeFat: "15% min",
  fillers: "Corn, Soy detected",
  servingSize: "1 cup (4 oz) per 30 lbs",
  allergens: [
    { name: "Corn", present: true },
    { name: "Wheat", present: false },
    { name: "Soy", present: true },
    { name: "Artificial Preservatives (BHA/BHT)", present: false },
  ],
  pros: [
    "Real chicken listed as #1 ingredient",
    "Meets AAFCO nutritional adequacy for adult dogs",
    "Includes added omega-3 for coat support",
  ],
  cons: [
    "Contains corn — common filler & allergen",
    "Soy protein may trigger sensitivities",
    "Crude protein below premium threshold (30%+)",
  ],
  vetNote:
    "Glucosamine and chondroitin levels were not listed. Consult your vet for specific nutritional gaps.",
  swaps: [
    {
      name: "Open Farm RawMix Ancient Grains",
      tagline: "Grain-inclusive · 32% Crude Protein",
      bagSize: "20 lb bag",
      protein: "32%",
      chewy: 79.99,
      amazon: 89.49,
      rating: 4.8,
      reviews: "12,400+",
      badge: "Top Pick",
    },
    {
      name: "The Honest Kitchen Whole Grain Chicken",
      tagline: "Dehydrated whole food · Human-grade",
      bagSize: "10 lb box (makes 40 lbs)",
      protein: "27%",
      chewy: 109.95,
      amazon: 119.99,
      rating: 4.7,
      reviews: "6,200+",
    },
    {
      name: "Stella & Chewy's Wild Red Kibble",
      tagline: "High-protein · No corn, wheat, or soy",
      bagSize: "21 lb bag",
      protein: "38%",
      chewy: 84.99,
      amazon: 92.5,
      rating: 4.9,
      reviews: "3,800+",
      badge: "Highest Protein",
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
        "Camera access was blocked. Please allow camera permissions and try again."
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
      ? "Safe — Vet-recommended quality"
      : analysis && analysis.score >= 60
        ? "Caution — Room to improve"
        : "Alert — Consider switching";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-40">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <PawPrint className="h-5 w-5 text-primary" />
            </div>
            <span className="font-semibold tracking-tight">PetGuard AI</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            AAFCO-aligned analysis
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground mb-6 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Powered by GPT-4o Vision
          </div>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05] text-foreground">
            Know Exactly What <br className="hidden sm:block" />
            <span className="text-primary">Your Dog Eats.</span>
          </h1>
          <p className="mt-5 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            AI-powered nutritional analysis optimized for AAFCO standards.
            Trusted by modern pet parents.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3">
            <Button
              size="lg"
              onClick={openCamera}
              className="h-14 px-8 text-base rounded-2xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
            >
              <Camera className="mr-2 h-5 w-5" />
              Scan Label
            </Button>
            <p className="text-xs text-muted-foreground">
              Free • No signup • Works on mobile & desktop
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
            { icon: ShieldCheck, label: "AAFCO Standards", sub: "Adult & puppy life stages" },
            { icon: Lock, label: "Private by default", sub: "Photos never stored" },
            { icon: Stethoscope, label: "Vet-informed", sub: "Built with DVM guidance" },
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
                Point at the Guaranteed Analysis or Ingredients panel
              </div>
              <button
                onClick={stopCamera}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
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
                  <div className="text-sm">Analyzing label with GPT-4o Vision…</div>
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
                  Analysis Dashboard
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {analysis.brand}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={reset} className="rounded-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Scan again
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
                  Safety Score
                </div>
                <div className="text-xl font-semibold mt-3">{scoreLabel}</div>
                <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <Stat label="Life Stage" value={analysis.lifeStage} />
                  <Stat label="Crude Protein" value={analysis.crudeProtein} />
                  <Stat label="Crude Fat" value={analysis.crudeFat} />
                  <Stat label="Serving" value={analysis.servingSize} />
                </div>
              </div>
            </div>

            {/* Ingredient breakdown */}
            <div className="grid sm:grid-cols-3 gap-4">
              <BreakdownCard
                icon={Beef}
                title="Protein"
                value={analysis.crudeProtein}
                sub="Source: Chicken (1st)"
                tone="success"
              />
              <BreakdownCard
                icon={Droplet}
                title="Fat"
                value={analysis.crudeFat}
                sub="Within AAFCO range"
                tone="warning"
              />
              <BreakdownCard
                icon={Wheat}
                title="Fillers"
                value={analysis.fillers}
                sub="Limit recommended"
                tone="danger"
              />
            </div>

            {/* Allergens */}
            <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm">
              <h3 className="font-semibold mb-4">Allergen & Filler Check</h3>
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
                        {a.present ? "Detected on label" : "Not detected"}
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
                  Strengths
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
                  Watch-outs
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
                  <div className="font-medium text-foreground">Vet Note</div>
                  <p className="text-muted-foreground mt-1">{analysis.vetNote}</p>
                </div>
              </div>
            )}

            {/* Smart Swaps */}
            <div>
              <div className="flex items-end justify-between mb-4">
                <div>
                  <div className="text-xs uppercase tracking-wider text-primary font-medium">
                    Smart Swaps
                  </div>
                  <h3 className="text-2xl font-semibold mt-1">
                    Premium alternatives for your dog
                  </h3>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {analysis.swaps.map((s) => (
                  <SwapCard key={s.name} swap={s} />
                ))}
              </div>

              <p className="text-[11px] text-muted-foreground mt-4">
                As an Amazon Associate and Chewy Partner, I earn from qualifying
                purchases.
              </p>
            </div>

            {/* Disclaimers */}
            <div className="rounded-2xl border border-border bg-secondary/40 p-5 text-xs text-muted-foreground space-y-2">
              <p>
                <strong className="text-foreground">NOT VETERINARY ADVICE.</strong>{" "}
                This AI tool provides informational insights only. Always consult a
                vet before changing diets.
              </p>
              <p>
                <strong className="text-foreground">Privacy:</strong> We process
                photos in real-time. Images are not stored on our servers.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container py-8 text-xs text-muted-foreground flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} PetGuard AI — Made for modern US pet parents</div>
          <div className="flex gap-4">
            <span>AAFCO-aligned</span>
            <span>FTC-compliant disclosures</span>
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
          out of 100
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
        {tone === "success" ? "Safe" : tone === "warning" ? "Caution" : "Alert"}
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
        className="inline-flex items-center justify-center rounded-full bg-[hsl(var(--brand-chewy))] text-white px-4 py-2.5 text-sm font-medium hover:opacity-90 transition"
      >
        Save $20 on Chewy
        <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
      </a>
      <a
        href="#"
        className="inline-flex items-center justify-center rounded-full bg-[hsl(var(--brand-amazon))] text-white px-4 py-2.5 text-sm font-medium hover:opacity-90 transition"
      >
        Check Price on Amazon
        <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
      </a>
    </div>
  </div>
);

export default Index;
