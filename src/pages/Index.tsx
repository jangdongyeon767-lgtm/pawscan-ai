import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Lock,
  PawPrint,
  Star,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Cat,
  Dog,
  Award,
  LogOut,
  Bell,
  TrendingDown,
  AlertTriangle,
  Mail,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const AMAZON_TAG = "YOUR_AMAZON_ID";
const amazonUrl = (q: string) =>
  `https://www.amazon.com/s?k=${encodeURIComponent(q)}&tag=${AMAZON_TAG}`;
const chewyUrl = (q: string) =>
  `https://www.chewy.com/s?rh=c%3A288&query=${encodeURIComponent(q)}`;

type PetType = "dog" | "cat";
type Activity = "low" | "medium" | "high";

const HEALTH_OPTIONS = [
  "Allergies",
  "Weight management",
  "Digestion",
  "Skin & coat",
  "Joints",
  "Dental",
  "Heart",
  "Kidney",
] as const;
type Health = (typeof HEALTH_OPTIONS)[number];

type PetProfile = {
  name: string;
  petType: PetType;
  breed: string;
  ageYears: string;
  weightLbs: string;
  activity: Activity;
  health: Health[];
};

type Recommendation = {
  name: string;
  brand: string;
  image: string;
  reasons: string[];
  bagLbs: number;
  amazonPrice: number;
  chewyPrice: number;
  query: string;
  cupsPerLb: number; // ~4 cups per lb for dry kibble
};

const ACTIVITY_LABEL: Record<Activity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};
const ACTIVITY_FACTOR: Record<Activity, number> = {
  low: 1.2,
  medium: 1.6,
  high: 2.0,
};

function pickRecommendation(p: PetProfile): Recommendation {
  const speciesEn = p.petType === "dog" ? "Dog" : "Cat";
  const wantsWeight = p.health.includes("Weight management");
  const wantsSkin = p.health.includes("Skin & coat") || p.health.includes("Allergies");
  const wantsDigestion = p.health.includes("Digestion");
  const wantsJoints = p.health.includes("Joints");

  if (wantsWeight) {
    return {
      brand: "Hill's Science Diet",
      name: `Perfect Weight Adult ${speciesEn} Food`,
      image: "https://m.media-amazon.com/images/I/81Wm6jzC9XL._AC_SL1500_.jpg",
      reasons: [
        `Formulated for ${ACTIVITY_LABEL[p.activity].toLowerCase()}-activity adult ${speciesEn.toLowerCase()}s`,
        "Clinically proven weight loss within 10 weeks",
        "Meets AAFCO nutrient profiles",
      ],
      bagLbs: 25,
      amazonPrice: 64.99,
      chewyPrice: 71.49,
      query: `Hill's Science Diet Perfect Weight ${speciesEn}`,
      cupsPerLb: 4,
    };
  }
  if (wantsSkin) {
    return {
      brand: "Wellness CORE",
      name: `Skin & Coat Salmon Recipe ${speciesEn} Food`,
      image: "https://m.media-amazon.com/images/I/81Cb7B7p+IL._AC_SL1500_.jpg",
      reasons: [
        "Rich in omega-3 from real salmon",
        "Grain-free for sensitive stomachs",
        "Meets AAFCO standards for adult maintenance",
      ],
      bagLbs: 22,
      amazonPrice: 69.99,
      chewyPrice: 67.99,
      query: `Wellness CORE Skin Coat Salmon ${speciesEn}`,
      cupsPerLb: 4,
    };
  }
  if (wantsDigestion) {
    return {
      brand: "Purina Pro Plan",
      name: `Sensitive Skin & Stomach ${speciesEn} Food`,
      image: "https://m.media-amazon.com/images/I/81bF1A1Pv6L._AC_SL1500_.jpg",
      reasons: [
        "Easily digestible oatmeal & salmon",
        "Live probiotics for digestive health",
        "Meets AAFCO standards",
      ],
      bagLbs: 30,
      amazonPrice: 74.99,
      chewyPrice: 78.99,
      query: `Purina Pro Plan Sensitive Skin Stomach ${speciesEn}`,
      cupsPerLb: 4,
    };
  }
  if (wantsJoints) {
    return {
      brand: "Royal Canin",
      name: `Mobility Support ${speciesEn} Formula`,
      image: "https://m.media-amazon.com/images/I/81Z6CqQ4o0L._AC_SL1500_.jpg",
      reasons: [
        "Glucosamine & EPA for joint support",
        `Tailored for ${ACTIVITY_LABEL[p.activity].toLowerCase()}-activity ${speciesEn.toLowerCase()}s`,
        "Veterinary-formulated, AAFCO compliant",
      ],
      bagLbs: 24,
      amazonPrice: 79.99,
      chewyPrice: 84.99,
      query: `Royal Canin Mobility ${speciesEn}`,
      cupsPerLb: 4,
    };
  }
  return {
    brand: "Blue Buffalo",
    name: `Life Protection Adult ${speciesEn} Food`,
    image: "https://m.media-amazon.com/images/I/81e+JzKZA8L._AC_SL1500_.jpg",
    reasons: [
      `Balanced nutrition for ${ACTIVITY_LABEL[p.activity].toLowerCase()}-activity adult ${speciesEn.toLowerCase()}s`,
      "Real meat first, no by-product meals",
      "Meets AAFCO nutrient profiles",
    ],
    bagLbs: 30,
    amazonPrice: 59.99,
    chewyPrice: 62.99,
    query: `Blue Buffalo Life Protection Adult ${speciesEn}`,
    cupsPerLb: 4,
  };
}

function feedingPlan(p: PetProfile, r: Recommendation) {
  const lbs = parseFloat(p.weightLbs) || 0;
  const kg = lbs * 0.4536;
  const rer = 70 * Math.pow(Math.max(kg, 0.5), 0.75);
  const der = rer * ACTIVITY_FACTOR[p.activity];
  const kcalPerCup = p.petType === "dog" ? 360 : 320;
  const cupsPerDay = Math.max(0.25, der / kcalPerCup);
  const cupsPerMonth = cupsPerDay * 30;
  const lbsPerMonth = cupsPerMonth / r.cupsPerLb;
  const bagsPerMonth = lbsPerMonth / r.bagLbs;
  const monthlyCost = bagsPerMonth * Math.min(r.amazonPrice, r.chewyPrice);
  return {
    cupsPerDay: Math.round(cupsPerDay * 10) / 10,
    monthlyCost: Math.round(monthlyCost),
    der: Math.round(der),
  };
}

const Index = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0 closed, 1-6 wizard, 7 email gate
  const [profile, setProfile] = useState<PetProfile>({
    name: "",
    petType: "dog",
    breed: "",
    ageYears: "",
    weightLbs: "",
    activity: "medium",
    health: [],
  });
  const [email, setEmail] = useState("");
  const [results, setResults] = useState<{
    profile: PetProfile;
    rec: Recommendation;
    plan: ReturnType<typeof feedingPlan>;
  } | null>(null);
  const [unlocked, setUnlocked] = useState(false);

  const start = () => {
    setResults(null);
    setUnlocked(false);
    setStep(1);
  };
  const close = () => setStep(0);
  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => Math.max(s - 1, 1));
  const toggleHealth = (h: Health) =>
    setProfile((p) => ({
      ...p,
      health: p.health.includes(h) ? p.health.filter((x) => x !== h) : [...p.health, h],
    }));

  const finish = async () => {
    const rec = pickRecommendation(profile);
    const plan = feedingPlan(profile, rec);
    setResults({ profile, rec, plan });
    setStep(0);
    setEmail(user?.email ?? "");
    setTimeout(
      () => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }),
      80,
    );
    if (user) {
      await supabase.from("pet_profiles").insert({
        user_id: user.id,
        name: profile.name || null,
        pet_type: profile.petType,
        age_stage: profile.ageYears || "adult",
        breed: profile.breed || null,
        weight: profile.weightLbs || null,
        goal: profile.health[0] || "general",
        health_concerns: profile.health,
        characteristics: `Activity: ${ACTIVITY_LABEL[profile.activity]}`,
      });
    }
  };

  const submitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast({ title: "Please enter a valid email", variant: "destructive" });
      return;
    }
    toast({
      title: "You're in!",
      description: "We'll send refill reminders & price drop alerts.",
    });
    setUnlocked(true);
  };

  const handleSubscribe = () => {
    toast({
      title: "Pet Nutrition Plan — $9.99/month",
      description: "Subscription checkout coming soon.",
    });
  };

  const petName = profile.name.trim() || (profile.petType === "dog" ? "your dog" : "your cat");
  const petLabel = profile.petType === "dog" ? "Dog" : "Cat";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-40">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <PawPrint className="h-5 w-5 text-primary" />
            </div>
            <span
              className="font-semibold tracking-tight text-base sm:text-lg"
              style={{
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif',
                letterSpacing: "-0.02em",
              }}
            >
              My Cat &amp; Dog Market
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
              <Award className="h-4 w-4 text-primary" />
              AAFCO-aligned
            </div>
            {user ? (
              <>
                <span className="hidden sm:inline text-xs text-muted-foreground max-w-[160px] truncate">
                  {user.email}
                </span>
                <Button variant="ghost" size="sm" onClick={signOut} className="rounded-full">
                  <LogOut className="h-4 w-4 mr-1" />
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/auth")}
                  className="rounded-full"
                >
                  Sign in
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate("/auth")}
                  className="rounded-full"
                >
                  Get started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground mb-6 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Personalized Pet Nutrition &amp; Feeding Management
          </div>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05] text-foreground">
            Find the Best Food for Your Dog
            <br className="hidden sm:block" />
            <span className="text-primary"> in 60 Seconds.</span>
          </h1>
          <p className="mt-5 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            A personalized nutrition plan based on your pet's breed, weight, and health
            needs.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3">
            <Button
              size="lg"
              onClick={start}
              className="h-14 px-8 text-base rounded-2xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
            >
              Start Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-xs text-muted-foreground">
              Free · 60 seconds · No credit card required
            </p>
          </div>
        </div>

        {/* Trust strip */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {[
            {
              icon: Award,
              label: "AAFCO-aligned",
              sub: "Recommendations meet AAFCO nutrient profiles",
            },
            {
              icon: ShieldCheck,
              label: "Curated brands",
              sub: "Only top-rated brands from Amazon & Chewy",
            },
            {
              icon: Lock,
              label: "Privacy first",
              sub: "Your pet profile is yours — encrypted and never sold",
            },
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

      {/* Wizard modal */}
      {step > 0 && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-card overflow-hidden shadow-2xl border border-border">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Step {step} of 6</div>
                <div className="font-semibold mt-0.5">Build your pet profile</div>
              </div>
              <button
                onClick={close}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="h-1 bg-secondary">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${(step / 6) * 100}%` }}
              />
            </div>

            <div className="p-6 space-y-5 min-h-[300px]">
              {step === 1 && (
                <>
                  <h3 className="text-lg font-semibold">Dog or cat?</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { v: "dog", icon: Dog, label: "Dog" },
                      { v: "cat", icon: Cat, label: "Cat" },
                    ] as const).map((opt) => (
                      <button
                        key={opt.v}
                        onClick={() => setProfile({ ...profile, petType: opt.v })}
                        className={`rounded-2xl border p-5 flex flex-col items-center gap-2 transition-all ${
                          profile.petType === opt.v
                            ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        <opt.icon className="h-8 w-8 text-primary" />
                        <div className="font-medium">{opt.label}</div>
                      </button>
                    ))}
                  </div>
                  <div className="space-y-2 pt-2">
                    <Label htmlFor="petName">Name (optional)</Label>
                    <Input
                      id="petName"
                      placeholder="e.g. Bailey"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      maxLength={40}
                    />
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <h3 className="text-lg font-semibold">Breed</h3>
                  <p className="text-sm text-muted-foreground">
                    We use this to size portions and toy durability.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="breed">Breed</Label>
                    <Input
                      id="breed"
                      placeholder={
                        profile.petType === "dog"
                          ? "e.g. Golden Retriever"
                          : "e.g. Maine Coon"
                      }
                      value={profile.breed}
                      onChange={(e) => setProfile({ ...profile, breed: e.target.value })}
                      maxLength={60}
                    />
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <h3 className="text-lg font-semibold">Age</h3>
                  <p className="text-sm text-muted-foreground">In years.</p>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age (years)</Label>
                    <Input
                      id="age"
                      type="number"
                      inputMode="decimal"
                      min={0}
                      max={30}
                      placeholder="e.g. 4"
                      value={profile.ageYears}
                      onChange={(e) => setProfile({ ...profile, ageYears: e.target.value })}
                    />
                  </div>
                </>
              )}

              {step === 4 && (
                <>
                  <h3 className="text-lg font-semibold">Weight</h3>
                  <p className="text-sm text-muted-foreground">
                    Used to calculate daily calories.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (lbs)</Label>
                    <Input
                      id="weight"
                      type="number"
                      inputMode="decimal"
                      min={1}
                      max={250}
                      placeholder="e.g. 45"
                      value={profile.weightLbs}
                      onChange={(e) =>
                        setProfile({ ...profile, weightLbs: e.target.value })
                      }
                    />
                  </div>
                </>
              )}

              {step === 5 && (
                <>
                  <h3 className="text-lg font-semibold">Activity level</h3>
                  <div className="space-y-2">
                    {(["low", "medium", "high"] as Activity[]).map((a) => (
                      <button
                        key={a}
                        onClick={() => setProfile({ ...profile, activity: a })}
                        className={`w-full text-left rounded-xl border p-4 flex items-center justify-between transition-all ${
                          profile.activity === a
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        <span className="font-medium">{ACTIVITY_LABEL[a]}</span>
                        {profile.activity === a && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step === 6 && (
                <>
                  <h3 className="text-lg font-semibold">Health concerns</h3>
                  <p className="text-sm text-muted-foreground">
                    Select any that apply (optional).
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {HEALTH_OPTIONS.map((h) => {
                      const on = profile.health.includes(h);
                      return (
                        <button
                          key={h}
                          onClick={() => toggleHealth(h)}
                          className={`rounded-full border px-3.5 py-1.5 text-sm transition-all ${
                            on
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border hover:border-primary/40"
                          }`}
                        >
                          {on && <Check className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />}
                          {h}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <div className="p-5 border-t border-border flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                onClick={back}
                disabled={step === 1}
                className="rounded-full"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              {step < 6 ? (
                <Button onClick={next} className="rounded-full">
                  Continue
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={finish} className="rounded-full">
                  See my match
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {results && (
        <section className="container pb-24">
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium mb-3">
                <Sparkles className="h-3.5 w-3.5" />
                Best match for {petName}
              </div>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
                One pick. Backed by your pet's profile.
              </h2>
            </div>

            {/* Top recommendation */}
            <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
              <div className="grid md:grid-cols-[260px_1fr] gap-0">
                <div className="bg-secondary/50 flex items-center justify-center p-6">
                  <img
                    src={results.rec.image}
                    alt={results.rec.name}
                    className="max-h-56 object-contain"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
                <div className="p-6 md:p-7">
                  <div className="text-xs text-muted-foreground">{results.rec.brand}</div>
                  <h3 className="text-xl font-semibold mt-1">{results.rec.name}</h3>
                  <div className="flex items-center gap-1 mt-2 text-sm">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span className="text-muted-foreground ml-1">4.8 · 12k+ reviews</span>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {results.rec.reasons.map((r) => (
                      <li key={r} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Urgency triggers */}
            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              <div className="rounded-2xl border border-warning/30 bg-warning/5 p-4 flex items-start gap-3">
                <TrendingDown className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium">You may be overpaying ~$15/month</div>
                  <div className="text-muted-foreground">
                    Compared to typical store-brand pricing for {petLabel.toLowerCase()}s
                    your size.
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-danger/30 bg-danger/5 p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium">Current diet may increase weight risk</div>
                  <div className="text-muted-foreground">
                    Switching to a tailored formula reduces this risk significantly.
                  </div>
                </div>
              </div>
            </div>

            {/* Feeding plan (locked) */}
            <div className="mt-8 rounded-3xl border border-border bg-card p-6 md:p-7 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Your feeding plan</h3>
                <span className="text-xs text-muted-foreground">
                  Calculated for {profile.weightLbs || "—"} lbs · {ACTIVITY_LABEL[profile.activity]}
                </span>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 mt-4">
                <div className="rounded-xl border border-border bg-background p-4">
                  <div className="text-xs text-muted-foreground">Daily feeding</div>
                  <div className="text-2xl font-semibold mt-1">
                    {results.plan.cupsPerDay} cups
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-background p-4">
                  <div className="text-xs text-muted-foreground">Monthly food cost</div>
                  <div className="text-2xl font-semibold mt-1">
                    ~${results.plan.monthlyCost}
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-background p-4 relative">
                  <div className="text-xs text-muted-foreground">Daily calories</div>
                  <div
                    className={`text-2xl font-semibold mt-1 ${unlocked ? "" : "blur-sm select-none"}`}
                  >
                    {results.plan.der} kcal
                  </div>
                </div>
              </div>

              {/* Locked detail rows */}
              <div className={`mt-5 space-y-2 ${unlocked ? "" : "blur-sm select-none"}`}>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Morning serving</span>
                  <span>{(results.plan.cupsPerDay / 2).toFixed(2)} cups</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Evening serving</span>
                  <span>{(results.plan.cupsPerDay / 2).toFixed(2)} cups</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Treat budget (10%)</span>
                  <span>~{Math.round(results.plan.der * 0.1)} kcal/day</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Refill cadence</span>
                  <span>Every ~{Math.max(1, Math.round(30 / Math.max(1, results.plan.monthlyCost / 60)))} weeks</span>
                </div>
              </div>

              {!unlocked && (
                <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-5">
                  <div className="flex items-start gap-3">
                    <Lock className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium">Unlock the full feeding plan</div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Save your pet profile and get refill reminders, price drops, and
                        nutrition updates.
                      </p>
                      <form
                        onSubmit={submitEmail}
                        className="mt-3 flex flex-col sm:flex-row gap-2"
                      >
                        <Input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@email.com"
                          className="rounded-xl"
                        />
                        <Button type="submit" className="rounded-xl">
                          <Mail className="h-4 w-4 mr-1" />
                          Save & unlock
                        </Button>
                      </form>
                      <p className="text-[11px] text-muted-foreground mt-2">
                        No spam. Unsubscribe anytime.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Price comparison */}
            <div className="mt-8 rounded-3xl border border-border bg-card p-6 md:p-7 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Price comparison</h3>
                <span className="text-xs text-muted-foreground">
                  {results.rec.bagLbs} lb bag
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 mt-4">
                {(() => {
                  const amazonBest = results.rec.amazonPrice <= results.rec.chewyPrice;
                  const stores = [
                    {
                      name: "Amazon",
                      price: results.rec.amazonPrice,
                      url: amazonUrl(results.rec.query),
                      best: amazonBest,
                      bg: "hsl(var(--brand-amazon))",
                    },
                    {
                      name: "Chewy",
                      price: results.rec.chewyPrice,
                      url: chewyUrl(results.rec.query),
                      best: !amazonBest,
                      bg: "hsl(var(--brand-chewy))",
                    },
                  ];
                  // Order by commission priority: Amazon first
                  return stores.map((s) => (
                    <div
                      key={s.name}
                      className={`rounded-2xl border p-4 flex items-center justify-between ${
                        s.best ? "border-success bg-success/5" : "border-border"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{s.name}</span>
                          {s.best && (
                            <span className="text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 bg-success text-white">
                              Best value
                            </span>
                          )}
                        </div>
                        <div className="text-2xl font-semibold mt-1">
                          ${s.price.toFixed(2)}
                        </div>
                      </div>
                      <a href={s.url} target="_blank" rel="noopener noreferrer sponsored">
                        <Button
                          className="rounded-xl text-white"
                          style={{ backgroundColor: s.bg }}
                        >
                          Buy on {s.name}
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </a>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Subscription */}
            <div className="mt-8 rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 p-6 md:p-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">
                    <Sparkles className="h-3.5 w-3.5" />
                    Pet Nutrition Plan
                  </div>
                  <h3 className="text-2xl font-semibold mt-3">
                    $9.99/month — never overfeed, never run out.
                  </h3>
                  <ul className="mt-3 space-y-1.5 text-sm">
                    {[
                      "Full daily & monthly feeding calculations",
                      "Auto refill reminders timed to your bag size",
                      "Health risk alerts as your pet ages",
                      "Updated picks when weight or activity changes",
                    ].map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="md:text-right">
                  <Button
                    size="lg"
                    onClick={handleSubscribe}
                    className="h-12 rounded-2xl px-6 shadow-md shadow-primary/30"
                  >
                    <Bell className="h-4 w-4 mr-1" />
                    Start my plan — $9.99/mo
                  </Button>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    Cancel anytime.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border/60 mt-8">
        <div className="container py-8 text-xs text-muted-foreground space-y-2 text-center">
          <p>
            As an Amazon Associate, My Cat &amp; Dog Market earns from qualifying
            purchases. We may also earn commissions from Chewy and other partners.
          </p>
          <p>
            Personalized nutrition guidance is informational and not a substitute for
            veterinary advice.
          </p>
          <p>© {new Date().getFullYear()} My Cat &amp; Dog Market</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
