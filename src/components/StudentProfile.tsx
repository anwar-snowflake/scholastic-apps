import React from "react";
import { 
  IdCard, 
  School, 
  CheckCircle2, 
  Stethoscope, 
  UserX, 
  FileText,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  History,
  Trophy,
  Plus
} from "lucide-react";
import { motion } from "motion/react";
import { MOCK_STUDENTS, MOCK_NOTES } from "../constants";
import { cn } from "../lib/utils";

export const StudentProfile: React.FC = () => {
  const student = MOCK_STUDENTS[0];

  return (
    <div className="p-12 max-w-7xl mx-auto">
      {/* Profile Header */}
      <section className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-8">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-surface-container-high relative group">
            <img 
              alt={student.name} 
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" 
              src={student.photoUrl} 
            />
            <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
          </div>
          <div>
            <h1 className="font-headline text-5xl font-extrabold text-on-background tracking-tight mb-2">{student.name}</h1>
            <div className="flex items-center gap-4 text-on-surface-variant">
              <span className="flex items-center gap-1 font-semibold text-sm">
                <IdCard size={16} className="fill-current" />
                {student.nis}
              </span>
              <span className="w-1 h-1 bg-outline-variant rounded-full"></span>
              <span className="flex items-center gap-1 font-semibold text-sm">
                <School size={16} />
                {student.class}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="bg-surface-container-high text-primary px-6 py-3 rounded-full font-bold text-sm hover:bg-primary-fixed transition-colors">
            Edit Profil
          </button>
          <button className="bg-primary text-on-primary px-6 py-3 rounded-full font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
            Ekspor Ledger
          </button>
        </div>
      </section>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Stats */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-surface-container-low rounded-[2.5rem] p-8 relative overflow-hidden">
            <div className="relative z-10">
              <p className="font-headline text-sm font-bold text-secondary mb-4 uppercase tracking-widest">Kesehatan Absensi</p>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-headline font-black text-on-background">94%</span>
                <span className="text-secondary font-bold text-sm">+2.4% dari semester lalu</span>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 opacity-5">
              <CheckCircle2 size={160} className="fill-current" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Total Ketidakhadiran" value="04" sub="Hari semester ini" color="error" />
            <StatCard label="Izin Sakit" value="02" sub="Kasus terdokumentasi" color="tertiary" />
            <StatCard label="Terlambat" value="01" sub="Di bawah 15 menit" color="on-surface" />
            <StatCard label="Izin" value="03" sub="Permohonan formal" color="primary" />
          </div>

          <div className="bg-surface-container-lowest p-8 rounded-[2.5rem] shadow-sm">
            <h3 className="font-headline text-lg font-bold mb-6 text-on-background">Metadata Pribadi</h3>
            <div className="space-y-4">
              <MetadataRow label="Orang Tua/Wali" value="Agus Santoso" />
              <MetadataRow label="Kontak Darurat" value="+62 811-923-XXXX" />
              <MetadataRow label="Alamat" value="Jl. Melati No. 42, Jakarta" />
            </div>
          </div>
        </div>

        {/* Right Column: Calendar & Timeline */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <div className="bg-surface-container-lowest rounded-[2.5rem] p-10 shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <h2 className="font-headline text-2xl font-bold text-on-background tracking-tight">Buku Besar Absensi: Oktober 2024</h2>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-surface-container-low rounded-lg transition-colors">
                  <ChevronLeft size={20} />
                </button>
                <button className="p-2 hover:bg-surface-container-low rounded-lg transition-colors">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-y-8 gap-x-2 text-center mb-8">
              {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map(day => (
                <div key={day} className="text-[10px] font-bold text-outline uppercase tracking-[0.2em]">{day}</div>
              ))}
              {/* Mock Calendar Grid */}
              {Array.from({ length: 31 }).map((_, i) => {
                const day = i + 1;
                let status: string | null = null;
                if (day === 1 || day === 2 || day === 4 || day === 7 || day === 9 || day === 10 || day === 14 || day === 15) status = 'present';
                if (day === 3) status = 'absent';
                if (day === 8) status = 'sick';
                if (day === 11) status = 'permission';

                return (
                  <div key={i} className="py-3 flex justify-center">
                    <div className={cn(
                      "w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all",
                      status === 'present' ? "bg-secondary text-on-primary" :
                      status === 'absent' ? "bg-error text-on-primary" :
                      status === 'sick' ? "bg-tertiary-fixed-dim text-tertiary" :
                      status === 'permission' ? "bg-primary text-on-primary" :
                      "text-outline opacity-50"
                    )}>
                      {day < 10 ? `0${day}` : day}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-8 border-t border-surface-container flex items-center gap-6 justify-center">
              <LegendItem color="bg-secondary" label="Hadir" />
              <LegendItem color="bg-tertiary-fixed-dim" label="Sakit" />
              <LegendItem color="bg-primary" label="Izin" />
              <LegendItem color="bg-error" label="Alpa" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-headline text-xl font-bold text-on-background px-2">Timeline Catatan</h3>
            {MOCK_NOTES.map((note) => (
              <div key={note.id} className="bg-surface-container-low p-6 rounded-full group hover:bg-surface-container-lowest transition-all flex items-center gap-6">
                <div className={cn(
                  "w-2 h-12 rounded-full",
                  note.type === 'sick' ? "bg-tertiary-fixed-dim" :
                  note.type === 'absent' ? "bg-error" : "bg-primary"
                )} />
                <div className="flex-1">
                  <p className={cn(
                    "text-xs font-bold uppercase tracking-wider mb-1",
                    note.type === 'sick' ? "text-tertiary" :
                    note.type === 'absent' ? "text-error" : "text-primary"
                  )}>
                    {note.date} • {note.type.toUpperCase()}
                  </p>
                  <p className="text-sm font-semibold text-on-surface">{note.content}</p>
                </div>
                <button className="p-3 bg-surface-container-high rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button className="fixed bottom-10 right-10 w-16 h-16 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50">
        <Plus size={32} />
      </button>
    </div>
  );
};

const StatCard = ({ label, value, sub, color }: { label: string, value: string, sub: string, color: string }) => (
  <div className="bg-surface-container rounded-3xl p-6 transition-all hover:bg-surface-container-high">
    <p className="text-xs font-bold text-on-surface-variant uppercase mb-2">{label}</p>
    <p className={cn("text-3xl font-headline font-extrabold", `text-${color}`)}>{value}</p>
    <p className="text-[10px] text-on-surface-variant mt-2 font-medium">{sub}</p>
  </div>
);

const MetadataRow = ({ label, value }: { label: string, value: string }) => (
  <div className="flex justify-between items-center group">
    <span className="text-sm font-medium text-on-surface-variant group-hover:text-primary transition-colors">{label}</span>
    <span className="text-sm font-bold text-on-surface text-right">{value}</span>
  </div>
);

const LegendItem = ({ color, label }: { color: string, label: string }) => (
  <div className="flex items-center gap-2">
    <span className={cn("w-3 h-3 rounded-sm", color)}></span>
    <span className="text-xs font-bold text-on-surface-variant">{label}</span>
  </div>
);
