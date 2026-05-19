const runtimeConfig = globalThis.window || {};

export const SUPABASE_URL =
  runtimeConfig.EDV_SUPABASE_URL || "https://kqbnanxdadyrseojaweh.supabase.co";

export const SUPABASE_PUBLISHABLE_KEY =
  runtimeConfig.EDV_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_9oCk-Kzcd2quTtCoQXmWaQ_jLTl6pKT";

export const SUPABASE_ANON_KEY = SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = () =>
  Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
