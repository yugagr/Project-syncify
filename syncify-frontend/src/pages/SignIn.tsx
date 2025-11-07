import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Hyperspeed from "@/components/Hyperspeed";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // ✅ Sign in user with Supabase
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw new Error(authError.message);

      if (!data.session) {
        throw new Error("Email is not verified. Please verify before login.");
      }

      const accessToken = data.session.access_token;

      // ✅ Save session in localStorage
      localStorage.setItem("token", accessToken);
      localStorage.setItem("email", email);

      // ✅ Navigate to dashboard
      navigate("/dashboard", { replace: true });

    } catch (err: any) {
      setError(err.message || "Failed to log in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-background text-foreground">
      <div className="absolute inset-0 -z-10">
        <Hyperspeed />
      </div>
      <Navigation />
      <div className="max-w-md mx-auto pt-28 px-4">
        <Card className="p-8 space-y-6">
          <h1 className="text-3xl font-bold text-center">Login</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button disabled={isLoading} className="w-full">
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
          <p className="text-sm text-center">
            New here? <Link to="/signup">Create an account</Link>
          </p>
          <p className="text-sm text-center">
            <Link to="/forgot-password" className="text-primary hover:underline">
              Forgot password?
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default SignIn;