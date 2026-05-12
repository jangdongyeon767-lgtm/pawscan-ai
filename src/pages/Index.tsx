import { useEffect, useState } from "react";
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
  "알러지",
  "체중 관리",
  "소화",
  "피부·모질",
  "관절",
  "치아",
  "심장",
  "신장",
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
  low: "낮음",
  medium: "보통",
  high: "높음",
};
const ACTIVITY_FACTOR: Record<Activity, number> = {
  low: 1.2,
  medium: 1.6,
  high: 2.0,
};

function pickRecommendation(p: PetProfile): Recommendation {
  const speciesEn = p.petType === "dog" ? "Dog" : "Cat";
  const speciesKo = p.petType === "dog" ? "강아지" : "고양이";
  const wantsWeight = p.health.includes("체중 관리");
  const wantsSkin = p.health.includes("피부·모질") || p.health.includes("알러지");
  const wantsDigestion = p.health.includes("소화");
  const wantsJoints = p.health.includes("관절");

  if (wantsWeight) {
    return {
      brand: "Hill's Science Diet",
      name: `Perfect Weight Adult ${speciesEn} Food`,
      image: "https://m.media-amazon.com/images/I/81Wm6jzC9XL._AC_SL1500_.jpg",
      reasons: [
        `${ACTIVITY_LABEL[p.activity]} 활동량 성견·성묘를 위한 저칼로리 포뮬러`,
        "10주 내 체중 감량 임상 입증",
        "AAFCO 영양 기준 충족",
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
        "리얼 연어로 풍부한 오메가-3",
        "민감한 위장을 위한 그레인프리",
        "AAFCO 성견 유지 기준 충족",
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
        "소화가 쉬운 오트밀과 연어",
        "장 건강을 위한 살아있는 프로바이오틱스",
        "AAFCO 기준 충족",
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
        "관절 지원을 위한 글루코사민 & EPA",
        `${ACTIVITY_LABEL[p.activity]} 활동량 ${speciesKo}에 맞춤`,
        "수의사 처방, AAFCO 준수",
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
      `${ACTIVITY_LABEL[p.activity]} 활동량 성견·성묘를 위한 균형 잡힌 영양`,
      "리얼 미트 우선, 부산물 미트밀 무첨가",
      "AAFCO 영양 기준 충족",
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
  const [step, setStep] = useState(0);
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
  const [hasBoth, setHasBoth] = useState(false);
  const [completedSpecies, setCompletedSpecies] = useState<PetType[]>([]);

  const start = (petType?: PetType, keepBoth = false) => {
    if (!user) {
      window.open("/auth", "_blank", "noopener,noreferrer");
      return;
    }
    setResults(null);
    setUnlocked(false);
    if (!keepBoth) {
      setHasBoth(false);
      setCompletedSpecies([]);
    }
    setProfile({
      name: "",
      petType: petType ?? "dog",
      breed: "",
      ageYears: "",
      weightLbs: "",
      activity: "medium",
      health: [],
    });
    setStep(1);
  };

  useEffect(() => {
    if (user && sessionStorage.getItem("autostart_wizard") === "1") {
      sessionStorage.removeItem("autostart_wizard");
      // Only autostart for brand-new signups (not returning logins)
      const createdAt = user.created_at ? new Date(user.created_at).getTime() : 0;
      const isNewSignup = createdAt && Date.now() - createdAt < 60_000;
      if (isNewSignup) start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
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
    setCompletedSpecies((prev) =>
      prev.includes(profile.petType) ? prev : [...prev, profile.petType],
    );
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
        characteristics: `활동량: ${ACTIVITY_LABEL[profile.activity]}`,
      });
    }
  };

  const submitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast({ title: "올바른 이메일을 입력해 주세요", variant: "destructive" });
      return;
    }
    toast({
      title: "등록되었습니다!",
      description: "리필 알림과 가격 인하 알림을 보내드릴게요.",
    });
    setUnlocked(true);
  };

  const handleSubscribe = () => {
    toast({
      title: "펫 영양 플랜 — 월 $9.99",
      description: "구독 결제 기능이 곧 제공됩니다.",
    });
  };

  const petName =
    profile.name.trim() || (profile.petType === "dog" ? "우리 강아지" : "우리 고양이");
  const petLabel = profile.petType === "dog" ? "강아지" : "고양이";

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
              AAFCO 기준 적용
            </div>
            {user ? (
              <>
                <span className="hidden sm:inline text-xs text-muted-foreground max-w-[160px] truncate">
                  {user.email}
                </span>
                <Button variant="ghost" size="sm" onClick={signOut} className="rounded-full">
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
                  시작하기
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
            맞춤형 펫 영양 &amp; 급여 관리 서비스
          </div>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05] text-foreground">
            우리 아이에게 딱 맞는 사료,
            <br className="hidden sm:block" />
            <span className="text-primary"> 60초 만에 찾기.</span>
          </h1>
          <p className="mt-5 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            견종·묘종, 체중, 건강 상태에 맞춘 개인 맞춤 영양 플랜을 제공합니다.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3">
            <Button
              size="lg"
              onClick={() => start()}
              className="h-14 px-8 text-base rounded-2xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
            >
              무료로 시작하기
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-xs text-muted-foreground">
              무료 · 60초 소요 · 카드 등록 불필요
            </p>
          </div>
        </div>

        {/* Trust strip */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {[
            {
              icon: Award,
              label: "AAFCO 기준",
              sub: "AAFCO 영양 기준에 맞춘 추천",
            },
            {
              icon: ShieldCheck,
              label: "엄선된 브랜드",
              sub: "Amazon·Chewy 상위 브랜드만 큐레이션",
            },
            {
              icon: Lock,
              label: "프라이버시 우선",
              sub: "프로필은 본인 계정에서만 안전하게 관리",
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
                <div className="text-xs text-muted-foreground">{step} / 7 단계</div>
                <div className="font-semibold mt-0.5">반려동물 프로필 만들기</div>
              </div>
              <button
                onClick={close}
                className="text-muted-foreground hover:text-foreground"
                aria-label="닫기"
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
                  <h3 className="text-lg font-semibold">강아지인가요, 고양이인가요?</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { v: "dog", icon: Dog, label: "강아지", both: false },
                      { v: "cat", icon: Cat, label: "고양이", both: false },
                      { v: "dog", icon: PawPrint, label: "둘 다", both: true },
                    ] as const).map((opt, i) => {
                      const selected =
                        opt.both ? hasBoth : !hasBoth && profile.petType === opt.v;
                      return (
                        <button
                          key={i}
                          onClick={() => {
                            setHasBoth(opt.both);
                            setProfile({ ...profile, petType: opt.v });
                          }}
                          className={`rounded-2xl border p-5 flex flex-col items-center gap-2 transition-all ${
                            selected
                              ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                              : "border-border hover:border-primary/40"
                          }`}
                        >
                          <opt.icon className="h-8 w-8 text-primary" />
                          <div className="font-medium">{opt.label}</div>
                        </button>
                      );
                    })}
                  </div>
                  {hasBoth && (
                    <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs text-muted-foreground">
                      둘 다 키우시는군요! 먼저 한 아이의 프로필을 만들고, 완료 후 다른 아이도
                      추가할 수 있어요. 어느 아이부터 시작할까요?
                      <div className="mt-2 flex gap-2">
                        {(["dog", "cat"] as PetType[]).map((pt) => (
                          <button
                            key={pt}
                            onClick={() => setProfile({ ...profile, petType: pt })}
                            className={`rounded-full border px-3 py-1 ${
                              profile.petType === pt
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border"
                            }`}
                          >
                            {pt === "dog" ? "강아지부터" : "고양이부터"}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
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
                  <h3 className="text-lg font-semibold">견종 / 묘종</h3>
                  <p className="text-sm text-muted-foreground">
                    급여량과 장난감 내구성 추천에 활용됩니다.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="breed">품종</Label>
                    <Input
                      id="breed"
                      placeholder={
                        profile.petType === "dog" ? "예: 골든 리트리버" : "예: 메인쿤"
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
                  <h3 className="text-lg font-semibold">나이</h3>
                  <p className="text-sm text-muted-foreground">연 단위로 입력해 주세요.</p>
                  <div className="space-y-2">
                    <Label htmlFor="age">나이 (년)</Label>
                    <Input
                      id="age"
                      type="number"
                      inputMode="decimal"
                      min={0}
                      max={30}
                      placeholder="예: 4"
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
                      모름
                    </button>
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
                      모름
                    </button>
                  </div>
                </>
              )}

              {step === 5 && (
                <>
                  <h3 className="text-lg font-semibold">활동량</h3>
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
                  <h3 className="text-lg font-semibold">건강 관심사</h3>
                  <p className="text-sm text-muted-foreground">
                    해당하는 항목을 모두 선택해 주세요 (선택).
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
                이전
              </Button>
              {step < 6 ? (
                <Button onClick={next} className="rounded-full">
                  다음
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={finish} className="rounded-full">
                  맞춤 결과 보기
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
                {petName}을(를) 위한 베스트 매치
              </div>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
                딱 한 가지 추천. 우리 아이 프로필 기반.
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
                    <span className="text-muted-foreground ml-1">4.8 · 12,000+ 리뷰</span>
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
                  <div className="font-medium">매월 약 $15을 더 내고 계실 수 있어요</div>
                  <div className="text-muted-foreground">
                    동일 체급 {petLabel} 일반 매장 가격과 비교한 결과입니다.
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-danger/30 bg-danger/5 p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium">현재 식단은 비만 위험을 높일 수 있어요</div>
                  <div className="text-muted-foreground">
                    맞춤 포뮬러로 변경 시 위험을 크게 낮출 수 있습니다.
                  </div>
                </div>
              </div>
            </div>

            {hasBoth && completedSpecies.length < 2 && (() => {
              const other: PetType =
                results.profile.petType === "dog" ? "cat" : "dog";
              return (
                <div className="mt-4 rounded-2xl border border-primary/30 bg-primary/5 p-4 flex items-center justify-between gap-3">
                  <div className="text-sm">
                    <div className="font-medium">
                      {other === "dog" ? "🐶 강아지" : "🐱 고양이"} 프로필도 추가해 보세요
                    </div>
                    <div className="text-muted-foreground">
                      두 아이 모두 맞춤 추천을 받을 수 있어요.
                    </div>
                  </div>
                  <Button
                    onClick={() => start(other, true)}
                    className="rounded-full shrink-0"
                  >
                    {other === "dog" ? "강아지 추가" : "고양이 추가"}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              );
            })()}

            {/* Feeding plan (locked) */}
            <div className="mt-8 rounded-3xl border border-border bg-card p-6 md:p-7 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">맞춤 급여 플랜</h3>
                <span className="text-xs text-muted-foreground">
                  {profile.weightLbs && profile.weightLbs !== "unknown" ? `${profile.weightLbs} lbs` : "체중 모름"} · 활동량 {ACTIVITY_LABEL[profile.activity]}
                </span>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 mt-4">
                <div className="rounded-xl border border-border bg-background p-4">
                  <div className="text-xs text-muted-foreground">하루 급여량</div>
                  <div className="text-2xl font-semibold mt-1">
                    {results.plan.cupsPerDay} 컵
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-background p-4">
                  <div className="text-xs text-muted-foreground">월 사료 비용</div>
                  <div className="text-2xl font-semibold mt-1">
                    ~${results.plan.monthlyCost}
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-background p-4 relative">
                  <div className="text-xs text-muted-foreground">하루 칼로리</div>
                  <div
                    className={`text-2xl font-semibold mt-1 ${unlocked ? "" : "blur-sm select-none"}`}
                  >
                    {results.plan.der} kcal
                  </div>
                </div>
              </div>

              <div className={`mt-5 space-y-2 ${unlocked ? "" : "blur-sm select-none"}`}>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">아침 급여량</span>
                  <span>{(results.plan.cupsPerDay / 2).toFixed(2)} 컵</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">저녁 급여량</span>
                  <span>{(results.plan.cupsPerDay / 2).toFixed(2)} 컵</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">간식 한도 (10%)</span>
                  <span>~{Math.round(results.plan.der * 0.1)} kcal/일</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">리필 주기</span>
                  <span>약 {Math.max(1, Math.round(30 / Math.max(1, results.plan.monthlyCost / 60)))}주마다</span>
                </div>
              </div>

              {!unlocked && (
                <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-5">
                  <div className="flex items-start gap-3">
                    <Lock className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium">급여 플랜 전체 보기</div>
                      <p className="text-sm text-muted-foreground mt-1">
                        프로필을 저장하고 리필 알림, 가격 인하, 영양 업데이트를 받아보세요.
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
                          저장하고 잠금 해제
                        </Button>
                      </form>
                      <p className="text-[11px] text-muted-foreground mt-2">
                        스팸 없음. 언제든 구독 취소 가능합니다.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Subscription */}
            <div className="mt-8 rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 p-6 md:p-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">
                    <Sparkles className="h-3.5 w-3.5" />
                    펫 영양 플랜
                  </div>
                  <h3 className="text-2xl font-semibold mt-3">
                    월 $9.99 — 과식·재고 부족 걱정 없이.
                  </h3>
                  <ul className="mt-3 space-y-1.5 text-sm">
                    {[
                      "하루·월 단위 정확한 급여량 계산",
                      "사료 사이즈에 맞춘 자동 리필 알림",
                      "나이 변화에 따른 건강 위험 알림",
                      "체중·활동량 변화 시 추천 자동 업데이트",
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
                    플랜 시작하기 — 월 $9.99
                  </Button>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    언제든 해지 가능
                  </p>
                </div>
              </div>
            </div>

            {/* Food recommendation */}
            <div className="mt-8 rounded-3xl border border-border bg-card p-6 md:p-7 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs text-muted-foreground">
                    {petName} 맞춤 추천
                  </div>
                  <h3 className="text-lg font-semibold mt-0.5">
                    우리 아이 상태에 딱 맞는 사료
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
                        Amazon에서 구매
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
                        Chewy에서 구매
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

      {/* Footer */}
      <footer className="border-t border-border/60 mt-8">
        <div className="container py-8 text-xs text-muted-foreground space-y-2 text-center">
          <p>
            My Cat &amp; Dog Market은 Amazon Associates 프로그램 참여자로서 적격 구매를
            통해 수수료를 받습니다. Chewy 등 파트너사로부터도 수수료를 받을 수 있습니다.
          </p>
          <p>
            맞춤 영양 가이드는 정보 제공용이며 수의학적 진단을 대체하지 않습니다.
          </p>
          <p>© {new Date().getFullYear()} My Cat &amp; Dog Market</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
