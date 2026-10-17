"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import { useLang } from "@/lib/i18n";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { ShieldCheck, Lock, Phone, PhoneCall, AlertTriangle, BadgeCheck, Building2 } from "lucide-react";

// Set to false to show only "Space available" or "Full", without the number of spaces left.
const SHOW_COUNTS = true;

type Service = { id: string; name: string; phone: string; region: string };
type PublicShelter = {
  id: string;
  name: string;
  orgName: string;
  region: string;
  phone: string;
  spacesLeft: number;
  full: boolean;
  updatedAt?: { seconds: number };
};

function PhoneReveal({ phone }: { phone: string }) {
  const { t } = useLang();
  const [shown, setShown] = useState(false);

  if (!phone) {
    return (
      <p className="text-sm text-on-surface-variant bg-surface-container rounded-xl p-3 leading-relaxed">
        {t("No phone number is listed for this shelter. Call 116 and ask to be connected.")}
      </p>
    );
  }
  if (!shown) {
    return (
      <button
        onClick={() => setShown(true)}
        className="w-full h-[52px] bg-primary-container text-on-primary rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary transition-colors"
      >
        <PhoneCall size={20} />
        <span>{t("Show the phone number")}</span>
      </button>
    );
  }
  return (
    <div className="flex flex-col items-center gap-1 p-3 bg-surface-container rounded-xl text-center">
      <a href={"tel:" + phone} className="text-primary text-lg font-semibold underline decoration-tertiary">
        {phone}
      </a>
      <span className="text-on-surface-variant text-sm">{t("Tap to call")}</span>
    </div>
  );
}

export default function RefugePage() {
  const { user, loading: authLoading } = useAuth();
  const { t, lang } = useLang();
  const [shelters, setShelters] = useState<PublicShelter[]>([]);
  const [contacts, setContacts] = useState<Service[]>([]);
  const [loadedShelters, setLoadedShelters] = useState(false);
  const [loadedContacts, setLoadedContacts] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;
    return onSnapshot(
      collection(db, "publicShelters"),
      (snap) => {
        setShelters(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PublicShelter, "id">) })));
        setLoadedShelters(true);
      },
      (err) => {
        console.error("Shelters error:", err);
        setLoadedShelters(true);
      }
    );
  }, [authLoading, user]);

  useEffect(() => {
    if (authLoading || !user) return;
    async function fetchContacts() {
      try {
        const q = query(collection(db, "services"), where("type", "==", "shelter"));
        const snap = await getDocs(q);
        setContacts(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Service, "id">) })));
      } catch (err) {
        console.error("Contacts error:", err);
      }
      setLoadedContacts(true);
    }
    fetchContacts();
  }, [authLoading, user]);

  const sorted = [...shelters].sort((a, b) => Number(a.full) - Number(b.full) || a.name.localeCompare(b.name));
  const locale = lang === "fr" ? "fr-FR" : "en-GB";
  const loading = !loadedShelters || !loadedContacts;

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
                <span>{t("Safe places • Reached by phone")}</span>
              </div>
              <h1 className="text-4xl font-semibold text-primary leading-tight">{t("Safe Refuges & Temporary Shelter")}</h1>
              <p className="text-lg text-on-surface-variant leading-relaxed">
                {t("For the safety of every woman and child, shelter addresses are never published online. You reach a refuge through a phone contact, who explains what happens next.")}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-sm">
                <div className="flex items-center gap-1.5 bg-surface-container-lowest px-3 py-1.5 rounded-full shadow-sm">
                  <Lock size={16} className="text-tertiary" />
                  <span>{t("No addresses online")}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-surface-container-lowest px-3 py-1.5 rounded-full shadow-sm">
                  <Phone size={16} className="text-tertiary" />
                  <span>{t("Reached by phone")}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-surface-container-lowest px-3 py-1.5 rounded-full shadow-sm">
                  <ShieldCheck size={16} className="text-tertiary" />
                  <span>{t("You decide the next step")}</span>
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
                <span className="font-bold leading-snug">{t("Need to leave urgently?")}</span>
                <p className="leading-normal">{t("If you are in danger or need to leave right now, call 116 directly rather than waiting.")}</p>
              </div>
            </div>
            <a href="tel:116" className="shrink-0 flex items-center gap-2 bg-secondary text-on-secondary px-5 py-2.5 rounded-xl font-semibold hover:bg-on-secondary-fixed-variant transition-colors shadow-sm">
              <Phone size={18} />
              <span>{t("Call 116")}</span>
            </a>
          </div>

          {loading && <p className="text-on-surface-variant">{t("Loading...")}</p>}

          {!loading && shelters.length === 0 && contacts.length === 0 && (
            <p className="text-on-surface-variant">
              {t("No shelters are listed yet. Please try the general contacts directory, or call 116.")}
            </p>
          )}

          {sorted.length > 0 && (
            <section className="flex flex-col gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-primary">{t("Shelters and available space")}</h2>
                <p className="text-sm text-on-surface-variant mt-1">
                  {t("Kept up to date by the shelter staff. Space can change quickly, so always call to confirm before you travel.")}
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {sorted.map((s) => (
                  <div key={s.id} className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col min-w-0">
                          {s.region && <span className="text-xs text-tertiary">{t(s.region)}</span>}
                          <h3 className="text-lg font-semibold text-primary">{s.name}</h3>
                        </div>
                        <span
                          className={
                            "text-xs px-3 py-1 rounded-full whitespace-nowrap font-semibold border shrink-0 " +
                            (s.full
                              ? "bg-full-bg text-full-text border-full-border"
                              : "bg-available-bg text-available-text border-available-border")
                          }
                        >
                          {s.full
                            ? t("Full")
                            : SHOW_COUNTS
                              ? t(s.spacesLeft === 1 ? "1 space left" : "{n} spaces left", { n: s.spacesLeft })
                              : t("Space available")}
                        </span>
                      </div>

                      <p className="text-sm text-on-surface-variant flex items-center gap-1.5">
                        <Building2 size={14} className="shrink-0" />
                        {t("Run by {name}", { name: s.orgName })}
                      </p>

                      <div className="h-24 w-full rounded-lg bg-surface-container-high flex flex-col items-center justify-center relative">
                        <ShieldCheck size={28} className="text-primary/30" />
                        <span className="absolute bottom-2 left-2 bg-primary/80 backdrop-blur-sm text-on-primary text-[11px] px-2 py-0.5 rounded">
                          {t("Location protected")}
                        </span>
                      </div>

                      {s.updatedAt && (
                        <p className="text-xs text-on-surface-variant">
                          {t("Updated {date}", {
                            date: new Date(s.updatedAt.seconds * 1000).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" }),
                          })}
                        </p>
                      )}
                    </div>
                    <div className="pt-4 mt-2">
                      <PhoneReveal phone={s.phone} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {contacts.length > 0 && (
            <section className="flex flex-col gap-4">
              <div>
                <span className="text-xs text-tertiary uppercase tracking-wider">{t("Verified phone contacts")}</span>
                <h2 className="text-2xl font-semibold text-primary">{t("Other verified shelter contacts")}</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {contacts.map((c) => (
                  <div key={c.id} className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col">
                          <span className="text-xs text-tertiary">{t(c.region)}</span>
                          <h3 className="text-lg font-semibold text-primary">{c.name}</h3>
                        </div>
                        <span className="inline-flex items-center gap-1 bg-available-bg text-available-text text-xs px-3 py-1 rounded-full whitespace-nowrap font-semibold">
                          <BadgeCheck size={14} />
                          {t("Verified")}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 bg-surface-container-low p-3 rounded-lg">
                        <span className="text-sm text-on-surface font-semibold">{t("What to expect when you call")}</span>
                        <p className="text-sm text-on-surface-variant">
                          {t("The person who answers will explain what the shelter can offer and what happens next. You can ask any question before you decide.")}
                        </p>
                      </div>
                    </div>
                    <div className="pt-4 mt-2">
                      <PhoneReveal phone={c.phone} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
