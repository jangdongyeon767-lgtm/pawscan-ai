import { useState } from "react";
import {
  Sparkles,
  ShieldCheck,
  Lock,
  PawPrint,
  Star,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Cat,
  Dog,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AMAZON_TAG = "YOUR_AMAZON_ID";
const amazonUrl = (q: string) =>
  `https://www.amazon.com/s?k=${encodeURIComponent(q)}&tag=${AMAZON_TAG}`;

type PetType = "dog" | "cat";
type AgeStage = "puppy" | "adult" | "senior";
type Goal = "weight_loss" | "healthy_skin" | "high_energy" | "dental_care";

type PetProfile = {
  name: string;
  petType: PetType;
  age: AgeStage;
  breed: string;
  weight: string;
  goal: Goal;
};

type Product = {
  category: "Food" | "Treats" | "Toys" | "Supplement";
  name: string;
  brand: string;
  rating: number;
  reviews: string;
  price: string;
  matchReason: string;
  query: string;
};

const GOAL_LABELS: Record<Goal, string> = {
  weight_loss: "Weight Loss",
  healthy_skin: "Healthy Skin & Coat",
  high_energy: "High Energy",
  dental_care: "Dental Care",
};

const AGE_LABELS: Record<AgeStage, string> = {
  puppy: "Puppy / Kitten",
  adult: "Adult",
  senior: "Senior",
};

function buildRecommendations(p: PetProfile): Product[] {
  const species = p.petType === "dog" ? "Dog" : "Cat";
  const goalText = GOAL_LABELS[p.goal];

  const foodByGoal: Record<Goal, { brand: string; name: string; query: string; reason: string }> = {
    weight_loss: {
      brand: "Hill's Science Diet",
      name: `Perfect Weight ${species} Food`,
      query: `Hill's Science Diet Perfect Weight ${species} Food`,
      reason: `Lean formula sized for ${p.weight || "—"} lbs`,
    },
    healthy_skin: {
      brand: "Wellness CORE",
      name: `Skin & Coat ${species} Recipe with Salmon`,
      query: `Wellness CORE Skin Coat Salmon ${species}`,
      reason: "Omega-3 rich salmon for coat shine",
    },
    high_energy: {
      brand: "Purina Pro Plan",
      name: `Sport 30/20 High-Protein ${species} Food`,
      query: `Purina Pro Plan Sport 30 20 ${species}`,
      reason: "30% protein for active lifestyle",
    },
    dental_care: {
      brand: "Royal Canin",
      name: `Dental Care ${species} Formula`,
      query: `Royal Canin Dental Care ${species}`,
      reason: "Kibble shape reduces tartar",
    },
  };

  const food = foodByGoal[p.goal];

  return [
    {
      category: "Food",
      brand: food.brand,
      name: food.name,
      rating: 4.7,
      reviews: "8,200+",
      price: "$54.99",
      matchReason: food.reason,
      query: food.query,
    },
    {
      category: "Treats",
      brand: "Blue Buffalo",
      name: `Wilderness Trail Treats — ${AGE_LABELS[p.age]}`,
      rating: 4.8,
      reviews: "12,400+",
      price: "$9.49",
      matchReason: `Grain-free, sized for ${p.breed || species.toLowerCase()}`,
      query: `Blue Buffalo Wilderness Trail Treats ${species}`,
    },
    {
      category: "Toys",
      brand: "KONG",
      name:
        p.petType === "dog"
          ? "Classic Durable Rubber Toy"
          : "Active Feather Teaser Wand",
      rating: 4.9,
      reviews: "45,000+",
      price: "$12.99",
      matchReason:
        p.goal === "high_energy"
          ? "Built for high-energy play"
          : "Mental stimulation & enrichment",
      query: p.petType === "dog" ? "KONG Classic Dog Toy" : "KONG feather cat toy",
    },
    {
      category: "Supplement",
      brand: "Zesty Paws",
      name:
        p.goal === "healthy_skin"
          ? "Omega 3 Salmon Oil"
          : p.goal === "dental_care"
            ? "Oral Health Dental Sticks"
            : "Multivitamin Soft Chews",
      rating: 4.6,
      reviews: "23,100+",
      price: "$24.95",
      matchReason: `Targeted for ${goalText.toLowerCase()}`,
      query: `Zesty Paws ${species} ${goalText}`,
    },
  ];
}

const Index = () => {
  const [step, setStep] = useState<number>(0); // 0 = closed
  const [profile, setProfile] = useState<PetProfile>({
    name: "",
    petType: "dog",
    age: "adult",
    breed: "",
    weight: "",
    goal: "healthy_skin",
  });
  const [results, setResults] = useState<{ profile: PetProfile; products: Product[] } | null>(null);

  const startMatching = () => {
    setResults(null);
    setStep(1);
  };
  const closeWizard = () => setStep(0);
  const next = () => setStep((s) => Math.min(s + 1, 6));
  const back = () => setStep((s) => Math.max(s - 1, 1));
  const finish = () => {
    setResults({ profile, products: buildRecommendations(profile) });
    setStep(0);
    setTimeout(
      () => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }),
      80,
    );
  };

  const petName = profile.name.trim() || (profile.petType === "dog" ? "Your Dog" : "Your Cat");

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
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
            <Award className="h-4 w-4 text-primary" />
            AAFCO-aligned matching
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground mb-6 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Our Proprietary Matching Logic
          </div>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05] text-foreground">
            The AI-Powered <br className="hidden sm:block" />
            <span className="text-primary">Marketplace Tailored to Your Pet.</span>
          </h1>
          <p className="mt-5 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Find the perfect food, treats, and toys matched specifically to your pet's
            age, breed, and weight.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3">
            <Button
              size="lg"
              onClick={startMatching}
              className="h-14 px-8 text-base rounded-2xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Find My Pet's Match
            </Button>
            <p className="text-xs text-muted-foreground">
              Free • No sign-up required • Takes under 60 seconds
            </p>
          </div>
        </div>

        {/* Trust strip */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {[
            {
              icon: Award,
              label: "AAFCO Standards",
              sub: "Nutritional matching aligned with AAFCO standards",
            },
            {
              icon: ShieldCheck,
              label: "Curated Marketplace",
              sub: "Hand-picked top-rated brands on Amazon",
            },
            {
              icon: Lock,
              label: "Privacy First",
              sub: "Your pet's profile is never stored on our servers",
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
                <div className="text-xs text-muted-foreground">
                  Step {step} of 5
                </div>
                <div className="font-semibold mt-0.5">Find My Pet's Match</div>
              </div>
              <button
                onClick={closeWizard}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-secondary">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>

            <div className="p-6 space-y-5 min-h-[280px]">
              {step === 1 && (
                <>
                  <h3 className="text-lg font-semibold">What kind of pet do you have?</h3>
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
                    <Label htmlFor="petName">Pet's name (optional)</Label>
                    <Input
                      id="petName"
                      placeholder="e.g., Bailey"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      maxLength={40}
                    />
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <h3 className="text-lg font-semibold">Life stage</h3>
                  <p className="text-sm text-muted-foreground">
                    We use this to align with AAFCO life-stage nutrition.
                  </p>
                  <div className="space-y-2">
                    {(Object.keys(AGE_LABELS) as AgeStage[]).map((a) => (
                      <button
                        key={a}
                        onClick={() => setProfile({ ...profile, age: a })}
                        className={`w-full text-left rounded-xl border p-4 flex items-center justify-between transition-all ${
                          profile.age === a
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        <span className="font-medium">{AGE_LABELS[a]}</span>
                        {profile.age === a && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <h3 className="text-lg font-semibold">Breed</h3>
                  <p className="text-sm text-muted-foreground">
                    Helps us pick portion sizes and chew durability.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="breed">Breed</Label>
                    <Input
                      id="breed"
                      placeholder={
                        profile.petType === "dog"
                          ? "e.g., Golden Retriever"
                          : "e.g., Maine Coon"
                      }
                      value={profile.breed}
                      onChange={(e) => setProfile({ ...profile, breed: e.target.value })}
                      maxLength={60}
                    />
                  </div>
                </>
              )}

              {step === 4 && (
                <>
                  <h3 className="text-lg font-semibold">Weight</h3>
                  <p className="text-sm text-muted-foreground">
                    Used to calculate calorie targets.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (lbs)</Label>
                    <Input
                      id="weight"
                      type="number"
                      inputMode="decimal"
                      min={1}
                      max={250}
                      placeholder="e.g., 45"
                      value={profile.weight}
                      onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                    />
                  </div>
                </>
              )}

              {step === 5 && (
                <>
                  <h3 className="text-lg font-semibold">Primary goal</h3>
                  <p className="text-sm text-muted-foreground">
                    Pick what matters most right now.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {(Object.keys(GOAL_LABELS) as Goal[]).map((g) => (
                      <button
                        key={g}
                        onClick={() => setProfile({ ...profile, goal: g })}
                        className={`rounded-xl border p-4 text-left transition-all ${
                          profile.goal === g
                            ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        <div className="font-medium text-sm">{GOAL_LABELS[g]}</div>
                      </button>
                    ))}
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
              {step < 5 ? (
                <Button onClick={next} className="rounded-full">
                  Next
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={finish} className="rounded-full">
                  <Sparkles className="h-4 w-4 mr-1" />
                  Show My Matches
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {results && (
        <section className="container pb-20">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-wider text-primary font-medium">
                  Recommended for You
                </div>
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mt-1">
                  Matched for {petName}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {AGE_LABELS[results.profile.age]} ·{" "}
                  {results.profile.breed || (results.profile.petType === "dog" ? "Dog" : "Cat")} ·{" "}
                  {results.profile.weight ? `${results.profile.weight} lbs` : "—"} ·{" "}
                  {GOAL_LABELS[results.profile.goal]}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={startMatching}
                className="rounded-full"
              >
                Re-match
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {results.products.map((p) => (
                <ProductCard key={p.name} product={p} petName={petName} />
              ))}
            </div>

            <p className="text-[11px] text-muted-foreground mt-2">
              FTC Disclosure: As an Amazon Associate, My Cat &amp; Dog Market earns from
              qualifying purchases.
            </p>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="container py-10 text-xs text-muted-foreground space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <PawPrint className="h-4 w-4 text-primary" />
            </div>
            <span className="font-medium text-foreground">My Cat &amp; Dog Market</span>
          </div>
          <p>
            Nutritional matching aligned with AAFCO standards. Recommendations are based
            on our proprietary matching logic and are informational only — not a
            substitute for professional advice.
          </p>
          <p>
            As an Amazon Associate, My Cat &amp; Dog Market earns from qualifying
            purchases.
          </p>
          <p>© {new Date().getFullYear()} My Cat &amp; Dog Market. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const ProductCard = ({ product, petName }: { product: Product; petName: string }) => (
  <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col">
    <div className="flex items-center justify-between">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
        {product.category}
      </span>
      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5">
        <Sparkles className="h-3 w-3" />
        AI-Matched
      </span>
    </div>
    <div className="mt-3">
      <div className="text-xs text-muted-foreground">{product.brand}</div>
      <div className="font-semibold mt-0.5 leading-snug">{product.name}</div>
    </div>
    <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
      <Star className="h-3.5 w-3.5 fill-[hsl(var(--warning))] text-[hsl(var(--warning))]" />
      <span className="font-medium text-foreground">{product.rating}</span>
      <span>({product.reviews})</span>
    </div>
    <div className="mt-3 rounded-lg bg-secondary/60 px-3 py-2 text-[11px] text-muted-foreground">
      <span className="font-medium text-foreground">Matched for {petName}:</span>{" "}
      {product.matchReason}
    </div>
    <div className="mt-4 flex items-center justify-between">
      <div className="text-lg font-semibold">{product.price}</div>
    </div>
    <a
      href={amazonUrl(product.query)}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-[hsl(var(--brand-amazon))] text-black font-semibold text-sm h-11 hover:shadow-md active:scale-[0.99] transition-all"
    >
      Check Price on Amazon
      <ExternalLink className="h-4 w-4" />
    </a>
  </div>
);

export default Index;
