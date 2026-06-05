import React, { useState, useEffect } from "react";
import { 
  Printer, 
  Calendar, 
  Users,
  FileDown
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { supabase } from "../lib/supabase";

export const Reports: React.FC<{ isAuthenticated?: boolean; selectedClassId?: string | null }> = ({ selectedClassId }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // format: YYYY-MM
  const [localClassId, setLocalClassId] = useState<string | null>(selectedClassId || null);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [className, setClassName] = useState("Memuat...");
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [attentionStudents, setAttentionStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedClassId) {
      setLocalClassId(selectedClassId);
    }
  }, [selectedClassId]);

  useEffect(() => {
    fetchInitialData();
  }, [selectedMonth, localClassId]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      // 0. Ambil Semua Kelas untuk dropdown selector
      const { data: allClasses } = await supabase.from('classes').select('id, name').order('name');
      const loadedClassesList = allClasses || [];
      setClassesList(loadedClassesList);

      // 1. Ambil Nama Kelas Terpilih
      let activeClassId = localClassId;
      let classQuery = supabase.from('classes').select('id, name');
      
      if (activeClassId) {
        classQuery = classQuery.eq('id', activeClassId);
      }
      
      const { data: classData, error: classLoadError } = await classQuery.limit(1).single();
      
      if (classLoadError) {
        if (loadedClassesList.length > 0) {
          const fallbackClass = loadedClassesList[0];
          setClassName(fallbackClass.name || "Kelas Belum Diatur");
          activeClassId = fallbackClass.id;
          setLocalClassId(fallbackClass.id);
        } else {
          setClassName("Kelas Belum Diatur");
          activeClassId = null;
        }
      } else {
        setClassName(classData?.name || "Kelas Belum Diatur");
        activeClassId = activeClassId || classData?.id;
      }

      // 2. Ambil Siswa sesuai kelas
      let studentQuery = supabase.from('students').select('*').order('name', { ascending: true });
      if (activeClassId) {
        studentQuery = studentQuery.eq('class_id', activeClassId);
      }
      const { data: studentData } = await studentQuery;
      const currentStudents = studentData || [];
      setStudents(currentStudents);

      // 3. Ambil Logs untuk bulan terpilih
      const [year, month] = selectedMonth.split('-').map(Number);
      const firstDay = `${selectedMonth}-01`;
      const lastDay = new Date(year, month, 0).toISOString().split('T')[0];

      const { data: logData } = await supabase
        .from('attendance_logs')
        .select('*')
        .gte('date', firstDay)
        .lte('date', lastDay);
      
      const currentLogs = logData || [];
      setAttendanceLogs(currentLogs);

      // 4. Hitung Siswa Perlu Perhatian (Alpa Hari Ini)
      const today = new Date().toISOString().split('T')[0];
      const todayAbsentIds = currentLogs
        .filter(log => log.date === today && log.status === 'absent')
        .map(log => log.student_id);
      
      const studentsInNeed = currentStudents.filter(s => todayAbsentIds.includes(s.id));
      setAttentionStudents(studentsInNeed);

    } catch (err) {
      console.error("Error fetching report data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    const originalTitle = document.title;
    const cleanClassName = className ? className.replace(/[^a-zA-Z0-9]/g, '_') : 'Kelas';
    const formattedMonth = selectedMonth ? selectedMonth.replace('-', '_') : 'Bulan';
    document.title = `Laporan_Kehadiran_Kelas_${cleanClassName}_${formattedMonth}`;
    
    window.print();
    
    setTimeout(() => {
      document.title = originalTitle;
    }, 150);
  };

  const formatDisplayDate = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  const [year, month] = selectedMonth.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();

  const getStudentStats = (studentId: string) => {
    let present = 0;
    let absent = 0;
    let sick = 0;
    
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${selectedMonth}-${d < 10 ? '0' + d : d}`;
      const log = attendanceLogs.find(l => l.student_id === studentId && l.date === dateStr);
      if (log) {
        if (log.status === 'present') {
          present++;
        } else if (log.status === 'absent') {
          absent++;
        } else {
          sick++;
        }
      }
    }
    
    const totalMarked = present + absent + sick;
    const percentage = totalMarked > 0 ? (present / totalMarked) * 100 : 100;
    return { present, absent, sick, percentage };
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 max-w-7xl mx-auto print:p-0 print:max-w-none">
      <div className="mb-8 md:mb-12 flex flex-col xl:flex-row xl:justify-between xl:items-end gap-6 print:mb-8">
        <div>
          <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight mb-2 print:text-3xl">Ringkasan Bulanan.</h2>
          <p className="text-sm sm:text-base text-on-surface-variant font-medium print:text-sm">
            Menganalisis pola kehadiran untuk <span className="text-primary font-bold">{className}</span> pada <span className="text-secondary font-bold">{formatDisplayDate(selectedMonth)}</span>
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto print:hidden">
          <div className="glass-panel p-1.5 sm:p-2 rounded-2xl flex flex-col [@media(min-width:380px)]:flex-row gap-2 shadow-sm bg-surface-container-low w-full sm:w-auto justify-center">
            {/* Dropdown Pemilihan Kelas */}
            <div className="relative flex items-center bg-surface-container-lowest rounded-xl px-3 sm:px-4 py-2 hover:bg-primary-fixed transition-colors w-full sm:w-auto justify-center [@media(min-width:380px)]:justify-start">
              <Users size={16} className="text-secondary mr-2 shrink-0" />
              <select
                value={localClassId || ""}
                onChange={(e) => setLocalClassId(e.target.value || null)}
                className="bg-transparent text-xs sm:text-sm font-semibold text-on-surface outline-none cursor-pointer w-full sm:w-auto text-center [@media(min-width:380px)]:text-left focus:ring-0 border-none p-0 pr-1"
              >
                {classesList.map((cls) => (
                  <option key={cls.id} value={cls.id} className="bg-surface-container-lowest text-on-surface text-xs sm:text-sm font-semibold">
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Pemilihan Bulan */}
            <div className="relative flex items-center bg-surface-container-lowest rounded-xl px-3 sm:px-4 py-2 hover:bg-primary-fixed transition-colors w-full [@media(min-width:380px)]:w-auto justify-center [@media(min-width:380px)]:justify-start">
              <Calendar size={16} className="text-primary mr-2 shrink-0" />
              <input 
                type="month" 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-semibold text-on-surface outline-none cursor-pointer w-full sm:w-auto text-center [@media(min-width:380px)]:text-left"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full sm:flex sm:w-auto">
            <button 
              onClick={handleExportPDF}
              className="bg-secondary text-on-primary px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-bold flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg shadow-secondary/20 hover:scale-95 transition-transform active:scale-90 text-xs sm:text-sm font-headline"
            >
              <FileDown size={16} className="shrink-0" />
              <span className="truncate">Ekspor PDF</span>
            </button>
            <button 
              onClick={handlePrint}
              className="bg-primary text-on-primary px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-bold flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg shadow-primary/20 hover:scale-95 transition-transform active:scale-90 text-xs sm:text-sm font-headline"
            >
              <Printer size={16} className="shrink-0" />
              <span className="truncate">Cetak</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 mb-8 md:mb-12">
        <div className="col-span-12 md:col-span-8 bg-surface-container-low rounded-[1.5rem] sm:rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-1">Kesehatan Kelas</p>
              <h3 className="text-3xl sm:text-4xl font-headline font-extrabold text-secondary">
                {attendanceLogs.length > 0 
                  ? ((attendanceLogs.filter(l => l.status === 'present').length / attendanceLogs.length) * 100).toFixed(1)
                  : "0"}%
              </h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black bg-secondary-container text-on-secondary-container px-2 py-1 rounded-full">Stabilitas Akademik</span>
            </div>
          </div>
          <div className="flex gap-2 items-end h-24">
            {[0.8, 0.9, 0.7, 0.95, 0.85, 0.92, 0.88].map((h, i) => (
              <motion.div 
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h * 100}px` }}
                className={cn(
                  "flex-1 bg-secondary rounded-t-sm",
                  i < 6 ? "opacity-30" : "opacity-100"
                )}
              />
            ))}
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-secondary/5 rounded-full blur-3xl"></div>
        </div>

        <div className="col-span-12 md:col-span-4 bg-tertiary text-on-primary rounded-[1.5rem] sm:rounded-3xl p-6 sm:p-8 flex flex-col justify-between gap-6 md:gap-0">
          <div>
            <p className="text-xs sm:text-sm font-bold uppercase tracking-wider opacity-70 mb-1">Perlu Perhatian (Alpa Hari Ini)</p>
            <h3 className="text-2xl sm:text-3xl font-headline font-extrabold">{attentionStudents.length} Siswa</h3>
          </div>
          <div className="flex -space-x-3">
            {attentionStudents.length > 0 ? attentionStudents.slice(0, 4).map((student, i) => (
                <div 
                  key={student.id} 
                  className="w-10 h-10 rounded-full border-2 border-tertiary bg-surface-container flex items-center justify-center text-[10px] font-bold overflow-hidden"
                >
                  <img 
                    src={(student.photo_url || student.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name || "Siswa")}&background=random`) || undefined} 
                    alt={student.name || "Siswa"} 
                    className="w-full h-full object-cover"
                    key={student.photo_url || 'default'}
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes('ui-avatars.com')) {
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random`;
                      }
                    }}
                  />
                </div>
            )) : (
              <div className="text-xs font-medium opacity-60 italic">Semua siswa hadir/berketerangan</div>
            )}
            {attentionStudents.length > 4 && (
              <div className="w-10 h-10 rounded-full bg-tertiary-fixed-dim text-tertiary flex items-center justify-center text-xs font-bold border-2 border-tertiary">+{attentionStudents.length - 4}</div>
            )}
          </div>
        </div>
      </div>

      {/* Attendance Grid Table */}
      <section className="bg-surface-container-lowest rounded-[1.5rem] sm:rounded-3xl shadow-sm overflow-hidden p-4 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="font-headline text-lg sm:text-xl font-bold text-on-surface">Catatan Kehadiran {formatDisplayDate(selectedMonth)}</h3>
            <p className="text-xs text-outline font-medium mt-1">Laporan rekapitulasi performa kehadiran siswa</p>
          </div>
          <div className="flex flex-wrap gap-2.5 sm:gap-4 print:hidden">
            <LegendItem color="bg-surface-container-high border border-outline-variant/30" label="Belum Diabsen" />
            <LegendItem color="bg-secondary" label="Hadir" />
            <LegendItem color="bg-error" label="Alpa" />
            <LegendItem color="bg-tertiary-fixed-dim" label="Sakit/Izin" />
          </div>
        </div>
        
        {/* Mobile View: High quality stacked summary cards (No Horizontal Scroll) */}
        <div className="md:hidden space-y-4 print:hidden">
          {students.length > 0 ? students.map((student) => {
            const { present, absent, sick, percentage } = getStudentStats(student.id);
            return (
              <motion.div 
                key={student.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface-container-low/40 border border-outline-variant/10 rounded-2xl p-4 space-y-4"
              >
                {/* Header: Photo and basic info */}
                <div className="flex items-center justify-between border-b border-outline-variant/10 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-high overflow-hidden flex items-center justify-center text-xs font-bold text-outline shrink-0">
                      <img 
                        src={(student.photo_url || student.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name || "Siswa")}&background=random`) || undefined} 
                        alt={student.name || "Siswa"} 
                        className="w-full h-full object-cover"
                        key={student.photo_url || 'default'}
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.src.includes('ui-avatars.com')) {
                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random`;
                          }
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-on-surface truncate max-w-[170px]">{student.name}</p>
                      <p className="text-[10px] text-outline font-semibold">NIS: {student.nis}</p>
                    </div>
                  </div>
                  
                  {/* Attendance Performance Badge */}
                  <div className="text-right">
                    <span className={cn(
                      "text-xs font-black font-headline px-2.5 py-1 rounded-full",
                      percentage >= 90 ? "bg-secondary/15 text-secondary" :
                      percentage >= 75 ? "bg-tertiary-fixed-dim/30 text-tertiary" :
                      "bg-error/15 text-error"
                    )}>
                      {percentage.toFixed(0)}% Hadir
                    </span>
                  </div>
                </div>

                {/* Counters summary */}
                <div className="flex items-center gap-3.5 text-[11px] font-bold text-on-surface-variant flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                    <span>Hadir: {present} hr</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-error"></span>
                    <span>Alpa: {absent} hr</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-tertiary-fixed-dim"></span>
                    <span>Sakit/Izin: {sick} hr</span>
                  </div>
                </div>

                {/* Grid of days in month (7 columns so it feels exactly like a micro-calendar) */}
                <div className="pt-2">
                  <p className="text-[10px] font-black uppercase text-outline tracking-wider mb-2">Peta Kehadiran Harian (Tgl 1 - {daysInMonth})</p>
                  <div className="grid grid-cols-7 gap-1.5 max-w-[260px]">
                    {Array.from({ length: daysInMonth }).map((_, j) => {
                      const day = j + 1;
                      const dateStr = `${selectedMonth}-${day < 10 ? '0' + day : day}`;
                      const log = attendanceLogs.find(l => l.student_id === student.id && l.date === dateStr);
                      const status = !log ? 'unmarked' : log.status === 'present' ? 'present' : log.status === 'absent' ? 'absent' : 'sick';
                      
                      return (
                        <div 
                          key={j} 
                          className={cn(
                            "aspect-square rounded-md flex items-center justify-center text-[9px] font-black transition-all",
                            status === 'unmarked' ? "bg-surface-container-high text-outline-variant border border-outline-variant/10" :
                            status === 'present' ? "bg-secondary text-on-primary" : 
                            status === 'absent' ? "bg-error text-on-error" : 
                            "bg-tertiary-fixed-dim text-on-tertiary-container"
                          )}
                          title={`Tanggal ${day}: ${status === 'unmarked' ? 'Belum Diabsen' : status === 'present' ? 'Hadir' : status === 'absent' ? 'Alpa' : 'Sakit/Izin'}`}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            );
          }) : (
            <div className="py-10 text-center text-outline text-xs italic">
              {isLoading ? "Memuat data..." : "Belum ada data siswa"}
            </div>
          )}
        </div>

        {/* Regular Table View: Hidden on mobile, visible on desktop/wide screen & always visible when printing */}
        <div className="hidden md:block overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-outline-variant/30 print:block">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left">
                <th className="sticky left-0 bg-surface-container-lowest z-10 py-4 pr-3 sm:pr-10 min-w-[130px] sm:min-w-[240px] border-r border-outline-variant/10 shadow-[2px_0_5px_rgba(0,0,0,0.03)] print:static print:bg-transparent print:border-none print:shadow-none">
                  <span className="text-[10px] uppercase font-black text-outline tracking-widest pl-3 sm:pl-6">Informasi Siswa</span>
                </th>
                {Array.from({ length: daysInMonth }).map((_, i) => (
                  <th key={i} className="px-1 py-4 text-center font-headline text-[10px] font-black text-outline opacity-50 min-w-[30px]">
                    {i + 1 < 10 ? `0${i + 1}` : i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-transparent">
              {students.length > 0 ? students.map((student, i) => (
                <tr key={student.id} className="group hover:bg-surface-container-low transition-colors duration-200">
                  <td className="sticky left-0 bg-inherit z-10 py-4 border-r border-outline-variant/10 shadow-[2px_0_5px_rgba(0,0,0,0.03)] print:static print:bg-transparent print:border-none print:shadow-none relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary group-hover:w-2 transition-all" />
                    <div className="flex items-center gap-2 sm:gap-4 pl-3 sm:pl-6 pr-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-surface-container-high overflow-hidden flex items-center justify-center text-xs font-bold text-outline shrink-0">
                        <img 
                          src={(student.photo_url || student.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name || "Siswa")}&background=random`) || undefined} 
                          alt={student.name || "Siswa"} 
                          className="w-full h-full object-cover"
                          key={student.photo_url || 'default'}
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (!target.src.includes('ui-avatars.com')) {
                              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random`;
                            }
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs sm:text-sm truncate max-w-[75px] sm:max-w-[155px]" title={student.name}>{student.name}</p>
                        <p className="text-[9px] sm:text-[10px] text-outline font-medium truncate">{student.nis}</p>
                      </div>
                    </div>
                  </td>
                  {Array.from({ length: daysInMonth }).map((_, j) => {
                    const day = j + 1;
                    const dateStr = `${selectedMonth}-${day < 10 ? '0' + day : day}`;
                    const log = attendanceLogs.find(l => l.student_id === student.id && l.date === dateStr);
                    
                    return (
                      <td key={j} className="px-1">
                        <div className={cn(
                          "w-4 h-4 sm:w-5 sm:h-5 rounded-[4px] sm:rounded-sm mx-auto transition-all duration-150 border",
                          !log ? "bg-surface-container-high border-outline-variant/10" : 
                          log.status === 'present' ? "bg-secondary border-secondary" : 
                          log.status === 'absent' ? "bg-error border-error" : 
                          "bg-tertiary-fixed-dim border-tertiary-fixed-dim"
                        )} />
                      </td>
                    );
                  })}
                </tr>
              )) : (
                <tr>
                  <td colSpan={daysInMonth + 1} className="py-20 text-center text-outline text-sm italic">
                    {isLoading ? "Memuat data siswa..." : "Belum ada data siswa di database"}
                  </td>
                </tr>
              )}
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
