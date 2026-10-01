"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { ShieldCheck, Phone, Search, MapPin, Lock, Languages, MessageCircle } from "lucide-react";

type Service = {
  id: string;
  name: string;
  type: string;
  phone: string;
  region: string;
};

const CATEGORIES = [
  { key: "all", label: "All Services" },
  { key: "legal aid", label: "Legal Aid" },
  { key: "medical", label: "Medical Care" },
  { key: "psychosocial", label: "Psychosocial Support" },
  { key: "hotline", label: "24/7 Hotlines" },
  { key: "shelter", label: "Shelter" },
];

const REGIONS = [
  "all", "Centre", "Littoral", "Far North", "North-West", "South-West", "West", "National",
];

export default function ContactsPage() {
  const { loading: authLoading } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [region, setRegion] = useState("all");

  useEffect(() => {
    if (authLoading) return;
    async function fetchServices() {
      const snap = await getDocs(collection(db, "services"));
      setServices(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Service, "id">) })));
      setLoading(false);
    }
    fetchServices();
  }, [authLoading]);

  const filtered = useMemo(() => {
    return services.filter((s) => {
      const matchCat = category === "all" || s.type.toLowerCase().includes(category);
      const matchRegion = region === "all" || s.region.toLowerCase().includes(region.toLowerCase());
      const matchQuery =
        !query ||
        (s.name + s.type + s.region).toLowerCase().includes(query.toLowerCase());
      return matchCat && matchRegion && matchQuery;
    });
  }, [services, category, region, query]);

  return (
    <>
      <SiteHeader active="/contacts" />
      <main className="w-full pt-32 pb-24 bg-surface-container-low">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-10 py-8 flex flex-col gap-8">
          <div className="relative overflow-hidden rounded-xl bg-surface-container p-6 sm:p-8 shadow-sm">
            <div className="absolute -right-24 -bottom-24 w-80 h-80 rounded-full bg-primary-fixed/30 blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="max-w-3xl flex flex-col gap-2">
                <div className="flex items-center gap-2 text-tertiary">
                  <ShieldCheck size={20} />
                  <span className="text-sm uppercase tracking-wider text-on-surface-variant">
                    Accredited Network &bull; MINPROFF &amp; UN Certified
                  </span>
                </div>
                <h1 className="text-4xl font-semibold text-primary leading-tight">Verified Support Directory</h1>
                <p className="text-on-surface-variant mt-1 leading-relaxed">
                  Services listed here are added and verified by GBVConnect administrators, drawing on
                  organisations such as MINPROFF, UNICEF, UNFPA, ALVF, and other civil-society networks.
                  Every contact offers secure, judgment-free, confidential support.
                </p>
              </div>
              <div className="shrink-0 flex flex-col gap-2 w-full lg:w-auto">
                <a href="tel:116" className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-lowest shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary shrink-0">
                    <Phone size={24} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-on-surface-variant uppercase">National GBV Helpline</span>
                    <span className="text-lg font-semibold text-primary tracking-tight">Toll-Free 116</span>
                    <span className="text-xs text-tertiary font-semibold">24/7 &bull; Free from MTN/Orange/Camtel</span>
                  </div>
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
              <div className="relative flex-1">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by organisation name, city, or service needed..."
                  className="w-full h-[52px] pl-12 pr-4 rounded-xl bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/70 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
                />
              </div>
              <div className="relative min-w-[260px]">
                <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary" />
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full h-[52px] pl-11 pr-4 appearance-none rounded-xl bg-surface-container-lowest text-on-surface font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-container cursor-pointer"
                >
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r === "all" ? "All Cameroon Regions" : r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setCategory(c.key)}
                  className={
                    "whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-semibold shadow-sm transition-all " +
                    (category === c.key
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-lowest text-on-surface-variant hover:text-on-surface")
                  }
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm text-on-surface-variant px-1">
              <span>
                {loading
                  ? "Loading..."
                  : `Showing ${filtered.length} verified partner ${filtered.length === 1 ? "agency" : "agencies"}`}
              </span>
              <div className="flex items-center gap-1.5 text-tertiary">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                <span className="font-semibold">All Hotlines Live</span>
              </div>
            </div>

            {!loading && filtered.length === 0 && (
              <p className="text-center text-on-surface-variant py-10">
                No contacts match right now. Try a different region or category.
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filtered.map((s) => {
                const callLink = "tel:" + s.phone;
                const waLink = "https://wa.me/" + s.phone.replace(/[^0-9]/g, "");
                return (
                  <div
                    key={s.id}
                    className="flex flex-col justify-between rounded-xl bg-surface-container-lowest p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="px-3 py-1 rounded-full bg-surface-container text-sm text-on-surface-variant font-semibold capitalize">
                          {s.type}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-sm font-bold">
                          <span className="w-2 h-2 rounded-full bg-emerald-600" />
                          Verified
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl bg-surface-container flex items-center justify-center shrink-0 text-primary">
                          <ShieldCheck size={28} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-primary">{s.name}</h3>
                          <span className="text-sm text-on-surface-variant flex items-center gap-1">
                            <MapPin size={14} />
                            {s.region}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-surface-container-low text-on-surface-variant text-sm">
                        <div className="flex items-center gap-2">
                          <Languages size={16} className="text-primary" />
                          <span>French &amp; English</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Lock size={16} className="text-primary" />
                          <span>Strict Non-Disclosure</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-4 mt-2">
                      <a
                        href={callLink}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary font-semibold hover:bg-primary-container transition-colors shadow-sm"
                      >
                        <Phone size={18} />
                        <span>Call {s.phone}</span>
                      </a>
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-semibold transition-colors"
                      >
                        <MessageCircle size={18} />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
