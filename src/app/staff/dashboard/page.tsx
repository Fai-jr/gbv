"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";

const STAFF_ROLES = ["ngo_staff", "shelter_staff", "admin"];
const SHELTER_ROLES = ["shelter_staff", "admin"];

export default function StaffDashboard() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!profile || !STAFF_ROLES.includes(profile.role))) {
      router.replace("/staff/login");
    }
  }, [loading, profile, router]);

  async function handleLogout() {
    await signOut(auth);
    router.replace("/staff/login");
  }

  if (loading || !profile || !STAFF_ROLES.includes(profile.role)) {
    return <p className="p-8">Loading...</p>;
  }

  const links = [
    { label: "Cases", href: "/staff/cases", show: true },
    { label: "Marketplace listings", href: "/staff/marketplace", show: true },
    { label: "Shelters", href: "/staff/shelter", show: SHELTER_ROLES.includes(profile.role) },
    { label: "Training", href: "/staff/training", show: true },
    { label: "Manage verified contacts", href: "/admin/services", show: profile.role === "admin" },
    { label: "Staff accounts", href: "/admin/staff", show: profile.role === "admin" },
    { label: "Feedback statistics", href: "/admin/feedback", show: profile.role === "admin" },
  ];

  return (
    <div className="mx-auto max-w-md p-8">
      <h1 className="text-xl font-semibold">Staff Dashboard</h1>
      <p className="mt-2 text-sm text-muted">Signed in as: {user?.email}</p>
      <p className="text-sm text-muted">Role: {profile.role}</p>
      <p className="text-sm text-muted">Org: {profile.orgId}</p>

      <div className="mt-6 flex flex-col gap-3">
        {links
          .filter((l) => l.show)
          .map((l) => (
            <button
              key={l.href}
              onClick={() => router.push(l.href)}
              className="rounded-lg bg-tint py-3 text-sm font-medium text-ink hover:bg-tint-hover"
            >
              {l.label}
            </button>
          ))}
      </div>

      <button
        onClick={handleLogout}
        className="mt-6 rounded bg-plum px-4 py-2 text-sm font-medium text-white hover:bg-plum-dark"
      >
        Log out
      </button>
    </div>
  );
}
