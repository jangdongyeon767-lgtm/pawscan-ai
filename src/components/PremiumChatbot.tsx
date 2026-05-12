import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import { Crown, Send, Sparkles, Trash2, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

const STORAGE_KEY = "petchat_messages_v1";
const FUNCTIONS_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/pet-chat`;

const EXAMPLES = [
  "5살 골든리트리버, 체중 관리에 좋은 사료 추천해줘",
  "알러지 있는 페르시안 고양이한테 맞는 간식 알려줘",
  "관절이 약한 노령견 사료 추천해줘",
];

type Props = {
  isPremium: boolean;
  onUpgradeClick: () => void;
};

export function PremiumChatbot({ isPremium, onUpgradeClick }: Props) {
  const [initialMessages] = useState<UIMessage[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const transport = useRef(new DefaultChatTransport({ api: FUNCTIONS_URL })).current;

  const { messages, sendMessage, status, setMessages } = useChat({
    id: "petchat-single",
    messages: initialMessages,
    transport,
    onError: (err) =>
      toast({
        title: "AI 응답 오류",
        description: err.message,
        variant: "destructive",
      }),
  });

  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Persist messages to localStorage
  useEffect(() => {
    if (!isPremium) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages, isPremium]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const isBusy = status === "submitted" || status === "streaming";

  const submit = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isBusy) return;
    setInput("");
    await sendMessage({ text: trimmed });
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const clearChat = () => {
    setMessages([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  return (
    <section className="container py-12 md:py-16">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-3 py-1 text-xs font-medium mb-3">
            <Crown className="h-3.5 w-3.5" />
            유료 서비스 · AI 맞춤 추천 챗봇
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            우리 아이에게 딱 맞는 사료, 챗봇이 골라드려요.
          </h2>
        </div>

        <div className="rounded-3xl border border-primary/30 bg-card shadow-sm overflow-hidden">
          {!isPremium ? (
            <div className="p-8 md:p-12 bg-gradient-to-br from-primary/5 to-primary/10 text-center">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">유료 회원 전용 기능입니다</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                반려동물의 종, 나이, 건강 상태를 알려주면 AI가 가장 적합한 사료/간식을 추천해 드려요.
              </p>
              <ul className="text-sm text-muted-foreground mt-4 space-y-1 max-w-sm mx-auto text-left">
                <li>· 무제한 맞춤 추천</li>
                <li>· 추천 이유 상세 설명</li>
                <li>· 대화 이력 저장</li>
              </ul>
              <Button onClick={onUpgradeClick} className="rounded-full mt-6">
                <Sparkles className="h-4 w-4 mr-1" />
                월 $9.99 플랜 시작하기
              </Button>
            </div>
          ) : (
            <>
              <div
                ref={scrollRef}
                className="h-[420px] overflow-y-auto p-5 space-y-4 bg-background/40"
              >
                {messages.length === 0 && (
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      이렇게 물어보세요:
                    </div>
                    {EXAMPLES.map((ex) => (
                      <button
                        key={ex}
                        onClick={() => submit(ex)}
                        className="block w-full text-left rounded-xl border border-border hover:border-primary/50 px-4 py-3 text-sm transition-all"
                      >
                        <ArrowRight className="inline h-3.5 w-3.5 mr-1.5 text-primary" />
                        {ex}
                      </button>
                    ))}
                  </div>
                )}

                {messages.map((m) => {
                  const text = m.parts
                    .map((p) => (p.type === "text" ? p.text : ""))
                    .join("");
                  if (m.role === "user") {
                    return (
                      <div key={m.id} className="flex justify-end">
                        <div className="max-w-[80%] rounded-2xl bg-primary text-primary-foreground px-4 py-2.5 text-sm whitespace-pre-wrap">
                          {text}
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={m.id} className="flex">
                      <div className="max-w-[90%] text-sm prose prose-sm dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-headings:mt-3 prose-headings:mb-1">
                        <ReactMarkdown>{text}</ReactMarkdown>
                      </div>
                    </div>
                  );
                })}

                {status === "submitted" && (
                  <div className="text-sm text-muted-foreground animate-pulse">
                    추천을 준비하는 중...
                  </div>
                )}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submit(input);
                }}
                className="border-t border-border p-3 bg-card flex items-end gap-2"
              >
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      submit(input);
                    }
                  }}
                  placeholder="우리 아이 정보를 알려주세요. 예: 3살 푸들, 알러지 있음"
                  className="min-h-[44px] max-h-32 resize-none rounded-xl"
                  disabled={isBusy}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={clearChat}
                  disabled={isBusy || messages.length === 0}
                  className="rounded-xl shrink-0"
                  aria-label="대화 비우기"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  type="submit"
                  disabled={isBusy || !input.trim()}
                  className="rounded-xl shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
