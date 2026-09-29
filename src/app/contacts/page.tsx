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

const FILTERS = ["all", "legal aid", "medical", "psychosocial", "hotline"];

export default function ContactsPage() {
  const { loading: authLoading } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

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

  const filtered =
    activeFilter === "all"
      ? services
      : services.filter((s) => s.type === activeFilter);

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-xl font-semibold text-ink">
        Verified Contacts
      </h1>

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={
              "rounded-full px-3 py-1 text-sm capitalize " +
              (activeFilter === f
                ? "bg-plum text-white"
                : "bg-tint text-ink")
            }
          >
            {f}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-muted">Loading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <p className="text-sm text-muted">No contacts in this category yet.</p>
      )}

      <ul className="space-y-3">
        {filtered.map((service) => {
          const callLink = "tel:" + service.phone;
          return (
            <li
              key={service.id}
              className="rounded-lg border border-border-soft bg-card p-4 shadow-sm"
            >
              <p className="font-medium text-ink">{service.name}</p>
              <p className="text-sm text-muted">
                {service.type} - {service.region}
              </p>
              <a href={callLink} className="mt-2 inline-block text-sm font-medium text-plum">
                Call {service.phone}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
