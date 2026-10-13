"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import StaffShell from "@/components/StaffShell";
import ListingForm, { ListingValues } from "@/components/ListingForm";
import { Info } from "lucide-react";

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const { profile, loading } = useAuth();
  const router = useRouter();
  const [initial, setInitial] = useState<ListingValues | null>(null);
  const [problem, setProblem] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading || !profile?.orgId) return;
    async function load() {
      try {
        const snap = await getDoc(doc(db, "marketplace", id));
        if (!snap.exists()) {
          setProblem("This listing no longer exists.");
          return;
        }
        const d = snap.data();
        if (d.orgId !== profile!.orgId) {
          setProblem("This listing belongs to a different organisation.");
          return;
        }
        setInitial({
          itemName: d.itemName || "",
          price: d.price || "",
          description: d.description || "",
          contactPhone: d.contactPhone || "",
          category: d.category || "weaving",
          imageUrl: d.imageUrl || "",
        });
      } catch (err) {
        console.error("Failed to load listing:", err);
        setProblem("Could not load this listing. Please go back and try again.");
      }
    }
    load();
  }, [loading, profile, id]);

  async function handleSubmit(v: ListingValues) {
    setSaving(true);
    setError("");
    try {
      await updateDoc(doc(db, "marketplace", id), { ...v, updatedAt: serverTimestamp() });
      router.push("/staff/marketplace");
    } catch (err) {
      console.error("Failed to update listing:", err);
      setError("Could not save your changes. Please try again.");
      setSaving(false);
    }
  }

  return (
    <StaffShell orgOnly title="Edit listing" subtitle="Change the details, price or photo of this item.">
      {!profile?.orgId ? (
        <div className="rounded-xl bg-surface-container p-5 flex items-start gap-3">
          <Info size={22} className="text-tertiary shrink-0 mt-0.5" />
          <p className="text-sm text-on-surface-variant">Listings belong to an organisation, and this account is not attached to one.</p>
        </div>
      ) : problem ? (
        <div className="rounded-xl bg-surface-container p-5 flex items-start gap-3">
          <Info size={22} className="text-tertiary shrink-0 mt-0.5" />
          <p className="text-sm text-on-surface-variant">{problem}</p>
        </div>
      ) : !initial ? (
        <p className="text-on-surface-variant">Loading...</p>
      ) : (
        <ListingForm
          key={id}
          initial={initial}
          submitLabel="Save changes"
          saving={saving}
          error={error}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/staff/marketplace")}
        />
      )}
    </StaffShell>
  );
}
