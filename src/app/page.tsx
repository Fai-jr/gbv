"use client";

import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import {
  Compass,
  Headset,
  Phone,
  Shield,
  LifeBuoy,
  AlertTriangle,
  Lock,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Home as HomeIcon,
  ShieldCheck,
  MessagesSquare,
  Trash2,
  Hospital,
  Gavel,
} from "lucide-react";

export default function HomePage() {
  return (
    <>
      <SiteHeader active="/" />
      <main className="w-full pt-32 pb-24 bg-surface-container-low">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-10 py-8 flex flex-col gap-10">
          <div className="rounded-xl bg-surface-container-high px-5 py-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center shrink-0">
                  <Shield size={20} className="text-secondary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-on-surface">Your safety is priority</span>
                  <span className="text-sm text-on-surface-variant">
                    Press Escape three times or the button below to close instantly.
                  </span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest text-primary text-sm font-semibold shadow-sm self-start sm:self-center">
                <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
                Private browsing &bull; No trace
              </span>
            </div>
          </div>

          <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center pt-2">
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-sm font-semibold tracking-wide">
                  Cameroon &bull; Free &bull; 24/7
                </span>
                <span className="text-on-surface-variant text-sm">
                  &bull; Yaound&eacute;, Douala, Maroua, Bamenda, Buea
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-semibold text-primary leading-tight">
                You are not alone.
                <br />
                <span className="italic font-normal">We are here with you.</span>
              </h1>
              <p className="text-lg text-on-surface-variant max-w-xl">
                GBVConnect links you directly, gently, and safely to verified shelters, trauma-informed
                medical and psychosocial care, free legal counsel, and emergency assistance across Cameroon.
              </p>
              <div className="rounded-xl bg-tertiary-fixed-dim/30 p-4 flex items-start gap-4">
                <span className="text-tertiary shrink-0 mt-0.5">&#127752;</span>
                <p className="text-sm text-on-tertiary-container">
                  <strong>Take all the time you need.</strong> There is no pressure here. You can read calmly,
                  call a number without giving your name, or leave this page instantly whenever you need to.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <Link
                  href="/contacts"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-primary text-on-primary font-semibold shadow-md hover:bg-primary-container transition-all"
                >
                  <Compass size={20} />
                  Find help near me
                </Link>
                <Link
                  href="/support/chat"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-surface-container-lowest text-primary font-semibold shadow-sm hover:bg-surface-container transition-all"
                >
                  <Headset size={20} className="text-tertiary" />
                  Confidential chat
                </Link>
              </div>
            </div>
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-xl overflow-hidden shadow-xl bg-primary/80 h-80 sm:h-96 flex items-end">
                <div className="p-6 text-on-primary">
                  <span className="text-xs text-primary-fixed uppercase tracking-wider">
                    Sanctuary &bull; Free Voices
                  </span>
                  <p className="text-lg italic font-serif mt-2">
                    &ldquo;Here, every woman and every child finds a listening ear, a helping hand, and
                    unconditional protection.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl bg-surface-container-lowest p-6 shadow-sm flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-secondary" />
                <h2 className="text-xl font-semibold text-primary">Free Emergency Numbers in Cameroon</h2>
              </div>
              <span className="inline-flex items-center px-3 py-0.5 rounded-full bg-surface-container text-sm text-on-surface-variant">
                24/7 &bull; Anonymity guaranteed
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
                <a href="tel:116" className="group flex items-center justify-between p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors shadow-sm">
                <div className="flex flex-col">
                  <span className="text-2xl text-secondary font-bold">116</span>
                  <span className="text-sm font-semibold text-on-surface">National Green Line</span>
                  <span className="text-sm text-on-surface-variant">Child distress &amp; GBV</span>
                </div>
                <div className="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary group-hover:scale-105 transition-transform shrink-0">
                  <Phone size={22} />
                </div>
              </a>
              
                <a href="tel:1500" className="group flex items-center justify-between p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors shadow-sm">
                <div className="flex flex-col">
                  <span className="text-2xl text-primary font-bold">1500</span>
                  <span className="text-sm font-semibold text-on-surface">MINPROFF Emergency</span>
                  <span className="text-sm text-on-surface-variant">Ministry of Women&apos;s Empowerment</span>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary group-hover:scale-105 transition-transform shrink-0">
                  <Shield size={22} />
                </div>
              </a>
              
                <a href="tel:8004444" className="group flex items-center justify-between p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors shadow-sm">
                <div className="flex flex-col">
                  <span className="text-2xl text-tertiary font-bold">800-44-44</span>
                  <span className="text-sm font-semibold text-on-surface">ALVF Helpline</span>
                  <span className="text-sm text-on-surface-variant">Association de Lutte contre les VBG</span>
                </div>
                <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary group-hover:scale-105 transition-transform shrink-0">
                  <LifeBuoy size={22} />
                </div>
              </a>
            </div>
          </section>

          <section className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-tertiary uppercase tracking-wider font-bold">
                  4 Secure Doors &bull; Choose without fear
                </span>
                <h2 className="text-2xl font-semibold text-primary">How can we support you today?</h2>
              </div>
              <p className="text-sm text-on-surface-variant max-w-md">
                Every path is strictly protected. You do not need to give your identity to get support.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl bg-surface-container-lowest p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-secondary-fixed/50 rounded-bl-full pointer-events-none" />
                <div className="flex flex-col gap-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-on-secondary text-sm font-semibold">
                      <AlertTriangle size={16} />
                      Immediate Danger
                    </span>
                    <span className="text-sm text-secondary font-bold">Priority</span>
                  </div>
                  <h3 className="text-xl font-semibold text-primary mt-1">Trigger a fast alert</h3>
                  <p className="text-on-surface-variant">
                    If you are in immediate danger, notify local response teams and your verified trusted
                    contacts with a single confirmation.
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-on-surface-variant text-sm">
                    <Lock size={16} className="text-secondary" />
                    <span>Location shared only with accredited responders</span>
                  </div>
                </div>
                <Link
                  href="/help"
                  className="w-full flex items-center justify-between px-6 py-3 rounded-xl bg-secondary text-on-secondary font-semibold hover:bg-on-secondary-fixed-variant transition-colors mt-2"
                >
                  <span>Open the alert console</span>
                  <ArrowRight size={20} />
                </Link>
              </div>

              <div className="rounded-xl bg-surface-container-lowest p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-sm font-semibold">
                      <BadgeCheck size={16} />
                      Verified Directory
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-primary mt-1">Medical care &amp; support</h3>
                  <p className="text-on-surface-variant">
                    A secure directory of health centres, psychosocial support units, and partner NGOs
                    (ALVF, Horizons Femmes, and others).
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-on-surface-variant text-sm">
                    <CheckCircle2 size={16} className="text-tertiary" />
                    <span>Emergency medical care (PEP within 72h, forensic care)</span>
                  </div>
                </div>
                <Link
                  href="/contacts"
                  className="w-full flex items-center justify-between px-6 py-3 rounded-xl bg-primary text-on-primary font-semibold hover:bg-primary-container transition-colors mt-2"
                >
                  <span>See nearby centres</span>
                  <ArrowRight size={20} />
                </Link>
              </div>

              <div className="rounded-xl bg-surface-container-lowest p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-sm font-semibold">
                      <HomeIcon size={16} />
                      Protected Housing
                    </span>
                    <span className="text-sm text-on-surface-variant">Addresses never public</span>
                  </div>
                  <h3 className="text-xl font-semibold text-primary mt-1">Safe refuges &amp; transit homes</h3>
                  <p className="text-on-surface-variant">
                    Direct phone connection to temporary shelter for women and mothers with children.
                    Addresses stay secret for your protection.
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-on-surface-variant text-sm">
                    <ShieldCheck size={16} className="text-primary" />
                    <span>Discreet intake and safe transport arranged</span>
                  </div>
                </div>
                <Link
                  href="/refuge"
                  className="w-full flex items-center justify-between px-6 py-3 rounded-xl bg-primary text-on-primary font-semibold hover:bg-primary-container transition-colors mt-2"
                >
                  <span>Request a safe place</span>
                  <ArrowRight size={20} />
                </Link>
              </div>

              <div className="rounded-xl bg-surface-container-lowest p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-on-surface text-sm font-semibold">
                      <MessagesSquare size={16} />
                      Confidential Chat
                    </span>
                    <span className="text-sm text-tertiary font-bold">Off the record</span>
                  </div>
                  <h3 className="text-xl font-semibold text-primary mt-1">Talk it through</h3>
                  <p className="text-on-surface-variant">
                    Talk right away with our supportive chat, at your pace, with no pressure to share more
                    than you want.
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-on-surface-variant text-sm">
                    <Trash2 size={16} className="text-tertiary" />
                    <span>You choose when to end the conversation</span>
                  </div>
                </div>
                <Link
                  href="/support/chat"
                  className="w-full flex items-center justify-between px-6 py-3 rounded-xl bg-primary text-on-primary font-semibold hover:bg-primary-container transition-colors mt-2"
                >
                  <span>Start a secure chat</span>
                  <ArrowRight size={20} />
                </Link>
              </div>
            </div>
          </section>

          <section className="rounded-xl bg-surface-container p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-8 flex flex-col gap-2">
                <span className="text-xs text-tertiary uppercase tracking-wider font-bold">
                  Medical Care &bull; Critical 72-Hour Window
                </span>
                <h3 className="text-xl font-semibold text-primary">
                  Recent physical or sexual violence?
                </h3>
                <p className="text-on-surface-variant">
                  It is important to visit a health centre within <strong>72 hours</strong> for free access
                  to HIV post-exposure prevention (PEP), emergency contraception, and a descriptive medical
                  certificate &mdash; with no requirement to file a police report first.
                </p>
              </div>
              <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col gap-2 justify-center">
                <Link
                  href="/contacts"
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-on-primary font-semibold shadow-sm hover:bg-primary-container transition-colors text-center"
                >
                  <Hospital size={18} />
                  72h care centres
                </Link>
                <Link
                  href="/rights"
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-surface-container-lowest text-primary font-semibold shadow-sm hover:bg-surface-container-high transition-colors text-center"
                >
                  <Gavel size={18} />
                  Legal guide
                </Link>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-tertiary uppercase tracking-wider font-bold">
                Community Resources &bull; Solidarity &amp; Rights
              </span>
              <h2 className="text-2xl font-semibold text-primary">
                Learn, act, and rebuild your independence
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-xl bg-surface-container-lowest overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="h-44 relative bg-surface-container-high flex items-center justify-center">
                  <Gavel size={40} className="text-primary/30" />
                  <span className="absolute bottom-3 left-3 px-3 py-0.5 rounded-full bg-surface-container-lowest/90 text-sm text-primary backdrop-blur-sm">
                    Penal Code
                  </span>
                </div>
                <div className="p-6 flex flex-col justify-between flex-1 gap-4">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-semibold text-primary">Know your legal rights</h3>
                    <p className="text-sm text-on-surface-variant">
                      Understand Cameroonian law, protective measures, free medical certificates, and legal
                      aid.
                    </p>
                  </div>
                  <Link href="/rights" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
                    <span>Read the rights guide</span>
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>

              <div className="rounded-xl bg-surface-container-lowest overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="h-44 relative bg-surface-container-high flex items-center justify-center">
                  <Headset size={40} className="text-primary/30" />
                  <span className="absolute bottom-3 left-3 px-3 py-0.5 rounded-full bg-surface-container-lowest/90 text-sm text-primary backdrop-blur-sm">
                    Advice for loved ones
                  </span>
                </div>
                <div className="p-6 flex flex-col justify-between flex-1 gap-4">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-semibold text-primary">Support a friend or sister</h3>
                    <p className="text-sm text-on-surface-variant">
                      How to respond without judgement, what to say, and how to help build a safety plan.
                    </p>
                  </div>
                  <Link href="/help-someone" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
                    <span>Guiding advice</span>
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>

              <div className="rounded-xl bg-surface-container-lowest overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="h-44 relative bg-surface-container-high">
                  <img
                    src="/marketplace/8.png"
                    alt="Handwoven textiles made by women in partner shelters"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-3 left-3 px-3 py-0.5 rounded-full bg-surface-container-lowest/90 text-sm text-primary backdrop-blur-sm">
                    Economic independence
                  </span>
                </div>
                <div className="p-6 flex flex-col justify-between flex-1 gap-4">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-semibold text-primary">Survivor Solidarity Market</h3>
                    <p className="text-sm text-on-surface-variant">
                      Support the financial independence of women in our partner shelters by buying their
                      handmade goods.
                    </p>
                  </div>
                  <Link href="/marketplace" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
                    <span>Browse the market</span>
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
