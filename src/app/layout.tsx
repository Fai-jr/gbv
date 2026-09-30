import type { Metadata } from "next";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "@fontsource/literata/400.css";
import "@fontsource/literata/500.css";
import "@fontsource/literata/600.css";
import "@fontsource/literata/700.css";
import "@fontsource/literata/400-italic.css";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import QuickExit from "@/components/QuickExit";
import RegisterSW from "@/components/RegisterSW";

export const metadata: Metadata = {
  title: "GBVConnect",
  description: "Connects survivors to services.",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-surface text-on-surface">
        <AuthProvider>
          <RegisterSW />
          {children}
          <QuickExit />
        </AuthProvider>
      </body>
    </html>
  );
}
