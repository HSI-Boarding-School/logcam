// pages/LoginPage.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, AlertCircle } from "lucide-react";
import useAuthStore from "@/stores/useAuthStore";

const LoginPage = () => {
  const navigate = useNavigate();
  const { isLoading, error, clearError, login } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const succes = await login({ email, password });
      if (succes) {
        navigate("/");
      } // Redirect after login succes
    } catch (err) {
      // Error already handled in store
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-background to-highlight/10">
      <div className="w-full max-w-md">
        <div className="glass-card p-8 sm:p-10 rounded-2xl shadow-elevation animate-fade-in">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary mb-4">
              <img src="/logo.webp" alt="Logcam Logo" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gradient-primary mb-2">
              Welcome Back
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Sign in to access your Logcam dashboard
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-600 transition-colors"
              >
                ×
              </button>
            </div>
          )}

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
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearError(); // Clear error saat user ketik
                  }}
                  className="pl-11 h-12 rounded-xl bg-background/50 border-border/50 focus:border-primary transition-all"
                  disabled={isLoading}
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
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError(); // Clear error saat user ketik
                  }}
                  className="pl-11 h-12 rounded-xl bg-background/50 border-border/50 focus:border-primary transition-all"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border accent-primary"
                  disabled={isLoading}
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
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
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
