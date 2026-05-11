import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  LogOut,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const HEALTH_OPTIONS = [
  "관절·고관절",
  "피부·알러지",
  "소화·장 트러블",
  "치아·구강",
  "비만·체중관리",
  "심장·혈관",
  "신장·요로",
  "눈·귀",
] as const;
type HealthConcern = (typeof HEALTH_OPTIONS)[number];

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
  healthConcerns: HealthConcern[];
  characteristics: string;
};

type Product = {
  category: "사료" | "간식" | "장난감" | "영양제";
  name: string;
  brand: string;
  rating: number;
  reviews: string;
  price: string;
  matchReason: string;
  query: string;
};

const GOAL_LABELS: Record<Goal, string> = {
  weight_loss: "체중 감량",
  healthy_skin: "피부·모질 개선",
  high_energy: "활동량 보충",
  dental_care: "치아 관리",
};

const AGE_LABELS: Record<AgeStage, string> = {
  puppy: "퍼피 / 키튼",
  adult: "성견 / 성묘",
  senior: "시니어",
};

function buildRecommendations(p: PetProfile): Product[] {
  const speciesEn = p.petType === "dog" ? "Dog" : "Cat";
  const speciesKo = p.petType === "dog" ? "강아지" : "고양이";
  const goalText = GOAL_LABELS[p.goal];

  const foodByGoal: Record<
    Goal,
    { brand: string; name: string; query: string; reason: string }
  > = {
    weight_loss: {
      brand: "Hill's Science Diet",
      name: `Perfect Weight ${speciesEn} Food`,
      query: `Hill's Science Diet Perfect Weight ${speciesEn} Food`,
      reason: `${p.weight || "—"} lbs 체중에 맞춘 저칼로리 포뮬러`,
    },
    healthy_skin: {
      brand: "Wellness CORE",
      name: `Skin & Coat ${speciesEn} Recipe with Salmon`,
      query: `Wellness CORE Skin Coat Salmon ${speciesEn}`,
      reason: "오메가-3 풍부한 연어로 모질 개선",
    },
    high_energy: {
      brand: "Purina Pro Plan",
      name: `Sport 30/20 High-Protein ${speciesEn} Food`,
      query: `Purina Pro Plan Sport 30 20 ${speciesEn}`,
      reason: "활동량 많은 반려동물을 위한 30% 단백질",
    },
    dental_care: {
      brand: "Royal Canin",
      name: `Dental Care ${speciesEn} Formula`,
      query: `Royal Canin Dental Care ${speciesEn}`,
      reason: "치석 감소에 도움 되는 키블 형태",
    },
  };

  const food = foodByGoal[p.goal];

  return [
    {
      category: "사료",
      brand: food.brand,
      name: food.name,
      rating: 4.7,
      reviews: "8,200+",
      price: "$54.99",
      matchReason: food.reason,
      query: food.query,
    },
    {
      category: "간식",
      brand: "Blue Buffalo",
      name: `Wilderness Trail Treats — ${AGE_LABELS[p.age]}`,
      rating: 4.8,
      reviews: "12,400+",
      price: "$9.49",
      matchReason: `그레인프리 · ${p.breed || speciesKo}에 맞춘 사이즈`,
      query: `Blue Buffalo Wilderness Trail Treats ${speciesEn}`,
    },
    {
      category: "장난감",
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
          ? "활동량이 많은 반려동물에 최적화"
          : "두뇌 자극 및 행동 풍부화",
      query:
        p.petType === "dog" ? "KONG Classic Dog Toy" : "KONG feather cat toy",
    },
    {
      category: "영양제",
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
      matchReason: `${goalText}에 맞춘 타겟 보충제`,
      query: `Zesty Paws ${speciesEn} ${goalText}`,
    },
  ];
}

const Index = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(0);
  const [profile, setProfile] = useState<PetProfile>({
    name: "",
    petType: "dog",
    age: "adult",
    breed: "",
    weight: "",
    goal: "healthy_skin",
    healthConcerns: [],
    characteristics: "",
  });
  const [results, setResults] = useState<{
    profile: PetProfile;
    products: Product[];
  } | null>(null);

  const startMatching = () => {
    setResults(null);
    setStep(1);
  };
  const closeWizard = () => setStep(0);
  const next = () => setStep((s) => Math.min(s + 1, 6));
  const back = () => setStep((s) => Math.max(s - 1, 1));
  const toggleHealth = (h: HealthConcern) =>
    setProfile((p) => ({
      ...p,
      healthConcerns: p.healthConcerns.includes(h)
        ? p.healthConcerns.filter((x) => x !== h)
        : [...p.healthConcerns, h],
    }));

  const finish = async () => {
    setResults({ profile, products: buildRecommendations(profile) });
    setStep(0);
    setTimeout(
      () => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }),
      80,
    );
    if (user) {
      const { error } = await supabase.from("pet_profiles").insert({
        user_id: user.id,
        name: profile.name || null,
        pet_type: profile.petType,
        age_stage: profile.age,
        breed: profile.breed || null,
        weight: profile.weight || null,
        goal: profile.goal,
        health_concerns: profile.healthConcerns,
        characteristics: profile.characteristics || null,
      });
      if (!error) toast({ title: "프로필이 저장되었습니다" });
    }
  };

  const petName =
    profile.name.trim() || (profile.petType === "dog" ? "우리 강아지" : "우리 고양이");

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
              AAFCO 기준 매칭
            </div>
            {user ? (
              <>
                <span className="hidden sm:inline text-xs text-muted-foreground max-w-[160px] truncate">
                  {user.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className="rounded-full"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  로그아웃
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
                  로그인
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate("/auth")}
                  className="rounded-full"
                >
                  회원가입
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
            자체 개발 매칭 로직
          </div>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05] text-foreground">
            우리 아이만을 위한 <br className="hidden sm:block" />
            <span className="text-primary">AI 펫 마켓플레이스.</span>
          </h1>
          <p className="mt-5 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            반려동물의 나이, 견종·묘종, 체중에 꼭 맞는 사료와 간식, 장난감을
            찾아드립니다.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3">
            <Button
              size="lg"
              onClick={startMatching}
              className="h-14 px-8 text-base rounded-2xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              우리 아이 맞춤 찾기
            </Button>
            <p className="text-xs text-muted-foreground">
              무료 · 회원가입 불필요 · 60초 이내 완료
            </p>
          </div>
        </div>

        {/* Trust strip */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {[
            {
              icon: Award,
              label: "AAFCO 기준",
              sub: "AAFCO 영양 기준에 맞춘 매칭 로직",
            },
            {
              icon: ShieldCheck,
              label: "큐레이션 마켓",
              sub: "Amazon에서 검증된 상위 브랜드만 엄선",
            },
            {
              icon: Lock,
              label: "프라이버시 우선",
              sub: "반려동물 프로필은 서버에 저장되지 않습니다",
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
                  {step} / 6 단계
                </div>
                <div className="font-semibold mt-0.5">우리 아이 맞춤 찾기</div>
              </div>
              <button
                onClick={closeWizard}
                className="text-muted-foreground hover:text-foreground"
                aria-label="닫기"
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

            <div className="p-6 space-y-5 min-h-[280px]">
              {step === 1 && (
                <>
                  <h3 className="text-lg font-semibold">반려동물 종류는 무엇인가요?</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { v: "dog", icon: Dog, label: "강아지" },
                      { v: "cat", icon: Cat, label: "고양이" },
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
                    <Label htmlFor="petName">이름 (선택)</Label>
                    <Input
                      id="petName"
                      placeholder="예: 베일리"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      maxLength={40}
                    />
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <h3 className="text-lg font-semibold">생애 단계</h3>
                  <p className="text-sm text-muted-foreground">
                    AAFCO 생애 단계 영양 기준에 맞춰 매칭합니다.
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
                  <h3 className="text-lg font-semibold">견종 / 묘종</h3>
                  <p className="text-sm text-muted-foreground">
                    급여량과 장난감 내구성 추천에 활용됩니다.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="breed">품종</Label>
                    <Input
                      id="breed"
                      placeholder={
                        profile.petType === "dog"
                          ? "예: 골든 리트리버"
                          : "예: 메인쿤"
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
                  <h3 className="text-lg font-semibold">체중</h3>
                  <p className="text-sm text-muted-foreground">
                    하루 권장 칼로리 계산에 사용됩니다.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="weight">체중 (lbs)</Label>
                    <Input
                      id="weight"
                      type="number"
                      inputMode="decimal"
                      min={1}
                      max={250}
                      placeholder="예: 45"
                      value={profile.weight}
                      onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                    />
                  </div>
                </>
              )}

              {step === 5 && (
                <>
                  <h3 className="text-lg font-semibold">주요 목표</h3>
                  <p className="text-sm text-muted-foreground">
                    지금 가장 중요한 한 가지를 선택해 주세요.
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

              {step === 6 && (
                <>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    아픈 부위 · 특징
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    걱정되는 건강 부위를 모두 선택하고, 추가 특징이 있다면
                    알려주세요. (선택)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {HEALTH_OPTIONS.map((h) => {
                      const active = profile.healthConcerns.includes(h);
                      return (
                        <button
                          key={h}
                          type="button"
                          onClick={() => toggleHealth(h)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card hover:border-primary/40"
                          }`}
                        >
                          {h}
                        </button>
                      );
                    })}
                  </div>
                  <div className="space-y-2 pt-2">
                    <Label htmlFor="characteristics">추가 특징 (선택)</Label>
                    <Textarea
                      id="characteristics"
                      placeholder="예: 중성화 완료, 알러지 있음, 사료 잘 안 먹음, 활동량 많음..."
                      value={profile.characteristics}
                      onChange={(e) =>
                        setProfile({ ...profile, characteristics: e.target.value })
                      }
                      maxLength={500}
                      rows={4}
                    />
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
                이전
              </Button>
              {step < 6 ? (
                <Button onClick={next} className="rounded-full">
                  다음
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={finish} className="rounded-full">
                  <Sparkles className="h-4 w-4 mr-1" />
                  맞춤 결과 보기
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
                  맞춤 추천
                </div>
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mt-1">
                  {petName}를 위한 매칭 결과
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {AGE_LABELS[results.profile.age]} ·{" "}
                  {results.profile.breed ||
                    (results.profile.petType === "dog" ? "강아지" : "고양이")}{" "}
                  ·{" "}
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
                다시 매칭
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {results.products.map((p) => (
                <ProductCard key={p.name} product={p} petName={petName} />
              ))}
            </div>

            <p className="text-[11px] text-muted-foreground mt-2">
              FTC 고지: My Cat &amp; Dog Market은 Amazon Associate 프로그램 참여자로,
              적격 구매 시 수수료를 받을 수 있습니다.
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
            AAFCO 영양 기준에 맞춘 매칭 로직을 사용합니다. 추천 결과는 자체 매칭
            로직을 기반으로 한 정보 제공용이며, 전문가의 진료를 대체하지 않습니다.
          </p>
          <p>
            My Cat &amp; Dog Market은 Amazon Associate 프로그램 참여자로, 적격 구매 시
            수수료를 받을 수 있습니다.
          </p>
          <p>© {new Date().getFullYear()} My Cat &amp; Dog Market. 모든 권리 보유.</p>
        </div>
      </footer>
    </div>
  );
};

const ProductCard = ({
  product,
  petName,
}: {
  product: Product;
  petName: string;
}) => (
  <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col">
    <div className="flex items-center justify-between">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
        {product.category}
      </span>
      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5">
        <Sparkles className="h-3 w-3" />
        AI 매칭
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
      <span className="font-medium text-foreground">{petName} 맞춤:</span>{" "}
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
      Amazon 가격 확인
      <ExternalLink className="h-4 w-4" />
    </a>
  </div>
);

export default Index;
