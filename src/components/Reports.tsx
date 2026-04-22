import React from "react";
import { 
  Download, 
  Calendar, 
  ChevronDown,
  Users
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

export const Reports: React.FC = () => {
  return (
    <div className="p-10 max-w-7xl mx-auto">
      <div className="mb-12 flex justify-between items-end">
        <div>
          <h2 className="font-headline text-5xl font-extrabold text-on-surface tracking-tight mb-2">Ringkasan Bulanan.</h2>
          <p className="text-on-surface-variant font-medium">Menganalisis pola kehadiran untuk <span className="text-primary font-bold">Kelas 11 - Sastra A</span></p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="glass-panel p-1 rounded-2xl flex gap-1 shadow-sm">
            <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest rounded-xl text-sm font-semibold text-on-surface hover:bg-primary-fixed transition-colors">
              Oktober 2023
              <Calendar size={14} />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest rounded-xl text-sm font-semibold text-on-surface hover:bg-primary-fixed transition-colors">
              Lit-A (Sesi 4)
              <ChevronDown size={14} />
            </button>
          </div>
          <button className="bg-primary text-on-primary px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-95 transition-transform">
            <Download size={18} />
            Ekspor Laporan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 mb-12">
        <div className="col-span-8 bg-surface-container-low rounded-3xl p-8 relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-1">Kesehatan Kelas</p>
              <h3 className="text-4xl font-headline font-extrabold text-secondary">98.2%</h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black bg-secondary-container text-on-secondary-container px-2 py-1 rounded-full">+2.4% vs bulan lalu</span>
            </div>
          </div>
          <div className="flex gap-2 items-end h-24">
            {[12, 16, 14, 20, 18, 22, 24].map((h, i) => (
              <motion.div 
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h * 4}px` }}
                className={cn(
                  "flex-1 bg-secondary rounded-t-sm",
                  i < 6 ? "opacity-40" : "opacity-100"
                )}
              />
            ))}
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-secondary/5 rounded-full blur-3xl"></div>
        </div>

        <div className="col-span-4 bg-tertiary text-on-primary rounded-3xl p-8 flex flex-col justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider opacity-70 mb-1">Perlu Perhatian</p>
            <h3 className="text-3xl font-headline font-extrabold">3 Siswa</h3>
          </div>
          <div className="flex -space-x-3">
            {[1, 2, 3].map(i => (
              <img 
                key={i}
                className="w-10 h-10 rounded-full border-2 border-tertiary" 
                src={`https://picsum.photos/seed/attention${i}/40/40`} 
                alt="Student" 
              />
            ))}
            <div className="w-10 h-10 rounded-full bg-tertiary-fixed-dim text-tertiary flex items-center justify-center text-xs font-bold border-2 border-tertiary">+2</div>
          </div>
        </div>
      </div>

      {/* Attendance Grid Table */}
      <section className="bg-surface-container-lowest rounded-3xl shadow-sm overflow-hidden p-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-headline text-xl font-bold">Catatan Kehadiran</h3>
          <div className="flex gap-4">
            <LegendItem color="bg-secondary" label="Hadir" />
            <LegendItem color="bg-error" label="Alpa" />
            <LegendItem color="bg-tertiary-fixed-dim" label="Sakit" />
          </div>
        </div>
        
        <div className="overflow-x-auto pb-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left">
                <th className="sticky left-0 bg-surface-container-lowest z-10 py-4 pr-10 min-w-[240px]">
                  <span className="text-[10px] uppercase font-black text-outline tracking-widest">Informasi Siswa</span>
                </th>
                {Array.from({ length: 16 }).map((_, i) => (
                  <th key={i} className="px-2 py-4 text-center font-headline text-[10px] font-black text-outline opacity-50">
                    {i + 1 < 10 ? `0${i + 1}` : i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-transparent">
              {Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="group hover:bg-surface-container-low transition-colors duration-200">
                  <td className="sticky left-0 bg-inherit z-10 py-6 relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary group-hover:w-2 transition-all" />
                    <div className="flex items-center gap-4 pl-6">
                      <div className="w-10 h-10 rounded-lg bg-surface-container-high overflow-hidden">
                        <img src={`https://picsum.photos/seed/table${i}/40/40`} alt="Student" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Student Name {i + 1}</p>
                        <p className="text-xs text-outline font-medium">LIT-2023-00{i + 1}</p>
                      </div>
                    </div>
                  </td>
                  {Array.from({ length: 16 }).map((_, j) => (
                    <td key={j} className="px-2">
                      <div className={cn(
                        "w-6 h-6 rounded-md mx-auto",
                        Math.random() > 0.1 ? "bg-secondary" : Math.random() > 0.5 ? "bg-error" : "bg-tertiary-fixed-dim"
                      )} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

const LegendItem = ({ color, label }: { color: string, label: string }) => (
  <div className="flex items-center gap-2">
    <span className={cn("w-3 h-3 rounded-full", color)}></span>
    <span className="text-xs font-semibold text-on-surface-variant">{label}</span>
  </div>
);
