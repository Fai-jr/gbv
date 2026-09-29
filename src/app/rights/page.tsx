export default function RightsPage() {
  const faqs = [
    {
      q: "Is this against the law in Cameroon?",
      a: "Violence, threats, forced sexual acts and forced marriage can be criminal offences under Cameroonian law. The Penal Code punishes rape with five to ten years' imprisonment. You do not need to know the exact legal terms to seek help - a trained advisor can explain your options.",
    },
    {
      q: "What happens if I report this?",
      a: "Reporting is your choice, and you decide the pace. You can also seek medical care, psychosocial support or legal advice without filing a police report. A trained advisor can explain what each option involves before you decide anything.",
    },
    {
      q: "Do I need evidence to get help?",
      a: "No. You can access medical care, counselling and safe shelter without any evidence. If you may want to pursue a legal case later, a medical professional can help document what happened, at your own pace and with your consent.",
    },
    {
      q: "Can I get help without giving my name?",
      a: "Yes. Many services can offer information and initial support anonymously. You control what personal information you share and when.",
    },
    {
      q: "What if the person who hurt me is my husband or partner?",
      a: "Violence from a spouse or partner is still a serious matter, and support services exist for this. You are not required to stay in a situation that is unsafe.",
    },
  ];

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-2 text-xl font-semibold text-ink">Know Your Rights</h1>
      <p className="mb-6 text-sm text-muted">
        This is general information, not legal advice. For guidance about your
        own situation, a legal advisor can help - see the contacts page.
      </p>

      <div className="space-y-4">
        {faqs.map((item, i) => (
          <div key={i} className="rounded-lg border border-border-soft bg-card p-4 shadow-sm">
            <p className="font-medium text-ink">{item.q}</p>
            <p className="mt-1 text-sm text-muted">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
