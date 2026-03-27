import { useState } from "react";
import { ChevronLeft, MapPin, Calendar, Clock, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const clinics = [
  { id: "1", name: "City Health Center", address: "KN 5 Rd, Kigali" },
  { id: "2", name: "District Hospital", address: "KK 15 Ave, Kigali" },
  { id: "3", name: "Community Clinic", address: "KG 7 Ave, Kigali" },
];

const appointmentTypes = [
  "General Check-up",
  "Follow-up Visit",
  "Blood Test",
  "Vaccination",
  "Consultation",
  "Other",
];

const timeSlots = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
];

export default function BookAppointment() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [clinic, setClinic] = useState("");
  const [type, setType] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const toIsoDateTime = (dateValue: string, timeValue: string) => {
    const [timePart, period] = timeValue.split(" ");
    const [rawHour, minute] = timePart.split(":").map(Number);
    const hour = period === "PM" && rawHour < 12 ? rawHour + 12 : period === "AM" && rawHour === 12 ? 0 : rawHour;
    return new Date(`${dateValue}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`).toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clinic || !type || !date || !time) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!token) {
      toast.error("You need to sign in again.");
      return;
    }

    try {
      setLoading(true);
      const selectedClinic = clinics.find((c) => c.id === clinic);
      await apiRequest<{ appointment: { id: number } }>("/appointments", {
        method: "POST",
        token,
        body: {
          title: type,
          providerName: selectedClinic?.name || "Clinic",
          location: selectedClinic ? `${selectedClinic.name} · ${selectedClinic.address}` : undefined,
          appointmentAt: toIsoDateTime(date, time),
          notes: notes || undefined,
        },
      });

      toast.success("Appointment request submitted!", {
        description: "Your appointment has been added successfully.",
      });
      navigate("/appointments");
    } catch (error: any) {
      toast.error(error.message || "Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border safe-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link to="/appointments">
            <Button variant="ghost" size="icon-sm">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-foreground">Book Appointment</h1>
        </div>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6 animate-fade-in">
        {/* Clinic Selection */}
        <div className="space-y-2">
          <Label>Select Clinic *</Label>
          <Select value={clinic} onValueChange={setClinic}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a clinic" />
            </SelectTrigger>
            <SelectContent>
              {clinics.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.address}</p>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Appointment Type */}
        <div className="space-y-2">
          <Label>Appointment Type *</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="What's the visit for?" />
            </SelectTrigger>
            <SelectContent>
              {appointmentTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Selection */}
        <div className="space-y-2">
          <Label htmlFor="date">Preferred Date *</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pl-10"
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>

        {/* Time Selection */}
        <div className="space-y-2">
          <Label>Preferred Time *</Label>
          <div className="grid grid-cols-3 gap-2">
            {timeSlots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setTime(slot)}
                className={cn(
                  "p-2.5 rounded-lg text-sm font-medium transition-all duration-200 border",
                  time === slot
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-foreground hover:border-primary/30"
                )}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Any specific concerns or information for the clinic..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        {/* Info */}
        <div className="health-card p-4 bg-primary/5">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Your appointment request will be reviewed by clinic staff. You'll receive a confirmation once your appointment is confirmed.
          </p>
        </div>

        {/* Submit */}
        <div className="pt-4">
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Submitting..." : "Request Appointment"}
          </Button>
        </div>
      </form>
    </div>
  );
}
