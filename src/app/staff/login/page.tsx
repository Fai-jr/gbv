"use client";

import { describeAuthError } from "@/lib/authErrors";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import {
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  Lock,
  ArrowLeft,
  LogIn,
  ShieldAlert,
  Building2,
  UserX,
  ClipboardCheck,
} from "lucide-react";

const FACTS = [
  { icon: Building2, title: "Your organisation only", body: "You can only see cases and shelters that belong to your own organisation." },
  { icon: UserX, title: "No survivor names", body: "Cases are tracked by a short code. Names and contact details are never stored." },
  { icon: ClipboardCheck, title: "Consent comes first", body: "A case cannot be saved until the survivor's consent has been confirmed." },
];

export default function StaffLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [shared, setShared] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      await setPersistence(auth, shared ? browserSessionPersistence : browserLocalPersistence);
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const snap = await getDoc(doc(db, "users", cred.user.uid));
      const role = snap.exists() ? snap.data().role : "survivor";
      if (!["ngo_staff", "shelter_staff", "admin"].includes(role)) {
        await signOut(auth);
        setError("This account has not been approved for staff access. Please ask an administrator to approve it.");
        return;
      }
      router.push("/staff/dashboard");
    } catch (err: any) {
      if (err?.code === "auth/too-many-requests") {
        setError("Too many attempts. Please wait a few minutes and try again.");
      } else {
        setError(describeAuthError(err));
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    setError("");
    setInfo("");
    if (!email.trim()) {
      setError("Enter your email address first, then choose Forgot password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch {
      // Same message either way, so this form never reveals which emails have accounts.
    }
    setInfo("If an account exists for this email, a reset link has been sent.");
  }

  return (
    <div className="min-h-screen bg-surface-container-low">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-10 py-6 flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <img alt="GBVConnect" src="/logo.svg" className="h-9 w-auto" />
          <div className="flex items-center gap-2">
            <a href="/" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container-lowest text-primary text-sm font-semibold shadow-sm hover:bg-surface-container transition-colors">
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Back to the public site</span>
              <span className="sm:hidden">Back</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <section className="lg:col-span-5 rounded-xl bg-primary text-on-primary p-8 shadow-md flex flex-col justify-between gap-8 relative overflow-hidden">
            <div className="absolute -right-16 -bottom-16 w-72 h-72 rounded-full bg-primary-container/60 blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col gap-4">
              <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-primary-container text-on-primary-container text-xs uppercase tracking-wider font-semibold">
                <Lock size={14} />
                Partner organisation network
              </div>
              <h1 className="text-3xl sm:text-4xl font-semibold leading-tight">
                Support with dignity, protect without compromise.
              </h1>
              <p className="text-on-primary-container leading-relaxed">
                This area is for approved staff of partner organisations. It gives access to your
                organisation&apos;s cases, shelter availability, training and verified contacts.
              </p>
            </div>
            <ul className="relative z-10 flex flex-col gap-3">
              {FACTS.map((f) => (
                <li key={f.title} className="flex items-start gap-3 p-4 rounded-xl bg-primary-container/60">
                  <f.icon size={22} className="text-primary-fixed shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">{f.title}</p>
                    <p className="text-sm text-on-primary-container">{f.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="lg:col-span-7 rounded-xl bg-surface-container-lowest p-6 sm:p-10 shadow-sm flex flex-col justify-center gap-6">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0">
                <ShieldCheck size={26} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-primary">Staff &amp; coordination sign-in</h2>
                <p className="text-on-surface-variant mt-1">
                  Use the email address your administrator approved.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="staff-email" className="text-sm font-semibold text-on-surface">Email address</label>
                <div className="relative">
                  <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input
                    id="staff-email"
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
                <div className="flex items-center justify-between">
                  <label htmlFor="staff-password" className="text-sm font-semibold text-on-surface">Password</label>
                  <button type="button" onClick={handleReset} className="text-sm font-semibold text-primary hover:underline">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <KeyRound size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input
                    id="staff-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    autoComplete="current-password"
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

              <label className="flex items-start gap-3 p-4 rounded-xl bg-surface-container-low cursor-pointer">
                <input
                  type="checkbox"
                  checked={shared}
                  onChange={(e) => setShared(e.target.checked)}
                  className="mt-1 w-5 h-5 accent-[#4A3B52]"
                />
                <span className="flex flex-col">
                  <span className="text-sm font-semibold text-on-surface">Shared computer or phone</span>
                  <span className="text-xs text-on-surface-variant">
                    Do not keep me signed in. My session ends as soon as I close this tab.
                  </span>
                </span>
              </label>

              {error && <p className="text-sm text-error font-semibold">{error}</p>}
              {info && <p className="text-sm text-available-text font-semibold">{info}</p>}

              <button
                type="submit"
                disabled={loading}
                className="h-[52px] rounded-xl bg-primary-container text-on-primary font-semibold flex items-center justify-center gap-2 hover:bg-primary transition-colors shadow-sm disabled:opacity-60"
              >
                <LogIn size={20} />
                {loading ? "Signing in..." : "Open the dashboard"}
              </button>
            </form>

            <p className="text-sm text-on-surface-variant text-center">
              No access yet?{" "}
              <a href="/staff/signup" className="font-semibold text-primary underline decoration-tertiary">
                Request staff access
              </a>
            </p>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-notice-bg text-notice-text">
              <ShieldAlert size={22} className="shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-bold">Professional confidentiality</p>
                <p className="leading-relaxed">
                  Never share a survivor&apos;s identity, a shelter&apos;s location, or medical details outside
                  your organisation&apos;s procedures.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
