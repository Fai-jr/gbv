"use client";

import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import {
  Gavel,
  ShieldCheck,
  Headset,
  Flower2,
  Phone,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

type Category = "all" | "physical" | "medical" | "protection" | "family" | "cyber";

const FILTERS: { key: Category; label: string }[] = [
  { key: "all", label: "All topics" },
  { key: "physical", label: "Physical & intimate-partner violence" },
  { key: "medical", label: "Sexual violence & the 72-hour window" },
  { key: "protection", label: "Reporting & protection" },
  { key: "family", label: "Children & family" },
  { key: "cyber", label: "Harassment & online abuse" },
];

type FAQ = {
  category: Category;
  number: string;
  question: string;
  source: string;
  body: React.ReactNode;
};

const FAQS: FAQ[] = [
  {
    category: "medical",
    number: "01",
    question: "Do I have to file a police report before I can get emergency medical care?",
    source: "WHO clinical guidance on care for survivors of violence",
    body: (
      <>
        <div className="p-4 rounded-xl bg-surface-container text-primary leading-relaxed">
          <p className="font-bold text-secondary mb-1">No. Emergency care should not be conditional on a report.</p>
          <p>
            Good practice, reflected in WHO guidance, is that urgent medical care should never be withheld
            because a survivor has not reported to police. Some specific time-sensitive treatments matter:
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-on-surface-variant text-sm">
          <div className="p-4 rounded-xl bg-surface-container-low">
            <span className="font-semibold text-primary block mb-1">Within 72 hours</span>
            HIV post-exposure prevention (PEP) and treatment of injuries, if needed.
          </div>
          <div className="p-4 rounded-xl bg-surface-container-low">
            <span className="font-semibold text-primary block mb-1">Within 120 hours</span>
            Emergency contraception, where she wants it.
          </div>
          <div className="p-4 rounded-xl bg-surface-container-low">
            <span className="font-semibold text-primary block mb-1">Documentation</span>
            A trained provider can record findings that may help later if she chooses to pursue a case.
          </div>
        </div>
        <p className="text-sm text-on-surface-variant">
          Confirm current practice at the facility you go to &mdash; this can vary, and we recommend checking
          with a local legal advisor for anything specific to your situation.
        </p>
      </>
    ),
  },
  {
    category: "protection",
    number: "02",
    question: "Is rape a crime in Cameroon, and what does the law say?",
    source: "Cameroon Penal Code, Article 296",
    body: (
      <>
        <p className="leading-relaxed">
          Yes. Rape is a criminal offence under the Cameroon Penal Code (Article 296), punishable by five to
          ten years&apos; imprisonment. Beyond this, international assessments have noted gaps in Cameroonian
          law: there is no standalone law specifically covering violence against women, no explicit
          criminalisation of marital rape, and no standalone sexual-harassment law in the country&apos;s legal
          framework as currently documented.
        </p>
        <div className="p-4 rounded-xl bg-surface-container-low text-sm text-on-surface-variant">
          A legal advisor can explain what this means for your specific situation, and what evidence or steps
          might help if you choose to pursue a case &mdash; you are not required to decide this immediately.
        </div>
      </>
    ),
  },
  {
    category: "protection",
    number: "03",
    question: "Do I need to report to the police to get help?",
    source: "General good practice, not a legal requirement",
    body: (
      <p className="leading-relaxed">
        No. You can access medical care, counselling, and shelter without filing a police report. Reporting is
        your choice, and you can take whatever time you need to decide. If you do want to report, a legal
        advisor or trusted organisation can help you understand the process beforehand.
      </p>
    ),
  },
  {
    category: "family",
    number: "04",
    question: "What about my children, and are there duties to report if they are involved?",
    source: "General principle; confirm specifics with a local advisor",
    body: (
      <p className="leading-relaxed">
        If children have witnessed or experienced violence, support services generally work to protect them
        alongside you. In many contexts, professionals have obligations to report certain situations involving
        children &mdash; ask any service you contact what their specific reporting duties are, so you know what
        to expect before you share details.
      </p>
    ),
  },
  {
    category: "physical",
    number: "05",
    question: "What counts as abuse, beyond physical violence?",
    source: "Recognised patterns of abuse (Duluth power and control model)",
    body: (
      <>
        <p className="leading-relaxed mb-2">
          Abuse is often a pattern of control, not only physical violence. This can include:
        </p>
        <ul className="list-none space-y-1 text-sm text-on-surface-variant">
          <li className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-tertiary mt-0.5 shrink-0" />
            <span>Threats, intimidation, or destroying your belongings</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-tertiary mt-0.5 shrink-0" />
            <span>Insults, humiliation, or being made to feel worthless</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-tertiary mt-0.5 shrink-0" />
            <span>Being denied access to money, work, or household income</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-tertiary mt-0.5 shrink-0" />
            <span>Being isolated from family, friends, or support</span>
          </li>
        </ul>
      </>
    ),
  },
  {
    category: "cyber",
    number: "06",
    question: "What if the harassment is happening online, by text, or on WhatsApp?",
    source: "General guidance",
    body: (
      <p className="leading-relaxed">
        Threatening messages, non-consensual sharing of images, or online stalking are forms of
        technology-facilitated abuse. Where possible, keep a record (screenshots, dates) in a place the person
        abusing you cannot access, and speak to a legal advisor about your options. If your device may be
        monitored, consider what is safe to do on it, and remember this app&apos;s quick-exit control.
      </p>
    ),
  },
];

export default function RightsPage() {
  const [filter, setFilter] = useState<Category>("all");
  const [openId, setOpenId] = useState<string | null>(FAQS[0].number);

  const visible = filter === "all" ? FAQS : FAQS.filter((f) => f.category === filter);

  return (
    <>
      <SiteHeader active="/rights" />
      <main className="w-full pt-32 pb-24 bg-surface-container-low">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-10 py-8 flex flex-col gap-6">
          <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-6 sm:p-8 shadow-sm">
            <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-primary-fixed/25 blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col gap-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-surface-container text-tertiary text-sm">
                <Gavel size={16} />
                <span>Cameroonian Law &amp; General Legal Information</span>
              </div>
              <h1 className="text-4xl font-semibold text-primary tracking-tight">Know Your Legal Rights</h1>
              <p className="text-lg text-on-surface-variant max-w-3xl">
                This is general information, not legal advice, summarised from public sources on Cameroonian
                law and international clinical guidance. For anything specific to your situation, a legal
                advisor can help &mdash; see the contacts directory.
              </p>
              <div className="mt-2 p-4 rounded-xl bg-surface-container-low flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center shrink-0 shadow-sm">
                  <ShieldCheck size={22} className="text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-primary text-sm">No pressure to act</span>
                  <span className="text-sm text-on-surface-variant">
                    Learning about your rights does not commit you to reporting or taking any legal step. Every
                    decision stays yours, at your own pace.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-primary text-on-primary rounded-xl p-6 shadow-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute -right-8 bottom-0 opacity-10 pointer-events-none">
              <Gavel size={180} className="text-on-primary" />
            </div>
            <div className="flex items-start gap-4 relative z-10 max-w-2xl">
              <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center shrink-0 mt-0.5">
                <Headset size={26} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-lg font-semibold text-on-primary">Need a legal advisor to talk this through?</span>
                <p className="text-sm text-surface-container-highest">
                  See verified legal aid contacts in the directory &mdash; confidential, free initial guidance,
                  no obligation to proceed.
                </p>
              </div>
            </div>
            <a
              href="/contacts"
              className="relative z-10 shrink-0 w-full lg:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-surface-container-lowest text-primary font-semibold shadow-sm hover:bg-surface transition-all"
            >
              <Phone size={20} className="text-secondary" />
              <span>See legal aid contacts</span>
            </a>
          </div>

          <div className="p-4 rounded-xl bg-tertiary-fixed/40 text-on-tertiary-container flex items-start gap-4">
            <Flower2 size={24} className="text-tertiary shrink-0 mt-0.5" />
            <div className="text-sm">
              <strong className="font-bold">You stay in full control.</strong> Reading about your rights does
              not mean you have to take any legal action. You can go at your own pace, with no judgement.
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-primary">Filter by topic</span>
              <span className="text-sm text-on-surface-variant">{visible.length} topics</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={
                    "px-4 py-2 rounded-full text-sm font-semibold transition-all " +
                    (filter === f.key
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high")
                  }
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {visible.map((faq) => {
              const isOpen = openId === faq.number;
              return (
                <article key={faq.number} className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
                  <button
                    onClick={() => setOpenId(isOpen ? null : faq.number)}
                    className="w-full text-left p-5 flex items-start justify-between gap-4 hover:bg-surface transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <span className="w-8 h-8 rounded-full bg-surface-container text-primary flex items-center justify-center shrink-0 text-sm font-bold">
                        {faq.number}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-lg font-semibold text-primary">{faq.question}</span>
                        <span className="text-xs text-tertiary mt-1">{faq.source}</span>
                      </div>
                    </div>
                    <ChevronDown
                      size={24}
                      className={"text-primary shrink-0 transition-transform duration-300 " + (isOpen ? "rotate-180" : "")}
                    />
                  </button>
                  {isOpen && (
                    <div className="p-5 pt-0 flex flex-col gap-3 text-on-surface">{faq.body}</div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
