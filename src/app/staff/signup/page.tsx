"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ArrowLeft, Mail, KeyRound, Eye, EyeOff, CheckCircle2, ShieldCheck } from "lucide-react";

export default function StaffSignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      setDone(true);
    } catch (err: any) {
      if (err?.code === "auth/email-already-in-use") {
        setError("An account with this email already exists. Try signing in instead.");
      } else if (err?.code === "auth/weak-password") {
        setError("Please choose a stronger password (at least 8 characters, and not a common one).");
      } else if (err?.code === "auth/invalid-email") {
        setError("That email address does not look right.");
      } else {
        setError("Could not create the account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface-container-low">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-10 py-6 flex flex-col gap-8">
        <div className="flex items-center justify-between gap-4">
          <img alt="GBVConnect" src="/logo.svg" className="h-9 w-auto" />
          <a href="/staff/login" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container-lowest text-primary text-sm font-semibold shadow-sm hover:bg-surface-container transition-colors">
            <ArrowLeft size={16} />
            Back to sign in
          </a>
        </div>

        <div className="mx-auto w-full max-w-md bg-surface-container-lowest rounded-xl shadow-sm p-6 sm:p-8 flex flex-col gap-5">
          {done ? (
            <div className="flex flex-col items-center text-center gap-3 py-4">
              <div className="w-14 h-14 rounded-full bg-available-bg text-available-text flex items-center justify-center">
                <CheckCircle2 size={28} />
              </div>
              <h1 className="text-2xl font-semibold text-primary">Request sent</h1>
              <p className="text-on-surface-variant leading-relaxed">
                Your account has been created. An administrator needs to approve it and assign your
                organisation before you can use the staff area. Once that is done, sign in as usual.
              </p>
              <a href="/staff/login" className="mt-2 inline-flex items-center justify-center px-6 h-[52px] rounded-xl bg-primary-container text-on-primary font-semibold hover:bg-primary transition-colors">
                Go to sign in
              </a>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0">
                  <ShieldCheck size={26} />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-primary">Request staff access</h1>
                  <p className="text-sm text-on-surface-variant mt-1">
                    For staff of partner organisations. An administrator reviews every request.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="su-email" className="text-sm font-semibold text-on-surface">Email address</label>
                  <div className="relative">
                    <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <input
                      id="su-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@organisation.org"
                      autoComplete="username"
                      required
                      className="w-full h-[52px] pl-12 pr-4 rounded-xl bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/70 border border-border-soft focus:outline-none focus:ring-2 focus:ring-primary-container"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="su-password" className="text-sm font-semibold text-on-surface">Choose a password</label>
                  <div className="relative">
                    <KeyRound size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <input
                      id="su-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      minLength={8}
                      required
                      className="w-full h-[52px] pl-12 pr-12 rounded-xl bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/70 border border-border-soft focus:outline-none focus:ring-2 focus:ring-primary-container"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-on-surface-variant hover:text-primary"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {error && <p className="text-sm text-error font-semibold">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="h-[52px] rounded-xl bg-primary-container text-on-primary font-semibold hover:bg-primary transition-colors shadow-sm disabled:opacity-60"
                >
                  {loading ? "Creating account..." : "Send my request"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
