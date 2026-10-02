"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Search, Lock, Phone, MessageCircle, Image as ImageIcon, Heart } from "lucide-react";

type Listing = {
  id: string;
  itemName: string;
  price: string;
  description: string;
  contactPhone: string;
  imageUrl?: string;
  category?: string;
};

const FILTERS = [
  { key: "all", label: "All creations" },
  { key: "weaving", label: "Weaving & raffia" },
  { key: "soap", label: "Natural soap & care" },
  { key: "textiles", label: "Textiles & indigo batik" },
  { key: "pottery", label: "Pottery & ceramics" },
  { key: "gifts", label: "Gift baskets" },
];

const LABELS: Record<string, string> = {
  weaving: "Weaving & raffia",
  soap: "Natural soap & care",
  textiles: "Textiles & indigo batik",
  pottery: "Pottery & ceramics",
  gifts: "Gift baskets",
};

export default function MarketplacePage() {
  const { loading: authLoading } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    if (authLoading) return;
    async function fetchListings() {
      const snap = await getDocs(collection(db, "marketplace"));
      setListings(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Listing, "id">) })));
      setLoading(false);
    }
    fetchListings();
  }, [authLoading]);

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      const matchCat = category === "all" || l.category === category;
      const matchQuery = !query || (l.itemName + " " + (l.description || "")).toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [listings, category, query]);

  return (
    <>
      <SiteHeader active="/marketplace" />
      <main className="w-full pt-32 pb-24 bg-surface-container-low">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-10 py-8 flex flex-col gap-8">
          <section className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-6 sm:p-10 shadow-sm">
            <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-primary-fixed/30 blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-80 h-80 rounded-full bg-tertiary-fixed/30 blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-4xl flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-4 py-1 rounded-full bg-primary text-on-primary text-sm font-semibold tracking-wide">
                  Handmade
                </span>
                <span className="px-4 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-sm font-semibold">
                  Sold through partner organisations
                </span>
              </div>
              <h1 className="text-4xl font-semibold text-primary tracking-tight leading-tight">
                Solidarity Market
                <span className="block text-xl text-tertiary font-normal italic mt-1">
                  Handmade goods from women rebuilding their independence
                </span>
              </h1>
              <p className="text-lg text-on-surface-variant leading-relaxed">
                Each item is made by a woman supported through one of our partner organisations. Buying
                directly supports her income and her next step.
              </p>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-container-low text-on-surface-variant max-w-3xl">
                <Lock size={20} className="text-tertiary shrink-0 mt-0.5" />
                <p className="text-sm leading-snug">
                  <strong className="font-bold text-on-surface">Protection first:</strong> to keep the makers safe,
                  items are listed by organisation only. Names and locations are never shown.
                </p>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <div className="relative w-full md:w-96">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for an item..."
                className="w-full h-[52px] pl-12 pr-4 rounded-xl bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/70 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setCategory(f.key)}
                  className={
                    "shrink-0 px-5 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all " +
                    (category === f.key
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container")
                  }
                >
                  {f.label}
                </button>
              ))}
            </div>
          </section>

          {loading && <p className="text-on-surface-variant">Loading...</p>}
          {!loading && filtered.length === 0 && (
            <p className="text-center text-on-surface-variant py-10">No items to show yet.</p>
          )}

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {filtered.map((l) => {
              const callLink = "tel:" + l.contactPhone;
              const waLink = "https://wa.me/" + l.contactPhone.replace(/[^0-9]/g, "");
              return (
                <article
                  key={l.id}
                  className="group flex flex-col justify-between bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div>
                    <div className="relative w-full h-72 overflow-hidden bg-surface-container">
                      {l.imageUrl ? (
                        <img
                          src={l.imageUrl}
                          alt={l.itemName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon size={40} className="text-primary/25" />
                        </div>
                      )}
                      {l.category && LABELS[l.category] && (
                        <div className="absolute top-4 left-4">
                          <span className="px-4 py-1 rounded-full bg-surface-container-lowest/95 backdrop-blur-md text-primary text-sm font-semibold shadow-sm">
                            {LABELS[l.category]}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col gap-3">
                      <h2 className="text-xl font-semibold text-primary">{l.itemName}</h2>
                      {l.description && <p className="text-sm text-on-surface-variant">{l.description}</p>}
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-container-low text-tertiary text-sm font-semibold">
                        <Heart size={18} />
                        <span>Your purchase supports the maker directly</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 pt-0">
                    <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="block text-xs text-on-surface-variant uppercase tracking-wider">Price</span>
                        <span className="text-2xl font-semibold text-primary">{l.price}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <a href={callLink} className="px-6 h-[48px] rounded-xl bg-primary text-on-primary font-semibold hover:bg-primary-container transition-all flex items-center gap-2 shadow-sm">
                          <Phone size={18} />
                          <span>Contact to buy</span>
                        </a>
                        <a href={waLink} target="_blank" rel="noopener noreferrer" className="px-4 h-[48px] rounded-xl bg-surface-container text-primary font-semibold hover:bg-surface-container-high transition-all flex items-center gap-2">
                          <MessageCircle size={18} />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="rounded-xl bg-surface-container p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-primary mb-3">How buying works</h2>
            <ol className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-on-surface-variant">
              <li className="p-4 rounded-xl bg-surface-container-lowest">
                <span className="block font-bold text-primary mb-1">1. Choose</span>
                Pick an item you like from the list above.
              </li>
              <li className="p-4 rounded-xl bg-surface-container-lowest">
                <span className="block font-bold text-primary mb-1">2. Contact the organisation</span>
                Call or message the number on the item. They arrange payment and handover with you directly.
              </li>
              <li className="p-4 rounded-xl bg-surface-container-lowest">
                <span className="block font-bold text-primary mb-1">3. No payment on this site</span>
                This site does not take payments or ship goods. Everything is agreed with the organisation.
              </li>
            </ol>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
