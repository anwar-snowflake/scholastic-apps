import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  Stethoscope, 
  UserX, 
  FileText,
  Save,
  Loader2
} from "lucide-react";
import { motion } from "motion/react";
import { AttendanceStatus, Student } from "../types";
import { cn } from "../lib/utils";
import { supabase } from "../lib/supabase";

export const Attendance: React.FC<{ isAuthenticated?: boolean }> = ({ isAuthenticated }) => {
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [students, setStudents] = useState<Student[]>([]);
  const [className, setClassName] = useState<string>("Memuat...");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    } else {
      setStudents([]);
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      // 1. Ambil Nama Kelas
      const { data: classData } = await supabase.from('classes').select('name').limit(1).single();
      setClassName(classData?.name || "Presensi Siswa");

      // 2. Ambil Daftar Siswa
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .order('name', { ascending: true });

      if (studentError) throw studentError;
      if (studentData) setStudents(studentData);

      // 3. Ambil Absensi Hari Ini
      const today = new Date().toISOString().split('T')[0];
      const { data: logData } = await supabase
        .from('attendance_logs')
        .select('student_id, status')
        .eq('date', today);

      if (logData) {
        const initialAttendance: Record<string, AttendanceStatus> = {};
        logData.forEach(log => {
          initialAttendance[log.student_id] = log.status as AttendanceStatus;
        });
        setAttendance(initialAttendance);
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setErrorMessage(err.message || "Gagal mengambil data dari Supabase.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAttendance = async () => {
    if (!isAuthenticated || students.length === 0) return;
    setIsSaving(true);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const logs = Object.entries(attendance).map(([studentId, status]) => ({
        student_id: studentId,
        status: status,
        date: today
      }));

      // Menggunakan upsert agar data lama tertimpa data baru jika diedit
      const { error } = await supabase
        .from('attendance_logs')
        .upsert(logs, { onConflict: 'student_id,date' });

      if (error) throw error;
      alert("Absensi berhasil disimpan!");
    } catch (err: any) {
      alert("Gagal menyimpan: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    if (!isAuthenticated) return;
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const stats = {
    present: Object.values(attendance).filter(s => s === 'present').length,
    absent: Object.values(attendance).filter(s => s === 'absent').length,
    total: students.length
  };

  return (
    <div className="p-12 max-w-7xl mx-auto">
      {/* ... header ... */}
      <div className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-[3.5rem] font-black font-headline text-on-surface tracking-tight leading-none mb-2">
            {isAuthenticated ? className : "Kelas ---"}
          </h1>
          <p className="text-xl font-headline text-primary opacity-80">
            {isAuthenticated ? "Kelola kehadiran siswa secara real-time" : "Silakan login untuk memproses presensi"}
          </p>
        </div>
        
        <div className="hidden lg:block bg-surface-container-lowest/70 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-outline-variant/15">
          <div className="flex gap-8 items-center">
            <div className="text-center">
              <span className="block text-2xl font-extrabold text-secondary">{stats.present}</span>
              <span className="text-[10px] uppercase font-bold text-outline">Hadir</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-extrabold text-error">{stats.absent}</span>
              <span className="text-[10px] uppercase font-bold text-outline">Alpa</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-extrabold text-tertiary">{students.length}</span>
              <span className="text-[10px] uppercase font-bold text-outline">Total</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <Loader2 size={40} className="animate-spin text-primary" />
            <p className="text-outline font-bold uppercase tracking-widest text-xs">Memuat data siswa...</p>
          </div>
        ) : errorMessage ? (
          <div className="py-20 text-center bg-error-container/20 rounded-3xl border-2 border-dashed border-error/20">
            <p className="text-error font-black uppercase tracking-widest text-sm">Error Koneksi</p>
            <p className="text-xs text-on-error-container mt-2">{errorMessage}</p>
            <button 
              onClick={fetchData}
              className="mt-6 px-6 py-2 bg-error text-on-error rounded-full text-xs font-bold"
            >
              COBA LAGI
            </button>
          </div>
        ) : students.length > 0 ? (
          // ... students.map ...
          students.map((student) => (
            <motion.div 
              key={student.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="group flex items-center bg-surface-container-lowest rounded-2xl p-4 hover:bg-surface-container-low transition-colors duration-200"
            >
              <div className={cn(
                "w-1.5 h-16 rounded-full mr-6 transition-colors",
                attendance[student.id] === 'present' ? "bg-secondary" :
                attendance[student.id] === 'sick' ? "bg-tertiary-fixed-dim" :
                attendance[student.id] === 'absent' ? "bg-error" : "bg-surface-container-high"
              )} />
              
              <div className="w-16 h-16 rounded-full bg-surface-container-high overflow-hidden mr-6">
                <img 
                  className="w-full h-full object-cover" 
                  src={student.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random`} 
                  alt={student.name} 
                />
              </div>
              
              <div className="flex-1">
                <h3 className="font-headline font-bold text-lg text-on-surface">{student.name}</h3>
                <p className="font-body text-sm text-outline">NIS: {student.nis}</p>
              </div>

              <div className="flex gap-2">
                <StatusButton 
                  active={attendance[student.id] === 'present'}
                  onClick={() => handleStatusChange(student.id, 'present')}
                  color="secondary"
                  icon={CheckCircle2}
                  label="Hadir"
                />
                <StatusButton 
                  active={attendance[student.id] === 'sick'}
                  onClick={() => handleStatusChange(student.id, 'sick')}
                  color="tertiary"
                  icon={Stethoscope}
                  label="Sakit"
                />
                <StatusButton 
                  active={attendance[student.id] === 'permission'}
                  onClick={() => handleStatusChange(student.id, 'permission')}
                  color="primary"
                  icon={FileText}
                  label="Izin"
                />
                <StatusButton 
                  active={attendance[student.id] === 'absent'}
                  onClick={() => handleStatusChange(student.id, 'absent')}
                  color="error"
                  icon={UserX}
                  label="Alpa"
                />
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-20 text-center bg-surface-container-low rounded-3xl border-2 border-dashed border-outline-variant/20">
            <p className="text-outline font-bold uppercase tracking-widest text-sm">Daftar siswa kosong</p>
            <p className="text-xs text-outline mt-2">1. Pastikan isi Data di "Table Editor"<br/>2. Matikan "RLS" di menu Database &gt; Tables</p>
          </div>
        )}
      </div>

      <div className="mt-16 flex justify-end">
        <button 
          onClick={handleSaveAttendance}
          disabled={!isAuthenticated || students.length === 0 || isSaving} 
          className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-12 py-4 rounded-full font-headline font-extrabold text-lg shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
          {isSaving ? "Menyimpan..." : "Simpan Absensi"}
        </button>
      </div>
    </div>
  );
};


interface StatusButtonProps {
  active: boolean;
  onClick: () => void;
  color: string;
  icon: React.FC<{ size?: number; className?: string }>;
  label: string;
}

const StatusButton: React.FC<StatusButtonProps> = ({ active, onClick, color, icon: Icon, label }) => {
  const colorClasses: Record<string, string> = {
    secondary: active ? "bg-secondary text-on-primary" : "bg-surface-container-high text-on-surface-variant hover:bg-secondary-container",
    tertiary: active ? "bg-tertiary text-on-primary" : "bg-surface-container-high text-on-surface-variant hover:bg-tertiary-fixed-dim",
    primary: active ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant hover:bg-primary-fixed",
    error: active ? "bg-error text-on-primary" : "bg-surface-container-high text-on-surface-variant hover:bg-error-container hover:text-error",
  };

  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-6 py-2 rounded-xl font-headline font-bold text-sm shadow-sm flex items-center gap-2 transition-all",
        colorClasses[color]
      )}
    >
      <Icon size={16} className={active ? "fill-current" : ""} />
      {label}
    </button>
  );
};
