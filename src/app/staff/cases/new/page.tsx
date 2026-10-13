"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import StaffShell from "@/components/StaffShell";
import { ShieldAlert, Info } from "lucide-react";

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

const inputClass =
  "w-full h-[52px] rounded-xl border border-border-soft bg-card px-4 text-ink focus:outline-none focus:ring-2 focus:ring-primary-container";

export default function NewCasePage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [incidentType, setIncidentType] = useState(INCIDENT_TYPES[0]);
  const [ageGroup, setAgeGroup] = useState("18 or over");
  const [services, setServices] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");

  function toggleService(s: string) {
    setServices((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  function cancel() {
    const dirty = services.length > 0 || notes.trim() !== "" || consent;
    if (dirty && !window.confirm("Discard this case? Nothing has been saved.")) return;
    router.push("/staff/cases");
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

  return (
    <StaffShell orgOnly title="New case" subtitle="Record a case by code. Do not record who the survivor is.">
      {!profile?.orgId ? (
        <div className="rounded-xl bg-surface-container p-5 flex items-start gap-3">
          <Info size={22} className="text-tertiary shrink-0 mt-0.5" />
          <p className="text-sm text-on-surface-variant">Cases belong to an organisation, and this account is not attached to one.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-2xl bg-surface-container-lowest rounded-xl shadow-sm p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="incidentType" className="text-sm font-semibold text-on-surface">Type of incident</label>
            <select id="incidentType" value={incidentType} onChange={(e) => setIncidentType(e.target.value)} className={inputClass}>
              {INCIDENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="ageGroup" className="text-sm font-semibold text-on-surface">Age group</label>
            <select id="ageGroup" value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} className={inputClass}>
              <option value="18 or over">18 or over</option>
              <option value="under 18">Under 18</option>
            </select>
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-semibold text-on-surface mb-1">Services provided</legend>
            <div className="flex flex-wrap gap-2">
              {SERVICES.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => toggleService(s)}
                  className={
                    "px-4 py-2 rounded-full text-sm font-semibold capitalize transition-all " +
                    (services.includes(s)
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high")
                  }
                >
                  {s}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="notes" className="text-sm font-semibold text-on-surface">Notes</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-border-soft bg-card px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
            <div className="flex items-start gap-2 p-3 rounded-xl bg-notice-bg text-notice-text text-xs">
              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
              <span>
                Do not enter names, phone numbers, addresses or anything that could identify the survivor.
                Use the case code to link records.
              </span>
            </div>
          </div>

          <label className="flex items-start gap-3 p-4 rounded-xl bg-surface-container-low cursor-pointer">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 w-5 h-5 accent-[#4A3B52]" />
            <span className="text-sm text-on-surface">
              <strong>The survivor has been told what is being recorded and has agreed to it.</strong>
            </span>
          </label>

          {status === "error" && <p className="text-sm text-error font-semibold">Could not save the case. Please try again.</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={!consent || status === "saving"}
              className="flex-1 h-[52px] rounded-xl bg-primary-container text-on-primary font-semibold hover:bg-primary transition-colors disabled:opacity-50"
            >
              {status === "saving" ? "Saving..." : "Save case"}
            </button>
            <button
              type="button"
              onClick={cancel}
              className="px-6 h-[52px] rounded-xl bg-surface-container text-primary font-semibold hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </StaffShell>
  );
}
