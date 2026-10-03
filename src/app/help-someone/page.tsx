"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import {
  Phone,
  EyeOff,
  TriangleAlert,
  Eye,
  Users,
  HeartPulse,
  Info,
  BadgeCheck,
  Heart,
  KeyRound,
  Ban,
  MessageSquare,
  Home as HomeIcon,
  Package,
  Hourglass,
  Share2,
  Copy,
  MessageCircle,
  CheckCircle2,
  Compass,
} from "lucide-react";

const MODULES = [
  { id: 1, label: "1. Recognise the signs" },
  { id: 2, label: "2. What to say and avoid" },
  { id: 3, label: "3. A discreet safety plan" },
  { id: 4, label: "4. Verified referrals" },
];

const SIGNS = [
  {
    icon: Eye,
    title: "Control and restriction",
    body: "She has to ask permission for ordinary outings, gets constant calls checking where she is, or has lost free access to her phone and her money (including mobile money).",
    hint: "A clue: she panics whenever her phone buzzes.",
  },
  {
    icon: Users,
    title: "Growing isolation",
    body: "She suddenly cancels tontines, choir, or family gatherings, drifts away from childhood friends, and keeps finding reasons not to receive visitors.",
    hint: "A clue: her circle of friends slowly shrinks.",
  },
  {
    icon: HeartPulse,
    title: "Physical signs and constant alertness",
    body: "Clothes that hide the body in hot weather, injuries explained as accidents, deep tiredness, low self-esteem, and hesitating before she speaks.",
    hint: "A clue: unexplained changes in how she dresses.",
  },
];

const SAY = [
  {
    icon: BadgeCheck,
    title: "Offer unconditional belief",
    quote: "\u201cI believe you. None of this is your fault, and nothing justifies someone hurting you.\u201d",
    why: "The person hurting her often tells her she is to blame. A caring outside voice can loosen that hold.",
  },
  {
    icon: Heart,
    title: "Promise presence without a deadline",
    quote: "\u201cYou are not alone. I am here whenever you feel ready, however long it takes. You never need to feel ashamed with me.\u201d",
    why: "She often fears being a burden, or being judged if she does not act straight away.",
  },
  {
    icon: KeyRound,
    title: "Give her the control back",
    quote: "\u201cWhat would help you feel safe right now? You decide every step.\u201d",
    why: "It restores her sense of choice after being denied it.",
  },
];

const AVOID = [
  {
    title: "Don't downplay how hard leaving is",
    quote: "\u201cWhy don't you just pack your things and go?\u201d",
    why: "The period around leaving can be the most dangerous. It ignores money, threats to the children, and legal dependence.",
  },
  {
    title: "Don't act in her place or threaten the abuser",
    quote: "\u201cI'm going to talk to him, or tell his family, and sort him out!\u201d",
    why: "It can lead to harsher punishment of her once you have gone. Never act without her informed agreement.",
  },
  {
    title: "Don't doubt her word",
    quote: "\u201cAre you sure you're not exaggerating? He is so respected around here...\u201d",
    why: "People who abuse often keep a spotless public image. Doubt can close the door on her telling anyone again.",
  },
];

const STEPS = [
  {
    icon: MessageSquare,
    title: "An agreed code phrase",
    body: "Choose an ordinary phrase for WhatsApp or SMS (for example, \u201cDid you find my cookbook?\u201d). It means: \u201cI need you to come, or to call for help.\u201d",
    tip: "Avoid the words \u201cpolice\u201d or \u201chelp\u201d in writing.",
  },
  {
    icon: HomeIcon,
    title: "A neutral place to go",
    body: "Identify a reliable refuge: your home, a distant relative the abuser does not know, or a community or church space. Avoid the obvious places he would check first.",
    tip: "Check how to get in at night, ahead of time.",
  },
  {
    icon: Package,
    title: "An emergency bag",
    body: "Keep a bag for her at your home: copies of her ID and the children's papers, prescriptions, a new SIM card, spare keys, and a little cash.",
    tip: "Digital copies can be sent to a safe email address.",
  },
  {
    icon: Hourglass,
    title: "Respect her pace",
    body: "If she stays, or goes back, do not cut contact out of disappointment. Isolation is what the person abusing her wants. Stay a steady, gentle presence.",
    tip: "No blame. Kindness protects.",
  },
];

const SELF_CHECK = [
  {
    text: "I don't press her for the violent details",
    why: "Asking her to retell it again and again can bring the distress back.",
  },
  {
    text: "I accept her feelings, even if she still shows love or confusion",
    why: "The cycle of abuse creates complicated emotional bonds.",
  },
  {
    text: "I respect her timeline without lecturing",
    why: "Decisions like this often take time, and may take more than one attempt.",
  },
  {
    text: "I look after my own wellbeing so I can stay steady",
    why: "Supporting someone is draining. A helpline can support you too.",
  },
];

type Service = { id: string; name: string; type: string; region: string; phone: string };

export default function HelpSomeonePage() {
  const { loading: authLoading } = useAuth();
  const [active, setActive] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    async function load() {
      try {
        const snap = await getDocs(query(collection(db, "services"), limit(4)));
        setServices(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Service, "id">) })));
      } catch (err) {
        console.error("Could not load services:", err);
      }
    }
    load();
  }, [authLoading]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  const [pageUrl, setPageUrl] = useState("");

  useEffect(() => {
    setPageUrl(window.location.href);
  }, []);

  const waShare = pageUrl
    ? "https://wa.me/?text=" +
      encodeURIComponent("Something useful I wanted to share with you: " + pageUrl)
    : "#";

  const reflected = Object.values(checked).filter(Boolean).length;

  return (
    <>
      <SiteHeader active="/help-someone" />
      <main className="w-full pt-32 pb-24 bg-surface-container-low">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-10 py-8 flex flex-col gap-8">
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-8 relative overflow-hidden rounded-xl bg-surface-container-lowest p-6 sm:p-8 shadow-sm">
              <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-primary-fixed/30 blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="px-3 py-1 rounded-full bg-surface-container text-tertiary font-semibold">
                    Guide for friends and allies
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-on-surface-variant">
                    <EyeOff size={16} />
                    Discreet reading: no account needed
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-semibold text-primary leading-tight">
                  How to support a friend or sister experiencing violence
                </h1>
                <p className="text-lg text-on-surface-variant leading-relaxed">
                  Watching someone you love suffer often brings helplessness and the urge to rush in. Yet
                  listening without judgement and respecting her pace are the first acts of protection. Keep
                  remembering: she is the only expert on her own life and her own safety.
                </p>
              </div>
            </div>
            <div className="lg:col-span-4 rounded-xl bg-primary text-on-primary p-6 shadow-md flex flex-col justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider opacity-80">24/7 helpline</span>
                <p className="text-3xl font-semibold mt-1">116 (toll-free)</p>
                <p className="text-sm opacity-90 mt-2">
                  Free, anonymous, reachable across Cameroon (MTN, Orange, Camtel). You can call for advice
                  as the supporter, too.
                </p>
              </div>
              <a href="tel:116" className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-surface-container-lowest text-primary font-semibold hover:bg-surface transition-colors">
                <Phone size={18} />
                Call 116 now
              </a>
            </div>
          </section>

          <section className="rounded-xl bg-notice-bg text-notice-text p-5 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#FDE68A] flex items-center justify-center shrink-0">
              <TriangleAlert size={22} />
            </div>
            <div>
              <p className="font-bold">Important for her safety</p>
              <p className="leading-relaxed">
                Never confront the person hurting her, and never act behind her back. Anything done without
                her informed agreement (reporting for her, warning his family, passing information on) can
                sharply raise the risk of retaliation against her and her children. Keep communication
                discreet and delete message histories.
              </p>
            </div>
          </section>

          <nav className="flex flex-wrap gap-2">
            {MODULES.map((m) => (
              <button
                key={m.id}
                onClick={() => setActive(m.id)}
                className={
                  "px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all " +
                  (active === m.id
                    ? "bg-primary-container text-on-primary"
                    : "bg-surface-container-lowest text-on-surface-variant hover:text-on-surface")
                }
              >
                {m.label}
              </button>
            ))}
          </nav>

          {active === 1 && (
            <section className="flex flex-col gap-5">
              <div>
                <h2 className="text-2xl font-semibold text-primary">Recognising the warning signs</h2>
                <p className="text-on-surface-variant mt-1">
                  Abuse and coercive control often set in quietly. These are things you may notice in her
                  daily life, without questioning her.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {SIGNS.map((s) => (
                  <div key={s.title} className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col gap-3">
                    <div className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                      <s.icon size={22} />
                    </div>
                    <h3 className="text-lg font-semibold text-primary">{s.title}</h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{s.body}</p>
                    <p className="mt-auto flex items-start gap-2 text-sm text-tertiary font-semibold">
                      <Info size={16} className="shrink-0 mt-0.5" />
                      {s.hint}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {active === 2 && (
            <section className="flex flex-col gap-5">
              <div>
                <h2 className="text-2xl font-semibold text-primary">What to say and what to avoid</h2>
                <p className="text-on-surface-variant mt-1">
                  Every word counts. A badly chosen remark, even a well-meant one, can bring the guilt back
                  and deepen her isolation.
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="flex flex-col gap-4">
                  <span className="text-sm font-bold text-available-text uppercase tracking-wider">Helpful words</span>
                  {SAY.map((s) => (
                    <div key={s.title} className="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-primary font-semibold">
                        <s.icon size={20} className="text-available-text" />
                        {s.title}
                      </div>
                      <p className="italic text-on-surface bg-available-bg/60 rounded-lg p-3">{s.quote}</p>
                      <p className="text-sm text-on-surface-variant">
                        <strong>Why it helps:</strong> {s.why}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-4">
                  <span className="text-sm font-bold text-full-text uppercase tracking-wider">Words to avoid</span>
                  {AVOID.map((s) => (
                    <div key={s.title} className="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-primary font-semibold">
                        <Ban size={20} className="text-full-text" />
                        {s.title}
                      </div>
                      <p className="italic text-on-surface bg-full-bg/60 rounded-lg p-3">{s.quote}</p>
                      <p className="text-sm text-on-surface-variant">
                        <strong>Why it harms:</strong> {s.why}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {active === 3 && (
            <section className="flex flex-col gap-5">
              <div>
                <h2 className="text-2xl font-semibold text-primary">Build a discreet safety plan together</h2>
                <p className="text-on-surface-variant mt-1">
                  A safety plan is not about forcing an immediate escape. It is about preparing real
                  alternatives for each risky situation, with her.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {STEPS.map((s, i) => (
                  <div key={s.title} className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                        <s.icon size={22} />
                      </div>
                      <span className="text-xs uppercase tracking-wider text-tertiary font-bold">
                        Step {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-primary">{s.title}</h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{s.body}</p>
                    <p className="mt-auto flex items-start gap-2 text-sm text-tertiary font-semibold">
                      <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                      {s.tip}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {active === 4 && (
            <section className="flex flex-col gap-5">
              <div>
                <h2 className="text-2xl font-semibold text-primary">Pointing her to verified help</h2>
                <p className="text-on-surface-variant mt-1">
                  You do not have to be her psychologist or lawyer. These contacts are verified by GBVConnect
                  administrators.
                </p>
              </div>
              {services.length === 0 && (
                <p className="text-on-surface-variant">No contacts to show yet. Try the full directory.</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {services.map((s) => (
                  <div key={s.id} className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-tertiary font-semibold">{s.region}</span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-available-text bg-available-bg px-2.5 py-0.5 rounded-full">
                        <BadgeCheck size={14} />
                        Verified
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-primary">{s.name}</h3>
                    <p className="text-sm text-on-surface-variant capitalize">{s.type}</p>
                    <a href={"tel:" + s.phone} className="mt-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary-container text-on-primary font-semibold hover:bg-primary transition-colors">
                      <Phone size={18} />
                      {s.phone}
                    </a>
                  </div>
                ))}
              </div>
              <a href="/contacts" className="self-start inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-surface-container-lowest text-primary font-semibold shadow-sm hover:bg-surface-container transition-colors">
                <Compass size={18} />
                Explore the full directory
              </a>
            </section>
          )}

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col gap-3">
              <div className="flex items-center gap-2 text-primary font-semibold text-lg">
                <Share2 size={20} />
                Share this guide discreetly
              </div>
              <p className="text-sm text-on-surface-variant">
                Send the link with an ordinary message, so it does not raise questions if someone sees it.
              </p>
              <div className="flex flex-wrap gap-2">
                <button onClick={copyLink} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container text-primary font-semibold hover:bg-surface-container-high transition-colors">
                  <Copy size={18} />
                  {copied ? "Link copied" : "Copy link"}
                </button>
                <a href={waShare} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container text-primary font-semibold hover:bg-surface-container-high transition-colors">
                  <MessageCircle size={18} className="text-emerald-700" />
                  Send via WhatsApp
                </a>
              </div>
              <p className="text-xs text-on-surface-variant">
                If you share a device, open this guide in a private window or clear it from your history.
              </p>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-primary font-semibold text-lg">Check your approach</span>
                <span className="text-sm text-on-surface-variant">{reflected} of {SELF_CHECK.length}</span>
              </div>
              <p className="text-sm text-on-surface-variant">Does my attitude really support her freedom?</p>
              <ul className="flex flex-col gap-2">
                {SELF_CHECK.map((c, i) => (
                  <li key={c.text}>
                    <label className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!checked[i]}
                        onChange={(e) => setChecked((prev) => ({ ...prev, [i]: e.target.checked }))}
                        className="mt-1 w-5 h-5 accent-[#4A3B52]"
                      />
                      <span className="flex flex-col">
                        <span className="text-sm font-semibold text-on-surface">{c.text}</span>
                        <span className="text-xs text-on-surface-variant">{c.why}</span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
