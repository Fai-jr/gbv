"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useLang } from "@/lib/i18n";
import { GATED } from "@/lib/access";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Lock, Phone, UserPlus, LogIn } from "lucide-react";

export default function MemberGate({
  area,
  active,
  children,
}: {
  area: "chat" | "community";
  active: string;
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const { t } = useLang();
  const pathname = usePathname();

  if (!GATED[area]) return <>{children}</>;
  if (!loading && user && !user.isAnonymous) return <>{children}</>;

  const next = encodeURIComponent(pathname || "/");

  return (
    <>
      <SiteHeader active={active} />
      <main className="w-full pt-32 pb-24 bg-surface-container-low min-h-[70vh]">
        <div className="max-w-[640px] mx-auto px-4 sm:px-10 py-8">
          {loading ? (
            <p className="text-on-surface-variant">{t("Loading...")}</p>
          ) : (
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6 sm:p-8 flex flex-col gap-5">
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                <Lock size={24} />
              </div>
              <h1 className="text-2xl font-semibold text-primary">{t("Create a free account to continue")}</h1>
              <p className="text-on-surface-variant leading-relaxed">
                {t("The private chat and the community are for registered members. This keeps these spaces safer for everyone. Your account details are never shown in the chat or the community: you always appear under a made-up name.")}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={"/account/register?next=" + next}
                  className="flex-1 inline-flex items-center justify-center gap-2 h-[52px] rounded-xl bg-primary-container text-on-primary font-semibold hover:bg-primary transition-colors"
                >
                  <UserPlus size={18} />
                  {t("Create an account")}
                </Link>
                <Link
                  href={"/account/login?next=" + next}
                  className="flex-1 inline-flex items-center justify-center gap-2 h-[52px] rounded-xl bg-surface-container text-primary font-semibold hover:bg-surface-container-high transition-colors"
                >
                  <LogIn size={18} />
                  {t("I already have an account")}
                </Link>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-notice-bg text-notice-text text-sm">
                <Phone size={18} className="shrink-0 mt-0.5" />
                <span className="leading-relaxed">{t("If you are in danger right now, call 116. You do not need an account.")}</span>
              </div>
              <p className="text-xs text-on-surface-variant">{t("Everything else on this site stays open to everyone, with no account.")}</p>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
