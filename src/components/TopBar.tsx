import React from "react";
import { Search, Bell, HelpCircle } from "lucide-react";

interface TopBarProps {
  user: any;
}

export const TopBar: React.FC<TopBarProps> = ({ user }) => {
  return (
    <header className="flex justify-between items-center px-8 w-full h-16 bg-surface-container-lowest sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-outline">
            <Search size={16} />
          </span>
          <input
            className="pl-10 pr-4 py-2 bg-surface-container-low rounded-full border-none focus:ring-2 focus:ring-primary w-64 text-sm font-body outline-none"
            placeholder="Cari siswa atau kelas..."
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="text-outline hover:bg-surface-container-high transition-colors p-2 rounded-full">
          <Bell size={20} />
        </button>
        <button className="text-outline hover:bg-surface-container-high transition-colors p-2 rounded-full">
          <HelpCircle size={20} />
        </button>
        <div className="flex items-center gap-3 ml-2">
          <div className="text-right">
            <p className="text-sm font-bold text-primary leading-none">
              {user ? user.name : "Tammu"}
            </p>
          </div>
          <img
            alt="Profil"
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
            src={`https://ui-avatars.com/api/?name=${user ? encodeURIComponent(user.name) : "User"}&background=random`}
          />
        </div>
      </div>
    </header>
  );
};
