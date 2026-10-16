"use client";

import { useState } from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { Eye, EyeOff } from "lucide-react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";

type State = "hidden" | "loading" | "shown" | "none" | "error";

export default function RevealIdentity({ uid, context }: { uid: string; context: string }) {
  const { user } = useAuth();
  const [state, setState] = useState<State>("hidden");
  const [name, setName] = useState("");

  async function reveal() {
    if (!user) return;
    const ok = window.confirm(
      "Reveal this member's real name? Only do this when it is necessary, for example to protect someone or to follow up on a safety concern. This lookup is recorded."
    );
    if (!ok) return;
    setState("loading");
    try {
      await setDoc(doc(db, "identityLookups", user.uid + "_" + uid), {
        targetUid: uid,
        by: user.uid,
        context,
        at: serverTimestamp(),
      });
      const snap = await getDoc(doc(db, "memberProfiles", uid));
      if (!snap.exists()) {
        setState("none");
        return;
      }
      const d = snap.data() as { firstName?: string; lastName?: string };
      setName(((d.firstName || "") + " " + (d.lastName || "")).trim());
      setState("shown");
    } catch (err) {
      console.error("Identity lookup failed:", err);
      setState("error");
    }
  }

  function hide() {
    setName("");
    setState("hidden");
  }

  return (
    <div className="flex flex-col gap-1">
      {state === "hidden" && (
        <button
          type="button"
          onClick={reveal}
          className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container text-primary text-xs font-semibold hover:bg-surface-container-high transition-colors"
        >
          <Eye size={14} />
          Reveal identity
        </button>
      )}
      {state === "loading" && <span className="text-xs text-on-surface-variant">Looking up...</span>}
      {state === "shown" && (
        <div className="self-start flex items-center gap-3 px-3 py-1.5 rounded-xl bg-notice-bg text-notice-text text-xs font-semibold">
          <span>{name}</span>
          <button type="button" onClick={hide} className="inline-flex items-center gap-1 underline">
            <EyeOff size={12} />
            Hide
          </button>
        </div>
      )}
      {state === "none" && (
        <span className="text-xs text-on-surface-variant">No name on file (no account, or an account made before names were collected).</span>
      )}
      {state === "error" && <span className="text-xs text-error font-semibold">Could not look this up.</span>}
    </div>
  );
}
