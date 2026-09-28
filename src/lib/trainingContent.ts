export type ResourceKind = "video" | "pdf" | "app" | "web" | "audio";

export type TrainingResource = {
  label: string;
  url: string;
  kind: ResourceKind;
};

export type TrainingSection = {
  heading: string;
  points: string[];
};

export type TrainingTopic = {
  id: string;
  title: string;
  summary: string;
  sections: TrainingSection[];
  resources: TrainingResource[];
  basedOn: string;
};

export const TRAINING_TOPICS: TrainingTopic[] = [
  {
    id: "lives",
    title: "First-line support: the LIVES approach",
    summary:
      "Five simple tasks, from the World Health Organization, for anyone who hears a woman say she has experienced violence.",
    sections: [
      {
        heading: "The five tasks",
        points: [
          "Listen: give your full attention, without judging or rushing. Let silences happen. Do not push her to say more than she wants to.",
          "Inquire about needs and concerns: ask what she needs right now, whether emotional, physical, social or practical (for example, childcare). Let her lead.",
          "Validate: tell her you believe her, that the violence is not her fault, and that her reactions make sense.",
          "Enhance safety: talk about whether she is safe now and how she could protect herself if the violence happens again. Support the choices she makes.",
          "Support: help her reach services and people she trusts, at a pace that suits her.",
        ],
      },
      {
        heading: "What this is not",
        points: [
          "It is not an investigation. You are not there to test her story.",
          "It is not a way to solve her problems for her or to persuade her to report or leave.",
          "It does not replace specialist care. It is the first response that makes the next step easier.",
        ],
      },
      {
        heading: "Check your own attitudes",
        points: [
          "Our beliefs often reflect the norms around us, and some of those norms blame survivors. Ask yourself whether any of your beliefs could make a survivor feel judged.",
          "Being a role model in your community includes challenging blame when you hear it.",
        ],
      },
    ],
    resources: [
      {
        label: "PAHO LIVES video series (short videos on first-line support)",
        url: "https://youtube.com/playlist?list=PL6hS8Moik7kvb39BbrqgN6HaNd1Udn9ve",
        kind: "video",
      },
      {
        label: "WHO curriculum: Caring for women subjected to violence",
        url: "https://www.who.int/publications/i/item/9789241517102",
        kind: "web",
      },
      {
        label: "WHO clinical handbook on care for women subjected to violence",
        url: "https://apps.who.int/iris/bitstream/handle/10665/136101/WHO_RHR_14.26_eng.pdf?sequence=1",
        kind: "pdf",
      },
    ],
    basedOn:
      "World Health Organization clinical handbook (2014) and training curriculum (2019); PAHO LIVES video series (2022).",
  },
  {
    id: "pfa",
    title: "Psychological first aid: Prepare, Look, Listen, Link",
    summary:
      "A step-by-step approach for people who are not GBV specialists, from the GBV Pocket Guide used by humanitarian organisations.",
    sections: [
      {
        heading: "Prepare",
        points: [
          "Find out what services exist near you: who offers them, where, when they are open, whether they are free, and how a survivor can reach them.",
          "Know your organisation's rules on confidentiality and reporting before anyone tells you anything.",
          "Do not go looking for survivors. Be available in case someone chooses to tell you.",
        ],
      },
      {
        heading: "Look",
        points: [
          "Check for immediate danger and urgent needs, for her and for you.",
          "Find a private place where you will not be overheard and that does not reveal why you are talking.",
        ],
      },
      {
        heading: "Listen",
        points: [
          "Introduce yourself, explain what you can and cannot keep confidential, and let her speak at her own pace.",
          "Believe her and do not blame her. Avoid why questions.",
          "Ask what she needs rather than assuming.",
        ],
      },
      {
        heading: "Link",
        points: [
          "Give clear, accurate information about services: how to reach them, times and places.",
          "Ask her permission before connecting her to anyone. If she says no, accept it.",
          "Seeking help is not always safe for a survivor. She decides what feels safe for her.",
        ],
      },
      {
        heading: "Know your limits",
        points: [
          "Do what you can manage and hand over what you cannot. Other specialists, such as child protection or mental health staff, may be able to help.",
        ],
      },
    ],
    resources: [
      {
        label: "GBV Pocket Guide in French (PDF)",
        url: "https://gbvguidelines.org/wp/wp-content/uploads/2019/05/GBV_PocketGuide021718_FR_Final.pdf",
        kind: "pdf",
      },
      {
        label: "GBV Pocket Guide in English (PDF)",
        url: "https://gbvguidelines.org/wp/wp-content/uploads/2018/03/GBV_PocketGuide021718.pdf",
        kind: "pdf",
      },
      {
        label: "GBV Pocket Guide app for Android (works offline)",
        url: "https://play.google.com/store/apps/details?id=com.gbvpocketguide",
        kind: "app",
      },
      {
        label: "GBV Pocket Guide app for iPhone",
        url: "https://itunes.apple.com/us/app/gbv-pocket-guide/id1366576273?mt=8",
        kind: "app",
      },
      {
        label: "Visual Pocket Guide for low-literacy settings",
        url: "https://gbvguidelines.org/en/pocketguide/visual-gbv-pocket-guides/",
        kind: "web",
      },
      {
        label: "Pocket Guide page with a 4-hour training package (English and French)",
        url: "https://gbvguidelines.org/en/pocketguide/",
        kind: "web",
      },
      {
        label: "Women's Protection and Empowerment podcast series (includes an episode on psychological first aid)",
        url: "https://soundcloud.com/user-425988972",
        kind: "audio",
      },
    ],
    basedOn:
      "IASC GBV Pocket Guide V2.0, a joint resource of the GBV Guidelines and the GBV Area of Responsibility.",
  },
  {
    id: "disclosure",
    title: "When a woman tells you: responding to a disclosure",
    summary: "What to do and what to avoid in the first conversation.",
    sections: [
      {
        heading: "Signs she may want to talk but is not ready",
        points: [
          "She asks questions in hypothetical terms, or says she is asking for a friend.",
          "She asks you not to phone her at home or leave messages.",
          "She cancels at the last minute, or seems afraid, sad, withdrawn or isolated.",
          "She may not call it abuse. Let her name her own experience.",
        ],
      },
      {
        heading: "Do",
        points: [
          "Stay calm. Say clearly that the abuse is not her fault.",
          "Choose a private place where no one can overhear, but that does not tell others why she is there.",
          "Encourage her to talk without forcing her. A simple 'Do you want to say more about that?' is enough.",
          "Allow silences. If she cries, give her time.",
          "Respect how little or how much she chooses to share.",
          "Explain what you will do with what she tells you, and get her permission before acting on her behalf.",
        ],
      },
      {
        heading: "Avoid",
        points: [
          "Asking why she stayed or why she did not leave.",
          "Pressuring her to report, leave or decide anything now.",
          "Promising confidentiality you may not be able to keep.",
          "Contacting the person who hurt her, or discussing her case with people who do not need to know.",
          "Asking for graphic details you do not need.",
        ],
      },
      {
        heading: "Questions you can ask when it is safe to do so",
        points: [
          "Are you afraid of anyone at home?",
          "Has anyone threatened to hurt you? If so, when?",
          "Is anyone controlling things like your money or where you can go?",
          "Do you have concerns about your safety, or your children's safety?",
        ],
      },
    ],
    resources: [
      {
        label: "Toronto West LIP: GBV first response toolkit for frontline staff (2020)",
        url: "https://www.torontowestlip.ca",
        kind: "web",
      },
      {
        label: "GBV Pocket Guide in French (PDF)",
        url: "https://gbvguidelines.org/wp/wp-content/uploads/2019/05/GBV_PocketGuide021718_FR_Final.pdf",
        kind: "pdf",
      },
    ],
    basedOn:
      "Toronto West Local Immigration Partnership first response toolkit (2020, Canada; general principles only) and the GBV Pocket Guide.",
  },
  {
    id: "signs-danger",
    title: "Recognising control and immediate danger",
    summary:
      "Abuse is often a pattern of control, not only physical violence. Some signs mean the danger is urgent.",
    sections: [
      {
        heading: "Patterns of control (the Duluth power and control wheel)",
        points: [
          "Threats and coercion: threatening to hurt her, take the children or report her.",
          "Intimidation: frightening looks, smashing things, showing weapons.",
          "Emotional abuse: putting her down, name calling, making her doubt herself.",
          "Isolation: controlling who she sees, where she goes and what she does.",
          "Minimising, denying and blaming: making light of abuse or saying she caused it.",
          "Using the children to control her or make her feel guilty.",
          "Economic abuse: stopping her from working, taking her money, refusing access to household income.",
          "Using privilege: treating her like a servant and making all the big decisions.",
        ],
      },
      {
        heading: "The cycle of abuse",
        points: [
          "Many survivors describe tension building, then an explosion of abuse, then a calm phase when the partner apologises and promises to change.",
          "This helps explain why leaving is hard. It is a model, not a rule: not every relationship follows this pattern.",
        ],
      },
      {
        heading: "Signs of immediate danger",
        points: [
          "The violence is getting worse.",
          "She has been threatened with a weapon.",
          "Someone has tried to strangle her.",
          "She was beaten while pregnant.",
          "The person is extremely jealous and controlling.",
          "She believes the person could kill her.",
          "If you see these signs, treat it as urgent. Safety comes first: follow your organisation's emergency protocol and support her in reaching help she agrees to.",
        ],
      },
    ],
    resources: [
      {
        label: "The Duluth Model (source of the power and control wheel)",
        url: "https://www.theduluthmodel.org",
        kind: "web",
      },
      {
        label: "Toronto West LIP: GBV first response toolkit for frontline staff (2020)",
        url: "https://www.torontowestlip.ca",
        kind: "web",
      },
    ],
    basedOn:
      "Toronto West LIP toolkit (2020), Domestic Abuse Intervention Programs (Duluth), and the WHO clinical handbook.",
  },
  {
    id: "medical-timing",
    title: "Sexual violence: care that cannot wait",
    summary:
      "Some medical care only works if it starts quickly. Knowing the time limits helps you act.",
    sections: [
      {
        heading: "Time limits (WHO guidance)",
        points: [
          "HIV post-exposure medicine (PEP): start as soon as possible and within 72 hours (3 days).",
          "Emergency contraception: within 120 hours (5 days) of unprotected sex.",
          "Treatment of injuries, prevention of infections, vaccines such as tetanus and hepatitis B (where available), and collection of evidence: as soon as possible.",
          "Counselling and psychosocial support can start at any time.",
        ],
      },
      {
        heading: "Your role",
        points: [
          "Tell her, gently and clearly, that time-sensitive care exists, and let her decide.",
          "Help her reach a health facility that provides post-rape care. Check your verified directory and call ahead if you can.",
          "Offer to go with her if she wants company.",
          "Do not examine her or ask for graphic detail. That is for trained health workers.",
          "If more than 72 hours have passed, she should still be offered care, testing and counselling. Do not tell her it is too late.",
        ],
      },
      {
        heading: "Check locally",
        points: [
          "Good practice is that medical care does not depend on a police report. Check how facilities in your area work.",
          "Protocols and medicines vary by country. Confirm current national guidance with a health professional.",
        ],
      },
    ],
    resources: [
      {
        label: "WHO and UNFPA: Clinical management of rape survivors (PDF)",
        url: "https://www.unfpa.org/sites/default/files/pub-pdf/clinical-mgtrape-2005rev1.pdf",
        kind: "pdf",
      },
      {
        label: "Together for Girls: what leaders need to know about post-rape care (PDF)",
        url: "https://cdn.togetherforgirls.org/assets/files/What-national-leaders-need-to-know-about-post-rape-care.pdf",
        kind: "pdf",
      },
    ],
    basedOn:
      "WHO and UNFPA clinical management of rape survivors; WHO Health Cluster; Together for Girls.",
  },
  {
    id: "consent-confidentiality",
    title: "Consent, confidentiality and children",
    summary:
      "How to protect a survivor's choices and her privacy, and where confidentiality has limits.",
    sections: [
      {
        heading: "Consent",
        points: [
          "Ask permission before any referral or before sharing anything about her.",
          "Explain in plain words what will be shared, with whom, and why.",
          "She can say no, and she can change her mind later.",
        ],
      },
      {
        heading: "Confidentiality and its limits",
        points: [
          "Promise only what you can keep. Tell her at the start that some things may have to be reported.",
          "If you are required to report, explain what you must report and to whom.",
          "Share only what is needed, and only with people who need it.",
        ],
      },
      {
        heading: "Children",
        points: [
          "Children who witness violence can be deeply affected.",
          "Many places have legal duties to report child abuse or children at risk. Check your organisation's child protection policy and the law that applies to you with your supervisor, before you promise confidentiality.",
          "If children are involved, tell the mother at the start what your duty may require.",
        ],
      },
      {
        heading: "Records and messages",
        points: [
          "Record cases by code, not by name, and never put identifying details in notes. This app is built that way.",
          "Keep papers and screens out of sight. Do not photograph or forward case details on personal messaging apps.",
          "Her phone may be watched. Ask how it is safe to contact her before you call or message.",
        ],
      },
    ],
    resources: [
      {
        label: "GBV Pocket Guide in French (PDF)",
        url: "https://gbvguidelines.org/wp/wp-content/uploads/2019/05/GBV_PocketGuide021718_FR_Final.pdf",
        kind: "pdf",
      },
      {
        label: "Toronto West LIP: GBV first response toolkit for frontline staff (2020)",
        url: "https://www.torontowestlip.ca",
        kind: "web",
      },
    ],
    basedOn:
      "GBV Pocket Guide and the Toronto West LIP toolkit (general principles). Some points on records and messages are general good practice.",
  },
  {
    id: "safety-planning",
    title: "Basic safety planning",
    summary:
      "How to help a woman think through her safety without telling her what she must do.",
    sections: [
      {
        heading: "What a safety plan is",
        points: [
          "A plan made with her, not for her. It builds on what she already does to stay safe.",
          "It can include contacts, services, and an escape plan if she ever thinks about leaving.",
        ],
      },
      {
        heading: "Things to talk through",
        points: [
          "Does she have injuries that need treatment now? If she agrees, help her get medical care.",
          "Would she like to contact emergency services or the police? If so, support her.",
          "If she does not feel safe going home, think through safe places: a relative, a trusted friend, a neighbour, a shelter or a place of worship.",
          "Help her make a list of people and services she can call, and think about where she can keep it safely.",
          "Encourage her to keep copies of important documents somewhere safe, if she chooses.",
          "If she decides to stay, respect that. Connect her to specialist services to build a deeper plan.",
        ],
      },
      {
        heading: "Children",
        points: [
          "Help her think about a safe place in the home, a safe way out, and a place to meet afterwards.",
          "Children should know how to ask for help and should not use a phone the abuser can see.",
          "Tell children that their safety comes first and that keeping a parent safe is not their job.",
        ],
      },
      {
        heading: "Adapt to your setting",
        points: [
          "The source toolkit is from Canada. Its emergency numbers, laws and shelter directories do not apply here.",
          "Use the verified contacts and refuge pages in this app, and your own organisation's protocols.",
        ],
      },
    ],
    resources: [
      {
        label: "Toronto West LIP: GBV first response toolkit for frontline staff (2020)",
        url: "https://www.torontowestlip.ca",
        kind: "web",
      },
    ],
    basedOn: "Toronto West LIP first response toolkit (2020), including its child safety plan.",
  },
  {
    id: "internal-safeguarding",
    title: "When the concern is inside your own organisation",
    summary:
      "NGO staff can be victims of gender-based violence, and sometimes perpetrators. Organisations need clear ways to handle this.",
    sections: [
      {
        heading: "Why this matters",
        points: [
          "Many NGOs support survivors, yet their own staff can also be victims or perpetrators.",
          "Many organisations find these cases hard to handle because they lack expertise, tools and suitable procedures.",
        ],
      },
      {
        heading: "What one NGO network's training covers",
        points: [
          "The legal frameworks that apply, and the different types of violence and power relationships.",
          "The consequences of gender-based violence for those affected.",
          "Handling complaints and supporting victims.",
          "Managing investigations: collecting and examining evidence, interviews, and writing reports.",
          "Practical steps for managers.",
          "The course is taught by a clinical psychologist, a lawyer and a police officer together, so care, law and evidence are covered as one.",
        ],
      },
      {
        heading: "Questions to ask your own organisation (suggestions)",
        points: [
          "Do we have a written policy on sexual abuse and harassment, and does every staff member know it?",
          "Who receives a complaint, and is there a confidential way to make one?",
          "Who investigates, and are they trained?",
          "How are people who complain protected and supported?",
        ],
      },
    ],
    resources: [
      {
        label: "Forus: training to strengthen NGOs in handling complaints and investigations",
        url: "https://www.forus-international.org/en/news/gender-based-violence-a-training-to-strengthen-the-capability-of-ngos-in-the-handling-of-complaints-and-managing-investigations",
        kind: "web",
      },
      {
        label: "Coordination SUD (the French NGO network behind the training)",
        url: "https://www.forus-international.org/member/coordination-sud-rassembler-et-agir-pour-la-solidarite-internationale",
        kind: "web",
      },
      {
        label: "Safeguarding Resource and Support Hub: Pocket Guide resource",
        url: "https://safeguardingsupporthub.org/documents/pocket-resource-supporting-survivors-when-gbv-actor-not-available-your-area",
        kind: "web",
      },
    ],
    basedOn:
      "Coordination SUD training, reported by Forus (2021). The questions in the last section are suggestions, not from the article.",
  },
];
