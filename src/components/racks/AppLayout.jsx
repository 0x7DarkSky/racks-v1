import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto pb-20">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}