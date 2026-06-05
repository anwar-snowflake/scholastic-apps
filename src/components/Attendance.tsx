import React, { useState, useEffect, useRef } from "react";
import { 
  CheckCircle2, 
  Stethoscope, 
  UserX, 
  FileText,
  Save,
  Loader2,
  Camera,
  Plus,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AttendanceStatus, Student } from "../types";
import { cn } from "../lib/utils";
import { supabase } from "../lib/supabase";

export const Attendance: React.FC<{ isAuthenticated?: boolean; selectedClassId?: string | null }> = ({ isAuthenticated, selectedClassId }) => {
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [students, setStudents] = useState<Student[]>([]);
  const [className, setClassName] = useState<string>("Memuat...");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Class and Add Student state
  const [classesList, setClassesList] = useState<{ id: string; name: string }[]>([]);
  const [activeClassId, setActiveClassId] = useState<string | null>(null);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentNis, setNewStudentNis] = useState("");
  const [newStudentClassId, setNewStudentClassId] = useState("");
  const [newStudentParentName, setNewStudentParentName] = useState("");
  const [newStudentPhone, setNewStudentPhone] = useState("");
  const [newStudentAddress, setNewStudentAddress] = useState("");
  const [isSavingStudent, setIsSavingStudent] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      if (selectedClassId) {
        setActiveClassId(selectedClassId);
      }
    } else {
      setStudents([]);
    }
  }, [isAuthenticated, selectedClassId]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, activeClassId]);

  const fetchData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      // 1. Fetch classes list
      const { data: allCls } = await supabase.from('classes').select('id, name').order('name');
      if (allCls) {
        setClassesList(allCls);
      }

      // 2. Select targetClassId
      let targetClassId = activeClassId;
      if (!targetClassId) {
        if (allCls && allCls.length > 0) {
          targetClassId = allCls[0].id;
          setActiveClassId(targetClassId);
          return; // Stop here, since setActiveClassId triggers reload
        }
      }

      if (targetClassId) {
        const currentCls = allCls?.find(c => c.id === targetClassId);
        setClassName(currentCls?.name || "Presensi Siswa");

        // 3. Find students for this specific class
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('*')
          .eq('class_id', targetClassId)
          .order('name', { ascending: true });
        
        if (studentError) throw studentError;
        setStudents(studentData || []);
      } else {
        setClassName("Presensi Siswa");
        setStudents([]);
      }

      // 4. Fetch today's logs
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

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!newStudentName.trim() || !newStudentNis.trim() || !newStudentClassId) {
      setModalError("Nama, NIS, dan Kelas wajib diisi!");
      return;
    }

    setIsSavingStudent(true);
    try {
      const selectedClassObj = classesList.find(c => c.id === newStudentClassId);
      const classNameStr = selectedClassObj?.name || "";

      console.log("Menyimpan siswa baru:", {
        name: newStudentName.trim(),
        nis: newStudentNis.trim(),
        class_id: newStudentClassId,
        class: classNameStr,
        parent_name: newStudentParentName.trim() || null,
        phone: newStudentPhone.trim() || null,
        address: newStudentAddress.trim() || null,
      });

      const { error } = await supabase
        .from('students')
        .insert({
          name: newStudentName.trim(),
          nis: newStudentNis.trim(),
          class_id: newStudentClassId,
          parent_name: newStudentParentName.trim() || null,
          phone: newStudentPhone.trim() || null,
          address: newStudentAddress.trim() || null,
        });

      if (error) {
        console.error("Supabase insert error details:", error);
        throw error;
      }

      alert("Siswa berhasil ditambahkan!");
      setIsAddStudentModalOpen(false);
      
      // Reset form
      setNewStudentName("");
      setNewStudentNis("");
      setNewStudentParentName("");
      setNewStudentPhone("");
      setNewStudentAddress("");
      setModalError(null);

      // Refresh if added to currently active class
      if (newStudentClassId === activeClassId) {
        fetchData();
      }
    } catch (err: any) {
      console.error("Gagal menambahkan siswa:", err);
      setModalError(err.message || "Gagal menambahkan siswa. Silakan coba lagi.");
    } finally {
      setIsSavingStudent(false);
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
    <div className="p-4 sm:p-6 md:p-8 lg:p-12 max-w-7xl mx-auto">
      <div className="mb-8 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-4 flex-wrap mb-2">
            <h1 className="text-3xl sm:text-4xl md:text-[3.5rem] font-black font-headline text-on-surface tracking-tight leading-none">
              {isAuthenticated ? className : "Kelas ---"}
            </h1>
            {isAuthenticated && classesList.length > 0 && (
              <select
                value={activeClassId || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) setActiveClassId(val);
                }}
                className="bg-surface-container-low border border-outline-variant/30 text-primary font-headline font-extrabold text-xs sm:text-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-surface-container-high transition-all cursor-pointer outline-none shadow-sm"
              >
                <option value="" disabled>Pilih Kelas...</option>
                {classesList.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
          </div>
          <p className="text-base sm:text-xl font-headline text-primary opacity-80 mb-4">
            {isAuthenticated ? "Kelola kehadiran siswa secara real-time" : "Silakan login untuk memproses presensi"}
          </p>
          {isAuthenticated && (
            <button
              onClick={() => {
                const defaultClassId = activeClassId || (classesList.length > 0 ? classesList[0].id : "");
                setNewStudentClassId(defaultClassId);
                setModalError(null);
                setIsAddStudentModalOpen(true);
              }}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-on-primary px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-headline font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
            >
              <Plus size={16} />
              Tambah Siswa Baru
            </button>
          )}
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

      <div className="space-y-4">
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
          students.map((student) => (
            <motion.div 
              key={student.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="group flex flex-col sm:flex-row sm:items-center bg-surface-container-lowest rounded-2xl p-4 hover:bg-surface-container-low transition-colors duration-200 gap-4 sm:gap-0"
            >
              <div className="flex items-center flex-1 w-full">
                <div className={cn(
                  "w-1.5 h-12 sm:h-16 rounded-full mr-3 sm:mr-6 transition-colors shrink-0",
                  attendance[student.id] === 'present' ? "bg-secondary" :
                  attendance[student.id] === 'sick' ? "bg-tertiary-fixed-dim" :
                  attendance[student.id] === 'absent' ? "bg-error" : "bg-surface-container-high"
                )} />
                
                <div 
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-surface-container-high overflow-hidden mr-3 sm:mr-6 relative group/photo shrink-0"
                >
                  <img 
                    className="w-full h-full object-cover" 
                    src={(student.photo_url || student.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name || "Siswa")}&background=random`) || undefined} 
                    alt={student.name || "Siswa"} 
                    key={student.photo_url || 'default'}
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes('ui-avatars.com')) {
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random`;
                      }
                    }}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-headline font-bold text-base sm:text-lg text-on-surface truncate">{student.name}</h3>
                  <p className="font-body text-xs sm:text-sm text-outline">NIS: {student.nis}</p>
                </div>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto justify-between sm:justify-end border-t border-outline-variant/10 sm:border-none pt-3 sm:pt-0">
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

      <div className="mt-12 md:mt-16 flex justify-end">
        <button 
          onClick={handleSaveAttendance}
          disabled={!isAuthenticated || students.length === 0 || isSaving} 
          className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-6 sm:px-12 py-3 sm:py-4 rounded-full font-headline font-extrabold text-sm sm:text-lg shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
          {isSaving ? "Menyimpan..." : "Simpan Absensi"}
        </button>
      </div>

      <AnimatePresence>
        {isAddStudentModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className="bg-surface-container-lowest rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl relative border border-outline-variant/15 max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setIsAddStudentModalOpen(false)}
                className="absolute right-6 top-6 p-2 text-outline hover:bg-surface-container-high rounded-full transition-colors"
                type="button"
              >
                <X size={20} />
              </button>

              <h2 className="text-3xl font-black font-headline text-on-surface mb-2">Tambah Siswa Baru.</h2>
              <p className="text-on-surface-variant text-sm mb-6">Masukkan informasi diri siswa secara lengkap.</p>

              <form onSubmit={handleAddStudent} className="space-y-4">
                {modalError && (
                  <div className="bg-error-container text-on-error-container p-4 rounded-2xl text-xs font-bold leading-relaxed flex items-start gap-2.5 border border-error/20">
                    <span className="text-lg leading-none">⚠️</span>
                    <div className="flex-1">
                      <p className="font-bold mb-1">Gagal Menyimpan Siswa</p>
                      <p className="font-normal opacity-90">{modalError}</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider">Nama Lengkap *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Contoh: Budi Santoso"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    className="bg-surface-container-low border border-outline-variant/30 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider">Nomor Induk Siswa (NIS) *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Contoh: 12345"
                    value={newStudentNis}
                    onChange={(e) => setNewStudentNis(e.target.value)}
                    className="bg-surface-container-low border border-outline-variant/30 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider">Kelas *</label>
                  <select 
                    required
                    value={newStudentClassId}
                    onChange={(e) => setNewStudentClassId(e.target.value)}
                    className="bg-surface-container-low border border-outline-variant/30 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer"
                  >
                    <option value="" disabled>Pilih Kelas...</option>
                    {classesList.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider">Nama Orang Tua/Wali (Opsional)</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Joko Widodo"
                    value={newStudentParentName}
                    onChange={(e) => setNewStudentParentName(e.target.value)}
                    className="bg-surface-container-low border border-outline-variant/30 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider">No. Telepon / Kontak (Opsional)</label>
                  <input 
                    type="tel" 
                    placeholder="Contoh: 08123456789"
                    value={newStudentPhone}
                    onChange={(e) => setNewStudentPhone(e.target.value)}
                    className="bg-surface-container-low border border-outline-variant/30 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider">Alamat Lengkap (Opsional)</label>
                  <textarea 
                    placeholder="Contoh: Jl. Merdeka No. 45, Jakarta"
                    value={newStudentAddress}
                    onChange={(e) => setNewStudentAddress(e.target.value)}
                    className="bg-surface-container-low border border-outline-variant/30 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all min-h-[80px]"
                  />
                </div>

                <div className="pt-4 flex gap-3 justify-end">
                  <button 
                    type="button"
                    onClick={() => setIsAddStudentModalOpen(false)}
                    className="px-6 py-3 border border-outline-variant/30 hover:bg-surface-container-high rounded-full font-bold text-sm text-outline transition-all"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    disabled={isSavingStudent}
                    className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
                  >
                    {isSavingStudent ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {isSavingStudent ? "Menyimpan..." : "Simpan Siswa"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
        "px-2.5 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-headline font-bold text-xs sm:text-sm shadow-sm flex items-center gap-1 sm:gap-2 transition-all",
        colorClasses[color]
      )}
    >
      <Icon size={14} className={active ? "fill-current" : ""} />
      {label}
    </button>
  );
};
