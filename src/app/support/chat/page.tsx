"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import {
  ShieldCheck,
  Lock,
  Send,
  Mic,
  Headset,
  Phone,
  MessageCircle,
  Stethoscope,
  ShieldAlert,
  CheckCircle2,
  Flower2,
  Home as HomeIcon,
  Luggage,
} from "lucide-react";

type Category = {
  name: string;
  keywords: string[];
  response: string;
};

const CATEGORIES: Category[] = [
  { name: "physical", keywords: ["hit", "hits", "hitting", "pushed", "push", "punch", "slap", "beat", "beaten", "choke", "strangl"], response: "I'm sorry this happened. You don't deserve to be hurt. Are you somewhere safe right now, and is it safe for you to keep chatting?" },
  { name: "sexual", keywords: ["forced", "rape", "raped", "sexual", "assault", "assaulted", "molest", "touch me"], response: "I'm sorry this happened. What happened was not your fault. You do not have to share details here. Would you like help finding medical care or someone trained to support you?" },
  { name: "emotional", keywords: ["insult", "worthless", "humiliat", "yell", "shout", "belittle", "put me down"], response: "Being repeatedly insulted or humiliated can be deeply harmful. You deserve to be treated with respect. Would you like to talk about how this is affecting you, or consider support options?" },
  { name: "control", keywords: ["control", "checks my phone", "my money", "who i can see", "monitor", "jealous", "isolat", "won't let me"], response: "That sounds controlling, and it may affect your safety and independence. If your device is monitored, consider whether this chat is safe to use. We can explore options at your pace." },
  { name: "fear_return", keywords: ["will happen again", "come back", "come home", "return", "threatened", "threat"], response: "That fear deserves to be taken seriously. Let's consider whether there is an immediate safety concern and what support could help you feel safer." },
  { name: "anxious_trigger", keywords: ["anxious", "flinch", "raise their voice", "raises his voice", "jump when", "tense up"], response: "That sounds distressing. After frightening experiences, reminders can trigger strong reactions. Would you like to try a simple grounding exercise, or talk about finding a counsellor?" },
  { name: "flashbacks", keywords: ["flashback", "as if it is happening again", "as if it's happening again", "reliving", "relive"], response: "That sounds frightening. You don't need to describe the memory in detail. A trauma-informed mental-health professional can help you manage these experiences." },
  { name: "nightmares", keywords: ["nightmare", "keep dreaming", "bad dreams", "can't sleep", "cant sleep", "can't sleep properly"], response: "Feeling unsafe can make sleep difficult, and nightmares can happen after trauma. You deserve support with both your safety and your wellbeing. Would you like to discuss coping strategies or speak with a professional?" },
  { name: "lost_interest", keywords: ["lost interest", "don't enjoy", "dont enjoy", "no motivation", "stopped caring"], response: "That can be hard to experience. You deserve support, and you don't have to manage it alone. Would you feel comfortable speaking with a mental-health professional?" },
  { name: "shame_blame", keywords: ["embarrassed", "ashamed", "my fault", "blame myself", "could have prevented", "should have", "caused it"], response: "You are not responsible for another person's choice to abuse or assault you. You deserve care and support, without blame." },
  { name: "anger", keywords: ["angry all the time", "so angry", "full of anger", "rage"], response: "Anger can be one response to being hurt. We can look at ways to express it safely and identify support that feels right for you." },
  { name: "numb", keywords: ["feel nothing", "numb", "disconnected", "not real"], response: "Feeling numb or disconnected can happen after overwhelming experiences. If it is distressing or persistent, a trauma-informed professional can help you understand and manage it." },
  { name: "cant_focus", keywords: ["can't focus", "cant focus", "can't concentrate", "cant concentrate", "can't study", "cant study"], response: "That sounds frustrating. Stress and trauma can affect concentration. We can consider small practical supports and, if you wish, ways to access professional care." },
  { name: "trust_issues", keywords: ["difficult to trust", "hard to trust", "don't trust anyone", "dont trust anyone", "can't trust"], response: "After someone has hurt you, trust can take time. You don't have to trust everyone or share more than you're ready to. We can think about what would help you feel in control." },
  { name: "fear_intimacy", keywords: ["afraid of being close", "afraid of touch", "scared of being touched", "physically close to someone"], response: "You have the right to set boundaries around touch and intimacy. You don't need to rush. A counsellor with trauma experience may help if you want support." },
  { name: "overwhelmed", keywords: ["overwhelmed", "too much right now", "can't cope", "cant cope"], response: "If it feels safe, try noticing your feet on the floor, naming a few things you can see, and taking gentle, unforced breaths. If this makes you feel worse, stop. We can also identify someone you trust." },
  { name: "setback", keywords: ["thought i was getting better", "everything feels difficult again", "bad day", "going backwards"], response: "Recovery isn't always a straight line. A difficult day doesn't erase the progress you've made. What would help you get through today safely?" },
  { name: "disbelief", keywords: ["nobody believe", "won't believe", "wont believe", "believe me"], response: "That fear can make reaching out very difficult. You deserve to be listened to respectfully. Is there one person or service you think might be safe to contact?" },
  { name: "privacy", keywords: ["saved", "delete", "confidential", "find out", "who will see", "private"], response: "I can explain how this handles information, but I can't promise absolute confidentiality. If your device is shared or monitored, privacy may also be affected. Would you like to review the privacy information first?" },
  { name: "unsure_next", keywords: ["don't know what to do", "dont know what to do", "what now", "what should i do"], response: "You don't have to decide everything now. We can start with what matters most to you: immediate safety, medical care, emotional support, or practical help." },
  { name: "wants_out", keywords: ["get out", "leave him", "leave her", "end this", "escape"], response: "We can think through options at your pace. First, are you in immediate danger, and is it safe to use this device? We can consider a trusted person, a safe place, and specialist support." },
  { name: "rebuild", keywords: ["rebuild my life", "move forward", "moving forward", "go back to school", "get back to work"], response: "That is an understandable goal. We can take this one step at a time and explore the areas that matter most to you - safety, health, housing, education, or emotional recovery." },
  { name: "just_listen", keywords: ["just listen", "don't need advice", "dont need advice", "need someone to listen"], response: "I'll listen. You don't have to solve everything right now." },
];

const DANGER_KEYWORDS = ["kill", "weapon", "gun", "knife", "going to die", "can't breathe", "cant breathe", "he's here", "hes here"];

const FALLBACK_RESPONSE =
  "Thank you for telling me. You don't have to explain everything at once. Would you like me to listen, help you think through what you need, or explore support options?";

const SUGGESTIONS = [
  { label: "Talk to a trained person", icon: Headset, href: "/contacts" },
  { label: "Find temporary shelter", icon: HomeIcon, href: "/refuge" },
  { label: "Emergency medical care (72h)", icon: Stethoscope, href: "/rights" },
  { label: "Prepare a safe departure", icon: Luggage, href: "/refuge" },
];

type Message = { sender: "bot" | "user"; text: string };

export default function SupportChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text:
        "Hello, I'm here to listen. Everything you share stays anonymous, and nothing is saved on your device. Take all the time you need. How are you feeling right now?",
    },
  ]);
  const [input, setInput] = useState("");
  const [concernNoticed, setConcernNoticed] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [humanContact, setHumanContact] = useState<{ name: string; phone: string } | null>(null);
  const recognitionRef = useRef<any>(null);
  const manuallyStoppedRef = useRef(false);
  const speakingRef = useRef(false);

  useEffect(() => {
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
  }, []);

  function matchCategory(text: string): Category | null {
    const lower = text.toLowerCase();
    return CATEGORIES.find((c) => c.keywords.some((k) => lower.includes(k))) || null;
  }

  function isDanger(text: string) {
    const lower = text.toLowerCase();
    return DANGER_KEYWORDS.some((k) => lower.includes(k));
  }

  function speak(text: string, force?: boolean) {
    if ((!voiceOn && !force) || typeof window === "undefined" || !window.speechSynthesis) return;
    const wasListening = !manuallyStoppedRef.current && recognitionRef.current !== null;
    speakingRef.current = true;
    try {
      recognitionRef.current?.abort();
    } catch {}
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const finish = () => {
      setTimeout(() => {
        speakingRef.current = false;
        if (wasListening && !manuallyStoppedRef.current) startRecognition();
      }, 500);
    };
    utter.onend = finish;
    utter.onerror = finish;
    window.speechSynthesis.speak(utter);
  }

  function handleSend(rawText?: string, viaVoice?: boolean) {
    const text = (rawText ?? input).trim();
    if (!text) return;

    if (isDanger(text)) setConcernNoticed(true);

    const category = matchCategory(text);
    const botReply = category ? category.response : FALLBACK_RESPONSE;

    if (
      category &&
      ["physical", "sexual", "fear_return", "wants_out"].includes(category.name)
    ) {
      setConcernNoticed(true);
    }

    setMessages((prev) => [
      ...prev,
      { sender: "user", text },
      { sender: "bot", text: botReply },
    ]);
    setInput("");
    speak(botReply, viaVoice);
  }

  function startRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input isn't supported in this browser. Try Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      if (speakingRef.current) return;
      const result = event.results[event.results.length - 1];
      if (result.isFinal) handleSend(result[0].transcript, true);
    };
    recognition.onerror = (e: any) => {
      if (e.error !== "no-speech" && e.error !== "aborted") setListening(false);
    };
    recognition.onend = () => {
      if (manuallyStoppedRef.current) {
        setListening(false);
      } else if (!speakingRef.current) {
        try {
          recognition.start();
        } catch {}
      }
    };
    recognitionRef.current = recognition;
    manuallyStoppedRef.current = false;
    recognition.start();
    setListening(true);
  }

  function toggleListening() {
    if (listening) {
      manuallyStoppedRef.current = true;
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    startRecognition();
  }

  return (
    <>
      <SiteHeader active="/support/chat" />
      <main className="w-full pt-32 pb-24 bg-surface-container-low">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-10 py-6 flex flex-col gap-6">
          <div className="w-full bg-surface-container-lowest rounded-xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-tertiary-fixed flex items-center justify-center shrink-0 text-on-tertiary-fixed shadow-sm">
                  <ShieldCheck size={26} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-semibold text-on-surface">Confidential Support Chat</h1>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                      No local trace kept
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant mt-0.5">
                    This session writes nothing to your device&apos;s history or storage. You stay in control
                    throughout.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <section className="lg:col-span-8 flex flex-col bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden min-h-[560px]">
              <div className="px-6 py-4 bg-surface-container-low flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-lg font-semibold">
                      S
                    </div>
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-600 shadow-[0_0_0_2px_#ffffff]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-on-surface">Support Assistant</span>
                      <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant text-xs">
                        Scripted &bull; not a live person
                      </span>
                    </div>
                    <p className="text-sm text-on-surface-variant">Anonymous &bull; GBVConnect Cameroon</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-on-surface-variant">
                  <Lock size={20} />
                  <span className="text-sm hidden sm:inline">Anonymous session</span>
                </div>
              </div>

              <div className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[520px]">
                {messages.map((m, i) => (
                  <div key={i} className={m.sender === "bot" ? "flex items-start gap-3 max-w-[88%]" : "flex justify-end"}>
                    {m.sender === "bot" ? (
                      <>
                        <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0 mt-1 text-sm font-bold">
                          S
                        </div>
                        <div className="bg-surface-container-low text-on-surface p-4 rounded-2xl rounded-tl-sm shadow-sm leading-relaxed">
                          {m.text}
                        </div>
                      </>
                    ) : (
                      <div className="max-w-[80%] bg-primary-container text-on-primary p-4 rounded-2xl rounded-tr-sm shadow-sm">
                        {m.text}
                      </div>
                    )}
                  </div>
                ))}

                {concernNoticed && (
                  <div className="w-full bg-notice-bg rounded-xl p-4 flex items-start gap-3 shadow-sm">
                    <Flower2 size={22} className="text-notice-text shrink-0 mt-0.5" />
                    <div className="text-notice-text text-sm leading-relaxed">
                      <strong>A moment to breathe:</strong> This topic can bring up strong feelings. You never
                      have to answer everything. Support is available whenever you&apos;re ready &mdash; see the
                      options to the right, or keep talking at your own pace.
                    </div>
                  </div>
                )}

                <div className="pl-10 pt-1 flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => router.push(s.href)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-surface-container hover:bg-surface-container-high text-primary text-sm transition-all shadow-sm text-left"
                    >
                      <s.icon size={16} className="text-tertiary" />
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-surface-container-lowest">
                <div className="flex items-center gap-2 bg-surface-container-low rounded-xl px-4 py-1.5 focus-within:bg-surface-container-lowest focus-within:shadow-md transition-all">
                  <button
                    onClick={toggleListening}
                    type="button"
                    title="Voice input"
                    className={"p-2 rounded-lg transition-colors " + (listening ? "text-secondary" : "text-on-surface-variant hover:text-primary")}
                  >
                    <Mic size={20} />
                  </button>
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type your message here, in confidence..."
                    className="flex-1 bg-transparent py-2.5 text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none"
                  />
                  <button
                    onClick={() => handleSend()}
                    type="button"
                    className="h-11 px-5 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-semibold flex items-center gap-2 transition-all shadow-sm"
                  >
                    <span>Send</span>
                    <Send size={18} />
                  </button>
                </div>
                <div className="flex items-center justify-between px-1 pt-2 text-on-surface-variant text-xs">
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={14} className="text-tertiary" />
                    Nothing saved locally &bull; Press Escape 3 times to exit
                  </span>
                </div>
              </div>
            </section>

            <aside className="lg:col-span-4 flex flex-col gap-4">
              <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                    <Headset size={20} />
                  </span>
                  <h2 className="text-lg font-semibold text-on-surface">Talk to a Real Person</h2>
                </div>
                <p className="text-sm text-on-surface-variant mb-4 leading-relaxed">
                  Prefer a trained person instead? The national hotline is free, 24/7, and confidential.
                </p>
                <div className="flex flex-col gap-2">
                  <a
                    href="tel:116"
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-primary-container text-on-primary font-semibold hover:bg-primary transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Phone size={20} />
                      <span>National Helpline 116</span>
                    </div>
                    <span className="px-2 py-0.5 bg-surface-container-lowest/20 rounded text-xs">Free 24/7</span>
                  </a>
                  {humanContact && (
                    <a
                      href={"https://wa.me/" + humanContact.phone.replace(/[^0-9]/g, "")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-surface-container text-primary font-semibold hover:bg-surface-container-high transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <MessageCircle size={20} className="text-emerald-700" />
                        <span>WhatsApp</span>
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
                  <h2 className="text-lg font-semibold text-on-surface">72-Hour Medical Window</h2>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  After sexual violence, HIV prevention (PEP) and emergency contraception work best within{" "}
                  <strong>72 hours</strong>.
                </p>
                <div className="mt-3 pt-3 bg-surface-container-lowest/60 rounded-lg p-3">
                  <p className="text-sm text-on-surface">
                    <span className="font-bold">Important:</span> Emergency care should not require a police
                    report first.
                  </p>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                    <ShieldAlert size={20} />
                  </span>
                  <h2 className="text-lg font-semibold text-on-surface">Your Digital Safety</h2>
                </div>
                <ul className="space-y-2 text-sm text-on-surface-variant">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={18} className="text-emerald-700 shrink-0 mt-0.5" />
                    <span>
                      <strong>Private browsing:</strong> use an incognito tab so this search isn&apos;t kept in
                      your browser history.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={18} className="text-emerald-700 shrink-0 mt-0.5" />
                    <span>
                      <strong>Quick exit:</strong> press Escape three times, or use the Quick Exit button in the
                      header, to leave instantly.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="px-2 py-1 text-center text-on-surface-variant/80 text-xs">
                Organisations active in this space include MINPROFF, ALVF, Horizons Femmes, and UN Women
                Cameroon.
              </div>
            </aside>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
