"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabasePublic = exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
// Load environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
// Pick service role key (for backend privileged access), otherwise fallback to anon
const supabaseKey = supabaseServiceKey || supabaseAnonKey;
if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Supabase environment variables are missing.');
}
// Create client (no session persistence on server)
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
});
// Optional: Export a user-facing client (with anon key) for limited access
exports.supabasePublic = (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
});
exports.default = exports.supabase;
