"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function FeedbackPage() {
  const [reached, setReached] = useState<boolean | null>(null);
  const [helped, setHelped] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    setSaving(true);
    try {
      await addDoc(collection(db, "feedback"), {
        reachedService: reached,
        wasHelped: helped,
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.error("Failed to submit feedback:", err);
    } finally {
      setSubmitted(true);
      setSaving(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-md p-6 text-center">
        <p className="text-sm text-zinc-700">Thank you for letting us know.</p>
      </div>
    );
  }

  const canSubmit = reached !== null && helped !== null;

  return (
    <div className="mx-auto max-w-md p-6 text-center">
      <h1 className="mb-6 text-lg font-medium text-zinc-900">
        Quick, anonymous question
      </h1>

      <p className="mb-3 text-sm text-zinc-600">Did you manage to reach the contact?</p>
      <div className="mb-6 flex justify-center gap-3">
        <button
          onClick={() => setReached(true)}
          className={
            "rounded-lg px-5 py-2 text-sm font-medium " +
            (reached === true ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700")
          }
        >
          Yes
        </button>
        <button
          onClick={() => setReached(false)}
          className={
            "rounded-lg px-5 py-2 text-sm font-medium " +
            (reached === false ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700")
          }
        >
          No
        </button>
      </div>

      <p className="mb-3 text-sm text-zinc-600">Were you helped?</p>
      <div className="mb-8 flex justify-center gap-3">
        <button
          onClick={() => setHelped(true)}
          className={
            "rounded-lg px-5 py-2 text-sm font-medium " +
            (helped === true ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700")
          }
        >
          Yes
        </button>
        <button
          onClick={() => setHelped(false)}
          className={
            "rounded-lg px-5 py-2 text-sm font-medium " +
            (helped === false ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700")
          }
        >
          No
        </button>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!canSubmit || saving}
        className="w-full rounded-lg bg-zinc-900 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
      >
        {saving ? "Submitting..." : "Submit"}
      </button>
    </div>
  );
}
