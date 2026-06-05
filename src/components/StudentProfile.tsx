import React, { useState, useEffect, useRef } from "react";
import { 
  IdCard, 
  School, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  Search,
  User,
  Calendar,
  Save,
  Loader2,
  Phone,
  MapPin,
  MessageSquare,
  Pencil,
  Trash2,
  X,
  Camera
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { supabase } from "../lib/supabase";
import { AttendanceStatus } from "../types";

export const StudentProfile: React.FC<{ isAuthenticated?: boolean; selectedStudentId?: string | null }> = ({ isAuthenticated, selectedStudentId }) => {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-11
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [selectedDateForNote, setSelectedDateForNote] = useState(new Date().toISOString().split('T')[0]);
  const [newNote, setNewNote] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Edit modal state
  const [classesList, setClassesList] = useState<any[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editNis, setEditNis] = useState("");
  const [editClassId, setEditClassId] = useState("");
  const [editParentName, setEditParentName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete confirmations modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Photo upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const currentYear = 2026;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedStudent) return;

    setIsUploadingPhoto(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedStudent.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // 1. Upload ke Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('student-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error("Storage Upload Error:", uploadError);
        throw new Error(`Upload Gagal: ${uploadError.message}. Pastikan Policy INSERT di Storage sudah diset.`);
      }

      // 2. Ambil Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('student-photos')
        .getPublicUrl(filePath);

      console.log("Sukses Upload! URL:", publicUrl);

      // 3. Update Tabel Students
      const { error: updateError } = await supabase
        .from('students')
        .update({ photo_url: publicUrl })
        .eq('id', selectedStudent.id);

      if (updateError) {
        console.error("Database Update Error:", updateError);
        throw new Error(`Gagal update database: ${updateError.message}`);
      }

      // 4. Update local states
      setSelectedStudent((prev: any) => prev ? { ...prev, photo_url: publicUrl } : null);
      setStudents((prev: any[]) => prev.map(s => s.id === selectedStudent.id ? { ...s, photo_url: publicUrl } : s));
      alert("Foto profil berhasil diperbarui!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUploadingPhoto(false);
      if (event.target) event.target.value = ''; // Reset input
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchStudents();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (students.length > 0 && selectedStudentId) {
      const student = students.find(s => s.id === selectedStudentId);
      if (student) setSelectedStudent(student);
    }
  }, [students, selectedStudentId]);

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentData();
    }
  }, [selectedStudent, selectedMonth]);

  useEffect(() => {
    // When selected date changes, populate the note field if a note already exists for that date
    const existingNote = notes.find(n => n.date === selectedDateForNote);
    setNewNote(existingNote?.content || "");
  }, [selectedDateForNote, notes]);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      // Fetch classes first to build a mapper of class_id -> name
      const { data: classesData } = await supabase.from('classes').select('id, name');
      const { data: studentsData } = await supabase.from('students').select('*').order('name', { ascending: true });

      const classesMap: Record<string, string> = {};
      if (classesData) {
        classesData.forEach(c => {
          classesMap[c.id] = c.name;
        });
        setClassesList(classesData);
      }

      const mappedStudents = (studentsData || []).map((student: any) => ({
        ...student,
        class: student.class_id ? (classesMap[student.class_id] || '---') : '---'
      }));

      setStudents(mappedStudents);
    } catch (err) {
      console.error("Error fetching students and classes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudentData = async () => {
    if (!selectedStudent) return;
    
    // Fetch logs for the selected month in 2026
    const firstDay = `${currentYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-01`;
    const lastDay = new Date(currentYear, selectedMonth + 1, 0).toISOString().split('T')[0];

    // Attendance Logs
    const { data: logs } = await supabase
      .from('attendance_logs')
      .select('*')
      .eq('student_id', selectedStudent.id)
      .gte('date', firstDay)
      .lte('date', lastDay);
    
    setAttendanceLogs(logs || []);

    // Notes - Only fetch and display notes that are NOT 'present'
    const { data: noteData } = await supabase
      .from('attendance_notes')
      .select('*')
      .eq('student_id', selectedStudent.id)
      .neq('type', 'present')
      .order('date', { ascending: false });
    
    setNotes(noteData || []);
  };

  const handleSaveNote = async () => {
    if (!selectedStudent) return;
    
    // Check if future date
    const today = new Date().toISOString().split('T')[0];
    if (selectedDateForNote > today) {
      alert("Anda tidak bisa menyimpan catatan untuk tanggal di masa depan.");
      return;
    }

    setIsSavingNote(true);

    try {
      // Find attendance status for the selected date if any
      const dayLog = attendanceLogs.find(l => l.date === selectedDateForNote);
      const status = dayLog?.status || 'present';

      // If status is present, we shouldn't really be saving a note according to user request
      // But if we do, it won't be shown in the timeline anyway due to the fetch filter
      const { error } = await supabase
        .from('attendance_notes')
        .upsert({
          student_id: selectedStudent.id,
          date: selectedDateForNote,
          content: newNote,
          type: status
        }, { onConflict: 'student_id,date' });

      if (error) throw error;
      
      // Refresh notes
      await fetchStudentData();
      alert("Catatan berhasil disimpan!");
    } catch (err: any) {
      alert("Gagal menyimpan catatan: " + err.message);
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleOpenEditModal = () => {
    if (!selectedStudent) return;
    setEditName(selectedStudent.name || "");
    setEditNis(selectedStudent.nis || "");
    setEditClassId(selectedStudent.class_id || "");
    setEditParentName(selectedStudent.parent_name || "");
    setEditPhone(selectedStudent.phone || "");
    setEditAddress(selectedStudent.address || "");
    setEditError(null);
    setIsEditModalOpen(true);
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);

    if (!editName.trim() || !editNis.trim() || !editClassId) {
      setEditError("Nama, NIS, dan Kelas wajib diisi!");
      return;
    }

    setIsSavingEdit(true);
    try {
      const { error } = await supabase
        .from('students')
        .update({
          name: editName.trim(),
          nis: editNis.trim(),
          class_id: editClassId,
          parent_name: editParentName.trim() || null,
          phone: editPhone.trim() || null,
          address: editAddress.trim() || null,
        })
        .eq('id', selectedStudent.id);

      if (error) throw error;

      alert("Data siswa berhasil diperbarui!");
      setIsEditModalOpen(false);

      // Refresh list of students
      await fetchStudents();

      // Find original class name
      const selectedClassObj = classesList.find(c => c.id === editClassId);
      const classNameStr = selectedClassObj?.name || '---';

      // Update selected student inside current view
      setSelectedStudent({
        ...selectedStudent,
        name: editName.trim(),
        nis: editNis.trim(),
        class_id: editClassId,
        class: classNameStr,
        parent_name: editParentName.trim() || null,
        phone: editPhone.trim() || null,
        address: editAddress.trim() || null,
      });

    } catch (err: any) {
      console.error("Gagal memperbarui data siswa:", err);
      setEditError(err.message || "Gagal memperbarui data siswa.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;
    setIsDeleting(true);
    try {
      // 1. Delete associated notes first
      const { error: notesError } = await supabase
        .from('attendance_notes')
        .delete()
        .eq('student_id', selectedStudent.id);
      
      if (notesError) throw notesError;

      // 2. Delete associated attendance logs
      const { error: logsError } = await supabase
        .from('attendance_logs')
        .delete()
        .eq('student_id', selectedStudent.id);

      if (logsError) throw logsError;

      // 3. Delete student record
      const { error: studentError } = await supabase
        .from('students')
        .delete()
        .eq('id', selectedStudent.id);

      if (studentError) throw studentError;

      alert("Data siswa berhasil dihapus!");
      setIsDeleteModalOpen(false);
      setSelectedStudent(null);
      await fetchStudents();
    } catch (err: any) {
      console.error("Gagal menghapus siswa:", err);
      alert("Gagal menghapus siswa: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.nis.includes(searchQuery)
  );

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const daysInMonth = new Date(currentYear, selectedMonth + 1, 0).getDate();
  const startDayOfMonth = new Date(currentYear, selectedMonth, 1).getDay();

  // Stats calculation
  const totalLogs = attendanceLogs.length;
  const presentCount = attendanceLogs.filter(l => l.status === 'present').length;
  const attendanceRate = totalLogs > 0 ? (presentCount / totalLogs) * 100 : 0;

  if (!selectedStudent) {
    return (
      <div className="p-4 sm:p-6 md:p-8 lg:p-12 max-w-4xl mx-auto">
        <header className="mb-8 md:mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-headline text-on-surface mb-3 md:mb-4">Profil Siswa.</h1>
          <p className="text-on-surface-variant text-sm sm:text-base md:text-lg">Cari dan pilih siswa untuk melihat detail informasi dan riwayat absensi.</p>
        </header>

        <div className="relative mb-6 md:mb-8">
          <Search className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-outline" size={20} />
          <input 
            type="text" 
            placeholder="Ketik nama atau NIS siswa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-lowest border-none rounded-2xl sm:rounded-[2rem] pl-12 sm:pl-16 pr-6 sm:pr-8 py-4 sm:py-6 text-sm sm:text-base md:text-lg shadow-sm focus:ring-4 focus:ring-primary/10 outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading ? (
            <div className="col-span-2 py-20 flex flex-col items-center gap-4 text-outline">
              <Loader2 size={40} className="animate-spin" />
              <p className="font-bold uppercase tracking-widest text-xs">Memuat data siswa...</p>
            </div>
          ) : filteredStudents.length > 0 ? (
            filteredStudents.map(student => (
              <button 
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className="flex items-center gap-4 bg-surface-container-low p-4 sm:p-6 rounded-2xl sm:rounded-3xl hover:bg-surface-container-high transition-all text-left group"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-surface-container-highest overflow-hidden shrink-0">
                  <img 
                    src={(student.photo_url || student.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name || "Siswa")}&background=random`) || undefined} 
                    alt={student.name || "Siswa"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-on-surface group-hover:text-primary transition-colors text-ellipsis overflow-hidden line-clamp-1">{student.name}</h3>
                  <p className="text-xs text-outline font-medium">NIS: {student.nis} • Kelas {student.class || '---'}</p>
                </div>
              </button>
            ))
          ) : (
            <div className="col-span-2 py-20 text-center bg-surface-container-low rounded-3xl border-2 border-dashed border-outline-variant/20 italic text-outline">
              Siswa tidak ditemukan.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-12 max-w-7xl mx-auto">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Back to selection */}
      <button 
        onClick={() => setSelectedStudent(null)}
        className="flex items-center gap-2 text-primary font-bold mb-6 md:mb-8 hover:translate-x-[-4px] transition-transform text-sm sm:text-base"
      >
        <ChevronLeft size={20} />
        Kembali ke Daftar Siswa
      </button>

      {/* Profile Header */}
      <section className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 sm:gap-8 w-full sm:w-auto">
          <div 
            onClick={isAuthenticated ? triggerUpload : undefined}
            className={cn(
              "w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden bg-surface-container-high shadow-xl rotate-[-2deg] relative group shrink-0",
              isAuthenticated && "cursor-pointer"
            )}
          >
            {isUploadingPhoto ? (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-white" />
              </div>
            ) : isAuthenticated ? (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all">
                <Camera size={32} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ) : null}
            <img 
              alt={selectedStudent.name || "Siswa"} 
              className="w-full h-full object-cover" 
              src={(selectedStudent.photo_url || selectedStudent.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStudent.name || "Siswa")}&background=random`) || undefined} 
            />
          </div>
          <div>
            <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-extrabold text-on-background tracking-tight mb-2">{selectedStudent.name}</h1>
            <div className="flex items-center justify-center sm:justify-start gap-4 text-on-surface-variant flex-wrap">
              <span className="flex items-center gap-1 font-semibold text-xs sm:text-sm">
                <IdCard size={16} className="fill-current text-primary" />
                {selectedStudent.nis}
              </span>
              <span className="w-1 h-1 bg-outline-variant rounded-full"></span>
              <span className="flex items-center gap-1 font-semibold text-xs sm:text-sm">
                <School size={16} className="text-secondary" />
                {selectedStudent.class}
              </span>
            </div>
          </div>
        </div>

        {isAuthenticated && (
          <div className="flex items-center gap-3 self-start md:self-end">
            <button
              onClick={handleOpenEditModal}
              className="flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-on-secondary px-5 py-2.5 rounded-full font-headline font-bold text-sm shadow-md transition-all active:scale-95"
            >
              <Pencil size={16} />
              Edit Profil
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center gap-2 bg-error hover:bg-error/90 text-on-error px-5 py-2.5 rounded-full font-headline font-bold text-sm shadow-md transition-all active:scale-95"
            >
              <Trash2 size={16} />
              Hapus Siswa
            </button>
          </div>
        )}
      </section>

      <div className="grid grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column: Stats & Metadata */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-surface-container-low rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-8 relative overflow-hidden">
            <div className="relative z-10">
              <p className="font-headline text-xs sm:text-sm font-bold text-secondary mb-3 md:mb-4 uppercase tracking-widest">Kesehatan Absensi</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-6xl font-headline font-black text-on-background">{attendanceRate.toFixed(0)}%</span>
                <span className="text-secondary font-bold text-xs sm:text-sm">Bulan ini</span>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 opacity-5">
              <CheckCircle2 size={160} className="fill-current" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3 sm:gap-4">
            <StatCard 
              label="Hadir" 
              value={presentCount.toString().padStart(2, '0')} 
              sub="Hari" 
              color="secondary" 
            />
            <StatCard 
              label="Alpa" 
              value={attendanceLogs.filter(l => l.status === 'absent').length.toString().padStart(2, '0')} 
              sub="Hari" 
              color="error" 
            />
            <StatCard 
              label="Sakit/Izin" 
              value={attendanceLogs.filter(l => l.status === 'sick' || l.status === 'permission').length.toString().padStart(2, '0')} 
              sub="Kasus" 
              color="tertiary" 
            />
          </div>

          <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-sm">
            <h3 className="font-headline text-base sm:text-lg font-bold mb-4 sm:mb-6 text-on-background flex items-center gap-2">
              <User size={20} className="text-primary" />
              Metadata Pribadi
            </h3>
            <div className="space-y-4">
              <MetadataRow label="Orang Tua/Wali" value={selectedStudent.parent_name || '---'} icon={User} />
              <MetadataRow label="Kontak Darurat" value={selectedStudent.phone || '---'} icon={Phone} />
              <MetadataRow label="Alamat" value={selectedStudent.address || '---'} icon={MapPin} />
            </div>
          </div>
        </div>

        {/* Right Column: Calendar & Timeline */}
        <div className="col-span-12 lg:col-span-8 space-y-6 sm:space-y-8">
          <div className="bg-surface-container-lowest rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-10 shadow-sm relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-6 sm:mb-10">
              <h2 className="font-headline text-lg sm:text-xl md:text-2xl font-bold text-on-background tracking-tight">
                Buku Besar Absensi: {monthNames[selectedMonth]} {currentYear}
              </h2>
              <div className="flex items-center gap-2 bg-surface-container-low p-1 rounded-xl">
                <button 
                  onClick={() => setSelectedMonth(m => Math.max(0, m - 1))}
                  className="p-1.5 sm:p-2 hover:bg-surface-container-highest rounded-lg transition-colors text-primary"
                >
                  <ChevronLeft size={18} sm={20} />
                </button>
                <div className="px-3 sm:px-4 text-xs sm:text-sm font-bold text-on-surface">
                  {selectedMonth + 1}
                </div>
                <button 
                  onClick={() => setSelectedMonth(m => Math.min(11, m + 1))}
                  className="p-1.5 sm:p-2 hover:bg-surface-container-highest rounded-lg transition-colors text-primary"
                >
                  <ChevronRight size={18} sm={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-y-4 sm:gap-y-6 gap-x-1 sms:gap-x-2 text-center mb-6 sm:mb-8">
              {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "SAB"].map(day => (
                <div key={day} className="text-[9px] sm:text-[10px] font-black text-outline uppercase tracking-wider sm:tracking-[0.2em]">{day}</div>
              ))}
              
              {/* Padding for start of month */}
              {Array.from({ length: startDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dStr = `${currentYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                const log = attendanceLogs.find(l => l.date === dStr);
                const status = log?.status;
                const isFuture = dStr > new Date().toISOString().split('T')[0];

                return (
                  <div key={i} className="flex justify-center">
                    <button 
                      onClick={() => {
                        if (isFuture) return;
                        setSelectedDateForNote(dStr);
                        document.getElementById('note-editor')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      disabled={isFuture}
                      className={cn(
                        "w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg sm:rounded-xl font-bold transition-all text-2xs sm:text-xs",
                        isFuture ? "opacity-10 cursor-not-allowed" : "hover:scale-110",
                        selectedDateForNote === dStr ? "ring-2 ring-primary ring-offset-2" : "",
                        status === 'present' ? "bg-secondary text-on-primary" :
                        status === 'absent' ? "bg-error text-on-primary" :
                        status === 'sick' ? "bg-tertiary-fixed-dim text-tertiary" :
                        status === 'permission' ? "bg-primary text-on-primary" :
                        "bg-surface-container text-outline opacity-40 shadow-inner"
                      )}
                    >
                      {day}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-6 sm:pt-8 border-t border-surface-container flex items-center gap-3 sm:gap-6 justify-center flex-wrap">
              <LegendItem color="bg-secondary" label="Hadir" />
              <LegendItem color="bg-tertiary-fixed-dim" label="Sakit" />
              <LegendItem color="bg-primary" label="Izin" />
              <LegendItem color="bg-error" label="Alpa" />
            </div>
            
            <div className="absolute right-0 top-0 rotate-12 translate-x-10 -translate-y-10 opacity-[0.03]">
              <Calendar size={300} />
            </div>
          </div>

          <div className="bg-surface-container-lowest p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-sm">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <h1 className="font-headline text-xl sm:text-2xl font-bold text-on-background flex items-center gap-3">
                <MessageSquare size={24} className="text-primary" />
                Timeline Catatan
              </h1>
            </div>

            {/* Note Editor */}
            {(() => {
              const currentLog = attendanceLogs.find(l => l.date === selectedDateForNote);
              const isHadir = currentLog?.status === 'present';
              
              if (isHadir) {
                return (
                  <div className="bg-surface-container-low p-10 rounded-3xl mb-10 border-2 border-dashed border-secondary/20 text-center">
                    <CheckCircle2 size={48} className="mx-auto mb-4 text-secondary/30" />
                    <p className="text-sm font-bold text-on-surface-variant mb-1">
                      Siswa Hadir pada {new Date(selectedDateForNote).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
                    </p>
                    <p className="text-xs text-outline">Catatan tidak diperlukan untuk status Hadir.</p>
                  </div>
                );
              }

              return (
                <div id="note-editor" className="bg-surface-container-low p-6 rounded-3xl mb-10 border-2 border-primary/10">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase mb-4 tracking-widest">
                    <Calendar size={14} />
                    Input Catatan: {new Date(selectedDateForNote).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <textarea 
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Tulis alasan jika siswa tidak masuk atau catatan penting lainnya..."
                    className="w-full bg-surface-container-lowest rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-primary min-h-[100px] border-none"
                  />
                  <div className="mt-4 flex justify-between items-center">
                    <p className="text-[10px] text-outline italic">
                      {selectedDateForNote === new Date().toISOString().split('T')[0] 
                        ? "*Mengisi catatan untuk hari ini" 
                        : `*Mengedit catatan untuk tanggal ${selectedDateForNote}`}
                    </p>
                    <div className="flex gap-2">
                      {selectedDateForNote !== new Date().toISOString().split('T')[0] && (
                        <button 
                          onClick={() => setSelectedDateForNote(new Date().toISOString().split('T')[0])}
                          className="text-primary text-xs font-bold hover:underline"
                        >
                          Kembali ke Hari Ini
                        </button>
                      )}
                      <button 
                        onClick={handleSaveNote}
                        disabled={isSavingNote}
                        className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
                      >
                        {isSavingNote ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {notes.find(n => n.date === selectedDateForNote) ? "Update Catatan" : "Simpan Catatan"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="space-y-4">
              {notes.length > 0 ? notes.map((note) => (
                <div key={note.id} className="flex gap-6 group">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-4 h-4 rounded-full mt-1.5 ring-4 ring-surface",
                      note.type === 'sick' ? "bg-tertiary" :
                      note.type === 'absent' ? "bg-error" : 
                      note.type === 'permission' ? "bg-primary" : "bg-secondary"
                    )} />
                    <div className="w-0.5 flex-1 bg-outline-variant/30 my-1 group-last:hidden" />
                  </div>
                  <div className="flex-1 pb-10">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.1em] text-outline">
                        {new Date(note.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <button 
                        onClick={() => {
                          setSelectedDateForNote(note.date);
                          document.getElementById('note-editor')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-primary hover:bg-primary/10 rounded transition-all text-[10px] font-bold flex items-center gap-1"
                      >
                        <Pencil size={10} /> EDIT
                      </button>
                    </div>
                    <div className="bg-surface-container-low p-4 rounded-2xl group-hover:bg-surface-container-high transition-colors">
                      <p className="text-sm font-semibold text-on-surface leading-relaxed">{note.content}</p>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="py-10 text-center italic text-outline text-sm">Belum ada riwayat catatan siswa ini.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-surface-container-lowest rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl relative border border-outline-variant/15 max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="absolute right-6 top-6 p-2 text-outline hover:bg-surface-container-high rounded-full transition-colors"
                type="button"
              >
                <X size={20} />
              </button>

              <h2 className="text-3xl font-black font-headline text-on-surface mb-2">Edit Data Siswa.</h2>
              <p className="text-on-surface-variant text-sm mb-6">Perbarui informasi profil siswa yang bersangkutan.</p>

              <form onSubmit={handleUpdateStudent} className="space-y-4">
                {editError && (
                  <div className="bg-error-container text-on-error-container p-4 rounded-2xl text-xs font-bold leading-relaxed flex items-start gap-2.5 border border-error/20">
                    <span className="text-lg leading-none">⚠️</span>
                    <div className="flex-1">
                      <p className="font-bold mb-1">Gagal Menyimpan Perubahan</p>
                      <p className="font-normal opacity-90">{editError}</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider">Nama Lengkap *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Contoh: Budi Santoso"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="bg-surface-container-low border border-outline-variant/30 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider">Nomor Induk Siswa (NIS) *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Contoh: 12345"
                    value={editNis}
                    onChange={(e) => setEditNis(e.target.value)}
                    className="bg-surface-container-low border border-outline-variant/30 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider">Kelas *</label>
                  <select 
                    required
                    value={editClassId}
                    onChange={(e) => setEditClassId(e.target.value)}
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
                    value={editParentName}
                    onChange={(e) => setEditParentName(e.target.value)}
                    className="bg-surface-container-low border border-outline-variant/30 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider">No. Telepon / Kontak (Opsional)</label>
                  <input 
                    type="tel" 
                    placeholder="Contoh: 08123456789"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="bg-surface-container-low border border-outline-variant/30 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider">Alamat Lengkap (Opsional)</label>
                  <textarea 
                    placeholder="Contoh: Jl. Merdeka No. 45, Jakarta"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="bg-surface-container-low border border-outline-variant/30 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all min-h-[80px]"
                  />
                </div>

                <div className="pt-4 flex gap-3 justify-end">
                  <button 
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-6 py-3 border border-outline-variant/30 hover:bg-surface-container-high rounded-full font-bold text-sm text-outline transition-all"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    disabled={isSavingEdit}
                    className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
                  >
                    {isSavingEdit ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {isSavingEdit ? "Menyimpan..." : "Update Siswa"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDeleteModalOpen && selectedStudent && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-surface-container-lowest rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl relative border border-outline-variant/15 text-center"
            >
              <div className="w-16 h-16 bg-error-container text-error rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                ⚠️
              </div>

              <h2 className="text-2xl font-black font-headline text-on-surface mb-2">Hapus Siswa?</h2>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
                Apakah Anda yakin ingin menghapus data siswa <strong className="text-on-surface">"{selectedStudent.name}"</strong>? 
                Seluruh riwayat presensi dan catatan siswa ini akan dihapus secara permanen dari database.
              </p>

              <div className="flex gap-4 justify-center">
                <button 
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-6 py-3 bg-surface-container-low hover:bg-surface-container-high rounded-full font-bold text-sm text-outline transition-all flex-1"
                >
                  Batal
                </button>
                <button 
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeleteStudent}
                  className="bg-error text-on-error px-6 py-3 rounded-full font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-md flex-1 disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  {isDeleting ? "Menghapus..." : "Ya, Hapus!"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({ label, value, sub, color }: { label: string, value: string, sub: string, color: string }) => (
  <div className="bg-surface-container rounded-3xl p-6 transition-all hover:bg-surface-container-high">
    <p className="text-[10px] font-black text-outline uppercase mb-2 tracking-widest">{label}</p>
    <p className={cn("text-3xl font-headline font-black", 
      color === 'secondary' ? 'text-secondary' : 
      color === 'error' ? 'text-error' : 'text-tertiary'
    )}>{value}</p>
    <p className="text-[10px] text-on-surface-variant mt-2 font-medium">{sub}</p>
  </div>
);

const MetadataRow = ({ label, value, icon: Icon }: { label: string, value: string, icon: any }) => (
  <div className="flex flex-col gap-1 py-2">
    <span className="text-[10px] font-black text-outline uppercase tracking-widest flex items-center gap-1">
      <Icon size={12} />
      {label}
    </span>
    <span className="text-sm font-bold text-on-surface leading-tight">{value}</span>
  </div>
);

const LegendItem = ({ color, label }: { color: string, label: string }) => (
  <div className="flex items-center gap-2">
    <span className={cn("w-3 h-3 rounded-sm", color)}></span>
    <span className="text-[10px] font-black text-outline uppercase tracking-wider">{label}</span>
  </div>
);
