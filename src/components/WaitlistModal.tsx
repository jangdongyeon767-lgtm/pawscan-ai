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
  .email({ message: "Please enter a valid email" })
  .max(255);

type Props = {
  open: boolean;
  onClose: () => void;
  defaultEmail?: string;
};

export function WaitlistModal({ open, onClose, defaultEmail = "" }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState(defaultEmail);
  const [waitlistId, _setWaitlistId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  void waitlistId;

  useEffect(() => {
    if (open) {
      setStep(1);
      setEmail(defaultEmail);
      _setWaitlistId(null);
    }
  }, [open, defaultEmail]);


  if (!open) return null;

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast({
        title: "Check your email",
        description: parsed.error.issues[0].message,
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    // NOTE: don't use .select() here — anon has no SELECT on waitlist (admin-only).
    const { error } = await supabase
      .from("waitlist")
      .insert({ email: parsed.data, clicked_payment: false });
    setSubmitting(false);
    if (error && error.code !== "23505") {
      toast({
        title: "Pre-order failed",
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
    const { error } = await supabase.rpc("mark_waitlist_clicked", {
      _email: parsed.data,
    });
    setSubmitting(false);
    if (error) {
      console.error("mark_waitlist_clicked failed:", error);
      toast({
        title: "Couldn't save your choice",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
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
            <div className="font-semibold text-sm">PurrPick Pre-order</div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close"
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
                  Early-bird lifetime price
                </div>
                <h3 className="text-xl font-semibold tracking-tight">
                  We'll let you know the moment we launch 🐱
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Launch price{" "}
                  <span className="line-through">$12.99/mo</span> → pre-order
                  now and pay just{" "}
                  <span className="text-primary font-semibold">$6.99/mo</span> for life
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
                  {submitting ? "Submitting..." : "Pre-order now"}
                </Button>
                <p className="text-[11px] text-muted-foreground text-center">
                  No spam. Just launch alerts and your lifetime-price details.
                </p>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-center">
                <div className="text-4xl mb-2">🎉</div>
                <h3 className="text-xl font-semibold tracking-tight">
                  Pre-order confirmed!
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  One more thing… want to lock in your lifetime price right now?
                </p>
              </div>
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 text-center">
                <div className="text-sm">
                  After launch it'll be{" "}
                  <span className="line-through text-muted-foreground">
                    $12.99/mo
                  </span>
                  ,
                </div>
                <div className="text-base font-semibold text-primary mt-1">
                  but lock it in now for $6.99/mo for life
                </div>
              </div>
              <Button
                onClick={confirmPayment}
                disabled={submitting}
                className="w-full rounded-xl h-12"
              >
                <CreditCard className="h-4 w-4 mr-1" />
                Lock in $6.99 lifetime price
              </Button>
              <button
                onClick={onClose}
                className="w-full text-xs text-muted-foreground hover:text-foreground"
              >
                Maybe later
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <div className="text-center py-4">
                <div className="text-5xl mb-3">🐱</div>
                <h3 className="text-xl font-semibold tracking-tight">
                  Launching soon!
                </h3>
                <p className="text-sm text-muted-foreground mt-3">
                  You'll be the first to hear when we're ready. Thanks for your interest!
                </p>
              </div>
              <Button onClick={onClose} className="w-full rounded-xl h-12">
                <Check className="h-4 w-4 mr-1" />
                Got it
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
