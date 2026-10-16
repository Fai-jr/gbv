export type Ts = { seconds: number };

export type PendingStory = { id: string; title: string; body: string; topic: string; pseudonym: string; authorUid?: string; createdAt?: Ts };
export type Group = { id: string; name: string; description: string; topic: string; creatorPseudonym: string; creatorUid: string; createdAt?: Ts };
export type Report = { id: string; kind: "story" | "message" | "group"; targetId: string; roomId?: string; preview?: string; authorUid?: string; createdAt?: Ts };
export type Muted = { id: string; mutedAt?: Ts };
export type Msg = { id: string; text: string; pseudonym: string; authorUid: string; createdAt?: Ts | null };

export function when(ts?: Ts | null) {
  return ts ? new Date(ts.seconds * 1000).toLocaleString() : "just now";
}
