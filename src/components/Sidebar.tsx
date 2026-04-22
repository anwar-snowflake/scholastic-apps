import React from "react";
import { 
  LayoutDashboard, 
  CalendarCheck, 
  BarChart3, 
  Users, 
  Settings, 
  HelpCircle,
  GraduationCap
} from "lucide-react";
import { cn } from "../lib/utils";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "attendance", label: "Kehadiran", icon: CalendarCheck },
    { id: "reports", label: "Laporan", icon: BarChart3 },
    { id: "students", label: "Siswa", icon: Users },
  ];

  const bottomItems = [
    { id: "settings", label: "Pengaturan", icon: Settings },
    { id: "help", label: "Dukungan", icon: HelpCircle },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-low flex flex-col py-6 transition-all duration-300 ease-in-out z-50">
      <div className="px-6 mb-10 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center text-on-primary">
          <GraduationCap size={24} />
        </div>
        <div>
          <h2 className="font-headline text-lg font-black text-primary leading-none">The Scholastic</h2>
          <p className="text-[10px] uppercase tracking-widest text-outline font-bold mt-1">Kurator Akademik</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 font-headline font-semibold text-sm transition-all duration-300 ease-in-out rounded-lg",
              activeTab === item.id 
                ? "text-primary border-r-4 border-primary bg-surface-container-lowest" 
                : "text-outline hover:text-primary hover:bg-surface-container-high"
            )}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="px-4 mt-auto space-y-2">
        {bottomItems.map((item) => (
          <button
            key={item.id}
            className="w-full flex items-center gap-3 px-4 py-3 font-headline font-semibold text-sm text-outline hover:text-primary transition-all duration-300"
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </div>
    </aside>
  );
};
