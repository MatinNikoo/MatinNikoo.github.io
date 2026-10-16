/* Skeptic deployment settings. These values are safe to be public. Secret keys never go here. */
window.SKEPTIC_CONFIG = {
  /* your Claude server. On Vercel this is '/api/chat'. Empty means visitors use free Claude through Puter */
  cloudUrl: '',
  /* true when the server only answers signed in users (REQUIRE_LOGIN on Vercel) */
  cloudNeedsLogin: false,
  /* your Supabase project, for Google sign in and synced chats. Empty means everything stays in the browser */
  supabaseUrl: '',
  supabaseAnonKey: '',
  /* the public address once Skeptic is live, like 'https://skeptic.app'. Used for link previews on LinkedIn, X and iMessage */
  siteUrl: 'https://matinnikoo.github.io/skeptic',
  /* free, cookie free page counts from goatcounter.com. Put your site code here, like 'skeptic' for skeptic.goatcounter.com */
  goatcounter: 'matinnikoo',
  /* where Send feedback goes. An email opens the mail app; empty opens a GitHub issue on feedbackRepo */
  feedbackEmail: '',
  feedbackRepo: 'matinnikoo/skeptic-checks',
  /* a free form (Tally or Google Forms) for the Pro waitlist. Empty shows Upgrade plan as coming soon */
  waitlistUrl: ''
};
