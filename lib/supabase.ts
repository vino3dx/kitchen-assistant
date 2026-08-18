import { createClient } from "@supabase/supabase-js";
import { store } from "./store";

// Use provided Supabase credentials or environment variables
const supabaseUrl =
  process.env.SUPABASE_URL || "https://qqcpgqsmbubrkswjpbnw.supabase.co";
const supabaseKey =
  process.env.SUPABASE_KEY ||
  "sb_publishable_TyEyMTnR0YKsUKoKRGYUzA_wQtKJayK";

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseKey && supabaseUrl.startsWith("http")
);

export const supabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Export kitchen data store helper
export { store };
