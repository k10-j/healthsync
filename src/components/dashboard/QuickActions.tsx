import { Pill, Calendar, BookOpen, Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";

const actions = [
  {
    to: "/medications/add",
    icon: Pill,
    label: "Add Medication",
    description: "Set up a new reminder",
    iconBg: "hsl(185,85%,38%)",
    cardBg: "hsl(185 85% 38% / 0.06)",
    border: "hsl(185 85% 38% / 0.2)",
    hoverBorder: "hsl(185 85% 38% / 0.45)",
    hoverShadow: "0 8px 28px hsl(185 85% 38% / 0.18)",
  },
  {
    to: "/appointments/book",
    icon: Calendar,
    label: "Book a Visit",
    description: "Schedule with care",
    iconBg: "hsl(190,95%,38%)",
    cardBg: "hsl(190 95% 42% / 0.06)",
    border: "hsl(190 95% 42% / 0.2)",
    hoverBorder: "hsl(190 95% 42% / 0.45)",
    hoverShadow: "0 8px 28px hsl(190 95% 42% / 0.18)",
  },
  {
    to: "/symptom-checker",
    icon: Stethoscope,
    label: "How do I feel?",
    description: "Get gentle guidance",
    iconBg: "hsl(38,95%,50%)",
    cardBg: "hsl(38 95% 50% / 0.06)",
    border: "hsl(38 95% 50% / 0.2)",
    hoverBorder: "hsl(38 95% 50% / 0.45)",
    hoverShadow: "0 8px 28px hsl(38 95% 50% / 0.18)",
  },
  {
    to: "/health-library",
    icon: BookOpen,
    label: "Learn & Grow",
    description: "Trusted wellness info",
    iconBg: "hsl(160,70%,38%)",
    cardBg: "hsl(160 70% 38% / 0.06)",
    border: "hsl(160 70% 38% / 0.2)",
    hoverBorder: "hsl(160 70% 38% / 0.45)",
    hoverShadow: "0 8px 28px hsl(160 70% 38% / 0.18)",
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action) => (
        <Link
          key={action.to}
          to={action.to}
          className="group flex flex-col items-center justify-center p-5 rounded-3xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
          style={{
            background: `rgba(255,255,255,0.85)`,
            backdropFilter: "blur(12px)",
            border: `1px solid ${action.border}`,
            boxShadow: "0 2px 12px hsl(200 25% 12% / 0.06)",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.borderColor = action.hoverBorder;
            el.style.boxShadow = action.hoverShadow;
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.borderColor = action.border;
            el.style.boxShadow = "0 2px 12px hsl(200 25% 12% / 0.06)";
          }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110"
            style={{
              background: action.iconBg,
              boxShadow: `0 6px 16px ${action.iconBg}55`,
            }}
          >
            <action.icon className="h-6 w-6 text-white" />
          </div>
          <span className="text-sm font-bold text-slate-800 text-center">{action.label}</span>
          <span className="text-xs text-slate-500 text-center mt-0.5">{action.description}</span>
        </Link>
      ))}
    </div>
  );
}
