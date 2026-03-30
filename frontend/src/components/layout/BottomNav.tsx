import { Home, Pill, Calendar, BookOpen, Heart } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/medications", icon: Pill, label: "Meds" },
  { to: "/appointments", icon: Calendar, label: "Visits" },
  { to: "/health-library", icon: BookOpen, label: "Learn" },
  { to: "/symptom-checker", icon: Heart, label: "Check" },
];

export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 w-full left-0 right-0"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.5rem)", WebkitTapHighlightColor: "transparent" }}
    >
      <div
        className="mx-auto mb-3 max-w-5xl rounded-2xl px-2 py-2 flex items-center justify-around"
        style={{
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid hsl(185 40% 80% / 0.5)",
          boxShadow: "0 8px 32px hsl(185 85% 38% / 0.12), 0 2px 8px hsl(200 25% 12% / 0.06)",
        }}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-300 min-w-[56px] relative",
                isActive ? "text-teal-600" : "text-slate-400 hover:text-slate-600"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: "linear-gradient(135deg, hsl(185,85%,38%,0.12) 0%, hsl(190,95%,42%,0.08) 100%)",
                      border: "1px solid hsl(185 85% 38% / 0.25)",
                    }}
                  />
                )}
                <div className={cn("relative z-10 transition-all duration-300", isActive && "scale-110")}>
                  <item.icon
                    className="h-5 w-5"
                    strokeWidth={isActive ? 2.5 : 1.8}
                    fill={isActive && item.icon === Heart ? "currentColor" : "none"}
                  />
                </div>
                <span className={cn("text-[10px] font-semibold relative z-10", isActive && "font-bold")}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
