"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";

type Listing = {
  id: string;
  itemName: string;
  price: string;
  description: string;
  contactPhone: string;
  imageUrl?: string;
};

export default function MarketplacePage() {
  const { loading: authLoading } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    async function fetchListings() {
      const snap = await getDocs(collection(db, "marketplace"));
      setListings(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Listing, "id">) })));
      setLoading(false);
    }

    fetchListings();
  }, [authLoading]);

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-2 text-xl font-semibold text-ink">Marketplace</h1>
      <p className="mb-6 text-sm text-muted">
        Handmade items from women supported through our partner organizations.
      </p>

      {loading && <p className="text-sm text-muted">Loading...</p>}
      {!loading && listings.length === 0 && (
        <p className="text-sm text-muted">No listings available yet.</p>
      )}

      <ul className="grid gap-4 sm:grid-cols-2">
        {listings.map((l) => {
          const callLink = "tel:" + l.contactPhone;
          return (
            <li key={l.id} className="rounded-lg border border-border-soft bg-card p-4 shadow-sm">
              {l.imageUrl && (
                <img src={l.imageUrl} alt={l.itemName} className="mb-2 h-40 w-full rounded object-cover" />
              )}
              <p className="font-medium text-ink">{l.itemName}</p>
              <p className="text-sm font-medium text-ink">{l.price}</p>
              <p className="mt-1 text-sm text-muted">{l.description}</p>
              <a href={callLink} className="mt-2 inline-block text-sm font-medium text-plum">
                Contact to buy
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
