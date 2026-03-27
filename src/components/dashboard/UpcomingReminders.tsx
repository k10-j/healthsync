import { useEffect, useMemo, useState } from "react";
import { Clock, Pill, Check, SkipForward, Sparkles, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Reminder {
  id: string;
  medication: string;
  dosage: string;
  time: string;
  status: "pending" | "taken" | "missed" | "skipped";
}

export function UpcomingReminders() {
  const { token } = useAuth();
  const [celebrateId, setCelebrateId] = useState<string | null>(null);

  const [reminders, setReminders] = useState<Reminder[]>([]);

  const getReminderTimeFromFrequency = (frequency?: string | null) => {
    const f = (frequency || "").toLowerCase();
    if (!f) return "Scheduled";
    if (f.includes("twice")) return "Morning & evening";
    if (f.includes("three")) return "Morning, midday, evening";
    if (f.includes("four")) return "Multi-day times";
    if (f.includes("once")) return "Morning";
    return "Scheduled";
  };

  const isToday = (d: Date) => d.toDateString() === new Date().toDateString();

  const fetchReminders = async () => {
    if (!token) return;

    const [medicationsRes, doseLogsRes] = await Promise.all([
      apiRequest<{ medications: Array<{ id: number; name: string; dosage?: string | null; frequency?: string | null }> }>(
        "/medications",
        { token }
      ),
      apiRequest<{
        doseLogs: Array<{
          id: number;
          medicationId: number;
          status: "TAKEN" | "SKIPPED" | "MISSED";
          takenAt?: string | null;
          scheduledFor?: string | null;
        }>;
      }>("/dose-logs", { token }),
    ]);

    const doseLogs = doseLogsRes.doseLogs;
    const todayReminders = medicationsRes.medications.map((med) => {
      const logsForMed = doseLogs.filter((log) => {
        if (log.medicationId !== med.id) return false;
        const iso = log.takenAt || log.scheduledFor;
        if (!iso) return false;
        const d = new Date(iso);
        return !Number.isNaN(d.getTime()) && isToday(d);
      });

      let status: Reminder["status"] = "pending";
      if (logsForMed.some((l) => l.status === "MISSED")) status = "missed";
      else if (logsForMed.some((l) => l.status === "SKIPPED")) status = "skipped";
      else if (logsForMed.some((l) => l.status === "TAKEN")) status = "taken";

      return {
        id: String(med.id),
        medication: med.name,
        dosage: med.dosage || "—",
        time: getReminderTimeFromFrequency(med.frequency),
        status,
      };
    });

    setReminders(todayReminders);
  };

  useEffect(() => {
    fetchReminders().catch(() => {});
  }, [token]);

  const takenCount = useMemo(() => reminders.filter((r) => r.status === "taken").length, [reminders]);
  const totalCount = reminders.length;

  const handleTake = async (id: string) => {
    if (!token) return;
    try {
      setCelebrateId(id);
      await apiRequest<{ doseLog: { id: number } }>("/dose-logs", {
        method: "POST",
        token,
        body: {
          medicationId: Number(id),
          status: "TAKEN",
          takenAt: new Date().toISOString(),
        },
      });
      await fetchReminders();
      setTimeout(() => setCelebrateId(null), 2000);
    } catch (error: any) {
      setCelebrateId(null);
      toast.error(error.message || "Failed to record dose");
    }
  };

  const handleSkip = async (id: string) => {
    if (!token) return;
    try {
      await apiRequest<{ doseLog: { id: number } }>("/dose-logs", {
        method: "POST",
        token,
        body: {
          medicationId: Number(id),
          status: "SKIPPED",
          scheduledFor: new Date().toISOString(),
        },
      });
      await fetchReminders();
    } catch (error: any) {
      toast.error(error.message || "Failed to skip dose");
    }
  };

  const getStatusBadge = (status: Reminder["status"]) => {
    switch (status) {
      case "taken":
        return <Badge variant="taken" className="gap-1"><Check className="h-3 w-3" />Done</Badge>;
      case "missed":
        return <Badge variant="missed">Missed</Badge>;
      case "skipped":
        return <Badge variant="skipped">Skipped</Badge>;
      default:
        return <Badge variant="pending" className="gap-1"><Clock className="h-3 w-3" />Coming up</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Today's Care
          </h2>
          <p className="text-sm text-muted-foreground">
            {totalCount === 0
              ? "No care items yet"
              : takenCount === totalCount
                ? "All done! You're amazing!"
                : `${takenCount} of ${totalCount} complete — you've got this!`}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {reminders.map((reminder) => (
          <div
            key={reminder.id}
            className={cn(
              "health-card flex items-center gap-4 p-4 transition-all duration-300",
              reminder.status === "pending" && "border-primary/40 bg-gradient-to-r from-primary/5 to-transparent",
              reminder.status === "taken" && "health-card-celebration",
              celebrateId === reminder.id && "animate-celebrate"
            )}
          >
            <div className={cn(
              "flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300",
              reminder.status === "pending" ? "bg-primary/15" : reminder.status === "taken" ? "bg-success/15" : "bg-muted"
            )}>
              {reminder.status === "taken" ? (
                <Sparkles className="h-6 w-6 text-success animate-pulse-soft" />
              ) : (
                <Pill className={cn("h-6 w-6", reminder.status === "pending" ? "text-primary" : "text-muted-foreground")} />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-foreground">{reminder.medication}</h3>
                {getStatusBadge(reminder.status)}
              </div>
              <div className="flex items-center gap-2 mt-1.5 text-sm text-muted-foreground">
                <span className="font-medium">{reminder.dosage}</span>
                <span className="text-border">·</span>
                <Clock className="h-3.5 w-3.5" />
                <span>{reminder.time}</span>
              </div>
            </div>

            {reminder.status === "pending" && (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="success" className="rounded-xl gap-1.5 shadow-sm" onClick={() => handleTake(reminder.id)}>
                  <Check className="h-4 w-4" />
                  Take
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="rounded-xl text-muted-foreground hover:text-warning"
                  onClick={() => handleSkip(reminder.id)}
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>
            )}

            {reminder.status === "taken" && celebrateId === reminder.id && (
              <span className="text-success text-sm font-semibold animate-bounce-gentle">
                Great job!
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
