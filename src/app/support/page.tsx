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
        <h1 className="mb-6 text-lg font-medium text-zinc-900">
          Are you in immediate danger right now?
        </h1>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push("/help")}
            className="rounded-lg bg-red-600 py-3 text-sm font-medium text-white hover:bg-red-700"
          >
            Yes, I need help now
          </button>
          <button
            onClick={() => setStep("needs")}
            className="rounded-lg bg-zinc-100 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-200"
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
        <h1 className="mb-6 text-lg font-medium text-zinc-900">
          What kind of support are you looking for right now?
        </h1>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push("/support/chat")}
            className="rounded-lg bg-zinc-100 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-200"
          >
            Someone to talk to
          </button>
          <button
            onClick={() => router.push("/contacts")}
            className="rounded-lg bg-zinc-100 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-200"
          >
            Medical help
          </button>
          <button
            onClick={() => router.push("/contacts")}
            className="rounded-lg bg-zinc-100 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-200"
          >
            Legal information
          </button>
          <button
            onClick={() => router.push("/refuge")}
            className="rounded-lg bg-zinc-100 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-200"
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
        <h1 className="mb-4 text-lg font-medium text-zinc-900">
          You are not alone
        </h1>
        <p className="mb-4 text-sm text-zinc-600">
          What you are feeling is real, and it makes sense. Take a slow
          breath if you can. You do not have to decide anything right now.
        </p>
        <p className="mb-6 text-sm text-zinc-600">
          If you would like to talk to someone directly, a trained person is
          available to listen, confidentially, whenever you are ready.
        </p>
        <button
          onClick={() => router.push("/contacts")}
          className="w-full rounded-lg bg-zinc-900 py-3 text-sm font-medium text-white hover:bg-zinc-800"
        >
          See who I can talk to
        </button>
      </div>
    );
  }

  return null;
}
