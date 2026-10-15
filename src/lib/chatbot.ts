import type { Lang } from "@/lib/i18n";

type Side = { keywords: string[]; response: string };
type Entry = { name: string; en: Side; fr: Side };

const entry = (name: string, en: Side, fr: Side): Entry => ({ name, en, fr });

export const CATEGORIES: Entry[] = [
  entry(
    "self_harm",
    {
      keywords: ["suicid*", "kill myself", "end my life", "want to die", "wanna die", "don't want to live", "dont want to live", "hurt myself", "harm myself", "better off dead"],
      response: "I'm really sorry you are in this much pain, and I'm glad you told me. You deserve support right now. Please tell someone near you, or call 116 now. If you are in immediate danger, call 116 and move somewhere safe if you can.",
    },
    {
      keywords: ["suicid*", "me tuer", "mettre fin a mes jours", "envie de mourir", "veux mourir", "veux plus vivre", "ne veux plus vivre", "me faire du mal", "en finir avec la vie", "mieux mort", "mieux morte"],
      response: "Je suis vraiment navré que vous souffriez autant, et je suis content que vous m'en ayez parlé. Vous méritez du soutien dès maintenant. Parlez-en à quelqu'un près de vous, ou appelez le 116 maintenant. Si vous êtes en danger immédiat, appelez le 116 et mettez-vous à l'abri si vous le pouvez.",
    }
  ),
  entry(
    "physical",
    {
      keywords: ["hit", "hits", "hitting", "push*", "punch*", "slap*", "beat", "beats", "beating", "beaten", "chok*", "strangl*", "kick*"],
      response: "I'm sorry this happened. You don't deserve to be hurt. Are you somewhere safe right now, and is it safe for you to keep chatting?",
    },
    {
      keywords: ["frappe*", "m'a battu", "m'a battue", "me bat", "il me bat", "elle me bat", "me tape", "m'a tape", "m'a tapee", "des coups", "coups de poing", "gifle*", "m'a pousse", "m'a poussee", "me pousse", "etrangl*", "etouff*", "me cogne", "m'a cogne"],
      response: "Je suis navré que cela vous soit arrivé. Vous ne méritez pas qu'on vous fasse du mal. Êtes-vous en sécurité en ce moment, et pouvez-vous continuer à discuter sans risque ?",
    }
  ),
  entry(
    "sexual",
    {
      keywords: ["forced", "rape", "raped", "rapist", "sexual*", "assault*", "molest*", "touched me", "touch me"],
      response: "I'm sorry this happened. What happened was not your fault. You do not have to share details here. Would you like help finding medical care or someone trained to support you?",
    },
    {
      keywords: ["viol", "viole", "violee", "violer", "agression sexuelle", "agresse sexuellement", "abus sexuel*", "attouchement*", "m'a force", "m'a forcee", "sans mon consentement", "relation forcee"],
      response: "Je suis navré que cela soit arrivé. Ce qui s'est passé n'est pas de votre faute. Vous n'avez pas à donner de détails ici. Souhaitez-vous de l'aide pour trouver des soins médicaux ou une personne formée pour vous soutenir ?",
    }
  ),
  entry(
    "emotional",
    {
      keywords: ["insult*", "worthless", "humiliat*", "yell*", "shout*", "belittl*", "put me down"],
      response: "Being repeatedly insulted or humiliated can be deeply harmful. You deserve to be treated with respect. Would you like to talk about how this is affecting you, or consider support options?",
    },
    {
      keywords: ["insulte*", "humilie*", "humiliation*", "me rabaisse", "rabaiss*", "il crie", "elle crie", "crie sur moi", "hurle*", "me deprecie", "deprecie*", "ne vaux rien", "ne vaut rien", "sans valeur"],
      response: "Être insulté ou humilié de façon répétée peut être très nocif. Vous méritez d'être traité avec respect. Souhaitez-vous parler de ce que cela provoque en vous, ou réfléchir à des possibilités de soutien ?",
    }
  ),
  entry(
    "control",
    {
      keywords: ["control*", "checks my phone", "my money", "who i can see", "monitor*", "jealous*", "isolat*", "won't let me", "wont let me"],
      response: "That sounds controlling, and it may affect your safety and independence. If your device is monitored, consider whether this chat is safe to use. We can explore options at your pace.",
    },
    {
      keywords: ["controle*", "surveille*", "verifie mon telephone", "fouille mon telephone", "mon argent", "avec qui je", "jaloux", "jalouse", "jalousie", "m'isole", "isole*", "ne me laisse pas", "m'interdit"],
      response: "Cela ressemble à du contrôle, et cela peut affecter votre sécurité et votre indépendance. Si votre appareil est surveillé, demandez-vous si cette discussion est sans danger. Nous pouvons explorer des possibilités à votre rythme.",
    }
  ),
  entry(
    "fear_return",
    {
      keywords: ["will happen again", "come back", "come home", "return*", "threat*"],
      response: "That fear deserves to be taken seriously. Let's consider whether there is an immediate safety concern and what support could help you feel safer.",
    },
    {
      keywords: ["ca va recommencer", "va recommencer", "il va recommencer", "elle va recommencer", "ca recommence", "il va revenir", "elle va revenir", "menace*", "rentrer a la maison"],
      response: "Cette peur mérite d'être prise au sérieux. Voyons s'il existe un danger immédiat et quel soutien pourrait vous aider à vous sentir plus en sécurité.",
    }
  ),
  entry(
    "anxious_trigger",
    {
      keywords: ["anxious", "anxiety", "flinch*", "raise their voice", "raises his voice", "raises her voice", "jump when", "tense up"],
      response: "That sounds distressing. After frightening experiences, reminders can trigger strong reactions. Would you like to try a simple grounding exercise, or talk about finding a counsellor?",
    },
    {
      keywords: ["anxieu*", "angoisse*", "sursaute*", "sursaut", "hausse la voix", "eleve la voix", "j'ai peur quand", "je me crispe", "je tremble"],
      response: "Cela semble pénible. Après des expériences effrayantes, certains rappels peuvent provoquer de fortes réactions. Souhaitez-vous essayer un exercice simple d'ancrage, ou parler de la possibilité de rencontrer un conseiller ou une conseillère ?",
    }
  ),
  entry(
    "flashbacks",
    {
      keywords: ["flashback*", "as if it is happening again", "as if it's happening again", "reliv*"],
      response: "That sounds frightening. You don't need to describe the memory in detail. A trauma-informed mental-health professional can help you manage these experiences.",
    },
    {
      keywords: ["flashback*", "comme si ca recommencait", "comme si c'etait encore", "revis*", "revivre", "je revois"],
      response: "Cela semble effrayant. Vous n'avez pas besoin de décrire le souvenir en détail. Un professionnel de santé mentale formé aux traumatismes peut vous aider à gérer ces expériences.",
    }
  ),
  entry(
    "nightmares",
    {
      keywords: ["nightmare*", "keep dreaming", "bad dreams", "can't sleep", "cant sleep", "can't sleep properly", "cannot sleep"],
      response: "Feeling unsafe can make sleep difficult, and nightmares can happen after trauma. You deserve support with both your safety and your wellbeing. Would you like to discuss coping strategies or speak with a professional?",
    },
    {
      keywords: ["cauchemar*", "mauvais reves", "je ne dors pas", "je dors mal", "insomnie*", "je n'arrive pas a dormir", "j'arrive pas a dormir", "ne peux pas dormir"],
      response: "Se sentir en danger peut perturber le sommeil, et les cauchemars peuvent survenir après un traumatisme. Vous méritez du soutien pour votre sécurité comme pour votre bien-être. Souhaitez-vous parler de façons de mieux vous apaiser, ou parler avec un professionnel ?",
    }
  ),
  entry(
    "lost_interest",
    {
      keywords: ["lost interest", "don't enjoy", "dont enjoy", "no motivation", "stopped caring"],
      response: "That can be hard to experience. You deserve support, and you don't have to manage it alone. Would you feel comfortable speaking with a mental-health professional?",
    },
    {
      keywords: ["perdu l'interet", "plus d'interet", "plus envie de rien", "plus de motivation", "ne m'interesse plus", "plus envie"],
      response: "Cela peut être difficile à vivre. Vous méritez du soutien : vous n'avez pas à traverser cela sans aide. Seriez-vous à l'aise de parler avec un professionnel de santé mentale ?",
    }
  ),
  entry(
    "shame_blame",
    {
      keywords: ["embarrassed", "ashamed", "shame*", "my fault", "blame myself", "could have prevented", "should have", "caused it"],
      response: "You are not responsible for another person's choice to abuse or assault you. You deserve care and support, without blame.",
    },
    {
      keywords: ["honte", "j'ai honte", "ma faute", "de ma faute", "je me sens coupable", "coupable", "j'aurais du", "je m'en veux"],
      response: "Vous n'êtes pas responsable du choix d'une autre personne de vous maltraiter ou de vous agresser. Vous méritez des soins et du soutien, sans reproche.",
    }
  ),
  entry(
    "anger",
    {
      keywords: ["angry all the time", "so angry", "full of anger", "rage"],
      response: "Anger can be one response to being hurt. We can look at ways to express it safely and identify support that feels right for you.",
    },
    {
      keywords: ["en colere tout le temps", "tellement en colere", "plein de colere", "pleine de colere", "rage", "colere"],
      response: "La colère peut être une réaction quand on a été blessé. Nous pouvons chercher des façons de l'exprimer sans danger et trouver le soutien qui vous convient.",
    }
  ),
  entry(
    "numb",
    {
      keywords: ["feel nothing", "numb*", "disconnected", "not real"],
      response: "Feeling numb or disconnected can happen after overwhelming experiences. If it is distressing or persistent, a trauma-informed professional can help you understand and manage it.",
    },
    {
      keywords: ["je ne ressens rien", "ressens rien", "engourdi*", "vide", "deconnecte*", "irreel", "pas reel", "comme un robot"],
      response: "Se sentir engourdi ou détaché peut arriver après des expériences bouleversantes. Si cela vous pèse ou dure, un professionnel formé aux traumatismes peut vous aider à comprendre et à gérer cela.",
    }
  ),
  entry(
    "cant_focus",
    {
      keywords: ["can't focus", "cant focus", "can't concentrate", "cant concentrate", "can't study", "cant study", "cannot concentrate"],
      response: "That sounds frustrating. Stress and trauma can affect concentration. We can consider small practical supports and, if you wish, ways to access professional care.",
    },
    {
      keywords: ["je n'arrive pas a me concentrer", "j'arrive pas a me concentrer", "ne peux pas me concentrer", "concentration", "du mal a me concentrer", "n'arrive pas a travailler"],
      response: "Cela semble frustrant. Le stress et les traumatismes peuvent affecter la concentration. Nous pouvons envisager de petits soutiens pratiques et, si vous le souhaitez, des moyens d'accéder à des soins professionnels.",
    }
  ),
  entry(
    "trust_issues",
    {
      keywords: ["difficult to trust", "hard to trust", "don't trust anyone", "dont trust anyone", "can't trust", "cant trust"],
      response: "After someone has hurt you, trust can take time. You don't have to trust everyone or share more than you're ready to. We can think about what would help you feel in control.",
    },
    {
      keywords: ["difficile de faire confiance", "du mal a faire confiance", "ne fais confiance a personne", "plus confiance", "confiance en personne", "ne peux pas faire confiance"],
      response: "Quand quelqu'un vous a fait du mal, la confiance peut prendre du temps. Vous n'avez pas à faire confiance à tout le monde ni à en dire plus que ce que vous êtes prêt à partager. Nous pouvons réfléchir à ce qui vous aiderait à garder le contrôle.",
    }
  ),
  entry(
    "fear_intimacy",
    {
      keywords: ["afraid of being close", "afraid of touch", "scared of being touched", "physically close to someone"],
      response: "You have the right to set boundaries around touch and intimacy. You don't need to rush. A counsellor with trauma experience may help if you want support.",
    },
    {
      keywords: ["peur d'etre proche", "peur d'etre touche*", "peur du contact", "peur qu'on me touche", "peur de l'intimite", "proche physiquement"],
      response: "Vous avez le droit de fixer vos limites concernant le contact et l'intimité. Rien ne presse. Un conseiller ou une conseillère ayant l'expérience des traumatismes peut vous aider si vous le souhaitez.",
    }
  ),
  entry(
    "overwhelmed",
    {
      keywords: ["overwhelmed", "too much right now", "can't cope", "cant cope", "cannot cope"],
      response: "If it feels safe, try noticing your feet on the floor, naming a few things you can see, and taking gentle, unforced breaths. If this makes you feel worse, stop. We can also identify someone you trust.",
    },
    {
      keywords: ["submerge*", "debord*", "c'est trop", "trop pour moi", "n'en peux plus", "ne tiens plus", "je craque", "ne m'en sors pas"],
      response: "Si vous vous sentez en sécurité, essayez de sentir vos pieds sur le sol, de nommer quelques choses que vous voyez et de respirer doucement, sans forcer. Si cela vous met plus mal, arrêtez. Nous pouvons aussi identifier une personne de confiance.",
    }
  ),
  entry(
    "setback",
    {
      keywords: ["thought i was getting better", "everything feels difficult again", "bad day", "going backwards", "setback"],
      response: "Recovery isn't always a straight line. A difficult day doesn't erase the progress you've made. What would help you get through today safely?",
    },
    {
      keywords: ["je pensais aller mieux", "tout redevient difficile", "mauvaise journee", "je recule", "rechute", "retour en arriere"],
      response: "Le rétablissement n'est pas toujours une ligne droite. Une journée difficile n'efface pas les progrès accomplis. Qu'est-ce qui pourrait vous aider à traverser la journée en sécurité ?",
    }
  ),
  entry(
    "disbelief",
    {
      keywords: ["nobody believe*", "won't believe", "wont believe", "believe me", "no one will believe"],
      response: "That fear can make reaching out very difficult. You deserve to be listened to respectfully. Is there one person or service you think might be safe to contact?",
    },
    {
      keywords: ["personne ne me croira", "personne ne me croit", "ne me croiront pas", "ne me croit pas", "on ne me croira pas"],
      response: "Cette peur peut rendre très difficile de demander de l'aide. Vous méritez d'être écouté avec respect. Y a-t-il une personne ou un service que vous pensez pouvoir contacter en sécurité ?",
    }
  ),
  entry(
    "privacy",
    {
      keywords: ["saved", "delete*", "confidential*", "find out", "who will see", "private*"],
      response: "What you type here stays on this screen and is not saved or sent anywhere, and it disappears when you close the page. But I can't promise absolute privacy: if your device is shared or monitored, others may still see your screen or browsing history. Using a private window helps.",
    },
    {
      keywords: ["enregistre*", "supprim*", "efface*", "confidentiel*", "confidentialite", "qui va voir", "qui verra", "decouvr*", "prive*", "vie privee"],
      response: "Ce que vous écrivez ici reste sur cet écran, n'est ni enregistré ni envoyé, et disparaît quand vous fermez la page. Mais je ne peux pas promettre une vie privée absolue : si votre appareil est partagé ou surveillé, d'autres personnes peuvent quand même voir votre écran ou votre historique de navigation. Une fenêtre privée aide.",
    }
  ),
  entry(
    "unsure_next",
    {
      keywords: ["don't know what to do", "dont know what to do", "what now", "what should i do", "what do i do"],
      response: "You don't have to decide everything now. We can start with what matters most to you: immediate safety, medical care, emotional support, or practical help.",
    },
    {
      keywords: ["ne sais pas quoi faire", "sais pas quoi faire", "que faire", "et maintenant", "qu'est-ce que je dois faire", "quoi faire"],
      response: "Vous n'avez pas à tout décider maintenant. Nous pouvons commencer par ce qui compte le plus pour vous : la sécurité immédiate, les soins médicaux, le soutien émotionnel ou l'aide pratique.",
    }
  ),
  entry(
    "wants_out",
    {
      keywords: ["get out", "leave him", "leave her", "leave them", "end this", "escape*", "run away"],
      response: "We can think through options at your pace. First, are you in immediate danger, and is it safe to use this device? We can consider a trusted person, a safe place, and specialist support.",
    },
    {
      keywords: ["partir", "le quitter", "la quitter", "m'enfuir", "fuir", "m'echapper", "en finir", "sortir de cette situation"],
      response: "Nous pouvons réfléchir aux possibilités à votre rythme. D'abord, êtes-vous en danger immédiat, et est-il sans risque d'utiliser cet appareil ? Nous pouvons envisager une personne de confiance, un lieu sûr et un soutien spécialisé.",
    }
  ),
  entry(
    "rebuild",
    {
      keywords: ["rebuild*", "move forward", "moving forward", "go back to school", "get back to work", "new start", "start over", "start again"],
      response: "That is an understandable goal. We can take this one step at a time and explore the areas that matter most to you: safety, health, housing, education, or emotional recovery.",
    },
    {
      keywords: ["reconstruire", "me reconstruire", "aller de l'avant", "avancer", "retourner a l'ecole", "reprendre le travail", "repartir de zero", "recommencer ma vie", "nouveau depart"],
      response: "C'est un objectif tout à fait compréhensible. Nous pouvons avancer étape par étape et explorer ce qui compte le plus pour vous : sécurité, santé, logement, études ou rétablissement émotionnel.",
    }
  ),
  entry(
    "just_listen",
    {
      keywords: ["just listen", "don't need advice", "dont need advice", "need someone to listen", "listen to me"],
      response: "I'll listen. You don't have to solve everything right now.",
    },
    {
      keywords: ["ecoutez moi", "juste ecouter", "besoin qu'on m'ecoute", "pas besoin de conseils", "j'ai besoin de parler", "besoin de parler"],
      response: "Je vous écoute. Vous n'avez pas à tout résoudre maintenant.",
    }
  ),
];

const DANGER = [
  "kill*", "weapon*", "gun", "knife", "machete", "going to die", "can't breathe", "cant breathe",
  "he's here", "hes here", "she's here", "he is here", "outside my door",
  "tuer", "tue", "tuera", "arme", "armes", "pistolet", "fusil", "couteau", "machette",
  "je vais mourir", "ne peux pas respirer", "j'arrive pas a respirer", "il est la", "il est ici", "elle est la", "devant ma porte",
];

export const ESCALATE = ["self_harm", "physical", "sexual", "fear_return", "wants_out"];

const FALLBACK: Record<Lang, string> = {
  en: "Thank you for telling me. You don't have to explain everything at once. Would you like me to listen, help you think through what you need, or explore support options?",
  fr: "Merci de m'en avoir parlé. Vous n'avez pas à tout expliquer d'un coup. Souhaitez-vous que je vous écoute, que je vous aide à réfléchir à ce dont vous avez besoin, ou que nous explorions des options de soutien ?",
};

const GREETING: Record<Lang, string> = {
  en: "Hello, I'm here to listen. What you type here stays on this screen and is not saved. Take all the time you need. How are you feeling right now?",
  fr: "Bonjour, je suis là pour vous écouter. Ce que vous écrivez ici reste sur cet écran et n'est pas enregistré. Prenez tout le temps dont vous avez besoin. Comment vous sentez-vous en ce moment ?",
};

export const greeting = (l: Lang) => GREETING[l];
export const fallback = (l: Lang) => FALLBACK[l];
export const speechTag = (l: Lang) => (l === "fr" ? "fr-FR" : "en-US");

export function replyFor(name: string, l: Lang): string {
  const c = CATEGORIES.find((x) => x.name === name);
  return c ? c[l].response : FALLBACK[l];
}

function normalize(s: string) {
  const v = s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2018\u2019\u02bc`]/g, "'")
    .replace(/[^a-z0-9']+/g, " ")
    .trim();
  return " " + v + " ";
}

function matches(text: string, kw: string) {
  return kw.endsWith("*") ? text.includes(" " + kw.slice(0, -1)) : text.includes(" " + kw + " ");
}

export function findCategory(raw: string, l: Lang): string | null {
  const text = normalize(raw);
  const order: Lang[] = l === "fr" ? ["fr", "en"] : ["en", "fr"];
  for (const lang of order) {
    for (const c of CATEGORIES) {
      if (c[lang].keywords.some((k) => matches(text, k))) return c.name;
    }
  }
  return null;
}

export function isDanger(raw: string): boolean {
  const text = normalize(raw);
  return DANGER.some((k) => matches(text, k));
}
