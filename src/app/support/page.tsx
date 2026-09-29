"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Step = "danger" | "needs" | "talk";

export default function SupportPage() {
  const [step, setStep] = useState<Step>("danger");
  const router = useRouter();

  if (step === "danger") {
    return (
      <div className="mx-auto max-w-md p-6 text-center">
        <h1 className="mb-6 text-lg font-medium text-ink">
          Are you in immediate danger right now?
        </h1>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push("/help")}
            className="rounded-lg bg-danger py-3 text-sm font-medium text-white hover:bg-danger-dark"
          >
            Yes, I need help now
          </button>
          <button
            onClick={() => setStep("needs")}
            className="rounded-lg bg-tint py-3 text-sm font-medium text-ink hover:bg-tint-hover"
          >
            No, but I want support
          </button>
        </div>
      </div>
    );
  }

  if (step === "needs") {
    return (
      <div className="mx-auto max-w-md p-6 text-center">
        <h1 className="mb-6 text-lg font-medium text-ink">
          What kind of support are you looking for right now?
        </h1>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push("/support/chat")}
            className="rounded-lg bg-tint py-3 text-sm font-medium text-ink hover:bg-tint-hover"
          >
            Someone to talk to
          </button>
          <button
            onClick={() => router.push("/contacts")}
            className="rounded-lg bg-tint py-3 text-sm font-medium text-ink hover:bg-tint-hover"
          >
            Medical help
          </button>
          <button
            onClick={() => router.push("/contacts")}
            className="rounded-lg bg-tint py-3 text-sm font-medium text-ink hover:bg-tint-hover"
          >
            Legal information
          </button>
          <button
            onClick={() => router.push("/refuge")}
            className="rounded-lg bg-tint py-3 text-sm font-medium text-ink hover:bg-tint-hover"
          >
            A safe place to go
          </button>
        </div>
      </div>
    );
  }

  if (step === "talk") {
    return (
      <div className="mx-auto max-w-md p-6 text-center">
        <h1 className="mb-4 text-lg font-medium text-ink">
          You are not alone
        </h1>
        <p className="mb-4 text-sm text-muted">
          What you are feeling is real, and it makes sense. Take a slow
          breath if you can. You do not have to decide anything right now.
        </p>
        <p className="mb-6 text-sm text-muted">
          If you would like to talk to someone directly, a trained person is
          available to listen, confidentially, whenever you are ready.
        </p>
        <button
          onClick={() => router.push("/contacts")}
          className="w-full rounded-lg bg-plum py-3 text-sm font-medium text-white hover:bg-plum-dark"
        >
          See who I can talk to
        </button>
      </div>
    );
  }

  return null;
}
