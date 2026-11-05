/* Brainbox Ninja: Supabase settings for the global leaderboard.

   1. In Supabase, open Project Settings → API Keys (and Data API for the URL).
   2. Paste your Project URL and your PUBLISHABLE key below (it starts with sb_publishable_).

   The publishable key is designed to be public: it is safe in browser code because
   Row Level Security decides what it can do.
   NEVER put the secret key (sb_secret_...) or the service_role key in this file or anywhere in this repo.

   While the placeholders are still here, the game works normally and the leaderboard
   shows "not switched on yet". */
window.BN_SUPABASE = {
  url: 'https://YOUR-PROJECT-REF.supabase.co',
  key: 'sb_publishable_YOUR-KEY-HERE'
};
