import React from "react";
import { 
  CheckCircle2, 
  Stethoscope, 
  AlertCircle, 
  Edit3, 
  BookOpen,
  ArrowRight,
  MoreVertical
} from "lucide-react";
import { motion } from "motion/react";
import { MOCK_SESSIONS } from "../constants";
import { cn } from "../lib/utils";

export const Dashboard: React.FC<{ isAuthenticated?: boolean; user?: any }> = ({ isAuthenticated, user }) => {
  const [sessions, setSessions] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState({ stability: "0%", empathy: "0", urgency: "0" });

  React.useEffect(() => {
    if (isAuthenticated) {
      // Placeholder: Nantinya ini bisa fetch dari Supabase
      // Untuk sementara biarkan kosong agar user bisa mengisi sendiri di DB
    }
  }, [isAuthenticated]);

  return (
    <div className="p-12 max-w-7xl mx-auto">
      {/* Hero Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h2 className="text-[3.5rem] font-black font-headline text-on-surface leading-tight tracking-tighter">
          Selamat Pagi, <span className="text-primary">{isAuthenticated && user ? `${user.name}.` : "Pengguna."}</span>
        </h2>
        <p className="text-on-surface-variant text-lg mt-2 font-medium">
          {isAuthenticated ? "Selamat datang kembali di pusat kendali Scholastic." : "Silakan login untuk melihat ringkasan Anda."}
        </p>
      </motion.div>

      {/* Attendance Pulse Grid */}
      <div className="grid grid-cols-12 gap-6 mb-12">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="col-span-12 md:col-span-4 bg-secondary-container p-8 rounded-[2rem] flex flex-col justify-between group transition-transform duration-300"
        >
          <div className="flex justify-between items-start">
            <CheckCircle2 className="text-on-secondary-container" size={36} />
            <span className="text-on-secondary-container font-black text-sm tracking-widest uppercase">Stabilitas</span>
          </div>
          <div className="mt-8">
            <p className="text-on-secondary-container text-5xl font-black font-headline">{stats.stability}</p>
            <p className="text-on-secondary-container font-bold text-sm mt-1">Total Hadir Hari Ini</p>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="col-span-12 md:col-span-4 bg-tertiary-fixed-dim p-8 rounded-[2rem] flex flex-col justify-between group transition-transform duration-300"
        >
          <div className="flex justify-between items-start">
            <Stethoscope className="text-tertiary" size={36} />
            <span className="text-tertiary font-black text-sm tracking-widest uppercase">Empati</span>
          </div>
          <div className="mt-8">
            <p className="text-tertiary text-5xl font-black font-headline">{stats.empathy}</p>
            <p className="text-tertiary font-bold text-sm mt-1">Siswa Sakit</p>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="col-span-12 md:col-span-4 bg-error-container p-8 rounded-[2rem] flex flex-col justify-between group transition-transform duration-300"
        >
          <div className="flex justify-between items-start">
            <AlertCircle className="text-on-error-container" size={36} />
            <span className="text-on-error-container font-black text-sm tracking-widest uppercase">Urgensi</span>
          </div>
          <div className="mt-8">
            <p className="text-on-error-container text-5xl font-black font-headline">{stats.urgency}</p>
            <p className="text-on-error-container font-bold text-sm mt-1">Absensi Tanpa Keterangan</p>
          </div>
        </motion.div>

        {/* Weekly Trends Placeholder */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container rounded-3xl p-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h3 className="text-2xl font-black font-headline text-on-surface">Keterlibatan Mingguan</h3>
              <p className="text-sm text-on-surface-variant">Tren kehadiran untuk 17 Okt - 24 Okt</p>
            </div>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter bg-surface-container-high px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-secondary"></span> Hadir
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter bg-surface-container-high px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-error"></span> Absen
              </span>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between gap-4 px-4">
            {[85, 90, 75, 95, 80].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full bg-surface-container-highest rounded-t-xl relative h-full flex flex-col justify-end overflow-hidden">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: isAuthenticated ? `${val}%` : "0%" }}
                    className="bg-secondary/40 w-full"
                  />
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: isAuthenticated ? `${val - 15}%` : "0%" }}
                    className="bg-secondary w-full"
                  />
                </div>
                <span className="text-[10px] font-black text-on-surface-variant">
                  {["SEN", "SEL", "RAB", "KAM", "JUM"][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Action Card */}
        <div className="col-span-12 lg:col-span-4 bg-primary text-on-primary rounded-3xl overflow-hidden relative flex flex-col">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-container to-blue-800 opacity-90"></div>
          <div className="relative z-10 p-8 flex flex-col h-full">
            <div className="mb-auto">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full mb-4">
                <span className={cn("w-2 h-2 rounded-full", isAuthenticated ? "bg-secondary-container animate-pulse" : "bg-outline")}></span>
                <span className="text-[10px] font-bold uppercase tracking-widest">Kelas Berlangsung</span>
              </div>
              <h3 className="text-3xl font-black font-headline leading-none">
                {isAuthenticated ? "Sastra Inggris 301" : "---"}
              </h3>
              <p className="mt-2 text-on-primary-container font-medium opacity-80">
                {isAuthenticated ? "Ruang 402 • 10:30 - 11:45" : "Belum ada sesi"}
              </p>
            </div>
            <div className="mt-12">
              <p className="text-xs font-bold uppercase tracking-widest text-on-primary-container mb-4">Kurasi Cepat</p>
              <button disabled={!isAuthenticated} className="w-full py-5 bg-white text-primary rounded-full font-black text-sm transition-transform active:scale-95 hover:shadow-xl hover:shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50">
                <Edit3 size={18} />
                AMBIL ABSENSI
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-black font-headline text-on-surface">Urutan Hari Ini</h3>
      </div>

      <div className="space-y-6">
        {sessions.length > 0 ? sessions.map((session) => (
          <div 
            key={session.id}
            className="group bg-surface hover:bg-surface-container-low transition-all duration-300 rounded-2xl p-6 flex items-center gap-8 relative overflow-hidden"
          >
            {/* ... rest of the session item remains same ... */}
            <div className={cn(
              "absolute left-0 top-0 bottom-0 w-2 rounded-r-full",
              session.status === 'completed' ? "bg-secondary" : 
              session.status === 'ongoing' ? "bg-primary" : "bg-outline-variant"
            )} />
            <div className="w-20 text-center">
              <p className="text-xl font-black font-headline text-on-surface">{session.startTime}</p>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase">PAGI</p>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold font-headline text-on-surface">{session.name}</h4>
              <p className="text-sm text-on-surface-variant">{session.classGroup}</p>
            </div>
            <div className="flex items-center gap-12">
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container-high overflow-hidden">
                    <img src={`https://picsum.photos/seed/${session.id}${i}/32/32`} alt="Student" />
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container-highest flex items-center justify-center text-[10px] font-bold">+24</div>
              </div>
              <div className="text-right min-w-[120px]">
                <p className={cn(
                  "text-sm font-black",
                  session.status === 'completed' ? "text-secondary" : 
                  session.status === 'ongoing' ? "text-primary" : "text-on-surface-variant"
                )}>
                  {session.status.toUpperCase()}
                </p>
                {session.attendanceRate && (
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase">{session.attendanceRate}% Kehadiran</p>
                )}
              </div>
              <button className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface group-hover:bg-white transition-colors">
                <MoreVertical size={18} />
              </button>
            </div>
          </div>
        )) : (
          <div className="py-20 text-center bg-surface-container-low rounded-3xl border-2 border-dashed border-outline-variant/20">
            <p className="text-outline font-bold uppercase tracking-widest text-sm">Tidak ada data tersedia</p>
          </div>
        )}
      </div>
    </div>
  );
};

