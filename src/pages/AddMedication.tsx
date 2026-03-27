import { useState } from "react";
import { ChevronLeft, Plus, Minus, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const frequencies = [
  { value: "once", label: "Once daily" },
  { value: "twice", label: "Twice daily" },
  { value: "three", label: "Three times daily" },
  { value: "four", label: "Four times daily" },
  { value: "asneeded", label: "As needed" },
];

const defaultTimes = {
  once: ["8:00 AM"],
  twice: ["8:00 AM", "8:00 PM"],
  three: ["8:00 AM", "2:00 PM", "8:00 PM"],
  four: ["8:00 AM", "12:00 PM", "6:00 PM", "10:00 PM"],
  asneeded: [],
};

export default function AddMedication() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [times, setTimes] = useState<string[]>([]);
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFrequencyChange = (value: string) => {
    setFrequency(value);
    setTimes(defaultTimes[value as keyof typeof defaultTimes] || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !dosage || !frequency) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!token) {
      toast.error("You need to sign in again.");
      return;
    }

    try {
      setLoading(true);
      const frequencyLabel = frequencies.find((f) => f.value === frequency)?.label || frequency;

      await apiRequest<{ medication: { id: number } }>("/medications", {
        method: "POST",
        token,
        body: {
          name,
          dosage,
          frequency: frequencyLabel,
          instructions: instructions || undefined,
        },
      });

      toast.success("Medication added successfully!");
      navigate("/medications");
    } catch (error: any) {
      toast.error(error.message || "Failed to add medication");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border safe-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link to="/medications">
            <Button variant="ghost" size="icon-sm">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-foreground">Add Medication</h1>
        </div>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6 animate-fade-in">
        {/* Medication Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Medication Name *</Label>
          <Input
            id="name"
            placeholder="e.g., Metformin"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Dosage */}
        <div className="space-y-2">
          <Label htmlFor="dosage">Dosage *</Label>
          <Input
            id="dosage"
            placeholder="e.g., 500mg"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
          />
        </div>

        {/* Frequency */}
        <div className="space-y-2">
          <Label>Frequency *</Label>
          <Select value={frequency} onValueChange={handleFrequencyChange}>
            <SelectTrigger>
              <SelectValue placeholder="How often?" />
            </SelectTrigger>
            <SelectContent>
              {frequencies.map((freq) => (
                <SelectItem key={freq.value} value={freq.value}>
                  {freq.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Times */}
        {times.length > 0 && (
          <div className="space-y-3">
            <Label>Reminder Times</Label>
            <div className="space-y-2">
              {times.map((time, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1 health-card p-3 flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={time.replace(" AM", "").replace(" PM", "")}
                      onChange={(e) => {
                        const newTimes = [...times];
                        newTimes[index] = e.target.value;
                        setTimes(newTimes);
                      }}
                      className="border-0 p-0 h-auto text-foreground"
                    />
                  </div>
                  {times.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setTimes(times.filter((_, i) => i !== index))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full gap-1.5"
              onClick={() => setTimes([...times, "12:00"])}
            >
              <Plus className="h-4 w-4" />
              Add Time
            </Button>
          </div>
        )}

        {/* Instructions */}
        <div className="space-y-2">
          <Label htmlFor="instructions">Special Instructions (Optional)</Label>
          <Input
            id="instructions"
            placeholder="e.g., Take with food"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
        </div>

        {/* Submit */}
        <div className="pt-4">
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Saving..." : "Add Medication"}
          </Button>
        </div>
      </form>
    </div>
  );
}
