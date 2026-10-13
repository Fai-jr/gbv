"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import StaffShell from "@/components/StaffShell";
import ListingForm, { EMPTY_LISTING, ListingValues } from "@/components/ListingForm";
import { Info } from "lucide-react";

export default function NewListingPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(v: ListingValues) {
    if (!profile?.orgId) return;
    setSaving(true);
    setError("");
    try {
      await addDoc(collection(db, "marketplace"), {
        ...v,
        orgId: profile.orgId,
        createdAt: serverTimestamp(),
      });
      router.push("/staff/marketplace");
    } catch (err) {
      console.error("Failed to add listing:", err);
      setError("Could not save. Please try again.");
      setSaving(false);
    }
  }

  return (
    <StaffShell orgOnly title="Add listing" subtitle="List an item for sale through your organisation.">
      {!profile?.orgId ? (
        <div className="rounded-xl bg-surface-container p-5 flex items-start gap-3">
          <Info size={22} className="text-tertiary shrink-0 mt-0.5" />
          <p className="text-sm text-on-surface-variant">Listings belong to an organisation, and this account is not attached to one.</p>
        </div>
      ) : (
        <ListingForm
          initial={EMPTY_LISTING}
          submitLabel="Add listing"
          saving={saving}
          error={error}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/staff/marketplace")}
        />
      )}
    </StaffShell>
  );
}
