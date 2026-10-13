"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, query, where, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import StaffShell from "@/components/StaffShell";
import { Plus, Trash2, Pencil, Image as ImageIcon, Info } from "lucide-react";

type Listing = {
  id: string;
  itemName: string;
  price: string;
  description?: string;
  imageUrl?: string;
  category?: string;
};

export default function StaffMarketplacePage() {
  const { profile, loading } = useAuth();
  const orgId = profile?.orgId;
  const [listings, setListings] = useState<Listing[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!orgId) {
      setFetching(false);
      return;
    }
    async function load() {
      try {
        const snap = await getDocs(query(collection(db, "marketplace"), where("orgId", "==", orgId)));
        setListings(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Listing, "id">) })));
      } catch (err) {
        console.error("Failed to load listings:", err);
        setError("Could not load listings. Please refresh.");
      }
      setFetching(false);
    }
    load();
  }, [loading, orgId]);

  async function remove(l: Listing) {
    if (!window.confirm("Remove " + l.itemName + " from the marketplace?")) return;
    try {
      await deleteDoc(doc(db, "marketplace", l.id));
      setListings((prev) => prev.filter((x) => x.id !== l.id));
    } catch (err) {
      console.error("Failed to remove listing:", err);
      setError("Could not remove that listing. Please try again.");
    }
  }

  return (
    <StaffShell orgOnly
      title="Marketplace listings"
      subtitle="Items your organisation has listed for sale."
      actions={
        orgId ? (
          <Link href="/staff/marketplace/new" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-container text-on-primary text-sm font-semibold hover:bg-primary transition-colors shadow-sm">
            <Plus size={18} />
            Add listing
          </Link>
        ) : null
      }
    >
      {error && <p className="text-sm text-error font-semibold">{error}</p>}

      {!orgId && (
        <div className="rounded-xl bg-surface-container p-5 flex items-start gap-3">
          <Info size={22} className="text-tertiary shrink-0 mt-0.5" />
          <p className="text-sm text-on-surface-variant">Listings belong to an organisation, and this account is not attached to one.</p>
        </div>
      )}

      {fetching && orgId && <p className="text-on-surface-variant">Loading...</p>}
      {!fetching && orgId && listings.length === 0 && (
        <p className="text-center text-on-surface-variant py-8">No listings yet.</p>
      )}

      <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {listings.map((l) => (
          <li key={l.id} className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="h-40 bg-surface-container flex items-center justify-center">
              {l.imageUrl ? (
                <img src={l.imageUrl} alt={l.itemName} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon size={32} className="text-primary/25" />
              )}
            </div>
            <div className="p-5 flex flex-col gap-2 flex-1">
              <h3 className="text-lg font-semibold text-primary">{l.itemName}</h3>
              <p className="text-sm font-semibold text-on-surface">{l.price}</p>
              {l.description && <p className="text-sm text-on-surface-variant">{l.description}</p>}
              <div className="mt-auto pt-2 flex flex-wrap gap-2">
                <Link href={"/staff/marketplace/edit/" + l.id} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container text-primary text-sm font-semibold hover:bg-surface-container-high transition-colors">
                  <Pencil size={16} />
                  Edit
                </Link>
                <button
                  onClick={() => remove(l)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-full-bg text-full-text text-sm font-semibold hover:opacity-80 transition-opacity"
                >
                  <Trash2 size={16} />
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </StaffShell>
  );
}
