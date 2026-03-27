import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import ThreeBackground from "@/components/ThreeBackground";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <ThreeBackground />
      <main className="flex-1 pb-20 relative z-10">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
