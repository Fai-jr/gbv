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
        <p className="text-sm text-ink">Thank you for letting us know.</p>
      </div>
    );
  }

  const canSubmit = reached !== null && helped !== null;

  return (
    <div className="mx-auto max-w-md p-6 text-center">
      <h1 className="mb-6 text-lg font-medium text-ink">
        Quick, anonymous question
      </h1>

      <p className="mb-3 text-sm text-muted">Did you manage to reach the contact?</p>
      <div className="mb-6 flex justify-center gap-3">
        <button
          onClick={() => setReached(true)}
          className={
            "rounded-lg px-5 py-2 text-sm font-medium " +
            (reached === true ? "bg-plum text-white" : "bg-tint text-ink")
          }
        >
          Yes
        </button>
        <button
          onClick={() => setReached(false)}
          className={
            "rounded-lg px-5 py-2 text-sm font-medium " +
            (reached === false ? "bg-plum text-white" : "bg-tint text-ink")
          }
        >
          No
        </button>
      </div>

      <p className="mb-3 text-sm text-muted">Were you helped?</p>
      <div className="mb-8 flex justify-center gap-3">
        <button
          onClick={() => setHelped(true)}
          className={
            "rounded-lg px-5 py-2 text-sm font-medium " +
            (helped === true ? "bg-plum text-white" : "bg-tint text-ink")
          }
        >
          Yes
        </button>
        <button
          onClick={() => setHelped(false)}
          className={
            "rounded-lg px-5 py-2 text-sm font-medium " +
            (helped === false ? "bg-plum text-white" : "bg-tint text-ink")
          }
        >
          No
        </button>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!canSubmit || saving}
        className="w-full rounded-lg bg-plum py-2 text-sm font-medium text-white hover:bg-plum-dark disabled:opacity-50"
      >
        {saving ? "Submitting..." : "Submit"}
      </button>
    </div>
  );
}
