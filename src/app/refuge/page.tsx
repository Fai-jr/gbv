"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import {
  ShieldCheck,
  Lock,
  Car,
  UserCheck,
  AlertTriangle,
  Phone,
  CheckCircle2,
  Stethoscope,
  EyeOff,
} from "lucide-react";

type Service = {
  id: string;
  name: string;
  phone: string;
  region: string;
};

export default function RefugePage() {
  const { loading: authLoading } = useAuth();
  const [contacts, setContacts] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (authLoading) return;
    async function fetchRefuge() {
      const q = query(collection(db, "services"), where("type", "==", "shelter"));
      const snap = await getDocs(q);
      setContacts(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Service, "id">) })));
      setLoading(false);
    }
    fetchRefuge();
  }, [authLoading]);

  function reveal(id: string) {
    setRevealed((prev) => ({ ...prev, [id]: true }));
  }

  return (
    <>
      <SiteHeader active="/refuge" />
      <main className="w-full pt-32 pb-24 bg-surface-container-low">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-10 py-8 flex flex-col gap-8">
          <div className="relative overflow-hidden rounded-xl bg-surface-container p-6 sm:p-8 shadow-sm">
            <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-tertiary-fixed opacity-40 blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col gap-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 text-tertiary text-sm tracking-wider uppercase">
                <ShieldCheck size={18} />
                <span>Safeguarding Protocol &bull; Cameroon Safe Shelter Network</span>
              </div>
              <h1 className="text-4xl font-semibold text-primary leading-tight">
                Safe Refuges &amp; Temporary Shelter
              </h1>
              <p className="text-lg text-on-surface-variant leading-relaxed">
                For the safety and confidentiality of every woman and child, physical shelter addresses are
                never published online. Every refuge is reached through a verified telephone coordinator who
                arranges safe, discreet transport.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-sm">
                <div className="flex items-center gap-1.5 bg-surface-container-lowest px-3 py-1.5 rounded-full shadow-sm">
                  <Lock size={16} className="text-tertiary" />
                  <span>Anonymous Liaison</span>
                </div>
                <div className="flex items-center gap-1.5 bg-surface-container-lowest px-3 py-1.5 rounded-full shadow-sm">
                  <Car size={16} className="text-tertiary" />
                  <span>Neutral Point Rendezvous</span>
                </div>
                <div className="flex items-center gap-1.5 bg-surface-container-lowest px-3 py-1.5 rounded-full shadow-sm">
                  <UserCheck size={16} className="text-tertiary" />
                  <span>Female Escort Team</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-notice-bg text-notice-text p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FDE68A] flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle size={22} className="text-notice-text" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold leading-snug">Need to leave urgently?</span>
                <p className="leading-normal">
                  If you need transport right now, call our emergency line directly rather than waiting.
                </p>
              </div>
            </div>
            <a
              href="tel:116"
              className="shrink-0 flex items-center gap-2 bg-secondary text-on-secondary px-5 py-2.5 rounded-xl font-semibold hover:bg-on-secondary-fixed-variant transition-colors shadow-sm"
            >
              <Phone size={18} />
              <span>Call Hotline 116 (Toll-Free)</span>
            </a>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="text-xs text-tertiary uppercase tracking-wider">Live Intake Coordination</span>
                <h2 className="text-2xl font-semibold text-primary">Shelter Network Status</h2>
              </div>
              <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-available-text animate-pulse" />
                <span>Verified coordinators actively online across Cameroon</span>
              </div>
            </div>

            {loading && <p className="text-on-surface-variant">Loading...</p>}
            {!loading && contacts.length === 0 && (
              <p className="text-on-surface-variant">
                No verified shelter contacts yet. Please try the general contacts directory, or call 116.
              </p>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {contacts.map((c) => (
                <div
                  key={c.id}
                  className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="text-xs text-tertiary">{c.region}</span>
                        <h3 className="text-lg font-semibold text-primary">{c.name}</h3>
                      </div>
                      <span className="bg-available-bg text-available-text text-xs px-3 py-1 rounded-full whitespace-nowrap font-semibold">
                        Verified &amp; Available
                      </span>
                    </div>

                    <div className="h-36 w-full rounded-lg bg-surface-container-high flex flex-col items-center justify-center gap-1 relative">
                      <ShieldCheck size={32} className="text-primary/30" />
                      <span className="absolute bottom-2 left-2 bg-primary/80 backdrop-blur-sm text-on-primary text-[11px] px-2 py-0.5 rounded">
                        Location protected
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-on-surface font-semibold">Accommodates:</span>
                      <p className="text-sm text-on-surface-variant">
                        Women with children, short emergency stays, on-site psychosocial support.
                      </p>
                    </div>

                    <div className="flex flex-col gap-1 bg-surface-container-low p-3 rounded-lg">
                      <div className="flex items-center gap-1.5 text-on-surface-variant text-sm">
                        <CheckCircle2 size={16} className="text-tertiary" />
                        <span>Meals provided</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-on-surface-variant text-sm">
                        <Stethoscope size={16} className="text-tertiary" />
                        <span>Trauma medical checkup available</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-on-surface-variant text-sm">
                        <EyeOff size={16} className="text-tertiary" />
                        <span>Completely discreet intake transfer</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-2">
                    {!revealed[c.id] ? (
                      <button
                        onClick={() => reveal(c.id)}
                        className="w-full h-[52px] bg-primary-container text-on-primary rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary transition-colors"
                      >
                        <Phone size={20} />
                        <span>Call Coordinator</span>
                      </button>
                    ) : (
                      <div className="flex flex-col items-center gap-1 p-3 bg-surface-container rounded-xl text-center">
                        <a
                          href={"tel:" + c.phone}
                          className="text-primary text-lg font-semibold underline decoration-tertiary"
                        >
                          {c.phone}
                        </a>
                        <span className="text-on-surface-variant text-sm">24/7 Intake Cell</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
