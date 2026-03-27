import { Heart, TrendingUp, Zap } from "lucide-react";

interface HeroHealthCardProps {
  userName: string;
  adherencePercent: number;
  dosesTaken: number;
  totalDoses: number;
  streak: number;
  feelingLabel: string;
  adherenceDeltaPercent: number;
}

export function HeroHealthCard({
  userName, adherencePercent, dosesTaken, totalDoses, streak, feelingLabel, adherenceDeltaPercent,
}: HeroHealthCardProps) {
  const getMessage = () => {
    if (adherencePercent >= 90) return "You're doing amazing!";
    if (adherencePercent >= 75) return "Great progress this week!";
    if (adherencePercent >= 50) return "You're on the right track!";
    return "Every step counts — let's do this!";
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (adherencePercent / 100) * circumference;
  const deltaText = `${adherenceDeltaPercent >= 0 ? "+" : ""}${adherenceDeltaPercent}% vs last week`;

  return (
    <div
      className="relative rounded-3xl p-6 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, hsl(185,85%,36%) 0%, hsl(190,95%,40%) 60%, hsl(175,80%,34%) 100%)",
        boxShadow: "0 16px 48px hsl(185 85% 38% / 0.35), 0 4px 16px hsl(185 85% 38% / 0.2)",
      }}
    >
      {/* Shine overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 55%)" }} />
      {/* Top shimmer line */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)" }} />
      {/* Decorative circle */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full"
        style={{ background: "rgba(255,255,255,0.08)" }} />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full"
        style={{ background: "rgba(255,255,255,0.06)" }} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-sm font-medium text-teal-100">Welcome back,</p>
            <h1 className="text-2xl font-bold text-white mt-0.5">{userName}</h1>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
              style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)" }}>
              <Zap className="h-3.5 w-3.5 text-yellow-200" fill="currentColor" />
              <span className="text-xs font-bold text-white">{streak} day streak!</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-5">
          {/* Progress ring */}
          <div className="relative flex-shrink-0">
            <svg className="w-24 h-24 progress-ring">
              <circle cx="48" cy="48" r="45" stroke="rgba(255,255,255,0.2)" strokeWidth="7" fill="none" />
              <circle cx="48" cy="48" r="45" stroke="white" strokeWidth="7" fill="none"
                strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-white">{adherencePercent}%</span>
              <span className="text-[10px] font-medium text-teal-100">adherence</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-white mb-1">{getMessage()}</p>
            <p className="text-sm text-teal-100 leading-relaxed">
              {dosesTaken} of {totalDoses} doses taken this week.
            </p>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
                style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.25)" }}>
                <Heart className="h-3 w-3 text-white" fill="white" />
                <span className="text-xs font-semibold text-white">{feelingLabel}</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
                style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.25)" }}>
                <TrendingUp className="h-3 w-3 text-white" />
                <span className="text-xs font-semibold text-white">{deltaText}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
