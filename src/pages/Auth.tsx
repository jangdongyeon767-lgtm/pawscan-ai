import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";

export default function Auth() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [oauthLoading, setOauthLoading] = useState<"google" | "apple" | null>(null);

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const oauth = async (provider: "google" | "apple") => {
    setOauthLoading(provider);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast({
          title: "로그인 오류",
          description: (result.error as any).message ?? "다시 시도해 주세요.",
          variant: "destructive",
        });
        setOauthLoading(null);
        return;
      }
      if (result.redirected) return;
      navigate("/");
    } catch (err: any) {
      toast({ title: "오류", description: err.message, variant: "destructive" });
      setOauthLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/60">
        <div className="container h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <PawPrint className="h-5 w-5 text-primary" />
            </div>
            <span className="font-semibold tracking-tight">My Cat &amp; Dog Market</span>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            이전
          </Button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight">로그인 / 회원가입</h1>
          <p className="text-sm text-muted-foreground mt-1">
            반려동물 프로필을 저장하고 맞춤 추천을 받아보세요.
          </p>

          <div className="mt-6 space-y-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => oauth("google")}
              disabled={!!oauthLoading}
              className="w-full h-11 rounded-xl"
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" fill="#34A853"/>
                <path d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.45.34-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.95l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" fill="#EA4335"/>
              </svg>
              {oauthLoading === "google" ? "이동 중..." : "Google로 계속하기"}
            </Button>
            <Button
              type="button"
              onClick={() => oauth("apple")}
              disabled={!!oauthLoading}
              className="w-full h-11 rounded-xl bg-black text-white hover:bg-black/90"
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M16.365 1.43c0 1.14-.46 2.23-1.21 3.02-.81.85-2.13 1.51-3.22 1.42-.13-1.1.42-2.25 1.16-3.04.83-.88 2.24-1.52 3.27-1.4zM20.5 17.34c-.55 1.27-.81 1.84-1.52 2.97-.99 1.57-2.39 3.52-4.12 3.54-1.54.02-1.94-1-4.03-.99-2.09.01-2.53 1.01-4.07.99-1.73-.02-3.05-1.78-4.04-3.35C.01 16.16-.27 11.05 1.41 8.34c1.19-1.93 3.07-3.06 4.84-3.06 1.79 0 2.92 1 4.4 1 1.43 0 2.31-1 4.39-1 1.57 0 3.24.86 4.43 2.34-3.89 2.13-3.26 7.7.93 9.72z"/>
              </svg>
              {oauthLoading === "apple" ? "이동 중..." : "Apple로 계속하기"}
            </Button>
          </div>

          <p className="mt-6 text-[11px] text-muted-foreground text-center">
            계속하면 서비스 약관 및 개인정보 처리방침에 동의하는 것으로 간주됩니다.
          </p>
        </div>
      </main>
    </div>
  );
}
