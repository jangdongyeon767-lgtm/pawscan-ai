import { useEffect, useState } from "react";
import { X, Mail, Cat, Check, Sparkles, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .email({ message: "올바른 이메일을 입력해 주세요" })
  .max(255);

type Props = {
  open: boolean;
  onClose: () => void;
  defaultEmail?: string;
};

export function WaitlistModal({ open, onClose, defaultEmail = "" }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState(defaultEmail);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setStep(1);
      setEmail(defaultEmail);
    }
  }, [open, defaultEmail]);

  if (!open) return null;

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast({
        title: "이메일 확인",
        description: parsed.error.issues[0].message,
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase
      .from("waitlist")
      .insert({ email: parsed.data, clicked_payment: false });
    setSubmitting(false);
    // Ignore unique-violation (already signed up) — proceed to next step regardless
    if (error && error.code !== "23505") {
      toast({
        title: "사전예약 실패",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    setStep(2);
  };

  const confirmPayment = async () => {
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setStep(3);
      return;
    }
    setSubmitting(true);
    await supabase
      .from("waitlist")
      .update({ clicked_payment: true })
      .eq("email", parsed.data);
    setSubmitting(false);
    setStep(3);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl bg-card overflow-hidden shadow-2xl border border-border">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Cat className="h-4 w-4 text-primary" />
            </div>
            <div className="font-semibold text-sm">WhiskerWell 사전예약</div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label="닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {step === 1 && (
            <>
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium mb-3">
                  <Sparkles className="h-3.5 w-3.5" />
                  얼리버드 평생가
                </div>
                <h3 className="text-xl font-semibold tracking-tight">
                  사전예약하고 평생 $6.99/월 확정
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  출시되면 정가 $9.99이지만, 지금 사전예약하시면 평생{" "}
                  <span className="text-primary font-medium">$6.99/월</span>{" "}
                  고정 가격을 보장해드려요.
                </p>
              </div>
              <form onSubmit={submitEmail} className="space-y-2">
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="rounded-xl h-12"
                  maxLength={255}
                />
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl h-12"
                >
                  <Mail className="h-4 w-4 mr-1" />
                  {submitting ? "등록 중..." : "사전예약하기"}
                </Button>
                <p className="text-[11px] text-muted-foreground text-center">
                  스팸 없음. 출시 알림과 평생가 안내만 보내드려요.
                </p>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-center">
                <div className="text-4xl mb-2">🎉</div>
                <h3 className="text-xl font-semibold tracking-tight">
                  사전예약 완료!
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  출시되면 가장 먼저 알려드릴게요.
                </p>
              </div>
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
                <div className="text-sm font-medium">
                  지금 $6.99 평생가를 확정하시겠어요?
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  결제 정보를 등록하시면 출시 후에도 평생 $6.99/월이 보장됩니다.
                  (출시 전까지는 결제되지 않아요.)
                </p>
              </div>
              <Button
                onClick={confirmPayment}
                disabled={submitting}
                className="w-full rounded-xl h-12"
              >
                <CreditCard className="h-4 w-4 mr-1" />
                결제하고 확정하기
              </Button>
              <button
                onClick={onClose}
                className="w-full text-xs text-muted-foreground hover:text-foreground"
              >
                나중에 할게요
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <div className="text-center py-4">
                <div className="text-5xl mb-3">🐱</div>
                <h3 className="text-xl font-semibold tracking-tight">
                  곧 출시됩니다!
                </h3>
                <p className="text-sm text-muted-foreground mt-3">
                  준비되면 가장 먼저 연락드릴게요. 관심 가져주셔서 감사해요.
                </p>
              </div>
              <Button onClick={onClose} className="w-full rounded-xl h-12">
                <Check className="h-4 w-4 mr-1" />
                확인
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
