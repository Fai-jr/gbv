"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";

const STAFF_ROLES = ["ngo_staff", "shelter_staff", "admin"];

export default function NewListingPage() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");

  useEffect(() => {
    if (!loading && (!profile || !STAFF_ROLES.includes(profile.role))) {
      router.replace("/staff/login");
    }
  }, [loading, profile, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile?.orgId) return;
    setStatus("saving");
    try {
      await addDoc(collection(db, "marketplace"), {
        itemName,
        price,
        description,
        contactPhone,
        orgId: profile.orgId,
        createdAt: serverTimestamp(),
      });
      router.push("/staff/marketplace");
    } catch (err) {
      console.error("Failed to add listing:", err);
      setStatus("error");
    }
  }

  if (loading || !profile) return <p className="p-8">Loading...</p>;

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-lg font-medium text-zinc-900">Add Listing</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          placeholder="Item name"
          className="rounded border border-zinc-300 px-3 py-2 text-sm"
          required
        />
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price (e.g. 3000 FCFA)"
          className="rounded border border-zinc-300 px-3 py-2 text-sm"
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description"
          className="rounded border border-zinc-300 px-3 py-2 text-sm"
          rows={3}
        />
        <input
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          placeholder="Contact phone (organization number)"
          className="rounded border border-zinc-300 px-3 py-2 text-sm"
          required
        />

        {status === "error" && (
          <p className="text-sm text-red-600">Could not save. Please try again.</p>
        )}

        <button
          type="submit"
          disabled={status === "saving"}
          className="rounded bg-zinc-900 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {status === "saving" ? "Saving..." : "Add Listing"}
        </button>
      </form>
    </div>
  );
}
