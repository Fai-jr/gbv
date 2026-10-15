"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import { useLang } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { ESCALATE, fallback, findCategory, greeting, isDanger, replyFor, speechTag } from "@/lib/chatbot";
import {
  ShieldCheck,
  Lock,
  Send,
  Mic,
  Volume2,
  VolumeX,
  Headset,
  Phone,
  MessageCircle,
  Stethoscope,
  ShieldAlert,
  CheckCircle2,
  Flower2,
  Home as HomeIcon,
  Luggage,
  Heart,
  X,
} from "lucide-react";

type BotMsg = { sender: "bot"; kind: "greeting" | "fallback" | "category"; category?: string };
type UserMsg = { sender: "user"; text: string };
type Message = BotMsg | UserMsg;

const SUGGESTIONS = [
  { label: "Talk to a trained person", icon: Headset, href: "/contacts" },
  { label: "Find temporary shelter", icon: HomeIcon, href: "/refuge" },
  { label: "Emergency medical care (72h)", icon: Stethoscope, href: "/rights" },
  { label: "Prepare a safe departure", icon: Luggage, href: "/refuge" },
];

const VOICE_ERRORS: Record<string, string> = {
  unsupported: "Voice input isn't supported in this browser. Try Chrome.",
  blocked: "Microphone access is blocked. Allow the microphone for this site in your browser settings, then try again.",
  nomic: "No microphone was found on this device.",
  network: "Voice input could not reach your browser's speech service. Check your internet connection, or type your message instead.",
  language: "This browser cannot understand voice input in this language. You can type your message instead.",
  other: "Voice input stopped unexpectedly. You can try again, or type your message.",
};

function errorKind(code: string) {
  if (code === "not-allowed" || code === "service-not-allowed") return "blocked";
  if (code === "audio-capture") return "nomic";
  if (code === "network") return "network";
  if (code === "language-not-supported") return "language";
  return "other";
}

function botText(m: BotMsg, l: Lang) {
  if (m.kind === "greeting") return greeting(l);
  if (m.kind === "fallback") return fallback(l);
  return replyFor(m.category || "", l);
}

export default function SupportChatPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { t, lang } = useLang();
  const [messages, setMessages] = useState<Message[]>([{ sender: "bot", kind: "greeting" }]);
  const [input, setInput] = useState("");
  const [interim, setInterim] = useState("");
  const [concernNoticed, setConcernNoticed] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [speakerOn, setSpeakerOn] = useState(false);
  const [humanContact, setHumanContact] = useState<{ name: string; phone: string } | null>(null);

  const recognitionRef = useRef<any>(null);
  const wantListeningRef = useRef(false);
  const speakingRef = useRef(false);
  const speakerOnRef = useRef(false);
  const langRef = useRef<Lang>("en");
  const bottomRef = useRef<HTMLDivElement>(null);
  const sendRef = useRef<(raw?: string) => void>(() => {});

  useEffect(() => {
    sendRef.current = handleSend;
  });

  useEffect(() => {
    langRef.current = lang;
    const r = recognitionRef.current;
    if (r && wantListeningRef.current) {
      r.lang = speechTag(lang);
      try {
        r.abort();
      } catch {}
    }
  }, [lang]);

  useEffect(() => {
    return () => {
      wantListeningRef.current = false;
      try {
        recognitionRef.current?.abort();
      } catch {}
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    if (authLoading || !user) return;
    async function fetchContact() {
      try {
        const q = query(collection(db, "services"), where("type", "==", "psychosocial"), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const d = snap.docs[0].data() as { name: string; phone: string };
          setHumanContact({ name: d.name, phone: d.phone });
        }
      } catch (err) {
        console.error("Could not load a human contact:", err);
      }
    }
    fetchContact();
  }, [authLoading, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function speak(text: string) {
    if (typeof window === "undefined" || !window.speechSynthesis || !speakerOnRef.current) return;
    const resume = recognitionRef.current !== null && wantListeningRef.current;
    speakingRef.current = true;
    try {
      recognitionRef.current?.abort();
    } catch {}
    window.speechSynthesis.cancel();

    let finished = false;
    let safety: number | undefined;
    const finish = () => {
      if (finished) return;
      finished = true;
      if (safety !== undefined) window.clearTimeout(safety);
      window.setTimeout(() => {
        speakingRef.current = false;
        if (resume && wantListeningRef.current) startRecognition();
      }, 500);
    };
    safety = window.setTimeout(finish, Math.min(25000, 3000 + text.length * 90));

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = speechTag(langRef.current);
    utter.onend = finish;
    utter.onerror = finish;
    window.speechSynthesis.speak(utter);
  }

  function handleSend(raw?: string) {
    const text = (raw ?? (input || interim)).trim();
    if (!text) return;
    const l = langRef.current;
    const category = findCategory(text, l);
    if (isDanger(text) || (category && ESCALATE.includes(category))) setConcernNoticed(true);

    const reply: BotMsg = category
      ? { sender: "bot", kind: "category", category }
      : { sender: "bot", kind: "fallback" };
    setMessages((prev) => [...prev, { sender: "user", text }, reply]);
    setInput("");
    setInterim("");
    speak(botText(reply, l));
  }

  function startRecognition() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      wantListeningRef.current = false;
      setListening(false);
      setVoiceError("unsupported");
      return;
    }
    const recognition = new SR();
    recognition.lang = speechTag(langRef.current);
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onstart = () => {
      setListening(true);
      setVoiceError("");
    };
    recognition.onresult = (event: any) => {
      if (speakingRef.current) return;
      let partial = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) {
          partial = "";
          sendRef.current(r[0].transcript);
        } else {
          partial += r[0].transcript;
        }
      }
      setInterim(partial);
    };
    recognition.onerror = (e: any) => {
      if (e.error === "no-speech" || e.error === "aborted") return;
      wantListeningRef.current = false;
      setListening(false);
      setInterim("");
      setVoiceError(errorKind(e.error));
    };
    recognition.onend = () => {
      if (recognitionRef.current !== recognition) return;
      if (!wantListeningRef.current) {
        setListening(false);
        return;
      }
      if (speakingRef.current) return;
      try {
        recognition.start();
      } catch {}
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (err) {
      console.error("Could not start voice input:", err);
      wantListeningRef.current = false;
      setListening(false);
      setVoiceError("other");
    }
  }

  function stopListening() {
    wantListeningRef.current = false;
    try {
      recognitionRef.current?.stop();
    } catch {}
    setListening(false);
    setInterim("");
  }

  function toggleListening() {
    if (listening || wantListeningRef.current) {
      stopListening();
      return;
    }
    setVoiceError("");
    setSpeakerOn(true);
    speakerOnRef.current = true;
    wantListeningRef.current = true;
    startRecognition();
  }

  function toggleSpeaker() {
    const next = !speakerOn;
    setSpeakerOn(next);
    speakerOnRef.current = next;
    if (!next && typeof window !== "undefined") window.speechSynthesis?.cancel();
  }

  function endChat() {
    if (!window.confirm(t("End this conversation? What was typed here will be erased."))) return;
    stopListening();
    window.speechSynthesis?.cancel();
    setMessages([{ sender: "bot", kind: "greeting" }]);
    setInput("");
    setConcernNoticed(false);
    router.push("/");
  }

  return (
    <>
      <SiteHeader active="/support" />
      <main className="w-full pt-32 pb-24 bg-surface-container-low">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-10 py-6 flex flex-col gap-6">
          <div className="w-full bg-surface-container-lowest rounded-xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-tertiary-fixed flex items-center justify-center shrink-0 text-on-tertiary-fixed shadow-sm">
                <ShieldCheck size={26} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-semibold text-on-surface">{t("Confidential Support Chat")}</h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    {t("Not saved or sent anywhere")}
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant mt-0.5">
                  {t("What you type here is not saved or sent anywhere, and it disappears when you close this page. You stay in control throughout.")}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <section className="lg:col-span-8 flex flex-col bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden min-h-[560px]">
              <div className="px-6 py-4 bg-surface-container-low flex items-center justify-between gap-3">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                    <Heart size={22} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-on-surface">{t("Support Assistant")}</span>
                      <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant text-xs">
                        {t("Automated • not a live person")}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface-variant">{t("Anonymous • GBVConnect Cameroon")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="hidden sm:flex items-center gap-1 text-on-surface-variant text-sm">
                    <Lock size={18} />
                    {t("Private session")}
                  </span>
                  <button
                    onClick={endChat}
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container text-primary text-sm font-semibold hover:bg-surface-container-high transition-colors"
                  >
                    <X size={16} />
                    <span className="hidden sm:inline">{t("End conversation")}</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[520px]">
                {messages.map((m, i) =>
                  m.sender === "bot" ? (
                    <div key={i} className="flex items-start gap-3 max-w-[88%]">
                      <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0 mt-1">
                        <Heart size={14} />
                      </div>
                      <div className="bg-surface-container-low text-on-surface p-4 rounded-2xl rounded-tl-sm shadow-sm leading-relaxed">
                        {botText(m, lang)}
                      </div>
                    </div>
                  ) : (
                    <div key={i} className="flex justify-end">
                      <div className="max-w-[80%] bg-primary-container text-on-primary p-4 rounded-2xl rounded-tr-sm shadow-sm">{m.text}</div>
                    </div>
                  )
                )}

                {concernNoticed && (
                  <div className="w-full bg-notice-bg rounded-xl p-4 flex items-start gap-3 shadow-sm">
                    <Flower2 size={22} className="text-notice-text shrink-0 mt-0.5" />
                    <div className="text-notice-text text-sm leading-relaxed">
                      {t("A moment to breathe: this topic can bring up strong feelings. You never have to answer everything. Support is available whenever you're ready. See the options on this page, or keep talking at your own pace.")}
                    </div>
                  </div>
                )}

                <div className="pl-10 pt-1 flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => router.push(s.href)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-surface-container hover:bg-surface-container-high text-primary text-sm transition-all shadow-sm text-left"
                    >
                      <s.icon size={16} className="text-tertiary" />
                      {t(s.label)}
                    </button>
                  ))}
                </div>
                <div ref={bottomRef} />
              </div>

              <div className="p-4 bg-surface-container-lowest">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-1 bg-surface-container-low rounded-xl px-3 py-1.5 focus-within:bg-surface-container-lowest focus-within:shadow-md transition-all"
                >
                  <button
                    onClick={toggleListening}
                    type="button"
                    title={listening ? t("Stop voice input") : t("Voice input")}
                    className={
                      "p-2 rounded-lg transition-colors " +
                      (listening ? "bg-secondary text-on-secondary" : "text-on-surface-variant hover:text-primary")
                    }
                  >
                    <Mic size={20} />
                  </button>
                  <button
                    onClick={toggleSpeaker}
                    type="button"
                    title={speakerOn ? t("Stop reading replies aloud") : t("Read replies aloud")}
                    className={"p-2 rounded-lg transition-colors " + (speakerOn ? "text-primary" : "text-on-surface-variant hover:text-primary")}
                  >
                    {speakerOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
                  </button>
                  <input
                    type="text"
                    value={input || interim}
                    onChange={(e) => {
                      setInterim("");
                      setInput(e.target.value);
                    }}
                    autoComplete="off"
                    enterKeyHint="send"
                    placeholder={t("Type your message here...")}
                    className="flex-1 min-w-0 bg-transparent py-2.5 px-1 text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="h-11 px-5 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-semibold flex items-center gap-2 transition-all shadow-sm"
                  >
                    <span>{t("Send")}</span>
                    <Send size={18} />
                  </button>
                </form>
                <div className="flex flex-col gap-1 px-1 pt-2 text-on-surface-variant text-xs">
                  {listening && (
                    <span className="flex items-center gap-1.5 text-secondary font-semibold">
                      <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                      {t("Listening... speak now")}
                    </span>
                  )}
                  {voiceError && <span className="text-error font-semibold">{t(VOICE_ERRORS[voiceError])}</span>}
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={14} className="text-tertiary" />
                    {t("Nothing is saved • Press Escape 3 times to exit")}
                  </span>
                  <span>{t("Voice uses your browser's speech service, which may send your audio to its provider. Typing stays on this device.")}</span>
                </div>
              </div>
            </section>

            <aside className="lg:col-span-4 flex flex-col gap-4">
              <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                    <Headset size={20} />
                  </span>
                  <h2 className="text-lg font-semibold text-on-surface">{t("Talk to a Real Person")}</h2>
                </div>
                <p className="text-sm text-on-surface-variant mb-4 leading-relaxed">
                  {t("Prefer to speak with a person? You can call the national helpline.")}
                </p>
                <div className="flex flex-col gap-2">
                  <a href="tel:116" className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-primary-container text-on-primary font-semibold hover:bg-primary transition-all shadow-sm">
                    <div className="flex items-center gap-2">
                      <Phone size={20} />
                      <span>{t("National Helpline 116")}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-surface-container-lowest/20 rounded text-xs">{t("Free to call")}</span>
                  </a>
                  {humanContact && (
                    <a href={"https://wa.me/" + humanContact.phone.replace(/[^0-9]/g, "")} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-surface-container text-primary font-semibold hover:bg-surface-container-high transition-all">
                      <div className="flex items-center gap-2">
                        <MessageCircle size={20} className="text-emerald-700" />
                        <span>{t("WhatsApp")}</span>
                      </div>
                      <span className="text-on-surface-variant text-xs">{humanContact.name}</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="bg-surface-container rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center">
                    <Stethoscope size={20} />
                  </span>
                  <h2 className="text-lg font-semibold text-on-surface">{t("72-Hour Medical Window")}</h2>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {t("After sexual violence, HIV prevention (PEP) should start within 72 hours, and emergency contraception works best the sooner it is taken.")}
                </p>
                <div className="mt-3 bg-surface-container-lowest/60 rounded-lg p-3">
                  <p className="text-sm text-on-surface">{t("Important: emergency care should not require a police report first.")}</p>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                    <ShieldAlert size={20} />
                  </span>
                  <h2 className="text-lg font-semibold text-on-surface">{t("Your Digital Safety")}</h2>
                </div>
                <ul className="space-y-2 text-sm text-on-surface-variant">
                  {[
                    "Private browsing: use a private window so this visit is not kept in your browser history.",
                    "Quick exit: press Escape three times, or use the Quick Exit button at the top, to leave instantly.",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 size={18} className="text-emerald-700 shrink-0 mt-0.5" />
                      <span>{t(item)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="px-2 py-1 text-center text-on-surface-variant/80 text-xs">
                {t("Organisations active in this space include MINPROFF, ALVF, Horizons Femmes, and UN Women Cameroon.")}
              </div>
            </aside>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
