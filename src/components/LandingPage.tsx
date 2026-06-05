import React, { useState } from "react";
import { Bell, HelpCircle, CheckCircle, Zap, BarChart2, MessageSquare, LogIn, X, Globe, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Login } from "./Login";

interface LandingPageProps {
  onLoginSuccess: (session: any) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginSuccess }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background font-body selection:bg-primary-fixed selection:text-primary w-full relative overflow-x-hidden flex flex-col">
      {/* Top Navigation Bar */}
      <nav id="landing-navbar" className="bg-white/70 backdrop-blur-md font-headline font-bold text-lg sticky top-0 z-40 shadow-sm shadow-blue-900/5 flex justify-between items-center w-full px-4 sm:px-8 py-3 border-b border-outline-variant/15">
        <div id="brand-logo" className="font-headline font-black text-xl sm:text-2xl tracking-tight text-primary">
          Scholastic
        </div>
        
        <div id="nav-links" className="hidden md:flex gap-8 items-center text-sm">
          <a id="link-beranda" className="text-primary font-bold border-b-2 border-primary pb-1" href="#beranda">Beranda</a>
          <a id="link-fitur" className="text-slate-500 hover:text-primary transition-colors font-semibold" href="#fitur" onClick={(e) => handleSmoothScroll(e, "fitur")}>Fitur</a>
          <a id="link-cara-kerja" className="text-slate-500 hover:text-primary transition-colors font-semibold" href="#cara-kerja" onClick={(e) => handleSmoothScroll(e, "cara-kerja")}>Cara Kerja</a>
        </div>

        <div id="nav-actions" className="flex items-center gap-2 sm:gap-4">
          <button 
            id="btn-nav-login"
            onClick={() => setShowLoginModal(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary-container text-on-primary px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <LogIn size={16} />
            <span>Masuk</span>
          </button>
          
          <img 
            id="avatar-placeholder"
            alt="Administrator Profile" 
            className="w-8 h-8 rounded-full border border-outline-variant/30 hidden sm:block shadow-sm" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHklEBysLYtbkfF0mI89Z3-rnCWHnak3rg4G9XUUL7D5tHtALAkutpoQfQ7mTtJiYyjSMdXiiiqbvshPkNIhFY83LK0MJ6DNS68jYWbwUuwtF5UEqzd9T9K_KvPi_VaWDcaVHmHheWg-uRnsBYMh6qeq_T99l1P6zEl_M2rsq-mgWsTwy8bTVdIOwAbLMJZ5xutB8qpPh256jRjJvS_ANS_2m41H0a-ldyPJH3BkkjnS45ffiWlQCy-2mOAyGC-XSJbMfeWiZOGSGf"
          />
        </div>
      </nav>

      {/* Hero Section */}
      <section id="beranda" className="relative min-h-[750px] lg:min-h-[850px] flex items-center overflow-hidden px-4 sm:px-8 py-16 lg:py-24">
        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div id="hero-left-content" className="z-10">
            <span id="academic-tag" className="inline-block py-1 px-3.5 rounded-full bg-primary-fixed text-primary text-xs sm:text-sm font-bold mb-6 tracking-wide shadow-sm border border-primary/10">
              EDISI AKADEMIK 2026
            </span>
            <h1 id="hero-main-title" className="font-headline font-extrabold text-4xl sm:text-5xl lg:text-7xl text-primary leading-tight mb-6">
              Revolusi Manajemen Kehadiran Akademik
            </h1>
            <p id="hero-description" className="font-body text-base sm:text-lg lg:text-xl text-on-surface-variant leading-relaxed mb-10 max-w-lg">
              Pendekatan editorial "The Scholastic" untuk data sekolah. Ubah entri data yang kaku menjadi pengalaman kurasi yang tenang, berwibawa, dan sangat terukur.
            </p>
            <div id="hero-cta-wrapper" className="flex flex-col sm:flex-row gap-4">
              <button 
                id="btn-hero-get-started"
                onClick={() => setShowLoginModal(true)}
                className="bg-gradient-to-r from-primary to-primary-container hover:from-primary-container hover:to-primary text-on-primary px-8 py-4 rounded-2xl font-black text-lg shadow-xl hover:scale-95 transition-all duration-200 cursor-pointer"
              >
                Mulai Sekarang
              </button>
            </div>
          </div>
          
          <div id="hero-right-visual" className="relative flex justify-center">
            <div className="absolute -top-10 lg:-top-20 -right-10 lg:-right-20 w-72 lg:w-96 h-72 lg:h-96 bg-primary-container/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-48 sm:w-64 h-48 sm:h-64 bg-secondary-container/20 rounded-full blur-3xl"></div>
            
            <div className="relative bg-white/70 backdrop-blur-md border border-white/40 p-4 sm:p-6 rounded-[2rem] shadow-2xl hover:rotate-0 lg:rotate-3 transition-transform duration-500 max-w-md lg:max-w-xl">
              <img 
                id="hero-dashboard-preview"
                alt="Scholastic Dashboard" 
                className="rounded-[1.5rem] w-full object-cover aspect-[4/3] shadow-inner" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCejS24C-Qhas9tghXXr1J7uQdBhZm8Ap17SorPbou_BHkYOUPo1wdoZ05eUOS4VrVXHCzfhw0-qg1_bZFum36ZylpQfpjyY5UdE26sYuBWdkSzAbxBPgj-YrKXKFxYT0M5y3hDXNCfavnpv1rTyYsi83CRDwqaoytYP8QHmqlNM0MpYk_vOeBf9_g6-G7hBKQL_3v9swZe6cdWJFqIPNfAx_Hq80ZwG-DKYqgE1Iv8Xq2tJMlsUZviIq3gJpWjIJ07UCjY7CC8f48D"
              />
              <div id="statistics-status-badge" className="absolute -bottom-4 -right-2 sm:-right-4 bg-white p-3 sm:p-4 rounded-2xl shadow-2xl border border-surface-container select-none">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-white">
                    <CheckCircle size={20} className="stroke-[3]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Kehadiran Hari Ini</p>
                    <p className="text-sm sm:text-base font-black text-on-background">98.5% Selesai</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section: Bento Grid */}
      <section id="fitur" className="py-20 lg:py-24 px-4 sm:px-8 bg-surface-container-lowest border-y border-outline-variant/10">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 id="feature-title" className="font-headline font-extrabold text-3xl sm:text-4xl text-primary mb-4">
              Fitur Utama untuk Kurator Akademik
            </h2>
            <p id="feature-subtitle" className="text-on-surface-variant font-medium text-sm sm:text-base max-w-2xl mx-auto">
              Dirancang untuk kecepatan dan presisi tanpa mengabaikan aspek estetika ruang kerja digital Anda.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Large Feature Card */}
            <div id="feature-card-quick" className="md:col-span-2 bg-surface-container rounded-[2rem] p-6 sm:p-10 flex flex-col justify-between hover:bg-surface-container-high transition-colors group border border-outline-variant/5">
              <div>
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-on-primary mb-6 shadow-md shadow-primary/10">
                  <Zap size={22} />
                </div>
                <h3 className="font-headline font-bold text-2xl sm:text-3xl mb-4 text-on-background">Input Absensi Cepat</h3>
                <p className="text-on-surface-variant text-base sm:text-lg leading-relaxed mb-8 max-w-md">
                  Gunakan "Attendance Pulse Chips" untuk mencatat kehadiran satu kelas dalam hitungan detik. Antarmuka tanpa garis kami mengurangi beban kognitif pengajar secara maksimal.
                </p>
              </div>
              <img 
                id="img-feature-pulse"
                alt="Quick Attendance" 
                className="rounded-2xl h-48 sm:h-64 w-full object-cover group-hover:scale-[1.01] transition-transform duration-500 border border-outline-variant/10" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDg3BYhs1-c9zlWgfOZr2NOvQ_kW2Eb0j3zbmM2M58xJq5jNnPwhUbVQLWSkpW1_e_d6cRb2Rc9HUQGAE6paDxJ5qtEjj_dIIOIv-v9N08yT18GFD7n38lmkcoKadvUm2RpdMnBhPf0QxXSVu3hQy6Wqg1V7-R9MP6WaJI48vlKAHm00RMSC9ntjAbgUIcZpnQigmgaUx3v0YNbaf0P5kWpvtqRCT2lHH-Xmw7kaqr7_cEvXmYcB3BiI-rvbjXJA93d3Q8IC812YBoH"
              />
            </div>
            
            {/* Secondary Feature Card */}
            <div id="feature-card-analytics" className="bg-primary-container text-on-primary-container rounded-[2rem] p-6 sm:p-10 flex flex-col justify-between hover:bg-primary transition-colors duration-300 border border-primary-container shadow-lg shadow-primary-container/10">
              <div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                  <BarChart2 size={22} className="text-on-primary" />
                </div>
                <h3 className="font-headline font-bold text-xl sm:text-2xl mb-4 text-white">Laporan Analitik Otomatis</h3>
                <p className="text-white/85 mb-8 text-sm sm:text-base leading-relaxed">
                  Dapatkan wawasan instan tentang tren kehadiran. Laporan kami menggunakan tipografi editorial yang indah untuk menyajikan data yang mudah dicerna secara komprehensif.
                </p>
              </div>
              <div id="visual-bars" className="h-32 bg-white/10 rounded-2xl flex items-end p-4 gap-2 border border-white/5">
                <div className="w-full bg-white/40 h-[60%] rounded-t-lg transition-all hover:h-[75%]"></div>
                <div className="w-full bg-white/40 h-[85%] rounded-t-lg transition-all hover:h-[95%]"></div>
                <div className="w-full bg-white/60 h-[45%] rounded-t-lg transition-all hover:h-[60%]"></div>
                <div className="w-full bg-white/85 h-[95%] rounded-t-lg transition-all hover:h-[100%]"></div>
                <div className="w-full bg-white/40 h-[70%] rounded-t-lg transition-all hover:h-[80%]"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works: Asymmetric Layout */}
      <section id="cara-kerja" className="py-20 lg:py-24 px-4 sm:px-8">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="w-full md:w-1/2">
              <h2 id="how-it-works-title" className="font-headline font-extrabold text-3xl sm:text-4xl text-primary mb-12">
                Kesederhanaan yang Terkurasi
              </h2>
              <div className="space-y-12">
                <div className="flex gap-6">
                  <div className="text-4xl font-headline font-black text-primary/20">01</div>
                  <div>
                    <h4 className="font-bold text-lg sm:text-xl mb-2 text-on-surface">Impor Data Siswa</h4>
                    <p className="text-on-surface-variant text-sm sm:text-base">
                      Sinkronisasi mudah dengan sistem manajemen sekolah Anda yang sudah ada atau unggah via CSV cerdas kami dengan satu klik cepat.
                    </p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="text-4xl font-headline font-black text-primary/20">02</div>
                  <div>
                    <h4 className="font-bold text-lg sm:text-xl mb-2 text-on-surface">Catat dengan Sekali Ketuk</h4>
                    <p className="text-on-surface-variant text-sm sm:text-base">
                      Gunakan antarmuka "Pulse" yang dioptimalkan untuk desktop dan tablet untuk mencatat kehadiran harian siswa secara presisi.
                    </p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="text-4xl font-headline font-black text-primary/20">03</div>
                  <div>
                    <h4 className="font-bold text-lg sm:text-xl mb-2 text-on-surface">Analisis &amp; Bagikan</h4>
                    <p className="text-on-surface-variant text-sm sm:text-base">
                      Hasilkan laporan PDF premium atau dashboard interaktif bertenaga AI untuk kepala sekolah dan dewan pembina secara otomatis.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-1/2 relative">
              <div className="bg-surface-container-high rounded-[3rem] w-full h-[380px] sm:h-[500px] flex items-center justify-center p-4 sm:p-8 border border-outline-variant/15">
                <img 
                  id="img-educators-collaboration"
                  alt="Process Workflow" 
                  className="rounded-[2rem] w-full h-full object-cover shadow-2xl hover:grayscale-0 transition-all duration-700" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3UNCAEt_g3ZVEgut3tdLSidA6L9R8YvHrZdQWDmOk5MphggYzZkORj684V3ZqDnQVT8nHHinH5toJVUsjOAGmJq5DHzg8tcsIIVa80hPFUXbV5AwyTgH60KhKpavmWGem3oXJikky1FGLPddggF18PU0SAlDcSswbuolO0QAdjTAd9-Qa8IxUxK1f7vMSaUDSGGZcVnLAvGA6LUCaPBmKMmqKAPJ6KF8Y038OOKIO8DbWeTJ0JwTF5lB73n6NGvMfH5kxTz_-i5QW"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta-section" className="py-16 sm:py-24 px-4 sm:px-8">
        <div className="container mx-auto bg-surface-container rounded-[2.5rem] p-8 sm:p-12 lg:p-24 text-center relative overflow-hidden border border-outline-variant/20 shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/10 rounded-full -mr-32 -mt-32 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-container/10 rounded-full -ml-32 -mb-32 blur-2xl"></div>
          
          <h2 id="cta-title" className="font-headline font-extrabold text-3xl sm:-text-4xl lg:text-6xl text-primary mb-6 sm:mb-8 relative z-10 leading-tight">
            Siap Menjadi Kurator Akademik?
          </h2>
          <p id="cta-subtitle" className="text-base sm:text-lg lg:text-xl text-on-surface-variant mb-10 max-w-2xl mx-auto relative z-10 leading-relaxed">
            Bergabunglah dengan ribuan sekolah yang telah memodernisasi manajemen kehadiran mereka. Dapatkan akses penuh selama 14 hari tanpa biaya sama sekali.
          </p>
          <button 
            id="btn-cta-get-started"
            onClick={() => setShowLoginModal(true)}
            className="bg-gradient-to-r from-primary to-primary-container text-on-primary px-10 py-4 rounded-xl font-black text-lg sm:text-xl shadow-xl hover:scale-105 transition-transform relative z-10 cursor-pointer"
          >
            Mulai Uji Coba Gratis
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer id="landing-footer" className="bg-surface-container-highest py-16 px-4 sm:px-8 shrink-0 mt-auto border-t border-outline-variant/25">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-sm">
          <div className="col-span-1 md:col-span-2">
            <div id="footer-logo" className="font-headline font-black text-2xl tracking-tight text-primary mb-6">
              Scholastic
            </div>
            <p id="footer-description" className="text-on-surface-variant max-w-sm mb-8 leading-relaxed font-medium">
              Sistem manajemen kehadiran yang mengedepankan estetika editorial dan presisi data untuk institusi pendidikan modern di seluruh penjuru tanah air.
            </p>
            <div id="footer-social-links" className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center hover:bg-primary hover:text-white transition-colors border border-outline-variant/10 shadow-sm" title="Website">
                <Globe size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center hover:bg-primary hover:text-white transition-colors border border-outline-variant/10 shadow-sm" title="Bagikan">
                <Share2 size={18} />
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-on-background mb-6 uppercase tracking-wider text-xs">Produk</h4>
            <ul className="space-y-4 text-on-surface-variant font-medium">
              <li><a href="#fitur" onClick={(e) => handleSmoothScroll(e, "fitur")} className="hover:text-primary transition-colors">Fitur Utama</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Studi Kasus</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Harga</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Pembaruan</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-on-background mb-6 uppercase tracking-wider text-xs">Dukungan</h4>
            <ul className="space-y-4 text-on-surface-variant font-medium">
              <li><a href="#" className="hover:text-primary transition-colors">Pusat Bantuan</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Panduan Guru</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Keamanan Data</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Hubungi Kami</a></li>
            </ul>
          </div>
        </div>
        
        <div id="footer-bottom-info" className="container mx-auto mt-16 pt-8 border-t border-outline-variant/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p id="copyright-text" className="text-on-surface-variant text-xs font-semibold">
            © {new Date().getFullYear()} Scholastic. Seluruh hak cipta dilindungi.
          </p>
          <div id="legal-links" className="flex gap-8 text-xs font-semibold text-on-surface-variant">
            <a href="#" className="hover:text-primary transition-colors">Kebijakan Privasi</a>
            <a href="#" className="hover:text-primary transition-colors">Syarat &amp; Ketentuan</a>
          </div>
        </div>
      </footer>

      {/* Slide-in Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <div id="login-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
              className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md z-10"
            >
              <button 
                id="btn-close-login-modal"
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 bg-surface-container-low text-on-surface-variant p-2 rounded-full hover:bg-surface-container-high transition-colors shadow-sm cursor-pointer z-20"
                title="Tutup"
              >
                <X size={16} />
              </button>
              <Login onLoginSuccess={onLoginSuccess} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
