"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";

type Service = {
  id: string;
  name: string;
  phone: string;
  region: string;
};

export default function RefugePage() {
  const { loading: authLoading } = useAuth();
  const [contacts, setContacts] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    async function fetchRefuge() {
      try {
        const q = query(collection(db, "services"), where("type", "==", "shelter"));
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Service, "id">),
        }));
        setContacts(list);
      } catch (err) {
        console.error("Failed to load refuge contacts:", err);
        setError("Could not load this right now. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchRefuge();
  }, [authLoading]);

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-2 text-xl font-semibold text-zinc-900">
        Find a Safe Place
      </h1>
      <p className="mb-6 text-sm text-zinc-600">
        Call one of these verified contacts. They will talk with you privately
        and arrange a safe way to reach a shelter. Nothing is shared with
        anyone else, and no location is sent from this app.
      </p>

      {loading && <p className="text-sm text-zinc-500">Loading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && contacts.length === 0 && (
        <p className="text-sm text-zinc-500">
          No verified contacts available in your area yet. Please try the
          general contacts page.
        </p>
      )}

      <ul className="space-y-3">
        {contacts.map((c) => {
          const callLink = "tel:" + c.phone;
          return (
            <li
              key={c.id}
              className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <p className="font-medium text-zinc-900">{c.name}</p>
              <p className="text-sm text-zinc-500">{c.region}</p>
              <a href={callLink} className="mt-2 inline-block text-sm font-medium text-blue-600">
                Call {c.phone}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
