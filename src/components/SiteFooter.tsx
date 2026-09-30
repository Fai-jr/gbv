import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="w-full bg-surface-container py-8">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-10 flex flex-col md:flex-row items-center justify-between gap-4 text-on-surface-variant text-sm">
        <div>&copy; 2026 GBVConnect Cameroon &bull; Humanitarian &amp; Survivor Sanctuary Network</div>
        <div className="flex items-center gap-6 text-sm font-semibold">
          <Link href="/rights" className="hover:text-on-surface transition-colors">
            Confidentiality &amp; Privacy
          </Link>
          <Link href="/help" className="hover:text-on-surface transition-colors">
            Immediate Assistance Hotline (Toll-free 116)
          </Link>
        </div>
      </div>
    </footer>
  );
}
