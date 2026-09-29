"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";

const STAFF_ROLES = ["ngo_staff", "shelter_staff", "admin"];

const INCIDENT_TYPES = [
  "physical violence",
  "sexual violence",
  "emotional or psychological abuse",
  "economic abuse",
  "harmful practice (e.g. forced or early marriage)",
  "other",
];

const SERVICES = ["medical", "psychosocial", "legal", "shelter", "livelihood support"];

function makeCaseCode() {
  return "C-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

export default function NewCasePage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [incidentType, setIncidentType] = useState(INCIDENT_TYPES[0]);
  const [ageGroup, setAgeGroup] = useState("18 or over");
  const [services, setServices] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");

  useEffect(() => {
    if (!loading && (!profile || !STAFF_ROLES.includes(profile.role))) {
      router.replace("/staff/login");
    }
  }, [loading, profile, router]);

  function toggleService(s: string) {
    setServices((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile?.orgId || !user || !consent) return;
    setStatus("saving");
    try {
      await addDoc(collection(db, "cases"), {
        caseCode: makeCaseCode(),
        orgId: profile.orgId,
        createdBy: user.uid,
        incidentType,
        ageGroup,
        servicesProvided: services,
        notes,
        consentGiven: true,
        status: "open",
        createdAt: serverTimestamp(),
      });
      router.push("/staff/cases");
    } catch (err) {
      console.error("Failed to save case:", err);
      setStatus("error");
    }
  }

  if (loading || !profile) return <p className="p-8">Loading...</p>;

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-lg font-medium text-ink">New Case</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="incidentType" className="mb-1 block text-sm text-muted">
            Type of incident
          </label>
          <select
            id="incidentType"
            value={incidentType}
            onChange={(e) => setIncidentType(e.target.value)}
            className="w-full rounded border border-border-soft px-3 py-2 text-sm"
          >
            {INCIDENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="ageGroup" className="mb-1 block text-sm text-muted">
            Age group
          </label>
          <select
            id="ageGroup"
            value={ageGroup}
            onChange={(e) => setAgeGroup(e.target.value)}
            className="w-full rounded border border-border-soft px-3 py-2 text-sm"
          >
            <option value="18 or over">18 or over</option>
            <option value="under 18">Under 18</option>
          </select>
        </div>

        <fieldset>
          <legend className="mb-1 text-sm text-muted">Services provided</legend>
          <div className="flex flex-wrap gap-2">
            {SERVICES.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => toggleService(s)}
                className={
                  "rounded-full px-3 py-1 text-sm " +
                  (services.includes(s)
                    ? "bg-plum text-white"
                    : "bg-tint text-ink")
                }
              >
                {s}
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="notes" className="mb-1 block text-sm text-muted">
            Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full rounded border border-border-soft px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-amber-700">
            Do not enter names, phone numbers, addresses or anything that could
            identify the survivor. Use the case code to link records.
          </p>
        </div>

        <label className="flex items-start gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1"
          />
          <span>
            The survivor has been told what is being recorded and has agreed to
            it.
          </span>
        </label>

        {status === "error" && (
          <p className="text-sm text-red-600">Could not save the case. Please try again.</p>
        )}

        <button
          type="submit"
          disabled={!consent || status === "saving"}
          className="rounded bg-plum py-2 text-sm font-medium text-white hover:bg-plum-dark disabled:opacity-50"
        >
          {status === "saving" ? "Saving..." : "Save case"}
        </button>
      </form>
    </div>
  );
}
