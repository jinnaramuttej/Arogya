"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [signupErrors, setSignupErrors] = useState<{ name?: string; email?: string; password?: string; confirm?: string }>({});
  const router = useRouter();

  const deriveNameFromEmail = (value: string) => {
    const base = value.split("@")[0] || "";
    return base
      .split(/[._-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
      .trim();
  };

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignup = () => {
    const newErrors: { name?: string; email?: string; password?: string; confirm?: string } = {};
    if (!name.trim()) {
      newErrors.name = "Full name is required";
    }
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!confirmPassword) {
      newErrors.confirm = "Please confirm your password";
    } else if (confirmPassword !== password) {
      newErrors.confirm = "Passwords do not match";
    }
    setSignupErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") {
      if (validate()) {
        console.log("Login successful");
        const derivedName = deriveNameFromEmail(email) || "Aarav";
        localStorage.setItem("az_user_name", derivedName);
        localStorage.setItem("az_logged_in", "true");
        router.push("/");
      }
    } else if (validateSignup()) {
      console.log("Signup successful");
      localStorage.setItem("az_user_name", name.trim());
      localStorage.setItem("az_logged_in", "true");
      router.push("/");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background login-font-body">
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none object-[20%_center]"
      >
        <source src="/login-bg.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/45 to-black/75" />

      <div className="relative z-10 min-h-screen flex items-center">
        <div className="container mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="text-white"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[10px] uppercase tracking-[0.25em] text-white/80">
                Secure Arogya Access
              </div>
              <h1 className="login-font-heading text-3xl md:text-4xl font-semibold leading-tight mt-5">
                Welcome back to a smarter health journey.
              </h1>
              <p className="text-white/70 mt-3 max-w-xl text-base">
                Your personalized care hub is ready. Sign in to view records, track wellness, and access AI-powered insights.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3 max-w-md">
                {[
                  { label: "Active Users", value: "120k+" },
                  { label: "Data Security", value: "AES-256" },
                  { label: "System Uptime", value: "99.9%" },
                  { label: "Avg. Response", value: "240ms" }
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
                    <p className="text-[11px] text-white/60 uppercase tracking-wide">{item.label}</p>
                    <p className="text-lg font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative lg:justify-self-end lg:translate-x-6 w-full max-w-md"
            >
              <div className="rounded-[2rem] border border-white/20 bg-white/10 p-7 backdrop-blur-2xl shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
                    <span className="text-primary-foreground font-semibold text-base">A</span>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-white/60">Arogya Zenith</p>
                    <p className="login-font-heading text-2xl font-semibold text-white">
                      {mode === "login" ? "Sign in" : "Create account"}
                    </p>
                  </div>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl border border-white/15 bg-white/10 p-1 text-xs uppercase tracking-[0.25em] text-white/60">
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className={`rounded-xl px-3 py-2 font-semibold transition ${
                      mode === "login" ? "bg-white/20 text-white" : "hover:bg-white/10"
                    }`}
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className={`rounded-xl px-3 py-2 font-semibold transition ${
                      mode === "signup" ? "bg-white/20 text-white" : "hover:bg-white/10"
                    }`}
                  >
                    Sign up
                  </button>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                  {mode === "signup" && (
                    <div className="space-y-1.5">
                      <label className="text-xs uppercase tracking-[0.2em] text-white/60">Full name</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your name"
                          className={`w-full rounded-2xl bg-white/10 border px-4 py-3 text-sm text-white placeholder:text-white/50 outline-none transition-all ${
                            signupErrors.name ? "border-destructive ring-2 ring-destructive/60" : "border-white/20 focus:border-primary/70 focus:ring-2 focus:ring-primary/40"
                          }`}
                          aria-invalid={!!signupErrors.name}
                          aria-describedby="name-error"
                        />
                      </div>
                      {signupErrors.name && (
                        <p id="name-error" className="text-[11px] text-destructive font-medium pl-1">{signupErrors.name}</p>
                      )}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-[0.2em] text-white/60">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@domain.com"
                        className={`w-full rounded-2xl bg-white/10 border px-11 py-3 text-sm text-white placeholder:text-white/50 outline-none transition-all ${
                          (mode === "login" ? errors.email : signupErrors.email)
                            ? "border-destructive ring-2 ring-destructive/60"
                            : "border-white/20 focus:border-primary/70 focus:ring-2 focus:ring-primary/40"
                        }`}
                        aria-invalid={!!(mode === "login" ? errors.email : signupErrors.email)}
                        aria-describedby="email-error"
                      />
                    </div>
                    {(mode === "login" ? errors.email : signupErrors.email) && (
                      <p id="email-error" className="text-[11px] text-destructive font-medium pl-1">
                        {mode === "login" ? errors.email : signupErrors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-[0.2em] text-white/60">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full rounded-2xl bg-white/10 border px-11 py-3 text-sm text-white placeholder:text-white/50 outline-none transition-all ${
                          (mode === "login" ? errors.password : signupErrors.password)
                            ? "border-destructive ring-2 ring-destructive/60"
                            : "border-white/20 focus:border-primary/70 focus:ring-2 focus:ring-primary/40"
                        }`}
                        aria-invalid={!!(mode === "login" ? errors.password : signupErrors.password)}
                        aria-describedby="password-error"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {(mode === "login" ? errors.password : signupErrors.password) && (
                      <p id="password-error" className="text-[11px] text-destructive font-medium pl-1">
                        {mode === "login" ? errors.password : signupErrors.password}
                      </p>
                    )}
                  </div>

                  {mode === "login" ? (
                    <div className="flex items-center justify-between text-xs text-white/70">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="h-4 w-4 rounded border-white/30 bg-white/10 text-primary focus:ring-primary/40" />
                        Remember me
                      </label>
                      <a href="#" className="hover:text-white transition-colors">Forgot password?</a>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-xs uppercase tracking-[0.2em] text-white/60">Confirm password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className={`w-full rounded-2xl bg-white/10 border px-11 py-3 text-sm text-white placeholder:text-white/50 outline-none transition-all ${
                            signupErrors.confirm ? "border-destructive ring-2 ring-destructive/60" : "border-white/20 focus:border-primary/70 focus:ring-2 focus:ring-primary/40"
                          }`}
                          aria-invalid={!!signupErrors.confirm}
                          aria-describedby="confirm-error"
                        />
                      </div>
                      {signupErrors.confirm && (
                        <p id="confirm-error" className="text-[11px] text-destructive font-medium pl-1">{signupErrors.confirm}</p>
                      )}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full rounded-2xl py-3 font-semibold text-sm text-white bg-gradient-to-r from-primary to-secondary shadow-lg shadow-primary/30 hover:translate-y-[-1px] transition"
                  >
                    {mode === "login" ? "Sign In" : "Create Account"}{" "}
                    <ArrowRight className="inline-block ml-2 w-4 h-4" />
                  </button>
                </form>

                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-white/15" />
                  <span className="text-[10px] text-white/60 uppercase tracking-[0.35em]">or</span>
                  <div className="flex-1 h-px bg-white/15" />
                </div>

                <button className="w-full rounded-2xl border border-white/20 bg-white/10 py-3 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/15 transition-colors flex items-center justify-center gap-3">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>

                <p className="text-center text-[11px] text-white/60 mt-6">
                  {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                  <button
                    type="button"
                    onClick={() => setMode(mode === "login" ? "signup" : "login")}
                    className="text-white font-semibold hover:underline"
                  >
                    {mode === "login" ? "Create one" : "Sign in"}
                  </button>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
