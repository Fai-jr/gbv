"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";

const ALLOWED_ROLES = ["shelter_staff", "admin"];

type ShelterDoc = {
  id: string;
  name: string;
  capacityStatus: "available" | "full";
};

export default function ShelterCapacityPage() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const [shelters, setShelters] = useState<ShelterDoc[]>([]);
  const [name, setName] = useState("");
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && (!profile || !ALLOWED_ROLES.includes(profile.role))) {
      router.replace("/staff/login");
    }
  }, [loading, profile, router]);

  useEffect(() => {
    if (loading || !profile?.orgId) return;
    fetchShelters();
  }, [loading, profile]);

  async function fetchShelters() {
    const q = query(collection(db, "shelters"), where("orgId", "==", profile!.orgId));
    const snap = await getDocs(q);
    setShelters(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ShelterDoc, "id">) })));
    setFetching(false);
  }

  async function addShelter() {
    if (!profile?.orgId || !name.trim()) return;
    setSaving(true);
    await addDoc(collection(db, "shelters"), {
      name,
      orgId: profile.orgId,
      capacityStatus: "available",
    });
    setName("");
    await fetchShelters();
    setSaving(false);
  }

  async function toggleStatus(shelter: ShelterDoc) {
    setSaving(true);
    const newStatus = shelter.capacityStatus === "available" ? "full" : "available";
    await updateDoc(doc(db, "shelters", shelter.id), { capacityStatus: newStatus });
    setShelters((prev) =>
      prev.map((s) => (s.id === shelter.id ? { ...s, capacityStatus: newStatus } : s))
    );
    setSaving(false);
  }

  if (loading || !profile || fetching) return <p className="p-8">Loading...</p>;

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-lg font-medium text-ink">Your Shelters</h1>

      <div className="mb-6 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New shelter name"
          className="flex-1 rounded border border-border-soft px-3 py-2 text-sm"
        />
        <button
          onClick={addShelter}
          disabled={saving || !name.trim()}
          className="rounded bg-plum px-4 py-2 text-sm font-medium text-white hover:bg-plum-dark disabled:opacity-50"
        >
          Add
        </button>
      </div>

      {shelters.length === 0 && (
        <p className="text-sm text-muted">No shelters added yet.</p>
      )}

      <ul className="space-y-3">
        {shelters.map((shelter) => {
          const isAvailable = shelter.capacityStatus === "available";
          return (
            <li key={shelter.id} className="rounded-lg border border-border-soft bg-card p-4 shadow-sm">
              <p className="mb-2 font-medium text-ink">{shelter.name}</p>
              <div
                className={
                  "mb-3 rounded py-2 text-center text-sm font-semibold " +
                  (isAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800")
                }
              >
                {isAvailable ? "Available" : "Full"}
              </div>
              <button
                onClick={() => toggleStatus(shelter)}
                disabled={saving}
                className="w-full rounded bg-plum py-2 text-sm font-medium text-white hover:bg-plum-dark disabled:opacity-50"
              >
                Mark as {isAvailable ? "Full" : "Available"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
