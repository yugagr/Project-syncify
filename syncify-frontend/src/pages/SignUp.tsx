import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { WavyBackground } from "@/components/ui/wavy-background"; 

const SignUp = () => {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: supaError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`,
          },
        },
      });

      if (supaError) throw new Error(supaError.message);

      if (data.user && !data.session) {
        setSuccess(true);
        setError(
          "Account created! Please check your email to verify your account before signing in."
        );

        setTimeout(() => {
          navigate("/signin");
        }, 3000);
        return;
      }

      if (data.session) {
        const accessToken = data.session.access_token;
        localStorage.setItem("token", accessToken);
        localStorage.setItem("email", email);
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to sign up");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden text-foreground">
      {/* 🌊 Wavy Background Layer */}
      <div className="absolute inset-0 -z-10">
        <WavyBackground
          backgroundFill="#0f0f11"
          waveOpacity={0.8}
          blur={8}
          speed="slow"
          colors={["#7c3aed", "#8b5cf6", "#a78bfa", "#c084fc"]}
        />
      </div>

      {/* 🌐 Navigation */}
      <Navigation />

      {/* 💳 Signup Card */}
      <div className="max-w-md mx-auto pt-28 px-4 relative z-10">
        <Card className="p-8 space-y-6 bg-black/40 backdrop-blur-lg border border-white/10 shadow-2xl">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-white">
              Create your account!
            </h1>
            <p className="text-gray-300">
              Start your free trial in minutes
            </p>
          </div>

          {success ? (
            <div className="text-center space-y-4">
              <div className="text-green-400 font-medium">
                ✅ Account created successfully!
              </div>
              <p className="text-sm text-gray-300">
                Please check your email to verify your account before signing in.
              </p>
              <p className="text-sm text-gray-300">
                Redirecting to sign-in page...
              </p>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-white">
                    First name
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-white">
                    Last name
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">
                    Create password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white">
                    Confirm password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              {error && (
                <div
                  className={`text-sm ${
                    error.includes("check your email")
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                  role="alert"
                >
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-primary shadow-glow-primary"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>
          )}

          <p className="text-sm text-center text-gray-300">
            Already have an account?{" "}
            <Link to="/signin" className="text-primary hover:underline">
              Login
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;
