"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";

const STAFF_ROLES = ["ngo_staff", "shelter_staff", "admin"];

const CATEGORIES = [
  { key: "weaving", label: "Weaving & raffia" },
  { key: "soap", label: "Natural soap & care" },
  { key: "textiles", label: "Textiles & indigo batik" },
  { key: "pottery", label: "Pottery & ceramics" },
  { key: "gifts", label: "Gift baskets" },
];

const PHOTOS = [
  { value: "", label: "No photo" },
  { value: "/marketplace/7.png", label: "Mug and saucer (pottery)" },
  { value: "/marketplace/8.png", label: "Folded batik textiles" },
  { value: "/marketplace/9.png", label: "Botanical soaps" },
  { value: "/marketplace/10.png", label: "Woven basket" },
];

const inputClass =
  "w-full h-[52px] rounded-xl border border-border-soft bg-card px-4 text-ink focus:outline-none focus:ring-2 focus:ring-primary-container";

export default function NewListingPage() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0].key);
  const [photo, setPhoto] = useState("");
  const [customUrl, setCustomUrl] = useState("");
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
        category,
        imageUrl: customUrl.trim() || photo,
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
      <h1 className="mb-1 text-xl font-semibold text-primary">Add Listing</h1>
      <p className="mb-4 text-sm text-muted">
        Do not include the artisan&apos;s name or any location in the title or description.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="Item name" className={inputClass} required />
        <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price (e.g. 12500 FCFA)" className={inputClass} required />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description"
          rows={3}
          className="w-full rounded-xl border border-border-soft bg-card px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-primary-container"
        />
        <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="Contact phone (organisation number)" className={inputClass} required />

        <label htmlFor="category" className="text-sm text-muted">Category</label>
        <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
          {CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>

        <label htmlFor="photo" className="text-sm text-muted">Photo (sample images for now)</label>
        <select id="photo" value={photo} onChange={(e) => setPhoto(e.target.value)} className={inputClass}>
          {PHOTOS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
        <input value={customUrl} onChange={(e) => setCustomUrl(e.target.value)} placeholder="Or an image web address (optional)" className={inputClass} />

        {status === "error" && <p className="text-sm text-error">Could not save. Please try again.</p>}

        <button
          type="submit"
          disabled={status === "saving"}
          className="h-[52px] rounded-xl bg-primary-container text-on-primary font-semibold hover:bg-primary disabled:opacity-50"
        >
          {status === "saving" ? "Saving..." : "Add Listing"}
        </button>
      </form>
    </div>
  );
}
