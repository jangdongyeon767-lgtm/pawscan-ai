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
  brand: "Sample Adult Kibble",
  lifeStage: "Adult Maintenance",
  crudeProtein: "26% min",
  crudeFat: "15% min",
  servingSize: "1 cup (4 oz) per 30 lbs",
  allergens: [
    { name: "Corn", present: true },
    { name: "Wheat", present: false },
    { name: "Soy", present: true },
    { name: "Artificial Preservatives (BHA/BHT)", present: false },
  ],
  pros: [
    "Real chicken listed as #1 ingredient",
    "Meets AAFCO nutritional adequacy",
    "Added omega-3 for coat & tear stain support",
  ],
  cons: [
    "Contains corn — common filler & allergen",
    "Soy protein may cause sensitivities",
    "Crude protein below premium threshold (30%+)",
  ],
  alternative: {
    name: "Open Farm RawMix Ancient Grains Recipe",
    bagSize: "20 lb bag",
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
        "Camera access was blocked. Please allow camera permissions or upload a photo of the label."
      );
    }
  };

  const captureAndAnalyze = () => {
    setScanning(true);
    // Simulated GPT-4o vision pipeline
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
            AAFCO-aligned analysis
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground mb-6">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Powered by GPT-4o Vision
          </div>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
            Is Your Dog's Food <span className="text-primary">Truly Safe?</span>
          </h1>
          <p className="mt-5 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Get a professional nutritional analysis in seconds using AI.
            Optimized for AAFCO standards and US kibble brands.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3">
            <Button
              size="lg"
              onClick={openCamera}
              className="h-14 px-8 text-base rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow"
            >
              <Camera className="mr-2 h-5 w-5" />
              Scan Food Label (Camera)
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
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white gap-3">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <div className="text-sm">Analyzing label with AI…</div>
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
                Analysis Results
              </h2>
              <Button variant="outline" size="sm" onClick={reset} className="rounded-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Scan again
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
                    Safety Score
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">{analysis.brand}</div>
                <div className="text-xl font-semibold mt-1">
                  {analysis.score >= 80
                    ? "Excellent — vet-recommended quality"
                    : analysis.score >= 60
                      ? "Decent — but room to improve"
                      : "Concerning — consider switching"}
                </div>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  <Stat label="Life Stage" value={analysis.lifeStage} />
                  <Stat label="Crude Protein" value={analysis.crudeProtein} />
                  <Stat label="Crude Fat" value={analysis.crudeFat} />
                  <Stat label="Serving" value={analysis.servingSize} />
                </div>
              </div>
            </div>

            {/* Allergens */}
            <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
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
              <div className="rounded-3xl border border-border bg-card p-6">
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
              <div className="rounded-3xl border border-border bg-card p-6">
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

            {/* Better Alternative */}
            <div className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/5 to-transparent p-6 md:p-8">
              <div className="text-xs uppercase tracking-wider text-primary font-medium mb-2">
                Recommended Upgrade
              </div>
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-semibold">{analysis.alternative.name}</h3>
                  <div className="text-sm text-muted-foreground mt-1">
                    {analysis.alternative.bagSize} • Grain-inclusive • 32% Crude Protein
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-sm">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-[hsl(var(--warning))] text-[hsl(var(--warning))]"
                      />
                    ))}
                    <span className="text-muted-foreground ml-1">
                      {analysis.alternative.rating} • 12,400+ reviews
                    </span>
                  </div>
                </div>
              </div>

              {/* Comparison table */}
              <div className="mt-6 rounded-2xl border border-border bg-card overflow-hidden">
                <div className="grid grid-cols-3 text-xs uppercase tracking-wider text-muted-foreground bg-secondary/50 px-4 py-2">
                  <div>Retailer</div>
                  <div>Price</div>
                  <div className="text-right">Action</div>
                </div>
                <Row
                  retailer="Chewy"
                  price={`$${analysis.alternative.chewy.toFixed(2)}`}
                  badge="Best price"
                  cta={
                    <a
                      href="#"
                      className="inline-flex items-center justify-center rounded-full bg-[hsl(var(--brand-chewy))] text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition"
                    >
                      Save $20 on First Chewy Order
                      <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                    </a>
                  }
                />
                <div className="border-t border-border" />
                <Row
                  retailer="Amazon.com"
                  price={`$${analysis.alternative.amazon.toFixed(2)}`}
                  badge="Prime eligible"
                  cta={
                    <a
                      href="#"
                      className="inline-flex items-center justify-center rounded-full bg-[hsl(217_90%_50%)] text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition"
                    >
                      Check Price on Amazon
                      <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                    </a>
                  }
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-3">
                As an Amazon Associate and Chewy Partner, I earn from qualifying
                purchases.
              </p>
            </div>

            {/* Disclaimers */}
            <div className="rounded-2xl border border-border bg-secondary/40 p-5 text-xs text-muted-foreground space-y-2">
              <p>
                <strong className="text-foreground">DISCLAIMER:</strong> This
                analysis is for informational purposes only and does not replace
                professional veterinary advice. Always consult your vet before
                changing your pet's diet.
              </p>
              <p>
                <strong className="text-foreground">Privacy:</strong> We process
                photos in real-time. Images are not stored on our servers to
                ensure your privacy.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container py-8 text-xs text-muted-foreground flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} PawScan AI — Made for US dog parents 🇺🇸</div>
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
