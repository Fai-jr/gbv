"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import StaffShell from "@/components/StaffShell";
import { Home as HomeIcon, Plus, Info, UserPlus, UserMinus, Globe } from "lucide-react";

type ShelterDoc = {
  id: string;
  name: string;
  capacity?: number;
  occupied?: number;
  capacityStatus?: "available" | "full";
  phone?: string;
  listed?: boolean;
};
type Values = { capacity: number; occupied: number; phone: string; listed: boolean };
type OrgMeta = { name: string; region: string };

const PHONE = /^\+?[0-9\s().-]{6,}$/;

const inputClass =
  "w-full h-[48px] rounded-xl border border-border-soft bg-card px-4 text-ink focus:outline-none focus:ring-2 focus:ring-primary-container";

function ShelterCard({
  s,
  onSave,
}: {
  s: ShelterDoc;
  onSave: (id: string, v: Values) => Promise<string | null>;
}) {
  const hasNumbers = typeof s.capacity === "number";
  const cap = s.capacity ?? 0;
  const occ = s.occupied ?? 0;
  const left = Math.max(0, cap - occ);
  const percent = cap > 0 ? Math.min(100, Math.round((occ / cap) * 100)) : 0;
  const isFull = hasNumbers && left === 0;

  const [capacity, setCapacity] = useState(hasNumbers ? String(cap) : "");
  const [occupied, setOccupied] = useState(String(occ));
  const [phone, setPhone] = useState(s.phone ?? "");
  const [listed, setListed] = useState(s.listed !== false);
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  async function save(capText: string, occText: string, phoneText: string, listedValue: boolean) {
    setMsg("");
    setOk(false);
    const c = Number(capText);
    const o = Number(occText);
    const p = phoneText.trim();
    if (!Number.isInteger(c) || c < 1) return setMsg("Total capacity must be a whole number of 1 or more.");
    if (!Number.isInteger(o) || o < 0) return setMsg("Occupied must be a whole number of 0 or more.");
    if (o > c) return setMsg("Occupied cannot be more than the total capacity.");
    if (p && !PHONE.test(p)) return setMsg("Please enter a valid phone number, or leave it empty.");
    setBusy(true);
    const err = await onSave(s.id, { capacity: c, occupied: o, phone: p, listed: listedValue });
    setBusy(false);
    if (err) {
      setMsg(err);
    } else {
      setCapacity(String(c));
      setOccupied(String(o));
      setPhone(p);
      setOk(true);
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
            onClick={() => save(String(cap), String(occ + 1), s.phone ?? "", s.listed !== false)}
            className="inline-flex items-center justify-center gap-2 h-[44px] rounded-xl bg-surface-container text-primary text-sm font-semibold hover:bg-surface-container-high transition-colors disabled:opacity-50"
          >
            <UserPlus size={16} />
            +1 arrival
          </button>
          <button
            disabled={busy || occ <= 0}
            onClick={() => save(String(cap), String(occ - 1), s.phone ?? "", s.listed !== false)}
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

      <div className="flex flex-col gap-3 p-4 rounded-xl bg-surface-container-low">
        <label className="flex items-center gap-2 text-sm font-semibold text-on-surface cursor-pointer">
          <input type="checkbox" checked={listed} onChange={(e) => setListed(e.target.checked)} className="w-5 h-5 accent-[#4A3B52]" />
          <Globe size={16} className="text-tertiary" />
          Show on the public refuge page
        </label>
        <div className="flex flex-col gap-1">
          <label htmlFor={"ph-" + s.id} className="text-xs font-semibold text-on-surface-variant">Phone number survivors can call (optional)</label>
          <input id={"ph-" + s.id} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+237..." className={inputClass} />
        </div>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Survivors see: this name, your organisation&apos;s name and region, whether there is space and how many
          spaces are left, and this phone number. They never see an address, who lives here, or any case details.
        </p>
      </div>

      {msg && <p className="text-sm text-error font-semibold">{msg}</p>}
      {ok && <p className="text-sm text-available-text font-semibold">Saved.</p>}
      <button
        disabled={busy}
        onClick={() => save(capacity, occupied, phone, listed)}
        className="h-[48px] rounded-xl bg-primary-container text-on-primary font-semibold hover:bg-primary transition-colors disabled:opacity-50"
      >
        {busy ? "Saving..." : "Save changes"}
      </button>
    </li>
  );
}

export default function ShelterCapacityPage() {
  const { profile, loading } = useAuth();
  const orgId = profile?.orgId;
  const allowed = profile?.role === "shelter_staff" || profile?.role === "admin";
  const [shelters, setShelters] = useState<ShelterDoc[]>([]);
  const [meta, setMeta] = useState<OrgMeta | null>(null);
  const [name, setName] = useState("");
  const [newCapacity, setNewCapacity] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadMeta(): Promise<OrgMeta> {
    try {
      const snap = await getDoc(doc(db, "organisations", orgId as string));
      if (snap.exists()) {
        const d = snap.data() as { name?: string; region?: string };
        return { name: d.name || (orgId as string), region: d.region || "" };
      }
    } catch {}
    return { name: orgId as string, region: "" };
  }

  async function pushPublic(s: ShelterDoc, m: OrgMeta) {
    const ref = doc(db, "publicShelters", s.id);
    if (s.listed === false || typeof s.capacity !== "number") {
      try {
        await deleteDoc(ref);
      } catch {}
      return;
    }
    const spaces = Math.max(0, s.capacity - (s.occupied ?? 0));
    await setDoc(ref, {
      orgId,
      orgName: m.name,
      name: s.name,
      region: m.region,
      phone: s.phone ?? "",
      spacesLeft: spaces,
      full: spaces === 0,
      updatedAt: serverTimestamp(),
    });
  }

  async function syncAll(list: ShelterDoc[], m: OrgMeta) {
    try {
      const snap = await getDocs(query(collection(db, "publicShelters"), where("orgId", "==", orgId)));
      const existing = new Map(snap.docs.map((d) => [d.id, d.data()]));
      for (const s of list) {
        const wanted = s.listed !== false && typeof s.capacity === "number";
        const ex = existing.get(s.id);
        if (!wanted) {
          if (ex) await deleteDoc(doc(db, "publicShelters", s.id));
          continue;
        }
        const spaces = Math.max(0, (s.capacity as number) - (s.occupied ?? 0));
        const same =
          ex &&
          ex.name === s.name &&
          ex.orgName === m.name &&
          ex.region === m.region &&
          ex.phone === (s.phone ?? "") &&
          ex.spacesLeft === spaces &&
          ex.full === (spaces === 0);
        if (!same) await pushPublic(s, m);
      }
      for (const id of existing.keys()) {
        if (!list.some((s) => s.id === id)) await deleteDoc(doc(db, "publicShelters", id));
      }
    } catch (err) {
      console.error("Could not update the public refuge list:", err);
    }
  }

  async function fetchShelters() {
    try {
      const [snap, m] = await Promise.all([
        getDocs(query(collection(db, "shelters"), where("orgId", "==", orgId))),
        loadMeta(),
      ]);
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ShelterDoc, "id">) }));
      setShelters(list);
      setMeta(m);
      await syncAll(list, m);
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
    const p = newPhone.trim();
    if (!orgId || !name.trim()) return;
    if (!Number.isInteger(c) || c < 1) {
      setError("Total capacity must be a whole number of 1 or more.");
      return;
    }
    if (p && !PHONE.test(p)) {
      setError("Please enter a valid phone number, or leave it empty.");
      return;
    }
    setSaving(true);
    try {
      const ref = await addDoc(collection(db, "shelters"), {
        name: name.trim(),
        orgId,
        capacity: c,
        occupied: 0,
        capacityStatus: "available",
        phone: p,
        listed: true,
      });
      const created: ShelterDoc = { id: ref.id, name: name.trim(), capacity: c, occupied: 0, capacityStatus: "available", phone: p, listed: true };
      setShelters((prev) => [...prev, created]);
      const m = meta ?? (await loadMeta());
      await pushPublic(created, m);
      setName("");
      setNewCapacity("");
      setNewPhone("");
    } catch (err) {
      console.error("Failed to add shelter:", err);
      setError("Could not add the shelter. Please try again.");
    }
    setSaving(false);
  }

  async function saveValues(id: string, v: Values): Promise<string | null> {
    const status = v.occupied >= v.capacity ? "full" : "available";
    try {
      await updateDoc(doc(db, "shelters", id), {
        capacity: v.capacity,
        occupied: v.occupied,
        capacityStatus: status,
        phone: v.phone,
        listed: v.listed,
      });
    } catch (err) {
      console.error("Failed to update shelter:", err);
      return "Could not save. Please try again.";
    }
    const current = shelters.find((x) => x.id === id);
    const next: ShelterDoc = {
      ...(current as ShelterDoc),
      capacity: v.capacity,
      occupied: v.occupied,
      capacityStatus: status,
      phone: v.phone,
      listed: v.listed,
    };
    setShelters((prev) => prev.map((x) => (x.id === id ? next : x)));
    try {
      await pushPublic(next, meta ?? (await loadMeta()));
    } catch (err) {
      console.error("Failed to update the refuge page:", err);
      return "Saved, but the public refuge page could not be updated. Please save again.";
    }
    return null;
  }

  return (
    <StaffShell title="Shelters" subtitle="Keep the number of spaces left up to date so people can find a place.">
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
          <div className="flex items-start gap-3 p-4 rounded-xl bg-notice-bg text-notice-text max-w-3xl">
            <Info size={20} className="shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed">
              Shelters you tick as public are shown on the survivor refuge page. Choose a name that does not reveal
              the shelter&apos;s location, and never put an address anywhere.
            </p>
          </div>

          <form onSubmit={addShelter} className="flex flex-col sm:flex-row gap-3 max-w-4xl">
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
              className="sm:w-40 h-[52px] rounded-xl border border-border-soft bg-card px-4 text-ink focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
            <input
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="Public phone (optional)"
              className="sm:w-52 h-[52px] rounded-xl border border-border-soft bg-card px-4 text-ink focus:outline-none focus:ring-2 focus:ring-primary-container"
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
              <ShelterCard key={s.id} s={s} onSave={saveValues} />
            ))}
          </ul>
        </>
      )}
    </StaffShell>
  );
}
