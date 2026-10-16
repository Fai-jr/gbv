"use client";

import MemberGate from "@/components/MemberGate";

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return (
    <MemberGate area="community" active="/community">
      {children}
    </MemberGate>
  );
}
