"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";

const TYPES = ["hotline", "legal aid", "medical", "psychosocial", "shelter"];

type Service = {
  id: string;
  name: string;
  type: string;
  phone: string;
  region: string;
};

export default function AdminServicesPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [fetching, setFetching] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState(TYPES[0]);
  const [phone, setPhone] = useState("");
  const [region, setRegion] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!loading && (!profile || profile.role !== "admin")) {
      router.replace("/staff/login");
    }
  }, [loading, profile, router]);

  async function fetchServices() {
    const snap = await getDocs(collection(db, "services"));
    const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Service, "id">) }));
    list.sort((a, b) => a.name.localeCompare(b.name));
    setServices(list);
    setFetching(false);
  }

  useEffect(() => {
    if (loading || profile?.role !== "admin") return;
    fetchServices();
  }, [loading, profile]);

  function resetForm() {
    setEditingId(null);
    setName("");
    setType(TYPES[0]);
    setPhone("");
    setRegion("");
  }

  function startEdit(s: Service) {
    setEditingId(s.id);
    setName(s.name);
    setType(s.type);
    setPhone(s.phone);
    setRegion(s.region);
    setMessage("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage("");
    const data = {
      name: name.trim(),
      type,
      phone: phone.trim(),
      region: region.trim(),
      verifiedAt: serverTimestamp(),
      verifiedBy: user.uid,
    };
    try {
      if (editingId) {
        await updateDoc(doc(db, "services", editingId), data);
      } else {
        await addDoc(collection(db, "services"), data);
      }
      resetForm();
      await fetchServices();
      setMessage("Saved.");
    } catch (err) {
      console.error("Failed to save contact:", err);
      setMessage("Could not save. Please try again.");
    }
    setSaving(false);
  }

  async function handleDelete(s: Service) {
    if (!window.confirm("Delete " + s.name + "?")) return;
    try {
      await deleteDoc(doc(db, "services", s.id));
      setServices((prev) => prev.filter((x) => x.id !== s.id));
    } catch (err) {
      console.error("Failed to delete contact:", err);
      setMessage("Could not delete. Please try again.");
    }
  }

  if (loading || !profile) return <p className="p-8">Loading...</p>;

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-1 text-lg font-medium text-zinc-900">Verified Contacts</h1>
      <p className="mb-4 text-sm text-zinc-600">
        Only add a contact after you have called the number and confirmed it works.
        Saving records the date and who verified it.
      </p>

      <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4">
        <p className="text-sm font-medium text-zinc-900">
          {editingId ? "Edit contact" : "Add a contact"}
        </p>

        <div>
          <label htmlFor="svc-name" className="mb-1 block text-sm text-zinc-600">Name</label>
          <input
            id="svc-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border border-zinc-300 px-3 py-2 text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="svc-type" className="mb-1 block text-sm text-zinc-600">Type</label>
          <select
            id="svc-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded border border-zinc-300 px-3 py-2 text-sm"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="svc-phone" className="mb-1 block text-sm text-zinc-600">Phone (with country code)</label>
          <input
            id="svc-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded border border-zinc-300 px-3 py-2 text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="svc-region" className="mb-1 block text-sm text-zinc-600">Region</label>
          <input
            id="svc-region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full rounded border border-zinc-300 px-3 py-2 text-sm"
            required
          />
        </div>

        <p className="text-xs text-amber-700">
          For shelters, enter a phone number only. Never enter a street address here.
        </p>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded bg-zinc-900 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {saving ? "Saving..." : editingId ? "Save changes" : "Add contact"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200"
            >
              Cancel
            </button>
          )}
        </div>

        {message && <p className="text-sm text-zinc-700">{message}</p>}
      </form>

      {fetching && <p className="text-sm text-zinc-500">Loading...</p>}
      {!fetching && services.length === 0 && (
        <p className="text-sm text-zinc-500">No contacts yet.</p>
      )}

      <ul className="space-y-3">
        {services.map((s) => (
          <li key={s.id} className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="font-medium text-zinc-900">{s.name}</p>
            <p className="text-sm text-zinc-500">
              {s.type} - {s.region}
            </p>
            <p className="text-sm text-zinc-700">{s.phone}</p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => startEdit(s)}
                className="rounded bg-zinc-100 px-3 py-1 text-sm text-zinc-700 hover:bg-zinc-200"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(s)}
                className="rounded bg-red-50 px-3 py-1 text-sm text-red-700 hover:bg-red-100"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
