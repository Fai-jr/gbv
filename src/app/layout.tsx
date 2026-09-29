import type { Metadata } from "next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/lora/500.css";
import "@fontsource/lora/600.css";
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
      <body className="min-h-full flex flex-col pb-14">
        <AuthProvider>
          <RegisterSW />
          <QuickExit />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
