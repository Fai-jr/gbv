export default function HelpSomeonePage() {
  const tips = [
    {
      title: "Believe her",
      body: "If someone tells you they are experiencing violence, believe them. It takes courage to share this, and disbelief can stop someone from ever asking again.",
    },
    {
      title: "Let her set the pace",
      body: "Don't pressure her to report, leave, or decide anything immediately. Ask what she needs right now, rather than telling her what to do.",
    },
    {
      title: "Avoid \"why\" questions",
      body: "Questions like \"why didn't you leave?\" can feel like blame. Focus on how you can support her, not on questioning her choices.",
    },
    {
      title: "Protect her privacy",
      body: "Don't share what she told you without her permission, and be mindful of who might overhear or see messages.",
    },
    {
      title: "Offer, don't insist",
      body: "You can offer to share contacts, sit with her while she calls someone, or simply listen. Let her choose what help she wants.",
    },
    {
      title: "Look after yourself too",
      body: "Supporting someone through this can be heavy. It's okay to also seek guidance for yourself on how to help well.",
    },
  ];

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-2 text-xl font-semibold text-zinc-900">
        Supporting Someone Else
      </h1>
      <p className="mb-6 text-sm text-zinc-600">
        If someone you know may be experiencing gender-based violence, here
        is how you can help.
      </p>

      <div className="space-y-4">
        {tips.map((tip, i) => (
          <div key={i} className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="font-medium text-zinc-900">{tip.title}</p>
            <p className="mt-1 text-sm text-zinc-600">{tip.body}</p>
          </div>
        ))}
      </div>

      <a href="/contacts" className="mt-6 inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800">
        See contacts you can share with her
      </a>
    </div>
  );
}
