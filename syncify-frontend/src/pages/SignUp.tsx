import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Starfield from "@/components/Starfield";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

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
      // ✅ Create Supabase auth user (triggers email verification)
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

      // ✅ Check if email confirmation is required
      if (data.user && !data.session) {
        setSuccess(true);
        setError("Account created! Please check your email to verify your account before signing in.");
        
        // Optionally redirect to sign in after a delay
        setTimeout(() => {
          navigate("/signin");
        }, 3000);
        return;
      }

      // ✅ If a session exists (email confirmation disabled in Supabase)
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
    <div className="min-h-screen relative bg-background text-foreground">
      <div className="absolute inset-0 -z-10">
        <Starfield starCount={2500} depth={1400} color={0xffffff} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/30 to-background/80" />
      </div>
      <Navigation />
      <div className="max-w-md mx-auto pt-28 px-4">
        <Card className="p-8 space-y-6 bg-card/70 backdrop-blur-md border-border">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Create your account</h1>
            <p className="text-muted-foreground">Start your free trial in minutes</p>
          </div>
          
          {success ? (
            <div className="text-center space-y-4">
              <div className="text-green-600 font-medium">
                ✅ Account created successfully!
              </div>
              <p className="text-sm text-muted-foreground">
                Please check your email to verify your account before signing in.
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecting to sign in page...
              </p>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input 
                    id="firstName" 
                    placeholder="First name" 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
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
                <Label htmlFor="email">Email</Label>
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
                  <Label htmlFor="password">Create password</Label>
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
                  <Label htmlFor="confirmPassword">Confirm password</Label>
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
                <div className={`text-sm ${error.includes('check your email') ? 'text-green-600' : 'text-red-500'}`} role="alert">
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
          
          <p className="text-sm text-center text-muted-foreground">
            Already have an account? <Link to="/signin" className="text-primary hover:underline">Login</Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;