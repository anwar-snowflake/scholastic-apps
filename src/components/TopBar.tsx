import React, { useState } from "react";
import { Search, Bell, HelpCircle, Menu } from "lucide-react";

interface TopBarProps {
  user: any;
  onSearch?: (query: string) => void;
  onMenuToggle?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ user, onSearch, onMenuToggle }) => {
  const [localQuery, setLocalQuery] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalQuery(val);
    onSearch?.(val);
  };

  return (
    <header className="flex justify-between items-center px-4 sm:px-8 w-full h-16 bg-surface-container-lowest sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {onMenuToggle && (
          <button 
            onClick={onMenuToggle}
            className="block lg:hidden text-outline hover:bg-surface-container-high p-2 rounded-full transition-colors"
          >
            <Menu size={20} />
          </button>
        )}
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-outline">
            <Search size={16} />
          </span>
          <input
            className="pl-10 pr-4 py-2 bg-surface-container-low rounded-full border-none focus:ring-2 focus:ring-primary w-40 sm:w-64 text-sm font-body outline-none"
            placeholder="Cari siswa atau kelas..."
            type="text"
            value={localQuery}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-6">
        <button className="text-outline hover:bg-surface-container-high transition-colors p-2 rounded-full">
          <Bell size={20} />
        </button>
        <button className="text-outline hover:bg-surface-container-high transition-colors p-2 rounded-full hidden sm:block">
          <HelpCircle size={20} />
        </button>
        <div className="flex items-center gap-3 ml-1 sm:ml-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-primary leading-none">
              {user ? user.name : "Pengajar"}
            </p>
            {user?.subject && (
              <p className="text-[10px] text-outline font-medium mt-1 leading-none uppercase tracking-wider">
                {user.subject}
              </p>
            )}
          </div>
          <img
            alt="Profil"
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
            src={(user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=random`) || undefined}
          />
        </div>
      </div>
    </header>
  );
};
