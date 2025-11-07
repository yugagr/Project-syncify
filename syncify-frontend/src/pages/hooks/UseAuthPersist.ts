import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

const UseAuthPersist = () => {
  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (session?.access_token) {
        localStorage.setItem("token", session.access_token);
      }
    });
  }, []);
 }
export default UseAuthPersist;