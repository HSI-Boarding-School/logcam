import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Login logic will be implemented later
    console.log("Login attempt:", { email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-background to-highlight/10">
      <div className="w-full max-w-md">
        <div className="glass-card p-8 sm:p-10 rounded-2xl shadow-elevation animate-fade-in">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary mb-4">
              <img src="@/../public/logo.webp" alt="" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gradient-primary mb-2">
              Welcome Back
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Sign in to access your Logcam dashboard
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="student@hsibs.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-12 rounded-xl bg-background/50 border-border/50 focus:border-primary transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 h-12 rounded-xl bg-background/50 border-border/50 focus:border-primary transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border accent-primary"
                />
                <span className="text-muted-foreground">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full h-12 text-base font-semibold"
            >
              Sign In
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-sm text-muted-foreground">
          © 2025 HSI Boarding School • Logcam System
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
