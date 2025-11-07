import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Create a dummy client if env vars are missing (prevents app crash)
// This allows the app to load and show proper error messages
let supabase: ReturnType<typeof createClient>;
let isConfigured = false;

if (!supabaseUrl || !supabaseAnon || supabaseUrl === "your_supabase_project_url" || supabaseAnon === "your_supabase_anon_key" || supabaseUrl.includes("placeholder")) {
  console.error("⚠️ Missing or placeholder Supabase environment variables!");
  console.error("Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file");
  console.error("Current values:", { 
    url: supabaseUrl || "NOT SET", 
    key: supabaseAnon ? `${supabaseAnon.substring(0, 10)}...` : "NOT SET" 
  });
  // Create a dummy client with placeholder values to prevent crash
  supabase = createClient("https://placeholder.supabase.co", "placeholder-key", {
    auth: {
      persistSession: false,
    },
  });
  isConfigured = false;
} else {
  console.log("✅ Supabase configured:", { url: supabaseUrl });
  supabase = createClient(supabaseUrl, supabaseAnon, {
    auth: {
      persistSession: true, // browser saves the session
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  isConfigured = true;
}

// Export a function to check if Supabase is properly configured
export const isSupabaseConfigured = () => isConfigured;

export { supabase };
export default supabase;
