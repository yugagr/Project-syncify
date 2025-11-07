// src/pages/AuthCallback.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        localStorage.setItem("token", data.session.access_token);
        navigate("/dashboard");
      } else {
        navigate("/signin");
      }
    });
  }, []);

  return <p>Verifying your account...</p>;
}
