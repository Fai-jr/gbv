"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";

const STAFF_ROLES = ["ngo_staff", "shelter_staff", "admin"];

type Listing = {
  id: string;
  itemName: string;
  price: string;
  description: string;
  contactPhone: string;
};

export default function StaffMarketplacePage() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && (!profile || !STAFF_ROLES.includes(profile.role))) {
      router.replace("/staff/login");
    }
  }, [loading, profile, router]);

  useEffect(() => {
    if (loading || !profile?.orgId) return;

    async function fetchListings() {
      const q = query(collection(db, "marketplace"), where("orgId", "==", profile!.orgId));
      const snap = await getDocs(q);
      setListings(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Listing, "id">) })));
      setFetching(false);
    }

    fetchListings();
  }, [loading, profile]);

  if (loading || !profile) return <p className="p-8">Loading...</p>;

  return (
    <div className="mx-auto max-w-md p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-medium text-ink">Your Marketplace Listings</h1>
      </div>

      <button
        onClick={() => router.push("/staff/marketplace/new")}
        className="mb-4 w-full rounded bg-plum py-2 text-sm font-medium text-white hover:bg-plum-dark"
      >
        + Add Listing
      </button>

      {fetching && <p className="text-sm text-muted">Loading...</p>}

      <ul className="space-y-3">
        {listings.map((l) => (
          <li key={l.id} className="rounded-lg border border-border-soft bg-card p-4 shadow-sm">
            <p className="font-medium text-ink">{l.itemName}</p>
            <p className="text-sm text-muted">{l.price}</p>
            <p className="text-sm text-muted">{l.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
