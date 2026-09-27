"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

type Category = {
  name: string;
  keywords: string[];
  response: string;
};

const CATEGORIES: Category[] = [
  {
    name: "physical",
    keywords: ["hit", "hits", "hitting", "pushed", "push", "punch", "slap", "beat", "beaten", "choke", "strangl"],
    response: "I'm sorry this happened. You don't deserve to be hurt. Are you somewhere safe right now, and is it safe for you to keep chatting?",
  },
  {
    name: "sexual",
    keywords: ["forced", "rape", "raped", "sexual", "assault", "assaulted", "molest", "touch me"],
    response: "I'm sorry this happened. What happened was not your fault. You do not have to share details here. Would you like help finding medical care or someone trained to support you?",
  },
  {
    name: "emotional",
    keywords: ["insult", "worthless", "humiliat", "yell", "shout", "belittle", "put me down"],
    response: "Being repeatedly insulted or humiliated can be deeply harmful. You deserve to be treated with respect. Would you like to talk about how this is affecting you, or consider support options?",
  },
  {
    name: "control",
    keywords: ["control", "checks my phone", "my money", "who i can see", "monitor", "jealous", "isolat", "won't let me"],
    response: "That sounds controlling, and it may affect your safety and independence. If your device is monitored, consider whether this chat is safe to use. We can explore options at your pace.",
  },
  {
    name: "fear_return",
    keywords: ["will happen again", "come back", "come home", "return", "threatened", "threat"],
    response: "That fear deserves to be taken seriously. Let's consider whether there is an immediate safety concern and what support could help you feel safer.",
  },
  {
    name: "anxious_trigger",
    keywords: ["anxious", "flinch", "raise their voice", "raises his voice", "jump when", "tense up"],
    response: "That sounds distressing. After frightening experiences, reminders can trigger strong reactions. Would you like to try a simple grounding exercise, or talk about finding a counsellor?",
  },
  {
    name: "flashbacks",
    keywords: ["flashback", "as if it is happening again", "as if it's happening again", "reliving", "relive"],
    response: "That sounds frightening. You don't need to describe the memory in detail. A trauma-informed mental-health professional can help you manage these experiences.",
  },
  {
    name: "nightmares",
    keywords: ["nightmare", "keep dreaming", "bad dreams", "can't sleep", "cant sleep", "can't sleep properly"],
    response: "Feeling unsafe can make sleep difficult, and nightmares can happen after trauma. You deserve support with both your safety and your wellbeing. Would you like to discuss coping strategies or speak with a professional?",
  },
  {
    name: "lost_interest",
    keywords: ["lost interest", "don't enjoy", "dont enjoy", "no motivation", "stopped caring"],
    response: "That can be hard to experience. You deserve support, and you don't have to manage it alone. Would you feel comfortable speaking with a mental-health professional?",
  },
  {
    name: "shame_blame",
    keywords: ["embarrassed", "ashamed", "my fault", "blame myself", "could have prevented", "should have", "caused it"],
    response: "You are not responsible for another person's choice to abuse or assault you. Not consenting means you did not choose what happened. You deserve care and support, without blame.",
  },
  {
    name: "anger",
    keywords: ["angry all the time", "so angry", "full of anger", "rage"],
    response: "Anger can be one response to being hurt. We can look at ways to express it safely and identify support that feels right for you.",
  },
  {
    name: "numb",
    keywords: ["feel nothing", "numb", "disconnected", "not real"],
    response: "Feeling numb or disconnected can happen after overwhelming experiences. If it is distressing or persistent, a trauma-informed professional can help you understand and manage it.",
  },
  {
    name: "cant_focus",
    keywords: ["can't focus", "cant focus", "can't concentrate", "cant concentrate", "can't study", "cant study"],
    response: "That sounds frustrating. Stress and trauma can affect concentration. We can consider small practical supports and, if you wish, ways to access professional care.",
  },
  {
    name: "trust_issues",
    keywords: ["difficult to trust", "hard to trust", "don't trust anyone", "dont trust anyone", "can't trust"],
    response: "After someone has hurt you, trust can take time. You don't have to trust everyone or share more than you're ready to. We can think about what would help you feel in control.",
  },
  {
    name: "fear_intimacy",
    keywords: ["afraid of being close", "afraid of touch", "scared of being touched", "physically close to someone"],
    response: "You have the right to set boundaries around touch and intimacy. You don't need to rush. A counsellor with trauma experience may help if you want support.",
  },
  {
    name: "overwhelmed",
    keywords: ["overwhelmed", "too much right now", "can't cope", "cant cope"],
    response: "If it feels safe, try noticing your feet on the floor, naming a few things you can see, and taking gentle, unforced breaths. If this makes you feel worse, stop. We can also identify someone you trust.",
  },
  {
    name: "setback",
    keywords: ["thought i was getting better", "everything feels difficult again", "bad day", "going backwards"],
    response: "Recovery isn't always a straight line. A difficult day doesn't erase the progress you've made. What would help you get through today safely?",
  },
  {
    name: "disbelief",
    keywords: ["nobody believe", "won't believe", "wont believe", "believe me"],
    response: "That fear can make reaching out very difficult. You deserve to be listened to respectfully. Is there one person or service you think might be safe to contact?",
  },
  {
    name: "privacy",
    keywords: ["saved", "delete", "confidential", "find out", "who will see", "private"],
    response: "I can explain how this handles information, but I can't promise absolute confidentiality. If your device is shared or monitored, privacy may also be affected. Would you like to review the privacy information first?",
  },
  {
    name: "unsure_next",
    keywords: ["don't know what to do", "dont know what to do", "what now", "what should i do"],
    response: "You don't have to decide everything now. We can start with what matters most to you: immediate safety, medical care, emotional support, or practical help.",
  },
  {
    name: "wants_out",
    keywords: ["get out", "leave him", "leave her", "end this", "escape"],
    response: "We can think through options at your pace. First, are you in immediate danger, and is it safe to use this device? We can consider a trusted person, a safe place, and specialist support.",
  },
  {
    name: "rebuild",
    keywords: ["rebuild my life", "move forward", "moving forward", "go back to school", "get back to work"],
    response: "That is an understandable goal. We can take this one step at a time and explore the areas that matter most to you - safety, health, housing, education, or emotional recovery.",
  },
  {
    name: "just_listen",
    keywords: ["just listen", "don't need advice", "dont need advice", "need someone to listen"],
    response: "I'll listen. You don't have to solve everything right now.",
  },
];

const DANGER_KEYWORDS = [
  "kill", "weapon", "gun", "knife", "going to die", "can't breathe", "cant breathe", "he's here", "hes here",
];

const FALLBACK_RESPONSE =
  "Thank you for telling me. You don't have to explain everything at once. Would you like me to listen, help you think through what you need, or explore support options?";

type Message = { sender: "bot" | "user"; text: string };

export default function SupportChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    { sender: "bot", text: FALLBACK_RESPONSE },
  ]);
  const [input, setInput] = useState("");
  const [concernNoticed, setConcernNoticed] = useState(false);
  const [ended, setEnded] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const recognitionRef = useRef<any>(null);

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
    const utter = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utter);
  }

  function handleSend(rawText?: string, viaVoice?: boolean) {
    const text = (rawText ?? input).trim();
    if (!text || ended) return;

    if (isDanger(text)) {
      setConcernNoticed(true);
    }

    const category = matchCategory(text);
    const botReply = category ? category.response : FALLBACK_RESPONSE;

    if (category && (category.name === "physical" || category.name === "sexual" || category.name === "fear_return" || category.name === "wants_out")) {
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

  const manuallyStoppedRef = useRef(false);

  function startRecognition() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input isn't supported in this browser. Try Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      if (result.isFinal) {
        const transcript = result[0].transcript;
        handleSend(transcript, true);
      }
    };

    recognition.onerror = (e: any) => {
      if (e.error !== "no-speech") {
        setListening(false);
      }
    };

    recognition.onend = () => {
      if (!manuallyStoppedRef.current) {
        recognition.start();
      } else {
        setListening(false);
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

  if (ended) {
    return (
      <div className="mx-auto max-w-md p-6 text-center">
        <h1 className="mb-4 text-lg font-medium text-zinc-900">
          Take care of yourself
        </h1>
        <p className="mb-6 text-sm text-zinc-600">
          Thank you for talking with me. Whenever you&apos;re ready, here are
          some people who can help.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push("/contacts")}
            className="rounded-lg bg-zinc-900 py-3 text-sm font-medium text-white hover:bg-zinc-800"
          >
            See support contacts
          </button>
          <button
            onClick={() => router.push("/refuge")}
            className="rounded-lg bg-zinc-100 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-200"
          >
            Find a safe place
          </button>
          <button
            onClick={() => router.push("/help")}
            className="rounded-lg bg-red-600 py-3 text-sm font-medium text-white hover:bg-red-700"
          >
            I need help now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col p-6">
      <h1 className="mb-4 text-lg font-medium text-zinc-900">Let&apos;s Talk</h1>

      {concernNoticed && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          It sounds like this might be a difficult situation. Support is
          available whenever you&apos;re ready:{" "}
          <button onClick={() => router.push("/contacts")} className="underline font-medium">
            contacts
          </button>{", "}
          <button onClick={() => router.push("/refuge")} className="underline font-medium">
            safe places
          </button>{", or "}
          <button onClick={() => router.push("/help")} className="underline font-medium text-red-700">
            get help now
          </button>.
        </div>
      )}

      <div className="mb-4 flex flex-col gap-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              "max-w-[80%] rounded-lg px-3 py-2 text-sm " +
              (m.sender === "bot"
                ? "self-start bg-zinc-100 text-zinc-800"
                : "self-end bg-zinc-900 text-white")
            }
          >
            {m.text}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type or use the mic..."
          className="flex-1 rounded border border-zinc-300 px-3 py-2 text-sm"
        />
        <button
          onClick={toggleListening}
          className={
            "rounded px-3 py-2 text-sm font-medium " +
            (listening ? "bg-red-600 text-white" : "bg-zinc-200 text-zinc-700")
          }
          title="Voice input"
        >
          {listening ? "..." : "Mic"}
        </button>
        <button
          onClick={() => handleSend()}
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Send
        </button>
      </div>

      <button
        onClick={() => setEnded(true)}
        className="mt-4 text-sm text-zinc-500 underline"
      >
        I&apos;m done talking
      </button>
    </div>
  );
}
