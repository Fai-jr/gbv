"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function StaffSignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setDone(true);
    } catch (err: any) {
      if (err?.code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else if (err?.code === "auth/weak-password") {
        setError("Please choose a stronger password.");
      } else {
        setError("Could not create the account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-sm p-6 text-center">
        <h1 className="mb-3 text-lg font-medium text-zinc-900">Request sent</h1>
        <p className="text-sm text-zinc-600">
          Your account has been created. An administrator needs to approve it
          before you can access staff features. You will be able to sign in
          once that is done.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg bg-white p-6 shadow">
        <h1 className="mb-4 text-xl font-semibold text-zinc-900">Request Staff Access</h1>

        <label htmlFor="su-email" className="mb-1 block text-sm text-zinc-600">Email</label>
        <input
          id="su-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-3 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
          required
        />

        <label htmlFor="su-password" className="mb-1 block text-sm text-zinc-600">Password</label>
        <input
          id="su-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
          required
          minLength={6}
        />

        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-zinc-900 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>

        <p className="mt-4 text-center text-sm text-zinc-500">
          Already approved?{" "}
          <a href="/staff/login" className="text-blue-600 underline">
            Sign in
          </a>
        </p>
      </form>
    </div>
  );
}
