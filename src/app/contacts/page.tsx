"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";

type Service = {
  id: string;
  name: string;
  type: string;
  phone: string;
  region: string;
};

export default function ContactsPage() {
  const { loading: authLoading } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    async function fetchServices() {
      try {
        const snap = await getDocs(collection(db, "services"));
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Service, "id">),
        }));
        setServices(list);
      } catch (err) {
        console.error("Failed to load services:", err);
        setError("Could not load contacts right now. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, [authLoading]);

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-xl font-semibold text-zinc-900">
        Verified Contacts
      </h1>

      {loading && <p className="text-sm text-zinc-500">Loading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && services.length === 0 && (
        <p className="text-sm text-zinc-500">No contacts available yet.</p>
      )}

      <ul className="space-y-3">
        {services.map((service) => {
          const callLink = "tel:" + service.phone;
          return (
            <li
              key={service.id}
              className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <p className="font-medium text-zinc-900">{service.name}</p>
              <p className="text-sm text-zinc-500">
                {service.type} - {service.region}
              </p>
              <a href={callLink} className="mt-2 inline-block text-sm font-medium text-blue-600">
                Call {service.phone}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
