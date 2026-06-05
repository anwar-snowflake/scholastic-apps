import React, { useState, useEffect, useRef } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Trash2, 
  Save, 
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Camera,
  BookOpen,
  Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../lib/supabase";
import { cn } from "../lib/utils";

export const Settings: React.FC<{ isAuthenticated?: boolean }> = ({ isAuthenticated }) => {
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [subject, setSubject] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated]);

  const fetchUser = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      setDisplayName(user.user_metadata?.full_name || user.email?.split('@')[0] || "");
      setPhoneNumber(user.user_metadata?.phone || "");
      setSubject(user.user_metadata?.subject || "");
      setAvatarUrl(user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.full_name || user.email || "User")}&background=random`);
    }
    setIsLoading(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { 
          full_name: displayName,
          phone: phoneNumber,
          subject: subject,
          avatar_url: avatarUrl
        }
      });

      if (error) throw error;
      setMessage({ type: 'success', text: "Profil dan Mata Pelajaran berhasil diperbarui!" });
      setTimeout(() => setMessage(null), 5000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    setMessage(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to 'avatars' bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      
      // Update user metadata immediately for better UX
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });
      if (updateError) throw updateError;

      setMessage({ type: 'success', text: "Foto profil berhasil diperbarui!" });
      setTimeout(() => setMessage(null), 5000);
    } catch (err: any) {
      setMessage({ type: 'error', text: "Gagal upload: Pastikan bucket 'avatars' sudah publik di Supabase." });
    } finally {
      setIsUploading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: "Password konfirmasi tidak cocok!" });
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      setMessage({ type: 'success', text: "Password berhasil diganti!" });
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setMessage(null), 5000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm("PERINGATAN KRITIS: Apakah Anda yakin ingin menghapus akun ini? Semua data absensi dan catatan yang Anda kelola mungkin tidak dapat diakses kembali. Tindakan ini tidak dapat dibatalkan.");
    
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      alert("Untuk alasan keamanan, penghapusan akun mandiri harus dikonfirmasi melalui email atau hubungi administrator sistem.");
      await supabase.auth.signOut();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="p-12 max-w-4xl mx-auto pb-32">
      <header className="mb-12">
        <h1 className="text-5xl font-black font-headline text-on-surface mb-2">Pengaturan.</h1>
        <p className="text-on-surface-variant text-lg font-headline">Kelola identitas, foto profil, dan keamanan akun Anda.</p>
      </header>

      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              "fixed top-8 right-8 z-[100] p-6 rounded-3xl flex items-center gap-4 font-bold shadow-2xl border-2 max-w-md",
              message.type === 'success' 
                ? "bg-secondary-container text-on-secondary-container border-secondary/20" 
                : "bg-error-container text-on-error-container border-error/20"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
              message.type === 'success' ? "bg-secondary text-on-secondary" : "bg-error text-on-error"
            )}>
              {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
            </div>
            <div className="flex-1">
              <p className="text-sm">{message.text}</p>
            </div>
            <button onClick={() => setMessage(null)} className="text-xs uppercase font-black opacity-50 hover:opacity-100">Tutup</button>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center gap-4 text-outline">
          <Loader2 size={40} className="animate-spin text-primary" />
          <p className="font-bold uppercase tracking-widest text-xs">Memuat profil...</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Profile Section */}
          <section className="bg-surface-container-low rounded-[2.5rem] p-10 shadow-sm border border-outline-variant/10">
            <div className="flex flex-col md:flex-row gap-10 items-start">
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-surface-container-highest shadow-xl bg-surface-container-lowest">
                    {isUploading ? (
                      <div className="w-full h-full flex items-center justify-center bg-surface-container-high">
                        <Loader2 className="animate-spin text-primary" size={32} />
                      </div>
                    ) : (
                      avatarUrl && (
                        <img 
                          src={avatarUrl} 
                          alt="Profile" 
                          className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                        />
                      )
                    )}
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 bg-primary text-on-primary p-3 rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-all"
                  >
                    <Camera size={20} />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleAvatarUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>
                <p className="text-[10px] font-black text-outline uppercase tracking-widest">Foto Profil</p>
              </div>

              <div className="flex-1 space-y-8 w-full">
                <h3 className="font-headline text-2xl font-bold text-on-surface flex items-center gap-3">
                  <User className="text-primary" />
                  Identitas Pengajar
                </h3>
                
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-outline uppercase tracking-widest ml-4">Nama Lengkap</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={18} />
                        <input 
                          type="text" 
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full bg-surface-container-lowest border-none rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-primary outline-none text-on-surface font-semibold"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-outline uppercase tracking-widest ml-4">Mata Pelajaran</label>
                      <div className="relative">
                        <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={18} />
                        <input 
                          type="text" 
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder="Contoh: Matematika, Bahasa Inggris"
                          className="w-full bg-surface-container-lowest border-none rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-primary outline-none text-on-surface font-semibold"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-outline uppercase tracking-widest ml-4">Nomor Telepon</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={18} />
                        <input 
                          type="tel" 
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="+62..."
                          className="w-full bg-surface-container-lowest border-none rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-primary outline-none text-on-surface font-semibold"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-outline uppercase tracking-widest ml-4">Email (Read-only)</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline/30" size={18} />
                        <input 
                          type="email" 
                          value={user?.email || ""}
                          disabled
                          className="w-full bg-surface-container-lowest/50 border-none rounded-2xl pl-12 pr-4 py-4 text-outline/50 font-medium cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button 
                      type="submit"
                      disabled={isSaving}
                      className="bg-primary text-on-primary px-10 py-4 rounded-full font-bold flex items-center gap-2 hover:translate-y-[-2px] transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                      Simpan Profil
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </section>

          {/* Password Section */}
          <section className="bg-surface-container-low rounded-[2.5rem] p-10 shadow-sm border border-outline-variant/10">
            <h3 className="font-headline text-2xl font-bold mb-8 text-on-surface flex items-center gap-3">
              <Lock className="text-secondary" />
              Keamanan Password
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-outline uppercase tracking-widest ml-4">Password Baru</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    min={6}
                    className="w-full bg-surface-container-lowest border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-secondary outline-none text-on-surface"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-outline uppercase tracking-widest ml-4">Konfirmasi Password</label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    min={6}
                    className="w-full bg-surface-container-lowest border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-secondary outline-none text-on-surface"
                  />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end">
                <button 
                  type="submit"
                  disabled={isChangingPassword || !newPassword}
                  className="bg-secondary text-on-secondary px-10 py-4 rounded-full font-bold flex items-center gap-2 hover:translate-y-[-2px] transition-all shadow-lg shadow-secondary/20 disabled:opacity-50"
                >
                  {isChangingPassword ? <Loader2 size={20} className="animate-spin" /> : <Lock size={20} />}
                  Ganti Password
                </button>
              </div>
            </form>
          </section>

          {/* Danger Zone */}
          <section className="bg-error-container/5 rounded-[2.5rem] p-10 border-2 border-dashed border-error/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="font-headline text-2xl font-bold text-error flex items-center gap-3 mb-2">
                  <Trash2 size={24} />
                  Zona Bahaya
                </h3>
                <p className="text-on-error-container text-sm font-medium">Menghapus akun akan menghilangkan semua data akses Anda secara permanen.</p>
              </div>
              <button 
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="bg-error text-on-error px-8 py-4 rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-error/20 flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                Hapus Akun
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
