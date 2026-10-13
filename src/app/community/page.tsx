"use client";

import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { HOUSE_RULES } from "@/lib/community";
import { BookOpen, MessagesSquare, PenLine, ShieldAlert, Lock, Clock, ArrowRight } from "lucide-react";

const DOORS = [
  {
    href: "/community/stories",
    icon: BookOpen,
    title: "Read stories",
    body: "Stories from people who have been through violence, in their own words. Read what helped, what did not, and what came next.",
    action: "Read stories",
  },
  {
    href: "/community/rooms",
    icon: MessagesSquare,
    title: "Live rooms",
    body: "Talk with others in real time. Rooms are open only while a moderator is present, so someone is always watching over them.",
    action: "See the rooms",
  },
  {
    href: "/community/stories/share",
    icon: PenLine,
    title: "Share your story",
    body: "Write your story under a made-up name. A moderator reads it before it is shared, and you can take it down whenever you wish.",
    action: "Write your story",
  },
];

export default function CommunityPage() {
  return (
    <>
      <SiteHeader active="/community" />
      <main className="w-full pt-32 pb-24 bg-surface-container-low">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-10 py-8 flex flex-col gap-8">
          <section className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-6 sm:p-10 shadow-sm">
            <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-primary-fixed/30 blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-3xl flex flex-col gap-3">
              <span className="self-start px-3 py-1 rounded-full bg-surface-container text-tertiary text-sm font-semibold">
                Peer support &bull; Anonymous
              </span>
              <h1 className="text-4xl font-semibold text-primary leading-tight">
                You are not the only one.
                <span className="block text-xl text-tertiary font-normal italic mt-1">
                  Read, share and talk with people who understand.
                </span>
              </h1>
              <p className="text-lg text-on-surface-variant leading-relaxed">
                This is a space for survivors to support each other. Everyone uses a made-up name, and there
                are no accounts.
              </p>
            </div>
          </section>

          <section className="rounded-xl bg-notice-bg text-notice-text p-5 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#FDE68A] flex items-center justify-center shrink-0">
              <ShieldAlert size={22} />
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-bold">Before you begin</p>
              <p className="leading-relaxed">
                This is peer support, not professional help. If you are in danger, call <strong>116</strong> now.
                Moderators read every story before it is shared and can remove messages. Please never share
                names, places or phone numbers, because we cannot promise anything posted here can never be
                traced back.
              </p>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DOORS.map((d) => (
              <div key={d.href} className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col gap-3">
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                  <d.icon size={24} />
                </div>
                <h2 className="text-xl font-semibold text-primary">{d.title}</h2>
                <p className="text-sm text-on-surface-variant leading-relaxed flex-1">{d.body}</p>
                <Link href={d.href} className="w-full flex items-center justify-between px-5 py-3 rounded-xl bg-primary-container text-on-primary font-semibold hover:bg-primary transition-colors">
                  <span>{d.action}</span>
                  <ArrowRight size={20} />
                </Link>
              </div>
            ))}
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col gap-3">
              <h2 className="text-xl font-semibold text-primary">House rules</h2>
              <ol className="flex flex-col gap-2 text-sm text-on-surface-variant">
                {HOUSE_RULES.map((r, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-surface-container text-primary flex items-center justify-center shrink-0 text-xs font-bold">{i + 1}</span>
                    <span className="leading-relaxed">{r}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col gap-4">
              <h2 className="text-xl font-semibold text-primary">How your privacy works</h2>
              <div className="flex items-start gap-3 text-sm text-on-surface-variant">
                <Lock size={20} className="text-tertiary shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  You get a random name, kept only on this device. No email, phone number or real name is
                  asked for. Stories and messages are stored by GBVConnect and can be seen by moderators.
                </p>
              </div>
              <div className="flex items-start gap-3 text-sm text-on-surface-variant">
                <Clock size={20} className="text-tertiary shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Live rooms open only when a moderator is present. If a room is closed, you can still read
                  stories or come back later.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
