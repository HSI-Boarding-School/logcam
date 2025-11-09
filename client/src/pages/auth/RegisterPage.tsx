import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, User } from "lucide-react";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Registration logic will be implemented later
    console.log("Register attempt:", formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-background to-highlight/10">
      <div className="w-full max-w-md">
        <div className="glass-card p-8 sm:p-10 rounded-2xl shadow-elevation animate-fade-in">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-accent mb-4">
             <img src="@/../public/logo.webp" alt="" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gradient-primary mb-2">
              Create Account
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Join HSI Boarding School's Logcam system
            </p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-11 h-12 rounded-xl bg-background/50 border-border/50 focus:border-accent transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="student@hsibs.edu"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-11 h-12 rounded-xl bg-background/50 border-border/50 focus:border-accent transition-all"
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
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-11 h-12 rounded-xl bg-background/50 border-border/50 focus:border-accent transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-11 h-12 rounded-xl bg-background/50 border-border/50 focus:border-accent transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                id="terms"
                className="w-4 h-4 mt-0.5 rounded border-border accent-accent"
                required
              />
              <label htmlFor="terms" className="text-muted-foreground">
                I agree to the{" "}
                <Link to="/terms" className="text-primary hover:text-accent/80 font-medium">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-primary hover:text-accent/80 font-medium">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full h-12 text-base font-semibold"
            >
              Create Account
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary hover:text-accent/80 font-semibold transition-colors"
              >
                Sign In
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

export default RegisterPage;
