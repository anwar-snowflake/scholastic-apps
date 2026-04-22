/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { Dashboard } from "./components/Dashboard";
import { Attendance } from "./components/Attendance";
import { Reports } from "./components/Reports";
import { StudentProfile } from "./components/StudentProfile";
import { Login } from "./components/Login";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { Brain, Sparkles, X, Loader2, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "./lib/supabase";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const [isThinkingModalOpen, setIsThinkingModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Check login session on mount with Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata.full_name || session.user.email?.split('@')[0],
        });
        setIsAuthenticated(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata.full_name || session.user.email?.split('@')[0],
        });
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLoginSuccess = (session: any) => {
    setUser({
      id: session.user.id,
      email: session.user.email,
      name: session.user.user_metadata.full_name || session.user.email?.split('@')[0],
    });
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleThinkingQuery = async () => {
    if (!query.trim() || !isAuthenticated) return;
    setIsLoading(true);
    setAiResponse("");

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: query,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
          systemInstruction: "Anda adalah asisten akademik cerdas untuk platform 'The Scholastic'. Bantu guru menganalisis data kehadiran, memberikan saran pedagogis, atau menjawab pertanyaan kompleks tentang kurikulum. Jawab dalam Bahasa Indonesia yang profesional namun hangat."
        }
      });
      setAiResponse(response.text || "Maaf, saya tidak bisa memproses permintaan tersebut.");
    } catch (error) {
      console.error("Gemini Error:", error);
      setAiResponse("Terjadi kesalahan saat menghubungi AI. Pastikan API Key sudah terpasang.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    // Jika tidak login, tampilkan versi "data kosong" dari komponen
    const dataMultiplier = isAuthenticated ? 1 : 0;

    switch (activeTab) {
      case "dashboard": return <Dashboard isAuthenticated={isAuthenticated} user={user} />;
      case "attendance": return <Attendance isAuthenticated={isAuthenticated} />;
      case "reports": return <Reports isAuthenticated={isAuthenticated} />;
      case "students": return <StudentProfile isAuthenticated={isAuthenticated} />;
      default: return <Dashboard isAuthenticated={isAuthenticated} user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-surface flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        <div className="sticky top-0 z-40 bg-surface flex flex-col">
          <TopBar user={user} />
          {isAuthenticated && (
            <div className="px-8 py-2 bg-surface-container-low border-b border-outline-variant/10 flex justify-end">
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
        <div className="flex-1 overflow-y-auto relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>

          {/* Overlay Login jika belum login */}
          {!isAuthenticated && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-surface/60 backdrop-blur-[2px]">
              <Login onLoginSuccess={handleLoginSuccess} />
            </div>
          )}
        </div>
      </main>

      {/* AI Thinking Mode Trigger */}
      {isAuthenticated && (
        <button 
          onClick={() => setIsThinkingModalOpen(true)}
          className="fixed bottom-10 left-74 w-14 h-14 bg-on-surface text-surface rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-50 group"
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
              <div className="p-8 border-b border-surface-container flex justify-between items-center bg-on-surface text-surface">
                <div className="flex items-center gap-3">
                  <Sparkles size={24} className="text-secondary-container" />
                  <h3 className="font-headline text-xl font-bold">Mode Berpikir Tinggi</h3>
                </div>
                <button onClick={() => setIsThinkingModalOpen(false)} className="hover:bg-white/10 p-2 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {aiResponse ? (
                  <div className="prose prose-slate max-w-none">
                    <p className="whitespace-pre-wrap text-on-surface leading-relaxed">{aiResponse}</p>
                  </div>
                ) : (
                  <div className="text-center py-12 text-outline">
                    {isLoading ? (
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 size={48} className="animate-spin text-primary" />
                        <p className="font-headline font-bold">Sedang menganalisis dengan kecerdasan tinggi...</p>
                      </div>
                    ) : (
                      <p>Tanyakan apa saja tentang data akademik atau saran pengajaran.</p>
                    )}
                  </div>
                )}
              </div>

              <div className="p-8 bg-surface-container-low">
                <div className="flex gap-3">
                  <input 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleThinkingQuery()}
                    placeholder="Contoh: Bagaimana tren kehadiran Alexander Sterling bulan ini?"
                    className="flex-1 bg-surface-container-lowest border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-primary outline-none"
                  />
                  <button 
                    onClick={handleThinkingQuery}
                    disabled={isLoading}
                    className="bg-primary text-on-primary px-8 rounded-2xl font-bold hover:opacity-90 disabled:opacity-50 transition-all"
                  >
                    Tanya
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

