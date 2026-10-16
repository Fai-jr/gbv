// Areas that need a registered (email) account. Set one to false to open it to everyone again.
// Note: the community is also protected by the Firestore rules, so changing "community" here
// only changes what the page shows. The chat stores nothing on the server, so this setting is enough for it.
export const GATED = {
  chat: true,
  community: true,
};
