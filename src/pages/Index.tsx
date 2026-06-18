import { useState } from "react";
import {
  ShieldCheck,
  Lock,
  Star,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Cat,
  Award,
  Bell,
  TrendingDown,
  AlertTriangle,
  Mail,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

import { CategoryPriceTable } from "@/components/CategoryPriceTable";
import { PremiumChatbot } from "@/components/PremiumChatbot";
import { WaitlistModal } from "@/components/WaitlistModal";

const AMAZON_TAG = "mycatdogmarket-20";
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
  cupsPerLb: number;
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
        `Low-calorie formula for ${ACTIVITY_LABEL[p.activity].toLowerCase()}-activity adults`,
        "Clinically proven weight loss within 10 weeks",
        "Meets AAFCO nutrition standards",
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
        "Rich in Omega-3 from real salmon",
        "Grain-free for sensitive stomachs",
        "Meets AAFCO adult maintenance standards",
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
        "Easy-to-digest oatmeal and salmon",
        "Live probiotics for gut health",
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
        "Vet-formulated, AAFCO-compliant",
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
      `Balanced nutrition for ${ACTIVITY_LABEL[p.activity].toLowerCase()}-activity adults`,
      "Real meat first, no by-product meals",
      "Meets AAFCO nutrition standards",
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
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<PetProfile>({
    name: "",
    petType: "cat",
    breed: "",
    ageYears: "",
    weightLbs: "",
    activity: "medium",
    health: [],
  });
  const [waitlistOpen, setWaitlistOpen] = useState(false);
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
    setProfile({
      name: "",
      petType: "cat",
      breed: "",
      ageYears: "",
      weightLbs: "",
      activity: "medium",
      health: [],
    });
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

  const finish = () => {
    const rec = pickRecommendation(profile);
    const plan = feedingPlan(profile, rec);
    setResults({ profile, rec, plan });
    setStep(0);
    setTimeout(
      () => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }),
      80,
    );
  };

  const submitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast({ title: "Please enter a valid email", variant: "destructive" });
      return;
    }
    toast({
      title: "You're signed up!",
      description: "We'll send refill reminders and price-drop alerts.",
    });
    setUnlocked(true);
  };

  const scrollToUpgrade = () => {
    setWaitlistOpen(true);
  };

  const handleSubscribe = () => {
    setWaitlistOpen(true);
  };

  const petName = profile.name.trim() || "your cat";
  const petLabel = "cat";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-40">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Cat className="h-5 w-5 text-primary" />
            </div>
            <span
              className="font-semibold tracking-tight text-base sm:text-lg"
              style={{
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif',
                letterSpacing: "-0.02em",
              }}
            >
              PurrPick
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
              <Award className="h-4 w-4 text-primary" />
              Matched to AAFCO nutrition guidelines
            </div>
            <Button
              size="sm"
              onClick={() => setWaitlistOpen(true)}
              className="rounded-full"
            >
              Pre-order
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground mb-6 shadow-sm">
            <Award className="h-3.5 w-3.5 text-primary" />
            Cat food matched to AAFCO nutrition standards
          </div>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05] text-foreground">
            The perfect food for your cat,
            <br className="hidden sm:block" />
            <span className="text-primary"> at the lowest price.</span>
          </h1>
          <p className="mt-5 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Find AAFCO-matched food for your cat and compare the lowest prices on Amazon and Chewy — all in one place.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3">
            <Button
              size="lg"
              onClick={() => setWaitlistOpen(true)}
              className="h-14 px-8 text-base rounded-2xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
            >
              <Bell className="mr-2 h-5 w-5" />
              Pre-order — $6.99/mo for life
            </Button>
            <p className="text-xs text-muted-foreground">
              Launch price <span className="line-through">$12.99/mo</span> → pre-order now and pay just <span className="text-primary font-semibold">$6.99/mo</span> for life · No card required
            </p>
          </div>
        </div>

        {/* Trust strip */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {[
            {
              icon: Award,
              label: "AAFCO data-matched",
              sub: "Matched to AAFCO nutrition guidelines",
            },
            {
              icon: ShieldCheck,
              label: "Curated brands",
              sub: "Only top-rated brands on Amazon and Chewy",
            },
            {
              icon: Lock,
              label: "Privacy first",
              sub: "Your profile is kept safe in your account only",
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
                <div className="text-xs text-muted-foreground">Step {step} of 7</div>
                <div className="font-semibold mt-0.5">Create your pet profile</div>
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
                style={{ width: `${(step / 7) * 100}%` }}
              />
            </div>

            <div className="p-6 space-y-5 min-h-[300px]">
              {step === 1 && (
                <>
                  <h3 className="text-lg font-semibold">Tell us about your cat</h3>
                  <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 flex items-center gap-3">
                    <Cat className="h-8 w-8 text-primary" />
                    <div className="text-sm">
                      <div className="font-medium">Cat food recommendations</div>
                      <div className="text-muted-foreground text-xs">
                        PurrPick is a cat-only food recommendation service.
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <Label htmlFor="petName">Name (optional)</Label>
                    <Input
                      id="petName"
                      placeholder="e.g. Whiskers"
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
                    Used to tailor portion size and toy-durability suggestions.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="breed">Breed</Label>
                    <Input
                      id="breed"
                      placeholder="e.g. Maine Coon"
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
                  <p className="text-sm text-muted-foreground">Enter age in years.</p>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age (years)</Label>
                    <Input
                      id="age"
                      type="number"
                      inputMode="decimal"
                      min={0}
                      max={30}
                      placeholder="e.g. 4"
                      value={profile.ageYears === "unknown" ? "" : profile.ageYears}
                      disabled={profile.ageYears === "unknown"}
                      onChange={(e) => setProfile({ ...profile, ageYears: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setProfile({
                          ...profile,
                          ageYears: profile.ageYears === "unknown" ? "" : "unknown",
                        })
                      }
                      className={`mt-2 w-full rounded-xl border p-3 text-sm font-medium transition-all ${
                        profile.ageYears === "unknown"
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      Don't know
                    </button>
                  </div>
                </>
              )}

              {step === 4 && (
                <>
                  <h3 className="text-lg font-semibold">Weight</h3>
                  <p className="text-sm text-muted-foreground">
                    Used to calculate daily calorie needs.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (lbs)</Label>
                    <Input
                      id="weight"
                      type="number"
                      inputMode="decimal"
                      min={1}
                      max={250}
                      placeholder="e.g. 10"
                      value={profile.weightLbs === "unknown" ? "" : profile.weightLbs}
                      disabled={profile.weightLbs === "unknown"}
                      onChange={(e) =>
                        setProfile({ ...profile, weightLbs: e.target.value })
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setProfile({
                          ...profile,
                          weightLbs: profile.weightLbs === "unknown" ? "" : "unknown",
                        })
                      }
                      className={`mt-2 w-full rounded-xl border p-3 text-sm font-medium transition-all ${
                        profile.weightLbs === "unknown"
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      Don't know
                    </button>
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
                    Select all that apply (optional).
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

              {step === 7 && (
                <>
                  <h3 className="text-lg font-semibold">Ready to save?</h3>
                  <p className="text-sm text-muted-foreground">
                    Please review your entries. You can edit your profile anytime after saving.
                  </p>
                  <div className="rounded-2xl border border-border bg-secondary/30 divide-y divide-border">
                    {[
                      { label: "Type", value: profile.petType === "dog" ? "Dog" : "Cat" },
                      { label: "Name", value: profile.name || "—" },
                      { label: "Breed", value: profile.breed || "—" },
                      {
                        label: "Age",
                        value:
                          profile.ageYears === "unknown" || !profile.ageYears
                            ? "Unknown"
                            : `${profile.ageYears} yrs`,
                      },
                      {
                        label: "Weight",
                        value:
                          profile.weightLbs === "unknown" || !profile.weightLbs
                            ? "Unknown"
                            : `${profile.weightLbs} lbs`,
                      },
                      { label: "Activity", value: ACTIVITY_LABEL[profile.activity] },
                      {
                        label: "Health concerns",
                        value: profile.health.length ? profile.health.join(", ") : "—",
                      },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="flex items-start justify-between gap-3 px-4 py-3 text-sm"
                      >
                        <span className="text-muted-foreground">{row.label}</span>
                        <span className="font-medium text-right">{row.value}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    After saving, you can edit anytime from <span className="font-medium text-foreground">My Pet</span> in the top menu.
                  </p>
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
              {step < 7 ? (
                <Button onClick={next} className="rounded-full">
                  Next
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={finish} className="rounded-full">
                  <Check className="h-4 w-4 mr-1" />
                  Save profile
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
                One pick. Based on your cat's profile.
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
                    <span className="text-muted-foreground ml-1">4.8 · 12,000+ reviews</span>
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
                  <div className="font-medium">You may be overpaying by ~$15/month</div>
                  <div className="text-muted-foreground">
                    Compared to typical in-store prices for a similar-size {petLabel}.
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-danger/30 bg-danger/5 p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium">Current diet may raise obesity risk</div>
                  <div className="text-muted-foreground">
                    Switching to a tailored formula can significantly reduce risk.
                  </div>
                </div>
              </div>
            </div>


            {/* Feeding plan (locked) */}
            <div className="mt-8 rounded-3xl border border-border bg-card p-6 md:p-7 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Personalized feeding plan</h3>
                <span className="text-xs text-muted-foreground">
                  {profile.weightLbs && profile.weightLbs !== "unknown" ? `${profile.weightLbs} lbs` : "Weight unknown"} · Activity {ACTIVITY_LABEL[profile.activity]}
                </span>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 mt-4">
                <div className="rounded-xl border border-border bg-background p-4">
                  <div className="text-xs text-muted-foreground">Daily portion</div>
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

              <div className={`mt-5 space-y-2 ${unlocked ? "" : "blur-sm select-none"}`}>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Morning portion</span>
                  <span>{(results.plan.cupsPerDay / 2).toFixed(2)} cups</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Evening portion</span>
                  <span>{(results.plan.cupsPerDay / 2).toFixed(2)} cups</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Treat limit (10%)</span>
                  <span>~{Math.round(results.plan.der * 0.1)} kcal/day</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Refill cycle</span>
                  <span>About every {Math.max(1, Math.round(30 / Math.max(1, results.plan.monthlyCost / 60)))} weeks</span>
                </div>
              </div>

              {!unlocked && (
                <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-5">
                  <div className="flex items-start gap-3">
                    <Lock className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium">Unlock the full feeding plan</div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Save your profile to get refill reminders, price-drop alerts, and nutrition updates.
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

            {/* Subscription */}
            <div id="subscription-cta" className="mt-8 rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 p-6 md:p-8 shadow-sm scroll-mt-24">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">
                    <Sparkles className="h-3.5 w-3.5" />
                    Early-bird pre-order
                  </div>
                  <h3 className="text-2xl font-semibold mt-3 flex items-center gap-2 flex-wrap">
                    <span className="line-through text-muted-foreground text-lg">$12.99/mo</span>
                    <span>Pre-order price $6.99/mo locked for life</span>
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Launch price <span className="line-through">$12.99/mo</span> → pre-order now and pay just <span className="text-primary font-semibold">$6.99/mo</span> for life
                  </p>
                  <ul className="mt-3 space-y-1.5 text-sm">
                    {[
                      "AI food recommendations (age, weight, health)",
                      "Lowest-price alerts for your cat's food (Amazon, Chewy, Walmart)",
                      "Refill timing reminders",
                      "Instant price-drop notifications",
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
                    Pre-order — $6.99 for life
                  </Button>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    Limited spots · No card required
                  </p>
                </div>
              </div>
            </div>

            {/* Food recommendation */}
            <div className="mt-8 rounded-3xl border border-border bg-card p-6 md:p-7 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs text-muted-foreground">
                    Recommended for {petName}
                  </div>
                  <h3 className="text-lg font-semibold mt-0.5">
                    Food perfectly tailored to your cat
                  </h3>
                </div>
                <span className="text-xs text-muted-foreground">
                  {results.rec.bagLbs} lb
                </span>
              </div>

              <div className="grid sm:grid-cols-[140px_1fr] gap-4 items-center">
                <div className="bg-secondary/50 rounded-2xl flex items-center justify-center p-4">
                  <img
                    src={results.rec.image}
                    alt={results.rec.name}
                    className="max-h-32 object-contain"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">
                    {results.rec.brand}
                  </div>
                  <div className="font-semibold mt-0.5">{results.rec.name}</div>
                  <ul className="mt-2 space-y-1">
                    {results.rec.reasons.slice(0, 2).map((r) => (
                      <li
                        key={r}
                        className="flex items-start gap-2 text-xs text-muted-foreground"
                      >
                        <Check className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-col sm:flex-row gap-2">
                    <a
                      href={amazonUrl(results.rec.query)}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="flex-1"
                    >
                      <Button
                        className="w-full rounded-xl text-white"
                        style={{ backgroundColor: "hsl(var(--brand-amazon))" }}
                      >
                        Buy on Amazon
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </a>
                    <a
                      href={chewyUrl(results.rec.query)}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        className="w-full rounded-xl"
                      >
                        Buy on Chewy
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Free: cat food price comparison */}
      <CategoryPriceTable />

      {/* Pre-order: AI chatbot */}
      <PremiumChatbot isPremium={false} onUpgradeClick={scrollToUpgrade} />

      {/* Waitlist modal */}
      <WaitlistModal
        open={waitlistOpen}
        onClose={() => setWaitlistOpen(false)}
        defaultEmail=""
      />

      {/* Footer */}
      <footer className="border-t border-border/60 mt-8">
        <div className="container py-8 text-xs text-muted-foreground space-y-2 text-center">
          <p>
            PurrPick is a participant in the Amazon Associates program and earns commissions from qualifying purchases. We may also earn commissions from partners such as Chewy.
          </p>
          <p>
            Personalized nutrition guidance is for informational purposes only and is not a substitute for veterinary advice.
          </p>
          <p>© {new Date().getFullYear()} PurrPick</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
