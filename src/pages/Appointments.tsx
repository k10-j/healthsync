import { useEffect, useState } from "react";
import { Plus, Calendar, Clock, MapPin, User, ChevronRight, Phone, Sparkles, Check, AlertCircle, CheckCircle, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Appointment {
  id: number;
  type: string;
  doctor: string;
  clinic: string;
  address: string;
  date: string;
  time: string;
  status: "confirmed" | "pending" | "completed" | "cancelled";
  phone: string;
}

export default function Appointments() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [appointmentsData, setAppointmentsData] = useState<Appointment[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!token) return;
      try {
        const response = await apiRequest<{
          appointments: Array<{
            id: number;
            title: string;
            providerName?: string | null;
            location?: string | null;
            appointmentAt: string;
          }>;
        }>("/appointments", { token });

        const mapped = response.appointments.map((appointment) => {
          const appointmentDate = new Date(appointment.appointmentAt);
          const [clinic = "Clinic", address = ""] = (appointment.location || "").split("·").map((value) => value.trim());
          return {
            id: appointment.id,
            type: appointment.title,
            doctor: appointment.providerName || "Provider",
            clinic,
            address,
            date: appointmentDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
            time: appointmentDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            status: appointmentDate >= new Date() ? "confirmed" : "completed",
            phone: "N/A",
          } as Appointment;
        });

        setAppointmentsData(mapped);
      } catch (error: any) {
        toast.error(error.message || "Failed to load appointments");
      }
    };

    fetchAppointments();
  }, [token]);

  const upcomingAppointments = appointmentsData.filter(a => a.status === "confirmed" || a.status === "pending");
  const pastAppointments = appointmentsData.filter(a => a.status === "completed" || a.status === "cancelled");

  const getStatusInfo = (status: Appointment["status"]) => {
    switch (status) {
      case "confirmed": return { variant: "success" as const, label: "Confirmed", icon: Check };
      case "pending": return { variant: "warning" as const, label: "Awaiting confirmation", icon: AlertCircle };
      case "completed": return { variant: "secondary" as const, label: "Completed", icon: CheckCircle };
      case "cancelled": return { variant: "destructive" as const, label: "Cancelled", icon: X };
    }
  };

  const appointments = activeTab === "upcoming" ? upcomingAppointments : pastAppointments;

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
            <Calendar className="h-5 w-5 text-teal-600" />
            <h1 className="text-xl font-bold" style={{
              background: "linear-gradient(135deg, hsl(185,85%,32%) 0%, hsl(190,95%,38%) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>My Visits</h1>
          </div>
          <Link to="/appointments/book">
            <Button size="sm" className="gap-1.5 rounded-xl text-white border-none" style={{
              background: "linear-gradient(135deg, hsl(185,85%,38%) 0%, hsl(190,95%,42%) 100%)",
              boxShadow: "0 4px 14px hsl(185 85% 38% / 0.35)",
            }}>
              <Plus className="h-4 w-4" />Book New
            </Button>
          </Link>
        </div>
        <div className="flex px-4 gap-1 pb-2">
          {(["upcoming", "past"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all"
              style={activeTab === tab ? {
                background: "hsl(185 85% 38% / 0.1)",
                border: "1px solid hsl(185 85% 38% / 0.3)",
                color: "hsl(185,85%,32%)",
              } : { color: "hsl(200,15%,50%)" }}>
              {tab === "upcoming" ? `Upcoming (${upcomingAppointments.length})` : `Past (${pastAppointments.length})`}
            </button>
          ))}
        </div>
      </header>

      <div className="px-4 py-6 space-y-4 animate-fade-in">
        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center mb-5">
              <Calendar className="h-10 w-10 text-accent" />
            </div>
            <h3 className="font-bold text-foreground text-lg mb-2">
              {activeTab === "upcoming" ? "No upcoming visits" : "No past visits yet"}
            </h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-xs">
              {activeTab === "upcoming" ? "Schedule a visit with a healthcare provider when you're ready" : "Your completed appointments will appear here"}
            </p>
            {activeTab === "upcoming" && (
              <Link to="/appointments/book">
                <Button className="rounded-xl gap-2"><Sparkles className="h-4 w-4" />Book Your First Visit</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt) => {
              const statusInfo = getStatusInfo(apt.status);
              return (
                <Link key={apt.id} to={`/appointments/${apt.id}`}
                  className="health-card block p-5 group hover:shadow-elevated transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-foreground text-lg">{apt.type}</h3>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 text-sm text-muted-foreground">
                        <User className="h-4 w-4 text-primary" />
                        <span className="font-medium">{apt.doctor}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-accent/10">
                        <Calendar className="h-4 w-4 text-accent" /><span className="font-semibold text-foreground">{apt.date}</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted">
                        <Clock className="h-4 w-4 text-muted-foreground" /><span className="font-medium text-foreground">{apt.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" /><span>{apt.clinic} · {apt.address}</span>
                    </div>
                  </div>
                  {apt.status === "confirmed" && (
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
                      <Button variant="outline" size="sm" className="flex-1 gap-2 rounded-xl"><Phone className="h-4 w-4" />Call Clinic</Button>
                      <Button variant="secondary" size="sm" className="flex-1 rounded-xl">Reschedule</Button>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
