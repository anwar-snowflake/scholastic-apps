/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { Dashboard } from "./components/Dashboard";
import { Attendance } from "./components/Attendance";
import { Reports } from "./components/Reports";
import { StudentProfile } from "./components/StudentProfile";
import { Settings } from "./components/Settings";
import { Support } from "./components/Support";
import { Login } from "./components/Login";
import { SearchResults } from "./components/SearchResults";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { Brain, Sparkles, X, Loader2, LogOut, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "./lib/supabase";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: Date;
}

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const extractUserData = (sessionUser: any) => ({
    id: sessionUser.id,
    email: sessionUser.email,
    name: sessionUser.user_metadata.full_name || sessionUser.email?.split('@')[0],
    avatar_url: sessionUser.user_metadata.avatar_url,
    subject: sessionUser.user_metadata.subject
  });
  
  const [isThinkingModalOpen, setIsThinkingModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "Halo! Saya adalah Asisten Akademik AI 'The Scholastic'. Tanyakan apa saja tentang data kehadiran, rekapitulasi kelas, pola perilaku siswa, atau butuh saran pengajaran di kelas Anda.",
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isLoading, isThinkingModalOpen]);

  // Check login session on mount with Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(extractUserData(session.user));
        setIsAuthenticated(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(extractUserData(session.user));
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLoginSuccess = (session: any) => {
    setUser(extractUserData(session.user));
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Kita tidak menghapus selectedClassId agar filter tetap aktif saat pindah tab
    // Namun kita tetap reset selectedStudentId jika pindah ke tab selain 'students'
    if (tab !== 'students') {
      setSelectedStudentId(null);
    }
  };

  const handleThinkingQuery = async () => {
    const currentQuery = query.trim();
    if (!currentQuery || !isAuthenticated) return;
    setQuery(""); // Clear the input field immediately
    
    // Tambahkan pesan user ke chatMessages
    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: currentQuery,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: currentQuery,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
          systemInstruction: "Anda adalah asisten akademik cerdas untuk platform 'The Scholastic'. Bantu guru menganalisis data kehadiran, memberikan saran pedagogis, atau menjawab pertanyaan kompleks tentang kurikulum. Jawab dalam Bahasa Indonesia yang profesional namun hangat."
        }
      });
      
      const newAssistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: response.text || "Maaf, saya tidak bisa memproses permintaan tersebut.",
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, newAssistantMessage]);
    } catch (error) {
      console.error("Gemini Error:", error);
      const errMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: "Terjadi kesalahan saat menghubungi AI. Pastikan API Key sudah terpasang.",
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (searchQuery.trim()) {
      return (
        <SearchResults 
          query={searchQuery} 
          onSelect={(type, id) => {
            setSearchQuery("");
            if (type === 'student') {
              setSelectedStudentId(id);
              setActiveTab("students");
            } else if (type === 'class') {
              setSelectedClassId(id);
              setActiveTab("attendance");
            }
          }} 
        />
      );
    }
    // Jika tidak login, tampilkan versi "data kosong" dari komponen
    const dataMultiplier = isAuthenticated ? 1 : 0;

    switch (activeTab) {
      case "dashboard": return <Dashboard isAuthenticated={isAuthenticated} user={user} onTabChange={handleTabChange} selectedClassId={selectedClassId} onClassChange={setSelectedClassId} />;
      case "attendance": return <Attendance isAuthenticated={isAuthenticated} selectedClassId={selectedClassId} />;
      case "reports": return <Reports isAuthenticated={isAuthenticated} selectedClassId={selectedClassId} />;
      case "students": return <StudentProfile isAuthenticated={isAuthenticated} selectedStudentId={selectedStudentId} />;
      case "settings": return <Settings isAuthenticated={isAuthenticated} />;
      case "help": return <Support />;
      default: return <Dashboard isAuthenticated={isAuthenticated} user={user} onClassChange={setSelectedClassId} />;
    }
  };

  return (
    <div className="min-h-screen bg-surface flex print:block">
      <div className="print:hidden">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            handleTabChange(tab);
            setIsSidebarOpen(false);
          }}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>
      
      <main className="flex-1 ml-0 lg:ml-64 min-h-screen flex flex-col print:ml-0 print:block">
        <div className="sticky top-0 z-40 bg-surface flex flex-col print:hidden">
          <TopBar user={user} onSearch={handleSearch} onMenuToggle={() => setIsSidebarOpen(true)} />
          {isAuthenticated && (
            <div className="px-4 sm:px-8 py-2 bg-surface-container-low border-b border-outline-variant/10 flex justify-end">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-xs font-bold text-outline hover:text-error transition-colors uppercase tracking-widest"
              >
                <LogOut size={14} />
                Keluar ({user?.name})
              </button>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto relative print:overflow-visible">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="print:opacity-100 print:transform-none"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>

          {/* Overlay Login jika belum login */}
          {!isAuthenticated && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-surface/60 backdrop-blur-[2px] print:hidden">
              <Login onLoginSuccess={handleLoginSuccess} />
            </div>
          )}
        </div>

        {/* Footer Sederhana */}
        <footer className="py-6 px-8 border-t border-outline-variant/10 bg-surface-container-low text-center text-xs text-outline print:hidden shrink-0 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-medium">
            <p>© {new Date().getFullYear()} Scholastic. Semua hak dilindungi undang-undang.</p>
            <div className="flex gap-4">
              <span className="text-outline/60">Sistem Informasi Kurasi & Presensi Akademik</span>
            </div>
          </div>
        </footer>
      </main>

      {/* AI Thinking Mode Trigger */}
      {isAuthenticated && (
        <button 
          onClick={() => setIsThinkingModalOpen(true)}
          className="fixed bottom-6 right-6 lg:right-auto lg:left-74 w-14 h-14 bg-on-surface text-surface rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-50 group print:hidden"
        >
          <Brain size={24} className="group-hover:animate-pulse" />
        </button>
      )}
      {/* AI Modal */}
      <AnimatePresence>
        {isThinkingModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsThinkingModalOpen(false)}
              className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-surface-container-lowest w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-surface-container flex justify-between items-center bg-on-surface text-surface shrink-0">
                <div className="flex items-center gap-3">
                  <Sparkles size={20} className="text-secondary-container animate-pulse" />
                  <div>
                    <h3 className="font-headline text-lg font-bold">Asisten Akademik AI</h3>
                    <p className="text-[10px] text-surface/70 font-medium">Model Berpikir Tinggi Aktif</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {chatMessages.length > 1 && (
                    <button 
                      onClick={() => setChatMessages([
                        {
                          id: "welcome",
                          sender: "assistant",
                          text: "Halo! Saya adalah Asisten Akademik AI 'The Scholastic'. Tanyakan apa saja tentang data kehadiran, rekapitulasi kelas, pola perilaku siswa, atau butuh saran pengajaran di kelas Anda.",
                          timestamp: new Date()
                        }
                      ])}
                      title="Bersihkan Obrolan"
                      className="hover:bg-white/10 text-surface/80 hover:text-surface p-2 rounded-full transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  <button onClick={() => setIsThinkingModalOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition-all">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-surface-container-lowest min-h-[300px]">
                {chatMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-on-surface text-surface flex items-center justify-center shrink-0 self-start shadow-sm mt-0.5">
                        <Brain size={16} />
                      </div>
                    )}
                    <div 
                      className={`relative px-4 py-3 rounded-2xl max-w-[80%] shadow-sm leading-relaxed text-sm ${
                        msg.sender === 'user' 
                          ? 'bg-primary text-on-primary rounded-tr-none' 
                          : 'bg-surface-container-high text-on-surface border border-outline-variant/5 rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      <span className={`block text-[9px] mt-1.5 text-right font-mono ${
                        msg.sender === 'user' ? 'text-on-primary/70' : 'text-outline/70'
                      }`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {msg.sender === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0 self-end shadow-sm mb-0.5">
                        <span className="text-[10px] font-bold font-headline select-none">
                          {user?.name?.substring(0, 2).toUpperCase() || "ME"}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-on-surface text-surface flex items-center justify-center shrink-0 self-start shadow-sm mt-0.5 animate-pulse">
                      <Sparkles size={16} />
                    </div>
                    <div className="bg-surface-container-high rounded-2xl rounded-tl-none p-4 max-w-[80%] border border-outline-variant/5 shadow-sm flex items-center gap-3">
                      <div className="flex gap-1.5 shrink-0">
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                      </div>
                      <span className="text-xs text-outline font-medium">Asisten sedang mengolah jawaban dengan intelijen tinggi...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-4 bg-surface-container-low border-t border-surface-container shrink-0">
                <div className="flex gap-2">
                  <input 
                    value={query}
                    disabled={isLoading}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleThinkingQuery()}
                    placeholder="Tanyakan analisis atau saran pengajaran..."
                    className="flex-1 bg-surface-container-lowest border border-outline-variant/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none disabled:opacity-75"
                  />
                  <button 
                    onClick={handleThinkingQuery}
                    disabled={isLoading || !query.trim()}
                    className="bg-primary text-on-primary px-5 rounded-xl font-bold hover:opacity-90 disabled:opacity-40 transition-all flex items-center gap-1.5"
                  >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                    <span>Kirim</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

