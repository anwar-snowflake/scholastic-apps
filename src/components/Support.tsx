import React, { useState } from "react";
import { 
  Plus, 
  Minus, 
  MessageSquare, 
  ChevronRight, 
  ShieldCheck, 
  FileText,
  Mail,
  ExternalLink,
  Instagram,
  Github,
  Globe,
  User,
  GraduationCap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  // Getting Started
  {
    category: "Panduan Dasar",
    question: "Bagaimana cara mencatat kehadiran siswa?",
    answer: "Buka tab 'Kehadiran' di sidebar, pilih tanggal, lalu klik pada status kehadiran (H, S, I, A) untuk setiap siswa. Sistem akan otomatis menyimpan perubahan tersebut."
  },
  {
    category: "Panduan Dasar",
    question: "Mengapa saya tidak bisa mengisi catatan untuk status Hadir?",
    answer: "Sesuai aturan sistem, catatan hanya diwajibkan untuk siswa yang Sakit, Izin, atau Alpa (tidak hadir). Untuk siswa yang Hadir, sistem menganggap tidak ada laporan khusus yang diperlukan."
  },
  {
    category: "Panduan Dasar",
    question: "Apakah saya bisa mengubah data kehadiran di masa lalu?",
    answer: "Ya, Anda dapat menavigasi kalender ke tanggal sebelumnya untuk mengedit catatan atau status kehadiran. Namun, Anda tidak dapat mengisi data untuk tanggal di masa depan."
  },
  
  // AI Features
  {
    category: "Fitur AI",
    question: "Apa itu 'Mode Berpikir Tinggi' pada asisten AI?",
    answer: "Mode Berpikir Tinggi menggunakan model Gemini 3.1 Pro untuk memberikan analisis yang lebih mendalam, seperti merumuskan strategi pengajaran untuk siswa yang sering absen atau menganalisis tren performa kelas secara kompleks."
  },
  {
    category: "Fitur AI",
    question: "Apakah analisis AI saya bersifat pribadi?",
    answer: "Ya, pertanyaan dan analisis di dalam asisten AI hanya dapat diakses oleh akun Anda dan tidak dibagikan kepada guru lain."
  },

  // Account & Technical
  {
    category: "Akun & Teknis",
    question: "Bagaimana cara mengganti foto profil dan mata pelajaran?",
    answer: "Buka menu 'Pengaturan', Anda akan menemukan area foto profil dengan ikon kamera untuk unggah foto baru, serta kolom untuk mengisi mata pelajaran yang Anda ampu."
  },
  {
    category: "Akun & Teknis",
    question: "Apakah sistem ini bisa digunakan secara offline?",
    answer: "The Scholastic saat ini berbasis cloud untuk memastikan sinkronisasi data antar perangkat. Anda memerlukan koneksi internet untuk menyimpan dan melihat data terbaru."
  }
];

const categories = ["Panduan Dasar", "Fitur AI", "Akun & Teknis", "Kebijakan", "Author"];

export const Support: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("Panduan Dasar");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const filteredFaqs = faqs.filter(faq => faq.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-12 lg:p-24">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-20">
        
        {/* Left Side: Header and Categories */}
        <div className="lg:w-1/3">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="sticky top-24"
          >
            <h1 className="text-6xl font-black font-headline text-on-surface mb-6">FAQs</h1>
            <p className="text-outline text-lg font-medium leading-relaxed mb-10">
              Semua yang perlu Anda ketahui tentang fitur, akun, dan kebijakan The Scholastic.
            </p>

            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setExpandedIndex(0);
                  }}
                  className={cn(
                    "px-6 py-3 rounded-full border border-on-surface text-sm font-bold transition-all whitespace-nowrap",
                    activeCategory === cat 
                      ? "bg-on-surface text-surface" 
                      : "bg-transparent text-on-surface hover:bg-on-surface/5"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Side: Content */}
        <div className="lg:w-2/3 flex flex-col gap-12">
          {activeCategory === "Kebijakan" ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-outline-variant/30">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                    <ShieldCheck size={28} />
                  </div>
                  <h2 className="text-2xl font-black font-headline">Kebijakan Privasi</h2>
                </div>
                <div className="prose prose-slate text-outline leading-relaxed space-y-4">
                  <p>Kami sangat menjaga kerahasiaan data siswa dan profil pengajar. Data kehadiran hanya digunakan untuk keperluan internal instansi Anda.</p>
                  <ul className="list-disc pl-5 space-y-2 font-medium">
                    <li>Semua data dienkripsi dengan standar keamanan tinggi.</li>
                    <li>Sistem tidak menjual data pengguna kepada pihak ketiga.</li>
                    <li>Anda memiliki kontrol penuh untuk menghapus data akun Anda.</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-outline-variant/30">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center">
                    <FileText size={28} />
                  </div>
                  <h2 className="text-2xl font-black font-headline">Syarat & Ketentuan</h2>
                </div>
                <div className="prose prose-slate text-outline leading-relaxed space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-black text-on-surface">1. Ketentuan Umum</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm font-medium">
                      <li>Sistem ini digunakan untuk mencatat kehadiran siswa secara digital oleh guru.</li>
                      <li>Akses sistem hanya diperuntukkan bagi guru atau tenaga pendidik yang memiliki akun resmi dari sekolah/institusi.</li>
                      <li>Seluruh aktivitas dalam sistem akan terekam untuk kepentingan administrasi akademik.</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-black text-on-surface">2. Kewajiban Guru</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm font-medium">
                      <li>Guru wajib melakukan pengisian absensi siswa sesuai jadwal pembelajaran.</li>
                      <li>Guru bertanggung jawab atas keakuratan data kehadiran yang diinput.</li>
                      <li>Akun tidak boleh dipinjamkan atau digunakan oleh pihak lain tanpa izin.</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-black text-on-surface">3. Pengisian & Validasi Absensi</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm font-medium">
                      <li>Absensi siswa harus diisi secara real-time atau sesuai dengan waktu kegiatan belajar mengajar berlangsung.</li>
                      <li>Guru wajib memastikan status kehadiran (hadir, izin, sakit, alpa, dll.) sesuai kondisi sebenarnya.</li>
                      <li>Sistem dapat menyimpan waktu dan aktivitas input sebagai bentuk validasi.</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-black text-on-surface">4. Larangan & Pelanggaran</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm font-medium">
                      <li>Dilarang melakukan manipulasi data kehadiran siswa.</li>
                      <li>Setiap bentuk penyalahgunaan sistem dapat dikenakan sanksi sesuai kebijakan sekolah.</li>
                      <li>Pihak pengelola berhak meninjau dan mengoreksi data jika ditemukan ketidaksesuaian.</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-black text-on-surface">5. Privasi & Data</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm font-medium">
                      <li>Data siswa dan guru akan dijaga kerahasiaannya dan hanya digunakan untuk keperluan akademik.</li>
                      <li>Sistem berhak menyimpan dan mengelola data sesuai kebutuhan operasional sekolah.</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-black text-on-surface">6. Perubahan Ketentuan</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm font-medium">
                      <li>Syarat dan ketentuan dapat diperbarui sewaktu-waktu oleh pihak sekolah.</li>
                      <li>Guru disarankan untuk membaca pembaruan secara berkala.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : activeCategory === "Author" ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-on-surface text-surface p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-12 opacity-5 -mr-12 -mt-12 rotate-12">
                <GraduationCap size={300} />
              </div>

              <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full bg-surface-container-low/20 overflow-hidden border-2 border-surface/20 flex items-center justify-center">
                    <User size={48} className="text-surface" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-black font-headline">Anwar</h2>
                    <p className="text-surface/60 font-headline uppercase tracking-widest text-sm font-black mt-1">Lead Developer</p>
                  </div>
                </div>

                <p className="text-lg leading-relaxed text-surface font-medium max-w-lg">
                  Halo! Saya adalah pengembang di balik The Scholastic. Platform ini dibangun untuk memberdayakan guru dengan teknologi AI dalam mengelola administrasi kelas.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <a 
                    href="https://www.instagram.com/answeerrrs/" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-4 p-5 bg-surface/10 rounded-2xl hover:bg-surface/20 transition-all border border-surface/5 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Instagram size={20} />
                    </div>
                    <span className="font-bold">Instagram</span>
                  </a>

                  <a 
                    href="https://github.com/anwar-snowflake" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-4 p-5 bg-surface/10 rounded-2xl hover:bg-surface/20 transition-all border border-surface/5 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-surface/20 text-surface flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Github size={20} />
                    </div>
                    <span className="font-bold">GitHub</span>
                  </a>

                  <a 
                    href="https://linktr.ee/kharismanwar" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-4 p-5 bg-surface/10 rounded-2xl hover:bg-surface/20 transition-all border border-surface/5 group col-span-full"
                  >
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Globe size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold">Linktree</p>
                      <p className="text-[10px] text-surface/50 font-black uppercase tracking-widest leading-none mt-1">Connect with me</p>
                    </div>
                    <ExternalLink size={16} className="text-surface/30" />
                  </a>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {filteredFaqs.map((faq, idx) => (
                <div 
                  key={idx}
                  className="border-b border-outline-variant/10 py-6"
                >
                  <button 
                    onClick={() => toggleAccordion(idx)}
                    className="w-full flex items-center justify-between text-left group"
                  >
                    <span className={cn(
                      "text-xl font-bold font-headline transition-colors",
                      expandedIndex === idx ? "text-primary" : "text-on-surface group-hover:text-primary/70"
                    )}>
                      {faq.question}
                    </span>
                    <div className={cn(
                      "transition-transform duration-300",
                      expandedIndex === idx ? "rotate-180" : ""
                    )}>
                      {expandedIndex === idx ? <Minus size={24} className="text-outline" /> : <Plus size={24} className="text-outline" />}
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {expandedIndex === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p className="mt-4 text-outline leading-relaxed pr-10 text-lg">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}

          {/* Contact Support Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white p-10 lg:p-14 rounded-[3rem] shadow-sm border border-outline-variant/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-12 text-primary/5 -mr-8 -mt-8">
              <MessageSquare size={120} strokeWidth={3} />
            </div>
            
            <div className="relative z-10">
              <h3 className="text-3xl font-black font-headline mb-4">Masih punya pertanyaan?</h3>
              <p className="text-outline text-lg mb-10 max-w-md">
                Hubungi tim bantuan kami dan kami akan memastikan semuanya menjadi jelas dan intuitif bagi Anda!
              </p>
              
              <a 
                href="mailto:anwarftsnowflake@gmail.com"
                className="bg-[#6D5AFE] text-white w-fit px-10 py-4 rounded-2xl font-bold hover:translate-y-[-2px] transition-all shadow-xl shadow-[#6D5AFE]/30 flex items-center gap-3"
              >
                Hubungi Bantuan
                <ChevronRight size={20} />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
