import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  Stethoscope, 
  AlertCircle, 
  Edit3, 
  MoreVertical,
  Loader2,
  Users
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { supabase } from "../lib/supabase";

export const Dashboard: React.FC<{ 
  isAuthenticated?: boolean; 
  user?: any; 
  onTabChange?: (tab: string) => void;
  selectedClassId?: string | null;
  onClassChange?: (classId: string | null) => void;
}> = ({ isAuthenticated, user, onTabChange, selectedClassId, onClassChange }) => {
  const [stats, setStats] = useState({ present: "0", sick: "0", absent: "0", total: "0" });
  const [weeklyStats, setWeeklyStats] = useState<{ day: string; present: number; other: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [className, setClassName] = useState<string | null>(null);
  const [classesList, setClassesList] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
      updateCurrentDate();
    }
  }, [isAuthenticated, selectedClassId]);

  const updateCurrentDate = () => {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const d = new Date();
    setCurrentDate(`${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`);
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Ambil daftar kelas terlebih dahulu jika belum diambil
      let allClasses = classesList;
      if (allClasses.length === 0) {
        const { data } = await supabase.from('classes').select('id, name').order('name');
        if (data) {
          allClasses = data;
          setClassesList(data);
        }
      }

      let targetClassId = selectedClassId;
      
      // Jika tidak ada kelas yang dipilih, ambil kelas pertama sebagai default
      if (!targetClassId) {
        if (allClasses && allClasses.length > 0) {
          targetClassId = allClasses[0].id;
          if (targetClassId !== selectedClassId) {
            onClassChange?.(targetClassId);
          }
        } else {
          const { data: firstClass } = await supabase.from('classes').select('id, name').limit(1).single();
          if (firstClass) {
            targetClassId = firstClass.id;
            if (targetClassId !== selectedClassId) {
              onClassChange?.(targetClassId);
            }
          }
        }
      }

      if (targetClassId) {
        // Ambil info kelas
        const { data: classInfo } = await supabase.from('classes').select('name').eq('id', targetClassId).single();
        setClassName(classInfo?.name || "Kelas");

        // Ambil ID semua siswa di kelas ini
        const { data: classStudents } = await supabase.from('students').select('id').eq('class_id', targetClassId);
        const studentIds = classStudents?.map(s => s.id) || [];
        const totalSiswa = studentIds.length;

        if (totalSiswa > 0) {
          // 1. Stats Hari Ini
          const { data: todayLogs } = await supabase
            .from('attendance_logs')
            .select('status')
            .eq('date', today)
            .in('student_id', studentIds);

          if (todayLogs) {
            setStats({
              present: todayLogs.filter(l => l.status === 'present').length.toString(),
              sick: todayLogs.filter(l => l.status === 'sick').length.toString(),
              absent: todayLogs.filter(l => l.status === 'absent').length.toString(),
              total: totalSiswa.toString()
            });
          } else {
            setStats({ present: "0", sick: "0", absent: totalSiswa.toString(), total: totalSiswa.toString() });
          }

          // 2. Weekly Trends
          const now = new Date();
          const currentDay = now.getDay();
          const diffToMonday = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
          const monday = new Date(now.setDate(diffToMonday));
          const mondayStr = monday.toISOString().split('T')[0];
          const friday = new Date(monday);
          friday.setDate(friday.getDate() + 4);
          const fridayStr = friday.toISOString().split('T')[0];

          const { data: weeklyLogs } = await supabase
            .from('attendance_logs')
            .select('date, status')
            .gte('date', mondayStr)
            .lte('date', fridayStr)
            .in('student_id', studentIds);

          if (weeklyLogs) {
            const dayNames = ["SEN", "SEL", "RAB", "KAM", "JUM"];
            const structuredData = [];
            for (let i = 0; i < 5; i++) {
              const d = new Date(monday);
              d.setDate(d.getDate() + i);
              const dateStr = d.toISOString().split('T')[0];
              const dayLogs = weeklyLogs.filter(l => l.date === dateStr);
              structuredData.push({
                day: dayNames[i],
                present: dayLogs.filter(l => l.status === 'present').length,
                other: dayLogs.filter(l => l.status !== 'present').length
              });
            }
            setWeeklyStats(structuredData);
          }
        } else {
          setStats({ present: "0", sick: "0", absent: "0", total: "0" });
          setWeeklyStats([]);
        }
      }
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const maxWeeklyValue = Math.max(...weeklyStats.map(d => d.present + d.other), 1);

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-12 max-w-7xl mx-auto">
      {/* Hero Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 md:mb-12"
      >
        <h2 className="text-3xl sm:text-4xl md:text-[3.5rem] font-black font-headline text-on-surface leading-tight tracking-tighter">
          Selamat Pagi, <span className="text-primary">{isAuthenticated && user ? `${user.name}.` : "Pengguna."}</span>
        </h2>
        <div className="flex items-center gap-3 mt-2 flex-wrap text-sm">
          <p className="text-on-surface-variant font-medium">
            {isAuthenticated ? currentDate : "Silakan login untuk melihat ringkasan Anda."}
          </p>
          {isAuthenticated && classesList.length > 0 && (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-outline-variant hidden sm:inline-block"></span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Kelas:</span>
                <div className="relative inline-block">
                  <select
                    value={selectedClassId || ""}
                    onChange={(e) => onClassChange?.(e.target.value || null)}
                    className="bg-secondary-container hover:bg-secondary-container/80 text-on-secondary-container px-3 sm:px-4 py-1 sm:py-1.5 pr-8 rounded-full text-xs sm:text-sm font-black uppercase tracking-widest shadow-sm outline-none cursor-pointer appearance-none border-none transition-all"
                    style={{
                      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23381e72' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                      backgroundSize: '12px'
                    }}
                  >
                    {classesList.map(cls => (
                      <option key={cls.id} value={cls.id} className="text-on-surface bg-surface-container font-sans text-xs sm:text-sm lowercase normal-case first-letter:uppercase font-medium">
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Attendance Pulse Grid */}
      <div className="grid grid-cols-12 gap-4 sm:gap-6 mb-8 md:mb-12">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="col-span-12 sm:col-span-6 md:col-span-3 bg-secondary-container p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] flex flex-col justify-between group transition-transform duration-300"
        >
          <div className="flex justify-between items-start">
            <CheckCircle2 className="text-on-secondary-container" size={32} />
            <span className="text-on-secondary-container font-black text-[10px] tracking-widest uppercase">Hadir</span>
          </div>
          <div className="mt-8">
            <p className="text-on-secondary-container text-4xl sm:text-5xl font-black font-headline">{stats.present}</p>
            <p className="text-on-secondary-container font-bold text-xs mt-1">Siswa Hadir</p>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="col-span-12 sm:col-span-6 md:col-span-3 bg-tertiary-fixed-dim p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] flex flex-col justify-between group transition-transform duration-300"
        >
          <div className="flex justify-between items-start">
            <Stethoscope className="text-tertiary" size={32} />
            <span className="text-tertiary font-black text-[10px] tracking-widest uppercase">Sakit</span>
          </div>
          <div className="mt-8">
            <p className="text-tertiary text-4xl sm:text-5xl font-black font-headline">{stats.sick}</p>
            <p className="text-tertiary font-bold text-xs mt-1">Siswa Sakit</p>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="col-span-12 sm:col-span-6 md:col-span-3 bg-error-container p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] flex flex-col justify-between group transition-transform duration-300"
        >
          <div className="flex justify-between items-start">
            <AlertCircle className="text-on-error-container" size={32} />
            <span className="text-on-error-container font-black text-[10px] tracking-widest uppercase">Alpa</span>
          </div>
          <div className="mt-8">
            <p className="text-on-error-container text-4xl sm:text-5xl font-black font-headline">{stats.absent}</p>
            <p className="text-on-error-container font-bold text-xs mt-1">Tanpa Keterangan</p>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="col-span-12 sm:col-span-6 md:col-span-3 bg-surface-container-highest p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] flex flex-col justify-between group transition-transform duration-300 border border-outline-variant/10 shadow-sm"
        >
          <div className="flex justify-between items-start">
            <Users className="text-primary" size={32} />
            <span className="text-primary font-black text-[10px] tracking-widest uppercase">Total</span>
          </div>
          <div className="mt-8">
            <p className="text-primary text-4xl sm:text-5xl font-black font-headline">{stats.total}</p>
            <p className="text-primary font-bold text-xs mt-1">Total Siswa Kelas</p>
          </div>
        </motion.div>

        {/* Weekly Trends Chart */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container rounded-[1.5rem] sm:rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 sm:mb-10">
            <div>
              <h3 className="text-xl sm:text-2xl font-black font-headline text-on-surface">Keterlibatan Mingguan</h3>
              <p className="text-sm text-on-surface-variant">Tren kehadiran Senin - Jumat minggu ini</p>
            </div>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter bg-surface-container-high px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-secondary"></span> Hadir
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter bg-surface-container-high px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-error"></span> Tidak Hadir
              </span>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 px-2 sm:px-4 overflow-x-auto pb-2">
            {weeklyStats.length > 0 && weeklyStats.some(d => d.present > 0 || d.other > 0) ? weeklyStats.map((data, i) => (
              <div key={i} className="flex-1 min-w-[35px] sm:min-w-[40px] flex flex-col items-center gap-2 group h-full">
                <div className="w-full bg-surface-container-highest/50 rounded-t-2xl relative h-full flex flex-col justify-end overflow-hidden border border-outline-variant/10">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(data.present / maxWeeklyValue) * 100}%` }}
                    className="bg-secondary w-full transition-all duration-500"
                  />
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(data.other / maxWeeklyValue) * 100}%` }}
                    className="bg-error/40 w-full transition-all duration-500"
                  />
                </div>
                <span className={cn(
                  "text-[10px] font-black transition-colors",
                  data.day === ["MIN", "SEN", "SEL", "RAB", "KAM", "JUM", "SAB"][new Date().getDay()] 
                    ? "text-primary" 
                    : "text-on-surface-variant"
                )}>
                  {data.day}
                </span>
              </div>
            )) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-outline text-xs gap-3">
                <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center opacity-50">
                  <Loader2 size={24} className={isLoading ? "animate-spin" : ""} />
                </div>
                <p className="font-bold uppercase tracking-widest text-[10px]">
                  {isLoading ? "Sinkronisasi Tren..." : "Siswa belum ada yang diabsen minggu ini"}
                </p>
                {!isLoading && (
                  <button 
                    onClick={() => onTabChange?.('attendance')}
                    className="text-primary font-bold hover:underline"
                  >
                    Mulai Absen Sekarang
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Action Card (Static for now) */}
        <div className="col-span-12 lg:col-span-4 bg-primary text-on-primary rounded-[1.5rem] sm:rounded-3xl overflow-hidden relative flex flex-col">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-container to-blue-800 opacity-90"></div>
          <div className="relative z-10 p-6 sm:p-8 flex flex-col h-full justify-between">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full mb-4">
                <span className={cn("w-2 h-2 rounded-full", isAuthenticated ? "bg-secondary-container animate-pulse" : "bg-outline")}></span>
                <span className="text-[10px] font-bold uppercase tracking-widest">Sistem Terkoneksi</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black font-headline leading-none">
                {isAuthenticated ? "Database Aktif" : "---"}
              </h3>
              <p className="mt-2 text-on-primary-container font-medium opacity-80 text-sm leading-relaxed">
                Data disinkronkan secara real-time dengan Supabase.
              </p>
            </div>
            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-widest text-on-primary-container mb-4">Aksi Cepat</p>
              <button 
                onClick={() => onTabChange?.('attendance')} 
                disabled={!isAuthenticated} 
                className="w-full py-4 sm:py-5 bg-white text-primary rounded-full font-black text-sm transition-transform active:scale-95 hover:shadow-xl hover:shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <Edit3 size={18} />
                AMBIL ABSENSI
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

