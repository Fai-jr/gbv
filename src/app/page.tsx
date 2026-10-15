"use client";

import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useLang } from "@/lib/i18n";
import {
  Compass,
  Headset,
  Phone,
  Shield,
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
  Users,
} from "lucide-react";

export default function HomePage() {
  const { t } = useLang();

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
                  <span className="text-sm font-semibold text-on-surface">{t("Your safety comes first")}</span>
                  <span className="text-sm text-on-surface-variant">
                    {t("Press Escape three times or use the Quick Exit button at the top to leave this page instantly.")}
                  </span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest text-primary text-sm font-semibold shadow-sm self-start sm:self-center">
                <span className="w-2 h-2 rounded-full bg-tertiary" />
                {t("Tip: use a private window")}
              </span>
            </div>
          </div>

          <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center pt-2">
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-sm font-semibold tracking-wide">
                  {t("Cameroon • Free • Always available")}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-semibold text-primary leading-tight">
                {t("You are not alone.")}
                <br />
                <span className="italic font-normal">{t("We are here with you.")}</span>
              </h1>
              <p className="text-lg text-on-surface-variant max-w-xl">
                {t("GBVConnect links you to verified contacts for shelter, medical and psychosocial care, legal advice and emergency help across Cameroon.")}
              </p>
              <div className="rounded-xl bg-tertiary-fixed-dim/30 p-4 flex items-start gap-4">
                <span className="text-tertiary shrink-0 mt-0.5">&#127752;</span>
                <p className="text-sm text-on-tertiary-container">
                  <strong>{t("Take all the time you need.")}</strong>{" "}
                  {t("There is no pressure here. You can read calmly, call a number without giving your name, or leave this page instantly whenever you need to.")}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <Link href="/contacts" className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-primary text-on-primary font-semibold shadow-md hover:bg-primary-container transition-all">
                  <Compass size={20} />
                  {t("Find help near me")}
                </Link>
                <Link href="/support" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-surface-container-lowest text-primary font-semibold shadow-sm hover:bg-surface-container transition-all">
                  <Headset size={20} className="text-tertiary" />
                  {t("Confidential chat")}
                </Link>
              </div>
            </div>
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-xl overflow-hidden shadow-xl bg-primary/80 h-80 sm:h-96 flex items-end">
                <div className="p-6 text-on-primary">
                  <span className="text-xs text-primary-fixed uppercase tracking-wider">{t("A listening space")}</span>
                  <p className="text-lg italic font-serif mt-2">
                    &ldquo;{t("Here, every woman and every child can find a listening ear and a way to reach help.")}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl bg-surface-container-lowest p-6 shadow-sm flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-secondary" />
                <h2 className="text-xl font-semibold text-primary">{t("If you are in danger, call 116")}</h2>
              </div>
              <span className="inline-flex items-center px-3 py-0.5 rounded-full bg-surface-container text-sm text-on-surface-variant">
                {t("Free to call")}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a href="tel:116" className="group flex items-center justify-between p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors shadow-sm">
                <div className="flex flex-col">
                  <span className="text-3xl text-secondary font-bold">116</span>
                  <span className="text-sm font-semibold text-on-surface">{t("National helpline")}</span>
                  <span className="text-sm text-on-surface-variant">{t("For anyone affected by violence")}</span>
                </div>
                <div className="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary group-hover:scale-105 transition-transform shrink-0">
                  <Phone size={22} />
                </div>
              </a>
              <Link href="/contacts" className="group flex items-center justify-between p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors shadow-sm">
                <div className="flex flex-col">
                  <span className="text-lg text-primary font-bold">{t("Verified contacts")}</span>
                  <span className="text-sm text-on-surface-variant">{t("Hotlines, legal aid, medical care and shelter")}</span>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary group-hover:scale-105 transition-transform shrink-0">
                  <ArrowRight size={22} />
                </div>
              </Link>
            </div>
          </section>

          <section className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-tertiary uppercase tracking-wider font-bold">
                  {t("4 ways in • Choose what feels right")}
                </span>
                <h2 className="text-2xl font-semibold text-primary">{t("How can we support you today?")}</h2>
              </div>
              <p className="text-sm text-on-surface-variant max-w-md">
                {t("You do not need to give your name to use any of these.")}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl bg-surface-container-lowest p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-secondary-fixed/50 rounded-bl-full pointer-events-none" />
                <div className="flex flex-col gap-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-on-secondary text-sm font-semibold">
                      <AlertTriangle size={16} />
                      {t("Immediate danger")}
                    </span>
                    <span className="text-sm text-secondary font-bold">{t("Priority")}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-primary mt-1">{t("Quiet alert")}</h3>
                  <p className="text-on-surface-variant">
                    {t("This saves a private note that you needed help. It does not call anyone. If you are in danger, call 116 now.")}
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-on-surface-variant text-sm">
                    <Lock size={16} className="text-secondary" />
                    <span>{t("No location is sent")}</span>
                  </div>
                </div>
                <Link href="/help" className="w-full flex items-center justify-between px-6 py-3 rounded-xl bg-secondary text-on-secondary font-semibold hover:bg-on-secondary-fixed-variant transition-colors mt-2">
                  <span>{t("Open the alert page")}</span>
                  <ArrowRight size={20} />
                </Link>
              </div>

              <div className="rounded-xl bg-surface-container-lowest p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-sm font-semibold">
                      <BadgeCheck size={16} />
                      {t("Verified directory")}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-primary mt-1">{t("Medical care & support")}</h3>
                  <p className="text-on-surface-variant">
                    {t("Contacts checked by GBVConnect administrators: health centres, counselling, legal advice and partner organisations.")}
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-on-surface-variant text-sm">
                    <CheckCircle2 size={16} className="text-tertiary shrink-0" />
                    <span>{t("Time matters after sexual violence: HIV prevention (PEP) works best within 72 hours")}</span>
                  </div>
                </div>
                <Link href="/contacts" className="w-full flex items-center justify-between px-6 py-3 rounded-xl bg-primary text-on-primary font-semibold hover:bg-primary-container transition-colors mt-2">
                  <span>{t("Find a contact")}</span>
                  <ArrowRight size={20} />
                </Link>
              </div>

              <div className="rounded-xl bg-surface-container-lowest p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-sm font-semibold">
                      <HomeIcon size={16} />
                      {t("Protected housing")}
                    </span>
                    <span className="text-sm text-on-surface-variant">{t("Addresses never public")}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-primary mt-1">{t("Safe refuges & transit homes")}</h3>
                  <p className="text-on-surface-variant">
                    {t("Reach temporary shelter for women and mothers with children by phone. Addresses are kept private for your protection.")}
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-on-surface-variant text-sm">
                    <ShieldCheck size={16} className="text-primary shrink-0" />
                    <span>{t("A person on the phone explains the next steps")}</span>
                  </div>
                </div>
                <Link href="/refuge" className="w-full flex items-center justify-between px-6 py-3 rounded-xl bg-primary text-on-primary font-semibold hover:bg-primary-container transition-colors mt-2">
                  <span>{t("Find a safe place")}</span>
                  <ArrowRight size={20} />
                </Link>
              </div>

              <div className="rounded-xl bg-surface-container-lowest p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-on-surface text-sm font-semibold">
                      <MessagesSquare size={16} />
                      {t("Confidential chat")}
                    </span>
                    <span className="text-sm text-tertiary font-bold">{t("Off the record")}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-primary mt-1">{t("Talk it through")}</h3>
                  <p className="text-on-surface-variant">
                    {t("Talk with our automated support assistant, at your own pace. It is not a live person, and you never have to share more than you want.")}
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-on-surface-variant text-sm">
                    <Trash2 size={16} className="text-tertiary shrink-0" />
                    <span>{t("You choose when to end the conversation")}</span>
                  </div>
                </div>
                <Link href="/support" className="w-full flex items-center justify-between px-6 py-3 rounded-xl bg-primary text-on-primary font-semibold hover:bg-primary-container transition-colors mt-2">
                  <span>{t("Start a chat")}</span>
                  <ArrowRight size={20} />
                </Link>
              </div>
            </div>
          </section>

          <section className="rounded-xl bg-surface-container p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-8 flex flex-col gap-2">
                <span className="text-xs text-tertiary uppercase tracking-wider font-bold">
                  {t("Medical care • The first 72 hours")}
                </span>
                <h3 className="text-xl font-semibold text-primary">{t("Recent physical or sexual violence?")}</h3>
                <p className="text-on-surface-variant">
                  {t("It is important to reach a health centre as soon as possible, ideally within 72 hours, for HIV post-exposure prevention (PEP) and other care. Emergency care should not depend on filing a police report first.")}
                </p>
              </div>
              <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col gap-2 justify-center">
                <Link href="/contacts" className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-on-primary font-semibold shadow-sm hover:bg-primary-container transition-colors text-center">
                  <Hospital size={18} />
                  {t("Find a health contact")}
                </Link>
                <Link href="/rights" className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-surface-container-lowest text-primary font-semibold shadow-sm hover:bg-surface-container-high transition-colors text-center">
                  <Gavel size={18} />
                  {t("Know your rights")}
                </Link>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-tertiary uppercase tracking-wider font-bold">
                {t("Community • Solidarity & rights")}
              </span>
              <h2 className="text-2xl font-semibold text-primary">{t("Learn, connect, and rebuild your independence")}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="rounded-xl bg-surface-container-lowest overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="h-40 relative bg-surface-container-high flex items-center justify-center">
                  <Gavel size={40} className="text-primary/30" />
                  <span className="absolute bottom-3 left-3 px-3 py-0.5 rounded-full bg-surface-container-lowest/90 text-sm text-primary backdrop-blur-sm">{t("The law")}</span>
                </div>
                <div className="p-6 flex flex-col justify-between flex-1 gap-4">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-semibold text-primary">{t("Know your rights")}</h3>
                    <p className="text-sm text-on-surface-variant">{t("Understand what the law says, and what help you can ask for.")}</p>
                  </div>
                  <Link href="/rights" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
                    <span>{t("Read the rights guide")}</span>
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>

              <div className="rounded-xl bg-surface-container-lowest overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="h-40 relative bg-surface-container-high flex items-center justify-center">
                  <Headset size={40} className="text-primary/30" />
                  <span className="absolute bottom-3 left-3 px-3 py-0.5 rounded-full bg-surface-container-lowest/90 text-sm text-primary backdrop-blur-sm">{t("Advice for loved ones")}</span>
                </div>
                <div className="p-6 flex flex-col justify-between flex-1 gap-4">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-semibold text-primary">{t("Support a friend or sister")}</h3>
                    <p className="text-sm text-on-surface-variant">{t("How to respond without judgement, what to say, and how to help build a safety plan.")}</p>
                  </div>
                  <Link href="/help-someone" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
                    <span>{t("Read the guide")}</span>
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>

              <div className="rounded-xl bg-surface-container-lowest overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="h-40 relative bg-surface-container-high">
                  <img src="/marketplace/8.png" alt="" className="w-full h-full object-cover" />
                  <span className="absolute bottom-3 left-3 px-3 py-0.5 rounded-full bg-surface-container-lowest/90 text-sm text-primary backdrop-blur-sm">{t("Economic independence")}</span>
                </div>
                <div className="p-6 flex flex-col justify-between flex-1 gap-4">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-semibold text-primary">{t("Solidarity Market")}</h3>
                    <p className="text-sm text-on-surface-variant">{t("Buy handmade goods from women rebuilding their independence.")}</p>
                  </div>
                  <Link href="/marketplace" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
                    <span>{t("Browse the market")}</span>
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>

              <div className="rounded-xl bg-surface-container-lowest overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="h-40 relative bg-surface-container-high flex items-center justify-center">
                  <Users size={40} className="text-primary/30" />
                  <span className="absolute bottom-3 left-3 px-3 py-0.5 rounded-full bg-surface-container-lowest/90 text-sm text-primary backdrop-blur-sm">{t("Peer support")}</span>
                </div>
                <div className="p-6 flex flex-col justify-between flex-1 gap-4">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-semibold text-primary">{t("Community")}</h3>
                    <p className="text-sm text-on-surface-variant">{t("Read stories, join live rooms moderated by our team, or start a support group.")}</p>
                  </div>
                  <Link href="/community" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
                    <span>{t("Visit the community")}</span>
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
