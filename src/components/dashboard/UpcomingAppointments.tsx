import { Calendar, Clock, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Appointment {
  id: string;
  clinic: string;
  doctor: string;
  type: string;
  date: string;
  time: string;
  status: "confirmed" | "pending" | "rescheduled";
}

export function UpcomingAppointments() {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const getStatusInfo = (status: Appointment["status"]) => {
    switch (status) {
      case "confirmed": return { variant: "success" as const, label: "Confirmed" };
      case "pending": return { variant: "warning" as const, label: "Awaiting confirmation" };
      case "rescheduled": return { variant: "secondary" as const, label: "Rescheduled" };
    }
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!token) return;

      try {
        const { appointments: apiAppointments } = await apiRequest<{
          appointments: Array<{
            id: number;
            title: string;
            providerName?: string | null;
            location?: string | null;
            appointmentAt: string;
          }>;
        }>("/appointments", { token });

        const now = new Date();
        const startToday = new Date(now);
        startToday.setHours(0, 0, 0, 0);

        const mapped: Appointment[] = apiAppointments.map((apt) => {
          const d = new Date(apt.appointmentAt);
          const [clinic = "Clinic", address = ""] = (apt.location || "")
            .split("·")
            .map((s) => s.trim());

          const status: Appointment["status"] = d.getTime() >= startToday.getTime() ? "confirmed" : "rescheduled";

          return {
            id: String(apt.id),
            clinic,
            doctor: apt.providerName || "Provider",
            type: apt.title,
            date: d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
            time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            status,
          };
        });

        setAppointments(mapped);
      } catch (error: any) {
        toast.error(error.message || "Failed to load appointments");
      }
    };

    fetchAppointments();
  }, [token]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-accent" />
            Your Upcoming Visits
          </h2>
          <p className="text-sm text-muted-foreground">We'll remind you when it's time</p>
        </div>
        <Link to="/appointments" className="text-sm text-primary font-semibold hover:underline flex items-center gap-1">
          See all<ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {appointments.map((apt) => {
          const statusInfo = getStatusInfo(apt.status);
          return (
            <Link key={apt.id} to={`/appointments/${apt.id}`}
              className="health-card group flex items-center gap-4 p-4 hover:border-accent/40 hover:shadow-elevated transition-all duration-300">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10">
                <Calendar className="h-6 w-6 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-foreground">{apt.type}</h3>
                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">with {apt.doctor}</p>
                <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar className="h-3.5 w-3.5 text-primary" />{apt.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />{apt.time}
                  </span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
