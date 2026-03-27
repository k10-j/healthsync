import { useEffect, useState } from "react";
import { Plus, Pill, Clock, MoreVertical, Check, X, SkipForward, Heart, Sparkles, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Medication {
  id: number;
  name: string;
  dosage?: string | null;
  frequency?: string | null;
  times: string[];
  color: string;
}

interface DoseLog {
  id: number;
  medicationId: number;
  time: string;
  status: "taken" | "missed" | "skipped" | "pending";
}

export default function Medications() {
  const [activeTab, setActiveTab] = useState<"today" | "schedule">("today");
  const [celebrateId, setCelebrateId] = useState<number | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [doseLogs, setDoseLogs] = useState<DoseLog[]>([]);
  const { token } = useAuth();

  const fetchData = async () => {
    if (!token) return;
    try {
      const [medicationsResponse, doseLogsResponse] = await Promise.all([
        apiRequest<{ medications: Array<{ id: number; name: string; dosage?: string | null; frequency?: string | null }> }>("/medications", { token }),
        apiRequest<{ doseLogs: Array<{ id: number; medicationId: number; status: "TAKEN" | "MISSED" | "SKIPPED"; takenAt?: string | null; scheduledFor?: string | null }> }>("/dose-logs", { token }),
      ]);

      const medItems: Medication[] = medicationsResponse.medications.map((med) => ({
        id: med.id,
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        times: [],
        color: "primary",
      }));

      const today = new Date();
      const isToday = (value?: string | null) => {
        if (!value) return false;
        const parsed = new Date(value);
        return parsed.toDateString() === today.toDateString();
      };

      const todayLogs: DoseLog[] = doseLogsResponse.doseLogs
        .filter((log) => isToday(log.takenAt) || isToday(log.scheduledFor))
        .map((log) => ({
          id: log.id,
          medicationId: log.medicationId,
          time: log.takenAt ? new Date(log.takenAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Scheduled",
          status: log.status.toLowerCase() as DoseLog["status"],
        }));

      const loggedMedicationIds = new Set(todayLogs.map((log) => log.medicationId));
      const pendingFromMeds: DoseLog[] = medItems
        .filter((med) => !loggedMedicationIds.has(med.id))
        .map((med) => ({
          id: -med.id,
          medicationId: med.id,
          time: "Pending",
          status: "pending",
        }));

      setMedications(medItems);
      setDoseLogs([...todayLogs, ...pendingFromMeds]);
    } catch (error: any) {
      toast.error(error.message || "Failed to load medications");
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const getMedication = (id: number) => medications.find((m) => m.id === id);
  const todaysDoses = doseLogs;
  const takenCount = todaysDoses.filter((d) => d.status === "taken").length;
  const totalCount = todaysDoses.length;

  const handleTake = async (dose: DoseLog) => {
    if (!token) return;
    try {
      await apiRequest<{ doseLog: { id: number } }>("/dose-logs", {
        method: "POST",
        token,
        body: {
          medicationId: dose.medicationId,
          status: "TAKEN",
          takenAt: new Date().toISOString(),
        },
      });
      setCelebrateId(dose.id);
      setTimeout(() => setCelebrateId(null), 2000);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to record dose");
    }
  };

  const getStatusIcon = (status: DoseLog["status"]) => {
    switch (status) {
      case "taken": return <Sparkles className="h-4 w-4" />;
      case "missed": return <X className="h-4 w-4" />;
      case "skipped": return <SkipForward className="h-4 w-4" />;
      default: return null;
    }
  };

  const getEncouragementMessage = () => {
    if (takenCount === totalCount) return "You've completed all doses today!";
    if (takenCount === 0) return "Ready to start your day with self-care?";
    if (takenCount > totalCount / 2) return "You're doing great! Keep going!";
    return "One step at a time — you've got this!";
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #f0fdfa 0%, #f8fffe 50%, #e0f2fe 100%)" }}>
      <header className="sticky top-0 z-40 safe-top" style={{
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid hsl(185 40% 80% / 0.5)",
        boxShadow: "0 2px 16px hsl(185 85% 38% / 0.08)",
      }}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-teal-600" />
            <h1 className="text-xl font-bold" style={{
              background: "linear-gradient(135deg, hsl(185,85%,32%) 0%, hsl(190,95%,38%) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>My Medications</h1>
          </div>
          <Link to="/medications/add">
            <Button size="sm" className="gap-1.5 rounded-xl text-white border-none" style={{
              background: "linear-gradient(135deg, hsl(185,85%,38%) 0%, hsl(190,95%,42%) 100%)",
              boxShadow: "0 4px 14px hsl(185 85% 38% / 0.35)",
            }}>
              <Plus className="h-4 w-4" />Add New
            </Button>
          </Link>
        </div>
        <div className="flex px-4 gap-1 pb-2">
          {(["today", "schedule"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all"
              style={activeTab === tab ? {
                background: "hsl(185 85% 38% / 0.1)",
                border: "1px solid hsl(185 85% 38% / 0.3)",
                color: "hsl(185,85%,32%)",
              } : { color: "hsl(200,15%,50%)" }}>
              {tab === "today" ? "Today's Care" : "All Medications"}
            </button>
          ))}
        </div>
      </header>

      <div className="px-4 py-6 space-y-4 animate-fade-in">
        {activeTab === "today" ? (
          <>
            <div className="health-card-warm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{getEncouragementMessage()}</p>
                  <p className="text-lg font-bold text-foreground mt-0.5">{takenCount} of {totalCount} doses complete</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
                  {takenCount === totalCount ? <Star className="h-6 w-6 text-primary" /> : <Pill className="h-6 w-6 text-primary" />}
                </div>
              </div>
              <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-success rounded-full transition-all duration-700"
                  style={{ width: `${totalCount === 0 ? 0 : (takenCount / totalCount) * 100}%` }} />
              </div>
            </div>

            <div className="space-y-3">
            {todaysDoses.map((dose) => {
                const med = getMedication(dose.medicationId);
                if (!med) return null;
                return (
                  <div key={dose.id} className={cn(
                    "health-card flex items-center gap-4 p-4 transition-all duration-300",
                    dose.status === "pending" && "border-primary/40 bg-gradient-to-r from-primary/5 to-transparent",
                    dose.status === "taken" && "health-card-celebration",
                    celebrateId === dose.id && "animate-celebrate"
                  )}>
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center",
                      dose.status === "taken" ? "bg-success/15" : `bg-${med.color}/15`
                    )}>
                      {dose.status === "taken" ? (
                        <Sparkles className="h-6 w-6 text-success animate-pulse-soft" />
                      ) : (
                        <Pill className={cn("h-6 w-6", `text-${med.color}`)} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-foreground">{med.name}</h3>
                        <Badge variant={dose.status as any}>
                          {dose.status === "taken" ? "Done" : dose.status === "pending" ? "Coming up" : dose.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 text-sm text-muted-foreground">
                        <span className="font-medium">{med.dosage}</span>
                        <span className="text-border">·</span>
                        <Clock className="h-3.5 w-3.5" />
                        <span>{dose.time}</span>
                      </div>
                    </div>
                    {dose.status === "pending" ? (
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="success" className="rounded-xl gap-1.5" onClick={() => handleTake(dose)}>
                          <Check className="h-4 w-4" />Take
                        </Button>
                        <Button size="icon-sm" variant="ghost" className="rounded-xl text-muted-foreground">
                          <SkipForward className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center",
                        dose.status === "taken" && "bg-success/15 text-success",
                        dose.status === "missed" && "bg-destructive/15 text-destructive",
                        dose.status === "skipped" && "bg-warning/15 text-warning"
                      )}>{getStatusIcon(dose.status)}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="space-y-3">
            {medications.map((med) => (
              <Link key={med.id} to={`/medications/${med.id}`} className={cn(
                "health-card flex items-center gap-4 p-4 group hover:shadow-elevated transition-all duration-300",
              )}>
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", `bg-${med.color}/15`)}>
                  <Pill className={cn("h-6 w-6", `text-${med.color}`)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-foreground">{med.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{med.dosage || "No dosage"} · {med.frequency || "No frequency"}</p>
                </div>
                <Button variant="ghost" size="icon-sm" className="text-muted-foreground rounded-xl">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
