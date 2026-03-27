import { useEffect, useState } from "react";
import { Bell, Settings, Heart, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HeroHealthCard } from "@/components/dashboard/HeroHealthCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { UpcomingReminders } from "@/components/dashboard/UpcomingReminders";
import { UpcomingAppointments } from "@/components/dashboard/UpcomingAppointments";
import { EncouragementBanner } from "@/components/dashboard/EncouragementBanner";
import { useAuth } from "@/contexts/AuthContext";
import { greetingDisplayName } from "@/lib/userDisplay";
import { apiRequest } from "@/lib/api";

export default function Dashboard() {
  const { user, token } = useAuth();
  const userName = greetingDisplayName(user);

  const [healthStats, setHealthStats] = useState({
    adherencePercent: 0,
    dosesTaken: 0,
    totalDoses: 0,
    streak: 0,
    feelingLabel: "Feeling good",
    adherenceDeltaPercent: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      if (!token) return;

      // Backend data: use dose logs to compute adherence + streak.
      const { doseLogs } = await apiRequest<{
        doseLogs: Array<{
          id: number;
          status: "TAKEN" | "SKIPPED" | "MISSED";
          takenAt?: string | null;
          scheduledFor?: string | null;
        }>;
      }>("/dose-logs", { token });

      const dateKeyLocal = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

      const effectiveDate = (log: (typeof doseLogs)[number]) => {
        const iso = log.takenAt || log.scheduledFor;
        if (!iso) return null;
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return null;
        return d;
      };

      const now = new Date();
      const endOfToday = new Date(now);
      endOfToday.setHours(23, 59, 59, 999);
      const startLast7 = new Date(now);
      startLast7.setHours(0, 0, 0, 0);
      startLast7.setDate(startLast7.getDate() - 6);

      const startPrior7 = new Date(startLast7);
      startPrior7.setDate(startPrior7.getDate() - 7);
      const endPrior7 = new Date(startLast7);
      endPrior7.setMilliseconds(-1);

      const logsInRange = (start: Date, end: Date) =>
        doseLogs.filter((log) => {
          const d = effectiveDate(log);
          if (!d) return false;
          return d.getTime() >= start.getTime() && d.getTime() <= end.getTime();
        });

      const last7Logs = logsInRange(startLast7, endOfToday);
      const prior7Logs = logsInRange(startPrior7, endPrior7);

      const last7Taken = last7Logs.filter((l) => l.status === "TAKEN").length;
      const prior7Taken = prior7Logs.filter((l) => l.status === "TAKEN").length;

      const last7Total = last7Logs.length;
      const prior7Total = prior7Logs.length;

      const adherencePercent =
        last7Total > 0 ? Math.round((last7Taken / last7Total) * 100) : 0;
      const priorAdherencePercent =
        prior7Total > 0 ? Math.round((prior7Taken / prior7Total) * 100) : 0;

      // Streak: consecutive days (back from today) with at least one TAKEN dose.
      const takenDays = new Set(
        doseLogs
          .filter((l) => l.status === "TAKEN")
          .map((l) => {
            const d = effectiveDate(l) || null;
            return d ? dateKeyLocal(d) : null;
          })
          .filter((k): k is string => Boolean(k))
      );

      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      let streak = 0;
      for (let i = 0; i < 365; i++) {
        const key = dateKeyLocal(today);
        if (!takenDays.has(key)) break;
        streak += 1;
        today.setDate(today.getDate() - 1);
      }

      const feelingLabel =
        adherencePercent >= 90 ? "Feeling amazing" : adherencePercent >= 75 ? "Feeling good" : adherencePercent >= 50 ? "Keep it up" : "Let's begin";

      setHealthStats({
        adherencePercent,
        dosesTaken: last7Taken,
        totalDoses: last7Total,
        streak,
        feelingLabel,
        adherenceDeltaPercent: adherencePercent - priorAdherencePercent,
      });
    };

    // Keep UI unchanged while loading; stats just stay at defaults until fetched.
    loadStats().catch(() => {
      setHealthStats((s) => ({ ...s }));
    });
  }, [token]);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #f0fdfa 0%, #f8fffe 50%, #e0f2fe 100%)" }}>
      {/* Header */}
      <header className="sticky top-0 z-40 safe-top" style={{
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid hsl(185 40% 80% / 0.5)",
        boxShadow: "0 2px 16px hsl(185 85% 38% / 0.08)",
      }}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{
              background: "linear-gradient(135deg, hsl(185,85%,38%) 0%, hsl(190,95%,42%) 100%)",
              boxShadow: "0 4px 12px hsl(185 85% 38% / 0.3)",
            }}>
              <Heart className="h-5 w-5 text-white" fill="white" />
            </div>
            <span className="text-lg font-bold" style={{
              background: "linear-gradient(135deg, hsl(185,85%,32%) 0%, hsl(190,95%,38%) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>HealthSync</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="relative rounded-xl">
              <Bell className="h-5 w-5 text-slate-500" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse-soft" style={{ background: "hsl(185,85%,38%)" }} />
            </Button>
            <Link to="/profile">
              <Button variant="ghost" size="icon" className="rounded-xl">
                <Settings className="h-5 w-5 text-slate-500" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 py-6 space-y-6 animate-fade-in">
        {/* Hero Health Summary */}
        <section className="animate-slide-up" style={{ animationDelay: "0s" }}>
          <HeroHealthCard 
            userName={userName}
            adherencePercent={healthStats.adherencePercent}
            dosesTaken={healthStats.dosesTaken}
            totalDoses={healthStats.totalDoses}
            streak={healthStats.streak}
            feelingLabel={healthStats.feelingLabel}
            adherenceDeltaPercent={healthStats.adherenceDeltaPercent}
          />
        </section>

        {/* Quick Actions */}
        <section className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-bold text-foreground">What would you like to do?</h2>
          </div>
          <QuickActions />
        </section>

        {/* Today's Medications */}
        <section className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <UpcomingReminders />
        </section>

        {/* Upcoming Appointments */}
        <section className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <UpcomingAppointments />
        </section>

        {/* Encouragement Banner */}
        <section className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <EncouragementBanner />
        </section>
      </div>
    </div>
  );
}
