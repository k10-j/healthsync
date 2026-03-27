import { Sparkles, Droplets, Leaf, Sun, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const tips = [
  {
    icon: Droplets,
    iconColor: "text-primary",
    title: "Stay hydrated",
    message: "A glass of water with your medication helps absorption and keeps you refreshed.",
    link: "/health-library",
  },
  {
    icon: Leaf,
    iconColor: "text-success",
    title: "You're building healthy habits",
    message: "Each dose you take is a step toward better health. We're proud of you!",
    link: "/health-library",
  },
  {
    icon: Sun,
    iconColor: "text-warning",
    title: "Sunshine tip",
    message: "Taking meds at the same time daily creates a rhythm your body loves.",
    link: "/health-library",
  },
  {
    icon: Heart,
    iconColor: "text-accent",
    title: "Self-care reminder",
    message: "Remember: caring for your health is an act of self-love. You're doing great!",
    link: "/health-library",
  },
];

export function EncouragementBanner() {
  const tip = tips[Math.floor(Math.random() * tips.length)];
  const TipIcon = tip.icon;

  return (
    <div className="health-card-warm p-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <TipIcon className={`h-6 w-6 ${tip.iconColor}`} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-foreground">{tip.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              {tip.message}
            </p>
            <Link 
              to={tip.link}
              className="inline-flex items-center gap-1 text-sm text-primary font-semibold mt-2 hover:underline"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Explore wellness tips
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
