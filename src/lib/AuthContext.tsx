"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInAnonymously, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

type UserProfile = {
  role: "survivor" | "ngo_staff" | "shelter_staff" | "admin";
  orgId?: string;
};

type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true });

async function ensureUserDoc(uid: string): Promise<UserProfile> {
  const ref = doc(db, "users", uid);
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, { role: "survivor", createdAt: new Date().toISOString() });
      return { role: "survivor" };
    }
    return snap.data() as UserProfile;
  } catch (error) {
    console.warn("ensureUserDoc issue (handled):", error);
    return { role: "survivor" };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const p = await ensureUserDoc(firebaseUser.uid);
        setProfile(p);
        setUser(firebaseUser);
        setLoading(false);
      } else {
        try {
          const result = await signInAnonymously(auth);
          await result.user.getIdToken(true);
          const p = await ensureUserDoc(result.user.uid);
          setProfile(p);
          setUser(result.user);
        } catch (error) {
          console.warn("Anonymous sign-in issue (handled):", error);
        } finally {
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
