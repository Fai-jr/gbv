"use client";

import MemberGate from "@/components/MemberGate";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <MemberGate area="chat" active="/support">
      {children}
    </MemberGate>
  );
}
