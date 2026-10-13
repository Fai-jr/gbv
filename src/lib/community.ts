export const ROOMS = [
  { id: "welcome", name: "Welcome circle", description: "A gentle place to say hello and talk about how you are today." },
  { id: "healing", name: "Healing and recovery", description: "What helps with sleep, fear, trust and getting through hard days." },
  { id: "getting-help", name: "Getting help", description: "Questions about reaching services, and what it was like for others." },
  { id: "family-friends", name: "Family and friends", description: "For people supporting someone, and for talking about family reactions." },
];

export const STORY_TOPICS = [
  { key: "leaving", label: "Leaving or staying safe" },
  { key: "getting-help", label: "Getting help" },
  { key: "healing", label: "Healing and recovery" },
  { key: "rebuilding", label: "Rebuilding my life" },
  { key: "for-others", label: "Words for others" },
];

export const TOPIC_LABEL: Record<string, string> = Object.fromEntries(
  STORY_TOPICS.map((t) => [t.key, t.label])
);

export const HOUSE_RULES = [
  "Be kind. Everyone here is carrying something heavy.",
  "Never share names, places, phone numbers, links or anything that could identify you or anyone else.",
  "Share your own experience. Do not give medical or legal advice, and do not tell anyone what they must do.",
  "Leave out graphic detail of violence. You can say what happened without describing the worst of it.",
  "Do not ask anyone to contact you outside this space.",
  "This space is for adults (18 and over). If you are under 18, please call 116.",
];

const ADJECTIVES = ["Quiet", "Gentle", "Brave", "Steady", "Warm", "Calm", "Bright", "Kind", "Hopeful", "Patient", "Strong", "Soft"];
const NOUNS = ["River", "Sparrow", "Mango", "Baobab", "Rain", "Dawn", "Cedar", "Lantern", "Meadow", "Harbor", "Orchid", "Breeze"];
const KEY = "gbvconnect-pseudonym";

function make() {
  const a = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const n = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return a + " " + n + " " + (10 + Math.floor(Math.random() * 90));
}

export function getPseudonym(): string {
  if (typeof window === "undefined") return "";
  try {
    let p = window.localStorage.getItem(KEY);
    if (!p) {
      p = make();
      window.localStorage.setItem(KEY, p);
    }
    return p;
  } catch {
    return make();
  }
}

export function resetPseudonym(): string {
  const p = make();
  try {
    window.localStorage.setItem(KEY, p);
  } catch {}
  return p;
}

export function checkContent(text: string, max: number, min = 1): string | null {
  const t = text.trim();
  if (t.length < min) return min > 1 ? "Please write a little more." : "Please write something first.";
  if (t.length > max) return "Please keep this under " + max + " characters.";
  if (/(https?:\/\/|www\.|@)/i.test(t)) return "Please remove links and email addresses.";
  if (/(?:\d[\s().-]?){7,}/.test(t)) return "Please remove phone numbers and long numbers.";
  return null;
}

const URGENT = ["kill myself", "end my life", "suicide", "want to die", "going to kill me", "he is here", "weapon"];

export function looksUrgent(text: string): boolean {
  const t = text.toLowerCase();
  return URGENT.some((w) => t.includes(w));
}
