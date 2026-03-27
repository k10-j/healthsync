import { ChevronLeft, User, Bell, Globe, Shield, LogOut, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { profileDisplayName } from "@/lib/userDisplay";

const settingsSections = [
  {
    title: "Account",
    items: [
      { icon: User, label: "Personal Information", description: "Name, phone, email", to: "/profile/edit", action: "link" as const },
      { icon: Globe, label: "Language", description: "English", to: "/profile/language", action: "link" as const },
    ],
  },
  {
    title: "Notifications",
    items: [
      { icon: Bell, label: "Push Notifications", description: "Medication reminders", action: "toggle" as const, value: true },
      { icon: Bell, label: "SMS Reminders", description: "Text message alerts", action: "toggle" as const, value: false },
    ],
  },
  {
    title: "Privacy & Security",
    items: [
      { icon: Shield, label: "Privacy Settings", description: "Data and consent", to: "/profile/privacy", action: "link" as const },
    ],
  },
];

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border safe-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link to="/"><Button variant="ghost" size="icon-sm"><ChevronLeft className="h-5 w-5" /></Button></Link>
          <h1 className="text-xl font-bold text-foreground">Profile</h1>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6 animate-fade-in">
        <div className="health-card-elevated p-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-foreground">
              {profileDisplayName(user)}
            </h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Patient</p>
          </div>
          <Link to="/profile/edit">
            <Button variant="outline" size="sm">Edit</Button>
          </Link>
        </div>

        {settingsSections.map((section) => (
          <div key={section.title}>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-1">{section.title}</h3>
            <div className="health-card overflow-hidden divide-y divide-border">
              {section.items.map((item, i) => (
                <div key={i}>
                  {item.action === "link" ? (
                    <Link to={item.to || "#"} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                        <item.icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{item.label}</h4>
                        {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </Link>
                  ) : (
                    <div className="flex items-center gap-4 p-4">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                        <item.icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{item.label}</h4>
                        {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                      </div>
                      <Switch defaultChecked={item.value} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <Button variant="destructive" className="w-full gap-2" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />Log Out
        </Button>

        <div className="text-center text-xs text-muted-foreground pt-4">
          <p>HealthSync v1.0.0</p>
        </div>
      </div>
    </div>
  );
}
