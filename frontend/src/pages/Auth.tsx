import { useState } from "react";
import { Heart, Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import ThreeBackground from "@/components/ThreeBackground";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        await signUp(email, password, fullName);
        toast.success("Account created successfully!");
        navigate("/");
      } else {
        await signIn(email, password);
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #f0fdfa 0%, #ccfbf1 40%, #e0f2fe 100%)" }}>
      <ThreeBackground />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <div className="mb-8 text-center animate-fade-in">
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-5 animate-float"
            style={{
              background: "linear-gradient(135deg, hsl(185,85%,38%) 0%, hsl(190,95%,42%) 100%)",
              boxShadow: "0 16px 48px hsl(185 85% 38% / 0.3), 0 4px 16px hsl(185 85% 38% / 0.15)",
            }}
          >
            <Heart className="h-12 w-12 text-white" fill="white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight" style={{
            background: "linear-gradient(135deg, hsl(185,85%,30%) 0%, hsl(190,95%,36%) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            HealthSync
          </h1>
          <p className="mt-2 text-sm font-medium text-teal-600">Your intelligent health companion</p>
        </div>

        {/* Card */}
        <div
          className="w-full max-w-sm animate-slide-up rounded-3xl p-6"
          style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid hsl(185 40% 80% / 0.6)",
            boxShadow: "0 24px 64px hsl(185 85% 38% / 0.12), 0 4px 16px hsl(200 25% 12% / 0.06)",
          }}
        >
          {/* Mode Toggle */}
          <div className="flex p-1 rounded-2xl mb-6 bg-teal-50">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300",
                  mode === m ? "text-white shadow-sm" : "text-teal-600 hover:text-teal-700"
                )}
                style={mode === m ? {
                  background: "linear-gradient(135deg, hsl(185,85%,38%) 0%, hsl(190,95%,42%) 100%)",
                  boxShadow: "0 4px 12px hsl(185 85% 38% / 0.3)",
                } : {}}
              >
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-700">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-500" />
                  <Input id="name" placeholder="Your name" value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-11 rounded-xl border-teal-200 focus:border-teal-400 bg-white text-slate-800" required />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-500" />
                <Input id="email" type="email" placeholder="you@example.com" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 rounded-xl border-teal-200 focus:border-teal-400 bg-white text-slate-800" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-500" />
                <Input id="password" type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-11 rounded-xl border-teal-200 focus:border-teal-400 bg-white text-slate-800"
                  required minLength={8} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all duration-300 mt-2 animate-glow-pulse"
              style={{
                background: "linear-gradient(135deg, hsl(185,85%,38%) 0%, hsl(190,95%,42%) 100%)",
                boxShadow: "0 8px 24px hsl(185 85% 38% / 0.35)",
                opacity: loading ? 0.75 : 1,
              }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {mode === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs mt-5 text-slate-400">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
