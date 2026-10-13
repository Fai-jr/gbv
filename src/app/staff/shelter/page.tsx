"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, addDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import StaffShell from "@/components/StaffShell";
import { Home as HomeIcon, Plus, Info, UserPlus, UserMinus } from "lucide-react";

type ShelterDoc = {
  id: string;
  name: string;
  capacity?: number;
  occupied?: number;
  capacityStatus?: "available" | "full";
};

const inputClass =
  "w-full h-[48px] rounded-xl border border-border-soft bg-card px-4 text-ink focus:outline-none focus:ring-2 focus:ring-primary-container";

function ShelterCard({
  s,
  onSave,
}: {
  s: ShelterDoc;
  onSave: (id: string, capacity: number, occupied: number) => Promise<string | null>;
}) {
  const hasNumbers = typeof s.capacity === "number";
  const cap = s.capacity ?? 0;
  const occ = s.occupied ?? 0;
  const left = Math.max(0, cap - occ);
  const percent = cap > 0 ? Math.min(100, Math.round((occ / cap) * 100)) : 0;
  const isFull = hasNumbers && left === 0;

  const [capacity, setCapacity] = useState(hasNumbers ? String(cap) : "");
  const [occupied, setOccupied] = useState(String(occ));
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function save(capText: string, occText: string) {
    setMsg("");
    const c = Number(capText);
    const o = Number(occText);
    if (!Number.isInteger(c) || c < 1) {
      setMsg("Total capacity must be a whole number of 1 or more.");
      return;
    }
    if (!Number.isInteger(o) || o < 0) {
      setMsg("Occupied must be a whole number of 0 or more.");
      return;
    }
    if (o > c) {
      setMsg("Occupied cannot be more than the total capacity.");
      return;
    }
    setBusy(true);
    const err = await onSave(s.id, c, o);
    setBusy(false);
    if (err) setMsg(err);
    else {
      setCapacity(String(c));
      setOccupied(String(o));
    }
  }

  return (
    <li className="bg-surface-container-lowest rounded-xl shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0">
            <HomeIcon size={22} />
          </div>
          <span className="text-lg font-semibold text-primary truncate">{s.name}</span>
        </div>
        {hasNumbers && (
          <span
            className={
              "px-3 py-1 rounded-full text-xs font-semibold border shrink-0 " +
              (isFull
                ? "bg-full-bg text-full-text border-full-border"
                : "bg-available-bg text-available-text border-available-border")
            }
          >
            {isFull ? "Full" : "Available"}
          </span>
        )}
      </div>

      {hasNumbers ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-end justify-between">
            <span className="text-4xl font-semibold font-serif text-primary">{left}</span>
            <span className="text-sm text-on-surface-variant">
              spaces left &bull; {occ} of {cap} occupied
            </span>
          </div>
          <div className="h-3 rounded-full bg-surface-container overflow-hidden">
            <div
              className={"h-full rounded-full " + (isFull ? "bg-full-text" : percent >= 80 ? "bg-notice-text" : "bg-available-text")}
              style={{ width: percent + "%" }}
            />
          </div>
        </div>
      ) : (
        <p className="text-sm text-notice-text bg-notice-bg rounded-xl p-3">
          Set the total capacity below to start counting spaces for this shelter.
        </p>
      )}

      {hasNumbers && (
        <div className="grid grid-cols-2 gap-2">
          <button
            disabled={busy || occ >= cap}
            onClick={() => save(String(cap), String(occ + 1))}
            className="inline-flex items-center justify-center gap-2 h-[44px] rounded-xl bg-surface-container text-primary text-sm font-semibold hover:bg-surface-container-high transition-colors disabled:opacity-50"
          >
            <UserPlus size={16} />
            +1 arrival
          </button>
          <button
            disabled={busy || occ <= 0}
            onClick={() => save(String(cap), String(occ - 1))}
            className="inline-flex items-center justify-center gap-2 h-[44px] rounded-xl bg-surface-container text-primary text-sm font-semibold hover:bg-surface-container-high transition-colors disabled:opacity-50"
          >
            <UserMinus size={16} />
            -1 departure
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor={"cap-" + s.id} className="text-xs font-semibold text-on-surface-variant">Total capacity</label>
          <input id={"cap-" + s.id} inputMode="numeric" value={capacity} onChange={(e) => setCapacity(e.target.value)} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={"occ-" + s.id} className="text-xs font-semibold text-on-surface-variant">Currently occupied</label>
          <input id={"occ-" + s.id} inputMode="numeric" value={occupied} onChange={(e) => setOccupied(e.target.value)} className={inputClass} />
        </div>
      </div>
      {msg && <p className="text-sm text-error font-semibold">{msg}</p>}
      <button
        disabled={busy}
        onClick={() => save(capacity, occupied)}
        className="h-[48px] rounded-xl bg-primary-container text-on-primary font-semibold hover:bg-primary transition-colors disabled:opacity-50"
      >
        {busy ? "Saving..." : "Save numbers"}
      </button>
    </li>
  );
}

export default function ShelterCapacityPage() {
  const { profile, loading } = useAuth();
  const orgId = profile?.orgId;
  const allowed = profile?.role === "shelter_staff" || profile?.role === "admin";
  const [shelters, setShelters] = useState<ShelterDoc[]>([]);
  const [name, setName] = useState("");
  const [newCapacity, setNewCapacity] = useState("");
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function fetchShelters() {
    try {
      const snap = await getDocs(query(collection(db, "shelters"), where("orgId", "==", orgId)));
      setShelters(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ShelterDoc, "id">) })));
    } catch (err) {
      console.error("Failed to load shelters:", err);
      setError("Could not load shelters. Please refresh.");
    }
    setFetching(false);
  }

  useEffect(() => {
    if (loading) return;
    if (!allowed || !orgId) {
      setFetching(false);
      return;
    }
    fetchShelters();
  }, [loading, allowed, orgId]);

  async function addShelter(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const c = Number(newCapacity);
    if (!orgId || !name.trim()) return;
    if (!Number.isInteger(c) || c < 1) {
      setError("Total capacity must be a whole number of 1 or more.");
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, "shelters"), {
        name: name.trim(),
        orgId,
        capacity: c,
        occupied: 0,
        capacityStatus: "available",
      });
      setName("");
      setNewCapacity("");
      await fetchShelters();
    } catch (err) {
      console.error("Failed to add shelter:", err);
      setError("Could not add the shelter. Please try again.");
    }
    setSaving(false);
  }

  async function saveNumbers(id: string, capacity: number, occupied: number): Promise<string | null> {
    try {
      const status = occupied >= capacity ? "full" : "available";
      await updateDoc(doc(db, "shelters", id), { capacity, occupied, capacityStatus: status });
      setShelters((prev) =>
        prev.map((x) => (x.id === id ? { ...x, capacity, occupied, capacityStatus: status } : x))
      );
      return null;
    } catch (err) {
      console.error("Failed to update shelter:", err);
      return "Could not save. Please try again.";
    }
  }

  return (
    <StaffShell orgOnly title="Shelters" subtitle="Keep the number of spaces left up to date so referrals go to the right place.">
      {error && <p className="text-sm text-error font-semibold">{error}</p>}

      {!allowed && (
        <div className="rounded-xl bg-surface-container p-5 flex items-start gap-3">
          <Info size={22} className="text-tertiary shrink-0 mt-0.5" />
          <p className="text-sm text-on-surface-variant">Only shelter staff and administrators can manage shelters.</p>
        </div>
      )}

      {allowed && !orgId && (
        <div className="rounded-xl bg-surface-container p-5 flex items-start gap-3">
          <Info size={22} className="text-tertiary shrink-0 mt-0.5" />
          <p className="text-sm text-on-surface-variant">Shelters belong to an organisation, and this account is not attached to one.</p>
        </div>
      )}

      {allowed && orgId && (
        <>
          <form onSubmit={addShelter} className="flex flex-col sm:flex-row gap-3 max-w-3xl">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="New shelter name (no address)"
              className="flex-1 h-[52px] rounded-xl border border-border-soft bg-card px-4 text-ink focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
            <input
              value={newCapacity}
              onChange={(e) => setNewCapacity(e.target.value)}
              inputMode="numeric"
              placeholder="Total capacity"
              className="sm:w-44 h-[52px] rounded-xl border border-border-soft bg-card px-4 text-ink focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
            <button
              type="submit"
              disabled={saving || !name.trim() || !newCapacity.trim()}
              className="inline-flex items-center justify-center gap-2 px-6 h-[52px] rounded-xl bg-primary-container text-on-primary font-semibold hover:bg-primary transition-colors disabled:opacity-50"
            >
              <Plus size={18} />
              Add shelter
            </button>
          </form>

          {fetching && <p className="text-on-surface-variant">Loading...</p>}
          {!fetching && shelters.length === 0 && <p className="text-on-surface-variant">No shelters added yet.</p>}

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {shelters.map((s) => (
              <ShelterCard key={s.id} s={s} onSave={saveNumbers} />
            ))}
          </ul>
        </>
      )}
    </StaffShell>
  );
}
