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
  const [hasBoth, setHasBoth] = useState(false);
  const [completedSpecies, setCompletedSpecies] = useState<PetType[]>([]);
  const [petsOpen, setPetsOpen] = useState(false);
  const [pets, setPets] = useState<any[]>([]);
  const [editingPet, setEditingPet] = useState<any | null>(null);
  const [petsLoading, setPetsLoading] = useState(false);

  const loadPets = async () => {
    if (!user) return;
    setPetsLoading(true);
    const { data, error } = await supabase
      .from("pet_profiles")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setPetsLoading(false);
    if (error) {
      toast({ title: "불러오기 실패", description: error.message, variant: "destructive" });
      return;
    }
    setPets(data ?? []);
  };

  const openPets = async () => {
    setPetsOpen(true);
    setEditingPet(null);
    await loadPets();
  };

  const savePetEdit = async () => {
    if (!editingPet) return;
    const { error } = await supabase
      .from("pet_profiles")
      .update({
        name: editingPet.name || null,
        pet_type: editingPet.pet_type,
        breed: editingPet.breed || null,
        age_stage: editingPet.age_stage || "adult",
        weight: editingPet.weight || null,
        goal: editingPet.goal || "general",
        health_concerns: editingPet.health_concerns ?? [],
        characteristics: editingPet.characteristics || null,
      })
      .eq("id", editingPet.id);
    if (error) {
      toast({ title: "저장 실패", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "수정되었습니다" });
    setEditingPet(null);
    await loadPets();
  };

  const deletePet = async (id: string) => {
    const { error } = await supabase.from("pet_profiles").delete().eq("id", id);
    if (error) {
      toast({ title: "삭제 실패", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "삭제되었습니다" });
    await loadPets();
  };

  const start = (_petType?: PetType, _keepBoth = false) => {
    if (!user) {
      window.open("/auth", "_blank", "noopener,noreferrer");
      return;
    }
    setResults(null);
    setUnlocked(false);
    setHasBoth(false);
    setCompletedSpecies([]);
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
      const { error: insertErr } = await supabase.from("pet_profiles").insert({
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
      if (insertErr) {
        console.error("pet_profiles insert error", insertErr);
        toast({
          title: "저장 실패",
          description: insertErr.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "저장되었습니다",
          description: "마이펫에서 언제든 수정할 수 있어요.",
        });
        await loadPets();
      }
    } else {
      toast({
        title: "로그인이 필요합니다",
        description: "프로필을 저장하려면 로그인해 주세요.",
        variant: "destructive",
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

  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsPremium(false);
      setPets([]);
      return;
    }
    supabase
      .from("profiles")
      .select("is_premium")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setIsPremium(!!data?.is_premium));
    loadPets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const hasPets = pets.length > 0;
  const showPetManagerCta = !!user;

  const scrollToUpgrade = () => {
    setWaitlistOpen(true);
  };

  const handleSubscribe = () => {
    setWaitlistOpen(true);
  };

  const petName = profile.name.trim() || "우리 고양이";
  const petLabel = "고양이";

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
              WhiskerWell
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
              <Award className="h-4 w-4 text-primary" />
              AAFCO 영양 가이드라인에 따른 데이터 매칭
            </div>
            {user ? (
              <>
                <span className="hidden sm:inline text-xs text-muted-foreground max-w-[160px] truncate">
                  {user.email}
                </span>
                <Button variant="ghost" size="sm" onClick={openPets} className="rounded-full">
                  <Cat className="h-4 w-4 mr-1" />
                  내 고양이
                </Button>
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
                  onClick={() => setWaitlistOpen(true)}
                  className="rounded-full"
                >
                  사전예약하기
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
            <Award className="h-3.5 w-3.5 text-primary" />
            AAFCO 영양 기준으로 매칭되는 고양이 사료
          </div>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05] text-foreground">
            우리 고양이한테 딱 맞는 사료를,
            <br className="hidden sm:block" />
            <span className="text-primary"> 제일 싸게.</span>
          </h1>
          <p className="mt-5 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            AAFCO 영양 기준으로 우리 고양이에 맞는 사료를 찾고, Amazon·Chewy 최저가까지 한눈에.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3">
            <Button
              size="lg"
              onClick={() => setWaitlistOpen(true)}
              className="h-14 px-8 text-base rounded-2xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
            >
              <Bell className="mr-2 h-5 w-5" />
              사전예약하기 — 평생 $6.99/월
            </Button>
            <p className="text-xs text-muted-foreground">
              출시가 <span className="line-through">$12.99/월</span> → 지금 사전예약하면 평생 <span className="text-primary font-semibold">$6.99/월</span> · 카드 등록 불필요
            </p>
            {showPetManagerCta && (
              <button
                onClick={openPets}
                className="text-xs text-primary underline-offset-4 hover:underline mt-2"
              >
                내 고양이 프로필 관리하기 →
              </button>
            )}
          </div>
        </div>

        {/* Trust strip */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {[
            {
              icon: Award,
              label: "AAFCO 데이터 매칭",
              sub: "AAFCO 영양 가이드라인에 따른 데이터 매칭",
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
                  <h3 className="text-lg font-semibold">우리 고양이를 알려주세요</h3>
                  <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 flex items-center gap-3">
                    <Cat className="h-8 w-8 text-primary" />
                    <div className="text-sm">
                      <div className="font-medium">고양이 사료 추천</div>
                      <div className="text-muted-foreground text-xs">
                        WhiskerWell은 고양이 전용 사료 추천 서비스예요.
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <Label htmlFor="petName">이름 (선택)</Label>
                    <Input
                      id="petName"
                      placeholder="예: 나비"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      maxLength={40}
                    />
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <h3 className="text-lg font-semibold">묘종</h3>
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

              {step === 7 && (
                <>
                  <h3 className="text-lg font-semibold">이대로 저장할까요?</h3>
                  <p className="text-sm text-muted-foreground">
                    입력하신 내용을 확인해 주세요. 저장 후에도 프로필에서 언제든 수정할 수 있어요.
                  </p>
                  <div className="rounded-2xl border border-border bg-secondary/30 divide-y divide-border">
                    {[
                      { label: "종류", value: profile.petType === "dog" ? "강아지" : "고양이" },
                      { label: "이름", value: profile.name || "—" },
                      { label: "품종", value: profile.breed || "—" },
                      {
                        label: "나이",
                        value:
                          profile.ageYears === "unknown" || !profile.ageYears
                            ? "모름"
                            : `${profile.ageYears}년`,
                      },
                      {
                        label: "체중",
                        value:
                          profile.weightLbs === "unknown" || !profile.weightLbs
                            ? "모름"
                            : `${profile.weightLbs} lbs`,
                      },
                      { label: "활동량", value: ACTIVITY_LABEL[profile.activity] },
                      {
                        label: "건강 관심사",
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
                    저장 후 상단 메뉴의 <span className="font-medium text-foreground">내 펫</span>에서 언제든 수정할 수 있습니다.
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
                이전
              </Button>
              {step < 7 ? (
                <Button onClick={next} className="rounded-full">
                  다음
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={finish} className="rounded-full">
                  <Check className="h-4 w-4 mr-1" />
                  이대로 저장하기
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
            <div id="subscription-cta" className="mt-8 rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 p-6 md:p-8 shadow-sm scroll-mt-24">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">
                    <Sparkles className="h-3.5 w-3.5" />
                    얼리버드 사전예약
                  </div>
                  <h3 className="text-2xl font-semibold mt-3 flex items-center gap-2 flex-wrap">
                    <span className="line-through text-muted-foreground text-lg">$9.99/월</span>
                    <span>사전예약가 $6.99/월 평생 고정</span>
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    출시 시 $9.99 → 지금 예약하면 평생 $6.99
                  </p>
                  <ul className="mt-3 space-y-1.5 text-sm">
                    {[
                      "AI 맞춤 사료 추천 (나이·체중·건강 기반)",
                      "내가 먹이는 사료 최저가 알림 (Amazon·Chewy·Walmart)",
                      "사료 리필 타이밍 알림",
                      "가격 인하 시 즉시 알림",
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
                    사전예약하기 — 평생 $6.99
                  </Button>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    선착순 · 카드 등록 없이 시작
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

      {/* My Pets modal */}
      {petsOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card shadow-xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div>
                <div className="font-semibold">내 펫</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {editingPet ? "프로필 수정" : "저장된 반려동물 프로필"}
                </div>
              </div>
              <button
                onClick={() => {
                  setPetsOpen(false);
                  setEditingPet(null);
                }}
                className="text-muted-foreground hover:text-foreground"
                aria-label="닫기"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {petsLoading && (
                <div className="text-sm text-muted-foreground">불러오는 중...</div>
              )}

              {!petsLoading && !editingPet && pets.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-8">
                  아직 저장된 펫이 없어요. 아래 버튼으로 추가해 보세요.
                </div>
              )}

              {!editingPet && (
                <Button
                  onClick={() => {
                    setPetsOpen(false);
                    setEditingPet(null);
                    start();
                  }}
                  className="w-full rounded-xl"
                >
                  + 새 펫 추가하기
                </Button>
              )}

              {!editingPet &&
                pets.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-2xl border border-border p-4 flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        {p.pet_type === "dog" ? (
                          <Dog className="h-5 w-5 text-primary" />
                        ) : (
                          <Cat className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="text-sm">
                        <div className="font-semibold">
                          {p.name || (p.pet_type === "dog" ? "이름 없는 강아지" : "이름 없는 고양이")}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {p.breed || "품종 미입력"} ·{" "}
                          {p.age_stage && p.age_stage !== "unknown" ? `${p.age_stage}년` : "나이 모름"} ·{" "}
                          {p.weight && p.weight !== "unknown" ? `${p.weight} lbs` : "체중 모름"}
                        </div>
                        {p.health_concerns?.length > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {p.health_concerns.join(", ")}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full h-8"
                        onClick={() => setEditingPet({ ...p })}
                      >
                        수정
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-full h-8 text-destructive hover:text-destructive"
                        onClick={() => deletePet(p.id)}
                      >
                        삭제
                      </Button>
                    </div>
                  </div>
                ))}

              {editingPet && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {(["dog", "cat"] as PetType[]).map((pt) => (
                      <button
                        key={pt}
                        onClick={() => setEditingPet({ ...editingPet, pet_type: pt })}
                        className={`rounded-xl border p-3 flex items-center justify-center gap-2 transition-all ${
                          editingPet.pet_type === pt
                            ? "border-primary bg-primary/5"
                            : "border-border"
                        }`}
                      >
                        {pt === "dog" ? <Dog className="h-4 w-4" /> : <Cat className="h-4 w-4" />}
                        {pt === "dog" ? "강아지" : "고양이"}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Label>이름</Label>
                    <Input
                      value={editingPet.name ?? ""}
                      onChange={(e) => setEditingPet({ ...editingPet, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>품종</Label>
                    <Input
                      value={editingPet.breed ?? ""}
                      onChange={(e) => setEditingPet({ ...editingPet, breed: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>나이 (년)</Label>
                      <Input
                        value={editingPet.age_stage === "unknown" ? "" : editingPet.age_stage ?? ""}
                        placeholder="모름은 비워두기"
                        onChange={(e) => setEditingPet({ ...editingPet, age_stage: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>체중 (lbs)</Label>
                      <Input
                        value={editingPet.weight === "unknown" ? "" : editingPet.weight ?? ""}
                        placeholder="모름은 비워두기"
                        onChange={(e) => setEditingPet({ ...editingPet, weight: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>건강 관심사</Label>
                    <div className="flex flex-wrap gap-2">
                      {HEALTH_OPTIONS.map((h) => {
                        const on = (editingPet.health_concerns ?? []).includes(h);
                        return (
                          <button
                            key={h}
                            type="button"
                            onClick={() =>
                              setEditingPet({
                                ...editingPet,
                                health_concerns: on
                                  ? (editingPet.health_concerns ?? []).filter((x: string) => x !== h)
                                  : [...(editingPet.health_concerns ?? []), h],
                              })
                            }
                            className={`rounded-full border px-3 py-1 text-xs ${
                              on
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border"
                            }`}
                          >
                            {h}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-border flex items-center justify-end gap-2">
              {editingPet ? (
                <>
                  <Button variant="ghost" onClick={() => setEditingPet(null)} className="rounded-full">
                    취소
                  </Button>
                  <Button onClick={savePetEdit} className="rounded-full">
                    <Check className="h-4 w-4 mr-1" />
                    저장
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setPetsOpen(false)}
                  className="rounded-full"
                >
                  닫기
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Free: cat food price comparison */}
      <CategoryPriceTable />

      {/* Pre-order: AI chatbot */}
      <PremiumChatbot isPremium={isPremium} onUpgradeClick={scrollToUpgrade} />

      {/* Waitlist modal */}
      <WaitlistModal
        open={waitlistOpen}
        onClose={() => setWaitlistOpen(false)}
        defaultEmail={user?.email ?? ""}
      />

      {/* Footer */}
      <footer className="border-t border-border/60 mt-8">
        <div className="container py-8 text-xs text-muted-foreground space-y-2 text-center">
          <p>
            WhiskerWell은 Amazon Associates 프로그램 참여자로서 적격 구매를
            통해 수수료를 받습니다. Chewy 등 파트너사로부터도 수수료를 받을 수 있습니다.
          </p>
          <p>
            맞춤 영양 가이드는 정보 제공용이며 수의학적 진단을 대체하지 않습니다.
          </p>
          <p>© {new Date().getFullYear()} WhiskerWell</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
