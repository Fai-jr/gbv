export function describeAuthError(err: any): string {
  const code: string = err?.code || "";
  if (
    code === "auth/invalid-credential" ||
    code === "auth/wrong-password" ||
    code === "auth/user-not-found" ||
    code === "auth/invalid-email"
  ) {
    return "Invalid email or password.";
  }
  if (code === "auth/too-many-requests") return "Too many attempts. Please wait a few minutes and try again.";
  if (code === "auth/network-request-failed") return "Cannot reach the sign-in service. Check your internet connection. (" + code + ")";
  if (code === "auth/unauthorized-domain") {
    return "This website address is not allowed to sign in. Add it in Firebase under Authentication, Settings, Authorized domains. (" + code + ")";
  }
  if (code === "auth/operation-not-allowed") return "This sign-in method is switched off in Firebase. (" + code + ")";
  if (code.startsWith("auth/requests-from") || code.includes("api-key")) {
    return "The sign-in key is blocked for this website. Check the API key restrictions. (" + code + ")";
  }
  return "Sign-in failed. (" + (code || "unknown error") + ")";
}
