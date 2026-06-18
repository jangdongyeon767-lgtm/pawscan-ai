import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import { Crown, Send, Sparkles, Trash2, Lock, ArrowRight, Check, Bell, Cat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

const STORAGE_KEY = "petchat_messages_v1";
const FUNCTIONS_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/pet-chat`;
const AMAZON_TAG = "mycatdogmarket-20";
// Ensure every amazon.com URL in assistant text carries our affiliate tag
const withAmazonTag = (text: string) =>
  text.replace(/https?:\/\/(www\.)?amazon\.[a-z.]+\/[^\s)]*/gi, (url) => {
    try {
      const u = new URL(url);
      u.searchParams.set("tag", AMAZON_TAG);
      return u.toString();
    } catch {
      return url;
    }
  });

const EXAMPLES = [
  "Recommend a weight-management food for my 5-year-old Persian cat",
  "What food is best for a Russian Blue with allergies?",
  "Suggest a food for a senior cat with kidney issues",
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
        title: "AI response error",
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
            Coming soon · AI cat food recommendation chatbot
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            The perfect food for your cat, hand-picked by our chatbot.
          </h2>
        </div>

        <div className="rounded-3xl border border-primary/30 bg-card shadow-sm overflow-hidden">
          {!isPremium ? (
            <div id="subscription-cta" className="p-6 md:p-10 bg-gradient-to-br from-primary/5 to-primary/10 scroll-mt-24">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">
                    <Sparkles className="h-3.5 w-3.5" />
                    Early-bird pre-order
                  </div>
                  <h3 className="text-2xl font-semibold mt-3 flex items-center gap-2 flex-wrap">
                    <Cat className="h-5 w-5 text-primary" />
                    <span className="line-through text-muted-foreground text-lg">$12.99/mo</span>
                    <span>Pre-order price $6.99/mo locked for life</span>
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-md">
                    Launch price <span className="line-through">$12.99/mo</span> → pre-order now and pay just <span className="text-primary font-semibold">$6.99/mo</span> for life. Our AI recommends food tailored to your cat's age, weight, and health.
                  </p>
                  <ul className="mt-4 space-y-1.5 text-sm">
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
                <div className="md:text-right shrink-0">
                  <Button
                    size="lg"
                    onClick={onUpgradeClick}
                    className="h-12 rounded-2xl px-6 shadow-md shadow-primary/30"
                  >
                    <Bell className="h-4 w-4 mr-1" />
                    Pre-order — $6.99 for life
                  </Button>
                  <p className="text-[11px] text-muted-foreground mt-2">Limited spots · No card required</p>
                </div>
              </div>
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
                      Try asking:
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
                        <ReactMarkdown>{withAmazonTag(text)}</ReactMarkdown>
                      </div>
                    </div>
                  );
                })}

                {status === "submitted" && (
                  <div className="text-sm text-muted-foreground animate-pulse">
                    Preparing your recommendation...
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
                  placeholder="Tell us about your cat. e.g. 3-year-old Persian with allergies"
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
                  aria-label="Clear conversation"
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
