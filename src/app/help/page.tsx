"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";

export default function HelpPage() {
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleAlert() {
    if (!user) return;
    setStatus("sending");
    try {
      await addDoc(collection(db, "alerts"), {
        triggeredBy: user.uid,
        timestamp: serverTimestamp(),
        status: "sent",
      });
      setStatus("sent");
    } catch (err) {
      console.error("Failed to send alert:", err);
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-md p-6 text-center">
      <h1 className="mb-2 text-lg font-medium text-ink">
        Get Help
      </h1>
      <p className="mb-6 text-sm text-muted">
        Tap the button below if you need help right now.
      </p>

      <button
        onClick={handleAlert}
        disabled={authLoading || status === "sending" || status === "sent"}
        className="w-full rounded-lg bg-danger py-3 text-sm font-medium text-white hover:bg-danger-dark disabled:opacity-50"
      >
        {status === "sending" ? "Sending..." : "I need help now"}
      </button>

      {status === "sent" && (
        <p className="mt-4 text-sm text-green-700">
          Help has been notified. Stay safe.
        </p>
      )}
      {status === "error" && (
        <p className="mt-4 text-sm text-red-600">
          Something went wrong. Please try again, or call a contact directly.
        </p>
      )}
    </div>
  );
}
