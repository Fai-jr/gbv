"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { wipeLocalData } from "@/lib/privacy";
import { useAuth } from "@/lib/AuthContext";
import {
  LayoutDashboard,
  FolderOpen,
  Home as HomeIcon,
  Store,
  GraduationCap,
  MessagesSquare,
  Phone,
  UserCog,
  TrendingUp,
  Lock,
  ArrowLeft,
  ShieldCheck,
  User,
} from "lucide-react";

const STAFF_ROLES = ["ngo_staff", "shelter_staff", "admin"];

const NAV = [
  { label: "Dashboard", href: "/staff/dashboard", icon: LayoutDashboard, roles: STAFF_ROLES },
  { label: "Cases", href: "/staff/cases", icon: FolderOpen, roles: ["ngo_staff", "shelter_staff"] },
  { label: "Shelters", href: "/staff/shelter", icon: HomeIcon, roles: ["shelter_staff"] },
  { label: "Marketplace listings", href: "/staff/marketplace", icon: Store, roles: ["ngo_staff", "shelter_staff"] },
  { label: "Community moderation", href: "/staff/community", icon: MessagesSquare, roles: STAFF_ROLES },
  { label: "Training", href: "/staff/training", icon: GraduationCap, roles: STAFF_ROLES },
];

const ADMIN_NAV = [
  { label: "Verified contacts", href: "/admin/services", icon: Phone },
  { label: "Staff accounts", href: "/admin/staff", icon: UserCog },
  { label: "Feedback statistics", href: "/admin/feedback", icon: TrendingUp },
];

const ROLE_LABEL: Record<string, string> = {
  ngo_staff: "NGO staff",
  shelter_staff: "Shelter staff",
  admin: "Administrator",
};

export default function StaffShell({
  title,
  subtitle,
  actions,
  adminOnly,
  orgOnly,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  adminOnly?: boolean;
  orgOnly?: boolean;
  children: React.ReactNode;
}) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isStaff = !!profile && STAFF_ROLES.includes(profile.role);
  const allowed =
    isStaff &&
    (!adminOnly || profile!.role === "admin") &&
    (!orgOnly || profile!.role !== "admin");

  useEffect(() => {
    if (loading || allowed) return;
    router.replace(isStaff ? "/staff/dashboard" : "/staff/login");
  }, [loading, allowed, isStaff, router]);

  useEffect(() => {
    if (!allowed) return;
    const LIMIT = 15 * 60 * 1000;
    let timer = setTimeout(() => wipeLocalData("/staff/login"), LIMIT);
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => wipeLocalData("/staff/login"), LIMIT);
    };
    const events = ["mousemove", "keydown", "click", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [allowed]);

  async function lockNow() {
    await wipeLocalData("/staff/login");
  }

  if (loading || !allowed || !profile) {
    return <p className="p-8 text-on-surface-variant">Loading...</p>;
  }

  const items = NAV.filter((n) => n.roles.includes(profile.role));
  const isAdmin = profile.role === "admin";

  function linkClass(href: string) {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors " +
      (active
        ? "bg-primary-container text-on-primary"
        : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface")
    );
  }

  return (
    <div className="min-h-screen bg-surface-container-low">
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-72 flex-col bg-surface-container-lowest shadow-sm z-40">
        <div className="p-6 flex flex-col gap-5">
          <img alt="GBVConnect" src="/logo.svg" className="h-9 w-auto self-start" />
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low">
            <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0">
              <User size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-on-surface truncate">{user?.email}</p>
              <p className="text-xs text-on-surface-variant truncate">
                {ROLE_LABEL[profile.role]}
                {profile.orgId ? " \u2022 " + profile.orgId : ""}
              </p>
            </div>
          </div>
        </div>

        <nav className="px-4 flex flex-col gap-1 flex-1 overflow-y-auto">
          {items.map((n) => (
            <Link key={n.href} href={n.href} className={linkClass(n.href)}>
              <n.icon size={20} />
              {n.label}
            </Link>
          ))}
          {isAdmin && (
            <>
              <p className="px-4 pt-5 pb-1 text-xs uppercase tracking-wider text-tertiary font-bold">Admin tools</p>
              {ADMIN_NAV.map((n) => (
                <Link key={n.href} href={n.href} className={linkClass(n.href)}>
                  <n.icon size={20} />
                  {n.label}
                </Link>
              ))}
            </>
          )}
        </nav>

        <div className="p-4 flex flex-col gap-2">
          <button
            onClick={lockNow}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-surface-container-highest text-primary text-sm font-semibold hover:bg-surface-container-high transition-colors"
          >
            <Lock size={18} />
            Lock now (sign out)
          </button>
          <Link href="/" className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-primary hover:underline">
            <ArrowLeft size={16} />
            Back to the public site
          </Link>
          <p className="flex items-start gap-2 text-xs text-on-surface-variant px-1 pt-1">
            <ShieldCheck size={14} className="text-tertiary shrink-0 mt-0.5" />
            Secure area. For approved staff only.
          </p>
        </div>
      </aside>

      <div className="lg:ml-72">
        <div className="lg:hidden sticky top-0 z-30 bg-surface-container-lowest shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <img alt="GBVConnect" src="/logo.svg" className="h-8 w-auto" />
            <button
              onClick={lockNow}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container-highest text-primary text-sm font-semibold"
            >
              <Lock size={16} />
              Lock
            </button>
          </div>
          <nav className="flex items-center gap-1 px-3 pb-3 overflow-x-auto">
            {items.map((n) => (
              <Link key={n.href} href={n.href} className={linkClass(n.href) + " whitespace-nowrap px-3 py-2"}>
                <n.icon size={16} />
                {n.label}
              </Link>
            ))}
            {isAdmin &&
              ADMIN_NAV.map((n) => (
                <Link key={n.href} href={n.href} className={linkClass(n.href) + " whitespace-nowrap px-3 py-2"}>
                  <n.icon size={16} />
                  {n.label}
                </Link>
              ))}
          </nav>
        </div>

        <main className="max-w-[1100px] mx-auto px-4 sm:px-8 py-8 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-primary">{title}</h1>
              {subtitle && <p className="text-on-surface-variant mt-1">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
