import { terminate, clearIndexedDbPersistence } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";

export async function wipeLocalData(redirectTo = "/") {
  try {
    await terminate(db);
    await clearIndexedDbPersistence(db);
  } catch (err) {
    console.warn("Could not clear the offline data store:", err);
  }
  try {
    await signOut(auth);
  } catch {}
  try {
    window.localStorage.clear();
    window.sessionStorage.clear();
  } catch {}
  try {
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
  } catch {}
  window.location.replace(redirectTo);
}
