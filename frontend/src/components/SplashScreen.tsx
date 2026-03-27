import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<"enter" | "pulse" | "exit">("enter");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("pulse"), 400);
    const t2 = setTimeout(() => setPhase("exit"), 2000);
    const t3 = setTimeout(onComplete, 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center transition-all duration-500",
        phase === "exit" && "opacity-0 scale-105"
      )}
      style={{ background: "linear-gradient(160deg, #f0fdfa 0%, #ccfbf1 40%, #e0f2fe 100%)" }}
    >
      {/* Animated rings */}
      {[120, 200, 280, 360].map((size, i) => (
        <div
          key={i}
          className="absolute rounded-full border-2 transition-all duration-1000"
          style={{
            width: size,
            height: size,
            borderColor: `hsl(185 85% 38% / ${0.18 - i * 0.03})`,
            opacity: phase === "enter" ? 0 : 1,
            transform: phase === "enter" ? "scale(0.4)" : "scale(1)",
            transitionDelay: `${i * 120}ms`,
            animation: phase === "pulse" ? `spinSlow ${10 + i * 3}s linear infinite` : "none",
          }}
        />
      ))}

      {/* Soft glow blobs */}
      <div className="absolute w-72 h-72 rounded-full pointer-events-none animate-pulse-soft"
        style={{ background: "radial-gradient(circle, hsl(185,85%,38%,0.15) 0%, transparent 70%)", filter: "blur(50px)" }} />
      <div className="absolute w-56 h-56 rounded-full pointer-events-none animate-float"
        style={{ background: "radial-gradient(circle, hsl(190,95%,42%,0.12) 0%, transparent 70%)", filter: "blur(40px)", top: "25%", left: "15%" }} />

      {/* Logo */}
      <div className={cn(
        "relative z-10 flex flex-col items-center gap-5 transition-all duration-500",
        phase === "enter" && "scale-75 opacity-0",
        phase === "pulse" && "scale-100 opacity-100",
        phase === "exit" && "scale-110 opacity-0"
      )}>
        <div className="relative">
          <div
            className="w-28 h-28 rounded-3xl flex items-center justify-center animate-float"
            style={{
              background: "linear-gradient(135deg, hsl(185,85%,38%) 0%, hsl(190,95%,42%) 100%)",
              boxShadow: "0 16px 48px hsl(185 85% 38% / 0.35), 0 4px 16px hsl(185 85% 38% / 0.2)",
            }}
          >
            <Heart
              className={cn("h-14 w-14 text-white transition-transform duration-700", phase === "pulse" && "animate-pulse-soft")}
              fill="white"
            />
          </div>
          {/* Orbiting dot */}
          <div
            className="absolute w-3.5 h-3.5 rounded-full animate-spin-slow"
            style={{
              background: "white",
              boxShadow: "0 0 10px hsl(185 85% 38% / 0.6)",
              top: -5,
              right: -5,
              transformOrigin: "calc(50% + 22px) calc(50% + 22px)",
            }}
          />
        </div>

        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight" style={{
            background: "linear-gradient(135deg, hsl(185,85%,32%) 0%, hsl(190,95%,38%) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            HealthSync
          </h1>
          <p className="text-sm mt-1.5 font-medium text-teal-600">
            Your intelligent health companion
          </p>
        </div>
      </div>

      {/* Loading dots */}
      <div className={cn(
        "absolute bottom-20 flex gap-2 transition-all duration-500 delay-300",
        phase === "enter" ? "opacity-0" : "opacity-100",
        phase === "exit" && "opacity-0"
      )}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full"
            style={{
              background: "linear-gradient(135deg, hsl(185,85%,38%), hsl(190,95%,42%))",
              animation: "bounceGentle 1.2s ease-in-out infinite",
              animationDelay: `${i * 0.18}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
