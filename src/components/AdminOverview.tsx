"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getCountFromServer, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import StaffShell from "@/components/StaffShell";
import { Phone, UserCog, TrendingUp, GraduationCap, ArrowRight, ShieldCheck } from "lucide-react";

const STALE_DAYS = 90;

type Stats = { pending: number; active: number; stale: number; contacts: number; feedback: number };

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [staffSnap, emailSnap, svcSnap, fb] = await Promise.all([
          getDocs(query(collection(db, "users"), where("role", "!=", "survivor"))),
          getDocs(query(collection(db, "users"), where("email", ">", ""))),
          getDocs(collection(db, "services")),
          getCountFromServer(collection(db, "feedback")),
        ]);

        const people = new Map<string, { role: string; revoked?: boolean }>();
        [...staffSnap.docs, ...emailSnap.docs].forEach((d) =>
          people.set(d.id, d.data() as { role: string; revoked?: boolean })
        );
        let pending = 0;
        let active = 0;
        people.forEach((u) => {
          if (u.role !== "survivor") active += 1;
          else if (!u.revoked) pending += 1;
        });

        const now = Date.now() / 1000;
        const stale = svcSnap.docs.filter((d) => {
          const v = d.data().verifiedAt as { seconds: number } | undefined;
          return !v || (now - v.seconds) / 86400 > STALE_DAYS;
        }).length;

        setStats({ pending, active, stale, contacts: svcSnap.size, feedback: fb.data().count });
      } catch (err) {
        console.error("Admin overview failed:", err);
        setError("Could not load the overview. Please refresh.");
      }
    }
    load();
  }, []);

  const v = (n?: number) => (stats && n !== undefined ? n : "-");

  return (
    <StaffShell title="Dashboard" subtitle="Administrator overview">
      {error && <p className="text-sm text-error font-semibold">{error}</p>}

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/staff" className="rounded-xl bg-notice-bg text-notice-text p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wider font-bold opacity-80">Pending staff requests</span>
          <span className="text-4xl font-semibold font-serif">{v(stats?.pending)}</span>
          <span className="text-sm opacity-80">Waiting for your decision</span>
        </Link>
        <Link href="/admin/staff" className="rounded-xl bg-available-bg text-available-text p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wider font-bold opacity-80">Active staff</span>
          <span className="text-4xl font-semibold font-serif">{v(stats?.active)}</span>
          <span className="text-sm opacity-80">With access right now</span>
        </Link>
        <Link href="/admin/services" className="rounded-xl bg-notice-bg text-notice-text p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wider font-bold opacity-80">Contacts to re-verify</span>
          <span className="text-4xl font-semibold font-serif">{v(stats?.stale)}</span>
          <span className="text-sm opacity-80">{stats ? "of " + stats.contacts + " contacts" : "Older than " + STALE_DAYS + " days"}</span>
        </Link>
        <Link href="/admin/feedback" className="rounded-xl bg-surface-container-lowest text-primary p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wider font-bold text-on-surface-variant">Feedback responses</span>
          <span className="text-4xl font-semibold font-serif">{v(stats?.feedback)}</span>
          <span className="text-sm text-on-surface-variant">Anonymous, totals only</span>
        </Link>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/admin/services" className="flex items-center gap-4 p-5 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0">
            <Phone size={22} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-primary">Verified contacts</p>
            <p className="text-sm text-on-surface-variant">Add, check and update the public directory.</p>
          </div>
          <ArrowRight size={20} className="text-primary" />
        </Link>
        <Link href="/admin/staff" className="flex items-center gap-4 p-5 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0">
            <UserCog size={22} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-primary">Staff accounts</p>
            <p className="text-sm text-on-surface-variant">Approve, change or remove staff access.</p>
          </div>
          <ArrowRight size={20} className="text-primary" />
        </Link>
        <Link href="/admin/feedback" className="flex items-center gap-4 p-5 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0">
            <TrendingUp size={22} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-primary">Feedback statistics</p>
            <p className="text-sm text-on-surface-variant">See whether people reached help.</p>
          </div>
          <ArrowRight size={20} className="text-primary" />
        </Link>
        <Link href="/staff/training" className="flex items-center gap-4 p-5 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0">
            <GraduationCap size={22} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-primary">Staff training</p>
            <p className="text-sm text-on-surface-variant">Review the training material.</p>
          </div>
          <ArrowRight size={20} className="text-primary" />
        </Link>
      </section>

      <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-container text-on-surface-variant max-w-2xl">
        <ShieldCheck size={20} className="text-tertiary shrink-0 mt-0.5" />
        <p className="text-sm leading-relaxed">
          As an administrator you manage the directory and who has access. Cases, shelters and marketplace
          listings belong to each organisation and are not shown to administrators.
        </p>
      </div>
    </StaffShell>
  );
}
